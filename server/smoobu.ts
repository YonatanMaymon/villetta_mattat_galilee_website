import { addDays, type IsoDate } from '../shared/dates'
import {
  PmsRejectedError,
  PmsUnavailableError,
  type NewReservation,
  type PropertyManagement,
  type Quote,
} from './pms'

const BASE_URL = 'https://login.smoobu.com'
/** Smoobu answers unreachable or slow requests as failures rather than hanging the guest. */
const TIMEOUT_MS = 10_000
/** Rates are requested in slices so no single request asks for more than Smoobu may allow. */
const RATES_SLICE_DAYS = 90
/** Written into every website reservation so the owner can tell it apart from a confirmed booking. */
export const PENDING_NOTICE = 'בקשה מהאתר – ממתין לאישור | Website request – awaiting confirmation'

export interface SmoobuConfig {
  apiKey: string
  apiSecret: string
  apartmentId: number
  /** Required by Smoobu's availability endpoint (the account's customer id). */
  customerId?: number
  baseUrl?: string
}

export interface SmoobuDeps {
  fetch?: typeof fetch
  now?: () => Date
  uuid?: () => string
}

const encoder = new TextEncoder()

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function toBase64(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
}

export async function sha256Hex(text: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(text)))
}

export interface SignInput {
  method: string
  path: string
  /** Query parameters as sent; they are sorted for signing. */
  query?: [string, string][]
  body?: string
  apiKey: string
  apiSecret: string
  timestamp: string
  nonce: string
}

/** The exact text Smoobu expects to be signed. */
export async function canonicalString(input: Omit<SignInput, 'apiSecret'>): Promise<string> {
  const query = [...(input.query ?? [])]
    .sort(([a, av], [b, bv]) => (a === b ? av.localeCompare(bv) : a.localeCompare(b)))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  return [
    input.method.toUpperCase(),
    input.path,
    query,
    input.timestamp,
    input.nonce,
    await sha256Hex(input.body ?? ''),
    input.apiKey,
  ].join('\n')
}

/** The four authentication headers Smoobu requires on every request. */
export async function signRequest(input: SignInput): Promise<Record<string, string>> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(input.apiSecret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(await canonicalString(input)))
  return {
    'X-API-Key': input.apiKey,
    'X-Timestamp': input.timestamp,
    'X-Nonce': input.nonce,
    'X-Signature': toBase64(signature),
  }
}

/** Smoobu returns each night's `available` as a number (1/0) or a boolean; anything else is treated as unavailable. */
const isAvailable = (value: unknown) => value === 1 || value === true || value === '1'

export function createSmoobuClient(config: SmoobuConfig, deps: SmoobuDeps = {}): PropertyManagement {
  const fetchImpl = deps.fetch ?? fetch
  const now = deps.now ?? (() => new Date())
  const uuid = deps.uuid ?? (() => crypto.randomUUID())
  const baseUrl = config.baseUrl ?? BASE_URL

  async function call(
    method: 'GET' | 'POST',
    path: string,
    { query, body }: { query?: [string, string][]; body?: unknown } = {},
  ): Promise<unknown> {
    const rawBody = body === undefined ? undefined : JSON.stringify(body)
    const headers = await signRequest({
      method,
      path,
      query,
      body: rawBody,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      timestamp: now().toISOString(),
      nonce: uuid(),
    })
    const search = query?.length ? `?${query.map(([k, v]) => `${k}=${v}`).join('&')}` : ''

    let response: Response
    try {
      response = await fetchImpl(`${baseUrl}${path}${search}`, {
        method,
        headers: { ...headers, ...(rawBody ? { 'content-type': 'application/json' } : {}), accept: 'application/json' },
        body: rawBody,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch {
      throw new PmsUnavailableError('Could not reach Smoobu')
    }

    // 4xx means Smoobu understood and refused (except 401/403/429, which are our setup or a limit).
    if (response.status >= 500 || response.status === 401 || response.status === 403 || response.status === 429) {
      throw new PmsUnavailableError(`Smoobu answered ${response.status}`)
    }
    const json = await response.json().catch(() => null)
    if (!response.ok) throw new PmsRejectedError(`Smoobu refused the request (${response.status})`)
    return json
  }

  return {
    async getBusyNights({ from, until }) {
      const busy = new Set<IsoDate>()
      const slices: { start: IsoDate; end: IsoDate }[] = []
      for (let start = from; start <= until; start = addDays(start, RATES_SLICE_DAYS)) {
        const end = addDays(start, RATES_SLICE_DAYS - 1)
        slices.push({ start, end: end < until ? end : until })
      }

      const results = await Promise.all(
        slices.map(({ start, end }) =>
          call('GET', '/api/rates', {
            query: [
              ['apartments[]', String(config.apartmentId)],
              ['end_date', end],
              ['start_date', start],
            ],
          }),
        ),
      )

      for (const json of results) {
        const days = (json as { data?: Record<string, Record<string, { available?: unknown }>> } | null)?.data?.[
          String(config.apartmentId)
        ]
        if (!days) throw new PmsUnavailableError('Smoobu returned no rates for the apartment')
        for (const [date, info] of Object.entries(days)) if (!isAvailable(info?.available)) busy.add(date)
      }
      return busy
    },

    async quote(arrival, departure): Promise<Quote> {
      const id = String(config.apartmentId)
      const json = (await call('POST', '/booking/checkApartmentAvailability', {
        body: {
          arrivalDate: arrival,
          departureDate: departure,
          apartments: [config.apartmentId],
          ...(config.customerId ? { customerId: config.customerId } : {}),
        },
      })) as {
        availableApartments?: (number | string)[]
        prices?: Record<string, { price?: number; currency?: string }>
        errorMessages?: Record<string, { errorCode?: number | string }>
      } | null

      const available = json?.availableApartments?.map(String).includes(id)
      const price = json?.prices?.[id]
      if (available && typeof price?.price === 'number' && price.currency) {
        return { available: true, amount: price.price, currency: price.currency }
      }
      // Smoobu says why (minimum stay, guest limit, already booked) but they all mean "not for these dates".
      return { available: false, reason: json?.errorMessages?.[id] ? 'stay_rules' : 'dates_unavailable' }
    },

    async createReservation(reservation: NewReservation) {
      const [firstName, ...rest] = reservation.name.trim().split(/\s+/)
      // Smoobu has no API field for "unconfirmed" (that flag is UI-only), so the notes carry it. The owner
      // sees this in the calendar, phones the guest, and clears the line once the stay is agreed.
      const notice = [PENDING_NOTICE, `Ref: ${reservation.ref}`, reservation.message].filter(Boolean).join('\n')
      const json = (await call('POST', '/api/reservations', {
        body: {
          arrivalDate: reservation.arrival,
          departureDate: reservation.departure,
          apartmentId: config.apartmentId,
          firstName,
          lastName: rest.join(' ') || '-',
          email: reservation.email,
          phone: reservation.phone,
          notice,
          language: reservation.lang,
          price: reservation.amount,
          // 0 = open. No money has been taken; the guest pays once the owner confirms the stay.
          priceStatus: 0,
        },
      })) as { id?: number | string } | null
      if (json?.id === undefined) throw new PmsUnavailableError('Smoobu did not return a reservation id')
      return String(json.id)
    },

    async findByReference(ref, arrival) {
      const json = (await call('GET', '/api/reservations', {
        query: [
          ['apartmentId', String(config.apartmentId)],
          ['from', arrival],
          ['to', arrival],
        ],
      })) as { bookings?: { id: number | string; notice?: string | null }[] } | null
      const match = json?.bookings?.find((booking) => booking.notice?.includes(ref))
      return match ? String(match.id) : null
    },
  }
}
