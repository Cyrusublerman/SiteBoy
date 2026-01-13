# Truchet Tiles

Truchet tiles are square tiles decorated with patterns that create complex visual effects when arranged together. Named after Sébastien Truchet (1704), who studied permutations of square tiles divided diagonally.

## Mathematical Definition

### Basic Truchet Tile

A square tile divided by a diagonal into two triangles of different colors. Each tile has 4 possible orientations (rotations of 0°, 90°, 180°, 270°).

### Tile State

For a grid position $(i, j)$, the tile state $s_{i,j} \in \{0, 1, 2, 3\}$ determines rotation:

$$\theta = s_{i,j} \cdot \frac{\pi}{2}$$

### Quarter-Circle Truchet (Smith Tiles)

Cyril Stanley Smith (1987) introduced tiles with quarter circles in opposite corners:

**Tile A**: Arcs in top-left and bottom-right corners
**Tile B**: Arcs in top-right and bottom-left corners

Binary choice $s_{i,j} \in \{0, 1\}$ at each cell.

### Arc Parametrization

For cell at $(i, j)$ with size $d$:

**If $s_{i,j} = 0$ (Tile A):**
- Arc 1: center $(i \cdot d, j \cdot d)$, radius $d/2$, angles $[0, \pi/2]$
- Arc 2: center $((i+1) \cdot d, (j+1) \cdot d)$, radius $d/2$, angles $[\pi, 3\pi/2]$

**If $s_{i,j} = 1$ (Tile B):**
- Arc 1: center $((i+1) \cdot d, j \cdot d)$, radius $d/2$, angles $[\pi/2, \pi]$
- Arc 2: center $(i \cdot d, (j+1) \cdot d)$, radius $d/2$, angles $[3\pi/2, 2\pi]$

## Variants

### Multi-Scale Truchet

Recursive subdivision where larger tiles contain smaller Truchet patterns:

$$s_{i,j}^{(k)} = f(s_{i/2,j/2}^{(k-1)}, i \mod 2, j \mod 2)$$

### Colored Truchet

Multiple colors or gradients assigned based on:
- Tile state
- Position $(i, j)$
- Random/noise function

### 3D Truchet

Extends to cubic tiles with corner connectivity patterns.

## State Assignment Methods

### Random

$$s_{i,j} = \text{hash}(i, j, \text{seed}) \mod 2$$

### Noise-Based

$$s_{i,j} = \lfloor \text{noise}(i \cdot f, j \cdot f) \cdot 2 \rfloor$$

### Image-Driven

$$s_{i,j} = \begin{cases} 0 & \text{if } I(i,j) < \tau \\ 1 & \text{otherwise} \end{cases}$$

### Maze Generation

Connected paths form when adjacent tiles share arc endpoints.

## Topological Properties

### Path Connectivity

Quarter-circle Truchet tiles always form closed loops when:
- Grid is finite with boundaries
- All paths connect to adjacent tile arcs

### Path Length

For an $n \times n$ grid with random tiling:
- Expected number of loops: $\approx n^2 / 4$
- Expected average loop length: $\approx 4$ tiles

## Applications

- Decorative patterns
- Procedural texture generation
- Maze generation
- Generative art
- Tile-based game design
- Labyrinth design

## Implementation

```javascript
/**
 * Generate Truchet tile pattern
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 * @param {number} seed - Random seed
 * @returns {number[][]} 2D array of tile states (0 or 1)
 */
function generateTruchetGrid(cols, rows, seed) {
    const grid = [];
    for (let j = 0; j < rows; j++) {
        grid[j] = [];
        for (let i = 0; i < cols; i++) {
            grid[j][i] = hash(i, j, seed) & 1;
        }
    }
    return grid;
}

/**
 * Get arc endpoints for a Truchet tile
 * @param {number} i - Column index
 * @param {number} j - Row index
 * @param {number} state - Tile state (0 or 1)
 * @param {number} size - Tile size in pixels
 * @returns {Array<{cx, cy, r, startAngle, endAngle}>}
 */
function getTruchetArcs(i, j, state, size) {
    const x = i * size;
    const y = j * size;
    const r = size / 2;
    
    if (state === 0) {
        return [
            { cx: x, cy: y, r, startAngle: 0, endAngle: Math.PI / 2 },
            { cx: x + size, cy: y + size, r, startAngle: Math.PI, endAngle: 3 * Math.PI / 2 }
        ];
    } else {
        return [
            { cx: x + size, cy: y, r, startAngle: Math.PI / 2, endAngle: Math.PI },
            { cx: x, cy: y + size, r, startAngle: 3 * Math.PI / 2, endAngle: 2 * Math.PI }
        ];
    }
}

/**
 * Simple hash function for tile state
 */
function hash(i, j, seed) {
    let h = seed;
    h = ((h ^ i) * 0x45d9f3b) >>> 0;
    h = ((h ^ j) * 0x45d9f3b) >>> 0;
    return h;
}
```

## See Also

- Wang tiles
- Penrose tiling
- Voronoi tessellation
- Cellular automata

