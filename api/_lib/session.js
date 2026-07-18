import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { getDb, schema } from './db.js';

const ADMIN_USER_ID = 'admin';
const CSRF_VERSION = 'v1';
const CSRF_CONTEXT = 'siteboy-admin-csrf';

let _lucia;

export function createLucia() {
  if (_lucia) return _lucia;

  const db = getDb();
  const adapter = new DrizzlePostgreSQLAdapter(db, schema.sessions, schema.users);

  _lucia = new Lucia(adapter, {
    sessionCookie: {
      name: 'auth_session',
      expires: false,
      attributes: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    },
    getUserAttributes: (attributes) => ({
      username: attributes.username,
    }),
  });

  return _lucia;
}

export const ADMIN_ID = ADMIN_USER_ID;

export function parseSessionId(cookieHeader) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)auth_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function validateRequest(req) {
  const lucia = createLucia();
  const cookieHeader = req.headers?.get
    ? req.headers.get('cookie')
    : req.headers?.cookie;
  const sessionId = parseSessionId(cookieHeader);
  if (!sessionId) return { session: null, user: null };
  return lucia.validateSession(sessionId);
}

export function sessionCookie(lucia, session) {
  return lucia.createSessionCookie(session.id);
}

export function blankSessionCookie(lucia) {
  return lucia.createBlankSessionCookie();
}

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
