import { createHash } from 'node:crypto';
import { sql } from './db.js';

export const PER_IP_WINDOW_MS = 10 * 60 * 1000;
export const PER_IP_MAX_ATTEMPTS = 5;
export const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
export const GLOBAL_MAX_ATTEMPTS = 20;
export const RETENTION_MS = 24 * 60 * 60 * 1000;

export function hashIp(ip) {
  return createHash('sha256')
    .update(String(ip || 'unknown').trim().toLowerCase())
    .digest('hex');
}

function numericCount(value) {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
}

export function createRateLimiter({
  query = (text, params) => sql.query(text, params),
  now = () => Date.now(),
} = {}) {
  async function checkRateLimit(ip) {
    const current = now();
    const ipHash = hashIp(ip);
    const perIpStart = new Date(current - PER_IP_WINDOW_MS);
    const globalStart = new Date(current - GLOBAL_WINDOW_MS);

    const result = await query(
      `SELECT
         COUNT(*) FILTER (
           WHERE ip_hash = $1 AND attempted_at >= $2
         ) AS ip_count,
         COUNT(*) FILTER (
           WHERE attempted_at >= $3
         ) AS global_count
       FROM login_attempts
       WHERE attempted_at >= $3`,
      [ipHash, perIpStart, globalStart],
    );

    const row = result.rows?.[0] || {};
    const ipCount = numericCount(row.ip_count);
    const globalCount = numericCount(row.global_count);
    const ipAllowed = ipCount < PER_IP_MAX_ATTEMPTS;
    const globalAllowed = globalCount < GLOBAL_MAX_ATTEMPTS;

    return {
      allowed: ipAllowed && globalAllowed,
      scope: !globalAllowed ? 'global' : (!ipAllowed ? 'ip' : null),
      remaining: Math.max(0, Math.min(
        PER_IP_MAX_ATTEMPTS - ipCount,
        GLOBAL_MAX_ATTEMPTS - globalCount,
      )),
      retryAfterSeconds: Math.ceil(
        (!globalAllowed ? GLOBAL_WINDOW_MS : PER_IP_WINDOW_MS) / 1000,
      ),
      ipCount,
      globalCount,
    };
  }

  async function recordFailedAttempt(ip) {
    const ipHash = hashIp(ip);
    const cutoff = new Date(now() - RETENTION_MS);
    await query(
      `WITH inserted AS (
         INSERT INTO login_attempts (ip_hash)
         VALUES ($1)
         RETURNING id
       )
       DELETE FROM login_attempts
       WHERE attempted_at < $2`,
      [ipHash, cutoff],
    );
  }

  async function clearAttempts(ip) {
    await query(
      'DELETE FROM login_attempts WHERE ip_hash = $1',
      [hashIp(ip)],
    );
  }

  return {
    checkRateLimit,
    recordFailedAttempt,
    clearAttempts,
  };
}

const limiter = createRateLimiter();

export const checkRateLimit = limiter.checkRateLimit;
export const recordFailedAttempt = limiter.recordFailedAttempt;
export const clearAttempts = limiter.clearAttempts;
