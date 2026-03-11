# Solar System — Performance

## Dominant Operation

The `drawAsteroidBelt` function: O(count) canvas `fillRect` calls per frame, where `count = params.asteroidCount`, range [100, 1000]. On first call after regeneration, additionally O(count) `scaleDistance` computations to build the position cache. Planet computation (8 planets) is O(1) per frame after position caching.

---

## Complexity

`O(count)` per frame where `count = asteroidCount`, range [100, 1000].

Planet rendering: O(8) = O(1) per frame. Each planet call to `computePlanetPosition` is O(1) per planet (cached when T is unchanged between frames; recomputed at most once per second at defaultFps=1).

Kepler solver: O(iter) ≤ O(30) per planet per T update. In practice 3–5 Newton-Raphson iterations. Total per second update cycle: O(8 × 5) = O(40) — negligible.

Asteroid belt: O(count) `fillRect` calls every frame (screen positions are cached, so no trig per frame after initial build). At maximum (count=1000) and defaultFps=1: 1000 fillRect calls per frame.

---

## Extreme Parameter Values

- `asteroidCount=1000` — 1000 individual `fillRect(x, y, 1, 1)` calls per frame. Cache eliminates recomputation but does not batch the draw calls. At defaultFps=1 this is manageable; if the host were to increase fps, this would scale linearly.

- `distanceScale=0.8` — spreads orbits closer to canvas edges. No performance impact; changes only the `distScale` multiplier applied to cached positions.

- `planetScale=3.0` — triples all planet disc radii. No performance impact; changes the radius argument to `ctx.arc()` only.

- `showLabels=true` + `showInfo=true` — adds 8 text-fill calls (labels) and 2 text-fill calls (info). Canvas text render is typically more expensive than rect fill per call but the count is too small (10 calls) to be significant.

---

## Frame Budget

`defaultFps = 1` → budget = **1000ms per frame** (one second).

At this extreme frame period, performance is not a concern. The dominant actual wall-clock cost per frame is the 1000 `fillRect` calls at maximum asteroid count — estimated at well under 1ms at any modern engine.

The Kepler solver fires once per second (on T change) for all 8 planets. At 5 iterations per planet: 40 Newton-Raphson steps. Estimated: under 0.1ms.

The `fetch()` call to ipapi.co fires once per module load (not per frame) and is asynchronous. It does not block the frame budget.

If the animation were driven at 60fps (not the declared default), the dominant cost would shift to asteroid fillRect calls at count=1000: 60,000 fillRect calls per second — still well within typical browser budget.

---

## Web Worker Feasibility

**Feasible with caveats.** This is a 2D canvas generator (no p5 dependency). The render loop uses the `ctx` (Canvas2DRenderingContext) directly. With OffscreenCanvas, the entire `draw()` function could be transferred to a Worker.

**Blocking dependencies for Worker transfer:**
- `fetch()` in `requestLocation()` — available in Workers; not a blocking dependency.
- `Date.now()` — available in Workers; not a blocking dependency.
- `ctx` (Canvas2D) — requires OffscreenCanvas in the Worker, which the host would need to set up via `canvas.transferControlToOffscreen()`.

**Architecture note:** the module-level state (`planets`, `asteroidParticles`, etc.) would need to live inside the Worker scope. This is achievable but requires refactoring the state model to not rely on module-level closure.

---

## Mitigation Candidates

- **Batch asteroid rendering via ImageData:** pre-render asteroid positions into a Uint8ClampedArray pixel buffer and push once with `ctx.putImageData()` — eliminates 1000 `fillRect` calls and replaces with a single buffer write. The asteroid belt is monochrome (white/grey 1px dots), making this straightforward.

- **Position caching already implemented:** `asteroidCached` stores screen coordinates after initial computation; `planet.cachedPos` caches per T value. These are appropriate and sufficient for the defaultFps=1 target.

- **Kepler solver escalation:** `solveKeplerEquation` is a candidate for the shared algorithm library (see `issues-and-conflicts.md`). Not a performance concern at 8 planets, but library extraction would enable reuse.

- **No mitigation needed at current fps:** at defaultFps=1, the generator is effectively idle between frames. Performance optimisation is only relevant if the host applies a higher frame rate override.
