import { beforeEach, describe, expect, it } from 'vitest'
import { checkRateLimit, resetRateLimitForTests } from '../../lib/security/rate-limit'

describe('rate limiter smoke', () => {
  beforeEach(() => {
    resetRateLimitForTests()
  })

  it('allows requests under the limit and blocks once exceeded', () => {
    const opts = { windowMs: 60_000, maxAttempts: 2 }

    expect(checkRateLimit('register:1.2.3.4', opts).allowed).toBe(true)
    expect(checkRateLimit('register:1.2.3.4', opts).allowed).toBe(true)

    const blocked = checkRateLimit('register:1.2.3.4', opts)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBeGreaterThan(0)
  })
})
