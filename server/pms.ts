import type { IsoDate } from '../shared/dates'

/**
 * The property-management system (Smoobu) as the booking flow sees it. The real client is in
 * ./smoobu.ts; ./fakes.ts has an in-memory one for local development and tests.
 */

/** Smoobu answered, and refused (for example the dates are no longer free). Do not retry. */
export class PmsRejectedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PmsRejectedError'
  }
}

/** Smoobu could not be reached or answered with a server error. Safe to retry later. */
export class PmsUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PmsUnavailableError'
  }
}

export type Quote =
  | { available: true; amount: number; currency: string }
  | { available: false; reason: 'dates_unavailable' | 'stay_rules' }

export interface NewReservation {
  /** Our booking reference; stored in the reservation's notes so a duplicate submit can find it again. */
  ref: string
  arrival: IsoDate
  departure: IsoDate
  name: string
  email: string
  phone: string
  message?: string
  lang: 'he' | 'en'
  /** The price Smoobu quoted for the stay, in shekels. Nothing has been charged. */
  amount: number
}

export interface PropertyManagement {
  /** Nights that cannot be booked, from `from` up to and including `until`. */
  getBusyNights(range: { from: IsoDate; until: IsoDate }): Promise<Set<IsoDate>>
  quote(arrival: IsoDate, departure: IsoDate): Promise<Quote>
  /** Creates the reservation, flagged in its notes as awaiting the owner's confirmation. Returns its id. */
  createReservation(reservation: NewReservation): Promise<string>
  /** Looks for a reservation we created earlier (same `ref`), so a double submit never duplicates it. */
  findByReference(ref: string, arrival: IsoDate): Promise<string | null>
}
