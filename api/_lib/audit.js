import { ulid } from 'ulid';
import { getDb, schema } from './db.js';
import { hashValue, getClientIp } from './session.js';

export function hashAuditIp(req) {
  const clientIp = req ? getClientIp(req) : null;
  return clientIp ? hashValue(clientIp) : null;
}

/**
 * Write an audit_log row for a mutation.
 * @param {object} params
 * @param {string} params.actorId
 * @param {string} params.action
 * @param {string} [params.targetKind]
 * @param {string} [params.targetId]
 * @param {unknown} [params.before]
 * @param {unknown} [params.after]
 * @param {import('@vercel/node').VercelRequest|Request} [params.req]
 */
export async function writeAuditLog({
  actorId,
  action,
  targetKind,
  targetId,
  before,
  after,
  req,
  db: transaction,
}) {
  const db = transaction ?? getDb();
  await db.insert(schema.auditLog).values({
    id: ulid(),
    actorId,
    action,
    targetKind: targetKind ?? null,
    targetId: targetId ?? null,
    beforeHash: before != null ? hashValue(JSON.stringify(before)) : null,
    afterHash: after != null ? hashValue(JSON.stringify(after)) : null,
    ip: hashAuditIp(req),
  });
}
