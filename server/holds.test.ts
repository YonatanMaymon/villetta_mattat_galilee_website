import { describe, expect, it } from 'vitest'
import { DateHoldsObject, durableHolds, type HoldsNamespace } from '../worker/holds'
import { createMemoryHolds, HOLD_MS, type DateHolds } from './holds'

const GUEST = { name: 'Dana', phone: '052-1234567', email: 'dana@example.com', lang: 'he' as const, amount: 6600 }
const STAY = { ref: 'AAA', arrival: '2026-11-10', departure: '2026-11-13', cardId: 'lp-1', guest: GUEST }
const stay = (ref: string, arrival: string, departure: string) => ({ ...STAY, ref, arrival, departure })

/** The same rules, run against both stores. */
function behavesAsHolds(make: (now: () => number) => DateHolds) {
  it('holds the nights, refuses an overlap, and lets the next arrival in on the departure day', async () => {
    const holds = make(() => 0)
    expect(await holds.hold(STAY)).toBe(true)
    expect([...(await holds.nights())].sort()).toEqual(['2026-11-10', '2026-11-11', '2026-11-12'])
    expect(await holds.hold(stay('BBB', '2026-11-12', '2026-11-14'))).toBe(false)
    expect(await holds.hold(stay('CCC', '2026-11-13', '2026-11-15'))).toBe(true)
  })

  it('never blocks the guest holding the nights', async () => {
    const holds = make(() => 0)
    await holds.hold(STAY)
    expect((await holds.nights('AAA')).size).toBe(0)
    // Renewing one's own hold is fine.
    expect(await holds.hold(STAY)).toBe(true)
  })

  it('lets go after 15 minutes, and hands the expired hold over once for the follow-up', async () => {
    let now = 0
    const holds = make(() => now)
    await holds.hold(STAY)
    expect(await holds.takeExpired()).toEqual([])

    now = HOLD_MS + 1
    expect((await holds.nights()).size).toBe(0)
    expect(await holds.hold(stay('BBB', '2026-11-10', '2026-11-12'))).toBe(true)
    expect((await holds.takeExpired()).map((h) => h.ref)).toEqual(['AAA'])
    expect(await holds.takeExpired()).toEqual([])
  })

  it('does not report a released hold', async () => {
    let now = 0
    const holds = make(() => now)
    await holds.hold(STAY)
    await holds.release('AAA')
    now = HOLD_MS + 1
    expect(await holds.takeExpired()).toEqual([])
  })
}

describe('memory holds', () => behavesAsHolds((now) => createMemoryHolds(now)))

describe('Durable Object holds', () => {
  // The object reads the real clock, so this only checks it applies the same rules over its storage.
  const make = () => {
    const data = new Map<string, unknown>()
    const storage = {
      get: async <T,>(key: string) => data.get(key) as T | undefined,
      put: async <T,>(key: string, value: T) => {
        data.set(key, value)
      },
    }
    const object = new DateHoldsObject({ storage })
    const namespace: HoldsNamespace = { idFromName: (name) => name, get: () => object }
    return durableHolds(namespace)
  }

  it('holds the nights and refuses an overlap', async () => {
    const holds = make()
    expect(await holds.hold(STAY)).toBe(true)
    expect(await holds.hold(stay('BBB', '2026-11-12', '2026-11-14'))).toBe(false)
    expect((await holds.nights('AAA')).size).toBe(0)
    expect((await holds.nights()).size).toBe(3)
    expect(await holds.takeExpired()).toEqual([])
    await holds.release('AAA')
    expect((await holds.nights()).size).toBe(0)
  })
})
