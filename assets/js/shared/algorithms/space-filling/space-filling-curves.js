/**
 * @fileoverview Space-Filling Curve Algorithms
 * 
 * Space-filling curves are continuous curves that pass through every point
 * of a 2D region. They map 1D sequences to 2D space while preserving locality.
 * 
 * Key Properties:
 * - Locality: nearby points in 1D stay close in 2D
 * - Continuity: single connected path through space
 * - Self-similarity: fractal recursive structure
 * 
 * @see Reference: 05_Space_Filling_Curves/*.md
 */

import { MathUtils } from '../core/math-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// HILBERT CURVE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hilbert curve generator
 *
 * @source blog/ideas/reference documentation/05_Space_Filling_Curves/Hilbert_curve.md
 * @wikipedia https://en.wikipedia.org/wiki/Hilbert_curve
 * @section Applications and mapping algorithms
 * @formula Length of nth curve: 2^n - 1/2^n
 *
 * L-system representation:
 *   Axiom: A
 *   Rules: A → +BF−AFA−FB+
 *          B → −AF+BFB+FA−
 *   Where F = forward, + = left 90°, - = right 90°
 *
 * Properties:
 * - Length of nth curve: 2ⁿ - 1/2ⁿ
 * - Fills unit square with Hausdorff dimension 2
 * - Excellent locality preservation
 */
export const HilbertCurve = {
    /**
     * Generate Hilbert curve points for given order
     * 
     * @param {number} order - Recursion depth (curve has 4^order points)
     * @returns {Array<{x: number, y: number}>} - Points normalized to [0, 1]
     */
    generate(order) {
        const n = 1 << order; // 2^order
        const points = [];
        const total = n * n;
        
        for (let d = 0; d < total; d++) {
            const [x, y] = this.d2xy(n, d);
            points.push({
                x: (x + 0.5) / n,
                y: (y + 0.5) / n
            });
        }
        
        return points;
    },

    /**
     * Convert Hilbert index d to (x, y) coordinates
     * Based on bit manipulation algorithm
     * 
     * @param {number} n - Grid size (power of 2)
     * @param {number} d - Hilbert index [0, n²)
     * @returns {number[]} - [x, y]
     */
    d2xy(n, d) {
        let rx, ry, s, t = d;
        let x = 0, y = 0;
        
        for (s = 1; s < n; s *= 2) {
            rx = 1 & (t / 2);
            ry = 1 & (t ^ rx);
            [x, y] = this._rotate(s, x, y, rx, ry);
            x += s * rx;
            y += s * ry;
            t = Math.floor(t / 4);
        }
        
        return [x, y];
    },

    /**
     * Convert (x, y) coordinates to Hilbert index
     * 
     * @param {number} n - Grid size
     * @param {number} x 
     * @param {number} y 
     * @returns {number} - Hilbert index
     */
    xy2d(n, x, y) {
        let rx, ry, s, d = 0;
        
        for (s = n / 2; s > 0; s = Math.floor(s / 2)) {
            rx = (x & s) > 0 ? 1 : 0;
            ry = (y & s) > 0 ? 1 : 0;
            d += s * s * ((3 * rx) ^ ry);
            [x, y] = this._rotate(s, x, y, rx, ry);
        }
        
        return d;
    },

    /**
     * Rotate/flip quadrant
     * @private
     */
    _rotate(n, x, y, rx, ry) {
        if (ry === 0) {
            if (rx === 1) {
                x = n - 1 - x;
                y = n - 1 - y;
            }
            [x, y] = [y, x];
        }
        return [x, y];
    },

    /**
     * Generate Hilbert curve for arbitrary rectangular region
     * Packs squares and connects them
     * 
     * @param {number} width 
     * @param {number} height 
     * @param {number} [minSize=4] - Minimum Hilbert square size
     * @returns {Array<{x: number, y: number}>}
     */
    generateForRegion(width, height, minSize = 4) {
        // Find largest power of 2 that fits
        const maxDim = Math.max(width, height);
        const order = Math.max(1, Math.floor(Math.log2(maxDim / minSize)));
        const gridSize = 1 << order;
        const cellSize = Math.min(width, height) / gridSize;
        
        const points = [];
        const total = gridSize * gridSize;
        
        for (let d = 0; d < total; d++) {
            const [gx, gy] = this.d2xy(gridSize, d);
            const x = (gx + 0.5) * cellSize;
            const y = (gy + 0.5) * cellSize;
            
            if (x < width && y < height) {
                points.push({ x, y });
            }
        }
        
        return points;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// PEANO CURVE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Peano curve generator (original space-filling curve, 1890)
 * 
 * L-system:
 *   Axiom: X
 *   Rules: X → XFYFX+F+YFXFY−F−XFYFX
 *          Y → YFXFY−F−XFYFX+F+YFXFY
 * 
 * Properties:
 * - 9-ary recursion (3×3 grid subdivision)
 * - Length of nth curve: 3ⁿ
 */
export const PeanoCurve = {
    /**
     * Generate Peano curve points
     * 
     * @param {number} order - Recursion depth
     * @returns {Array<{x: number, y: number}>}
     */
    generate(order) {
        const points = [];
        this._peano(0, 0, 1, 0, 0, 1, order, points);
        return points.map(p => ({ x: p[0], y: p[1] }));
    },

    /**
     * Recursive Peano curve generation
     * @private
     */
    _peano(x, y, ax, ay, bx, by, order, points) {
        if (order === 0) {
            points.push([x + (ax + bx) / 2, y + (ay + by) / 2]);
            return;
        }
        
        const ax3 = ax / 3, ay3 = ay / 3;
        const bx3 = bx / 3, by3 = by / 3;
        
        this._peano(x, y, ax3, ay3, bx3, by3, order - 1, points);
        this._peano(x + ax3, y + ay3, bx3, by3, ax3, ay3, order - 1, points);
        this._peano(x + ax3 + bx3, y + ay3 + by3, ax3, ay3, bx3, by3, order - 1, points);
        this._peano(x + ax3 * 2 + bx3, y + ay3 * 2 + by3, -bx3, -by3, ax3, ay3, order - 1, points);
        this._peano(x + ax3 * 2, y + ay3 * 2, -ax3, -ay3, -bx3, -by3, order - 1, points);
        this._peano(x + ax3, y + ay3, -bx3, -by3, -ax3, -ay3, order - 1, points);
        this._peano(x + ax3 - bx3, y + ay3 - by3, -ax3, -ay3, bx3, by3, order - 1, points);
        this._peano(x - bx3, y - by3, bx3, by3, -ax3, -ay3, order - 1, points);
        this._peano(x, y, ax3, ay3, bx3, by3, order - 1, points);
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// MOORE CURVE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Moore curve - closed Hilbert curve variant
 * 
 * L-system:
 *   Axiom: LFL+F+LFL
 *   Rules: L → −RF+LFL+FR−
 *          R → +LF−RFR−FL+
 * 
 * Properties:
 * - Forms a closed loop (starts and ends at same point)
 * - Same locality as Hilbert
 */
export const MooreCurve = {
    /**
     * Generate Moore curve points
     * 
     * @param {number} order 
     * @returns {Array<{x: number, y: number}>}
     */
    generate(order) {
        const n = 1 << order;
        const hilbert = HilbertCurve.generate(order);
        
        // Moore curve is 4 Hilbert curves rotated and connected
        const points = [];
        const quarter = hilbert.length;
        
        // Bottom-left quadrant (Hilbert rotated 90° CW)
        for (let i = 0; i < quarter; i++) {
            const p = hilbert[i];
            points.push({
                x: p.y * 0.5,
                y: (1 - p.x) * 0.5
            });
        }
        
        // Top-left quadrant
        for (let i = 0; i < quarter; i++) {
            const p = hilbert[i];
            points.push({
                x: p.x * 0.5,
                y: 0.5 + p.y * 0.5
            });
        }
        
        // Top-right quadrant
        for (let i = 0; i < quarter; i++) {
            const p = hilbert[quarter - 1 - i];
            points.push({
                x: 0.5 + p.x * 0.5,
                y: 0.5 + p.y * 0.5
            });
        }
        
        // Bottom-right quadrant
        for (let i = 0; i < quarter; i++) {
            const p = hilbert[quarter - 1 - i];
            points.push({
                x: 0.5 + (1 - p.y) * 0.5,
                y: p.x * 0.5
            });
        }
        
        return points;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// Z-ORDER (MORTON) CURVE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Z-order (Morton) curve
 * 
 * Interleaves bits of x and y coordinates:
 * Morton(x,y) = ...y₂x₂y₁x₁y₀x₀
 * 
 * Properties:
 * - Very fast computation (bit operations)
 * - Worse locality than Hilbert but simpler
 * - Used in spatial indexing (quadtrees)
 */
export const ZOrderCurve = {
    /**
     * Generate Z-order curve points
     * 
     * @param {number} order 
     * @returns {Array<{x: number, y: number}>}
     */
    generate(order) {
        const n = 1 << order;
        const points = [];
        
        for (let d = 0; d < n * n; d++) {
            const [x, y] = this.d2xy(d);
            points.push({
                x: (x + 0.5) / n,
                y: (y + 0.5) / n
            });
        }
        
        return points;
    },

    /**
     * Convert Morton index to (x, y)
     * Deinterleaves bits
     * 
     * @param {number} d - Morton index
     * @returns {number[]}
     */
    d2xy(d) {
        let x = 0, y = 0;
        for (let i = 0; i < 16; i++) {
            x |= ((d >> (2 * i)) & 1) << i;
            y |= ((d >> (2 * i + 1)) & 1) << i;
        }
        return [x, y];
    },

    /**
     * Convert (x, y) to Morton index
     * Interleaves bits
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {number}
     */
    xy2d(x, y) {
        let d = 0;
        for (let i = 0; i < 16; i++) {
            d |= ((x >> i) & 1) << (2 * i);
            d |= ((y >> i) & 1) << (2 * i + 1);
        }
        return d;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// GOSPER CURVE (FLOWSNAKE)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gosper curve (flowsnake) - hexagonal space-filling
 * 
 * L-system:
 *   Axiom: A
 *   Rules: A → A−B−−B+A++AA+B−
 *          B → +A−BB−−B−A++A+B
 *   Angle: 60°
 */
export const GosperCurve = {
    /**
     * Generate Gosper curve points using L-system
     * 
     * @param {number} order 
     * @returns {Array<{x: number, y: number}>}
     */
    generate(order) {
        // Build L-system string
        let str = 'A';
        for (let i = 0; i < order; i++) {
            let next = '';
            for (const c of str) {
                if (c === 'A') next += 'A-B--B+A++AA+B-';
                else if (c === 'B') next += '+A-BB--B-A++A+B';
                else next += c;
            }
            str = next;
        }
        
        // Interpret as turtle graphics
        return this._interpret(str, 60);
    },

    /**
     * Interpret L-system string as turtle graphics
     * @private
     */
    _interpret(str, angleStep) {
        const points = [{ x: 0, y: 0 }];
        let x = 0, y = 0;
        let angle = 0;
        const rad = angleStep * Math.PI / 180;
        
        for (const c of str) {
            if (c === 'A' || c === 'B') {
                x += Math.cos(angle);
                y += Math.sin(angle);
                points.push({ x, y });
            } else if (c === '+') {
                angle += rad;
            } else if (c === '-') {
                angle -= rad;
            }
        }
        
        // Normalize to [0, 1]
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        for (const p of points) {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        }
        
        const scale = Math.max(maxX - minX, maxY - minY);
        return points.map(p => ({
            x: (p.x - minX) / scale,
            y: (p.y - minY) / scale
        }));
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// L-SYSTEM GENERIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generic L-system interpreter for curve generation
 * 
 * An L-system consists of:
 * - Alphabet: symbols that can appear
 * - Axiom: starting string
 * - Rules: production rules for expansion
 * - Interpretation: mapping symbols to turtle graphics
 */
export const LSystem = {
    /**
     * Expand L-system string
     * 
     * @param {string} axiom - Starting string
     * @param {Object} rules - Production rules {symbol: replacement}
     * @param {number} iterations 
     * @returns {string}
     */
    expand(axiom, rules, iterations) {
        let str = axiom;
        
        for (let i = 0; i < iterations; i++) {
            let next = '';
            for (const c of str) {
                next += rules[c] || c;
            }
            str = next;
        }
        
        return str;
    },

    /**
     * Interpret L-system as turtle graphics
     * 
     * @param {string} str - Expanded L-system string
     * @param {Object} options
     * @param {number} options.angle - Turn angle in degrees
     * @param {string} options.forward - Forward movement symbols
     * @param {string} [options.left='+'] - Turn left symbol
     * @param {string} [options.right='-'] - Turn right symbol
     * @param {string} [options.push='['] - Push state
     * @param {string} [options.pop=']'] - Pop state
     * @returns {Array<Array<{x: number, y: number}>>} - Array of paths
     */
    interpret(str, options) {
        const { angle, forward, left = '+', right = '-', push = '[', pop = ']' } = options;
        const rad = angle * Math.PI / 180;
        
        const paths = [];
        let currentPath = [{ x: 0, y: 0 }];
        let x = 0, y = 0, dir = 0;
        const stack = [];
        
        for (const c of str) {
            if (forward.includes(c)) {
                x += Math.cos(dir);
                y += Math.sin(dir);
                currentPath.push({ x, y });
            } else if (c === left) {
                dir += rad;
            } else if (c === right) {
                dir -= rad;
            } else if (c === push) {
                stack.push({ x, y, dir, path: currentPath });
                currentPath = [{ x, y }];
            } else if (c === pop) {
                if (currentPath.length > 1) {
                    paths.push(currentPath);
                }
                const state = stack.pop();
                x = state.x;
                y = state.y;
                dir = state.dir;
                currentPath = state.path;
            }
        }
        
        if (currentPath.length > 1) {
            paths.push(currentPath);
        }
        
        return paths;
    },

    /**
     * Normalize paths to fit in [0, 1] × [0, 1]
     * 
     * @param {Array<Array<{x: number, y: number}>>} paths 
     * @returns {Array<Array<{x: number, y: number}>>}
     */
    normalizePaths(paths) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        for (const path of paths) {
            for (const p of path) {
                minX = Math.min(minX, p.x);
                maxX = Math.max(maxX, p.x);
                minY = Math.min(minY, p.y);
                maxY = Math.max(maxY, p.y);
            }
        }
        
        const scale = Math.max(maxX - minX, maxY - minY) || 1;
        
        return paths.map(path => 
            path.map(p => ({
                x: (p.x - minX) / scale,
                y: (p.y - minY) / scale
            }))
        );
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PREDEFINED L-SYSTEMS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Dragon curve L-system
     */
    dragonCurve: {
        axiom: 'FX',
        rules: { X: 'X+YF+', Y: '-FX-Y' },
        angle: 90,
        forward: 'F'
    },

    /**
     * Sierpinski triangle
     */
    sierpinski: {
        axiom: 'F-G-G',
        rules: { F: 'F-G+F+G-F', G: 'GG' },
        angle: 120,
        forward: 'FG'
    },

    /**
     * Koch snowflake
     */
    kochSnowflake: {
        axiom: 'F--F--F',
        rules: { F: 'F+F--F+F' },
        angle: 60,
        forward: 'F'
    },

    /**
     * Lévy C curve
     */
    levyCCurve: {
        axiom: 'F',
        rules: { F: '+F--F+' },
        angle: 45,
        forward: 'F'
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// CURVE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Utilities for working with space-filling curves
 */
export const CurveUtils = {
    /**
     * Subdivide curve by inserting midpoints
     * 
     * @param {Array<{x: number, y: number}>} points 
     * @param {number} [iterations=1] 
     * @returns {Array<{x: number, y: number}>}
     */
    subdivide(points, iterations = 1) {
        let result = points;
        
        for (let i = 0; i < iterations; i++) {
            const next = [];
            for (let j = 0; j < result.length - 1; j++) {
                const p1 = result[j];
                const p2 = result[j + 1];
                next.push(p1);
                next.push({
                    x: (p1.x + p2.x) / 2,
                    y: (p1.y + p2.y) / 2
                });
            }
            next.push(result[result.length - 1]);
            result = next;
        }
        
        return result;
    },

    /**
     * Smooth curve using Chaikin's algorithm
     * Each iteration: new points at 1/4 and 3/4 of each segment
     * 
     * @param {Array<{x: number, y: number}>} points 
     * @param {number} [iterations=1] 
     * @returns {Array<{x: number, y: number}>}
     */
    chaikinSmooth(points, iterations = 1) {
        let result = points;
        
        for (let i = 0; i < iterations; i++) {
            const next = [result[0]]; // Keep first point
            
            for (let j = 0; j < result.length - 1; j++) {
                const p1 = result[j];
                const p2 = result[j + 1];
                
                next.push({
                    x: p1.x * 0.75 + p2.x * 0.25,
                    y: p1.y * 0.75 + p2.y * 0.25
                });
                next.push({
                    x: p1.x * 0.25 + p2.x * 0.75,
                    y: p1.y * 0.25 + p2.y * 0.75
                });
            }
            
            next.push(result[result.length - 1]); // Keep last point
            result = next;
        }
        
        return result;
    },

    /**
     * Resample curve to have uniform segment lengths
     * 
     * @param {Array<{x: number, y: number}>} points 
     * @param {number} targetLength - Target segment length
     * @returns {Array<{x: number, y: number}>}
     */
    resample(points, targetLength) {
        if (points.length < 2) return points;
        
        const result = [points[0]];
        let accumulated = 0;
        let prevPoint = points[0];
        
        for (let i = 1; i < points.length; i++) {
            const currPoint = points[i];
            const segmentLength = MathUtils.distEuclidean(
                [prevPoint.x, prevPoint.y],
                [currPoint.x, currPoint.y]
            );
            
            accumulated += segmentLength;
            
            while (accumulated >= targetLength) {
                const t = 1 - (accumulated - targetLength) / segmentLength;
                result.push({
                    x: MathUtils.lerp(prevPoint.x, currPoint.x, t),
                    y: MathUtils.lerp(prevPoint.y, currPoint.y, t)
                });
                accumulated -= targetLength;
            }
            
            prevPoint = currPoint;
        }
        
        // Add last point if not already there
        const last = result[result.length - 1];
        const end = points[points.length - 1];
        if (last.x !== end.x || last.y !== end.y) {
            result.push(end);
        }
        
        return result;
    },

    /**
     * Transform curve to fit within bounds
     * 
     * @param {Array<{x: number, y: number}>} points - Normalized [0,1] points
     * @param {{x: number, y: number, width: number, height: number}} bounds 
     * @returns {Array<{x: number, y: number}>}
     */
    transformToBounds(points, bounds) {
        return points.map(p => ({
            x: bounds.x + p.x * bounds.width,
            y: bounds.y + p.y * bounds.height
        }));
    }
};

export default {
    HilbertCurve,
    PeanoCurve,
    MooreCurve,
    ZOrderCurve,
    GosperCurve,
    LSystem,
    CurveUtils
};

