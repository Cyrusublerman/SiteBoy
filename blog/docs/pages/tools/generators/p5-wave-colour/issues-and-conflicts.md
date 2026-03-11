# Wave Colour — Issues and Conflicts

## ERROR

None.

## WARN

**[BUG] Operator evolution is non-deterministic**
`_pickNextOp` uses `Math.random()` to select the next operator when a transition completes. Two runs from the same frame start will diverge at the first operator transition. Pre-render output is not reproducible; pre-render frames captured at one time will not match a live replay.
Fix: Use a seeded PRNG (e.g., `mulberry32` with `frame`-derived seed) instead of `Math.random()`.

**[BUG] `animation.loopFrames` conflicts with `cycleFrames`**
`animation.loopFrames = 3600` static; `cycleFrames` user slider (360–7200). Host pre-render uses the static value. Same issue as `golden-grid`, `order-disorder`, `curtain-morph`.

**[STANDARDS] Preset format non-standard**
Flat objects without `values: { ... }` wrapper.

**[STANDARDS] No `export` block**
No PNG/GIF/WebM export available.

**[STANDARDS] State stored on `SCRIPT_CONFIG` object**
`_opStates`, `_lastOpSpeeds` mutated via `this.*`. Same issue as all prior P5 generators.

**[PERFORMANCE] `_normalAt` makes 4× `_process` calls per pixel**
5× total `_process` per pixel (1 for colour, 4 for normal). Normal estimation accounts for 80% of per-pixel compute cost. At `resolution=2`: ~63M of the ~79M total ops/frame are from normal estimation.
Optimisation: cache `_process` result for `(x,y)` and reuse for centre in `_normalAt`; reduce to 4 total (saving 1 call). Further: offer a "flat" shading mode that skips normals entirely for 5× speed increase.

**[PERFORMANCE] Main-thread pixel computation is too slow for 60fps**
At `resolution=2`, ~79M arithmetic ops/frame including transcendental functions. Expected real-time performance: 5–15 fps on modern desktop hardware. Not suitable for interactive use at full quality. Worker offload is the primary mitigation (see performance.md).

## NOTE

**[DESIGN] `opSpeed` change triggers full `_initOpStates` reset**
When any of the 4 `opSpeed` params changes, `_initOpStates` re-randomises all 4 operator states. A visual discontinuity will occur. This is not user-visible as a warning. Consider a smoother per-operator speed update that doesn't randomise current/next.

**[DESIGN] Reference vector `ref` is computed from a triangle traversal**
The triangle `{(540,54), (1026,1026), (54,1026)}` maps canvas coordinates to sphere coordinates. The mapping `theta = (sx/W) × 2π`, `phi = (sy/H) × π` applies a Mercator-like projection. The triangle is not a geodesic; the reference vector traces a non-great-circle path. This is visually smooth but physically non-uniform.

**[CORRECTNESS] `_normalAt` output formula**
`_normalAt` returns `(2×nz×nx, 2×nz×ny, 2×nz²−1)` — this is a reflection of the unit normal about the Z axis, equivalent to the half-vector formula in Phong shading. Not a standard surface normal. The intended use in `_toColor` (`normal.dot(ref)`) treats it as a dot-product shading factor, which is consistent, but the naming is misleading.
