# Curtain Morph — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/other/curtain-morph.gen.js` v1.0.0
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
| Export block | ABSENT | |
| `animatableParams` | ABSENT | |
| Preset format | NON-STANDARD | Flat object |
| State on SCRIPT_CONFIG | NON-STANDARD | `_timingState`, `_lastTmKey` on config |
| `animation.loopFrames` conflict | BUG | Static 3600; does not track `params.loopFrames` |
| `rot = 0` hardcoded | INCOMPLETE | Timeline rotation computed but discarded |
| Wave shapes hardcoded | NON-CONFIGURABLE | 3 waves with fixed cycles/weights/phases |
| Parallel direction hardcoded `(0,1)` | NON-CONFIGURABLE | Always downward |
| Raw P5 colour value | NON-STANDARD | `p.background(255)`, shading uses raw integers |
| `_subdivide`/`_findApex` | DEAD CODE | `minSegments=0` prevents invocation |
