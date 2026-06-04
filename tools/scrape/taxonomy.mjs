/**
 * Frozen taxonomy + authority weights (plan.md sections 6–7).
 * Schema and pipeline stages import from here.
 */

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
  'accessibility',
]);

/** plan.md section 3 modality slot */
export const MODALITY_VALUES = /** @type {const} */ ([
  'MUST',
  'MUST_NOT',
  'SHOULD',
  'SHOULD_NOT',
  'MAY',
]);

export const AUTHORITY_CLASSES = /** @type {const} */ ([
  'established-design-system',
  'reputable-publisher',
  'domain-expert',
  'generic-medium',
  'forum',
]);

/** plan.md section 7 — weight by source class */
export const AUTHORITY_WEIGHTS = /** @type {Record<typeof AUTHORITY_CLASSES[number], number>} */ ({
  'established-design-system': 1.0,
  'reputable-publisher': 0.7,
  'domain-expert': 0.6,
  'generic-medium': 0.3,
  'forum': 0.2,
});
