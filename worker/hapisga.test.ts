import { describe, expect, it, vi } from 'vitest'
import { FRESH_MS, serveFeed, type FeedStore } from './hapisga'

const CALENDAR = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n'
const NEWER = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nSUMMARY:Closed\r\nEND:VCALENDAR\r\n'
const URL = 'https://hapisga.example/api/icalendar/token'

/** Stands in for Workers KV. */
function memoryStore(text?: string, fetchedAt = 0) {
  let entry = text === undefined ? null : { value: new TextEncoder().encode(text).buffer, fetchedAt }
  const store: FeedStore = {
    getWithMetadata: async <M>() =>
      entry
        ? { value: entry.value, metadata: { fetchedAt: entry.fetchedAt } as M }
        : { value: null, metadata: null },
    put: async (_key, value, { metadata }) => {
      entry = { value, fetchedAt: metadata.fetchedAt }
    },
  }
  return store
}

const upstream = (body: string, status = 200) => vi.fn(async () => new Response(body, { status }))
const get = (method = 'GET') => new Request('https://villetta.example/hapisga.ics', { method })

describe('hapisga feed', () => {
  it('downloads the calendar and passes it through unchanged, as text/calendar', async () => {
    const fetchFn = upstream(CALENDAR)
    const response = await serveFeed(get(), { url: URL, store: memoryStore(), fetch: fetchFn, now: () => 1 })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/calendar; charset=utf-8')
    expect(await response.text()).toBe(CALENDAR)
    expect(fetchFn).toHaveBeenCalledWith(URL, expect.objectContaining({ redirect: 'follow' }))
  })

  it('serves the stored copy without asking hapisga while it is under 5 minutes old', async () => {
    const fetchFn = upstream(NEWER)
    const store = memoryStore(CALENDAR, 1000)
    const response = await serveFeed(get(), { url: URL, store, fetch: fetchFn, now: () => 1000 + FRESH_MS - 1 })

    expect(await response.text()).toBe(CALENDAR)
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('refreshes an older copy, and stores the new one', async () => {
    const store = memoryStore(CALENDAR, 0)
    const now = () => FRESH_MS
    const first = await serveFeed(get(), { url: URL, store, fetch: upstream(NEWER), now })
    expect(await first.text()).toBe(NEWER)

    const fetchFn = upstream(CALENDAR)
    const second = await serveFeed(get(), { url: URL, store, fetch: fetchFn, now })
    expect(await second.text()).toBe(NEWER)
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it.each([
    ['an error status', upstream(CALENDAR, 500)],
    ['an HTML page', upstream('<html>maintenance</html>')],
    ['a cut-off calendar', upstream('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')],
    ['a network failure', vi.fn(async () => Promise.reject(new TypeError('fetch failed')))],
  ])('serves the last good copy when hapisga returns %s', async (_name, fetchFn) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const store = memoryStore(CALENDAR, 0)
    const response = await serveFeed(get(), { url: URL, store, fetch: fetchFn, now: () => FRESH_MS * 10 })

    expect(response.status).toBe(200)
    expect(response.headers.get('x-feed-source')).toBe('stale')
    expect(await response.text()).toBe(CALENDAR)
  })

  it('answers 502 when hapisga fails and there is no copy yet', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const response = await serveFeed(get(), { url: URL, store: memoryStore(), fetch: upstream('', 503) })
    expect(response.status).toBe(502)
  })

  it('answers HEAD with the same headers and no body', async () => {
    const response = await serveFeed(get('HEAD'), { url: URL, store: memoryStore(CALENDAR, 0), now: () => 1 })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/calendar; charset=utf-8')
    expect(await response.text()).toBe('')
  })

  it('refuses other methods', async () => {
    const response = await serveFeed(get('POST'), { url: URL, store: memoryStore() })
    expect(response.status).toBe(405)
  })
})
