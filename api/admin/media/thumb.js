import { sql } from '../../_lib/db.js';
import { generateThumbForItem } from '../../_lib/thumb.js';
import { errorResponse, jsonResponse, requireAdmin } from '../../_lib/auth.js';
import { writeAuditLog } from '../../_lib/audit.js';
import { vercelHandler } from '../../_lib/adapter.js';
import {
  cleanupExpiredUploads,
  processDeletionQueue,
  reconcileMediaOrphans,
} from './_lifecycle.js';

async function authorised(request) {
  const bearer = request.headers.get('authorization') || '';
  const token = bearer.replace(/^Bearer\s+/i, '');
  if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) {
    return { userId: null, mode: 'cron' };
  }
  return requireAdmin(request);
}

async function handlePost(request) {
  const actor = await authorised(request);
  if (actor.error) return actor.error;

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is valid */
  }

  const itemId = body.itemId;
  const limit = Math.min(Number(body.limit) || 10, 50);

  try {
    if (body.action === 'cleanup-uploads') {
      return jsonResponse(await cleanupExpiredUploads({
        limit,
        actorId: actor.userId,
        request,
      }));
    }
    if (body.action === 'process-deletions') {
      return jsonResponse(await processDeletionQueue({
        limit,
        actorId: actor.userId,
        request,
      }));
    }
    if (body.action === 'reconcile-orphans') {
      const result = await reconcileMediaOrphans({ prefix: body.prefix || 'gallery/' });
      await writeAuditLog({
        actorId: actor.userId,
        action: 'media.orphan.reconcile',
        targetKind: 'media_upload',
        after: { scanned: result.scanned, orphanCount: result.orphans.length, truncated: result.truncated },
        req: request,
      });
      return jsonResponse(result);
    }
    let rows;
    if (itemId) {
      const result = await sql.query('SELECT * FROM gallery_items WHERE id = $1', [itemId]);
      rows = result.rows;
    } else {
      const result = await sql.query(
        `SELECT * FROM gallery_items
         WHERE thumb_status = 'pending' OR thumb_url IS NULL
         ORDER BY created_at ASC
         LIMIT $1`,
        [limit],
      );
      rows = result.rows;
    }

    const results = [];
    for (const row of rows) {
      try {
        const { thumbUrl, fallbackType } = await generateThumbForItem(row);
        const status = 'done';
        await sql.query(
          `UPDATE gallery_items
           SET thumb_url = $2, thumb_status = $3, thumb_attempts = thumb_attempts + 1,
               thumb_error_code = NULL,
               urls_jsonb = jsonb_set(COALESCE(urls_jsonb, '{}'::jsonb), '{thumb}', to_jsonb($2::text)),
               metadata_jsonb = CASE WHEN $4::text IS NULL THEN metadata_jsonb
                 ELSE jsonb_set(COALESCE(metadata_jsonb, '{}'::jsonb), '{thumbFallbackType}', to_jsonb($4::text))
               END,
               updated_at = NOW()
           WHERE id = $1`,
          [row.id, thumbUrl, status, fallbackType || null],
        );
        await writeAuditLog({
          actorId: actor.userId,
          action: 'media.thumbnail.update',
          targetKind: 'gallery_item',
          targetId: row.id,
          before: { thumbUrl: row.thumb_url, thumbStatus: row.thumb_status },
          after: {
            thumbUrl,
            thumbStatus: status,
            fallbackType: fallbackType || null,
            actorMode: actor.mode ?? 'admin',
          },
          req: request,
        });
        results.push({ id: row.id, thumbUrl, status });
      } catch (error) {
        const errorCode = error?.name || 'THUMBNAIL_PROCESSING_FAILED';
        await sql.query(
          `UPDATE gallery_items
           SET thumb_status = 'failed', thumb_attempts = thumb_attempts + 1,
               thumb_error_code = $2, updated_at = NOW()
           WHERE id = $1`,
          [row.id, errorCode],
        );
        await writeAuditLog({
          actorId: actor.userId,
          action: 'media.thumbnail.fail',
          targetKind: 'gallery_item',
          targetId: row.id,
          before: { thumbUrl: row.thumb_url, thumbStatus: row.thumb_status },
          after: {
            thumbStatus: 'failed',
            errorCode,
            actorMode: actor.mode ?? 'admin',
          },
          req: request,
        });
        results.push({ id: row.id, errorCode });
      }
    }

    return jsonResponse({ processed: results.length, results });
  } catch (error) {
    return errorResponse(error.message || 'thumb failed', 500);
  }
}

export default vercelHandler(async (request) => {
  if (request.method !== 'POST') return errorResponse('method not allowed', 405);
  return handlePost(request);
});
