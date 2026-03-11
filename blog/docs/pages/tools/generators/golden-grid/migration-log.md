# Golden Grid — Migration Log

## Status

**Implemented.** Port of `pulsing_recursive_grid` sketch. Recursive golden-ratio subdivision with animated colour. Noted as reference implementation for P5 generators in the unified system. Version 1.0.0.

## Architectural Notes

- Context: `p5`. Uses P5.js API.
- Interface: `p5Setup` / `p5Draw` hooks.
- Animation: `loop`, `loopFrames: 360` (static; conflicts with param).
- Colour mode: HSL [0,1] — unusual but valid.
- `noSmooth()`: aliased rendering (intentional).

## Open Items (priority order)

1. **[HIGH] Fix `animation.loopFrames` conflict** — either make host read `params.loopFrames` dynamically, or remove `loopFrames` from the `animation` block and document that pre-render uses `params.loopFrames`.
2. **[HIGH] Cache `_getRatio` per frame** — compute once at top of `p5Draw`; pass to `_subdivide` as a parameter instead of recomputing per node. Critical at `maxDepth ≥ 14`.
3. **[MEDIUM] Fix preset format** — add `values: { ... }` wrapper to all 4 presets.
4. **[MEDIUM] Add `export` block** — at minimum `{ png: true }`. With loop type, `{ gif: true, webm: true }` are also appropriate.
5. **[MEDIUM] Set `canPrerender: true`** — animation is deterministic and frame-based; eligible.
6. **[MEDIUM] Cache bounds computation** — add `_lastMaxDepth` guard; recompute `wMax/wMin/hMax/hMin/aMax/aMin` only when `maxDepth` changes.
7. **[LOW] Remove dead `_normBounds`** — remove `_normBounds: null` from SCRIPT_CONFIG and the bounds computation in `p5Setup`. `p5Setup` can be reduced to `p.colorMode(p.HSL, 1, 1, 1); p.noStroke(); p.noSmooth(); p.noLoop()`.
