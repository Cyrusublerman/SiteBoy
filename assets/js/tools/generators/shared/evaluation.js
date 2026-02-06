/**
 * Evaluation Utilities - Shared mathematical functions for generative scripts
 * 
 * Pure functional utilities extracted from common patterns across generator tools.
 * These functions handle edge cases and provide consistent behavior.
 * 
 * @version 1.0.0
 */

/**
 * Safe power function - handles edge cases gracefully
 * 
 * Edge cases handled:
 * - base near zero with negative exponent -> returns 0 (avoids Infinity)
 * - Preserves sign for negative bases
 * - Catches non-finite results
 * 
 * @param {number} base - Base value
 * @param {number} exp - Exponent
 * @returns {number} base^exp with edge case handling
 * 
 * @example
 * safePow(0.5, 2) // 0.25
 * safePow(-2, 3) // -8 (preserves sign)
 * safePow(0, -1) // 0 (avoids Infinity)
 */
export function safePow(base, exp) {
    // Handle near-zero base with negative exponent (would be Infinity)
    if (Math.abs(base) < 1e-9 && exp < 0) {
        return 0;
    }
    
    // Exponent of 1 is identity
    if (Math.abs(exp - 1) < 1e-9) {
        return base;
    }
    
    // Exponent of 0 is 1
    if (Math.abs(exp) < 1e-9) {
        return 1;
    }
    
    // Preserve sign for negative bases
    const sign = base >= 0 ? 1 : -1;
    const result = sign * Math.pow(Math.abs(base), exp);
    
    // Catch non-finite results
    if (!isFinite(result) || isNaN(result)) {
        return 0;
    }
    
    return result;
}

/**
 * Linear interpolation
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 * 
 * @example
 * lerp(0, 100, 0.5) // 50
 * lerp(10, 20, 0.25) // 12.5
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Smooth interpolation (smoothstep)
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Smoothly interpolated value
 * 
 * @example
 * smoothstep(0, 100, 0.5) // ~50 (but with smooth curve)
 */
export function smoothstep(a, b, t) {
    // Clamp t to [0, 1]
    t = Math.max(0, Math.min(1, t));
    // Smooth curve: 3t² - 2t³
    const smooth = t * t * (3 - 2 * t);
    return lerp(a, b, smooth);
}

/**
 * Wrap value to range [min, max)
 * @param {number} value - Value to wrap
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Wrapped value
 * 
 * @example
 * wrap(5, 0, 3) // 2
 * wrap(-1, 0, 10) // 9
 * wrap(Math.PI * 2.5, -Math.PI, Math.PI) // -Math.PI/2
 */
export function wrap(value, min, max) {
    const range = max - min;
    if (range === 0) return min;
    return ((((value - min) % range) + range) % range) + min;
}

/**
 * Clamp value to range [min, max]
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Clamped value
 * 
 * @example
 * clamp(5, 0, 3) // 3
 * clamp(-1, 0, 10) // 0
 * clamp(5, 0, 10) // 5
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Map value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @param {boolean} [constrain=false] - Constrain output to output range
 * @returns {number} Mapped value
 * 
 * @example
 * map(5, 0, 10, 0, 100) // 50
 * map(15, 0, 10, 0, 100, true) // 100 (clamped)
 */
export function map(value, inMin, inMax, outMin, outMax, constrain = false) {
    const mapped = outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
    if (constrain) {
        return clamp(mapped, Math.min(outMin, outMax), Math.max(outMin, outMax));
    }
    return mapped;
}

/**
 * Normalize value to [0, 1] range
 * @param {number} value - Value to normalize
 * @param {number} min - Range minimum
 * @param {number} max - Range maximum
 * @returns {number} Normalized value (0-1)
 * 
 * @example
 * normalize(50, 0, 100) // 0.5
 * normalize(75, 0, 100) // 0.75
 */
export function normalize(value, min, max) {
    if (max === min) return 0;
    return (value - min) / (max - min);
}

/**
 * Distance between two 2D points
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Euclidean distance
 * 
 * @example
 * dist(0, 0, 3, 4) // 5
 */
export function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Angle between two 2D points (radians)
 * @param {number} x1 - First point X
 * @param {number} y1 - First point Y
 * @param {number} x2 - Second point X
 * @param {number} y2 - Second point Y
 * @returns {number} Angle in radians
 * 
 * @example
 * angleBetween(0, 0, 1, 0) // 0
 * angleBetween(0, 0, 0, 1) // Math.PI/2
 */
export function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function radians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function degrees(radians) {
    return radians * 180 / Math.PI;
}

/**
 * Constants
 */
export const PI = Math.PI;
export const TWO_PI = Math.PI * 2;
export const HALF_PI = Math.PI / 2;
export const QUARTER_PI = Math.PI / 4;

/**
 * Export all as default object
 */
export default {
    safePow,
    lerp,
    smoothstep,
    wrap,
    clamp,
    map,
    normalize,
    dist,
    angleBetween,
    radians,
    degrees,
    PI,
    TWO_PI,
    HALF_PI,
    QUARTER_PI
};

console.log('✅ Evaluation utilities loaded');

