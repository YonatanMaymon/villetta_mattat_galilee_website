import { eachNight, type IsoDate } from '../shared/dates'
import type { Lang } from '../shared/reservation'

/**
 * While a guest types their card on Cardcom's page, nothing is in Smoobu yet. A hold keeps their nights off
 * the website's calendar meanwhile, so another visitor cannot pick them. It is the website's own: Airbnb
 * and other Smoobu channels do not see it. Smoobu is checked again before the reservation is made, so a
 * lost hold can at worst make a guest lose the dates, never double-book them.
 *
 * A hold that runs out without being released means the guest never finished: it is collected by
 * `takeExpired` (every minute) so the owner can be told and call them.
 */
export const HOLD_MS = 15 * 60_000
/** Expired holds nobody collected (no scheduled job running) are dropped after this long. */
const KEEP_EXPIRED_MS = 24 * 60 * 60_000

export interface Stay {
  /** The booking reference the hold belongs to. */
  ref: string
  arrival: IsoDate
  departure: IsoDate
}

/** Who is booking, kept until the hold ends so the owner can call a guest who did not finish. */
export interface HoldGuest {
  name: string
  phone: string
  email: string
  lang: Lang
  amount: number
}

export interface HoldRequest extends Stay {
  /** Cardcom's card page, to ask at expiry whether a card was saved after all. */
  cardId: string
  guest: HoldGuest
}

export interface Hold extends HoldRequest {
  expires: number
}

export interface DateHolds {
  /** Holds the stay for 15 minutes. False when another live hold has any of its nights. */
  hold(request: HoldRequest): Promise<boolean>
  /** Ends a hold that did its job (booked, refused, or replaced by a retry). It is not reported. */
  release(ref: string): Promise<void>
  /** Every held night, except those of `exceptRef`: a guest's own hold never blocks them. */
  nights(exceptRef?: string): Promise<Set<IsoDate>>
  /** Removes and returns the holds that ran out without being released. */
  takeExpired(): Promise<Hold[]>
}

const live = (h: Hold, now: number) => h.expires > now

/**
 * The holds with `request` added (or renewed), or null when another live hold overlaps it. Expired holds
 * stay in the list until `takeExpired` collects them.
 */
export function addHold(holds: Hold[], request: HoldRequest, now: number): Hold[] | null {
  const others = holds.filter((h) => h.ref !== request.ref && h.expires > now - KEEP_EXPIRED_MS)
  const overlaps = (h: Hold) => h.arrival < request.departure && request.arrival < h.departure
  if (others.some((h) => live(h, now) && overlaps(h))) return null
  return [...others, { ...request, expires: now + HOLD_MS }]
}

export function heldNights(holds: Hold[], now: number, exceptRef?: string): Set<IsoDate> {
  const nights = new Set<IsoDate>()
  for (const h of holds) {
    if (live(h, now) && h.ref !== exceptRef) eachNight(h.arrival, h.departure).forEach((n) => nights.add(n))
  }
  return nights
}

/** Splits the holds into those that ran out and those still running. */
export function splitExpired(holds: Hold[], now: number): { expired: Hold[]; kept: Hold[] } {
  return { expired: holds.filter((h) => !live(h, now)), kept: holds.filter((h) => live(h, now)) }
}

/**
 * Holds in this process's memory: right for the Node server, which is one process. A Worker runs as many
 * instances, so it keeps them in a Durable Object instead (worker/holds.ts).
 */
export function createMemoryHolds(now: () => number = Date.now): DateHolds {
  let holds: Hold[] = []
  return {
    async hold(request) {
      const next = addHold(holds, request, now())
      if (!next) return false
      holds = next
      return true
    },
    async release(ref) {
      holds = holds.filter((h) => h.ref !== ref)
    },
    async nights(exceptRef) {
      return heldNights(holds, now(), exceptRef)
    },
    async takeExpired() {
      const { expired, kept } = splitExpired(holds, now())
      holds = kept
      return expired
    },
  }
}
