import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearCsrf,
  issueCsrf,
  verifyCsrf,
} from '../api/_lib/session.js';
import { createAdminAuthoriser } from '../api/_lib/auth.js';

const ORIGINAL_CSRF_SECRET = process.env.CSRF_SECRET;
const ORIGINAL_ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

describe('serverless-safe CSRF tokens', () => {
  beforeEach(() => {
    process.env.CSRF_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
    delete process.env.ADMIN_PASSWORD_HASH;
  });

  afterEach(() => {
    if (ORIGINAL_CSRF_SECRET == null) delete process.env.CSRF_SECRET;
    else process.env.CSRF_SECRET = ORIGINAL_CSRF_SECRET;
    if (ORIGINAL_ADMIN_PASSWORD_HASH == null) delete process.env.ADMIN_PASSWORD_HASH;
    else process.env.ADMIN_PASSWORD_HASH = ORIGINAL_ADMIN_PASSWORD_HASH;
  });

  it('is deterministic across independent serverless invocations', () => {
    const first = issueCsrf('session-123');
    clearCsrf('session-123');
    const second = issueCsrf('session-123');
    expect(second).toBe(first);
    expect(verifyCsrf('session-123', first)).toBe(true);
  });

  it('binds a token to one session', () => {
    const token = issueCsrf('session-a');
    expect(verifyCsrf('session-b', token)).toBe(false);
  });

  it('rejects missing and modified tokens', () => {
    const token = issueCsrf('session-123');
    expect(verifyCsrf('session-123', null)).toBe(false);
    expect(verifyCsrf('session-123', `${token}x`)).toBe(false);
  });

  it('can temporarily derive the CSRF key from the configured Argon2 hash', () => {
    delete process.env.CSRF_SECRET;
    process.env.ADMIN_PASSWORD_HASH = '$argon2id$v=19$m=19456,t=2,p=1$example-salt$example-hash-value-long-enough';
    const token = issueCsrf('session-fallback');
    expect(verifyCsrf('session-fallback', token)).toBe(true);
  });

  it('fails closed when no sufficiently strong secret is configured', () => {
    delete process.env.CSRF_SECRET;
    delete process.env.ADMIN_PASSWORD_HASH;
    expect(() => issueCsrf('session-123')).toThrow(/CSRF_SECRET/);
  });
});

describe('admin authorisation', () => {
  it('uses explicit test injection without a deployable environment bypass', async () => {
    const authenticate = vi.fn().mockResolvedValue({
      session: { id: 'test-session' },
      user: { id: 'injected-admin' },
    });
    const authorise = createAdminAuthoriser(authenticate);

    await expect(authorise(new Request('https://site.test'))).resolves.toEqual({
      userId: 'injected-admin',
    });
    expect(authenticate).toHaveBeenCalledTimes(1);
  });

  it('preserves the authentication error response status', async () => {
    const error = Response.json({ error: 'CSRF token invalid' }, { status: 403 });
    const authorise = createAdminAuthoriser(vi.fn().mockResolvedValue({ error }));

    const result = await authorise(new Request('https://site.test'));
    expect(result.error.status).toBe(403);
  });
});
