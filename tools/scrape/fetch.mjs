/**
 * Stage 1 — Fetch
 *
 * For each source in sources.json:
 *   Tier-1: native fetch
 *   Tier-2: puppeteer headless (if Tier-1 body < 500 chars)
 *   Tier-3: queue to manual-paste.queue.md (paywall / domain-blocklist / empty)
 *
 * Output per source:
 *   tools/scrape/cache/<sha256(url)[:12]>/raw.html
 *   tools/scrape/cache/<sha256(url)[:12]>/meta.json
 *
 * Idempotent: skips sources with existing raw.html unless --force flag is set.
 *
 * Usage:
 *   node tools/scrape/fetch.mjs [--force] [--concurrency=N]
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendQueueEntry, queueIdsSet } from './queue-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

const SOURCES_PATH = resolve(__dirname, 'sources.json');
const SENTINELS_PATH = resolve(__dirname, 'paywall-sentinels.json');
const MANUAL_ONLY_PATH = resolve(__dirname, 'manual-only.json');
const CACHE_DIR = resolve(__dirname, 'cache');

const TIER1_MIN_CHARS = 500;
const TIER2_MIN_CHARS = 1000;
const TIER1_TIMEOUT_MS = 15_000;
const TIER2_TIMEOUT_MS = 30_000;
const DEFAULT_RATE_MS = 1000;
const UA = 'Mozilla/5.0 (compatible; SiteBoy-Scraper/1.0)';

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const concurrencyArg = args.find(a => a.startsWith('--concurrency='));
const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split('=')[1], 10) : 1;
const rateArg = args.find(a => a.startsWith('--rate-ms='));
const RATE_MS = rateArg ? parseInt(rateArg.split('=')[1], 10) : DEFAULT_RATE_MS;
const limitArg = args.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const urlArg = args.find(a => a.startsWith('--url='));
const SINGLE_URL = urlArg ? urlArg.split('=').slice(1).join('=') : null;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** sha256(url), return first 12 hex chars. */
function urlHash(url) {
  return createHash('sha256').update(url).digest('hex').slice(0, 12);
}

/** True if a domain glob matches a given hostname. */
function matchesDomainGlob(hostname, glob) {
  if (glob.startsWith('*.')) {
    const suffix = glob.slice(2);
    return hostname === suffix || hostname.endsWith('.' + suffix);
  }
  return hostname === glob;
}

function isManualOnlyDomain(url, manualOnlyDomains) {
  let hostname;
  try { hostname = new URL(url).hostname; } catch { return false; }
  return manualOnlyDomains.some(g => matchesDomainGlob(hostname, g));
}

function containsPaywallSentinel(html, sentinels) {
  return sentinels.some(s => html.includes(s));
}

function cacheDir(hash) {
  return resolve(CACHE_DIR, hash);
}

async function writeCacheEntry(hash, rawHtml, meta) {
  const dir = cacheDir(hash);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, 'raw.html'), rawHtml, 'utf8');
  await writeFile(resolve(dir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
}

// ── Tier-1: native fetch ──────────────────────────────────────────────────────

async function tier1Fetch(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIER1_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA },
    });
    const html = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { html, status_code: res.status };
  } finally {
    clearTimeout(timer);
  }
}

// ── Tier-2: puppeteer ─────────────────────────────────────────────────────────

let _browser = null;

async function getBrowser() {
  if (!_browser) {
    const puppeteer = (await import('puppeteer')).default;
    _browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  }
  return _browser;
}

async function tier2Fetch(url) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: TIER2_TIMEOUT_MS });
    const html = await page.content();
    return html;
  } finally {
    await page.close();
  }
}

// ── Process one source ────────────────────────────────────────────────────────

async function processSource(source, sourceIndex, sentinels, manualOnlyDomains) {
  const { url } = source;
  const hash = urlHash(url);
  const rawHtmlPath = resolve(cacheDir(hash), 'raw.html');

  if (!FORCE && existsSync(rawHtmlPath)) {
    process.stdout.write(`  [skip] ${url}\n`);
    return { url, hash, outcome: 'cached' };
  }

  // Tier-3: domain blocklist
  if (isManualOnlyDomain(url, manualOnlyDomains)) {
    appendQueueEntry({
      id: hash,
      url,
      status: 'pending',
      reason: 'domain-blocklist',
      detected_at: new Date().toISOString(),
      source_index: String(sourceIndex),
    });
    process.stdout.write(`  [tier3/domain] ${url}\n`);
    return { url, hash, outcome: 'tier3', reason: 'domain-blocklist' };
  }

  // Tier-1
  let html = null;
  let tier = 1;
  let statusCode = null;
  try {
    const t1 = await tier1Fetch(url);
    html = t1.html;
    statusCode = t1.status_code;
  } catch (err) {
    process.stdout.write(`  [tier1/fail] ${url} — ${err.message}\n`);
  }

  if (html && html.length >= TIER1_MIN_CHARS && !containsPaywallSentinel(html, sentinels)) {
    await writeCacheEntry(hash, html, {
      tier,
      url,
      fetched_at: new Date().toISOString(),
      status_code: statusCode,
      content_length: html.length,
    });
    process.stdout.write(`  [tier1/ok] ${url} (${html.length} chars)\n`);
    return { url, hash, outcome: 'tier1' };
  }

  // Tier-2: puppeteer
  tier = 2;
  try {
    html = await tier2Fetch(url);
  } catch (err) {
    process.stdout.write(`  [tier2/fail] ${url} — ${err.message}\n`);
    html = null;
  }

  if (html && html.length >= TIER2_MIN_CHARS && !containsPaywallSentinel(html, sentinels)) {
    await writeCacheEntry(hash, html, {
      tier,
      url,
      fetched_at: new Date().toISOString(),
      status_code: statusCode,
      content_length: html.length,
    });
    process.stdout.write(`  [tier2/ok] ${url} (${html.length} chars)\n`);
    return { url, hash, outcome: 'tier2' };
  }

  // Tier-3: paywall or empty
  const reason = html && containsPaywallSentinel(html, sentinels) ? 'paywall' : 'empty';
  appendQueueEntry({
    id: hash,
    url,
    status: 'pending',
    reason,
    detected_at: new Date().toISOString(),
    source_index: String(sourceIndex),
  });
  process.stdout.write(`  [tier3/${reason}] ${url}\n`);
  return { url, hash, outcome: 'tier3', reason };
}

// ── Concurrency pool ──────────────────────────────────────────────────────────

async function runPool(tasks, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  let sources = JSON.parse(await readFile(SOURCES_PATH, 'utf8'));
  if (SINGLE_URL) {
    sources = sources.filter(s => s.url === SINGLE_URL);
    if (sources.length === 0) sources = [{ url: SINGLE_URL, authority_class: 'domain-expert', weight: 0.6 }];
  }
  if (Number.isFinite(LIMIT)) sources = sources.slice(0, LIMIT);

  const sentinels = JSON.parse(await readFile(SENTINELS_PATH, 'utf8'));
  const manualOnlyDomains = JSON.parse(await readFile(MANUAL_ONLY_PATH, 'utf8'));

  await mkdir(CACHE_DIR, { recursive: true });

  const alreadyQueued = queueIdsSet();

  const tasks = sources.map((source, i) => async () => {
    const hash = urlHash(source.url);
    if (alreadyQueued.has(hash)) {
      process.stdout.write(`  [skip/queued] ${source.url}\n`);
      return { url: source.url, hash, outcome: 'already-queued' };
    }
    const result = await processSource(source, i, sentinels, manualOnlyDomains);
    if (RATE_MS > 0) await sleep(RATE_MS);
    return result;
  });

  process.stdout.write(
    `Fetching ${sources.length} sources (concurrency=${CONCURRENCY}, rate=${RATE_MS}ms, force=${FORCE})\n\n`,
  );
  const results = await runPool(tasks, CONCURRENCY);

  if (_browser) await _browser.close();

  const summary = results.reduce((acc, r) => {
    acc[r.outcome] = (acc[r.outcome] ?? 0) + 1;
    return acc;
  }, {});

  process.stdout.write('\n── Summary ──\n');
  for (const [k, v] of Object.entries(summary)) {
    process.stdout.write(`  ${k}: ${v}\n`);
  }

  const tier3Count = (summary['tier3'] ?? 0) + (summary['already-queued'] ?? 0);
  if (tier3Count > 0) {
    process.stdout.write(`\n${tier3Count} source(s) queued for manual paste. Run: npm run scrape:paste\n`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
