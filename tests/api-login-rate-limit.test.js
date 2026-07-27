import { describe, expect, it, vi } from 'vitest';
import {
  GLOBAL_MAX_ATTEMPTS,
  PER_IP_MAX_ATTEMPTS,
  createRateLimiter,
  hashIp,
} from '../api/_lib/rate-limit.js';

describe('distributed login rate limiter', () => {
  it('hashes equivalent client identities deterministically', () => {
    expect(hashIp(' 203.0.113.1 ')).toBe(hashIp('203.0.113.1'));
    expect(hashIp('203.0.113.1')).not.toContain('203.0.113.1');
    expect(hashIp(null)).toBe(hashIp('unknown'));
  });

  it('allows requests below both limits', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [{ ip_count: '2', global_count: '7' }],
    });
    const limiter = createRateLimiter({ query, now: () => 1_700_000_000_000 });
    const result = await limiter.checkRateLimit('203.0.113.2');
    expect(result).toMatchObject({
      allowed: true,
      scope: null,
      ipCount: 2,
      globalCount: 7,
    });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('blocks the per-IP threshold', async () => {
    const limiter = createRateLimiter({
      query: vi.fn().mockResolvedValue({
        rows: [{ ip_count: String(PER_IP_MAX_ATTEMPTS), global_count: '7' }],
      }),
    });
    expect(await limiter.checkRateLimit('203.0.113.3')).toMatchObject({
      allowed: false,
      scope: 'ip',
      remaining: 0,
    });
  });

  it('blocks the global threshold before the per-IP threshold', async () => {
    const limiter = createRateLimiter({
      query: vi.fn().mockResolvedValue({
        rows: [{ ip_count: '1', global_count: String(GLOBAL_MAX_ATTEMPTS) }],
      }),
    });
    expect(await limiter.checkRateLimit('203.0.113.4')).toMatchObject({
      allowed: false,
      scope: 'global',
      remaining: 0,
    });
  });

  it('stores and clears only hashed client identifiers', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const limiter = createRateLimiter({ query, now: () => 1_700_000_000_000 });
    const ip = '203.0.113.5';
    const expectedHash = hashIp(ip);

    await limiter.recordFailedAttempt(ip);
    await limiter.clearAttempts(ip);

    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO login_attempts'),
      [expectedHash, expect.any(Date)],
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      'DELETE FROM login_attempts WHERE ip_hash = $1',
      [expectedHash],
    );
    expect(JSON.stringify(query.mock.calls)).not.toContain(ip);
  });

  it('propagates database failures so login can fail closed', async () => {
    const limiter = createRateLimiter({
      query: vi.fn().mockRejectedValue(new Error('database unavailable')),
    });
    await expect(limiter.checkRateLimit('203.0.113.6')).rejects.toThrow('database unavailable');
  });
});
