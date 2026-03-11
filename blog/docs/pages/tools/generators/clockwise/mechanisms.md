# Clockwise — Mechanisms

Mathematical model class: polar coordinate orbital mechanics combined with discrete two-field cellular diffusion (reaction-diffusion class).

---

## State Model

| Variable | Type | Holds | Initialised | Mutates | Reset trigger |
| --- | --- | --- | --- | --- | --- |
| `_squares` | Array of square objects | N square objects; each contains `id`, `startAngle`, `resolution`, `matrix` (resolution×resolution cell objects), `grid1`, `next1`, `grid2`, `next2`, `bias` | `p5Setup` / rebuild | `grid1`, `grid2`, and each cell's `cartesian` position mutate every frame; `lastSwap` mutates on swap events | `numSquares` or `orbitRadius` change (via `_needsRebuild`) |
| `_collisionMap` | Array (1,166,400) | Flat 1D pixel-to-occupant map: element i holds `{sq, gx, gy}` or `null` for canvas pixel index `sy × 1080 + sx` | `p5Setup` (new Array(1166400).fill(null)) | Cleared entirely to null each frame, populated during geometry pass | `numSquares` or `orbitRadius` change |
| `_globalOrbitAngle` | number (radians) | Accumulated orbit rotation; advances by `radians(orbitSpeed) × orbitDirMul` each frame | `p5Setup` (0) | Every frame | Reset to 0 on rebuild |
| `_globalSpinAngle` | number (radians) | Accumulated self-rotation; advances by `radians(spinSpeed)` each frame | `p5Setup` (0) | Every frame | Reset to 0 on rebuild |
| `_lastParams` | object | Shallow copy of `params` at most recent build; compared each frame for rebuild detection | `p5Setup` | Reassigned on every rebuild | On rebuild |

### Cell object structure (per entry in `matrix[x][y]`)

Each cell holds:
- `polar`: `{r, theta}` — polar coordinates relative to square centre (set at build time, immutable)
- `gridX, gridY`: grid indices
- `cartesian`: `{x, y}` — world canvas position (recomputed each frame)
- `centroid`: `{x, y}` — unused placeholder
- `color`: `{h, s, b}` — unused placeholder (actual colour computed inline during render)
- `lastSwap`: frame number of last field swap (initialised to -1000; updated on collision swap)
- `drawSize`: render size in pixels (set at build time; `max(1.25, cellSize × 1.15)`)

---

## Function Inventory

| Function | Role | Inputs | Output | Complexity |
| --- | --- | --- | --- | --- |
| `_needsRebuild(params)` | Determines whether a structural rebuild is required | `params` object | `boolean` — true if `numSquares` or `orbitRadius` differs from `_lastParams` | O(1) |
| `_buildSquares(p, params)` | Constructs the full squares array from scratch: computes chord geometry, resolution, cell size, per-cell polar coordinates, and initialises physics grids | `p` (p5 instance), `params` | `Array` of square objects | O(N × res²) where N = `numSquares`, res = `resolution` |
| `_getAvg(g, x, y, res, wrap)` | Computes the arithmetic mean of a 3×3 neighbourhood in grid `g` at cell (x,y), with optional toroidal wrap | `g` (2D array), `x, y` (indices), `res` (grid size), `wrap` (boolean) | `number` — neighbourhood mean | O(9) = O(1) |
| `_sampleDiff(g, x, y, res, wrap)` | Computes weighted mean of absolute differences between cell (x,y) and its 8 neighbours; cardinal neighbours weight 1.0, diagonal neighbours weight 0.5 | Same signature as `_getAvg` | `number` — weighted mean difference ≥ 0 | O(8) = O(1) |
| `_updatePhysics(sq, params)` | Advances both `grid1` (pulse) and `grid2` (hue) of one square by one step using the diffusion equation; swaps active and buffer arrays at the end | `sq` (square object), `params` | void; mutates `sq.grid1`, `sq.grid2`, `sq.next1`, `sq.next2` | O(res²) |
| `p5Setup(p, params)` | Initialises p5 rendering state (HSB colour mode, noStroke, noSmooth, noLoop), builds squares, allocates collision map, resets global angles | `p`, `params` | void | O(N × res²) |
| `p5Draw(p, params, frame)` | Per-frame entry point: rebuild check, angle advances, collision map clear, geometry + collision detection + field swaps, physics update, render | `p`, `params`, `frame` | void | O(N × res²) dominant; plus O(1,166,400) for map clear |

---

## Mathematical Model

**Orbit angle step:**
`angleStep = 2π / numSquares`

where:
- `angleStep` — arc angle in radians between adjacent squares' starting positions; radians
- `numSquares` — count of orbiting squares; integer, range [2, 12]; from `params.numSquares`

**Chord length:**
`chordLen = 2 × orbitRadius × sin(angleStep / 2)`

where:
- `chordLen` — straight-line distance between adjacent orbit positions; pixels
- `orbitRadius` — radius of the orbit circle; pixels, range [100, 540]; from `params.orbitRadius`

**Square side length:**
`sideLength = round((2√2 × chordLen) / 3)`

where:
- `sideLength` — pixel side length of each square; pixels

**Grid resolution (clamped):**
`resolution = clamp(round(sideLength / 3), 48, 180)`

where:
- `resolution` — cell count per side of the square grid; integer, range [48, 180]
- `cellSize = sideLength / resolution` — pixel width/height of each cell; pixels

**Cell local polar coordinates (build time):**
`lx = (x − offset + 0.5) × cellSize`, `ly = (y − offset + 0.5) × cellSize`
`r = √(lx² + ly²)`, `θ₀ = atan2(ly, lx)`

where:
- `x, y` — grid column and row indices, range [0, resolution)
- `offset = resolution / 2` — shifts grid origin to square centre
- `r` — distance from square pivot to cell centre; pixels (immutable after build)
- `θ₀` — base polar angle of cell relative to square pivot; radians (immutable after build)

**Square orbit position (per frame):**
`curAngle = startAngle + globalOrbitAngle`
`cx = 540 + orbitRadius × cos(curAngle)`
`cy = 540 + orbitRadius × sin(curAngle)`

where:
- `startAngle = i × angleStep` — initial orbit angle for square i; radians
- `cx, cy` — canvas pixel position of square pivot; pixels

**Cell world position (per frame):**
`theta = θ₀ + globalSpinAngle`
`worldX = cx + r × cos(theta)`
`worldY = cy + r × sin(theta)`

where:
- `theta` — effective polar angle after accumulated spin; radians
- `worldX, worldY` — cell centre in canvas coordinates; pixels

**Pulse field update (grid1, per cell per frame):**
`next1[x][y] = (v1 + (avg1 − v1) × cohesion + diff1 × growthFactor × damping) × waveDecay`

where:
- `v1` — current pulse value at (x,y); dimensionless, nominally [0,1] but not clamped in physics
- `avg1` — 3×3 neighbourhood mean from `_getAvg`; dimensionless
- `diff1` — weighted neighbourhood absolute-difference mean from `_sampleDiff`; dimensionless, ≥ 0
- `cohesion = 0.1` — hardcoded convergence rate toward neighbourhood mean; dimensionless
- `growthFactor` — diffusion amplifier; dimensionless, range [0.5, 5]; from `params.growthFactor`
- `damping` — scales diffusion contribution alongside growthFactor; dimensionless, range [0.01, 0.5]; from `params.damping`
- `waveDecay` — per-step energy decay multiplier for pulse; dimensionless, range [0.8, 0.99]; from `params.waveDecay`

**Precision note:** grid1 values are not clamped in the physics step. At `growthFactor=5, damping=0.5`, the diffusion term `diff1 × 2.5` can push values above 1 or below 0. These values propagate into next-frame physics. The render-time clamp `Math.max(0, Math.min(1, pulse))` protects display only.

**Hue field update (grid2, per cell per frame):**
`phys = ((v2 + (avg2 − v2) × cohesion + diff2 × growthFactor × damping) mod 1.0 + 1.0) mod 1.0`
`next2[x][y] = phys + (bias − phys) × identityForce`

where:
- `v2` — current hue value at (x,y); normalised [0,1]
- `avg2`, `diff2` — neighbourhood mean and difference for grid2
- `phys` — diffused hue after wrapping to [0,1] via double modulo (handles negative wraparound)
- `bias = i / numSquares` — target hue anchor for square i; range [0, 1); evenly distributed
- `identityForce` — pull rate toward identity hue; dimensionless, range [0, 0.1]; from `params.identityForce`

**Rendering (per cell):**
`H = hue × 360` — normalised hue [0,1] to HSB degrees [0, 360]
`B = map(pulse, 0, 1, 100, 50)` — pulse maps to brightness 100 (pulse=0) to 50 (pulse=1); p5 map function
`drawSize = max(1.25, cellSize × 1.15)` — render size 15% larger than cell to minimise gaps; pixels

where:
- `hue = sq.next2[x][y]` — post-swap buffer value (pre-physics; see bug note in `issues-and-conflicts.md`)
- `pulse = sq.next1[x][y]` — post-swap buffer value (pre-physics; same note)
- S (saturation) fixed at 90 in all renders

**Precision note:** `_globalOrbitAngle` and `_globalSpinAngle` accumulate without bound. After 360/orbitSpeed frames the orbit completes one revolution. No periodic reset is applied. At 30fps and orbitSpeed=5, after 100 seconds = 3000 frames, `_globalOrbitAngle ≈ 3000 × radians(5) ≈ 261.8 radians`. Floating-point precision of `cos` and `sin` remains adequate at this scale.

---

## Render Loop Order

`p5Draw(p, params, frame)` executes in this order:

1. Call `_needsRebuild(params)`: if true, call `_buildSquares(p, params)`, assign a fresh `new Array(1166400).fill(null)` to `_collisionMap`, reset `_globalOrbitAngle = 0`, `_globalSpinAngle = 0`, assign `_lastParams = {...params}`
2. Compute `orbitDirMul`: `'CCW'` → -1, `'CW'` → +1
3. `_globalSpinAngle += p.radians(spinSpeed)`
4. `_globalOrbitAngle += p.radians(orbitSpeed) × orbitDirMul`
5. Clear `_collisionMap`: for-loop sets all 1,166,400 entries to `null`
6. For each square (in array order):
   a. Compute `curAngle = sq.startAngle + _globalOrbitAngle`; derive `cx, cy`
   b. For each cell `(x, y)`: compute `theta = polar.theta + _globalSpinAngle`; compute `worldX, worldY`; snap to integer pixel `sx, sy`
   c. If `sx, sy` in canvas bounds: check `map[sy × 1080 + sx]`
      - If `null`: write `{sq, gx: x, gy: y}`
      - If occupied by a different square AND both `lastSwap` are >`swapCooldown` frames old: swap `grid1[x][y]` and `grid1[other.gx][other.gy]`; swap `grid2[x][y]` and `grid2[other.gx][other.gy]`; set both `lastSwap = frame`
7. `p.background(0)` — clear canvas to black
8. For each square: call `_updatePhysics(sq, params)` (advances physics, swaps buffers); then for each cell `(x, y)`: read `sq.next1[x][y]` (pulse) and `sq.next2[x][y]` (hue) — these are the PRE-physics values after buffer swap; compute H, B; call `p.fill(H, 90, B)`; call `p.rect(...)`

---

## Rebuild Mechanism

Detection: `_needsRebuild(params)` returns true when `params.numSquares !== _lastParams.numSquares || params.orbitRadius !== _lastParams.orbitRadius`.

On rebuild: `_buildSquares` recomputes all chord geometry, sideLength, resolution, cellSize, and per-cell polar coordinates. Physics grids are reinitialised (`grid1` to all-zeros, `grid2` to all-`bias`). `_collisionMap` is reallocated. `_globalOrbitAngle` and `_globalSpinAngle` reset to 0, causing a visible position jump.

| Parameter | Rebuild? | Why |
| --- | --- | --- |
| `numSquares` | Yes | Changes angleStep, chord, sideLength, resolution, number of squares |
| `orbitRadius` | Yes | Changes chord, sideLength, resolution, cell size |
| `orbitSpeed` | No | Applied live to `_globalOrbitAngle` accumulator |
| `spinSpeed` | No | Applied live to `_globalSpinAngle` accumulator |
| `orbitDir` | No | `orbitDirMul` computed live from string value |
| `growthFactor` | No | Read directly in `_updatePhysics` |
| `damping` | No | Read directly in `_updatePhysics` |
| `waveDecay` | No | Read directly in `_updatePhysics` |
| `identityForce` | No | Read directly in `_updatePhysics` |
| `swapCooldown` | No | Read directly in collision detection |
| `wrapAround` | No | Read directly in `_updatePhysics` and neighbourhood helpers |
