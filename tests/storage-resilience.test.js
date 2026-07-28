import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { reconcileMediaOrphans } from '../api/admin/media/_lifecycle.js';
import { createCrudHandlers } from '../api/_lib/crud.js';
import { notes } from '../db/schema.js';
import {
  SNAPSHOT_FORMAT,
  SNAPSHOT_TABLES,
  SNAPSHOT_VERSION,
  buildSnapshot,
  parseSnapshotArgs,
  snapshotFilename,
} from '../scripts/migration/snapshot-content.js';
import {
  buildRestoreStatements,
  parseRestoreArgs,
  planRestore,
  restoreRefusal,
  verifySnapshot,
} from '../scripts/migration/restore-content.js';

const NOW = new Date('2026-08-01T00:00:00Z');

function reconcilePool({
  inFlight = [], confirmed = [], items = [], queued = [],
} = {}) {
  const inserted = [];
  const texts = [];
  const query = vi.fn(async (text, params) => {
    texts.push(text);
    if (text.startsWith('INSERT INTO deletion_queue')) {
      inserted.push({ text, params });
      return { rows: [{ id: params[0] }] };
    }
    if (text.includes("status IN ('pending','uploading','uploaded')")) return { rows: inFlight };
    if (text.includes("status = 'confirmed'")) return { rows: confirmed };
    if (text.includes('FROM gallery_items')) return { rows: items };
    if (text.includes('FROM deletion_queue')) return { rows: queued };
    return { rows: [] };
  });
  return {
    query,
    connect: async () => ({ query, release: vi.fn() }),
    inserted,
    texts,
  };
}

function listing(keysByPrefix) {
  return vi.fn(async (prefix) => ({
    keys: keysByPrefix[prefix] || [],
    continuationToken: null,
  }));
}

describe('orphan reconciliation — bucket has an object the database does not own', () => {
  it('routes an orphaned object to retention instead of deleting it', async () => {
    const pool = reconcilePool({
      items: [{ id: 'item-1', media_key: 'gallery/item-1/a.png', poster_key: null }],
    });
    const result = await reconcileMediaOrphans({ remediate: true }, {
      pool,
      listKeys: listing({
        'gallery/': ['gallery/item-1/a.png', 'gallery/ghost/b.png'],
        'gallery-posters/': [],
      }),
      now: () => NOW,
    });

    expect(result.orphanObjects).toEqual(['gallery/ghost/b.png']);
    expect(result.remediated).toBe(1);
    expect(result.retentionUntil).toBe('2026-08-31T00:00:00.000Z');
    expect(pool.inserted).toHaveLength(1);
    expect(pool.inserted[0].text).toContain("'retained'");
    expect(pool.inserted[0].params).toContain('gallery/ghost/b.png');
    expect(pool.texts.some((text) => /\bDELETE\b/.test(text))).toBe(false);
  });

  it('reports without queueing anything when remediation is not requested', async () => {
    const pool = reconcilePool();
    const result = await reconcileMediaOrphans({}, {
      pool,
      listKeys: listing({ 'gallery/': ['gallery/ghost/b.png'], 'gallery-posters/': [] }),
      now: () => NOW,
    });

    expect(result.orphanObjects).toEqual(['gallery/ghost/b.png']);
    expect(result.remediated).toBe(0);
    expect(result.retentionUntil).toBeNull();
    expect(pool.inserted).toHaveLength(0);
  });

  it('will not restart a retention clock already ticking on the same object', async () => {
    const pool = reconcilePool();
    const insertText = (await (async () => {
      await reconcileMediaOrphans({ remediate: true }, {
        pool,
        listKeys: listing({ 'gallery/': ['gallery/ghost/b.png'], 'gallery-posters/': [] }),
        now: () => NOW,
      });
      return pool.inserted[0].text;
    })());
    expect(insertText).toContain('DO NOTHING');
    expect(insertText).not.toContain('DO UPDATE');
  });

  it('treats a generated thumbnail of an owned media key as owned', async () => {
    const pool = reconcilePool({
      items: [{ id: 'item-1', media_key: 'gallery/item-1/a.png', poster_key: null }],
    });
    const result = await reconcileMediaOrphans({}, {
      pool,
      listKeys: listing({
        'gallery/': ['gallery/item-1/a.png', 'gallery/item-1/a.thumb.webp'],
        'gallery-posters/': [],
      }),
      now: () => NOW,
    });
    expect(result.orphanObjects).toEqual([]);
  });

  it('treats an object already queued for deletion as owned', async () => {
    const pool = reconcilePool({ queued: [{ storage_key: 'gallery/retained/c.png' }] });
    const result = await reconcileMediaOrphans({}, {
      pool,
      listKeys: listing({ 'gallery/': ['gallery/retained/c.png'], 'gallery-posters/': [] }),
      now: () => NOW,
    });
    expect(result.orphanObjects).toEqual([]);
  });
});

describe('orphan reconciliation — in-flight uploads are live, not orphaned', () => {
  it('excludes a pending upload inside its expiry window and its thumbnail key', async () => {
    const pool = reconcilePool({ inFlight: [{ r2_key: 'gallery/upload-3/new.png' }] });
    const result = await reconcileMediaOrphans({ remediate: true }, {
      pool,
      listKeys: listing({
        'gallery/': ['gallery/upload-3/new.png', 'gallery/upload-3/new.thumb.webp'],
        'gallery-posters/': [],
      }),
      now: () => NOW,
    });

    expect(result.orphanObjects).toEqual([]);
    expect(result.protectedInFlight).toBe(1);
    expect(pool.inserted).toHaveLength(0);
  });

  it('bounds the in-flight query by the pending-upload expiry window', async () => {
    const pool = reconcilePool();
    await reconcileMediaOrphans({}, {
      pool,
      listKeys: listing({}),
      now: () => NOW,
    });
    const [text, params] = pool.query.mock.calls
      .find(([sql]) => sql.includes("status IN ('pending','uploading','uploaded')"));
    expect(text).toContain('expires_at > $1');
    expect(params).toEqual([NOW]);
  });
});

describe('orphan reconciliation — database references an object the bucket does not have', () => {
  it('detects a row whose key is absent from a complete scan', async () => {
    const pool = reconcilePool({
      items: [{ id: 'item-2', media_key: 'gallery/item-2/gone.png', poster_key: null }],
    });
    const result = await reconcileMediaOrphans({ remediate: true }, {
      pool,
      listKeys: listing({ 'gallery/': [], 'gallery-posters/': [] }),
      now: () => NOW,
    });

    expect(result.missingObjects).toEqual([{
      resourceKind: 'gallery_item',
      resourceId: 'item-2',
      field: 'r2Key',
      storageKey: 'gallery/item-2/gone.png',
    }]);
    // A missing object cannot be remediated by deleting anything.
    expect(pool.inserted).toHaveLength(0);
  });

  it('reports a missing poster separately from a missing media object', async () => {
    const pool = reconcilePool({
      items: [{
        id: 'item-3',
        media_key: 'gallery/item-3/clip.mp4',
        poster_key: 'gallery-posters/item-3/poster.webp',
      }],
    });
    const result = await reconcileMediaOrphans({}, {
      pool,
      listKeys: listing({
        'gallery/': ['gallery/item-3/clip.mp4'],
        'gallery-posters/': [],
      }),
      now: () => NOW,
    });
    expect(result.missingObjects).toEqual([{
      resourceKind: 'gallery_item',
      resourceId: 'item-3',
      field: 'posterKey',
      storageKey: 'gallery-posters/item-3/poster.webp',
    }]);
  });

  it('suppresses missing-object reporting when the scan was truncated', async () => {
    const pool = reconcilePool({
      items: [{ id: 'item-2', media_key: 'gallery/item-2/gone.png', poster_key: null }],
    });
    const listKeys = vi.fn(async (prefix, token) => (
      prefix === 'gallery/' && !token
        ? { keys: [], continuationToken: 'more' }
        : { keys: [], continuationToken: 'more' }
    ));
    const result = await reconcileMediaOrphans({ limitPages: 1 }, {
      pool,
      listKeys,
      now: () => NOW,
    });
    expect(result.truncated).toBe(true);
    expect(result.missingObjects).toEqual([]);
  });
});

describe('orphan reconciliation — operational signal', () => {
  it('writes one audit row carrying counts and no raw identifiers of the caller', async () => {
    const pool = reconcilePool();
    await reconcileMediaOrphans({ actorId: 'admin' }, {
      pool,
      listKeys: listing({ 'gallery/': ['gallery/ghost/b.png'], 'gallery-posters/': [] }),
      now: () => NOW,
    });
    const audits = pool.query.mock.calls.filter(([text]) => text.includes('INSERT INTO audit_log'));
    expect(audits).toHaveLength(1);
    const [, params] = audits[0];
    expect(params[2]).toBe('media.orphan.reconcile');
    // request omitted, so the hashed-IP column is null; a raw IP is never stored.
    expect(params.at(-1)).toBeNull();
  });
});

describe('content snapshot artefact', () => {
  const rowsByTable = {
    galleries: [{ id: 'G2', slug: 'b', title: 'B' }, { id: 'G1', slug: 'a', title: 'A' }],
    gallery_items: [{ id: 'I1', gallery_slug: 'a', tags: ['x'], metadata_jsonb: { r2Key: 'gallery/I1/a.png' } }],
    articles: [],
    page_blocks: [{ id: 'P1', page_slug: 'home', blocks_jsonb: [], deleted_at: null }],
  };

  it('covers the editable content tables of the 0005/0006 model', () => {
    expect(SNAPSHOT_TABLES).toEqual(['galleries', 'gallery_items', 'articles', 'page_blocks']);
    expect(SNAPSHOT_TABLES).not.toContain('content_versions');
    expect(SNAPSHOT_TABLES).not.toContain('deletion_queue');
  });

  it('produces a timestamped, checksummed, order-independent artefact', () => {
    const snapshot = buildSnapshot(rowsByTable, { createdAt: NOW });
    expect(snapshot.format).toBe(SNAPSHOT_FORMAT);
    expect(snapshot.version).toBe(SNAPSHOT_VERSION);
    expect(snapshot.createdAt).toBe('2026-08-01T00:00:00.000Z');
    expect(snapshot.counts).toEqual({
      galleries: 2, gallery_items: 1, articles: 0, page_blocks: 1,
    });
    expect(snapshot.rows.galleries.map(({ id }) => id)).toEqual(['G1', 'G2']);
    expect(snapshotFilename(NOW)).toBe('content-20260801T000000Z.json');

    const reordered = buildSnapshot({
      ...rowsByTable,
      galleries: [...rowsByTable.galleries].reverse(),
    }, { createdAt: NOW });
    expect(reordered.checksum).toBe(snapshot.checksum);
  });

  it('is restorable: verification accepts it and produces upsert statements', () => {
    const snapshot = JSON.parse(JSON.stringify(buildSnapshot(rowsByTable, { createdAt: NOW })));
    expect(verifySnapshot(snapshot)).toBe(snapshot);

    const statements = buildRestoreStatements(snapshot);
    expect(statements).toHaveLength(4);
    const item = statements.find((text) => text.startsWith('INSERT INTO gallery_items'));
    expect(item).toContain('ON CONFLICT (id) DO UPDATE SET');
    expect(item).toContain("'[\"x\"]'::jsonb");
    expect(item).toContain('gallery_slug = EXCLUDED.gallery_slug');
    expect(item).not.toContain('id = EXCLUDED.id');
    expect(statements.find((text) => text.startsWith('INSERT INTO page_blocks'))).toContain('NULL');
  });

  it('rejects a tampered or foreign artefact', () => {
    const snapshot = buildSnapshot(rowsByTable, { createdAt: NOW });
    const tampered = { ...snapshot, rows: { ...snapshot.rows, galleries: [{ id: 'G1', slug: 'hijack' }] } };
    expect(() => verifySnapshot(tampered)).toThrowError(
      expect.objectContaining({ code: 'SNAPSHOT_CHECKSUM_MISMATCH' }),
    );
    expect(() => verifySnapshot({ ...snapshot, format: 'other' })).toThrowError(
      expect.objectContaining({ code: 'SNAPSHOT_FORMAT_UNKNOWN' }),
    );
    expect(() => verifySnapshot({ ...snapshot, tables: ['users'] })).toThrowError(
      expect.objectContaining({ code: 'SNAPSHOT_TABLE_UNKNOWN' }),
    );
  });

  it('rejects a row column that is not a safe SQL identifier', () => {
    const snapshot = buildSnapshot({
      ...rowsByTable,
      articles: [{ id: 'A1', 'title"; DROP TABLE users; --': 'x' }],
    }, { createdAt: NOW });
    expect(() => verifySnapshot(snapshot)).toThrowError(
      expect.objectContaining({ code: 'SNAPSHOT_COLUMN_INVALID' }),
    );
  });
});

describe('content restore guard', () => {
  const snapshot = buildSnapshot({
    galleries: [{ id: 'G1', slug: 'a' }, { id: 'G2', slug: 'b' }],
    gallery_items: [],
    articles: [],
    page_blocks: [],
  }, { createdAt: NOW });

  it('defaults to a dry run', () => {
    expect(parseRestoreArgs(['node', 'restore-content.js', '--from=x.json'])).toEqual({
      from: 'x.json', write: false, overwrite: false,
    });
    expect(parseSnapshotArgs(['node', 'snapshot-content.js'])).toEqual({ write: false, out: null });
    const plan = planRestore(snapshot, { galleries: [] });
    expect(restoreRefusal(plan, parseRestoreArgs(['--from=x.json']))).toBe('DRY_RUN');
  });

  it('names exactly which rows it would overwrite before overwriting them', () => {
    const plan = planRestore(snapshot, { galleries: ['G2'] });
    expect(plan.inserts.galleries).toEqual(['G1']);
    expect(plan.overwrites.galleries).toEqual(['G2']);
    expect(plan.insertCount).toBe(1);
    expect(plan.overwriteCount).toBe(1);
  });

  it('refuses to overwrite without an explicit flag, and proceeds with one', () => {
    const clashing = planRestore(snapshot, { galleries: ['G2'] });
    expect(restoreRefusal(clashing, { write: true })).toBe('OVERWRITE_NOT_PERMITTED');
    expect(restoreRefusal(clashing, { write: true, overwrite: true })).toBeNull();
  });

  it('permits a write with no clashes without the overwrite flag', () => {
    const clean = planRestore(snapshot, { galleries: [] });
    expect(clean.overwriteCount).toBe(0);
    expect(restoreRefusal(clean, { write: true })).toBeNull();
  });
});

describe('public read cache posture', () => {
  function publicReadHandlers() {
    const rows = [{ id: 'N1', slug: 'n', status: 'published' }];
    const chain = {
      from: () => chain,
      where: () => chain,
      limit: () => chain,
      offset: async () => rows,
    };
    return createCrudHandlers({
      table: notes,
      kind: 'note',
      publicRead: 'published',
      createFieldMap: { slug: 'slug' },
      updateFieldMap: { slug: 'slug' },
      buildInsert: (fields, id) => ({ id, ...fields }),
    }, {
      db: () => ({ select: () => chain }),
      authenticateRead: async () => ({ user: { id: 'admin' } }),
      authenticateMutation: async () => ({ user: { id: 'admin' } }),
      audit: async () => {},
    });
  }

  it('declares no shared-cache lifetime, so a write has no cached representation to purge', async () => {
    const handlers = publicReadHandlers();
    const response = await handlers.GET(new Request('https://example.invalid/api/content/notes'));
    expect(response.status).toBe(200);
    for (const header of ['cache-control', 'cdn-cache-control', 'vercel-cdn-cache-control', 'etag']) {
      expect(response.headers.get(header)).toBeNull();
    }
  });

  it('confirms vercel.json caches static assets only, never the API', () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8'));
    const cached = config.headers.filter(({ headers }) => (
      headers.some(({ key }) => key.toLowerCase() === 'cache-control')
    ));
    expect(cached.map(({ source }) => source)).toEqual(['/assets/(.*)']);
  });
});
