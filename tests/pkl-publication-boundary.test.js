import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';

import {
  auditPublicGraph,
  isPublishable,
  publicationDenialReason
} from '../assets/js/shared/pkl-publication-policy.js';
import { buildFeeds, feedText } from '../scripts/pkl/generate-public-feeds.mjs';

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const validatorPath = path.join(repositoryRoot, 'scripts/pkl/validate-public-graph.mjs');

const temporaryDirectories = [];

afterEach(async () => {
  while (temporaryDirectories.length) {
    await rm(temporaryDirectories.pop(), { recursive: true, force: true });
  }
});

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function object(overrides = {}) {
  const uid = overrides.uid ?? 'CONCEPT.EXAMPLE.0001';
  return {
    uid,
    title: 'Example Concept',
    object_type: 'concept',
    summary: 'A public concept.',
    body: 'Body text.',
    tags: [],
    projects: [],
    relationships: [],
    backlinks: [],
    citations: [],
    sources: [],
    figures: [],
    created: '2026-01-01',
    updated: '2026-01-01',
    route: '/wiki/example-concept',
    public_revision: 1,
    status: 'active',
    content_hash: 'a'.repeat(64),
    ...overrides
  };
}

function graphOf(objects, { includeIndexes = true } = {}) {
  const graph = {
    schema_version: 'pkl-public-graph-v0',
    source: { repository: 'test/library', commit: 'abc1234' },
    generated_at: '2026-07-16T00:00:00Z',
    compiler_version: 'test',
    content_sha256: '',
    objects,
    routes: includeIndexes
      ? Object.fromEntries(objects.filter(isPublishable).map((entry) => [entry.route, entry.uid]))
      : {},
    aliases: {},
    indexes: { tags: {}, projects: {}, object_types: {} }
  };
  const { generated_at: _generatedAt, content_sha256: _digest, ...payload } = graph;
  graph.content_sha256 = createHash('sha256').update(stableStringify(payload)).digest('hex');
  return graph;
}

async function writeSnapshot(graph) {
  const directory = await mkdtemp(path.join(tmpdir(), 'pkl-boundary-'));
  temporaryDirectories.push(directory);
  await writeFile(
    path.join(directory, 'manifest.json'),
    JSON.stringify({
      schema_version: graph.schema_version,
      source_commit: 'abc1234',
      object_count: graph.objects.length,
      content_sha256: graph.content_sha256,
      graph_file: 'public-graph.json',
      graph_encoding: 'json'
    }),
    'utf8'
  );
  await writeFile(path.join(directory, 'public-graph.json'), JSON.stringify(graph), 'utf8');
  return directory;
}

async function runValidator(directory) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [validatorPath, directory]);
    return { code: 0, stdout, stderr };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}

describe('PKL publication eligibility', () => {
  it('publishes an object that is affirmatively marked publishable', () => {
    expect(publicationDenialReason(object())).toBeNull();
    expect(isPublishable(object())).toBe(true);
  });

  it('denies an object with no publication marker', () => {
    const unmarked = object();
    delete unmarked.status;
    expect(publicationDenialReason(unmarked)).toBe('publication-marker-missing');
    expect(isPublishable(unmarked)).toBe(false);
  });

  it('denies drafts, private visibility and veto flags', () => {
    expect(isPublishable(object({ status: 'draft' }))).toBe(false);
    expect(isPublishable(object({ visibility: 'private' }))).toBe(false);
    expect(isPublishable(object({ draft: true }))).toBe(false);
    expect(isPublishable(object({ embargoed_until: '2999-01-01' }))).toBe(false);
    expect(isPublishable(object({ visibility: 'public' }))).toBe(true);
  });
});

describe('auditPublicGraph', () => {
  it('reports no violation for a wholly publishable graph', () => {
    const audit = auditPublicGraph(graphOf([object()]));
    expect(audit.violations).toEqual([]);
    expect(audit.eligible).toHaveLength(1);
  });

  it('reports an unmarked object carried in the public graph', () => {
    const unmarked = object({ uid: 'CONCEPT.UNMARKED.0001', route: '/wiki/unmarked' });
    delete unmarked.status;
    const audit = auditPublicGraph(graphOf([object(), unmarked]));
    expect(audit.violations.map((violation) => violation.code))
      .toContain('INELIGIBLE_OBJECT_IN_PUBLIC_GRAPH');
    expect(audit.denied).toEqual([{ uid: 'CONCEPT.UNMARKED.0001', reason: 'publication-marker-missing' }]);
  });

  it('reports a published object that links to a private object', () => {
    const priv = object({ uid: 'CONCEPT.PRIVATE.0001', route: '/wiki/private', status: 'draft' });
    const pub = object({ relationships: [{ type: 'related_to', target: priv.uid }] });
    const codes = auditPublicGraph(graphOf([pub, priv])).violations.map((violation) => violation.code);
    expect(codes).toContain('PUBLIC_REFERENCE_TO_INELIGIBLE_OBJECT');
  });

  it('reports a dangling reference, which leaks the existence of an omitted object', () => {
    const pub = object({ figures: ['FIGURE.OMITTED.0001'] });
    const violation = auditPublicGraph(graphOf([pub])).violations
      .find((entry) => entry.code === 'PUBLIC_REFERENCE_TO_UNKNOWN_OBJECT');
    expect(violation?.target).toBe('FIGURE.OMITTED.0001');
  });

  it('reports a private object reached through an intermediate public object', () => {
    const priv = object({ uid: 'CONCEPT.PRIVATE.0001', route: '/wiki/private', status: 'draft' });
    const middle = object({
      uid: 'CONCEPT.MIDDLE.0001',
      route: '/wiki/middle',
      relationships: [{ type: 'related_to', target: priv.uid }]
    });
    const root = object({ relationships: [{ type: 'related_to', target: middle.uid }] });
    const violation = auditPublicGraph(graphOf([root, middle, priv])).violations
      .find((entry) => entry.code === 'PUBLIC_REFERENCE_TO_INELIGIBLE_OBJECT');
    expect(violation?.uid).toBe(middle.uid);
    expect(violation?.target).toBe(priv.uid);
  });

  it('reports a body link to a route no published object owns', () => {
    const pub = object({ body: 'See [the note](/wiki/hidden-note).' });
    const violation = auditPublicGraph(graphOf([pub])).violations
      .find((entry) => entry.code === 'PUBLIC_LINK_TO_UNPUBLISHED_ROUTE');
    expect(violation?.target).toBe('/wiki/hidden-note');
  });

  it('reports an index entry that resolves to an ineligible object', () => {
    const priv = object({ uid: 'CONCEPT.PRIVATE.0001', route: '/wiki/private', status: 'draft' });
    const graph = graphOf([object(), priv]);
    graph.routes[priv.route] = priv.uid;
    const codes = auditPublicGraph(graph).violations.map((violation) => violation.code);
    expect(codes).toContain('ROUTE_INDEX_EXPOSES_INELIGIBLE_OBJECT');
  });

  it('reports a forbidden private field carried on a published object', () => {
    const codes = auditPublicGraph(graphOf([object({ private_notes: 'internal only' })]))
      .violations.map((violation) => violation.code);
    expect(codes).toContain('FORBIDDEN_FIELD_ON_PUBLIC_OBJECT');
  });
});

describe('generated feeds', () => {
  const publication = (overrides = {}) => object({
    uid: 'PUBLICATION.EXAMPLE.0001',
    object_type: 'publication',
    title: 'Public Publication',
    route: '/blog/public-publication',
    ...overrides
  });

  it('excludes publications that are not marked publishable', () => {
    const secret = publication({
      uid: 'PUBLICATION.SECRET.0001',
      title: 'Secret Publication',
      summary: 'Secret summary.',
      route: '/blog/secret-publication',
      status: 'draft'
    });
    const { rss, atom, jsonFeed } = buildFeeds(graphOf([publication(), secret]), 'https://example.test');

    for (const document of [rss, atom, JSON.stringify(jsonFeed)]) {
      expect(document).not.toContain('Secret Publication');
      expect(document).not.toContain('secret-publication');
      expect(document).not.toContain('Secret summary.');
      expect(document).not.toContain('PUBLICATION.SECRET.0001');
    }
    expect(jsonFeed.items).toHaveLength(1);
  });

  it('refuses to generate while the graph still violates the boundary', () => {
    const graph = graphOf([
      publication({ body: '::figure[FIGURE.PRIVATE.0001]\n' }),
      object({
        uid: 'FIGURE.PRIVATE.0001',
        object_type: 'figure',
        title: 'Private Figure',
        route: '/figures/private-figure',
        status: 'draft'
      })
    ]);
    expect(() => buildFeeds(graph, 'https://example.test')).toThrow(/publication boundary/);
  });

  it('reduces an unresolved figure embed to a placeholder carrying no identifier', () => {
    const text = feedText(
      { body: '::figure[FIGURE.PRIVATE.0001]\n' },
      new Map(),
      new Set()
    );
    expect(text).toContain('[Figure unavailable]');
    expect(text).not.toContain('FIGURE.PRIVATE.0001');
  });

  it('keeps links to published routes and strips links to unpublished routes', () => {
    const text = feedText(
      { body: 'See [Target](/wiki/target) and [Hidden](/wiki/hidden-note).' },
      new Map(),
      new Set(['/wiki/target'])
    );
    expect(text).toContain('[Target](/wiki/target)');
    expect(text).not.toContain('/wiki/hidden-note');
    expect(text).toContain('Hidden');
  });

  it('renders a published figure embed as a link to its public route', () => {
    const figure = object({
      uid: 'FIGURE.PUBLIC.0001',
      object_type: 'figure',
      title: 'Public Figure',
      route: '/figures/public-figure'
    });
    const text = feedText(
      { body: '::figure[FIGURE.PUBLIC.0001]\n' },
      new Map([[figure.uid, figure]]),
      new Set([figure.route])
    );
    expect(text).toContain('[Figure: Public Figure](/figures/public-figure)');
  });
});

describe('validate-public-graph exit code', () => {
  it('exits zero for a compliant snapshot', async () => {
    const directory = await writeSnapshot(graphOf([object()]));
    const result = await runValidator(directory);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout).publishableObjectCount).toBe(1);
  });

  it('exits non-zero and redacts identifiers when the boundary is violated', async () => {
    const priv = object({ uid: 'CONCEPT.PRIVATE.0001', route: '/wiki/private', status: 'draft' });
    const pub = object({ relationships: [{ type: 'related_to', target: priv.uid }] });
    const directory = await writeSnapshot(graphOf([pub, priv]));
    const result = await runValidator(directory);

    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('PKL publication boundary violated');
    expect(result.stderr).toContain('PUBLIC_REFERENCE_TO_INELIGIBLE_OBJECT');
    expect(result.stderr).not.toContain('CONCEPT.PRIVATE.0001');
  });
});
