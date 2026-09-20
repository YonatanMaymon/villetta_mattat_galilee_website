import { Hono, type Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { isRangeFree, nightsBetween, todayInBookingZone, type IsoDate } from '../shared/dates'
import {
  bookingSchema,
  contactSchema,
  MAX_ADVANCE_DAYS,
  SUPPORTED_CURRENCY,
  stayRules,
  type ApiError,
  type ApiErrorCode,
  type AvailabilityResponse,
  type BookingRequest,
  type BookingResponse,
  type QuoteResponse,
} from '../shared/reservation'
import { CalendarUnavailableError, createAvailability, fetchIcsFrom, icalLoader } from './availability'
import { contactMail, guestBookingMail, ownerBookingMail } from './emails'
import type { Env } from './env'
import { createMailer, type Mailer } from './mail'
import { PmsRejectedError, PmsUnavailableError, type PropertyManagement } from './pms'
import { createRateLimiter } from './rateLimit'
import { createSmoobuClient } from './smoobu'
import { createTurnstileVerifier, skipTurnstile, type TurnstileVerifier } from './turnstile'

export interface AppDeps {
  fetch?: typeof fetch
  today?: () => IsoDate
  now?: () => number
  /** Replaces the Smoobu iCal download (tests). */
  fetchIcs?: () => Promise<string>
  /** Replaces mail delivery (the dev server prints emails instead of sending them). */
  sendMail?: Mailer
  /** Replaces the real Smoobu API (the dev server's demo calendar, and tests). */
  pms?: PropertyManagement
  newRef?: () => string
  /** Replaces the Turnstile check (tests). */
  verifyTurnstile?: TurnstileVerifier
}

type ErrorStatus = 400 | 403 | 409 | 413 | 429 | 500 | 503

const fail = (c: Context, error: ApiErrorCode, status: ErrorStatus) => c.json<ApiError>({ error }, status)

function clientKey(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
  return c.req.header('cf-connecting-ip') ?? forwarded ?? c.req.header('x-real-ip') ?? 'unknown'
}

/** A random, unguessable reference (48 bits), quoted to the guest and written into the Smoobu notes. */
function randomRef(): string {
  return [...crypto.getRandomValues(new Uint8Array(6))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

export interface Services {
  availability: ReturnType<typeof createAvailability>
  /** Present only when the Smoobu API is configured. Without it the calendar is read-only. */
  pms?: PropertyManagement
  sendMail: Mailer
  today: () => IsoDate
  newRef: () => string
}

export function createServices(env: Env, deps: AppDeps = {}): Services {
  const today = deps.today ?? (() => todayInBookingZone())

  const apartmentId = Number(env.SMOOBU_APARTMENT_ID)
  const pms =
    deps.pms ??
    (env.SMOOBU_API_KEY && env.SMOOBU_API_SECRET && Number.isInteger(apartmentId) && apartmentId > 0
      ? createSmoobuClient(
          {
            apiKey: env.SMOOBU_API_KEY,
            apiSecret: env.SMOOBU_API_SECRET,
            apartmentId,
            customerId: env.SMOOBU_CUSTOMER_ID ? Number(env.SMOOBU_CUSTOMER_ID) : undefined,
            baseUrl: env.SMOOBU_BASE_URL,
          },
          { fetch: deps.fetch },
        )
      : undefined)

  // The API knows the most (it sees owner blocks and stay rules); the iCal feed is the read-only fallback.
  const load = pms
    ? (window: { from: IsoDate; until: IsoDate }) => pms.getBusyNights(window)
    : icalLoader(deps.fetchIcs ?? fetchIcsFrom(env.SMOOBU_ICAL_URL, deps.fetch))

  return {
    availability: createAvailability({ load, today, now: deps.now, horizonDays: MAX_ADVANCE_DAYS }),
    pms,
    sendMail: deps.sendMail ?? createMailer(env, deps.fetch),
    today,
    newRef: deps.newRef ?? randomRef,
  }
}

/** Mail must never sink a booking Smoobu already accepted; the failure goes to the log instead. */
async function sendQuietly(send: Mailer, mail: Parameters<Mailer>[0], what: string): Promise<void> {
  try {
    await send(mail)
  } catch (error) {
    console.error(`${what} email failed:`, error instanceof Error ? error.message : 'unknown error')
  }
}

type StayCheck = { ok: true; nights: number } | { ok: false; error: ApiErrorCode }

/** Stay-rule checks that need no network: the dates parse, run forwards, and sit inside the booking horizon. */
function validateStay(arrival: string, departure: string, todayIso: IsoDate): StayCheck {
  const parsed = bookingSchema.pick({ arrival: true, departure: true }).safeParse({ arrival, departure })
  if (!parsed.success) return { ok: false, error: 'invalid_request' }

  const rules = stayRules(todayIso)
  const nights = nightsBetween(arrival, departure)
  if (nights < rules.minNights || nights > rules.maxNights) return { ok: false, error: 'invalid_request' }
  if (arrival > rules.lastArrival) return { ok: false, error: 'invalid_request' }
  // A stay that has already started cannot be booked from the website.
  if (arrival < rules.today) return { ok: false, error: 'dates_unavailable' }
  return { ok: true, nights }
}

export function createApp(env: Env, deps: AppDeps = {}) {
  const services = createServices(env, deps)
  const { availability, pms, sendMail, today, newRef } = services

  // Generous enough for a long contact message, small enough that nobody can post a file here.
  const limitBody = bodyLimit({ maxSize: 32 * 1024, onError: (c) => fail(c, 'invalid_request', 413) })
  // A booking blocks real dates in Smoobu and nothing is charged, so the allowance is deliberately small.
  const allowBooking = createRateLimiter({ limit: 3, windowMs: 60 * 60_000, now: deps.now })
  const allowContact = createRateLimiter({ limit: 5, windowMs: 10 * 60_000, now: deps.now })

  const verifyTurnstile =
    deps.verifyTurnstile ?? (env.TURNSTILE_SECRET ? createTurnstileVerifier(env.TURNSTILE_SECRET, deps.fetch) : skipTurnstile)
  if (!deps.verifyTurnstile && !env.TURNSTILE_SECRET) {
    console.warn('TURNSTILE_SECRET is not set: bookings are accepted without the bot check.')
  }

  const app = new Hono().basePath('/api')

  app.get('/availability', async (c) => {
    try {
      const snapshot = await availability.get()
      return c.json<AvailabilityResponse>({
        busyNights: [...snapshot.nights].sort(),
        updatedAt: snapshot.updatedAt.toISOString(),
        canBook: pms !== undefined,
      })
    } catch (error) {
      if (error instanceof CalendarUnavailableError) return fail(c, 'calendar_unavailable', 503)
      throw error
    }
  })

  app.get('/quote', async (c) => {
    const arrival = c.req.query('arrival') ?? ''
    const departure = c.req.query('departure') ?? ''
    const check = validateStay(arrival, departure, today())
    if (!check.ok) return fail(c, check.error, check.error === 'dates_unavailable' ? 409 : 400)
    if (!pms) return fail(c, 'booking_unavailable', 503)

    try {
      const busy = await availability.get()
      if (!isRangeFree(busy.nights, arrival, departure)) return fail(c, 'dates_unavailable', 409)

      const quote = await pms.quote(arrival, departure)
      if (!quote.available) {
        const ruled = quote.reason === 'stay_rules'
        return fail(c, ruled ? 'invalid_request' : 'dates_unavailable', ruled ? 400 : 409)
      }
      if (quote.currency !== SUPPORTED_CURRENCY || !(quote.amount > 0) || !Number.isFinite(quote.amount)) {
        return fail(c, 'booking_unavailable', 503)
      }
      return c.json<QuoteResponse>({ amount: quote.amount, currency: quote.currency, nights: check.nights })
    } catch (error) {
      if (error instanceof PmsUnavailableError || error instanceof CalendarUnavailableError) {
        return fail(c, 'calendar_unavailable', 503)
      }
      throw error
    }
  })

  /**
   * Creates the reservation in Smoobu so the dates stop showing as free. It is flagged in the Smoobu notes
   * as awaiting the owner's confirmation: nothing is charged here, and no card is collected.
   */
  app.post('/booking', limitBody, async (c) => {
    const parsed = bookingSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) return fail(c, 'invalid_request', 400)
    const request: BookingRequest = parsed.data

    // A bot filled the hidden field: answer as though it worked, but book nothing.
    if (request.website) {
      return c.json<BookingResponse>({ ref: newRef(), nights: 0, amount: 0, currency: SUPPORTED_CURRENCY })
    }
    if (!allowBooking(clientKey(c))) return fail(c, 'rate_limited', 429)
    // Checked before Smoobu is touched, so a script cannot even read prices in bulk through this route.
    if (!(await verifyTurnstile(request.turnstileToken, clientKey(c)))) return fail(c, 'bot_check_failed', 403)

    const check = validateStay(request.arrival, request.departure, today())
    if (!check.ok) return fail(c, check.error, check.error === 'dates_unavailable' ? 409 : 400)
    if (!pms) return fail(c, 'booking_unavailable', 503)

    let amount: number
    try {
      // Checked again, uncached: the guest has been filling in the form for a few minutes by now.
      const busy = await availability.get({ fresh: true })
      if (!isRangeFree(busy.nights, request.arrival, request.departure)) return fail(c, 'dates_unavailable', 409)

      const quote = await pms.quote(request.arrival, request.departure)
      if (!quote.available) {
        const ruled = quote.reason === 'stay_rules'
        return fail(c, ruled ? 'invalid_request' : 'dates_unavailable', ruled ? 400 : 409)
      }
      // The price always comes from Smoobu here, never from the browser.
      amount = quote.amount
    } catch (error) {
      if (error instanceof PmsUnavailableError || error instanceof CalendarUnavailableError) {
        return fail(c, 'calendar_unavailable', 503)
      }
      throw error
    }

    const ref = newRef()
    try {
      await pms.createReservation({ ...request, ref, amount })
    } catch (error) {
      if (error instanceof PmsRejectedError) return fail(c, 'dates_unavailable', 409)
      if (error instanceof PmsUnavailableError) return fail(c, 'booking_unavailable', 503)
      throw error
    }

    // Those nights are taken now, so the next visitor must not be served the cached calendar.
    availability.invalidate()

    const mail = { request, ref, amount }
    await Promise.all([
      sendQuietly(sendMail, ownerBookingMail(mail), 'owner booking'),
      sendQuietly(sendMail, guestBookingMail(mail), 'guest booking'),
    ])

    return c.json<BookingResponse>({ ref, nights: check.nights, amount, currency: SUPPORTED_CURRENCY })
  })

  app.post('/contact', limitBody, async (c) => {
    const parsed = contactSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) return fail(c, 'invalid_request', 400)
    if (parsed.data.website) return c.json({ ok: true })
    if (!allowContact(clientKey(c))) return fail(c, 'rate_limited', 429)

    try {
      await sendMail(contactMail(parsed.data))
    } catch {
      return fail(c, 'send_failed', 500)
    }
    return c.json({ ok: true })
  })

  app.onError((error, c) => {
    console.error('api:', error instanceof Error ? error.stack : error)
    return fail(c, 'send_failed', 500)
  })

  return { app, services }
}
