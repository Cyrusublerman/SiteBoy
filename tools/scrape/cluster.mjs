/**
 * Stage 7 — Cluster embedded claims (HDBSCAN on L2-normalised embeddings ≈ cosine).
 *
 * Reads:  cache/<hash>/claims-embedded.json
 * Writes: cache/_corpus/clusters.json
 *
 * Implementation: hdbscan-ts (MIT). Vectors are L2-normalised so Euclidean MRD ≈ cosine separation.
 *
 * Usage:
 *   node tools/scrape/cluster.mjs [--verbose] [--min-size=N] [--min-samples=N]
 */

import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EmbeddedClaimsFileSchema, SCHEMA_VERSION } from './schema.mjs';
import { listArticleHashes, l2Normalise } from './pipeline-lib.mjs';

const require = createRequire(import.meta.url);
const { HDBSCAN } = require('hdbscan-ts');

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');
const CORPUS_DIR = resolve(CACHE_DIR, '_corpus');
const OUT = resolve(CORPUS_DIR, 'clusters.json');

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose');
const minSizeArg = args.find(a => a.startsWith('--min-size='));
const MIN_CLUSTER = minSizeArg ? parseInt(minSizeArg.split('=')[1], 10) : 2;
const minSamplesArg = args.find(a => a.startsWith('--min-samples='));
const MIN_SAMPLES = minSamplesArg ? parseInt(minSamplesArg.split('=')[1], 10) : MIN_CLUSTER;

function stripEmbedding(c) {
  const { embedding, ...rest } = c;
  return rest;
}

async function main() {
  const hashes = await listArticleHashes(CACHE_DIR);
  const points = [];

  for (const hash of hashes) {
    const p = resolve(CACHE_DIR, hash, 'claims-embedded.json');
    if (!existsSync(p)) continue;
    const data = EmbeddedClaimsFileSchema.parse(JSON.parse(await readFile(p, 'utf8')));
    for (const c of data.claims) {
      points.push({
        claim_id: c.claim_id,
        source_hash: c.source_hash,
        norm: l2Normalise([...c.embedding]),
        claim: stripEmbedding(c),
      });
    }
  }

  if (points.length === 0) {
    process.stdout.write('No embedded claims found. Run scrape:extract then OPENAI_API_KEY=… scrape:embed.\n');
    await mkdir(CORPUS_DIR, { recursive: true });
    await writeFile(
      OUT,
      JSON.stringify(
        {
          schema_version: SCHEMA_VERSION,
          algorithm: 'hdbscan-ts',
          min_cluster_size: MIN_CLUSTER,
          min_samples: MIN_SAMPLES,
          point_count: 0,
          clusters: [],
          noise_claim_ids: [],
          noise_members: [],
        },
        null,
        2,
      ),
      'utf8',
    );
    return;
  }

  if (points.length === 1) {
    await mkdir(CORPUS_DIR, { recursive: true });
    const payload = {
      schema_version: SCHEMA_VERSION,
      algorithm: 'hdbscan-ts-degenerate',
      min_cluster_size: MIN_CLUSTER,
      min_samples: MIN_SAMPLES,
      point_count: 1,
      clusters: [
        {
          cluster_id: 0,
          claim_ids: [points[0].claim_id],
          members: [points[0].claim],
        },
      ],
      noise_claim_ids: [],
      noise_members: [],
    };
    await writeFile(OUT, JSON.stringify(payload, null, 2), 'utf8');
    process.stdout.write('Single point — assigned trivial cluster 0.\n');
    return;
  }

  const matrix = points.map(p => p.norm);
  const hdbscan = new HDBSCAN({
    minClusterSize: MIN_CLUSTER,
    minSamples: MIN_SAMPLES,
    debugMode: false,
  });

  const labels = hdbscan.fit(matrix);
  if (VERBOSE) process.stderr.write(`Labels: ${JSON.stringify(labels)}\n`);

  const byLabel = new Map();
  const noiseIds = [];
  const noiseMembers = [];

  for (let i = 0; i < labels.length; i++) {
    const lab = labels[i];
    if (lab === -1) {
      noiseIds.push(points[i].claim_id);
      noiseMembers.push(points[i].claim);
      continue;
    }
    if (!byLabel.has(lab)) byLabel.set(lab, []);
    byLabel.get(lab).push(points[i]);
  }

  const clusters = [...byLabel.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([cluster_id, pts]) => ({
      cluster_id,
      claim_ids: pts.map(p => p.claim_id),
      members: pts.map(p => p.claim),
    }));

  const payload = {
    schema_version: SCHEMA_VERSION,
    algorithm: 'hdbscan-ts',
    min_cluster_size: MIN_CLUSTER,
    min_samples: MIN_SAMPLES,
    embedding_note: 'L2-normalised; Euclidean MRD proxies cosine (plan ~0.82 threshold via density, not fixed eps)',
    point_count: points.length,
    clusters,
    noise_claim_ids: noiseIds,
    noise_members: noiseMembers,
  };

  await mkdir(CORPUS_DIR, { recursive: true });
  await writeFile(OUT, JSON.stringify(payload, null, 2), 'utf8');

  process.stdout.write(`Wrote ${OUT}\n`);
  process.stdout.write(`  points: ${points.length}\n`);
  process.stdout.write(`  clusters: ${clusters.length}\n`);
  process.stdout.write(`  noise: ${noiseIds.length}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
