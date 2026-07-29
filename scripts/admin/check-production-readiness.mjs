import { pathToFileURL } from 'node:url';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export const REQUIRED_ENVIRONMENT = Object.freeze([
  'POSTGRES_URL',
  'ADMIN_PASSWORD_HASH',
  'CSRF_SECRET',
  'AUTH_ENCRYPTION_KEY',
  'CRON_SECRET',
  'R2_ENDPOINT',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_BASE',
]);

export const RECOMMENDED_ENVIRONMENT = Object.freeze([
  'DATABASE_URL',
  'SITE_ORIGIN',
]);

function validUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function inspectEnvironment(env = process.env) {
  const errors = [];
  const warnings = [];

  for (const name of REQUIRED_ENVIRONMENT) {
    if (!env[name]) errors.push(`${name} is missing`);
  }
  for (const name of RECOMMENDED_ENVIRONMENT) {
    if (!env[name]) warnings.push(`${name} is not configured`);
  }

  if (env.ADMIN_PASSWORD_HASH && !String(env.ADMIN_PASSWORD_HASH).startsWith('$argon2')) {
    errors.push('ADMIN_PASSWORD_HASH is not an Argon2 hash');
  }
  if (env.CSRF_SECRET && String(env.CSRF_SECRET).length < 32) {
    errors.push('CSRF_SECRET must contain at least 32 characters');
  }
  if (env.CRON_SECRET && String(env.CRON_SECRET).length < 32) {
    errors.push('CRON_SECRET must contain at least 32 characters');
  }
  if (env.AUTH_ENCRYPTION_KEY) {
    const key = String(env.AUTH_ENCRYPTION_KEY);
    const decodedLength = /^[0-9a-f]{64}$/i.test(key)
      ? 32
      : Buffer.from(key, 'base64').length;
    if (decodedLength !== 32) {
      errors.push('AUTH_ENCRYPTION_KEY must decode to exactly 32 bytes');
    }
  }
  for (const name of ['R2_ENDPOINT', 'R2_PUBLIC_BASE', 'SITE_ORIGIN']) {
    if (env[name] && !validUrl(env[name])) errors.push(`${name} is not a valid URL`);
  }
  if (env.MAX_MEDIA_UPLOAD_BYTES) {
    const limit = Number(env.MAX_MEDIA_UPLOAD_BYTES);
    if (!Number.isFinite(limit) || limit <= 0) {
      errors.push('MAX_MEDIA_UPLOAD_BYTES must be a positive number');
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    configured: REQUIRED_ENVIRONMENT.filter((name) => Boolean(env[name])),
  };
}

export async function inspectDatabase(query) {
  const result = await query(
    `SELECT
       to_regclass('public.users') IS NOT NULL AS users_exists,
       to_regclass('public.sessions') IS NOT NULL AS sessions_exists,
       to_regclass('public.gallery_items') IS NOT NULL AS gallery_items_exists,
       to_regclass('public.media_uploads') IS NOT NULL AS media_uploads_exists,
       to_regclass('public.audit_log') IS NOT NULL AS audit_log_exists,
       to_regclass('public.login_attempts') IS NOT NULL AS login_attempts_exists,
       to_regclass('public.recovery_codes') IS NOT NULL AS recovery_codes_exists,
       to_regclass('public.schema_migrations') IS NOT NULL AS schema_migrations_exists,
       EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'users'
           AND column_name = 'totp_secret_enc'
       ) AS totp_secret_enc_exists,
       EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'sessions'
           AND column_name = 'last_seen_at'
       ) AS session_last_seen_exists,
       EXISTS (SELECT 1 FROM users WHERE id = 'admin') AS admin_exists`,
    [],
  );
  const row = result.rows?.[0] || {};
  const checks = {
    users: Boolean(row.users_exists),
    sessions: Boolean(row.sessions_exists),
    galleryItems: Boolean(row.gallery_items_exists),
    mediaUploads: Boolean(row.media_uploads_exists),
    auditLog: Boolean(row.audit_log_exists),
    loginAttempts: Boolean(row.login_attempts_exists),
    recoveryCodes: Boolean(row.recovery_codes_exists),
    migrationLedger: Boolean(row.schema_migrations_exists),
    encryptedTotp: Boolean(row.totp_secret_enc_exists),
    slidingSessions: Boolean(row.session_last_seen_exists),
    adminUser: Boolean(row.admin_exists),
  };
  return {
    ok: Object.values(checks).every(Boolean),
    checks,
  };
}

export async function inspectHealth(origin, fetchImpl = fetch) {
  if (!origin) return { ok: null, skipped: true };
  const response = await fetchImpl(new URL('/api/health', origin), {
    headers: { Accept: 'application/json' },
  });
  const body = await response.json().catch(() => null);
  return {
    ok: response.ok && body?.ok === true,
    status: response.status,
    build: body?.build || null,
  };
}

function printSection(title, value) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(value, null, 2));
}

async function main() {
  const environment = inspectEnvironment();
  printSection('ENVIRONMENT', {
    ok: environment.ok,
    configuredCount: environment.configured.length,
    requiredCount: REQUIRED_ENVIRONMENT.length,
    errors: environment.errors,
    warnings: environment.warnings,
  });

  let database = { ok: false, error: 'Database check not run' };
  if (process.env.POSTGRES_URL) {
    try {
      const { Pool } = await import('@neondatabase/serverless');
      const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
      try {
        database = await inspectDatabase((text, params) => pool.query(text, params));
      } finally {
        await pool.end();
      }
    } catch (error) {
      database = { ok: false, error: error.message };
    }
  }
  printSection('DATABASE', database);

  let health = { ok: null, skipped: true };
  if (process.env.SITE_ORIGIN) {
    try {
      health = await inspectHealth(process.env.SITE_ORIGIN);
    } catch (error) {
      health = { ok: false, error: error.message };
    }
  }
  printSection('DEPLOYED HEALTH', health);

  if (!environment.ok || !database.ok || health.ok === false) {
    process.exitCode = 1;
  }
}

const executedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (executedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
