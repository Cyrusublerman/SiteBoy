# Curtain Morph — Issues and Conflicts

## ERROR

None.

## WARN

**[RESOLVED] [BUG] Timeline rotation computed but discarded**
`_getTimingState` returns a `rotation` field (accumulated through the polygon steps, totalling π per cycle). `p5Draw` captures it in `state.rotation` via `const state = _getTimingState(...)`, but then passes `rot = 0` to `_buildPolygonRings`. The computed rotation has no effect on the rendered output. Either wire `rot = state.rotation` or remove the rotation computation from the timeline.

*Fix (v1.1.0): `p5Draw` now assigns `const rot = state.rotation` and passes it to `_buildPolygonRings` (both the morph branch and the cached-hold branch). Timeline rotation is now fully applied.*

**[RESOLVED] [BUG] `animation.loopFrames` conflicts with `params.loopFrames`**
`animation.loopFrames = 3600` is static. User slider (360–7200, default 3600) changes `params.loopFrames`. Host pre-render uses the static value. At `loopFrames = 7200` ("Wide" preset), export captures only half a loop.

*Fix (v1.1.0): `p5Setup` assigns `this.animation.loopFrames = params.loopFrames`. `p5Draw` reassigns on `tmKey` change (when `minSides`, `maxSides`, or `loopFrames` param changes). Export frame count stays consistent with the user-selected cycle length.*

**[RESOLVED] [STANDARDS] Preset format non-standard**
Flat objects without `values: { ... }` wrapper.

*Fix (v1.1.0): All three presets (Classic, Solid, Parallel) now wrap parameter values under `values: {}`, matching the format used by other generators.*

**[RESOLVED] [STANDARDS] No `export` block**
No PNG/GIF/WebM export available.

*Fix (v1.1.0): `export: { png: true, gif: true, webm: false }` added. PNG and GIF export enabled; WebM excluded due to loop duration cost at high `loopFrames`.*

**[PARTIAL] [STANDARDS] State stored on `SCRIPT_CONFIG` object**
`_timingState`, `_lastTmKey` on config. Same issue as all prior P5 generators.

*Status: State moved to module-level variables (`let _timingState`, `let _lastTmKey`, `let _cachedRings`, `let _cachedRingKey`) rather than onto SCRIPT_CONFIG. This eliminates the SCRIPT_CONFIG property bloat but is still module-level (not `this.*`), which is also non-standard. The ring cache is valid as a pure function cache keyed by a deterministic string. Multi-instance isolation is not achieved by this approach.*

**[STANDARDS] Raw colour values**
`p.background(255)`, and shading uses `255`, `128`, `0` as raw brightness values. Canvas output should use VGA-palette aliases or be justified as algorithmic render output.

**[PERFORMANCE] Gradient shading: O(ringCount × gradientSteps × resolution) vertex calls**
At defaults (5 rings, 30 steps, 2000 resolution): ~600,000 vertex calls/frame. At max parameters: up to 7M+. Interactive use at max parameters will cause severe frame drops. The gradient mode is primarily suited for static export, not interactive animation.
No guard or warning is presented to the user when these combinations are selected. Documented in PERFORMANCE infoSection.

**[RESOLVED] [DEAD CODE] `_subdivide` and `_findApex`**
`minSegments = 0` is hardcoded in `mod`. The `if (minSegs > 0 ...)` branch in `_buildCurtainSegments` is never entered. Both functions and the `maxLen` calculation are unreachable. Remove or expose `minSegments` as a parameter.

*Fix (v1.1.0): `_subdivide`, `_findApex`, and the `maxLen`/`minSegs` dead branch removed from `_buildCurtainSegments`. `mod` object no longer includes `minSegments`.*

**[NON-CONFIGURABLE] Parallel extrusion direction hardcoded `(0, 1)`**
`direction: { x: 0, y: 1 }` is set in the `extrusionCfg` construction. Direction is always downward regardless of parallel mode. The `vpX/vpY` params are irrelevant in `parallel` mode; consider exposing `directionAngle` instead. Documented in KNOWN LIMITATIONS.

**[RESOLVED] [STALE DOC]** **DOC-052** `ui-layout.md` refreshed against current loopFrames/preset/export metadata.

**[RESOLVED] [STALE DOC]** **DOC-053** `migration-log.md` refreshed against current code state.

**[NON-CONFIGURABLE] Three wave components hardcoded**
`_getWaves()` returns fixed `(cycles, w, loops, phase)` triplets. Users cannot change wave frequency, count, or base phase. Exposing even one or two wave frequency/speed parameters would significantly increase expressiveness. Documented in KNOWN LIMITATIONS.

## NOTE

**[PERFORMANCE] At `resolution = 2000`, rings have 2001 points each** (`j <= resolution` inclusive). The `<=` makes the last point duplicate the first (closing the ring). This is intentional for closed shapes but adds one redundant oscillation and segment-split calculation per ring.

**[DESIGN] `invertSides` parameter**: toggling this effectively swaps lighting polarity (what was shaded dark becomes light). Useful for exploring alternative light configurations without manually adjusting `lightX/lightY`.

---

## v4 turn log (2026-04-23)

- **ARCH-030 (P1, FIXED):** Live curtain-morph imports no modules from `assets/js/shared/` (`zero-shared-imports`) and keeps geometry/timing/extrusion helpers inline.
- **PERF-015 (P2, WONTFIX):** High-vertex gradient path has no adaptive interaction scale or worker path; retained as documented p5 performance limit.
- **DOC-052 (P2, FIXED):** `ui-layout.md` refreshed against current loopFrames/preset/export metadata.
- **DOC-053 (P2, FIXED):** `migration-log.md` refreshed against current code state.
- **DOC-054 (P2, FIXED):** `feature-parity.md` annotated with current Phase 3 state.
