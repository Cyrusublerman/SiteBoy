import { describe, expect, it, vi } from 'vitest';
import {
  REQUIRED_ENVIRONMENT,
  inspectDatabase,
  inspectEnvironment,
  inspectHealth,
} from '../scripts/admin/check-production-readiness.mjs';

function completeEnvironment(overrides = {}) {
  return {
    POSTGRES_URL: 'postgres://example',
    DATABASE_URL: 'postgres://example',
    ADMIN_PASSWORD_HASH: '$argon2id$example',
    CSRF_SECRET: 'c'.repeat(48),
    AUTH_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
    CRON_SECRET: 'r'.repeat(48),
    R2_ENDPOINT: 'https://account.r2.cloudflarestorage.com',
    R2_ACCESS_KEY_ID: 'access',
    R2_SECRET_ACCESS_KEY: 'secret',
    R2_BUCKET: 'media',
    R2_PUBLIC_BASE: 'https://media.example.test',
    SITE_ORIGIN: 'https://site.example.test',
    ...overrides,
  };
}

describe('production readiness environment checks', () => {
  it('accepts a complete configuration without revealing values', () => {
    const env = completeEnvironment();
    const result = inspectEnvironment(env);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.configured).toHaveLength(REQUIRED_ENVIRONMENT.length);
    expect(JSON.stringify(result)).not.toContain(env.R2_SECRET_ACCESS_KEY);
  });

  it('reports missing and malformed values', () => {
    const result = inspectEnvironment(completeEnvironment({
      CSRF_SECRET: 'short',
      ADMIN_PASSWORD_HASH: 'plaintext',
      R2_ENDPOINT: 'not-a-url',
      POSTGRES_URL: '',
    }));
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'POSTGRES_URL is missing',
      'ADMIN_PASSWORD_HASH is not an Argon2 hash',
      'CSRF_SECRET must contain at least 32 characters',
      'R2_ENDPOINT is not a valid URL',
    ]));
  });
});

describe('production readiness external checks', () => {
  it('requires all migrated tables and the seeded administrator', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [{
        users_exists: true,
        sessions_exists: true,
        gallery_items_exists: true,
        media_uploads_exists: true,
        audit_log_exists: true,
        login_attempts_exists: true,
        recovery_codes_exists: true,
        schema_migrations_exists: true,
        totp_secret_enc_exists: true,
        session_last_seen_exists: true,
        admin_exists: true,
      }],
    });
    const result = await inspectDatabase(query);
    expect(result.ok).toBe(true);
    expect(Object.values(result.checks)).not.toContain(false);
  });

  it('reports a missing migration without exposing database content', async () => {
    const result = await inspectDatabase(vi.fn().mockResolvedValue({
      rows: [{
        users_exists: true,
        sessions_exists: true,
        gallery_items_exists: true,
        media_uploads_exists: true,
        audit_log_exists: true,
        login_attempts_exists: false,
        recovery_codes_exists: true,
        schema_migrations_exists: true,
        totp_secret_enc_exists: true,
        session_last_seen_exists: true,
        admin_exists: true,
      }],
    }));
    expect(result.ok).toBe(false);
    expect(result.checks.loginAttempts).toBe(false);
  });

  it('checks the deployed health endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ ok: true, build: 'abc123' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ));
    await expect(inspectHealth('https://site.example.test', fetchImpl)).resolves.toEqual({
      ok: true,
      status: 200,
      build: 'abc123',
    });
  });
});
