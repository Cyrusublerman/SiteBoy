/**
 * @fileoverview Halftone Pattern Generation
 * 
 * Line family halftone, contour-aligned lattices, and dot patterns.
 * 
 * @module patterns/halftone-patterns
 * @source blog/ideas/reference documentation/18_Pattern_Generation/Halftone.md
 * @wikipedia https://en.wikipedia.org/wiki/Halftone
 * 
 * Techniques implemented:
 * - Line family halftone: parallel lines with width modulated by luminance
 * - Cross-hatch: dual-angle line overlays for dark regions
 * - Contour-aligned lattice: dots following gradient field
 * - Dyadic frequency scaling: multi-resolution dot patterns
 * 
 * @formula Line width: w = w_min + (1 - luminance) × (w_max - w_min)
 * @formula Rec. 709 luminance: L = 0.2126R + 0.7152G + 0.0722B
 */

// ═══════════════════════════════════════════════════════════════════════════
// LINE FAMILY HALFTONE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate parallel line family halftone
 * 
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Float32Array|number[]} luminance - Luminance values (0-1)
 * @param {Object} params - Parameters
 * @param {number} params.angle - Line angle in radians
 * @param {number} params.spacing - Base line spacing
 * @param {number} [params.minWidth=0.5] - Minimum line width
 * @param {number} [params.maxWidth=5] - Maximum line width
 * @returns {Array<{x1, y1, x2, y2, width}>} Line segments
 */
export function lineHalftone(width, height, luminance, params) {
    const { angle, spacing, minWidth = 0.5, maxWidth = 5 } = params;
    const lines = [];
    
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    // Perpendicular direction for line offset
    const perpX = -sin;
    const perpY = cos;
    
    // Calculate number of lines needed to cover image
    const diagonal = Math.sqrt(width * width + height * height);
    const numLines = Math.ceil(diagonal / spacing);
    
    // Center offset
    const cx = width / 2;
    const cy = height / 2;
    
    for (let i = -numLines; i <= numLines; i++) {
        const lineOffset = i * spacing;
        
        // Find line intersections with image bounds
        // Line passes through (cx + perpX * offset, cy + perpY * offset) with direction (cos, sin)
        const px = cx + perpX * lineOffset;
        const py = cy + perpY * lineOffset;
        
        // Find entry/exit points
        const tValues = [];
        
        // Left edge (x = 0)
        if (Math.abs(cos) > 0.0001) {
            const t = (0 - px) / cos;
            const y = py + t * sin;
            if (y >= 0 && y <= height) tValues.push(t);
        }
        
        // Right edge (x = width)
        if (Math.abs(cos) > 0.0001) {
            const t = (width - px) / cos;
            const y = py + t * sin;
            if (y >= 0 && y <= height) tValues.push(t);
        }
        
        // Top edge (y = 0)
        if (Math.abs(sin) > 0.0001) {
            const t = (0 - py) / sin;
            const x = px + t * cos;
            if (x >= 0 && x <= width) tValues.push(t);
        }
        
        // Bottom edge (y = height)
        if (Math.abs(sin) > 0.0001) {
            const t = (height - py) / sin;
            const x = px + t * cos;
            if (x >= 0 && x <= width) tValues.push(t);
        }
        
        if (tValues.length < 2) continue;
        
        tValues.sort((a, b) => a - b);
        const t0 = tValues[0];
        const t1 = tValues[tValues.length - 1];
        
        const x1 = px + t0 * cos;
        const y1 = py + t0 * sin;
        const x2 = px + t1 * cos;
        const y2 = py + t1 * sin;
        
        // Sample luminance along line to determine width
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const numSamples = Math.ceil(lineLength / spacing);
        
        let avgLum = 0;
        let samples = 0;
        
        for (let j = 0; j <= numSamples; j++) {
            const t = j / numSamples;
            const sx = Math.floor(x1 + t * (x2 - x1));
            const sy = Math.floor(y1 + t * (y2 - y1));
            
            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                avgLum += luminance[sy * width + sx];
                samples++;
            }
        }
        
        if (samples > 0) {
            avgLum /= samples;
            // Darker = wider line
            const lineWidth = minWidth + (1 - avgLum) * (maxWidth - minWidth);
            
            lines.push({ x1, y1, x2, y2, width: lineWidth });
        }
    }
    
    return lines;
}

/**
 * Generate cross-hatch pattern
 * 
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Float32Array} luminance - Luminance values
 * @param {Object} params - Parameters
 * @param {number} params.spacing - Line spacing
 * @param {number} [params.angle1=0.785] - First angle (default 45°)
 * @param {number} [params.angle2=-0.785] - Second angle (default -45°)
 * @param {number} [params.threshold=0.5] - Luminance threshold for second layer
 * @returns {Array<{x1, y1, x2, y2, width}>} Line segments
 */
export function crossHatchHalftone(width, height, luminance, params) {
    const { spacing, angle1 = Math.PI / 4, angle2 = -Math.PI / 4, threshold = 0.5 } = params;
    
    // First layer always
    const lines1 = lineHalftone(width, height, luminance, { angle: angle1, spacing });
    
    // Second layer only in dark areas
    const darkLuminance = luminance.map(v => v < threshold ? v : 1);
    const lines2 = lineHalftone(width, height, darkLuminance, { angle: angle2, spacing });
    
    return [...lines1, ...lines2];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTOUR-ALIGNED LATTICE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate points aligned to contours/gradients
 * 
 * @param {Float32Array} field - Scalar field (e.g., distance field or luminance)
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {Object} params - Parameters
 * @param {number} params.spacing - Base point spacing
 * @param {number} [params.jitter=0.2] - Random jitter amount
 * @returns {Array<{x, y, angle}>} Points with tangent angle
 */
export function contourAlignedLattice(field, width, height, params) {
    const { spacing, jitter = 0.2 } = params;
    const points = [];
    
    // Generate grid of points
    for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
            // Add jitter
            const jx = x + (Math.random() - 0.5) * spacing * jitter;
            const jy = y + (Math.random() - 0.5) * spacing * jitter;
            
            // Clamp to bounds
            const px = Math.max(1, Math.min(width - 2, jx));
            const py = Math.max(1, Math.min(height - 2, jy));
            
            // Compute gradient at this point
            const ix = Math.floor(px);
            const iy = Math.floor(py);
            const idx = iy * width + ix;
            
            // Sobel-like gradient
            const gx = field[idx + 1] - field[idx - 1];
            const gy = field[idx + width] - field[idx - width];
            
            // Tangent is perpendicular to gradient
            const angle = Math.atan2(-gx, gy);
            
            points.push({ x: px, y: py, angle });
        }
    }
    
    return points;
}

/**
 * Generate dots sized by luminance
 * 
 * @param {Array<{x, y, angle}>} lattice - Lattice points
 * @param {Float32Array} luminance - Luminance values
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Object} params - Parameters
 * @param {number} params.minRadius - Minimum dot radius
 * @param {number} params.maxRadius - Maximum dot radius
 * @returns {Array<{x, y, radius, angle}>} Sized dots
 */
export function sizeDotsFromLuminance(lattice, luminance, width, height, params) {
    const { minRadius, maxRadius } = params;
    
    return lattice.map(point => {
        const ix = Math.floor(point.x);
        const iy = Math.floor(point.y);
        
        if (ix < 0 || ix >= width || iy < 0 || iy >= height) {
            return { ...point, radius: minRadius };
        }
        
        const lum = luminance[iy * width + ix];
        // Darker = larger dot
        const radius = minRadius + (1 - lum) * (maxRadius - minRadius);
        
        return { ...point, radius };
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// DYADIC FREQUENCY SCALING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate multi-frequency halftone with dyadic scaling
 * 
 * @param {Float32Array} luminance - Luminance values
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Object} params - Parameters
 * @param {number} params.baseSpacing - Base grid spacing
 * @param {number} [params.levels=3] - Number of frequency levels
 * @param {number[]} [params.thresholds] - Luminance thresholds for each level
 * @returns {Array<{x, y, radius, level}>} Multi-scale dots
 */
export function dyadicHalftone(luminance, width, height, params) {
    const { baseSpacing, levels = 3, thresholds } = params;
    const dots = [];
    
    // Default thresholds: evenly spaced
    const thresh = thresholds || 
        Array.from({ length: levels }, (_, i) => (i + 1) / (levels + 1));
    
    for (let level = 0; level < levels; level++) {
        const spacing = baseSpacing * Math.pow(2, level);
        const threshold = thresh[level];
        
        for (let y = spacing / 2; y < height; y += spacing) {
            for (let x = spacing / 2; x < width; x += spacing) {
                const ix = Math.floor(x);
                const iy = Math.floor(y);
                
                if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
                    const lum = luminance[iy * width + ix];
                    
                    if (lum < threshold) {
                        const radius = spacing * 0.4 * (1 - lum / threshold);
                        dots.push({ x, y, radius, level });
                    }
                }
            }
        }
    }
    
    return dots;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPTH/NORMAL MAP SAMPLING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract luminance from RGB image
 * 
 * @param {Uint8Array|Uint8ClampedArray} imageData - RGBA pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Float32Array} Luminance values (0-1)
 */
export function extractLuminance(imageData, width, height) {
    const luminance = new Float32Array(width * height);
    
    for (let i = 0; i < luminance.length; i++) {
        const r = imageData[i * 4] / 255;
        const g = imageData[i * 4 + 1] / 255;
        const b = imageData[i * 4 + 2] / 255;
        
        // Rec. 709 luminance
        luminance[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    
    return luminance;
}

/**
 * Extract depth from normal map (assumes Z is pointing out)
 * 
 * @param {Uint8Array|Uint8ClampedArray} normalMap - RGBA normal map data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {{normals: Array<{x,y,z}>, depth: Float32Array}} Normal vectors and estimated depth
 */
export function extractNormalMap(normalMap, width, height) {
    const normals = [];
    const depth = new Float32Array(width * height);
    
    for (let i = 0; i < width * height; i++) {
        const nx = normalMap[i * 4] / 127.5 - 1;
        const ny = normalMap[i * 4 + 1] / 127.5 - 1;
        const nz = normalMap[i * 4 + 2] / 127.5 - 1;
        
        // Normalize
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        normals.push({
            x: len > 0 ? nx / len : 0,
            y: len > 0 ? ny / len : 0,
            z: len > 0 ? nz / len : 1
        });
        
        // Estimate depth from normal Z component
        depth[i] = (nz + 1) / 2;
    }
    
    return { normals, depth };
}

/**
 * Extract depth from depth map image
 * 
 * @param {Uint8Array|Uint8ClampedArray} depthMap - Grayscale depth map (R channel)
 * @param {number} width - Image width  
 * @param {number} height - Image height
 * @param {Object} [params] - Parameters
 * @param {number} [params.near=0] - Near depth value
 * @param {number} [params.far=1] - Far depth value
 * @param {boolean} [params.invert=false] - Invert depth
 * @returns {Float32Array} Normalized depth values (0-1)
 */
export function extractDepthMap(depthMap, width, height, params = {}) {
    const { near = 0, far = 1, invert = false } = params;
    const depth = new Float32Array(width * height);
    
    for (let i = 0; i < depth.length; i++) {
        let d = depthMap[i * 4] / 255;
        if (invert) d = 1 - d;
        depth[i] = near + d * (far - near);
    }
    
    return depth;
}

