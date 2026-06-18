import { ulid } from '../../_lib/crypto.js';
import { signPut, publicUrl } from '../../_lib/r2.js';
import { requireAdmin, errorResponse, jsonResponse } from '../../_lib/auth.js';
import { vercelHandler } from '../../_lib/adapter.js';

async function handlePost(request) {
  const actor = await requireAdmin(request);
  if (!actor) return errorResponse('unauthorized', 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('invalid json', 400);
  }

  const filename = body.filename || 'upload.bin';
  const mime = body.mime || 'application/octet-stream';
  const bytes = Number(body.bytes) || 0;
  const collection = body.collection || body.scope || 'digital/generative';
  const itemId = body.itemId || ulid();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `gallery/${itemId}/${safeName}`;

  try {
    const signed = await signPut(key, mime, bytes);
    return jsonResponse({
      url: signed.url,
      fields: signed.fields,
      key,
      itemId,
      collection,
      publicUrl: publicUrl(key),
      method: 'PUT',
      headers: { 'Content-Type': mime },
    });
  } catch (err) {
    return errorResponse(err.message || 'sign failed', 500);
  }
}

export default vercelHandler(async (req) => {
  if (req.method !== 'POST') return errorResponse('method not allowed', 405);
  return handlePost(req);
});
