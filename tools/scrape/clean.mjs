/**
 * Stages 2-3 — Clean + Convert
 *
 * For each cached raw.html in tools/scrape/cache/:
 *   Stage 2: @mozilla/readability → cache/<hash>/readable.html
 *   Stage 3: turndown → cache/<hash>/clean.md
 *
 * Post-process: strip image markdown, normalise whitespace.
 * Body-length gate: clean.md < 1000 chars → Tier-3 manual-paste queue.
 * Updates meta.json: cleaned_at, clean_length, tier_promoted.
 *
 * Usage:
 *   node tools/scrape/clean.mjs [--force] [--hash=<12-char>]
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { appendQueueEntry, queueIdsSet } from './queue-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');
const SOURCES_JSON = resolve(__dirname, 'sources.json');

const CLEAN_WARN_CHARS = 200;
const CLEAN_TIER3_CHARS = 1000;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const hashArg = args.find(a => a.startsWith('--hash='));
const SINGLE_HASH = hashArg ? hashArg.split('=')[1] : null;

const td = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

td.addRule('keep-tables', {
  filter: ['table'],
  replacement(_content, node) {
    return node.outerHTML + '\n\n';
  },
});

td.remove(['script', 'style', 'nav', 'footer', 'header', 'aside', 'noscript', 'img']);

function postProcessMarkdown(md) {
  return md
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

async function loadSourceIndexByUrl() {
  const map = new Map();
  try {
    const sources = JSON.parse(await readFile(SOURCES_JSON, 'utf8'));
    sources.forEach((s, i) => map.set(s.url, i));
  } catch {
    /* */
  }
  return map;
}

async function processEntry(hash, sourceIndexByUrl, queuedIds) {
  const dir = resolve(CACHE_DIR, hash);
  const rawPath = resolve(dir, 'raw.html');
  const readablePath = resolve(dir, 'readable.html');
  const cleanPath = resolve(dir, 'clean.md');
  const metaPath = resolve(dir, 'meta.json');

  if (!existsSync(rawPath)) return { hash, outcome: 'skip/no-raw' };

  let meta = {};
  try {
    meta = JSON.parse(await readFile(metaPath, 'utf8'));
  } catch {
    /* non-fatal */
  }

  if (!FORCE && existsSync(cleanPath)) {
    return { hash, outcome: 'cached' };
  }

  const rawHtml = await readFile(rawPath, 'utf8');
  const dom = new JSDOM(rawHtml, { url: meta.url ?? 'https://example.com' });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  let readableHtml;
  if (article?.content) {
    readableHtml = article.content;
  } else {
    readableHtml = dom.window.document.body?.innerHTML ?? rawHtml;
  }

  await writeFile(readablePath, readableHtml, 'utf8');

  let markdown = postProcessMarkdown(td.turndown(readableHtml));
  await writeFile(cleanPath, markdown, 'utf8');

  const charCount = markdown.length;
  const cleaned_at = new Date().toISOString();
  let tier_promoted = false;

  if (charCount < CLEAN_TIER3_CHARS && meta.url && !queuedIds.has(hash)) {
    const idx = sourceIndexByUrl.get(meta.url) ?? -1;
    appendQueueEntry({
      id: hash,
      url: meta.url,
      status: 'pending',
      reason: 'empty',
      detected_at: cleaned_at,
      source_index: String(idx),
    });
    queuedIds.add(hash);
    tier_promoted = true;
    process.stdout.write(`  [tier3/thin] ${hash} — ${charCount} chars (${meta.url})\n`);
    return { hash, outcome: 'tier3-thin', chars: charCount };
  }

  if (charCount < CLEAN_WARN_CHARS) {
    process.stdout.write(`  [warn/thin] ${hash} — ${charCount} chars (${meta.url ?? 'unknown'})\n`);
  } else {
    process.stdout.write(`  [ok] ${hash} — ${charCount} chars (${meta.url ?? 'unknown'})\n`);
  }

  await writeFile(
    metaPath,
    JSON.stringify(
      {
        ...meta,
        cleaned_at,
        clean_length: charCount,
        tier_promoted,
      },
      null,
      2,
    ),
    'utf8',
  );

  return { hash, outcome: charCount < CLEAN_WARN_CHARS ? 'warn-thin' : 'ok', chars: charCount };
}

async function main() {
  let entries;
  if (SINGLE_HASH) {
    entries = [SINGLE_HASH];
  } else {
    try {
      const items = await readdir(CACHE_DIR, { withFileTypes: true });
      entries = items
        .filter(d => d.isDirectory() && !d.name.startsWith('_'))
        .map(d => d.name);
    } catch {
      process.stdout.write('No cache directory found. Run npm run scrape:fetch first.\n');
      process.exit(0);
    }
  }

  if (entries.length === 0) {
    process.stdout.write('Cache is empty. Run npm run scrape:fetch first.\n');
    process.exit(0);
  }

  const sourceIndexByUrl = await loadSourceIndexByUrl();
  const queuedIds = queueIdsSet();

  process.stdout.write(`Cleaning ${entries.length} cached entries (force=${FORCE})\n\n`);

  const results = [];
  for (const hash of entries) {
    results.push(await processEntry(hash, sourceIndexByUrl, queuedIds));
  }

  const summary = results.reduce((acc, r) => {
    acc[r.outcome] = (acc[r.outcome] ?? 0) + 1;
    return acc;
  }, {});

  process.stdout.write('\n── Summary ──\n');
  for (const [k, v] of Object.entries(summary)) {
    process.stdout.write(`  ${k}: ${v}\n`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
