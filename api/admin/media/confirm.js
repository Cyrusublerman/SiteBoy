import { sql } from '../../_lib/db.js';
import { publicUrl } from '../../_lib/r2.js';
import { requireAdmin, errorResponse, jsonResponse } from '../../_lib/auth.js';
import { vercelHandler } from '../../_lib/adapter.js';

function formatFromMime(mime) {
  const map = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'model/gltf-binary': 'glb',
  };
  return map[mime] || (mime.split('/').pop() || 'unknown');
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

  const key = body.key;
  const itemId = body.itemId;
  if (!key || !itemId) {
    return errorResponse('key and itemId required', 400);
  }

  const mime = body.mime || 'application/octet-stream';
  const bytes = Number(body.bytes) || 0;
  const sha256 = body.sha256 || null;
  const collection = body.collection || 'digital/generative';
  const gallerySlug = collection;
  const filename = key.split('/').pop();
  const mediaUrl = publicUrl(key);
  const thumbUrl = body.thumbUrl || null;
  const format = body.format || formatFromMime(mime);
  const title = body.title || filename;
  const description = body.description || '';
  const sourceTool = body.sourceTool || null;
  const tags = body.tags || [];
  const width = body.width ?? null;
  const height = body.height ?? null;
  const duration = body.duration ?? null;
  const slug = body.slug || filename.replace(/\.[^.]+$/, '');
  const urlsJson = { thumb: thumbUrl, web: mediaUrl, zoom: mediaUrl };
  const metaJson = { r2Key: key };

  try {
    await sql.query(
      `INSERT INTO media_uploads (id, r2_key, mime, bytes, sha256, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (r2_key) DO UPDATE SET mime = $3, bytes = $4, sha256 = $5`,
      [itemId, key, mime, bytes, sha256, actor.userId],
    );

    const sortResult = await sql.query(
      `SELECT COALESCE(MAX(sort_index), -1) + 1 AS next FROM gallery_items WHERE collection = $1`,
      [collection],
    );
    const sortIndex = sortResult.rows[0]?.next ?? 0;

    await sql.query(
      `INSERT INTO gallery_items (
        id, gallery_slug, sort_index, filename, urls_jsonb, metadata_jsonb, status,
        slug, title, description, media_url, thumb_url, format, source_tool, tags,
        collection, width, height, duration, sha256, thumb_status, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5::jsonb, $6::jsonb, 'published',
        $7, $8, $9, $10, $11, $12, $13, $14::jsonb,
        $15, $16, $17, $18, $19, $20, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        media_url = $10, thumb_url = $11, urls_jsonb = $5::jsonb,
        updated_at = NOW(), thumb_status = $20`,
      [
        itemId, gallerySlug, sortIndex, filename, JSON.stringify(urlsJson), JSON.stringify(metaJson),
        slug, title, description, mediaUrl, thumbUrl, format, sourceTool, JSON.stringify(tags),
        collection, width, height, duration, sha256,
        thumbUrl ? 'done' : 'pending',
      ],
    );

    const cronSecret = process.env.CRON_SECRET;
    if (!thumbUrl && cronSecret) {
      const host = request.headers.get('x-forwarded-host') || process.env.VERCEL_URL;
      const proto = request.headers.get('x-forwarded-proto') || 'https';
      if (host) {
        try {
          await fetch(`${proto}://${host}/api/admin/media/thumb`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cronSecret}`,
            },
            body: JSON.stringify({ itemId }),
          });
        } catch {
          /* cron backfill */
        }
      }
    }

    return jsonResponse({ ok: true, itemId, mediaUrl, thumbUrl, collection });
  } catch (err) {
    return errorResponse(err.message || 'confirm failed', 500);
  }
}

export default vercelHandler(async (req) => {
  if (req.method !== 'POST') return errorResponse('method not allowed', 405);
  return handlePost(req);
});
