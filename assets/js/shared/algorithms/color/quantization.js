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

            data[i] = closest.r;
            data[i + 1] = closest.g;
            data[i + 2] = closest.b;

            if (mask && mask[y * w + x] === 0) {
                data[i + 3] = 128;
            } else {
                data[i + 3] = 255;
            }

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
 * Apply spatial filter to remove small isolated regions.
 *
 * @param {ImageData} imageData - Image data to analyze
 * @param {Array<{r: number, g: number, b: number}>} palette - Palette for color matching
 * @param {number} minDetailMM - Minimum detail size in mm
 * @param {number} printWidth - Print width in mm
 * @returns {Uint8Array} Mask array where 1=keep pixel, 0=filter pixel
 */
export function applyMinDetailFilter(imageData, palette, minDetailMM, printWidth) {
    const w = imageData.width;
    const h = imageData.height;
    const mask = new Uint8Array(w * h).fill(1);

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

            if (sameCount < totalCount * 0.5) {
                mask[y * w + x] = 0;
            }
        }
    }

    return mask;
}

/**
 * Expand a quantized image into per-absolute-layer, per-filament pixel sets.
 *
 * Sequence array positions are physical Z positions. A value of 0 means an
 * intentional empty layer and must not cause later occupied layers to move down.
 * This legacy RGB-key API now follows the same absolute-layer contract as
 * MFP-RecipeIntegrity.buildAbsoluteLayerMaps().
 *
 * @param {ImageData} imageData - Quantized image data
 * @param {Map<string, Object>} sequenceMap - Map from rgb_to_key() to sequence data
 * @param {number} filamentCount - Number of filaments
 * @returns {Array<Array<Set<string>>>} layerMaps[layer][filament] = Set of "x,y" coords
 */
export function expandToLayers(imageData, sequenceMap, filamentCount) {
    const w = imageData.width;
    const h = imageData.height;
    const data = imageData.data;

    if (!Number.isInteger(filamentCount) || filamentCount < 1) {
        throw new TypeError('filamentCount must be an integer >= 1');
    }

    let maxLayers = 0;
    for (const seqData of sequenceMap.values()) {
        if (!seqData?.sequence || typeof seqData.sequence[Symbol.iterator] !== 'function') {
            throw new TypeError('sequenceMap entries must contain iterable sequence values');
        }
        maxLayers = Math.max(maxLayers, Array.from(seqData.sequence).length);
    }

    const layerMaps = Array.from({ length: Math.max(maxLayers, 1) }, () =>
        Array.from({ length: filamentCount }, () => new Set())
    );

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const key = rgb_to_key({ r: data[i], g: data[i + 1], b: data[i + 2] });
            const seqData = sequenceMap.get(key);
            if (!seqData) continue;

            const sequence = Array.from(seqData.sequence, Number);
            for (let absoluteLayer = 0; absoluteLayer < sequence.length; absoluteLayer++) {
                const filamentReference = sequence[absoluteLayer];
                if (!Number.isInteger(filamentReference) || filamentReference < 0) {
                    throw new TypeError(`sequence layer ${absoluteLayer} must be a non-negative integer`);
                }
                if (filamentReference === 0) continue;
                if (filamentReference > filamentCount) {
                    throw new RangeError(
                        `sequence layer ${absoluteLayer} references filament ${filamentReference}, ` +
                        `but filamentCount is ${filamentCount}`
                    );
                }
                layerMaps[absoluteLayer][filamentReference - 1].add(`${x},${y}`);
            }
        }
    }

    return layerMaps;
}
