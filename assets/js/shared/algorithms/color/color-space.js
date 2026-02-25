/**
 * Color Space Conversion — sRGB ↔ LAB
 * 
 * Provides perceptually uniform color space conversions for accurate
 * color distance calculations. Uses CIE LAB color space with D65 white point.
 * 
 * @module algorithms/color/color-space
 * @source reference/tools/New folder/colour3/src/script.js (ColorSpaceConverter class)
 * @wikipedia https://en.wikipedia.org/wiki/CIELAB_color_space
 * @formula sRGB → Linear: v ≤ 0.04045 ? v/12.92 : ((v+0.055)/1.055)^2.4
 * @formula Linear → XYZ: Standard sRGB D65 matrix
 * @formula XYZ → LAB: L* = 116f(Y/Yn) - 16, a* = 500[f(X/Xn) - f(Y/Yn)], b* = 200[f(Y/Yn) - f(Z/Zn)]
 *          where f(t) = t^(1/3) if t > ε, else (κt + 16)/116
 */

// D65 reference white point (standard for sRGB)
const WHITE_REFERENCE = { X: 0.95047, Y: 1.0, Z: 1.08883 };

// CIE standard thresholds
const EPSILON = 0.008856;  // (6/29)^3
const KAPPA = 903.3;       // (29/3)^3

// Cache for expensive conversions
const conversionCache = new Map();
const MAX_CACHE_SIZE = 10000;

/**
 * Convert hex color to RGB
 * 
 * @param {string} hex - Hex color (#RGB, #RRGGBB, or RRGGBB)
 * @returns {{r: number, g: number, b: number}} RGB values 0-255
 * 
 * @example
 * hexToRgb('#FF5500') // { r: 255, g: 85, b: 0 }
 */
export function hexToRgb(hex) {
    const key = `hex-${hex}`;
    if (conversionCache.has(key)) return conversionCache.get(key);

    const c = hex.startsWith("#") ? hex.slice(1) : hex;
    let fullHex = c;
    
    // Expand shorthand (#RGB → #RRGGBB)
    if (c.length === 3) {
        fullHex = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    
    // Validate hex
    if (fullHex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(fullHex)) {
        console.warn(`Invalid hex: ${hex}. Defaulting to black.`);
        fullHex = '000000';
    }

    const rgb = {
        r: parseInt(fullHex.slice(0, 2), 16),
        g: parseInt(fullHex.slice(2, 4), 16),
        b: parseInt(fullHex.slice(4, 6), 16)
    };
    
    // Cache management
    if (conversionCache.size > MAX_CACHE_SIZE) {
        const firstKey = conversionCache.keys().next().value;
        conversionCache.delete(firstKey);
    }
    conversionCache.set(key, rgb);
    
    return rgb;
}

/**
 * Convert RGB to LAB color space
 * 
 * @param {number} r - Red 0-255
 * @param {number} g - Green 0-255
 * @param {number} b - Blue 0-255
 * @returns {{L: number, a: number, b: number}} LAB values (L: 0-100, a/b: ±128)
 * 
 * @example
 * rgbToLab(255, 85, 0) // { L: 55.7, a: 52.3, b: 67.2 }
 */
export function rgbToLab(r, g, b) {
    const key = `rgb-${r}-${g}-${b}`;
    if (conversionCache.has(key)) return conversionCache.get(key);

    // Ensure valid inputs
    r = Number.isFinite(r) ? r : 0;
    g = Number.isFinite(g) ? g : 0;
    b = Number.isFinite(b) ? b : 0;

    // sRGB → Linear RGB
    const [lr, lg, lb] = srgbToLinear([r, g, b]);
    
    // Linear RGB → XYZ
    const [X, Y, Z] = linearToXyz([lr, lg, lb]);
    
    // XYZ → LAB
    const lab = xyzToLab(X, Y, Z);

    // Cache management
    if (conversionCache.size > MAX_CACHE_SIZE) {
        const firstKey = conversionCache.keys().next().value;
        conversionCache.delete(firstKey);
    }
    conversionCache.set(key, lab);
    
    return lab;
}

/**
 * Convert LAB to RGB color space
 * 
 * @param {number} L - Lightness 0-100
 * @param {number} a - Green-red axis ±128
 * @param {number} b_lab - Blue-yellow axis ±128
 * @returns {{r: number, g: number, b: number}} RGB values 0-255
 * 
 * @example
 * labToRgb(55.7, 52.3, 67.2) // { r: 255, g: 85, b: 0 }
 */
export function labToRgb(L, a, b_lab) {
    const key = `lab-${L}-${a}-${b_lab}`;
    if (conversionCache.has(key)) return conversionCache.get(key);

    L = Number.isFinite(L) ? L : 0;
    a = Number.isFinite(a) ? a : 0;
    b_lab = Number.isFinite(b_lab) ? b_lab : 0;

    // LAB → XYZ
    const { X, Y, Z } = labToXyz(L, a, b_lab);
    
    // XYZ → Linear RGB
    const [lr, lg, lb] = xyzToLinear(X, Y, Z);
    
    // Linear RGB → sRGB
    const [r, g, b] = linearToSrgb([lr, lg, lb]);

    const rgb = { r, g, b };
    
    // Cache management
    if (conversionCache.size > MAX_CACHE_SIZE) {
        const firstKey = conversionCache.keys().next().value;
        conversionCache.delete(firstKey);
    }
    conversionCache.set(key, rgb);
    
    return rgb;
}

/**
 * Calculate Delta E (CIE76) color difference
 * 
 * @param {{L: number, a: number, b: number}} lab1 - First LAB color
 * @param {{L: number, a: number, b: number}} lab2 - Second LAB color
 * @returns {number} Perceptual distance (0 = identical, >2.3 = noticeable)
 * 
 * @source https://en.wikipedia.org/wiki/Color_difference#CIE76
 * @formula ΔE*ab = √((ΔL*)² + (Δa*)² + (Δb*)²)
 * 
 * @example
 * deltaE76(lab1, lab2) // 5.2 (noticeable difference)
 */
export function deltaE76(lab1, lab2) {
    if (!lab1 || !lab2) return Infinity;
    const dL = lab1.L - lab2.L;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    return Math.sqrt(dL * dL + da * da + db * db);
}

// ═══════════════════════════════════════════════════════════════════
// VECTOR MATH HELPERS (for LAB space operations)
// ═══════════════════════════════════════════════════════════════════

/**
 * Vector dot product in LAB space
 * @param {{L: number, a: number, b: number}} vA
 * @param {{L: number, a: number, b: number}} vB
 * @returns {number}
 */
export function vecDot(vA, vB) {
    return (vA.L * vB.L) + (vA.a * vB.a) + (vA.b * vB.b);
}

/**
 * Vector subtraction
 * @param {{L: number, a: number, b: number}} vA
 * @param {{L: number, a: number, b: number}} vB
 * @returns {{L: number, a: number, b: number}}
 */
export function vecSub(vA, vB) {
    return { L: vA.L - vB.L, a: vA.a - vB.a, b: vA.b - vB.b };
}

/**
 * Vector addition
 * @param {{L: number, a: number, b: number}} vA
 * @param {{L: number, a: number, b: number}} vB
 * @returns {{L: number, a: number, b: number}}
 */
export function vecAdd(vA, vB) {
    return { L: vA.L + vB.L, a: vA.a + vB.a, b: vA.b + vB.b };
}

/**
 * Scalar multiplication
 * @param {{L: number, a: number, b: number}} vA
 * @param {number} scalar
 * @returns {{L: number, a: number, b: number}}
 */
export function vecScale(vA, scalar) {
    return { L: vA.L * scalar, a: vA.a * scalar, b: vA.b * scalar };
}

/**
 * Vector magnitude squared
 * @param {{L: number, a: number, b: number}} vA
 * @returns {number}
 */
export function vecMagSq(vA) {
    return vecDot(vA, vA);
}

// ═══════════════════════════════════════════════════════════════════
// HSL CONVERSION
// ═══════════════════════════════════════════════════════════════════

/**
 * sRGB (0-255) → HSL  {h: 0-360, s: 0-1, l: 0-1}
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {{h: number, s: number, l: number}}
 */
export function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r)      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else                h = ((r - g) / d + 4) / 6;
    return { h: h * 360, s, l };
}

// ═══════════════════════════════════════════════════════════════════
// WEIGHTED / MULTI-SPACE DISTANCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Weighted CIELAB distance.
 * Standard ΔE76 with per-axis weights.
 *
 * @param {{L,a,b}} lab1
 * @param {{L,a,b}} lab2
 * @param {number} wL - Lightness weight (default 1)
 * @param {number} wA - a* (green-red) weight (default 1)
 * @param {number} wB - b* (blue-yellow) weight (default 1)
 * @returns {number}
 */
export function weightedLabDistance(lab1, lab2, wL = 1, wA = 1, wB = 1) {
    if (!lab1 || !lab2) return Infinity;
    const dL = lab1.L - lab2.L;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    return Math.sqrt(wL * dL * dL + wA * da * da + wB * db * db);
}

/**
 * Euclidean RGB distance (0-255 scale).
 *
 * @param {{r,g,b}} a
 * @param {{r,g,b}} b
 * @returns {number}
 */
export function rgbDistance(a, b) {
    if (!a || !b) return Infinity;
    const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Weighted HSL distance with circular hue handling.
 * Hue difference wraps at 360°. All three axes are normalised to
 * roughly comparable scales before weighting:
 *   ΔH_norm = min(|Δh|, 360-|Δh|) / 180   → [0, 1]
 *   ΔS_norm = |Δs|                          → [0, 1]
 *   ΔL_norm = |Δl|                          → [0, 1]
 *
 * @param {{h,s,l}} hsl1
 * @param {{h,s,l}} hsl2
 * @param {number} wH - Hue weight (default 1)
 * @param {number} wS - Saturation weight (default 1)
 * @param {number} wL - Lightness weight (default 1)
 * @returns {number}
 */
export function weightedHslDistance(hsl1, hsl2, wH = 1, wS = 1, wL = 1) {
    if (!hsl1 || !hsl2) return Infinity;
    const rawDh = Math.abs(hsl1.h - hsl2.h);
    const dh = Math.min(rawDh, 360 - rawDh) / 180;
    const ds = Math.abs(hsl1.s - hsl2.s);
    const dl = Math.abs(hsl1.l - hsl2.l);
    return Math.sqrt(wH * dh * dh + wS * ds * ds + wL * dl * dl);
}

/**
 * Build a colour-space adapter for use with the dither algorithms.
 * Returns an object with `convert(r,g,b)`, `distance(a,b)`, and `hexToRgb(hex)`.
 *
 * @param {'lab'|'rgb'|'hsl'} space
 * @param {{w1?: number, w2?: number, w3?: number}} [weights]
 * @returns {{convert: Function, distance: Function, hexToRgb: Function, rgbToLab: Function}}
 */
export function buildColorSpace(space = 'lab', weights = {}) {
    const w1 = weights.w1 ?? 1;
    const w2 = weights.w2 ?? 1;
    const w3 = weights.w3 ?? 1;

    if (space === 'rgb') {
        return {
            convert: (r, g, b) => ({ r, g, b }),
            distance: (a, b) => rgbDistance(a, b),
            hexToRgb: (hex) => hexToRgb(hex),
            rgbToLab: (r, g, b) => ({ r, g, b }),
        };
    }

    if (space === 'hsl') {
        return {
            convert: (r, g, b) => rgbToHsl(r, g, b),
            distance: (a, b) => weightedHslDistance(a, b, w1, w2, w3),
            hexToRgb: (hex) => hexToRgb(hex),
            rgbToLab: (r, g, b) => rgbToHsl(r, g, b),
        };
    }

    // Default: CIELAB
    const isWeighted = w1 !== 1 || w2 !== 1 || w3 !== 1;
    return {
        convert: (r, g, b) => rgbToLab(r, g, b),
        distance: isWeighted
            ? (a, b) => weightedLabDistance(a, b, w1, w2, w3)
            : (a, b) => deltaE76(a, b),
        hexToRgb: (hex) => hexToRgb(hex),
        rgbToLab: (r, g, b) => rgbToLab(r, g, b),
    };
}

// ═══════════════════════════════════════════════════════════════════
// PRIVATE HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * sRGB (0-255) → Linear RGB (0-1)
 * @private
 */
function srgbToLinear(rgbArray) {
    return rgbArray.map(v => {
        v /= 255.0;
        return (v <= 0.04045) ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
}

/**
 * Linear RGB (0-1) → sRGB (0-255)
 * @private
 */
function linearToSrgb(linearArray) {
    return linearArray.map(v => {
        v = Math.max(0.0, Math.min(1.0, v)); // Clamp to [0,1]
        let ret;
        if (v <= 0.0031308) {
            ret = v * 12.92;
        } else {
            ret = 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055;
        }
        // Clamp and round to 0-255
        return Math.round(Math.max(0.0, Math.min(1.0, ret)) * 255.0);
    });
}

/**
 * Linear RGB → XYZ (D65 white point)
 * @private
 */
function linearToXyz(linearArray) {
    const [lr, lg, lb] = linearArray;
    // sRGB D65 matrix (standard coefficients)
    const X = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
    const Y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
    const Z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;
    return [X, Y, Z];
}

/**
 * XYZ → Linear RGB (D65 white point)
 * @private
 */
function xyzToLinear(X, Y, Z) {
    // Ensure non-negative
    X = Math.max(0.0, X);
    Y = Math.max(0.0, Y);
    Z = Math.max(0.0, Z);
    
    // Inverse sRGB D65 matrix (standard coefficients)
    const lr =  3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
    const lg = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
    const lb =  0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
    return [lr, lg, lb];
}

/**
 * XYZ → LAB
 * @private
 */
function xyzToLab(X, Y, Z) {
    const { X: Xn, Y: Yn, Z: Zn } = WHITE_REFERENCE;
    
    // Ensure non-negative
    X = Math.max(0.0, X);
    Y = Math.max(0.0, Y);
    Z = Math.max(0.0, Z);

    const xr = X / Xn, yr = Y / Yn, zr = Z / Zn;

    // f(t) function from CIE LAB definition
    const fx = (xr > EPSILON) ? Math.cbrt(xr) : (KAPPA * xr + 16.0) / 116.0;
    const fy = (yr > EPSILON) ? Math.cbrt(yr) : (KAPPA * yr + 16.0) / 116.0;
    const fz = (zr > EPSILON) ? Math.cbrt(zr) : (KAPPA * zr + 16.0) / 116.0;

    const L = (116.0 * fy) - 16.0;
    const a = 500.0 * (fx - fy);
    const b = 200.0 * (fy - fz);

    return { L, a, b };
}

/**
 * LAB → XYZ
 * @private
 */
function labToXyz(L, a, b_lab) {
    const fy = (L + 16.0) / 116.0;
    const fx = a / 500.0 + fy;
    const fz = fy - b_lab / 200.0;

    const fx3 = fx ** 3;
    const fz3 = fz ** 3;

    const xr = (fx3 > EPSILON) ? fx3 : (116.0 * fx - 16.0) / KAPPA;
    const yr = (L > KAPPA * EPSILON) ? ((L + 16.0) / 116.0) ** 3 : L / KAPPA;
    const zr = (fz3 > EPSILON) ? fz3 : (116.0 * fz - 16.0) / KAPPA;

    const { X: Xn, Y: Yn, Z: Zn } = WHITE_REFERENCE;
    
    return {
        X: Math.max(0.0, xr * Xn),
        Y: Math.max(0.0, yr * Yn),
        Z: Math.max(0.0, zr * Zn)
    };
}

/**
 * Clear conversion cache
 * @public
 */
export function clearCache() {
    conversionCache.clear();
}

