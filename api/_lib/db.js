import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../../db/schema.js';

let _db;
let _pool;

if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

function runtimeUrl() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error('POSTGRES_URL is required');
  return url;
}

export function getPool() {
  if (!_pool) {
    _pool = new Pool({ connectionString: runtimeUrl() });
  }
  return _pool;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
  }
  return _db;
}

export const sql = {
  query(text, params = []) {
    return getPool().query(text, params);
  },
};

export { schema };

export async function query(text, params = []) {
  return sql.query(text, params);
}
