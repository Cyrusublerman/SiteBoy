/**
 * Palette Extraction - Median Cut, K-means, Histogram
 *
 * Extracts representative colours from an image to build a palette.
 * Pure functions only, no side effects.
 *
 * @module algorithms/color/palette-extraction
 */

import { rgb2hex } from './color-utils.js';

/**
 * Sample pixels from ImageData with optional downsampling.
 * @param {ImageData} imageData
 * @param {number} maxSamples
 * @returns {Array<{r: number, g: number, b: number}>}
 */
function samplePixels(imageData, maxSamples) {
    const { width, height, data } = imageData;
    const total = width * height;
    const stride = Math.max(1, Math.floor(total / maxSamples));
    const pixels = [];

    for (let i = 0; i < total; i += stride) {
        const idx = i * 4;
        const a = data[idx + 3];
        if (a === 0) continue;
        pixels.push({
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
        });
    }

    return pixels;
}

/**
 * Compute mean colour of a pixel bucket.
 * @param {Array<{r: number, g: number, b: number}>} bucket
 * @returns {{r: number, g: number, b: number}}
 */
function meanColour(bucket) {
    let r = 0;
    let g = 0;
    let b = 0;
    const count = bucket.length || 1;

    for (let i = 0; i < bucket.length; i++) {
        r += bucket[i].r;
        g += bucket[i].g;
        b += bucket[i].b;
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
    };
}

/**
 * Find channel with largest range in a bucket.
 * @param {Array<{r: number, g: number, b: number}>} bucket
 * @returns {'r'|'g'|'b'}
 */
function largestRangeChannel(bucket) {
    let rMin = 255, rMax = 0;
    let gMin = 255, gMax = 0;
    let bMin = 255, bMax = 0;

    for (let i = 0; i < bucket.length; i++) {
        const p = bucket[i];
        if (p.r < rMin) rMin = p.r;
        if (p.r > rMax) rMax = p.r;
        if (p.g < gMin) gMin = p.g;
        if (p.g > gMax) gMax = p.g;
        if (p.b < bMin) bMin = p.b;
        if (p.b > bMax) bMax = p.b;
    }

    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;

    if (gRange >= rRange && gRange >= bRange) return 'g';
    if (rRange >= gRange && rRange >= bRange) return 'r';
    return 'b';
}

/**
 * Extract palette using Median Cut.
 *
 * @source blog/ideas/reference documentation/15_Colour_Perceptual_Models/Median_cut.md
 * @wikipedia https://en.wikipedia.org/wiki/Median_cut
 * @formula range_c = max(c) - min(c); split bucket at median of longest range channel
 *
 * @param {ImageData} imageData
 * @param {number} numColours
 * @param {number} [maxSamples=50000]
 * @returns {string[]} Array of hex colours
 */
export function extractMedianCut(imageData, numColours, maxSamples = 50000) {
    const pixels = samplePixels(imageData, maxSamples);
    if (pixels.length === 0) return ['#000000'];

    let buckets = [pixels];
    while (buckets.length < numColours) {
        // Find bucket with largest range
        let largestIndex = -1;
        let largestRange = -1;

        for (let i = 0; i < buckets.length; i++) {
            const bucket = buckets[i];
            if (bucket.length < 2) continue;
            const channel = largestRangeChannel(bucket);
            let min = 255, max = 0;
            for (let j = 0; j < bucket.length; j++) {
                const v = bucket[j][channel];
                if (v < min) min = v;
                if (v > max) max = v;
            }
            const range = max - min;
            if (range > largestRange) {
                largestRange = range;
                largestIndex = i;
            }
        }

        if (largestIndex === -1) break;

        const bucket = buckets[largestIndex];
        const channel = largestRangeChannel(bucket);
        bucket.sort((a, b) => a[channel] - b[channel]);

        const mid = Math.floor(bucket.length / 2);
        const left = bucket.slice(0, mid);
        const right = bucket.slice(mid);

        buckets.splice(largestIndex, 1, left, right);
    }

    return buckets.map((bucket) => rgb2hex(meanColour(bucket)));
}

/**
 * Extract palette using K-means clustering.
 *
 * @source blog/ideas/reference documentation/15_Colour_Perceptual_Models/Color_quantization.md
 * @wikipedia https://en.wikipedia.org/wiki/K-means_clustering
 * @formula min sum ||x_i - mu_k||^2; mu_k = (1/|C_k|) sum x_i
 *
 * @param {ImageData} imageData
 * @param {number} numColours
 * @param {number} [maxIterations=20]
 * @param {number} [maxSamples=40000]
 * @returns {string[]} Array of hex colours
 */
export function extractKMeans(imageData, numColours, maxIterations = 20, maxSamples = 40000) {
    const pixels = samplePixels(imageData, maxSamples);
    if (pixels.length === 0) return ['#000000'];

    // Initialise centroids using random pixels
    const centroids = [];
    const used = new Set();
    while (centroids.length < numColours && centroids.length < pixels.length) {
        const idx = Math.floor(Math.random() * pixels.length);
        if (used.has(idx)) continue;
        used.add(idx);
        centroids.push({ r: pixels[idx].r, g: pixels[idx].g, b: pixels[idx].b });
    }

    const assignments = new Array(pixels.length);
    for (let iter = 0; iter < maxIterations; iter++) {
        const sums = new Array(centroids.length).fill(0).map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
        let changed = false;

        for (let i = 0; i < pixels.length; i++) {
            const p = pixels[i];
            let best = 0;
            let bestDist = Infinity;

            for (let c = 0; c < centroids.length; c++) {
                const dx = p.r - centroids[c].r;
                const dy = p.g - centroids[c].g;
                const dz = p.b - centroids[c].b;
                const dist = dx * dx + dy * dy + dz * dz;
                if (dist < bestDist) {
                    bestDist = dist;
                    best = c;
                }
            }

            if (assignments[i] !== best) {
                assignments[i] = best;
                changed = true;
            }

            sums[best].r += p.r;
            sums[best].g += p.g;
            sums[best].b += p.b;
            sums[best].count += 1;
        }

        for (let c = 0; c < centroids.length; c++) {
            if (sums[c].count === 0) {
                const idx = Math.floor(Math.random() * pixels.length);
                centroids[c] = { r: pixels[idx].r, g: pixels[idx].g, b: pixels[idx].b };
                changed = true;
                continue;
            }
            centroids[c] = {
                r: Math.round(sums[c].r / sums[c].count),
                g: Math.round(sums[c].g / sums[c].count),
                b: Math.round(sums[c].b / sums[c].count),
            };
        }

        if (!changed) break;
    }

    return centroids.map((c) => rgb2hex(c));
}

/**
 * Extract palette using histogram popularity (most common colours).
 *
 * @source blog/ideas/reference documentation/15_Colour_Perceptual_Models/Color_quantization.md
 * @wikipedia https://en.wikipedia.org/wiki/Color_quantization
 * @formula count(c) = sum 1_{pixel=c}; select top-k by frequency
 *
 * @param {ImageData} imageData
 * @param {number} numColours
 * @param {number} [quantBits=5] - Bits per channel for histogram bins (5=32 levels)
 * @returns {string[]} Array of hex colours
 */
export function extractHistogram(imageData, numColours, quantBits = 5) {
    const { data, width, height } = imageData;
    const total = width * height;
    const bins = new Map();
    const shift = 8 - quantBits;
    const maxLevel = (1 << quantBits) - 1;

    for (let i = 0; i < total; i++) {
        const idx = i * 4;
        const a = data[idx + 3];
        if (a === 0) continue;

        const r = data[idx] >> shift;
        const g = data[idx + 1] >> shift;
        const b = data[idx + 2] >> shift;
        const key = (r << (quantBits * 2)) | (g << quantBits) | b;
        bins.set(key, (bins.get(key) || 0) + 1);
    }

    const sorted = Array.from(bins.entries()).sort((a, b) => b[1] - a[1]);
    const colours = [];

    for (let i = 0; i < Math.min(numColours, sorted.length); i++) {
        const key = sorted[i][0];
        const r = (key >> (quantBits * 2)) & maxLevel;
        const g = (key >> quantBits) & maxLevel;
        const b = key & maxLevel;

        const fullR = Math.round((r / maxLevel) * 255);
        const fullG = Math.round((g / maxLevel) * 255);
        const fullB = Math.round((b / maxLevel) * 255);
        colours.push(rgb2hex({ r: fullR, g: fullG, b: fullB }));
    }

    return colours;
}
