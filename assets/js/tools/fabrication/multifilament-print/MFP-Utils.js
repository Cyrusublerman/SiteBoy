/**
 * MFP-Utils - Shared utility functions
 * 
 * Pure helper functions with no side effects.
 * Used across MFP modules.
 */

/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * 2D linear interpolation
 */
export function lerp2D(p0, p1, t) {
    return {
        x: lerp(p0.x, p1.x, t),
        y: lerp(p0.y, p1.y, t)
    };
}

/**
 * Bilinear interpolation for point in quad
 */
export function getPointInQuad(corners, tCol, tRow) {
    const top = lerp2D(corners[0], corners[1], tCol);
    const bottom = lerp2D(corners[3], corners[2], tCol);
    return lerp2D(top, bottom, tRow);
}

/**
 * Check if point is inside quad using cross product
 */
export function isPointInQuad(x, y, corners) {
    const sign = (p1, p2, p3) => {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    };
    
    const d1 = sign({x, y}, corners[0], corners[1]);
    const d2 = sign({x, y}, corners[1], corners[2]);
    const d3 = sign({x, y}, corners[2], corners[3]);
    const d4 = sign({x, y}, corners[3], corners[0]);
    
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0) || (d4 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0) || (d4 > 0);
    
    return !(hasNeg && hasPos);
}

/**
 * Find corner under mouse (returns index or -1)
 */
export function findCornerUnderMouse(mouseX, mouseY, corners, radius = 15) {
    for (let i = 0; i < corners.length; i++) {
        const corner = corners[i];
        const dx = mouseX - corner.x;
        const dy = mouseY - corner.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= radius) {
            return i;
        }
    }
    return -1;
}

/**
 * Convert RGB to brightness (perceptual)
 */
export function rgbToBrightness(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Convert RGB to hue (0-1)
 */
export function rgbToHue(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === min) return 0;
    
    const delta = max - min;
    let h;
    
    if (max === r) {
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
        h = ((b - r) / delta + 2) / 6;
    } else {
        h = ((r - g) / delta + 4) / 6;
    }
    
    return h;
}

/**
 * Calculate grid point using bilinear interpolation
 * @param {Array} corners - 4 corner points [TL, TR, BR, BL]
 * @param {number} col - Column (0 to cols)
 * @param {number} row - Row (0 to rows)
 * @param {number} cols - Total columns
 * @param {number} rows - Total rows
 */
export function getGridPoint(corners, col, row, cols, rows) {
    const tCol = col / cols;
    const tRow = row / rows;
    return getPointInQuad(corners, tCol, tRow);
}

/**
 * Generate filename from grid data
 */
export function generateGridFilename(gridData, prefix = 'cal', extension = 'png') {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const colors = gridData.colours.length;
    const layers = gridData.layerCount;
    const rows = gridData.rows;
    const cols = gridData.cols;
    const tileSize = gridData.tileSize;
    
    return `${prefix}-${colors}c${layers}L-${rows}x${cols}-${tileSize}mm-${date}.${extension}`;
}

/**
 * Parse filename to extract metadata
 */
export function parseFilename(filename) {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.(zip|csv|png|json)$/i, '');
    
    // Pattern: cal-4c6L-78x70-10mm-20260111
    // Or: calibration-4c6L-78x70-3mm-20260106_131843
    const pattern = /(?:cal|calibration)-(\d+)c(\d+)L-(\d+)x(\d+)-(\d+(?:\.\d+)?)mm/i;
    const match = nameWithoutExt.match(pattern);
    
    if (!match) return null;
    
    return {
        colors: parseInt(match[1]),
        layers: parseInt(match[2]),
        rows: parseInt(match[3]),
        cols: parseInt(match[4]),
        tileSize: parseFloat(match[5])
    };
}

/**
 * Build sequence map for color lookup
 */
export function buildSequenceMap(sequences, colours, simColour) {
    const map = new Map();
    
    sequences.forEach((seq, index) => {
        const color = simColour(seq, colours);
        const key = `${color.r},${color.g},${color.b}`;
        
        if (!map.has(key)) {
            map.set(key, {
                sequence: seq,
                simulated: color,
                indices: []
            });
        }
        map.get(key).indices.push(index);
    });
    
    return map;
}

/**
 * Get canvas coordinates accounting for CSS scaling
 */
export function getCanvasCoords(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

/**
 * Throttle function calls using RAF
 */
export function rafThrottle(callback) {
    let rafId = null;
    
    return function throttled(...args) {
        if (rafId) return;
        
        rafId = requestAnimationFrame(() => {
            callback(...args);
            rafId = null;
        });
    };
}

