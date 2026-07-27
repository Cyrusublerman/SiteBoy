import { describe, expect, it, vi } from 'vitest';
import {
  CONTENT_RESOURCE_NAMES,
  getResourceDefinition,
  normaliseResourceName,
  resourceNameFromRequest,
} from '../api/content/[resource].js';
import {
  MAX_PAGE_LIMIT,
  createCrudHandlers,
  mapPermittedFields,
  parsePagination,
} from '../api/_lib/crud.js';
import { hashAuditIp } from '../api/_lib/audit.js';
import {
  HOBBY_FUNCTION_LIMIT,
  checkFunctionBudget,
} from '../scripts/vercel/check-function-budget.mjs';

describe('content API resource gateway', () => {
  it('preserves every previous generic CRUD resource URL', () => {
    expect(CONTENT_RESOURCE_NAMES).toEqual([
      'galleries',
      'gallery-items',
      'articles',
      'links',
      'notes',
      'page-blocks',
      'products',
      'projects',
      'tags',
    ]);
  });

  it('normalises Vercel dynamic route parameters', () => {
    expect(normaliseResourceName(' TAGS ')).toBe('tags');
    expect(normaliseResourceName(['projects'])).toBe('projects');
    expect(resourceNameFromRequest({ query: { resource: 'notes' } })).toBe('notes');
  });

  it('rejects resources that are not explicitly registered', () => {
    expect(getResourceDefinition('unknown')).toBeNull();
    expect(getResourceDefinition('art')).toBeNull();
  });

  it('declares an explicit read and write policy for every resource', () => {
    for (const name of CONTENT_RESOURCE_NAMES) {
      const definition = getResourceDefinition(name);
      expect(['published', 'all', 'none']).toContain(definition.publicRead);
      expect(Object.keys(definition.createFieldMap).length).toBeGreaterThan(0);
      expect(Object.keys(definition.updateFieldMap).length).toBeGreaterThan(0);
      expect(definition.buildInsert).toEqual(expect.any(Function));
    }
    expect(getResourceDefinition('notes').publicRead).toBe('published');
    expect(getResourceDefinition('links').publicRead).toBe('none');
  });

  it('rejects unknown and immutable fields instead of mass-assigning them', () => {
    const fields = getResourceDefinition('notes').updateFieldMap;
    expect(mapPermittedFields({ title: 'Public', status: 'published' }, fields)).toEqual({
      value: { title: 'Public', status: 'published' },
    });
    expect(mapPermittedFields({ title: 'Private', createdAt: 'forged' }, fields).error)
      .toContain('createdAt');
    expect(mapPermittedFields({ title: 'Private', passwordHash: 'forged' }, fields).error)
      .toContain('passwordHash');
  });

  it('bounds pagination and rejects invalid values', async () => {
    expect(parsePagination({ url: 'https://site.test/api/content/notes?limit=100&offset=20' }))
      .toEqual({ limit: MAX_PAGE_LIMIT, offset: 20 });
    expect(parsePagination({ url: 'https://site.test/api/content/notes?limit=101' }).error.status)
      .toBe(400);
    expect(parsePagination({ url: 'https://site.test/api/content/notes?offset=-1' }).error.status)
      .toBe(400);
  });

  it('filters anonymous note reads to published rows', async () => {
    const rows = [{ id: 'published-note', status: 'published' }];
    const query = {
      where: vi.fn(),
      limit: vi.fn(),
      offset: vi.fn().mockResolvedValue(rows),
    };
    query.where.mockReturnValue(query);
    query.limit.mockReturnValue(query);
    const db = {
      select: vi.fn(() => ({ from: vi.fn(() => query) })),
    };
    const handlers = createCrudHandlers(getResourceDefinition('notes'), { db: () => db });

    const response = await handlers.GET({
      url: 'https://site.test/api/content/notes',
      headers: new Headers(),
    });

    expect(response.status).toBe(200);
    expect(query.where).toHaveBeenCalledTimes(1);
    await expect(response.json()).resolves.toMatchObject({ items: rows });
  });

  it('requires a session for explicit admin reads', async () => {
    const handlers = createCrudHandlers(getResourceDefinition('gallery-items'), {
      authenticateRead: vi.fn().mockResolvedValue({
        error: Response.json({ error: 'Unauthorised' }, { status: 401 }),
      }),
    });
    const response = await handlers.GET({
      url: 'https://site.test/api/content/gallery-items?view=admin',
      headers: new Headers(),
    });
    expect(response.status).toBe(401);
  });

  it('hashes audit IP addresses before persistence', () => {
    const request = { headers: new Headers({ 'x-forwarded-for': '203.0.113.9' }) };
    const persisted = hashAuditIp(request);
    expect(persisted).toMatch(/^[a-f0-9]{64}$/);
    expect(persisted).not.toContain('203.0.113.9');
  });
});

describe('Vercel Hobby function budget', () => {
  it('keeps the dynamic SiteBoy backend within the deployment limit', async () => {
    const result = await checkFunctionBudget();
    expect(result.limit).toBe(HOBBY_FUNCTION_LIMIT);
    expect(result.withinBudget).toBe(true);
    expect(result.count).toBe(10);
    expect(result.entrypoints).toEqual([
      'admin/media/confirm.js',
      'admin/media/sign.js',
      'admin/media/thumb.js',
      'auth/login.js',
      'auth/logout.js',
      'auth/me.js',
      'content/[resource].js',
      'content/art/[...gallery].js',
      'cron/thumb-worker.js',
      'health.js',
    ]);
  });
});
