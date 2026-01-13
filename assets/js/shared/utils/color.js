/**
 * Color Utilities - SiteBoy Framework
 * 
 * Color manipulation utilities for canvas rendering:
 * - Depth-based color interpolation
 * - RGB interpolation
 * - VGA palette validation
 * 
 * All colors must be VGA palette compliant.
 * 
 * @version 1.0.0
 */

/**
 * VGA 16-color palette (uppercase hex)
 */
export const VGA_PALETTE = [
    '#000000', // Black
    '#800000', // Dark Red
    '#008000', // Dark Green
    '#808000', // Dark Yellow (Olive)
    '#000080', // Dark Blue
    '#800080', // Dark Magenta
    '#008080', // Dark Cyan
    '#C0C0C0', // Light Gray
    '#808080', // Dark Gray
    '#FF0000', // Red
    '#00FF00', // Green
    '#FFFF00', // Yellow
    '#0000FF', // Blue
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFFFFF'  // White
];

/**
 * VGA palette as lowercase for comparison
 */
const VGA_PALETTE_LOWER = VGA_PALETTE.map(c => c.toLowerCase());

/**
 * Parse hex color to RGB components
 * @param {string} hex - Hex color string (#RRGGBB or #RGB)
 * @returns {{r: number, g: number, b: number}} RGB components (0-255)
 */
export function hexToRgb(hex) {
    let h = hex.startsWith('#') ? hex.slice(1) : hex;
    
    // Expand shorthand (#RGB to #RRGGBB)
    if (h.length === 3) {
        h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16)
    };
}

/**
 * Convert RGB components to hex string
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string (#RRGGBB)
 */
export function rgbToHex(r, g, b) {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    const toHex = v => clamp(v).toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Check if a color is in the VGA palette
 * @param {string} hex - Hex color string
 * @returns {boolean} True if color is in VGA palette
 */
export function isVGAColor(hex) {
    const normalized = hex.toLowerCase();
    return VGA_PALETTE_LOWER.includes(normalized);
}

/**
 * Find the nearest VGA palette color
 * @param {string} hex - Input hex color
 * @returns {string} Nearest VGA palette color
 */
export function nearestVGAColor(hex) {
    const input = hexToRgb(hex);
    let minDist = Infinity;
    let nearest = VGA_PALETTE[0];
    
    for (const vgaColor of VGA_PALETTE) {
        const vga = hexToRgb(vgaColor);
        const dist = Math.sqrt(
            Math.pow(input.r - vga.r, 2) +
            Math.pow(input.g - vga.g, 2) +
            Math.pow(input.b - vga.b, 2)
        );
        if (dist < minDist) {
            minDist = dist;
            nearest = vgaColor;
        }
    }
    
    return nearest;
}

/**
 * Linear interpolation between two RGB colors
 * @param {string} color1 - Start color (hex)
 * @param {string} color2 - End color (hex)
 * @param {number} t - Interpolation factor (0-1)
 * @returns {string} Interpolated color (hex)
 */
export function lerpRGB(color1, color2, t) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    const clampT = Math.max(0, Math.min(1, t));
    
    return rgbToHex(
        c1.r + (c2.r - c1.r) * clampT,
        c1.g + (c2.g - c1.g) * clampT,
        c1.b + (c2.b - c1.b) * clampT
    );
}

/**
 * Interpolate color based on depth (z-coordinate)
 * 
 * Maps a z value to a color between dark and light.
 * Useful for creating 3D depth illusion in 2D canvas.
 * 
 * @param {number} z - Depth value
 * @param {number} zMin - Minimum depth (maps to colorDark)
 * @param {number} zMax - Maximum depth (maps to colorLight)
 * @param {string} colorDark - Color at minimum depth (hex)
 * @param {string} colorLight - Color at maximum depth (hex)
 * @returns {string} Interpolated color (hex)
 * 
 * @example
 * // Dark to light based on z position
 * const color = lerpByDepth(z, -100, 100, '#000000', '#ffffff');
 * ctx.strokeStyle = color;
 */
export function lerpByDepth(z, zMin, zMax, colorDark, colorLight) {
    // Normalize z to 0-1 range
    const range = zMax - zMin;
    if (range === 0) return colorDark;
    
    const t = (z - zMin) / range;
    return lerpRGB(colorDark, colorLight, t);
}

/**
 * Get color with alpha channel (for canvas fillStyle)
 * @param {string} hex - Hex color
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
export function hexToRgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Namespace export
export const ColorUtils = {
    VGA_PALETTE,
    hexToRgb,
    rgbToHex,
    isVGAColor,
    nearestVGAColor,
    lerpRGB,
    lerpByDepth,
    hexToRgba
};

// UMD export for non-module usage (ToolBase compatibility)
if (typeof window !== 'undefined') {
    window.ColorUtils = ColorUtils;
    console.log('🎨 ColorUtils v1.0.0 ready - VGA palette, depth interpolation');
}

