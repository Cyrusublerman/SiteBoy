import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { query } from './db.js';

const ADMIN_USER_ID = 'admin';
const CSRF_VERSION = 'v1';
const CSRF_CONTEXT = 'siteboy-admin-csrf';
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const SESSION_REFRESH_MS = SESSION_TTL_MS / 2;
export const SESSION_COOKIE_NAME = 'auth_session';

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

function cookie(value, maxAge) {
  return {
    name: SESSION_COOKIE_NAME,
    value,
    attributes: {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge,
    },
    serialize() {
      const encoded = encodeURIComponent(value);
      return `${SESSION_COOKIE_NAME}=${encoded}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
    },
  };
}

export function createSessionCookie(token) {
  return cookie(token, Math.floor(SESSION_TTL_MS / 1000));
}

export function createBlankSessionCookie() {
  return cookie('', 0);
}

export function createSessionStore({
  execute = query,
  now = () => new Date(),
  random = randomBytes,
} = {}) {
  return {
    async createSession(userId, { ip = null, ua = null } = {}) {
      const token = random(32).toString('base64url');
      const id = tokenHash(token);
      const createdAt = now();
      const expiresAt = new Date(createdAt.getTime() + SESSION_TTL_MS);
      await execute(
        `INSERT INTO sessions
          (id, user_id, expires_at, ip, ua, created_at, last_seen_at)
         VALUES ($1, $2, $3, $4, $5, $6, $6)`,
        [id, userId, expiresAt, ip, ua, createdAt],
      );
      return { id, userId, expiresAt, token, fresh: true };
    },

    async validateSessionToken(token) {
      if (!token) return { session: null, user: null };
      const id = tokenHash(token);
      const result = await execute(
        `SELECT s.id, s.user_id, s.expires_at, s.revoked_at,
                u.username, u.totp_enabled_at
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = $1`,
        [id],
      );
      const row = result.rows?.[0];
      if (!row || row.revoked_at) return { session: null, user: null };

      const current = now();
      const expiresAt = new Date(row.expires_at);
      if (expiresAt <= current) {
        await execute(
          'UPDATE sessions SET revoked_at = $2 WHERE id = $1 AND revoked_at IS NULL',
          [id, current],
        );
        return { session: null, user: null };
      }

      let fresh = false;
      let nextExpiry = expiresAt;
      if (expiresAt.getTime() - current.getTime() <= SESSION_REFRESH_MS) {
        fresh = true;
        nextExpiry = new Date(current.getTime() + SESSION_TTL_MS);
        await execute(
          'UPDATE sessions SET expires_at = $2, last_seen_at = $3 WHERE id = $1 AND revoked_at IS NULL',
          [id, nextExpiry, current],
        );
      }
      return {
        session: {
          id,
          userId: row.user_id,
          expiresAt: nextExpiry,
          fresh,
          token,
        },
        user: {
          id: row.user_id,
          username: row.username,
          mfaEnabled: Boolean(row.totp_enabled_at),
        },
      };
    },

    async invalidateSession(id) {
      await execute(
        'UPDATE sessions SET revoked_at = $2 WHERE id = $1 AND revoked_at IS NULL',
        [id, now()],
      );
    },

    async rotateSession(session) {
      const token = random(32).toString('base64url');
      const id = tokenHash(token);
      const current = now();
      const expiresAt = new Date(current.getTime() + SESSION_TTL_MS);
      const result = await execute(
        `UPDATE sessions
         SET id = $2, expires_at = $3, last_seen_at = $4
         WHERE id = $1 AND revoked_at IS NULL
         RETURNING user_id`,
        [session.id, id, expiresAt, current],
      );
      if (!result.rows?.[0]) return null;
      return { id, userId: result.rows[0].user_id, expiresAt, token, fresh: true };
    },

    async cleanupSessions() {
      const result = await execute(
        'DELETE FROM sessions WHERE revoked_at IS NOT NULL OR expires_at <= $1',
        [now()],
      );
      return result.rowCount ?? 0;
    },
  };
}

export const ADMIN_ID = ADMIN_USER_ID;
const defaultStore = createSessionStore();

export function createSessionService() {
  return {
    createSession: (userId, attributes) => defaultStore.createSession(userId, attributes),
    validateSession: (token) => defaultStore.validateSessionToken(token),
    invalidateSession: (id) => defaultStore.invalidateSession(id),
    createSessionCookie,
    createBlankSessionCookie,
  };
}

export function parseSessionId(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function validateRequest(req) {
  const cookieHeader = req.headers?.get
    ? req.headers.get('cookie')
    : req.headers?.cookie;
  const token = parseSessionId(cookieHeader);
  return defaultStore.validateSessionToken(token);
}

export function sessionCookie(_store, session) {
  return createSessionCookie(session.token);
}

export function blankSessionCookie() {
  return createBlankSessionCookie();
}

export const cleanupSessions = () => defaultStore.cleanupSessions();
export const rotateSession = (session) => defaultStore.rotateSession(session);

export async function requireSession(req) {
  const { session, user } = await validateRequest(req);
  if (!session || !user) {
    return { error: Response.json({ error: 'Unauthorised' }, { status: 401 }) };
  }
  return { session, user };
}

export function getClientIp(req) {
  const forwarded = req.headers?.get
    ? req.headers.get('x-forwarded-for')
    : req.headers?.['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return null;
}

export function getUserAgent(req) {
  return req.headers?.get
    ? req.headers.get('user-agent')
    : req.headers?.['user-agent'] ?? null;
}

export function hashValue(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function csrfSecret() {
  const secret = process.env.CSRF_SECRET || process.env.ADMIN_PASSWORD_HASH;
  if (!secret || String(secret).length < 32) {
    throw new Error('CSRF_SECRET must be configured with at least 32 characters. ADMIN_PASSWORD_HASH is accepted as a temporary fallback.');
  }
  return String(secret);
}

function csrfDigest(sessionId) {
  return createHmac('sha256', csrfSecret())
    .update(`${CSRF_CONTEXT}:${sessionId}`)
    .digest('base64url');
}

export function issueCsrf(sessionId) {
  if (!sessionId) throw new Error('Session ID required for CSRF token');
  return `${CSRF_VERSION}.${csrfDigest(sessionId)}`;
}

export function verifyCsrf(sessionId, headerToken) {
  if (!sessionId || !headerToken) return false;
  const expected = issueCsrf(sessionId);
  const actual = String(headerToken);
  const expectedBytes = Buffer.from(expected, 'utf8');
  const actualBytes = Buffer.from(actual, 'utf8');
  if (expectedBytes.length !== actualBytes.length) return false;
  return timingSafeEqual(expectedBytes, actualBytes);
}

// Stateless CSRF tokens require no per-process cleanup.
export function clearCsrf() {}

export async function requireSessionAndCsrf(req) {
  const auth = await requireSession(req);
  if (auth.error) return auth;

  const csrfHeader = req.headers?.get
    ? req.headers.get('x-csrf')
    : req.headers?.['x-csrf'];

  if (!verifyCsrf(auth.session.id, csrfHeader)) {
    return { error: Response.json({ error: 'CSRF token invalid' }, { status: 403 }) };
  }
  return auth;
}

export function appendCookie(headers, cookie) {
  headers.append('Set-Cookie', cookie.serialize());
}
