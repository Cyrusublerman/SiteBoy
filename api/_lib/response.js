/**
 * JSON response helpers for portable API handlers.
 */

/**
 * @param {unknown} data
 * @param {number | ResponseInit} [init]
 */
export function json(data, init = 200) {
  const options = typeof init === 'number' ? { status: init } : init;
  return Response.json(data, options);
}

/**
 * @param {string} message
 * @param {number} [status]
 */
export function error(message, status = 400) {
  return json({ error: message }, status);
}
