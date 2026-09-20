import { addDays, todayInBookingZone, type StayRules } from './dates'

export const MIN_NIGHTS = 1
export const MAX_NIGHTS = 30
/** How far ahead a stay can be requested. */
export const MAX_ADVANCE_DAYS = 548

export function stayRules(today = todayInBookingZone()): StayRules {
  return { today, minNights: MIN_NIGHTS, maxNights: MAX_NIGHTS, lastArrival: addDays(today, MAX_ADVANCE_DAYS) }
}
