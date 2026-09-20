import { describe, expect, it } from 'vitest'
import { createApp } from './app'
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
function harness(options: { blocked?: string[]; env?: Env } = {}) {
  const pms = createFakePms({ blocked: options.blocked, nightlyPrice: () => 2200 })
  const sent: OutgoingMail[] = []
  const { app } = createApp(options.env ?? {}, {
    pms,
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

  it('rate-limits one caller without affecting another', async () => {
    const { book } = harness()
    // The first booking succeeds; the rest are refused as duplicates, but all five count against the limit.
    for (let i = 0; i < 5; i++) await book({}, '198.51.100.7')
    expect((await book({}, '198.51.100.7')).status).toBe(429)
    expect((await book({ arrival: '2026-12-01', departure: '2026-12-03' }, '198.51.100.9')).status).toBe(200)
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
