/**
 * Import static art manifests into gallery_items rows (C1 data migration).
 *
 * Usage:
 *   node scripts/migration/import-art.js              # stdout SQL
 *   node scripts/migration/import-art.js --write      # INSERT via DATABASE_URL
 *
 * @module scripts/migration/import-art
 */

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..');
const MANIFEST_ROOT = join(ROOT, 'art', 'manifests');

function ulid() {
  const t = Date.now().toString(36).padStart(10, '0');
  const r = createHash('sha256').update(`${Date.now()}-${Math.random()}`).digest('hex').slice(0, 16);
  return (t + r).slice(0, 26);
}

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

function rowFromImage(collection, img, sortIndex) {
  const id = ulid();
  const slug = img.id || img.filename || `item-${sortIndex}`;
  const filename = img.filename || `${slug}.jpg`;
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
  };
}

function parseManifest(path) {
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
  slug, title, description, media_url, thumb_url, format, tags, collection, thumb_status
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
  '${sqlEscape(row.thumbStatus)}'
) ON CONFLICT (id) DO NOTHING;`;
}

async function writeToDb(statements) {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    console.error('DATABASE_URL or POSTGRES_URL required for --write');
    process.exit(1);
  }
  const { sql } = await import('@vercel/postgres');
  for (const stmt of statements) {
    await sql.query(stmt);
  }
}

function main() {
  const write = process.argv.includes('--write');
  const manifests = walkManifests(MANIFEST_ROOT);
  const statements = [];
  let itemCount = 0;

  for (const path of manifests) {
    const { collection, rows, total } = parseManifest(path);
    if (!rows.length) continue;
    itemCount += rows.length;
    console.log(`# ${collection}: ${total} images`);
    for (const row of rows) {
      statements.push(toInsertSql(row));
    }
  }

  if (write) {
    writeToDb(statements).then(() => {
      console.log(`Imported ${itemCount} items into gallery_items`);
    }).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  } else {
    for (const stmt of statements) {
      console.log(stmt);
    }
    console.log(`# Total: ${itemCount} INSERT statements`);
  }
}

main();
