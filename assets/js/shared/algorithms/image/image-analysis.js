/**
 * @fileoverview Image Analysis for ASCII Art
 * 
 * Glyph density analysis, feature matching, and coherence smoothing.
 * 
 * @module image/image-analysis
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Histogram_of_oriented_gradients.md
 * @wikipedia https://en.wikipedia.org/wiki/Histogram_of_oriented_gradients
 * 
 * Techniques from reference:
 * - Sobel gradient computation for edge orientation
 * - 8-bin orientation histogram (HOG-like descriptor)
 * - Chi-squared distance for histogram matching
 * 
 * @formula Sobel Gx: [-1 0 +1; -2 0 +2; -1 0 +1]
 * @formula Sobel Gy: [-1 -2 -1; 0 0 0; +1 +2 +1]
 * @formula Orientation: θ = atan2(Gy, Gx)
 * @formula Chi-squared: Σ (a-b)² / (a+b)
 */

// ═══════════════════════════════════════════════════════════════════════════
// GLYPH DENSITY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} GlyphMetrics
 * @property {string} char - The character
 * @property {number} density - Fill density (0-1)
 * @property {Float32Array} pattern - 8-direction orientation histogram
 * @property {number} centroidX - Horizontal centroid (-0.5 to 0.5)
 * @property {number} centroidY - Vertical centroid (-0.5 to 0.5)
 */

/**
 * Analyze glyph density from canvas rendering
 * 
 * @param {string} char - Character to analyze
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cellWidth - Cell width in pixels
 * @param {number} cellHeight - Cell height in pixels
 * @param {string} font - Font string (e.g., "14px Space Mono")
 * @returns {GlyphMetrics} Glyph metrics
 */
export function analyzeGlyph(char, ctx, cellWidth, cellHeight, font) {
    // Clear and render glyph
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cellWidth, cellHeight);
    ctx.fillStyle = 'black';
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(char, cellWidth / 2, cellHeight / 2);
    
    // Get pixel data
    const imageData = ctx.getImageData(0, 0, cellWidth, cellHeight);
    const pixels = imageData.data;
    
    // Calculate density and centroid
    let totalDark = 0;
    let weightX = 0;
    let weightY = 0;
    
    for (let y = 0; y < cellHeight; y++) {
        for (let x = 0; x < cellWidth; x++) {
            const idx = (y * cellWidth + x) * 4;
            const darkness = 1 - pixels[idx] / 255; // 0 = white, 1 = black
            
            totalDark += darkness;
            weightX += darkness * (x - cellWidth / 2);
            weightY += darkness * (y - cellHeight / 2);
        }
    }
    
    const totalPixels = cellWidth * cellHeight;
    const density = totalDark / totalPixels;
    
    const centroidX = totalDark > 0 ? weightX / totalDark / cellWidth : 0;
    const centroidY = totalDark > 0 ? weightY / totalDark / cellHeight : 0;
    
    // Calculate orientation histogram using Sobel
    const pattern = computeOrientationHistogram(pixels, cellWidth, cellHeight);
    
    return { char, density, pattern, centroidX, centroidY };
}

/**
 * Compute 8-bin orientation histogram
 * 
 * @param {Uint8ClampedArray} pixels - RGBA pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Float32Array} 8-bin histogram
 */
export function computeOrientationHistogram(pixels, width, height) {
    const histogram = new Float32Array(8);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            // Get grayscale values
            const getGray = (px, py) => {
                const idx = (py * width + px) * 4;
                return pixels[idx];
            };
            
            // Sobel gradients
            const gx = 
                -getGray(x - 1, y - 1) + getGray(x + 1, y - 1) +
                -2 * getGray(x - 1, y) + 2 * getGray(x + 1, y) +
                -getGray(x - 1, y + 1) + getGray(x + 1, y + 1);
            
            const gy = 
                -getGray(x - 1, y - 1) - 2 * getGray(x, y - 1) - getGray(x + 1, y - 1) +
                getGray(x - 1, y + 1) + 2 * getGray(x, y + 1) + getGray(x + 1, y + 1);
            
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            
            if (magnitude > 10) { // Threshold
                let angle = Math.atan2(gy, gx);
                if (angle < 0) angle += Math.PI * 2;
                
                const bin = Math.floor(angle / (Math.PI / 4)) % 8;
                histogram[bin] += magnitude;
            }
        }
    }
    
    // Normalize
    let sum = 0;
    for (let i = 0; i < 8; i++) sum += histogram[i];
    if (sum > 0) {
        for (let i = 0; i < 8; i++) histogram[i] /= sum;
    }
    
    return histogram;
}

/**
 * Pre-analyze all ASCII glyphs
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} cellWidth - Cell width
 * @param {number} cellHeight - Cell height
 * @param {string} font - Font string
 * @param {string} [charset] - Characters to analyze (default: printable ASCII)
 * @returns {GlyphMetrics[]} Array of glyph metrics sorted by density
 */
export function analyzeGlyphSet(ctx, cellWidth, cellHeight, font, charset) {
    const chars = charset || ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
    const metrics = [];
    
    for (const char of chars) {
        metrics.push(analyzeGlyph(char, ctx, cellWidth, cellHeight, font));
    }
    
    // Sort by density
    metrics.sort((a, b) => a.density - b.density);
    
    return metrics;
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE MATCHING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Match image cell to best glyph using multi-cost function
 * 
 * @param {Object} cellFeatures - Features of the image cell
 * @param {number} cellFeatures.density - Cell luminance/density
 * @param {Float32Array} cellFeatures.histogram - Orientation histogram
 * @param {GlyphMetrics[]} glyphSet - Pre-analyzed glyphs
 * @param {Object} weights - Cost weights
 * @param {number} [weights.density=1] - Density match weight
 * @param {number} [weights.orientation=0.5] - Orientation match weight
 * @param {number} [weights.centroid=0.2] - Centroid match weight
 * @returns {{glyph: GlyphMetrics, cost: number}} Best match
 */
export function matchGlyph(cellFeatures, glyphSet, weights = {}) {
    const { density: wDensity = 1, orientation: wOrient = 0.5, centroid: wCentroid = 0.2 } = weights;
    
    let bestGlyph = null;
    let bestCost = Infinity;
    
    for (const glyph of glyphSet) {
        // Density cost (L2)
        const densityCost = Math.pow(cellFeatures.density - glyph.density, 2);
        
        // Orientation histogram cost (chi-squared)
        let orientCost = 0;
        if (cellFeatures.histogram) {
            for (let i = 0; i < 8; i++) {
                const a = cellFeatures.histogram[i];
                const b = glyph.pattern[i];
                if (a + b > 0) {
                    orientCost += Math.pow(a - b, 2) / (a + b);
                }
            }
        }
        
        // Centroid cost (L2)
        const centroidCost = cellFeatures.centroidX !== undefined ? 
            Math.pow(cellFeatures.centroidX - glyph.centroidX, 2) +
            Math.pow(cellFeatures.centroidY - glyph.centroidY, 2) : 0;
        
        const totalCost = wDensity * densityCost + wOrient * orientCost + wCentroid * centroidCost;
        
        if (totalCost < bestCost) {
            bestCost = totalCost;
            bestGlyph = glyph;
        }
    }
    
    return { glyph: bestGlyph, cost: bestCost };
}

/**
 * Compute Hamming distance between two binary patterns
 * 
 * @param {Uint8Array} a - First pattern
 * @param {Uint8Array} b - Second pattern
 * @returns {number} Hamming distance
 */
export function hammingDistance(a, b) {
    let dist = 0;
    const len = Math.min(a.length, b.length);
    
    for (let i = 0; i < len; i++) {
        let xor = a[i] ^ b[i];
        while (xor) {
            dist += xor & 1;
            xor >>= 1;
        }
    }
    
    return dist;
}

// ═══════════════════════════════════════════════════════════════════════════
// COHERENCE SMOOTHING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Apply spatial coherence smoothing to ASCII art
 * 
 * @param {string[][]} chars - 2D array of characters
 * @param {GlyphMetrics[]} glyphSet - Glyph metrics
 * @param {Object} params - Parameters
 * @param {number} [params.iterations=2] - Number of smoothing passes
 * @param {number} [params.coherenceWeight=0.3] - Weight for neighbor similarity
 * @returns {string[][]} Smoothed character array
 */
export function coherenceSmoothing(chars, glyphSet, params = {}) {
    const { iterations = 2, coherenceWeight = 0.3 } = params;
    const rows = chars.length;
    const cols = chars[0].length;
    
    // Create glyph lookup
    const glyphLookup = new Map();
    for (const g of glyphSet) {
        glyphLookup.set(g.char, g);
    }
    
    let current = chars.map(row => [...row]);
    
    for (let iter = 0; iter < iterations; iter++) {
        const next = current.map(row => [...row]);
        
        for (let y = 1; y < rows - 1; y++) {
            for (let x = 1; x < cols - 1; x++) {
                const currentGlyph = glyphLookup.get(current[y][x]);
                if (!currentGlyph) continue;
                
                // Get neighbor densities
                const neighborDensities = [];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const ng = glyphLookup.get(current[y + dy][x + dx]);
                        if (ng) neighborDensities.push(ng.density);
                    }
                }
                
                if (neighborDensities.length === 0) continue;
                
                // Target density: blend of current and neighbor average
                const avgNeighbor = neighborDensities.reduce((a, b) => a + b) / neighborDensities.length;
                const targetDensity = currentGlyph.density * (1 - coherenceWeight) + avgNeighbor * coherenceWeight;
                
                // Find best match for target density
                let bestGlyph = currentGlyph;
                let bestDiff = Math.abs(currentGlyph.density - targetDensity);
                
                for (const g of glyphSet) {
                    const diff = Math.abs(g.density - targetDensity);
                    if (diff < bestDiff) {
                        bestDiff = diff;
                        bestGlyph = g;
                    }
                }
                
                next[y][x] = bestGlyph.char;
            }
        }
        
        current = next;
    }
    
    return current;
}

/**
 * Apply edge-preserving smoothing
 * 
 * @param {string[][]} chars - 2D array of characters
 * @param {Float32Array} edges - Edge magnitude field
 * @param {number} width - Width in cells
 * @param {number} height - Height in cells
 * @param {GlyphMetrics[]} glyphSet - Glyph metrics
 * @param {number} edgeThreshold - Threshold for preserving edges
 * @returns {string[][]} Smoothed characters
 */
export function edgePreservingSmoothing(chars, edges, width, height, glyphSet, edgeThreshold) {
    const rows = chars.length;
    const cols = chars[0].length;
    
    const glyphLookup = new Map();
    for (const g of glyphSet) {
        glyphLookup.set(g.char, g);
    }
    
    const result = chars.map(row => [...row]);
    
    for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
            // Check if this is an edge cell
            const edgeIdx = y * cols + x;
            if (edges[edgeIdx] > edgeThreshold) continue; // Preserve edges
            
            const currentGlyph = glyphLookup.get(chars[y][x]);
            if (!currentGlyph) continue;
            
            // Average density of same-region neighbors
            let sum = currentGlyph.density;
            let count = 1;
            
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    
                    const neighborEdge = edges[(y + dy) * cols + (x + dx)];
                    if (neighborEdge < edgeThreshold) {
                        const ng = glyphLookup.get(chars[y + dy][x + dx]);
                        if (ng) {
                            sum += ng.density;
                            count++;
                        }
                    }
                }
            }
            
            const targetDensity = sum / count;
            
            // Find closest glyph
            let bestGlyph = currentGlyph;
            let bestDiff = Infinity;
            
            for (const g of glyphSet) {
                const diff = Math.abs(g.density - targetDensity);
                if (diff < bestDiff) {
                    bestDiff = diff;
                    bestGlyph = g;
                }
            }
            
            result[y][x] = bestGlyph.char;
        }
    }
    
    return result;
}

