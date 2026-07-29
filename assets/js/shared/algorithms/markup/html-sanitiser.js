/**
 * DOM-free HTML sanitiser and URL scheme filter.
 *
 * A hand-rolled tokeniser is used deliberately: the output of this module is a
 * security boundary that must produce byte-identical results in Node (the
 * serverless render path) and in the browser (the admin preview path), so it
 * may not depend on `DOMParser`, `document`, or JSDOM.
 *
 * Policy is default-deny. An element is dropped unless it is named in
 * {@link ALLOWED_ELEMENTS}; an attribute is dropped unless it is named for that
 * element in {@link ALLOWED_ATTRIBUTES}; a URL is dropped unless its scheme is
 * on {@link ALLOWED_URL_SCHEMES} or it is an unambiguously relative reference.
 *
 * @source blog/docs/site/vercel-dynamic-migration-plan.md §C2 S14 task 4
 *         ("Server-side sanitisation pass after HTML expansion … Strip
 *         everything outside the allowlist")
 * @source blog/docs/site/vercel-migration/decisions.md D-11
 * @wikipedia https://en.wikipedia.org/wiki/Cross-site_scripting
 * @section Tokenization — https://html.spec.whatwg.org/multipage/parsing.html#tokenization
 * @module markup/html-sanitiser
 */

/**
 * Elements permitted in sanitised output.
 *
 * @type {ReadonlySet<string>}
 */
export const ALLOWED_ELEMENTS = Object.freeze(new Set([
    'a', 'abbr', 'blockquote', 'br', 'caption', 'code', 'dd', 'del', 'div',
    'dl', 'dt', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5',
    'h6', 'hr', 'i', 'img', 'ins', 'li', 'ol', 'p', 'pre', 's', 'small',
    'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
    'thead', 'tr', 'ul'
]));

/**
 * Elements that never produce output and whose contents are discarded
 * wholesale rather than unwrapped.
 *
 * @type {ReadonlySet<string>}
 */
export const DISCARDED_ELEMENTS = Object.freeze(new Set([
    'applet', 'audio', 'base', 'body', 'button', 'canvas', 'embed', 'form',
    'frame', 'frameset', 'head', 'html', 'iframe', 'input', 'link', 'math',
    'meta', 'noembed', 'noframes', 'noscript', 'object', 'option', 'output',
    'plaintext', 'script', 'select', 'slot', 'style', 'svg', 'template',
    'textarea', 'title', 'video', 'xmp'
]));

/**
 * Elements whose content is CDATA/RCDATA: the tokeniser must run to the
 * matching end tag rather than interpreting `<` inside them.
 *
 * @source https://html.spec.whatwg.org/multipage/parsing.html#rawtext-state
 * @type {ReadonlySet<string>}
 */
const RAW_TEXT_ELEMENTS = Object.freeze(new Set([
    'iframe', 'noembed', 'noframes', 'noscript', 'plaintext', 'script',
    'style', 'textarea', 'title', 'xmp'
]));

/**
 * Elements with no end tag.
 *
 * @type {ReadonlySet<string>}
 */
const VOID_ELEMENTS = Object.freeze(new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
    'meta', 'param', 'source', 'track', 'wbr'
]));

/**
 * Per-element attribute allow-list. Any element not listed permits no
 * attributes at all.
 *
 * @type {Readonly<Object<string, ReadonlyArray<string>>>}
 */
export const ALLOWED_ATTRIBUTES = Object.freeze({
    a: Object.freeze(['href', 'title']),
    abbr: Object.freeze(['title']),
    img: Object.freeze(['alt', 'height', 'src', 'title', 'width']),
    ol: Object.freeze(['start']),
    td: Object.freeze(['colspan', 'rowspan']),
    th: Object.freeze(['colspan', 'rowspan', 'scope'])
});

/**
 * Attributes carrying a URL, and therefore subject to scheme filtering.
 *
 * @type {ReadonlySet<string>}
 */
const URL_ATTRIBUTES = Object.freeze(new Set(['href', 'src']));

/**
 * Schemes permitted in link and media positions.
 *
 * `data:` is denied everywhere, including image sources, because
 * `data:image/svg+xml` is a script-execution vector.
 *
 * @type {ReadonlyArray<string>}
 */
export const ALLOWED_URL_SCHEMES = Object.freeze(['http', 'https', 'mailto']);

/**
 * Attribute values forced onto `<a>` elements that survive sanitisation.
 *
 * @type {Readonly<Object<string, string>>}
 */
const FORCED_ANCHOR_ATTRIBUTES = Object.freeze({ rel: 'noopener noreferrer ugc' });

/** Maximum element nesting retained; deeper elements are unwrapped. */
const MAX_DEPTH = 64;

const NAMED_REFERENCES = Object.freeze({
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
    colon: ':', tab: '\t', newline: '\n', sol: '/', num: '#'
});

/**
 * Escape a string for use as HTML text content.
 *
 * @param {string} value - Raw text.
 * @returns {string} Text safe to place between tags.
 */
export function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Escape a string for use inside a double-quoted attribute value.
 *
 * @param {string} value - Raw attribute value.
 * @returns {string} Text safe between double quotes.
 */
export function escapeAttribute(value) {
    return escapeHtml(value)
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;');
}

/**
 * Remove control characters that browsers ignore when resolving a URL but
 * which attackers use to split a denied scheme (`java\tscript:`, `\0`, and the
 * C0/C1 ranges).
 *
 * @param {string} value - Candidate URL.
 * @returns {string} Value with control characters removed and ends trimmed.
 */
function stripUrlControlCharacters(value) {
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\u0000-\u0020\u007f-\u009f\u200b-\u200f\u2028\u2029\ufeff]/g, '');
}

/**
 * Resolve HTML character references so that `&#106;avascript:` is recognised
 * as `javascript:`. Bounded to three passes to defeat nested encodings without
 * unbounded work.
 *
 * @param {string} value - Candidate URL.
 * @returns {string} Value with numeric and common named references decoded.
 */
function decodeReferences(value) {
    let current = value;
    for (let pass = 0; pass < 3; pass += 1) {
        const next = current
            .replace(/&#[xX]([0-9a-fA-F]{1,6});?/g, (match, hex) => {
                const code = Number.parseInt(hex, 16);
                return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : match;
            })
            .replace(/&#(\d{1,7});?/g, (match, dec) => {
                const code = Number.parseInt(dec, 10);
                return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : match;
            })
            .replace(/&([a-zA-Z]+);/g, (match, name) => {
                const key = name.toLowerCase();
                return Object.hasOwn(NAMED_REFERENCES, key) ? NAMED_REFERENCES[key] : match;
            });
        if (next === current) break;
        current = next;
    }
    return current;
}

/**
 * Filter a URL against the scheme allow-list.
 *
 * Accepts absolute `http`/`https` URLs, `mailto:` when `allowMailto` is set,
 * fragment references, root-relative paths and path-relative references.
 * Rejects every other scheme, protocol-relative `//host` references, and any
 * value whose scheme only becomes visible after decoding.
 *
 * @param {string} raw - Candidate URL from an attribute or block prop.
 * @param {Object} [options] - Filter options.
 * @param {boolean} [options.allowMailto=true] - Permit `mailto:` targets.
 * @param {boolean} [options.allowAbsolute=true] - Permit absolute http/https URLs.
 * @param {ReadonlyArray<string>} [options.hostAllowList] - When supplied, an
 *   absolute URL is accepted only if its host is listed (exact, case-insensitive).
 * @returns {string|null} A cleaned URL, or `null` when denied.
 */
export function sanitiseUrl(raw, options = {}) {
    if (typeof raw !== 'string') return null;
    const {
        allowMailto = true,
        allowAbsolute = true,
        hostAllowList = null
    } = options;

    const cleaned = stripUrlControlCharacters(decodeReferences(raw));
    if (!cleaned) return null;
    // A backslash has no legitimate unescaped place in a URL, and the URL
    // standard folds it to `/` for special schemes: `\\evil.test\x` resolves as
    // the protocol-relative `//evil.test/x`.
    if (cleaned.includes('\\')) return null;
    if (cleaned.startsWith('//')) return null;

    const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(cleaned);
    if (!schemeMatch) {
        // Relative reference. Reject anything that could be read as a scheme
        // by a lenient parser (a bare colon before the first path separator).
        const firstSeparator = cleaned.search(/[/?#]/);
        const head = firstSeparator === -1 ? cleaned : cleaned.slice(0, firstSeparator);
        if (head.includes(':')) return null;
        return cleaned;
    }

    const scheme = schemeMatch[1].toLowerCase();
    if (!ALLOWED_URL_SCHEMES.includes(scheme)) return null;
    if (scheme === 'mailto') return allowMailto ? cleaned : null;
    if (!allowAbsolute) return null;

    if (hostAllowList) {
        const hostMatch = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/([^/?#]*)/.exec(cleaned);
        if (!hostMatch) return null;
        const authority = hostMatch[1].toLowerCase();
        if (authority.includes('@')) return null;
        const host = authority.replace(/:\d+$/, '');
        const permitted = hostAllowList.some(entry => String(entry).toLowerCase() === host);
        if (!permitted) return null;
    }
    return cleaned;
}

/**
 * Read a start-tag attribute list.
 *
 * @param {string} input - Full source string.
 * @param {number} start - Index just past the tag name.
 * @returns {{attributes: Array<{name: string, value: string}>, index: number, selfClosing: boolean, terminated: boolean}}
 *   Parsed attributes and the index just past the closing `>`.
 */
function readAttributes(input, start) {
    const attributes = [];
    let index = start;
    let selfClosing = false;

    while (index < input.length) {
        while (index < input.length && /[\s/]/.test(input[index])) {
            if (input[index] === '/') selfClosing = true;
            else selfClosing = false;
            index += 1;
        }
        if (index >= input.length) return { attributes, index, selfClosing, terminated: false };
        if (input[index] === '>') return { attributes, index: index + 1, selfClosing, terminated: true };

        selfClosing = false;
        let nameEnd = index;
        while (nameEnd < input.length && !/[\s/>=]/.test(input[nameEnd])) nameEnd += 1;
        const name = input.slice(index, nameEnd).toLowerCase();
        index = nameEnd;

        while (index < input.length && /\s/.test(input[index])) index += 1;
        let value = '';
        if (input[index] === '=') {
            index += 1;
            while (index < input.length && /\s/.test(input[index])) index += 1;
            const quote = input[index];
            if (quote === '"' || quote === "'") {
                const close = input.indexOf(quote, index + 1);
                if (close === -1) return { attributes, index: input.length, selfClosing, terminated: false };
                value = input.slice(index + 1, close);
                index = close + 1;
            } else {
                let valueEnd = index;
                while (valueEnd < input.length && !/[\s>]/.test(input[valueEnd])) valueEnd += 1;
                value = input.slice(index, valueEnd);
                index = valueEnd;
            }
        }
        if (name) attributes.push({ name, value });
    }
    return { attributes, index, selfClosing, terminated: false };
}

/**
 * Skip past a raw-text element's content and its end tag.
 *
 * @param {string} input - Full source string.
 * @param {number} start - Index just past the start tag.
 * @param {string} name - Lower-cased element name.
 * @returns {number} Index just past the end tag, or the input length.
 */
function skipRawText(input, start, name) {
    const pattern = new RegExp(`</${name}(?:[\\s/>]|$)`, 'gi');
    pattern.lastIndex = start;
    const match = pattern.exec(input);
    if (!match) return input.length;
    const tagEnd = input.indexOf('>', match.index);
    return tagEnd === -1 ? input.length : tagEnd + 1;
}

/**
 * Skip a discarded element's subtree by counting same-named start tags.
 *
 * @param {string} input - Full source string.
 * @param {number} start - Index just past the start tag.
 * @param {string} name - Lower-cased element name.
 * @returns {number} Index just past the matching end tag, or the input length.
 */
function skipSubtree(input, start, name) {
    const pattern = new RegExp(`<(/?)${name}(?=[\\s/>])`, 'gi');
    pattern.lastIndex = start;
    let depth = 1;
    let match = pattern.exec(input);
    while (match) {
        depth += match[1] === '/' ? -1 : 1;
        if (depth === 0) {
            const tagEnd = input.indexOf('>', match.index);
            return tagEnd === -1 ? input.length : tagEnd + 1;
        }
        match = pattern.exec(input);
    }
    return input.length;
}

/**
 * Decide the surviving attribute list for an allowed element.
 *
 * @param {string} name - Lower-cased element name.
 * @param {Array<{name: string, value: string}>} attributes - Parsed attributes.
 * @param {Object} options - Sanitiser options (see {@link sanitiseHtml}).
 * @returns {Array<{name: string, value: string}>|null} Surviving attributes, or
 *   `null` when the element must be dropped outright (a required URL was denied).
 */
function filterAttributes(name, attributes, options) {
    const permitted = ALLOWED_ATTRIBUTES[name] ?? [];
    const kept = [];
    let urlDenied = false;

    for (const attribute of attributes) {
        if (!permitted.includes(attribute.name)) continue;
        if (URL_ATTRIBUTES.has(attribute.name)) {
            const url = sanitiseUrl(attribute.value, {
                allowMailto: attribute.name === 'href',
                hostAllowList: attribute.name === 'src' ? options.mediaHostAllowList : null
            });
            if (url === null) {
                urlDenied = true;
                continue;
            }
            kept.push({ name: attribute.name, value: url });
            continue;
        }
        kept.push({ name: attribute.name, value: attribute.value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '') });
    }

    // An <img> without a usable src is a husk; drop it. An <a> whose href was
    // denied keeps its text but loses the link.
    if (name === 'img' && !kept.some(attribute => attribute.name === 'src')) return null;
    if (urlDenied && name === 'img') return null;

    if (name === 'a') {
        if (!kept.some(attribute => attribute.name === 'href')) return kept;
        for (const [forcedName, forcedValue] of Object.entries(FORCED_ANCHOR_ATTRIBUTES)) {
            kept.push({ name: forcedName, value: forcedValue });
        }
    }
    return kept;
}

/**
 * Serialise a surviving start tag.
 *
 * @param {string} name - Lower-cased element name.
 * @param {Array<{name: string, value: string}>} attributes - Surviving attributes.
 * @param {boolean} isVoid - Whether the element is void.
 * @returns {string} Serialised tag.
 */
function serialiseTag(name, attributes) {
    const parts = attributes.map(a => ` ${a.name}="${escapeAttribute(a.value)}"`).join('');
    return `<${name}${parts}>`;
}

/**
 * Sticky matcher for a tag name immediately after `<` or `</`, matching the
 * HTML tag-name state: everything up to whitespace, `/` or `>`.
 *
 * @source https://html.spec.whatwg.org/multipage/parsing.html#tag-name-state
 */
const TAG_NAME_RE = /[a-zA-Z][^\s/>]*/y;

/** Sticky matcher restricted to conformant ASCII element names. */
const STRICT_TAG_NAME_RE = /[a-zA-Z][a-zA-Z0-9-]*/y;

/**
 * Read the tag name starting at `index`.
 *
 * @param {string} input - Full source string.
 * @param {number} index - Index of the first name character.
 * @param {boolean} strict - Require a conformant element name followed by a
 *   tag-name terminator. Used for markdown input so that a CommonMark autolink
 *   (`<https://example.test>`) is not mistaken for an element.
 * @returns {string|null} Raw name, or `null` when no name is present.
 */
function readTagName(input, index, strict) {
    const pattern = strict ? STRICT_TAG_NAME_RE : TAG_NAME_RE;
    pattern.lastIndex = index;
    const match = pattern.exec(input);
    if (!match) return null;
    if (strict) {
        const terminator = input[index + match[0].length];
        if (terminator !== undefined && !/[\s/>]/.test(terminator)) return null;
    }
    return match[0];
}

/**
 * Attribute names that carry a URL or markup payload when a browser reparses
 * a loose (non-conformant) tag. Used only by {@link readLooseTag}: the tag-name
 * matcher stops at `/`, so a CommonMark autolink `<https://host/path?x=1>` is
 * tokenised as name `https:` plus path fragments as attributes — those
 * fragments must not be treated as dangerous, but a real `href`/`src`/…
 * attribute must.
 *
 * @type {ReadonlySet<string>}
 */
const LOOSE_URL_ATTRIBUTES = Object.freeze(new Set([
    'action', 'background', 'cite', 'codebase', 'data', 'formaction', 'href',
    'icon', 'poster', 'src', 'srcdoc', 'xlink:href'
]));

/**
 * Whether a loose-tag attribute is an execution or navigation sink.
 *
 * @param {string} attributeName - Lower-cased attribute name.
 * @param {string} attributeValue - Raw attribute value.
 * @returns {boolean} True when the attribute must force the tag to be escaped.
 */
function isDangerousLooseAttribute(attributeName, attributeValue) {
    // A NUL in an attribute name becomes U+FFFD in the parser rather than
    // splitting the name, so it must not hide `onclick` / `href`.
    // eslint-disable-next-line no-control-regex
    const folded = attributeName.replace(/\u0000/g, '');
    if (folded === 'style' || /^on[a-z]+$/.test(folded)) return true;
    if (LOOSE_URL_ATTRIBUTES.has(folded) || folded.endsWith(':href')) return true;
    const decoded = stripUrlControlCharacters(decodeReferences(attributeValue)).toLowerCase();
    return /^(?:javascript|vbscript|data):/.test(decoded);
}

/**
 * Read a `<` that strict tag-name matching rejected.
 *
 * The tag-name state ends only at whitespace, `/` or `>`, so the parser opens
 * a tag on `<` followed by any ASCII letter: `<p"x onmouseover=…>` becomes an
 * unknown element carrying a live handler even though `p"x` is not a
 * conformant element name. A CommonMark autolink (`<https://example.test/a>`)
 * has the same shape; path segments after `https:` are misread as attributes
 * and must survive, but `on*` / `style` / URL attributes (and values that
 * decode to a denied scheme) are escaped — including
 * `<https://x href=javascript:…>`, which is a live sink when a `text` prop is
 * later parsed as HTML.
 *
 * @source https://html.spec.whatwg.org/multipage/parsing.html#tag-name-state
 * @param {string} input - Full source string.
 * @param {number} start - Index of the `<`.
 * @returns {{text: string, index: number}} Replacement text and resume index.
 */
function readLooseTag(input, start) {
    const name = readTagName(input, start + 1, false);
    if (name === null) return { text: '<', index: start + 1 };

    const parsed = readAttributes(input, start + 1 + name.length);
    const end = parsed.terminated ? parsed.index : input.length;
    const raw = input.slice(start, end);
    const dangerous = parsed.attributes.some(({ name: attributeName, value }) => (
        isDangerousLooseAttribute(attributeName, value)
    ));

    // Every `<` in the run is escaped, not just the first: a quoted attribute
    // value may hold markup that only the outer tag was keeping inert.
    return dangerous ? { text: raw.replace(/</g, '&lt;'), index: end } : { text: raw, index: end };
}

/**
 * Core tokeniser shared by {@link sanitiseHtml} and {@link stripHtml}.
 *
 * @param {string} input - Untrusted HTML.
 * @param {Object} options - Behaviour flags.
 * @param {boolean} options.emitElements - Emit allowed elements, or drop all markup.
 * @param {boolean} options.escapeText - Escape surviving text nodes.
 * @param {boolean} options.strictNames - Only treat conformant element names as tags.
 * @param {ReadonlyArray<string>|null} options.mediaHostAllowList - Host allow-list for `src`.
 * @returns {string} Sanitised output.
 */
function tokenise(input, options) {
    const source = String(input);
    const output = [];
    const stack = [];
    let index = 0;

    const emitText = (value) => {
        if (!value) return;
        output.push(options.escapeText ? escapeHtml(value) : value);
    };

    while (index < source.length) {
        const next = source.indexOf('<', index);
        if (next === -1) {
            emitText(source.slice(index));
            break;
        }
        emitText(source.slice(index, next));

        const after = source.slice(next + 1, next + 4);
        if (after.startsWith('!--')) {
            const close = source.indexOf('-->', next + 4);
            index = close === -1 ? source.length : close + 3;
            continue;
        }
        if (after.startsWith('!') || after.startsWith('?')) {
            const close = source.indexOf('>', next + 1);
            index = close === -1 ? source.length : close + 1;
            continue;
        }
        if (after.startsWith('/')) {
            const rawName = readTagName(source, next + 2, false);
            const close = source.indexOf('>', next + 1);
            index = close === -1 ? source.length : close + 1;
            if (rawName) {
                const depth = stack.lastIndexOf(rawName.toLowerCase());
                if (depth !== -1) {
                    while (stack.length > depth) output.push(`</${stack.pop()}>`);
                }
            }
            continue;
        }

        const rawName = readTagName(source, next + 1, options.strictNames);
        if (!rawName) {
            // In non-strict mode this is always a bare `<`, which `emitText`
            // escapes; in strict mode it is the loose-tag run, already inert.
            const loose = readLooseTag(source, next);
            emitText(loose.text);
            index = loose.index;
            continue;
        }

        const name = rawName.toLowerCase();
        const parsed = readAttributes(source, next + 1 + rawName.length);
        index = parsed.index;
        if (!parsed.terminated) break;

        if (RAW_TEXT_ELEMENTS.has(name)) {
            index = skipRawText(source, index, name);
            continue;
        }
        if (DISCARDED_ELEMENTS.has(name)) {
            if (!VOID_ELEMENTS.has(name) && !parsed.selfClosing) index = skipSubtree(source, index, name);
            continue;
        }
        if (!options.emitElements || !ALLOWED_ELEMENTS.has(name) || stack.length >= MAX_DEPTH) {
            continue; // unwrap: markup dropped, children still processed
        }

        const attributes = filterAttributes(name, parsed.attributes, options);
        if (attributes === null) continue;

        const isVoid = VOID_ELEMENTS.has(name);
        output.push(serialiseTag(name, attributes));
        if (!isVoid && !parsed.selfClosing) stack.push(name);
    }

    while (stack.length) output.push(`</${stack.pop()}>`);
    return output.join('');
}

/**
 * Sanitise an HTML fragment against the element, attribute and URL allow-lists.
 *
 * Elements outside {@link ALLOWED_ELEMENTS} are unwrapped (their markup is
 * removed, their text survives escaped) except for {@link DISCARDED_ELEMENTS},
 * whose entire subtree is discarded. Text is HTML-escaped, so no surviving
 * content can reopen a tag.
 *
 * @param {string} input - Untrusted HTML.
 * @param {Object} [options] - Sanitiser options.
 * @param {ReadonlyArray<string>|null} [options.mediaHostAllowList=null] - When
 *   supplied, absolute `src` URLs are accepted only for these hosts.
 * @returns {string} Sanitised HTML.
 */
export function sanitiseHtml(input, options = {}) {
    return tokenise(input, {
        emitElements: true,
        escapeText: true,
        strictNames: false,
        mediaHostAllowList: options.mediaHostAllowList ?? null
    });
}

/**
 * Remove all HTML markup from a string while leaving the remaining text
 * unescaped.
 *
 * Used for markdown-bearing fields, where escaping would corrupt the source
 * before the markdown renderer runs. Tag recognition is restricted to
 * conformant element names so that CommonMark autolinks survive; any residual
 * angle bracket is caught downstream, because the renderer's HTML output must
 * still pass through {@link sanitiseHtml} before reaching a page.
 *
 * @param {string} input - Untrusted markdown or plain text.
 * @returns {string} Text with tags, comments and dangerous subtrees removed.
 */
export function stripHtml(input) {
    return tokenise(input, {
        emitElements: false,
        escapeText: false,
        strictNames: true,
        mediaHostAllowList: null
    });
}
