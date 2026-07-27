import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMfaService,
  createTotp,
  decryptTotpSecret,
  encryptTotpSecret,
  verifyTotp,
} from '../api/_lib/mfa.js';

const ORIGINAL_KEY = process.env.AUTH_ENCRYPTION_KEY;
const NOW = Date.parse('2026-07-23T00:00:00Z');

function mfaFixture() {
  const user = {
    totp_pending_secret_enc: null,
    totp_secret_enc: null,
    totp_enabled_at: null,
  };
  const recovery = [];
  let nextId = 1;
  const execute = vi.fn(async (text, params) => {
    if (text.startsWith('UPDATE users SET totp_pending')) {
      user.totp_pending_secret_enc = params[1];
      return { rows: [], rowCount: 1 };
    }
    if (text.startsWith('SELECT totp_pending')) return { rows: [user] };
    if (text.startsWith('DELETE FROM recovery_codes')) {
      recovery.length = 0;
      return { rows: [], rowCount: 0 };
    }
    if (text.startsWith('INSERT INTO recovery_codes')) {
      recovery.push({ id: nextId++, code_hash: params[1], consumed_at: null });
      return { rows: [], rowCount: 1 };
    }
    if (text.includes('SET totp_secret_enc = totp_pending')) {
      user.totp_secret_enc = user.totp_pending_secret_enc;
      user.totp_pending_secret_enc = null;
      user.totp_enabled_at = new Date(NOW);
      return { rows: [], rowCount: 1 };
    }
    if (text.startsWith('SELECT totp_secret_enc')) return { rows: [user] };
    if (text.includes('SELECT id, code_hash')) {
      return { rows: recovery.filter((entry) => !entry.consumed_at) };
    }
    if (text.includes('UPDATE recovery_codes SET consumed_at')) {
      const entry = recovery.find(({ id }) => id === params[0] && !recovery.consumed_at);
      if (!entry || entry.consumed_at) return { rows: [], rowCount: 0 };
      entry.consumed_at = new Date(NOW);
      return { rows: [{ id: entry.id }], rowCount: 1 };
    }
    throw new Error(`Unexpected query: ${text}`);
  });
  return {
    user,
    recovery,
    service: createMfaService({
      execute,
      now: () => NOW,
      hashCode: async (code) => `hash:${code}`,
      verifyHash: async (encoded, code) => encoded === `hash:${code}`,
    }),
  };
}

describe('TOTP and recovery authentication', () => {
  beforeEach(() => {
    process.env.AUTH_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
  });

  afterEach(() => {
    if (ORIGINAL_KEY == null) delete process.env.AUTH_ENCRYPTION_KEY;
    else process.env.AUTH_ENCRYPTION_KEY = ORIGINAL_KEY;
  });

  it('implements RFC 6238-compatible six-digit TOTP validation', () => {
    const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
    expect(createTotp(secret, 59_000)).toBe('287082');
    expect(verifyTotp(secret, '287082', 59_000, 0)).toBe(true);
    expect(verifyTotp(secret, '000000', 59_000, 0)).toBe(false);
  });

  it('encrypts secrets with authenticated encryption', () => {
    const encrypted = encryptTotpSecret('TOPSECRET');
    expect(encrypted).not.toContain('TOPSECRET');
    expect(decryptTotpSecret(encrypted)).toBe('TOPSECRET');
    const flipped = encrypted.endsWith('A') ? 'B' : 'A';
    expect(() => decryptTotpSecret(`${encrypted.slice(0, -1)}${flipped}`)).toThrow();
  });

  it('requires a valid TOTP before enabling and returns no TOTP secret after confirmation', async () => {
    const fixture = mfaFixture();
    const enrollment = await fixture.service.beginEnrollment('admin');
    await expect(fixture.service.confirmEnrollment('admin', '000000')).resolves.toEqual({
      ok: false,
      error: 'Invalid TOTP code',
    });
    expect(fixture.user.totp_enabled_at).toBeNull();

    const confirmed = await fixture.service.confirmEnrollment(
      'admin',
      createTotp(enrollment.secret, NOW),
    );
    expect(confirmed.ok).toBe(true);
    expect(confirmed.recoveryCodes).toHaveLength(10);
    expect(confirmed).not.toHaveProperty('secret');
    expect(fixture.user.totp_pending_secret_enc).toBeNull();
  });

  it('requires MFA at login and consumes each recovery code once', async () => {
    const fixture = mfaFixture();
    const enrollment = await fixture.service.beginEnrollment('admin');
    const confirmed = await fixture.service.confirmEnrollment(
      'admin',
      createTotp(enrollment.secret, NOW),
    );
    await expect(fixture.service.verifyLogin('admin', { totp: '000000' }))
      .resolves.toMatchObject({ ok: false, mfaRequired: true });
    await expect(fixture.service.verifyLogin('admin', {
      totp: createTotp(enrollment.secret, NOW),
    })).resolves.toMatchObject({ ok: true, mfaRequired: true });

    const recoveryCode = confirmed.recoveryCodes[0];
    await expect(fixture.service.verifyLogin('admin', { recoveryCode }))
      .resolves.toMatchObject({ ok: true, recoveryUsed: true });
    await expect(fixture.service.verifyLogin('admin', { recoveryCode }))
      .resolves.toMatchObject({ ok: false, mfaRequired: true });
  });
});
