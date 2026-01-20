/**
 * Error Diffusion Dithering — Floyd-Steinberg, Atkinson, etc.
 * 
 * Error diffusion algorithms that propagate quantization error to neighboring
 * pixels, producing organic dither patterns with diagonal grain.
 * 
 * @module algorithms/dither/error-diffusion
 * @source reference/tools/New folder/dithermark-master/.../error-prop.js
 * @wikipedia https://en.wikipedia.org/wiki/Error_diffusion
 * @formula For each pixel:
 *   error = pixel - quantized
 *   distribute error to neighbors according to diffusion matrix
 */

import { deltaE76 } from '../color/color-space.js';

// ═══════════════════════════════════════════════════════════════════
// ERROR PROPAGATION MODELS
// ═══════════════════════════════════════════════════════════════════

/**
 * Floyd-Steinberg diffusion matrix
 * 
 * @source https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
 * @formula
 *       X  7/16
 *   3/16 5/16 1/16
 * 
 * @returns {{matrix: Array, lengthOffset: number, numRows: number}}
 */
function floydSteinbergModel() {
    const e1 = 1 / 16;
    return {
        matrix: [
            [7 * e1, 1, 0],  // [fraction, xOffset, yOffset]
            [1 * e1, 1, 1],
            [5 * e1, 0, 1],
            [3 * e1, -1, 1],
        ],
        lengthOffset: 1,
        numRows: 2,
    };
}

/**
 * Atkinson diffusion matrix
 * 
 * @source https://en.wikipedia.org/wiki/Atkinson_dithering
 * @formula
 *       X  1/8 1/8
 *   1/8 1/8 1/8
 *       1/8
 * 
 * Sum < 1 (only 6/8), produces high contrast with reduced bleed
 */
function atkinsonModel() {
    const e1 = 1 / 8;
    return {
        matrix: [
            [e1, 1, 0],
            [e1, 2, 0],
            [e1, -1, 1],
            [e1, 0, 1],
            [e1, 1, 1],
            [e1, 0, 2],
        ],
        lengthOffset: 2,
        numRows: 3,
    };
}

/**
 * Jarvis-Judice-Ninke diffusion matrix
 * 
 * @formula
 *           X  7/48 5/48
 *   3/48 5/48 7/48 5/48 3/48
 *   1/48 3/48 5/48 3/48 1/48
 */
function javisJudiceNinkeModel() {
    const e1 = 1 / 48;
    return {
        matrix: [
            [7 * e1, 1, 0],
            [5 * e1, 2, 0],
            [3 * e1, -2, 1],
            [5 * e1, -1, 1],
            [7 * e1, 0, 1],
            [5 * e1, 1, 1],
            [3 * e1, 2, 1],
            [1 * e1, -2, 2],
            [3 * e1, -1, 2],
            [5 * e1, 0, 2],
            [3 * e1, 1, 2],
            [1 * e1, 2, 2],
        ],
        lengthOffset: 2,
        numRows: 3,
    };
}

/**
 * Stucki diffusion matrix
 * 
 * @formula
 *           X  8/42 4/42
 *   2/42 4/42 8/42 4/42 2/42
 *   1/42 2/42 4/42 2/42 1/42
 */
function stuckiModel() {
    const e1 = 1 / 42;
    return {
        matrix: [
            [8 * e1, 1, 0],
            [4 * e1, 2, 0],
            [2 * e1, -2, 1],
            [4 * e1, -1, 1],
            [8 * e1, 0, 1],
            [4 * e1, 1, 1],
            [2 * e1, 2, 1],
            [1 * e1, -2, 2],
            [2 * e1, -1, 2],
            [4 * e1, 0, 2],
            [2 * e1, 1, 2],
            [1 * e1, 2, 2],
        ],
        lengthOffset: 2,
        numRows: 3,
    };
}

/**
 * Burkes diffusion matrix
 * 
 * @formula
 *           X  8/32 4/32
 *   2/32 4/32 8/32 4/32 2/32
 */
function burkesModel() {
    const e1 = 1 / 32;
    return {
        matrix: [
            [8 * e1, 1, 0],
            [4 * e1, 2, 0],
            [2 * e1, -2, 1],
            [4 * e1, -1, 1],
            [8 * e1, 0, 1],
            [4 * e1, 1, 1],
            [2 * e1, 2, 1],
        ],
        lengthOffset: 2,
        numRows: 2,
    };
}

/**
 * Sierra-3 diffusion matrix
 * 
 * @formula
 *           X  5/32 3/32
 *   2/32 4/32 5/32 4/32 2/32
 *       2/32 3/32 2/32
 */
function sierra3Model() {
    const e1 = 1 / 32;
    return {
        matrix: [
            [5 * e1, 1, 0],
            [3 * e1, 2, 0],
            [2 * e1, -2, 1],
            [4 * e1, -1, 1],
            [5 * e1, 0, 1],
            [4 * e1, 1, 1],
            [2 * e1, 2, 1],
            [2 * e1, -1, 2],
            [3 * e1, 0, 2],
            [2 * e1, 1, 2],
        ],
        lengthOffset: 2,
        numRows: 3,
    };
}

// ═══════════════════════════════════════════════════════════════════
// ERROR DIFFUSION ENGINE
// ═══════════════════════════════════════════════════════════════════

/**
 * Create error propagation matrix
 * @private
 */
function createErrorMatrix(width, numRows, lengthOffset) {
    const rowLength = width + (lengthOffset * 2);
    const ret = {};

    for (let i = 0; i < numRows; i++) {
        ret[i] = new Float32Array(rowLength);
    }

    return ret;
}

/**
 * Apply error diffusion dithering
 * @private
 */
function applyErrorDiffusion(
    imageData,
    palette,
    paletteLabs,
    colorSpace,
    errorPropModel
) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);

    // Create error buffers for R, G, B channels
    const errorR = createErrorMatrix(width, errorPropModel.numRows, errorPropModel.lengthOffset);
    const errorG = createErrorMatrix(width, errorPropModel.numRows, errorPropModel.lengthOffset);
    const errorB = createErrorMatrix(width, errorPropModel.numRows, errorPropModel.lengthOffset);

    let errorMatrixIndex = errorPropModel.lengthOffset;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i4 = (y * width + x) * 4;

            // Get original color + accumulated error
            let r = data[i4] + errorR[0][errorMatrixIndex];
            let g = data[i4 + 1] + errorG[0][errorMatrixIndex];
            let b = data[i4 + 2] + errorB[0][errorMatrixIndex];
            const a = data[i4 + 3];

            // Clamp to valid range
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));

            // Convert to LAB and find nearest palette color
            const labPix = colorSpace.rgbToLab(r, g, b);
            let bestDist = Infinity;
            let bestIdx = 0;

            for (let j = 0; j < paletteLabs.length; j++) {
                const d = deltaE76(labPix, paletteLabs[j]);
                if (d < bestDist) {
                    bestDist = d;
                    bestIdx = j;
                    if (d < 0.001) break;
                }
            }

            // Get quantized color
            const { r: qr, g: qg, b: qb } = colorSpace.hexToRgb(palette[bestIdx]);

            // Calculate quantization error
            const errR = r - qr;
            const errG = g - qg;
            const errB = b - qb;

            // Propagate error to neighbors
            for (let i = 0; i < errorPropModel.matrix.length; i++) {
                const [fraction, xOffset, yOffset] = errorPropModel.matrix[i];
                const targetX = errorMatrixIndex + xOffset;

                errorR[yOffset][targetX] += errR * fraction;
                errorG[yOffset][targetX] += errG * fraction;
                errorB[yOffset][targetX] += errB * fraction;
            }

            // Write output
            output[i4] = qr;
            output[i4 + 1] = qg;
            output[i4 + 2] = qb;
            output[i4 + 3] = a;

            errorMatrixIndex++;
        }

        // End of row: rotate error buffers
        errorMatrixIndex = errorPropModel.lengthOffset;

        const tempR = errorR[0];
        const tempG = errorG[0];
        const tempB = errorB[0];
        tempR.fill(0);
        tempG.fill(0);
        tempB.fill(0);

        const length = Object.keys(errorR).length;
        for (let i = 1; i < length; i++) {
            errorR[i - 1] = errorR[i];
            errorG[i - 1] = errorG[i];
            errorB[i - 1] = errorB[i];
        }
        errorR[length - 1] = tempR;
        errorG[length - 1] = tempG;
        errorB[length - 1] = tempB;
    }

    return new ImageData(output, width, height);
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════

/**
 * Floyd-Steinberg error diffusion dithering
 * 
 * Most common error diffusion algorithm. Produces diagonal grain pattern.
 * 
 * @param {ImageData} imageData - Source image
 * @param {string[]} palette - Hex color palette
 * @param {Array<{L: number, a: number, b: number}>} paletteLabs - Palette in LAB space
 * @param {Object} colorSpace - Color space converter
 * @returns {ImageData} Dithered image
 */
export function floydSteinberg(imageData, palette, paletteLabs, colorSpace) {
    return applyErrorDiffusion(imageData, palette, paletteLabs, colorSpace, floydSteinbergModel());
}

/**
 * Atkinson error diffusion dithering
 * 
 * High contrast with reduced bleed. Popular for 1-bit black & white images.
 * Sum of error fractions < 1 (only 6/8).
 * 
 * @param {ImageData} imageData - Source image
 * @param {string[]} palette - Hex color palette
 * @param {Array<{L: number, a: number, b: number}>} paletteLabs - Palette in LAB space
 * @param {Object} colorSpace - Color space converter
 * @returns {ImageData} Dithered image
 */
export function atkinson(imageData, palette, paletteLabs, colorSpace) {
    return applyErrorDiffusion(imageData, palette, paletteLabs, colorSpace, atkinsonModel());
}

/**
 * Jarvis-Judice-Ninke error diffusion
 * 
 * Wider diffusion pattern (5x3 kernel). Smoother gradients than Floyd-Steinberg.
 */
export function javisJudiceNinke(imageData, palette, paletteLabs, colorSpace) {
    return applyErrorDiffusion(imageData, palette, paletteLabs, colorSpace, javisJudiceNinkeModel());
}

/**
 * Stucki error diffusion
 * 
 * Very wide diffusion (5x3 kernel). Produces smooth, organic patterns.
 */
export function stucki(imageData, palette, paletteLabs, colorSpace) {
    return applyErrorDiffusion(imageData, palette, paletteLabs, colorSpace, stuckiModel());
}

/**
 * Burkes error diffusion
 * 
 * Similar to Stucki but with 2 rows instead of 3. Good balance of speed and quality.
 */
export function burkes(imageData, palette, paletteLabs, colorSpace) {
    return applyErrorDiffusion(imageData, palette, paletteLabs, colorSpace, burkesModel());
}

/**
 * Sierra-3 error diffusion
 * 
 * Three-row Sierra filter. Good general purpose algorithm.
 */
export function sierra3(imageData, palette, paletteLabs, colorSpace) {
    return applyErrorDiffusion(imageData, palette, paletteLabs, colorSpace, sierra3Model());
}

