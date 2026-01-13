/**
 * @fileoverview Jump Flood Algorithm for Distance Transforms
 * 
 * GPU-friendly algorithm for computing distance transforms and Voronoi diagrams.
 * All functions are pure and stateless.
 * 
 * @module distance/jfa
 */

// ═══════════════════════════════════════════════════════════════════════════
// JUMP FLOOD ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize JFA seed buffer from binary mask
 * 
 * @param {Uint8Array} mask - Binary mask (non-zero = seed)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Int32Array} Seed buffer (x,y pairs; -1,-1 for non-seeds)
 */
export function jfaInitialize(mask, width, height) {
    const seeds = new Int32Array(width * height * 2);
    seeds.fill(-1);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (mask[idx] > 0) {
                seeds[idx * 2] = x;
                seeds[idx * 2 + 1] = y;
            }
        }
    }
    
    return seeds;
}

/**
 * Single JFA pass with given step size
 * 
 * @param {Int32Array} seeds - Current seed buffer (x,y pairs)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} step - Step size for this pass
 * @returns {Int32Array} Updated seed buffer
 */
export function jfaPass(seeds, width, height, step) {
    const result = new Int32Array(seeds);
    
    // 8-connectivity offsets
    const offsets = [
        [-step, -step], [0, -step], [step, -step],
        [-step, 0],                 [step, 0],
        [-step, step],  [0, step],  [step, step]
    ];
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            let bestSeedX = result[idx * 2];
            let bestSeedY = result[idx * 2 + 1];
            let bestDist = bestSeedX >= 0 
                ? (x - bestSeedX) ** 2 + (y - bestSeedY) ** 2 
                : Infinity;
            
            // Check neighbors at step distance
            for (const [dx, dy] of offsets) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                
                const nidx = ny * width + nx;
                const seedX = seeds[nidx * 2];
                const seedY = seeds[nidx * 2 + 1];
                
                if (seedX < 0) continue;
                
                const dist = (x - seedX) ** 2 + (y - seedY) ** 2;
                if (dist < bestDist) {
                    bestDist = dist;
                    bestSeedX = seedX;
                    bestSeedY = seedY;
                }
            }
            
            result[idx * 2] = bestSeedX;
            result[idx * 2 + 1] = bestSeedY;
        }
    }
    
    return result;
}

/**
 * Full Jump Flood Algorithm
 * 
 * @param {Uint8Array} mask - Binary mask (non-zero = seed)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Int32Array} Nearest seed buffer (x,y pairs)
 */
export function jumpFloodAlgorithm(mask, width, height) {
    let seeds = jfaInitialize(mask, width, height);
    
    // Determine initial step size (largest power of 2 <= max dimension)
    const maxDim = Math.max(width, height);
    let step = 1;
    while (step * 2 <= maxDim) step *= 2;
    
    // JFA passes with decreasing step sizes
    while (step >= 1) {
        seeds = jfaPass(seeds, width, height, step);
        step = Math.floor(step / 2);
    }
    
    // Final +1 pass for accuracy
    seeds = jfaPass(seeds, width, height, 1);
    
    return seeds;
}

/**
 * Compute distance transform from JFA result
 * 
 * @param {Int32Array} seeds - JFA result (x,y pairs)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Float32Array} Euclidean distance field
 */
export function jfaToDistanceField(seeds, width, height) {
    const distances = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const seedX = seeds[idx * 2];
            const seedY = seeds[idx * 2 + 1];
            
            if (seedX >= 0) {
                const dx = x - seedX;
                const dy = y - seedY;
                distances[idx] = Math.sqrt(dx * dx + dy * dy);
            } else {
                distances[idx] = Infinity;
            }
        }
    }
    
    return distances;
}

/**
 * Compute signed distance field using JFA
 * 
 * @param {Uint8Array} mask - Binary mask (non-zero = inside shape)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Float32Array} Signed distance field (negative inside)
 */
export function jfaSignedDistanceField(mask, width, height) {
    // Distance from outside to inside (boundary of mask)
    const insideSeeds = jumpFloodAlgorithm(mask, width, height);
    const outsideDistances = jfaToDistanceField(insideSeeds, width, height);
    
    // Distance from inside to outside (inverse mask)
    const inverseMask = new Uint8Array(mask.length);
    for (let i = 0; i < mask.length; i++) {
        inverseMask[i] = mask[i] > 0 ? 0 : 255;
    }
    const outsideSeeds = jumpFloodAlgorithm(inverseMask, width, height);
    const insideDistances = jfaToDistanceField(outsideSeeds, width, height);
    
    // Combine: negative inside, positive outside
    const sdf = new Float32Array(width * height);
    for (let i = 0; i < mask.length; i++) {
        if (mask[i] > 0) {
            sdf[i] = -insideDistances[i];
        } else {
            sdf[i] = outsideDistances[i];
        }
    }
    
    return sdf;
}

/**
 * Compute Voronoi diagram from JFA
 * 
 * @param {Array<{x: number, y: number, id: number}>} sites - Voronoi sites
 * @param {number} width - Output width
 * @param {number} height - Output height
 * @returns {Int32Array} Site ID at each pixel
 */
export function jfaVoronoi(sites, width, height) {
    // Initialize with site positions
    const seeds = new Int32Array(width * height * 3).fill(-1); // x, y, id
    
    for (const site of sites) {
        const x = Math.floor(site.x);
        const y = Math.floor(site.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const idx = y * width + x;
            seeds[idx * 3] = x;
            seeds[idx * 3 + 1] = y;
            seeds[idx * 3 + 2] = site.id;
        }
    }
    
    // JFA passes
    const maxDim = Math.max(width, height);
    let step = 1;
    while (step * 2 <= maxDim) step *= 2;
    
    const offsets = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0],          [1, 0],
        [-1, 1],  [0, 1],  [1, 1]
    ];
    
    while (step >= 1) {
        const result = new Int32Array(seeds);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                let bestX = result[idx * 3];
                let bestY = result[idx * 3 + 1];
                let bestId = result[idx * 3 + 2];
                let bestDist = bestX >= 0 
                    ? (x - bestX) ** 2 + (y - bestY) ** 2 
                    : Infinity;
                
                for (const [dx, dy] of offsets) {
                    const nx = x + dx * step;
                    const ny = y + dy * step;
                    
                    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                    
                    const nidx = ny * width + nx;
                    const sx = seeds[nidx * 3];
                    const sy = seeds[nidx * 3 + 1];
                    const sid = seeds[nidx * 3 + 2];
                    
                    if (sx < 0) continue;
                    
                    const dist = (x - sx) ** 2 + (y - sy) ** 2;
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestX = sx;
                        bestY = sy;
                        bestId = sid;
                    }
                }
                
                result[idx * 3] = bestX;
                result[idx * 3 + 1] = bestY;
                result[idx * 3 + 2] = bestId;
            }
        }
        
        seeds.set(result);
        step = Math.floor(step / 2);
    }
    
    // Extract IDs only
    const voronoi = new Int32Array(width * height);
    for (let i = 0; i < width * height; i++) {
        voronoi[i] = seeds[i * 3 + 2];
    }
    
    return voronoi;
}

