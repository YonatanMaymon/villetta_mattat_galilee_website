/**
 * `/hapisga.ics`: the villa's calendar on hapisga, republished from our own domain so Smoobu can import
 * it (Smoobu imports it fine from here). The body is passed through byte for byte.
 *
 * The last good copy is kept in Workers KV, which outlives any one Worker instance. It is served as is
 * for 5 minutes, and after that whenever hapisga is down or answers with something that is not a
 * calendar: an old calendar is better for Smoobu than an error, which it may read as "no bookings".
 */

// Minimal shape of the KV binding, declared here so no extra types package is needed.
export interface FeedStore {
  getWithMetadata<M>(
    key: string,
    type: 'arrayBuffer',
  ): Promise<{ value: ArrayBuffer | null; metadata: M | null }>
  put(key: string, value: ArrayBuffer, options: { metadata: CopyMetadata }): Promise<void>
}

interface CopyMetadata {
  /** When the copy was downloaded, in ms since the epoch. */
  fetchedAt: number
}

export interface FeedOptions {
  /** The hapisga export link (HAPISGA_ICAL_URL). It holds a secret token, so it is never logged. */
  url?: string
  store: FeedStore
  fetch?: typeof fetch
  now?: () => number
  /** Lets the KV write finish after the response is sent. */
  waitUntil?: (promise: Promise<unknown>) => void
}

export const FEED_PATH = '/hapisga.ics'
export const FRESH_MS = 5 * 60 * 1000
const TIMEOUT_MS = 15_000
const KEY = 'last-good'

const HEADERS = { 'content-type': 'text/calendar; charset=utf-8' }

/** A calendar, not an error page: the body starts with BEGIN:VCALENDAR and has the closing line too. */
function isCalendar(body: ArrayBuffer): boolean {
  const text = new TextDecoder().decode(body)
  return text.startsWith('BEGIN:VCALENDAR') && text.includes('END:VCALENDAR')
}

async function download(url: string, fetchFn: typeof fetch): Promise<ArrayBuffer | string> {
  try {
    const response = await fetchFn(url, { redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (response.status !== 200) return `status ${response.status}`
    const body = await response.arrayBuffer()
    return isCalendar(body) ? body : 'not a calendar'
  } catch (error) {
    return error instanceof Error ? error.name : 'fetch failed'
  }
}

export async function serveFeed(request: Request, options: FeedOptions): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } })
  }
  const now = options.now ?? Date.now
  const reply = (body: ArrayBuffer, source: string) =>
    new Response(request.method === 'HEAD' ? null : body, { headers: { ...HEADERS, 'x-feed-source': source } })

  const copy = await options.store.getWithMetadata<CopyMetadata>(KEY, 'arrayBuffer')
  const age = copy.metadata ? now() - copy.metadata.fetchedAt : Infinity
  if (copy.value && age < FRESH_MS) return reply(copy.value, 'cache')

  const result = options.url ? await download(options.url, options.fetch ?? fetch) : 'HAPISGA_ICAL_URL not set'
  if (typeof result !== 'string') {
    const write = options.store.put(KEY, result, { metadata: { fetchedAt: now() } })
    if (options.waitUntil) options.waitUntil(write)
    else await write
    return reply(result, 'upstream')
  }

  // Shows in `wrangler tail`, so a hapisga outage is noticed rather than hidden behind the old copy.
  console.warn(`hapisga feed: upstream failed (${result}); ${copy.value ? 'serving the last good copy' : 'no copy yet'}`)
  if (copy.value) return reply(copy.value, 'stale')
  return new Response('Calendar temporarily unavailable', { status: 502 })
}
