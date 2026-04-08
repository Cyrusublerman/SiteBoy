/**
 * @fileoverview Marching Squares Algorithm
 * 
 * Extract iso-contours from scalar fields.
 * All functions are pure and stateless.
 * 
 * @module geometry/marching-squares
 * @source blog/ideas/reference documentation/03_Raster_Vector_Conversion/Marching_squares.md
 * @wikipedia https://en.wikipedia.org/wiki/Marching_squares
 * 
 * Key concepts from reference:
 * - 16 cell cases from 4-bit corner index (0-15)
 * - Linear interpolation along edges for exact contour position
 * - Saddle point disambiguation for cases 5 and 10
 * 
 * @formula Cell index: walk clockwise from top-left, build 4-bit binary
 * @formula Edge interpolation: t = (threshold - v0) / (v1 - v0)
 */

// ═══════════════════════════════════════════════════════════════════════════
// MARCHING SQUARES CORE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Edge table for marching squares (16 cases)
 * Each entry defines which edges have line segments
 */
const EDGE_TABLE = [
    [],           // 0000
    [[3, 0]],     // 0001
    [[0, 1]],     // 0010
    [[3, 1]],     // 0011
    [[1, 2]],     // 0100
    [[3, 0], [1, 2]], // 0101 (saddle)
    [[0, 2]],     // 0110
    [[3, 2]],     // 0111
    [[2, 3]],     // 1000
    [[2, 0]],     // 1001
    [[0, 1], [2, 3]], // 1010 (saddle)
    [[2, 1]],     // 1011
    [[1, 3]],     // 1100
    [[1, 0]],     // 1101
    [[0, 3]],     // 1110
    []            // 1111
];

/**
 * Get edge midpoint coordinates
 * Edges: 0=bottom, 1=right, 2=top, 3=left
 * 
 * @param {number} edge - Edge index (0-3)
 * @param {number} x - Cell X
 * @param {number} y - Cell Y
 * @param {number} cellSize - Cell size
 * @param {Object} values - Corner values {bl, br, tr, tl}
 * @param {number} threshold - Iso value
 * @returns {{x: number, y: number}}
 */
function getEdgePoint(edge, x, y, cellSize, values, threshold) {
    const { bl, br, tr, tl } = values;
    
    // Interpolate along edge based on threshold crossing
    let t;
    switch (edge) {
        case 0: // bottom (bl to br)
            t = (threshold - bl) / (br - bl);
            return { x: x + t * cellSize, y: y };
        case 1: // right (br to tr)
            t = (threshold - br) / (tr - br);
            return { x: x + cellSize, y: y + t * cellSize };
        case 2: // top (tr to tl)
            t = (threshold - tr) / (tl - tr);
            return { x: x + (1 - t) * cellSize, y: y + cellSize };
        case 3: // left (tl to bl)
            t = (threshold - tl) / (bl - tl);
            return { x: x, y: y + (1 - t) * cellSize };
        default:
            return { x: x + cellSize / 2, y: y + cellSize / 2 };
    }
}

/**
 * Extract contour lines at a given threshold using marching squares
 * 
 * @param {Float32Array|number[]} field - Scalar field values
 * @param {number} width - Field width in cells
 * @param {number} height - Field height in cells
 * @param {number} threshold - Iso value to extract
 * @param {Object} [options] - Options
 * @param {number} [options.cellSize=1] - Cell size in output coordinates
 * @returns {Array<Array<{x: number, y: number}>>} Array of polylines
 */
export function marchingSquares(field, width, height, threshold, options = {}) {
    const { cellSize = 1 } = options;
    const segments = [];
    
    // Process each cell
    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
            // Get corner values
            const bl = field[y * width + x];           // bottom-left
            const br = field[y * width + x + 1];       // bottom-right
            const tr = field[(y + 1) * width + x + 1]; // top-right
            const tl = field[(y + 1) * width + x];     // top-left
            
            // Build case index (4-bit)
            let caseIndex = 0;
            if (bl >= threshold) caseIndex |= 1;
            if (br >= threshold) caseIndex |= 2;
            if (tr >= threshold) caseIndex |= 4;
            if (tl >= threshold) caseIndex |= 8;
            
            // Get edges for this case
            const edges = EDGE_TABLE[caseIndex];
            if (edges.length === 0) continue;
            
            const values = { bl, br, tr, tl };
            const px = x * cellSize;
            const py = y * cellSize;
            
            // Generate line segments
            for (const [e1, e2] of edges) {
                const p1 = getEdgePoint(e1, px, py, cellSize, values, threshold);
                const p2 = getEdgePoint(e2, px, py, cellSize, values, threshold);
                segments.push([p1, p2]);
            }
        }
    }
    
    return segments;
}

/**
 * Extract and connect contour segments into polylines
 * 
 * @param {Float32Array|number[]} field - Scalar field values
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number} threshold - Iso value
 * @param {Object} [options] - Options
 * @returns {Array<Array<{x: number, y: number}>>} Connected polylines
 */
export function extractContours(field, width, height, threshold, options = {}) {
    const segments = marchingSquares(field, width, height, threshold, options);

    if (segments.length === 0) return [];

    // Hash-based O(n) contour stitching — replaces the old O(n²) linear scan.
    // Quantise coordinates to avoid floating-point mismatch (marching squares
    // produces values on a grid so rounding to 4 decimals is safe).
    const Q = 1e4;
    const pkey = (p) => `${Math.round(p.x * Q)},${Math.round(p.y * Q)}`;

    // Build adjacency: point-key → list of {idx, end} where end=0 means seg[0], end=1 means seg[1]
    const adj = new Map();
    const addAdj = (key, idx, end) => {
        let list = adj.get(key);
        if (!list) { list = []; adj.set(key, list); }
        list.push({ idx, end });
    };
    for (let i = 0; i < segments.length; i++) {
        addAdj(pkey(segments[i][0]), i, 0);
        addAdj(pkey(segments[i][1]), i, 1);
    }

    const used = new Uint8Array(segments.length);
    const polylines = [];

    for (let i = 0; i < segments.length; i++) {
        if (used[i]) continue;
        used[i] = 1;
        const polyline = [segments[i][0], segments[i][1]];

        // Extend forward from last point
        let searching = true;
        while (searching) {
            searching = false;
            const key = pkey(polyline[polyline.length - 1]);
            const list = adj.get(key);
            if (!list) break;
            for (const entry of list) {
                if (used[entry.idx]) continue;
                used[entry.idx] = 1;
                const seg = segments[entry.idx];
                polyline.push(entry.end === 0 ? seg[1] : seg[0]);
                searching = true;
                break;
            }
        }

        // Extend backward from first point
        searching = true;
        while (searching) {
            searching = false;
            const key = pkey(polyline[0]);
            const list = adj.get(key);
            if (!list) break;
            for (const entry of list) {
                if (used[entry.idx]) continue;
                used[entry.idx] = 1;
                const seg = segments[entry.idx];
                polyline.unshift(entry.end === 0 ? seg[1] : seg[0]);
                searching = true;
                break;
            }
        }

        polylines.push(polyline);
    }

    return polylines;
}

/**
 * Extract multiple contour levels
 * 
 * @param {Float32Array|number[]} field - Scalar field
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {number[]} thresholds - Array of iso values
 * @param {Object} [options] - Options
 * @returns {Map<number, Array<Array<{x, y}>>>} Map of threshold → polylines
 */
export function extractMultipleContours(field, width, height, thresholds, options = {}) {
    const result = new Map();
    
    for (const threshold of thresholds) {
        result.set(threshold, extractContours(field, width, height, threshold, options));
    }
    
    return result;
}

/**
 * Generate evenly spaced contour levels
 * 
 * @param {Float32Array|number[]} field - Scalar field
 * @param {number} levels - Number of contour levels
 * @returns {number[]} Threshold values
 */
export function autoContourLevels(field, levels) {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < field.length; i++) {
        if (field[i] < min) min = field[i];
        if (field[i] > max) max = field[i];
    }
    
    const thresholds = [];
    for (let i = 1; i < levels; i++) {
        thresholds.push(min + (max - min) * i / levels);
    }
    
    return thresholds;
}

/**
 * Compute contour area (for closed contours)
 * 
 * @param {Array<{x: number, y: number}>} contour - Closed contour points
 * @returns {number} Signed area (positive = CCW)
 */
export function contourArea(contour) {
    let area = 0;
    const n = contour.length;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += contour[i].x * contour[j].y;
        area -= contour[j].x * contour[i].y;
    }
    
    return area / 2;
}

/**
 * Simplify contour using Douglas-Peucker algorithm
 * 
 * @param {Array<{x: number, y: number}>} contour - Input contour
 * @param {number} epsilon - Simplification tolerance
 * @returns {Array<{x: number, y: number}>} Simplified contour
 */
export function simplifyContour(contour, epsilon) {
    if (contour.length < 3) return [...contour];
    
    function perpDistance(point, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.0001) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
        return Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / len;
    }
    
    function simplifyRange(start, end) {
        let maxDist = 0;
        let maxIdx = start;
        
        for (let i = start + 1; i < end; i++) {
            const d = perpDistance(contour[i], contour[start], contour[end]);
            if (d > maxDist) {
                maxDist = d;
                maxIdx = i;
            }
        }
        
        if (maxDist > epsilon) {
            const left = simplifyRange(start, maxIdx);
            const right = simplifyRange(maxIdx, end);
            return [...left.slice(0, -1), ...right];
        } else {
            return [contour[start], contour[end]];
        }
    }
    
    return simplifyRange(0, contour.length - 1);
}

/** @type {typeof extractContours} */
export const marchingSquaresContour = extractContours;
