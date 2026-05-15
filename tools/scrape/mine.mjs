/**
 * Stage 4 — Pass-A Mine
 *
 * Deterministic markdown AST traversal over each cache/<hash>/clean.md.
 * Extracts raw Assertions using 6 structural strategies. No LLM involved.
 *
 * Output: cache/<hash>/assertions.json  (array of AssertionSchema objects)
 *
 * Strategies:
 *   1. List items under rule headings (numbered/bulleted)
 *   2. Standalone blockquotes with prescriptive language
 *   3. Code fences under rule headings
 *   4. Image alt text containing do/don't language
 *   5. Heading-as-rule (H3+, imperative sentence >30 chars, resolves H-011)
 *   6. Bold sentence at paragraph start (e.g. NN/g "**Choose a limited color palette**.")
 *
 * Usage:
 *   node tools/scrape/mine.mjs [--force] [--verbose] [--article=<hash>]
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { AssertionSchema, CATEGORIES, normaliseForQuoteMatch } from './schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');
const SOURCES_JSON = resolve(__dirname, 'sources.json');

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const VERBOSE = args.includes('--verbose');
const articleArg = args.find(a => a.startsWith('--article='));
const SINGLE_ARTICLE = articleArg ? articleArg.split('=')[1] : null;

// ── Regexes ───────────────────────────────────────────────────────────────────

/** Headings that signal a rule-list section follows. */
const RULE_HEADING_RE = /(rules?|principles?|laws?|heuristics?|guidelines?|do|don'?t|never|always)/i;

/** Used in blockquote/code gate: heading must be rule-heading OR content contains prescriptive words. */
const PRESCRIPTIVE_RE = /\b(must|never|always|should|avoid|don'?t|do not|require|shall|forbid|prefer|recommend)\b/i;

/** Modality keyword matching — order matters (most specific first). */
const MODALITY_RULES = [
  { re: /\b(never|don'?t|do not|avoid|no |forbid|prohibited)\b/i, hint: 'MUST_NOT' },
  { re: /\b(always|must|shall|require[sd]?)\b/i, hint: 'MUST' },
  { re: /\b(shouldn'?t|should not|try not to)\b/i, hint: 'SHOULD_NOT' },
  { re: /\b(should|prefer|favour|favor|recommend)\b/i, hint: 'SHOULD' },
];

/** Category keyword → taxonomy slot. */
const CATEGORY_KEYWORDS = [
  { re: /\b(colour|color|palette|chrom|hue|tint|shade)\b/i, cat: 'colour' },
  { re: /\b(typ[eo]graph|typeface|font|glyph|letter|kern|ligat|leading)\b/i, cat: 'typography' },
  { re: /\b(grid|column|row|layout)\b/i, cat: 'grid' },
  { re: /\b(spac|margin|padding|whitespace|gutter)\b/i, cat: 'spacing' },
  { re: /\b(contrast)\b/i, cat: 'contrast' },
  { re: /\b(hierarch)\b/i, cat: 'hierarchy' },
  { re: /\b(align)\b/i, cat: 'alignment' },
  { re: /\b(densit|clutter)\b/i, cat: 'density' },
  { re: /\b(composit|balance|proportion|harmony|unity)\b/i, cat: 'composition' },
  { re: /\b(motion|animat|transition|easing)\b/i, cat: 'motion' },
  { re: /\b(interact|click|tap|hover|gesture|button)\b/i, cat: 'interaction' },
  { re: /\b(feedback|response|error|success|validat)\b/i, cat: 'feedback' },
  { re: /\b(affordance|signifier|recogni[sz])\b/i, cat: 'affordance' },
  { re: /\b(state|disabled|active|focus|selected)\b/i, cat: 'state' },
  { re: /\b(label|caption|text|copy)\b/i, cat: 'labelling' },
  { re: /\b(case|uppercase|lowercase|capitaliz|camel|title case)\b/i, cat: 'casing' },
  { re: /\b(voice|tone|language|writ)\b/i, cat: 'voice' },
  { re: /\b(navigat|breadcrumb|menu|tab|link)\b/i, cat: 'navigation' },
  { re: /\b(information architect|ia |sitemap|taxonomy|wayfind)\b/i, cat: 'information-architecture' },
  { re: /\b(print|bleed|gutter|cmyk|registration|offset)\b/i, cat: 'print-production' },
  { re: /\b(data.?vis|chart|graph|infograph|axis|legend)\b/i, cat: 'data-visualisation' },
  { re: /\b(token|design system|variable|swatch)\b/i, cat: 'tokens' },
  { re: /\b(naming|nomenclature|convention|identif)\b/i, cat: 'naming' },
  { re: /\b(modular|component|reusab|composab)\b/i, cat: 'modularity' },
  { re: /\b(access|a11y|wcag|aria|screen reader|color.?blind)\b/i, cat: 'accessibility' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract plain text from an mdast node recursively. */
function nodeText(node) {
  if (!node) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  if (node.type === 'image') return node.alt ?? '';
  if (node.children) return node.children.map(nodeText).join('');
  return node.value ?? '';
}

function detectModality(text) {
  for (const { re, hint } of MODALITY_RULES) {
    if (re.test(text)) return hint;
  }
  return undefined;
}

function detectCategory(text, parentHeadingText, fallback) {
  const combined = (text + ' ' + (parentHeadingText ?? '')).toLowerCase();
  for (const { re, cat } of CATEGORY_KEYWORDS) {
    if (re.test(combined)) return cat;
  }
  // Fall back to source-level category_hint
  if (fallback && CATEGORIES.includes(fallback)) return fallback;
  return undefined;
}

/** Clean a raw statement: trim, collapse whitespace, strip leading bullet chars. */
function cleanStatement(raw) {
  return raw
    .replace(/^[\s\-*•\d.]+/, '')   // leading bullet/number
    .replace(/\s+/g, ' ')
    .trim();
}

/** Validate and coerce an Assertion object. Returns null if validation fails. */
function validateAssertion(obj) {
  try {
    return AssertionSchema.parse(obj);
  } catch {
    return null;
  }
}

// ── Strategy implementations ──────────────────────────────────────────────────

/**
 * Strategy 1: List items under rule headings.
 * Strategy 3: Code fences under rule headings.
 * Both share the same "walk, track current heading" approach.
 */
function extractUnderRuleHeadings(tree, sourceHash, sourceUrl, sourceCategory) {
  const results = [];
  let currentHeadingText = null;
  let currentHeadingLine = 0;
  let underRuleHeading = false;

  for (const node of tree.children) {
    if (node.type === 'heading') {
      currentHeadingText = nodeText(node);
      currentHeadingLine = node.position?.start?.line ?? 0;
      underRuleHeading = RULE_HEADING_RE.test(currentHeadingText);
      continue;
    }

    if (!underRuleHeading) continue;

    // Strategy 1: list items
    if (node.type === 'list') {
      for (const item of node.children ?? []) {
        const raw = nodeText(item);
        const statement = cleanStatement(raw);
        if (statement.length < 15) continue;
        results.push({
          source_hash: sourceHash,
          source_url: sourceUrl,
          line: item.position?.start?.line ?? currentHeadingLine,
          statement,
          quote: statement,
          category_hint: detectCategory(statement, currentHeadingText, sourceCategory),
          modality_hint: detectModality(statement),
        });
      }
      continue;
    }

    // Strategy 3: code fences
    if (node.type === 'code') {
      const raw = node.value ?? '';
      if (!PRESCRIPTIVE_RE.test(raw) && !PRESCRIPTIVE_RE.test(currentHeadingText ?? '')) continue;
      // Split multi-line code blocks into per-line assertions if lines look like rules.
      for (const line of raw.split('\n')) {
        const statement = cleanStatement(line);
        if (statement.length < 15 || statement.startsWith('//')) continue;
        results.push({
          source_hash: sourceHash,
          source_url: sourceUrl,
          line: node.position?.start?.line ?? currentHeadingLine,
          statement,
          quote: statement,
          category_hint: detectCategory(statement, currentHeadingText, sourceCategory),
          modality_hint: detectModality(statement),
        });
      }
    }
  }

  return results;
}

/**
 * Strategy 2: Standalone blockquotes with prescriptive language.
 */
function extractBlockquotes(tree, sourceHash, sourceUrl, sourceCategory) {
  const results = [];
  let currentHeadingText = null;

  for (const node of tree.children) {
    if (node.type === 'heading') {
      currentHeadingText = nodeText(node);
      continue;
    }
    if (node.type === 'blockquote') {
      const raw = nodeText(node);
      const statement = cleanStatement(raw);
      if (statement.length < 15) continue;
      if (!PRESCRIPTIVE_RE.test(statement)) continue;
      results.push({
        source_hash: sourceHash,
        source_url: sourceUrl,
        line: node.position?.start?.line ?? 1,
        statement,
        quote: statement,
        category_hint: detectCategory(statement, currentHeadingText, sourceCategory),
        modality_hint: detectModality(statement),
      });
    }
  }

  return results;
}

/**
 * Strategy 4: Image alt text containing do/don't language.
 */
function extractImageAlts(tree, sourceHash, sourceUrl, sourceCategory) {
  const results = [];
  const DO_DONT_RE = /\bdo(n'?t)?\b/i;

  function walk(node, headingText) {
    if (node.type === 'image') {
      const alt = node.alt ?? '';
      if (DO_DONT_RE.test(alt) && alt.length >= 10) {
        results.push({
          source_hash: sourceHash,
          source_url: sourceUrl,
          line: node.position?.start?.line ?? 1,
          statement: cleanStatement(alt),
          quote: alt,
          category_hint: detectCategory(alt, headingText, sourceCategory),
          modality_hint: detectModality(alt),
        });
      }
    }
    if (node.children) {
      for (const child of node.children) walk(child, headingText);
    }
  }

  let currentHeadingText = null;
  for (const node of tree.children) {
    if (node.type === 'heading') {
      currentHeadingText = nodeText(node);
    }
    walk(node, currentHeadingText);
  }

  return results;
}

/**
 * Strategy 5: Heading-as-rule (H3+, imperative sentence > 30 chars).
 * Resolves H-011: handles brutalist-web.design style articles.
 *
 * Heuristic: heading is "imperative" if it:
 *   - starts with a verb (verb-first, e.g. "Use links..."), OR
 *   - contains PRESCRIPTIVE_RE keywords, OR
 *   - starts with capital + is a grammatically complete sentence (ends with full stop or >50 chars)
 */
const IMPERATIVE_START_RE = /^(use|do|don'?t|never|always|avoid|prefer|make|ensure|keep|write|set|apply|choose|place|allow|limit|define|separate|maintain|provide|include|consider|follow)\b/i;
const HEADING_RULE_MIN_CHARS = 30;

function extractHeadingsAsRules(tree, sourceHash, sourceUrl, sourceCategory) {
  const results = [];

  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];
    if (node.type !== 'heading' || node.depth < 3) continue;

    const text = nodeText(node).trim();
    if (text.length < HEADING_RULE_MIN_CHARS) continue;

    const isImperative = IMPERATIVE_START_RE.test(text) || PRESCRIPTIVE_RE.test(text);
    const isDeclarative = text.length > 50 || text.endsWith('.');

    if (!isImperative && !isDeclarative) continue;

    // Look ahead for a body paragraph to use as richer quote context.
    const nextNode = tree.children[i + 1];
    const bodyText = nextNode?.type === 'paragraph' ? nodeText(nextNode).trim() : null;
    const quote = bodyText && bodyText.length > 10
      ? `${text} — ${bodyText.slice(0, 200)}`
      : text;

    results.push({
      source_hash: sourceHash,
      source_url: sourceUrl,
      line: node.position?.start?.line ?? 1,
      statement: text,
      quote,
      category_hint: detectCategory(text, null, sourceCategory),
      modality_hint: detectModality(text),
      descriptive_origin: !isImperative && isDeclarative,
    });
  }

  return results;
}

/**
 * Strategy 6: Bold sentence at paragraph start.
 * Handles design writing convention where the rule IS the bold opening phrase:
 *   "**Choose a limited colour palette**. A few distinct colours..."
 * The bold node must be the first child of a paragraph, ≥25 chars.
 */
function extractBoldParagraphOpeners(tree, sourceHash, sourceUrl, sourceCategory) {
  const results = [];
  let currentHeadingText = null;

  for (const node of tree.children) {
    if (node.type === 'heading') {
      currentHeadingText = nodeText(node);
      continue;
    }
    if (node.type !== 'paragraph') continue;

    const firstChild = node.children?.[0];
    if (!firstChild) continue;

    // Accept: strong node, OR emphasis of strong, OR strong of text
    const isStrongFirst =
      firstChild.type === 'strong' ||
      (firstChild.type === 'emphasis' && firstChild.children?.[0]?.type === 'strong');

    if (!isStrongFirst) continue;

    const boldText = nodeText(firstChild).trim();
    if (boldText.length < 25) continue;

    // Must look like a sentence start (capital letter) or contain prescriptive language.
    const startsWithCap = /^[A-Z]/.test(boldText);
    const hasPrescriptive = PRESCRIPTIVE_RE.test(boldText);
    if (!startsWithCap && !hasPrescriptive) continue;

    // Build quote from bold + first sentence of the rest of the paragraph.
    const remainderText = node.children
      .slice(1)
      .map(nodeText)
      .join('')
      .trim()
      .replace(/\s+/g, ' ');

    // Take up to the first sentence break in the remainder.
    const firstSentenceEnd = remainderText.search(/[.!?]\s/);
    const context = firstSentenceEnd !== -1
      ? remainderText.slice(0, firstSentenceEnd + 1).trim()
      : remainderText.slice(0, 150).trim();

    const quote = context ? `${boldText}. ${context}` : boldText;

    results.push({
      source_hash: sourceHash,
      source_url: sourceUrl,
      line: node.position?.start?.line ?? 1,
      statement: cleanStatement(boldText),
      quote,
      category_hint: detectCategory(boldText, currentHeadingText, sourceCategory),
      modality_hint: detectModality(boldText),
    });
  }

  return results;
}

// ── Deduplication ─────────────────────────────────────────────────────────────

function deduplicate(assertions) {
  const seen = new Set();
  return assertions.filter(a => {
    const key = normaliseForQuoteMatch(a.statement);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Process one article ───────────────────────────────────────────────────────

async function processArticle(hash, sourceCategory) {
  const cleanPath = resolve(CACHE_DIR, hash, 'clean.md');
  const metaPath = resolve(CACHE_DIR, hash, 'meta.json');
  const outPath = resolve(CACHE_DIR, hash, 'assertions.json');

  if (!existsSync(cleanPath)) {
    return { hash, outcome: 'skip/no-clean' };
  }
  if (!FORCE && existsSync(outPath)) {
    return { hash, outcome: 'cached' };
  }

  let meta = {};
  try { meta = JSON.parse(await readFile(metaPath, 'utf8')); } catch { /* non-fatal */ }
  const sourceUrl = meta.url ?? `unknown://${hash}`;

  const markdown = await readFile(cleanPath, 'utf8');
  const tree = fromMarkdown(markdown);

  const raw = [
    ...extractUnderRuleHeadings(tree, hash, sourceUrl, sourceCategory),
    ...extractBlockquotes(tree, hash, sourceUrl, sourceCategory),
    ...extractImageAlts(tree, hash, sourceUrl, sourceCategory),
    ...extractHeadingsAsRules(tree, hash, sourceUrl, sourceCategory),
    ...extractBoldParagraphOpeners(tree, hash, sourceUrl, sourceCategory),
  ];

  const deduped = deduplicate(raw);

  // Validate each assertion; drop invalid ones with a warning.
  const valid = [];
  let dropped = 0;
  for (const a of deduped) {
    const parsed = validateAssertion(a);
    if (parsed) {
      valid.push(parsed);
    } else {
      dropped++;
      if (VERBOSE) {
        process.stdout.write(`  [invalid assertion dropped] ${JSON.stringify(a)}\n`);
      }
    }
  }

  await writeFile(outPath, JSON.stringify(valid, null, 2), 'utf8');

  const stats = {
    total: valid.length,
    dropped,
    by_strategy: {
      list_items: extractUnderRuleHeadings(tree, hash, sourceUrl, sourceCategory).length,
      blockquotes: extractBlockquotes(tree, hash, sourceUrl, sourceCategory).length,
      heading_as_rule: extractHeadingsAsRules(tree, hash, sourceUrl, sourceCategory).length,
      bold_openers: extractBoldParagraphOpeners(tree, hash, sourceUrl, sourceCategory).length,
    },
  };

  if (VERBOSE) {
    process.stdout.write(`  assertions (${hash}):\n`);
    for (const a of valid) {
      process.stdout.write(`    [${a.modality_hint ?? '?'}] [${a.category_hint ?? '?'}] ${a.statement.slice(0, 80)}\n`);
    }
  }

  return { hash, outcome: 'ok', stats, url: sourceUrl };
}

// ── Source category lookup ────────────────────────────────────────────────────

async function buildSourceCategoryMap() {
  const map = new Map();
  try {
    const sources = JSON.parse(await readFile(SOURCES_JSON, 'utf8'));
    for (const s of sources) {
      const { createHash } = await import('node:crypto');
      const hash = createHash('sha256').update(s.url).digest('hex').slice(0, 12);
      map.set(hash, s.category_hint ?? null);
    }
  } catch { /* non-fatal */ }
  return map;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const categoryMap = await buildSourceCategoryMap();

  let hashes;
  if (SINGLE_ARTICLE) {
    hashes = [SINGLE_ARTICLE];
  } else {
    try {
      const items = await readdir(CACHE_DIR, { withFileTypes: true });
      hashes = items.filter(d => d.isDirectory()).map(d => d.name);
    } catch {
      process.stdout.write('No cache directory found. Run npm run scrape:fetch first.\n');
      process.exit(0);
    }
  }

  if (hashes.length === 0) {
    process.stdout.write('Cache is empty. Run npm run scrape:fetch && npm run scrape:clean first.\n');
    process.exit(0);
  }

  process.stdout.write(`Mining ${hashes.length} article(s) (force=${FORCE}, verbose=${VERBOSE})\n\n`);

  const results = [];
  for (const hash of hashes) {
    const sourceCategory = categoryMap.get(hash) ?? null;
    const result = await processArticle(hash, sourceCategory);
    results.push(result);

    if (result.outcome === 'ok') {
      process.stdout.write(`  [ok] ${result.url ?? hash} — ${result.stats.total} assertions\n`);
    } else {
      process.stdout.write(`  [${result.outcome}] ${hash}\n`);
    }
  }

  // Summary
  const ok = results.filter(r => r.outcome === 'ok');
  const total = ok.reduce((sum, r) => sum + r.stats.total, 0);
  const dropped = ok.reduce((sum, r) => sum + r.stats.dropped, 0);

  process.stdout.write('\n── Summary ──\n');
  process.stdout.write(`  articles processed: ${ok.length}\n`);
  process.stdout.write(`  total assertions:   ${total}\n`);
  if (dropped) process.stdout.write(`  dropped (invalid):  ${dropped}\n`);
  if (results.some(r => r.outcome === 'cached')) {
    process.stdout.write(`  skipped (cached):   ${results.filter(r => r.outcome === 'cached').length}\n`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
