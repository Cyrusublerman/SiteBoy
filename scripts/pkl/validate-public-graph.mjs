#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

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
    assert(typeof object.title === 'string' && object.title.length > 0, `${object.uid}: title is required`);
    assert(typeof object.object_type === 'string' && object.object_type.length > 0, `${object.uid}: object type is required`);
    assert(typeof object.route === 'string' && /^\/(wiki|blog|figures)\//.test(object.route), `${object.uid}: invalid route`);
    assert(/^[a-f0-9]{64}$/.test(object.content_hash), `${object.uid}: invalid content hash`);
    assert(Number.isInteger(object.public_revision) && object.public_revision >= 1, `${object.uid}: invalid public revision`);
    assert(!uids.has(object.uid), `Duplicate UID ${object.uid}`);
    assert(!routes.has(object.route), `Duplicate route ${object.route}`);
    uids.add(object.uid);
    routes.add(object.route);
  }

  for (const [route, uid] of Object.entries(graph.routes ?? {})) {
    assert(routes.has(route), `Route index contains unknown route ${route}`);
    assert(uids.has(uid), `Route index points to unknown UID ${uid}`);
  }

  console.log(JSON.stringify({
    ok: true,
    objectCount: graph.objects.length,
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
