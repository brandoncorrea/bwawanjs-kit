const DEFAULT_WINDOW_MS = 30 * 60 * 1000
const DEFAULT_MAX_REQUESTS = 5
const DEFAULT_CLEANUP_INTERVAL_MS = 60 * 60 * 1000

function isEntryExpired(entry, windowMs) {
  return Date.now() - entry?.windowStart > windowMs
}

export class RateLimiter {
  constructor({
    windowMs = DEFAULT_WINDOW_MS,
    maxRequests = DEFAULT_MAX_REQUESTS,
    cleanupIntervalMs = DEFAULT_CLEANUP_INTERVAL_MS
  } = {}) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    this.cleanupIntervalMs = cleanupIntervalMs
    this.entries = new Map()
  }

  start() {
    if (this.cleanupTimer) return this
    this.cleanupTimer = setInterval(() => this.cleanup(), this.cleanupIntervalMs)
    return this
  }

  stop() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      delete this.cleanupTimer
    }
    this.entries.clear()
    return this
  }

  getEntry(key) {
    const entry = this.entries.get(key)
    if (!isEntryExpired(entry, this.windowMs))
      return entry
  }

  isLimited(key) {
    return this.getEntry(key)?.count >= this.maxRequests
  }

  record(key) {
    const entry = this.getEntry(key)
    if (entry)
      entry.count++
    else
      this.entries.set(key, { windowStart: Date.now(), count: 1 })
  }

  cleanup() {
    for (const [key, entry] of this.entries)
      if (isEntryExpired(entry, this.windowMs))
        this.entries.delete(key)
  }
}
