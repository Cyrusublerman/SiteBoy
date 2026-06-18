import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { getDb, schema } from './db.js';

const ADMIN_USER_ID = 'admin';

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

function newCsrfToken() {
  return randomBytes(32).toString('hex');
}

const csrfBySession = new Map();

export function issueCsrf(sessionId) {
  const token = newCsrfToken();
  csrfBySession.set(sessionId, token);
  return token;
}

export function verifyCsrf(sessionId, headerToken) {
  const expected = csrfBySession.get(sessionId);
  if (!expected || !headerToken) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(String(headerToken), 'utf8'),
    );
  } catch {
    return false;
  }
}

export function clearCsrf(sessionId) {
  csrfBySession.delete(sessionId);
}

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
