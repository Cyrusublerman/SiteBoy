/**
 * Restore editable content from a snapshot artefact produced by snapshot-content.js.
 *
 * Usage:
 *   node scripts/migration/restore-content.js --from=snapshots/x.json
 *     JSON dry-run plan naming every row that would be inserted or overwritten.
 *   node scripts/migration/restore-content.js --from=snapshots/x.json --write
 *     Applies the plan. Refuses when the plan overwrites existing rows.
 *   node scripts/migration/restore-content.js --from=snapshots/x.json --write --overwrite
 *     Applies the plan including the overwrites listed by the dry-run.
 *
 * @module scripts/migration/restore-content
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { jsonLiteral, sqlLiteral, writeStatements } from './content-import-utils.js';
import {
  IDENTIFIER_PATTERN,
  SNAPSHOT_FORMAT,
  SNAPSHOT_TABLES,
  SNAPSHOT_VERSION,
  snapshotChecksum,
} from './snapshot-content.js';

export class SnapshotError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function parseRestoreArgs(argv = []) {
  const from = argv.find((argument) => argument.startsWith('--from='));
  return {
    from: from ? from.slice('--from='.length) : null,
    write: argv.includes('--write'),
    overwrite: argv.includes('--overwrite'),
  };
}

export function verifySnapshot(artefact) {
  if (!artefact || typeof artefact !== 'object' || Array.isArray(artefact)) {
    throw new SnapshotError('SNAPSHOT_MALFORMED', 'snapshot must be a JSON object');
  }
  if (artefact.format !== SNAPSHOT_FORMAT) {
    throw new SnapshotError('SNAPSHOT_FORMAT_UNKNOWN', `unsupported snapshot format: ${artefact.format}`);
  }
  if (artefact.version !== SNAPSHOT_VERSION) {
    throw new SnapshotError('SNAPSHOT_VERSION_UNSUPPORTED', `unsupported snapshot version: ${artefact.version}`);
  }
  if (!Array.isArray(artefact.tables) || !artefact.tables.length) {
    throw new SnapshotError('SNAPSHOT_TABLES_MISSING', 'snapshot declares no tables');
  }
  const unknown = artefact.tables.filter((table) => !SNAPSHOT_TABLES.includes(table));
  if (unknown.length) {
    throw new SnapshotError('SNAPSHOT_TABLE_UNKNOWN', `snapshot names tables outside the content model: ${unknown.join(', ')}`);
  }
  for (const table of artefact.tables) {
    const rows = artefact.rows?.[table];
    if (!Array.isArray(rows)) {
      throw new SnapshotError('SNAPSHOT_ROWS_MISSING', `snapshot has no rows array for ${table}`);
    }
    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row) || !row.id) {
        throw new SnapshotError('SNAPSHOT_ROW_INVALID', `${table} contains a row without an id`);
      }
      const badColumn = Object.keys(row).find((column) => !IDENTIFIER_PATTERN.test(column));
      if (badColumn) {
        throw new SnapshotError('SNAPSHOT_COLUMN_INVALID', `${table} contains an unsafe column name: ${badColumn}`);
      }
    }
  }
  if (snapshotChecksum(artefact.rows) !== artefact.checksum) {
    throw new SnapshotError('SNAPSHOT_CHECKSUM_MISMATCH', 'snapshot checksum does not match its rows');
  }
  return artefact;
}

/**
 * @param {object} artefact verified snapshot
 * @param {Record<string, string[]>} existingIdsByTable ids currently present in the database
 */
export function planRestore(artefact, existingIdsByTable = {}) {
  const inserts = {};
  const overwrites = {};
  let insertCount = 0;
  let overwriteCount = 0;
  for (const table of artefact.tables) {
    const existing = new Set(existingIdsByTable[table] || []);
    const ids = artefact.rows[table].map(({ id }) => String(id));
    inserts[table] = ids.filter((id) => !existing.has(id));
    overwrites[table] = ids.filter((id) => existing.has(id));
    insertCount += inserts[table].length;
    overwriteCount += overwrites[table].length;
  }
  return { inserts, overwrites, insertCount, overwriteCount };
}

/**
 * Restore is dry-run by default and never silently replaces existing rows.
 * @returns {string|null} refusal code, or null when the restore may proceed
 */
export function restoreRefusal(plan, { write = false, overwrite = false } = {}) {
  if (!write) return 'DRY_RUN';
  if (plan.overwriteCount && !overwrite) return 'OVERWRITE_NOT_PERMITTED';
  return null;
}

function literalFor(value) {
  if (value == null) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') return jsonLiteral(value);
  return sqlLiteral(value);
}

export function buildRestoreStatements(artefact) {
  const statements = [];
  for (const table of artefact.tables) {
    if (!IDENTIFIER_PATTERN.test(table)) throw new SnapshotError('SNAPSHOT_TABLE_UNKNOWN', `unsafe table name: ${table}`);
    for (const row of artefact.rows[table]) {
      const columns = Object.keys(row).sort();
      const values = columns.map((column) => literalFor(row[column]));
      const assignments = columns
        .filter((column) => column !== 'id')
        .map((column) => `${column} = EXCLUDED.${column}`);
      statements.push(
        `INSERT INTO ${table} (${columns.join(', ')})\n`
        + `VALUES (${values.join(', ')})\n`
        + `ON CONFLICT (id) DO UPDATE SET ${assignments.join(', ')};`,
      );
    }
  }
  return statements;
}

export function readSnapshot(path) {
  return verifySnapshot(JSON.parse(readFileSync(path, 'utf8')));
}

async function readExistingIds(tables) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new SnapshotError('DATABASE_URL_MISSING', 'DATABASE_URL required to plan a restore');
  const [{ Pool, neonConfig }, { default: ws }] = await Promise.all([
    import('@neondatabase/serverless'),
    import('ws'),
  ]);
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    const existing = {};
    for (const table of tables) {
      if (!IDENTIFIER_PATTERN.test(table)) throw new SnapshotError('SNAPSHOT_TABLE_UNKNOWN', `unsafe table name: ${table}`);
      const result = await pool.query(`SELECT id FROM ${table}`);
      existing[table] = result.rows.map(({ id }) => String(id));
    }
    return existing;
  } finally {
    await pool.end();
  }
}

async function main() {
  const { from, write, overwrite } = parseRestoreArgs(process.argv);
  if (!from) throw new SnapshotError('SNAPSHOT_PATH_REQUIRED', '--from=<snapshot.json> is required');

  const artefact = readSnapshot(from);
  const plan = planRestore(artefact, await readExistingIds(artefact.tables));
  const report = {
    mode: write ? 'write' : 'dry-run',
    source: from,
    createdAt: artefact.createdAt,
    checksum: artefact.checksum,
    inserts: plan.inserts,
    overwrites: plan.overwrites,
    insertCount: plan.insertCount,
    overwriteCount: plan.overwriteCount,
  };

  const refusal = restoreRefusal(plan, { write, overwrite });
  if (refusal === 'DRY_RUN') {
    report.hint = plan.overwriteCount
      ? 'rerun with --write --overwrite to apply, replacing the rows listed under overwrites'
      : 'rerun with --write to apply';
    process.stdout.write(`${JSON.stringify(report)}\n`);
    return;
  }
  if (refusal) {
    report.mode = 'refused';
    report.refused = refusal;
    process.stdout.write(`${JSON.stringify(report)}\n`);
    process.exitCode = 1;
    return;
  }

  await writeStatements(buildRestoreStatements(artefact));
  process.stdout.write(`${JSON.stringify(report)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    process.stderr.write(`${JSON.stringify({ error: error.message, code: error.code ?? null })}\n`);
    process.exitCode = 1;
  });
}
