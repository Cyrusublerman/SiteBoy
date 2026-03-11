# Shape Array — Migration Log

## Status

**Implemented.** Port of `shape_array_accident` sketch. Grid morphology animation with perimeter-sampled interpolation and phase ripple. Version 1.0.0.

## Architectural Notes

- Context: `p5`. Uses P5.js API.
- Interface: `p5Setup` / `p5Draw` hooks.
- Animation: `infinite` — `_globalT` driven, not `frame` driven.
- State: `_globalT` on SCRIPT_CONFIG.
- Canvas: uses `p.width`/`p.height` for centring (correct); fixed 1080×1080 in SCRIPT_CONFIG.

## Open Items (priority order)

1. **[HIGH] Fix `_globalT` to use `frame` counter** — replace `this._globalT += morphSpeed` with `const globalT = (frame * morphSpeed) % 1`. Fixes determinism, replay, and pre-render.
2. **[MEDIUM] Fix preset format** — add `values: { ... }` wrapper to all 3 presets.
3. **[MEDIUM] Add `export` block** — at minimum `{ png: true }`.
4. **[MEDIUM] Optimise `_samplePerimeter`** — precompute cumulative edge lengths; binary-search for target arc position. O(circleRes × n) → O(n + circleRes log n).
5. **[MEDIUM] Move state out of `SCRIPT_CONFIG`** — `_globalT` to frame-derived local constant eliminates the state entirely.
6. **[LOW] Replace raw colour literals** — `20`/`245`/`255`/`0` → CSS-variable-derived values.
7. **[LOW] Separate `circleRes` from circle polygon side count** — add distinct `circleMaxSides` parameter, decouple from sampling resolution.
