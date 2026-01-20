/**
 * Image Adjustments — Extended Functions
 * 
 * Additional image adjustment functions to complement existing gamma/contrast/saturation.
 * All operations preserve alpha channel.
 * 
 * @module algorithms/image/image-adjustments (EXTENSION)
 */

/**
 * Apply brightness adjustment (additive offset)
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} brightness - Offset value (-100 to +100)
 * @returns {ImageData} Adjusted image
 * 
 * @source Standard image processing
 * @formula output = clamp(input + brightness, 0, 255)
 * 
 * @example
 * const brightened = applyBrightness(imageData, 50);
 */
export function applyBrightness(imageData, brightness) {
    if (brightness === 0) return imageData;
    
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    
    for (let i = 0; i < data.length; i += 4) {
        output[i] = Math.max(0, Math.min(255, data[i] + brightness));
        output[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
        output[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));
        // Alpha unchanged
    }
    
    return new ImageData(output, width, height);
}

/**
 * Apply exposure adjustment (EV stops)
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} exposure - EV stops (-3 to +3)
 * @returns {ImageData} Adjusted image
 * 
 * @source Photographic exposure adjustment
 * @formula output = clamp(input × 2^exposure, 0, 255)
 * 
 * @example
 * const exposed = applyExposure(imageData, 1.0); // +1 stop = double brightness
 */
export function applyExposure(imageData, exposure) {
    if (exposure === 0) return imageData;
    
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    const multiplier = Math.pow(2, exposure);
    
    for (let i = 0; i < data.length; i += 4) {
        output[i] = Math.max(0, Math.min(255, data[i] * multiplier));
        output[i + 1] = Math.max(0, Math.min(255, data[i + 1] * multiplier));
        output[i + 2] = Math.max(0, Math.min(255, data[i + 2] * multiplier));
    }
    
    return new ImageData(output, width, height);
}

/**
 * Apply hue rotation (HSL color space)
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} hue - Degrees (-180 to +180)
 * @returns {ImageData} Adjusted image
 * 
 * @source Standard HSL color space transformation
 * @formula RGB → HSL, H' = (H + hue) mod 360, HSL → RGB
 * 
 * @example
 * const rotated = applyHueRotation(imageData, 180);
 */
export function applyHueRotation(imageData, hue) {
    if (hue === 0) return imageData;
    
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    const hueShift = hue / 360;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        
        const [h, s, l] = rgbToHsl(r, g, b);
        const hNew = (h + hueShift + 1) % 1; // Wrap around
        const [rNew, gNew, bNew] = hslToRgb(hNew, s, l);
        
        output[i] = Math.round(rNew * 255);
        output[i + 1] = Math.round(gNew * 255);
        output[i + 2] = Math.round(bNew * 255);
        output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, width, height);
}

/**
 * RGB to HSL conversion
 * @private
 */
function rgbToHsl(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    if (max === min) {
        return [0, 0, l]; // Achromatic
    }
    
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    let h;
    if (max === r) {
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
        h = ((b - r) / d + 2) / 6;
    } else {
        h = ((r - g) / d + 4) / 6;
    }
    
    return [h, s, l];
}

/**
 * HSL to RGB conversion
 * @private
 */
function hslToRgb(h, s, l) {
    if (s === 0) {
        return [l, l, l]; // Achromatic
    }
    
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    
    return [r, g, b];
}

/**
 * Invert colors
 * 
 * @param {ImageData} imageData - Source image
 * @returns {ImageData} Inverted image
 * 
 * @formula output = 255 - input
 * 
 * @example
 * const inverted = invertImage(imageData);
 */
export function invertImage(imageData) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    
    for (let i = 0; i < data.length; i += 4) {
        output[i] = 255 - data[i];
        output[i + 1] = 255 - data[i + 1];
        output[i + 2] = 255 - data[i + 2];
        // Alpha unchanged
    }
    
    return new ImageData(output, width, height);
}

/**
 * Apply levels adjustment (black/white/mid points)
 * 
 * @param {ImageData} imageData - Source image
 * @param {Object} levels - {black: 0-255, mid: 0.1-9.9, white: 0-255}
 * @returns {ImageData} Adjusted image
 * 
 * @formula normalized = (input - black) / (white - black)
 *          gamma_adjusted = normalized^(1/mid)
 *          output = clamp(gamma_adjusted × 255, 0, 255)
 * 
 * @example
 * const adjusted = applyLevels(imageData, { black: 20, mid: 1.2, white: 235 });
 */
export function applyLevels(imageData, levels) {
    const { black = 0, mid = 1.0, white = 255 } = levels;
    
    // Early exit if no adjustment
    if (black === 0 && mid === 1.0 && white === 255) {
        return imageData;
    }
    
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    const range = white - black;
    
    if (range <= 0) return imageData;
    
    const gammaExponent = 1.0 / mid;
    
    for (let i = 0; i < data.length; i += 4) {
        // Process each channel
        for (let c = 0; c < 3; c++) {
            const value = data[i + c];
            const normalized = Math.max(0, Math.min(1, (value - black) / range));
            const gammaAdjusted = Math.pow(normalized, gammaExponent);
            output[i + c] = Math.round(Math.max(0, Math.min(255, gammaAdjusted * 255)));
        }
        // Alpha unchanged
        output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, width, height);
}

/**
 * Apply tone curve using lookup table
 * 
 * @param {ImageData} imageData - Source image
 * @param {Uint8Array} lut - 256-entry lookup table
 * @param {string} channel - 'rgb', 'r', 'g', 'b', or 'luminance'
 * @returns {ImageData} Adjusted image
 * 
 * @example
 * const lut = new Uint8Array(256);
 * for (let i = 0; i < 256; i++) lut[i] = Math.pow(i / 255, 1.5) * 255;
 * const curved = applyCurveLUT(imageData, lut, 'rgb');
 */
export function applyCurveLUT(imageData, lut, channel = 'rgb') {
    if (!lut || lut.length !== 256) {
        return imageData;
    }
    
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    
    if (channel === 'rgb') {
        // Apply to all channels
        for (let i = 0; i < data.length; i += 4) {
            output[i] = lut[data[i]];
            output[i + 1] = lut[data[i + 1]];
            output[i + 2] = lut[data[i + 2]];
        }
    } else if (channel === 'luminance') {
        // Apply to luminance only (preserve color)
        const lumR = 0.2126, lumG = 0.7152, lumB = 0.0722;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const lum = r * lumR + g * lumG + b * lumB;
            const newLum = lut[Math.round(lum)];
            const ratio = lum > 0 ? newLum / lum : 1;
            
            output[i] = Math.max(0, Math.min(255, Math.round(r * ratio)));
            output[i + 1] = Math.max(0, Math.min(255, Math.round(g * ratio)));
            output[i + 2] = Math.max(0, Math.min(255, Math.round(b * ratio)));
        }
    } else {
        // Apply to specific channel (r, g, or b)
        const channelIndex = channel === 'r' ? 0 : channel === 'g' ? 1 : 2;
        
        for (let i = 0; i < data.length; i += 4) {
            output[i] = data[i];
            output[i + 1] = data[i + 1];
            output[i + 2] = data[i + 2];
            output[i + channelIndex] = lut[data[i + channelIndex]];
        }
    }
    
    // Alpha unchanged
    for (let i = 3; i < data.length; i += 4) {
        output[i] = data[i];
    }
    
    return new ImageData(output, width, height);
}

/**
 * Generate LUT from control points using linear interpolation
 * 
 * @param {Array<{x: number, y: number}>} points - Control points (x,y in 0-255 range)
 * @returns {Uint8Array} 256-entry lookup table
 * 
 * @example
 * const points = [{x: 0, y: 0}, {x: 128, y: 150}, {x: 255, y: 255}];
 * const lut = generateCurveLUT(points);
 */
export function generateCurveLUT(points) {
    const lut = new Uint8Array(256);
    
    if (!points || points.length < 2) {
        // Identity curve
        for (let i = 0; i < 256; i++) lut[i] = i;
        return lut;
    }
    
    // Sort points by x
    const sorted = [...points].sort((a, b) => a.x - b.x);
    
    // Linear interpolation between points
    let currentSegment = 0;
    
    for (let x = 0; x < 256; x++) {
        // Find which segment we're in
        while (currentSegment < sorted.length - 1 && x > sorted[currentSegment + 1].x) {
            currentSegment++;
        }
        
        const p0 = sorted[currentSegment];
        const p1 = sorted[Math.min(currentSegment + 1, sorted.length - 1)];
        
        if (p0.x === p1.x) {
            lut[x] = Math.round(p0.y);
        } else {
            const t = (x - p0.x) / (p1.x - p0.x);
            const y = p0.y + t * (p1.y - p0.y);
            lut[x] = Math.round(Math.max(0, Math.min(255, y)));
        }
    }
    
    return lut;
}

