/**
 * Best-effort sliding-window limiter kept in memory. On serverless hosts each instance has its own
 * counters, so this only slows down casual abuse; the honeypot and validation do the rest.
 */
export function createRateLimiter({ limit, windowMs, now = Date.now }: { limit: number; windowMs: number; now?: () => number }) {
  const hits = new Map<string, number[]>()

  return function allow(key: string): boolean {
    const current = now()
    const recent = (hits.get(key) ?? []).filter((time) => current - time < windowMs)
    if (recent.length >= limit) {
      hits.set(key, recent)
      return false
    }
    recent.push(current)
    hits.set(key, recent)

    // Keep the map from growing without bound.
    if (hits.size > 5_000) {
      for (const [ip, times] of hits) if (times.every((time) => current - time >= windowMs)) hits.delete(ip)
    }
    return true
  }
}
