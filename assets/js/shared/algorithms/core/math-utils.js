/**
 * @fileoverview Core mathematical utilities for image processing algorithms.
 * Provides foundational math operations used across all processing modules.
 * 
 * Mathematical Reference:
 * - Vector operations, distance metrics
 * - Statistical functions (mean, variance, histogram)
 * - Interpolation methods
 */

export const MathUtils = {
    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════
    
    TAU: Math.PI * 2,
    GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
    SQRT2: Math.sqrt(2),
    SQRT3: Math.sqrt(3),

    // ═══════════════════════════════════════════════════════════════════════
    // BASIC OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Clamp value to range [min, max]
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Linear interpolation: lerp(a, b, t) = a + t(b - a)
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor [0, 1]
     * @returns {number}
     */
    lerp(a, b, t) {
        return a + t * (b - a);
    },

    /**
     * Inverse lerp: finds t such that lerp(a, b, t) = value
     * @param {number} a 
     * @param {number} b 
     * @param {number} value 
     * @returns {number}
     */
    inverseLerp(a, b, value) {
        return (value - a) / (b - a);
    },

    /**
     * Remap value from one range to another
     * @param {number} value 
     * @param {number} inMin 
     * @param {number} inMax 
     * @param {number} outMin 
     * @param {number} outMax 
     * @returns {number}
     */
    remap(value, inMin, inMax, outMin, outMax) {
        const t = this.inverseLerp(inMin, inMax, value);
        return this.lerp(outMin, outMax, t);
    },

    /**
     * Smoothstep interpolation: 3t² - 2t³
     *
     * @source blog/ideas/reference documentation/11_Optimisation_Numerical_Methods/Smoothstep.md
     * @wikipedia https://en.wikipedia.org/wiki/Smoothstep
     * @section Basic Smoothstep (Cubic)
     * @formula S_1(t) = 3t^2 - 2t^3 = t^2(3 - 2t)
     *
     * @param {number} t - Input [0, 1]
     * @returns {number}
     */
    smoothstep(t) {
        t = this.clamp(t, 0, 1);
        return t * t * (3 - 2 * t);
    },

    /**
     * Smoother step (Perlin): 6t⁵ - 15t⁴ + 10t³
     *
     * @source blog/ideas/reference documentation/11_Optimisation_Numerical_Methods/Smoothstep.md
     * @wikipedia https://en.wikipedia.org/wiki/Smoothstep
     * @section Smootherstep (Quintic)
     * @formula S_2(t) = 6t^5 - 15t^4 + 10t^3 = t^3(t(6t - 15) + 10)
     *
     * @param {number} t
     * @returns {number}
     */
    smootherstep(t) {
        t = this.clamp(t, 0, 1);
        return t * t * t * (t * (t * 6 - 15) + 10);
    },

    // ═══════════════════════════════════════════════════════════════════════
    // VECTOR OPERATIONS (2D)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Vector addition
     * @param {number[]} a - [x, y]
     * @param {number[]} b - [x, y]
     * @returns {number[]}
     */
    vecAdd(a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    },

    /**
     * Vector subtraction
     * @param {number[]} a 
     * @param {number[]} b 
     * @returns {number[]}
     */
    vecSub(a, b) {
        return [a[0] - b[0], a[1] - b[1]];
    },

    /**
     * Scalar multiplication
     * @param {number[]} v 
     * @param {number} s 
     * @returns {number[]}
     */
    vecScale(v, s) {
        return [v[0] * s, v[1] * s];
    },

    /**
     * Dot product: a · b = |a||b|cos(θ)
     * @param {number[]} a 
     * @param {number[]} b 
     * @returns {number}
     */
    vecDot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    },

    /**
     * Cross product (2D returns scalar): a × b = |a||b|sin(θ)
     * @param {number[]} a 
     * @param {number[]} b 
     * @returns {number}
     */
    vecCross(a, b) {
        return a[0] * b[1] - a[1] * b[0];
    },

    /**
     * Vector magnitude: |v| = √(x² + y²)
     * @param {number[]} v 
     * @returns {number}
     */
    vecMag(v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    },

    /**
     * Squared magnitude (avoids sqrt)
     * @param {number[]} v 
     * @returns {number}
     */
    vecMagSq(v) {
        return v[0] * v[0] + v[1] * v[1];
    },

    /**
     * Normalize vector to unit length
     * @param {number[]} v 
     * @returns {number[]}
     */
    vecNormalize(v) {
        const m = this.vecMag(v);
        return m > 0 ? [v[0] / m, v[1] / m] : [0, 0];
    },

    /**
     * Rotate vector by angle (radians)
     * @param {number[]} v 
     * @param {number} angle 
     * @returns {number[]}
     */
    vecRotate(v, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [
            v[0] * cos - v[1] * sin,
            v[0] * sin + v[1] * cos
        ];
    },

    /**
     * Perpendicular vector (90° CCW)
     * @param {number[]} v 
     * @returns {number[]}
     */
    vecPerp(v) {
        return [-v[1], v[0]];
    },

    /**
     * Linear interpolation between vectors
     * @param {number[]} a 
     * @param {number[]} b 
     * @param {number} t 
     * @returns {number[]}
     */
    vecLerp(a, b, t) {
        return [
            this.lerp(a[0], b[0], t),
            this.lerp(a[1], b[1], t)
        ];
    },

    // ═══════════════════════════════════════════════════════════════════════
    // DISTANCE METRICS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Euclidean distance: d = √((x₂-x₁)² + (y₂-y₁)²)
     *
     * @source blog/ideas/reference documentation/13_Distance_Morphology_Topology/Euclidean_distance.md
     * @wikipedia https://en.wikipedia.org/wiki/Euclidean_distance
     * @section Two dimensions
     * @formula d(p,q) = \sqrt{(p_1-q_1)^2 + (p_2-q_2)^2}
     *
     * @param {number[]} a - [x, y]
     * @param {number[]} b - [x, y]
     * @returns {number}
     */
    distEuclidean(a, b) {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Squared Euclidean distance (faster, no sqrt)
     *
     * @source blog/ideas/reference documentation/13_Distance_Morphology_Topology/Euclidean_distance.md
     * @wikipedia https://en.wikipedia.org/wiki/Euclidean_distance
     * @section Two dimensions
     * @formula d^2(p,q) = (p_1-q_1)^2 + (p_2-q_2)^2
     *
     * @param {number[]} a
     * @param {number[]} b
     * @returns {number}
     */
    distEuclideanSq(a, b) {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        return dx * dx + dy * dy;
    },

    /**
     * Manhattan distance: d = |x₂-x₁| + |y₂-y₁|
     *
     * @source blog/ideas/reference documentation/13_Distance_Morphology_Topology/Taxicab_geometry.md
     * @wikipedia https://en.wikipedia.org/wiki/Taxicab_geometry
     * @section Formal definition
     * @formula d_T(\mathbf{p}, \mathbf{q}) = \|\mathbf{p} - \mathbf{q}\|_T = \sum_{i=1}^{n} |p_i - q_i|
     *
     * @param {number[]} a
     * @param {number[]} b
     * @returns {number}
     */
    distManhattan(a, b) {
        return Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
    },

    /**
     * Chebyshev distance: d = max(|x₂-x₁|, |y₂-y₁|)
     * Also known as L∞ metric or maximum norm.
     *
     * @source blog/ideas/reference documentation/13_Distance_Morphology_Topology/Taxicab_geometry.md
     * @wikipedia https://en.wikipedia.org/wiki/Chebyshev_distance
     * @section Properties
     * @formula d_{\infty}(\mathbf{p}, \mathbf{q}) = \max_{i=1}^{n} |p_i - q_i|
     *
     * @param {number[]} a
     * @param {number[]} b
     * @returns {number}
     */
    distChebyshev(a, b) {
        return Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    },

    /**
     * Hamming distance between two equal-length strings or arrays
     * Counts positions where elements differ.
     *
     * @source blog/ideas/reference documentation/11_Optimisation_Numerical_Methods/Hamming_distance.md
     * @wikipedia https://en.wikipedia.org/wiki/Hamming_distance
     * @section 2.1 For Binary Strings
     * @formula d_H(x, y) = \sum_{i=1}^{n} |x_i - y_i| = \sum_{i=1}^{n} (x_i \oplus y_i)
     *
     * @param {string|Array} a - First sequence
     * @param {string|Array} b - Second sequence
     * @returns {number} Number of differing positions
     */
    hammingDistance(a, b) {
        if (a.length !== b.length) {
            throw new Error('Hamming distance requires equal-length sequences');
        }
        let distance = 0;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) distance++;
        }
        return distance;
    },

    /**
     * Hamming distance between two 32-bit integers
     * Uses XOR and popcount for efficiency.
     *
     * @source blog/ideas/reference documentation/11_Optimisation_Numerical_Methods/Hamming_distance.md
     * @wikipedia https://en.wikipedia.org/wiki/Hamming_distance
     * @section 3.1 Naive (O(n)) and 3.2 XOR + Popcount (Efficient for Integers)
     * @formula d_H(x, y) = popcount(x \oplus y)
     *
     * @param {number} a - First integer
     * @param {number} b - Second integer
     * @returns {number} Number of differing bits
     */
    hammingDistanceInt(a, b) {
        let xor = (a ^ b) >>> 0;
        let count = 0;
        while (xor) {
            count += xor & 1;
            xor >>>= 1;
        }
        return count;
    },

    /**
     * Population count (number of set bits) for 32-bit integer
     * @param {number} n - Integer
     * @returns {number} Number of 1 bits
     */
    popcount(n) {
        n = n >>> 0;
        n = n - ((n >>> 1) & 0x55555555);
        n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
        n = (n + (n >>> 4)) & 0x0F0F0F0F;
        return (n * 0x01010101) >>> 24;
    },

    /**
     * Normalized Hamming distance (0 to 1)
     *
     * @source blog/ideas/reference documentation/11_Optimisation_Numerical_Methods/Hamming_distance.md
     * @wikipedia https://en.wikipedia.org/wiki/Hamming_distance
     * @section 5.1 Normalized Hamming Distance
     * @formula d_{H,\text{norm}}(x, y) = \frac{d_H(x, y)}{n}
     *
     * @param {string|Array} a - First sequence
     * @param {string|Array} b - Second sequence
     * @returns {number} Normalized distance [0, 1]
     */
    hammingDistanceNormalized(a, b) {
        return this.hammingDistance(a, b) / a.length;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // STATISTICS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Mean (average) of array
     * @param {number[]} arr 
     * @returns {number}
     */
    mean(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, v) => sum + v, 0) / arr.length;
    },

    /**
     * Variance: σ² = Σ(xᵢ - μ)² / n
     * @param {number[]} arr 
     * @returns {number}
     */
    variance(arr) {
        if (arr.length === 0) return 0;
        const m = this.mean(arr);
        return arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length;
    },

    /**
     * Standard deviation: σ = √variance
     * @param {number[]} arr 
     * @returns {number}
     */
    stdDev(arr) {
        return Math.sqrt(this.variance(arr));
    },

    /**
     * Build histogram from values
     * @param {number[]} values - Array of values
     * @param {number} bins - Number of bins
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {{counts: number[], edges: number[]}}
     */
    histogram(values, bins, min, max) {
        const counts = new Array(bins).fill(0);
        const binWidth = (max - min) / bins;
        const edges = [];
        
        for (let i = 0; i <= bins; i++) {
            edges.push(min + i * binWidth);
        }
        
        for (const v of values) {
            const idx = Math.min(Math.floor((v - min) / binWidth), bins - 1);
            if (idx >= 0 && idx < bins) {
                counts[idx]++;
            }
        }
        
        return { counts, edges };
    },

    /**
     * Normalize histogram to probability distribution (sum = 1)
     * @param {number[]} counts 
     * @returns {number[]}
     */
    normalizeHistogram(counts) {
        const total = counts.reduce((sum, c) => sum + c, 0);
        return total > 0 ? counts.map(c => c / total) : counts;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ANGLE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Convert degrees to radians
     * @param {number} deg 
     * @returns {number}
     */
    degToRad(deg) {
        return deg * Math.PI / 180;
    },

    /**
     * Convert radians to degrees
     * @param {number} rad 
     * @returns {number}
     */
    radToDeg(rad) {
        return rad * 180 / Math.PI;
    },

    /**
     * Normalize angle to [0, 2π)
     * @param {number} angle 
     * @returns {number}
     */
    normalizeAngle(angle) {
        angle = angle % this.TAU;
        return angle < 0 ? angle + this.TAU : angle;
    },

    /**
     * Angle between two vectors (radians)
     * @param {number[]} a 
     * @param {number[]} b 
     * @returns {number}
     */
    angleBetween(a, b) {
        return Math.atan2(this.vecCross(a, b), this.vecDot(a, b));
    },

    // ═══════════════════════════════════════════════════════════════════════
    // RANDOM UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Seeded random number generator (mulberry32)
     * @param {number} seed 
     * @returns {function(): number}
     */
    seededRandom(seed) {
        return function() {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    },

    /**
     * Random float in range [min, max)
     * @param {number} min 
     * @param {number} max 
     * @param {function} [rng=Math.random]
     * @returns {number}
     */
    randomRange(min, max, rng = Math.random) {
        return min + rng() * (max - min);
    },

    /**
     * Random integer in range [min, max]
     * @param {number} min 
     * @param {number} max 
     * @param {function} [rng=Math.random]
     * @returns {number}
     */
    randomInt(min, max, rng = Math.random) {
        return Math.floor(min + rng() * (max - min + 1));
    },

    /**
     * Random point in unit disk (rejection sampling)
     * @param {function} [rng=Math.random]
     * @returns {number[]}
     */
    randomInDisk(rng = Math.random) {
        let x, y;
        do {
            x = rng() * 2 - 1;
            y = rng() * 2 - 1;
        } while (x * x + y * y > 1);
        return [x, y];
    },

    /**
     * Random point on unit circle
     * @param {function} [rng=Math.random]
     * @returns {number[]}
     */
    randomOnCircle(rng = Math.random) {
        const angle = rng() * this.TAU;
        return [Math.cos(angle), Math.sin(angle)];
    },

    // ═══════════════════════════════════════════════════════════════════════
    // HASH FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Integer hash function (Wang hash variant)
     * Maps 32-bit integer to pseudo-random 32-bit integer
     * 
     * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Hash_function.md
     * @wikipedia https://en.wikipedia.org/wiki/Hash_function
     * @formula H(n) = ((n >> 16) ^ n) * 0x45d9f3b repeated
     * 
     * @param {number} n - Input integer
     * @returns {number} Hashed value (unsigned 32-bit)
     */
    hashInt(n) {
        n = ((n >> 16) ^ n) * 0x45d9f3b;
        n = ((n >> 16) ^ n) * 0x45d9f3b;
        n = (n >> 16) ^ n;
        return n >>> 0;
    },

    /**
     * Hash 2D coordinates to single integer
     * @param {number} x - X coordinate (integer)
     * @param {number} y - Y coordinate (integer)
     * @returns {number} Hashed value
     */
    hash2D(x, y) {
        return this.hashInt(x + this.hashInt(y));
    },

    /**
     * Hash integer to float in [0, 1)
     * @param {number} n - Input integer
     * @returns {number} Float in [0, 1)
     */
    hashToFloat(n) {
        return this.hashInt(n) / 4294967296;
    },

    /**
     * Deterministic pseudo-random from seed (single value, not generator)
     * Uses sine-based hash for quick single-shot random
     * @param {number} seed - Seed value
     * @returns {number} Float in [0, 1)
     */
    quickRandom(seed) {
        const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
        return x - Math.floor(x);
    }
};

export default MathUtils;

