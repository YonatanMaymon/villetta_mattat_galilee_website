import { Hono, type Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { isRangeFree, nightsBetween, todayInBookingZone, type IsoDate } from '../shared/dates'
import {
  bookingSchema,
  cardBookingSchema,
  cardIdSchema,
  contactSchema,
  MAX_ADVANCE_DAYS,
  SUPPORTED_CURRENCY,
  stayRules,
  type ApiError,
  type ApiErrorCode,
  type AvailabilityResponse,
  type BookingRequest,
  type BookingResponse,
  type CardBookingResponse,
  type QuoteResponse,
} from '../shared/reservation'
import { CalendarUnavailableError, createAvailability, fetchIcsFrom, icalLoader } from './availability'
import { createCardcomClient, PaymentUnavailableError, type CardVault } from './cardcom'
import {
  cardWithoutBookingMail,
  guestDatesTakenMail,
  contactMail,
  guestConfirmedMail,
  guestUnfinishedMail,
  ownerBookingMail,
  unfinishedBookingMail,
  type BookingMailInput,
} from './emails'
import type { Env } from './env'
import { createMemoryHolds, type DateHolds, type Hold } from './holds'
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
  /** Replaces the real Cardcom (tests). */
  cards?: CardVault
  /** Where date holds are kept. Default: this process's memory; the Worker passes its Durable Object. */
  holds?: DateHolds
}

type ErrorStatus = 400 | 403 | 409 | 413 | 429 | 500 | 503

const fail = (c: Context, error: ApiErrorCode, status: ErrorStatus) => c.json<ApiError>({ error }, status)

function clientKey(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
  return c.req.header('cf-connecting-ip') ?? forwarded ?? c.req.header('x-real-ip') ?? 'unknown'
}

/**
 * Where Cardcom sends the guest back to: the site the request came from. In development that is the Vite
 * server, whose proxy rewrites Host, so the browser's Origin is used when it names this host or localhost.
 */
function siteOrigin(c: Context): string {
  const own = new URL(c.req.url)
  const claimed = URL.parse(c.req.header('origin') ?? '')
  const trusted =
    claimed && /^https?:$/.test(claimed.protocol) && (claimed.host === own.host || claimed.hostname === 'localhost')
  return trusted ? claimed.origin : own.origin
}

/**
 * The page Cardcom's iframe lands on after the card form. It only tells the booking dialog (same origin)
 * how it went; what counts is Cardcom's own record, read by the webhook.
 */
function cardReturnPage(result: 'ok' | 'failed'): string {
  return `<!doctype html><meta charset="utf-8"><title>Villetta</title><script>parent.postMessage({ source: 'cardcom', result: '${result}' }, location.origin)</script>`
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
  /** Present only when Cardcom is configured. Without it a booking ends without the card step. */
  cards?: CardVault
  holds: DateHolds
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

  const terminalNumber = Number(env.CARDCOM_TERMINAL_NUMBER)
  const cards =
    deps.cards ??
    (env.CARDCOM_API_NAME && Number.isInteger(terminalNumber) && terminalNumber > 0
      ? createCardcomClient(
          { terminalNumber, apiName: env.CARDCOM_API_NAME, baseUrl: env.CARDCOM_BASE_URL },
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
    cards,
    holds: deps.holds ?? createMemoryHolds(deps.now),
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

/** Smoobu, the calendar or Cardcom is down for now: worth retrying later, unlike a refusal. */
const isOutage = (error: unknown) =>
  error instanceof PmsUnavailableError ||
  error instanceof CalendarUnavailableError ||
  error instanceof PaymentUnavailableError

type StayCheck = { ok: true; nights: number } | { ok: false; error: ApiErrorCode }
type StayPrice = { ok: true; amount: number } | { ok: false; error: ApiErrorCode }

/** What became of a card page: a reservation, no saved card (yet), or a card whose dates were taken meanwhile. */
type CardOutcome = { status: 'booked'; ref: string } | { status: 'no_card' } | { status: 'dates_taken' }

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
  const { availability, pms, cards, holds, sendMail, today, newRef } = services

  // Generous enough for a long contact message, small enough that nobody can post a file here.
  const limitBody = bodyLimit({ maxSize: 32 * 1024, onError: (c) => fail(c, 'invalid_request', 413) })
  // A booking blocks real dates in Smoobu and nothing is charged, so the allowance is deliberately small.
  const allowBooking = createRateLimiter({ limit: 3, windowMs: 60 * 60_000, now: deps.now })
  const allowContact = createRateLimiter({ limit: 5, windowMs: 10 * 60_000, now: deps.now })
  // Each check asks Cardcom, so nobody gets to probe card page ids through this site in bulk.
  const allowCardCheck = createRateLimiter({ limit: 10, windowMs: 10 * 60_000, now: deps.now })

  const verifyTurnstile =
    deps.verifyTurnstile ?? (env.TURNSTILE_SECRET ? createTurnstileVerifier(env.TURNSTILE_SECRET, deps.fetch) : skipTurnstile)
  if (!deps.verifyTurnstile && !env.TURNSTILE_SECRET) {
    console.warn('TURNSTILE_SECRET is not set: bookings are accepted without the bot check.')
  }

  // A hold is a courtesy (Smoobu is checked again before anything is booked), so trouble with the hold
  // store never stops a booking: it is logged, and the stay goes ahead unheld.
  const holdTrouble = (error: unknown) =>
    console.error('date holds:', error instanceof Error ? error.message : 'unknown error')

  async function heldNights(exceptRef?: string): Promise<Set<IsoDate>> {
    try {
      return await holds.nights(exceptRef)
    } catch (error) {
      holdTrouble(error)
      return new Set()
    }
  }

  async function releaseHold(ref: string): Promise<void> {
    await holds.release(ref).catch(holdTrouble)
  }

  /** Smoobu's busy nights plus the website's holds, except `ownRef`'s: a guest's own hold never blocks them. */
  async function busyNights(options: { fresh?: boolean; ownRef?: string } = {}): Promise<Set<IsoDate>> {
    const [snapshot, held] = await Promise.all([availability.get({ fresh: options.fresh }), heldNights(options.ownRef)])
    return new Set([...snapshot.nights, ...held])
  }

  /**
   * Checks the stay against Smoobu, uncached, and against other guests' holds, and returns Smoobu's price
   * for it. The price always comes from here, never from the browser.
   */
  async function priceStay(
    smoobu: PropertyManagement,
    arrival: IsoDate,
    departure: IsoDate,
    ownRef?: string,
  ): Promise<StayPrice> {
    const busy = await busyNights({ fresh: true, ownRef })
    if (!isRangeFree(busy, arrival, departure)) return { ok: false, error: 'dates_unavailable' }
    const quote = await smoobu.quote(arrival, departure)
    if (!quote.available) {
      return { ok: false, error: quote.reason === 'stay_rules' ? 'invalid_request' : 'dates_unavailable' }
    }
    return { ok: true, amount: quote.amount }
  }

  /** The reservation is in Smoobu: the owner hears of it, and the guest is told it is confirmed. */
  async function sendConfirmedMails(mail: BookingMailInput) {
    await Promise.all([
      sendQuietly(sendMail, ownerBookingMail(mail), 'owner booking'),
      sendQuietly(sendMail, guestConfirmedMail(mail), 'guest confirmed'),
    ])
  }

  /**
   * Makes the Smoobu reservation for a card page, once Cardcom's own record shows the card saved. Everything
   * it books comes from that record: the dates and reference we stored in `ReturnValue`, and the guest's
   * details from Cardcom's form (prefilled from the dialog).
   */
  async function reserveForCard(lowProfileId: string): Promise<CardOutcome> {
    if (!cards || !pms) return { status: 'no_card' }
    const result = await cards.getResult(lowProfileId)
    if (!result.saved) return { status: 'no_card' }
    const { booking, holder } = result
    const alreadyBooked = async () => (await pms.findByReference(booking.ref, booking.arrival)) !== null
    const booked = async (): Promise<CardOutcome> => {
      // Smoobu blocks the nights now, so the hold has done its job.
      await releaseHold(booking.ref)
      return { status: 'booked', ref: booking.ref }
    }
    const datesTaken = async (): Promise<CardOutcome> => {
      await releaseHold(booking.ref)
      // The guest may have closed the dialog already, so they hear of it by email too.
      await Promise.all([
        sendQuietly(sendMail, cardWithoutBookingMail(result), 'card without booking'),
        holder.email && sendQuietly(sendMail, guestDatesTakenMail(result, holder.email), 'guest dates taken'),
      ])
      return { status: 'dates_taken' }
    }

    if (await alreadyBooked()) return booked()
    const price = await priceStay(pms, booking.arrival, booking.departure, booking.ref)
    if (!price.ok) return datesTaken()

    const request = { ...holder, arrival: booking.arrival, departure: booking.departure, lang: booking.lang }
    try {
      await pms.createReservation({ ...request, ref: booking.ref, amount: price.amount })
    } catch (error) {
      if (!(error instanceof PmsRejectedError)) throw error
      // Smoobu refuses a second reservation on the same nights, which may be ours, made a moment ago by
      // the other report of this card.
      return (await alreadyBooked()) ? booked() : datesTaken()
    }
    availability.invalidate()
    await sendConfirmedMails({ request, ref: booking.ref, amount: price.amount, card: result })
    return booked()
  }

  // The dialog and Cardcom's webhook both report the same card, often at the same moment, and Cardcom may
  // repeat its webhook. Within one instance they share one attempt; across instances, Smoobu refusing a
  // second reservation on the same nights catches it (see above).
  const cardAttempts = new Map<string, Promise<CardOutcome>>()

  function bookWithCard(lowProfileId: string): Promise<CardOutcome> {
    const running = cardAttempts.get(lowProfileId)
    if (running) return running
    const attempt = reserveForCard(lowProfileId)
    cardAttempts.set(lowProfileId, attempt)
    // An outage, or a card not saved yet, must be looked at again next time rather than remembered.
    const forget = () => cardAttempts.delete(lowProfileId)
    attempt.then((outcome) => outcome.status === 'no_card' && forget(), forget)
    return attempt
  }

  const app = new Hono().basePath('/api')

  app.get('/availability', async (c) => {
    try {
      const [snapshot, held] = await Promise.all([availability.get(), heldNights()])
      return c.json<AvailabilityResponse>({
        busyNights: [...new Set([...snapshot.nights, ...held])].sort(),
        updatedAt: snapshot.updatedAt.toISOString(),
        canBook: pms !== undefined,
        takesCard: pms !== undefined && cards !== undefined,
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
      if (!isRangeFree(await busyNights(), arrival, departure)) return fail(c, 'dates_unavailable', 409)

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
   * With Cardcom set up, opens the card page and books nothing yet: the guest is emailed that the booking is
   * saved, and the reservation is made once the card is saved (`bookWithCard`). Without Cardcom, creates the
   * reservation in Smoobu right away. Nothing is charged either way.
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

    // This dialog's earlier attempt (a card that was not saved): its hold must not block the retry.
    if (request.heldRef) await releaseHold(request.heldRef)

    let amount: number
    try {
      // Checked again, uncached: the guest has been filling in the form for a few minutes by now.
      const price = await priceStay(pms, request.arrival, request.departure)
      if (!price.ok) return fail(c, price.error, price.error === 'invalid_request' ? 400 : 409)
      amount = price.amount
    } catch (error) {
      if (error instanceof PmsUnavailableError || error instanceof CalendarUnavailableError) {
        return fail(c, 'calendar_unavailable', 503)
      }
      throw error
    }

    const ref = newRef()
    const answer = { ref, nights: check.nights, amount, currency: SUPPORTED_CURRENCY }

    if (cards) {
      const site = siteOrigin(c)
      let page: { lowProfileId: string; url: string } | undefined
      try {
        page = await cards.createCardPage({
          ...request,
          ref,
          amount,
          successUrl: `${site}/api/payment/return?result=ok`,
          failedUrl: `${site}/api/payment/return?result=failed`,
          webhookUrl: `${new URL(c.req.url).origin}/api/payment/webhook`,
        })
      } catch (error) {
        if (!(error instanceof PaymentUnavailableError)) throw error
        // Rather than turn the guest away while Cardcom is down, book now; the owner takes the card by phone.
        console.error('card page:', error.message)
      }

      if (page) {
        // Nothing is in Smoobu while the guest types their card, so the website holds the nights meanwhile.
        const { name, phone, email, lang } = request
        const held = await holds
          .hold({
            ref,
            arrival: request.arrival,
            departure: request.departure,
            cardId: page.lowProfileId,
            guest: { name, phone, email, lang, amount },
          })
          .catch((error) => {
            holdTrouble(error)
            return true
          })
        // Another guest took a hold on some of these nights a moment ago.
        if (!held) return fail(c, 'dates_unavailable', 409)

        // No email yet: the guest hears once, when the stay is booked or the hold runs out without a card.
        return c.json<BookingResponse>({ ...answer, card: { id: page.lowProfileId, url: page.url } })
      }
    }

    try {
      await pms.createReservation({ ...request, ref, amount })
    } catch (error) {
      if (error instanceof PmsRejectedError) return fail(c, 'dates_unavailable', 409)
      if (error instanceof PmsUnavailableError) return fail(c, 'booking_unavailable', 503)
      throw error
    }

    // Those nights are taken now, so the next visitor must not be served the cached calendar.
    availability.invalidate()
    await sendConfirmedMails({ request, ref, amount, card: cards ? 'unavailable' : undefined })

    return c.json<BookingResponse>(answer)
  })

  /**
   * The dialog reports that Cardcom's page finished, and waits for the reservation. Like the webhook, this
   * trusts only Cardcom's own record of the card page.
   */
  app.post('/booking/card', limitBody, async (c) => {
    const parsed = cardBookingSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) return fail(c, 'invalid_request', 400)
    if (!allowCardCheck(clientKey(c))) return fail(c, 'rate_limited', 429)

    try {
      const outcome = await bookWithCard(parsed.data.lowProfileId)
      if (outcome.status === 'booked') return c.json<CardBookingResponse>({ ref: outcome.ref })
      return fail(c, outcome.status === 'no_card' ? 'card_not_saved' : 'dates_unavailable', 409)
    } catch (error) {
      if (isOutage(error)) return fail(c, 'booking_unavailable', 503)
      throw error
    }
  })

  app.get('/payment/return', (c) => c.html(cardReturnPage(c.req.query('result') === 'ok' ? 'ok' : 'failed')))

  /**
   * Cardcom reports a finished card page here, which books the stay even if the guest closed the dialog. The
   * body is not trusted (anyone can post to this address): only its LowProfileId is used, to read the
   * outcome back from Cardcom itself.
   */
  app.post('/payment/webhook', limitBody, async (c) => {
    const type = c.req.header('content-type') ?? ''
    const body: Record<string, unknown> = type.includes('json')
      ? ((await c.req.json().catch(() => null)) ?? {})
      : await c.req.parseBody().catch(() => ({}))
    const id = cardIdSchema.safeParse(body.LowProfileId ?? body.lowprofilecode)
    if (!id.success) return c.text('ok')

    try {
      await bookWithCard(id.data)
    } catch (error) {
      // Cardcom retries a webhook that fails, so an outage here only delays the booking.
      if (isOutage(error)) return c.text('retry', 503)
      throw error
    }
    return c.text('ok')
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

  /**
   * Runs every minute (a Cloudflare cron trigger, or a timer in the Node server). For each hold that ran
   * out, asks Cardcom whether the card was saved after all: if so the stay is booked now (the guest's
   * window may have closed before anyone heard), and if not the owner is told the guest did not finish.
   */
  async function followUpExpiredHolds(): Promise<void> {
    let expired: Hold[]
    try {
      expired = await holds.takeExpired()
    } catch (error) {
      return holdTrouble(error)
    }
    for (const hold of expired) {
      try {
        const outcome = await bookWithCard(hold.cardId)
        if (outcome.status === 'no_card') {
          await Promise.all([
            sendQuietly(sendMail, unfinishedBookingMail(hold), 'unfinished booking'),
            hold.guest.email && sendQuietly(sendMail, guestUnfinishedMail(hold), 'guest unfinished'),
          ])
        }
      } catch (error) {
        // Cardcom or Smoobu is down: the card cannot be checked, so no email rather than a wrong one. If a
        // card was saved, Cardcom's webhook retries and books it.
        console.error('expired hold:', error instanceof Error ? error.message : 'unknown error')
      }
    }
  }

  return { app, services, followUpExpiredHolds }
}
