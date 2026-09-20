import { describe, expect, it, vi } from 'vitest'
import { CalendarUnavailableError, createAvailability, fetchIcsFrom, icalLoader, parseBusyNights } from './availability'

const window = { from: '2026-09-01', until: '2027-12-31' }

/** A feed shaped like Smoobu's: all-day events, an owner block, a folded line and a cancelled booking. */
const FEED = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Smoobu//EN',
  'BEGIN:VEVENT',
  'UID:1',
  'DTSTART;VALUE=DATE:20260910',
  'DTEND;VALUE=DATE:20260912',
  'SUMMARY:Booking - a very long guest name that the feed folds onto the next line so the parser',
  '  has to unfold it correctly',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:2',
  'DTSTART;VALUE=DATE:20260912',
  'DTEND;VALUE=DATE:20260914',
  'SUMMARY:Blocked',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:3',
  'DTSTART;VALUE=DATE:20260920',
  'DTEND;VALUE=DATE:20260921',
  'STATUS:CANCELLED',
  'END:VEVENT',
  'END:VCALENDAR',
  '',
].join('\r\n')

describe('parseBusyNights', () => {
  it('turns exclusive-end events into occupied nights and merges back-to-back stays', () => {
    expect([...parseBusyNights(FEED, window)].sort()).toEqual([
      '2026-09-10',
      '2026-09-11',
      '2026-09-12',
      '2026-09-13',
    ])
  })

  it('skips cancelled events', () => {
    expect(parseBusyNights(FEED, window).has('2026-09-20')).toBe(false)
  })

  it('reads timestamps in UTC as Israel calendar days', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      // 22:00 UTC is already the next day in Israel.
      'DTSTART:20260910T220000Z',
      'DTEND:20260912T090000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    expect([...parseBusyNights(ics, window)].sort()).toEqual(['2026-09-11'])
  })

  it('treats a same-day event as blocking that night', () => {
    const ics = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART:20260915T100000\r\nDTEND:20260915T150000\r\nEND:VEVENT\r\nEND:VCALENDAR'
    expect([...parseBusyNights(ics, window)]).toEqual(['2026-09-15'])
  })

  it('drops nights outside the window and copes with an empty calendar', () => {
    expect([...parseBusyNights(FEED, { from: '2026-09-12', until: '2026-09-13' })]).toEqual(['2026-09-12'])
    expect(parseBusyNights('BEGIN:VCALENDAR\r\nEND:VCALENDAR', window).size).toBe(0)
  })

  it('rejects text that is not iCal', () => {
    expect(() => parseBusyNights('<html>login</html>', window)).toThrow(CalendarUnavailableError)
  })
})

describe('createAvailability', () => {
  const setup = () => {
    let clock = 1_000_000
    const fetchIcs = vi.fn(async () => FEED)
    const availability = createAvailability({ load: icalLoader(fetchIcs), now: () => clock, today: () => '2026-09-01', horizonDays: 548 })
    return { availability, fetchIcs, advance: (ms: number) => (clock += ms) }
  }

  it('caches for a few minutes and shares one download between concurrent requests', async () => {
    const { availability, fetchIcs, advance } = setup()
    await Promise.all([availability.get(), availability.get()])
    expect(fetchIcs).toHaveBeenCalledTimes(1)
    advance(5 * 60_000)
    await availability.get()
    expect(fetchIcs).toHaveBeenCalledTimes(1)
    advance(6 * 60_000)
    await availability.get()
    expect(fetchIcs).toHaveBeenCalledTimes(2)
  })

  it('re-downloads for a fresh check, but not more than every few seconds', async () => {
    const { availability, fetchIcs, advance } = setup()
    await availability.get()
    await availability.get({ fresh: true })
    expect(fetchIcs).toHaveBeenCalledTimes(1)
    advance(30_000)
    await availability.get({ fresh: true })
    expect(fetchIcs).toHaveBeenCalledTimes(2)
  })

  it('serves the last good data when Smoobu is down, and errors when there is none', async () => {
    const { availability, fetchIcs, advance } = setup()
    fetchIcs.mockRejectedValueOnce(new CalendarUnavailableError('down'))
    await expect(availability.get()).rejects.toBeInstanceOf(CalendarUnavailableError)

    fetchIcs.mockResolvedValueOnce(FEED)
    await availability.get()
    advance(20 * 60_000)
    fetchIcs.mockRejectedValueOnce(new Error('network'))
    expect((await availability.get()).nights.has('2026-09-10')).toBe(true)
  })
})

describe('fetchIcsFrom', () => {
  it('fails clearly without leaking the secret URL', async () => {
    const secret = 'https://login.smoobu.com/ical/detail/1.ics?s=SECRET'
    const failing = fetchIcsFrom(secret, (async () => new Response('nope', { status: 403 })) as typeof fetch)
    await expect(failing()).rejects.toThrow('Smoobu answered 403')
    await expect(fetchIcsFrom(undefined)()).rejects.toThrow('not configured')
    const html = fetchIcsFrom(secret, (async () => new Response('<html>')) as typeof fetch)
    await expect(html()).rejects.toThrow('did not return a calendar')
    await expect(failing()).rejects.not.toThrow(/SECRET/)
  })
})
