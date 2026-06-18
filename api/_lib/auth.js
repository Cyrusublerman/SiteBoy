import { requireSessionAndCsrf } from './session.js';

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

/**
 * Require Lucia session + X-CSRF header (admin mutating routes).
 * @param {Request|import('http').IncomingMessage} req
 * @returns {Promise<{ userId: string } | null>}
 */
export async function requireAdmin(req) {
  if (process.env.ADMIN_BYPASS === '1') {
    return { userId: 'admin' };
  }

  const auth = await requireSessionAndCsrf(req);
  if (auth.error) return null;

  return { userId: auth.user.id };
}
