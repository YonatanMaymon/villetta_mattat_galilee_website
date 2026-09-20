import { describe, expect, it, vi } from 'vitest'
import { createTurnstileVerifier, skipTurnstile } from './turnstile'

const respond = (body: unknown, status = 200) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }))

describe('createTurnstileVerifier', () => {
  it('accepts a token Cloudflare says is good', async () => {
    const verify = createTurnstileVerifier('secret', respond({ success: true }) as unknown as typeof fetch)
    expect(await verify('good-token', '203.0.113.1')).toBe(true)
  })

  it('sends the secret, the token and the caller address', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ success: true })))
    const verify = createTurnstileVerifier('the-secret', fetchImpl as unknown as typeof fetch)
    await verify('the-token', '203.0.113.1')

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    const form = init.body as FormData
    expect(form.get('secret')).toBe('the-secret')
    expect(form.get('response')).toBe('the-token')
    expect(form.get('remoteip')).toBe('203.0.113.1')
  })

  it('omits an unknown caller address rather than sending the word "unknown"', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ success: true })))
    const verify = createTurnstileVerifier('s', fetchImpl as unknown as typeof fetch)
    await verify('t', 'unknown')

    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect((init.body as FormData).get('remoteip')).toBeNull()
  })

  it('refuses a missing token without calling Cloudflare', async () => {
    const fetchImpl = respond({ success: true })
    const verify = createTurnstileVerifier('secret', fetchImpl as unknown as typeof fetch)
    expect(await verify(undefined, undefined)).toBe(false)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('refuses a token Cloudflare rejects', async () => {
    const verify = createTurnstileVerifier('secret', respond({ success: false, 'error-codes': ['invalid-input-response'] }) as unknown as typeof fetch)
    expect(await verify('bad-token', undefined)).toBe(false)
  })

  it('refuses rather than waving through when Cloudflare errors or is unreachable', async () => {
    const erroring = createTurnstileVerifier('secret', respond({}, 500) as unknown as typeof fetch)
    expect(await erroring('token', undefined)).toBe(false)

    const offline = createTurnstileVerifier('secret', (async () => {
      throw new TypeError('network down')
    }) as unknown as typeof fetch)
    expect(await offline('token', undefined)).toBe(false)
  })
})

describe('skipTurnstile', () => {
  it('passes anything, for local development with no keys', async () => {
    expect(await skipTurnstile(undefined, undefined)).toBe(true)
  })
})
