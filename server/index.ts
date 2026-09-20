import { serve } from '@hono/node-server'
import { todayInBookingZone } from '../shared/dates'
import { createApp, type AppDeps } from './app'
import type { Env } from './env'
import { demoPms } from './fakes'
import { logMail } from './logMail'

/**
 * The API as a plain Node server, so it runs on any host that can run Node. Hono itself is
 * runtime-agnostic: moving to Cloudflare Workers or a serverless platform means replacing this file,
 * not the app.
 */

const env = process.env as Env
const port = Number(process.env.PORT ?? 8787)

const hasSmoobuApi = Boolean(env.SMOOBU_API_KEY && env.SMOOBU_API_SECRET && env.SMOOBU_APARTMENT_ID)
const hasCalendar = hasSmoobuApi || Boolean(env.SMOOBU_ICAL_URL)
const hasMail = Boolean(env.RESEND_API_KEY && env.NOTIFY_TO_EMAIL && env.MAIL_FROM)

const deps: AppDeps = {}

// With no Smoobu credentials at all the dialog still works end to end against an in-memory calendar,
// so the three screens can be built and reviewed before any account exists.
if (!hasCalendar) {
  deps.pms = demoPms(todayInBookingZone())
}

// Without a mail provider, emails are logged rather than dropped silently.
if (!hasMail) {
  deps.sendMail = logMail
}

const { app } = createApp(env, deps)

serve({ fetch: app.fetch, port }, (info) => {
  const calendar = hasSmoobuApi ? 'Smoobu API' : env.SMOOBU_ICAL_URL ? 'Smoobu iCal (read-only)' : 'DEMO calendar'
  console.log(`API on http://localhost:${info.port}`)
  console.log(`  calendar: ${calendar}`)
  console.log(`  bookings: ${hasSmoobuApi ? 'written to Smoobu' : deps.pms ? 'demo only, nothing leaves this process' : 'OFF (needs the Smoobu API)'}`)
  console.log(`  email:    ${hasMail ? 'Resend' : 'printed to this console'}`)
})
