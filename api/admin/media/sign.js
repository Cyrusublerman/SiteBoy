import {
  createMultipart,
  publicUrl,
  signMultipartPart,
  signPut,
} from '../../_lib/r2.js';
import { getPool } from '../../_lib/db.js';
import { requireAdmin, errorResponse, jsonResponse } from '../../_lib/auth.js';
import { vercelHandler } from '../../_lib/adapter.js';
import {
  auditMutation,
  createPendingRecord,
  MediaLifecycleError,
} from './_lifecycle.js';

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

export function validateGalleryUpload({ filename, mime, bytes, multipart = false }) {
  if (!filename || typeof filename !== 'string') {
    return { ok: false, status: 400, error: 'filename required' };
  }
  if (!ALLOWED_GALLERY_MIME_TYPES.has(mime)) {
    return { ok: false, status: 415, error: `unsupported media type: ${mime || 'unknown'}` };
  }
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return { ok: false, status: 400, error: 'positive byte length required' };
  }
  const maximum = multipart ? 5 * 1024 * 1024 * 1024 * 1024 : maxMediaUploadBytes();
  if (bytes > maximum) {
    return { ok: false, status: 413, error: `file exceeds upload limit of ${maximum} bytes` };
  }
  return { ok: true };
}

async function handlePost(request) {
  const actor = await requireAdmin(request);
  if (actor.error) return actor.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('invalid json', 400);
  }

  if (Object.hasOwn(body, 'key')) {
    return errorResponse('client-provided storage keys are forbidden', 400);
  }
  const action = body.action || 'single';
  const actorId = actor.userId || actor.user?.id;
  const pool = getPool();

  if (action === 'multipart-sign-part') {
    const partNumber = Number(body.partNumber);
    if (!body.itemId || !body.uploadId || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) {
      return errorResponse('itemId, uploadId and valid partNumber required', 400);
    }
    const owned = await pool.query(
      `SELECT r2_key FROM media_uploads
       WHERE id = $1 AND uploaded_by = $2 AND multipart_upload_id = $3
         AND status = 'uploading' AND expires_at > NOW()`,
      [body.itemId, actorId, body.uploadId],
    );
    if (!owned.rows[0]) return errorResponse('multipart upload not found', 404);
    try {
      const url = await signMultipartPart(owned.rows[0].r2_key, body.uploadId, partNumber);
      const client = await pool.connect();
      try {
        await auditMutation(client, {
          actorId,
          action: 'media.multipart.part.sign',
          targetKind: 'media_upload',
          targetId: body.itemId,
          after: { partNumber },
          request,
        });
      } finally {
        client.release();
      }
      return jsonResponse({ url, partNumber });
    } catch (error) {
      return errorResponse(error.message || 'part signing failed', 500);
    }
  }

  const filename = body.filename || '';
  const mime = body.mime || '';
  const bytes = Number(body.bytes);
  const multipart = action === 'multipart-init';
  if (!['single', 'multipart-init'].includes(action)) return errorResponse('unknown media sign action', 400);
  const validation = validateGalleryUpload({ filename, mime, bytes, multipart });
  if (!validation.ok) return errorResponse(validation.error, validation.status);
  const sha256 = body.sha256 || null;
  if (sha256 && !/^[a-f0-9]{64}$/i.test(sha256)) return errorResponse('sha256 must be hexadecimal', 400);

  const collection = body.collection || body.scope || 'digital/generative';
  const kind = body.kind === 'poster' ? 'poster' : 'gallery';
  if (kind === 'poster' && (!mime.startsWith('image/') || bytes > 20 * 1024 * 1024)) {
    return errorResponse('poster must be a supported image no larger than 20 MiB', 415);
  }

  try {
    const pending = await createPendingRecord({
      actorId,
      filename,
      mime,
      bytes,
      sha256,
      collection,
      kind,
      request,
    });
    if (multipart) {
      const created = await createMultipart(pending.key, mime, sha256);
      await pool.query(
        `UPDATE media_uploads
         SET status = 'uploading', multipart_upload_id = $2, updated_at = NOW()
         WHERE id = $1`,
        [pending.itemId, created.uploadId],
      );
      return jsonResponse({
        itemId: pending.itemId,
        key: pending.key,
        uploadId: created.uploadId,
        collection,
        publicUrl: publicUrl(pending.key),
        expiresAt: pending.expiresAt,
      });
    }
    const signed = await signPut(pending.key, mime, bytes, sha256);
    return jsonResponse({
      url: signed.url,
      fields: signed.fields,
      key: pending.key,
      itemId: pending.itemId,
      collection,
      publicUrl: publicUrl(pending.key),
      method: 'PUT',
      headers: signed.headers,
      maxBytes: maxMediaUploadBytes(),
      expiresAt: pending.expiresAt,
    });
  } catch (error) {
    if (error instanceof MediaLifecycleError) return errorResponse(error.message, error.status);
    return errorResponse(error.message || 'sign failed', 500);
  }
}

export default vercelHandler(async (request) => {
  if (request.method !== 'POST') return errorResponse('method not allowed', 405);
  return handlePost(request);
});
