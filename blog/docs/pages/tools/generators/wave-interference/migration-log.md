# Wave Interference — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/wave/wave-interference.gen.js` v2.1.0

## Current State

Wave Interference is implemented and live.

Implemented:
- R/X/Y wave components with two terms each
- signed `safePow` transform
- additive and multiply blend modes
- rotation and scale controls
- complete UI surface for term, offset, wave-shape, and modulation controls
- full LANDMARK preset maps via `_DEFAULTS`
- pooled ImageData/Float32Array render buffers
- worker `computePixels` path and adaptive interaction scale
- parametric animation metadata and sequencer support
- PNG/SVG/GIF/WebM/sequence export flags

## 2026-04-28 additions (WIN-03, WIN-06)

- **WIN-03 p5-wave-interference merger:** `p5-wave-interference` consolidated into this script. `interferenceMode` toggle added — selects between `equations` (p5 pixel path, from p5-wave-interference), `normal-map` (canvas2d normalised per-pixel), and `complex-ops` (operator-chain complex number mode). Full parameter union; `p5-wave-interference` removed from `ScriptRegistry`.
- **WIN-06 p5-wave-colour merger:** `p5-wave-colour` consolidated into this script as the `complex-ops` interferenceMode. Full operator-chain parameter surface (_Complex, _WaveOps, operator evolution) available under this mode. `colourMode` axis (mono / hue-mapped / palette) added across all three renderer modes. `p5-wave-colour` removed from `ScriptRegistry`.

## Intentional Divergences

- Output uses continuous greyscale min-max normalisation, not binary thresholding.
- Modulation uses additive two-sin modulation, not the reference sin×cos product.
- WebGL is not implemented; worker offload is the current compute path.

## 2026-04-30 assessment (PERF-004)

- **PERF-004 Worker offload: WONTFIX accepted limit.** All three renderers (`equations`, `normal-map`, `complex-ops`) use `p.loadPixels()`/`p.pixels[]` which are bound to the p5 instance. These cannot be transferred to a `ComputeScheduler` worker without rewriting out of p5 entirely. Tier 2 adaptive resolution (`interactionScale: 0.5`, `idleDelay: 200`) is already applied and is the maximum optimisation applicable per `compute-scheduler.md` decision tree. The `complex-ops` renderer additionally maintains per-frame `_opStates` accumulator, ruling out stateless worker dispatch.

## Closed Stale Items

Previous open items for missing UI parameters, snake_case keys, partial presets, console logging, and inert canvas sliders are resolved in the live source.
