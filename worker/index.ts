import type { ExecutionContext } from 'hono'
import { createApp } from '../server/app'
import type { Env } from '../server/env'
import { logMail } from '../server/logMail'
import { FEED_PATH, serveFeed, type FeedStore } from './hapisga'
import { durableHolds, type HoldsNamespace } from './holds'

// Wrangler finds the Durable Object class among the entry's exports (see wrangler.toml).
export { DateHoldsObject } from './holds'

/**
 * Cloudflare Worker: the whole site on one origin. `/api/*` and `/hapisga.ics` (see hapisga.ts) are handled
 * here; every other request is a static file from the prerendered build in dist/ (see `run_worker_first` in wrangler.toml), so pages
 * and images never run this code.
 *
 * Unlike the local Node server (server/index.ts) there is no demo fallback: if the Smoobu secrets are
 * missing, the API reports the calendar as unavailable and the booking dialog offers the phone instead.
 * A deployed site must never show invented availability.
 */

// Minimal shape of the static-asset binding, declared here so no extra types package is needed.
interface Fetcher {
  fetch(request: Request): Promise<Response>
}

type Bindings = Env & { ASSETS?: Fetcher; HAPISGA_CACHE?: FeedStore; DATE_HOLDS?: HoldsNamespace }

let api: ReturnType<typeof createApp> | undefined

/** Built once per Worker instance, so the availability cache and rate-limit counters survive requests. */
function boot(env: Bindings) {
  // With all three mail secrets set the app sends through Resend (its default); without them, emails
  // are logged to `wrangler tail` rather than dropped silently.
  const hasMail = Boolean(env.RESEND_API_KEY && env.NOTIFY_TO_EMAIL && env.MAIL_FROM)
  // Holds must be shared by every instance; without the binding each instance keeps its own (memory).
  const holds = env.DATE_HOLDS ? durableHolds(env.DATE_HOLDS) : undefined
  api ??= createApp(env, { holds, ...(hasMail ? {} : { sendMail: logMail }) })
  return api
}

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (pathname.startsWith('/api/')) return boot(env).app.fetch(request, env, ctx)
    if (pathname === FEED_PATH && env.HAPISGA_CACHE) {
      return serveFeed(request, {
        url: env.HAPISGA_ICAL_URL,
        store: env.HAPISGA_CACHE,
        waitUntil: (promise) => ctx.waitUntil(promise),
      })
    }
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 })
  },

  /** The every-minute cron trigger (wrangler.toml): follows up date holds that ran out. */
  async scheduled(_event: unknown, env: Bindings, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(boot(env).followUpExpiredHolds())
  },
}
