/**
 * Ordered Dithering — Bayer Matrices & Patterns
 * 
 * Ordered dithering using threshold matrices (Bayer, halftone, checkerboard, etc.).
 * Produces regular, repeating patterns without memory usage of error diffusion.
 * 
 * @module algorithms/dither/ordered
 * @source reference/tools/New folder/dithermark-master/.../bayer-matrix.js
 * @wikipedia https://en.wikipedia.org/wiki/Ordered_dithering
 * @formula threshold = (matrix[y%n][x%n] / (n²-1)) * 255
 *          if (pixel + threshold > 127.5) → white else → black
 */

import { deltaE76 } from '../color/color-space.js';

// ═══════════════════════════════════════════════════════════════════
// MATRIX GENERATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate Bayer matrix of given dimensions (power of 2)
 * 
 * Recursive definition: M(2n) = [ 4M(n)+0  4M(n)+2 ]
 *                                [ 4M(n)+3  4M(n)+1 ]
 * Base case: M(2) = [0 2]
 *                   [3 1]
 * 
 * @param {number} dimensions - Power of 2 (2, 4, 8, 16, etc.)
 * @returns {Uint8Array} Flat array of matrix values
 * 
 * @source https://en.wikipedia.org/wiki/Ordered_dithering#Threshold_map
 */
export function bayerMatrix(dimensions) {
    const bayerBase = new Uint8Array([0, 2, 3, 1]);

    if (dimensions <= 2) {
        return bayerBase;
    }

    let currentDimension = 2;
    let bayerArray = new Uint8Array(bayerBase);

    while (currentDimension < dimensions) {
        const sectionDimensions = currentDimension;
        currentDimension *= 2;
        const subarrayLength = currentDimension * currentDimension;
        const newBayerArray = new Uint8Array(subarrayLength);

        // Cycle through 4 quadrants clockwise from top-left
        for (let i = 0; i < 4; i++) {
            let destOffset = 0;
            
            // Bottom two quadrants
            if (i > 1) {
                destOffset += subarrayLength / 2;
            }
            
            // Right two quadrants
            if (i % 2 !== 0) {
                destOffset += sectionDimensions;
            }

            let j = 0;
            for (let y = 0; y < sectionDimensions; y++) {
                for (let x = 0; x < sectionDimensions; x++) {
                    const destIndex = x + destOffset;
                    newBayerArray[destIndex] = bayerArray[j] * 4 + bayerBase[i];
                    j++;
                }
                destOffset += currentDimension;
            }
        }
        
        bayerArray = newBayerArray;
    }
    
    return bayerArray;
}

/**
 * Halftone dot pattern (newspaper-style)
 * 
 * @source http://caca.zoy.org/study/part2.html
 * @returns {Uint8Array} 8×8 pattern
 */
export function halftoneMatrix() {
    return new Uint8Array([
        24, 10, 12, 26, 35, 47, 49, 37,
        8, 0, 2, 14, 45, 59, 61, 51,
        22, 6, 4, 16, 43, 57, 63, 53,
        30, 20, 18, 28, 33, 41, 55, 39,
        34, 46, 48, 36, 25, 11, 13, 27,
        44, 58, 60, 50, 9, 1, 3, 15,
        42, 56, 62, 52, 23, 7, 5, 17,
        32, 40, 54, 38, 31, 21, 19, 29,
    ]);
}

/**
 * Checkerboard pattern (2×2)
 */
export function checkerboardMatrix() {
    return new Uint8Array([1, 2, 2, 1]);
}

/**
 * Cluster dot pattern (4×4)
 * 
 * @source http://research.cs.wisc.edu/graphics/Courses/559-f2004/lectures/cs559-5.ppt
 */
export function clusterMatrix() {
    return new Uint8Array([
        11, 5, 9, 3,
        0, 15, 13, 6,
        7, 12, 14, 1,
        2, 8, 4, 10,
    ]);
}

/**
 * Horizontal hatch pattern (4×4)
 */
export function hatchHorizontalMatrix() {
    return new Uint8Array([
        7, 15, 7, 0,
        7, 15, 7, 0,
        7, 15, 7, 0,
        7, 15, 7, 0,
    ]);
}

/**
 * Vertical hatch pattern (4×4)
 */
export function hatchVerticalMatrix() {
    return new Uint8Array([
        7, 0, 7, 15,
        7, 0, 7, 15,
        7, 0, 7, 15,
        7, 0, 7, 15,
    ]);
}

// ═══════════════════════════════════════════════════════════════════
// ORDERED DITHER ENGINE
// ═══════════════════════════════════════════════════════════════════

/**
 * Apply ordered dithering using threshold matrix
 * 
 * @param {ImageData} imageData - Source image
 * @param {string[]} palette - Hex color palette
 * @param {Array<{L: number, a: number, b: number}>} paletteLabs - Palette in LAB space
 * @param {Uint8Array} matrix - Threshold matrix
 * @param {number} dimensions - Matrix dimensions (e.g., 4 for 4×4)
 * @param {Object} colorSpace - Color space converter
 * @returns {ImageData} Dithered image
 * 
 * @example
 * const bayer4 = bayerMatrix(4);
 * const dithered = orderedDither(imageData, palette, paletteLabs, bayer4, 4, colorSpace);
 */
export function orderedDither(
    imageData,
    palette,
    paletteLabs,
    matrix,
    dimensions,
    colorSpace
) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);
    const convert = colorSpace.convert || colorSpace.rgbToLab;
    const distFn  = colorSpace.distance || deltaE76;
    const matrixMax = dimensions * dimensions - 1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i4 = (y * width + x) * 4;
            const r = data[i4];
            const g = data[i4 + 1];
            const b = data[i4 + 2];
            const a = data[i4 + 3];

            const matrixX = x % dimensions;
            const matrixY = y % dimensions;
            const matrixIndex = matrixY * dimensions + matrixX;
            const threshold = (matrix[matrixIndex] / matrixMax) - 0.5;

            const thresholdValue = threshold * 255;
            const adjR = Math.max(0, Math.min(255, r + thresholdValue));
            const adjG = Math.max(0, Math.min(255, g + thresholdValue));
            const adjB = Math.max(0, Math.min(255, b + thresholdValue));

            const converted = convert(adjR, adjG, adjB);
            let bestDist = Infinity;
            let bestIdx = 0;

            for (let j = 0; j < paletteLabs.length; j++) {
                const d = distFn(converted, paletteLabs[j]);
                if (d < bestDist) {
                    bestDist = d;
                    bestIdx = j;
                    if (d < 0.001) break;
                }
            }

            // Get output color
            const { r: qr, g: qg, b: qb } = colorSpace.hexToRgb(palette[bestIdx]);
            output[i4] = qr;
            output[i4 + 1] = qg;
            output[i4 + 2] = qb;
            output[i4 + 3] = a;
        }
    }

    return new ImageData(output, width, height);
}

// ═══════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Bayer 2×2 dithering
 */
export function bayer2x2(imageData, palette, paletteLabs, colorSpace) {
    return orderedDither(imageData, palette, paletteLabs, bayerMatrix(2), 2, colorSpace);
}

/**
 * Bayer 4×4 dithering (most common)
 */
export function bayer4x4(imageData, palette, paletteLabs, colorSpace) {
    return orderedDither(imageData, palette, paletteLabs, bayerMatrix(4), 4, colorSpace);
}

/**
 * Bayer 8×8 dithering
 */
export function bayer8x8(imageData, palette, paletteLabs, colorSpace) {
    return orderedDither(imageData, palette, paletteLabs, bayerMatrix(8), 8, colorSpace);
}

/**
 * Halftone dithering (newspaper style)
 */
export function halftone(imageData, palette, paletteLabs, colorSpace) {
    return orderedDither(imageData, palette, paletteLabs, halftoneMatrix(), 8, colorSpace);
}

/**
 * Checkerboard dithering
 */
export function checkerboard(imageData, palette, paletteLabs, colorSpace) {
    return orderedDither(imageData, palette, paletteLabs, checkerboardMatrix(), 2, colorSpace);
}

/**
 * Cluster dot dithering
 */
export function cluster(imageData, palette, paletteLabs, colorSpace) {
    return orderedDither(imageData, palette, paletteLabs, clusterMatrix(), 4, colorSpace);
}

/**
 * Horizontal hatch dithering
 */
export function hatchHorizontal(imageData, palette, paletteLabs, colorSpace) {
    return orderedDither(imageData, palette, paletteLabs, hatchHorizontalMatrix(), 4, colorSpace);
}

/**
 * Vertical hatch dithering
 */
export function hatchVertical(imageData, palette, paletteLabs, colorSpace) {
    return orderedDither(imageData, palette, paletteLabs, hatchVerticalMatrix(), 4, colorSpace);
}

