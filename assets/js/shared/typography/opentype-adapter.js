/**
 * OpenType Adapter
 *
 * Wraps opentype.js to provide normalised font data for the cursive glyph
 * builder. Exposes glyph outlines as SVG path strings, advance widths, metric
 * bands, kerning pairs, and a SHA-256 hash of the raw font bytes.
 *
 * ARCHITECTURE EXCEPTION: document.createElement is permitted here for
 * off-screen canvas metric measurement only.
 *
 * @module shared/typography/opentype-adapter
 */

import * as opentype from 'opentype.js';

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Return the y position of the xHeight guide in font-unit space.
 * opentype.js exposes tables.os2.sxHeight when available; we fall back to
 * measuring the glyph for 'x' directly.
 *
 * @param {opentype.Font} font
 * @returns {number} y in font units
 */
function _xHeightUnits(font) {
    const os2 = font.tables?.os2;
    if (os2 && os2.sxHeight > 0) return os2.sxHeight;
    const xGlyph = font.charToGlyph('x');
    if (xGlyph && xGlyph.yMax != null) return xGlyph.yMax;
    return Math.round(font.ascender * 0.5);
}

/**
 * Return cap height in font-unit space.
 * @param {opentype.Font} font
 * @returns {number}
 */
function _capHeightUnits(font) {
    const os2 = font.tables?.os2;
    if (os2 && os2.sCapHeight > 0) return os2.sCapHeight;
    const hGlyph = font.charToGlyph('H');
    if (hGlyph && hGlyph.yMax != null) return hGlyph.yMax;
    return Math.round(font.ascender * 0.72);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Load a font from raw bytes (ArrayBuffer) and return an AdapterFont object.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<AdapterFont>}
 */
export async function loadFromBytes(arrayBuffer) {
    if (arrayBuffer.byteLength >= 4) {
        const sig = new DataView(arrayBuffer).getUint32(0);
        // 0x74746366 = 'ttcf' — TrueType Collection; opentype.js cannot parse these.
        if (sig === 0x74746366) {
            throw new Error('TTC font collections are not supported. Upload a single .ttf or .otf file.');
        }
    }
    const font = opentype.parse(arrayBuffer);
    return { _font: font, _bytes: arrayBuffer };
}

/**
 * Load a Google Fonts family by name via fetch (requires network).
 * Obtains the raw TTF bytes from the Google Fonts API CSS response.
 *
 * @param {string} familyName  e.g. 'Roboto'
 * @returns {Promise<AdapterFont>}
 */
export async function loadFromGoogle(familyName) {
    const encoded = encodeURIComponent(familyName);
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encoded}:ital,wght@0,400&display=swap`;

    const cssRes = await fetch(cssUrl);
    if (!cssRes.ok) throw new Error(`Google Fonts CSS fetch failed: ${cssRes.status}`);
    const css = await cssRes.text();

    // Extract the first src url(…) — Google Fonts returns WOFF2 in modern browsers.
    const urlMatch = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (!urlMatch) throw new Error(`No font URL found in Google Fonts CSS for "${familyName}"`);

    // opentype.js does not support WOFF2. Derive the TTF URL from the gstatic
    // CDN path: fonts.gstatic.com serves both formats at consistent paths.
    // WOFF2: https://fonts.gstatic.com/s/name/vN/hash.woff2
    // TTF  : https://fonts.gstatic.com/s/name/vN/hash.ttf
    let fontUrl = urlMatch[1];
    if (fontUrl.endsWith('.woff2')) {
        fontUrl = fontUrl.replace('.woff2', '.ttf');
    } else if (!fontUrl.endsWith('.ttf') && !fontUrl.endsWith('.otf') && !fontUrl.endsWith('.woff')) {
        throw new Error(`Unsupported Google Fonts file format for "${familyName}". Please upload the font file manually.`);
    }

    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) {
        // TTF derivation failed — surface a clear message directing to manual upload
        throw new Error(`Could not fetch TTF for "${familyName}" from Google Fonts. Use the Upload Font button to load the font file manually.`);
    }
    const arrayBuffer = await fontRes.arrayBuffer();
    return loadFromBytes(arrayBuffer);
}

/**
 * Load a local-installed font via Chromium Font Access API (queryLocalFonts).
 *
 * @param {string} familyName CSS font-family (exact FontData.family match).
 * @returns {Promise<AdapterFont>}
 */
export async function loadFromLocal(familyName) {
    if (typeof window.queryLocalFonts !== 'function') {
        throw new Error('Local fonts API unavailable. Upload .ttf/.otf.');
    }
    const fonts = [...await window.queryLocalFonts()];
    const faces = fonts.filter((f) => f.family === familyName);
    if (!faces.length) {
        throw new Error(
            `"${familyName}" not found locally. Upload the font file or pick a Google entry.`,
        );
    }
    /** @type {string} */
    let lastErr = '';
    for (const face of faces) {
        try {
            const blob = await face.blob();
            const ab = await blob.arrayBuffer();
            if (ab.byteLength < 4) continue;

            // Skip TTC (collection) blobs — opentype.js does not support them
            const sig = new DataView(ab).getUint32(0);
            if (sig === 0x74746366) {
                lastErr = `"${familyName}" is a TTC collection. Upload the individual .ttf/.otf file instead.`;
                continue;
            }

            return await loadFromBytes(ab);
        } catch (e) {
            lastErr = /** @type {Error} */(e)?.message ?? String(e);
        }
    }
    throw new Error(lastErr || 'Could not load local font bytes.');
}

/**
 * Extract normalised metric bands from an AdapterFont.
 *
 * All values are in font units (positive = upward from baseline).
 * baseline is always 0.
 *
 * @param {AdapterFont} adapterFont
 * @returns {{ unitsPerEm:number, ascender:number, xHeight:number, capHeight:number, baseline:number, descender:number }}
 */
export function getMetrics(adapterFont) {
    const font = adapterFont._font;
    return {
        unitsPerEm: font.unitsPerEm,
        ascender:   font.ascender,
        xHeight:    _xHeightUnits(font),
        capHeight:  _capHeightUnits(font),
        baseline:   0,
        descender:  font.descender, // negative value
    };
}

/**
 * Get the SVG path string and advance width for a single character.
 *
 * @param {AdapterFont} adapterFont
 * @param {string}      ch          Single character
 * @param {number}      x           X offset in font units (for multi-char strings)
 * @param {number}      y           Baseline Y in font units (pass 0 for glyph-space)
 * @param {number}      fontSize    Point size for scaling
 * @returns {{ d: string, advance: number, exists: boolean }}
 */
export function getGlyphPath(adapterFont, ch, x = 0, y = 0, fontSize = 72) {
    const font  = adapterFont._font;
    const glyph = font.charToGlyph(ch);
    const exists = glyph && glyph.index !== 0;
    if (!exists) return { d: '', advance: 0, exists: false };

    const path    = glyph.getPath(x, y, fontSize);
    const svgPath = path.toPathData(2); // 2 decimal places
    const scale   = fontSize / font.unitsPerEm;
    const advance = glyph.advanceWidth * scale;
    return { d: svgPath, advance, exists: true };
}

/**
 * Return all kerning pairs in the font as an array sorted by |value| descending.
 *
 * @param {AdapterFont} adapterFont
 * @returns {Array<{ left:string, right:string, value:number }>}
 */
export function getKerningPairs(adapterFont) {
    const font = adapterFont._font;
    const pairs = [];

    // opentype.js exposes kerning as font.kerningPairs (object keyed by
    // `glyphIndex1,glyphIndex2`).  We convert to character pairs where
    // possible and skip unmappable pairs.
    const rawPairs = font.kerningPairs;
    if (!rawPairs) return pairs;

    // Build a reverse index: glyphIndex → first Unicode codepoint that maps there
    const indexToChar = new Map();
    for (let cp = 0x20; cp <= 0x7E; cp++) {
        const g = font.charToGlyph(String.fromCodePoint(cp));
        if (g && g.index && !indexToChar.has(g.index)) {
            indexToChar.set(g.index, String.fromCodePoint(cp));
        }
    }

    for (const [key, value] of Object.entries(rawPairs)) {
        const [li, ri] = key.split(',').map(Number);
        const left  = indexToChar.get(li);
        const right = indexToChar.get(ri);
        if (left && right) pairs.push({ left, right, value });
    }

    pairs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    return pairs;
}

/**
 * Compute a SHA-256 hex digest of raw font bytes.
 *
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<string>}  lowercase hex string
 */
export async function hashBytes(arrayBuffer) {
    const hashBuf = await crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(hashBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Return the raw ArrayBuffer stored inside an AdapterFont
 * (needed for ZIP export).
 *
 * @param {AdapterFont} adapterFont
 * @returns {ArrayBuffer}
 */
export function getFontBytes(adapterFont) {
    return adapterFont._bytes;
}

/**
 * Test whether a character has a real glyph (not .notdef) in the font.
 *
 * @param {AdapterFont} adapterFont
 * @param {string}      ch
 * @returns {boolean}
 */
export function hasGlyph(adapterFont, ch) {
    const g = adapterFont._font.charToGlyph(ch);
    return !!(g && g.index !== 0);
}
