import { and, desc, eq } from 'drizzle-orm';
import { ulid } from 'ulid';
import { getDb, schema } from './db.js';
import { writeAuditLog } from './audit.js';

export class VersionConflictError extends Error {
  constructor(message, status, currentVersion = null, code = null) {
    super(message);
    this.name = 'VersionConflictError';
    this.status = status;
    this.currentVersion = currentVersion;
    this.code = code ?? (status === 428 ? 'IF_MATCH_REQUIRED' : 'VERSION_CONFLICT');
  }
}

export function parseIfMatch(request) {
  const raw = request.headers?.get?.('if-match');
  if (raw == null || raw.trim() === '') {
    throw new VersionConflictError('If-Match header required for existing mutable records', 428);
  }
  const normalised = raw.trim().replace(/^W\//, '').replace(/^"|"$/g, '');
  if (!/^[1-9]\d*$/.test(normalised)) {
    throw new VersionConflictError(
      'If-Match must contain a positive integer version',
      400,
      null,
      'INVALID_IF_MATCH',
    );
  }
  return Number(normalised);
}

export function versionErrorResponse(error) {
  if (!(error instanceof VersionConflictError)) throw error;
  return Response.json({
    error: error.message,
    code: error.code,
    currentVersion: error.currentVersion,
  }, { status: error.status });
}

export async function mutateVersioned({
  table,
  kind,
  id,
  idField = 'id',
  expectedVersion,
  actorId,
  action,
  changes,
  request,
  revertVersion = null,
}, {
  db = getDb(),
  audit = writeAuditLog,
} = {}) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select()
      .from(table)
      .where(eq(table[idField], id))
      .limit(1)
      .for('update');
    if (!existing) return null;
    if (existing.version !== expectedVersion) {
      throw new VersionConflictError(
        `Version conflict: expected ${expectedVersion}, current ${existing.version}`,
        409,
        existing.version,
      );
    }

    let mutation = changes;
    if (action === 'revert') {
      if (!Number.isSafeInteger(revertVersion) || revertVersion < 1) {
        throw new VersionConflictError(
          'version must be a positive integer for revert',
          400,
          existing.version,
          'INVALID_REVERT_VERSION',
        );
      }
      const [target] = await tx.select()
        .from(schema.contentVersions)
        .where(and(
          eq(schema.contentVersions.resourceKind, kind),
          eq(schema.contentVersions.resourceId, id),
          eq(schema.contentVersions.version, revertVersion),
        ))
        .limit(1);
      if (!target) {
        throw new VersionConflictError(
          'Requested historical version not found',
          404,
          existing.version,
          'HISTORY_VERSION_NOT_FOUND',
        );
      }
      const immutable = new Set(['id', 'version', 'createdAt', 'updatedAt']);
      mutation = Object.fromEntries(
        Object.entries(target.snapshotJsonb).filter(([key]) => !immutable.has(key)),
      );
    }

    await tx.insert(schema.contentVersions).values({
      id: ulid(),
      resourceKind: kind,
      resourceId: id,
      version: existing.version,
      snapshotJsonb: existing,
      action,
      editorId: actorId,
    });

    const [updated] = await tx.update(table).set({
      ...mutation,
      version: existing.version + 1,
      updatedAt: new Date(),
    }).where(eq(table[idField], id)).returning();

    await audit({
      actorId,
      action,
      targetKind: kind,
      targetId: id,
      before: existing,
      after: updated,
      req: request,
      db: tx,
    });
    return updated;
  });
}

export async function readContentHistory(kind, id, { db = getDb() } = {}) {
  return db.select().from(schema.contentVersions)
    .where(and(
      eq(schema.contentVersions.resourceKind, kind),
      eq(schema.contentVersions.resourceId, id),
    ))
    .orderBy(desc(schema.contentVersions.version));
}
