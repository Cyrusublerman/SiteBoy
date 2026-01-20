/**
 * Palette Utilities
 * 
 * Colour conversion and validation utilities for palette system.
 */

/**
 * Convert RGB to hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex colour (#RRGGBB)
 */
export function rgbToHex(r, g, b) {
    const toHex = (n) => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Convert hex to RGB
 * @param {string} hex - Hex colour (#RGB or #RRGGBB)
 * @returns {{r: number, g: number, b: number}}
 */
export function hexToRgb(hex) {
    hex = hex.replace('#', '');
    
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {{r: number, g: number, b: number}}
 */
export function hslToRgb(h, s, l) {
    h = h % 360;
    s = s / 100;
    l = l / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }
    
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

/**
 * Convert HSL to hex
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex colour
 */
export function hslToHex(h, s, l) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Validate hex colour format
 * @param {string} hex - Hex colour
 * @returns {boolean} True if valid 6-digit hex
 */
export function isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Normalize hex to 6-digit format
 * @param {string} hex - Hex colour (#RGB or #RRGGBB)
 * @returns {string} 6-digit hex (#RRGGBB)
 */
export function normalizeHex(hex) {
    hex = hex.replace('#', '');
    
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    return '#' + hex.toUpperCase();
}

/**
 * Get luminance of colour (0-1)
 * @param {string} hex - Hex colour
 * @returns {number} Relative luminance
 */
export function getLuminance(hex) {
    const rgb = hexToRgb(hex);
    
    // Convert to linear RGB
    const toLinear = (c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    
    const r = toLinear(rgb.r);
    const g = toLinear(rgb.g);
    const b = toLinear(rgb.b);
    
    // ITU-R BT.709 coefficients
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Sort colours by luminance
 * @param {string[]} colours - Array of hex colours
 * @param {boolean} ascending - Sort ascending (dark to light)
 * @returns {string[]} Sorted colours
 */
export function sortByLuminance(colours, ascending = true) {
    return colours.slice().sort((a, b) => {
        const diff = getLuminance(a) - getLuminance(b);
        return ascending ? diff : -diff;
    });
}

/**
 * Parse GIMP palette (.gpl) format
 * @param {string} text - GPL file content
 * @returns {string[]} Array of hex colours
 */
export function parseGPL(text) {
    const lines = text.split(/\r?\n/);
    const colours = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#') || line.startsWith('GIMP') || line.startsWith('Name:') || line.startsWith('Columns:')) {
            continue;
        }
        const parts = line.split(/\s+/);
        if (parts.length < 3) continue;
        const r = parseInt(parts[0], 10);
        const g = parseInt(parts[1], 10);
        const b = parseInt(parts[2], 10);
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) continue;
        colours.push(rgbToHex(r, g, b));
    }
    return colours;
}

/**
 * Export palette to GIMP palette (.gpl) format
 * @param {string[]} colours - Array of hex colours
 * @param {string} name - Palette name
 * @returns {string} GPL formatted text
 */
export function exportGPL(colours, name = 'Palette') {
    const lines = [
        'GIMP Palette',
        'Name: ' + name,
        'Columns: 0',
        '#'
    ];
    for (let i = 0; i < colours.length; i++) {
        const rgb = hexToRgb(normalizeHex(colours[i]));
        const padded = [
            rgb.r.toString().padStart(3, ' '),
            rgb.g.toString().padStart(3, ' '),
            rgb.b.toString().padStart(3, ' ')
        ].join(' ');
        lines.push(padded + '\t' + colours[i]);
    }
    return lines.join('\n');
}

/**
 * Parse simple hex list (.hex or .txt)
 * @param {string} text - File content
 * @returns {string[]} Array of hex colours
 */
export function parseHexFile(text) {
    return text
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => normalizeHex(value))
        .filter((value) => isValidHex(value));
}

/**
 * Export palette as plain hex list
 * @param {string[]} colours
 * @returns {string}
 */
export function exportHexFile(colours) {
    return colours.map((value) => normalizeHex(value)).join('\n');
}

/**
 * Parse palette JSON formats
 * @param {string} text - JSON string
 * @returns {string[]} Array of hex colours
 */
export function parsePaletteJson(text) {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
        return parsed.map((value) => normalizeHex(value)).filter((value) => isValidHex(value));
    }
    if (parsed && Array.isArray(parsed.colours)) {
        return parsed.colours.map((value) => normalizeHex(value)).filter((value) => isValidHex(value));
    }
    if (parsed && Array.isArray(parsed.colors)) {
        return parsed.colors.map((value) => normalizeHex(value)).filter((value) => isValidHex(value));
    }
    return [];
}

/**
 * Export palette as JSON
 * @param {string[]} colours
 * @param {string} name
 * @returns {string}
 */
export function exportPaletteJson(colours, name = 'Palette') {
    return JSON.stringify({ name, colours: colours.map((value) => normalizeHex(value)) }, null, 2);
}

