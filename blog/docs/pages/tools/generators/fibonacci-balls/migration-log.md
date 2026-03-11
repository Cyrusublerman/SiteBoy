# Fibonacci Balls — Migration Log

## Status

**Implemented.** Physics simulation with Fibonacci packing, inner balls, HSL collision colour, and trails. No legacy spec — original port from "Fib_balls sketch". Version 1.0.0.

## Architectural Notes

- Context: `p5` (not `2d`). Uses P5.js API.
- Interface: `p5Setup` / `p5Draw` hooks instead of standard `draw`.
- Animation: `infinite` — no pre-render.
- State: on `SCRIPT_CONFIG` object (`this._circles` etc.).
- Mass model: `r²` (area-proportional).
- Rebuild guard: `fibIndexForCanvas | maxFibIndex` key.

## Open Items (priority order)

1. **[HIGH] Add `maxSpeed` cap or velocity normalisation** — prevent simulation divergence from `velocityGrowth` unbounded amplification. Suggested: cap `|v|` to `maxD / 1` per frame or add normalisation every N frames.
2. **[MEDIUM] Fix preset format** — add `values: { ... }` wrapper to all 3 presets for host compatibility.
3. **[MEDIUM] Add `export` block** — at minimum `{ png: true }` for static frame capture.
4. **[MEDIUM] Move state out of `SCRIPT_CONFIG`** — refactor `_circles`, `_canvasSize`, `_lastCfgKey` into a module-level closure or per-instance state managed by the host, not mutated properties of the exported config.
5. **[MEDIUM] Sync `canvas.width/height` to `fibIndexForCanvas`** — host needs to resize P5 canvas when index changes; SCRIPT_CONFIG values should either be dynamic or the host must read from `_canvasSize`.
6. **[LOW] Remove `_fibSeq: null`** — stale dead property on SCRIPT_CONFIG.
7. **[LOW] Replace `p.background(0, 0, 8)` with a CSS-variable-derived value** — requires host to inject a resolved background colour for P5 generators.
