import { validateRequest, issueCsrf } from '../_lib/session.js';
import { vercelHandler } from '../_lib/adapter.js';

async function handleGet(request) {
  const { session, user } = await validateRequest(request);

  if (!session || !user) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const csrfToken = issueCsrf(session.id);

  return Response.json({
    user: {
      id: user.id,
      username: user.username,
    },
    csrfToken,
  });
}

export const GET = handleGet;

export default vercelHandler(async (req) => {
  if (req.method === 'GET') return handleGet(req);
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
});
