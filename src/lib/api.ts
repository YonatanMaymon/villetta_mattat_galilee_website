import type {
  ApiError,
  ApiErrorCode,
  AvailabilityResponse,
  BookingRequest,
  BookingResponse,
  ContactRequest,
  QuoteResponse,
} from '../../shared/reservation'

/** A failed API call. `code` is the server's error code, or `network` when it could not be reached. */
export class ApiRequestError extends Error {
  readonly code: ApiErrorCode | 'network'

  constructor(code: ApiErrorCode | 'network') {
    super(code)
    this.name = 'ApiRequestError'
    this.code = code
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, init)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiRequestError('network')
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as Partial<ApiError> | null
    throw new ApiRequestError(body?.error ?? 'send_failed')
  }
  return (await response.json()) as T
}

const jsonPost = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
})

/**
 * Always fetched fresh: the browser must never show dates that were booked moments ago. The server's own
 * cache is what protects Smoobu from the traffic.
 */
export const fetchAvailability = (options: { signal?: AbortSignal } = {}) =>
  request<AvailabilityResponse>('/api/availability', { signal: options.signal, cache: 'no-store' })

/** The price Smoobu calculates for the stay. Nothing is reserved. */
export const fetchQuote = (arrival: string, departure: string, signal?: AbortSignal) =>
  request<QuoteResponse>(`/api/quote?arrival=${arrival}&departure=${departure}`, { signal })

/** Creates the reservation in Smoobu, flagged for the owner to confirm. Nothing is charged. */
export const submitBooking = (body: BookingRequest) => request<BookingResponse>('/api/booking', jsonPost(body))

export const submitContact = (body: ContactRequest) => request<{ ok: true }>('/api/contact', jsonPost(body))
