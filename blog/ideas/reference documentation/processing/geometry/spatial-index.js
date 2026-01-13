/**
 * @fileoverview Spatial Indexing Data Structures
 * 
 * K-d tree and radius search for efficient nearest neighbor queries.
 * 
 * @module geometry/spatial-index
 * @source blog/ideas/reference documentation/06_Polygon_Grid_Domain_Subdivision/K-d_tree.md
 * @wikipedia https://en.wikipedia.org/wiki/K-d_tree
 * 
 * Key concepts from reference:
 * - Binary tree where every node is k-dimensional point
 * - Splitting hyperplane cycles through dimensions
 * - Median selection for balanced construction
 * - Nearest neighbor: O(log n) average for random points
 * 
 * @formula Range search worst case: O(k·n^(1-1/k))
 * @formula Curse of dimensionality: n >> 2^k for efficiency
 */

// ═══════════════════════════════════════════════════════════════════════════
// K-D TREE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} KdNode
 * @property {Array<number>} point - Point coordinates
 * @property {*} data - Associated data
 * @property {KdNode|null} left - Left subtree
 * @property {KdNode|null} right - Right subtree
 * @property {number} axis - Split axis
 */

/**
 * Build a k-d tree from points
 * 
 * @param {Array<{x: number, y: number, data?: *}>} points - Input points
 * @param {number} [depth=0] - Current depth (internal)
 * @returns {KdNode|null} Root node
 */
export function buildKdTree(points, depth = 0) {
    if (points.length === 0) return null;
    
    const k = 2; // 2D
    const axis = depth % k;
    
    // Sort by current axis
    const sorted = [...points].sort((a, b) => {
        const aVal = axis === 0 ? a.x : a.y;
        const bVal = axis === 0 ? b.x : b.y;
        return aVal - bVal;
    });
    
    const mid = Math.floor(sorted.length / 2);
    const medianPoint = sorted[mid];
    
    return {
        point: [medianPoint.x, medianPoint.y],
        data: medianPoint.data,
        axis,
        left: buildKdTree(sorted.slice(0, mid), depth + 1),
        right: buildKdTree(sorted.slice(mid + 1), depth + 1)
    };
}

/**
 * Find nearest neighbor in k-d tree
 * 
 * @param {KdNode} root - Tree root
 * @param {number} x - Query X
 * @param {number} y - Query Y
 * @returns {{point: number[], data: *, distance: number}|null}
 */
export function kdNearestNeighbor(root, x, y) {
    if (!root) return null;
    
    const query = [x, y];
    let best = null;
    let bestDist = Infinity;
    
    function distSq(a, b) {
        return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    }
    
    function search(node, depth) {
        if (!node) return;
        
        const d = distSq(query, node.point);
        if (d < bestDist) {
            bestDist = d;
            best = node;
        }
        
        const axis = node.axis;
        const diff = query[axis] - node.point[axis];
        
        // Search the side containing the query point first
        const first = diff < 0 ? node.left : node.right;
        const second = diff < 0 ? node.right : node.left;
        
        search(first, depth + 1);
        
        // Check if we need to search the other side
        if (diff * diff < bestDist) {
            search(second, depth + 1);
        }
    }
    
    search(root, 0);
    
    return best ? {
        point: best.point,
        data: best.data,
        distance: Math.sqrt(bestDist)
    } : null;
}

/**
 * Find all points within radius
 * 
 * @param {KdNode} root - Tree root
 * @param {number} x - Query X
 * @param {number} y - Query Y
 * @param {number} radius - Search radius
 * @returns {Array<{point: number[], data: *, distance: number}>}
 */
export function kdRadiusSearch(root, x, y, radius) {
    const results = [];
    const radiusSq = radius * radius;
    const query = [x, y];
    
    function distSq(a, b) {
        return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    }
    
    function search(node) {
        if (!node) return;
        
        const d = distSq(query, node.point);
        if (d <= radiusSq) {
            results.push({
                point: node.point,
                data: node.data,
                distance: Math.sqrt(d)
            });
        }
        
        const axis = node.axis;
        const diff = query[axis] - node.point[axis];
        
        // Check which children might contain points within radius
        if (diff - radius <= 0) search(node.left);
        if (diff + radius >= 0) search(node.right);
    }
    
    search(root);
    return results;
}

/**
 * Find k nearest neighbors
 * 
 * @param {KdNode} root - Tree root
 * @param {number} x - Query X
 * @param {number} y - Query Y
 * @param {number} k - Number of neighbors
 * @returns {Array<{point: number[], data: *, distance: number}>}
 */
export function kdKNearestNeighbors(root, x, y, k) {
    const query = [x, y];
    const results = [];
    
    function distSq(a, b) {
        return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    }
    
    function maxDistSq() {
        if (results.length < k) return Infinity;
        return results[results.length - 1].distSq;
    }
    
    function insert(node, dSq) {
        const item = { point: node.point, data: node.data, distSq: dSq };
        
        // Insert in sorted order
        let i = results.length;
        while (i > 0 && results[i - 1].distSq > dSq) i--;
        results.splice(i, 0, item);
        
        // Keep only k items
        if (results.length > k) results.pop();
    }
    
    function search(node) {
        if (!node) return;
        
        const d = distSq(query, node.point);
        if (d < maxDistSq()) {
            insert(node, d);
        }
        
        const axis = node.axis;
        const diff = query[axis] - node.point[axis];
        
        const first = diff < 0 ? node.left : node.right;
        const second = diff < 0 ? node.right : node.left;
        
        search(first);
        
        if (diff * diff < maxDistSq()) {
            search(second);
        }
    }
    
    search(root);
    
    return results.map(r => ({
        point: r.point,
        data: r.data,
        distance: Math.sqrt(r.distSq)
    }));
}

// ═══════════════════════════════════════════════════════════════════════════
// GRID-BASED SPATIAL HASH
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create spatial hash grid for efficient queries
 * 
 * @param {Array<{x: number, y: number, data?: *}>} points - Input points
 * @param {number} cellSize - Grid cell size
 * @returns {{cells: Map, cellSize: number, radiusSearch: Function}}
 */
export function createSpatialHash(points, cellSize) {
    const cells = new Map();
    
    function getKey(x, y) {
        const cx = Math.floor(x / cellSize);
        const cy = Math.floor(y / cellSize);
        return `${cx},${cy}`;
    }
    
    // Insert all points
    for (const p of points) {
        const key = getKey(p.x, p.y);
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push(p);
    }
    
    /**
     * Find all points within radius
     * @param {number} x - Query X
     * @param {number} y - Query Y
     * @param {number} radius - Search radius
     * @returns {Array<{x, y, data, distance}>}
     */
    function radiusSearch(x, y, radius) {
        const results = [];
        const radiusSq = radius * radius;
        
        // Check all cells that might contain points
        const minCX = Math.floor((x - radius) / cellSize);
        const maxCX = Math.floor((x + radius) / cellSize);
        const minCY = Math.floor((y - radius) / cellSize);
        const maxCY = Math.floor((y + radius) / cellSize);
        
        for (let cy = minCY; cy <= maxCY; cy++) {
            for (let cx = minCX; cx <= maxCX; cx++) {
                const key = `${cx},${cy}`;
                const cell = cells.get(key);
                if (!cell) continue;
                
                for (const p of cell) {
                    const dx = p.x - x;
                    const dy = p.y - y;
                    const dSq = dx * dx + dy * dy;
                    if (dSq <= radiusSq) {
                        results.push({
                            ...p,
                            distance: Math.sqrt(dSq)
                        });
                    }
                }
            }
        }
        
        return results;
    }
    
    /**
     * Find nearest neighbor
     * @param {number} x - Query X
     * @param {number} y - Query Y
     * @returns {{x, y, data, distance}|null}
     */
    function nearestNeighbor(x, y) {
        let best = null;
        let bestDist = Infinity;
        
        // Start with cell containing query, expand outward
        for (let ring = 0; ring < 100; ring++) {
            const searchRadius = (ring + 1) * cellSize;
            const candidates = radiusSearch(x, y, searchRadius);
            
            for (const p of candidates) {
                if (p.distance < bestDist) {
                    bestDist = p.distance;
                    best = p;
                }
            }
            
            // If we found something in a ring, and finished that ring, we're done
            if (best && bestDist <= ring * cellSize) break;
        }
        
        return best;
    }
    
    return { cells, cellSize, radiusSearch, nearestNeighbor };
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Find all pairs of points within distance
 * 
 * @param {Array<{x: number, y: number}>} points - Input points
 * @param {number} maxDist - Maximum distance
 * @returns {Array<{i: number, j: number, distance: number}>}
 */
export function findClosePointPairs(points, maxDist) {
    const hash = createSpatialHash(points.map((p, i) => ({ ...p, idx: i })), maxDist);
    const pairs = [];
    const seen = new Set();
    
    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const neighbors = hash.radiusSearch(p.x, p.y, maxDist);
        
        for (const n of neighbors) {
            const j = n.idx;
            if (i === j) continue;
            
            const key = i < j ? `${i},${j}` : `${j},${i}`;
            if (seen.has(key)) continue;
            seen.add(key);
            
            pairs.push({ i, j, distance: n.distance });
        }
    }
    
    return pairs;
}

/**
 * Compute Voronoi-like nearest neighbor for each grid cell
 * 
 * @param {Array<{x: number, y: number}>} sites - Voronoi sites
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @returns {Int32Array} Site index for each cell
 */
export function nearestSiteGrid(sites, width, height) {
    const tree = buildKdTree(sites.map((s, i) => ({ x: s.x, y: s.y, data: i })));
    const result = new Int32Array(width * height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const nearest = kdNearestNeighbor(tree, x, y);
            result[y * width + x] = nearest ? nearest.data : -1;
        }
    }
    
    return result;
}

