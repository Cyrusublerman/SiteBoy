import { ulid } from 'ulid';
import { eq } from 'drizzle-orm';
import { getDb } from '../_lib/db.js';
import { requireSessionAndCsrf } from '../_lib/session.js';
import { writeAuditLog } from '../_lib/audit.js';

/**
 * Factory for stub CRUD handlers on a Drizzle table.
 * @param {object} config
 * @param {import('drizzle-orm/pg-core').PgTable} config.table
 * @param {string} config.kind — audit target_kind
 * @param {(body: object) => object} [config.mapInsert]
 * @param {string} [config.idField='id']
 */
export function createCrudHandlers({ table, kind, mapInsert, idField = 'id' }) {
  const db = () => getDb();

  async function GET() {
    const rows = await db().select().from(table);
    return Response.json({ items: rows });
  }

  async function POST(request) {
    const auth = await requireSessionAndCsrf(request);
    if (auth.error) return auth.error;

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const id = body[idField] || ulid();
    const row = mapInsert ? mapInsert({ ...body, [idField]: id }) : { ...body, [idField]: id };

    await db().insert(table).values(row);
    await writeAuditLog({
      actorId: auth.user.id,
      action: 'create',
      targetKind: kind,
      targetId: id,
      after: row,
      req: request,
    });

    return Response.json({ item: row }, { status: 201 });
  }

  async function PATCH(request) {
    const auth = await requireSessionAndCsrf(request);
    if (auth.error) return auth.error;

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const id = body[idField];
    if (!id) {
      return Response.json({ error: `${idField} required` }, { status: 400 });
    }

    const [existing] = await db().select().from(table).where(eq(table[idField], id)).limit(1);
    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const { [idField]: _id, ...patch } = body;
    const [updated] = await db().update(table).set(patch).where(eq(table[idField], id)).returning();

    await writeAuditLog({
      actorId: auth.user.id,
      action: 'update',
      targetKind: kind,
      targetId: id,
      before: existing,
      after: updated,
      req: request,
    });

    return Response.json({ item: updated });
  }

  async function DELETE(request) {
    const auth = await requireSessionAndCsrf(request);
    if (auth.error) return auth.error;

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'id query param required' }, { status: 400 });
    }

    const [existing] = await db().select().from(table).where(eq(table[idField], id)).limit(1);
    if (!existing) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    await db().delete(table).where(eq(table[idField], id));
    await writeAuditLog({
      actorId: auth.user.id,
      action: 'delete',
      targetKind: kind,
      targetId: id,
      before: existing,
      req: request,
    });

    return new Response(null, { status: 204 });
  }

  return { GET, POST, PATCH, DELETE };
}

export async function dispatchCrud(handlers, request) {
  const method = request.method;
  if (method === 'GET') return handlers.GET(request);
  if (method === 'POST') return handlers.POST(request);
  if (method === 'PATCH') return handlers.PATCH(request);
  if (method === 'DELETE') return handlers.DELETE(request);
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
