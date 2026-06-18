import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from '../../db/schema.js';

let _db;

export function getDb() {
  if (!_db) {
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export { sql, schema };

export async function query(text, params = []) {
  return sql.query(text, params);
}
