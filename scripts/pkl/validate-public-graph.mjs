#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
  auditPublicGraph,
  PUBLICATION_MARKER_FIELD,
  PUBLISHABLE_MARKERS
} from '../../assets/js/shared/pkl-publication-policy.js';

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function digestGraph(graph) {
  const { generated_at: _generatedAt, content_sha256: _digest, ...payload } = graph;
  return createHash('sha256').update(stableStringify(payload)).digest('hex');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * CI publishes build logs into the public repository, so identifiers of
 * non-publishable nodes are themselves sensitive. Reports are redacted unless
 * an operator opts in locally with PKL_VALIDATION_VERBOSE=1.
 */
const verboseReport = process.env.PKL_VALIDATION_VERBOSE === '1';

function label(value) {
  if (value === undefined || value === null || value === '') return '(none)';
  if (verboseReport) return String(value);
  return `redacted:${createHash('sha256').update(String(value)).digest('hex').slice(0, 12)}`;
}

async function readGraph(base, manifest) {
  const graphFile = manifest.graph_file || 'public-graph.json';
  const encoding = manifest.graph_encoding || 'json';
  const value = await readFile(path.join(base, graphFile));
  if (encoding === 'json') return JSON.parse(value.toString('utf8'));
  if (encoding === 'gzip-base64') {
    const compressed = Buffer.from(value.toString('ascii').replace(/\s+/g, ''), 'base64');
    return JSON.parse(gunzipSync(compressed).toString('utf8'));
  }
  throw new Error(`Unsupported PKL graph encoding ${encoding}`);
}

function formatViolations(violations) {
  const lines = [
    `PKL publication boundary violated: ${violations.length} finding(s).`,
    `Publication is default-deny. An object is published only when \`${PUBLICATION_MARKER_FIELD}\` is one of: ${PUBLISHABLE_MARKERS.join(', ')}.`,
    verboseReport
      ? 'Identifiers are shown in full (PKL_VALIDATION_VERBOSE=1).'
      : 'Identifiers are redacted. Re-run locally with PKL_VALIDATION_VERBOSE=1 for full detail.'
  ];
  for (const violation of violations) {
    const parts = [`  - [${violation.code}] object=${label(violation.uid)}`];
    if (violation.target !== undefined) parts.push(`target=${label(violation.target)}`);
    if (violation.detail !== undefined) parts.push(`via=${violation.detail}`);
    if (Array.isArray(violation.path) && violation.path.length > 1) {
      parts.push(`path=${violation.path.map(label).join('->')}`);
    }
    lines.push(`${parts.join(' ')}\n      ${violation.message}`);
  }
  return lines.join('\n');
}

async function main() {
  const base = path.resolve(process.argv[2] ?? 'public/generated/pkl');
  const manifest = JSON.parse(await readFile(path.join(base, 'manifest.json'), 'utf8'));
  const graph = await readGraph(base, manifest);

  assert(graph.schema_version === 'pkl-public-graph-v0', `Unsupported graph schema ${graph.schema_version}`);
  assert(Array.isArray(graph.objects), 'Graph objects must be an array');
  assert(manifest.content_sha256 === graph.content_sha256, 'Manifest and graph digests differ');
  assert(digestGraph(graph) === graph.content_sha256, 'Graph digest is invalid');
  assert(manifest.object_count === graph.objects.length, 'Manifest object count is invalid');

  const uids = new Set();
  const routes = new Set();
  for (const object of graph.objects) {
    assert(typeof object.uid === 'string' && object.uid.length > 0, 'Object UID is required');
    assert(typeof object.title === 'string' && object.title.length > 0, `${label(object.uid)}: title is required`);
    assert(typeof object.object_type === 'string' && object.object_type.length > 0, `${label(object.uid)}: object type is required`);
    assert(typeof object.route === 'string' && /^\/(wiki|blog|figures)\//.test(object.route), `${label(object.uid)}: invalid route`);
    assert(/^[a-f0-9]{64}$/.test(object.content_hash), `${label(object.uid)}: invalid content hash`);
    assert(Number.isInteger(object.public_revision) && object.public_revision >= 1, `${label(object.uid)}: invalid public revision`);
    assert(!uids.has(object.uid), `Duplicate UID ${label(object.uid)}`);
    assert(!routes.has(object.route), `Duplicate route ${label(object.route)}`);
    uids.add(object.uid);
    routes.add(object.route);
  }

  for (const [route, uid] of Object.entries(graph.routes ?? {})) {
    assert(routes.has(route), `Route index contains unknown route ${label(route)}`);
    assert(uids.has(uid), `Route index points to unknown UID ${label(uid)}`);
  }

  const audit = auditPublicGraph(graph);
  if (audit.violations.length) {
    throw new Error(formatViolations(audit.violations));
  }

  console.log(JSON.stringify({
    ok: true,
    objectCount: graph.objects.length,
    publishableObjectCount: audit.eligible.length,
    deniedObjectCount: audit.denied.length,
    publicationRule: `default-deny; ${PUBLICATION_MARKER_FIELD} in [${PUBLISHABLE_MARKERS.join('|')}]`,
    contentSha256: graph.content_sha256,
    sourceCommit: manifest.source_commit,
    graphFile: manifest.graph_file || 'public-graph.json',
    graphEncoding: manifest.graph_encoding || 'json'
  }));
}

main().catch((error) => {
  console.error(error.stack ?? error.message ?? String(error));
  process.exitCode = 1;
});
