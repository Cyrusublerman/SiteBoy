/**
 * Stage 8 — Synthesize draft rules from HDBSCAN clusters (LLM merge + singleton shortcut).
 *
 * Reads:  cache/_corpus/clusters.json
 * Writes: cache/_corpus/draft-rules.json
 *
 * Env: ANTHROPIC_API_KEY (default) or OPENAI_API_KEY (--provider=openai)
 *
 * Usage:
 *   node tools/scrape/synth.mjs [--force] [--verbose] [--provider=anthropic|openai] [--model=...]
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {
  CATEGORIES,
  MODALITIES,
  MOVEMENTS,
  SCOPE_KEYS,
  SURFACES,
  SynthClusterLLMSchema,
  DraftRuleSchema,
  DraftRulesFileSchema,
  SCHEMA_VERSION,
} from './schema.mjs';
import { loadUrlWeights, weightForUrl } from './pipeline-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');
const CORPUS_DIR = resolve(CACHE_DIR, '_corpus');
const CLUSTERS_PATH = resolve(CORPUS_DIR, 'clusters.json');
const OUT = resolve(CORPUS_DIR, 'draft-rules.json');
const PROMPT = resolve(__dirname, 'prompts', 'synth.md');

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_OPENAI_MODEL = 'gpt-4o';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const VERBOSE = args.includes('--verbose');
const providerArg = args.find(a => a.startsWith('--provider='));
const PROVIDER = providerArg?.split('=')[1] === 'openai' ? 'openai' : 'anthropic';
const modelArg = args.find(a => a.startsWith('--model='));
const MODEL = modelArg ? modelArg.split('=')[1] : null;

function parseJsonFromAssistant(text) {
  const t = text.trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return JSON.parse(fenced[1].trim());
  return JSON.parse(t);
}

function taxonomyBlock() {
  return [
    'CATEGORIES:',
    JSON.stringify([...CATEGORIES]),
    'MODALITIES:',
    JSON.stringify([...MODALITIES]),
    'SCOPE_KEYS:',
    JSON.stringify([...SCOPE_KEYS]),
    'MOVEMENTS:',
    JSON.stringify([...MOVEMENTS]),
    'SURFACES:',
    JSON.stringify([...SURFACES]),
  ].join('\n');
}

async function buildSystemPrompt() {
  const body = await readFile(PROMPT, 'utf8');
  return `${body}\n\n---\n\n${taxonomyBlock()}`;
}

function sourcesFromMembers(members, weightMap) {
  const out = [];
  for (const c of members) {
    out.push({
      url: c.source_url,
      author: null,
      quote: c.quote,
      weight: weightForUrl(weightMap, c.source_url),
      sourced: 'fetched',
    });
  }
  return out;
}

function draftFromSingleton(clusterId, c, weightMap) {
  const sources = sourcesFromMembers([c], weightMap);
  const id = `${c.category}-c${clusterId}-${c.claim_id.slice(0, 8)}`;
  return DraftRuleSchema.parse({
    id,
    category: c.category,
    modality: c.modality,
    statement: c.statement,
    rationale: c.rationale,
    scope: c.scope?.length ? c.scope : ['ui-styling'],
    decidable: 'judgment',
    descriptive_origin: c.descriptive_origin ?? false,
    movements: c.movements ?? [],
    medium: c.medium ?? [],
    sources,
    cluster_id: clusterId,
    member_claim_ids: [c.claim_id],
  });
}

function mergedId(clusterId, category, claimIds) {
  const h = createHash('sha256').update([...claimIds].sort().join(',')).digest('hex').slice(0, 8);
  return `${category}-c${clusterId}-${h}`;
}

async function callAnthropic(system, user) {
  const client = new Anthropic();
  const model = MODEL || DEFAULT_ANTHROPIC_MODEL;
  const msg = await client.messages.create({
    model,
    max_tokens: 2048,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const text = msg.content.find(b => b.type === 'text');
  if (!text) throw new Error('no text');
  return text.text;
}

async function callOpenAI(system, user) {
  const client = new OpenAI();
  const model = MODEL || DEFAULT_OPENAI_MODEL;
  const res = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  const t = res.choices[0]?.message?.content;
  if (!t) throw new Error('empty');
  return t;
}

async function synthCluster(cluster, systemPrompt, weightMap) {
  const { cluster_id, members, claim_ids } = cluster;
  if (members.length === 1) {
    return draftFromSingleton(cluster_id, members[0], weightMap);
  }

  const payload = members.map(m => ({
    statement: m.statement,
    modality: m.modality,
    category: m.category,
    rationale: m.rationale,
    scope: m.scope,
    quote: m.quote,
    source_url: m.source_url,
    descriptive_origin: m.descriptive_origin,
    movements: m.movements,
    medium: m.medium,
    claim_id: m.claim_id,
  }));

  const user = JSON.stringify(payload, null, 2);
  const assistant =
    PROVIDER === 'openai'
      ? await callOpenAI(systemPrompt, user)
      : await callAnthropic(systemPrompt, user);

  const raw = parseJsonFromAssistant(assistant);
  const llm = SynthClusterLLMSchema.parse(raw);
  const sources = sourcesFromMembers(members, weightMap);
  const id = mergedId(cluster_id, llm.category, claim_ids);

  return DraftRuleSchema.parse({
    id,
    category: llm.category,
    modality: llm.modality,
    statement: llm.statement,
    rationale: llm.rationale,
    scope: llm.scope?.length ? llm.scope : ['ui-styling'],
    decidable: 'judgment',
    descriptive_origin: llm.descriptive_origin,
    movements: llm.movements,
    medium: llm.medium,
    sources,
    cluster_id,
    member_claim_ids: claim_ids,
  });
}

async function main() {
  if (!existsSync(CLUSTERS_PATH)) {
    console.error('Missing clusters.json — run node tools/scrape/cluster.mjs first.');
    process.exit(1);
  }
  if (!FORCE && existsSync(OUT)) {
    process.stdout.write(`Exists: ${OUT} (use --force)\n`);
    process.exit(0);
  }

  const clustersDoc = JSON.parse(await readFile(CLUSTERS_PATH, 'utf8'));
  const clusters = clustersDoc.clusters ?? [];
  const needsLLM = clusters.some(c => (c.members ?? []).length > 1);

  if (needsLLM) {
    if (PROVIDER === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY required for multi-member clusters (or use --provider=openai).');
      process.exit(1);
    }
    if (PROVIDER === 'openai' && !process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY required for --provider=openai');
      process.exit(1);
    }
  }

  const weightMap = await loadUrlWeights();
  const systemPrompt = needsLLM ? await buildSystemPrompt() : '';

  const draftRules = [];
  let synthCalls = 0;

  for (const c of clustersDoc.clusters ?? []) {
    if ((c.members ?? []).length > 1) synthCalls++;
    try {
      const d = await synthCluster(c, systemPrompt, weightMap);
      draftRules.push(d);
      if (VERBOSE) process.stdout.write(`  cluster ${c.cluster_id} -> ${d.id}\n`);
    } catch (e) {
      console.error(`cluster ${c.cluster_id} failed: ${e.message}`);
    }
  }

  const noiseMembers = clustersDoc.noise_members ?? [];
  let noiseIdx = 0;
  for (const c of noiseMembers) {
    const d = draftFromSingleton(-1 - noiseIdx, c, weightMap);
    draftRules.push(d);
    noiseIdx++;
    if (VERBOSE) process.stdout.write(`  noise -> ${d.id}\n`);
  }

  const file = { draft_rules: draftRules, schema_version: SCHEMA_VERSION };
  DraftRulesFileSchema.parse(file);
  await mkdir(CORPUS_DIR, { recursive: true });
  await writeFile(OUT, JSON.stringify(file, null, 2), 'utf8');

  process.stdout.write(`Wrote ${OUT} (${draftRules.length} draft rules, ${synthCalls} LLM merges)\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
