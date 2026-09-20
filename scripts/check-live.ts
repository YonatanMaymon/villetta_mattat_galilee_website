// Checks your REAL Smoobu and email credentials before going live:  npm run check:live
//
// Everything here is read-only: no reservation is created and no email is sent, except with
//   --email <address>   send one test email to that address, to prove Resend is set up
//
// Reads .env / .env.local like the dev server, and prints what came back so problems are easy to diagnose.
import { addDays, todayInBookingZone } from '../shared/dates'
import { fetchIcsFrom, parseBusyNights } from '../server/availability'
import { createMailer } from '../server/mail'
import { createSmoobuClient } from '../server/smoobu'
import type { Env } from '../server/env'

for (const file of ['.env', '.env.local']) {
  try {
    process.loadEnvFile(file)
  } catch {
    // Optional.
  }
}

const args = process.argv.slice(2)
const env = process.env as Env
const today = todayInBookingZone()
let failures = 0

const ok = (message: string) => console.log(`  ok    ${message}`)
const info = (message: string) => console.log(`  --    ${message}`)
const bad = (message: string, hint?: string) => {
  failures++
  console.log(`  FAIL  ${message}${hint ? `\n        ${hint}` : ''}`)
}
const describe = (error: unknown) => (error instanceof Error ? `${error.name}: ${error.message}` : String(error))

// --- Step 1: the iCal feed (read-only availability) ---------------------------------------------------
console.log('\nSmoobu iCal (step 1: the calendar shows real free dates)')
if (!env.SMOOBU_ICAL_URL) {
  info('SMOOBU_ICAL_URL is not set. Optional once the API below works.')
} else {
  try {
    const ics = await fetchIcsFrom(env.SMOOBU_ICAL_URL)()
    const busy = parseBusyNights(ics, { from: today, until: addDays(today, 365) })
    ok(`feed downloaded; ${busy.size} unavailable night(s) in the next year`)
    if (busy.size > 0) console.log(`        first few: ${[...busy].sort().slice(0, 5).join(', ')}`)
  } catch (error) {
    bad(`reading the iCal feed failed: ${describe(error)}`, 'Re-copy the link from Smoobu: Settings > Booking Portals > Individual iCal.')
  }
}

// --- Step 2: the API (real prices, and bookings written back) ------------------------------------------
console.log('\nSmoobu API (step 2: live prices and automatic bookings)')
if (!env.SMOOBU_API_KEY || !env.SMOOBU_API_SECRET || !env.SMOOBU_APARTMENT_ID) {
  bad(
    'SMOOBU_API_KEY, SMOOBU_API_SECRET and SMOOBU_APARTMENT_ID are not all set',
    'Smoobu: Settings > Advanced > API Keys. Until all three are set, nothing can be booked online.',
  )
} else {
  const smoobu = createSmoobuClient({
    apiKey: env.SMOOBU_API_KEY,
    apiSecret: env.SMOOBU_API_SECRET,
    apartmentId: Number(env.SMOOBU_APARTMENT_ID),
    customerId: env.SMOOBU_CUSTOMER_ID ? Number(env.SMOOBU_CUSTOMER_ID) : undefined,
    baseUrl: env.SMOOBU_BASE_URL,
  })

  let apiBusy: ReadonlySet<string> | null = null
  try {
    const busy = await smoobu.getBusyNights({ from: today, until: addDays(today, 60) })
    apiBusy = busy
    ok(`signed request accepted; ${busy.size} unavailable night(s) in the next 60 days`)
    if (busy.size > 0) console.log(`        first few: ${[...busy].sort().slice(0, 5).join(', ')}`)
  } catch (error) {
    bad(
      `reading availability failed: ${describe(error)}`,
      '401/403 usually means the key or secret is wrong, the apartment id belongs to another account, or the signature was rejected.',
    )
  }

  // Priced for a single night a month out, purely to prove the price path works. Nothing is reserved.
  try {
    const start = addDays(today, 30)
    const quote = await smoobu.quote(start, addDays(start, 1))
    if (!quote.available && apiBusy && !apiBusy.has(start)) {
      // The night is free, yet Smoobu quoted nothing: there are no nightly rates for this apartment.
      bad(
        `${start} is free in Smoobu, but Smoobu returned no price for it`,
        'No nightly rates are set for this apartment in Smoobu, so the booking dialog cannot quote a price or accept a booking. Set the rates in Smoobu, or decide how the site should price stays.',
      )
    } else if (!quote.available) {
      info(`Smoobu answered, but ${start} is not bookable right now (${quote.reason}). Try a free date.`)
    } else if (quote.currency !== 'ILS') {
      bad(`price came back in ${quote.currency}, not ILS`, 'The booking flow only handles shekels.')
    } else {
      ok(`price for one night on ${start}: ${quote.amount} ${quote.currency}`)
    }
  } catch (error) {
    bad(
      `price quote failed: ${describe(error)}`,
      'If availability worked but this did not, set SMOOBU_CUSTOMER_ID (Smoobu account id).',
    )
  }
}

// --- Step 3: email ------------------------------------------------------------------------------------
console.log('\nEmail (Resend)')
const emailIndex = args.indexOf('--email')
if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.NOTIFY_TO_EMAIL) {
  info('RESEND_API_KEY, MAIL_FROM and NOTIFY_TO_EMAIL are not all set. Bookings still work; emails are only logged.')
} else if (emailIndex < 0) {
  ok('configured. Add "-- --email you@example.com" to actually send a test message.')
} else {
  const to = args[emailIndex + 1]
  if (!to) {
    bad('--email needs an address')
  } else {
    try {
      await createMailer(env)({
        to,
        subject: 'Villetta: test email',
        text: 'If you are reading this, booking notifications will arrive.',
        html: '<p>If you are reading this, booking notifications will arrive.</p>',
      })
      ok(`sent to ${to}. Check the inbox, and the spam folder.`)
    } catch (error) {
      bad(`sending failed: ${describe(error)}`, 'Check the API key and that MAIL_FROM is on a domain verified in Resend.')
    }
  }
}

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} problem(s) found.\n`)
process.exitCode = failures === 0 ? 0 : 1
