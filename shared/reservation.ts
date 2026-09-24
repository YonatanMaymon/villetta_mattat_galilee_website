import { z } from 'zod'
import { isIsoDate } from './dates'

export { MAX_ADVANCE_DAYS, MAX_NIGHTS, MIN_NIGHTS, stayRules } from './rules'

export const LANGS = ['he', 'en'] as const
export type Lang = (typeof LANGS)[number]

const trimmed = (max: number) => z.string().trim().max(max)
const isoDate = z.string().refine(isIsoDate, 'Invalid date')

/** Bots fill hidden fields; a real visitor never sees this one. */
const honeypot = z.string().max(200).optional()

/** What the booking dialog collects across its three screens. */
export const bookingSchema = z.object({
  name: trimmed(120).min(1),
  phone: trimmed(40).min(5),
  // Required: the guest is emailed their reference number.
  email: trimmed(200).pipe(z.email()),
  arrival: isoDate,
  departure: isoDate,
  lang: z.enum(LANGS),
  website: honeypot,
  /** Cloudflare Turnstile token. Absent when Turnstile is not configured (local development). */
  turnstileToken: z.string().max(4096).optional(),
})

export const contactSchema = z.object({
  name: trimmed(120).min(1),
  phone: trimmed(40).min(5),
  email: trimmed(200).pipe(z.union([z.literal(''), z.email()])).optional(),
  message: trimmed(4000).min(1),
  lang: z.enum(LANGS),
  website: honeypot,
})

export type BookingRequest = z.infer<typeof bookingSchema>
export type ContactRequest = z.infer<typeof contactSchema>

export interface AvailabilityResponse {
  /** Every unavailable night as `YYYY-MM-DD`, from Smoobu. */
  busyNights: string[]
  updatedAt: string
  /** False while Smoobu's API is not configured: the calendar is read-only and nothing can be booked. */
  canBook: boolean
}

export const SUPPORTED_CURRENCY = 'ILS'

export interface QuoteResponse {
  /** Total in shekels for the whole stay, computed by Smoobu. */
  amount: number
  currency: string
  nights: number
}

export interface BookingResponse {
  /** The guest's reference, quoted back to them and written into the Smoobu reservation's notes. */
  ref: string
  nights: number
  amount: number
  currency: string
}

export type ApiErrorCode =
  | 'invalid_request'
  | 'dates_unavailable'
  | 'calendar_unavailable'
  | 'booking_unavailable'
  | 'send_failed'
  | 'rate_limited'
  | 'bot_check_failed'

export interface ApiError {
  error: ApiErrorCode
}
