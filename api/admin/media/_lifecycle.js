import { createHash } from 'node:crypto';
import { ulid } from 'ulid';
import { getPool } from '../../_lib/db.js';
import { hashAuditIp } from '../../_lib/audit.js';
import {
  abortMultipart,
  completeMultipart,
  deleteObject,
  headObject,
  listObjectKeys,
  publicUrl,
} from '../../_lib/r2.js';
import { thumbKeyForMediaKey, verifyStoredImage } from '../../_lib/thumb.js';

export const PENDING_UPLOAD_TTL_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_RETENTION_DAYS = 30;

export class MediaLifecycleError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function valueHash(value) {
  if (value == null) return null;
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export async function auditMutation(client, {
  actorId,
  action,
  targetKind,
  targetId,
  before,
  after,
  request,
}) {
  await client.query(
    `INSERT INTO audit_log (
       id, actor_id, action, target_kind, target_id, before_hash, after_hash, ip
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      ulid(),
      actorId || null,
      action,
      targetKind || null,
      targetId || null,
      valueHash(before),
      valueHash(after),
      request ? hashAuditIp(request) : null,
    ],
  );
}

export function serverMediaKey(itemId, filename, kind = 'gallery') {
  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
  const prefix = kind === 'poster' ? 'gallery-posters' : 'gallery';
  return `${prefix}/${itemId}/${safeName}`;
}

export async function createPendingRecord({
  actorId,
  filename,
  mime,
  bytes,
  sha256 = null,
  collection = 'digital/generative',
  kind = 'gallery',
  request,
}, { pool = getPool(), now = () => new Date() } = {}) {
  const itemId = ulid();
  const key = serverMediaKey(itemId, filename, kind);
  const createdAt = now();
  const expiresAt = new Date(createdAt.getTime() + PENDING_UPLOAD_TTL_MS);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO media_uploads (
         id, r2_key, mime, bytes, sha256, uploaded_by, status, expires_at,
         completed_parts_jsonb, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,'[]'::jsonb,$8)`,
      [itemId, key, mime, bytes, sha256, actorId, expiresAt, createdAt],
    );
    await auditMutation(client, {
      actorId,
      action: 'media.upload.pending.create',
      targetKind: 'media_upload',
      targetId: itemId,
      after: { key, mime, bytes, collection, kind, expiresAt: expiresAt.toISOString() },
      request,
    });
    await client.query('COMMIT');
    return { itemId, key, collection, expiresAt };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function verifyPendingObject(pending, object) {
  if (!pending) throw new MediaLifecycleError('UPLOAD_NOT_FOUND', 'pending upload not found', 404);
  if (pending.status === 'confirmed') return { idempotent: true };
  if (!['pending', 'uploading', 'uploaded'].includes(pending.status)) {
    throw new MediaLifecycleError('UPLOAD_STATE_INVALID', 'upload cannot be confirmed in its current state', 409);
  }
  if (pending.expires_at && new Date(pending.expires_at) <= new Date()) {
    throw new MediaLifecycleError('UPLOAD_EXPIRED', 'pending upload expired', 410);
  }
  if (!object) throw new MediaLifecycleError('OBJECT_NOT_FOUND', 'uploaded object not found', 409);
  if (Number(object.bytes) !== Number(pending.bytes)) {
    throw new MediaLifecycleError('HEAD_LENGTH_MISMATCH', 'uploaded object length does not match pending upload', 409);
  }
  if (object.mime !== pending.mime) {
    throw new MediaLifecycleError('HEAD_TYPE_MISMATCH', 'uploaded object type does not match pending upload', 409);
  }
  if (pending.sha256 && object.sha256 && pending.sha256.toLowerCase() !== object.sha256.toLowerCase()) {
    throw new MediaLifecycleError('HEAD_CHECKSUM_MISMATCH', 'uploaded object checksum does not match pending upload', 409);
  }
  return { idempotent: false };
}

function formatFromMime(mime) {
  return ({
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'model/gltf-binary': 'glb',
  })[mime] || mime.split('/').pop() || 'unknown';
}

export async function confirmPendingUpload({
  actorId,
  itemId,
  key,
  metadata = {},
  posterForItemId = null,
  request,
}, {
  pool = getPool(),
  inspectObject = headObject,
  inspectPoster = verifyStoredImage,
} = {}) {
  const lookup = await pool.query(
    `SELECT * FROM media_uploads WHERE id = $1 AND r2_key = $2 AND uploaded_by = $3`,
    [itemId, key, actorId],
  );
  const pending = lookup.rows[0];
  if (!pending) throw new MediaLifecycleError('UPLOAD_OWNERSHIP_MISMATCH', 'pending upload not found', 404);
  if (pending.status === 'confirmed') {
    const existing = posterForItemId
      ? await pool.query('SELECT id, media_url, thumb_url FROM gallery_items WHERE id = $1', [posterForItemId])
      : await pool.query('SELECT id, media_url, thumb_url FROM gallery_items WHERE id = $1', [itemId]);
    return { ...existing.rows[0], itemId: posterForItemId || itemId, idempotent: true };
  }

  let object;
  try {
    object = await inspectObject(key);
  } catch (error) {
    if (error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404) object = null;
    else throw error;
  }
  verifyPendingObject(pending, object);
  if (posterForItemId) {
    if (!key.startsWith('gallery-posters/')) {
      throw new MediaLifecycleError('POSTER_KEY_INVALID', 'poster key is not server-owned poster storage', 409);
    }
    try {
      await inspectPoster(key);
    } catch {
      throw new MediaLifecycleError('POSTER_CONTENT_INVALID', 'poster object is not a verified image', 415);
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const locked = await client.query(
      `SELECT * FROM media_uploads
       WHERE id = $1 AND r2_key = $2 AND uploaded_by = $3
       FOR UPDATE`,
      [itemId, key, actorId],
    );
    const current = locked.rows[0];
    if (!current) throw new MediaLifecycleError('UPLOAD_OWNERSHIP_MISMATCH', 'pending upload not found', 404);
    if (current.status === 'confirmed') {
      await client.query('COMMIT');
      return { itemId: posterForItemId || itemId, idempotent: true };
    }

    const mediaUrl = publicUrl(key);
    if (posterForItemId) {
      if (!pending.mime.startsWith('image/')) {
        throw new MediaLifecycleError('POSTER_TYPE_INVALID', 'video poster must be an image', 415);
      }
      const target = await client.query(
        `SELECT id, format, thumb_url, metadata_jsonb
         FROM gallery_items WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
        [posterForItemId],
      );
      if (!target.rows[0] || !['mp4', 'webm'].includes(target.rows[0].format)) {
        throw new MediaLifecycleError('POSTER_TARGET_INVALID', 'poster target must be an active video', 409);
      }
      await client.query(
        `UPDATE gallery_items
         SET thumb_url = $2, thumb_status = 'done', thumb_error_code = NULL,
             urls_jsonb = jsonb_set(COALESCE(urls_jsonb, '{}'::jsonb), '{thumb}', to_jsonb($2::text)),
             metadata_jsonb = jsonb_set(COALESCE(metadata_jsonb, '{}'::jsonb), '{posterKey}', to_jsonb($3::text)),
             updated_at = NOW()
         WHERE id = $1`,
        [posterForItemId, mediaUrl, key],
      );
    } else {
      const collection = metadata.collection || 'digital/generative';
      const filename = key.split('/').pop();
      const format = metadata.format || formatFromMime(pending.mime);
      const title = metadata.title || filename;
      const slug = metadata.slug || filename.replace(/\.[^.]+$/, '');
      const sort = await client.query(
        `SELECT COALESCE(MAX(sort_index), -1) + 1 AS next
         FROM gallery_items WHERE collection = $1`,
        [collection],
      );
      await client.query(
        `INSERT INTO gallery_items (
           id, gallery_slug, sort_index, filename, urls_jsonb, metadata_jsonb, status,
           slug, title, description, media_url, thumb_url, format, source_tool, tags,
           collection, width, height, duration, sha256, thumb_status, updated_at
         ) VALUES (
           $1,$2,$3,$4,$5::jsonb,$6::jsonb,'published',$7,$8,$9,$10,NULL,$11,$12,
           $13::jsonb,$14,$15,$16,$17,$18,'pending',NOW()
         )
         ON CONFLICT (id) DO NOTHING`,
        [
          itemId,
          collection,
          sort.rows[0]?.next ?? 0,
          filename,
          JSON.stringify({ thumb: null, web: mediaUrl, zoom: mediaUrl }),
          JSON.stringify({ r2Key: key }),
          slug,
          title,
          metadata.description || '',
          mediaUrl,
          format,
          metadata.sourceTool || null,
          JSON.stringify(metadata.tags || []),
          collection,
          metadata.width ?? null,
          metadata.height ?? null,
          metadata.duration ?? null,
          pending.sha256,
        ],
      );
    }
    await client.query(
      `UPDATE media_uploads
       SET status = 'confirmed', confirmed_at = NOW(), expires_at = NULL,
           last_error_code = NULL, updated_at = NOW()
       WHERE id = $1`,
      [itemId],
    );
    await auditMutation(client, {
      actorId,
      action: posterForItemId ? 'media.poster.confirm' : 'media.confirm',
      targetKind: posterForItemId ? 'gallery_item' : 'media_upload',
      targetId: posterForItemId || itemId,
      after: {
        mediaUploadId: itemId,
        mime: pending.mime,
        bytes: Number(pending.bytes),
        checksumVerified: Boolean(pending.sha256 && object.sha256),
      },
      request,
    });
    await client.query('COMMIT');
    return {
      ok: true,
      itemId: posterForItemId || itemId,
      mediaUrl: posterForItemId ? undefined : mediaUrl,
      thumbUrl: posterForItemId ? mediaUrl : null,
      idempotent: false,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function validateMultipartParts(parts) {
  if (!Array.isArray(parts) || !parts.length) {
    throw new MediaLifecycleError('MULTIPART_PARTS_REQUIRED', 'completed parts required');
  }
  const normalised = parts.map((part) => ({
    partNumber: Number(part.partNumber),
    etag: String(part.etag || '').replaceAll('"', ''),
  }));
  if (normalised.some(({ partNumber, etag }) => (
    !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000 || !etag
  ))) {
    throw new MediaLifecycleError('MULTIPART_PART_INVALID', 'invalid multipart part');
  }
  const ordered = [...normalised].sort((a, b) => a.partNumber - b.partNumber);
  if (new Set(ordered.map(({ partNumber }) => partNumber)).size !== ordered.length) {
    throw new MediaLifecycleError('MULTIPART_PART_DUPLICATE', 'duplicate multipart part number');
  }
  return ordered;
}

export async function finishMultipart({
  actorId,
  itemId,
  key,
  uploadId,
  parts,
  request,
}, { pool = getPool(), complete = completeMultipart } = {}) {
  const pending = await pool.query(
    `SELECT * FROM media_uploads
     WHERE id = $1 AND r2_key = $2 AND uploaded_by = $3`,
    [itemId, key, actorId],
  );
  const row = pending.rows[0];
  if (!row || row.multipart_upload_id !== uploadId) {
    throw new MediaLifecycleError('MULTIPART_OWNERSHIP_MISMATCH', 'multipart upload not found', 404);
  }
  const ordered = validateMultipartParts(parts);
  if (row.status === 'uploaded' || row.status === 'confirmed') {
    return { itemId, key, parts: row.completed_parts_jsonb, idempotent: true };
  }
  await complete(key, uploadId, ordered);
  await pool.query(
    `UPDATE media_uploads
     SET status = 'uploaded', completed_parts_jsonb = $2::jsonb, updated_at = NOW()
     WHERE id = $1`,
    [itemId, JSON.stringify(ordered)],
  );
  const client = await pool.connect();
  try {
    await auditMutation(client, {
      actorId,
      action: 'media.multipart.complete',
      targetKind: 'media_upload',
      targetId: itemId,
      after: { partCount: ordered.length },
      request,
    });
  } finally {
    client.release();
  }
  return { itemId, key, parts: ordered, idempotent: false };
}

export async function abandonMultipart({
  actorId,
  itemId,
  key,
  uploadId,
  request,
}, { pool = getPool(), abort = abortMultipart } = {}) {
  const result = await pool.query(
    `SELECT * FROM media_uploads
     WHERE id = $1 AND r2_key = $2 AND uploaded_by = $3`,
    [itemId, key, actorId],
  );
  const row = result.rows[0];
  if (!row || row.multipart_upload_id !== uploadId) {
    throw new MediaLifecycleError('MULTIPART_OWNERSHIP_MISMATCH', 'multipart upload not found', 404);
  }
  if (row.status !== 'aborted') await abort(key, uploadId);
  await pool.query(
    `UPDATE media_uploads SET status = 'aborted', updated_at = NOW() WHERE id = $1`,
    [itemId],
  );
  const client = await pool.connect();
  try {
    await auditMutation(client, {
      actorId,
      action: 'media.multipart.abort',
      targetKind: 'media_upload',
      targetId: itemId,
      after: { status: 'aborted' },
      request,
    });
  } finally {
    client.release();
  }
  return { ok: true, itemId, idempotent: row.status === 'aborted' };
}

export async function retainGalleryItem({
  actorId,
  itemId,
  request,
  retentionDays = DEFAULT_RETENTION_DAYS,
}, { pool = getPool(), now = () => new Date() } = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query(
      `SELECT * FROM gallery_items WHERE id = $1 FOR UPDATE`,
      [itemId],
    );
    const item = found.rows[0];
    if (!item) throw new MediaLifecycleError('GALLERY_ITEM_NOT_FOUND', 'gallery item not found', 404);
    const retainedAt = now();
    const retentionUntil = new Date(retainedAt.getTime() + retentionDays * 86400000);
    const keys = [
      item.metadata_jsonb?.r2Key,
      item.metadata_jsonb?.posterKey,
      item.metadata_jsonb?.r2Key ? thumbKeyForMediaKey(item.metadata_jsonb.r2Key) : null,
    ].filter(Boolean);
    await client.query(
      `UPDATE gallery_items SET deleted_at = $2, updated_at = $2 WHERE id = $1`,
      [itemId, retainedAt],
    );
    for (const storageKey of new Set(keys)) {
      await client.query(
        `INSERT INTO deletion_queue (
           id, resource_kind, resource_id, storage_key, status, lifecycle_status, scheduled_at,
           retention_until, attempts, updated_at
         ) VALUES ($1,'gallery_item',$2,$3,'pending','retained',$4,$4,0,$5)
         ON CONFLICT (resource_kind, resource_id, storage_key) DO UPDATE SET
           status = 'pending', lifecycle_status = 'retained', scheduled_at = EXCLUDED.scheduled_at,
           retention_until = EXCLUDED.retention_until, processed_at = NULL,
           error_code = NULL, last_error = NULL, updated_at = EXCLUDED.updated_at`,
        [ulid(), itemId, storageKey, retentionUntil, retainedAt],
      );
    }
    await auditMutation(client, {
      actorId,
      action: 'media.delete.retain',
      targetKind: 'gallery_item',
      targetId: itemId,
      before: { deletedAt: item.deleted_at },
      after: { retentionUntil: retentionUntil.toISOString(), objectCount: new Set(keys).size },
      request,
    });
    await client.query('COMMIT');
    return { itemId, status: 'retained', retentionUntil };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function restoreGalleryItem({
  actorId,
  itemId,
  request,
}, { pool = getPool(), now = () => new Date() } = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const queue = await client.query(
      `SELECT * FROM deletion_queue
       WHERE resource_kind = 'gallery_item' AND resource_id = $1 FOR UPDATE`,
      [itemId],
    );
    if (!queue.rows.length) throw new MediaLifecycleError('DELETE_QUEUE_NOT_FOUND', 'retained deletion not found', 404);
    if (queue.rows.some(({ lifecycle_status: status, retention_until: until }) => (
      status === 'deleted' || (until && new Date(until) <= now())
    ))) {
      throw new MediaLifecycleError('RETENTION_EXPIRED', 'retention period has expired', 409);
    }
    await client.query('UPDATE gallery_items SET deleted_at = NULL, updated_at = NOW() WHERE id = $1', [itemId]);
    await client.query(
      `DELETE FROM deletion_queue
       WHERE resource_kind = 'gallery_item' AND resource_id = $1`,
      [itemId],
    );
    await auditMutation(client, {
      actorId,
      action: 'media.delete.restore',
      targetKind: 'gallery_item',
      targetId: itemId,
      after: { restored: true },
      request,
    });
    await client.query('COMMIT');
    return { itemId, status: 'restored' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function processDeletionQueue({
  itemId = null,
  limit = 25,
  force = false,
  actorId = null,
  request,
}, { pool = getPool(), removeObject = deleteObject, now = () => new Date() } = {}) {
  const current = now();
  if (itemId && force) {
    await pool.query(
      `UPDATE deletion_queue
       SET status = 'pending', lifecycle_status = 'pending', scheduled_at = $2, updated_at = $2
       WHERE resource_kind = 'gallery_item' AND resource_id = $1 AND lifecycle_status <> 'deleted'`,
      [itemId, current],
    );
  }
  await pool.query(
    `UPDATE deletion_queue SET status = 'pending', lifecycle_status = 'pending', updated_at = $1
     WHERE lifecycle_status = 'retained' AND retention_until <= $1`,
    [current],
  );
  const due = await pool.query(
    `SELECT * FROM deletion_queue
     WHERE lifecycle_status IN ('pending','failed') AND scheduled_at <= $1
       AND ($2::text IS NULL OR resource_id = $2)
     ORDER BY scheduled_at, created_at LIMIT $3`,
    [current, itemId, Math.min(Number(limit) || 25, 100)],
  );
  const results = [];
  for (const row of due.rows) {
    try {
      if (row.storage_key) await removeObject(row.storage_key);
      await pool.query(
        `UPDATE deletion_queue
         SET status = 'completed', lifecycle_status = 'deleted',
             attempts = attempts + 1, processed_at = NOW(),
             error_code = NULL, last_error = NULL, updated_at = NOW()
         WHERE id = $1`,
        [row.id],
      );
      results.push({ id: row.id, resourceId: row.resource_id, status: 'deleted' });
    } catch (error) {
      const errorCode = error?.name || 'R2_DELETE_FAILED';
      await pool.query(
        `UPDATE deletion_queue
         SET status = 'failed', lifecycle_status = 'failed',
             attempts = attempts + 1, error_code = $2,
             last_error = $3, scheduled_at = NOW() + INTERVAL '1 hour', updated_at = NOW()
         WHERE id = $1`,
        [row.id, errorCode, String(error.message || errorCode).slice(0, 500)],
      );
      results.push({ id: row.id, resourceId: row.resource_id, status: 'failed', errorCode });
    }
  }
  if (results.length) {
    const client = await pool.connect();
    try {
      await auditMutation(client, {
        actorId,
        action: force ? 'media.delete.purge' : 'media.delete.process',
        targetKind: 'deletion_queue',
        targetId: itemId,
        after: {
          deleted: results.filter(({ status }) => status === 'deleted').length,
          failed: results.filter(({ status }) => status === 'failed').length,
        },
        request,
      });
    } finally {
      client.release();
    }
  }
  return { processed: results.length, results };
}

export async function cleanupExpiredUploads({
  limit = 50,
  actorId = null,
  request,
}, {
  pool = getPool(),
  abort = abortMultipart,
  removeObject = deleteObject,
  now = () => new Date(),
} = {}) {
  const expired = await pool.query(
    `SELECT * FROM media_uploads
     WHERE status IN ('pending','uploading','uploaded') AND expires_at <= $1
     ORDER BY expires_at LIMIT $2`,
    [now(), Math.min(Number(limit) || 50, 100)],
  );
  const results = [];
  for (const row of expired.rows) {
    try {
      if (row.multipart_upload_id) await abort(row.r2_key, row.multipart_upload_id);
      await removeObject(row.r2_key);
      await pool.query(
        `UPDATE media_uploads
         SET status = 'expired', attempts = attempts + 1, last_error_code = NULL, updated_at = NOW()
         WHERE id = $1`,
        [row.id],
      );
      results.push({ id: row.id, status: 'expired' });
    } catch (error) {
      const errorCode = error?.name || 'UPLOAD_CLEANUP_FAILED';
      await pool.query(
        `UPDATE media_uploads
         SET attempts = attempts + 1, last_error_code = $2, updated_at = NOW()
         WHERE id = $1`,
        [row.id, errorCode],
      );
      results.push({ id: row.id, status: 'failed', errorCode });
    }
  }
  if (results.length) {
    const client = await pool.connect();
    try {
      await auditMutation(client, {
        actorId,
        action: 'media.upload.cleanup',
        targetKind: 'media_upload',
        after: {
          expired: results.filter(({ status }) => status === 'expired').length,
          failed: results.filter(({ status }) => status === 'failed').length,
        },
        request,
      });
    } finally {
      client.release();
    }
  }
  return { processed: results.length, results };
}

export async function reconcileMediaOrphans({
  prefix = 'gallery/',
  limitPages = 5,
}, { pool = getPool(), listKeys = listObjectKeys } = {}) {
  const storageKeys = [];
  let continuationToken;
  for (let page = 0; page < limitPages; page += 1) {
    const result = await listKeys(prefix, continuationToken);
    storageKeys.push(...result.keys);
    continuationToken = result.continuationToken;
    if (!continuationToken) break;
  }
  const known = await pool.query(
    `SELECT r2_key FROM media_uploads WHERE r2_key = ANY($1::text[])`,
    [storageKeys],
  );
  const knownKeys = new Set(known.rows.map(({ r2_key: key }) => key));
  return {
    scanned: storageKeys.length,
    orphans: storageKeys.filter((key) => !knownKeys.has(key)),
    truncated: Boolean(continuationToken),
  };
}
