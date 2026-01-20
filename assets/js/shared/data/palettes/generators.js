/**
 * Palette Generators
 * 
 * Functions to dynamically generate colour palettes based on various algorithms.
 */

import { rgbToHex, hslToHex, hslToRgb } from './utils.js';

/**
 * Generate uniformly quantized RGB palette
 * @param {number} bitsPerChannel - 1-8 bits per channel
 * @returns {string[]} Array of hex colours
 * 
 * @example
 * generateRGBQuantized(2) // Returns 2³ = 8 colours
 * // ['#000000', '#0000FF', '#00FF00', '#00FFFF', '#FF0000', '#FF00FF', '#FFFF00', '#FFFFFF']
 */
export function generateRGBQuantized(bitsPerChannel) {
    const levels = Math.pow(2, bitsPerChannel);
    const step = 255 / (levels - 1);
    const colours = [];
    
    for (let r = 0; r < levels; r++) {
        for (let g = 0; g < levels; g++) {
            for (let b = 0; b < levels; b++) {
                const rVal = Math.round(r * step);
                const gVal = Math.round(g * step);
                const bVal = Math.round(b * step);
                colours.push(rgbToHex(rVal, gVal, bVal));
            }
        }
    }
    
    return colours;
}

/**
 * Generate HSL colour wheel palette
 * @param {number} numHues - Number of hues (3-360)
 * @param {number} saturation - Saturation 0-100 (default 100)
 * @param {number} lightness - Lightness 0-100 (default 50)
 * @returns {string[]} Array of hex colours
 * 
 * @example
 * generateHSLWheel(12, 100, 50) // 12 evenly-spaced hues at full saturation
 */
export function generateHSLWheel(numHues, saturation = 100, lightness = 50) {
    const colours = [];
    const hueStep = 360 / numHues;
    
    for (let i = 0; i < numHues; i++) {
        const hue = i * hueStep;
        colours.push(hslToHex(hue, saturation, lightness));
    }
    
    return colours;
}

/**
 * Generate linear grayscale palette
 * @param {number} steps - Number of grey levels (2-256)
 * @returns {string[]} Array of hex colours
 * 
 * @example
 * generateLinearGrayscale(4) // ['#000000', '#555555', '#AAAAAA', '#FFFFFF']
 */
export function generateLinearGrayscale(steps) {
    const colours = [];
    const stepSize = 255 / (steps - 1);
    
    for (let i = 0; i < steps; i++) {
        const value = Math.round(i * stepSize);
        colours.push(rgbToHex(value, value, value));
    }
    
    return colours;
}

/**
 * Generate perceptually uniform grayscale (gamma-corrected)
 * @param {number} steps - Number of grey levels (2-256)
 * @param {number} gamma - Gamma correction value (default 2.2)
 * @returns {string[]} Array of hex colours
 * 
 * @example
 * generatePerceptualGrayscale(8) // More evenly-spaced perceived brightness
 */
export function generatePerceptualGrayscale(steps, gamma = 2.2) {
    const colours = [];
    
    for (let i = 0; i < steps; i++) {
        const linear = i / (steps - 1);
        const corrected = Math.pow(linear, 1 / gamma);
        const value = Math.round(corrected * 255);
        colours.push(rgbToHex(value, value, value));
    }
    
    return colours;
}

/**
 * Generate logarithmic grayscale (more darks)
 * @param {number} steps - Number of grey levels (2-256)
 * @returns {string[]} Array of hex colours
 */
export function generateLogarithmicGrayscale(steps) {
    const colours = [];
    
    for (let i = 0; i < steps; i++) {
        const linear = i / (steps - 1);
        const log = (Math.exp(linear * 3) - 1) / (Math.exp(3) - 1); // Exponential scaling
        const value = Math.round(log * 255);
        colours.push(rgbToHex(value, value, value));
    }
    
    return colours;
}

/**
 * Generate temperature ramp (warm to cool)
 * @param {number} steps - Number of temperature steps
 * @returns {string[]} Array of hex colours
 * 
 * @example
 * generateTemperatureRamp(8) // Orange → Yellow → Green → Cyan → Blue
 */
export function generateTemperatureRamp(steps) {
    const colours = [];
    
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        
        // Map from warm (hue 30°) to cool (hue 210°)
        const hue = 30 + t * 180;
        colours.push(hslToHex(hue, 100, 50));
    }
    
    return colours;
}

/**
 * Generate blackbody radiation palette (physical temperature colours)
 * @param {number} steps - Number of temperature steps
 * @returns {string[]} Array of hex colours
 * 
 * Based on Planck's law approximation:
 * Red-hot (1000K) → Orange (2000K) → Yellow (3000K) → White (6000K) → Blue (10000K)
 */
export function generateBlackbodyPalette(steps) {
    const colours = [];
    
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        
        // Temperature range: 1000K to 10000K
        const temp = 1000 + t * 9000;
        
        // Simplified Planck approximation for RGB
        let r, g, b;
        
        if (temp < 6600) {
            r = 255;
            g = Math.min(255, 99.4708 * Math.log(temp / 100) - 161.1195);
        } else {
            r = Math.min(255, 329.698 * Math.pow((temp / 100) - 60, -0.1332));
            g = Math.min(255, 288.122 * Math.pow((temp / 100) - 60, -0.0755));
        }
        
        if (temp < 2000) {
            b = 0;
        } else if (temp < 6600) {
            b = Math.min(255, 138.5177 * Math.log(temp / 100 - 10) - 305.0448);
        } else {
            b = 255;
        }
        
        colours.push(rgbToHex(
            Math.max(0, Math.round(r)),
            Math.max(0, Math.round(g)),
            Math.max(0, Math.round(b))
        ));
    }
    
    return colours;
}

/**
 * Generate single-hue tint palette (dark to light)
 * @param {number} hue - Base hue (0-360)
 * @param {number} steps - Number of tint steps
 * @returns {string[]} Array of hex colours
 * 
 * @example
 * generateTintPalette(0, 8) // Red tints: dark red → bright red → pink → white
 */
export function generateTintPalette(hue, steps) {
    const colours = [];
    
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        
        // Transition: dark (L=10, S=100) → bright (L=50, S=100) → light (L=90, S=30)
        let lightness, saturation;
        
        if (t < 0.5) {
            // Dark to bright
            lightness = 10 + (t * 2) * 40;
            saturation = 100;
        } else {
            // Bright to pale
            lightness = 50 + ((t - 0.5) * 2) * 40;
            saturation = 100 - ((t - 0.5) * 2) * 70;
        }
        
        colours.push(hslToHex(hue, saturation, lightness));
    }
    
    return colours;
}

/**
 * Generate complementary colour pair
 * @param {number} hue - Base hue (0-360)
 * @returns {string[]} Array of 2 hex colours
 */
export function generateComplementary(hue) {
    return [
        hslToHex(hue, 100, 50),
        hslToHex((hue + 180) % 360, 100, 50)
    ];
}

/**
 * Generate triadic colour scheme
 * @param {number} hue - Base hue (0-360)
 * @returns {string[]} Array of 3 hex colours
 */
export function generateTriadic(hue) {
    return [
        hslToHex(hue, 100, 50),
        hslToHex((hue + 120) % 360, 100, 50),
        hslToHex((hue + 240) % 360, 100, 50)
    ];
}

/**
 * Generate tetradic (square) colour scheme
 * @param {number} hue - Base hue (0-360)
 * @returns {string[]} Array of 4 hex colours
 */
export function generateTetradic(hue) {
    return [
        hslToHex(hue, 100, 50),
        hslToHex((hue + 90) % 360, 100, 50),
        hslToHex((hue + 180) % 360, 100, 50),
        hslToHex((hue + 270) % 360, 100, 50)
    ];
}

/**
 * Generate analogous colour scheme
 * @param {number} hue - Base hue (0-360)
 * @param {number} count - Number of analogous colours (3-7)
 * @returns {string[]} Array of hex colours
 */
export function generateAnalogous(hue, count = 5) {
    const colours = [];
    const spacing = 30; // 30° spacing between analogous colours
    const startHue = hue - (Math.floor(count / 2) * spacing);
    
    for (let i = 0; i < count; i++) {
        const currentHue = (startHue + (i * spacing)) % 360;
        colours.push(hslToHex(currentHue, 100, 50));
    }
    
    return colours;
}

export default {
    generateRGBQuantized,
    generateHSLWheel,
    generateLinearGrayscale,
    generatePerceptualGrayscale,
    generateLogarithmicGrayscale,
    generateTemperatureRamp,
    generateBlackbodyPalette,
    generateTintPalette,
    generateComplementary,
    generateTriadic,
    generateTetradic,
    generateAnalogous
};

