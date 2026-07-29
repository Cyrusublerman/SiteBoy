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
 * Require an opaque database session + X-CSRF header (admin mutating routes).
 * @param {Request|import('http').IncomingMessage} req
 * @returns {Promise<{ userId: string } | { error: Response }>}
 */
export function createAdminAuthoriser(authenticate = requireSessionAndCsrf) {
  return async function authorise(req) {
    const auth = await authenticate(req);
    if (auth.error) return auth;
    return { userId: auth.user.id };
  };
}

export const requireAdmin = createAdminAuthoriser();
