/**
 * @fileoverview Polygon Operations
 * 
 * Algorithms for polygon testing, manipulation, and analysis.
 * 
 * @module geometry/polygon-operations
 * @see Reference: 06_Polygon_Grid_Domain_Subdivision/Point_in_polygon.md
 */

import { MathUtils } from '../core/math-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// POINT-IN-POLYGON TESTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ray casting algorithm for point-in-polygon test
 *
 * @source blog/ideas/reference documentation/06_Polygon_Grid_Domain_Subdivision/Point_in_polygon.md
 * @wikipedia https://en.wikipedia.org/wiki/Point_in_polygon
 * @section Ray casting algorithm
 * @formula Odd intersections = inside, even = outside
 *
 * Cast horizontal ray from point to infinity, count intersections
 * with polygon edges. Odd count = inside, even = outside.
 *
 * Complexity: O(n) where n = number of vertices
 *
 * @param {{x: number, y: number}} point
 * @param {Array<{x: number, y: number}>} polygon - Vertices in order
 * @returns {boolean}
 */
export function pointInPolygonRayCast(point, polygon) {
    const n = polygon.length;
    if (n < 3) return false;
    
    let inside = false;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        
        // Check if ray crosses this edge
        const intersect = ((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        
        if (intersect) inside = !inside;
    }
    
    return inside;
}

/**
 * Winding number algorithm for point-in-polygon test
 * 
 * Count how many times polygon winds around point.
 * Non-zero winding = inside (works for self-intersecting polygons)
 * 
 * @param {{x: number, y: number}} point 
 * @param {Array<{x: number, y: number}>} polygon 
 * @returns {number} - Winding number (0 = outside)
 */
export function windingNumber(point, polygon) {
    const n = polygon.length;
    if (n < 3) return 0;
    
    let winding = 0;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const yi = polygon[i].y;
        const yj = polygon[j].y;
        
        if (yi <= point.y) {
            if (yj > point.y) {
                // Upward crossing
                if (isLeft(polygon[i], polygon[j], point) > 0) {
                    winding++;
                }
            }
        } else {
            if (yj <= point.y) {
                // Downward crossing
                if (isLeft(polygon[i], polygon[j], point) < 0) {
                    winding--;
                }
            }
        }
    }
    
    return winding;
}

/**
 * Test if point C is left of line from A to B
 * @private
 */
function isLeft(A, B, C) {
    return (B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y);
}

/**
 * Simple point-in-polygon using ray casting
 * 
 * @param {{x: number, y: number}} point 
 * @param {Array<{x: number, y: number}>} polygon 
 * @returns {boolean}
 */
export function pointInPolygon(point, polygon) {
    return pointInPolygonRayCast(point, polygon);
}

// ═══════════════════════════════════════════════════════════════════════════
// POLYGON PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate polygon area using Shoelace formula
 *
 * @source blog/ideas/reference documentation/06_Polygon_Grid_Domain_Subdivision/Polygon_triangulation.md
 * @wikipedia https://en.wikipedia.org/wiki/Shoelace_formula
 * @section Shoelace formula
 * @formula A = \frac{1}{2} |\sum_{i}(x_i y_{i+1} - x_{i+1} y_i)|
 *
 * A = ½|Σᵢ(xᵢyᵢ₊₁ - xᵢ₊₁yᵢ)|
 *
 * @param {Array<{x: number, y: number}>} polygon
 * @returns {number} - Signed area (positive = CCW, negative = CW)
 */
export function polygonArea(polygon) {
    const n = polygon.length;
    if (n < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += polygon[i].x * polygon[j].y;
        area -= polygon[j].x * polygon[i].y;
    }
    
    return area / 2;
}

/**
 * Calculate polygon centroid
 * 
 * @param {Array<{x: number, y: number}>} polygon 
 * @returns {{x: number, y: number}}
 */
export function polygonCentroid(polygon) {
    const n = polygon.length;
    if (n === 0) return { x: 0, y: 0 };
    if (n === 1) return { x: polygon[0].x, y: polygon[0].y };
    
    let cx = 0, cy = 0;
    let area = 0;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const cross = polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y;
        area += cross;
        cx += (polygon[i].x + polygon[j].x) * cross;
        cy += (polygon[i].y + polygon[j].y) * cross;
    }
    
    area /= 2;
    
    if (Math.abs(area) < 1e-10) {
        // Degenerate polygon, return simple average
        let sx = 0, sy = 0;
        for (const p of polygon) {
            sx += p.x;
            sy += p.y;
        }
        return { x: sx / n, y: sy / n };
    }
    
    return {
        x: cx / (6 * area),
        y: cy / (6 * area)
    };
}

/**
 * Calculate polygon perimeter
 * 
 * @param {Array<{x: number, y: number}>} polygon 
 * @param {boolean} [closed=true] - Include edge from last to first
 * @returns {number}
 */
export function polygonPerimeter(polygon, closed = true) {
    const n = polygon.length;
    if (n < 2) return 0;
    
    let perimeter = 0;
    const limit = closed ? n : n - 1;
    
    for (let i = 0; i < limit; i++) {
        const j = (i + 1) % n;
        perimeter += MathUtils.distEuclidean(
            [polygon[i].x, polygon[i].y],
            [polygon[j].x, polygon[j].y]
        );
    }
    
    return perimeter;
}

/**
 * Get axis-aligned bounding box of polygon
 * 
 * @param {Array<{x: number, y: number}>} polygon 
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function polygonBounds(polygon) {
    if (polygon.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const p of polygon) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    }
    
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

/**
 * Check if polygon is convex
 * 
 * @param {Array<{x: number, y: number}>} polygon 
 * @returns {boolean}
 */
export function isConvex(polygon) {
    const n = polygon.length;
    if (n < 3) return false;
    
    let sign = 0;
    
    for (let i = 0; i < n; i++) {
        const p1 = polygon[i];
        const p2 = polygon[(i + 1) % n];
        const p3 = polygon[(i + 2) % n];
        
        const cross = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
        
        if (cross !== 0) {
            if (sign === 0) {
                sign = Math.sign(cross);
            } else if (Math.sign(cross) !== sign) {
                return false;
            }
        }
    }
    
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// POLYGON OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Reverse polygon winding order
 * 
 * @param {Array<{x: number, y: number}>} polygon 
 * @returns {Array<{x: number, y: number}>}
 */
export function reversePolygon(polygon) {
    return [...polygon].reverse();
}

/**
 * Ensure polygon is in counter-clockwise order
 * 
 * @param {Array<{x: number, y: number}>} polygon 
 * @returns {Array<{x: number, y: number}>}
 */
export function ensureCCW(polygon) {
    const area = polygonArea(polygon);
    return area < 0 ? reversePolygon(polygon) : polygon;
}

/**
 * Ensure polygon is in clockwise order
 * 
 * @param {Array<{x: number, y: number}>} polygon 
 * @returns {Array<{x: number, y: number}>}
 */
export function ensureCW(polygon) {
    const area = polygonArea(polygon);
    return area > 0 ? reversePolygon(polygon) : polygon;
}

/**
 * Offset polygon by distance (simple method)
 * Positive = outward, negative = inward
 * 
 * Note: This is a simplified method that may produce self-intersections
 * for complex polygons. For robust offsetting, use a proper polygon
 * clipping library.
 * 
 * @param {Array<{x: number, y: number}>} polygon 
 * @param {number} distance 
 * @returns {Array<{x: number, y: number}>}
 */
export function offsetPolygon(polygon, distance) {
    const n = polygon.length;
    if (n < 3) return polygon;
    
    const result = [];
    
    for (let i = 0; i < n; i++) {
        const prev = polygon[(i - 1 + n) % n];
        const curr = polygon[i];
        const next = polygon[(i + 1) % n];
        
        // Edge normals
        const n1 = normalize({ x: curr.y - prev.y, y: prev.x - curr.x });
        const n2 = normalize({ x: next.y - curr.y, y: curr.x - next.x });
        
        // Average normal (bisector direction)
        const bisector = normalize({
            x: n1.x + n2.x,
            y: n1.y + n2.y
        });
        
        // Offset amount (account for angle)
        const dot = n1.x * bisector.x + n1.y * bisector.y;
        const offsetDist = dot !== 0 ? distance / dot : distance;
        
        result.push({
            x: curr.x + bisector.x * offsetDist,
            y: curr.y + bisector.y * offsetDist
        });
    }
    
    return result;
}

/**
 * Normalize vector to unit length
 * @private
 */
function normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    return len > 0 ? { x: v.x / len, y: v.y / len } : { x: 0, y: 0 };
}

// ═══════════════════════════════════════════════════════════════════════════
// POLYGON TRIANGULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ear-clipping triangulation for simple (non-self-intersecting) polygons.
 *
 * Handles concave polygons. Input is assumed CCW winding; if CW the
 * function reverses internally. Does NOT handle holes — for polygons
 * with holes, bridge them first.
 *
 * @source https://en.wikipedia.org/wiki/Polygon_triangulation#Ear_clipping_method
 * @formula n-gon → (n - 2) triangles
 *
 * @param {Array<{x: number, y: number}>} polygon - Simple polygon vertices
 * @returns {Array<[{x,y},{x,y},{x,y}]>} Array of triangle vertex triples
 */
export function earClipTriangulate(polygon) {
    if (polygon.length < 3) return [];

    let verts = polygon.map(p => ({ x: p.x, y: p.y }));
    if (polygonArea(verts) < 0) verts = verts.reverse();

    const triangles = [];
    const indices = verts.map((_, i) => i);

    let safety = indices.length * indices.length;
    while (indices.length > 3 && safety-- > 0) {
        let earFound = false;
        const n = indices.length;

        for (let i = 0; i < n; i++) {
            const iPrev = (i - 1 + n) % n;
            const iNext = (i + 1) % n;
            const a = verts[indices[iPrev]];
            const b = verts[indices[i]];
            const c = verts[indices[iNext]];

            const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
            if (cross <= 0) continue;

            let containsPoint = false;
            for (let j = 0; j < n; j++) {
                if (j === iPrev || j === i || j === iNext) continue;
                if (pointInTriangle(verts[indices[j]], a, b, c)) {
                    containsPoint = true;
                    break;
                }
            }
            if (containsPoint) continue;

            triangles.push([a, b, c]);
            indices.splice(i, 1);
            earFound = true;
            break;
        }
        if (!earFound) break;
    }

    if (indices.length === 3) {
        triangles.push([
            verts[indices[0]],
            verts[indices[1]],
            verts[indices[2]]
        ]);
    }

    return triangles;
}

/**
 * Point-in-triangle test using barycentric coordinates.
 * @private
 */
function pointInTriangle(p, a, b, c) {
    const v0x = c.x - a.x, v0y = c.y - a.y;
    const v1x = b.x - a.x, v1y = b.y - a.y;
    const v2x = p.x - a.x, v2y = p.y - a.y;
    const dot00 = v0x * v0x + v0y * v0y;
    const dot01 = v0x * v1x + v0y * v1y;
    const dot02 = v0x * v2x + v0y * v2y;
    const dot11 = v1x * v1x + v1y * v1y;
    const dot12 = v1x * v2x + v1y * v2y;
    const inv = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * inv;
    const v = (dot00 * dot12 - dot01 * dot02) * inv;
    return u >= 0 && v >= 0 && (u + v) <= 1;
}

// ═══════════════════════════════════════════════════════════════════════════
// SQUARE PACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pack squares inside a polygon using quadtree subdivision
 * 
 * @param {Array<{x: number, y: number}>} polygon 
 * @param {number} minSize - Minimum square size
 * @returns {Array<{x: number, y: number, size: number}>}
 */
export function packSquaresInPolygon(polygon, minSize) {
    const bounds = polygonBounds(polygon);
    const squares = [];
    
    // Start with bounding box, recursively subdivide
    subdivideSquare(bounds.x, bounds.y, Math.max(bounds.width, bounds.height), 
                    polygon, minSize, squares);
    
    return squares;
}

/**
 * Recursive square subdivision
 * @private
 */
function subdivideSquare(x, y, size, polygon, minSize, result) {
    if (size < minSize) return;
    
    // Check corners of square
    const corners = [
        { x, y },
        { x: x + size, y },
        { x, y: y + size },
        { x: x + size, y: y + size }
    ];
    
    const insideCount = corners.filter(c => pointInPolygon(c, polygon)).length;
    
    if (insideCount === 4) {
        // All corners inside - check if entire square is inside
        // (could still have concave polygon cutting through)
        const center = { x: x + size/2, y: y + size/2 };
        if (pointInPolygon(center, polygon)) {
            result.push({ x, y, size });
            return;
        }
    }
    
    if (insideCount > 0 || squareIntersectsPolygon(x, y, size, polygon)) {
        // Partial intersection - subdivide into 4
        const half = size / 2;
        subdivideSquare(x, y, half, polygon, minSize, result);
        subdivideSquare(x + half, y, half, polygon, minSize, result);
        subdivideSquare(x, y + half, half, polygon, minSize, result);
        subdivideSquare(x + half, y + half, half, polygon, minSize, result);
    }
}

/**
 * Check if square intersects polygon boundary
 * @private
 */
function squareIntersectsPolygon(x, y, size, polygon) {
    const squareEdges = [
        [{ x, y }, { x: x + size, y }],
        [{ x: x + size, y }, { x: x + size, y: y + size }],
        [{ x: x + size, y: y + size }, { x, y: y + size }],
        [{ x, y: y + size }, { x, y }]
    ];
    
    const n = polygon.length;
    
    for (const [s1, s2] of squareEdges) {
        for (let i = 0; i < n; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % n];
            
            if (segmentsIntersect(s1, s2, p1, p2)) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Check if two line segments intersect
 * @private
 */
function segmentsIntersect(a1, a2, b1, b2) {
    const d1 = direction(b1, b2, a1);
    const d2 = direction(b1, b2, a2);
    const d3 = direction(a1, a2, b1);
    const d4 = direction(a1, a2, b2);
    
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
        return true;
    }
    
    return false;
}

/**
 * Direction of point C relative to line AB
 * @private
 */
function direction(a, b, c) {
    return (c.x - a.x) * (b.y - a.y) - (b.x - a.x) * (c.y - a.y);
}

export default {
    pointInPolygon,
    pointInPolygonRayCast,
    windingNumber,
    polygonArea,
    polygonCentroid,
    polygonPerimeter,
    polygonBounds,
    isConvex,
    reversePolygon,
    ensureCCW,
    ensureCW,
    offsetPolygon,
    earClipTriangulate,
    packSquaresInPolygon
};

