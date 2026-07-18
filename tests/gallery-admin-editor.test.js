import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildUploadRows,
  collectTagSuggestions,
  mergeGalleryMetadata,
  normaliseGalleryItem,
  parseTags,
  reorderSelectedRows,
} from '../assets/js/admin/gallery-editor.js';
import { adminJsonRequest } from '../assets/js/shared/gallery-upload.js';
import { Auth } from '../assets/js/admin/auth.js';
import { galleryItems } from '../db/schema.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('gallery editor data helpers', () => {
  it('normalises and deduplicates tags', () => {
    expect(parseTags('alpha, beta; alpha')).toEqual(['alpha', 'beta']);
    expect(parseTags([' alpha ', 'beta', ''])).toEqual(['alpha', 'beta']);
  });

  it('preserves metadata while applying group and display mode', () => {
    expect(mergeGalleryMetadata(
      { source: 'import', group: 'old' },
      { group: 'series-a', displayMode: 'carousel' },
    )).toEqual({ source: 'import', group: 'series-a', displayMode: 'carousel' });
  });

  it('builds editable upload rows from multiple files', () => {
    const files = [
      new File(['a'], 'one.png', { type: 'image/png', lastModified: 1 }),
      new File(['b'], 'two.jpg', { type: 'image/jpeg', lastModified: 2 }),
    ];
    const rows = buildUploadRows(files, {
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
    expect(reorderSelectedRows(rows, ['c'], -1).map((row) => row.id)).toEqual(['a', 'c', 'b', 'd']);
    expect(reorderSelectedRows(rows, ['b', 'c'], 1).map((row) => row.id)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('normalises gallery records and derives tag suggestions', () => {
    const item = normaliseGalleryItem({
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
    expect(collectTagSuggestions([item, { tags: ['alpha', 'beta'] }])).toEqual(['alpha', 'beta', 'zeta']);
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
    ]) {
      expect(galleryItems[field], field).toBeDefined();
    }
  });
});
