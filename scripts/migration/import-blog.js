import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jsonLiteral, runImporter, sqlLiteral, stableUlid } from './content-import-utils.js';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..');
const BLOG_ROOT = join(ROOT, 'blog');
const MANIFEST_PATH = join(BLOG_ROOT, 'blog-docs-manifest.json');
const AUTHORED_ROOTS = new Set(['ideas', 'music', 'tools']);

function frontmatter(body) {
  if (!body.startsWith('---\n')) return {};
  const end = body.indexOf('\n---\n', 4);
  if (end < 0) return {};
  return Object.fromEntries(body.slice(4, end).split('\n').flatMap((line) => {
    const separator = line.indexOf(':');
    return separator > 0 ? [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]] : [];
  }));
}

export function isAuthoredLegacyEntry(entry) {
  const root = entry.relPath?.split('/')[0];
  const path = String(entry.relPath ?? '').toLowerCase();
  return AUTHORED_ROOTS.has(root) && !path.includes('/pkl/') && !path.includes('generated');
}

export function transformArticle(entry) {
  const bodyMd = readFileSync(join(BLOG_ROOT, entry.relPath), 'utf8');
  return {
    id: stableUlid(`article:${entry.slug}`),
    slug: entry.slug,
    category: entry.segments?.[0] ?? entry.relPath.split('/')[0],
    title: entry.title || entry.fileName || entry.slug,
    bodyMd,
    frontmatterJsonb: {
      ...frontmatter(bodyMd),
      route: entry.route,
      relPath: entry.relPath,
      segments: entry.segments ?? [],
    },
    status: 'published',
  };
}

function articleSql(row) {
  return `INSERT INTO articles (
  id, slug, category, title, body_md, frontmatter_jsonb, status, published_at
) VALUES (
  ${sqlLiteral(row.id)}, ${sqlLiteral(row.slug)}, ${sqlLiteral(row.category)},
  ${sqlLiteral(row.title)}, ${sqlLiteral(row.bodyMd)}, ${jsonLiteral(row.frontmatterJsonb)},
  'published', NOW()
) ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  body_md = EXCLUDED.body_md,
  frontmatter_jsonb = EXCLUDED.frontmatter_jsonb,
  updated_at = NOW();`;
}

export async function buildBlogImport() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const authored = manifest.files.filter(isAuthoredLegacyEntry);
  const entries = authored.filter((entry) => existsSync(join(BLOG_ROOT, entry.relPath)));
  const rows = entries.map(transformArticle);
  const conflicts = rows
    .filter((row, index) => rows.findIndex((other) => other.slug === row.slug) !== index)
    .map((row) => ({ slug: row.slug, reason: 'duplicate-slug' }));
  return {
    rows,
    statements: rows.map(articleSql),
    counts: {
      articles: rows.length,
      excluded: manifest.files.length - entries.length,
      missing: authored.length - entries.length,
    },
    conflicts,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runImporter(buildBlogImport, 'blog/blog-docs-manifest.json').catch((error) => {
    process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
    process.exitCode = 1;
  });
}
