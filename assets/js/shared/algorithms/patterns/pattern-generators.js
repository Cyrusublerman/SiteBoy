/**
 * @fileoverview Pattern Generation Library
 * 
 * Procedural pattern generators including Truchet tiles, gratings, and moiré effects.
 * All functions are pure and stateless.
 * 
 * @module patterns/pattern-generators
 */

// ═══════════════════════════════════════════════════════════════════════════
// TRUCHET TILES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate Truchet tile grid states
 *
 * @source blog/ideas/reference documentation/18_Pattern_Generation/Truchet_tiles.md
 * @wikipedia https://en.wikipedia.org/wiki/Truchet_tiles
 * @section Quarter-Circle Truchet (Smith Tiles)
 * @formula s_{i,j} \in \{0, 1\} determines tile orientation
 *
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 * @param {number} [seed=0] - Random seed
 * @returns {Uint8Array} Flat array of tile states (0 or 1)
 */
export function generateTruchetGrid(cols, rows, seed = 0) {
    const grid = new Uint8Array(cols * rows);
    
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid[j * cols + i] = hashTile(i, j, seed) & 1;
        }
    }
    
    return grid;
}

/**
 * Get Truchet tile arcs for rendering
 * 
 * @param {number} i - Column index
 * @param {number} j - Row index
 * @param {number} state - Tile state (0 or 1)
 * @param {number} size - Tile size in pixels
 * @returns {Array<{cx: number, cy: number, r: number, startAngle: number, endAngle: number}>}
 */
export function getTruchetArcs(i, j, state, size) {
    const x = i * size;
    const y = j * size;
    const r = size / 2;
    
    if (state === 0) {
        return [
            { cx: x, cy: y, r, startAngle: 0, endAngle: Math.PI / 2 },
            { cx: x + size, cy: y + size, r, startAngle: Math.PI, endAngle: 3 * Math.PI / 2 }
        ];
    } else {
        return [
            { cx: x + size, cy: y, r, startAngle: Math.PI / 2, endAngle: Math.PI },
            { cx: x, cy: y + size, r, startAngle: 3 * Math.PI / 2, endAngle: 2 * Math.PI }
        ];
    }
}

/**
 * Evaluate Truchet tile at a point (SDF-like)
 * Returns distance to nearest arc edge
 * 
 * @param {number} px - X coordinate
 * @param {number} py - Y coordinate
 * @param {number} tileSize - Size of each tile
 * @param {Uint8Array} grid - Tile states
 * @param {number} cols - Grid columns
 * @param {number} strokeWidth - Arc stroke width
 * @returns {number} Distance to arc (negative inside stroke)
 */
export function truchetSDF(px, py, tileSize, grid, cols, strokeWidth) {
    const i = Math.floor(px / tileSize);
    const j = Math.floor(py / tileSize);
    const idx = j * cols + i;
    const state = grid[idx] || 0;
    
    const lx = px - i * tileSize;
    const ly = py - j * tileSize;
    const r = tileSize / 2;
    
    let minDist = Infinity;
    
    const arcs = getTruchetArcs(0, 0, state, tileSize);
    for (const arc of arcs) {
        const dx = lx - arc.cx;
        const dy = ly - arc.cy;
        const dist = Math.abs(Math.sqrt(dx * dx + dy * dy) - r);
        minDist = Math.min(minDist, dist);
    }
    
    return minDist - strokeWidth / 2;
}

// ═══════════════════════════════════════════════════════════════════════════
// GRATING PATTERNS (for Moiré)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Linear grating intensity
 * 
 * @param {number} x - X coordinate
 * @param {number} wavelength - Grating period
 * @param {number} [phase=0] - Phase offset (0 to 1)
 * @param {number} [angle=0] - Rotation angle in radians
 * @returns {number} Intensity [0, 1]
 */
export function linearGrating(x, y, wavelength, phase = 0, angle = 0) {
    const rotX = x * Math.cos(angle) + y * Math.sin(angle);
    return 0.5 * (1 + Math.cos(2 * Math.PI * (rotX / wavelength + phase)));
}

/**
 * Radial grating intensity (concentric rings)
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} wavelength - Ring spacing
 * @param {number} [phase=0] - Phase offset
 * @returns {number} Intensity [0, 1]
 */
export function radialGrating(x, y, cx, cy, wavelength, phase = 0) {
    const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    return 0.5 * (1 + Math.cos(2 * Math.PI * (r / wavelength + phase)));
}

/**
 * Angular grating intensity (spokes)
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} n - Number of lobes
 * @param {number} [phase=0] - Angular phase offset (radians)
 * @returns {number} Intensity [0, 1]
 */
export function angularGrating(x, y, cx, cy, n, phase = 0) {
    const theta = Math.atan2(y - cy, x - cx);
    return 0.5 * (1 + Math.cos(n * theta + phase));
}

/**
 * Spiral grating (combined radial + angular)
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} wavelength - Radial wavelength
 * @param {number} spiralRate - Angular twist per revolution
 * @param {number} [phase=0] - Phase offset
 * @returns {number} Intensity [0, 1]
 */
export function spiralGrating(x, y, cx, cy, wavelength, spiralRate, phase = 0) {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    const theta = Math.atan2(dy, dx);
    const u = r / wavelength + spiralRate * theta / (2 * Math.PI);
    return 0.5 * (1 + Math.cos(2 * Math.PI * (u + phase)));
}

// ═══════════════════════════════════════════════════════════════════════════
// MOIRÉ COMBINATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Combine two grating intensities
 * 
 * @param {number} i1 - First grating intensity
 * @param {number} i2 - Second grating intensity
 * @param {'product'|'sum'|'min'|'max'|'xor'} [mode='product'] - Combination mode
 * @returns {number} Combined intensity
 */
export function combineMoire(i1, i2, mode = 'product') {
    switch (mode) {
        case 'product': return i1 * i2;
        case 'sum': return Math.min(1, (i1 + i2) / 2);
        case 'min': return Math.min(i1, i2);
        case 'max': return Math.max(i1, i2);
        case 'xor': return Math.abs(i1 - i2);
        default: return i1 * i2;
    }
}

/**
 * Apply threshold to grating intensity
 * 
 * @param {number} intensity - Input intensity [0, 1]
 * @param {number} threshold - Threshold value [0, 1]
 * @param {boolean} [smooth=false] - Use smoothstep instead of hard threshold
 * @param {number} [smoothness=0.1] - Smoothstep width
 * @returns {number} Thresholded value (0 or 1, or smooth transition)
 */
export function thresholdGrating(intensity, threshold, smooth = false, smoothness = 0.1) {
    if (!smooth) {
        return intensity > threshold ? 1 : 0;
    }
    
    const t = (intensity - threshold + smoothness / 2) / smoothness;
    return Math.max(0, Math.min(1, t * t * (3 - 2 * t)));
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPERELLIPSE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Superellipse implicit function
 * 
 * Formula: |x/a|^n + |y/b|^n - 1
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} a - Semi-axis X
 * @param {number} b - Semi-axis Y
 * @param {number} n - Exponent (2=ellipse, >2=rounded rect, <2=star)
 * @returns {number} <0 inside, =0 on boundary, >0 outside
 */
export function superellipse(x, y, a, b, n) {
    return Math.pow(Math.abs(x / a), n) + Math.pow(Math.abs(y / b), n) - 1;
}

/**
 * Superellipse parametric point
 * 
 * @param {number} theta - Angle [0, 2π)
 * @param {number} a - Semi-axis X
 * @param {number} b - Semi-axis Y
 * @param {number} n - Exponent
 * @returns {{x: number, y: number}} Point on superellipse
 */
export function superellipsePoint(theta, a, b, n) {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const exp = 2 / n;
    return {
        x: a * Math.sign(c) * Math.pow(Math.abs(c), exp),
        y: b * Math.sign(s) * Math.pow(Math.abs(s), exp)
    };
}

/**
 * Generate superellipse points for rendering
 * 
 * @param {number} a - Semi-axis X
 * @param {number} b - Semi-axis Y
 * @param {number} n - Exponent
 * @param {number} [segments=64] - Number of points
 * @returns {Array<{x: number, y: number}>} Array of points
 */
export function superellipsePoints(a, b, n, segments = 64) {
    const points = [];
    for (let i = 0; i < segments; i++) {
        const theta = (2 * Math.PI * i) / segments;
        points.push(superellipsePoint(theta, a, b, n));
    }
    return points;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hash function for tile state generation
 * 
 * @param {number} i - Column index
 * @param {number} j - Row index
 * @param {number} seed - Random seed
 * @returns {number} Hash value
 */
function hashTile(i, j, seed) {
    let h = seed >>> 0;
    h = ((h ^ i) * 0x45d9f3b) >>> 0;
    h = ((h ^ j) * 0x45d9f3b) >>> 0;
    h = ((h >> 16) ^ h) >>> 0;
    return h;
}

