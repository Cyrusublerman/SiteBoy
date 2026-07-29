/**
 * Pure helpers for BlogEditor — slug derivation, frontmatter merge, line splice,
 * article tree building. No DOM.
 */

export function slugifyTitle(title) {
  return String(title ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'untitled';
}

export function normaliseArticle(item = {}) {
  const frontmatter = item.frontmatterJsonb && typeof item.frontmatterJsonb === 'object'
    ? item.frontmatterJsonb
    : {};
  return {
    ...item,
    title: item.title || 'Untitled',
    slug: item.slug || '',
    category: item.category || 'blog',
    bodyMd: typeof item.bodyMd === 'string' ? item.bodyMd : '',
    frontmatterJsonb: frontmatter,
    status: item.status || 'draft',
    publishedAt: item.publishedAt || null,
    retained: Boolean(item.deletedAt),
    version: Number.isSafeInteger(item.version) ? item.version : 1,
  };
}

export function mergeFrontmatter(existing, patch) {
  const base = existing && typeof existing === 'object' ? { ...existing } : {};
  for (const [key, value] of Object.entries(patch || {})) {
    if (value === undefined) continue;
    if (value === null || value === '') delete base[key];
    else base[key] = value;
  }
  return base;
}

/**
 * Replace lines [line, endLine] (1-based inclusive) with fenceLines.
 * Bytes outside the range are preserved.
 */
export function spliceBlockLines(source, line, endLine, fenceText) {
  const lines = String(source ?? '').split('\n');
  const start = Math.max(0, (Number(line) || 1) - 1);
  const end = Math.max(start, (Number(endLine) || line || 1) - 1);
  const fenceLines = String(fenceText ?? '').split('\n');
  lines.splice(start, end - start + 1, ...fenceLines);
  return lines.join('\n');
}

export function formatBlockFence(type, props) {
  return `:::block ${type}\n${JSON.stringify(props ?? {}, null, 2)}\n:::`;
}

/** Snap a character offset to the nearest line boundary (start of next line). */
export function snapInsertOffset(source, offset) {
  const text = String(source ?? '');
  const pos = Math.max(0, Math.min(Number(offset) || 0, text.length));
  if (pos === 0) return 0;
  if (pos >= text.length) return text.length;
  const before = text.lastIndexOf('\n', pos - 1);
  const lineStart = before === -1 ? 0 : before + 1;
  if (pos === lineStart) return pos;
  const after = text.indexOf('\n', pos);
  return after === -1 ? text.length : after + 1;
}

export function insertAtOffset(source, offset, chunk) {
  const text = String(source ?? '');
  const at = snapInsertOffset(text, offset);
  const prefix = text.slice(0, at);
  const suffix = text.slice(at);
  const needsLead = prefix.length > 0 && !prefix.endsWith('\n');
  const needsTrail = suffix.length > 0 && !chunk.endsWith('\n') && !suffix.startsWith('\n');
  return `${prefix}${needsLead ? '\n' : ''}${chunk}${needsTrail ? '\n' : ''}${suffix}`;
}

export function buildArticleTree(articles) {
  const byCategory = new Map();
  for (const article of articles) {
    const category = article.category || 'blog';
    const list = byCategory.get(category) ?? [];
    list.push(article);
    byCategory.set(category, list);
  }
  const children = [...byCategory.keys()].sort((a, b) => a.localeCompare(b)).map((category) => {
    const items = byCategory.get(category)
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title));
    return {
      label: category.toUpperCase(),
      children: items.map((article) => ({
        label: `${article.retained ? '[RETAINED] ' : ''}${article.title}`,
        _data: article,
      })),
    };
  });
  return { label: 'ARTICLES', children };
}

export function articleRoute(article) {
  const fm = article?.frontmatterJsonb;
  if (fm && typeof fm.route === 'string' && fm.route.trim()) {
    const route = fm.route.trim();
    if (route.startsWith('#')) {
      const path = route.slice(1).replace(/^\/+/, '');
      return `/${path}`;
    }
    if (route.startsWith('/')) return route;
    return `/${route}`;
  }
  return `/blog/${article?.slug || ''}`;
}

export function articleMatchesRoute(article, route) {
  const target = String(route || '').replace(/\/+$/, '');
  const candidates = new Set([
    articleRoute(article).replace(/\/+$/, ''),
    `/blog/${article.slug}`,
    `#blog/${article.slug}`,
  ]);
  const fmRoute = article?.frontmatterJsonb?.route;
  if (typeof fmRoute === 'string') candidates.add(fmRoute.replace(/\/+$/, ''));
  return candidates.has(target) || candidates.has(`#${target.replace(/^\//, '')}`);
}

export function defaultBlockProps(schemaProps = {}) {
  const props = {};
  for (const [key, def] of Object.entries(schemaProps)) {
    if (!def || typeof def !== 'object') continue;
    if (def.kind === 'boolean') props[key] = false;
    else if (def.kind === 'integer' || def.kind === 'number') props[key] = def.min ?? 0;
    else if (def.kind === 'enum' && Array.isArray(def.values) && def.values.length) {
      props[key] = def.values[0];
    } else if (def.kind === 'token-set') {
      props[key] = [];
    } else if (def.kind === 'array') {
      props[key] = [];
    } else if (def.kind === 'record' || def.kind === 'params') {
      props[key] = {};
    } else {
      props[key] = '';
    }
  }
  return props;
}
