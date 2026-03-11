# Animated Lines — Issues and Conflicts

## ERROR

None.

## WARN

**[STANDARDS] State stored on `SCRIPT_CONFIG` object**
`_timeline`, `_totalDuration`, `_timelineKey` are properties of the exported config object, mutated via `this.*` in `p5Draw`/`_buildTimeline`. Shared state across instances. Same pattern as `fibonacci-balls`. Standards require per-invocation scoping.

**[STANDARDS] Preset format non-standard**
Presets are flat objects `{ name, key1, key2, ... }` rather than `{ name, values: { ... } }`. Host may fail to apply presets silently.

**[STANDARDS] Raw P5 colour values**
`p.background(20)` and `p.stroke(255)` use raw integers. Cannot be overridden by CSS variable system.

**[STANDARDS] No `export` block**
No PNG/GIF/WebM export available.

**[PERFORMANCE] Shape arrays rebuilt every frame**
`_buildLines`, `_buildArcs`, and `_buildPolygons` are called every frame regardless of whether `curve` or `sides` changed. During hold segments, the output is constant. A shape-array cache keyed on `curve | sides | lineCount | outerRadius | polySpacing | resolution | maxSides` would eliminate redundant computation.
At `resolution = 400`, `lineCount = 20`: rebuilds 4 × 8000 = 32,000 points/frame unnecessarily during holds.

**[UX] `fps` parameter label is misleading**
The parameter is labelled "Simulated FPS" but controls animation speed (`timeMs = frame × 1000 / fps`). It is not a frame rate setting. Setting `fps = 120` doubles speed; `fps = 30` halves it. Renaming to `speed` with a range of 0.5–2 would be clearer.

## NOTE

**[CORRECTNESS] `_lerpShapes` only used during polygon-to-polygon morph, not curve morph**
During the lines→polygon morph (curve 0→1), `_buildShapes` handles the blend internally. `_lerpShapes` is only applied when `state.sidesT` is set (polygon step transitions). The distinction is correct but the dual blend path is subtle.

**[DESIGN] `resolution` affects both drawing fidelity and polygon smoothness**
At `resolution = 50`, polygon edges are rendered as coarse polylines (50 / n points per edge). At `n = 3` (triangle), `resolution / 3 ≈ 17` points per edge — adequate. At `maxSides = 60`, 50 / 60 < 1 point per edge — polygon looks identical to circle. Users may not understand why increasing `maxSides` above `resolution` has no visible effect.
