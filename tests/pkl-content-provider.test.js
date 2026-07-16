import { describe, expect, it } from 'vitest';
import { PKLContentProvider, stableStringify, sha256Hex } from '../assets/js/shared/pkl-content-provider.js';

async function snapshot(objects = [], aliases = {}) {
  const graph = {
    schema_version: 'pkl-public-graph-v0',
    source: { repository: 'test/library', commit: 'abc1234' },
    generated_at: '2026-07-16T00:00:00Z',
    compiler_version: 'test',
    content_sha256: '',
    objects,
    routes: Object.fromEntries(objects.map((object) => [object.route, object.uid])),
    aliases,
    indexes: { tags: {}, projects: {}, object_types: {} }
  };
  const { generated_at: _generatedAt, content_sha256: _digest, ...payload } = graph;
  graph.content_sha256 = await sha256Hex(stableStringify(payload));
  return {
    graph,
    manifest: { content_sha256: graph.content_sha256, object_count: objects.length }
  };
}

function fetchFrom(values) {
  return async (url) => {
    const value = url.endsWith('/manifest.json') ? values.manifest : values.graph;
    return { ok: true, status: 200, json: async () => structuredClone(value) };
  };
}

describe('PKLContentProvider', () => {
  it('loads, validates and retrieves route content', async () => {
    const values = await snapshot([{
      uid: 'EXAMPLE',
      title: 'Example',
      object_type: 'concept',
      summary: 'A test object',
      body: 'Test body',
      tags: ['test'],
      projects: [],
      relationships: [],
      backlinks: [],
      route: '/wiki/example',
      public_revision: 1,
      content_hash: 'a'.repeat(64)
    }], { '/wiki/old-example': 'EXAMPLE' });
    const provider = new PKLContentProvider({ fetchImpl: fetchFrom(values) });
    await provider.load();
    expect(provider.getObject('EXAMPLE')?.title).toBe('Example');
    expect(provider.getByRoute('/wiki/example')?.uid).toBe('EXAMPLE');
    expect(provider.getByRoute('/wiki/old-example')?.uid).toBe('EXAMPLE');
    expect(provider.revisionNumbers('EXAMPLE')).toEqual([1]);
    expect(provider.search('test')).toHaveLength(1);
  });

  it('rejects a tampered graph', async () => {
    const values = await snapshot([]);
    values.graph.objects.push({
      uid: 'TAMPERED',
      title: 'Tampered',
      object_type: 'concept',
      route: '/wiki/tampered',
      content_hash: 'b'.repeat(64),
      public_revision: 1
    });
    const provider = new PKLContentProvider({ fetchImpl: fetchFrom(values) });
    await expect(provider.load()).rejects.toThrow('digest');
  });
});
