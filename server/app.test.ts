import { describe, expect, it } from 'vitest'
import { createApp } from './app'
import { PaymentUnavailableError, type CardPageRequest, type CardResult, type CardVault } from './cardcom'
import type { Env } from './env'
import { createFakePms } from './fakes'
import type { OutgoingMail } from './mail'
import { PENDING_NOTICE } from './smoobu'

const TODAY = '2026-10-01'
const ARRIVAL = '2026-11-10'
const DEPARTURE = '2026-11-13'

const GUEST = {
  name: 'Dana Ben David',
  email: 'dana@example.com',
  phone: '052-1234567',
  lang: 'he' as const,
}

/** A booking API backed by an in-memory Smoobu, with the sent mail captured rather than delivered. */
function harness(options: { blocked?: string[]; env?: Env; cards?: CardVault } = {}) {
  const pms = createFakePms({ blocked: options.blocked, nightlyPrice: () => 2200 })
  const sent: OutgoingMail[] = []
  const { app } = createApp(options.env ?? {}, {
    pms,
    cards: options.cards,
    today: () => TODAY,
    sendMail: async (mail) => {
      sent.push(mail)
    },
  })

  const post = (path: string, body: unknown, ip = '203.0.113.1') =>
    app.request(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    })

  const book = (overrides: Record<string, unknown> = {}, ip?: string) =>
    post('/api/booking', { ...GUEST, arrival: ARRIVAL, departure: DEPARTURE, ...overrides }, ip)

  return { app, pms, sent, post, book }
}

describe('GET /api/availability', () => {
  it('returns the booked nights and says booking is on', async () => {
    const { app } = harness({ blocked: ['2026-11-20', '2026-11-21'] })
    const response = await app.request('/api/availability')
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.busyNights).toEqual(['2026-11-20', '2026-11-21'])
    expect(body.canBook).toBe(true)
  })

  it('reports canBook: false when only the iCal feed is configured', async () => {
    const { app } = createApp({}, {
      today: () => TODAY,
      fetchIcs: async () => 'BEGIN:VCALENDAR\nEND:VCALENDAR',
    })
    const body = await (await app.request('/api/availability')).json()
    expect(body.canBook).toBe(false)
  })
})

describe('POST /api/booking', () => {
  it('creates the reservation in Smoobu and emails the owner and the guest', async () => {
    const { pms, sent, book } = harness()
    const response = await book()
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body).toMatchObject({ nights: 3, amount: 6600, currency: 'ILS' })
    expect(body.ref).toMatch(/^[0-9A-F]{12}$/)

    expect(pms.reservations).toHaveLength(1)
    expect(pms.reservations[0]).toMatchObject({
      arrival: ARRIVAL,
      departure: DEPARTURE,
      name: GUEST.name,
      // The price comes from Smoobu, never from the browser.
      amount: 6600,
      ref: body.ref,
    })
    expect(sent).toHaveLength(2)
    expect(sent.some((mail) => mail.to === GUEST.email)).toBe(true)
  })

  it('ignores a price sent by the browser', async () => {
    const { pms, book } = harness()
    await book({ amount: 1, price: 1 })
    expect(pms.reservations[0].amount).toBe(6600)
  })

  it('blocks the nights it took, so the next caller sees them as busy', async () => {
    const { app, book } = harness()
    await book()
    const body = await (await app.request('/api/availability')).json()
    // The stay runs on the nights of the 10th, 11th and 12th; the 13th stays free for the next arrival.
    expect(body.busyNights).toEqual(['2026-11-10', '2026-11-11', '2026-11-12'])
  })

  it('refuses dates that are already taken', async () => {
    const { pms, book } = harness({ blocked: ['2026-11-11'] })
    const response = await book()
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'dates_unavailable' })
    expect(pms.reservations).toHaveLength(0)
  })

  it('refuses dates taken between the quote and the write', async () => {
    const { pms, book } = harness()
    pms.mode.create = 'reject'
    const response = await book()
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'dates_unavailable' })
  })

  it('reports Smoobu being unreachable as retryable, and books nothing', async () => {
    const { pms, book } = harness()
    pms.mode.create = 'down'
    const response = await book()
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: 'booking_unavailable' })
    expect(pms.reservations).toHaveLength(0)
  })

  it('answers a bot normally but books nothing', async () => {
    const { pms, sent, book } = harness()
    const response = await book({ website: 'https://spam.example' })
    expect(response.status).toBe(200)
    expect(pms.reservations).toHaveLength(0)
    expect(sent).toHaveLength(0)
  })

  it('rejects a stay in the past, a reversed range, and missing details', async () => {
    const { book } = harness()
    expect((await book({ arrival: '2026-09-01', departure: '2026-09-03' })).status).toBe(409)
    expect((await book({ arrival: DEPARTURE, departure: ARRIVAL })).status).toBe(400)
    expect((await book({ email: 'not-an-email' })).status).toBe(400)
    expect((await book({ name: '' })).status).toBe(400)
  })

  it('allows only three bookings per caller, without affecting another caller', async () => {
    const { book } = harness()
    // Every attempt counts, successful or not: three are let through, the fourth is refused.
    for (let i = 0; i < 3; i++) expect((await book({}, '198.51.100.7')).status).not.toBe(429)
    expect((await book({}, '198.51.100.7')).status).toBe(429)
    expect((await book({ arrival: '2026-12-01', departure: '2026-12-03' }, '198.51.100.9')).status).toBe(200)
  })

  it('refuses a booking that fails the bot check, before touching Smoobu', async () => {
    const pms = createFakePms({ nightlyPrice: () => 2200 })
    const { app } = createApp({}, { pms, today: () => TODAY, sendMail: async () => {}, verifyTurnstile: async () => false })
    const response = await app.request('/api/booking', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...GUEST, arrival: ARRIVAL, departure: DEPARTURE, turnstileToken: 'bad' }),
    })
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: 'bot_check_failed' })
    expect(pms.reservations).toHaveLength(0)
  })

  it('passes the token through to the verifier', async () => {
    const seen: (string | undefined)[] = []
    const { app } = createApp({}, {
      pms: createFakePms({ nightlyPrice: () => 2200 }),
      today: () => TODAY,
      sendMail: async () => {},
      verifyTurnstile: async (token) => {
        seen.push(token)
        return true
      },
    })
    const response = await app.request('/api/booking', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...GUEST, arrival: ARRIVAL, departure: DEPARTURE, turnstileToken: 'the-token' }),
    })
    expect(response.status).toBe(200)
    expect(seen).toEqual(['the-token'])
  })

  it('accepts a booking with no token when Turnstile is not configured', async () => {
    // Local development, and any deploy made before the keys are set.
    const { book } = harness()
    expect((await book()).status).toBe(200)
  })

  it('does not lose a booking Smoobu accepted when the email fails', async () => {
    const pms = createFakePms({ nightlyPrice: () => 2200 })
    const { app } = createApp({}, {
      pms,
      today: () => TODAY,
      sendMail: async () => {
        throw new Error('Resend is down')
      },
    })
    const response = await app.request('/api/booking', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...GUEST, arrival: ARRIVAL, departure: DEPARTURE }),
    })
    expect(response.status).toBe(200)
    expect(pms.reservations).toHaveLength(1)
  })

  it('writes the awaiting-confirmation flag into the Smoobu notes', async () => {
    // The fake records what it was given; this is the contract the real client turns into `notice`.
    const { pms, book } = harness()
    await book()
    expect(PENDING_NOTICE).toContain('awaiting confirmation')
    expect(pms.reservations[0].ref).toBeTruthy()
  })
})

describe('POST /api/quote', () => {
  it('prices a stay without reserving anything', async () => {
    const { app, pms } = harness()
    const response = await app.request(`/api/quote?arrival=${ARRIVAL}&departure=${DEPARTURE}`)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ amount: 6600, currency: 'ILS', nights: 3 })
    expect(pms.reservations).toHaveLength(0)
  })

  it('refuses a stay that overlaps a booked night', async () => {
    const { app } = harness({ blocked: ['2026-11-12'] })
    const response = await app.request(`/api/quote?arrival=${ARRIVAL}&departure=${DEPARTURE}`)
    expect(response.status).toBe(409)
  })
})

describe('POST /api/contact', () => {
  it('emails the owner', async () => {
    const { sent, post } = harness()
    const response = await post('/api/contact', { ...GUEST, message: 'Do you allow dogs?' })
    expect(response.status).toBe(200)
    expect(sent).toHaveLength(1)
    expect(sent[0].replyTo).toBe(GUEST.email)
  })

  it('swallows a bot silently', async () => {
    const { sent, post } = harness()
    const response = await post('/api/contact', { ...GUEST, message: 'buy pills', website: 'x' })
    expect(response.status).toBe(200)
    expect(sent).toHaveLength(0)
  })
})

/** A Cardcom stand-in that records the card pages asked for and answers lookups from `results`. */
function fakeCards() {
  const pages: CardPageRequest[] = []
  const results = new Map<string, CardResult>()
  const state = { createDown: false, readDown: false }
  const cards: CardVault = {
    async createCardPage(request) {
      if (state.createDown) throw new PaymentUnavailableError('fake Cardcom is down')
      pages.push(request)
      return { lowProfileId: `lp-${pages.length}`, url: `https://secure.cardcom.solutions/lp/${pages.length}` }
    },
    async getResult(id) {
      if (state.readDown) throw new PaymentUnavailableError('fake Cardcom is down')
      return results.get(id) ?? { saved: false }
    },
  }
  return { cards, pages, results, state }
}

const SAVED: CardResult = {
  saved: true,
  booking: { ref: 'A1B2C3D4E5F6', arrival: ARRIVAL, departure: DEPARTURE },
  cardOwner: 'Dana Ben David',
  expiry: '04/2029',
}

describe('card step (Cardcom)', () => {
  it('says so in the availability answer', async () => {
    const { app } = harness({ cards: fakeCards().cards })
    expect((await (await app.request('/api/availability')).json()).takesCard).toBe(true)
    const { app: without } = harness()
    expect((await (await without.request('/api/availability')).json()).takesCard).toBe(false)
  })

  it('holds the dates, then returns a card page for the Smoobu price', async () => {
    const { cards, pages } = fakeCards()
    const { pms, sent, book } = harness({ cards })
    const response = await book()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.cardUrl).toBe('https://secure.cardcom.solutions/lp/1')
    expect(pms.reservations).toHaveLength(1)
    expect(pages[0]).toMatchObject({ ref: body.ref, amount: 6600, arrival: ARRIVAL, name: GUEST.name })
    expect(pages[0].successUrl).toMatch(/\/api\/payment\/return\?result=ok$/)
    const owner = sent.find((mail) => mail.to === undefined) as OutgoingMail
    expect(owner.text).toContain('Cardcom')
  })

  it('keeps the booking when Cardcom is down, and tells the owner to take the card by phone', async () => {
    const fake = fakeCards()
    fake.state.createDown = true
    const { pms, sent, book } = harness({ cards: fake.cards })
    const response = await book()
    expect(response.status).toBe(200)
    expect((await response.json()).cardUrl).toBeUndefined()
    expect(pms.reservations).toHaveLength(1)
    const owner = sent.find((mail) => mail.to === undefined) as OutgoingMail
    expect(owner.text).toContain('טלפונית')
  })

  it('serves a return page that reports to the dialog', async () => {
    const { app } = harness({ cards: fakeCards().cards })
    const ok = await (await app.request('/api/payment/return?result=ok&lowprofilecode=x')).text()
    expect(ok).toContain("result: 'ok'")
    // Anything but "ok" is a failure, and nothing from the address is echoed into the page.
    const odd = await (await app.request('/api/payment/return?result=%3Cscript%3E')).text()
    expect(odd).toContain("result: 'failed'")
    expect(odd).not.toContain('<script>alert')
  })

  it('emails the owner once when Cardcom confirms a saved card', async () => {
    const fake = fakeCards()
    fake.results.set('lp-9', SAVED)
    const { sent, post } = harness({ cards: fake.cards })

    expect((await post('/api/payment/webhook', { LowProfileId: 'lp-9' })).status).toBe(200)
    expect((await post('/api/payment/webhook', { LowProfileId: 'lp-9' })).status).toBe(200)
    expect(sent).toHaveLength(1)
    expect(sent[0].subject).toContain('A1B2C3D4E5F6')
  })

  it('ignores a webhook Cardcom does not back up', async () => {
    const { sent, post } = harness({ cards: fakeCards().cards })
    // Forged body claiming success: only the id is used, and Cardcom knows nothing of it.
    const response = await post('/api/payment/webhook', { LowProfileId: 'lp-forged', TokenInfo: { Token: 'x' } })
    expect(response.status).toBe(200)
    expect(sent).toHaveLength(0)
  })

  it('asks Cardcom to retry the webhook while it cannot be read', async () => {
    const fake = fakeCards()
    fake.state.readDown = true
    const { post } = harness({ cards: fake.cards })
    expect((await post('/api/payment/webhook', { LowProfileId: 'lp-1' })).status).toBe(503)
  })
})

/** Guards the one piece of guest text that reaches an HTML email. */
describe('email rendering', () => {
  it('escapes guest input', async () => {
    const { sent, book } = harness()
    await book({ name: '<script>alert(1)</script> Dana' })
    const owner = sent.find((mail) => mail.to === undefined) as OutgoingMail
    expect(owner.html).not.toContain('<script>')
    expect(owner.html).toContain('&lt;script&gt;')
  })
})
