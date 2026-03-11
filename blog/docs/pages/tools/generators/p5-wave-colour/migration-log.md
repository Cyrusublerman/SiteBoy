# Wave Colour — Migration Log

## Status

**Implemented.** Port of `Wave_interference_colour` sketch. Complex wave interference with evolving operators, normal-map shading, and HSL colour mapping. Version 1.0.0.

## Architectural Notes

- Context: `p5` but uses `p.pixels` (pixel buffer), not P5 shapes.
- Interface: `p5Setup` / `p5Draw`.
- Animation: `loop` (declared); actually non-deterministic due to operator randomness.
- State: `_opStates`, `_lastOpSpeeds` on SCRIPT_CONFIG.
- All compute is pure arithmetic — no P5 API in the hot path. High Worker feasibility.

## Open Items (priority order)

1. **[HIGH] Fix non-determinism in operator evolution** — replace `Math.random()` in `_pickNextOp` with a seeded PRNG keyed on `frame` and operator index. Enables pre-render, replay, and reproducible export.
2. **[HIGH] Fix `animation.loopFrames` conflict** — same fix as `golden-grid`: dynamic resolution or remove `loopFrames` from animation block.
3. **[HIGH] Worker offload for pixel computation** — move `_process`/`_normalAt`/`_toColor` sampling loop to a Web Worker; transfer `Uint8ClampedArray` back and write to `p.pixels`. Expected 4–8× performance improvement, enabling interactive use at `resolution=1`.
4. **[HIGH] Cache centre sample in `_normalAt`** — reuse the result of `_process(px, py)` from colour computation as the centre value in `_normalAt`, eliminating 1 of 5 `_process` calls per pixel (20% saving with no correctness change).
5. **[MEDIUM] Fix preset format** — add `values: { ... }` wrapper.
6. **[MEDIUM] Add `export` block** — `{ png: true }` minimum; GIF/WebM only after non-determinism is fixed.
7. **[MEDIUM] Move state out of `SCRIPT_CONFIG`** — `_opStates`, `_lastOpSpeeds` to per-invocation scope.
8. **[LOW] Add flat-shading option** — skip `_normalAt` for ~5× speed increase; expose as `shadingMode: ['normals', 'flat']`.
9. **[LOW] Smooth `opSpeed` changes** — avoid resetting operator states on `opSpeed` change; update only the `speed` property of each state.
