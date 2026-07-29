import { sql } from '../../_lib/db.js';
import { errorResponse, jsonResponse } from '../../_lib/auth.js';
import { vercelHandler } from '../../_lib/adapter.js';

/** Path segment that requests the collection index instead of one collection. */
export const INDEX_SEGMENT = '_index';

/** Rows in this mode are authored but withheld from every public surface. */
const HIDDEN_DISPLAY_MODE = 'hidden';

export function itemFromRow(row) {
  return {
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
    sortIndex: row.sort_index,
    displayMode: row.display_mode,
    groupKey: row.group_key,
    altText: row.alt_text,
    urls: row.urls_jsonb || {
      thumb: row.thumb_url,
      web: row.media_url,
      zoom: row.media_url,
    },
  };
}

/**
 * Split `section/slug/...` into the two-level route the public art section uses.
 * Single-segment collections have no expressible route and are reported separately.
 */
export function routeForCollection(collection) {
  const separator = String(collection ?? '').indexOf('/');
  if (separator < 1) return null;
  return {
    section: collection.slice(0, separator),
    slug: collection.slice(separator + 1),
  };
}

/** Build the same shape the static `/art/manifests/_index.json` provides. */
export function indexFromRows(rows) {
  const sections = {};
  const unrouted = [];
  for (const row of rows) {
    const route = routeForCollection(row.collection);
    const count = Number(row.item_count) || 0;
    if (!route) {
      unrouted.push({ collection: row.collection, count });
      continue;
    }
    if (!sections[route.section]) sections[route.section] = { galleries: [] };
    sections[route.section].galleries.push({
      slug: route.slug,
      title: route.slug.split('/').pop(),
      card_count: count,
      cover: row.cover_thumb || null,
      pages: [],
    });
  }
  return { source: 'api', sections, unrouted };
}

async function readIndex() {
  const { rows } = await sql.query(
    `SELECT collection,
            COUNT(*)::int AS item_count,
            (ARRAY_REMOVE(
               ARRAY_AGG(thumb_url ORDER BY sort_index ASC, created_at ASC), NULL
             ))[1] AS cover_thumb
     FROM gallery_items
     WHERE status = 'published' AND deleted_at IS NULL
       AND display_mode <> $1 AND collection IS NOT NULL
     GROUP BY collection
     ORDER BY collection ASC`,
    [HIDDEN_DISPLAY_MODE],
  );
  return jsonResponse(indexFromRows(rows));
}

async function readCollection(gallery) {
  const { rows } = await sql.query(
    `SELECT id, slug, title, description, media_url, thumb_url, format, source_tool,
            tags, collection, width, height, duration, sha256, filename,
            urls_jsonb, sort_index, gallery_slug, display_mode, group_key, alt_text
     FROM gallery_items
     WHERE collection = $1 AND status = 'published' AND deleted_at IS NULL
       AND display_mode <> $2
     ORDER BY sort_index ASC, created_at ASC`,
    [gallery, HIDDEN_DISPLAY_MODE],
  );

  const items = rows.map(itemFromRow);
  const baseUrl = items[0]?.urls?.web
    ? items[0].urls.web.replace(/\/[^/]+$/, '')
    : '';

  return jsonResponse({ gallery, baseUrl, items });
}

async function handleGet(request) {
  const raw = request.query.gallery;
  const gallery = Array.isArray(raw) ? raw.join('/') : (raw || '');
  if (!gallery) {
    return errorResponse('gallery required', 400);
  }

  try {
    return gallery === INDEX_SEGMENT ? await readIndex() : await readCollection(gallery);
  } catch (err) {
    return errorResponse(err.message || 'read failed', 500);
  }
}

export default vercelHandler(async (req) => {
  if (req.method !== 'GET') return errorResponse('method not allowed', 405);
  return handleGet(req);
});
