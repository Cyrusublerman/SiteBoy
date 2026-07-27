import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { getResourceDefinition } from '../api/content/[resource].js';
import {
  mutateVersioned,
  parseIfMatch,
  versionErrorResponse,
  VersionConflictError,
} from '../api/_lib/versioning.js';
import { validateMappedFields } from '../api/_lib/crud.js';
import { buildArtImport } from '../scripts/migration/import-art.js';
import { buildBlogImport } from '../scripts/migration/import-blog.js';
import { buildPageImport } from '../scripts/migration/import-pages.js';
import { buildProjectImport } from '../scripts/migration/import-projects.js';
import { verifyParity } from '../scripts/migration/verify.js';

const migration = readFileSync(join(process.cwd(), 'db/migrations/0005_content_model.sql'), 'utf8');

describe('content model migration and policies', () => {
  it('adds every versioned content table and closed publication constraint', () => {
    for (const table of ['galleries', 'articles', 'page_blocks', 'content_versions', 'deletion_queue']) {
      expect(migration).toMatch(new RegExp(`CREATE TABLE ${table}\\b`));
    }
    expect(migration).toContain("CHECK (status IN ('draft','published','archived'))");
    expect(migration).toContain('version INTEGER NOT NULL DEFAULT 1');
    expect(migration).toContain('deleted_at TIMESTAMPTZ');
    expect(migration).toContain("id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'");
    expect(migration).toContain('INSERT INTO galleries');
    expect(migration).toContain('ROW_NUMBER() OVER');
    expect(migration).toContain("ALTER COLUMN status SET DEFAULT 'draft'");
  });

  it('uses explicit mappings for all typed versioned resources', () => {
    for (const name of ['galleries', 'gallery-items', 'articles', 'notes', 'page-blocks', 'products', 'projects']) {
      const definition = getResourceDefinition(name);
      expect(definition.versioned).toBe(true);
      expect(definition.publicRead).toBe('published');
      expect(definition.createFieldMap).not.toHaveProperty('version');
      expect(definition.updateFieldMap).not.toHaveProperty('deletedAt');
    }
    expect(getResourceDefinition('products').createFieldMap).toHaveProperty('sku');
    expect(getResourceDefinition('gallery-items').updateFieldMap).toHaveProperty('displayMode');
  });
});

describe('optimistic version contract', () => {
  it('accepts quoted versions and rejects missing If-Match', () => {
    expect(parseIfMatch({ headers: new Headers({ 'if-match': '"3"' }) })).toBe(3);
    expect(() => parseIfMatch({ headers: new Headers() })).toThrow(VersionConflictError);
    try {
      parseIfMatch({ headers: new Headers() });
    } catch (error) {
      expect(error.status).toBe(428);
    }
  });

  it('returns explicit precondition and conflict response contracts', async () => {
    const required = versionErrorResponse(new VersionConflictError(
      'If-Match required',
      428,
      null,
      'IF_MATCH_REQUIRED',
    ));
    const conflict = versionErrorResponse(new VersionConflictError(
      'Stale version',
      409,
      6,
      'VERSION_CONFLICT',
    ));
    await expect(required.json()).resolves.toMatchObject({
      code: 'IF_MATCH_REQUIRED',
      currentVersion: null,
    });
    await expect(conflict.json()).resolves.toMatchObject({
      code: 'VERSION_CONFLICT',
      currentVersion: 6,
    });
  });

  it.each([
    ['update', { title: 'After' }],
    ['delete', { deletedAt: new Date('2026-07-23T00:00:00Z') }],
    ['restore', { deletedAt: null }],
  ])('snapshots and increments once for %s', async (action, changes) => {
    const existing = { id: 'record', version: 4, title: 'Before', deletedAt: null };
    const updated = { ...existing, ...changes, version: 5 };
    const tx = transactionFor(existing, updated);
    const audit = vi.fn();
    const result = await mutateVersioned({
      table: fakeTable(),
      kind: 'article',
      id: 'record',
      expectedVersion: 4,
      actorId: 'admin',
      action,
      changes,
      request: { headers: new Headers() },
    }, { db: { transaction: (callback) => callback(tx) }, audit });
    expect(result.version).toBe(5);
    expect(tx.insertValues).toHaveBeenCalledWith(expect.objectContaining({
      version: 4,
      snapshotJsonb: existing,
      action,
    }));
    expect(tx.updateSet).toHaveBeenCalledWith(expect.objectContaining({ version: 5 }));
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ db: tx, action }));
  });

  it('rejects a stale version before any mutation', async () => {
    const tx = transactionFor({ id: 'record', version: 5 }, null);
    await expect(mutateVersioned({
      table: fakeTable(),
      kind: 'article',
      id: 'record',
      expectedVersion: 4,
      actorId: 'admin',
      action: 'update',
      changes: { title: 'No' },
    }, { db: { transaction: (callback) => callback(tx) } })).rejects.toMatchObject({
      status: 409,
      currentVersion: 5,
    });
    expect(tx.insertValues).not.toHaveBeenCalled();
  });
});

describe('strict content field policies', () => {
  it('rejects invalid states, shapes and numeric values', () => {
    const policy = getResourceDefinition('products').fieldPolicy;
    expect(validateMappedFields({ status: 'private' }, policy).error).toContain('status');
    expect(validateMappedFields({ metadataJsonb: [] }, policy).error).toContain('metadataJsonb');
    expect(validateMappedFields({ priceCents: -1 }, policy).error).toContain('priceCents');
    expect(validateMappedFields({
      status: 'published',
      metadataJsonb: {},
      priceCents: 0,
    }, policy)).toHaveProperty('value');
  });
});

describe('content importer transforms', () => {
  it('is dry-run deterministic and parity-clean', async () => {
    const builders = [buildArtImport, buildProjectImport, buildPageImport, buildBlogImport];
    for (const build of builders) {
      const first = await build();
      const second = await build();
      expect(first.rows).toEqual(second.rows);
      expect(first.statements.length).toBe(first.rows.length + (build === buildArtImport ? first.report.galleries : 0));
    }
    await expect(verifyParity()).resolves.toMatchObject({ ok: true, conflicts: [] });
  });
});

function fakeTable() {
  return {
    id: { name: 'id' },
    version: { name: 'version' },
  };
}

function transactionFor(existing, updated) {
  const selectBuilder = {
    from: vi.fn(() => selectBuilder),
    where: vi.fn(() => selectBuilder),
    limit: vi.fn(() => selectBuilder),
    for: vi.fn(async () => [existing]),
  };
  const insertValues = vi.fn(async () => {});
  const updateSet = vi.fn(() => ({
    where: vi.fn(() => ({ returning: vi.fn(async () => [updated]) })),
  }));
  return {
    select: vi.fn(() => selectBuilder),
    insert: vi.fn(() => ({ values: insertValues })),
    update: vi.fn(() => ({ set: updateSet })),
    insertValues,
    updateSet,
  };
}
