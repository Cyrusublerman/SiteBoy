/**
 * Font Registry — site-wide font catalogue.
 *
 * Two separate catalogues:
 *
 *   UI_STACK   — the Atkinson Hyperlegible stack required for all UI elements
 *                per the workspace rules. Never changes.
 *
 *   CANVAS_FONTS — ordered list of fonts available for canvas/render output
 *                  (OverlayText, defecated, quine, etc.). Fonts in this list are
 *                  served via Google Fonts CSS injection on first load.
 *                  Minimum count: 50 (per plan X-009).
 *
 * Loading strategy: Google Fonts CSS link injected once into <head> on first call
 * to loadFont() or ensureLoaded(). The browser caches the font resources.
 * No bundler dependency — purely runtime fetch from fonts.gstatic.com.
 *
 * Usage:
 *   import { FontRegistry } from '.../typography/font-registry.js';
 *   const stack = FontRegistry.getUIStack();   // → CSS font-family string
 *   const fonts = FontRegistry.listFonts();    // → [{id, family, category, weights}]
 *   await FontRegistry.loadFont('Merriweather'); // ensures CSS is injected
 *   await FontRegistry.ensureLoaded();           // injects all CSS up front
 */

// ── UI Stack ─────────────────────────────────────────────────────────────────

const UI_STACK_STRING = "'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace";

// ── Canvas Font Catalogue ─────────────────────────────────────────────────────

/**
 * @typedef {Object} FontEntry
 * @property {string}   id         - Unique kebab-case identifier
 * @property {string}   family     - Exact Google Fonts family name
 * @property {string}   category   - 'serif'|'sans-serif'|'monospace'|'display'|'handwriting'
 * @property {number[]} weights    - Available weights to request
 */

/** @type {FontEntry[]} */
const CANVAS_FONTS = [
    // Serif
    { id: 'merriweather',         family: 'Merriweather',          category: 'serif',       weights: [400, 700] },
    { id: 'playfair-display',     family: 'Playfair Display',      category: 'serif',       weights: [400, 700] },
    { id: 'lora',                 family: 'Lora',                  category: 'serif',       weights: [400, 700] },
    { id: 'eb-garamond',          family: 'EB Garamond',           category: 'serif',       weights: [400, 700] },
    { id: 'cormorant-garamond',   family: 'Cormorant Garamond',    category: 'serif',       weights: [400, 700] },
    { id: 'libre-baskerville',    family: 'Libre Baskerville',     category: 'serif',       weights: [400, 700] },
    { id: 'pt-serif',             family: 'PT Serif',              category: 'serif',       weights: [400, 700] },
    { id: 'crimson-text',         family: 'Crimson Text',          category: 'serif',       weights: [400, 700] },
    { id: 'source-serif-4',       family: 'Source Serif 4',        category: 'serif',       weights: [400, 700] },
    { id: 'dm-serif-display',     family: 'DM Serif Display',      category: 'serif',       weights: [400] },

    // Sans-serif
    { id: 'inter',                family: 'Inter',                 category: 'sans-serif',  weights: [400, 700] },
    { id: 'roboto',               family: 'Roboto',                category: 'sans-serif',  weights: [400, 700] },
    { id: 'open-sans',            family: 'Open Sans',             category: 'sans-serif',  weights: [400, 700] },
    { id: 'montserrat',           family: 'Montserrat',            category: 'sans-serif',  weights: [400, 700] },
    { id: 'raleway',              family: 'Raleway',               category: 'sans-serif',  weights: [400, 700] },
    { id: 'nunito',               family: 'Nunito',                category: 'sans-serif',  weights: [400, 700] },
    { id: 'source-sans-3',        family: 'Source Sans 3',         category: 'sans-serif',  weights: [400, 700] },
    { id: 'josefin-sans',         family: 'Josefin Sans',          category: 'sans-serif',  weights: [400, 700] },
    { id: 'poppins',              family: 'Poppins',               category: 'sans-serif',  weights: [400, 700] },
    { id: 'work-sans',            family: 'Work Sans',             category: 'sans-serif',  weights: [400, 700] },

    // Monospace
    { id: 'jetbrains-mono',       family: 'JetBrains Mono',        category: 'monospace',   weights: [400, 700] },
    { id: 'fira-code',            family: 'Fira Code',             category: 'monospace',   weights: [400, 700] },
    { id: 'source-code-pro',      family: 'Source Code Pro',       category: 'monospace',   weights: [400, 700] },
    { id: 'ibm-plex-mono',        family: 'IBM Plex Mono',         category: 'monospace',   weights: [400, 700] },
    { id: 'space-mono',           family: 'Space Mono',            category: 'monospace',   weights: [400, 700] },
    { id: 'courier-prime',        family: 'Courier Prime',         category: 'monospace',   weights: [400, 700] },
    { id: 'roboto-mono',          family: 'Roboto Mono',           category: 'monospace',   weights: [400, 700] },
    { id: 'inconsolata',          family: 'Inconsolata',           category: 'monospace',   weights: [400, 700] },
    { id: 'pt-mono',              family: 'PT Mono',               category: 'monospace',   weights: [400] },
    { id: 'ubuntu-mono',          family: 'Ubuntu Mono',           category: 'monospace',   weights: [400, 700] },

    // Display
    { id: 'bebas-neue',           family: 'Bebas Neue',            category: 'display',     weights: [400] },
    { id: 'oswald',               family: 'Oswald',                category: 'display',     weights: [400, 700] },
    { id: 'press-start-2p',       family: 'Press Start 2P',        category: 'display',     weights: [400] },
    { id: 'black-han-sans',       family: 'Black Han Sans',        category: 'display',     weights: [400] },
    { id: 'ultra',                family: 'Ultra',                 category: 'display',     weights: [400] },
    { id: 'abril-fatface',        family: 'Abril Fatface',         category: 'display',     weights: [400] },
    { id: 'righteous',            family: 'Righteous',             category: 'display',     weights: [400] },
    { id: 'fredoka',              family: 'Fredoka',               category: 'display',     weights: [400, 700] },
    { id: 'creepster',            family: 'Creepster',             category: 'display',     weights: [400] },
    { id: 'bangers',              family: 'Bangers',               category: 'display',     weights: [400] },
    { id: 'titan-one',            family: 'Titan One',             category: 'display',     weights: [400] },
    { id: 'russo-one',            family: 'Russo One',             category: 'display',     weights: [400] },
    { id: 'permanent-marker',     family: 'Permanent Marker',      category: 'handwriting', weights: [400] },
    { id: 'boogaloo',             family: 'Boogaloo',              category: 'display',     weights: [400] },

    // Handwriting
    { id: 'dancing-script',       family: 'Dancing Script',        category: 'handwriting', weights: [400, 700] },
    { id: 'pacifico',             family: 'Pacifico',              category: 'handwriting', weights: [400] },
    { id: 'satisfy',              family: 'Satisfy',               category: 'handwriting', weights: [400] },
    { id: 'caveat',               family: 'Caveat',                category: 'handwriting', weights: [400, 700] },
    { id: 'great-vibes',          family: 'Great Vibes',           category: 'handwriting', weights: [400] },
    { id: 'sacramento',           family: 'Sacramento',            category: 'handwriting', weights: [400] },
    { id: 'cookie',               family: 'Cookie',                category: 'handwriting', weights: [400] },
    { id: 'shadows-into-light',   family: 'Shadows Into Light',    category: 'handwriting', weights: [400] },
    { id: 'indie-flower',         family: 'Indie Flower',          category: 'handwriting', weights: [400] },
    { id: 'kalam',                family: 'Kalam',                 category: 'handwriting', weights: [400, 700] },
];

// ── Internal state ────────────────────────────────────────────────────────────

let _googleFontsLoaded = false;
const _loadedSet = new Set();

function _buildGoogleFontsUrl(entries) {
    const params = entries.map(e => {
        const weightStr = e.weights.join(';');
        return `family=${encodeURIComponent(e.family)}:wght@${weightStr}`;
    });
    return `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`;
}

function _injectCSSLink(url) {
    if (document.querySelector(`link[data-font-registry="${url}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.setAttribute('data-font-registry', url);
    document.head.appendChild(link);
}

// ── Public API ────────────────────────────────────────────────────────────────

export const FontRegistry = {
    /**
     * CSS font-family string for all UI elements (immutable).
     * @returns {string}
     */
    getUIStack() {
        return UI_STACK_STRING;
    },

    /**
     * Full ordered list of canvas fonts.
     * @returns {FontEntry[]}
     */
    listFonts() {
        return CANVAS_FONTS.slice();
    },

    /**
     * Fonts filtered by category.
     * @param {'serif'|'sans-serif'|'monospace'|'display'|'handwriting'} category
     * @returns {FontEntry[]}
     */
    listByCategory(category) {
        return CANVAS_FONTS.filter(f => f.category === category);
    },

    /**
     * Return a CSS font-family string for a given font id.
     * Falls back to UI_STACK_STRING if the id is not found.
     * @param {string} id
     * @returns {string}
     */
    getFontStack(id) {
        const entry = CANVAS_FONTS.find(f => f.id === id);
        if (!entry) return UI_STACK_STRING;
        return `'${entry.family}', ${entry.category === 'monospace' ? 'monospace' : 'sans-serif'}`;
    },

    /**
     * Ensure the Google Fonts CSS for ALL catalogue entries is injected.
     * Idempotent — safe to call multiple times.
     */
    ensureLoaded() {
        if (_googleFontsLoaded) return;
        _googleFontsLoaded = true;
        _injectCSSLink(_buildGoogleFontsUrl(CANVAS_FONTS));
    },

    /**
     * Ensure a specific font is loaded by its id.
     * Injects a targeted CSS link if not already done.
     * @param {string} id
     */
    loadFont(id) {
        if (_loadedSet.has(id)) return;
        _loadedSet.add(id);
        const entry = CANVAS_FONTS.find(f => f.id === id);
        if (!entry) {
            console.warn(`FontRegistry: unknown font id "${id}"`);
            return;
        }
        _injectCSSLink(_buildGoogleFontsUrl([entry]));
    },

    /**
     * Total count of registered canvas fonts.
     * @returns {number}
     */
    count() {
        return CANVAS_FONTS.length;
    },
};
