import ICAL from 'ical.js'
import { addDays, BOOKING_TIME_ZONE, eachNight, type IsoDate } from '../shared/dates'
import { PmsUnavailableError } from './pms'

/** Thrown when the Smoobu calendar cannot be read and no recent copy exists. */
export class CalendarUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CalendarUnavailableError'
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

function isoFromIcalTime(time: ICAL.Time): IsoDate {
  // A timestamp in UTC ("...Z") is one instant: read its calendar day in the guesthouse's zone.
  if (!time.isDate && time.zone === ICAL.Timezone.utcTimezone) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: BOOKING_TIME_ZONE }).format(time.toJSDate())
  }
  // All-day dates and local times already carry the calendar day the host meant.
  return `${time.year}-${pad(time.month)}-${pad(time.day)}`
}

export interface ParseWindow {
  /** Nights before this date are dropped (past nights are irrelevant to guests). */
  from: IsoDate
  /** Nights after this date are dropped (keeps the response small for long owner blocks). */
  until: IsoDate
}

/**
 * Reads a Smoobu iCal feed and returns the occupied nights. Only dates leave this function: summaries,
 * descriptions and guest details in the feed are ignored on purpose.
 *
 * DTEND is exclusive, so an event from the 10th to the 12th occupies the nights of the 10th and 11th and
 * the 12th stays free for the next arrival.
 */
export function parseBusyNights(ics: string, window: ParseWindow): Set<IsoDate> {
  let root: ICAL.Component
  try {
    root = new ICAL.Component(ICAL.parse(ics))
  } catch {
    throw new CalendarUnavailableError('The calendar feed is not valid iCal')
  }

  const busy = new Set<IsoDate>()
  for (const vevent of root.getAllSubcomponents('vevent')) {
    if (String(vevent.getFirstPropertyValue('status')).toUpperCase() === 'CANCELLED') continue

    const event = new ICAL.Event(vevent)
    const start = isoFromIcalTime(event.startDate)
    let end = isoFromIcalTime(event.endDate)
    // A same-day or reversed event still blocks the night it starts on.
    if (end <= start) end = addDays(start, 1)

    for (const night of eachNight(start < window.from ? window.from : start, end > window.until ? window.until : end)) {
      busy.add(night)
    }
  }
  return busy
}

export interface AvailabilityOptions {
  /** Reads the booked nights from wherever they live: Smoobu's API, or its iCal feed (see `icalLoader`). */
  load: (window: ParseWindow) => Promise<ReadonlySet<IsoDate>>
  now?: () => number
  today: () => IsoDate
  /** How many days ahead guests can book (bounds what we keep from the feed). */
  horizonDays: number
}

export interface BusySnapshot {
  nights: ReadonlySet<IsoDate>
  updatedAt: Date
}

const FRESH_MS = 10 * 60_000
const STALE_OK_MS = 24 * 60 * 60_000
/** Even a "fresh" request reuses data younger than this, so form spam cannot hammer Smoobu. */
const MIN_REFETCH_MS = 20_000

/** Availability with a short cache, request de-duplication, and stale fallback if Smoobu is down. */
export function createAvailability(options: AvailabilityOptions) {
  const now = options.now ?? Date.now
  let snapshot: (BusySnapshot & { fetchedAt: number }) | null = null
  let inflight: Promise<BusySnapshot> | null = null

  async function refresh(): Promise<BusySnapshot> {
    const from = options.today()
    let nights: ReadonlySet<IsoDate>
    try {
      nights = await options.load({ from, until: addDays(from, options.horizonDays + 60) })
    } catch (error) {
      // Callers only need to know "the calendar cannot be read right now".
      if (error instanceof PmsUnavailableError) throw new CalendarUnavailableError(error.message)
      throw error
    }
    const fetchedAt = now()
    snapshot = { nights, updatedAt: new Date(fetchedAt), fetchedAt }
    return snapshot
  }

  return {
    /** `fresh: true` (used when a reservation is submitted) skips the normal cache window. */
    async get({ fresh = false }: { fresh?: boolean } = {}): Promise<BusySnapshot> {
      const age = snapshot ? now() - snapshot.fetchedAt : Infinity
      if (snapshot && age < (fresh ? MIN_REFETCH_MS : FRESH_MS)) return snapshot

      inflight ??= refresh().finally(() => {
        inflight = null
      })
      try {
        return await inflight
      } catch (error) {
        if (snapshot && age < STALE_OK_MS) return snapshot
        throw error instanceof CalendarUnavailableError ? error : new CalendarUnavailableError('Calendar fetch failed')
      }
    },

    /**
     * Drops the cached copy. Called after a reservation is created, so the nights it took stop showing as
     * free straight away instead of waiting out the cache window.
     */
    invalidate() {
      snapshot = null
    },
  }
}

/** Reads busy nights from a Smoobu iCal feed (the fallback when the Smoobu API is not configured). */
export function icalLoader(fetchIcs: () => Promise<string>): AvailabilityOptions['load'] {
  return async (window) => parseBusyNights(await fetchIcs(), window)
}

/** Downloads the Smoobu feed. Errors never include the URL, which contains a secret. */
export function fetchIcsFrom(url: string | undefined, fetchImpl: typeof fetch = fetch): () => Promise<string> {
  return async () => {
    if (!url) throw new CalendarUnavailableError('SMOOBU_ICAL_URL is not configured')
    let response: Response
    try {
      response = await fetchImpl(url, { signal: AbortSignal.timeout(8_000), headers: { accept: 'text/calendar' } })
    } catch {
      throw new CalendarUnavailableError('Could not reach Smoobu')
    }
    if (!response.ok) throw new CalendarUnavailableError(`Smoobu answered ${response.status}`)
    const text = await response.text()
    if (!text.includes('BEGIN:VCALENDAR')) throw new CalendarUnavailableError('Smoobu did not return a calendar')
    return text
  }
}
