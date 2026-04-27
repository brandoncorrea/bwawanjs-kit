import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RateLimiter } from '../src/RateLimiter.js'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('uses default values when no options provided', () => {
      const limiter = new RateLimiter()
      expect(limiter.windowMs).toBe(30 * 60 * 1000)
      expect(limiter.maxRequests).toBe(5)
      expect(limiter.cleanupIntervalMs).toBe(60 * 60 * 1000)
      expect(limiter.entries).toBeInstanceOf(Map)
      expect(limiter.cleanupTimer).toBeFalsy()
    })

    it('accepts custom options', () => {
      const limiter = new RateLimiter({
        windowMs: 1000,
        maxRequests: 3,
        cleanupIntervalMs: 2000
      })
      expect(limiter.windowMs).toBe(1000)
      expect(limiter.maxRequests).toBe(3)
      expect(limiter.cleanupIntervalMs).toBe(2000)
    })
  })

  describe('isLimited', () => {
    it('returns false when no requests have been recorded', () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 10000 })
      expect(limiter.isLimited('a')).toBe(false)
    })

    it('returns false when requests are below maxRequests', () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 10000 })
      limiter.record('a')
      limiter.record('a')
      expect(limiter.isLimited('a')).toBe(false)
    })

    it('returns true when requests reach maxRequests', () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 10000 })
      limiter.record('a')
      limiter.record('a')
      expect(limiter.isLimited('a')).toBe(true)
    })

    it('does not increment the count (read-only)', () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 10000 })
      limiter.record('a')
      expect(limiter.isLimited('a')).toBe(false)
      expect(limiter.isLimited('a')).toBe(false)
      expect(limiter.isLimited('a')).toBe(false)
      expect(limiter.entries.get('a').count).toBe(1)
    })

    it('tracks keys independently', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 10000 })
      limiter.record('a')
      expect(limiter.isLimited('a')).toBe(true)
      expect(limiter.isLimited('b')).toBe(false)
    })

    it('resets after window expires', () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 })
      limiter.record('a')
      expect(limiter.isLimited('a')).toBe(true)

      vi.advanceTimersByTime(1001)

      expect(limiter.isLimited('a')).toBe(false)
    })

    it('does not reset window at exact windowMs boundary', () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 })
      limiter.record('a')
      limiter.record('a')

      vi.advanceTimersByTime(1000)

      expect(limiter.isLimited('a')).toBe(true)
    })
  })

  describe('record', () => {
    it('creates a new entry for an unknown key', () => {
      const limiter = new RateLimiter({ windowMs: 10000 })
      limiter.record('a')
      expect(limiter.entries.has('a')).toBe(true)
      expect(limiter.entries.get('a').count).toBe(1)
    })

    it('increments count for an existing key', () => {
      const limiter = new RateLimiter({ windowMs: 10000 })
      limiter.record('a')
      limiter.record('a')
      limiter.record('a')
      expect(limiter.entries.get('a').count).toBe(3)
    })

    it('resets the window for an expired key', () => {
      const limiter = new RateLimiter({ windowMs: 1000 })
      limiter.record('a')
      limiter.record('a')
      expect(limiter.entries.get('a').count).toBe(2)

      vi.advanceTimersByTime(1001)

      limiter.record('a')
      expect(limiter.entries.get('a').count).toBe(1)
    })
  })

  describe('start', () => {
    it('sets up cleanup interval and returns this', () => {
      const limiter = new RateLimiter({ cleanupIntervalMs: 5000 })
      const result = limiter.start()
      expect(result).toBe(limiter)
      expect(limiter.cleanupTimer).not.toBeFalsy()
      limiter.stop()
    })

    it('is idempotent — calling start twice does not create a second timer', () => {
      const limiter = new RateLimiter({ cleanupIntervalMs: 5000 })
      limiter.start()
      const timer = limiter.cleanupTimer
      limiter.start()
      expect(limiter.cleanupTimer).toBe(timer)
      limiter.stop()
    })

    it('runs cleanup on the configured interval', () => {
      const limiter = new RateLimiter({
        windowMs: 1000,
        cleanupIntervalMs: 2000
      })
      limiter.start()

      limiter.record('a')
      vi.advanceTimersByTime(1001)
      expect(limiter.entries.size).toBe(1)

      vi.advanceTimersByTime(999)
      expect(limiter.entries.size).toBe(0)

      limiter.stop()
    })
  })

  describe('stop', () => {
    it('clears the timer and entries, returns this', () => {
      const limiter = new RateLimiter({ cleanupIntervalMs: 5000 })
      limiter.start()
      limiter.record('a')
      expect(limiter.entries.size).toBe(1)

      const result = limiter.stop()
      expect(result).toBe(limiter)
      expect(limiter.cleanupTimer).toBeFalsy()
      expect(limiter.entries.size).toBe(0)
    })

    it('is safe to call when not started', () => {
      const limiter = new RateLimiter()
      expect(() => limiter.stop()).not.toThrow()
      expect(limiter.cleanupTimer).toBeFalsy()
    })

    it('does not call clearInterval when no timer is active', () => {
      const limiter = new RateLimiter()
      const spy = vi.spyOn(global, 'clearInterval')
      limiter.stop()
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('cleanup', () => {
    it('removes expired entries', () => {
      const limiter = new RateLimiter({ windowMs: 1000 })
      limiter.record('expired')
      vi.advanceTimersByTime(1001)

      limiter.cleanup()
      expect(limiter.entries.has('expired')).toBe(false)
    })

    it('does not remove entries at exact windowMs boundary', () => {
      const limiter = new RateLimiter({ windowMs: 1000 })
      limiter.record('a')

      vi.advanceTimersByTime(1000)

      limiter.cleanup()
      expect(limiter.entries.has('a')).toBe(true)
    })

    it('keeps fresh entries', () => {
      const limiter = new RateLimiter({ windowMs: 5000 })
      limiter.record('fresh')
      vi.advanceTimersByTime(100)

      limiter.cleanup()
      expect(limiter.entries.has('fresh')).toBe(true)
    })

    it('handles a mix of expired and fresh entries', () => {
      const limiter = new RateLimiter({ windowMs: 1000 })
      limiter.record('old')
      vi.advanceTimersByTime(1001)
      limiter.record('new')

      limiter.cleanup()
      expect(limiter.entries.has('old')).toBe(false)
      expect(limiter.entries.has('new')).toBe(true)
    })
  })
})
