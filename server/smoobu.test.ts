import { createHmac, createHash } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { PmsRejectedError, PmsUnavailableError } from './pms'
import { canonicalString, createSmoobuClient, PENDING_NOTICE, sha256Hex, signRequest } from './smoobu'

const config = { apiKey: 'key-123', apiSecret: 'secret-abc', apartmentId: 42, customerId: 7 }

describe('request signing', () => {
  it('hashes an empty body to the constant Smoobu documents', async () => {
    expect(await sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })

  it('builds the documented canonical string for a POST (empty query line)', async () => {
    const body = '{"a":1}'
    const canonical = await canonicalString({
      method: 'post',
      path: '/api/reservations',
      body,
      apiKey: 'key-123',
      timestamp: '2026-09-19T10:00:00.000Z',
      nonce: 'nonce-1',
    })
    expect(canonical.split('\n')).toEqual([
      'POST',
      '/api/reservations',
      '',
      '2026-09-19T10:00:00.000Z',
      'nonce-1',
      createHash('sha256').update(body).digest('hex'),
      'key-123',
    ])
  })

  it('sorts query parameters alphabetically on their own line (GET)', async () => {
    const canonical = await canonicalString({
      method: 'GET',
      path: '/api/reservations',
      query: [
        ['to', '2026-04-10'],
        ['from', '2026-04-01'],
      ],
      apiKey: 'k',
      timestamp: 't',
      nonce: 'n',
    })
    expect(canonical.split('\n')[2]).toBe('from=2026-04-01&to=2026-04-10')
  })

  it('signs with HMAC-SHA256 and base64, matching an independent implementation', async () => {
    const input = {
      method: 'POST',
      path: '/api/reservations',
      body: '{"arrivalDate":"2026-10-01"}',
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      timestamp: '2026-09-19T10:00:00.000Z',
      nonce: '6f1c1b1e-0000-4000-8000-000000000001',
    }
    const headers = await signRequest(input)
    const expected = createHmac('sha256', config.apiSecret)
      .update(await canonicalString(input))
      .digest('base64')
    expect(headers).toEqual({
      'X-API-Key': 'key-123',
      'X-Timestamp': input.timestamp,
      'X-Nonce': input.nonce,
      'X-Signature': expected,
    })
  })
})

function clientWith(respond: (url: URL, init: RequestInit) => Response | Promise<Response>) {
  const calls: { url: URL; init: RequestInit }[] = []
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input))
    calls.push({ url, init: init ?? {} })
    return respond(url, init ?? {})
  }) as typeof fetch
  let n = 0
  const client = createSmoobuClient(config, {
    fetch: fetchImpl,
    now: () => new Date('2026-09-19T10:00:00Z'),
    uuid: () => `nonce-${++n}`,
  })
  return { client, calls }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('quote', () => {
  it('returns the price Smoobu calculates, using a signed request', async () => {
    const { client, calls } = clientWith(() =>
      json({ availableApartments: [42], prices: { '42': { price: 4200, currency: 'ILS' } } }),
    )
    expect(await client.quote('2026-10-01', '2026-10-02')).toEqual({ available: true, amount: 4200, currency: 'ILS' })
    const [{ url, init }] = calls
    expect(url.pathname).toBe('/booking/checkApartmentAvailability')
    expect(JSON.parse(String(init.body))).toMatchObject({ arrivalDate: '2026-10-01', apartments: [42], customerId: 7 })
    expect((init.headers as Record<string, string>)['X-Signature']).toBeTruthy()
  })

  it('reports the dates as unavailable, distinguishing stay rules from a booking', async () => {
    const booked = clientWith(() => json({ availableApartments: [], prices: {}, errorMessages: {} }))
    expect(await booked.client.quote('2026-10-01', '2026-10-02')).toEqual({ available: false, reason: 'dates_unavailable' })
    const rules = clientWith(() => json({ availableApartments: [], errorMessages: { '42': { errorCode: 405 } } }))
    expect(await rules.client.quote('2026-10-01', '2026-10-02')).toEqual({ available: false, reason: 'stay_rules' })
  })
})

describe('getBusyNights', () => {
  it('marks nights Smoobu reports as not available, across several requests for a long range', async () => {
    const { client, calls } = clientWith((url) => {
      const start = url.searchParams.get('start_date')!
      return json({
        data: { '42': { [start]: { price: 100, available: start === '2026-10-01' ? 0 : 1 }, '2099-01-01': { available: 0 } } },
      })
    })
    const busy = await client.getBusyNights({ from: '2026-10-01', until: '2027-04-01' })
    expect(calls.length).toBeGreaterThan(1)
    expect(calls[0].url.searchParams.get('apartments[]')).toBe('42')
    expect(busy.has('2026-10-01')).toBe(true)
    expect(busy.has('2099-01-01')).toBe(true)
  })

  it('fails instead of showing everything as free when the response has no rates', async () => {
    const { client } = clientWith(() => json({ data: {} }))
    await expect(client.getBusyNights({ from: '2026-10-01', until: '2026-10-10' })).rejects.toBeInstanceOf(PmsUnavailableError)
  })
})

describe('createReservation', () => {
  const reservation = {
    ref: 'abc123',
    arrival: '2026-10-01',
    departure: '2026-10-03',
    name: 'Dana Ben David',
    email: 'dana@example.com',
    phone: '0521234567',
    message: 'Anniversary',
    lang: 'he' as const,
    amount: 6400,
  }

  it('creates an unpaid reservation flagged for the owner, carrying our reference in the notes', async () => {
    const { client, calls } = clientWith(() => json({ id: 555 }))
    expect(await client.createReservation(reservation)).toBe('555')
    const body = JSON.parse(String(calls[0].init.body))
    expect(body).toMatchObject({
      arrivalDate: '2026-10-01',
      departureDate: '2026-10-03',
      apartmentId: 42,
      firstName: 'Dana',
      lastName: 'Ben David',
      price: 6400,
      // Nothing is charged by the website, so the price is recorded as still open.
      priceStatus: 0,
      language: 'he',
    })
    expect(body.notice).toContain('abc123')
    // The owner has to be able to tell a website request from a booking they confirmed themselves.
    expect(body.notice).toContain(PENDING_NOTICE)
  })

  it('treats a 400 as a refusal (do not retry) and outages as retryable', async () => {
    const refused = clientWith(() => json({ validation_messages: { arrivalDate: 'not available' } }, 400))
    await expect(refused.client.createReservation(reservation)).rejects.toBeInstanceOf(PmsRejectedError)
    for (const status of [401, 403, 429, 500, 503]) {
      const down = clientWith(() => json({}, status))
      await expect(down.client.createReservation(reservation)).rejects.toBeInstanceOf(PmsUnavailableError)
    }
    const offline = clientWith(() => {
      throw new TypeError('network down')
    })
    await expect(offline.client.createReservation(reservation)).rejects.toBeInstanceOf(PmsUnavailableError)
  })
})

describe('findByReference', () => {
  it('finds a reservation we created earlier by the reference in its notes', async () => {
    const { client, calls } = clientWith(() =>
      json({ bookings: [{ id: 1, notice: 'someone else' }, { id: 2, notice: 'Website booking abc123\nhi' }] }),
    )
    expect(await client.findByReference('abc123', '2026-10-01')).toBe('2')
    expect(calls[0].url.searchParams.get('from')).toBe('2026-10-01')
  })

  it('returns null when nothing matches', async () => {
    const { client } = clientWith(() => json({ bookings: [{ id: 1, notice: 'other' }] }))
    expect(await client.findByReference('abc123', '2026-10-01')).toBeNull()
  })
})

describe('secrets', () => {
  it('never puts the API secret or key in an error message', async () => {
    const { client } = clientWith(() => json({}, 500))
    const error = await client.quote('2026-10-01', '2026-10-02').catch((e: Error) => e)
    expect(String((error as Error).message)).not.toMatch(/secret-abc|key-123/)
    vi.restoreAllMocks()
  })
})
