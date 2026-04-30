# Animated Lines — Issues and Conflicts

## ERROR

None.

## WARN

**[STANDARDS] State stored on `SCRIPT_CONFIG` object**
`_timeline`, `_totalDuration`, `_timelineKey` are properties of the exported config object, mutated via `this.*` in `p5Draw`/`_buildTimeline`. Shared state across instances. Same pattern as `fibonacci-balls`. Standards require per-invocation scoping.

**[STANDARDS] Raw P5 colour values**
`p.background(20)` and `p.stroke(255)` use raw integers. Cannot be overridden by CSS variable system.

**[RESOLVED] [STANDARDS] Preset format non-standard**
*Fix: Presets updated to `{ name, values: { ... } }` wrapper format.*
~~Presets are flat objects `{ name, key1, key2, ... }` rather than `{ name, values: { ... } }`. Host may fail to apply presets silently.~~

**[RESOLVED] [STANDARDS] No `export` block**
*Fix: `export: { png: true, gif: false, webm: false }` added; GIF/WebM disabled for infinite animation.*
~~No PNG/GIF/WebM export available.~~

**[RESOLVED] [PERFORMANCE] Shape arrays rebuilt every frame**
*Fix: Shape array cache (`_shapesKey`) and centroid cache (`_centroidKey`) added; shapes only rebuilt when `curve`, `sides`, or geometry params change; `_buildArcs` skipped when `arcBlend < 0.001`.*
~~`_buildLines`, `_buildArcs`, and `_buildPolygons` are called every frame regardless of whether `curve` or `sides` changed. During hold segments, the output is constant. A shape-array cache keyed on `curve | sides | lineCount | outerRadius | polySpacing | resolution | maxSides` would eliminate redundant computation. At `resolution = 400`, `lineCount = 20`: rebuilds 4 × 8000 = 32,000 points/frame unnecessarily during holds.~~

**[RESOLVED] [UX] `fps` parameter label is misleading**
*Fix: Parameter renamed `speed`, range changed to 0.5–2.0, label set to 'Speed'; `timeMs = frame × (1000/60) × speed`.*
~~The parameter is labelled "Simulated FPS" but controls animation speed (`timeMs = frame × 1000 / fps`). It is not a frame rate setting. Setting `fps = 120` doubles speed; `fps = 30` halves it. Renaming to `speed` with a range of 0.5–2 would be clearer.~~

## NOTE

## Stale Documentation

**[STALE DOC] [DOC-032] — ui-layout.md Multiple Stale Entries**

(1) `fps` parameter still listed (renamed to `speed` with range 0.5–2.0 in fix; `timeMs = frame × (1000/60) × speed`). Note on line 24 still says "Simulated FPS" and describes it as a speed control — the rename fix was applied to code but not doc. (2) Preset format noted as flat object (now standard `{ name, values }`). (3) Export block likely not yet shown (now added). Verify remaining entries against live source when fixing.

---

**[STALE DOC] [DOC-034] — migration-log.md Stale**

Open Items 1–7 describe pre-fix state. Items 1 (preset format), 2 (shape array cache), 3 (fps rename), 4 (export block) confirmed RESOLVED in issues-and-conflicts.md.

---

**[CORRECTNESS] `_lerpShapes` only used during polygon-to-polygon morph, not curve morph**
During the lines→polygon morph (curve 0→1), `_buildShapes` handles the blend internally. `_lerpShapes` is only applied when `state.sidesT` is set (polygon step transitions). The distinction is correct but the dual blend path is subtle.

**[DESIGN] `resolution` affects both drawing fidelity and polygon smoothness**
At `resolution = 50`, polygon edges are rendered as coarse polylines (50 / n points per edge). At `n = 3` (triangle), `resolution / 3 ≈ 17` points per edge — adequate. At `maxSides = 60`, 50 / 60 < 1 point per edge — polygon looks identical to circle. Users may not understand why increasing `maxSides` above `resolution` has no visible effect.

---

## v4 turn log (2026-04-23)

- **ARCH-020 (P1, FIXED):** Live animated-lines imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **PERF-010 (P2, WONTFIX):** No worker/GPU acceleration path; high `lineCount × resolution` remains a documented p5 workload limit.
- **DOC-029 (P2, FIXED):** `ui-layout.md` refreshed against current speed/preset/export/performance state.
- **DOC-030 (P2, FIXED):** `migration-log.md` refreshed against resolved implementation items.
