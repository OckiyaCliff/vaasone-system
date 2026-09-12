/* ──────────────────────────────────────────────────────────
   Vaasone — In-memory rate limiter
   Sliding-window token bucket for public API endpoints.
   ────────────────────────────────────────────────────────── */

type RateLimitEntry = { count: number; resetAt: number }

const buckets = new Map<string, RateLimitEntry>()

/* Cleanup stale entries every 5 minutes */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(key)
    }
  }, 5 * 60_000)
}

export type RateLimitConfig = {
  windowMs: number
  maxRequests: number
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check whether a request from `identifier` is within the rate limit.
 * Returns { allowed, remaining, resetAt }.
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(identifier)

  if (!existing || existing.resetAt <= now) {
    /* New window */
    const entry: RateLimitEntry = { count: 1, resetAt: now + config.windowMs }
    buckets.set(identifier, entry)
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: entry.resetAt }
  }

  existing.count += 1
  const allowed = existing.count <= config.maxRequests
  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - existing.count),
    resetAt: existing.resetAt,
  }
}

/**
 * Extract a client identifier from the request.
 * Uses IP address or a forwarded header.
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

/**
 * Apply rate limit headers to a Response.
 */
export function applyRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Remaining', String(result.remaining))
  headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
  if (!result.allowed) {
    headers.set('Retry-After', String(Math.ceil((result.resetAt - Date.now()) / 1000)))
  }
  return new Response(response.body, {
    status: result.allowed ? response.status : 429,
    statusText: result.allowed ? response.statusText : 'Too Many Requests',
    headers,
  })
}
