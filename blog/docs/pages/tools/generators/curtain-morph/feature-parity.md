# Curtain Morph — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/other/curtain-morph.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: port of `ring_polygon` sketch

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Polygon ring morphology (minSides→maxSides) | PASS | Frame-based timeline |
| Area-normalised rings | PASS | `_radiusForEqualArea` |
| Centroid vertical correction | PASS | `_centroidOffsetY` |
| Three-wave oscillator displacement | PASS | `_softLimit` tanh saturation |
| Normal-direction displacement | PASS | Configurable left/right |
| Per-ring amplitude/weight/phase variation | PASS | Sinusoidal modulation by ring index |
| Front/back classification by light source | PASS | Dot product of normal to light |
| Vanishing-point extrusion | PASS | Per-point toward VP |
| Parallel extrusion | PASS | Fixed direction (0,1) |
| Gradient shading | PASS | `gradientSteps` strips |
| Solid shading modes | PASS | `solid`, `solid-grey` |
| Segment depth sorting | PASS | By ring index or VP distance |
| Invert sides toggle | PASS | `invertSides` param |
| All 22 parameters active | PASS | |

## Standards Compliance Gaps

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `{ png: true, gif: true, webm: false }` added in v1.1.0 |
| `animatableParams` | PASS | Declared in `animation` block: 10 params |
| Preset format | PASS | Now uses `values: {}` wrapper in v1.1.0 |
| State on SCRIPT_CONFIG | PARTIAL | Key state moved to module-level (`let _timingState` etc.); not `this.*` — still non-standard but no longer on config object |
| `animation.loopFrames` conflict | PASS | `this.animation.loopFrames = params.loopFrames` set in both `p5Setup` and `p5Draw` |
| `rot = 0` hardcoded | PASS | `rot = state.rotation` wired in v1.1.0; timeline rotation now applied |
| Wave shapes hardcoded | NON-CONFIGURABLE | 3 waves with fixed cycles/weights/phases; documented in KNOWN LIMITATIONS |
| Parallel direction hardcoded `(0,1)` | NON-CONFIGURABLE | Always downward; documented in KNOWN LIMITATIONS |
| Raw P5 colour value | NON-STANDARD | `p.background(255)`, shading uses raw integers; still open |
| `_subdivide`/`_findApex` | PASS | Dead code removed in v1.1.0 |
