/**
 * `:::block` directive parser.
 *
 * Converts markdown source containing `:::block` fences into a flat,
 * serialisable document. Pure and DOM-free, so the admin editor (browser) and
 * the public renderer (Node) agree byte for byte.
 *
 * Syntax, verbatim from the plan:
 *
 *   "Every inserted non-text element is a fenced block in the markdown source
 *    with shape `:::block <type>\n<json>\n:::`."
 *
 * and:
 *
 *   "Implement `:::block <type>\n<json>\n:::` extension. JSON parsed strictly;
 *    unknown `<type>` rendered as a visible warning, never as HTML."
 *
 * Consequences of that definition, all enforced here:
 * - The opening fence is a whole line: `:::block` then exactly one type token.
 * - The closing fence is a whole line containing only `:::`.
 * - The payload is one JSON value, parsed with `JSON.parse` (strict). A JSON
 *   string may not contain a literal newline, so a line-anchored `:::` can
 *   never fall inside the payload; the scanner needs no nesting state.
 * - The specification defines no nested fences and no attribute syntax beyond
 *   the single type token, so neither is accepted. Extra info-line tokens
 *   degrade to a warning rather than being interpreted.
 *
 * Nothing here throws on user input. Every failure becomes a `warning` node
 * carrying the offending source, so an editor can round-trip and repair it.
 *
 * @source blog/docs/site/vercel-dynamic-migration-plan.md §B3.5 (line 354)
 * @source blog/docs/site/vercel-dynamic-migration-plan.md §C2 S14 (lines 676-688)
 * @wikipedia https://en.wikipedia.org/wiki/Markdown
 * @module markup/block-parser
 */

import { canonicaliseBlockType } from './block-types.js';

/**
 * Schema version stamped on every parsed document.
 *
 * @type {number}
 */
export const BLOCK_DOCUMENT_VERSION = 1;

/**
 * Closed set of warning codes a parsed document may contain.
 *
 * @type {Readonly<Object<string, string>>}
 */
export const BLOCK_WARNING_CODES = Object.freeze({
    MISSING_TYPE: 'missing-type',
    MALFORMED_TYPE: 'malformed-type',
    UNEXPECTED_ATTRIBUTES: 'unexpected-attributes',
    UNKNOWN_TYPE: 'unknown-type',
    MALFORMED_JSON: 'malformed-json',
    PAYLOAD_NOT_OBJECT: 'payload-not-object',
    UNTERMINATED_BLOCK: 'unterminated-block',
    INVALID_PROPS: 'invalid-props'
});

const OPEN_FENCE = /^:::block(?:[ \t]+(.*?))?[ \t]*$/;
const CLOSE_FENCE = /^:::[ \t]*$/;
const CODE_FENCE = /^([ \t]*)(`{3,}|~{3,})(.*)$/;
const TYPE_TOKEN = /^[A-Za-z][A-Za-z0-9 _-]*$/;

/**
 * Build a warning node.
 *
 * @param {string} code - Member of {@link BLOCK_WARNING_CODES}.
 * @param {string} message - Plain-text explanation; never HTML.
 * @param {Object} extra - Additional fields (`line`, `blockType`, `raw`, `detail`).
 * @returns {Object} Warning node.
 */
function warning(code, message, extra) {
    return { kind: 'warning', code, message, ...extra };
}

/**
 * Split the info line of an opening fence into a type and a diagnosis.
 *
 * @param {string|undefined} info - Text after `:::block` on the opening line.
 * @returns {{type: string|null, code: string|null, detail: string}} Resolution.
 */
function resolveInfoLine(info) {
    const raw = typeof info === 'string' ? info.trim() : '';
    if (!raw) {
        return { type: null, code: BLOCK_WARNING_CODES.MISSING_TYPE, detail: '' };
    }
    if (raw.includes('=')) {
        return { type: null, code: BLOCK_WARNING_CODES.UNEXPECTED_ATTRIBUTES, detail: raw };
    }
    if (!TYPE_TOKEN.test(raw)) {
        return { type: null, code: BLOCK_WARNING_CODES.MALFORMED_TYPE, detail: raw };
    }
    const canonical = canonicaliseBlockType(raw);
    if (canonical === null) {
        return { type: null, code: BLOCK_WARNING_CODES.UNKNOWN_TYPE, detail: raw };
    }
    return { type: canonical, code: null, detail: raw };
}

/**
 * Compose the plain-text message for an info-line failure.
 *
 * @param {{code: string, detail: string}} info - Result of {@link resolveInfoLine}.
 * @param {number} lineNumber - 1-based line of the opening fence.
 * @returns {string} Message text.
 */
function infoMessage(info, lineNumber) {
    switch (info.code) {
        case BLOCK_WARNING_CODES.MISSING_TYPE:
            return `Block at line ${lineNumber} declares no type.`;
        case BLOCK_WARNING_CODES.UNEXPECTED_ATTRIBUTES:
            return `Block at line ${lineNumber} carries attributes ("${info.detail}"); the syntax accepts a single type token.`;
        case BLOCK_WARNING_CODES.UNKNOWN_TYPE:
            return `Block at line ${lineNumber} declares unknown type "${info.detail}".`;
        default:
            return `Block at line ${lineNumber} declares malformed type "${info.detail}".`;
    }
}

/**
 * Flush accumulated prose lines into a single text node.
 *
 * @param {Array<string>} buffer - Pending lines.
 * @param {number} startLine - 1-based line number of `buffer[0]`.
 * @param {Array<Object>} nodes - Node list to append to.
 * @returns {void}
 */
function flushText(buffer, startLine, nodes) {
    if (buffer.length === 0) return;
    nodes.push({ kind: 'text', value: buffer.join('\n'), line: startLine });
    buffer.length = 0;
}

/**
 * Parse markdown source into a block document.
 *
 * The result is plain JSON: `{ version, nodes, warnings }`. `nodes` preserves
 * source order and contains three node kinds:
 *
 * - `{ kind: 'text', value, line }` — prose between blocks, verbatim.
 * - `{ kind: 'block', type, props, line, endLine }` — a well-formed directive
 *   whose payload parsed as a JSON object. Props are *not* validated here;
 *   that is `sanitiseBlockDocument`'s job.
 * - `{ kind: 'warning', code, message, line, blockType?, raw? }` — malformed or
 *   unknown input, preserved for display and repair.
 *
 * `warnings` is a convenience array holding references to the same warning
 * nodes present in `nodes`.
 *
 * Content inside a markdown code fence (``` or ~~~) is treated as prose, so a
 * documented example of the syntax is never executed as a directive.
 *
 * @param {string} source - Markdown source. Any non-string yields an empty document.
 * @returns {{version: number, nodes: Array<Object>, warnings: Array<Object>}} Parsed document.
 */
export function parseBlockDocument(source) {
    const nodes = [];
    if (typeof source !== 'string' || source.length === 0) {
        return { version: BLOCK_DOCUMENT_VERSION, nodes, warnings: [] };
    }

    const lines = source.split('\n');
    const pending = [];
    let pendingStart = 1;
    let codeFence = null;

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const lineNumber = i + 1;

        if (codeFence !== null) {
            pending.push(line);
            const match = CODE_FENCE.exec(line);
            if (match && match[2][0] === codeFence[0] && match[2].length >= codeFence.length && match[3].trim() === '') {
                codeFence = null;
            }
            continue;
        }

        const fenceMatch = CODE_FENCE.exec(line);
        if (fenceMatch) {
            codeFence = fenceMatch[2];
            if (pending.length === 0) pendingStart = lineNumber;
            pending.push(line);
            continue;
        }

        const open = OPEN_FENCE.exec(line);
        if (!open) {
            if (pending.length === 0) pendingStart = lineNumber;
            pending.push(line);
            continue;
        }

        flushText(pending, pendingStart, nodes);
        pendingStart = lineNumber + 1;

        // Collect the payload up to the next line-anchored `:::`.
        const payload = [];
        let closeLine = -1;
        let cursor = i + 1;
        for (; cursor < lines.length; cursor += 1) {
            if (CLOSE_FENCE.test(lines[cursor])) {
                closeLine = cursor + 1;
                break;
            }
            payload.push(lines[cursor]);
        }

        const rawPayload = payload.join('\n');
        const rawSource = closeLine === -1
            ? lines.slice(i).join('\n')
            : lines.slice(i, cursor + 1).join('\n');

        const info = resolveInfoLine(open[1]);

        if (closeLine === -1) {
            nodes.push(warning(
                BLOCK_WARNING_CODES.UNTERMINATED_BLOCK,
                `Block opened at line ${lineNumber} is never closed by a line containing only ":::".`,
                { line: lineNumber, blockType: info.type ?? info.detail, raw: rawSource }
            ));
            break;
        }

        i = cursor;
        pendingStart = closeLine + 1;

        if (info.code !== null) {
            nodes.push(warning(
                info.code,
                infoMessage(info, lineNumber),
                { line: lineNumber, endLine: closeLine, blockType: info.detail, raw: rawSource }
            ));
            continue;
        }

        let parsed;
        try {
            parsed = JSON.parse(rawPayload === '' ? '{}' : rawPayload);
        } catch (error) {
            nodes.push(warning(
                BLOCK_WARNING_CODES.MALFORMED_JSON,
                `Block "${info.type}" at line ${lineNumber} has an invalid JSON payload.`,
                { line: lineNumber, endLine: closeLine, blockType: info.type, raw: rawSource, detail: String(error.message) }
            ));
            continue;
        }

        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            nodes.push(warning(
                BLOCK_WARNING_CODES.PAYLOAD_NOT_OBJECT,
                `Block "${info.type}" at line ${lineNumber} must contain a JSON object.`,
                { line: lineNumber, endLine: closeLine, blockType: info.type, raw: rawSource }
            ));
            continue;
        }

        nodes.push({
            kind: 'block',
            type: info.type,
            props: parsed,
            line: lineNumber,
            endLine: closeLine
        });
    }

    flushText(pending, pendingStart, nodes);
    return {
        version: BLOCK_DOCUMENT_VERSION,
        nodes,
        warnings: nodes.filter(node => node.kind === 'warning')
    };
}

/**
 * Serialise a block document back to markdown source.
 *
 * Warning nodes emit their preserved `raw` source, so a parse/serialise cycle
 * over malformed input is lossless and an editor can present the original text
 * for repair.
 *
 * @param {{nodes: Array<Object>}} document - Document from {@link parseBlockDocument}
 *   or {@link import('./block-sanitiser.js').sanitiseBlockDocument}.
 * @param {Object} [options] - Serialisation options.
 * @param {number} [options.indent=2] - `JSON.stringify` indent for payloads.
 * @returns {string} Markdown source.
 */
export function stringifyBlockDocument(document, options = {}) {
    const indent = Number.isInteger(options.indent) ? options.indent : 2;
    const nodes = Array.isArray(document?.nodes) ? document.nodes : [];
    const parts = [];

    for (const node of nodes) {
        if (node.kind === 'text') {
            parts.push(String(node.value ?? ''));
            continue;
        }
        if (node.kind === 'block') {
            parts.push(`:::block ${node.type}\n${JSON.stringify(node.props ?? {}, null, indent)}\n:::`);
            continue;
        }
        if (node.kind === 'warning' && typeof node.raw === 'string') {
            parts.push(node.raw);
        }
    }
    return parts.join('\n');
}

/**
 * Render a warning node as a single line of plain text.
 *
 * The plan requires an unknown type to be "rendered as a visible warning,
 * never as HTML"; this returns the text a renderer places in a text node.
 *
 * @source blog/docs/site/vercel-dynamic-migration-plan.md §C2 S14 task 2
 * @param {Object} node - Warning node.
 * @returns {string} Plain-text warning, containing no markup.
 */
export function formatBlockWarning(node) {
    if (!node || node.kind !== 'warning') return '';
    return `[block: ${node.code}] ${String(node.message).replace(/[<>&]/g, ' ')}`;
}
