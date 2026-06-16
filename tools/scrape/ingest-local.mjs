/**
 * Tier-0 ingestion — local .md files as pipeline sources.
 *
 * Reads:  tools/scrape/local-sources.json
 * Writes: cache/<hash>/clean.md      (file content verbatim)
 *         cache/<hash>/meta.json     (tier:0, sourced:'local', url:'file://…')
 *
 * Hash:   sha256('local:' + relative_path)[:12]
 *         — uses relative path so the key is stable across machines.
 *         — 'local:' prefix avoids collision with URL-based hashes.
 *
 * Local files ARE clean.md — they bypass fetch (stage 1) and clean (stages 2-3).
 * mine.mjs and extract.mjs process them identically to web-fetched articles.
 *
 * Usage:
 *   node tools/scrape/ingest-local.mjs [--force] [--verbose]
 */

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { LocalSourceListSchema } from './schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(__dirname, '../..');
const CACHE_DIR = resolve(__dirname, 'cache');
const LOCAL_SOURCES_PATH = resolve(__dirname, 'local-sources.json');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const VERBOSE = args.includes('--verbose');

/**
 * Stable cache key for a local file: sha256('local:' + relative_path)[:12].
 * relative_path is relative to workspace root.
 */
export function localHash(relativePath) {
  return createHash('sha256').update(`local:${relativePath}`).digest('hex').slice(0, 12);
}

async function ingestOne(entry) {
  const absPath = resolve(WORKSPACE_ROOT, entry.path);
  const hash = localHash(entry.path);
  const cacheDir = resolve(CACHE_DIR, hash);
  const cleanPath = resolve(cacheDir, 'clean.md');
  const metaPath = resolve(cacheDir, 'meta.json');

  if (!existsSync(absPath)) {
    console.error(`  [skip] ${entry.path} — file not found`);
    return { path: entry.path, hash, outcome: 'not-found' };
  }

  if (!FORCE && existsSync(cleanPath)) {
    if (VERBOSE) process.stdout.write(`  [cached] ${entry.path} (${hash})\n`);
    return { path: entry.path, hash, outcome: 'cached' };
  }

  const content = await readFile(absPath, 'utf8');
  const fileUrl = pathToFileURL(absPath).href;

  await mkdir(cacheDir, { recursive: true });
  await writeFile(cleanPath, content, 'utf8');
  await writeFile(
    metaPath,
    JSON.stringify(
      {
        tier: 0,
        sourced: 'local',
        url: fileUrl,
        local_path: entry.path,
        authority_class: entry.authority_class,
        weight: entry.weight,
        category_hint: entry.category_hint ?? '',
        notes: entry.notes ?? '',
        ingested_at: new Date().toISOString(),
        clean_length: content.length,
      },
      null,
      2,
    ),
    'utf8',
  );

  if (VERBOSE) {
    process.stdout.write(`  [ok] ${entry.path} → ${hash} (${content.length} chars)\n`);
  }

  return { path: entry.path, hash, outcome: 'ok' };
}

async function main() {
  if (!existsSync(LOCAL_SOURCES_PATH)) {
    console.error('Missing local-sources.json');
    process.exit(1);
  }

  const raw = JSON.parse(await readFile(LOCAL_SOURCES_PATH, 'utf8'));
  const sources = LocalSourceListSchema.parse(raw);
  process.stdout.write(`Ingesting ${sources.length} local source(s)...\n`);

  await mkdir(CACHE_DIR, { recursive: true });

  let ok = 0;
  let cached = 0;
  let failed = 0;

  for (const entry of sources) {
    const result = await ingestOne(entry);
    if (result.outcome === 'ok') ok++;
    else if (result.outcome === 'cached') cached++;
    else failed++;
  }

  process.stdout.write(`Done. ${ok} ingested, ${cached} cached, ${failed} not found.\n`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
