/**
 * @fileoverview Coordinate Transform Utilities
 * 
 * Polar mapping, projections, and coordinate conversions.
 * 
 * @module core/coordinate-transforms
 * @wikipedia https://en.wikipedia.org/wiki/Polar_coordinate_system
 * @wikipedia https://en.wikipedia.org/wiki/Lissajous_curve
 * 
 * Coordinate transformations:
 * @formula Cartesian to polar: r = √(x² + y²), θ = atan2(y, x)
 * @formula Polar to Cartesian: x = r·cos(θ), y = r·sin(θ)
 * @formula Rotation: x' = x·cos(θ) - y·sin(θ), y' = x·sin(θ) + y·cos(θ)
 * @formula Fish-eye distortion: r' = r^(1+k)
 * @formula Barrel distortion: factor = 1 + k·r²
 * 
 * Applications:
 * - Circular waveform displays
 * - Polar image transforms
 * - Lissajous oscilloscope figures
 */

// ═══════════════════════════════════════════════════════════════════════════
// POLAR COORDINATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert Cartesian to polar coordinates
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} [cx=0] - Center X
 * @param {number} [cy=0] - Center Y
 * @returns {{r: number, theta: number}} Polar coordinates (theta in radians, 0 at right, CCW positive)
 */
export function cartesianToPolar(x, y, cx = 0, cy = 0) {
    const dx = x - cx;
    const dy = y - cy;
    return {
        r: Math.sqrt(dx * dx + dy * dy),
        theta: Math.atan2(dy, dx)
    };
}

/**
 * Convert polar to Cartesian coordinates
 * 
 * @param {number} r - Radius
 * @param {number} theta - Angle in radians
 * @param {number} [cx=0] - Center X
 * @param {number} [cy=0] - Center Y
 * @returns {{x: number, y: number}} Cartesian coordinates
 */
export function polarToCartesian(r, theta, cx = 0, cy = 0) {
    return {
        x: cx + r * Math.cos(theta),
        y: cy + r * Math.sin(theta)
    };
}

/**
 * Map linear value to circular (radial) representation
 * 
 * @param {Float32Array|number[]} linear - Linear values
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} radius - Output radius
 * @param {number} [startAngle=0] - Starting angle in radians
 * @returns {Array<{x: number, y: number}>} Points on circle
 */
export function linearToCircular(linear, cx, cy, radius, startAngle = 0) {
    const points = [];
    const n = linear.length;
    
    for (let i = 0; i < n; i++) {
        const theta = startAngle + (i / n) * 2 * Math.PI;
        const r = radius * (1 + linear[i] * 0.5);
        points.push(polarToCartesian(r, theta, cx, cy));
    }
    
    return points;
}

/**
 * Map 2D waveform to circular oscilloscope display
 * 
 * @param {Float32Array} waveform - Waveform values (-1 to 1)
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} innerRadius - Inner radius (for value = -1)
 * @param {number} outerRadius - Outer radius (for value = 1)
 * @returns {Array<{x, y}>} Points for circular display
 */
export function waveformToCircular(waveform, cx, cy, innerRadius, outerRadius) {
    const points = [];
    const n = waveform.length;
    const radiusRange = outerRadius - innerRadius;
    
    for (let i = 0; i < n; i++) {
        const theta = (i / n) * 2 * Math.PI - Math.PI / 2; // Start at top
        const normalized = (waveform[i] + 1) / 2; // -1..1 → 0..1
        const r = innerRadius + normalized * radiusRange;
        points.push(polarToCartesian(r, theta, cx, cy));
    }
    
    // Close the loop
    points.push(points[0]);
    
    return points;
}

// ═══════════════════════════════════════════════════════════════════════════
// POLAR GRID TRANSFORMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Transform rectangular image to polar coordinates
 * 
 * @param {Float32Array} input - Input image data
 * @param {number} width - Input width
 * @param {number} height - Input height
 * @param {number} outputSize - Output image size (square)
 * @returns {Float32Array} Polar-transformed image
 */
export function rectangularToPolar(input, width, height, outputSize) {
    const output = new Float32Array(outputSize * outputSize);
    const cx = outputSize / 2;
    const cy = outputSize / 2;
    const maxR = Math.min(cx, cy);
    
    for (let y = 0; y < outputSize; y++) {
        for (let x = 0; x < outputSize; x++) {
            const polar = cartesianToPolar(x, y, cx, cy);
            
            if (polar.r <= maxR) {
                // Map r to input x, theta to input y
                const srcX = Math.floor((polar.r / maxR) * (width - 1));
                const srcY = Math.floor(((polar.theta + Math.PI) / (2 * Math.PI)) * (height - 1));
                
                const srcIdx = srcY * width + srcX;
                const dstIdx = y * outputSize + x;
                
                output[dstIdx] = input[srcIdx];
            }
        }
    }
    
    return output;
}

/**
 * Transform polar image back to rectangular
 * 
 * @param {Float32Array} input - Polar image data (square)
 * @param {number} inputSize - Input size
 * @param {number} outputWidth - Output width
 * @param {number} outputHeight - Output height
 * @returns {Float32Array} Rectangular image
 */
export function polarToRectangular(input, inputSize, outputWidth, outputHeight) {
    const output = new Float32Array(outputWidth * outputHeight);
    const cx = inputSize / 2;
    const cy = inputSize / 2;
    const maxR = Math.min(cx, cy);
    
    for (let y = 0; y < outputHeight; y++) {
        for (let x = 0; x < outputWidth; x++) {
            // Map x to radius, y to angle
            const r = (x / (outputWidth - 1)) * maxR;
            const theta = (y / (outputHeight - 1)) * 2 * Math.PI - Math.PI;
            
            const srcX = Math.floor(cx + r * Math.cos(theta));
            const srcY = Math.floor(cy + r * Math.sin(theta));
            
            if (srcX >= 0 && srcX < inputSize && srcY >= 0 && srcY < inputSize) {
                output[y * outputWidth + x] = input[srcY * inputSize + srcX];
            }
        }
    }
    
    return output;
}

// ═══════════════════════════════════════════════════════════════════════════
// OSCILLOSCOPE RENDERING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert waveform data to canvas path points
 * 
 * @param {Float32Array|number[]} waveform - Waveform values (-1 to 1)
 * @param {number} x - Left X coordinate
 * @param {number} y - Center Y coordinate
 * @param {number} width - Display width
 * @param {number} height - Display height (amplitude range)
 * @param {Object} [options] - Options
 * @param {number} [options.start=0] - Start sample index
 * @param {number} [options.end] - End sample index
 * @returns {Array<{x: number, y: number}>} Path points
 */
export function waveformToPath(waveform, x, y, width, height, options = {}) {
    const { start = 0, end = waveform.length } = options;
    const points = [];
    const count = end - start;
    const halfHeight = height / 2;
    
    for (let i = 0; i < count; i++) {
        const sampleIdx = start + i;
        const px = x + (i / (count - 1)) * width;
        const py = y - waveform[sampleIdx] * halfHeight;
        points.push({ x: px, y: py });
    }
    
    return points;
}

/**
 * Create Lissajous figure from two waveforms
 * 
 * @param {Float32Array} waveX - X-axis waveform
 * @param {Float32Array} waveY - Y-axis waveform
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} size - Display size
 * @returns {Array<{x, y}>} Lissajous path points
 */
export function lissajousFigure(waveX, waveY, cx, cy, size) {
    const points = [];
    const n = Math.min(waveX.length, waveY.length);
    const halfSize = size / 2;
    
    for (let i = 0; i < n; i++) {
        points.push({
            x: cx + waveX[i] * halfSize,
            y: cy + waveY[i] * halfSize
        });
    }
    
    return points;
}

/**
 * Generate XY oscilloscope trail with decay
 * 
 * @param {Array<{x: number, y: number}>} history - Point history (newest first)
 * @param {number} maxAge - Maximum trail length
 * @returns {Array<{x: number, y: number, alpha: number}>} Points with decay
 */
export function oscilloscopeTrail(history, maxAge) {
    const trail = [];
    const count = Math.min(history.length, maxAge);
    
    for (let i = 0; i < count; i++) {
        const age = i / maxAge;
        const alpha = Math.pow(1 - age, 2); // Quadratic decay
        trail.push({ ...history[i], alpha });
    }
    
    return trail;
}

// ═══════════════════════════════════════════════════════════════════════════
// MISCELLANEOUS TRANSFORMS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rotate point around origin
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} angle - Rotation angle in radians
 * @param {number} [cx=0] - Center X
 * @param {number} [cy=0] - Center Y
 * @returns {{x: number, y: number}} Rotated point
 */
export function rotatePoint(x, y, angle, cx = 0, cy = 0) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = x - cx;
    const dy = y - cy;
    
    return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos
    };
}

/**
 * Scale point around origin
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} scale - Scale factor
 * @param {number} [cx=0] - Center X
 * @param {number} [cy=0] - Center Y
 * @returns {{x: number, y: number}} Scaled point
 */
export function scalePoint(x, y, scale, cx = 0, cy = 0) {
    return {
        x: cx + (x - cx) * scale,
        y: cy + (y - cy) * scale
    };
}

/**
 * Apply fish-eye distortion
 * 
 * @param {number} x - X coordinate (normalized -1 to 1)
 * @param {number} y - Y coordinate (normalized -1 to 1)
 * @param {number} strength - Distortion strength (0 = none, 1 = strong)
 * @returns {{x: number, y: number}} Distorted point
 */
export function fishEye(x, y, strength) {
    const r = Math.sqrt(x * x + y * y);
    if (r === 0) return { x, y };
    
    const theta = Math.atan2(y, x);
    const newR = Math.pow(r, 1 + strength);
    
    return {
        x: newR * Math.cos(theta),
        y: newR * Math.sin(theta)
    };
}

/**
 * Apply barrel/pincushion distortion
 * 
 * @param {number} x - X coordinate (normalized -1 to 1)
 * @param {number} y - Y coordinate (normalized -1 to 1)
 * @param {number} k - Distortion coefficient (>0 = barrel, <0 = pincushion)
 * @returns {{x: number, y: number}} Distorted point
 */
export function barrelDistortion(x, y, k) {
    const r2 = x * x + y * y;
    const factor = 1 + k * r2;
    
    return {
        x: x * factor,
        y: y * factor
    };
}

