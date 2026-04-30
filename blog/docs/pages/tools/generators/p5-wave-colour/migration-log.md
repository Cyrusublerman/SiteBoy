# Wave Colour — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js`

## Current State

Implemented and live.

Resolved since the original migration:
- operator evolution made deterministic with seeded hash choice
- loop metadata synchronised to `cycleFrames`
- preset format converted to `{ name, values }`
- export metadata added
- `_normalAt` reduced from five `_process` calls to three

## 2026-04-28 merger (WIN-06)

**Merged into `wave-interference`.** `p5-wave-colour` is no longer a standalone entry in `ScriptRegistry`. Its complete parameter surface (operator chains, complex-number math, colourMode axis) was integrated into `wave-interference.gen.js` as the `complex-ops` renderer mode. The `wave-interference` script's `interferenceMode` toggle selects between the original canvas2d renderer and the p5 complex-ops and equations renderers. This folder is retained as historical documentation only.

## Residuals (historical)

- Main-thread per-pixel computation remains expensive.
- No worker/GPU acceleration path is implemented.
- Operator speed changes reset operator state and can cause visible discontinuity.
