/**
 * @fileoverview Color Quantization — Image quantization with Floyd-Steinberg dithering
 * 
 * Reduces image colors to a limited palette using nearest-color mapping and
 * error diffusion dithering for improved perceived quality.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/quantize/index.js
 */

import { findClosest, distributeError, rgb_to_key } from '../color/color-utils.js';

/**
 * Quantize image to palette using Floyd-Steinberg dithering
 * 
 * ⚠️ MUTATES INPUT: Modifies imageData.data array in place for performance.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/quantize/index.js:18-56
 * @wikipedia https://en.wikipedia.org/wiki/Floyd–Steinberg_dithering
 * @formula Error distribution: [_, 7/16], [3/16, 5/16, 1/16]
 * @param {ImageData} imageData - Image data to quantize (WILL BE MODIFIED)
 * @param {Array<{r: number, g: number, b: number}>} palette - Target color palette
 * @param {Object} [options={}] - Quantization options
 * @param {boolean} [options.dither=true] - Apply Floyd-Steinberg dithering
 * @param {Uint8Array} [options.mask=null] - Optional mask (1=keep, 0=filter)
 * @returns {ImageData} The same imageData object (modified)
 * 
 * @example
 * const ctx = canvas.getContext('2d');
 * const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
 * const palette = [
 *   {r: 255, g: 0, b: 0},
 *   {r: 0, g: 255, b: 0},
 *   {r: 0, g: 0, b: 255}
 * ];
 * quantizeImage(imageData, palette, { dither: true });
 * ctx.putImageData(imageData, 0, 0);  // Display result
 */
export function quantizeImage(imageData, palette, options = {}) {
    const { dither = true, mask = null } = options;
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const closest = findClosest({r, g, b}, palette);

            // Apply quantized color
            data[i] = closest.r;
            data[i + 1] = closest.g;
            data[i + 2] = closest.b;

            // Set alpha based on mask
            if (mask && mask[y * w + x] === 0) {
                data[i + 3] = 128; // Filtered pixel - semi-transparent
            } else {
                data[i + 3] = 255; // Kept pixel - full opacity
            }

            // Apply dithering if enabled
            if (dither && (!mask || mask[y * w + x] === 1)) {
                const er = r - closest.r;
                const eg = g - closest.g;
                const eb = b - closest.b;
                distributeError(data, w, h, x, y, er, eg, eb);
            }
        }
    }

    return imageData;
}

/**
 * Apply spatial filter to remove small isolated regions
 * 
 * Filters out pixels that don't have enough similar-colored neighbors within
 * a given radius. This prevents unprintable small details in 3D prints.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/quantize/index.js:67-122
 * @param {ImageData} imageData - Image data to analyze
 * @param {Array<{r: number, g: number, b: number}>} palette - Palette for color matching
 * @param {number} minDetailMM - Minimum detail size in mm
 * @param {number} printWidth - Print width in mm
 * @returns {Uint8Array} Mask array where 1=keep pixel, 0=filter pixel
 * 
 * @example
 * const imageData = ctx.getImageData(0, 0, w, h);
 * const palette = [...];  // Your color palette
 * const mask = applyMinDetailFilter(imageData, palette, 1.0, 170);
 * 
 * // Use mask in quantization:
 * quantizeImage(imageData, palette, { dither: true, mask });
 * 
 * // Filtered pixels will be semi-transparent (alpha=128)
 * // Kept pixels will be fully opaque (alpha=255)
 */
export function applyMinDetailFilter(imageData, palette, minDetailMM, printWidth) {
    const w = imageData.width;
    const h = imageData.height;
    const mask = new Uint8Array(w * h).fill(1);

    // Calculate min detail in pixels
    const pixelsPerMM = w / printWidth;
    const minDetailPx = Math.round(minDetailMM * pixelsPerMM);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const centerColor = {
                r: imageData.data[i],
                g: imageData.data[i + 1],
                b: imageData.data[i + 2]
            };
            const centerClosest = findClosest(centerColor, palette);

            // Count similar neighbors in radius
            let sameCount = 0;
            let totalCount = 0;

            for (let dy = -minDetailPx; dy <= minDetailPx; dy++) {
                for (let dx = -minDetailPx; dx <= minDetailPx; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                        const ni = (ny * w + nx) * 4;
                        const neighborColor = {
                            r: imageData.data[ni],
                            g: imageData.data[ni + 1],
                            b: imageData.data[ni + 2]
                        };
                        const neighborClosest = findClosest(neighborColor, palette);

                        if (centerClosest.r === neighborClosest.r &&
                            centerClosest.g === neighborClosest.g &&
                            centerClosest.b === neighborClosest.b) {
                            sameCount++;
                        }
                        totalCount++;
                    }
                }
            }

            // Filter if less than 50% of neighbors are the same color
            if (sameCount < totalCount * 0.5) {
                mask[y * w + x] = 0;
            }
        }
    }

    return mask;
}

/**
 * Expand quantized image into per-layer, per-filament pixel sets
 * 
 * This is the critical step that converts a 2D quantized image into 3D printing
 * instructions. Each pixel's color is looked up in the sequence map to determine
 * which filament should be printed on which layer at that XY position.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/quantize/index.js:132-178
 * @param {ImageData} imageData - Quantized image data
 * @param {Map<string, Object>} sequenceMap - Map from rgb_to_key() to sequence data
 * @param {number} filamentCount - Number of filaments
 * @returns {Array<Array<Set<string>>>} layerMaps[layer][filament] = Set of "x,y" coords
 * 
 * @example
 * const imageData = quantizedImageData;
 * const sequenceMap = buildSequenceMap(sequences, colours, cols, { simColour, rgb_to_key });
 * const layerMaps = expandToLayers(imageData, sequenceMap, 4);
 * 
 * // Access pixels for layer 2, filament 1:
 * const pixels = layerMaps[2][1];  // Set<string> of "x,y" coordinates
 * 
 * // Check if specific pixel should be printed:
 * if (layerMaps[2][1].has('100,50')) {
 *   window.debugLog('INIT', 'Print filament 1 at (100,50) on layer 2');
 * }
 */
export function expandToLayers(imageData, sequenceMap, filamentCount) {
    const w = imageData.width;
    const h = imageData.height;
    const data = imageData.data;

    // Find max layers needed
    let maxLayers = 0;
    for (let seqData of sequenceMap.values()) {
        const layerCount = seqData.sequence.filter(v => v > 0).length;
        maxLayers = Math.max(maxLayers, layerCount);
    }

    // Initialize layer maps: [layer][filament] = Set of "x,y"
    const layerMaps = [];
    for (let li = 0; li < maxLayers; li++) {
        layerMaps[li] = Array(filamentCount).fill(null).map(() => new Set());
    }

    // Populate layer maps
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const pixelRGB = {
                r: data[i],
                g: data[i + 1],
                b: data[i + 2]
            };

            const key = rgb_to_key(pixelRGB);
            const seqData = sequenceMap.get(key);

            if (!seqData) continue;

            // Expand sequence into layers
            let layerIdx = 0;
            for (let seqValue of seqData.sequence) {
                if (seqValue > 0) {
                    const filIdx = seqValue - 1;
                    layerMaps[layerIdx][filIdx].add(`${x},${y}`);
                    layerIdx++;
                }
            }
        }
    }

    return layerMaps;
}

