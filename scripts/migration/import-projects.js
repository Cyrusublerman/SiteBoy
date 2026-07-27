import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jsonLiteral, runImporter, sqlLiteral, stableUlid } from './content-import-utils.js';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..');
const REGISTRY_PATH = join(ROOT, 'assets/js/sections/projects_section.js');

export function parseProjectRegistry(source) {
  const registry = source.match(/PROJECT_REGISTRY:\s*\[([\s\S]*?)\n\s*\],/)?.[1] ?? '';
  const entries = [];
  const pattern = /\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*description:\s*'([^']+)',\s*kind:\s*'([^']+)'(?:,\s*src:\s*'([^']+)')?/g;
  for (const match of registry.matchAll(pattern)) {
    entries.push({
      slug: match[1],
      title: match[2],
      summaryMd: match[3],
      kind: match[4],
      manifestPath: match[5] ?? null,
    });
  }
  return entries;
}

export function transformProject(entry, sortIndex) {
  const manifest = entry.manifestPath
    ? JSON.parse(readFileSync(join(ROOT, entry.manifestPath), 'utf8'))
    : { id: entry.slug, title: entry.title, sections: [] };
  return {
    id: stableUlid(`project:${entry.slug}`),
    slug: entry.slug,
    title: manifest.title || entry.title,
    summaryMd: entry.summaryMd,
    kind: entry.kind,
    route: `/#projects/${entry.slug}`,
    manifestPath: entry.manifestPath,
    sectionsJsonb: manifest.sections ?? [],
    frontmatterJsonb: { sourceId: manifest.id ?? entry.slug },
    status: 'published',
    sortIndex,
  };
}

function projectSql(row) {
  return `INSERT INTO projects (
  id, slug, title, summary_md, frontmatter_jsonb, status, sort_index,
  kind, route, manifest_path, sections_jsonb
) VALUES (
  ${sqlLiteral(row.id)}, ${sqlLiteral(row.slug)}, ${sqlLiteral(row.title)},
  ${sqlLiteral(row.summaryMd)}, ${jsonLiteral(row.frontmatterJsonb)}, 'published',
  ${row.sortIndex}, ${sqlLiteral(row.kind)}, ${sqlLiteral(row.route)},
  ${sqlLiteral(row.manifestPath)}, ${jsonLiteral(row.sectionsJsonb)}
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary_md = EXCLUDED.summary_md,
  frontmatter_jsonb = EXCLUDED.frontmatter_jsonb,
  sort_index = EXCLUDED.sort_index,
  kind = EXCLUDED.kind,
  route = EXCLUDED.route,
  manifest_path = EXCLUDED.manifest_path,
  sections_jsonb = EXCLUDED.sections_jsonb,
  updated_at = NOW();`;
}

export async function buildProjectImport() {
  const entries = parseProjectRegistry(readFileSync(REGISTRY_PATH, 'utf8'));
  const rows = entries.map(transformProject);
  return {
    rows,
    statements: rows.map(projectSql),
    counts: { projects: rows.length },
    conflicts: [],
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runImporter(buildProjectImport, 'assets/js/sections/projects_section.js').catch((error) => {
    process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
    process.exitCode = 1;
  });
}
