import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const MIGRATIONS = join(ROOT, 'db', 'migrations');
const MIGRATION_LOCK = 7_619_402_025;

neonConfig.webSocketConstructor = ws;

export function checksumMigration(sqlText) {
  return createHash('sha256').update(sqlText, 'utf8').digest('hex');
}

export function readMigrations(directory = MIGRATIONS) {
  return readdirSync(directory)
    .filter((file) => /^\d+_[a-z0-9_]+\.sql$/.test(file))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const sqlText = readFileSync(join(directory, file), 'utf8');
      return { file, sqlText, checksum: checksumMigration(sqlText) };
    });
}

export function planMigrations(migrations, appliedRows) {
  const applied = new Map(appliedRows.map((row) => [row.filename, row.checksum]));
  for (const migration of migrations) {
    const priorChecksum = applied.get(migration.file);
    if (priorChecksum && priorChecksum !== migration.checksum) {
      throw new Error(`Migration checksum drift: ${migration.file}`);
    }
  }
  return migrations.filter((migration) => !applied.has(migration.file));
}

export async function runMigrations(client, migrations = readMigrations()) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK]);
  try {
    const applied = await client.query(
      'SELECT filename, checksum FROM schema_migrations ORDER BY filename',
    );
    const pending = planMigrations(migrations, applied.rows);
    for (const migration of pending) {
      await client.query('BEGIN');
      try {
        await client.query(migration.sqlText);
        await client.query(
          'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
          [migration.file, migration.checksum],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    return { applied: pending.map(({ file }) => file), total: migrations.length };
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK]);
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required for migrations');

  const pool = new Pool({ connectionString: url, max: 1 });
  const client = await pool.connect();
  try {
    const result = await runMigrations(client);
    for (const file of result.applied) {
      console.log(`Applied ${file}`);
    }
    console.log(`Migration ledger current: ${result.total} file(s), ${result.applied.length} applied.`);
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
