import type { ExecutionContext } from 'hono'
import { createApp } from '../server/app'
import type { Env } from '../server/env'
import { logMail } from '../server/logMail'

/**
 * Cloudflare Worker: the whole site on one origin. `/api/*` is handled here; every other request is a
 * static file from the prerendered build in dist/ (see `run_worker_first` in wrangler.toml), so pages
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

type Bindings = Env & { ASSETS?: Fetcher }

let app: ReturnType<typeof createApp>['app'] | undefined

/** Built once per Worker instance, so the availability cache and rate-limit counters survive requests. */
function boot(env: Bindings) {
  app ??= createApp(env, { sendMail: logMail }).app
  return app
}

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/')) return boot(env).fetch(request, env, ctx)
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 })
  },
}
