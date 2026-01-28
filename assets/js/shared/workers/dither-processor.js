/**
 * Unified Dither Interface for Web Workers
 * 
 * Provides a single entry point for all dithering algorithms
 * that can be easily called from Web Workers.
 * 
 * @module workers/dither-processor
 */

import * as ColorSpace from '../algorithms/color/color-space.js';
import * as ErrorDiffusion from '../algorithms/dither/error-diffusion.js';
import * as OrderedDither from '../algorithms/dither/ordered.js';
import { nearestColorQuantize } from '../algorithms/dither/nearest-color.js';
import { ditherBlueNoiseBracketing } from '../algorithms/dither/blue-noise-bracketing.js';

/**
 * Apply dithering algorithm to image data
 * 
 * @param {Object} params - Processing parameters
 * @param {Object|ImageData} params.imageData - Input image data (can be plain object from worker)
 * @param {string} params.algorithm - Algorithm name
 * @param {Array<string>} params.palette - Hex color palette
 * @param {Array<Object>} params.paletteLabs - Pre-computed LAB values
 * @param {Object|ImageData} [params.blueNoiseTexture] - Blue noise texture (optional)
 * @returns {ImageData} Processed image data
 * 
 * Note: onProgress callback removed - progress is handled via worker postMessage
 */
export function processDither(params) {
    let { imageData, algorithm, palette, paletteLabs, blueNoiseTexture } = params;
    
    // Reconstruct ImageData if it's a plain object (from worker transfer)
    if (imageData && !(imageData instanceof ImageData)) {
        // Data is structured cloned (not transferred) so we need to wrap it in Uint8ClampedArray
        console.log('🔧 Worker: Input data type:', imageData.data?.constructor?.name);
        console.log('🔧 Worker: Data length:', imageData.data?.length);
        
        // Create Uint8ClampedArray from cloned data
        const data = new Uint8ClampedArray(imageData.data);
        console.log('✅ Worker: Created Uint8ClampedArray from cloned data');
        
        imageData = new ImageData(data, imageData.width, imageData.height);
    }
    
    // Reconstruct blue noise texture if present
    if (blueNoiseTexture && !(blueNoiseTexture instanceof ImageData)) {
        const data = new Uint8ClampedArray(blueNoiseTexture.data);
        blueNoiseTexture = new ImageData(data, blueNoiseTexture.width, blueNoiseTexture.height);
    }
    
    // Note: Progress reporting removed from this level since functions can't be cloned
    // Progress is sent via postMessage in the worker context
    
    switch (algorithm) {
        case 'None':
            return quantizeNoDither(imageData, palette, paletteLabs);
            
        case 'Blue Noise':
            if (blueNoiseTexture) {
                return ditherBlueNoiseBracketing(imageData, palette, paletteLabs, blueNoiseTexture, ColorSpace);
            }
            return quantizeNoDither(imageData, palette, paletteLabs);
            
        case 'Floyd-Steinberg':
            return ErrorDiffusion.floydSteinberg(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Atkinson':
            return ErrorDiffusion.atkinson(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Jarvis-Judice-Ninke':
            return ErrorDiffusion.javisJudiceNinke(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Stucki':
            return ErrorDiffusion.stucki(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Burkes':
            return ErrorDiffusion.burkes(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Sierra-3':
            return ErrorDiffusion.sierra3(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Bayer 2×2':
            return OrderedDither.bayer2x2(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Bayer 4×4':
            return OrderedDither.bayer4x4(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Bayer 8×8':
            return OrderedDither.bayer8x8(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Halftone':
            return OrderedDither.halftone(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Checkerboard':
            return OrderedDither.checkerboard(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Cluster Dot':
            return OrderedDither.cluster(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Hatch Horizontal':
            return OrderedDither.hatchHorizontal(imageData, palette, paletteLabs, ColorSpace);
            
        case 'Hatch Vertical':
            return OrderedDither.hatchVertical(imageData, palette, paletteLabs, ColorSpace);
            
        default:
            return quantizeNoDither(imageData, palette, paletteLabs, onProgress);
    }
}

/**
 * Quantize without dithering (simple nearest-color)
 * @private
 */
function quantizeNoDither(imageData, palette, paletteLabs) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i4 = (y * width + x) * 4;
            const r = data[i4];
            const g = data[i4 + 1];
            const b = data[i4 + 2];
            const a = data[i4 + 3];
            
            const lab = ColorSpace.rgbToLab(r, g, b);
            const nearestIdx = findNearestColor(lab, paletteLabs);
            const nearest = ColorSpace.hexToRgb(palette[nearestIdx]);
            
            output[i4] = nearest.r;
            output[i4 + 1] = nearest.g;
            output[i4 + 2] = nearest.b;
            output[i4 + 3] = a;
        }
    }
    
    return new ImageData(output, width, height);
}

/**
 * Find nearest color in palette using Delta E (LAB distance)
 * @private
 */
function findNearestColor(lab, paletteLabs) {
    let bestDist = Infinity;
    let bestIdx = 0;
    
    for (let j = 0; j < paletteLabs.length; j++) {
        const labP = paletteLabs[j];
        if (!labP) continue;
        
        const d = ColorSpace.deltaE76(lab, labP);
        if (d < bestDist) {
            bestDist = d;
            bestIdx = j;
            if (d < 0.001) break; // Perfect match
        }
    }
    
    return bestIdx;
}

/**
 * Quantize with blue noise dithering
 * @private
 */
function quantizeWithBlueNoise(imageData, palette, paletteLabs, blueNoiseTexture) {
    const { width, height, data } = imageData;
    const output = new Uint8ClampedArray(data.length);
    const noiseW = blueNoiseTexture.width;
    const noiseH = blueNoiseTexture.height;
    const noiseData = blueNoiseTexture.data;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i4 = (y * width + x) * 4;
            let r = data[i4];
            let g = data[i4 + 1];
            let b = data[i4 + 2];
            const a = data[i4 + 3];
            
            // Sample blue noise
            const nx = x % noiseW;
            const ny = y % noiseH;
            const ni = (ny * noiseW + nx) * 4;
            const noise = (noiseData[ni] / 255) - 0.5; // -0.5 to 0.5
            
            // Apply noise
            const threshold = 32;
            r = Math.max(0, Math.min(255, r + noise * threshold));
            g = Math.max(0, Math.min(255, g + noise * threshold));
            b = Math.max(0, Math.min(255, b + noise * threshold));
            
            // Find nearest color
            const lab = ColorSpace.rgbToLab(r, g, b);
            const nearestIdx = findNearestColor(lab, paletteLabs);
            const nearest = ColorSpace.hexToRgb(palette[nearestIdx]);
            
            output[i4] = nearest.r;
            output[i4 + 1] = nearest.g;
            output[i4 + 2] = nearest.b;
            output[i4 + 3] = a;
        }
    }
    
    return new ImageData(output, width, height);
}

