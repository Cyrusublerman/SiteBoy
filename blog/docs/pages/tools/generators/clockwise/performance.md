# Clockwise — Performance

## Dominant Operation

The per-frame O(N × res²) double loop in `p5Draw` covering geometry updates, collision detection, physics, and rendering. At each cell, the render pass calls `p.rect()` once and the physics pass calls `_getAvg` (9 neighbours) and `_sampleDiff` (8 neighbours). The dominant total per-cell cost is the pair of neighbourhood scans in `_updatePhysics`.

Additionally, the collision map clear is O(1,166,400) every frame regardless of active cell count — a flat-array null-fill over the full 1080×1080 canvas.

---

## Complexity

`O(N × res²)` per frame where:
- `N` = `numSquares`, range [2, 12]
- `res` = grid resolution per square, derived from orbit geometry, range [48, 180]

`res` is not directly user-settable. It is computed as `clamp(round(sideLength / 3), 48, 180)` where `sideLength` depends on both `numSquares` and `orbitRadius`.

The N × res² product is not monotone in `numSquares`: more squares produce shorter chords and smaller squares (lower res). The empirical maximum occurs around `numSquares=6, orbitRadius=540`:

| numSquares | orbitRadius | res | N × res² |
| --- | --- | --- | --- |
| 2 | 540 | 180 | 64,800 |
| 4 | 540 | 180 | 129,600 |
| 6 | 540 | 169 | ~171,000 |
| 8 | 540 | 130 | ~135,000 |
| 12 | 540 | 88 | ~92,900 |

Per-cell work in `_updatePhysics`: 2 × (`_getAvg` + `_sampleDiff`) = 2 × (9 + 8) = 34 neighbour array reads per cell.
Total neighbour reads at peak (N=6, res=169): 171,000 × 34 ≈ 5.8M per frame.

Total `p.rect()` calls at peak: 171,000 per frame. At 30fps: ~5.1M draw calls per second.

Collision map clear: 1,166,400 null assignments per frame, fixed cost.

---

## Extreme Parameter Values

- `numSquares=2, orbitRadius=540` — resolution reaches 180 (maximum). Each of the 2 squares has 32,400 cells. This minimises N but maximises res², giving 64,800 cell operations. The two large squares occupy most of the canvas, maximising overlap area and swap frequency.

- `numSquares=6, orbitRadius=540` — empirical worst case for N × res²: approximately 171,000 cell updates per frame. This is the highest combined load for both physics and rendering.

- `growthFactor=5, damping=0.5` — effective diffusion coefficient 2.5; the diffusion term `diff1 × 2.5` can exceed 1 for cells in high-gradient zones, pushing grid1 values outside [0,1]. This does not crash the simulation (values are clamped at render time) but produces numerical instability in the physics buffer across frames.

- `swapCooldown=5` — minimum gate (5 frames at 30fps ≈ 0.17s). In persistent overlap zones, cells swap on every available frame, maximising field mixing rate and potentially causing flicker.

- `wrapAround='on'` at `res=180` — all 9 neighbours are valid for every cell (no boundary truncation), so `_getAvg` and `_sampleDiff` always iterate the full 9-cell and 8-cell sets. This is the higher-cost path vs. `'off'` (boundary cells have fewer valid neighbours).

---

## Frame Budget

`defaultFps = 30` → budget = 1000/30 ≈ **33.3ms per frame**.

At the peak load (N=6, res=169, 171,000 cells):
- Physics pass: ~171,000 × 34 ≈ 5.8M array reads + arithmetic. In a modern V8 engine on a mid-range machine this is typically 5–15ms.
- Collision map clear: ~1.17M null assignments. Typically 1–3ms.
- Geometry pass: ~171,000 trig evaluations (cos, sin) + pixel snaps. Typically 3–8ms.
- Render pass: ~171,000 p.rect() calls through p5's draw pipeline. This is usually the dominant wall-clock cost; p5's per-call overhead makes 171K calls expensive — typically 10–20ms on a mid-range machine.

Total estimated: **19–46ms at peak load**. Frame drops likely at N=6, orbitRadius=540 on lower-end hardware.

At default settings (N=8, res≈130, ~135,000 cells): estimated 15–35ms — borderline at 30fps on mid-range hardware.

---

## Web Worker Feasibility

**Blocked by p5 instance dependency.** The render pass (`p.fill`, `p.rect`, `p.background`) requires the `p` (p5 instance) object, which is bound to the main-thread canvas. p5 cannot be used in a Worker without OffscreenCanvas support, which p5 does not natively support in this version.

**Physics is separable.** The `_updatePhysics` logic (grid1, grid2 diffusion) and the collision detection (field swap logic) operate purely on the squares' data arrays with no p5 dependency. These could be offloaded to a Worker using `SharedArrayBuffer` (for the grid arrays) or by posting/receiving the grid data each frame via transferable ArrayBuffers.

**Mitigation path:** refactor physics and geometry into a Worker that posts updated grid values and cell world positions back to the main thread each frame; the main thread renders from the received data using p5's draw calls.

---

## Mitigation Candidates

- **Sparse collision map:** replace `new Array(1166400).fill(null)` with a `Map<number, {sq, gx, gy}>` keyed by pixel index. Clear by iterating only populated entries (O(active cells) ≈ O(N × res²)) rather than O(1.17M).

- **Batch rendering via putImageData:** write computed pixel colours directly to a pixel buffer (Uint8ClampedArray) and push once per frame with `ctx.putImageData`. Eliminates ~171,000 individual draw-call overheads. Requires switching from p5's draw pipeline or using p5's `pixels` array.

- **Physics Worker with SharedArrayBuffer:** run the full `_updatePhysics` and collision detection on a Worker thread, post the updated grid1/grid2 arrays back to the main thread for rendering. Physics and geometry are p5-independent.

- **Adaptive resolution cap:** expose a `resolution` parameter that overrides the derived value, allowing users to trade visual quality for frame rate.

- **Pre-allocated collision list:** instead of a flat pixel map, maintain a per-frame list of squares' active pixel positions and detect overlaps via a sorted-list intersection, reducing the O(1.17M) map clear to O(N × res²) list operations.
