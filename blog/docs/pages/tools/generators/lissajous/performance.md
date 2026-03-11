# Lissajous Curves — Performance

## Dominant Operation

The O(points) loop in `draw()` evaluating `evaluate(t, params)` at each of `params.points` sample points. Each call to `evaluate` performs 8 trigonometric evaluations (cos/sin), up to 8 `safePow` calls (for signed power with p≠1), 2 multiplications for the modulation terms, and 2 more trig evaluations for rotation. Additionally, `ctx.lineTo(px, py)` is called once per point inside the path accumulation.

---

## Complexity

`O(points)` per frame where `points = params.points`, range [1000, 80000].

Per-point cost: approximately 10 trig evaluations + 8 Math.pow calls (when all exponents ≠ 1) + 2 rotation trig evaluations (recomputed every call — see performance risk) + arithmetic. Effectively constant per point.

At maximum `points=80000`: 80,000 × (~20 trig/pow) = ~1.6M floating-point operations per frame, plus 80,000 `ctx.lineTo` calls to accumulate the path.

---

## Extreme Parameter Values

- `points=80000` — maximum sample density. The 80,000-sample path accumulation and single `ctx.stroke()` call is the binding cost. On most hardware the path accumulation (JS loop) dominates over the GPU stroke render.

- `wx2=550, Ax2=-1` (Cubic Static preset) — 550hz component. At `points=40000` there are 40000/(2π) × (1/550) ≈ 11.6 samples per oscillation period at 550hz — marginally adequate for a closed-looking curve. Reducing points below 40,000 on this preset produces aliased artefacts.

- `px2=7` or `py2=7` — maximum power exponent. `safePow(|v|, 7)` for |v| ≤ 1 approaches 0 rapidly; for |v| = 1, returns exactly 1. No numerical instability risk. However, power exponents trigger the `safePow` path in `signedPow` (the p≈1 shortcut does not apply), adding a `Math.abs`, `Math.pow`, and `Math.sign` call per term.

- `px1=-7` or similar negative power — `safePow(|v|, -7)` produces very large values for small |v| (near a zero of the cosine). These off-screen points are included in the path but clipped by the canvas; they do not cause errors but add unnecessary lineTo segments far outside the viewport.

---

## Frame Budget

`defaultFps = 60` → budget = 1000/60 ≈ **16.7ms per frame**.

At default `points=20000`: 20,000 `evaluate()` calls. Estimated: 3–8ms in V8 on mid-range hardware.

At `points=40000` (high-frequency presets): 6–16ms — borderline at 60fps on lower-end hardware.

At `points=80000`: likely to exceed 16.7ms, dropping below 60fps on most hardware. The high-`points` presets target visual fidelity over frame rate.

---

## Web Worker Feasibility

**Feasible.** The `draw` function depends on the `ctx` (Canvas2DRenderingContext) argument for rendering, but all the computation in `evaluate()` is pure mathematics with no DOM or p5 dependency.

**Mitigation path:** compute all `{x, y}` point coordinates in a Worker (pure math, no canvas dependency), post the resulting typed array of coordinate pairs back to the main thread, and execute the `ctx.beginPath / moveTo / lineTo / stroke` sequence on the main thread. The path-building JS overhead (the lineTo loop) would remain on the main thread, but the `evaluate()` compute cost would shift to the Worker.

**Blocking dependency for full offload:** `ctx.beginPath`, `ctx.lineTo`, `ctx.stroke` require the main-thread canvas context. OffscreenCanvas can transfer `ctx` to a Worker entirely, enabling fully off-thread rendering.

---

## Mitigation Candidates

- **Precompute rotation trig once per frame:** `cos(rotation)` and `sin(rotation)` are computed inside `evaluate()` on every call, even though `rotation` is constant within a frame. Moving these two evaluations to `draw()` before the loop and passing them as arguments would eliminate `2 × points` redundant trig evaluations per frame.

- **Typed array for coordinates:** instead of calling `ctx.lineTo` inside the JS loop, collect all points into a `Float32Array` and use a single `ctx.moveTo` + loop-free path construction. This reduces per-iteration JS call overhead.

- **Skip off-screen points:** points with `|px| > W` or `|py| > H` by a large margin can be skipped with `ctx.moveTo` (restart path segment) rather than `ctx.lineTo`, avoiding long invisible strokes.

- **WebAssembly or Worker:** the inner `evaluate()` loop is computationally regular and a strong candidate for WASM acceleration or Worker parallelism via OffscreenCanvas.
