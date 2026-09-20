import { describe, expect, it } from 'vitest'
import {
  addDays,
  canArrive,
  canDepart,
  daysBetween,
  eachNight,
  EMPTY_SELECTION,
  isDaySelectable,
  isIsoDate,
  isRangeFree,
  pickDay,
  todayInBookingZone,
  type StayRules,
} from './dates'

const rules: StayRules = { today: '2026-09-01', minNights: 1, maxNights: 30, lastArrival: '2027-12-01' }
// Booked: the nights of 10, 11 and 20 September.
const busy = new Set(['2026-09-10', '2026-09-11', '2026-09-20'])

describe('date helpers', () => {
  it('validates ISO dates', () => {
    expect(isIsoDate('2026-09-19')).toBe(true)
    expect(isIsoDate('2026-02-30')).toBe(false)
    expect(isIsoDate('2026-9-1')).toBe(false)
    expect(isIsoDate(20260919)).toBe(false)
  })

  it('adds days across month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('counts days and lists nights without the departure day', () => {
    expect(daysBetween('2026-09-10', '2026-09-13')).toBe(3)
    expect(eachNight('2026-09-10', '2026-09-13')).toEqual(['2026-09-10', '2026-09-11', '2026-09-12'])
    expect(eachNight('2026-09-10', '2026-09-10')).toEqual([])
  })

  it('reads today in the Israel time zone', () => {
    // 22:30 UTC on the 1st is already the 2nd in Israel (UTC+2/+3).
    expect(todayInBookingZone(new Date('2026-01-01T22:30:00Z'))).toBe('2026-01-02')
  })
})

describe('isRangeFree', () => {
  it('rejects a stay that includes a busy night', () => {
    expect(isRangeFree(busy, '2026-09-09', '2026-09-11')).toBe(false)
    expect(isRangeFree(busy, '2026-09-11', '2026-09-13')).toBe(false)
  })

  it('allows same-day turnover on both ends', () => {
    expect(isRangeFree(busy, '2026-09-08', '2026-09-10')).toBe(true) // leaves on the 10th, guest arrives the 10th
    expect(isRangeFree(busy, '2026-09-12', '2026-09-14')).toBe(true) // arrives the day the other guest leaves
  })

  it('rejects empty or reversed ranges', () => {
    expect(isRangeFree(busy, '2026-09-14', '2026-09-14')).toBe(false)
    expect(isRangeFree(busy, '2026-09-15', '2026-09-14')).toBe(false)
  })
})

describe('arrival and departure rules', () => {
  it('blocks past days, busy nights and days beyond the booking horizon as arrivals', () => {
    expect(canArrive(busy, '2026-08-31', rules)).toBe(false)
    expect(canArrive(busy, '2026-09-10', rules)).toBe(false)
    expect(canArrive(busy, '2026-09-12', rules)).toBe(true)
    expect(canArrive(busy, '2027-12-02', rules)).toBe(false)
  })

  it('lets a guest depart on the first busy day but not cross it', () => {
    expect(canDepart(busy, '2026-09-08', '2026-09-10', rules)).toBe(true)
    expect(canDepart(busy, '2026-09-08', '2026-09-12', rules)).toBe(false)
  })

  it('enforces minimum and maximum stay length', () => {
    expect(canDepart(busy, '2026-09-12', '2026-09-12', { ...rules, minNights: 2 })).toBe(false)
    expect(canDepart(busy, '2026-09-12', '2026-09-13', { ...rules, minNights: 2 })).toBe(false)
    expect(canDepart(busy, '2026-09-12', '2026-09-14', { ...rules, minNights: 2 })).toBe(true)
    expect(canDepart(busy, '2026-09-21', '2026-09-24', { ...rules, maxNights: 2 })).toBe(false)
  })
})

describe('pickDay', () => {
  it('sets the arrival first, then the departure', () => {
    const first = pickDay(busy, EMPTY_SELECTION, '2026-09-12', rules)
    expect(first).toEqual({ arrival: '2026-09-12', departure: null })
    expect(pickDay(busy, first, '2026-09-15', rules)).toEqual({ arrival: '2026-09-12', departure: '2026-09-15' })
  })

  it('never ends a stay across a booked night', () => {
    const first = pickDay(busy, EMPTY_SELECTION, '2026-09-18', rules)
    // Departure onto the first booked day is fine.
    expect(pickDay(busy, first, '2026-09-20', rules)).toEqual({ arrival: '2026-09-18', departure: '2026-09-20' })
    // A free day beyond the booked night can only start a new stay, not end this one.
    expect(pickDay(busy, first, '2026-09-22', rules)).toEqual({ arrival: '2026-09-22', departure: null })
    // A booked day is not clickable at all.
    expect(pickDay(busy, EMPTY_SELECTION, '2026-09-11', rules)).toEqual(EMPTY_SELECTION)
  })

  it('restarts when a valid arrival is clicked before the arrival or after a full selection', () => {
    const chosen = { arrival: '2026-09-12', departure: '2026-09-15' }
    expect(pickDay(busy, chosen, '2026-09-13', rules)).toEqual({ arrival: '2026-09-13', departure: null })
    expect(pickDay(busy, { arrival: '2026-09-12', departure: null }, '2026-09-05', rules)).toEqual({
      arrival: '2026-09-05',
      departure: null,
    })
  })

  it('reports which days can be clicked', () => {
    const selection = { arrival: '2026-09-08', departure: null }
    expect(isDaySelectable(busy, selection, '2026-09-10', rules)).toBe(true) // departure onto a busy day
    expect(isDaySelectable(busy, selection, '2026-09-11', rules)).toBe(false) // busy, and would cross a busy night
    expect(isDaySelectable(busy, EMPTY_SELECTION, '2026-09-10', rules)).toBe(false) // busy night, no arrival yet
  })
})
