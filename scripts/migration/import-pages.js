import { readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jsonLiteral, runImporter, sqlLiteral, stableUlid } from './content-import-utils.js';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..');
const PAGE_ROOT = join(ROOT, 'assets/data/pages');
const ABOUT_PATH = join(ROOT, 'blog/data/about.json');

function walkJson(directory, results = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walkJson(path, results);
    else if (entry.name.endsWith('.json')) results.push(path);
  }
  return results;
}

export function transformPage(data, sourcePath) {
  const pageSlug = String(data.url || `/${relative(ROOT, sourcePath).replace(/\.json$/, '')}`)
    .replace(/^\/+/, '');
  return {
    id: stableUlid(`page:${pageSlug}`),
    pageSlug,
    title: data.header || pageSlug,
    blocksJsonb: data.blocks ?? [],
    status: 'published',
  };
}

function pageSql(row) {
  return `INSERT INTO page_blocks (id, page_slug, title, blocks_jsonb, status)
VALUES (${sqlLiteral(row.id)}, ${sqlLiteral(row.pageSlug)}, ${sqlLiteral(row.title)},
  ${jsonLiteral(row.blocksJsonb)}, 'published')
ON CONFLICT (page_slug) DO UPDATE SET
  title = EXCLUDED.title,
  blocks_jsonb = EXCLUDED.blocks_jsonb,
  updated_at = NOW();`;
}

export async function buildPageImport() {
  const paths = [ABOUT_PATH, ...walkJson(PAGE_ROOT)].sort();
  const candidates = paths.map((path) => ({
    path,
    row: transformPage(JSON.parse(readFileSync(path, 'utf8')), path),
  }));
  const bySlug = new Map();
  for (const candidate of candidates) {
    const current = bySlug.get(candidate.row.pageSlug);
    const canonicalName = `${candidate.row.pageSlug.split('/').pop()}.json`;
    if (!current || basename(candidate.path) === canonicalName) bySlug.set(candidate.row.pageSlug, candidate);
  }
  const rows = [...bySlug.values()].map(({ row }) => row);
  return {
    rows,
    statements: rows.map(pageSql),
    counts: { pages: rows.length, aliasesSkipped: candidates.length - rows.length },
    conflicts: [],
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runImporter(buildPageImport, 'blog/data/about.json+assets/data/pages').catch((error) => {
    process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
    process.exitCode = 1;
  });
}
