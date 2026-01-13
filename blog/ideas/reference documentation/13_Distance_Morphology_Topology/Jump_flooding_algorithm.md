# Jump Flooding Algorithm

The Jump Flooding Algorithm (JFA) is a parallel algorithm for computing approximate Voronoi diagrams and distance transforms on a discrete grid. It is particularly efficient on GPUs due to its highly parallel nature.

## Mathematical Definition

### Problem

Given a grid of size $N \times N$ with a set of seed points $S$, compute for each cell:
- The nearest seed point
- The distance to that seed

### Algorithm

JFA operates in $\log_2(N)$ passes. In pass $k$, each cell examines neighbors at step size $2^{\lfloor\log_2(N)\rfloor - k}$.

### Passes

For a grid of size $N = 2^n$:

1. **Step sizes**: $N/2, N/4, N/8, \ldots, 2, 1$
2. **Neighbors per step**: 8 (or 9 including self)
3. **Total passes**: $\lceil\log_2(N)\rceil$

### Update Rule

For cell $(i, j)$ at step size $s$:

```
for dx in {-s, 0, s}:
    for dy in {-s, 0, s}:
        neighbor = (i + dx, j + dy)
        if distance(cell, seed[neighbor]) < distance(cell, seed[cell]):
            seed[cell] = seed[neighbor]
```

## Distance Functions

### Euclidean Distance

$$d(p_1, p_2) = \sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$$

### Squared Euclidean (Preferred)

$$d^2(p_1, p_2) = (x_1 - x_2)^2 + (y_1 - y_2)^2$$

Avoids square root computation; same ordering.

### Manhattan Distance

$$d(p_1, p_2) = |x_1 - x_2| + |y_1 - y_2|$$

### Chebyshev Distance

$$d(p_1, p_2) = \max(|x_1 - x_2|, |y_1 - y_2|)$$

## Variants

### JFA+1 and JFA+2

Add additional passes with step size 1 (and 2) at the end to improve accuracy:

- **JFA**: Standard algorithm
- **JFA+1**: Add one pass with $s=1$
- **JFA+2**: Add passes with $s=2$ and $s=1$

### 1+JFA

Start with a pass of $s=1$ before the standard sequence.

### Adaptive JFA

Dynamically adjust neighborhood based on local density of seeds.

## Properties

| Property | Value |
|----------|-------|
| Time complexity | $O(N^2 \log N)$ |
| Space complexity | $O(N^2)$ |
| Parallelism | High (GPU-friendly) |
| Accuracy | Approximate (rarely incorrect) |
| Error rate | <1% typically |

## Comparison with Other Methods

| Method | Time | Accuracy | GPU-friendly |
|--------|------|----------|--------------|
| Brute force | $O(N^2 \cdot |S|)$ | Exact | No |
| JFA | $O(N^2 \log N)$ | ~99% | Yes |
| Chamfer | $O(N^2)$ | Approximate | No |
| EDT (exact) | $O(N^2)$ | Exact | Limited |

## Applications

- Distance transforms
- Voronoi diagrams
- Signed distance fields (SDF)
- Image segmentation
- GPU-based rendering
- Collision detection
- Path planning

## Implementation

```javascript
/**
 * Jump Flooding Algorithm for distance transform
 * @param {Int32Array} seedX - X coordinates of nearest seed per cell
 * @param {Int32Array} seedY - Y coordinates of nearest seed per cell
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 */
function jumpFloodingAlgorithm(seedX, seedY, width, height) {
    const size = Math.max(width, height);
    let step = Math.pow(2, Math.floor(Math.log2(size)));
    
    // Temporary buffers for ping-pong
    const tempX = new Int32Array(width * height);
    const tempY = new Int32Array(width * height);
    
    while (step >= 1) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                let bestX = seedX[idx];
                let bestY = seedY[idx];
                let bestDist = distanceSquared(x, y, bestX, bestY);
                
                // Check 8 neighbors at step distance
                for (let dy = -step; dy <= step; dy += step) {
                    for (let dx = -step; dx <= step; dx += step) {
                        if (dx === 0 && dy === 0) continue;
                        
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                        
                        const nidx = ny * width + nx;
                        const candX = seedX[nidx];
                        const candY = seedY[nidx];
                        
                        if (candX < 0) continue; // No seed assigned
                        
                        const dist = distanceSquared(x, y, candX, candY);
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestX = candX;
                            bestY = candY;
                        }
                    }
                }
                
                tempX[idx] = bestX;
                tempY[idx] = bestY;
            }
        }
        
        // Copy back
        seedX.set(tempX);
        seedY.set(tempY);
        
        step = Math.floor(step / 2);
    }
}

/**
 * Initialize JFA with seed points
 * @param {Array<{x: number, y: number}>} seeds - Seed point coordinates
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @returns {{seedX: Int32Array, seedY: Int32Array}}
 */
function initializeJFA(seeds, width, height) {
    const seedX = new Int32Array(width * height).fill(-1);
    const seedY = new Int32Array(width * height).fill(-1);
    
    for (const seed of seeds) {
        const x = Math.floor(seed.x);
        const y = Math.floor(seed.y);
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const idx = y * width + x;
            seedX[idx] = x;
            seedY[idx] = y;
        }
    }
    
    return { seedX, seedY };
}

/**
 * Extract distance field from JFA result
 * @param {Int32Array} seedX
 * @param {Int32Array} seedY
 * @param {number} width
 * @param {number} height
 * @returns {Float32Array} Distance values
 */
function extractDistanceField(seedX, seedY, width, height) {
    const distance = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const sx = seedX[idx];
            const sy = seedY[idx];
            distance[idx] = sx < 0 ? Infinity : Math.sqrt(distanceSquared(x, y, sx, sy));
        }
    }
    
    return distance;
}

function distanceSquared(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
}
```

## GPU Implementation Notes

For WebGL/GLSL:
1. Store seed coordinates in texture (RG = x, y)
2. Ping-pong between two framebuffers
3. Each pass is a single draw call
4. Fragment shader performs neighbor comparison

## See Also

- Voronoi diagram
- Distance transform
- Signed distance function
- Fortune's algorithm

