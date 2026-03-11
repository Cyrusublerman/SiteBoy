# Curtain Morph — Migration Log

## Status

**Implemented.** Port of `ring_polygon` sketch. F1→F2→F3 pipeline for polygon ring morphology, wave-curtain displacement, and lit extrusion rendering. Version 1.0.0.

## Architectural Notes

- Context: `p5`. Uses P5.js API.
- Interface: `p5Setup` / `p5Draw` hooks.
- Animation: `loop` — frame-based, deterministic. `loopFrames` conflict as per golden-grid.
- State: `_timingState`, `_lastTmKey` on SCRIPT_CONFIG.
- Canvas: 1080×1080; hardcoded VP/light offsets relative to `(540, 540)`.
- Three hardcoded waves; parallel direction hardcoded; rotation discarded.

## Open Items (priority order)

1. **[HIGH] Fix `rot = 0` — wire timeline rotation** — change `const rot = 0` to `const rot = state.rotation` in `p5Draw`. The rotation accumulation in the timeline is otherwise wasted computation.
2. **[HIGH] Fix `animation.loopFrames` conflict** — same fix as `golden-grid`.
3. **[HIGH] Performance warning for gradient mode** — add guard: at `resolution × gradientSteps × ringCount > 300,000` vertices/frame, warn user or cap to recommended values.
4. **[MEDIUM] Fix preset format** — add `values: { ... }` wrapper to all 3 presets.
5. **[MEDIUM] Add `export` block** — at minimum `{ png: true }`. Gradient shading at high resolution is visually rich for still images.
6. **[MEDIUM] Remove dead code** — `_subdivide`, `_findApex`, `minSegs` branch. Or expose `minSegments` as a user parameter.
7. **[MEDIUM] Expose parallel direction** — add `directionAngle` slider (0–360°) to replace hardcoded `(0,1)` when `extrusionMode = 'parallel'`.
8. **[LOW] Move state out of `SCRIPT_CONFIG`** — `_timingState`, `_lastTmKey` to per-invocation scope.
9. **[LOW] Expose wave parameters** — add `waveFreq1`, `waveSpeed1`, or similar for at least the primary wave.
10. **[LOW] Replace raw colour values** — `background(255)`, shading literals → CSS-variable-derived.
