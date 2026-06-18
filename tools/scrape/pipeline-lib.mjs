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

// ── Rule .md parsing (bootstrap + hand-authored detector merge) ────────────────

/** Minimal YAML subset parser for rule front matter (scalars, lists, one-level maps). */
export function parseSimpleYaml(text) {
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  let currentKey = null;

  for (const rawLine of text.split('\n')) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;
    const indent = rawLine.search(/\S/);
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].obj;

    if (trimmed.startsWith('- ')) {
      const val = trimmed.slice(2).trim();
      const unquoted = val.replace(/^["']|["']$/g, '');
      if (currentKey && Array.isArray(parent[currentKey])) {
        parent[currentKey].push(unquoted);
      }
      continue;
    }

    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const rest = trimmed.slice(colon + 1).trim();
    currentKey = key;

    if (rest === '' || rest === '|') {
      const nextLine = text.split('\n').find(l => l.search(/\S/) > indent && l.trim().startsWith('- '));
      if (nextLine) {
        parent[key] = [];
      } else {
        parent[key] = {};
        stack.push({ indent, obj: parent[key] });
      }
    } else if (rest === '[]') {
      parent[key] = [];
    } else if (rest === 'null') {
      parent[key] = null;
    } else if (rest === 'true' || rest === 'false') {
      parent[key] = rest === 'true';
    } else if (/^-?\d+(\.\d+)?$/.test(rest)) {
      parent[key] = Number(rest);
    } else {
      parent[key] = rest.replace(/^["']|["']$/g, '');
    }
  }
  return root;
}

/** Parse ## Sources block from emitted rule .md body. */
export function parseSourcesFromBody(body) {
  const idx = body.indexOf('## Sources');
  if (idx < 0) {
    return [{ url: 'file:///local/bootstrap', quote: 'bootstrapped from emitted rule file', weight: 0.5, author: null, sourced: 'local' }];
  }
  const section = body.slice(idx);
  const sources = [];
  const blocks = section.split(/\n(?=- \*\*)/).slice(1);
  for (const block of blocks) {
    const urlMatch = block.match(/^- \*\*(.+?)\*\*/);
    if (!urlMatch) continue;
    const weightMatch = block.match(/weight:\s*([\d.]+)/);
    const sourcedMatch = block.match(/sourced:\s*(\S+)/);
    const authorMatch = block.match(/author:\s*(.+)/);
    const quoteMatch = block.match(/^>\s*(.+)/m);
    sources.push({
      url: urlMatch[1].trim(),
      author: authorMatch ? authorMatch[1].trim() : null,
      weight: weightMatch ? Number(weightMatch[1]) : 0.5,
      sourced: sourcedMatch ? sourcedMatch[1].trim() : 'local',
      quote: quoteMatch ? quoteMatch[1].trim() : urlMatch[1].trim(),
    });
  }
  return sources.length ? sources : [{ url: 'file:///local/bootstrap', quote: 'bootstrapped', weight: 0.5, author: null, sourced: 'local' }];
}

/** Parse one emitted rule .md into a plain object (front matter + sources). */
export function parseRuleMd(content) {
  const fmMatch = content.match(/^[\s\S]*?^---\r?\n([\s\S]*?)\r?\n---/m);
  if (!fmMatch) return null;
  const fm = parseSimpleYaml(fmMatch[1]);
  const body = content.slice(fmMatch[0].length);
  const sources = parseSourcesFromBody(body);
  return { ...fm, sources };
}

/** Scan blog/docs/standards/rules and build draft_rules[] for stage 9 bootstrap. */
export async function loadDraftRulesFromMd(rulesDir) {
  const { readdir: rd, readFile: rf } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const draftRules = [];

  async function walk(dir) {
    const entries = await rd(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && e.name.endsWith('.md') && e.name !== 'INDEX.md') {
        const content = await rf(full, 'utf8');
        const parsed = parseRuleMd(content);
        if (!parsed?.id) continue;
        draftRules.push({
          id: parsed.id,
          category: parsed.category,
          modality: parsed.modality,
          statement: parsed.statement,
          rationale: parsed.rationale,
          scope: Array.isArray(parsed.scope) ? parsed.scope : [parsed.scope].filter(Boolean),
          decidable: 'judgment',
          descriptive_origin: parsed.descriptive_origin ?? false,
          movements: Array.isArray(parsed.movements) ? parsed.movements : [],
          medium: Array.isArray(parsed.medium) ? parsed.medium : [],
          sources: parsed.sources,
        });
      }
    }
  }

  await walk(rulesDir);
  return draftRules;
}
