# Animated Lines — Migration Log

## Status

**Implemented.** Merged port of two identical original sketches (`lines.js` / `line_2_shape.js`). Full morphology cycle implemented. Version 1.0.0.

## Architectural Notes

- Context: `p5` (not `2d`). Uses P5.js API.
- Interface: `p5Setup` / `p5Draw` hooks.
- Animation: `infinite` — no pre-render.
- State: on `SCRIPT_CONFIG` object (`this._timeline` etc.).
- Time: `frame × (1000 / fps)` — deterministic, speed-scalable.
- Rotation: scaled to exactly π per loop cycle.

## Open Items (priority order)

1. **[HIGH] Fix preset format** — add `values: { ... }` wrapper to all 3 presets.
2. **[HIGH] Cache shape arrays** — add `_shapesKey` guard; skip `_buildLines`/`_buildArcs`/`_buildPolygons` during static hold segments. Significant performance saving at high resolution.
3. **[MEDIUM] Rename `fps` parameter** — to `speed` or `timeScale`; document as a multiplier, not a frame rate.
4. **[MEDIUM] Add `export` block** — at minimum `{ png: true }`.
5. **[MEDIUM] Move state out of `SCRIPT_CONFIG`** — same fix needed as `fibonacci-balls`.
6. **[LOW] Replace raw colour values** — `background(20)`, `stroke(255)` → CSS-variable-derived values via host injection.
7. **[LOW] Guard `resolution < maxSides`** — warn or enforce minimum resolution of `maxSides × 3` so each polygon edge has at least 3 points.
