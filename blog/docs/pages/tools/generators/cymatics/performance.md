# Cymatics — Performance

## Dominant Operation

Density mode: O(W × H × N_sources) per frame — per-pixel wave sum across all sources. At 512×512, grid4 template (16 sources): 16 × 262,144 ≈ 4.19M wave evaluations per frame, each requiring a `sqrt` and a `sin` call.

Particle mode: O(N_particles × N_sources) per frame. At particleSpacing=2 (minimum): (512/2)² = 65,536 particles × 16 sources = 1.05M evaluations per frame.

Radial mode: O((W/2) × (H/2) × N_sources) per frame. At 512×512, res=2: 65,536 points × 16 sources = 1.05M evaluations per frame, plus O(65,536) arc draws for bright points.

---

## Complexity

`O(W × H × N_sources)` for density mode where:
- `W × H` = canvas area in pixels (default 512×512 = 262,144; max 1024×1024 = 1,048,576 if canvasWidth/Height were functional)
- `N_sources` = source count determined by template: triangle=3, circle6=6, circle12=12, grid3=9, grid4=16, star5=5, corners=4, cross=5

`O(N_particles × N_sources)` for particle mode where:
- `N_particles = floor(W/spacing) × floor(H/spacing)`; at spacing=5 on 512×512: ~10,486; at spacing=2: ~65,536

`O((W/res)² × N_sources)` for radial mode where:
- `res = 2` (hardcoded); effectively (W/2) × (H/2) points

---

## Extreme Parameter Values

- `template: grid4` — 16 sources; maximum source count of all templates. Density mode at 512×512: 4.19M evaluations/frame.

- `particleSpacing: 2` — maximum particle density: ~65,536 particles × N_sources evaluations per frame.

- `amplitude: 10` — maximum amplitude. At max amplitude, all particles displace far from rest; almost all alpha buckets filled (most particles visible); highest rendering load in particle mode.

- `boost: 10` — maximum gamma correction. `normalised^(1/10) = normalised^0.1` — nearly all mid-tones map to near-white. Most pixels rendered at full brightness; no computational cost change.

- `speed: 0.2` — maximum speed. Phase advances 0.2 × frame per frame. At 60fps: 0.2 × 60 = 12 radians per second of phase advance. No computational cost change.

---

## Frame Budget

`defaultFps = 60` → budget = 1000/60 ≈ **16.7ms per frame**.

Density mode, grid4 (16 sources), 512×512:
- 4.19M wave evaluations (each: 1 sqrt + 1 sin + ~5 arithmetic ops)
- `sqrt` and `sin`: typically 20–50ns each on V8
- Estimated: 4.19M × 2 × 30ns ≈ 251ms — **far exceeds 16.7ms budget**. Frame rate will drop to ~4fps at this extreme.

Density mode, triangle (3 sources), 512×512:
- 786,432 evaluations. Estimated: ~47ms — still exceeds 16.7ms; ~20fps expected.

Particle mode, spacing=5, triangle (3 sources):
- 10,486 × 3 = 31,458 evaluations. Estimated: <2ms — well within budget.

Particle mode, spacing=2, grid4 (16 sources):
- 65,536 × 16 = 1.05M evaluations. Estimated: ~63ms — exceeds budget; ~16fps.

The `compute` field on SCRIPT_CONFIG declares `cost: 'per-pixel', interactionScale: 0.5, idleDelay: 200` — these are hints for a ComputeScheduler that may reduce canvas resolution during slider interaction. This is a non-standard field; whether the host uses it is not guaranteed.

---

## Web Worker Feasibility

**Blocked for density and radial modes due to ImageData / ctx dependency in `drawDensity` and `drawRadial`.** Specifically:
- `ctx.createImageData(W, H)` — requires the canvas context
- `ctx.putImageData(imageData, 0, 0)` — requires the canvas context
- `ctx.beginPath(); ctx.arc(...)` — requires the canvas context

**Feasible with OffscreenCanvas:** if the host transfers canvas control to a Worker via `canvas.transferControlToOffscreen()`, the entire `draw()` function (including all canvas API calls) can run off-thread.

**Mitigation path:** separate computation from rendering. Compute the `intensities` Float32Array (the computationally expensive loop) in a Worker; post results back to main thread; main thread writes to ImageData and calls putImageData. The bottleneck (the evaluation loop) is pure math with no DOM dependency.

---

## Mitigation Candidates

- **Worker offload for intensity computation:** the inner loop in `drawDensity` (`for y ... for x ... for s: total += |getWave(x, y, t)|`) is pure mathematics with no DOM dependency. Move to Worker with SharedArrayBuffer for the Float32Array; main thread handles ImageData write and putImageData.

- **SIMD / typed arrays:** compute `distances` in a Float32Array once per frame (they are time-independent), then evaluate `sin(2π × distance / freq − t)` using precomputed distances. This eliminates the sqrt from the inner loop for all frames after the first (distances from source to pixel are constant for fixed source positions).

- **Phase-only update:** since source positions are fixed, distances from each source to each pixel never change. Precompute a `distances[sourceIdx][pixelIdx]` array at setup time. Each frame only needs to evaluate `sin(phase)` where `phase = 2π × dist / freq − t`. This converts per-frame computation from `O(N × sqrt × sin)` to `O(N × sin)` — roughly 2× speedup.

- **Reduce particle count at startup:** expose `particleSpacing` as a rebuilt parameter (see rebuild bug) so users can reduce particle count for smoother performance at high source counts.
