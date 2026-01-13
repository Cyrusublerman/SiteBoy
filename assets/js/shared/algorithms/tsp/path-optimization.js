/**
 * @fileoverview Path Optimization Algorithms (TSP)
 * 
 * Travelling Salesman Problem algorithms for creating continuous paths
 * through point sets. Essential for line-based shading techniques.
 * 
 * @module tsp/path-optimization
 * @see Reference: 07_TSP_Based_Space_Filling/*.md
 */

import { MathUtils } from '../core/math-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// NEAREST NEIGHBOR HEURISTIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Nearest neighbor TSP heuristic
 * Greedy algorithm: always visit the closest unvisited point
 *
 * @source blog/ideas/reference documentation/07_TSP_Based_Space_Filling/Nearest_neighbour_algorithm.md
 * @wikipedia https://en.wikipedia.org/wiki/Nearest_neighbour_algorithm
 * @section Algorithm
 * @formula Visit closest unvisited point at each step
 *
 * Complexity: O(n²)
 * Quality: ~25% longer than optimal on average
 *
 * @param {Array<{x: number, y: number}>} points
 * @param {number} [startIdx=0] - Starting point index
 * @returns {{path: number[], length: number}}
 */
export function nearestNeighbor(points, startIdx = 0) {
    const n = points.length;
    if (n === 0) return { path: [], length: 0 };
    if (n === 1) return { path: [0], length: 0 };
    
    const visited = new Set();
    const path = [startIdx];
    visited.add(startIdx);
    
    let totalLength = 0;
    let current = startIdx;
    
    while (path.length < n) {
        let nearestIdx = -1;
        let nearestDist = Infinity;
        
        for (let i = 0; i < n; i++) {
            if (visited.has(i)) continue;
            
            const dist = MathUtils.distEuclidean(
                [points[current].x, points[current].y],
                [points[i].x, points[i].y]
            );
            
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestIdx = i;
            }
        }
        
        path.push(nearestIdx);
        visited.add(nearestIdx);
        totalLength += nearestDist;
        current = nearestIdx;
    }
    
    return { path, length: totalLength };
}

/**
 * Multi-start nearest neighbor
 * Tries all starting points and returns best result
 * 
 * @param {Array<{x: number, y: number}>} points 
 * @returns {{path: number[], length: number}}
 */
export function multiStartNearestNeighbor(points) {
    let bestPath = null;
    let bestLength = Infinity;
    
    for (let start = 0; start < points.length; start++) {
        const result = nearestNeighbor(points, start);
        if (result.length < bestLength) {
            bestLength = result.length;
            bestPath = result.path;
        }
    }
    
    return { path: bestPath, length: bestLength };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2-OPT OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 2-opt local search optimization
 *
 * @source blog/ideas/reference documentation/07_TSP_Based_Space_Filling/2-opt.md
 * @wikipedia https://en.wikipedia.org/wiki/2-opt
 * @section Algorithm
 * @formula d(a,b) + d(c,d) > d(a,c) + d(b,d)
 *
 * Repeatedly finds pairs of edges that can be swapped to reduce tour length.
 * Reverses segment between edges.
 *
 * Mathematical condition for improvement:
 * d(a,b) + d(c,d) > d(a,c) + d(b,d)
 *
 * @param {Array<{x: number, y: number}>} points
 * @param {number[]} initialPath - Initial tour
 * @param {number} [maxIterations=1000]
 * @returns {{path: number[], length: number, iterations: number}}
 */
export function twoOpt(points, initialPath, maxIterations = 1000) {
    const n = points.length;
    if (n < 4) return { path: initialPath, length: computePathLength(points, initialPath), iterations: 0 };
    
    const path = [...initialPath];
    const dist = computeDistanceMatrix(points);
    
    let improved = true;
    let iterations = 0;
    
    while (improved && iterations < maxIterations) {
        improved = false;
        iterations++;
        
        for (let i = 0; i < n - 2; i++) {
            for (let j = i + 2; j < n; j++) {
                if (i === 0 && j === n - 1) continue;
                
                const a = path[i];
                const b = path[i + 1];
                const c = path[j];
                const d = path[(j + 1) % n];
                
                const currentDist = dist[a][b] + dist[c][d];
                const newDist = dist[a][c] + dist[b][d];
                
                if (newDist < currentDist - 1e-10) {
                    reversePath(path, i + 1, j);
                    improved = true;
                }
            }
        }
    }
    
    return {
        path,
        length: computePathLength(points, path),
        iterations
    };
}

/**
 * Reverse segment of path in-place
 * @private
 */
function reversePath(path, start, end) {
    while (start < end) {
        [path[start], path[end]] = [path[end], path[start]];
        start++;
        end--;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3-OPT OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 3-opt local search (more powerful than 2-opt)
 * 
 * Considers removing 3 edges and reconnecting in all possible ways.
 * 
 * @param {Array<{x: number, y: number}>} points 
 * @param {number[]} initialPath 
 * @param {number} [maxIterations=100]
 * @returns {{path: number[], length: number}}
 */
export function threeOpt(points, initialPath, maxIterations = 100) {
    const n = points.length;
    if (n < 6) return twoOpt(points, initialPath, maxIterations);
    
    const path = [...initialPath];
    const dist = computeDistanceMatrix(points);
    
    let improved = true;
    let iterations = 0;
    
    while (improved && iterations < maxIterations) {
        improved = false;
        iterations++;
        
        for (let i = 0; i < n - 4; i++) {
            for (let j = i + 2; j < n - 2; j++) {
                for (let k = j + 2; k < n; k++) {
                    const improvement = tryThreeOptMove(path, dist, i, j, k, n);
                    if (improvement) {
                        improved = true;
                    }
                }
            }
        }
    }
    
    return {
        path,
        length: computePathLength(points, path)
    };
}

/**
 * Try all 3-opt moves for given i, j, k
 * @private
 */
function tryThreeOptMove(path, dist, i, j, k, n) {
    const a = path[i], b = path[i + 1];
    const c = path[j], d = path[j + 1];
    const e = path[k], f = path[(k + 1) % n];
    
    const d0 = dist[a][b] + dist[c][d] + dist[e][f];
    
    const options = [
        dist[a][c] + dist[b][d] + dist[e][f],
        dist[a][b] + dist[c][e] + dist[d][f],
        dist[a][e] + dist[c][d] + dist[b][f],
        dist[a][c] + dist[b][e] + dist[d][f],
        dist[a][d] + dist[e][c] + dist[b][f],
    ];
    
    let bestOption = -1;
    let bestSaving = 0;
    
    for (let opt = 0; opt < options.length; opt++) {
        const saving = d0 - options[opt];
        if (saving > bestSaving + 1e-10) {
            bestSaving = saving;
            bestOption = opt;
        }
    }
    
    if (bestOption >= 0) {
        if (bestOption === 0) {
            reversePath(path, i + 1, j);
        } else if (bestOption === 1) {
            reversePath(path, j + 1, k);
        } else if (bestOption === 2) {
            reversePath(path, i + 1, k);
        }
        return true;
    }
    
    return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHRISTOFIDES ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Christofides-inspired algorithm
 * Guarantees 3/2-approximation for metric TSP
 *
 * @source blog/ideas/reference documentation/07_TSP_Based_Space_Filling/Christofides_algorithm.md
 * @wikipedia https://en.wikipedia.org/wiki/Christofides_algorithm
 * @section Algorithm
 * @formula Approximation ratio: 3/2 for metric TSP
 *
 * Steps:
 * 1. Compute minimum spanning tree
 * 2. Find odd-degree vertices
 * 3. Add minimum matching of odd vertices
 * 4. Find Eulerian tour
 * 5. Convert to Hamiltonian tour
 *
 * @param {Array<{x: number, y: number}>} points
 * @returns {{path: number[], length: number}}
 */
export function christofides(points) {
    const n = points.length;
    if (n <= 3) return nearestNeighbor(points);
    
    const mst = primMST(points);
    
    const degree = new Array(n).fill(0);
    for (const [u, v] of mst) {
        degree[u]++;
        degree[v]++;
    }
    
    const oddVertices = [];
    for (let i = 0; i < n; i++) {
        if (degree[i] % 2 === 1) {
            oddVertices.push(i);
        }
    }
    
    const matching = greedyMatching(points, oddVertices);
    const multiGraph = [...mst, ...matching];
    const tour = eulerianToHamiltonian(multiGraph, n);
    
    return twoOpt(points, tour, 500);
}

/**
 * Prim's MST algorithm
 * @private
 */
function primMST(points) {
    const n = points.length;
    const dist = computeDistanceMatrix(points);
    
    const inMST = new Array(n).fill(false);
    const key = new Array(n).fill(Infinity);
    const parent = new Array(n).fill(-1);
    
    key[0] = 0;
    
    for (let count = 0; count < n; count++) {
        let minKey = Infinity;
        let u = -1;
        
        for (let v = 0; v < n; v++) {
            if (!inMST[v] && key[v] < minKey) {
                minKey = key[v];
                u = v;
            }
        }
        
        inMST[u] = true;
        
        for (let v = 0; v < n; v++) {
            if (!inMST[v] && dist[u][v] < key[v]) {
                key[v] = dist[u][v];
                parent[v] = u;
            }
        }
    }
    
    const edges = [];
    for (let v = 1; v < n; v++) {
        edges.push([parent[v], v]);
    }
    
    return edges;
}

/**
 * Greedy minimum matching
 * @private
 */
function greedyMatching(points, vertices) {
    const matching = [];
    const remaining = new Set(vertices);
    
    while (remaining.size > 1) {
        let minDist = Infinity;
        let bestPair = null;
        
        for (const u of remaining) {
            for (const v of remaining) {
                if (u >= v) continue;
                
                const d = MathUtils.distEuclidean(
                    [points[u].x, points[u].y],
                    [points[v].x, points[v].y]
                );
                
                if (d < minDist) {
                    minDist = d;
                    bestPair = [u, v];
                }
            }
        }
        
        if (bestPair) {
            matching.push(bestPair);
            remaining.delete(bestPair[0]);
            remaining.delete(bestPair[1]);
        }
    }
    
    return matching;
}

/**
 * Convert multigraph to Hamiltonian tour
 * @private
 */
function eulerianToHamiltonian(edges, n) {
    const adj = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
        adj[u].push(v);
        adj[v].push(u);
    }
    
    const stack = [0];
    const path = [];
    const edgeCount = adj.map(a => a.length);
    
    while (stack.length > 0) {
        const v = stack[stack.length - 1];
        
        if (edgeCount[v] === 0) {
            path.push(stack.pop());
        } else {
            const u = adj[v].pop();
            edgeCount[v]--;
            
            const idx = adj[u].indexOf(v);
            if (idx !== -1) {
                adj[u].splice(idx, 1);
                edgeCount[u]--;
            }
            
            stack.push(u);
        }
    }
    
    const visited = new Set();
    const tour = [];
    
    for (const v of path) {
        if (!visited.has(v)) {
            visited.add(v);
            tour.push(v);
        }
    }
    
    return tour;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute distance matrix for all point pairs
 * 
 * @param {Array<{x: number, y: number}>} points 
 * @returns {number[][]}
 */
export function computeDistanceMatrix(points) {
    const n = points.length;
    const dist = Array.from({ length: n }, () => new Array(n));
    
    for (let i = 0; i < n; i++) {
        dist[i][i] = 0;
        for (let j = i + 1; j < n; j++) {
            const d = MathUtils.distEuclidean(
                [points[i].x, points[i].y],
                [points[j].x, points[j].y]
            );
            dist[i][j] = d;
            dist[j][i] = d;
        }
    }
    
    return dist;
}

/**
 * Compute total path length
 * 
 * @param {Array<{x: number, y: number}>} points 
 * @param {number[]} path - Indices into points array
 * @param {boolean} [closed=false] - Include edge from last to first
 * @returns {number}
 */
export function computePathLength(points, path, closed = false) {
    let length = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
        length += MathUtils.distEuclidean(
            [points[path[i]].x, points[path[i]].y],
            [points[path[i + 1]].x, points[path[i + 1]].y]
        );
    }
    
    if (closed && path.length > 1) {
        length += MathUtils.distEuclidean(
            [points[path[path.length - 1]].x, points[path[path.length - 1]].y],
            [points[path[0]].x, points[path[0]].y]
        );
    }
    
    return length;
}

/**
 * Convert path indices to point coordinates
 * 
 * @param {Array<{x: number, y: number}>} points 
 * @param {number[]} path 
 * @returns {Array<{x: number, y: number}>}
 */
export function pathToCoordinates(points, path) {
    return path.map(i => ({ x: points[i].x, y: points[i].y }));
}

/**
 * Full TSP solver: nearest neighbor + 2-opt
 * 
 * @param {Array<{x: number, y: number}>} points 
 * @returns {{path: Array<{x: number, y: number}>, length: number}}
 */
export function solveTSP(points) {
    if (points.length === 0) return { path: [], length: 0 };
    if (points.length === 1) return { path: [{ ...points[0] }], length: 0 };
    
    const nn = multiStartNearestNeighbor(points);
    const optimized = twoOpt(points, nn.path, 1000);
    
    return {
        path: pathToCoordinates(points, optimized.path),
        length: optimized.length
    };
}

export default {
    nearestNeighbor,
    multiStartNearestNeighbor,
    twoOpt,
    threeOpt,
    christofides,
    computeDistanceMatrix,
    computePathLength,
    pathToCoordinates,
    solveTSP
};
