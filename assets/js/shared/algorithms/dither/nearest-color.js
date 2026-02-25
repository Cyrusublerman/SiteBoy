/**
 * Nearest Color Quantization — No Dithering
 * 
 * Simple color quantization by finding nearest palette color in LAB space.
 * No dithering applied - each pixel mapped to single closest color.
 * 
 * @module algorithms/dither/nearest-color
 * @source reference/tools/New folder/colour3/src/script.js (doNoDitherLargePalette)
 * @wikipedia https://en.wikipedia.org/wiki/Color_quantization
 * @formula For each pixel: output = argmin(ΔE(pixel, palette[i]))
 */

import { deltaE76 } from '../color/color-space.js';

/**
 * Apply nearest color quantization (no dithering)
 * 
 * Maps each pixel to its nearest palette color using perceptual distance (Delta E)
 * in LAB color space. No error diffusion or patterned dithering applied.
 * 
 * @param {ImageData} imageData - Source image
 * @param {string[]} palette - Hex color palette
 * @param {Array<{L: number, a: number, b: number}>} paletteLabs - Palette in LAB space
 * @param {Object} colorSpace - Color space converter with rgbToLab and hexToRgb
 * @returns {ImageData} Quantized image
 * 
 * @example
 * const quantized = nearestColorQuantize(
 *     imageData,
 *     ['#000000', '#FFFFFF'],
 *     paletteLabs,
 *     colorSpace
 * );
 */
export function nearestColorQuantize(imageData, palette, paletteLabs, colorSpace) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);
    const convert  = colorSpace.convert || colorSpace.rgbToLab;
    const distFn   = colorSpace.distance || deltaE76;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        const converted = convert(r, g, b);

        let bestDist = Infinity;
        let bestIdx = 0;

        for (let j = 0; j < paletteLabs.length; j++) {
            const labP = paletteLabs[j];
            if (!labP) continue;

            const d = distFn(converted, labP);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = j;
                if (d < 0.001) break;
            }
        }

        // Safety check
        const safeIdx = (bestIdx >= 0 && bestIdx < palette.length) ? bestIdx : 0;
        if (bestIdx !== safeIdx) {
            console.warn(`Invalid index ${bestIdx} from pickNearest. Defaulting to 0.`);
        }

        // Get output color
        const { r: qr, g: qg, b: qb } = colorSpace.hexToRgb(palette[safeIdx]);
        output[i] = qr;
        output[i + 1] = qg;
        output[i + 2] = qb;
        output[i + 3] = a;
    }

    return new ImageData(output, width, height);
}

