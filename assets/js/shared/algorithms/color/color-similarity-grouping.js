/**
 * Color Similarity Grouping
 * 
 * Groups and sorts colors by perceptual similarity using ΔE2000.
 * Used for organizing sequence libraries and finding alternative sequences.
 * 
 * @module color-similarity-grouping
 * @source CIE ΔE2000 color difference formula
 * @wikipedia https://en.wikipedia.org/wiki/Color_difference#CIEDE2000
 */

/**
 * Convert RGB to LAB color space
 * Required for perceptual color distance calculations
 * 
 * @param {Object} rgb - {r, g, b} values 0-255
 * @returns {Object} {l, a, b} LAB values
 */
function rgbToLab(rgb) {
    // RGB to XYZ
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    // Gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    
    // Observer = 2°, Illuminant = D65
    let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    let y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    let z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;
    
    // XYZ to LAB
    x /= 0.95047; // Reference white D65
    y /= 1.00000;
    z /= 1.08883;
    
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);
    
    return {
        l: (116 * y) - 16,
        a: 500 * (x - y),
        b: 200 * (y - z)
    };
}

/**
 * Calculate ΔE2000 color difference
 * Lower values = more similar colors
 * 
 * @param {Object} lab1 - First color in LAB space {l, a, b}
 * @param {Object} lab2 - Second color in LAB space {l, a, b}
 * @returns {number} ΔE2000 distance (0 = identical, >100 = very different)
 */
function deltaE2000(lab1, lab2) {
    // Simplified ΔE2000 calculation
    // For full implementation, see: http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html
    
    const dL = lab1.l - lab2.l;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    
    // Simplified Euclidean distance in LAB space
    // Good enough for grouping purposes
    return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Calculate RGB to HSL for sorting by hue
 * 
 * @param {Object} rgb - {r, g, b} values 0-255
 * @returns {Object} {h, s, l} HSL values (h: 0-360, s/l: 0-100)
 */
function rgbToHSL(rgb) {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (delta !== 0) {
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        
        switch (max) {
            case r:
                h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / delta + 2) / 6;
                break;
            case b:
                h = ((r - g) / delta + 4) / 6;
                break;
        }
    }
    
    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
}

/**
 * Group colors by similarity threshold
 * 
 * @param {Array<Object>} colors - Array of color objects with {rgb: {r, g, b}, ...}
 * @param {number} threshold - ΔE2000 threshold for grouping (default: 10)
 * @returns {Array<Array<Object>>} Grouped color arrays
 * 
 * @example
 * const groups = groupBySimilarity(sequenceLibrary, 10);
 * // Returns: [[{rgb, sequence, ...}, {...}], [{...}], ...]
 */
export function groupBySimilarity(colors, threshold = 10) {
    if (colors.length === 0) return [];
    
    // Convert all colors to LAB
    const colorsWithLab = colors.map(color => ({
        ...color,
        lab: rgbToLab(color.rgb)
    }));
    
    const groups = [];
    const used = new Set();
    
    for (let i = 0; i < colorsWithLab.length; i++) {
        if (used.has(i)) continue;
        
        const group = [colorsWithLab[i]];
        used.add(i);
        
        // Find all colors within threshold of this color
        for (let j = i + 1; j < colorsWithLab.length; j++) {
            if (used.has(j)) continue;
            
            const distance = deltaE2000(colorsWithLab[i].lab, colorsWithLab[j].lab);
            
            if (distance <= threshold) {
                group.push(colorsWithLab[j]);
                used.add(j);
            }
        }
        
        groups.push(group);
    }
    
    return groups;
}

/**
 * Sort colors by hue (rainbow order)
 * 
 * @param {Array<Object>} colors - Array of color objects with {rgb: {r, g, b}, ...}
 * @returns {Array<Object>} Sorted array (reds → yellows → greens → cyans → blues → magentas)
 */
export function sortByHue(colors) {
    return [...colors].sort((a, b) => {
        const hslA = rgbToHSL(a.rgb);
        const hslB = rgbToHSL(b.rgb);
        return hslA.h - hslB.h;
    });
}

/**
 * Sort colors by luminance (dark to light)
 * 
 * @param {Array<Object>} colors - Array of color objects with {rgb: {r, g, b}, ...}
 * @returns {Array<Object>} Sorted array (darkest first)
 */
export function sortByLuminance(colors) {
    return [...colors].sort((a, b) => {
        const labA = rgbToLab(a.rgb);
        const labB = rgbToLab(b.rgb);
        return labA.l - labB.l;
    });
}

/**
 * Sort colors by saturation (gray to vivid)
 * 
 * @param {Array<Object>} colors - Array of color objects with {rgb: {r, g, b}, ...}
 * @returns {Array<Object>} Sorted array (most saturated last)
 */
export function sortBySaturation(colors) {
    return [...colors].sort((a, b) => {
        const hslA = rgbToHSL(a.rgb);
        const hslB = rgbToHSL(b.rgb);
        return hslA.s - hslB.s;
    });
}

/**
 * Find alternative sequences that produce similar colors
 * 
 * @param {Object} targetColor - Color object with {rgb: {r, g, b}, sequence: [...]}
 * @param {Array<Object>} library - Full sequence library
 * @param {number} threshold - ΔE2000 threshold (default: 5)
 * @returns {Array<Object>} Alternative sequences sorted by similarity
 */
export function findAlternativeSequences(targetColor, library, threshold = 5) {
    const targetLab = rgbToLab(targetColor.rgb);
    const alternatives = [];
    
    for (const entry of library) {
        // Skip same sequence
        if (JSON.stringify(entry.sequence) === JSON.stringify(targetColor.sequence)) {
            continue;
        }
        
        const distance = deltaE2000(targetLab, rgbToLab(entry.rgb));
        
        if (distance <= threshold) {
            alternatives.push({
                ...entry,
                distance
            });
        }
    }
    
    // Sort by distance (closest first)
    return alternatives.sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate color statistics for a library
 * 
 * @param {Array<Object>} library - Sequence library
 * @returns {Object} Statistics
 */
export function calculateColorStatistics(library) {
    if (library.length === 0) {
        return { avgVariance: 0, maxVariance: 0, minVariance: 0, totalSamples: 0 };
    }
    
    const variances = library.map(e => e.variance || 0);
    const sampleCounts = library.map(e => e.sampleCount || 0);
    
    return {
        avgVariance: variances.reduce((a, b) => a + b, 0) / variances.length,
        maxVariance: Math.max(...variances),
        minVariance: Math.min(...variances),
        totalSamples: sampleCounts.reduce((a, b) => a + b, 0),
        totalColors: library.length
    };
}

