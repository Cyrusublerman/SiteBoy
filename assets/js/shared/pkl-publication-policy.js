/**
 * PKL publication eligibility policy.
 *
 * Single source of truth for the question "may this PKL object appear in public
 * output?". Consumed by the build validator, the feed generator and the browser
 * content provider so that one rule governs every public surface.
 *
 * The rule is DEFAULT-DENY. An object is publishable only when it carries an
 * affirmative, recognised publication marker. A missing, empty, unrecognised or
 * non-string marker denies publication. No object is published by omission.
 */

/** Field carrying the affirmative publication marker in `pkl-public-graph-v0`. */
export const PUBLICATION_MARKER_FIELD = 'status';

/** Closed set of marker values that affirm publication. Anything else denies. */
export const PUBLISHABLE_MARKERS = Object.freeze(['active', 'published']);

/** Optional field. When present it must be `public`; any other value vetoes. */
export const VISIBILITY_FIELD = 'visibility';

/** Closed set of visibility values that permit publication. */
export const PUBLISHABLE_VISIBILITIES = Object.freeze(['public']);

/** Boolean fields that veto publication when truthy, whatever the marker says. */
export const VETO_FLAG_FIELDS = Object.freeze([
  'draft',
  'private',
  'internal',
  'unlisted',
  'confidential',
  'embargoed',
  'redacted',
  'do_not_publish'
]);

/** Field naming an embargo expiry. Publication is denied until it has passed. */
export const EMBARGO_FIELD = 'embargoed_until';

/** Exact field names that must never reach a public artefact. */
export const FORBIDDEN_FIELDS = Object.freeze([
  'private_notes',
  'internal_notes',
  'author_notes',
  'source_path',
  'absolute_path',
  'vault_path',
  'library_path',
  'secrets',
  'access_token',
  'raw_source'
]);

/** Field-name prefixes that must never reach a public artefact. */
export const FORBIDDEN_FIELD_PATTERN = /^(private|internal|secret|draft|unpublished)[_-]/i;

/** Reference collections whose unresolved targets are a leak of existence. */
const STRICT_UID_COLLECTIONS = Object.freeze(['relationships', 'backlinks', 'figures', 'embeds']);

/** Reference collections that may legitimately name non-graph entities. */
const SOFT_UID_COLLECTIONS = Object.freeze(['citations', 'sources', 'subjects', 'projects', 'related']);

/** Public route namespaces reachable from published bodies. */
export const PUBLIC_ROUTE_PATTERN = /^\/(wiki|blog|figures)\//;

const EMBEDDED_FIGURE_PATTERN = /^::figure\[([^\]]+)\]\s*$/gm;
const WIKILINK_PATTERN = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;
const MARKDOWN_ROUTE_PATTERN = /\]\((\/(?:wiki|blog|figures)\/[^)\s]+)\)/g;
const HTML_ROUTE_PATTERN = /(?:href|src)\s*=\s*["'](\/(?:wiki|blog|figures)\/[^"'\s]+)["']/g;

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

/**
 * Extract a UID from a reference entry. Entries may be bare strings or objects
 * using any of the target key names the compiler has emitted. Returns null when
 * the entry names no in-graph object (an external citation, for example).
 */
function referenceUid(entry) {
  if (typeof entry === 'string') return entry.trim() || null;
  if (!isPlainObject(entry)) return null;
  for (const key of ['target', 'uid', 'object', 'ref', 'id', 'citation_key']) {
    const value = entry[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

/**
 * Reason an object may not be published, or null when it is publishable.
 * Reason codes name only closed-set marker values, never titles or bodies.
 */
export function publicationDenialReason(object) {
  if (!isPlainObject(object)) return 'object-not-an-object';

  for (const field of VETO_FLAG_FIELDS) {
    if (object[field] === true || object[field] === 'true') return `veto-flag:${field}`;
  }

  const embargo = object[EMBARGO_FIELD];
  if (typeof embargo === 'string' && embargo.trim()) {
    const until = Date.parse(embargo);
    if (Number.isNaN(until)) return 'embargo-unparseable';
    if (until > Date.now()) return 'embargoed';
  }

  if (VISIBILITY_FIELD in object) {
    const visibility = object[VISIBILITY_FIELD];
    if (typeof visibility !== 'string') return 'visibility-not-a-string';
    if (!PUBLISHABLE_VISIBILITIES.includes(visibility.trim().toLowerCase())) {
      return `visibility-not-public:${visibility.trim().toLowerCase()}`;
    }
  }

  const marker = object[PUBLICATION_MARKER_FIELD];
  if (marker === undefined || marker === null || marker === '') return 'publication-marker-missing';
  if (typeof marker !== 'string') return 'publication-marker-not-a-string';
  const normalised = marker.trim().toLowerCase();
  if (!normalised) return 'publication-marker-missing';
  if (!PUBLISHABLE_MARKERS.includes(normalised)) return `publication-marker-not-publishable:${normalised}`;

  return null;
}

/** True only when the object is affirmatively marked publishable. */
export function isPublishable(object) {
  return publicationDenialReason(object) === null;
}

/** Field names on the object that must never appear in a public artefact. */
export function forbiddenFields(object) {
  if (!isPlainObject(object)) return [];
  return Object.keys(object).filter(
    (key) => FORBIDDEN_FIELDS.includes(key) || FORBIDDEN_FIELD_PATTERN.test(key)
  );
}

/**
 * Every in-graph UID an object points at, with the collection it came from and
 * whether an unresolved target is itself a violation.
 */
export function collectUidReferences(object) {
  const references = [];
  if (!isPlainObject(object)) return references;

  for (const collection of STRICT_UID_COLLECTIONS) {
    for (const entry of asArray(object[collection])) {
      const uid = referenceUid(entry);
      if (uid) references.push({ kind: collection, uid, strict: true });
    }
  }

  for (const collection of SOFT_UID_COLLECTIONS) {
    for (const entry of asArray(object[collection])) {
      const uid = referenceUid(entry);
      if (uid) references.push({ kind: collection, uid, strict: false });
    }
  }

  const body = typeof object.body === 'string' ? object.body : '';
  for (const match of body.matchAll(EMBEDDED_FIGURE_PATTERN)) {
    references.push({ kind: 'body-figure-embed', uid: match[1].trim(), strict: true });
  }
  for (const match of body.matchAll(WIKILINK_PATTERN)) {
    references.push({ kind: 'body-wikilink', uid: match[1].trim(), strict: false });
  }

  return references;
}

/** Every public route an object's body links to. */
export function collectRouteReferences(object) {
  const references = [];
  if (!isPlainObject(object)) return references;
  const body = typeof object.body === 'string' ? object.body : '';
  for (const match of body.matchAll(MARKDOWN_ROUTE_PATTERN)) {
    references.push({ kind: 'body-markdown-link', route: match[1].split('#')[0] });
  }
  for (const match of body.matchAll(HTML_ROUTE_PATTERN)) {
    references.push({ kind: 'body-html-link', route: match[1].split('#')[0] });
  }
  return references;
}

/** Objects from a graph that are affirmatively marked publishable. */
export function eligibleObjects(graph) {
  return (graph?.objects ?? []).filter(isPublishable);
}

/**
 * Audit a public graph against the publication rule.
 *
 * Returns the eligible set, the denied set (with reason codes) and every
 * violation of the controlling property: no ineligible node may appear in, or
 * be reachable from, public content.
 */
export function auditPublicGraph(graph) {
  const objects = Array.isArray(graph?.objects) ? graph.objects : [];
  const byUid = new Map();
  const eligible = [];
  const denied = [];
  const violations = [];

  for (const object of objects) {
    const uid = isPlainObject(object) && typeof object.uid === 'string' ? object.uid : '(missing-uid)';
    if (!byUid.has(uid)) byUid.set(uid, object);
    const reason = publicationDenialReason(object);
    if (reason === null) {
      eligible.push(object);
    } else {
      denied.push({ uid, reason });
      violations.push({
        code: 'INELIGIBLE_OBJECT_IN_PUBLIC_GRAPH',
        uid,
        detail: reason,
        message: 'Object is present in the public graph but is not marked publishable.'
      });
    }
  }

  const eligibleUids = new Set(eligible.map((object) => object.uid));
  const eligibleRoutes = new Map(eligible.map((object) => [object.route, object.uid]));

  for (const object of eligible) {
    for (const field of forbiddenFields(object)) {
      violations.push({
        code: 'FORBIDDEN_FIELD_ON_PUBLIC_OBJECT',
        uid: object.uid,
        detail: field,
        message: 'Published object carries a field reserved for private material.'
      });
    }
  }

  // Transitive reachability from the publicly addressable surface. Traversal
  // only continues through eligible nodes; anything reached that is ineligible
  // or absent is a leak of a private node's existence.
  const queue = eligible.map((object) => ({ uid: object.uid, path: [object.uid] }));
  const visited = new Set(queue.map((entry) => entry.uid));

  while (queue.length) {
    const { uid, path } = queue.shift();
    const object = byUid.get(uid);
    if (!object) continue;

    for (const reference of collectUidReferences(object)) {
      if (eligibleUids.has(reference.uid)) {
        if (!visited.has(reference.uid)) {
          visited.add(reference.uid);
          queue.push({ uid: reference.uid, path: [...path, reference.uid] });
        }
        continue;
      }
      if (byUid.has(reference.uid)) {
        violations.push({
          code: 'PUBLIC_REFERENCE_TO_INELIGIBLE_OBJECT',
          uid,
          target: reference.uid,
          detail: reference.kind,
          path,
          message: 'Public content references an object that is not marked publishable.'
        });
        continue;
      }
      if (reference.strict) {
        violations.push({
          code: 'PUBLIC_REFERENCE_TO_UNKNOWN_OBJECT',
          uid,
          target: reference.uid,
          detail: reference.kind,
          path,
          message: 'Public content references an object absent from the public graph.'
        });
      }
    }

    for (const reference of collectRouteReferences(object)) {
      if (eligibleRoutes.has(reference.route)) continue;
      violations.push({
        code: 'PUBLIC_LINK_TO_UNPUBLISHED_ROUTE',
        uid,
        target: reference.route,
        detail: reference.kind,
        path,
        message: 'Public content links to a route that no published object owns.'
      });
    }
  }

  for (const [route, uid] of Object.entries(graph?.routes ?? {})) {
    if (!eligibleUids.has(uid)) {
      violations.push({
        code: 'ROUTE_INDEX_EXPOSES_INELIGIBLE_OBJECT',
        uid,
        target: route,
        detail: 'routes',
        message: 'Route index resolves to an object that is not marked publishable.'
      });
    }
  }

  for (const [alias, uid] of Object.entries(graph?.aliases ?? {})) {
    if (!eligibleUids.has(uid)) {
      violations.push({
        code: 'ALIAS_INDEX_EXPOSES_INELIGIBLE_OBJECT',
        uid,
        target: alias,
        detail: 'aliases',
        message: 'Alias index resolves to an object that is not marked publishable.'
      });
    }
  }

  for (const [indexName, buckets] of Object.entries(graph?.indexes ?? {})) {
    if (!isPlainObject(buckets)) continue;
    for (const [bucket, uids] of Object.entries(buckets)) {
      for (const uid of asArray(uids)) {
        if (eligibleUids.has(uid)) continue;
        violations.push({
          code: 'INDEX_EXPOSES_INELIGIBLE_OBJECT',
          uid,
          target: `${indexName}/${bucket}`,
          detail: indexName,
          message: 'Graph index lists an object that is not marked publishable.'
        });
      }
    }
  }

  return { eligible, denied, violations, eligibleUids, eligibleRoutes };
}
