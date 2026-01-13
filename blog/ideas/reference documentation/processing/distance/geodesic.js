/**
 * @fileoverview Geodesic Distance Computation
 * 
 * Calculate geodesic (shortest path) distances on surfaces.
 * 
 * @module distance/geodesic
 * @source blog/ideas/reference documentation/13_Distance_Morphology_Topology/Geodesic.md
 * @wikipedia https://en.wikipedia.org/wiki/Geodesic
 * 
 * Key equations from reference:
 * @formula Geodesic path length: L[γ] = ∫₀¹ ||γ'(t)|| dt
 * @formula Geodesic equation: d²γᵏ/dt² + Γᵏᵢⱼ(dγⁱ/dt)(dγʲ/dt) = 0
 * @formula Eikonal equation (FMM): ||∇u|| = 1/f (solved by Fast Marching)
 * @formula Laplace equation: ∇²u = 0 (for harmonic interpolation)
 * 
 * Methods implemented:
 * - Fast Marching Method (Kimmel & Sethian, 1998)
 * - Dijkstra with 8-connectivity
 * - Gauss-Seidel iteration for Laplace
 */

// ═══════════════════════════════════════════════════════════════════════════
// FAST MARCHING METHOD (2D)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Priority queue implementation for fast marching
 */
class MinHeap {
    constructor() {
        this.heap = [];
        this.positions = new Map(); // idx -> heap position
    }
    
    push(idx, priority) {
        this.heap.push({ idx, priority });
        this.positions.set(idx, this.heap.length - 1);
        this._bubbleUp(this.heap.length - 1);
    }
    
    pop() {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        this.positions.delete(min.idx);
        
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.positions.set(last.idx, 0);
            this._sinkDown(0);
        }
        
        return min;
    }
    
    updatePriority(idx, priority) {
        const pos = this.positions.get(idx);
        if (pos === undefined) return;
        
        const oldPriority = this.heap[pos].priority;
        this.heap[pos].priority = priority;
        
        if (priority < oldPriority) {
            this._bubbleUp(pos);
        } else {
            this._sinkDown(pos);
        }
    }
    
    has(idx) {
        return this.positions.has(idx);
    }
    
    isEmpty() {
        return this.heap.length === 0;
    }
    
    _bubbleUp(pos) {
        while (pos > 0) {
            const parent = Math.floor((pos - 1) / 2);
            if (this.heap[pos].priority >= this.heap[parent].priority) break;
            
            this._swap(pos, parent);
            pos = parent;
        }
    }
    
    _sinkDown(pos) {
        while (true) {
            const left = 2 * pos + 1;
            const right = 2 * pos + 2;
            let smallest = pos;
            
            if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
                smallest = right;
            }
            
            if (smallest === pos) break;
            
            this._swap(pos, smallest);
            pos = smallest;
        }
    }
    
    _swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
        this.positions.set(this.heap[i].idx, i);
        this.positions.set(this.heap[j].idx, j);
    }
}

/**
 * Solve quadratic for fast marching update
 * Returns smallest solution of (u - a)² + (u - b)² = f²
 */
function solveQuadratic(a, b, f) {
    if (Math.abs(a - b) >= f) {
        return Math.min(a, b) + f;
    }
    const sum = a + b;
    const discriminant = 2 * f * f - (a - b) * (a - b);
    return (sum + Math.sqrt(discriminant)) / 2;
}

/**
 * Compute geodesic distance from seed points using Fast Marching Method
 * 
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Array<{x: number, y: number}>} seeds - Seed points (distance = 0)
 * @param {Float32Array} [speed] - Optional speed field (default = 1 everywhere)
 * @returns {Float32Array} Distance field
 */
export function fastMarchingGeodesic(width, height, seeds, speed) {
    const INF = Infinity;
    const distances = new Float32Array(width * height).fill(INF);
    const frozen = new Uint8Array(width * height);
    const heap = new MinHeap();
    
    // Initialize seeds
    for (const seed of seeds) {
        const x = Math.floor(seed.x);
        const y = Math.floor(seed.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const idx = y * width + x;
            distances[idx] = 0;
            heap.push(idx, 0);
        }
    }
    
    // Fast marching iteration
    while (!heap.isEmpty()) {
        const { idx } = heap.pop();
        
        if (frozen[idx]) continue;
        frozen[idx] = 1;
        
        const x = idx % width;
        const y = Math.floor(idx / width);
        
        // Update neighbors
        const neighbors = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 }
        ];
        
        for (const { dx, dy } of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            
            const nidx = ny * width + nx;
            if (frozen[nidx]) continue;
            
            // Get adjacent frozen values
            const left = x > 0 && frozen[(y) * width + (x - 1)] ? distances[(y) * width + (x - 1)] : INF;
            const right = x < width - 1 && frozen[(y) * width + (x + 1)] ? distances[(y) * width + (x + 1)] : INF;
            const up = y > 0 && frozen[(y - 1) * width + x] ? distances[(y - 1) * width + x] : INF;
            const down = y < height - 1 && frozen[(y + 1) * width + x] ? distances[(y + 1) * width + x] : INF;
            
            const minHoriz = Math.min(left, right);
            const minVert = Math.min(up, down);
            
            // Speed at this point
            const f = speed ? 1 / Math.max(0.001, speed[nidx]) : 1;
            
            // Solve eikonal equation
            let newDist;
            if (minHoriz === INF) {
                newDist = minVert + f;
            } else if (minVert === INF) {
                newDist = minHoriz + f;
            } else {
                newDist = solveQuadratic(minHoriz, minVert, f);
            }
            
            if (newDist < distances[nidx]) {
                distances[nidx] = newDist;
                
                if (heap.has(nidx)) {
                    heap.updatePriority(nidx, newDist);
                } else {
                    heap.push(nidx, newDist);
                }
            }
        }
    }
    
    return distances;
}

/**
 * Compute geodesic distance with obstacles (Dijkstra-based)
 * 
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Array<{x, y}>} seeds - Seed points
 * @param {Uint8Array} obstacles - Obstacle mask (1 = blocked)
 * @returns {Float32Array} Distance field
 */
export function geodesicWithObstacles(width, height, seeds, obstacles) {
    const INF = Infinity;
    const distances = new Float32Array(width * height).fill(INF);
    const visited = new Uint8Array(width * height);
    const heap = new MinHeap();
    
    // Initialize seeds
    for (const seed of seeds) {
        const x = Math.floor(seed.x);
        const y = Math.floor(seed.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const idx = y * width + x;
            if (!obstacles[idx]) {
                distances[idx] = 0;
                heap.push(idx, 0);
            }
        }
    }
    
    // 8-connectivity offsets
    const neighbors = [
        { dx: -1, dy: 0, cost: 1 },
        { dx: 1, dy: 0, cost: 1 },
        { dx: 0, dy: -1, cost: 1 },
        { dx: 0, dy: 1, cost: 1 },
        { dx: -1, dy: -1, cost: Math.SQRT2 },
        { dx: 1, dy: -1, cost: Math.SQRT2 },
        { dx: -1, dy: 1, cost: Math.SQRT2 },
        { dx: 1, dy: 1, cost: Math.SQRT2 }
    ];
    
    while (!heap.isEmpty()) {
        const { idx } = heap.pop();
        
        if (visited[idx]) continue;
        visited[idx] = 1;
        
        const x = idx % width;
        const y = Math.floor(idx / width);
        const currentDist = distances[idx];
        
        for (const { dx, dy, cost } of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            
            const nidx = ny * width + nx;
            if (visited[nidx] || obstacles[nidx]) continue;
            
            const newDist = currentDist + cost;
            
            if (newDist < distances[nidx]) {
                distances[nidx] = newDist;
                
                if (heap.has(nidx)) {
                    heap.updatePriority(nidx, newDist);
                } else {
                    heap.push(nidx, newDist);
                }
            }
        }
    }
    
    return distances;
}

// ═══════════════════════════════════════════════════════════════════════════
// LAPLACE EQUATION SOLVER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Solve Laplace equation ∇²u = 0 with Dirichlet boundary conditions
 * Uses Gauss-Seidel iteration
 * 
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Float32Array} boundary - Boundary values (NaN for interior points)
 * @param {Object} [options] - Options
 * @param {number} [options.iterations=1000] - Max iterations
 * @param {number} [options.tolerance=1e-6] - Convergence tolerance
 * @returns {Float32Array} Solution field
 */
export function solveLaplace(width, height, boundary, options = {}) {
    const { iterations = 1000, tolerance = 1e-6 } = options;
    
    // Initialize solution with boundary values, 0 for interior
    const u = new Float32Array(width * height);
    const isBoundary = new Uint8Array(width * height);
    
    for (let i = 0; i < boundary.length; i++) {
        if (!isNaN(boundary[i])) {
            u[i] = boundary[i];
            isBoundary[i] = 1;
        }
    }
    
    // Gauss-Seidel iteration
    for (let iter = 0; iter < iterations; iter++) {
        let maxChange = 0;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                
                if (isBoundary[idx]) continue;
                
                // Average of 4 neighbors
                const newVal = 0.25 * (
                    u[idx - 1] + u[idx + 1] +
                    u[idx - width] + u[idx + width]
                );
                
                const change = Math.abs(newVal - u[idx]);
                if (change > maxChange) maxChange = change;
                
                u[idx] = newVal;
            }
        }
        
        if (maxChange < tolerance) break;
    }
    
    return u;
}

/**
 * Solve harmonic field between two boundary sets
 * Creates smooth interpolation from one set (value 0) to another (value 1)
 * 
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Array<{x, y}>} source - Source points (value = 0)
 * @param {Array<{x, y}>} target - Target points (value = 1)
 * @param {Uint8Array} [mask] - Optional mask (1 = valid region)
 * @returns {Float32Array} Harmonic field
 */
export function harmonicInterpolation(width, height, source, target, mask) {
    const boundary = new Float32Array(width * height).fill(NaN);
    
    // Set source boundary (0)
    for (const p of source) {
        const x = Math.floor(p.x);
        const y = Math.floor(p.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            boundary[y * width + x] = 0;
        }
    }
    
    // Set target boundary (1)
    for (const p of target) {
        const x = Math.floor(p.x);
        const y = Math.floor(p.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            boundary[y * width + x] = 1;
        }
    }
    
    // If mask provided, set exterior as 0
    if (mask) {
        for (let i = 0; i < mask.length; i++) {
            if (!mask[i] && isNaN(boundary[i])) {
                boundary[i] = 0;
            }
        }
    }
    
    return solveLaplace(width, height, boundary);
}

