/**
 * Feature Extraction Utilities (ASCII)
 * 
 * Pure functions for luminance and gradient calculations.
 */

/**
 * Convert RGB to luminance (luma).
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Luma_(video)
 * @formula Y = 0.299R + 0.587G + 0.114B
 */
export function rgbToLuminance(r, g, b) {
    return r * 0.299 + g * 0.587 + b * 0.114;
}

/**
 * Convert gradient components to magnitude and direction.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Gradient
 * @formula m = sqrt(dx^2 + dy^2), theta = atan2(dy, dx)
 */
export function gradientMagnitudeAndDirection(dx, dy) {
    return {
        magnitude: Math.sqrt(dx * dx + dy * dy),
        direction: Math.atan2(dy, dx)
    };
}

