import { describe, expect, it, vi } from 'vitest';
import {
  cleanupExpiredUploads,
  confirmPendingUpload,
  processDeletionQueue,
  restoreGalleryItem,
  retainGalleryItem,
  validateMultipartParts,
  verifyPendingObject,
} from '../api/admin/media/_lifecycle.js';
import {
  clearUploadResume,
  readUploadResume,
  uploadMultipartGalleryBlob,
  writeUploadResume,
} from '../assets/js/shared/gallery-upload.js';
import { Auth } from '../assets/js/admin/auth.js';

function connectedPool(query) {
  const client = { query, release: vi.fn() };
  return { query, connect: vi.fn().mockResolvedValue(client), client };
}

describe('media confirmation invariants', () => {
  const pending = {
    id: 'upload-1',
    status: 'pending',
    bytes: 12,
    mime: 'image/png',
    sha256: 'a'.repeat(64),
    expires_at: new Date(Date.now() + 60000),
  };

  it('rejects forged confirmation ownership before R2 inspection', async () => {
    const pool = connectedPool(vi.fn().mockResolvedValue({ rows: [] }));
    const inspectObject = vi.fn();
    await expect(confirmPendingUpload({
      actorId: 'admin',
      itemId: 'forged',
      key: 'gallery/forged/file.png',
    }, { pool, inspectObject })).rejects.toMatchObject({
      code: 'UPLOAD_OWNERSHIP_MISMATCH',
      status: 404,
    });
    expect(inspectObject).not.toHaveBeenCalled();
  });

  it('rejects HEAD length, type and available checksum mismatches', () => {
    expect(() => verifyPendingObject(pending, {
      bytes: 11, mime: 'image/png', sha256: pending.sha256,
    })).toThrowError(expect.objectContaining({ code: 'HEAD_LENGTH_MISMATCH' }));
    expect(() => verifyPendingObject(pending, {
      bytes: 12, mime: 'image/jpeg', sha256: pending.sha256,
    })).toThrowError(expect.objectContaining({ code: 'HEAD_TYPE_MISMATCH' }));
    expect(() => verifyPendingObject(pending, {
      bytes: 12, mime: 'image/png', sha256: 'b'.repeat(64),
    })).toThrowError(expect.objectContaining({ code: 'HEAD_CHECKSUM_MISMATCH' }));
  });

  it('returns an existing record for repeated confirmation', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{ ...pending, status: 'confirmed' }] })
      .mockResolvedValueOnce({ rows: [{ id: pending.id, media_url: 'media', thumb_url: 'thumb' }] });
    const result = await confirmPendingUpload({
      actorId: 'admin',
      itemId: pending.id,
      key: 'gallery/upload-1/file.png',
    }, { pool: connectedPool(query), inspectObject: vi.fn() });
    expect(result).toMatchObject({ itemId: pending.id, idempotent: true });
  });

  it('rejects a poster whose bytes are not a verified image', async () => {
    const pool = connectedPool(vi.fn().mockResolvedValue({
      rows: [{ ...pending, r2_key: 'gallery-posters/upload-1/poster.webp' }],
    }));
    await expect(confirmPendingUpload({
      actorId: 'admin',
      itemId: pending.id,
      key: 'gallery-posters/upload-1/poster.webp',
      posterForItemId: 'video-1',
    }, {
      pool,
      inspectObject: vi.fn().mockResolvedValue({
        bytes: pending.bytes,
        mime: pending.mime,
        sha256: pending.sha256,
      }),
      inspectPoster: vi.fn().mockRejectedValue(new Error('invalid image')),
    })).rejects.toMatchObject({ code: 'POSTER_CONTENT_INVALID', status: 415 });
  });
});

describe('multipart resume state', () => {
  it('persists only identifiers and completed part ETags', () => {
    const values = new Map();
    const storage = {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    };
    const file = { name: 'large.glb', size: 25000000, lastModified: 1 };
    writeUploadResume(file, {
      uploadId: 'r2-upload',
      key: 'gallery/id/large.glb',
      itemId: 'id',
      collection: 'objects',
      parts: [{ partNumber: 1, etag: 'etag-1', signedUrl: 'forbidden' }],
      credentials: 'forbidden',
    }, storage);
    expect(readUploadResume(file, storage)).toEqual({
      uploadId: 'r2-upload',
      key: 'gallery/id/large.glb',
      itemId: 'id',
      parts: [{ partNumber: 1, etag: 'etag-1' }],
    });
    expect(JSON.parse([...values.values()][0])).toEqual({
      uploadId: 'r2-upload',
      key: 'gallery/id/large.glb',
      parts: [{ partNumber: 1, etag: 'etag-1' }],
    });
    expect([...values.values()][0]).not.toContain('forbidden');
    clearUploadResume(file, storage);
    expect(readUploadResume(file, storage)).toBeNull();
  });

  it('sorts completed parts and rejects duplicate part numbers', () => {
    expect(validateMultipartParts([
      { partNumber: 2, etag: '"two"' },
      { partNumber: 1, etag: 'one' },
    ])).toEqual([
      { partNumber: 1, etag: 'one' },
      { partNumber: 2, etag: 'two' },
    ]);
    expect(() => validateMultipartParts([
      { partNumber: 1, etag: 'one' },
      { partNumber: 1, etag: 'again' },
    ])).toThrowError(expect.objectContaining({ code: 'MULTIPART_PART_DUPLICATE' }));
  });

  it('uploads a browser-selected poster after a multipart video completes', async () => {
    const values = new Map();
    const storage = {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    };
    const part = { size: 4, type: 'video/mp4' };
    const blob = {
      name: 'clip.mp4',
      size: 4,
      type: 'video/mp4',
      lastModified: 2,
      slice: () => part,
      arrayBuffer: async () => new ArrayBuffer(4),
    };
    const posterBlob = {
      size: 2,
      type: 'image/webp',
      arrayBuffer: async () => new ArrayBuffer(2),
    };

    const digest = vi.fn().mockResolvedValue(new ArrayBuffer(32));
    vi.stubGlobal('crypto', { ...globalThis.crypto, subtle: { digest } });
    vi.stubGlobal('XMLHttpRequest', class {
      constructor() {
        this.upload = {};
      }

      open() {}

      setRequestHeader() {}

      getResponseHeader() {
        return '"part-etag"';
      }

      send() {
        this.status = 200;
        queueMicrotask(() => this.onload());
      }
    });

    const bodies = [];
    const respond = (payload) => ({ ok: true, json: async () => payload });
    vi.spyOn(Auth, 'apiFetch').mockImplementation(async (url, options) => {
      const body = JSON.parse(options.body);
      bodies.push({ url, body });
      if (body.action === 'multipart-init') {
        return respond({ itemId: 'video-1', key: 'gallery/video-1/clip.mp4', uploadId: 'r2-upload' });
      }
      if (body.action === 'multipart-sign-part') return respond({ url: 'https://r2.invalid/part' });
      if (body.action === 'multipart-complete') return respond({ itemId: 'video-1' });
      if (body.action === 'poster-confirm') return respond({ itemId: 'poster-1' });
      if (body.action === 'confirm' && body.itemId === 'video-1') return respond({ itemId: 'video-1' });
      return respond({ itemId: 'poster-upload', key: 'gallery-posters/poster-upload/x.webp' });
    });

    const result = await uploadMultipartGalleryBlob(blob, {
      filename: 'clip.mp4',
      mime: 'video/mp4',
      posterBlob,
    }, { storage });

    expect(result).toEqual({ itemId: 'video-1' });
    const poster = bodies.find(({ body }) => body.action === 'poster-confirm');
    expect(poster.body).toMatchObject({
      posterForItemId: 'video-1',
      format: 'webp',
    });
    expect(bodies.some(({ body }) => body.kind === 'poster')).toBe(true);
    expect(values.size).toBe(0);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});

describe('retention processors', () => {
  it('retains ordinary deletion for 30 days without deleting R2', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{
          id: 'item-0',
          deleted_at: null,
          metadata_jsonb: { r2Key: 'gallery/item-0/file.png' },
        }],
      })
      .mockResolvedValue({ rows: [] });
    const now = new Date('2026-08-01T00:00:00Z');
    const result = await retainGalleryItem({
      actorId: 'admin',
      itemId: 'item-0',
    }, {
      pool: connectedPool(query),
      now: () => now,
    });
    expect(result.status).toBe('retained');
    expect(result.retentionUntil.toISOString()).toBe('2026-08-31T00:00:00.000Z');
    expect(query.mock.calls.some(([text]) => text.includes("status = 'retained'"))).toBe(true);
  });

  it('restores retained media before expiry and cancels queued deletion', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{
          id: 'queue-restore',
          status: 'retained',
          lifecycle_status: 'retained',
          retention_until: new Date('2026-09-01T00:00:00Z'),
        }],
      })
      .mockResolvedValue({ rows: [] });
    const result = await restoreGalleryItem({
      actorId: 'admin',
      itemId: 'item-restore',
    }, {
      pool: connectedPool(query),
      now: () => new Date('2026-08-01T00:00:00Z'),
    });
    expect(result).toEqual({ itemId: 'item-restore', status: 'restored' });
    expect(query.mock.calls.some(([text]) => text.includes('DELETE FROM deletion_queue'))).toBe(true);
  });

  it('moves due retained rows through pending to deleted', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 'queue-1', resource_id: 'item-1', storage_key: 'gallery/item/file' }],
      })
      .mockResolvedValue({ rows: [] });
    const removeObject = vi.fn().mockResolvedValue();
    const result = await processDeletionQueue({}, {
      pool: connectedPool(query),
      removeObject,
      now: () => new Date('2026-08-01T00:00:00Z'),
    });
    expect(result.results).toEqual([
      { id: 'queue-1', resourceId: 'item-1', status: 'deleted' },
    ]);
    expect(removeObject).toHaveBeenCalledWith('gallery/item/file');
    expect(query.mock.calls.some(([text]) => text.includes("status = 'pending'"))).toBe(true);
    expect(query.mock.calls.some(([text]) => text.includes("status = 'deleted'"))).toBe(true);
  });

  it('records typed failure and retry state', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 'queue-2', resource_id: 'item-2', storage_key: 'gallery/item/missing' }],
      })
      .mockResolvedValue({ rows: [] });
    const error = new Error('temporary failure');
    error.name = 'R2Unavailable';
    const result = await processDeletionQueue({}, {
      pool: connectedPool(query),
      removeObject: vi.fn().mockRejectedValue(error),
    });
    expect(result.results[0]).toMatchObject({ status: 'failed', errorCode: 'R2Unavailable' });
    expect(query.mock.calls.some(([text]) => text.includes("status = 'failed'"))).toBe(true);
  });

  it('forces permanent purge through the pending and deleted states', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 'queue-purge', resource_id: 'item-purge', storage_key: 'gallery/item/file' }],
      })
      .mockResolvedValue({ rows: [] });
    const result = await processDeletionQueue({
      itemId: 'item-purge',
      force: true,
    }, {
      pool: connectedPool(query),
      removeObject: vi.fn().mockResolvedValue(),
    });
    expect(result.results[0]).toMatchObject({ status: 'deleted' });
    expect(query.mock.calls[0][0]).toContain("status = 'pending'");
  });

  it('expires abandoned pending multipart uploads', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({
        rows: [{
          id: 'upload-2',
          r2_key: 'gallery/upload-2/file',
          multipart_upload_id: 'multipart-2',
        }],
      })
      .mockResolvedValue({ rows: [] });
    const abort = vi.fn().mockResolvedValue();
    const removeObject = vi.fn().mockResolvedValue();
    const result = await cleanupExpiredUploads({}, {
      pool: connectedPool(query),
      abort,
      removeObject,
    });
    expect(result.results).toEqual([{ id: 'upload-2', status: 'expired' }]);
    expect(abort).toHaveBeenCalledWith('gallery/upload-2/file', 'multipart-2');
    expect(removeObject).toHaveBeenCalledWith('gallery/upload-2/file');
  });
});
