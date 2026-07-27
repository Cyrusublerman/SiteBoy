/**
 * Import static art manifests into gallery_items rows (C1 data migration).
 *
 * Usage:
 *   node scripts/migration/import-art.js              # JSON dry-run report
 *   node scripts/migration/import-art.js --write      # idempotent upsert via DATABASE_URL
 *
 * @module scripts/migration/import-art
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stableUlid, writeStatements } from './content-import-utils.js';
export { stableUlid } from './content-import-utils.js';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..');
const MANIFEST_ROOT = join(ROOT, 'art', 'manifests');

function formatFromFilename(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const map = {
    jpg: 'jpeg', jpeg: 'jpeg', png: 'png', webp: 'webp', gif: 'gif',
    mp4: 'mp4', webm: 'webm', glb: 'glb', splat: 'splat',
  };
  return map[ext] || ext || 'unknown';
}

function walkManifests(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkManifests(full, files);
    } else if (entry === 'manifest.json') {
      files.push(full);
    }
  }
  return files;
}

function sqlEscape(s) {
  return String(s ?? '').replace(/'/g, "''");
}

export function rowFromImage(collection, img, sortIndex) {
  const slug = img.id || img.filename || `item-${sortIndex}`;
  const filename = img.filename || `${slug}.jpg`;
  const id = stableUlid(`gallery-item:${collection}:${slug}`);
  const urls = img.urls || {};
  const thumb = urls.thumb || null;
  const web = urls.web || urls.zoom || thumb;
  const zoom = urls.zoom || web;
  const urlsJson = JSON.stringify({ thumb, web, zoom });
  const format = formatFromFilename(filename);
  const title = img.title || slug;
  const description = img.caption || img.alt || '';
  const tags = JSON.stringify(img.tags || []);
  const meta = JSON.stringify({ importedFrom: 'manifest', manifestId: slug });

  return {
    id,
    gallerySlug: collection,
    collection,
    sortIndex,
    filename,
    slug,
    title,
    description,
    mediaUrl: web,
    thumbUrl: thumb,
    format,
    urlsJson,
    tags,
    meta,
    thumbStatus: thumb ? 'done' : 'pending',
    altText: img.alt || title,
    displayMode: img.display_mode || img.displayMode || 'grid',
    groupKey: img.group_key || img.groupKey || null,
  };
}

export function parseManifest(path) {
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const rel = relative(MANIFEST_ROOT, path).replace(/\\/g, '/');
  const parts = rel.split('/');
  parts.pop(); // manifest.json
  const galleryType = parts[0];
  const galleryName = parts.slice(1).join('/');
  const collection = galleryName ? `${galleryType}/${galleryName}` : galleryType;
  const images = raw.images || [];
  const rows = images.map((img, i) => rowFromImage(collection, img, i));
  return { collection, galleryType, galleryName, rows, total: images.length };
}

function toInsertSql(row) {
  return `INSERT INTO gallery_items (
  id, gallery_slug, sort_index, filename, urls_jsonb, metadata_jsonb, status,
  slug, title, description, media_url, thumb_url, format, tags, collection, thumb_status,
  alt_text, display_mode, group_key
) VALUES (
  '${sqlEscape(row.id)}',
  '${sqlEscape(row.gallerySlug)}',
  ${row.sortIndex},
  '${sqlEscape(row.filename)}',
  '${sqlEscape(row.urlsJson)}'::jsonb,
  '${sqlEscape(row.meta)}'::jsonb,
  'published',
  '${sqlEscape(row.slug)}',
  '${sqlEscape(row.title)}',
  '${sqlEscape(row.description)}',
  '${sqlEscape(row.mediaUrl)}',
  ${row.thumbUrl ? `'${sqlEscape(row.thumbUrl)}'` : 'NULL'},
  '${sqlEscape(row.format)}',
  '${sqlEscape(row.tags)}'::jsonb,
  '${sqlEscape(row.collection)}',
  '${sqlEscape(row.thumbStatus)}',
  '${sqlEscape(row.altText)}',
  '${sqlEscape(row.displayMode)}',
  ${row.groupKey ? `'${sqlEscape(row.groupKey)}'` : 'NULL'}
) ON CONFLICT (gallery_slug, slug) DO UPDATE SET
  sort_index = EXCLUDED.sort_index,
  filename = EXCLUDED.filename,
  urls_jsonb = EXCLUDED.urls_jsonb,
  metadata_jsonb = EXCLUDED.metadata_jsonb,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  media_url = EXCLUDED.media_url,
  thumb_url = EXCLUDED.thumb_url,
  format = EXCLUDED.format,
  tags = EXCLUDED.tags,
  collection = EXCLUDED.collection,
  thumb_status = EXCLUDED.thumb_status,
  alt_text = EXCLUDED.alt_text,
  display_mode = EXCLUDED.display_mode,
  group_key = EXCLUDED.group_key,
  updated_at = NOW();`;
}

function toGallerySql(collection) {
  const [kind] = collection.split('/');
  return `INSERT INTO galleries (id, slug, kind, title, status)
VALUES (
  '${stableUlid(`gallery:${collection}`)}',
  '${sqlEscape(collection)}',
  '${['photos', 'digital', 'render', 'book', 'physical', 'objects', 'project'].includes(kind) ? kind : 'photos'}',
  '${sqlEscape(collection.split('/').pop())}',
  'published'
) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, updated_at = NOW();`;
}

export async function buildArtImport() {
  const manifests = walkManifests(MANIFEST_ROOT);
  const collections = [];
  const allRows = [];
  const statements = [];
  let itemCount = 0;
  for (const path of manifests) {
    const { collection, rows } = parseManifest(path);
    if (!rows.length) continue;
    collections.push(collection);
    allRows.push(...rows);
    statements.push(toGallerySql(collection), ...rows.map(toInsertSql));
    itemCount += rows.length;
  }
  return {
    statements,
    rows: allRows,
    report: {
      mode: 'dry-run',
      source: 'art/manifests',
      galleries: collections.length,
      items: itemCount,
      conflicts: 0,
    },
  };
}

async function main() {
  const write = process.argv.includes('--write');
  const { statements, report } = await buildArtImport();

  if (write) {
    await writeStatements(statements);
    report.mode = 'write';
  } else {
    report.statements = statements.length;
  }
  process.stdout.write(`${JSON.stringify(report)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
    process.exitCode = 1;
  });
}
