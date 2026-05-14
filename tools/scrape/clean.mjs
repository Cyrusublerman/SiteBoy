/**
 * Stages 2-3 — Clean + Convert
 *
 * For each cached raw.html in tools/scrape/cache/:
 *   Stage 2: @mozilla/readability → cache/<hash>/readable.html
 *   Stage 3: turndown → cache/<hash>/clean.md
 *
 * Quality gate: logs a warning if clean.md < 200 chars after stripping.
 *
 * Idempotent: skips entries that already have clean.md unless --force flag.
 *
 * Usage:
 *   node tools/scrape/clean.mjs [--force]
 */

import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');

const CLEAN_MIN_CHARS = 200;
const args = process.argv.slice(2);
const FORCE = args.includes('--force');

// ── Turndown configuration ────────────────────────────────────────────────────

const td = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

// Preserve tables (useful for design systems that use tabular rule layouts).
td.addRule('keep-tables', {
  filter: ['table'],
  replacement(_content, node) {
    return node.outerHTML + '\n\n';
  },
});

// Remove script/style/nav/footer/header/aside nodes entirely.
td.remove(['script', 'style', 'nav', 'footer', 'header', 'aside', 'noscript']);

// ── Process one cache entry ───────────────────────────────────────────────────

async function processEntry(hash) {
  const dir = resolve(CACHE_DIR, hash);
  const rawPath = resolve(dir, 'raw.html');
  const readablePath = resolve(dir, 'readable.html');
  const cleanPath = resolve(dir, 'clean.md');
  const metaPath = resolve(dir, 'meta.json');

  if (!existsSync(rawPath)) return { hash, outcome: 'skip/no-raw' };

  // Read meta to get the source URL (used by Readability for relative URLs).
  let meta = {};
  try {
    meta = JSON.parse(await readFile(metaPath, 'utf8'));
  } catch { /* non-fatal */ }

  if (!FORCE && existsSync(cleanPath)) {
    return { hash, outcome: 'cached' };
  }

  // Stage 2: Readability
  const rawHtml = await readFile(rawPath, 'utf8');
  const dom = new JSDOM(rawHtml, { url: meta.url ?? 'https://example.com' });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  let readableHtml;
  if (article && article.content) {
    readableHtml = article.content;
  } else {
    // Fallback: use full body if Readability fails to extract article.
    readableHtml = dom.window.document.body?.innerHTML ?? rawHtml;
  }

  await writeFile(readablePath, readableHtml, 'utf8');

  // Stage 3: turndown → markdown
  let markdown = td.turndown(readableHtml);

  // Collapse excessive blank lines (>2 consecutive).
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  await writeFile(cleanPath, markdown, 'utf8');

  const charCount = markdown.length;
  if (charCount < CLEAN_MIN_CHARS) {
    process.stdout.write(`  [warn/thin] ${hash} — only ${charCount} chars after clean (${meta.url ?? 'unknown'})\n`);
    return { hash, outcome: 'warn-thin', chars: charCount };
  }

  process.stdout.write(`  [ok] ${hash} — ${charCount} chars (${meta.url ?? 'unknown'})\n`);
  return { hash, outcome: 'ok', chars: charCount };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  let entries;
  try {
    const items = await readdir(CACHE_DIR, { withFileTypes: true });
    entries = items.filter(d => d.isDirectory()).map(d => d.name);
  } catch {
    process.stdout.write('No cache directory found. Run npm run scrape:fetch first.\n');
    process.exit(0);
  }

  if (entries.length === 0) {
    process.stdout.write('Cache is empty. Run npm run scrape:fetch first.\n');
    process.exit(0);
  }

  process.stdout.write(`Cleaning ${entries.length} cached entries (force=${FORCE})\n\n`);

  const results = [];
  for (const hash of entries) {
    const result = await processEntry(hash);
    results.push(result);
  }

  const summary = results.reduce((acc, r) => {
    acc[r.outcome] = (acc[r.outcome] ?? 0) + 1;
    return acc;
  }, {});

  process.stdout.write('\n── Summary ──\n');
  for (const [k, v] of Object.entries(summary)) {
    process.stdout.write(`  ${k}: ${v}\n`);
  }

  const thin = results.filter(r => r.outcome === 'warn-thin');
  if (thin.length > 0) {
    process.stdout.write(`\n${thin.length} thin article(s) flagged for manual review:\n`);
    for (const r of thin) {
      process.stdout.write(`  ${r.hash} (${r.chars} chars)\n`);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
