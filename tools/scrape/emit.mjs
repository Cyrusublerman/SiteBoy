/**
 * Stage 11 — Emit rule corpus from categorised draft rules.
 *
 * Reads:  cache/_corpus/categorised-rules.json
 *         blog/docs/standards/conflicts.queue.md  (gate check)
 * Writes:
 *   blog/docs/standards/rules/<category>/<id>.md  — one file per rule (human)
 *   blog/docs/standards/rules/INDEX.md            — compact one-line index
 *   blog/docs/standards/<category>.md             — per-category narrative
 *   blog/docs/standards/hot-rules.md              — top MUST/MUST_NOT block
 *   blog/docs/standards/routing-map-rows.md       — pre-decision read map rows
 *   cache/_corpus/emitted-rules.json              — machine-readable full corpus
 *
 * Token counting: character estimate (1 token ≈ 4 chars, cl100k_base approximation).
 * INDEX.md budget: 2000 tokens. hot-rules.md budget: 6000 tokens.
 *
 * Usage: node tools/scrape/emit.mjs [--force] [--verbose] [--dry-run]
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CategorisedRulesFileSchema,
  RuleSchema,
  validateRule,
  CATEGORIES,
  SCHEMA_VERSION,
} from './schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = resolve(__dirname, 'cache');
const CORPUS_DIR = resolve(CACHE_DIR, '_corpus');
const IN_PATH = resolve(CORPUS_DIR, 'categorised-rules.json');
const EMITTED_JSON = resolve(CORPUS_DIR, 'emitted-rules.json');
const STANDARDS_DIR = resolve(__dirname, '../../blog/docs/standards');
const RULES_DIR = resolve(STANDARDS_DIR, 'rules');
const QUEUE_PATH = resolve(STANDARDS_DIR, 'conflicts.queue.md');

const INDEX_TOKEN_BUDGET = 2000;
const HOT_TOKEN_BUDGET = 6000;
// 1 token ≈ 4 chars (cl100k_base approximation for English prose)
const CHARS_PER_TOKEN = 4;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const VERBOSE = args.includes('--verbose');
const DRY_RUN = args.includes('--dry-run');

function estimateTokens(text) {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

// ── Promote DraftRule → full RuleSchema ───────────────────────────────────────

function promoteToRule(draft) {
  const raw = {
    ...draft,
    schema_version: SCHEMA_VERSION,
    applies_to: [],
    excludes: [],
    detector: { kind: 'none' },
    examples: { bad: [], good: [] },
    conflicts_with: [],
    supersedes: [],
    suppressed_by: null,
    tags: [],
  };
  // strip categorise-stage-only fields
  delete raw.nearest_category;
  delete raw.category_confidence;
  delete raw.category_review;
  delete raw.cluster_id;
  delete raw.member_claim_ids;
  return validateRule(raw);
}

// ── YAML-ish front-matter serialiser ─────────────────────────────────────────

function yamlValue(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    return '\n' + v.map(x => `  - ${yamlValue(x)}`).join('\n');
  }
  if (typeof v === 'object') {
    return '\n' + Object.entries(v)
      .map(([k, val]) => `  ${k}: ${yamlValue(val)}`)
      .join('\n');
  }
  const s = String(v);
  if (s.includes('\n') || s.includes('"') || s.includes(':') || s.startsWith(' ')) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return s;
}

function serializeFrontMatter(rule) {
  const fields = [
    'id', 'schema_version', 'category', 'subcategory', 'modality', 'statement',
    'rationale', 'scope', 'applies_to', 'excludes', 'decidable', 'descriptor',
    'confidence', 'consensus', 'priority', 'movements', 'medium',
    'conflicts_with', 'supersedes', 'descriptive_origin', 'suppressed_by', 'tags',
  ];
  const lines = ['---'];
  for (const key of fields) {
    if (rule[key] === undefined) continue;
    lines.push(`${key}: ${yamlValue(rule[key])}`);
  }
  // detector separately (nested object)
  if (rule.detector) {
    lines.push(`detector:`);
    for (const [k, v] of Object.entries(rule.detector)) {
      lines.push(`  ${k}: ${yamlValue(v)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

// ── Per-rule .md renderer ─────────────────────────────────────────────────────

function renderRuleMd(rule) {
  const lines = [
    '<!-- generated: do not edit -->',
    '',
    serializeFrontMatter(rule),
    '',
    `# ${rule.id}`,
    '',
    `**${rule.modality}:** ${rule.statement}`,
    '',
    '## Rationale',
    '',
    rule.rationale,
    '',
  ];

  if (rule.examples?.bad?.length || rule.examples?.good?.length) {
    lines.push('## Examples');
    lines.push('');
    if (rule.examples.bad.length) {
      lines.push('### Bad');
      lines.push('');
      for (const ex of rule.examples.bad) lines.push(`- \`${ex}\``);
      lines.push('');
    }
    if (rule.examples.good.length) {
      lines.push('### Good');
      lines.push('');
      for (const ex of rule.examples.good) lines.push(`- \`${ex}\``);
      lines.push('');
    }
  }

  lines.push('## Sources');
  lines.push('');
  for (const s of rule.sources) {
    lines.push(`- **${s.url}**`);
    if (s.author) lines.push(`  - author: ${s.author}`);
    lines.push(`  - weight: ${s.weight}`);
    lines.push(`  - sourced: ${s.sourced}`);
    lines.push(`  > ${s.quote}`);
    lines.push('');
  }

  if (rule.category_review) {
    lines.push(`> **Category review flag:** nearest centroid disagrees — confirm \`${rule.category}\` is correct.`);
    lines.push('');
  }

  return lines.join('\n');
}

// ── INDEX.md renderer ─────────────────────────────────────────────────────────

function renderIndex(rules, rulesDir) {
  const header = [
    '<!-- generated: do not edit -->',
    '',
    '# Design Rule Index',
    '',
    `${rules.length} rules. One line per rule: \`<id> [<modality>] <statement>\``,
    '',
  ].join('\n');

  const sorted = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const lineFor = r => {
    const rel = `rules/${r.category}/${r.id}.md`;
    return `${r.id} [${r.modality}] ${r.statement} → ${rel}`;
  };

  let content = header;
  let included = 0;
  for (const r of sorted) {
    const line = lineFor(r) + '\n';
    if (estimateTokens(content + line) > INDEX_TOKEN_BUDGET) {
      process.stdout.write(
        `INDEX token budget reached at ${included}/${rules.length} rules — lowest-priority rules truncated.\n`,
      );
      break;
    }
    content += line;
    included++;
  }
  return content;
}

// ── Per-category guide renderer ───────────────────────────────────────────────

function renderCategoryGuide(category, rules) {
  const title = category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const lines = [
    '<!-- generated: do not edit -->',
    '',
    `# ${title}`,
    '',
    `${rules.length} rule${rules.length !== 1 ? 's' : ''} in this category.`,
    '',
  ];

  const sorted = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  for (const rule of sorted) {
    lines.push(`## ${rule.id}`);
    lines.push('');
    lines.push(`**${rule.modality}:** ${rule.statement}`);
    lines.push('');
    lines.push(`*${rule.rationale}*`);
    lines.push('');
    if (rule.movements?.length) {
      lines.push(`Movements: \`${rule.movements.join(', ')}\``);
      lines.push('');
    }
    if (rule.sources?.length) {
      lines.push('Sources:');
      for (const s of rule.sources) {
        lines.push(`- ${s.url}${s.author ? ` (${s.author})` : ''}`);
      }
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }
  return lines.join('\n');
}

// ── Hot Rules renderer ────────────────────────────────────────────────────────

function renderHotRules(rules) {
  const hot = rules
    .filter(r => r.modality === 'MUST' || r.modality === 'MUST_NOT')
    .sort((a, b) => {
      const scoreA = (a.priority ?? 0) * (a.confidence ?? 0);
      const scoreB = (b.priority ?? 0) * (b.confidence ?? 0);
      return scoreB - scoreA;
    });

  const header = [
    '<!-- generated: do not edit -->',
    '',
    '# Hot Rules',
    '',
    'Top MUST / MUST_NOT rules by `priority × confidence`.',
    'Injected into `.cursorrules` between `<!-- HOT-RULES:START -->` and `<!-- HOT-RULES:END -->`.',
    '',
    '<!-- HOT-RULES:START -->',
  ].join('\n') + '\n';

  let body = '';
  let included = 0;
  for (const r of hot) {
    const line = `${r.id} [${r.modality}] ${r.statement} — ${r.rationale}\n`;
    if (estimateTokens(header + body + line + '<!-- HOT-RULES:END -->') > HOT_TOKEN_BUDGET) {
      process.stdout.write(
        `Hot-rules token budget reached at ${included}/${hot.length} rules — truncating.\n`,
      );
      break;
    }
    body += line;
    included++;
  }

  return header + body + '<!-- HOT-RULES:END -->\n';
}

// ── Routing map rows renderer ─────────────────────────────────────────────────

function renderRoutingMapRows(categories) {
  const lines = [
    '<!-- generated: do not edit -->',
    '',
    '# Pre-Decision Read Map Rows',
    '',
    'Append these rows to `blog/docs/guides/ai-routing-map.md` when wiring.',
    '',
    '| Decision | Guide |',
    '| --- | --- |',
  ];
  for (const cat of categories) {
    const title = cat.replace(/-/g, ' ');
    lines.push(`| Any ${title} decision | [\`${cat}.md\`](../standards/${cat}.md) |`);
  }
  lines.push('');
  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(IN_PATH)) {
    console.error('Missing categorised-rules.json — run scrape:categorise first.');
    process.exit(1);
  }

  // Gate: warn on unresolved conflicts
  if (existsSync(QUEUE_PATH)) {
    const queue = await readFile(QUEUE_PATH, 'utf8');
    const unresolvedCount = (queue.match(/resolved: false/g) || []).length;
    if (unresolvedCount > 0) {
      process.stdout.write(
        `Warning: ${unresolvedCount} unresolved conflict(s) in conflicts.queue.md — affected rules will be absent.\n`,
      );
    }
  }

  if (!FORCE && existsSync(EMITTED_JSON)) {
    process.stdout.write(`Exists: ${EMITTED_JSON} (use --force)\n`);
    process.exit(0);
  }

  const raw = JSON.parse(await readFile(IN_PATH, 'utf8'));
  const { draft_rules: categorisedRules } = CategorisedRulesFileSchema.parse(raw);
  process.stdout.write(`Loaded ${categorisedRules.length} categorised rules.\n`);

  // Promote to full RuleSchema
  const rules = [];
  for (const draft of categorisedRules) {
    try {
      const full = promoteToRule(draft);
      rules.push({ ...full, category_review: draft.category_review ?? false });
    } catch (e) {
      console.error(`Skipping ${draft.id}: ${e.message}`);
    }
  }
  process.stdout.write(`Promoted ${rules.length} rules to full RuleSchema.\n`);

  if (DRY_RUN) {
    process.stdout.write('[dry-run] would emit:\n');
    for (const r of rules) process.stdout.write(`  ${r.id} [${r.modality}] ${r.category}\n`);
    return;
  }

  await mkdir(RULES_DIR, { recursive: true });
  await mkdir(STANDARDS_DIR, { recursive: true });

  // Per-rule files
  const byCategory = new Map();
  for (const r of rules) {
    const catDir = resolve(RULES_DIR, r.category);
    await mkdir(catDir, { recursive: true });
    const filePath = resolve(catDir, `${r.id}.md`);
    await writeFile(filePath, renderRuleMd(r), 'utf8');
    if (!byCategory.has(r.category)) byCategory.set(r.category, []);
    byCategory.get(r.category).push(r);
  }
  process.stdout.write(`Wrote ${rules.length} rule files to ${RULES_DIR}\n`);

  // INDEX.md
  const indexPath = resolve(RULES_DIR, 'INDEX.md');
  await writeFile(indexPath, renderIndex(rules, RULES_DIR), 'utf8');
  process.stdout.write(`Wrote ${indexPath}\n`);

  // Per-category guides
  const categoriesWithRules = [];
  for (const [cat, catRules] of byCategory) {
    const guidePath = resolve(STANDARDS_DIR, `${cat}.md`);
    await writeFile(guidePath, renderCategoryGuide(cat, catRules), 'utf8');
    categoriesWithRules.push(cat);
    if (VERBOSE) process.stdout.write(`  guide: ${cat}.md (${catRules.length} rules)\n`);
  }
  process.stdout.write(`Wrote ${categoriesWithRules.length} category guides.\n`);

  // hot-rules.md
  const hotPath = resolve(STANDARDS_DIR, 'hot-rules.md');
  await writeFile(hotPath, renderHotRules(rules), 'utf8');
  process.stdout.write(`Wrote ${hotPath}\n`);

  // routing-map-rows.md
  const routingPath = resolve(STANDARDS_DIR, 'routing-map-rows.md');
  await writeFile(routingPath, renderRoutingMapRows(categoriesWithRules), 'utf8');
  process.stdout.write(`Wrote ${routingPath}\n`);

  // Machine-readable emitted-rules.json
  const emittedDoc = {
    schema_version: SCHEMA_VERSION,
    emitted_at: new Date().toISOString(),
    rule_count: rules.length,
    rules: rules.map(r => {
      const { category_review, ...rest } = r;
      return rest;
    }),
  };
  await writeFile(EMITTED_JSON, JSON.stringify(emittedDoc, null, 2), 'utf8');
  process.stdout.write(`Wrote ${EMITTED_JSON}\n`);
  process.stdout.write(`Done. ${rules.length} rules emitted.\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
