import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { query } from './db.js';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;

function encryptionKey(value = process.env.AUTH_ENCRYPTION_KEY) {
  if (!value) throw new Error('AUTH_ENCRYPTION_KEY is required');
  const text = String(value);
  const key = /^[0-9a-f]{64}$/i.test(text)
    ? Buffer.from(text, 'hex')
    : Buffer.from(text, 'base64');
  if (key.length !== 32) {
    throw new Error('AUTH_ENCRYPTION_KEY must decode to exactly 32 bytes');
  }
  return key;
}

export function encodeBase32(input) {
  const bytes = Buffer.from(input);
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];
  return output;
}

export function decodeBase32(value) {
  const clean = String(value).toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let buffer = 0;
  const bytes = [];
  for (const character of clean) {
    const index = BASE32.indexOf(character);
    if (index < 0) throw new Error('Invalid Base32 value');
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function createTotp(secret, time = Date.now()) {
  const counter = Math.floor(time / 1000 / TOTP_PERIOD_SECONDS);
  const counterBytes = Buffer.alloc(8);
  counterBytes.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', decodeBase32(secret)).update(counterBytes).digest();
  const offset = digest[digest.length - 1] & 15;
  const value = (digest.readUInt32BE(offset) & 0x7fffffff) % (10 ** TOTP_DIGITS);
  return String(value).padStart(TOTP_DIGITS, '0');
}

export function verifyTotp(secret, code, time = Date.now(), window = 1) {
  const actual = Buffer.from(String(code || ''), 'utf8');
  for (let offset = -window; offset <= window; offset += 1) {
    const expected = Buffer.from(
      createTotp(secret, time + offset * TOTP_PERIOD_SECONDS * 1000),
      'utf8',
    );
    if (actual.length === expected.length && timingSafeEqual(actual, expected)) return true;
  }
  return false;
}

export function encryptTotpSecret(secret, keyValue) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(keyValue), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
}

export function decryptTotpSecret(payload, keyValue) {
  const [version, iv, tag, ciphertext] = String(payload).split('.');
  if (version !== 'v1' || !iv || !tag || !ciphertext) {
    throw new Error('Invalid encrypted TOTP secret');
  }
  const decipher = createDecipheriv(
    'aes-256-gcm',
    encryptionKey(keyValue),
    Buffer.from(iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

export function generateRecoveryCodes(count = 10) {
  return Array.from({ length: count }, () => {
    const code = encodeBase32(randomBytes(7)).slice(0, 10);
    return `${code.slice(0, 5)}-${code.slice(5)}`;
  });
}

export function createMfaService({
  execute = query,
  now = () => Date.now(),
  hashCode = (code) => hash(code),
  verifyHash = (encoded, code) => verify(encoded, code),
} = {}) {
  return {
    async beginEnrollment(userId) {
      const secret = encodeBase32(randomBytes(20));
      await execute(
        'UPDATE users SET totp_pending_secret_enc = $2 WHERE id = $1',
        [userId, encryptTotpSecret(secret)],
      );
      const label = encodeURIComponent(`SiteBoy:${userId}`);
      const issuer = encodeURIComponent('SiteBoy');
      return {
        secret,
        uri: `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&digits=6&period=30`,
      };
    },

    async confirmEnrollment(userId, code) {
      const result = await execute(
        'SELECT totp_pending_secret_enc FROM users WHERE id = $1',
        [userId],
      );
      const encrypted = result.rows?.[0]?.totp_pending_secret_enc;
      if (!encrypted) return { ok: false, error: 'MFA enrollment not started' };
      const secret = decryptTotpSecret(encrypted);
      if (!verifyTotp(secret, code, now())) {
        return { ok: false, error: 'Invalid TOTP code' };
      }

      const recoveryCodes = generateRecoveryCodes();
      const hashes = await Promise.all(recoveryCodes.map((recoveryCode) => hashCode(recoveryCode)));
      await execute('DELETE FROM recovery_codes WHERE user_id = $1', [userId]);
      for (const codeHash of hashes) {
        await execute(
          'INSERT INTO recovery_codes (user_id, code_hash) VALUES ($1, $2)',
          [userId, codeHash],
        );
      }
      await execute(
        `UPDATE users
         SET totp_secret_enc = totp_pending_secret_enc,
             totp_pending_secret_enc = NULL,
             totp_enabled_at = NOW()
         WHERE id = $1`,
        [userId],
      );
      return { ok: true, recoveryCodes };
    },

    async verifyLogin(userId, { totp, recoveryCode } = {}) {
      const result = await execute(
        'SELECT totp_secret_enc, totp_enabled_at FROM users WHERE id = $1',
        [userId],
      );
      const user = result.rows?.[0];
      if (!user?.totp_enabled_at) return { ok: true, mfaRequired: false };

      if (totp) {
        const secret = decryptTotpSecret(user.totp_secret_enc);
        return { ok: verifyTotp(secret, totp, now()), mfaRequired: true };
      }
      if (recoveryCode) {
        const codes = await execute(
          `SELECT id, code_hash FROM recovery_codes
           WHERE user_id = $1 AND consumed_at IS NULL ORDER BY id`,
          [userId],
        );
        for (const row of codes.rows || []) {
          if (await verifyHash(row.code_hash, recoveryCode)) {
            const consumed = await execute(
              `UPDATE recovery_codes SET consumed_at = NOW()
               WHERE id = $1 AND consumed_at IS NULL RETURNING id`,
              [row.id],
            );
            return { ok: Boolean(consumed.rows?.[0]), mfaRequired: true, recoveryUsed: true };
          }
        }
      }
      return { ok: false, mfaRequired: true };
    },
  };
}

export const mfa = createMfaService();
