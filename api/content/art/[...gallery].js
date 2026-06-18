import { sql } from '../../_lib/db.js';
import { errorResponse, jsonResponse } from '../../_lib/auth.js';
import { vercelHandler } from '../../_lib/adapter.js';

async function handleGet(request) {
  const raw = request.query.gallery;
  const gallery = Array.isArray(raw) ? raw.join('/') : (raw || '');
  if (!gallery) {
    return errorResponse('gallery required', 400);
  }

  try {
    const { rows } = await sql.query(
      `SELECT id, slug, title, description, media_url, thumb_url, format, source_tool,
              tags, collection, width, height, duration, sha256, filename,
              urls_jsonb, sort_index, gallery_slug
       FROM gallery_items
       WHERE collection = $1 AND status = 'published'
       ORDER BY sort_index ASC, created_at ASC`,
      [gallery],
    );

    const items = rows.map((row) => ({
      id: row.id,
      slug: row.slug || row.id,
      title: row.title,
      description: row.description,
      mediaUrl: row.media_url,
      thumbUrl: row.thumb_url,
      format: row.format,
      sourceTool: row.source_tool,
      tags: row.tags || [],
      collection: row.collection,
      width: row.width,
      height: row.height,
      duration: row.duration,
      sha256: row.sha256,
      filename: row.filename,
      urls: row.urls_jsonb || {
        thumb: row.thumb_url,
        web: row.media_url,
        zoom: row.media_url,
      },
    }));

    const baseUrl = items[0]?.urls?.web
      ? items[0].urls.web.replace(/\/[^/]+$/, '')
      : '';

    return jsonResponse({ gallery, baseUrl, items });
  } catch (err) {
    return errorResponse(err.message || 'read failed', 500);
  }
}

export default vercelHandler(async (req) => {
  if (req.method !== 'GET') return errorResponse('method not allowed', 405);
  return handleGet(req);
});
