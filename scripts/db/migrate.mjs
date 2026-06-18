import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const MIGRATIONS = join(ROOT, 'db', 'migrations');

async function main() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    console.error('DATABASE_URL or POSTGRES_URL required');
    process.exit(1);
  }

  const { sql } = await import('@vercel/postgres');
  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sqlText = readFileSync(join(MIGRATIONS, file), 'utf8');
    console.log(`Applying ${file}...`);
    await sql.query(sqlText);
  }

  console.log(`Applied ${files.length} migration(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
