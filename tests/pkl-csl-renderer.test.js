import { describe, expect, it } from 'vitest';
import { PklCslRenderer, normaliseCslItem, renderCslBibliography } from '../assets/js/shared/pkl-csl-renderer.js';

function provider(objects) {
  const byUid = new Map(objects.map((object) => [object.uid, object]));
  return { getObject: (uid) => byUid.get(uid) ?? null };
}

const source = {
  uid: 'REF.EXAMPLE',
  title: 'A Public Knowledge Reference',
  object_type: 'reference',
  author: 'Alexander Einoder',
  created: '2026-07-16',
  route: '/wiki/public-knowledge-reference',
};

describe('PKL CSL renderer', () => {
  it('normalises public graph objects into CSL JSON', () => {
    const item = normaliseCslItem(source);
    expect(item.id).toBe(source.uid);
    expect(item.title).toBe(source.title);
    expect(item.author[0]).toEqual({ family: 'Einoder', given: 'Alexander' });
    expect(item.issued['date-parts'][0][0]).toBe(2026);
  });

  it('renders an author-date citation with citeproc-js', () => {
    const renderer = new PklCslRenderer(provider([source]));
    const citation = renderer.citation({ source: source.uid, locator: { type: 'page', value: 4 } });
    expect(citation).toContain('Einoder');
    expect(citation).toContain('2026');
    expect(citation).toContain('4');
  });

  it('renders a governed bibliography into the DOM', () => {
    const container = document.createElement('article');
    const section = renderCslBibliography(container, [{ source: source.uid }], provider([source]));
    expect(section).not.toBeNull();
    expect(container.textContent).toContain('REFERENCES');
    expect(container.textContent).toContain('A Public Knowledge Reference');
  });

  it('fails clearly when the cited source is absent', () => {
    const renderer = new PklCslRenderer(provider([]));
    expect(() => renderer.citation({ source: 'MISSING' })).toThrow('unavailable');
  });
});
