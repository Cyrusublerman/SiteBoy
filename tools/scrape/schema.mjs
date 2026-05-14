/**
 * Design Rule corpus — shared Zod schemas.
 *
 * Schema version: 1.0.0
 * Lock date: 2026-05-12
 *
 * All downstream pipeline stages import from here.
 * Do NOT modify field names or enum values without bumping SCHEMA_VERSION
 * and writing a migration script.
 */

import { z } from 'zod';

export const SCHEMA_VERSION = '1.0.0';

// ── Taxonomy ─────────────────────────────────────────────────────────────────

export const CATEGORIES = /** @type {const} */ ([
  'colour',
  'typography',
  'hierarchy',
  'contrast',
  'iconography',
  'grid',
  'alignment',
  'spacing',
  'density',
  'composition',
  'motion',
  'interaction',
  'feedback',
  'affordance',
  'state',
  'labelling',
  'casing',
  'voice',
  'navigation',
  'information-architecture',
  'print-production',
  'data-visualisation',
  'tokens',
  'naming',
  'modularity',
  'file-ownership',
  'process',
  'accessibility', // added: Q-018
]);

export const MODALITIES = /** @type {const} */ ([
  'MUST',
  'MUST_NOT',
  'SHOULD',
  'SHOULD_NOT',
  'MAY',
]);

/** Ternary decidability — resolves H-001 (binary was insufficient). */
export const DECIDABILITY = /** @type {const} */ ([
  'full',      // Detector exists and covers the rule completely.
  'partial',   // Detector covers common violations but cannot catch all cases.
  'judgment',  // No automated check possible; surfaced as pre-decision read.
]);

export const DETECTOR_KINDS = /** @type {const} */ ([
  'regex',
  'ast',
  'css-prop',
  'none',
]);

export const SCOPE_KEYS = /** @type {const} */ ([
  'ui-styling',
  'canvas',
  'print',
  'algorithm',
  'motion',
  'data-viz',
]);

export const SURFACES = /** @type {const} */ ([
  'web',
  'print',
  'mobile',
  'motion',
  'large-format',
]);

export const MOVEMENTS = /** @type {const} */ ([
  'swiss',
  'brutalism',
  'minimalism',
  'bauhaus',
  'flat',
  'material',
  'maximalism',
]);

// ── Authority weights (mirrors plan.md §7) ───────────────────────────────────

export const AUTHORITY_CLASSES = /** @type {const} */ ([
  'established-design-system', // 1.0 — Material, HIG, GOV.UK, W3C, WCAG
  'reputable-publisher',        // 0.7 — Figma, Webflow, Smashing, NN/g
  'domain-expert',              // 0.6 — named author + publication history
  'generic-medium',             // 0.3 — Medium / dev.to
  'forum',                      // 0.2 — Reddit / BBS
]);

export const WEIGHT_BY_CLASS = /** @type {Record<typeof AUTHORITY_CLASSES[number], number>} */ ({
  'established-design-system': 1.0,
  'reputable-publisher': 0.7,
  'domain-expert': 0.6,
  'generic-medium': 0.3,
  'forum': 0.2,
});

/**
 * Deterministic priority formula — resolves Q-012.
 *
 *   priority = round(confidence × 500 + modality_base)
 *
 * modality_base: MUST / MUST_NOT = 400, SHOULD / SHOULD_NOT = 200, MAY = 0
 */
export const MODALITY_BASE = /** @type {Record<typeof MODALITIES[number], number>} */ ({
  MUST: 400,
  MUST_NOT: 400,
  SHOULD: 200,
  SHOULD_NOT: 200,
  MAY: 0,
});

export function computePriority(modality, confidence) {
  return Math.round(confidence * 500 + MODALITY_BASE[modality]);
}

/**
 * confidence = clamp(Σ source.weight / 2.0, 0, 1)
 *
 * The /2.0 divisor normalises a typical two-source agreement to confidence=1.0.
 * (Q-004: divisor is a design choice, not a derived constant — document it here.)
 */
export function computeConfidence(sources) {
  const sum = sources.reduce((acc, s) => acc + (s.weight ?? 0), 0);
  return Math.min(1, Math.max(0, sum / 2.0));
}

// ── Normalisation utility (forward-compat for H-010, stage 5) ────────────────

/**
 * Normalise a string before substring-matching quotes against article text.
 * - Strip markdown emphasis (* _ ** __)
 * - NFKC unicode normalisation
 * - Smart quotes → straight quotes
 * - Non-breaking spaces → regular spaces
 * - Collapse whitespace runs to single space
 */
export function normaliseForQuoteMatch(str) {
  return str
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    .normalize('NFKC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const SourceSchema = z.object({
  url: z.string().url(),
  author: z.string().nullable().default(null),
  quote: z.string().min(1),
  weight: z.number().min(0).max(1),
  /** Populated by emit stage for Tier-3 sources. */
  sourced: z.enum(['fetched', 'puppeteer', 'manual-paste']).default('fetched'),
});

const DetectorSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('regex'),
    pattern: z.string().min(1),
    exclude_paths: z.array(z.string()).default([
      'node_modules/**', 'dist/**', '.vite/**', 'cache/**',
    ]),
  }),
  z.object({
    kind: z.literal('ast'),
    pattern: z.string().min(1),
    exclude_paths: z.array(z.string()).default([
      'node_modules/**', 'dist/**', '.vite/**', 'cache/**',
    ]),
  }),
  z.object({
    kind: z.literal('css-prop'),
    pattern: z.string().min(1),
    exclude_paths: z.array(z.string()).default([
      'node_modules/**', 'dist/**', '.vite/**', 'cache/**',
    ]),
  }),
  z.object({
    kind: z.literal('none'),
  }),
]);

// ── Rule schema ───────────────────────────────────────────────────────────────

export const RuleSchema = z.object({
  /** Stable, namespaced: <CATEGORY>-<MNEMONIC> */
  id: z.string().regex(/^[a-z-]+-[A-Z0-9_-]+$/, 'id must be <category>-<MNEMONIC>'),

  schema_version: z.string().default(SCHEMA_VERSION),

  category: z.enum(CATEGORIES),
  subcategory: z.string().toLowerCase().optional(),

  modality: z.enum(MODALITIES),

  /** Single imperative sentence, ≤140 chars. */
  statement: z.string().max(140),

  /** One sentence: why this rule holds. */
  rationale: z.string().max(300),

  scope: z.array(z.enum(SCOPE_KEYS)).min(1),
  applies_to: z.array(z.string()).default([]),
  excludes: z.array(z.string()).default([]),

  /** Ternary — resolves H-001. */
  decidable: z.enum(DECIDABILITY),

  /**
   * Required iff decidable ∈ {'full', 'partial'}.
   * For 'judgment', kind must be 'none'.
   */
  detector: DetectorSchema.optional(),

  examples: z.object({
    bad: z.array(z.string()).max(3).default([]),
    good: z.array(z.string()).max(3).default([]),
  }).default({}),

  sources: z.array(SourceSchema).min(1),

  /** Computed; pipeline fills this — do not hand-author. */
  confidence: z.number().min(0).max(1).optional(),

  /** Distinct source count — pipeline fills this. */
  consensus: z.number().int().min(1).optional(),

  movements: z.array(z.enum(MOVEMENTS)).default([]),
  medium: z.array(z.enum(SURFACES)).default([]),

  /** Computed via computePriority(); pipeline fills this. */
  priority: z.number().int().min(0).max(1000).optional(),

  conflicts_with: z.array(z.string()).default([]),
  supersedes: z.array(z.string()).default([]),

  /**
   * True when the rule's imperative was inferred from descriptive prose
   * (e.g. Wikipedia article, Tufte demonstration).
   * Such rules carry lower default priority and require movements tagging.
   * Resolves H-013.
   */
  descriptive_origin: z.boolean().default(false),

  /**
   * Set by the project-level overrides.yaml emit stage.
   * References the project rule or `.cursorrules` entry that takes precedence.
   * Resolves C-006/C-007/C-008.
   */
  suppressed_by: z.string().nullable().default(null),

  tags: z.array(z.string()).default([]),
});

/** Validate and fill computed fields. */
export function validateRule(raw) {
  const parsed = RuleSchema.parse(raw);

  if (parsed.decidable !== 'judgment' && !parsed.detector) {
    throw new Error(`Rule ${parsed.id}: decidable='${parsed.decidable}' requires a detector.`);
  }
  if (parsed.decidable === 'judgment' && parsed.detector && parsed.detector.kind !== 'none') {
    throw new Error(`Rule ${parsed.id}: decidable='judgment' detector must have kind='none'.`);
  }
  if (parsed.descriptive_origin && parsed.movements.length === 0) {
    throw new Error(`Rule ${parsed.id}: descriptive_origin=true requires at least one movement tag.`);
  }

  const confidence = computeConfidence(parsed.sources);
  const priority = computePriority(parsed.modality, confidence);
  const consensus = new Set(parsed.sources.map(s => new URL(s.url).hostname)).size;

  return { ...parsed, confidence, priority, consensus };
}

// ── Assertion schema (stage 4-5 intermediate) ─────────────────────────────────

export const AssertionSchema = z.object({
  /** sha256(url)[:12] of the source article. */
  source_hash: z.string().length(12),
  source_url: z.string().url(),
  /** Line number in clean.md where the assertion was found. */
  line: z.number().int().min(1),
  statement: z.string().max(500),
  quote: z.string().min(1),
  category_hint: z.string().optional(),
  modality_hint: z.enum(MODALITIES).optional(),
  descriptive_origin: z.boolean().default(false),
});

// ── Pass-B stage 5: LLM extraction (lighter than RuleSchema; no id/detector) ─

/**
 * One claim emitted per chunk by the LLM (no provenance fields — added in extract.mjs).
 * Downstream embed/cluster/synth (stages 6–8) merge into canonical RuleSchema.
 */
export const PassBClaimLLMSchema = z.object({
  statement: z.string().max(140),
  modality: z.enum(MODALITIES),
  category: z.enum(CATEGORIES),
  rationale: z.string().max(300),
  /** If omitted, extract.mjs defaults to ['ui-styling']. */
  scope: z.array(z.enum(SCOPE_KEYS)).min(1).optional(),
  /** Verbatim excerpt from the article chunk; validated with normaliseForQuoteMatch (H-010). */
  quote: z.string().min(1),
  descriptive_origin: z.boolean().optional().default(false),
  movements: z.array(z.enum(MOVEMENTS)).default([]),
  medium: z.array(z.enum(SURFACES)).default([]),
  /** Optional link back to a Pass-A assertion line number. */
  assertion_line: z.number().int().min(1).optional(),
});

export const PassBClaimsChunkResponseSchema = z.object({
  claims: z.array(PassBClaimLLMSchema),
});

/**
 * Final on-disk shape per claim after merge with source_hash / source_url.
 */
export const PassBClaimSchema = PassBClaimLLMSchema.extend({
  source_hash: z.string().length(12),
  source_url: z.string().url(),
}).refine(
  d => !d.descriptive_origin || d.movements.length > 0,
  { message: 'H-013: descriptive_origin requires at least one movement tag' },
);

export const PassBClaimsFileSchema = z.object({
  claims: z.array(PassBClaimSchema),
});

/** After stage 6: each Pass-B claim with vector (text-embedding-3-small). */
export const EmbeddedClaimSchema = PassBClaimSchema.extend({
  claim_id: z.string().min(8),
  embedding: z.array(z.number()),
});

export const EmbeddedClaimsFileSchema = z.object({
  claims: z.array(EmbeddedClaimSchema),
  embedding_model: z.string(),
});

/** Stage 8 output: canonical-shaped rule without detector/id generation — judgment-only.v1 */
export const DraftSourceSchema = z.object({
  url: z.string().url(),
  author: z.string().nullable().default(null),
  quote: z.string().min(1),
  weight: z.number().min(0).max(1),
  sourced: z.enum(['fetched', 'puppeteer', 'manual-paste']).default('fetched'),
});

export const DraftRuleSchema = z
  .object({
    id: z.string().min(1),
    category: z.enum(CATEGORIES),
    modality: z.enum(MODALITIES),
    statement: z.string().max(140),
    rationale: z.string().max(300),
    scope: z.array(z.enum(SCOPE_KEYS)).min(1),
    decidable: z.literal('judgment'),
    descriptive_origin: z.boolean().default(false),
    movements: z.array(z.enum(MOVEMENTS)).default([]),
    medium: z.array(z.enum(SURFACES)).default([]),
    sources: z.array(DraftSourceSchema).min(1),
    cluster_id: z.number().int().optional(),
    member_claim_ids: z.array(z.string()).optional(),
  })
  .refine(d => !d.descriptive_origin || d.movements.length > 0, {
    message: 'H-013: descriptive_origin requires at least one movement tag',
  });

export const DraftRulesFileSchema = z.object({
  draft_rules: z.array(DraftRuleSchema),
  schema_version: z.string().default(SCHEMA_VERSION),
});

/** LLM output for stage 8 (multi-member cluster); sources/id added by synth.mjs. */
export const SynthClusterLLMSchema = z.object({
  statement: z.string().max(140),
  modality: z.enum(MODALITIES),
  category: z.enum(CATEGORIES),
  rationale: z.string().max(300),
  scope: z.array(z.enum(SCOPE_KEYS)).min(1),
  descriptive_origin: z.boolean().default(false),
  movements: z.array(z.enum(MOVEMENTS)).default([]),
  medium: z.array(z.enum(SURFACES)).default([]),
});

// ── Source-list entry schema (sources.json) ───────────────────────────────────

export const SourceEntrySchema = z.object({
  url: z.string().url(),
  authority_class: z.enum(AUTHORITY_CLASSES),
  weight: z.number().min(0).max(1),
  /** Expected fetch tier; 3 = manual-paste required. */
  expected_tier: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  category_hint: z.enum([...CATEGORIES, '']).optional(),
  notes: z.string().default(''),
});

export const SourceListSchema = z.array(SourceEntrySchema);
