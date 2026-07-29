import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { adminJsonRequest } from '../assets/js/shared/gallery-upload.js';
import { Auth } from '../assets/js/admin/auth.js';
import { galleryItems } from '../db/schema.js';

let galleryModel;

beforeAll(async () => {
  window.debugLog = () => {};
  galleryModel = await import('../assets/js/admin/gallery-editor.js');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('gallery editor data helpers', () => {
  it('normalises and deduplicates tags', () => {
    expect(galleryModel.parseTags('alpha, beta; alpha')).toEqual(['alpha', 'beta']);
    expect(galleryModel.parseTags([' alpha ', 'beta', ''])).toEqual(['alpha', 'beta']);
  });

  it('prefers first-class groupKey and displayMode over metadata fallbacks', () => {
    const item = galleryModel.normaliseGalleryItem({
      id: 'item-col',
      filename: 'image.png',
      collection: 'digital/test',
      groupKey: 'series-a',
      displayMode: 'carousel',
      metadataJsonb: { group: 'old', displayMode: 'slideshow' },
      urlsJsonb: { web: 'https://example.test/image.png' },
      version: 3,
    });
    expect(item).toMatchObject({
      group: 'series-a',
      displayMode: 'carousel',
      version: 3,
    });
  });

  it('builds an organise patch only when stored fields change', () => {
    const original = {
      sortIndex: 0,
      title: 'Alpha',
      tags: ['a'],
      group: 'set',
      displayMode: 'grid',
    };
    expect(galleryModel.organisePatch({
      title: 'Alpha',
      tagsText: 'a',
      group: 'set',
      displayMode: 'grid',
    }, original, 0)).toBeNull();
    expect(galleryModel.organisePatch({
      title: 'Beta',
      tagsText: 'a, b',
      group: 'new',
      displayMode: 'carousel',
    }, original, 2)).toEqual({
      sortIndex: 2,
      title: 'Beta',
      tags: ['a', 'b'],
      groupKey: 'new',
      displayMode: 'carousel',
    });
  });

  it('prefers a captured poster blob over a named poster file', () => {
    const row = {
      id: 'row-1',
      filename: 'clip.mp4',
      file: new File(['v'], 'clip.mp4', { type: 'video/mp4' }),
    };
    const named = new File(['poster'], 'clip.poster.webp', { type: 'image/webp' });
    const captured = new Blob(['frame'], { type: 'image/webp' });
    expect(galleryModel.resolvePosterBlob(row, new Map([['row-1', captured]]), [named])).toBe(captured);
    expect(galleryModel.resolvePosterBlob(row, new Map(), [named])).toBe(named);
    expect(galleryModel.isVideoRow(row)).toBe(true);
  });

  it('builds editable upload rows from multiple files', () => {
    const files = [
      new File(['a'], 'one.png', { type: 'image/png', lastModified: 1 }),
      new File(['b'], 'two.jpg', { type: 'image/jpeg', lastModified: 2 }),
    ];
    const rows = galleryModel.buildUploadRows(files, {
      collection: 'digital/test',
      tags: 'one, two',
      group: 'pair',
      displayMode: 'carousel',
    }, (file) => `blob:${file.name}`);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      filename: 'one.png',
      title: 'one',
      collection: 'digital/test',
      tags: 'one, two',
      group: 'pair',
      displayMode: 'carousel',
      include: true,
      previewUrl: 'blob:one.png',
    });
  });

  it('moves selected rows without changing unselected relative order', () => {
    const rows = [
      { id: 'a', sortIndex: 0 },
      { id: 'b', sortIndex: 1 },
      { id: 'c', sortIndex: 2 },
      { id: 'd', sortIndex: 3 },
    ];
    expect(galleryModel.reorderSelectedRows(rows, ['c'], -1).map((row) => row.id)).toEqual(['a', 'c', 'b', 'd']);
    expect(galleryModel.reorderSelectedRows(rows, ['b', 'c'], 1).map((row) => row.id)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('normalises gallery records and derives tag suggestions', () => {
    const item = galleryModel.normaliseGalleryItem({
      id: 'item-1',
      filename: 'image.png',
      gallerySlug: 'digital/test',
      tags: ['zeta', 'alpha'],
      metadataJsonb: { group: 'set', displayMode: 'slideshow' },
      urlsJsonb: { web: 'https://example.test/image.png' },
    });
    expect(item).toMatchObject({
      title: 'image.png',
      collection: 'digital/test',
      group: 'set',
      displayMode: 'slideshow',
      previewUrl: 'https://example.test/image.png',
    });
    expect(galleryModel.collectTagSuggestions([item, { tags: ['alpha', 'beta'] }])).toEqual(['alpha', 'beta', 'zeta']);
  });

  it('matches a browser-selected verified image poster to its video', () => {
    const posters = [
      new File(['poster'], 'clip.poster.webp', { type: 'image/webp' }),
      new File(['wrong'], 'other.png', { type: 'image/png' }),
    ];
    expect(galleryModel.matchPosterFile('clip.mp4', posters)).toBe(posters[0]);
    expect(galleryModel.matchPosterFile('missing.webm', posters)).toBeNull();
  });
});

describe('gallery upload authentication', () => {
  it('routes sign and confirm JSON through the authenticated CSRF client', async () => {
    const response = new Response(JSON.stringify({ ok: true }), { status: 200 });
    const spy = vi.spyOn(Auth, 'apiFetch').mockResolvedValue(response);
    const result = await adminJsonRequest('/api/admin/media/sign', { filename: 'image.png' });
    expect(result).toBe(response);
    expect(spy).toHaveBeenCalledWith('/api/admin/media/sign', {
      method: 'POST',
      body: JSON.stringify({ filename: 'image.png' }),
    });
  });
});

describe('runtime gallery schema', () => {
  it('includes every field used by the gallery editor and media pipeline', () => {
    for (const field of [
      'title',
      'description',
      'mediaUrl',
      'thumbUrl',
      'format',
      'sourceTool',
      'tags',
      'collection',
      'width',
      'height',
      'duration',
      'sha256',
      'thumbStatus',
      'thumbAttempts',
      'thumbErrorCode',
    ]) {
      expect(galleryItems[field], field).toBeDefined();
    }
  });
});
