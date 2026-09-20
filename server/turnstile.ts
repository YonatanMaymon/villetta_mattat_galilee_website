const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TIMEOUT_MS = 8_000

/**
 * Cloudflare Turnstile: proves a booking came from a real browser rather than a script. Without it,
 * anyone can POST a booking and block real dates in the Smoobu calendar, since nothing is charged and
 * no address is verified.
 *
 * With no secret configured (local development, and any deploy before the keys are set) verification is
 * skipped, so the booking flow keeps working; `createApp` warns once at startup.
 */
export interface TurnstileVerifier {
  /** True when the visitor may proceed. */
  (token: string | undefined, ip: string | undefined): Promise<boolean>
}

/** Always passes. Used when TURNSTILE_SECRET is not set. */
export const skipTurnstile: TurnstileVerifier = async () => true

export function createTurnstileVerifier(secret: string, fetchImpl: typeof fetch = fetch): TurnstileVerifier {
  return async (token, ip) => {
    if (!token) return false

    const body = new FormData()
    body.append('secret', secret)
    body.append('response', token)
    // Optional, and helps Cloudflare score the request; 'unknown' from our own header is not worth sending.
    if (ip && ip !== 'unknown') body.append('remoteip', ip)

    try {
      const response = await fetchImpl(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(TIMEOUT_MS) })
      if (!response.ok) return false
      const json = (await response.json().catch(() => null)) as { success?: boolean } | null
      return json?.success === true
    } catch {
      // Cloudflare unreachable. Refuse rather than wave the booking through: a failure here is rare, and
      // the guest is shown the phone number.
      return false
    }
  }
}
