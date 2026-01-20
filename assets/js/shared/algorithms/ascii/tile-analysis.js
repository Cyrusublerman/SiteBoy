/**
 * Tile Analysis for ASCII Art Generation
 * 
 * Extracts visual features from image tiles for character matching.
 */

import { rgbToLuminance, gradientMagnitudeAndDirection } from './feature-extraction.js';

/**
 * Extract visual metrics from a tile.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Histogram_of_oriented_gradients
 * @formula D_g = (1/WH) * sum(G(x,y))
 */
export function extractTileMetrics(data, imgWidth, x, y, tileWidth, tileHeight, spatialResolution = 2) {
    var density = 0;
    var resolution = Math.max(2, Math.min(5, spatialResolution || 2));
    var quadrants = new Array(resolution * resolution).fill(0);
    var quadrantCounts = new Array(resolution * resolution).fill(0);
    var gx = 0;
    var gy = 0;
    var bins = new Array(8).fill(0);
    var imgHeight = Math.floor(data.length / (imgWidth * 4));
    var regionWidth = tileWidth / resolution;
    var regionHeight = tileHeight / resolution;
    
    for (var dy = 0; dy < tileHeight; dy++) {
        for (var dx = 0; dx < tileWidth; dx++) {
            var px = x + dx;
            var py = y + dy;
            
            if (px < 0 || py < 0 || px >= imgWidth || py >= imgHeight) {
                continue;
            }
            
            var idx = (py * imgWidth + px) * 4;
            var luma = rgbToLuminance(data[idx], data[idx + 1], data[idx + 2]) / 255;
            
            density += luma;
            
            // Spatial quadrants (N×N)
            var qx = Math.min(resolution - 1, Math.floor(dx / regionWidth));
            var qy = Math.min(resolution - 1, Math.floor(dy / regionHeight));
            var qIndex = qy * resolution + qx;
            quadrants[qIndex] += luma;
            quadrantCounts[qIndex] += 1;
            
            // Gradient for orientation (skip edges)
            if (dx > 0 && dx < tileWidth - 1 && dy > 0 && dy < tileHeight - 1) {
                var leftIdx = (py * imgWidth + (px - 1)) * 4;
                var rightIdx = (py * imgWidth + (px + 1)) * 4;
                var upIdx = ((py - 1) * imgWidth + px) * 4;
                var downIdx = ((py + 1) * imgWidth + px) * 4;
                
                var left = rgbToLuminance(data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]);
                var right = rgbToLuminance(data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]);
                var up = rgbToLuminance(data[upIdx], data[upIdx + 1], data[upIdx + 2]);
                var down = rgbToLuminance(data[downIdx], data[downIdx + 1], data[downIdx + 2]);
                
                var dxVal = right - left;
                var dyVal = down - up;
                
                gx += dxVal;
                gy += dyVal;
                
                // HOG signature
                var grad = gradientMagnitudeAndDirection(dxVal, dyVal);
                var angle = grad.direction;
                if (angle < 0) angle += 2 * Math.PI;
                var bin = Math.floor(angle / (Math.PI / 4)) % 8;
                bins[bin] += grad.magnitude;
            }
        }
    }
    
    var totalPixels = tileWidth * tileHeight;
    density = totalPixels > 0 ? density / totalPixels : 0;
    
    for (var q = 0; q < quadrants.length; q++) {
        var count = quadrantCounts[q] || 1;
        quadrants[q] = quadrants[q] / count;
    }
    
    var orientation = Math.atan2(gy, gx);
    
    // Normalize signature
    var sum = bins.reduce(function(a, b) { return a + b; }, 0);
    if (sum > 0) {
        for (var i = 0; i < bins.length; i++) {
            bins[i] /= sum;
        }
    }
    
    return { 
        density: density, 
        quadrants: quadrants,
        orientation: orientation,
        signature: bins
    };
}

/**
 * Extract spatial quadrants at given resolution.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Histogram_of_oriented_gradients
 * @formula D_q = mean(G|_quadrant_q)
 */
export function extractQuadrants(data, imgWidth, x, y, tileWidth, tileHeight, resolution) {
    var metrics = extractTileMetrics(data, imgWidth, x, y, tileWidth, tileHeight, resolution);
    return metrics.quadrants;
}

/**
 * Calculate HOG (Histogram of Oriented Gradients) signature.
 * 
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Histogram_of_oriented_gradients.md
 * @wikipedia https://en.wikipedia.org/wiki/Histogram_of_oriented_gradients
 * @formula H_k = sum(|grad|) for angles in bin k
 */
export function calculateHOGSignature(data, imgWidth, x, y, tileWidth, tileHeight, binsCount = 8) {
    var bins = new Array(binsCount).fill(0);
    var imgHeight = Math.floor(data.length / (imgWidth * 4));
    
    for (var dy = 1; dy < tileHeight - 1; dy++) {
        for (var dx = 1; dx < tileWidth - 1; dx++) {
            var px = x + dx;
            var py = y + dy;
            
            if (px < 1 || py < 1 || px >= imgWidth - 1 || py >= imgHeight - 1) {
                continue;
            }
            
            var leftIdx = (py * imgWidth + (px - 1)) * 4;
            var rightIdx = (py * imgWidth + (px + 1)) * 4;
            var upIdx = ((py - 1) * imgWidth + px) * 4;
            var downIdx = ((py + 1) * imgWidth + px) * 4;
            
            var left = rgbToLuminance(data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]);
            var right = rgbToLuminance(data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]);
            var up = rgbToLuminance(data[upIdx], data[upIdx + 1], data[upIdx + 2]);
            var down = rgbToLuminance(data[downIdx], data[downIdx + 1], data[downIdx + 2]);
            
            var dxVal = right - left;
            var dyVal = down - up;
            var grad = gradientMagnitudeAndDirection(dxVal, dyVal);
            var angle = grad.direction;
            
            if (angle < 0) angle += 2 * Math.PI;
            var bin = Math.floor(angle / (2 * Math.PI / binsCount)) % binsCount;
            bins[bin] += grad.magnitude;
        }
    }
    
    var sum = bins.reduce(function(a, b) { return a + b; }, 0);
    if (sum > 0) {
        for (var i = 0; i < bins.length; i++) {
            bins[i] /= sum;
        }
    }
    
    return bins;
}

