/**
 * `:::block` type registry — closed allow-list of directive types and prop schemas.
 *
 * Pure data plus pure predicates. No DOM, no side effects. Consumed by the
 * parser (to classify unknown types) and by the sanitiser (to validate props).
 *
 * The registry is default-deny: a type absent from `BLOCK_TYPES` is never a
 * block, and a prop absent from a type's `props` map is never carried through.
 *
 * @source blog/docs/site/vercel-dynamic-migration-plan.md §B3.4 "Insert toolbar"
 * @source blog/docs/site/vercel-dynamic-migration-plan.md §B3.5 "Block model"
 * @source blog/docs/site/vercel-dynamic-migration-plan.md §C2 S14 task 3
 *         ("Per-block allowlist of types maps to existing ComponentLibrary
 *         classes plus the new embed blocks (Gallery, Carousel, IFrame, P5,
 *         Algorithm, Graph, VGAGrid)")
 * @source blog/docs/site/vercel-migration/decisions.md D-11
 *         (strict same-origin policy plus explicit media/embed allowlists)
 * @module markup/block-types
 */

/**
 * Sandbox tokens permitted on an `iframe` block.
 *
 * `allow-same-origin` is listed but is removed by the sanitiser whenever
 * `allow-scripts` is also present, because the pair is equivalent to no
 * sandbox at all for a same-origin frame.
 *
 * @source https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-sandbox
 * @type {ReadonlyArray<string>}
 */
export const IFRAME_SANDBOX_TOKENS = Object.freeze([
    'allow-downloads',
    'allow-forms',
    'allow-modals',
    'allow-popups',
    'allow-popups-to-escape-sandbox',
    'allow-presentation',
    'allow-same-origin',
    'allow-scripts'
]);

/**
 * The sixteen VGA palette entries, as the only colour values a block may name.
 *
 * @source .cursorrules § "Colors — ONLY VGA Palette Variables"
 * @wikipedia https://en.wikipedia.org/wiki/Video_Graphics_Array
 * @type {ReadonlyArray<string>}
 */
export const VGA_PALETTE = Object.freeze([
    '#000000', '#800000', '#008000', '#808000',
    '#000080', '#800080', '#008080', '#c0c0c0',
    '#808080', '#ff0000', '#00ff00', '#ffff00',
    '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
]);

/**
 * Prop schema kinds understood by the block sanitiser.
 *
 * - `text`        plain single-line-ish string; control characters removed
 * - `markdown`    markdown source; HTML markup stripped, text left unescaped
 * - `slug`        `[a-z0-9]` separated by `-` or `/`
 * - `identifier`  ECMAScript identifier (an algorithm export name)
 * - `asset-path`  repository-relative path; no scheme, no `..`, no leading `/`
 * - `url`         http/https/relative link target
 * - `embed-url`   same-origin relative path, or https host on the embed allow-list
 * - `integer`     finite integer within `[min, max]`
 * - `number`      finite number within `[min, max]`
 * - `boolean`     strict boolean
 * - `enum`        member of `values`
 * - `token-set`   array of unique members of `values`
 * - `palette-index` integer index into {@link VGA_PALETTE}
 * - `array`       array of `item` schemas, capped by `maxItems`
 * - `record`      object with a fixed `fields` map
 * - `params`      flat map of identifier keys to JSON primitives or primitive arrays
 *
 * @type {ReadonlyArray<string>}
 */
export const SCHEMA_KINDS = Object.freeze([
    'text', 'markdown', 'slug', 'identifier', 'asset-path', 'url', 'embed-url',
    'integer', 'number', 'boolean', 'enum', 'token-set', 'palette-index',
    'array', 'record', 'params'
]);

const text = (maxLength = 240) => ({ kind: 'text', maxLength });
const dimension = () => ({ kind: 'integer', min: 16, max: 4096 });

/**
 * Closed registry of `:::block` types.
 *
 * Each entry records the `ComponentLibrary` class the public renderer
 * instantiates and the complete set of props the sanitiser will carry through.
 * `requireAny` (when present) demands at least one of the named props survive
 * validation.
 *
 * @type {Readonly<Object<string, Object>>}
 */
export const BLOCK_TYPES = Object.freeze({
    gallery: {
        component: 'MasonryGallery',
        source: 'assets/js/shared/masonry-gallery.js',
        props: {
            slug: { kind: 'slug', required: true },
            title: text(),
            limit: { kind: 'integer', min: 1, max: 500 }
        }
    },
    carousel: {
        component: 'Carousel',
        source: 'assets/js/shared/components/interactive.js',
        requireAny: ['slug', 'items'],
        props: {
            slug: { kind: 'slug' },
            title: text(),
            items: {
                kind: 'array',
                maxItems: 100,
                item: {
                    kind: 'record',
                    fields: {
                        src: { kind: 'url', required: true },
                        alt: text(),
                        caption: text(400)
                    }
                }
            }
        }
    },
    collapsible: {
        component: 'CollapsibleSection',
        source: 'assets/js/shared/components/interactive.js',
        props: {
            title: { kind: 'text', maxLength: 240, required: true },
            body: { kind: 'markdown', maxLength: 20000 },
            open: { kind: 'boolean' }
        }
    },
    iframe: {
        component: 'IFrameEmbed',
        source: 'assets/js/shared/component-library.js',
        props: {
            src: { kind: 'embed-url', required: true },
            title: { kind: 'text', maxLength: 240, required: true },
            width: dimension(),
            height: dimension(),
            sandbox: { kind: 'token-set', values: IFRAME_SANDBOX_TOKENS },
            loading: { kind: 'enum', values: ['lazy', 'eager'] }
        }
    },
    p5: {
        component: 'P5Canvas',
        source: 'assets/js/shared/p5-integration.js',
        props: {
            sketch: { kind: 'asset-path', extensions: ['.js'], required: true },
            title: text(),
            width: dimension(),
            height: dimension(),
            controlled: { kind: 'boolean' }
        }
    },
    algorithm: {
        component: 'MathematicalCanvas',
        source: 'assets/js/shared/components/specialized.js',
        props: {
            module: { kind: 'asset-path', extensions: ['.js'], prefix: 'assets/js/shared/algorithms/', required: true },
            export: { kind: 'identifier', required: true },
            params: { kind: 'params', maxKeys: 64, maxItems: 256 },
            title: text(),
            width: dimension(),
            height: dimension()
        }
    },
    graph: {
        component: 'BarGraph|LineGraph|PieGraph',
        source: 'assets/js/shared/components/graphs.js',
        props: {
            variant: { kind: 'enum', values: ['bar', 'line', 'pie'], required: true },
            data: {
                kind: 'array',
                maxItems: 500,
                required: true,
                item: {
                    kind: 'record',
                    fields: {
                        label: { kind: 'text', maxLength: 120, required: true },
                        value: { kind: 'number', min: -1e12, max: 1e12, required: true }
                    }
                }
            },
            title: text(),
            xLabel: text(120),
            yLabel: text(120)
        }
    },
    'vga-grid': {
        component: 'VGAGrid',
        source: 'assets/js/shared/components/specialized.js',
        props: {
            columns: { kind: 'integer', min: 1, max: 256, required: true },
            rows: { kind: 'integer', min: 1, max: 256, required: true },
            cells: { kind: 'array', maxItems: 65536, required: true, item: { kind: 'palette-index' } },
            title: text()
        }
    }
});

/**
 * Canonical type names, sorted, for stable diagnostics.
 *
 * @type {ReadonlyArray<string>}
 */
export const BLOCK_TYPE_NAMES = Object.freeze(Object.keys(BLOCK_TYPES).sort());

/**
 * Aliases accepted on the `:::block <type>` info line.
 *
 * Present so the human-authored names used in §B3.4 (`GalleryEmbed`,
 * `Dropdown section`, `VGA grid`, …) resolve to canonical registry keys.
 * Matching is case-insensitive and ignores separators.
 *
 * @source blog/docs/site/vercel-dynamic-migration-plan.md §B3.4
 * @type {Readonly<Object<string, string>>}
 */
export const BLOCK_TYPE_ALIASES = Object.freeze({
    galleryembed: 'gallery',
    carouselembed: 'carousel',
    collapsiblesection: 'collapsible',
    dropdown: 'collapsible',
    dropdownsection: 'collapsible',
    p5embed: 'p5',
    p5sketch: 'p5',
    algorithmwidget: 'algorithm',
    vgagrid: 'vga-grid'
});

/**
 * Resolve an info-line type token to its canonical registry key.
 *
 * @param {string} token - Raw type token from `:::block <type>`.
 * @returns {string|null} Canonical type name, or `null` if unknown.
 */
export function canonicaliseBlockType(token) {
    if (typeof token !== 'string') return null;
    const lower = token.trim().toLowerCase();
    if (!lower) return null;
    if (Object.hasOwn(BLOCK_TYPES, lower)) return lower;
    const squashed = lower.replace(/[\s_-]+/g, '');
    if (Object.hasOwn(BLOCK_TYPE_ALIASES, squashed)) return BLOCK_TYPE_ALIASES[squashed];
    return null;
}

/**
 * Predicate: is `token` a recognised block type (canonical name or alias)?
 *
 * @param {string} token - Raw type token.
 * @returns {boolean} True when the token resolves to a registry entry.
 */
export function isKnownBlockType(token) {
    return canonicaliseBlockType(token) !== null;
}

/**
 * Look up the schema for a canonical or aliased type name.
 *
 * @param {string} token - Raw type token.
 * @returns {Object|null} Frozen schema entry, or `null` when unknown.
 */
export function getBlockSchema(token) {
    const name = canonicaliseBlockType(token);
    return name === null ? null : BLOCK_TYPES[name];
}
