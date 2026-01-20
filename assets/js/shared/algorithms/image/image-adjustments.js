/**
 * Image Adjustments — Gamma, Contrast, Saturation
 * 
 * Pre-processing adjustments applied before quantization/dithering.
 * All operations preserve alpha channel.
 * 
 * @module algorithms/image/image-adjustments
 * @source reference/tools/New folder/colour3/src/script.js (applyImageAdjustments)
 * @wikipedia https://en.wikipedia.org/wiki/Gamma_correction
 * @formula Gamma: output = (input/255)^(1/γ) × 255
 *          Contrast: output = ((input/255 - 0.5) × c + 0.5) × 255
 *          Saturation: output = gray + s × (input - gray), where gray = 0.2126R + 0.7152G + 0.0722B
 */

/**
 * Clamp value to valid range
 * @private
 */
function clamp(value, min = 0, max = 255) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Apply gamma correction to image
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} gamma - Gamma value (0.2-2.2, default 1.0)
 *                         <1 = brighten, >1 = darken
 * @returns {ImageData} Adjusted image
 * 
 * @source https://en.wikipedia.org/wiki/Gamma_correction
 * @formula output = (input/255)^(1/γ) × 255
 * 
 * @example
 * const brightened = applyGamma(imageData, 0.7);
 */
export function applyGamma(imageData, gamma) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    
    if (gamma === 1.0 || gamma <= 0) return new ImageData(output, width, height);
    
    const gammaExponent = 1.0 / gamma;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Alpha unchanged

        output[i] = clamp(Math.pow(r / 255.0, gammaExponent) * 255.0);
        output[i + 1] = clamp(Math.pow(g / 255.0, gammaExponent) * 255.0);
        output[i + 2] = clamp(Math.pow(b / 255.0, gammaExponent) * 255.0);
    }

    return new ImageData(output, width, height);
}

/**
 * Apply contrast adjustment to image
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} contrast - Contrast multiplier (0-2, default 1.0)
 *                            <1 = reduce contrast, >1 = increase contrast
 * @returns {ImageData} Adjusted image
 * 
 * @formula output = ((input/255 - 0.5) × contrast + 0.5) × 255
 * 
 * @example
 * const highContrast = applyContrast(imageData, 1.5);
 */
export function applyContrast(imageData, contrast) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    
    if (contrast === 1.0) return new ImageData(output, width, height);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        output[i] = clamp(((r / 255.0 - 0.5) * contrast + 0.5) * 255.0);
        output[i + 1] = clamp(((g / 255.0 - 0.5) * contrast + 0.5) * 255.0);
        output[i + 2] = clamp(((b / 255.0 - 0.5) * contrast + 0.5) * 255.0);
    }

    return new ImageData(output, width, height);
}

/**
 * Apply saturation adjustment to image
 * 
 * @param {ImageData} imageData - Source image
 * @param {number} saturation - Saturation multiplier (0-2, default 1.0)
 *                              0 = grayscale, 1 = original, >1 = oversaturated
 * @returns {ImageData} Adjusted image
 * 
 * @formula gray = 0.2126R + 0.7152G + 0.0722B (ITU-R BT.709 luma coefficients)
 *          output = gray + saturation × (input - gray)
 * 
 * @example
 * const grayscale = applySaturation(imageData, 0);
 * const vibrant = applySaturation(imageData, 1.5);
 */
export function applySaturation(imageData, saturation) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    
    if (saturation === 1.0) return new ImageData(output, width, height);

    // ITU-R BT.709 luma coefficients
    const lumR = 0.2126;
    const lumG = 0.7152;
    const lumB = 0.0722;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate luminance (grayscale value)
        const gray = r * lumR + g * lumG + b * lumB;

        // Interpolate between gray and original color
        output[i] = clamp(gray + saturation * (r - gray));
        output[i + 1] = clamp(gray + saturation * (g - gray));
        output[i + 2] = clamp(gray + saturation * (b - gray));
    }

    return new ImageData(output, width, height);
}

/**
 * Apply all adjustments (gamma, contrast, saturation) to image
 * 
 * Applies adjustments in order: saturation → contrast → gamma.
 * This order prevents clipping artifacts.
 * 
 * @param {ImageData} imageData - Source image
 * @param {{gamma?: number, contrast?: number, saturation?: number}} adjustments
 * @returns {ImageData} Adjusted image
 * 
 * @example
 * const adjusted = applyAllAdjustments(imageData, {
 *     gamma: 0.9,
 *     contrast: 1.2,
 *     saturation: 0.8
 * });
 */
export function applyAllAdjustments(imageData, adjustments = {}) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data);
    
    const gamma = adjustments.gamma ?? 1.0;
    const contrast = adjustments.contrast ?? 1.0;
    const saturation = adjustments.saturation ?? 1.0;
    
    // Early exit if no adjustments
    if (gamma === 1.0 && contrast === 1.0 && saturation === 1.0) {
        return new ImageData(output, width, height);
    }

    const gammaExponent = (gamma === 0) ? Infinity : 1.0 / gamma;
    
    // ITU-R BT.709 luma coefficients
    const lumR = 0.2126;
    const lumG = 0.7152;
    const lumB = 0.0722;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // 1. Saturation
        if (saturation !== 1.0) {
            const gray = r * lumR + g * lumG + b * lumB;
            r = clamp(gray + saturation * (r - gray));
            g = clamp(gray + saturation * (g - gray));
            b = clamp(gray + saturation * (b - gray));
        }

        // 2. Contrast
        if (contrast !== 1.0) {
            r = clamp(((r / 255.0 - 0.5) * contrast + 0.5) * 255.0);
            g = clamp(((g / 255.0 - 0.5) * contrast + 0.5) * 255.0);
            b = clamp(((b / 255.0 - 0.5) * contrast + 0.5) * 255.0);
        }

        // 3. Gamma
        if (gamma !== 1.0 && gamma > 0) {
            r = clamp(Math.pow(r / 255.0, gammaExponent) * 255.0);
            g = clamp(Math.pow(g / 255.0, gammaExponent) * 255.0);
            b = clamp(Math.pow(b / 255.0, gammaExponent) * 255.0);
        }

        output[i] = Math.round(r);
        output[i + 1] = Math.round(g);
        output[i + 2] = Math.round(b);
        // Alpha unchanged (data[i + 3])
    }

    return new ImageData(output, width, height);
}

