import { describe, expect, it } from 'vitest'
import { createApp } from './app'
import { PaymentUnavailableError, type CardPageRequest, type CardResult, type CardVault } from './cardcom'
import type { Env } from './env'
import { createFakePms, type FakePms } from './fakes'
import type { OutgoingMail } from './mail'

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
function harness(
  options: { blocked?: string[]; env?: Env; cards?: CardVault; pms?: FakePms; now?: () => number } = {},
) {
  const pms = options.pms ?? createFakePms({ blocked: options.blocked, nightlyPrice: () => 2200 })
  const sent: OutgoingMail[] = []
  const { app, followUpExpiredHolds } = createApp(options.env ?? {}, {
    pms,
    cards: options.cards,
    now: options.now,
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

  return { app, pms, sent, post, book, followUpExpiredHolds }
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
  /** The guest finishes card page `lp-n`: Cardcom now reports the card saved, with the prefilled details. */
  const save = (n = 1) => {
    const page = pages[n - 1]
    results.set(`lp-${n}`, {
      saved: true,
      booking: { ref: page.ref, arrival: page.arrival, departure: page.departure, lang: page.lang },
      holder: { name: page.name, email: page.email, phone: page.phone },
      expiry: '04/2029',
    })
  }
  return { cards, pages, results, state, save }
}

const ownerMails = (sent: OutgoingMail[]) => sent.filter((mail) => mail.to === undefined)

describe('card step (Cardcom)', () => {
  it('says so in the availability answer', async () => {
    const { app } = harness({ cards: fakeCards().cards })
    expect((await (await app.request('/api/availability')).json()).takesCard).toBe(true)
    const { app: without } = harness()
    expect((await (await without.request('/api/availability')).json()).takesCard).toBe(false)
  })

  it('opens a card page for the Smoobu price, and books and emails nothing yet', async () => {
    const { cards, pages } = fakeCards()
    const { pms, sent, book } = harness({ cards })
    const response = await book()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.card).toEqual({ id: 'lp-1', url: 'https://secure.cardcom.solutions/lp/1' })
    expect(pms.reservations).toHaveLength(0)
    expect(pages[0]).toMatchObject({ ref: body.ref, amount: 6600, arrival: ARRIVAL, name: GUEST.name, lang: 'he' })
    expect(pages[0].successUrl).toMatch(/\/api\/payment\/return\?result=ok$/)
    // Everyone hears once it is settled: booked, or the hold runs out without a card.
    expect(sent).toHaveLength(0)
  })

  it('books the stay once the card is saved, and only then emails the owner and confirms to the guest', async () => {
    const fake = fakeCards()
    const { pms, sent, book, post } = harness({ cards: fake.cards })
    const { ref } = await (await book()).json()
    fake.save()

    const response = await post('/api/booking/card', { lowProfileId: 'lp-1' })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ref })
    expect(pms.reservations).toHaveLength(1)
    expect(pms.reservations[0]).toMatchObject({ ref, arrival: ARRIVAL, departure: DEPARTURE, name: GUEST.name, amount: 6600 })

    const owner = ownerMails(sent)
    expect(owner).toHaveLength(1)
    expect(owner[0].text).toContain('04/2029')
    const confirmed = sent.filter((mail) => mail.to === GUEST.email)
    expect(confirmed.map((mail) => mail.subject)).toEqual([expect.stringContaining('אושרה')])
  })

  it('books nothing while Cardcom has no saved card', async () => {
    const { pms, sent, book, post } = harness({ cards: fakeCards().cards })
    await book()
    const response = await post('/api/booking/card', { lowProfileId: 'lp-1' })
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'card_not_saved' })
    expect(pms.reservations).toHaveLength(0)
    expect(ownerMails(sent)).toHaveLength(0)
  })

  it('books from the webhook when the dialog is gone, once however often the card is reported', async () => {
    const fake = fakeCards()
    const { pms, sent, book, post } = harness({ cards: fake.cards })
    await book()
    fake.save()

    expect((await post('/api/payment/webhook', { LowProfileId: 'lp-1' })).status).toBe(200)
    expect((await post('/api/payment/webhook', { LowProfileId: 'lp-1' })).status).toBe(200)
    expect((await post('/api/booking/card', { lowProfileId: 'lp-1' })).status).toBe(200)
    expect(pms.reservations).toHaveLength(1)
    expect(ownerMails(sent)).toHaveLength(1)
  })

  it('books once when the dialog and the webhook reach different instances', async () => {
    const fake = fakeCards()
    const pms = createFakePms({ nightlyPrice: () => 2200 })
    const first = harness({ cards: fake.cards, pms })
    const second = harness({ cards: fake.cards, pms })
    await first.book()
    fake.save()

    const [a, b] = await Promise.all([
      first.post('/api/booking/card', { lowProfileId: 'lp-1' }),
      second.post('/api/payment/webhook', { LowProfileId: 'lp-1' }),
    ])
    expect([a.status, b.status]).toEqual([200, 200])
    expect(pms.reservations).toHaveLength(1)
  })

  it('tells the guest and the owner when the dates were taken while the card was typed', async () => {
    const fake = fakeCards()
    const { pms, sent, book, post } = harness({ cards: fake.cards })
    await book()
    pms.blocked.add('2026-11-11')
    fake.save()

    const response = await post('/api/booking/card', { lowProfileId: 'lp-1' })
    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'dates_unavailable' })
    expect(pms.reservations).toHaveLength(0)
    const owner = ownerMails(sent)
    expect(owner).toHaveLength(1)
    expect(owner[0].subject).toContain('נתפסו')
    // Plain Hebrew for the owner: what happened, what to do, and no system names.
    expect(owner[0].text).toContain('התקשרו לאורח')
    expect(owner[0].text).not.toMatch(/Cardcom|Smoobu/)
    // The guest may have closed the dialog, so they are told by email to get in touch.
    const problem = sent.find((mail) => mail.to === GUEST.email && mail.subject.includes('בעיה'))
    expect(problem?.text).toContain('צרו איתנו קשר')
  })

  it('tries again after Smoobu was down, rather than remembering the failure', async () => {
    const fake = fakeCards()
    const { pms, book, post } = harness({ cards: fake.cards })
    await book()
    fake.save()
    pms.mode.create = 'down'
    expect((await post('/api/booking/card', { lowProfileId: 'lp-1' })).status).toBe(503)
    pms.mode.create = 'ok'
    expect((await post('/api/booking/card', { lowProfileId: 'lp-1' })).status).toBe(200)
    expect(pms.reservations).toHaveLength(1)
  })

  it('books right away when Cardcom is down, and tells the owner to take the card by phone', async () => {
    const fake = fakeCards()
    fake.state.createDown = true
    const { pms, sent, book } = harness({ cards: fake.cards })
    const response = await book()
    expect(response.status).toBe(200)
    expect((await response.json()).card).toBeUndefined()
    expect(pms.reservations).toHaveLength(1)
    expect(ownerMails(sent)[0].text).toContain('טלפונית')
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

  it('ignores a webhook Cardcom does not back up', async () => {
    const { pms, sent, post } = harness({ cards: fakeCards().cards })
    // Forged body claiming success: only the id is used, and Cardcom knows nothing of it.
    const response = await post('/api/payment/webhook', { LowProfileId: 'lp-forged', TokenInfo: { Token: 'x' } })
    expect(response.status).toBe(200)
    expect(pms.reservations).toHaveLength(0)
    expect(sent).toHaveLength(0)
  })

  it('asks Cardcom to retry the webhook while it cannot be read', async () => {
    const fake = fakeCards()
    fake.state.readDown = true
    const { post } = harness({ cards: fake.cards })
    expect((await post('/api/payment/webhook', { LowProfileId: 'lp-1' })).status).toBe(503)
  })
})

describe('date holds while the card is typed', () => {
  const OTHER = { name: 'Noa Levi', email: 'noa@example.com', phone: '054-7654321' }

  it('shows the held nights as busy, and refuses them to the next guest', async () => {
    const { app, book } = harness({ cards: fakeCards().cards })
    await book()
    const body = await (await app.request('/api/availability')).json()
    expect(body.busyNights).toEqual(['2026-11-10', '2026-11-11', '2026-11-12'])
    expect((await app.request(`/api/quote?arrival=${ARRIVAL}&departure=${DEPARTURE}`)).status).toBe(409)

    const second = await book({ ...OTHER, arrival: '2026-11-12', departure: '2026-11-14' }, '198.51.100.20')
    expect(second.status).toBe(409)
    expect(await second.json()).toEqual({ error: 'dates_unavailable' })
  })

  it('does not block the guest holding them, and lets go once the stay is in Smoobu', async () => {
    const fake = fakeCards()
    const { app, pms, book, post } = harness({ cards: fake.cards })
    await book()
    fake.save()
    expect((await post('/api/booking/card', { lowProfileId: 'lp-1' })).status).toBe(200)
    expect(pms.reservations).toHaveLength(1)
    // Smoobu blocks the nights now; cancelling the reservation there must free them on the site too.
    pms.reservations.length = 0
    const body = await (await app.request('/api/availability')).json()
    expect(body.busyNights).toEqual([])
  })

  it('frees the nights after 15 minutes', async () => {
    let now = 0
    const { book } = harness({ cards: fakeCards().cards, now: () => now })
    await book()
    now = 15 * 60_000 + 1
    expect((await book({ ...OTHER }, '198.51.100.20')).status).toBe(200)
  })

  it('tells the owner and the guest, after 15 minutes, about a booking left without a card', async () => {
    let now = 0
    const { pms, sent, book, followUpExpiredHolds } = harness({ cards: fakeCards().cards, now: () => now })
    await book()
    await followUpExpiredHolds()
    expect(sent).toHaveLength(0)

    now = 15 * 60_000 + 1
    await followUpExpiredHolds()
    await followUpExpiredHolds()
    expect(pms.reservations).toHaveLength(0)
    const owner = ownerMails(sent)
    expect(owner).toHaveLength(1)
    expect(owner[0].subject).toContain('לא סיים')
    expect(owner[0].text).toContain(GUEST.phone)
    expect(owner[0].text).toContain('התקשרו לאורח')
    expect(owner[0].text).not.toMatch(/Cardcom|Smoobu/)
    const guest = sent.filter((mail) => mail.to === GUEST.email)
    expect(guest.map((mail) => mail.subject)).toEqual([expect.stringContaining('לא הושלמה')])
    expect(guest[0].text).toContain('לא בוצע חיוב')
  })

  it('books a card that was saved without anyone hearing of it, instead of reporting it unfinished', async () => {
    let now = 0
    const fake = fakeCards()
    const { pms, sent, book, followUpExpiredHolds } = harness({ cards: fake.cards, now: () => now })
    await book()
    fake.save()
    now = 15 * 60_000 + 1
    await followUpExpiredHolds()
    expect(pms.reservations).toHaveLength(1)
    expect(ownerMails(sent).map((mail) => mail.subject)).toEqual([expect.stringContaining('הזמנה חדשה')])
  })

  it('does not report a guest who finished', async () => {
    let now = 0
    const fake = fakeCards()
    const { sent, book, post, followUpExpiredHolds } = harness({ cards: fake.cards, now: () => now })
    await book()
    fake.save()
    await post('/api/booking/card', { lowProfileId: 'lp-1' })
    now = 15 * 60_000 + 1
    await followUpExpiredHolds()
    expect(ownerMails(sent)).toHaveLength(1)
  })

  it('lets the same guest try again at once after a card that was not saved', async () => {
    const { book } = harness({ cards: fakeCards().cards })
    const { ref } = await (await book()).json()
    expect((await book({ heldRef: ref })).status).toBe(200)
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
