import { ulid } from 'ulid';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb } from '../_lib/db.js';
import { requireSession, requireSessionAndCsrf } from '../_lib/session.js';
import { writeAuditLog } from '../_lib/audit.js';
import {
  mutateVersioned,
  parseIfMatch,
  readContentHistory,
  versionErrorResponse,
} from '../_lib/versioning.js';

export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 100;
export const MAX_PAGE_OFFSET = 10000;

function integerParameter(value, fallback, maximum) {
  if (value == null || value === '') return fallback;
  if (!/^\d+$/.test(String(value))) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number <= maximum ? number : null;
}

export function parsePagination(request) {
  const url = new URL(request.url);
  const limit = integerParameter(url.searchParams.get('limit'), DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);
  const offset = integerParameter(url.searchParams.get('offset'), 0, MAX_PAGE_OFFSET);
  if (limit == null || limit < 1 || offset == null) {
    return {
      error: Response.json(
        { error: `Pagination requires limit 1-${MAX_PAGE_LIMIT} and offset 0-${MAX_PAGE_OFFSET}` },
        { status: 400 },
      ),
    };
  }
  return { limit, offset };
}

export function mapPermittedFields(body, fieldMap, { permittedExtra = [] } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'JSON body must be an object' };
  }
  const allowed = new Set([...Object.keys(fieldMap), ...permittedExtra]);
  const rejected = Object.keys(body).filter((field) => !allowed.has(field));
  if (rejected.length) {
    return { error: `Unknown or immutable field${rejected.length === 1 ? '' : 's'}: ${rejected.join(', ')}` };
  }
  const value = {};
  for (const [inputField, targetField] of Object.entries(fieldMap)) {
    if (Object.hasOwn(body, inputField)) value[targetField] = body[inputField];
  }
  return { value };
}

export function validateMappedFields(fields, policy = {}) {
  const errors = [];
  const {
    arrays = [],
    enums = {},
    finiteNumbers = [],
    isoDates = [],
    nonNegativeIntegers = [],
    nullableStrings = [],
    objects = [],
    strings = [],
    text = [],
  } = policy;
  for (const field of strings) {
    if (Object.hasOwn(fields, field)
      && (typeof fields[field] !== 'string' || fields[field].trim() === '')) {
      errors.push(`${field} must be a non-empty string`);
    }
  }
  for (const field of nullableStrings) {
    if (Object.hasOwn(fields, field)
      && fields[field] !== null
      && typeof fields[field] !== 'string') {
      errors.push(`${field} must be a string or null`);
    }
  }
  for (const field of text) {
    if (Object.hasOwn(fields, field) && typeof fields[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }
  }
  for (const field of arrays) {
    if (Object.hasOwn(fields, field) && !Array.isArray(fields[field])) {
      errors.push(`${field} must be an array`);
    }
  }
  for (const field of objects) {
    if (Object.hasOwn(fields, field)
      && (!fields[field] || typeof fields[field] !== 'object' || Array.isArray(fields[field]))) {
      errors.push(`${field} must be an object`);
    }
  }
  for (const field of finiteNumbers) {
    if (Object.hasOwn(fields, field)
      && fields[field] !== null
      && (typeof fields[field] !== 'number' || !Number.isFinite(fields[field]))) {
      errors.push(`${field} must be a finite number or null`);
    }
  }
  for (const field of isoDates) {
    if (Object.hasOwn(fields, field)
      && fields[field] !== null
      && (typeof fields[field] !== 'string' || !Number.isFinite(Date.parse(fields[field])))) {
      errors.push(`${field} must be an ISO date string or null`);
    }
  }
  for (const field of nonNegativeIntegers) {
    if (Object.hasOwn(fields, field)
      && (!Number.isSafeInteger(fields[field]) || fields[field] < 0)) {
      errors.push(`${field} must be a non-negative integer`);
    }
  }
  for (const [field, values] of Object.entries(enums)) {
    if (Object.hasOwn(fields, field) && !values.includes(fields[field])) {
      errors.push(`${field} must be one of: ${values.join(', ')}`);
    }
  }
  return errors.length ? { error: errors.join('; ') } : { value: fields };
}

/**
 * Factory for policy-bound CRUD handlers on a Drizzle table.
 * @param {object} config
 * @param {import('drizzle-orm/pg-core').PgTable} config.table
 * @param {string} config.kind — audit target_kind
 * @param {'published'|'all'|'none'} config.publicRead
 * @param {Record<string, string>} config.createFieldMap
 * @param {Record<string, string>} config.updateFieldMap
 * @param {(fields: object, id: string) => object} config.buildInsert
 * @param {string} [config.idField='id']
 */
export function createCrudHandlers({
  table,
  kind,
  publicRead,
  createFieldMap,
  updateFieldMap,
  buildInsert,
  fieldPolicy = {},
  normaliseFields = (fields) => fields,
  idField = 'id',
  versioned = false,
}, {
  db = getDb,
  authenticateRead = requireSession,
  authenticateMutation = requireSessionAndCsrf,
  audit = writeAuditLog,
} = {}) {
  if (!['published', 'all', 'none'].includes(publicRead)) {
    throw new Error(`Invalid public read policy for ${kind}`);
  }

  async function GET(request) {
    const url = new URL(request.url);
    const adminRead = url.searchParams.get('view') === 'admin';
    const action = url.searchParams.get('action');
    if (action === 'history') {
      const auth = await authenticateRead(request);
      if (auth.error) return auth.error;
      const id = url.searchParams.get('id');
      if (!id) return Response.json({ error: 'id query param required' }, { status: 400 });
      if (!versioned) return Response.json({ error: 'Resource is not versioned' }, { status: 400 });
      return Response.json({ items: await readContentHistory(kind, id, { db: db() }) });
    }
    if (adminRead) {
      const auth = await authenticateRead(request);
      if (auth.error) return auth.error;
    } else if (publicRead === 'none') {
      return Response.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const page = parsePagination(request);
    if (page.error) return page.error;

    let query = db().select().from(table);
    if (!adminRead && publicRead === 'published') {
      query = query.where(versioned
        ? and(eq(table.status, 'published'), isNull(table.deletedAt))
        : eq(table.status, 'published'));
    }
    const rows = await query.limit(page.limit).offset(page.offset);
    return Response.json({
      items: rows,
      pagination: {
        limit: page.limit,
        offset: page.offset,
        returned: rows.length,
      },
    });
  }

  async function POST(request) {
    const auth = await authenticateMutation(request);
    if (auth.error) return auth.error;

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const action = new URL(request.url).searchParams.get('action');
    if (action === 'restore' || action === 'revert') {
      if (!versioned) return Response.json({ error: 'Resource is not versioned' }, { status: 400 });
      if (!body[idField]) return Response.json({ error: `${idField} required` }, { status: 400 });
      try {
        const item = await mutateVersioned({
          table,
          kind,
          id: body[idField],
          idField,
          expectedVersion: parseIfMatch(request),
          actorId: auth.user.id,
          action,
          changes: action === 'restore' ? { deletedAt: null } : null,
          revertVersion: action === 'revert' ? body.version : null,
          request,
        }, { db: db(), audit });
        if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
        return Response.json({ item });
      } catch (error) {
        return versionErrorResponse(error);
      }
    }

    const mapped = mapPermittedFields(body, createFieldMap);
    if (mapped.error) {
      return Response.json({ error: mapped.error }, { status: 400 });
    }
    const validation = validateMappedFields(mapped.value, fieldPolicy);
    if (validation.error) {
      return Response.json({ error: validation.error }, { status: 400 });
    }
    const id = ulid();
    const row = buildInsert(normaliseFields(mapped.value), id);

    await db().insert(table).values(row);
    await audit({
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
    const auth = await authenticateMutation(request);
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

    const mapped = mapPermittedFields(body, updateFieldMap, { permittedExtra: [idField] });
    if (mapped.error) {
      return Response.json({ error: mapped.error }, { status: 400 });
    }
    const validation = validateMappedFields(mapped.value, fieldPolicy);
    if (validation.error) {
      return Response.json({ error: validation.error }, { status: 400 });
    }
    if (!Object.keys(mapped.value).length) {
      return Response.json({ error: 'At least one mutable field required' }, { status: 400 });
    }

    if (versioned) {
      try {
        const updated = await mutateVersioned({
          table,
          kind,
          id,
          idField,
          expectedVersion: parseIfMatch(request),
          actorId: auth.user.id,
          action: 'update',
          changes: normaliseFields(mapped.value),
          request,
        }, { db: db(), audit });
        if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });
        return Response.json({ item: updated });
      } catch (error) {
        return versionErrorResponse(error);
      }
    }

    const [existing] = await db().select().from(table).where(eq(table[idField], id)).limit(1);
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });
    const [updated] = await db().update(table)
      .set(normaliseFields(mapped.value))
      .where(eq(table[idField], id))
      .returning();
    await audit({ actorId: auth.user.id, action: 'update', targetKind: kind, targetId: id, before: existing, after: updated, req: request });
    return Response.json({ item: updated });
  }

  async function DELETE(request) {
    const auth = await authenticateMutation(request);
    if (auth.error) return auth.error;

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'id query param required' }, { status: 400 });
    }

    if (versioned) {
      try {
        const deleted = await mutateVersioned({
          table,
          kind,
          id,
          idField,
          expectedVersion: parseIfMatch(request),
          actorId: auth.user.id,
          action: 'delete',
          changes: { deletedAt: new Date() },
          request,
        }, { db: db(), audit });
        if (!deleted) return Response.json({ error: 'Not found' }, { status: 404 });
        return Response.json({ item: deleted });
      } catch (error) {
        return versionErrorResponse(error);
      }
    }

    const [existing] = await db().select().from(table).where(eq(table[idField], id)).limit(1);
    if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });
    await db().delete(table).where(eq(table[idField], id));
    await audit({
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
