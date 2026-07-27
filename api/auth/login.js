import { verify } from '@node-rs/argon2';
import {
  createLucia,
  ADMIN_ID,
  issueCsrf,
  getClientIp,
  appendCookie,
} from '../_lib/session.js';
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '../_lib/rate-limit.js';
import { writeAuditLog } from '../_lib/audit.js';
import { vercelHandler } from '../_lib/adapter.js';

function unavailableResponse() {
  return Response.json(
    { error: 'Authentication service temporarily unavailable' },
    { status: 503, headers: { 'Retry-After': '60' } },
  );
}

async function handlePost(request) {
  const ip = getClientIp(request);
  let limit;
  try {
    limit = await checkRateLimit(ip);
  } catch (error) {
    console.error('Login rate limiter unavailable', error);
    return unavailableResponse();
  }

  if (!limit.allowed) {
    return Response.json(
      { error: 'Too many attempts', scope: limit.scope },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { password } = body;
  if (!password || typeof password !== 'string') {
    return Response.json({ error: 'Password required' }, { status: 400 });
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    console.error('ADMIN_PASSWORD_HASH not configured');
    return Response.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  let valid = false;
  try {
    valid = await verify(hash, password);
  } catch {
    valid = false;
  }

  if (!valid) {
    try {
      await recordFailedAttempt(ip);
    } catch (error) {
      console.error('Failed to persist login attempt', error);
      return unavailableResponse();
    }
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  try {
    await clearAttempts(ip);
  } catch (error) {
    console.error('Failed to clear prior login attempts', error);
  }

  const lucia = createLucia();
  const session = await lucia.createSession(ADMIN_ID, {});
  const csrfToken = issueCsrf(session.id);
  const cookie = lucia.createSessionCookie(session.id);

  await writeAuditLog({
    actorId: ADMIN_ID,
    action: 'login',
    targetKind: 'session',
    targetId: session.id,
    req: request,
  });

  const headers = new Headers({ 'Content-Type': 'application/json' });
  appendCookie(headers, cookie);

  return new Response(
    JSON.stringify({
      user: { id: ADMIN_ID, username: 'admin' },
      csrfToken,
    }),
    { status: 200, headers },
  );
}

export const POST = handlePost;

export default vercelHandler(async (req) => {
  if (req.method === 'POST') return handlePost(req);
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
});
