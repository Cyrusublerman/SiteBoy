import {
  createSessionService,
  validateRequest,
  clearCsrf,
  appendCookie,
} from '../_lib/session.js';
import { writeAuditLog } from '../_lib/audit.js';
import { vercelHandler } from '../_lib/adapter.js';

async function handlePost(request) {
  const sessionService = createSessionService();
  const { session, user } = await validateRequest(request);

  if (session) {
    clearCsrf(session.id);
    await sessionService.invalidateSession(session.id);
    await writeAuditLog({
      actorId: user?.id ?? null,
      action: 'logout',
      targetKind: 'session',
      targetId: session.id,
      req: request,
    });
  }

  const cookie = sessionService.createBlankSessionCookie();
  const headers = new Headers();
  appendCookie(headers, cookie);

  return new Response(null, { status: 204, headers });
}

export const POST = handlePost;

export default vercelHandler(async (req) => {
  if (req.method === 'POST') return handlePost(req);
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
});
