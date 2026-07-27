import { describe, expect, it, vi } from 'vitest';
import {
  checksumMigration,
  planMigrations,
  runMigrations,
} from '../scripts/db/migrate.mjs';

const migrations = [
  { file: '0001_init.sql', sqlText: 'SELECT 1', checksum: checksumMigration('SELECT 1') },
  { file: '0002_more.sql', sqlText: 'SELECT 2', checksum: checksumMigration('SELECT 2') },
];

describe('migration bookkeeping', () => {
  it('produces stable SHA-256 checksums and plans only unapplied files', () => {
    expect(checksumMigration('SELECT 1')).toMatch(/^[0-9a-f]{64}$/);
    expect(planMigrations(migrations, [
      { filename: migrations[0].file, checksum: migrations[0].checksum },
    ])).toEqual([migrations[1]]);
  });

  it('fails before applying a changed historical migration', () => {
    expect(() => planMigrations(migrations, [
      { filename: migrations[0].file, checksum: 'changed' },
    ])).toThrow(/checksum drift.*0001_init/i);
  });

  it('uses the ledger and advisory lock and is idempotent', async () => {
    const client = {
      query: vi.fn(async (text) => {
        if (String(text).startsWith('SELECT filename')) return { rows: [] };
        return { rows: [] };
      }),
    };
    await expect(runMigrations(client, migrations)).resolves.toEqual({
      applied: ['0001_init.sql', '0002_more.sql'],
      total: 2,
    });
    expect(client.query.mock.calls.map(([text]) => String(text))).toEqual(expect.arrayContaining([
      expect.stringContaining('CREATE TABLE IF NOT EXISTS schema_migrations'),
      'SELECT pg_advisory_lock($1)',
      'BEGIN',
      'COMMIT',
      'SELECT pg_advisory_unlock($1)',
    ]));

    client.query.mockImplementation(async (text) => {
      if (String(text).startsWith('SELECT filename')) {
        return { rows: migrations.map(({ file, checksum }) => ({ filename: file, checksum })) };
      }
      return { rows: [] };
    });
    await expect(runMigrations(client, migrations)).resolves.toEqual({
      applied: [],
      total: 2,
    });
  });
});
