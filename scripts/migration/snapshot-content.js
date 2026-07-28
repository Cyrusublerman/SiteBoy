/**
 * Export editable content to a portable, timestamped snapshot artefact.
 *
 * Usage:
 *   node scripts/migration/snapshot-content.js                    # JSON dry-run report, writes no file
 *   node scripts/migration/snapshot-content.js --write            # writes the artefact via DATABASE_URL
 *   node scripts/migration/snapshot-content.js --write --out=path.json
 *
 * @module scripts/migration/snapshot-content
 */

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..');

export const SNAPSHOT_FORMAT = 'siteboy-content-snapshot';
export const SNAPSHOT_VERSION = 1;
export const SNAPSHOT_DIR = join(ROOT, 'snapshots');

/**
 * Editable content owned by the 0005/0006 content model. `content_versions`
 * and `deletion_queue` are also created by 0005 but are processor state, not
 * editable content, so they are deliberately excluded.
 */
export const SNAPSHOT_TABLES = Object.freeze([
  'galleries',
  'gallery_items',
  'articles',
  'page_blocks',
]);

export const IDENTIFIER_PATTERN = /^[a-z][a-z0-9_]*$/;

/** Order-independent representation so the checksum tracks content, not row order. */
export function canonicalise(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalise);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalise(value[key])]),
    );
  }
  return value;
}

export function snapshotChecksum(rowsByTable) {
  const canonical = Object.fromEntries(
    Object.keys(rowsByTable).sort().map((table) => [table, rowsByTable[table]]),
  );
  return createHash('sha256').update(JSON.stringify(canonical), 'utf8').digest('hex');
}

export function snapshotFilename(createdAt = new Date()) {
  return `content-${createdAt.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')}.json`;
}

export function buildSnapshot(rowsByTable, { createdAt = new Date() } = {}) {
  const rows = {};
  for (const table of SNAPSHOT_TABLES) {
    rows[table] = (rowsByTable[table] || [])
      .map(canonicalise)
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }
  return {
    format: SNAPSHOT_FORMAT,
    version: SNAPSHOT_VERSION,
    createdAt: createdAt.toISOString(),
    tables: [...SNAPSHOT_TABLES],
    counts: Object.fromEntries(SNAPSHOT_TABLES.map((table) => [table, rows[table].length])),
    checksum: snapshotChecksum(rows),
    rows,
  };
}

export function parseSnapshotArgs(argv = []) {
  const out = argv.find((argument) => argument.startsWith('--out='));
  return {
    write: argv.includes('--write'),
    out: out ? out.slice('--out='.length) : null,
  };
}

export async function readContentTables(query) {
  const rowsByTable = {};
  for (const table of SNAPSHOT_TABLES) {
    if (!IDENTIFIER_PATTERN.test(table)) throw new Error(`Unsafe table name: ${table}`);
    const result = await query(`SELECT * FROM ${table} ORDER BY id`);
    rowsByTable[table] = result.rows;
  }
  return rowsByTable;
}

async function withPool(run) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL required to read content tables');
  const [{ Pool, neonConfig }, { default: ws }] = await Promise.all([
    import('@neondatabase/serverless'),
    import('ws'),
  ]);
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    return await run((text, params = []) => pool.query(text, params));
  } finally {
    await pool.end();
  }
}

async function main() {
  const { write, out } = parseSnapshotArgs(process.argv);
  const rowsByTable = await withPool(readContentTables);
  const snapshot = buildSnapshot(rowsByTable);

  const report = {
    mode: write ? 'write' : 'dry-run',
    source: 'postgres',
    format: snapshot.format,
    version: snapshot.version,
    createdAt: snapshot.createdAt,
    counts: snapshot.counts,
    checksum: snapshot.checksum,
    artefact: null,
  };

  if (write) {
    const target = out || join(SNAPSHOT_DIR, snapshotFilename(new Date(snapshot.createdAt)));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    report.artefact = target;
  }

  process.stdout.write(`${JSON.stringify(report)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
    process.exitCode = 1;
  });
}
