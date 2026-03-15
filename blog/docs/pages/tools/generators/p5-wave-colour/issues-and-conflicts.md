# Wave Colour — Issues and Conflicts

## ERROR

None.

## WARN

**[RESOLVED]** **[BUG] Operator evolution is non-deterministic**
`_pickNextOp` now uses Wang-hash seeded PRNG `_seededRand(seed)` with seed derived from `operatorIndex × 100000 + transitionCount`. Operator sequences are fully deterministic given the same initial state.

**[RESOLVED]** **[BUG] `animation.loopFrames` conflicts with `cycleFrames`**
`p5Setup` now executes `this.animation.loopFrames = params.cycleFrames`, synchronising the export loop length to the user-selected cycle period on every setup call.

**[RESOLVED]** **[STANDARDS] Preset format non-standard**
All presets now use the standard `{ name, values: { ... } }` wrapper.

**[RESOLVED]** **[STANDARDS] No `export` block**
`export: { png: true, gif: true, webm: false }` added.

**[STANDARDS] State stored on `SCRIPT_CONFIG` object**
`_opStates`, `_lastOpSpeeds` still mutated via `this.*`. Same pattern as other P5 generators; no host mechanism to isolate per-instance state.

**[RESOLVED]** **[PERFORMANCE] `_normalAt` makes 4× `_process` calls per pixel**
Reduced to 3-point forward-difference scheme: `_process` result at `(x,y)` is reused as `centreHeight`; two neighbour calls `(x+1,y)` and `(x,y+1)` complete the gradient. Total 3 `_process` calls per pixel (down from 5), a 40% reduction documented in the PERFORMANCE infoSection.

**[PERFORMANCE] Main-thread pixel computation is too slow for 60fps**
No Worker offload implemented. At `resolution=2`, ~79M arithmetic ops/frame; expected 5–15 fps. Documented in PERFORMANCE infoSection; resolution parameter and Tier 2 adaptive resolution are the primary mitigations.

## NOTE

**[DESIGN] `opSpeed` change triggers full `_initOpStates` reset**
When any of the 4 `opSpeed` params changes, `_initOpStates` re-initialises all 4 operator states. A visual discontinuity will occur. This is not user-visible as a warning. Consider a smoother per-operator speed update that doesn't reinitialise current/next.

**[DESIGN] Reference vector `ref` is computed from a triangle traversal**
The triangle `{(540,54), (1026,1026), (54,1026)}` maps canvas coordinates to sphere coordinates. The mapping `theta = (sx/W) × 2π`, `phi = (sy/H) × π` applies a Mercator-like projection. The triangle is not a geodesic; the reference vector traces a non-great-circle path. This is visually smooth but physically non-uniform.

**[CORRECTNESS] `_normalAt` output formula**
`_normalAt` returns `(2×nz×nx, 2×nz×ny, 2×nz²−1)` — this is a reflection of the unit normal about the Z axis, equivalent to the half-vector formula in Phong shading. Not a standard surface normal. The intended use in `_toColor` (`normal.dot(ref)`) treats it as a dot-product shading factor, which is consistent, but the naming is misleading.
