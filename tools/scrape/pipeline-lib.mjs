/**
 * Shared helpers for scrape pipeline stages (embed / cluster / synth).
 */

import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEIGHT_BY_CLASS } from './schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCES_JSON = resolve(__dirname, 'sources.json');

/** @type {Map<string, number> | null} */
let _urlWeights = null;

export async function loadUrlWeights() {
  if (_urlWeights) return _urlWeights;
  const map = new Map();

  // Web sources
  try {
    const sources = JSON.parse(await readFile(SOURCES_JSON, 'utf8'));
    for (const s of sources) {
      map.set(s.url, WEIGHT_BY_CLASS[s.authority_class] ?? 0.5);
    }
  } catch { /* optional */ }

  // Local sources — keyed by file:// URL written into meta.json
  const localPath = resolve(dirname(SOURCES_JSON), 'local-sources.json');
  try {
    const { pathToFileURL } = await import('node:url');
    const localSources = JSON.parse(await readFile(localPath, 'utf8'));
    for (const s of localSources) {
      const absPath = resolve(dirname(dirname(dirname(SOURCES_JSON))), s.path);
      const fileUrl = pathToFileURL(absPath).href;
      map.set(fileUrl, s.weight ?? WEIGHT_BY_CLASS[s.authority_class] ?? 0.5);
    }
  } catch { /* optional */ }

  _urlWeights = map;
  return map;
}

export function weightForUrl(weightMap, url) {
  if (weightMap.has(url)) return weightMap.get(url);
  try {
    const u = new URL(url);
    for (const [k, w] of weightMap) {
      try {
        if (new URL(k).hostname === u.hostname) return w;
      } catch {
        /* */
      }
    }
  } catch {
    /* */
  }
  return 0.5;
}

export function claimId(sourceHash, statement, idx) {
  return createHash('sha256')
    .update(`${sourceHash}\n${statement}\n${idx}`)
    .digest('hex')
    .slice(0, 16);
}

export function l2Normalise(vec) {
  const sumSq = vec.reduce((a, x) => a + x * x, 0);
  const n = Math.sqrt(sumSq) || 1;
  return vec.map(x => x / n);
}

export async function listArticleHashes(cacheDir) {
  const items = await readdir(cacheDir, { withFileTypes: true });
  return items.filter(d => d.isDirectory() && !d.name.startsWith('_')).map(d => d.name);
}
