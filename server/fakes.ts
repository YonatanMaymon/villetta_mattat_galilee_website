import { addDays, eachNight, isRangeFree, type IsoDate } from '../shared/dates'
import { PmsRejectedError, PmsUnavailableError, type NewReservation, type PropertyManagement, type Quote } from './pms'

/**
 * An in-memory Smoobu for local development and tests. It exposes switches that make the real thing
 * misbehave, so every failure path of the booking flow can be exercised without an account.
 */
export interface FakePms extends PropertyManagement {
  reservations: (NewReservation & { id: string })[]
  /** Nights blocked outside the website: owner blocks, Airbnb bookings. */
  blocked: Set<IsoDate>
  mode: {
    create: 'ok' | 'reject' | 'down'
    read: 'ok' | 'down'
  }
}

export function createFakePms(
  options: {
    blocked?: Iterable<IsoDate>
    nightlyPrice?: (night: IsoDate) => number
    /** Total for a whole stay; takes precedence over `nightlyPrice`. */
    price?: (arrival: IsoDate, departure: IsoDate) => number
  } = {},
): FakePms {
  const nightlyPrice = options.nightlyPrice ?? (() => 2200)
  let nextId = 1000

  const pms: FakePms = {
    reservations: [],
    blocked: new Set(options.blocked),
    mode: { create: 'ok', read: 'ok' },

    async getBusyNights({ from, until }) {
      if (pms.mode.read === 'down') throw new PmsUnavailableError('fake Smoobu is down')
      const busy = new Set<IsoDate>()
      const consider = (night: IsoDate) => night >= from && night <= until && busy.add(night)
      pms.blocked.forEach(consider)
      for (const r of pms.reservations) eachNight(r.arrival, r.departure).forEach(consider)
      return busy
    },

    async quote(arrival, departure): Promise<Quote> {
      if (pms.mode.read === 'down') throw new PmsUnavailableError('fake Smoobu is down')
      if (!isRangeFree(await taken(), arrival, departure)) return { available: false, reason: 'dates_unavailable' }
      const amount =
        options.price?.(arrival, departure) ??
        eachNight(arrival, departure).reduce((sum, night) => sum + nightlyPrice(night), 0)
      return { available: true, amount, currency: 'ILS' }
    },

    async createReservation(reservation) {
      if (pms.mode.create === 'down') throw new PmsUnavailableError('fake Smoobu is down')
      if (pms.mode.create === 'reject' || !isRangeFree(await taken(), reservation.arrival, reservation.departure)) {
        throw new PmsRejectedError('dates are not available')
      }
      const id = String(nextId++)
      pms.reservations.push({ ...reservation, id })
      return id
    },

    async findByReference(ref) {
      return pms.reservations.find((r) => r.ref === ref)?.id ?? null
    },
  }

  async function taken() {
    return pms.getBusyNights({ from: '2000-01-01', until: addDays('2099-01-01', 0) })
  }

  return pms
}

/**
 * Demo availability for a site running with no Smoobu credentials at all: a repeating pattern of booked
 * nights so the calendar visibly has gaps to pick from.
 */
export function demoPms(today: IsoDate): FakePms {
  const blocked: IsoDate[] = []
  for (let offset = 3; offset < 240; offset += 11) {
    blocked.push(addDays(today, offset), addDays(today, offset + 1))
  }
  return createFakePms({ blocked, nightlyPrice: () => 2200 })
}
