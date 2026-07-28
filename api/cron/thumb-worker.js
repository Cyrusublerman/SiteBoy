import { errorResponse, jsonResponse } from '../_lib/auth.js';
import { vercelHandler } from '../_lib/adapter.js';
import { cleanupSessions } from '../_lib/session.js';
import {
  cleanupExpiredUploads,
  processDeletionQueue,
  reconcileMediaOrphans,
} from '../admin/media/_lifecycle.js';

/**
 * The bucket scan is the only step that fails wholesale when R2 is unreachable
 * or unconfigured. Report it as a typed field so the rest of the run proceeds.
 */
async function reconcile(request) {
  try {
    return await reconcileMediaOrphans({ remediate: true, request });
  } catch (error) {
    return { errorCode: error?.name || 'ORPHAN_RECONCILE_FAILED' };
  }
}

async function handleGet(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') || '';
  if (secret && auth !== `Bearer ${secret}`) {
    return errorResponse('unauthorized', 401);
  }

  const host = request.headers.get('x-forwarded-host') || process.env.VERCEL_URL;
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  if (!host) {
    return errorResponse('no host', 500);
  }

  const expiredSessionsDeleted = await cleanupSessions();
  const uploadCleanup = await cleanupExpiredUploads({ limit: 50, request });
  const reconciliation = await reconcile(request);
  const deletionCleanup = await processDeletionQueue({ limit: 50, request });
  const thumbRes = await fetch(`${proto}://${host}/api/admin/media/thumb`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ limit: 25 }),
  });

  const data = await thumbRes.json();
  return jsonResponse({
    cron: true,
    expiredSessionsDeleted,
    uploadCleanup,
    reconciliation,
    deletionCleanup,
    thumbnails: data,
  });
}

export default vercelHandler(async (req) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return errorResponse('method not allowed', 405);
  }
  return handleGet(req);
});
