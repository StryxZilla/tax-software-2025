export interface RateLimitOptions {
  windowMs: number
  maxAttempts: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateLimitEntry>()

export function checkRateLimit(key: string, options: RateLimitOptions): {
  allowed: boolean
  remaining: number
  retryAfterMs: number
} {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now >= existing.resetAt) {
    const nextEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + options.windowMs,
    }
    buckets.set(key, nextEntry)
    return {
      allowed: true,
      remaining: Math.max(0, options.maxAttempts - 1),
      retryAfterMs: 0,
    }
  }

  if (existing.count >= options.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    }
  }

  existing.count += 1
  buckets.set(key, existing)

  return {
    allowed: true,
    remaining: Math.max(0, options.maxAttempts - existing.count),
    retryAfterMs: 0,
  }
}

export function resetRateLimitForTests() {
  buckets.clear()
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  return 'unknown'
}
