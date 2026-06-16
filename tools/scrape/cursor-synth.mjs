/**
 * Cursor-driven synthesis — replaces stages 6–8 without API keys.
 *
 * Reads:  cache/<hash>/pass-b-claims.json (all articles)
 * Writes: cache/_corpus/draft-rules.json
 *
 * Algorithm:
 *   1. Collect all Pass-B claims.
 *   2. Group by category.
 *   3. Within category, dedupe by normalised statement (exact) or Jaccard > 0.55.
 *   4. Merge duplicate groups: highest-weight source wins canonical statement;
 *      all sources preserved.
 *   5. Assign id: <category>-<sha256(statement)[:8]>
 *
 * Usage: node tools/scrape/cursor-synth.mjs [--force] [--verbose]
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PassBClaimsFileSchema,
  DraftRuleSchema,
  DraftRulesFileSchema,
  SCHEMA_VERSION,
} from './schema.mjs';
import { listArticleHashes, loadUrlWeights, weightForUrl } from './pipeline-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');
const CORPUS_DIR = resolve(CACHE_DIR, '_corpus');
const OUT = resolve(CORPUS_DIR, 'draft-rules.json');

const JACCARD_THRESHOLD = 0.55;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const VERBOSE = args.includes('--verbose');

function normaliseStatement(s) {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccardWords(a, b) {
  const ta = new Set(normaliseStatement(a).split(/\s+/).filter(Boolean));
  const tb = new Set(normaliseStatement(b).split(/\s+/).filter(Boolean));
  if (ta.size === 0 && tb.size === 0) return 1;
  let inter = 0;
  for (const w of ta) if (tb.has(w)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

function sameClaimGroup(a, b) {
  const na = normaliseStatement(a.statement);
  const nb = normaliseStatement(b.statement);
  if (na === nb) return true;
  return jaccardWords(a.statement, b.statement) >= JACCARD_THRESHOLD;
}

function draftId(category, statement) {
  const h = createHash('sha256').update(statement).digest('hex').slice(0, 8).toUpperCase();
  return `${category}-${h}`;
}

async function collectClaims() {
  const hashes = await listArticleHashes(CACHE_DIR);
  const all = [];
  for (const hash of hashes) {
    const p = resolve(CACHE_DIR, hash, 'pass-b-claims.json');
    if (!existsSync(p)) continue;
    try {
      const data = PassBClaimsFileSchema.parse(JSON.parse(await readFile(p, 'utf8')));
      for (const c of data.claims) all.push(c);
    } catch (e) {
      console.error(`  skip ${hash}/pass-b-claims.json: ${e.message}`);
    }
  }
  return all;
}

function clusterClaims(claims) {
  const groups = [];
  for (const claim of claims) {
    let placed = false;
    for (const g of groups) {
      if (sameClaimGroup(g[0], claim)) {
        g.push(claim);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([claim]);
  }
  return groups;
}

function buildDraftRule(group, weightMap, clusterIdx) {
  const sorted = [...group].sort((a, b) => {
    const wa = weightForUrl(weightMap, a.source_url);
    const wb = weightForUrl(weightMap, b.source_url);
    return wb - wa;
  });
  const canonical = sorted[0];

  const sources = sorted.map(c => ({
    url: c.source_url,
    author: null,
    quote: c.quote,
    weight: weightForUrl(weightMap, c.source_url),
    sourced: c.source_url.startsWith('file://') ? 'local' : 'fetched',
  }));

  const id = draftId(canonical.category, canonical.statement);

  return DraftRuleSchema.parse({
    id,
    category: canonical.category,
    modality: canonical.modality,
    statement: canonical.statement,
    rationale: canonical.rationale,
    scope: canonical.scope?.length ? canonical.scope : ['ui-styling'],
    decidable: 'judgment',
    descriptive_origin: canonical.descriptive_origin ?? false,
    movements: canonical.movements ?? [],
    medium: canonical.medium ?? [],
    sources,
    cluster_id: clusterIdx,
    member_claim_ids: sorted.map((_, i) => `${canonical.source_hash}-${i}`),
  });
}

async function main() {
  if (!FORCE && existsSync(OUT)) {
    process.stdout.write(`Exists: ${OUT} (use --force)\n`);
    process.exit(0);
  }

  const claims = await collectClaims();
  process.stdout.write(`Collected ${claims.length} Pass-B claim(s).\n`);

  if (claims.length === 0) {
    await mkdir(CORPUS_DIR, { recursive: true });
    const empty = DraftRulesFileSchema.parse({
      draft_rules: [],
      schema_version: SCHEMA_VERSION,
    });
    await writeFile(OUT, JSON.stringify(empty, null, 2), 'utf8');
    process.stdout.write('No claims — wrote empty draft-rules.json\n');
    return;
  }

  const weightMap = await loadUrlWeights();

  const byCategory = new Map();
  for (const c of claims) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category).push(c);
  }

  const draftRules = [];
  let clusterIdx = 0;

  for (const [cat, catClaims] of byCategory) {
    const groups = clusterClaims(catClaims);
    if (VERBOSE) {
      process.stdout.write(
        `  ${cat}: ${catClaims.length} claims → ${groups.length} rule(s)\n`,
      );
    }
    for (const g of groups) {
      try {
        draftRules.push(buildDraftRule(g, weightMap, clusterIdx));
        clusterIdx++;
      } catch (e) {
        console.error(`  skip group in ${cat}: ${e.message}`);
      }
    }
  }

  const file = { draft_rules: draftRules, schema_version: SCHEMA_VERSION };
  DraftRulesFileSchema.parse(file);

  await mkdir(CORPUS_DIR, { recursive: true });
  await writeFile(OUT, JSON.stringify(file, null, 2), 'utf8');

  process.stdout.write(
    `Wrote ${OUT} (${draftRules.length} draft rules from ${claims.length} claims)\n`,
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
