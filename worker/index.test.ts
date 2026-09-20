import type { ExecutionContext } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import worker from './index'

/** Stands in for Cloudflare's static-asset binding. */
const assets = (body = 'the prerendered page') => ({
  fetch: vi.fn(async () => new Response(body, { status: 200, headers: { 'content-type': 'text/html' } })),
})

const ctx = {} as ExecutionContext
const get = (path: string) => new Request(`https://villetta.example${path}`)

describe('worker routing', () => {
  it('serves non-API paths from the static assets, without running the API', async () => {
    const ASSETS = assets()
    const response = await worker.fetch(get('/en/gallery'), { ASSETS }, ctx)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('the prerendered page')
    expect(ASSETS.fetch).toHaveBeenCalledOnce()
  })

  it('sends /api/* to the booking API rather than the assets', async () => {
    const ASSETS = assets()
    // No Smoobu credentials and no iCal URL: the API must report the calendar as unavailable...
    const response = await worker.fetch(get('/api/availability'), { ASSETS }, ctx)

    expect(ASSETS.fetch).not.toHaveBeenCalled()
    expect(response.status).toBe(503)
    // ...never invented availability, which is what the local demo mode would have produced.
    expect(await response.json()).toEqual({ error: 'calendar_unavailable' })
  })

  it('answers 404 when the asset binding is missing', async () => {
    const response = await worker.fetch(get('/'), {}, ctx)
    expect(response.status).toBe(404)
  })
})
