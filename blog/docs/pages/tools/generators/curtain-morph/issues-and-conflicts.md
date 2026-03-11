# Curtain Morph — Issues and Conflicts

## ERROR

None.

## WARN

**[BUG] Timeline rotation computed but discarded**
`_getTimingState` returns a `rotation` field (accumulated through the polygon steps, totalling π per cycle). `p5Draw` captures it in `state.rotation` via `const state = _getTimingState(...)`, but then passes `rot = 0` to `_buildPolygonRings`. The computed rotation has no effect on the rendered output. Either wire `rot = state.rotation` or remove the rotation computation from the timeline.

**[BUG] `animation.loopFrames` conflicts with `params.loopFrames`**
`animation.loopFrames = 3600` is static. User slider (360–7200, default 3600) changes `params.loopFrames`. Host pre-render uses the static value. At `loopFrames = 7200` ("Wide" preset), export captures only half a loop.

**[STANDARDS] Preset format non-standard**
Flat objects without `values: { ... }` wrapper.

**[STANDARDS] No `export` block**
No PNG/GIF/WebM export available.

**[STANDARDS] State stored on `SCRIPT_CONFIG` object**
`_timingState`, `_lastTmKey` on config. Same issue as all prior P5 generators.

**[STANDARDS] Raw colour values**
`p.background(255)`, and shading uses `255`, `128`, `0` as raw brightness values.

**[PERFORMANCE] Gradient shading: O(ringCount × gradientSteps × resolution) vertex calls**
At defaults (5 rings, 30 steps, 2000 resolution): ~600,000 vertex calls/frame. At max parameters: up to 7M+. Interactive use at max parameters will cause severe frame drops. The gradient mode is primarily suited for static export, not interactive animation.
No guard or warning is presented to the user when these combinations are selected.

**[DEAD CODE] `_subdivide` and `_findApex`**
`minSegments = 0` is hardcoded in `mod`. The `if (minSegs > 0 ...)` branch in `_buildCurtainSegments` is never entered. Both functions and the `maxLen` calculation are unreachable. Remove or expose `minSegments` as a parameter.

**[NON-CONFIGURABLE] Parallel extrusion direction hardcoded `(0, 1)`**
`direction: { x: 0, y: 1 }` is set in the `extrusionCfg` construction. Direction is always downward regardless of parallel mode. The `vpX/vpY` params are irrelevant in `parallel` mode; consider exposing `directionAngle` instead.

**[NON-CONFIGURABLE] Three wave components hardcoded**
`_getWaves()` returns fixed `(cycles, w, loops, phase)` triplets. Users cannot change wave frequency, count, or base phase. Exposing even one or two wave frequency/speed parameters would significantly increase expressiveness.

## NOTE

**[PERFORMANCE] At `resolution = 2000`, rings have 2001 points each** (`j <= resolution` inclusive). The `<=` makes the last point duplicate the first (closing the ring). This is intentional for closed shapes but adds one redundant oscillation and segment-split calculation per ring.

**[DESIGN] `invertSides` parameter**: toggling this effectively swaps lighting polarity (what was shaded dark becomes light). Useful for exploring alternative light configurations without manually adjusting `lightX/lightY`.
