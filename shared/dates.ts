/**
 * Calendar-date helpers shared by the API and the booking calendar.
 *
 * Dates are plain ISO strings (`YYYY-MM-DD`) with no time zone, so a date means the same day everywhere.
 * A *night* is identified by the date it starts on: a stay from the 10th to the 12th occupies the nights
 * of the 10th and 11th, and the 12th is free for the next guest to arrive.
 */

export type IsoDate = string

export const BOOKING_TIME_ZONE = 'Asia/Jerusalem'

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== 'string') return false
  const match = ISO_DATE.exec(value)
  if (!match) return false
  const [, y, m, d] = match.map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

function toIso(date: Date): IsoDate {
  return date.toISOString().slice(0, 10)
}

function fromIso(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const date = fromIso(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return toIso(date)
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((fromIso(to).getTime() - fromIso(from).getTime()) / 86_400_000)
}

/** The nights of a stay: `arrival` up to, but not including, `departure`. */
export function eachNight(arrival: IsoDate, departure: IsoDate): IsoDate[] {
  const nights: IsoDate[] = []
  for (let night = arrival; night < departure; night = addDays(night, 1)) nights.push(night)
  return nights
}

export const nightsBetween = daysBetween

/** Today's date in the guesthouse's time zone (not the visitor's or the server's). */
export function todayInBookingZone(now: Date = new Date()): IsoDate {
  // The en-CA locale formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: BOOKING_TIME_ZONE }).format(now)
}

/** Converts a JS Date's calendar fields (as seen in the local time zone) to an ISO date. */
export function isoFromLocalDate(date: Date): IsoDate {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** The local-midnight Date for an ISO date, for calendar widgets that work with JS Dates. */
export function localDateFromIso(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export type BusyNights = ReadonlySet<IsoDate>

/** True when every night of the stay is free. Same-day turnover is fine (departure day may be busy). */
export function isRangeFree(busy: BusyNights, arrival: IsoDate, departure: IsoDate): boolean {
  if (departure <= arrival) return false
  return eachNight(arrival, departure).every((night) => !busy.has(night))
}

export interface StayRules {
  today: IsoDate
  minNights: number
  maxNights: number
  /** Furthest arrival date that can be requested. */
  lastArrival: IsoDate
}

/** Can a stay start on this night? */
export function canArrive(busy: BusyNights, day: IsoDate, rules: StayRules): boolean {
  return day >= rules.today && day <= rules.lastArrival && !busy.has(day)
}

/** Can a stay that starts on `arrival` end on `day`? */
export function canDepart(busy: BusyNights, arrival: IsoDate, day: IsoDate, rules: StayRules): boolean {
  const nights = daysBetween(arrival, day)
  return nights >= rules.minNights && nights <= rules.maxNights && isRangeFree(busy, arrival, day)
}

export interface Selection {
  arrival: IsoDate | null
  departure: IsoDate | null
}

export const EMPTY_SELECTION: Selection = { arrival: null, departure: null }

/** Whether a day may be clicked given what is already selected (drives the calendar's disabled days). */
export function isDaySelectable(busy: BusyNights, selection: Selection, day: IsoDate, rules: StayRules): boolean {
  if (canArrive(busy, day, rules)) return true
  // With only an arrival chosen, a later day may also be a valid departure.
  return selection.arrival !== null && selection.departure === null && canDepart(busy, selection.arrival, day, rules)
}

/**
 * Applies a click on `day`: the first click sets the arrival, the second the departure (when valid);
 * clicking a valid arrival day again starts a new selection.
 */
export function pickDay(busy: BusyNights, selection: Selection, day: IsoDate, rules: StayRules): Selection {
  const { arrival, departure } = selection
  if (arrival && !departure && day > arrival && canDepart(busy, arrival, day, rules)) {
    return { arrival, departure: day }
  }
  if (canArrive(busy, day, rules)) return { arrival: day, departure: null }
  return selection
}
