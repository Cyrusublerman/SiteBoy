/**
 * @fileoverview Point Sampling and Distribution Algorithms
 * 
 * Sampling algorithms generate point distributions with specific properties:
 * - Blue noise: minimum distance between points, natural appearance
 * - Low-discrepancy: quasi-random sequences for uniform coverage
 * - Importance: density proportional to weight function
 * 
 * @see Reference: 04_Sampling_Point_Distribution/*.md
 */

import { MathUtils } from '../core/math-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// POISSON DISK SAMPLING (BRIDSON'S ALGORITHM)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Poisson disk sampling using Bridson's algorithm
 *
 * @source blog/ideas/reference documentation/04_Sampling_Point_Distribution/Poisson_disk_sampling.md
 * @wikipedia https://en.wikipedia.org/wiki/Supersampling#Poisson_disc
 * @section Bridson's algorithm
 * @formula Minimum distance r, annulus sampling [r, 2r]
 *
 * Generates blue noise distribution where no two points are closer
 * than minimum distance r, but points are as dense as possible.
 *
 * Algorithm (O(n)):
 * 1. Initialize background grid for spatial lookup
 * 2. Start with random seed point
 * 3. For each active point, generate k candidates in annulus [r, 2r]
 * 4. Accept candidates that satisfy minimum distance
 * 5. Repeat until no active points remain
 *
 * @param {number} width - Domain width
 * @param {number} height - Domain height
 * @param {number} minDist - Minimum distance between points
 * @param {number} [k=30] - Candidates per point
 * @param {function} [rng=Math.random] - Random number generator
 * @returns {Array<{x: number, y: number}>}
 */
export function poissonDisk(width, height, minDist, k = 30, rng = Math.random) {
    const cellSize = minDist / Math.SQRT2;
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);
    
    // Background grid for O(1) neighbor lookup
    // -1 = empty, otherwise index into points array
    const grid = new Int32Array(gridWidth * gridHeight).fill(-1);
    
    const points = [];
    const active = [];
    
    // Helper: grid index from position
    const gridIndex = (x, y) => {
        const gx = Math.floor(x / cellSize);
        const gy = Math.floor(y / cellSize);
        return gy * gridWidth + gx;
    };
    
    // Helper: check if point is valid (no neighbors closer than minDist)
    const isValid = (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return false;
        
        const gx = Math.floor(x / cellSize);
        const gy = Math.floor(y / cellSize);
        
        // Check 5×5 neighborhood in grid
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const nx = gx + dx;
                const ny = gy + dy;
                
                if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                    const idx = grid[ny * gridWidth + nx];
                    if (idx !== -1) {
                        const p = points[idx];
                        const dist = MathUtils.distEuclideanSq([x, y], [p.x, p.y]);
                        if (dist < minDist * minDist) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;
    };
    
    // Start with random seed point
    const seedX = rng() * width;
    const seedY = rng() * height;
    points.push({ x: seedX, y: seedY });
    grid[gridIndex(seedX, seedY)] = 0;
    active.push(0);
    
    // Main loop
    while (active.length > 0) {
        // Pick random active point
        const activeIdx = Math.floor(rng() * active.length);
        const pointIdx = active[activeIdx];
        const point = points[pointIdx];
        
        let found = false;
        
        // Generate k candidates in annulus [r, 2r]
        for (let i = 0; i < k; i++) {
            const angle = rng() * MathUtils.TAU;
            const dist = minDist + rng() * minDist; // [r, 2r]
            
            const nx = point.x + Math.cos(angle) * dist;
            const ny = point.y + Math.sin(angle) * dist;
            
            if (isValid(nx, ny)) {
                const newIdx = points.length;
                points.push({ x: nx, y: ny });
                grid[gridIndex(nx, ny)] = newIdx;
                active.push(newIdx);
                found = true;
            }
        }
        
        // Remove point from active list if no valid candidates found
        if (!found) {
            active.splice(activeIdx, 1);
        }
    }
    
    return points;
}

/**
 * Variable-density Poisson disk sampling
 * Density controlled by weight function
 * 
 * @param {number} width 
 * @param {number} height 
 * @param {function(number, number): number} densityFn - Returns density [0, 1] at (x, y)
 * @param {number} minDist - Minimum distance at density = 1
 * @param {number} maxDist - Maximum distance at density = 0
 * @param {number} [k=30]
 * @param {function} [rng=Math.random]
 * @returns {Array<{x: number, y: number}>}
 */
export function variablePoissonDisk(width, height, densityFn, minDist, maxDist, k = 30, rng = Math.random) {
    const points = [];
    const active = [];
    
    // Use smallest cell size for grid
    const cellSize = minDist / Math.SQRT2;
    const gridWidth = Math.ceil(width / cellSize);
    const gridHeight = Math.ceil(height / cellSize);
    const grid = new Int32Array(gridWidth * gridHeight).fill(-1);
    
    const gridIndex = (x, y) => {
        const gx = Math.floor(x / cellSize);
        const gy = Math.floor(y / cellSize);
        return gy * gridWidth + gx;
    };
    
    const getMinDist = (x, y) => {
        const density = densityFn(x, y);
        return MathUtils.lerp(maxDist, minDist, density);
    };
    
    const isValid = (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return false;
        
        const r = getMinDist(x, y);
        const gx = Math.floor(x / cellSize);
        const gy = Math.floor(y / cellSize);
        const searchRadius = Math.ceil(maxDist / cellSize);
        
        for (let dy = -searchRadius; dy <= searchRadius; dy++) {
            for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                const nx = gx + dx;
                const ny = gy + dy;
                
                if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                    const idx = grid[ny * gridWidth + nx];
                    if (idx !== -1) {
                        const p = points[idx];
                        const pr = getMinDist(p.x, p.y);
                        const minR = Math.min(r, pr);
                        const dist = MathUtils.distEuclideanSq([x, y], [p.x, p.y]);
                        if (dist < minR * minR) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;
    };
    
    // Seed point
    const seedX = rng() * width;
    const seedY = rng() * height;
    points.push({ x: seedX, y: seedY });
    grid[gridIndex(seedX, seedY)] = 0;
    active.push(0);
    
    while (active.length > 0) {
        const activeIdx = Math.floor(rng() * active.length);
        const pointIdx = active[activeIdx];
        const point = points[pointIdx];
        const r = getMinDist(point.x, point.y);
        
        let found = false;
        
        for (let i = 0; i < k; i++) {
            const angle = rng() * MathUtils.TAU;
            const dist = r + rng() * r;
            
            const nx = point.x + Math.cos(angle) * dist;
            const ny = point.y + Math.sin(angle) * dist;
            
            if (isValid(nx, ny)) {
                const newIdx = points.length;
                points.push({ x: nx, y: ny });
                grid[gridIndex(nx, ny)] = newIdx;
                active.push(newIdx);
                found = true;
            }
        }
        
        if (!found) {
            active.splice(activeIdx, 1);
        }
    }
    
    return points;
}

// ═══════════════════════════════════════════════════════════════════════════
// LOW-DISCREPANCY SEQUENCES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Halton sequence - low-discrepancy quasi-random sequence
 *
 * @source blog/ideas/reference documentation/04_Sampling_Point_Distribution/Halton_sequence.md
 * @wikipedia https://en.wikipedia.org/wiki/Halton_sequence
 * @section Halton sequence
 * @formula H_b(i) = \sum_{k=1}^\infty a_k(i) \cdot b^{-k}
 *
 * For base b: H_b(i) = Σ_k a_k(i) · b^(-k-1)
 * where i = Σ_k a_k(i) · b^k (base-b representation)
 *
 * @param {number} n - Number of points
 * @param {number} [base1=2] - Base for x coordinate
 * @param {number} [base2=3] - Base for y coordinate
 * @returns {Array<{x: number, y: number}>}
 */
export function haltonSequence(n, base1 = 2, base2 = 3) {
    const halton = (index, base) => {
        let result = 0;
        let f = 1 / base;
        let i = index;
        
        while (i > 0) {
            result += f * (i % base);
            i = Math.floor(i / base);
            f /= base;
        }
        
        return result;
    };
    
    const points = [];
    for (let i = 1; i <= n; i++) {
        points.push({
            x: halton(i, base1),
            y: halton(i, base2)
        });
    }
    
    return points;
}

/**
 * Hammersley set - similar to Halton but uses index/n for one coordinate
 * Better uniformity than Halton for fixed n
 * 
 * @param {number} n 
 * @param {number} [base=2]
 * @returns {Array<{x: number, y: number}>}
 */
export function hammersleySet(n, base = 2) {
    const radical = (index, base) => {
        let result = 0;
        let f = 1 / base;
        let i = index;
        
        while (i > 0) {
            result += f * (i % base);
            i = Math.floor(i / base);
            f /= base;
        }
        
        return result;
    };
    
    const points = [];
    for (let i = 0; i < n; i++) {
        points.push({
            x: i / n,
            y: radical(i, base)
        });
    }
    
    return points;
}

/**
 * Sobol sequence (first two dimensions)
 * Uses direction numbers for quasi-random generation
 * 
 * @param {number} n 
 * @returns {Array<{x: number, y: number}>}
 */
export function sobolSequence(n) {
    // Direction numbers for first two dimensions
    const dirX = [1 << 31];
    const dirY = [1 << 31, 3 << 30];
    
    // Generate more direction numbers
    for (let i = 1; i < 32; i++) {
        dirX.push(1 << (31 - i));
    }
    for (let i = 2; i < 32; i++) {
        const v = dirY[i - 2] ^ (dirY[i - 2] >> 2);
        dirY.push(v ^ (dirY[i - 1] >> 1));
    }
    
    const points = [];
    let x = 0, y = 0;
    
    for (let i = 0; i < n; i++) {
        points.push({
            x: x / 4294967296,
            y: y / 4294967296
        });
        
        // Find rightmost zero bit
        let c = 1;
        let value = i;
        while ((value & 1) === 1) {
            value >>= 1;
            c++;
        }
        
        x ^= dirX[Math.min(c - 1, 31)];
        y ^= dirY[Math.min(c - 1, 31)];
    }
    
    return points;
}

// ═══════════════════════════════════════════════════════════════════════════
// STRATIFIED AND JITTERED SAMPLING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Stratified sampling - divide domain into strata, sample each
 * 
 * @param {number} width 
 * @param {number} height 
 * @param {number} nx - Number of strata in x
 * @param {number} ny - Number of strata in y
 * @param {function} [rng=Math.random]
 * @returns {Array<{x: number, y: number}>}
 */
export function stratifiedSampling(width, height, nx, ny, rng = Math.random) {
    const cellWidth = width / nx;
    const cellHeight = height / ny;
    const points = [];
    
    for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
            points.push({
                x: (i + rng()) * cellWidth,
                y: (j + rng()) * cellHeight
            });
        }
    }
    
    return points;
}

/**
 * Jittered grid sampling - regular grid with random offset
 * 
 * @param {number} width 
 * @param {number} height 
 * @param {number} nx 
 * @param {number} ny 
 * @param {number} [jitter=0.5] - Maximum jitter as fraction of cell size
 * @param {function} [rng=Math.random]
 * @returns {Array<{x: number, y: number}>}
 */
export function jitteredGrid(width, height, nx, ny, jitter = 0.5, rng = Math.random) {
    const cellWidth = width / nx;
    const cellHeight = height / ny;
    const points = [];
    
    for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
            const baseX = (i + 0.5) * cellWidth;
            const baseY = (j + 0.5) * cellHeight;
            
            points.push({
                x: baseX + (rng() - 0.5) * cellWidth * jitter,
                y: baseY + (rng() - 0.5) * cellHeight * jitter
            });
        }
    }
    
    return points;
}

// ═══════════════════════════════════════════════════════════════════════════
// LLOYD RELAXATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lloyd relaxation (centroidal Voronoi tessellation)
 *
 * @source blog/ideas/reference documentation/04_Sampling_Point_Distribution/Lloyd's_algorithm.md
 * @wikipedia https://en.wikipedia.org/wiki/Lloyd%27s_algorithm
 * @section Centroidal Voronoi tessellation
 * @formula Points move to centroids of Voronoi cells iteratively
 *
 * Iteratively moves points to centroids of their Voronoi cells
 *
 * Note: This is a simplified version using nearest-neighbor approximation
 *
 * @param {Array<{x: number, y: number}>} points - Initial points
 * @param {number} width
 * @param {number} height
 * @param {number} [iterations=10]
 * @param {number} [sampleDensity=10] - Samples per cell for centroid estimation
 * @returns {Array<{x: number, y: number}>}
 */
export function lloydRelaxation(points, width, height, iterations = 10, sampleDensity = 10) {
    let current = points.map(p => ({ x: p.x, y: p.y }));
    
    for (let iter = 0; iter < iterations; iter++) {
        // Compute approximate Voronoi cell centroids
        const centroids = current.map(() => ({ x: 0, y: 0, count: 0 }));
        
        // Sample grid and assign to nearest point
        const samples = Math.ceil(Math.sqrt(current.length) * sampleDensity);
        const stepX = width / samples;
        const stepY = height / samples;
        
        for (let sy = 0; sy < samples; sy++) {
            for (let sx = 0; sx < samples; sx++) {
                const x = (sx + 0.5) * stepX;
                const y = (sy + 0.5) * stepY;
                
                // Find nearest point
                let nearestIdx = 0;
                let nearestDist = Infinity;
                
                for (let i = 0; i < current.length; i++) {
                    const dist = MathUtils.distEuclideanSq([x, y], [current[i].x, current[i].y]);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestIdx = i;
                    }
                }
                
                // Accumulate for centroid
                centroids[nearestIdx].x += x;
                centroids[nearestIdx].y += y;
                centroids[nearestIdx].count++;
            }
        }
        
        // Move points to centroids
        for (let i = 0; i < current.length; i++) {
            if (centroids[i].count > 0) {
                current[i].x = centroids[i].x / centroids[i].count;
                current[i].y = centroids[i].y / centroids[i].count;
            }
        }
    }
    
    return current;
}

/**
 * Lloyd relaxation with per-sample weights from a tone field (e.g. stipple density).
 *
 * @param {Array<{x: number, y: number}>} points
 * @param {number} width
 * @param {number} height
 * @param {Float32Array} toneField - length tw*th, non-negative weights
 * @param {number} tw
 * @param {number} th
 * @param {number} [iterations=8]
 * @param {number} [samples=48] - Grid samples per axis for centroid accumulation
 * @returns {Array<{x: number, y: number}>}
 */
export function lloydRelaxationToneWeighted(points, width, height, toneField, tw, th, iterations = 8, samples = 48) {
    let current = points.map(p => ({ x: p.x, y: p.y }));
    const sampleStepX = width / samples;
    const sampleStepY = height / samples;
    const toneAt = (x, y) => {
        const tx = Math.floor((x / width) * tw);
        const ty = Math.floor((y / height) * th);
        const ix = Math.max(0, Math.min(tw - 1, tx));
        const iy = Math.max(0, Math.min(th - 1, ty));
        return toneField[iy * tw + ix];
    };
    for (let iter = 0; iter < iterations; iter++) {
        const centroids = current.map(() => ({ wx: 0, wy: 0, wsum: 0 }));
        for (let sy = 0; sy < samples; sy++) {
            for (let sx = 0; sx < samples; sx++) {
                const x = (sx + 0.5) * sampleStepX;
                const y = (sy + 0.5) * sampleStepY;
                const wgt = toneAt(x, y);
                if (wgt < 1e-9) continue;
                let nearestIdx = 0;
                let nearestDist = Infinity;
                for (let i = 0; i < current.length; i++) {
                    const dist = MathUtils.distEuclideanSq([x, y], [current[i].x, current[i].y]);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestIdx = i;
                    }
                }
                centroids[nearestIdx].wx += x * wgt;
                centroids[nearestIdx].wy += y * wgt;
                centroids[nearestIdx].wsum += wgt;
            }
        }
        for (let i = 0; i < current.length; i++) {
            if (centroids[i].wsum > 0) {
                current[i].x = centroids[i].wx / centroids[i].wsum;
                current[i].y = centroids[i].wy / centroids[i].wsum;
            }
        }
    }
    return current;
}

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTANCE SAMPLING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Importance sampling using rejection method
 * 
 * @param {number} n - Target number of points
 * @param {number} width 
 * @param {number} height 
 * @param {function(number, number): number} weightFn - Weight at (x, y), [0, 1]
 * @param {function} [rng=Math.random]
 * @returns {Array<{x: number, y: number}>}
 */
export function importanceSampling(n, width, height, weightFn, rng = Math.random) {
    const points = [];
    let attempts = 0;
    const maxAttempts = n * 100;
    
    while (points.length < n && attempts < maxAttempts) {
        const x = rng() * width;
        const y = rng() * height;
        const weight = weightFn(x, y);
        
        // Accept with probability = weight
        if (rng() < weight) {
            points.push({ x, y });
        }
        
        attempts++;
    }
    
    return points;
}

/**
 * Weighted Poisson disk - combines Poisson disk with importance
 * 
 * @param {number} width 
 * @param {number} height 
 * @param {function(number, number): number} weightFn - Weight [0, 1]
 * @param {number} baseMinDist - Minimum distance at weight = 1
 * @param {number} [k=30]
 * @param {function} [rng=Math.random]
 * @returns {Array<{x: number, y: number}>}
 */
export function weightedPoissonDisk(width, height, weightFn, baseMinDist, k = 30, rng = Math.random) {
    // Convert weight to density (inverse relationship with distance)
    const densityFn = (x, y) => weightFn(x, y);
    
    return variablePoissonDisk(
        width, height,
        densityFn,
        baseMinDist,
        baseMinDist * 4, // Max distance when weight = 0
        k,
        rng
    );
}

export default {
    poissonDisk,
    variablePoissonDisk,
    haltonSequence,
    hammersleySet,
    sobolSequence,
    stratifiedSampling,
    jitteredGrid,
    lloydRelaxation,
    lloydRelaxationToneWeighted,
    importanceSampling,
    weightedPoissonDisk
};

