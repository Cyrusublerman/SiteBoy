/**
 * @fileoverview Histogram of Oriented Gradients (HOG)
 * 
 * Feature descriptor for shape and edge structure analysis.
 * All functions are pure and stateless.
 * 
 * @module features/hog
 */

// ═══════════════════════════════════════════════════════════════════════════
// GRADIENT COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute image gradients using simple [-1, 0, 1] filter
 * 
 * @param {Uint8Array|Float32Array} image - Grayscale image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {{gradX: Float32Array, gradY: Float32Array, magnitude: Float32Array, orientation: Float32Array}}
 */
export function computeGradients(image, width, height) {
    const size = width * height;
    const gradX = new Float32Array(size);
    const gradY = new Float32Array(size);
    const magnitude = new Float32Array(size);
    const orientation = new Float32Array(size);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            
            // Gradient X: [-1, 0, 1]
            const x0 = Math.max(0, x - 1);
            const x1 = Math.min(width - 1, x + 1);
            gradX[idx] = image[y * width + x1] - image[y * width + x0];
            
            // Gradient Y: [-1, 0, 1]^T
            const y0 = Math.max(0, y - 1);
            const y1 = Math.min(height - 1, y + 1);
            gradY[idx] = image[y1 * width + x] - image[y0 * width + x];
            
            // Magnitude and orientation
            const gx = gradX[idx];
            const gy = gradY[idx];
            magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
            
            // Unsigned orientation (0 to π)
            let angle = Math.atan2(gy, gx);
            if (angle < 0) angle += Math.PI;
            if (angle >= Math.PI) angle -= Math.PI;
            orientation[idx] = angle;
        }
    }
    
    return { gradX, gradY, magnitude, orientation };
}

// ═══════════════════════════════════════════════════════════════════════════
// HISTOGRAM COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build orientation histogram for a cell
 * 
 * @param {Float32Array} magnitude - Gradient magnitudes
 * @param {Float32Array} orientation - Gradient orientations (0 to π)
 * @param {number} width - Image width
 * @param {number} cellX - Cell X index
 * @param {number} cellY - Cell Y index
 * @param {number} cellSize - Cell size in pixels
 * @param {number} numBins - Number of orientation bins
 * @returns {Float32Array} Histogram (numBins elements)
 */
export function buildCellHistogram(magnitude, orientation, width, cellX, cellY, cellSize, numBins) {
    const histogram = new Float32Array(numBins);
    const binWidth = Math.PI / numBins;
    
    const startX = cellX * cellSize;
    const startY = cellY * cellSize;
    
    for (let dy = 0; dy < cellSize; dy++) {
        for (let dx = 0; dx < cellSize; dx++) {
            const x = startX + dx;
            const y = startY + dy;
            const idx = y * width + x;
            
            const mag = magnitude[idx];
            const angle = orientation[idx];
            
            // Soft binning (interpolate between adjacent bins)
            const binFloat = angle / binWidth;
            const binLow = Math.floor(binFloat) % numBins;
            const binHigh = (binLow + 1) % numBins;
            const weight = binFloat - Math.floor(binFloat);
            
            histogram[binLow] += mag * (1 - weight);
            histogram[binHigh] += mag * weight;
        }
    }
    
    return histogram;
}

/**
 * Normalize histogram (L2-norm with clipping)
 * 
 * @param {Float32Array} histogram - Input histogram
 * @param {number} [clipValue=0.2] - Maximum value after first normalization
 * @param {number} [epsilon=1e-5] - Small value to prevent division by zero
 * @returns {Float32Array} Normalized histogram
 */
export function normalizeHistogram(histogram, clipValue = 0.2, epsilon = 1e-5) {
    // First L2 normalization
    let norm = 0;
    for (let i = 0; i < histogram.length; i++) {
        norm += histogram[i] * histogram[i];
    }
    norm = Math.sqrt(norm + epsilon);
    
    const result = new Float32Array(histogram.length);
    for (let i = 0; i < histogram.length; i++) {
        result[i] = Math.min(histogram[i] / norm, clipValue);
    }
    
    // Second L2 normalization after clipping
    norm = 0;
    for (let i = 0; i < result.length; i++) {
        norm += result[i] * result[i];
    }
    norm = Math.sqrt(norm + epsilon);
    
    for (let i = 0; i < result.length; i++) {
        result[i] /= norm;
    }
    
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOG DESCRIPTOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute HOG descriptor for image region
 * 
 * @param {Uint8Array|Float32Array} image - Grayscale image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Object} [options] - HOG parameters
 * @param {number} [options.cellSize=8] - Cell size in pixels
 * @param {number} [options.blockSize=2] - Block size in cells
 * @param {number} [options.numBins=9] - Number of orientation bins
 * @returns {{descriptor: Float32Array, cellsX: number, cellsY: number}}
 */
export function computeHOG(image, width, height, options = {}) {
    const {
        cellSize = 8,
        blockSize = 2,
        numBins = 9
    } = options;
    
    // Compute gradients
    const { magnitude, orientation } = computeGradients(image, width, height);
    
    // Compute cell histograms
    const cellsX = Math.floor(width / cellSize);
    const cellsY = Math.floor(height / cellSize);
    const cellHistograms = [];
    
    for (let cy = 0; cy < cellsY; cy++) {
        for (let cx = 0; cx < cellsX; cx++) {
            const hist = buildCellHistogram(
                magnitude, orientation, width,
                cx, cy, cellSize, numBins
            );
            cellHistograms.push(hist);
        }
    }
    
    // Build block-normalized descriptor
    const blocksX = cellsX - blockSize + 1;
    const blocksY = cellsY - blockSize + 1;
    const blockFeatures = blockSize * blockSize * numBins;
    const descriptor = new Float32Array(blocksX * blocksY * blockFeatures);
    
    let descIdx = 0;
    for (let by = 0; by < blocksY; by++) {
        for (let bx = 0; bx < blocksX; bx++) {
            // Concatenate cell histograms in block
            const blockHist = new Float32Array(blockFeatures);
            let histIdx = 0;
            
            for (let cy = 0; cy < blockSize; cy++) {
                for (let cx = 0; cx < blockSize; cx++) {
                    const cellIdx = (by + cy) * cellsX + (bx + cx);
                    const cellHist = cellHistograms[cellIdx];
                    blockHist.set(cellHist, histIdx);
                    histIdx += numBins;
                }
            }
            
            // Normalize block
            const normalizedBlock = normalizeHistogram(blockHist);
            descriptor.set(normalizedBlock, descIdx);
            descIdx += blockFeatures;
        }
    }
    
    return { descriptor, cellsX, cellsY };
}

/**
 * Compare two HOG descriptors
 * 
 * @param {Float32Array} desc1 - First descriptor
 * @param {Float32Array} desc2 - Second descriptor
 * @param {string} [metric='cosine'] - Distance metric: 'cosine', 'euclidean', 'chi-squared'
 * @returns {number} Similarity/distance score
 */
export function compareHOG(desc1, desc2, metric = 'cosine') {
    if (desc1.length !== desc2.length) {
        throw new Error('Descriptor lengths must match');
    }
    
    switch (metric) {
        case 'cosine': {
            let dot = 0, norm1 = 0, norm2 = 0;
            for (let i = 0; i < desc1.length; i++) {
                dot += desc1[i] * desc2[i];
                norm1 += desc1[i] * desc1[i];
                norm2 += desc2[i] * desc2[i];
            }
            return dot / (Math.sqrt(norm1) * Math.sqrt(norm2) + 1e-10);
        }
        case 'euclidean': {
            let sum = 0;
            for (let i = 0; i < desc1.length; i++) {
                const d = desc1[i] - desc2[i];
                sum += d * d;
            }
            return Math.sqrt(sum);
        }
        case 'chi-squared': {
            let sum = 0;
            for (let i = 0; i < desc1.length; i++) {
                const a = desc1[i], b = desc2[i];
                if (a + b > 0) {
                    sum += (a - b) ** 2 / (a + b);
                }
            }
            return sum / 2;
        }
        default:
            throw new Error(`Unknown metric: ${metric}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// VISUALIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate HOG visualization data
 * 
 * @param {Float32Array} magnitude - Gradient magnitudes
 * @param {Float32Array} orientation - Gradient orientations
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} cellSize - Cell size
 * @param {number} numBins - Number of bins
 * @returns {Array<{x: number, y: number, histogram: Float32Array}>} Visualization data
 */
export function hogVisualizationData(magnitude, orientation, width, height, cellSize, numBins) {
    const cellsX = Math.floor(width / cellSize);
    const cellsY = Math.floor(height / cellSize);
    const cells = [];
    
    for (let cy = 0; cy < cellsY; cy++) {
        for (let cx = 0; cx < cellsX; cx++) {
            const hist = buildCellHistogram(
                magnitude, orientation, width,
                cx, cy, cellSize, numBins
            );
            
            // Normalize for visualization
            const maxVal = Math.max(...hist, 0.001);
            const normalizedHist = hist.map(v => v / maxVal);
            
            cells.push({
                x: (cx + 0.5) * cellSize,
                y: (cy + 0.5) * cellSize,
                histogram: normalizedHist
            });
        }
    }
    
    return cells;
}

