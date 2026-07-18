import { ulid } from '../../_lib/crypto.js';
import { signPut, publicUrl } from '../../_lib/r2.js';
import { requireAdmin, errorResponse, jsonResponse } from '../../_lib/auth.js';
import { vercelHandler } from '../../_lib/adapter.js';

export const ALLOWED_GALLERY_MIME_TYPES = Object.freeze(new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'model/gltf-binary',
]));

export const DEFAULT_MAX_MEDIA_UPLOAD_BYTES = 100 * 1024 * 1024;

export function maxMediaUploadBytes() {
  const configured = Number(process.env.MAX_MEDIA_UPLOAD_BYTES);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_MEDIA_UPLOAD_BYTES;
}

export function validateGalleryUpload({ filename, mime, bytes }) {
  if (!filename || typeof filename !== 'string') {
    return { ok: false, status: 400, error: 'filename required' };
  }
  if (!ALLOWED_GALLERY_MIME_TYPES.has(mime)) {
    return { ok: false, status: 415, error: `unsupported media type: ${mime || 'unknown'}` };
  }
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return { ok: false, status: 400, error: 'positive byte length required' };
  }
  const maximum = maxMediaUploadBytes();
  if (bytes > maximum) {
    return { ok: false, status: 413, error: `file exceeds upload limit of ${maximum} bytes` };
  }
  return { ok: true };
}

async function handlePost(request) {
  const actor = await requireAdmin(request);
  if (!actor) return errorResponse('unauthorized', 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('invalid json', 400);
  }

  const filename = body.filename || '';
  const mime = body.mime || '';
  const bytes = Number(body.bytes);
  const validation = validateGalleryUpload({ filename, mime, bytes });
  if (!validation.ok) return errorResponse(validation.error, validation.status);

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
      maxBytes: maxMediaUploadBytes(),
    });
  } catch (error) {
    return errorResponse(error.message || 'sign failed', 500);
  }
}

export default vercelHandler(async (request) => {
  if (request.method !== 'POST') return errorResponse('method not allowed', 405);
  return handlePost(request);
});
