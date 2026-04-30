# Order and Disorder — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/pattern/order-disorder.gen.js`

## Current State

Implemented and live.

Resolved since the original migration:
- animation changed to infinite for non-looping noise
- hardcoded canvas dimensions removed from point builder
- static loopFrames conflict removed
- `animatableParams` moved inside animation block
- preset format converted to `{ name, values }`
- export metadata added
- point rendering batched

## 2026-04-28 additions (ORD-01 – ORD-04)

- **ORD-01 Canvas fit:** Default canvas fit corrected to `'fit'`; previously defaulted to a non-standard value causing misalignment with host layout.
- **ORD-02 Noise type selector:** `NoiseTypeSelect` (X-010) integrated — `noiseType` param with Perlin/value/fBm options; dispatches to appropriate p5 noise call or custom implementation per selection.
- **ORD-03 Worker path verification:** Worker offload path verified via X-011 cross-cutting audit; result: infeasible (see PERF-009). PERF-009 reopened for assessment.
- **ORD-04 Colourway:** `colourway` wired into draw path via X-007 — `background`, `ordered`, `disordered` colour slots; draw path resolves RGB from these entries.

## 2026-04-30 assessment (PERF-009)

- **PERF-009 Worker offload: WONTFIX accepted limit.** `p.noise()` and `p.vertex()` require the p5 instance; the particle positions accumulate per-frame state incompatible with stateless worker dispatch. Documented in the `compute` block comment in source. Tier 1 RAF coalesce is the maximum applicable optimisation per `compute-scheduler.md` decision tree. PERF-009 closed.

## Residuals

- Dense grids remain expensive.
- Radial curve exponent remains hardcoded.
