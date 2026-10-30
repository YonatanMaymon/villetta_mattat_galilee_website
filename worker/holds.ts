import { addHold, heldNights, splitExpired, type DateHolds, type Hold, type HoldRequest } from '../server/holds'

/**
 * The website's date holds (server/holds.ts) in a Durable Object: one instance for the whole site, so every
 * Worker instance sees the same holds, and one request at a time, so two guests cannot both take the same
 * nights. Kept in its storage, which outlives the object being put to sleep.
 */

// Minimal shapes of the Durable Object bindings, declared here so no extra types package is needed.
interface HoldStorage {
  get<T>(key: string): Promise<T | undefined>
  put<T>(key: string, value: T): Promise<void>
}

interface DurableObjectState {
  storage: HoldStorage
}

interface DurableObjectStub {
  fetch(request: Request): Promise<Response>
}

export interface HoldsNamespace {
  idFromName(name: string): unknown
  get(id: unknown): DurableObjectStub
}

type Command =
  | { action: 'hold'; request: HoldRequest }
  | { action: 'release'; ref: string }
  | { action: 'nights'; exceptRef?: string }
  | { action: 'takeExpired' }

export class DateHoldsObject {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const command = (await request.json()) as Command
    const now = Date.now()
    const holds = (await this.state.storage.get<Hold[]>('holds')) ?? []

    switch (command.action) {
      case 'hold': {
        const next = addHold(holds, command.request, now)
        if (next) await this.state.storage.put('holds', next)
        return Response.json({ ok: next !== null })
      }
      case 'release':
        await this.state.storage.put(
          'holds',
          holds.filter((h) => h.ref !== command.ref),
        )
        return Response.json({ ok: true })
      case 'nights':
        return Response.json({ nights: [...heldNights(holds, now, command.exceptRef)] })
      case 'takeExpired': {
        const { expired, kept } = splitExpired(holds, now)
        if (expired.length) await this.state.storage.put('holds', kept)
        return Response.json({ expired })
      }
    }
  }
}

/** The app's view of the Durable Object. */
export function durableHolds(namespace: HoldsNamespace): DateHolds {
  async function call<T>(command: Command): Promise<T> {
    const stub = namespace.get(namespace.idFromName('holds'))
    const response = await stub.fetch(
      new Request('https://holds/', { method: 'POST', body: JSON.stringify(command) }),
    )
    if (!response.ok) throw new Error(`date holds answered ${response.status}`)
    return (await response.json()) as T
  }

  return {
    hold: async (request) => (await call<{ ok: boolean }>({ action: 'hold', request })).ok,
    release: async (ref) => {
      await call({ action: 'release', ref })
    },
    nights: async (exceptRef) => new Set((await call<{ nights: string[] }>({ action: 'nights', exceptRef })).nights),
    takeExpired: async () => (await call<{ expired: Hold[] }>({ action: 'takeExpired' })).expired,
  }
}
