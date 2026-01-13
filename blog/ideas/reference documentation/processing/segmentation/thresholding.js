/**
 * @fileoverview Image Segmentation Algorithms
 * 
 * Segmentation partitions an image into meaningful regions.
 * 
 * @see Reference: 02_Image_Segmentation_Region_Extraction/*.md
 */

import { MathUtils } from '../core/math-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// OTSU'S METHOD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Otsu's automatic thresholding
 * 
 * Finds optimal threshold t* that maximizes inter-class variance:
 * 
 * σ²_b(t) = ω₀(μ₀ - μ_T)² + ω₁(μ₁ - μ_T)²
 *         = ω₀ω₁(μ₀ - μ₁)²
 * 
 * Where:
 * - ω₀, ω₁ = class probabilities
 * - μ₀, μ₁ = class means
 * - μ_T = total mean
 * 
 * @param {Uint8Array|Float32Array} image - Grayscale image [0-255]
 * @param {number} [numBins=256] - Histogram bins
 * @returns {{threshold: number, variance: number}}
 */
export function otsuThreshold(image, numBins = 256) {
    // Build histogram
    const histogram = new Float64Array(numBins);
    for (let i = 0; i < image.length; i++) {
        const bin = Math.min(numBins - 1, Math.floor(image[i]));
        histogram[bin]++;
    }
    
    // Normalize to probability
    const total = image.length;
    for (let i = 0; i < numBins; i++) {
        histogram[i] /= total;
    }
    
    // Compute cumulative sums
    const omega = new Float64Array(numBins);  // Cumulative probability
    const mu = new Float64Array(numBins);     // Cumulative mean
    
    omega[0] = histogram[0];
    mu[0] = 0;
    
    for (let i = 1; i < numBins; i++) {
        omega[i] = omega[i - 1] + histogram[i];
        mu[i] = mu[i - 1] + i * histogram[i];
    }
    
    const muTotal = mu[numBins - 1];
    
    // Find threshold that maximizes inter-class variance
    let bestThreshold = 0;
    let bestVariance = 0;
    
    for (let t = 0; t < numBins - 1; t++) {
        const omega0 = omega[t];
        const omega1 = 1 - omega0;
        
        if (omega0 === 0 || omega1 === 0) continue;
        
        const mu0 = mu[t] / omega0;
        const mu1 = (muTotal - mu[t]) / omega1;
        
        // Inter-class variance: σ²_b = ω₀ω₁(μ₀ - μ₁)²
        const variance = omega0 * omega1 * (mu0 - mu1) * (mu0 - mu1);
        
        if (variance > bestVariance) {
            bestVariance = variance;
            bestThreshold = t;
        }
    }
    
    return { threshold: bestThreshold, variance: bestVariance };
}

/**
 * Apply threshold to image
 * 
 * @param {Uint8Array|Float32Array} image 
 * @param {number} threshold 
 * @returns {Uint8Array} - Binary image (0 or 255)
 */
export function applyThreshold(image, threshold) {
    const result = new Uint8Array(image.length);
    for (let i = 0; i < image.length; i++) {
        result[i] = image[i] >= threshold ? 255 : 0;
    }
    return result;
}

/**
 * Multi-level Otsu thresholding
 * Finds multiple thresholds for multi-class segmentation
 * 
 * @param {Uint8Array|Float32Array} image 
 * @param {number} numThresholds - Number of thresholds (classes - 1)
 * @returns {number[]} - Array of thresholds
 */
export function multiOtsu(image, numThresholds = 2) {
    const numBins = 256;
    
    // Build histogram
    const histogram = new Float64Array(numBins);
    for (let i = 0; i < image.length; i++) {
        const bin = Math.min(numBins - 1, Math.floor(image[i]));
        histogram[bin]++;
    }
    
    // Normalize
    const total = image.length;
    for (let i = 0; i < numBins; i++) {
        histogram[i] /= total;
    }
    
    // For 2 thresholds, use exhaustive search (simplified)
    if (numThresholds === 2) {
        let bestVariance = 0;
        let bestT1 = 0, bestT2 = 0;
        
        for (let t1 = 1; t1 < numBins - 2; t1++) {
            for (let t2 = t1 + 1; t2 < numBins - 1; t2++) {
                const variance = computeMultiVariance(histogram, [t1, t2]);
                if (variance > bestVariance) {
                    bestVariance = variance;
                    bestT1 = t1;
                    bestT2 = t2;
                }
            }
        }
        
        return [bestT1, bestT2];
    }
    
    // For more thresholds, use recursive Otsu
    return recursiveOtsu(histogram, numThresholds, 0, numBins - 1);
}

/**
 * Compute inter-class variance for multiple thresholds
 * @private
 */
function computeMultiVariance(histogram, thresholds) {
    const numClasses = thresholds.length + 1;
    const bounds = [0, ...thresholds, histogram.length];
    
    let totalMean = 0;
    for (let i = 0; i < histogram.length; i++) {
        totalMean += i * histogram[i];
    }
    
    let variance = 0;
    
    for (let c = 0; c < numClasses; c++) {
        const start = bounds[c];
        const end = bounds[c + 1];
        
        let omega = 0, mu = 0;
        for (let i = start; i < end; i++) {
            omega += histogram[i];
            mu += i * histogram[i];
        }
        
        if (omega > 0) {
            const classMean = mu / omega;
            variance += omega * (classMean - totalMean) ** 2;
        }
    }
    
    return variance;
}

/**
 * Recursive Otsu for multi-level
 * @private
 */
function recursiveOtsu(histogram, numThresholds, start, end) {
    if (numThresholds === 1) {
        // Find single threshold in range
        let bestT = start;
        let bestVar = 0;
        
        for (let t = start + 1; t < end; t++) {
            let omega0 = 0, mu0 = 0;
            let omega1 = 0, mu1 = 0;
            
            for (let i = start; i < t; i++) {
                omega0 += histogram[i];
                mu0 += i * histogram[i];
            }
            for (let i = t; i < end; i++) {
                omega1 += histogram[i];
                mu1 += i * histogram[i];
            }
            
            if (omega0 > 0 && omega1 > 0) {
                mu0 /= omega0;
                mu1 /= omega1;
                const variance = omega0 * omega1 * (mu0 - mu1) ** 2;
                if (variance > bestVar) {
                    bestVar = variance;
                    bestT = t;
                }
            }
        }
        
        return [bestT];
    }
    
    // Find first threshold, then recurse
    let bestConfig = [];
    let bestVar = 0;
    
    for (let t = start + 1; t < end - numThresholds + 1; t++) {
        const rest = recursiveOtsu(histogram, numThresholds - 1, t, end);
        const variance = computeMultiVariance(histogram, [t, ...rest]);
        
        if (variance > bestVar) {
            bestVar = variance;
            bestConfig = [t, ...rest];
        }
    }
    
    return bestConfig;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTED COMPONENT LABELING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Connected component labeling (two-pass algorithm)
 * 
 * @param {Uint8Array} binaryImage - Binary image (0 = background)
 * @param {number} width 
 * @param {number} height 
 * @param {boolean} [use8Connected=true] - 8-connectivity vs 4-connectivity
 * @returns {{labels: Int32Array, numComponents: number}}
 */
export function connectedComponents(binaryImage, width, height, use8Connected = true) {
    const size = width * height;
    const labels = new Int32Array(size);
    const parent = new Int32Array(size);
    
    // Initialize union-find
    for (let i = 0; i < size; i++) {
        parent[i] = i;
    }
    
    // Find with path compression
    const find = (x) => {
        if (parent[x] !== x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    };
    
    // Union
    const union = (x, y) => {
        const px = find(x);
        const py = find(y);
        if (px !== py) {
            parent[px] = py;
        }
    };
    
    let nextLabel = 1;
    
    // First pass: assign provisional labels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            
            if (binaryImage[idx] === 0) continue;
            
            // Get neighbor labels
            const neighbors = [];
            
            // 4-connected neighbors (left, top)
            if (x > 0 && binaryImage[idx - 1] !== 0) {
                neighbors.push(labels[idx - 1]);
            }
            if (y > 0 && binaryImage[idx - width] !== 0) {
                neighbors.push(labels[idx - width]);
            }
            
            // 8-connected additional neighbors
            if (use8Connected) {
                if (x > 0 && y > 0 && binaryImage[idx - width - 1] !== 0) {
                    neighbors.push(labels[idx - width - 1]);
                }
                if (x < width - 1 && y > 0 && binaryImage[idx - width + 1] !== 0) {
                    neighbors.push(labels[idx - width + 1]);
                }
            }
            
            if (neighbors.length === 0) {
                // New component
                labels[idx] = nextLabel++;
            } else {
                // Use minimum label
                const minLabel = Math.min(...neighbors);
                labels[idx] = minLabel;
                
                // Union all neighbor labels
                for (const n of neighbors) {
                    union(n, minLabel);
                }
            }
        }
    }
    
    // Second pass: resolve equivalences
    const labelMap = new Map();
    let finalLabel = 1;
    
    for (let i = 0; i < size; i++) {
        if (labels[i] !== 0) {
            const root = find(labels[i]);
            if (!labelMap.has(root)) {
                labelMap.set(root, finalLabel++);
            }
            labels[i] = labelMap.get(root);
        }
    }
    
    return { labels, numComponents: finalLabel - 1 };
}

/**
 * Extract component boundaries
 * 
 * @param {Int32Array} labels 
 * @param {number} width 
 * @param {number} height 
 * @param {number} componentId 
 * @returns {Array<{x: number, y: number}>} - Boundary pixels
 */
export function extractBoundary(labels, width, height, componentId) {
    const boundary = [];
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            
            if (labels[idx] !== componentId) continue;
            
            // Check if boundary (has neighbor not in component)
            const isBoundary = 
                x === 0 || x === width - 1 ||
                y === 0 || y === height - 1 ||
                labels[idx - 1] !== componentId ||
                labels[idx + 1] !== componentId ||
                labels[idx - width] !== componentId ||
                labels[idx + width] !== componentId;
            
            if (isBoundary) {
                boundary.push({ x, y });
            }
        }
    }
    
    return boundary;
}

/**
 * Get component properties (bounding box, area, centroid)
 * 
 * @param {Int32Array} labels 
 * @param {number} width 
 * @param {number} height 
 * @param {number} numComponents 
 * @returns {Array<{id: number, area: number, centroid: {x: number, y: number}, bbox: {x: number, y: number, width: number, height: number}}>}
 */
export function componentProperties(labels, width, height, numComponents) {
    const props = [];
    
    for (let c = 1; c <= numComponents; c++) {
        let area = 0;
        let sumX = 0, sumY = 0;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (labels[y * width + x] === c) {
                    area++;
                    sumX += x;
                    sumY += y;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }
        
        if (area > 0) {
            props.push({
                id: c,
                area,
                centroid: { x: sumX / area, y: sumY / area },
                bbox: {
                    x: minX,
                    y: minY,
                    width: maxX - minX + 1,
                    height: maxY - minY + 1
                }
            });
        }
    }
    
    return props;
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOOD FILL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Flood fill algorithm
 * 
 * @param {Uint8Array} image 
 * @param {number} width 
 * @param {number} height 
 * @param {number} startX 
 * @param {number} startY 
 * @param {number} newValue 
 * @param {number} [tolerance=0] - Color tolerance for filling
 * @returns {Uint8Array} - Modified image
 */
export function floodFill(image, width, height, startX, startY, newValue, tolerance = 0) {
    const result = new Uint8Array(image);
    const startIdx = startY * width + startX;
    const targetValue = image[startIdx];
    
    if (Math.abs(targetValue - newValue) <= tolerance) return result;
    
    const stack = [[startX, startY]];
    const visited = new Set();
    
    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const idx = y * width + x;
        
        if (visited.has(idx)) continue;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (Math.abs(image[idx] - targetValue) > tolerance) continue;
        
        visited.add(idx);
        result[idx] = newValue;
        
        // 4-connected neighbors
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    return result;
}

export default {
    otsuThreshold,
    applyThreshold,
    multiOtsu,
    connectedComponents,
    extractBoundary,
    componentProperties,
    floodFill
};

