import {
  appendCookie,
  createSessionCookie,
  issueCsrf,
  requireSessionAndCsrf,
  validateRequest,
} from '../_lib/session.js';
import { mfa } from '../_lib/mfa.js';
import { vercelHandler } from '../_lib/adapter.js';

async function handleGet(request) {
  const { session, user } = await validateRequest(request);

  if (!session || !user) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const csrfToken = issueCsrf(session.id);

  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (session.fresh) appendCookie(headers, createSessionCookie(session.token));
  return new Response(JSON.stringify({
    user: {
      id: user.id,
      username: user.username,
      mfaEnabled: user.mfaEnabled,
    },
    csrfToken,
  }), { status: 200, headers });
}

async function handlePost(request) {
  const auth = await requireSessionAndCsrf(request);
  if (auth.error) return auth.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.action === 'mfa-enrol') {
    if (auth.user.mfaEnabled) {
      return Response.json({ error: 'MFA is already enabled' }, { status: 409 });
    }
    return Response.json(await mfa.beginEnrollment(auth.user.id));
  }
  if (body.action === 'mfa-confirm') {
    const result = await mfa.confirmEnrollment(auth.user.id, body.totp);
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
    return Response.json({ mfaEnabled: true, recoveryCodes: result.recoveryCodes });
  }
  return Response.json({ error: 'Unknown action' }, { status: 400 });
}

export const GET = handleGet;
export const POST = handlePost;

export default vercelHandler(async (req) => {
  if (req.method === 'GET') return handleGet(req);
  if (req.method === 'POST') return handlePost(req);
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
});
