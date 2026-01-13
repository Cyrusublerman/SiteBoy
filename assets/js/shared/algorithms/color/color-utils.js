/**
 * @fileoverview Color Utilities — RGB/Hex conversion, color distance, palette I/O
 * 
 * Pure functional utilities for color manipulation, conversion, and palette management.
 * All functions are stateless and have no side effects.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js
 */

/**
 * Convert RGB object to standardized string key for Map lookups
 * 
 * CRITICAL: Always rounds RGB values to integers for consistent key generation.
 * This ensures that slight floating-point variations don't create different keys.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:12-17
 * @param {{r: number, g: number, b: number}} rgb - RGB color object
 * @returns {string} Standardized key in format "r,g,b"
 * 
 * @example
 * rgb_to_key({r: 255.7, g: 128.3, b: 64.1});  // Returns "256,128,64"
 * rgb_to_key({r: 255, g: 128, b: 64});        // Returns "255,128,64"
 */
export function rgb_to_key(rgb) {
    const r = Math.round(rgb.r);
    const g = Math.round(rgb.g);
    const b = Math.round(rgb.b);
    return `${r},${g},${b}`;
}

/**
 * Convert hex color string to RGB object
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:24-31
 * @param {string} hex - Hex color string (#RRGGBB or RRGGBB)
 * @returns {{r: number, g: number, b: number}} RGB object with values 0-255
 * 
 * @example
 * hex2rgb('#FF8040');   // Returns {r: 255, g: 128, b: 64}
 * hex2rgb('FF8040');    // Returns {r: 255, g: 128, b: 64}
 * hex2rgb('#invalid');  // Returns {r: 255, g: 255, b: 255} (white fallback)
 */
export function hex2rgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? {
        r: parseInt(m[1], 16),
        g: parseInt(m[2], 16),
        b: parseInt(m[3], 16)
    } : {r: 255, g: 255, b: 255};
}

/**
 * Convert RGB object to hex color string
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:38-43
 * @param {{r: number, g: number, b: number}} rgb - RGB object
 * @returns {string} Lowercase hex string with # prefix
 * 
 * @example
 * rgb2hex({r: 255, g: 128, b: 64});  // Returns "#ff8040"
 */
export function rgb2hex(rgb) {
    const r = Math.round(rgb.r).toString(16).padStart(2, '0');
    const g = Math.round(rgb.g).toString(16).padStart(2, '0');
    const b = Math.round(rgb.b).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

/**
 * Simulate final color from layer sequence using color averaging
 * 
 * When multiple filament layers are printed on top of each other, the final
 * perceived color is approximated by averaging the RGB values of all layers.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:52-69
 * @formula RGB_result = (1/n) × Σ RGB_layer_i for all non-empty layers
 * @param {number[]} seq - Layer sequence (1-indexed, 0 = empty)
 * @param {Array<{h: string, n: string}>} colours - Color objects with hex values
 * @returns {{r: number, g: number, b: number}} Average RGB color
 * 
 * @example
 * const seq = [1, 2, 0, 0];  // Red on layer 0, Blue on layer 1
 * const colours = [
 *   {h: '#FF0000', n: 'Red'},
 *   {h: '#0000FF', n: 'Blue'}
 * ];
 * simColour(seq, colours);  // Returns {r: 128, g: 0, b: 128} (purple)
 */
export function simColour(seq, colours) {
    let r = 0, g = 0, b = 0, cnt = 0;
    for (let i = 0; i < seq.length; i++) {
        const fi = seq[i];
        if (fi > 0) {
            const rgb = hex2rgb(colours[fi - 1].h);
            r += rgb.r;
            g += rgb.g;
            b += rgb.b;
            cnt++;
        }
    }
    return cnt === 0 ? {r: 255, g: 255, b: 255} : {
        r: Math.round(r / cnt),
        g: Math.round(g / cnt),
        b: Math.round(b / cnt)
    };
}

/**
 * Calculate Euclidean distance between two colors in RGB space
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:77-83
 * @formula d = √[(R₁-R₂)² + (G₁-G₂)² + (B₁-B₂)²]
 * @param {{r: number, g: number, b: number}} c1 - First color
 * @param {{r: number, g: number, b: number}} c2 - Second color
 * @returns {number} Euclidean distance (0-441.67 for RGB space)
 * 
 * @example
 * colorDistance({r: 255, g: 0, b: 0}, {r: 0, g: 255, b: 0});  // ~360.62
 * colorDistance({r: 100, g: 100, b: 100}, {r: 100, g: 100, b: 100});  // 0
 */
export function colorDistance(c1, c2) {
    return Math.sqrt(
        (c1.r - c2.r) ** 2 +
        (c1.g - c2.g) ** 2 +
        (c1.b - c2.b) ** 2
    );
}

/**
 * Find closest color in palette using Euclidean distance
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:91-102
 * @param {{r: number, g: number, b: number}} c - Color to match
 * @param {Array<{r: number, g: number, b: number}>} palette - Available colors
 * @returns {{r: number, g: number, b: number}} Closest color from palette
 * 
 * @example
 * const color = {r: 200, g: 100, b: 50};
 * const palette = [
 *   {r: 255, g: 0, b: 0},    // Red
 *   {r: 0, g: 255, b: 0},    // Green
 *   {r: 0, g: 0, b: 255}     // Blue
 * ];
 * findClosest(color, palette);  // Returns {r: 255, g: 0, b: 0} (red is closest)
 */
export function findClosest(c, palette) {
    let min = Infinity;
    let closest = palette[0];
    palette.forEach(p => {
        const dist = colorDistance(c, p);
        if (dist < min) {
            min = dist;
            closest = p;
        }
    });
    return closest;
}

/**
 * Calculate average color from entire image
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:109-122
 * @param {ImageData} imgData - Browser ImageData object
 * @returns {{r: number, g: number, b: number}} Average RGB color
 * 
 * @example
 * const ctx = canvas.getContext('2d');
 * const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
 * const avg = avgColour(imageData);  // {r: 128, g: 64, b: 200}
 */
export function avgColour(imgData) {
    let r = 0, g = 0, b = 0, cnt = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
        r += imgData.data[i];
        g += imgData.data[i + 1];
        b += imgData.data[i + 2];
        cnt++;
    }
    return {
        r: Math.round(r / cnt),
        g: Math.round(g / cnt),
        b: Math.round(b / cnt)
    };
}

/**
 * Parse GIMP Palette (.gpl) file format
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:159-192
 * @param {string} text - GPL file contents
 * @returns {Array<{r: number, g: number, b: number}>} Array of RGB colors
 * 
 * @example
 * const gplText = `GIMP Palette
 * Name: MyPalette
 * 255 0 0 Red
 * 0 255 0 Green
 * 0 0 255 Blue`;
 * const palette = parseGPL(gplText);
 * // Returns [{r:255,g:0,b:0}, {r:0,g:255,b:0}, {r:0,g:0,b:255}]
 */
export function parseGPL(text) {
    const lines = text.split('\n');
    const palette = [];

    for (let line of lines) {
        line = line.trim();

        // Skip comments, headers, empty lines
        if (!line || line.startsWith('#') ||
            line.startsWith('GIMP') ||
            line.startsWith('Name:') ||
            line.startsWith('Columns:')) {
            continue;
        }

        // Parse RGB values (format: "R G B [Name]")
        const parts = line.split(/\s+/);

        if (parts.length >= 3) {
            const r = parseInt(parts[0]);
            const g = parseInt(parts[1]);
            const b = parseInt(parts[2]);

            // Validate RGB values
            if (r >= 0 && r <= 255 &&
                g >= 0 && g <= 255 &&
                b >= 0 && b <= 255) {
                palette.push({r, g, b});
            }
        }
    }

    return palette;
}

/**
 * Generate GIMP Palette (.gpl) file content
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:200-206
 * @param {Array<{r: number, g: number, b: number}>} palette - Array of RGB colors
 * @param {string} [name='Palette'] - Palette name
 * @returns {string} GPL file content
 * 
 * @example
 * const palette = [
 *   {r: 255, g: 0, b: 0},
 *   {r: 0, g: 255, b: 0}
 * ];
 * const gpl = generateGPL(palette, 'MyPalette');
 * // Returns:
 * // GIMP Palette
 * // Name: MyPalette
 * // Columns: 8
 * // #
 * // 255 0 0 Color0
 * // 0 255 0 Color1
 */
export function generateGPL(palette, name = 'Palette') {
    let gpl = `GIMP Palette\nName: ${name}\nColumns: 8\n#\n`;
    palette.forEach((c, i) => {
        gpl += `${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)} Color${i}\n`;
    });
    return gpl;
}

/**
 * Distribute dithering error to neighboring pixels (Floyd-Steinberg)
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:135-152
 * @formula Error distribution: [_, 7/16], [3/16, 5/16, 1/16]
 * @param {Uint8ClampedArray} data - ImageData.data array
 * @param {number} w - Image width
 * @param {number} h - Image height
 * @param {number} x - Current x position
 * @param {number} y - Current y position
 * @param {number} er - Red channel error
 * @param {number} eg - Green channel error
 * @param {number} eb - Blue channel error
 * 
 * @example
 * const imageData = ctx.getImageData(0, 0, w, h);
 * // After quantizing pixel at (x,y):
 * const er = originalR - quantizedR;
 * const eg = originalG - quantizedG;
 * const eb = originalB - quantizedB;
 * distributeError(imageData.data, w, h, x, y, er, eg, eb);
 */
export function distributeError(data, w, h, x, y, er, eg, eb) {
    const offsets = [
        {dx: 1, dy: 0, f: 7/16},  // Right
        {dx: -1, dy: 1, f: 3/16}, // Bottom-left
        {dx: 0, dy: 1, f: 5/16},  // Bottom
        {dx: 1, dy: 1, f: 1/16}   // Bottom-right
    ];
    offsets.forEach(({dx, dy, f}) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const i = (ny * w + nx) * 4;
            data[i] = Math.max(0, Math.min(255, data[i] + er * f));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + eg * f));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + eb * f));
        }
    });
}

/**
 * Clamp value between min and max
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/core/utils.js:215-217
 * @param {number} val - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 * 
 * @example
 * clamp(150, 0, 100);   // Returns 100
 * clamp(-50, 0, 100);   // Returns 0
 * clamp(75, 0, 100);    // Returns 75
 */
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

