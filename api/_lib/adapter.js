/**
 * Vercel serverless adapter — converts Node (req, res) to portable Web-API handlers.
 * Handlers return standard Response objects so the same logic can move to Workers later.
 */

/**
 * @typedef {Object} ApiRequest
 * @property {string} method
 * @property {URL} url
 * @property {{ get: (name: string) => string | null }} headers
 * @property {Record<string, string | string[]>} query
 * @property {unknown} [body]
 */

/**
 * @param {import('http').IncomingMessage} vercelReq
 * @returns {ApiRequest}
 */
export function toApiRequest(vercelReq) {
  const host = vercelReq.headers?.host || 'localhost';
  const url = new URL(vercelReq.url || '/', `https://${host}`);

  return {
    method: vercelReq.method || 'GET',
    url,
    headers: {
      get(name) {
        const key = String(name).toLowerCase();
        const raw = vercelReq.headers?.[key] ?? vercelReq.headers?.[name];
        if (raw == null) return null;
        return String(Array.isArray(raw) ? raw[0] : raw);
      },
    },
    query: vercelReq.query || {},
    body: vercelReq.body,
  };
}

/**
 * @param {import('http').ServerResponse} vercelRes
 * @param {Response} response
 */
export async function sendWebResponse(vercelRes, response) {
  vercelRes.statusCode = response.status;
  response.headers.forEach((value, key) => {
    vercelRes.setHeader(key, value);
  });
  const body = Buffer.from(await response.arrayBuffer());
  vercelRes.end(body);
}

/**
 * Wrap a portable async handler for Vercel `export default`.
 * @param {(req: ApiRequest) => Promise<Response>} handler
 */
export function vercelHandler(handler) {
  return async (vercelReq, vercelRes) => {
    try {
      const req = toApiRequest(vercelReq);
      const response = await handler(req);
      await sendWebResponse(vercelRes, response);
    } catch (err) {
      console.error('[api]', err);
      vercelRes.statusCode = 500;
      vercelRes.setHeader('Content-Type', 'application/json');
      vercelRes.end(JSON.stringify({ error: 'Internal server error' }));
    }
  };
}
