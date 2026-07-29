/**
 * Block-document sanitiser — the security boundary between authored content
 * and the public render.
 *
 * Applies the closed type registry in `block-types.js` to a document produced
 * by `block-parser.js`. Every prop is validated against a declared schema;
 * anything unrecognised, wrongly typed, out of range, or carrying a denied URL
 * scheme is dropped. A block missing a required prop degrades to a warning
 * node rather than reaching the renderer half-formed.
 *
 * Pure and DOM-free. Input is assumed hostile: content also arrives from
 * imported legacy Blog data, not only from the single trusted author.
 *
 * @source blog/docs/site/vercel-dynamic-migration-plan.md §C2 S14 tasks 3-4
 * @source blog/docs/site/vercel-migration/decisions.md D-11
 * @wikipedia https://en.wikipedia.org/wiki/Cross-site_scripting
 * @module markup/block-sanitiser
 */

import { BLOCK_WARNING_CODES, parseBlockDocument, BLOCK_DOCUMENT_VERSION } from './block-parser.js';
import { getBlockSchema, VGA_PALETTE } from './block-types.js';
import { sanitiseUrl, stripHtml } from './html-sanitiser.js';

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const SLUG = /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/;
const ASSET_PATH = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;
const DEFAULT_TEXT_LIMIT = 240;

/**
 * Remove control characters from a string value.
 *
 * @param {string} value - Raw string.
 * @returns {string} Value without C0/C1 controls (tab and newline retained).
 */
function stripControls(value) {
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u2028\u2029]/g, '');
}

/**
 * Validate a single prop value against its schema.
 *
 * @param {*} value - Untrusted value from the parsed JSON payload.
 * @param {Object} schema - Schema entry from `block-types.js`.
 * @param {Object} options - Sanitiser options (see {@link sanitiseBlockProps}).
 * @returns {{ok: true, value: *}|{ok: false, reason: string}} Outcome.
 */
function coerce(value, schema, options) {
    switch (schema.kind) {
        case 'text': {
            if (typeof value !== 'string') return { ok: false, reason: 'expected string' };
            const cleaned = stripControls(stripHtml(value)).trim();
            const limit = schema.maxLength ?? DEFAULT_TEXT_LIMIT;
            if (cleaned.length === 0) return { ok: false, reason: 'empty after sanitisation' };
            return { ok: true, value: cleaned.slice(0, limit) };
        }
        case 'markdown': {
            if (typeof value !== 'string') return { ok: false, reason: 'expected string' };
            const cleaned = stripControls(stripHtml(value));
            if (cleaned.trim().length === 0) return { ok: false, reason: 'empty after sanitisation' };
            return { ok: true, value: cleaned.slice(0, schema.maxLength ?? 20000) };
        }
        case 'slug': {
            if (typeof value !== 'string') return { ok: false, reason: 'expected string' };
            const cleaned = value.trim().toLowerCase();
            if (!SLUG.test(cleaned)) return { ok: false, reason: 'not a slug' };
            return { ok: true, value: cleaned };
        }
        case 'identifier': {
            if (typeof value !== 'string') return { ok: false, reason: 'expected string' };
            const cleaned = value.trim();
            if (!IDENTIFIER.test(cleaned)) return { ok: false, reason: 'not an identifier' };
            return { ok: true, value: cleaned };
        }
        case 'asset-path': {
            if (typeof value !== 'string') return { ok: false, reason: 'expected string' };
            const cleaned = value.trim();
            if (!ASSET_PATH.test(cleaned)) return { ok: false, reason: 'not a repository-relative path' };
            if (cleaned.split('/').includes('..')) return { ok: false, reason: 'path traversal' };
            if (schema.prefix && !cleaned.startsWith(schema.prefix)) return { ok: false, reason: `outside ${schema.prefix}` };
            if (schema.extensions && !schema.extensions.some(ext => cleaned.endsWith(ext))) {
                return { ok: false, reason: 'disallowed file extension' };
            }
            return { ok: true, value: cleaned };
        }
        case 'url': {
            const url = sanitiseUrl(value, { allowMailto: true });
            return url === null ? { ok: false, reason: 'denied URL' } : { ok: true, value: url };
        }
        case 'embed-url': {
            // D-11: strict same-origin, plus an explicit host allow-list.
            const relative = sanitiseUrl(value, { allowMailto: false, allowAbsolute: false });
            if (relative !== null) return { ok: true, value: relative };
            const hosts = options.embedHostAllowList ?? [];
            if (hosts.length === 0) return { ok: false, reason: 'absolute embed source with empty host allow-list' };
            const absolute = sanitiseUrl(value, { allowMailto: false, hostAllowList: hosts });
            if (absolute === null) return { ok: false, reason: 'embed host not on allow-list' };
            if (!absolute.toLowerCase().startsWith('https://')) return { ok: false, reason: 'embed source must be https' };
            return { ok: true, value: absolute };
        }
        case 'integer': {
            if (typeof value !== 'number' || !Number.isInteger(value)) return { ok: false, reason: 'expected integer' };
            if (value < schema.min || value > schema.max) return { ok: false, reason: 'out of range' };
            return { ok: true, value };
        }
        case 'number': {
            if (typeof value !== 'number' || !Number.isFinite(value)) return { ok: false, reason: 'expected finite number' };
            if (value < schema.min || value > schema.max) return { ok: false, reason: 'out of range' };
            return { ok: true, value };
        }
        case 'boolean': {
            if (typeof value !== 'boolean') return { ok: false, reason: 'expected boolean' };
            return { ok: true, value };
        }
        case 'enum': {
            if (typeof value !== 'string') return { ok: false, reason: 'expected string' };
            const cleaned = value.trim().toLowerCase();
            if (!schema.values.includes(cleaned)) return { ok: false, reason: 'not an allowed value' };
            return { ok: true, value: cleaned };
        }
        case 'token-set': {
            if (!Array.isArray(value)) return { ok: false, reason: 'expected array' };
            const seen = [];
            for (const entry of value) {
                if (typeof entry !== 'string') continue;
                const token = entry.trim().toLowerCase();
                if (schema.values.includes(token) && !seen.includes(token)) seen.push(token);
            }
            if (seen.length === 0) return { ok: false, reason: 'no allowed tokens' };
            return { ok: true, value: seen };
        }
        case 'palette-index': {
            if (typeof value !== 'number' || !Number.isInteger(value)) return { ok: false, reason: 'expected integer' };
            if (value < 0 || value >= VGA_PALETTE.length) return { ok: false, reason: 'outside VGA palette' };
            return { ok: true, value };
        }
        case 'array': {
            if (!Array.isArray(value)) return { ok: false, reason: 'expected array' };
            if (value.length > schema.maxItems) return { ok: false, reason: 'too many items' };
            const items = [];
            for (const entry of value) {
                const result = coerce(entry, schema.item, options);
                if (result.ok) items.push(result.value);
            }
            if (items.length === 0) return { ok: false, reason: 'no valid items' };
            return { ok: true, value: items };
        }
        case 'record': {
            if (value === null || typeof value !== 'object' || Array.isArray(value)) {
                return { ok: false, reason: 'expected object' };
            }
            const record = {};
            for (const [field, fieldSchema] of Object.entries(schema.fields)) {
                if (!Object.hasOwn(value, field)) {
                    if (fieldSchema.required) return { ok: false, reason: `missing ${field}` };
                    continue;
                }
                const result = coerce(value[field], fieldSchema, options);
                if (result.ok) record[field] = result.value;
                else if (fieldSchema.required) return { ok: false, reason: `${field}: ${result.reason}` };
            }
            return { ok: true, value: record };
        }
        case 'params': {
            if (value === null || typeof value !== 'object' || Array.isArray(value)) {
                return { ok: false, reason: 'expected object' };
            }
            const entries = Object.entries(value);
            if (entries.length > schema.maxKeys) return { ok: false, reason: 'too many keys' };
            const params = {};
            for (const [key, raw] of entries) {
                if (!IDENTIFIER.test(key)) continue;
                if (isJsonPrimitive(raw)) {
                    params[key] = typeof raw === 'string' ? stripControls(stripHtml(raw)).slice(0, DEFAULT_TEXT_LIMIT) : raw;
                    continue;
                }
                if (Array.isArray(raw) && raw.length <= schema.maxItems && raw.every(isJsonPrimitive)) {
                    params[key] = raw.map(item => (typeof item === 'string'
                        ? stripControls(stripHtml(item)).slice(0, DEFAULT_TEXT_LIMIT)
                        : item));
                }
            }
            return { ok: true, value: params };
        }
        default:
            return { ok: false, reason: `unknown schema kind "${schema.kind}"` };
    }
}

/**
 * Predicate: is `value` a JSON primitive safe to pass to an algorithm?
 *
 * @param {*} value - Candidate.
 * @returns {boolean} True for finite numbers, booleans, strings and null.
 */
function isJsonPrimitive(value) {
    if (value === null) return true;
    const type = typeof value;
    if (type === 'string' || type === 'boolean') return true;
    return type === 'number' && Number.isFinite(value);
}

/**
 * Validate and filter a block's props against its registry schema.
 *
 * Unrecognised props are dropped silently — carrying an unknown key forward
 * would defeat the allow-list. Missing required props, and a failed
 * `requireAny` group, are reported so the caller can degrade the block.
 *
 * @param {string} type - Canonical block type.
 * @param {Object} props - Untrusted props object from the parsed payload.
 * @param {Object} [options] - Sanitiser options.
 * @param {ReadonlyArray<string>} [options.embedHostAllowList=[]] - Hosts whose
 *   https URLs may appear as an `iframe` block source (D-11).
 * @returns {{ok: true, props: Object, dropped: Array<string>}|{ok: false, reason: string, dropped: Array<string>}}
 *   Outcome. `dropped` names every prop removed, in source order.
 */
export function sanitiseBlockProps(type, props, options = {}) {
    const schema = getBlockSchema(type);
    const dropped = [];
    if (schema === null) return { ok: false, reason: `unknown block type "${type}"`, dropped };
    if (props === null || typeof props !== 'object' || Array.isArray(props)) {
        return { ok: false, reason: 'props must be a JSON object', dropped };
    }

    const clean = {};
    for (const key of Object.keys(props)) {
        if (!Object.hasOwn(schema.props, key)) dropped.push(key);
    }

    for (const [key, propSchema] of Object.entries(schema.props)) {
        if (!Object.hasOwn(props, key)) {
            if (propSchema.required) return { ok: false, reason: `missing required prop "${key}"`, dropped };
            continue;
        }
        const result = coerce(props[key], propSchema, options);
        if (result.ok) {
            clean[key] = result.value;
            continue;
        }
        if (propSchema.required) {
            return { ok: false, reason: `prop "${key}" rejected: ${result.reason}`, dropped };
        }
        dropped.push(key);
    }

    if (Array.isArray(schema.requireAny) && !schema.requireAny.some(key => Object.hasOwn(clean, key))) {
        return { ok: false, reason: `requires one of: ${schema.requireAny.join(', ')}`, dropped };
    }

    // allow-scripts plus allow-same-origin is equivalent to removing the sandbox.
    if (Array.isArray(clean.sandbox) && clean.sandbox.includes('allow-scripts')) {
        clean.sandbox = clean.sandbox.filter(token => token !== 'allow-same-origin');
    }

    return { ok: true, props: clean, dropped };
}

/**
 * Sanitise a parsed block document in place of the renderer.
 *
 * Text nodes have all HTML markup removed (they are markdown, so they are
 * stripped rather than escaped; the markdown renderer's HTML output must then
 * pass through `sanitiseHtml`). Block nodes keep only allow-listed, validated
 * props. Blocks that fail validation become `invalid-props` warnings.
 *
 * @param {{version: number, nodes: Array<Object>}} document - Parsed document.
 * @param {Object} [options] - Sanitiser options.
 * @param {ReadonlyArray<string>} [options.embedHostAllowList=[]] - See
 *   {@link sanitiseBlockProps}.
 * @returns {{version: number, nodes: Array<Object>, warnings: Array<Object>}} Sanitised document.
 */
export function sanitiseBlockDocument(document, options = {}) {
    const nodes = [];
    const source = Array.isArray(document?.nodes) ? document.nodes : [];

    for (const node of source) {
        if (node.kind === 'text') {
            nodes.push({ kind: 'text', value: stripControls(stripHtml(String(node.value ?? ''))), line: node.line });
            continue;
        }
        if (node.kind === 'warning') {
            nodes.push({
                kind: 'warning',
                code: node.code,
                message: stripControls(String(node.message ?? '')),
                line: node.line,
                blockType: node.blockType
            });
            continue;
        }
        if (node.kind !== 'block') continue;

        const result = sanitiseBlockProps(node.type, node.props, options);
        if (!result.ok) {
            nodes.push({
                kind: 'warning',
                code: BLOCK_WARNING_CODES.INVALID_PROPS,
                message: `Block "${node.type}" at line ${node.line} was rejected: ${result.reason}.`,
                line: node.line,
                blockType: node.type
            });
            continue;
        }
        nodes.push({
            kind: 'block',
            type: node.type,
            props: result.props,
            line: node.line,
            endLine: node.endLine,
            droppedProps: result.dropped
        });
    }

    return {
        version: BLOCK_DOCUMENT_VERSION,
        nodes,
        warnings: nodes.filter(entry => entry.kind === 'warning')
    };
}

/**
 * Parse and sanitise markdown source in one call.
 *
 * @param {string} source - Untrusted markdown source.
 * @param {Object} [options] - Sanitiser options; see {@link sanitiseBlockDocument}.
 * @returns {{version: number, nodes: Array<Object>, warnings: Array<Object>}} Sanitised document.
 */
export function parseAndSanitiseBlocks(source, options = {}) {
    return sanitiseBlockDocument(parseBlockDocument(source), options);
}
