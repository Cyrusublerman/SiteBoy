/**
 * Character Matching Cost Functions
 * 
 * Multi-feature cost calculation for ASCII character selection.
 */

import { calculateOrientationCostWithMode } from './flow-matching.js';

/**
 * Find best matching character for a tile.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Histogram_of_oriented_gradients
 * @formula C = alpha*C_tone + beta*C_quad + gamma*C_ori + delta*C_sig
 */
export function findBestMatch(tileMetrics, glyphAtlas, weights, flowMode) {
    var bestChar = ' ';
    var bestCost = Infinity;
    var toneWeight = weights.tone ?? 0.4;
    var quadrantWeight = weights.quadrant ?? 0.2;
    var orientWeight = weights.orientation ?? 0.3;
    var sigWeight = weights.signature ?? 0.1;
    var correlationWeight = weights.correlation ?? 0.0;
    
    for (var i = 0; i < glyphAtlas.length; i++) {
        var glyph = glyphAtlas[i];
        
        var toneCost = calculateToneCost(glyph.density, tileMetrics.density);
        var quadCost = calculateQuadrantCost(glyph.quadrants, tileMetrics.quadrants);
        var orientCost = calculateOrientationCostWithMode(glyph.orientation, tileMetrics, flowMode);
        var sigCost = calculateSignatureCost(glyph.signature, tileMetrics.signature);
        var corrCost = 0;
        
        // Pixel correlation cost (if weight > 0 and data available)
        if (correlationWeight > 0 && glyph.pixelData && tileMetrics.pixelData) {
            corrCost = calculatePixelCorrelationCost(glyph.pixelData, tileMetrics.pixelData);
        }
        
        var cost = toneWeight * toneCost 
                 + quadrantWeight * quadCost 
                 + orientWeight * orientCost 
                 + sigWeight * sigCost
                 + correlationWeight * corrCost;
        
        if (cost < bestCost) {
            bestCost = cost;
            bestChar = glyph.char;
        }
    }
    
    return bestChar;
}

/**
 * Calculate tone (brightness) cost.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Euclidean_distance
 * @formula C_tone = |D_g - D_t|
 */
export function calculateToneCost(glyphDensity, tileDensity) {
    return Math.abs(glyphDensity - tileDensity);
}

/**
 * Calculate quadrant distribution cost.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Mean
 * @formula C_quad = (1/N) * sum(|D_g,q - D_t,q|)
 */
export function calculateQuadrantCost(glyphQuadrants, tileQuadrants) {
    if (!glyphQuadrants || !tileQuadrants) return 0;
    
    var count = Math.min(glyphQuadrants.length, tileQuadrants.length);
    if (count === 0) return 0;
    
    var sum = 0;
    for (var q = 0; q < count; q++) {
        sum += Math.abs(glyphQuadrants[q] - tileQuadrants[q]);
    }
    
    return sum / count;
}

/**
 * Calculate orientation cost (angular difference).
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Angle
 * @formula C_ori = |theta_g - theta_t| / pi
 */
export function calculateOrientationCost(glyphOrientation, tileOrientation) {
    if (glyphOrientation === undefined || tileOrientation === undefined) return 0;
    
    var diff = Math.abs(glyphOrientation - tileOrientation);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    
    return diff / Math.PI;
}

/**
 * Calculate signature cost (HOG histogram difference).
 * 
 * @source blog/ideas/reference documentation/11_Optimisation_Numerical_Methods/Hamming_distance.md
 * @wikipedia https://en.wikipedia.org/wiki/Hamming_distance
 * @formula C_sig = (1/K) * sum(|S_g,i - S_t,i|)
 */
export function calculateSignatureCost(glyphSignature, tileSignature) {
    if (!glyphSignature || !tileSignature) return 0;
    
    var count = Math.min(glyphSignature.length, tileSignature.length);
    if (count === 0) return 0;
    
    var sum = 0;
    for (var i = 0; i < count; i++) {
        sum += Math.abs(glyphSignature[i] - tileSignature[i]);
    }
    
    return sum / count;
}

/**
 * Calculate pixel correlation cost (direct pixel-by-pixel comparison).
 * 
 * This measures the average luminance difference between glyph and image pixels.
 * Lower cost = better match = glyph pixels align with image pixels.
 * 
 * @source Direct pixel comparison for ASCII art matching
 * @formula C_corr = (1/N) * sum(|glyph_luma[i] - image_luma[i]|)
 */
export function calculatePixelCorrelationCost(glyphPixels, tilePixels) {
    if (!glyphPixels || !tilePixels) return 0;
    
    var count = Math.min(glyphPixels.length, tilePixels.length);
    if (count === 0) return 0;
    
    var sum = 0;
    for (var i = 0; i < count; i++) {
        sum += Math.abs(glyphPixels[i] - tilePixels[i]);
    }
    
    return sum / count;
}

