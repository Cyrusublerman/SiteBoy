# Cellular Automaton

A cellular automaton (CA) is a discrete model of computation consisting of a grid of cells, each in one of a finite number of states, that evolves through discrete time steps according to local rules.

## Mathematical Definition

### Components

A cellular automaton is defined by the tuple $(Z^d, S, N, f)$:

- $Z^d$: d-dimensional lattice (grid)
- $S$: finite set of states (e.g., $\{0, 1\}$)
- $N$: neighborhood template
- $f: S^{|N|} \to S$: local transition function

### State Evolution

For cell $c$ at time $t+1$:

$$s_c^{t+1} = f(s_{c+n_1}^t, s_{c+n_2}^t, \ldots, s_{c+n_k}^t)$$

where $n_1, \ldots, n_k$ are the neighborhood offsets.

## Neighborhoods

### 1D Neighborhood

- **Elementary (r=1)**: 3 cells — left, center, right
- **Extended (r=2)**: 5 cells

### 2D Neighborhoods

**Von Neumann (4-connected):**
$$N = \{(0,0), (0,1), (0,-1), (1,0), (-1,0)\}$$

**Moore (8-connected):**
$$N = \{(i,j) : |i| \leq 1, |j| \leq 1\}$$

## Elementary Cellular Automata (1D)

### Wolfram Numbering

For 1D binary CA with radius 1, rule number $R \in [0, 255]$:

| Pattern | 111 | 110 | 101 | 100 | 011 | 010 | 001 | 000 |
|---------|-----|-----|-----|-----|-----|-----|-----|-----|
| Bit pos | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |

Next state for pattern $p$: $(R \gg p) \& 1$

### Notable Rules

| Rule | Behavior |
|------|----------|
| 30 | Chaotic, used in randomness |
| 90 | Sierpiński triangle |
| 110 | Turing complete |
| 184 | Traffic flow model |

## Conway's Game of Life

### Rules (B3/S23)

For Moore neighborhood sum $n$:

$$s^{t+1} = \begin{cases}
1 & \text{if } s^t = 0 \text{ and } n = 3 \text{ (birth)} \\
1 & \text{if } s^t = 1 \text{ and } n \in \{2, 3\} \text{ (survival)} \\
0 & \text{otherwise (death)}
\end{cases}$$

### Life-like Notation

- **B** (birth): neighbor counts that cause dead cell to become alive
- **S** (survival): neighbor counts that keep live cell alive

Examples:
- B3/S23: Conway's Life
- B36/S23: HighLife
- B3/S12345678: Maze

## Totalistic Rules

State depends only on sum of neighbor states:

$$s^{t+1} = f\left(\sum_{n \in N} s_n^t\right)$$

### Outer Totalistic

Sum excludes center cell; current state also considered.

## Multi-State CA

### Generations Rules

States: $S = \{0, 1, 2, \ldots, k-1\}$
- State 1: "alive" (follows Life-like rules)
- States 2 to k-1: "dying" (decay toward 0)
- State 0: "dead"

### Continuous-Value CA

States $s \in [0, 1]$, smooth update function:

$$s^{t+1} = \sigma\left(\sum_{n \in N} w_n \cdot s_n^t\right)$$

## Boundary Conditions

| Type | Definition |
|------|------------|
| Periodic (torus) | $s_{i+N} = s_i$ |
| Fixed | Border cells have constant state |
| Reflective | $s_{-i} = s_i$ |
| Absorbing | Border always dead |

## Applications

- Pattern formation
- Fluid dynamics (Lattice Boltzmann)
- Cryptography
- Random number generation
- Image processing
- Traffic simulation
- Biological modeling

## Implementation

```javascript
/**
 * Elementary CA (1D, Wolfram rule)
 * @param {Uint8Array} cells - Current state
 * @param {number} rule - Wolfram rule number (0-255)
 * @returns {Uint8Array} Next state
 */
function elementaryCA(cells, rule) {
    const n = cells.length;
    const next = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
        const left = cells[(i - 1 + n) % n];
        const center = cells[i];
        const right = cells[(i + 1) % n];
        const pattern = (left << 2) | (center << 1) | right;
        next[i] = (rule >> pattern) & 1;
    }
    return next;
}

/**
 * Game of Life step (2D Moore neighborhood)
 * @param {Uint8Array} grid - Flat array, row-major
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @returns {Uint8Array} Next state
 */
function gameOfLifeStep(grid, width, height) {
    const next = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let neighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = (x + dx + width) % width;
                    const ny = (y + dy + height) % height;
                    neighbors += grid[ny * width + nx];
                }
            }
            const idx = y * width + x;
            const alive = grid[idx];
            next[idx] = (neighbors === 3 || (neighbors === 2 && alive)) ? 1 : 0;
        }
    }
    return next;
}
```

## See Also

- Reaction-diffusion systems
- Lattice gas automata
- Agent-based models
- Turing patterns

