/**
 * Stage 10 — Categorise draft rules by nearest taxonomy centroid.
 *
 * Reads:  cache/_corpus/conflict-free-rules.json
 *         cache/<hash>/claims-embedded.json  (for centroid construction)
 * Writes: cache/_corpus/categorised-rules.json
 *
 * Algorithm:
 *   1. Build per-category centroid = mean of all Pass-B claim embeddings for that category.
 *   2. Embed each draft rule statement (OPENAI_API_KEY required; pass-through if absent).
 *   3. Reassign category when nearest centroid diverges from synth-assigned:
 *      - nearest cosine > 0.7 AND synth-assigned cosine < 0.5  → reassign silently.
 *      - otherwise disagreement → flag category_review=true, keep synth category.
 *   4. category_confidence = cosine to nearest centroid.
 *
 * Usage: node tools/scrape/categorise.mjs [--force] [--verbose]
 */

import OpenAI from 'openai';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ConflictFreeRulesFileSchema,
  CategorisedRulesFileSchema,
  CATEGORIES,
  SCHEMA_VERSION,
} from './schema.mjs';
import { listArticleHashes, l2Normalise } from './pipeline-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');
const CORPUS_DIR = resolve(CACHE_DIR, '_corpus');
const IN_PATH = resolve(CORPUS_DIR, 'conflict-free-rules.json');
const OUT_PATH = resolve(CORPUS_DIR, 'categorised-rules.json');

const REASSIGN_NEAREST = 0.7;
const REASSIGN_SYNTH_MAX = 0.5;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const VERBOSE = args.includes('--verbose');

// ── Vector math ───────────────────────────────────────────────────────────────

function cosineSim(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

function averageVectors(vecs) {
  if (vecs.length === 0) return null;
  const dim = vecs[0].length;
  const sum = new Array(dim).fill(0);
  for (const v of vecs) for (let i = 0; i < dim; i++) sum[i] += v[i];
  return l2Normalise(sum.map(x => x / vecs.length));
}

// ── Centroid construction ─────────────────────────────────────────────────────

async function buildCentroids(cacheDir) {
  const byCategory = new Map();
  for (const cat of CATEGORIES) byCategory.set(cat, []);

  const hashes = await listArticleHashes(cacheDir);
  let totalClaims = 0;

  for (const hash of hashes) {
    const p = resolve(cacheDir, hash, 'claims-embedded.json');
    if (!existsSync(p)) continue;
    const data = JSON.parse(await readFile(p, 'utf8'));
    for (const c of (data.claims || [])) {
      if (c.category && c.embedding && byCategory.has(c.category)) {
        byCategory.get(c.category).push(c.embedding);
        totalClaims++;
      }
    }
  }

  if (VERBOSE) process.stdout.write(`Built centroids from ${totalClaims} claims.\n`);

  const centroids = new Map();
  for (const [cat, vecs] of byCategory) {
    const centroid = averageVectors(vecs);
    if (centroid) centroids.set(cat, centroid);
  }
  return centroids;
}

// ── Embedding ─────────────────────────────────────────────────────────────────

async function embedStatements(statements) {
  const client = new OpenAI();
  const res = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: statements,
  });
  return res.data.map(d => l2Normalise(d.embedding));
}

// ── Nearest centroid ──────────────────────────────────────────────────────────

function nearestCentroid(vec, centroids) {
  let best = null;
  let bestSim = -Infinity;
  for (const [cat, centroid] of centroids) {
    const sim = cosineSim(vec, centroid);
    if (sim > bestSim) {
      bestSim = sim;
      best = cat;
    }
  }
  return { category: best, confidence: Math.max(0, bestSim) };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(IN_PATH)) {
    console.error('Missing conflict-free-rules.json — run scrape:conflict first.');
    process.exit(1);
  }
  if (!FORCE && existsSync(OUT_PATH)) {
    process.stdout.write(`Exists: ${OUT_PATH} (use --force)\n`);
    process.exit(0);
  }

  const raw = JSON.parse(await readFile(IN_PATH, 'utf8'));
  const { draft_rules: conflictFreeRules } = ConflictFreeRulesFileSchema.parse(raw);
  process.stdout.write(`Loaded ${conflictFreeRules.length} conflict-free rules.\n`);

  await mkdir(CORPUS_DIR, { recursive: true });

  if (conflictFreeRules.length === 0) {
    const out = CategorisedRulesFileSchema.parse({
      draft_rules: [],
      schema_version: SCHEMA_VERSION,
    });
    await writeFile(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
    process.stdout.write('No rules to categorise — wrote empty output.\n');
    return;
  }

  const centroids = await buildCentroids(CACHE_DIR);

  if (centroids.size === 0 || !process.env.OPENAI_API_KEY) {
    if (!process.env.OPENAI_API_KEY) {
      process.stdout.write(
        'OPENAI_API_KEY not set — passing through synth categories without re-categorisation.\n',
      );
    } else {
      process.stdout.write('No centroid data — passing through synth categories.\n');
    }

    const passthrough = conflictFreeRules.map(rule => ({
      ...rule,
      nearest_category: rule.category,
      category_confidence: 0,
      category_review: false,
    }));
    const out = CategorisedRulesFileSchema.parse({
      draft_rules: passthrough,
      schema_version: SCHEMA_VERSION,
    });
    await writeFile(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
    process.stdout.write(`Wrote ${OUT_PATH} (passthrough, ${passthrough.length} rules)\n`);
    return;
  }

  process.stdout.write(`Embedding ${conflictFreeRules.length} rule statements...\n`);
  const statements = conflictFreeRules.map(r => r.statement);
  const embeddings = await embedStatements(statements);

  let reassigned = 0;
  let flagged = 0;

  const categorised = conflictFreeRules.map((rule, idx) => {
    const vec = embeddings[idx];
    const { category: nearest, confidence } = nearestCentroid(vec, centroids);

    const synthCat = rule.category;
    let finalCategory = synthCat;
    let review = false;

    if (nearest && nearest !== synthCat) {
      const synthSim = centroids.has(synthCat)
        ? cosineSim(vec, centroids.get(synthCat))
        : 0;

      if (confidence > REASSIGN_NEAREST && synthSim < REASSIGN_SYNTH_MAX) {
        finalCategory = nearest;
        reassigned++;
        if (VERBOSE) {
          process.stdout.write(
            `  [REASSIGN] ${rule.id}: ${synthCat} → ${nearest} (nearest=${confidence.toFixed(3)}, synth=${synthSim.toFixed(3)})\n`,
          );
        }
      } else {
        review = true;
        flagged++;
        if (VERBOSE) {
          process.stdout.write(
            `  [REVIEW]   ${rule.id}: synth=${synthCat}, nearest=${nearest} (conf=${confidence.toFixed(3)})\n`,
          );
        }
      }
    }

    return {
      ...rule,
      category: finalCategory,
      nearest_category: nearest || synthCat,
      category_confidence: Math.round(confidence * 1000) / 1000,
      category_review: review,
    };
  });

  process.stdout.write(`Reassigned: ${reassigned}, flagged for review: ${flagged}\n`);

  const out = CategorisedRulesFileSchema.parse({
    draft_rules: categorised,
    schema_version: SCHEMA_VERSION,
  });
  await writeFile(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  process.stdout.write(`Wrote ${OUT_PATH} (${categorised.length} rules)\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
