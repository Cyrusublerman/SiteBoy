import { fileURLToPath } from 'node:url';
import { buildArtImport } from './import-art.js';
import { buildBlogImport } from './import-blog.js';
import { buildPageImport } from './import-pages.js';
import { buildProjectImport } from './import-projects.js';

function duplicateValues(rows, key) {
  const seen = new Set();
  return rows.map((row) => row[key]).filter((value) => {
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  });
}

export async function verifyParity() {
  const builders = {
    art: buildArtImport,
    articles: buildBlogImport,
    pages: buildPageImport,
    projects: buildProjectImport,
  };
  const counts = {};
  const conflicts = [];
  for (const [name, build] of Object.entries(builders)) {
    const first = await build();
    const second = await build();
    counts[name] = first.rows.length;
    if (JSON.stringify(first.rows) !== JSON.stringify(second.rows)) {
      conflicts.push({ source: name, reason: 'non-idempotent-transform' });
    }
    const duplicateRows = name === 'art'
      ? first.rows.map((row) => ({ ...row, compoundSlug: `${row.gallerySlug}/${row.slug}` }))
      : first.rows;
    const slugKey = name === 'pages' ? 'pageSlug' : name === 'art' ? 'compoundSlug' : 'slug';
    for (const duplicate of duplicateValues(duplicateRows, slugKey)) {
      conflicts.push({ source: name, reason: 'duplicate-slug', slug: duplicate });
    }
    for (const row of first.rows) {
      if (!/^[0-9A-HJKMNP-TV-Z]{26}$/.test(row.id)) {
        conflicts.push({ source: name, reason: 'invalid-ulid', id: row.id });
      }
      if (name === 'projects' && row.route !== `/#projects/${row.slug}`) {
        conflicts.push({ source: name, reason: 'route-drift', slug: row.slug });
      }
      if (name === 'articles' && row.frontmatterJsonb.route !== `#blog/${row.slug}`) {
        conflicts.push({ source: name, reason: 'route-drift', slug: row.slug });
      }
    }
  }
  return { ok: conflicts.length === 0, counts, conflicts };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  verifyParity().then((result) => {
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (!result.ok) process.exitCode = 1;
  }).catch((error) => {
    process.stderr.write(`${JSON.stringify({ error: error.message })}\n`);
    process.exitCode = 1;
  });
}
