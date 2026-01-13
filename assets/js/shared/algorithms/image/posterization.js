/**
 * @fileoverview Posterization and Tone Quantization
 * 
 * Functions for reducing tonal levels in images.
 * All functions are pure and stateless.
 * 
 * @module image/posterization
 */

// ═══════════════════════════════════════════════════════════════════════════
// BASIC POSTERIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Posterize single value to N levels
 *
 * @source blog/ideas/reference documentation/14_Signal_Processing_Filtering/Posterization.md
 * @wikipedia https://en.wikipedia.org/wiki/Posterization
 * @section 2.1 Uniform Quantization
 * @formula v_q = \frac{\lfloor v \cdot n \rfloor}{n - 1}
 *
 * @param {number} value - Input value [0, 1]
 * @param {number} levels - Number of output levels (≥2)
 * @returns {number} Quantized value [0, 1]
 */
export function posterize(value, levels) {
    const step = 1 / levels;
    const level = Math.min(Math.floor(value / step), levels - 1);
    return level / (levels - 1);
}

/**
 * Posterize with gamma correction
 * 
 * @param {number} value - Input value [0, 1]
 * @param {number} levels - Number of output levels
 * @param {number} [gamma=2.2] - Gamma value
 * @returns {number} Quantized value [0, 1]
 */
export function posterizeGamma(value, levels, gamma = 2.2) {
    // Linearize
    const linear = Math.pow(value, gamma);
    // Quantize in linear space
    const quantized = posterize(linear, levels);
    // Back to gamma space
    return Math.pow(quantized, 1 / gamma);
}

/**
 * Posterize with smoothstep transitions
 * 
 * @param {number} value - Input value [0, 1]
 * @param {number} levels - Number of output levels
 * @param {number} [smoothness=0.1] - Transition width (0-0.5)
 * @returns {number} Soft-quantized value [0, 1]
 */
export function posterizeSmooth(value, levels, smoothness = 0.1) {
    const step = 1 / levels;
    const levelFloat = value / step;
    const levelFloor = Math.floor(levelFloat);
    const levelCeil = Math.min(levelFloor + 1, levels - 1);
    
    const t = levelFloat - levelFloor;
    const edge = Math.min(smoothness, 0.5);
    
    let blend;
    if (t < edge) {
        blend = 0;
    } else if (t > 1 - edge) {
        blend = 1;
    } else {
        // Smoothstep
        const x = (t - edge) / (1 - 2 * edge);
        blend = x * x * (3 - 2 * x);
    }
    
    const outFloor = levelFloor / (levels - 1);
    const outCeil = levelCeil / (levels - 1);
    return outFloor + blend * (outCeil - outFloor);
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM LEVEL BOUNDARIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Posterize with custom boundaries
 * 
 * @param {number} value - Input value [0, 1]
 * @param {number[]} boundaries - Level boundaries (ascending, including 0 and 1)
 * @param {number[]} outputs - Output values for each level
 * @returns {number} Quantized value
 */
export function posterizeCustom(value, boundaries, outputs) {
    for (let i = 0; i < boundaries.length - 1; i++) {
        if (value < boundaries[i + 1]) {
            return outputs[i];
        }
    }
    return outputs[outputs.length - 1];
}

/**
 * Create equal-area level boundaries from histogram
 * 
 * @param {Uint32Array} histogram - 256-bin histogram
 * @param {number} levels - Number of output levels
 * @returns {{boundaries: number[], outputs: number[]}} Level configuration
 */
export function histogramOptimalLevels(histogram, levels) {
    // Compute cumulative histogram
    const cumulative = new Uint32Array(256);
    cumulative[0] = histogram[0];
    for (let i = 1; i < 256; i++) {
        cumulative[i] = cumulative[i - 1] + histogram[i];
    }
    const total = cumulative[255];
    
    // Find boundaries at equal cumulative percentiles
    const boundaries = [0];
    const outputs = [];
    
    for (let i = 1; i < levels; i++) {
        const target = (i / levels) * total;
        let bin = 0;
        while (bin < 255 && cumulative[bin] < target) bin++;
        boundaries.push(bin / 255);
        
        // Output is midpoint of previous level
        const prevBound = boundaries[boundaries.length - 2];
        const currBound = boundaries[boundaries.length - 1];
        outputs.push((prevBound + currBound) / 2);
    }
    boundaries.push(1);
    outputs.push((boundaries[levels - 1] + 1) / 2);
    
    return { boundaries, outputs };
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE POSTERIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Posterize grayscale image
 * 
 * @param {Uint8Array} image - Grayscale image
 * @param {number} levels - Number of output levels
 * @returns {Uint8Array} Posterized image
 */
export function posterizeImage(image, levels) {
    const result = new Uint8Array(image.length);
    
    for (let i = 0; i < image.length; i++) {
        const normalized = image[i] / 255;
        result[i] = Math.round(posterize(normalized, levels) * 255);
    }
    
    return result;
}

/**
 * Posterize RGB image (per-channel)
 * 
 * @param {Uint8Array} image - RGBA image (4 bytes per pixel)
 * @param {number} levels - Number of output levels per channel
 * @returns {Uint8Array} Posterized image
 */
export function posterizeImageRGB(image, levels) {
    const result = new Uint8Array(image.length);
    
    for (let i = 0; i < image.length; i += 4) {
        result[i] = Math.round(posterize(image[i] / 255, levels) * 255);
        result[i + 1] = Math.round(posterize(image[i + 1] / 255, levels) * 255);
        result[i + 2] = Math.round(posterize(image[i + 2] / 255, levels) * 255);
        result[i + 3] = image[i + 3]; // Preserve alpha
    }
    
    return result;
}

/**
 * Posterize by luminance (preserve hue/saturation)
 * 
 * @param {Uint8Array} image - RGBA image
 * @param {number} levels - Number of luminance levels
 * @returns {Uint8Array} Posterized image
 */
export function posterizeImageLuminance(image, levels) {
    const result = new Uint8Array(image.length);
    
    for (let i = 0; i < image.length; i += 4) {
        const r = image[i], g = image[i + 1], b = image[i + 2];
        
        // Rec. 709 luminance
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const lumNorm = lum / 255;
        const lumQ = posterize(lumNorm, levels);
        
        // Scale RGB by luminance ratio
        const ratio = lumNorm > 0.001 ? lumQ / lumNorm : 1;
        
        result[i] = Math.min(255, Math.round(r * ratio));
        result[i + 1] = Math.min(255, Math.round(g * ratio));
        result[i + 2] = Math.min(255, Math.round(b * ratio));
        result[i + 3] = image[i + 3];
    }
    
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// DITHERED POSTERIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Posterize with ordered dithering
 * 
 * @param {number} value - Input value [0, 1]
 * @param {number} levels - Number of output levels
 * @param {number} threshold - Dither threshold [0, 1]
 * @returns {number} Dithered quantized value
 */
export function posterizeDither(value, levels, threshold) {
    const adjusted = value + (threshold - 0.5) / levels;
    return posterize(Math.max(0, Math.min(1, adjusted)), levels);
}

/**
 * Posterize image with Bayer dithering
 * 
 * @param {Uint8Array} image - Grayscale image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} levels - Number of output levels
 * @returns {Uint8Array} Posterized image
 */
export function posterizeImageBayer(image, width, height, levels) {
    // 4x4 Bayer matrix
    const bayer = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
    ];
    const bayerScale = 1 / 16;
    
    const result = new Uint8Array(image.length);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const threshold = bayer[y % 4][x % 4] * bayerScale;
            const normalized = image[idx] / 255;
            result[idx] = Math.round(posterizeDither(normalized, levels, threshold) * 255);
        }
    }
    
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTOUR EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract posterization level boundaries as contours
 * 
 * @param {Uint8Array} original - Original grayscale image
 * @param {Uint8Array} posterized - Posterized image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Uint8Array} Edge mask (255 at level boundaries)
 */
export function extractPosterContours(original, posterized, width, height) {
    const edges = new Uint8Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const center = posterized[idx];
            
            // Check 4-connected neighbors
            const left = posterized[idx - 1];
            const right = posterized[idx + 1];
            const top = posterized[idx - width];
            const bottom = posterized[idx + width];
            
            if (center !== left || center !== right || 
                center !== top || center !== bottom) {
                edges[idx] = 255;
            }
        }
    }
    
    return edges;
}

