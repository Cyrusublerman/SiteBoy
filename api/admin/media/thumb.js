import { sql } from '../../_lib/db.js';
import { generateThumbForItem } from '../../_lib/thumb.js';
import { errorResponse, jsonResponse, requireAdmin } from '../../_lib/auth.js';
import { vercelHandler } from '../../_lib/adapter.js';

async function authorised(request) {
  const bearer = request.headers.get('authorization') || '';
  const token = bearer.replace(/^Bearer\s+/i, '');
  if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) {
    return true;
  }
  return Boolean(await requireAdmin(request));
}

async function handlePost(request) {
  if (!(await authorised(request))) {
    return errorResponse('unauthorized', 401);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is valid */
  }

  const itemId = body.itemId;
  const limit = Math.min(Number(body.limit) || 10, 50);

  try {
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
        const { thumbUrl, skipped } = await generateThumbForItem(row);
        const status = skipped ? 'skipped' : 'done';
        await sql.query(
          `UPDATE gallery_items
           SET thumb_url = $2, thumb_status = $3,
               urls_jsonb = jsonb_set(COALESCE(urls_jsonb, '{}'::jsonb), '{thumb}', to_jsonb($2::text)),
               updated_at = NOW()
           WHERE id = $1`,
          [row.id, thumbUrl, status],
        );
        results.push({ id: row.id, thumbUrl, status });
      } catch (error) {
        await sql.query(
          `UPDATE gallery_items SET thumb_status = 'failed', updated_at = NOW() WHERE id = $1`,
          [row.id],
        );
        results.push({ id: row.id, error: error.message });
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
