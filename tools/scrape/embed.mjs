/**
 * Stage 6 — Embed Pass-B claim statements (OpenAI text-embedding-3-small).
 *
 * Reads:  cache/<hash>/pass-b-claims.json
 * Writes: cache/<hash>/claims-embedded.json
 *
 * Env: OPENAI_API_KEY
 *
 * Usage:
 *   node tools/scrape/embed.mjs [--force] [--verbose] [--article=<hash>]
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { PassBClaimsFileSchema, EmbeddedClaimsFileSchema } from './schema.mjs';
import { claimId, listArticleHashes } from './pipeline-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');
const EMBED_MODEL = 'text-embedding-3-small';
const BATCH = 100;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const VERBOSE = args.includes('--verbose');
const articleArg = args.find(a => a.startsWith('--article='));
const SINGLE_HASH = articleArg ? articleArg.split('=')[1] : null;

async function embedBatch(client, texts) {
  const res = await client.embeddings.create({
    model: EMBED_MODEL,
    input: texts,
  });
  return res.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
}

async function processHash(hash) {
  const dir = resolve(CACHE_DIR, hash);
  const inPath = resolve(dir, 'pass-b-claims.json');
  const outPath = resolve(dir, 'claims-embedded.json');

  if (!existsSync(inPath)) {
    return { hash, outcome: 'skip/no-pass-b' };
  }
  if (!FORCE && existsSync(outPath)) {
    return { hash, outcome: 'cached' };
  }

  const raw = JSON.parse(await readFile(inPath, 'utf8'));
  const { claims } = PassBClaimsFileSchema.parse(raw);
  if (claims.length === 0) {
    await writeFile(outPath, JSON.stringify({ claims: [], embedding_model: EMBED_MODEL }, null, 2), 'utf8');
    return { hash, outcome: 'ok-empty' };
  }

  const client = new OpenAI();
  const embedded = [];

  for (let i = 0; i < claims.length; i += BATCH) {
    const batch = claims.slice(i, i + BATCH);
    const texts = batch.map(c => c.statement);
    const vectors = await embedBatch(client, texts);
    for (let j = 0; j < batch.length; j++) {
      const c = batch[j];
      const idx = i + j;
      embedded.push({
        ...c,
        claim_id: claimId(c.source_hash, c.statement, idx),
        embedding: vectors[j],
      });
    }
  }

  const file = { claims: embedded, embedding_model: EMBED_MODEL };
  EmbeddedClaimsFileSchema.parse(file);
  await writeFile(outPath, JSON.stringify(file, null, 2), 'utf8');
  if (VERBOSE) process.stdout.write(`  [ok] ${hash} — ${embedded.length} vectors\n`);
  return { hash, outcome: 'ok', n: embedded.length };
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is required for embed stage.');
    process.exit(1);
  }

  const hashes = SINGLE_HASH ? [SINGLE_HASH] : await listArticleHashes(CACHE_DIR);
  if (VERBOSE) process.stdout.write(`Embedding ${hashes.length} article(s)\n`);

  const results = [];
  for (const hash of hashes) {
    const r = await processHash(hash);
    results.push(r);
    if (r.outcome === 'ok' || r.outcome === 'ok-empty') {
      process.stdout.write(`  [${r.outcome}] ${hash}${r.n != null ? ` (${r.n})` : ''}\n`);
    } else {
      process.stdout.write(`  [${r.outcome}] ${hash}\n`);
    }
  }

  const ok = results.filter(r => r.outcome === 'ok' || r.outcome === 'ok-empty').length;
  process.stdout.write(`\n── Summary ──\n  embedded: ${ok}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
