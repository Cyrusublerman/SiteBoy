/** Simple in-memory login rate limiter (per IP, 10 min window). */
const attempts = new Map();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function checkRateLimit(ip) {
  const key = ip || 'unknown';
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { windowStart: now, count: 0 });
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

export function recordFailedAttempt(ip) {
  const key = ip || 'unknown';
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { windowStart: now, count: 1 });
    return;
  }

  entry.count += 1;
}

export function clearAttempts(ip) {
  attempts.delete(ip || 'unknown');
}
