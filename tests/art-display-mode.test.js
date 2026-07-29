import { beforeAll, describe, expect, it } from 'vitest';
import {
  INDEX_SEGMENT,
  indexFromRows,
  itemFromRow,
  routeForCollection,
} from '../api/content/art/[...gallery].js';

let artSection;

beforeAll(async () => {
  window.debugLog = () => {};
  artSection = await import('../assets/js/sections/art_section.js');
});

describe('public gallery display modes', () => {
  it('defaults unknown modes into the masonry grid and withholds hidden', () => {
    expect(artSection.DEFAULT_DISPLAY_MODE).toBe('grid');
    const groups = artSection.partitionByDisplayMode([
      { title: 'a', displayMode: 'grid' },
      { title: 'b', displayMode: 'carousel' },
      { title: 'c', displayMode: 'slideshow' },
      { title: 'd', displayMode: 'hidden' },
      { title: 'e' },
      { title: 'f', displayMode: 'weird' },
    ]);
    expect(groups.grid.map((image) => image.title)).toEqual(['a', 'e', 'f']);
    expect(groups.carousel.map((image) => image.title)).toEqual(['b']);
    expect(groups.slideshow.map((image) => image.title)).toEqual(['c']);
  });
});

describe('art content index helpers', () => {
  it('exposes the reserved index segment and two-level collection routes', () => {
    expect(INDEX_SEGMENT).toBe('_index');
    expect(routeForCollection('digital/posters')).toEqual({ section: 'digital', slug: 'posters' });
    expect(routeForCollection('uncategorised')).toBeNull();
  });

  it('builds the static-compatible index shape and maps item rows', () => {
    const index = indexFromRows([
      {
        collection: 'digital/posters',
        item_count: 2,
        cover_thumb: 'https://example.test/cover.webp',
      },
      { collection: 'orphan', item_count: 1, cover_thumb: null },
    ]);
    expect(index).toEqual({
      source: 'api',
      sections: {
        digital: {
          galleries: [{
            slug: 'posters',
            title: 'posters',
            card_count: 2,
            cover: 'https://example.test/cover.webp',
            pages: [],
          }],
        },
      },
      unrouted: [{ collection: 'orphan', count: 1 }],
    });
    expect(itemFromRow({
      id: 'item-1',
      title: 'Poster',
      media_url: 'https://example.test/a.png',
      thumb_url: 'https://example.test/a.webp',
      tags: ['poster'],
      collection: 'digital/posters',
      sort_index: 3,
      display_mode: 'carousel',
      group_key: 'series',
      urls_jsonb: { web: 'https://example.test/a.png' },
    })).toMatchObject({
      id: 'item-1',
      title: 'Poster',
      displayMode: 'carousel',
      groupKey: 'series',
      sortIndex: 3,
    });
  });
});
