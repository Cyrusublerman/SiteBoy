import { createHash } from 'node:crypto';

export function stableUlid(key) {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let value = BigInt(`0x${createHash('sha256').update(key).digest('hex').slice(0, 32)}`);
  let result = '';
  for (let index = 0; index < 26; index += 1) {
    result = alphabet[Number(value & 31n)] + result;
    value >>= 5n;
  }
  return result;
}

export function sqlLiteral(value) {
  if (value == null) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function jsonLiteral(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

export async function writeStatements(statements) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL required for --write');
  const [{ Pool, neonConfig }, { default: ws }] = await Promise.all([
    import('@neondatabase/serverless'),
    import('ws'),
  ]);
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    for (const statement of statements) await pool.query(statement);
  } finally {
    await pool.end();
  }
}

export async function runImporter(build, source) {
  const write = process.argv.includes('--write');
  const result = await build();
  if (write) await writeStatements(result.statements);
  process.stdout.write(`${JSON.stringify({
    mode: write ? 'write' : 'dry-run',
    source,
    ...result.counts,
    conflicts: result.conflicts ?? [],
  })}\n`);
}
