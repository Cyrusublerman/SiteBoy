# Order and Disorder — Migration Log

## Status

**Implemented.** Port of `order_and_disorder` sketch. Influence-field point-grid animation with Perlin noise. Version 1.0.0.

## Architectural Notes

- Context: `p5`. Uses P5.js API including `p.noise()`.
- Interface: `p5Setup` / `p5Draw` hooks.
- Animation: `loop` declared but noise time is non-looping — effectively `infinite`.
- Canvas: hardcoded 1080×1080.
- State: `_points`, `_lastParams` on SCRIPT_CONFIG.
- Rebuild guard: `gridSpacing | gridMargin` change detection.

## Open Items (priority order)

1. **[HIGH] Fix noise looping** — change `t = frame × noiseTimeScale` to a modular form or switch `animation.type` to `'infinite'`. Either fix the loop claim or make the noise cycle match the frame cycle.
2. **[HIGH] Fix `animation.loopFrames` conflict** — same fix needed as `golden-grid`.
3. **[HIGH] Replace hardcoded canvas dimensions** — use `p.width`, `p.height` in `_buildPoints`; compute centre as `(p.width/2, p.height/2)` dynamically.
4. **[HIGH] Batch `p.point` calls** — wrap in `p.beginShape(p.POINTS) / p.endShape()` for significant rendering performance improvement at high point counts.
5. **[MEDIUM] Fix preset format** — add `values: { ... }` wrapper to all 3 presets.
6. **[MEDIUM] Add `export` block** — at minimum `{ png: true }`.
7. **[MEDIUM] Move state out of `SCRIPT_CONFIG`** — refactor `_points`, `_lastParams` to per-invocation scope.
8. **[LOW] Replace raw colour values** — `background(255)`, `stroke(0)` → CSS-variable-derived values.
9. **[LOW] Expose `radialCurve` parameter** — the hardcoded `^1` exponent for radial falloff could be a user-facing slider, consistent with the CCW curve exponent already implemented.
