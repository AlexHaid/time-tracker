/**
 * Simple in-memory rate limiter.
 * Limits login attempts per IP to prevent brute-force attacks.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, RateLimitEntry>();

/** Max login attempts per window */
const MAX_ATTEMPTS = 10;
/** Time window in milliseconds (15 minutes) */
const WINDOW_MS = 15 * 60 * 1000;

/** Clean up expired entries every 10 minutes */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (now > entry.resetAt) {
      attempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Check if a request from the given key (IP) is rate-limited.
 * Returns { allowed: boolean, retryAfterMs: number }
 */
export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  entry.count++;

  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  return { allowed: true, retryAfterMs: 0 };
}
