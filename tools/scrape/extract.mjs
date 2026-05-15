/**
 * Stage 5 — Pass-B LLM extract
 *
 * Reads cache/<hash>/clean.md, chunks text, calls Claude or OpenAI, validates
 * quotes with normaliseForQuoteMatch against the full article (H-010).
 *
 * Env:
 *   ANTHROPIC_API_KEY — primary (--provider=anthropic)
 *   OPENAI_API_KEY     — alternate (--provider=openai)
 *
 * Usage:
 *   node tools/scrape/extract.mjs [--force] [--dry-run] [--verbose]
 *        [--article=<hash>] [--max-chunks=N]
 *        [--provider=anthropic|openai] [--model=<id>]
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir } from 'node:fs/promises';
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
  PassBClaimsChunkResponseSchema,
  PassBClaimSchema,
  normaliseForQuoteMatch,
} from './schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');
const PROMPT_PATH = resolve(__dirname, 'prompts', 'pass-b.md');
const SOURCES_JSON = resolve(__dirname, 'sources.json');

const CHUNK_MAX_CHARS = 20_000;
const CHUNK_OVERLAP = 400;

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_OPENAI_MODEL = 'gpt-4o';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');
const articleArg = args.find(a => a.startsWith('--article='));
const SINGLE_HASH = articleArg ? articleArg.split('=')[1] : null;
const maxChunksArg = args.find(a => a.startsWith('--max-chunks='));
const MAX_CHUNKS = maxChunksArg ? parseInt(maxChunksArg.split('=')[1], 10) : Infinity;
const providerArg = args.find(a => a.startsWith('--provider='));
const PROVIDER = providerArg?.split('=')[1] === 'openai' ? 'openai' : 'anthropic';
const modelArg = args.find(a => a.startsWith('--model='));
const MODEL = modelArg ? modelArg.split('=')[1] : null;

function chunkArticle(text, maxChunk = CHUNK_MAX_CHARS, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  if (text.length <= maxChunk) return [text];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxChunk, text.length);
    if (end < text.length) {
      const slice = text.slice(start, end);
      const lastBreak = slice.lastIndexOf('\n\n');
      if (lastBreak > maxChunk * 0.5) end = start + lastBreak;
    }
    chunks.push(text.slice(start, end));
    if (end >= text.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}

function parseJsonFromAssistant(text) {
  const t = text.trim();
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return JSON.parse(fenced[1].trim());
  return JSON.parse(t);
}

/** Strip null fields LLMs emit against schema (e.g. assertion_line: null). */
function sanitizeChunkResponse(obj) {
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.claims)) return obj;
  return {
    claims: obj.claims.map(c => {
      const out = { ...c };
      if (out.assertion_line === null || out.assertion_line === undefined) delete out.assertion_line;
      return out;
    }),
  };
}

async function loadSourcesByHash() {
  const map = new Map();
  try {
    const raw = await readFile(SOURCES_JSON, 'utf8');
    const sources = JSON.parse(raw);
    for (const s of sources) {
      const hash = createHash('sha256').update(s.url).digest('hex').slice(0, 12);
      map.set(hash, s.url);
    }
  } catch {
    /* optional */
  }
  return map;
}

function taxonomyBlock() {
  return [
    'CATEGORIES (use exactly one string per claim):',
    JSON.stringify([...CATEGORIES]),
    'MODALITIES:',
    JSON.stringify([...MODALITIES]),
    'SCOPE_KEYS:',
    JSON.stringify([...SCOPE_KEYS]),
    'MOVEMENTS:',
    JSON.stringify([...MOVEMENTS]),
    'SURFACES (medium):',
    JSON.stringify([...SURFACES]),
  ].join('\n');
}

async function buildSystemPrompt() {
  const passB = await readFile(PROMPT_PATH, 'utf8');
  return `${passB}\n\n---\n\n${taxonomyBlock()}`;
}

function formatAssertionHints(assertions) {
  if (!assertions?.length) return '';
  const lines = assertions.map(
    a => `- line ${a.line}: ${a.statement.slice(0, 120)}${a.statement.length > 120 ? '…' : ''}`,
  );
  return `Pass-A hints (optional; every claim still needs a verbatim quote from the chunk):\n${lines.join('\n')}\n`;
}

async function callAnthropic(system, userContent) {
  const client = new Anthropic();
  const model = MODEL || DEFAULT_ANTHROPIC_MODEL;
  const msg = await client.messages.create({
    model,
    max_tokens: 8192,
    system,
    messages: [{ role: 'user', content: userContent }],
  });
  const textBlock = msg.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error('Anthropic: no text block in response');
  return textBlock.text;
}

async function callOpenAI(system, userContent) {
  const client = new OpenAI();
  const model = MODEL || DEFAULT_OPENAI_MODEL;
  const res = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userContent },
    ],
  });
  const txt = res.choices[0]?.message?.content;
  if (!txt) throw new Error('OpenAI: empty completion');
  return txt;
}

function quoteMatchesArticle(quote, articleNorm) {
  const q = normaliseForQuoteMatch(quote);
  return q.length > 0 && articleNorm.includes(q);
}

function dedupeClaims(claims) {
  const seen = new Set();
  const out = [];
  for (const c of claims) {
    const key = normaliseForQuoteMatch(c.statement);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

async function processHash(hash, sourceUrl, systemPrompt, articleNorm, sourcesByHash) {
  const dir = resolve(CACHE_DIR, hash);
  const cleanPath = resolve(dir, 'clean.md');
  const assertionsPath = resolve(dir, 'assertions.json');
  const outPath = resolve(dir, 'pass-b-claims.json');

  if (!existsSync(cleanPath)) {
    return { hash, outcome: 'skip/no-clean' };
  }
  if (!FORCE && existsSync(outPath)) {
    return { hash, outcome: 'cached' };
  }

  const body = await readFile(cleanPath, 'utf8');
  const resolvedUrl =
    sourceUrl && /^https?:\/\//i.test(sourceUrl)
      ? sourceUrl
      : sourcesByHash.get(hash) ?? `https://invalid.local/article#${hash}`;

  let assertions = [];
  if (existsSync(assertionsPath)) {
    try {
      assertions = JSON.parse(await readFile(assertionsPath, 'utf8'));
    } catch {
      assertions = [];
    }
  }

  const chunks = chunkArticle(body);
  const limitedChunks = Number.isFinite(MAX_CHUNKS) ? chunks.slice(0, MAX_CHUNKS) : chunks;

  if (VERBOSE || DRY_RUN) {
    process.stdout.write(`  [${hash}] ${chunks.length} chunk(s), processing ${limitedChunks.length}\n`);
    limitedChunks.forEach((c, i) => {
      process.stdout.write(`    chunk ${i}: ${c.length} chars\n`);
    });
  }

  if (DRY_RUN) {
    return { hash, outcome: 'dry-run', chunks: limitedChunks.length };
  }

  const allRaw = [];
  for (let i = 0; i < limitedChunks.length; i++) {
    const chunk = limitedChunks[i];
    const hints = i === 0 ? formatAssertionHints(assertions) : '';
    const userContent = [
      `Article chunk ${i + 1}/${limitedChunks.length} (use only this text for quotes):\n\n`,
      chunk,
      '\n\n',
      hints,
    ].join('');

    const assistantText =
      PROVIDER === 'openai'
        ? await callOpenAI(systemPrompt, userContent)
        : await callAnthropic(systemPrompt, userContent);

    let parsed;
    try {
      parsed = sanitizeChunkResponse(parseJsonFromAssistant(assistantText));
    } catch (e) {
      console.error(`  [parse error] ${hash} chunk ${i}: ${e.message}`);
      continue;
    }

    let validated;
    try {
      validated = PassBClaimsChunkResponseSchema.parse(parsed);
    } catch (e) {
      console.error(`  [schema error] ${hash} chunk ${i}: ${e.message}`);
      continue;
    }

    for (const c of validated.claims) {
      const scope = c.scope?.length ? c.scope : ['ui-styling'];
      const merged = { ...c, scope };

      if (!quoteMatchesArticle(merged.quote, articleNorm)) {
        if (VERBOSE) {
          process.stderr.write(`  [quote guard drop] ${merged.statement.slice(0, 60)}…\n`);
        }
        continue;
      }

      try {
        const full = PassBClaimSchema.parse({
          ...merged,
          source_hash: hash,
          source_url: resolvedUrl,
        });
        allRaw.push(full);
      } catch (e) {
        if (VERBOSE) console.error(`  [claim reject] ${e.message}`);
      }
    }
  }

  const claims = dedupeClaims(allRaw);
  await writeFile(outPath, JSON.stringify({ claims }, null, 2), 'utf8');
  if (VERBOSE) {
    process.stdout.write(`  [wrote] ${outPath} (${claims.length} claims)\n`);
  }
  return { hash, outcome: 'ok', claimCount: claims.length, url: resolvedUrl };
}

async function main() {
  if (PROVIDER === 'anthropic' && !process.env.ANTHROPIC_API_KEY && !DRY_RUN) {
    console.error('Set ANTHROPIC_API_KEY or use --provider=openai with OPENAI_API_KEY, or --dry-run');
    process.exit(1);
  }
  if (PROVIDER === 'openai' && !process.env.OPENAI_API_KEY && !DRY_RUN) {
    console.error('Set OPENAI_API_KEY or --provider=anthropic with ANTHROPIC_API_KEY, or --dry-run');
    process.exit(1);
  }

  const systemPrompt = await buildSystemPrompt();
  const sourcesByHash = await loadSourcesByHash();

  let hashes;
  if (SINGLE_HASH) {
    hashes = [SINGLE_HASH];
  } else {
    const dirents = await readdir(CACHE_DIR, { withFileTypes: true });
    hashes = dirents.filter(d => d.isDirectory()).map(d => d.name);
  }

  if (hashes.length === 0) {
    process.stdout.write('No cache entries. Run scrape:fetch && scrape:clean first.\n');
    process.exit(0);
  }

  process.stdout.write(
    `Pass-B extract: provider=${PROVIDER} model=${MODEL || '(default)'} dry-run=${DRY_RUN} force=${FORCE}\n\n`,
  );

  const results = [];
  for (const hash of hashes) {
    const metaPath = resolve(CACHE_DIR, hash, 'meta.json');
    let metaUrl = null;
    try {
      const meta = JSON.parse(await readFile(metaPath, 'utf8'));
      metaUrl = meta.url ?? null;
    } catch {
      /* */
    }
    const body = await readFile(resolve(CACHE_DIR, hash, 'clean.md'), 'utf8').catch(() => '');
    const articleNorm = normaliseForQuoteMatch(body);
    const r = await processHash(hash, metaUrl, systemPrompt, articleNorm, sourcesByHash);
    results.push(r);

    if (r.outcome === 'ok') {
      process.stdout.write(`  [ok] ${r.url} — ${r.claimCount} claims\n`);
    } else if (r.outcome === 'dry-run') {
      process.stdout.write(`  [dry-run] ${hash} — ${r.chunks} chunk(s)\n`);
    } else {
      process.stdout.write(`  [${r.outcome}] ${hash}\n`);
    }
  }

  const ok = results.filter(r => r.outcome === 'ok').length;
  process.stdout.write(`\n── Summary ──\n  ok: ${ok}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
