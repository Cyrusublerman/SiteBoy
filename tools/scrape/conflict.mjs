/**
 * Stage 9 — Conflict-detect draft rules.
 *
 * Reads:  cache/_corpus/draft-rules.json
 * Writes: cache/_corpus/conflict-free-rules.json
 *         blog/docs/standards/conflicts.queue.md
 *
 * Two rules conflict iff:
 *   (a) semantic similarity > threshold (embedding cosine if OPENAI_API_KEY, else Jaccard)
 *   (b) modalities are opposing: MUST↔MUST_NOT or SHOULD↔SHOULD_NOT
 *   (c) scope arrays overlap
 *
 * Movement-partitioned rules (non-empty, disjoint movements) are logged but
 * not removed — they coexist under different profiles.
 *
 * Usage: node tools/scrape/conflict.mjs [--force] [--verbose]
 */

import OpenAI from 'openai';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DraftRulesFileSchema,
  ConflictPairSchema,
  ConflictFreeRulesFileSchema,
  SCHEMA_VERSION,
} from './schema.mjs';
import { listArticleHashes, l2Normalise } from './pipeline-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');
const CORPUS_DIR = resolve(CACHE_DIR, '_corpus');
const DRAFT_PATH = resolve(CORPUS_DIR, 'draft-rules.json');
const OUT_JSON = resolve(CORPUS_DIR, 'conflict-free-rules.json');
const STANDARDS_DIR = resolve(__dirname, '../../blog/docs/standards');
const OUT_QUEUE = resolve(STANDARDS_DIR, 'conflicts.queue.md');

const SIM_EMBED_THRESHOLD = 0.75;
const SIM_JACCARD_THRESHOLD = 0.35;

const OPPOSING = {
  MUST: 'MUST_NOT',
  MUST_NOT: 'MUST',
  SHOULD: 'SHOULD_NOT',
  SHOULD_NOT: 'SHOULD',
};

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
  const dim = vecs[0].length;
  const sum = new Array(dim).fill(0);
  for (const v of vecs) for (let i = 0; i < dim; i++) sum[i] += v[i];
  return sum.map(x => x / vecs.length);
}

function jaccardSim(a, b) {
  const ta = new Set((a.toLowerCase().match(/\w+/g) || []));
  const tb = new Set((b.toLowerCase().match(/\w+/g) || []));
  let inter = 0;
  for (const w of ta) if (tb.has(w)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

// ── Embedding helpers ─────────────────────────────────────────────────────────

async function buildClaimEmbeddingMap(cacheDir) {
  const map = new Map();
  const hashes = await listArticleHashes(cacheDir);
  for (const hash of hashes) {
    const p = resolve(cacheDir, hash, 'claims-embedded.json');
    if (!existsSync(p)) continue;
    const data = JSON.parse(await readFile(p, 'utf8'));
    for (const c of (data.claims || [])) {
      if (c.claim_id && c.embedding) map.set(c.claim_id, c.embedding);
    }
  }
  return map;
}

async function getRuleEmbeddings(rules, claimEmbMap) {
  const result = [];
  const toEmbedIdx = [];

  for (const rule of rules) {
    const ids = rule.member_claim_ids || [];
    const vecs = ids.map(id => claimEmbMap.get(id)).filter(Boolean);
    if (vecs.length > 0) {
      result.push({ rule, vec: l2Normalise(averageVectors(vecs)) });
    } else {
      result.push({ rule, vec: null });
      toEmbedIdx.push(result.length - 1);
    }
  }

  if (toEmbedIdx.length > 0 && process.env.OPENAI_API_KEY) {
    const client = new OpenAI();
    const statements = toEmbedIdx.map(i => result[i].rule.statement);
    const res = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: statements,
    });
    for (let i = 0; i < toEmbedIdx.length; i++) {
      result[toEmbedIdx[i]].vec = l2Normalise(res.data[i].embedding);
    }
    if (VERBOSE) process.stdout.write(`Re-embedded ${toEmbedIdx.length} rules via OpenAI.\n`);
  } else if (toEmbedIdx.length > 0) {
    if (VERBOSE) {
      process.stdout.write(
        `${toEmbedIdx.length} rules have no cached embeddings; falling back to Jaccard.\n`,
      );
    }
  }

  return result;
}

// ── Conflict detection ────────────────────────────────────────────────────────

function detectConflicts(ruleVecs) {
  const conflicts = [];
  const allHaveVecs = ruleVecs.every(rv => rv.vec !== null);

  for (let i = 0; i < ruleVecs.length; i++) {
    for (let j = i + 1; j < ruleVecs.length; j++) {
      const a = ruleVecs[i].rule;
      const b = ruleVecs[j].rule;

      if (OPPOSING[a.modality] !== b.modality) continue;

      const overlapScope = (a.scope || []).filter(k => (b.scope || []).includes(k));
      if (overlapScope.length === 0) continue;

      let sim;
      if (allHaveVecs && ruleVecs[i].vec && ruleVecs[j].vec) {
        sim = cosineSim(ruleVecs[i].vec, ruleVecs[j].vec);
        if (sim < SIM_EMBED_THRESHOLD) continue;
      } else {
        sim = jaccardSim(a.statement, b.statement);
        if (sim < SIM_JACCARD_THRESHOLD) continue;
      }

      const movA = a.movements || [];
      const movB = b.movements || [];
      const movPartitioned =
        movA.length > 0 && movB.length > 0 && !movA.some(m => movB.includes(m));

      conflicts.push(
        ConflictPairSchema.parse({
          rule_a_id: a.id,
          rule_b_id: b.id,
          statement_a: a.statement,
          statement_b: b.statement,
          modality_a: a.modality,
          modality_b: b.modality,
          cosine_sim: Math.round(sim * 1000) / 1000,
          overlapping_scope: overlapScope,
          movement_partitioned: movPartitioned,
          resolved: false,
          resolution_note: '',
        }),
      );
    }
  }

  return conflicts;
}

// ── Queue file renderer ───────────────────────────────────────────────────────

function renderQueueMd(conflicts) {
  const header = [
    '# Design Rule Conflicts Queue',
    '',
    '<!-- generated: do not edit -->',
    '',
    'Set `resolved: true` and add a `resolution_note` for each entry, then re-run',
    '`npm run scrape:conflict -- --force` to clear the queue and re-emit.',
    '',
  ];

  if (conflicts.length === 0) {
    return [...header, 'No conflicts detected.\n'].join('\n');
  }

  const lines = [...header];
  for (const c of conflicts) {
    lines.push(`## \`${c.rule_a_id}\` ↔ \`${c.rule_b_id}\``);
    lines.push('');
    lines.push(`- **resolved:** ${c.resolved}`);
    lines.push(`- **movement_partitioned:** ${c.movement_partitioned}`);
    lines.push(`- **cosine_sim:** ${c.cosine_sim}`);
    lines.push(`- **overlapping_scope:** \`${c.overlapping_scope.join(', ')}\``);
    lines.push(`- **resolution_note:** ${c.resolution_note || '—'}`);
    lines.push('');
    lines.push(`### Rule A: \`${c.rule_a_id}\``);
    lines.push(`> **${c.modality_a}:** ${c.statement_a}`);
    lines.push('');
    lines.push(`### Rule B: \`${c.rule_b_id}\``);
    lines.push(`> **${c.modality_b}:** ${c.statement_b}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(DRAFT_PATH)) {
    console.error('Missing draft-rules.json — run scrape:synth first.');
    process.exit(1);
  }
  if (!FORCE && existsSync(OUT_JSON)) {
    process.stdout.write(`Exists: ${OUT_JSON} (use --force)\n`);
    process.exit(0);
  }

  const raw = JSON.parse(await readFile(DRAFT_PATH, 'utf8'));
  const { draft_rules: draftRules } = DraftRulesFileSchema.parse(raw);
  process.stdout.write(`Loaded ${draftRules.length} draft rules.\n`);

  await mkdir(CORPUS_DIR, { recursive: true });
  await mkdir(STANDARDS_DIR, { recursive: true });

  if (draftRules.length === 0) {
    const out = ConflictFreeRulesFileSchema.parse({
      draft_rules: [],
      conflicts: [],
      schema_version: SCHEMA_VERSION,
    });
    await writeFile(OUT_JSON, JSON.stringify(out, null, 2), 'utf8');
    await writeFile(OUT_QUEUE, renderQueueMd([]), 'utf8');
    process.stdout.write('No draft rules — wrote empty outputs.\n');
    return;
  }

  const claimEmbMap = await buildClaimEmbeddingMap(CACHE_DIR);
  if (VERBOSE) process.stdout.write(`Claim embedding cache: ${claimEmbMap.size} entries.\n`);

  const ruleVecs = await getRuleEmbeddings(draftRules, claimEmbMap);
  const useEmbed = ruleVecs.some(rv => rv.vec !== null);
  if (VERBOSE) {
    process.stdout.write(
      `Similarity mode: ${useEmbed ? 'embedding cosine' : 'Jaccard word-overlap'}.\n`,
    );
  }

  const conflicts = detectConflicts(ruleVecs);
  process.stdout.write(`Conflicts detected: ${conflicts.length}\n`);

  const unresolvableIds = new Set(
    conflicts
      .filter(c => !c.movement_partitioned)
      .flatMap(c => [c.rule_a_id, c.rule_b_id]),
  );
  const conflictFree = draftRules.filter(r => !unresolvableIds.has(r.id));
  process.stdout.write(
    `Parked (unresolved conflicts): ${draftRules.length - conflictFree.length}\n`,
  );
  process.stdout.write(`Conflict-free rules: ${conflictFree.length}\n`);

  const outDoc = ConflictFreeRulesFileSchema.parse({
    draft_rules: conflictFree,
    conflicts,
    schema_version: SCHEMA_VERSION,
  });

  await writeFile(OUT_JSON, JSON.stringify(outDoc, null, 2), 'utf8');
  await writeFile(OUT_QUEUE, renderQueueMd(conflicts), 'utf8');

  process.stdout.write(`Wrote ${OUT_JSON}\n`);
  process.stdout.write(`Wrote ${OUT_QUEUE}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
