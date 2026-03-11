# Shape Array — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/pattern/shape-array.gen.js` v1.0.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: port of `shape_array_accident` sketch

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Grid of morphing shapes | PASS | cols × rows cells |
| Line → triangle → square → circle morph | PASS | 4-stage via stages=[2,3,4,circleRes] |
| Perimeter-sampled equal-arc-length interpolation | PASS | `_samplePerimeter` with arc-length parameterisation |
| Diagonal phase offset ripple | PASS | `(col+row) × phaseOffset` |
| `bgColor` dark/light toggle | PASS | `dropdown` type |
| `strokeWeight` control | PASS | |
| `shapeSize` radius control | PASS | |
| `circleRes` fidelity control | PASS | Also sets stages[3] side count |
| `morphSpeed` and `phaseOffset` controls | PASS | |
| Canvas centring | PASS | `offsetX/Y` computed from `p.width/height` |

## Standards Compliance Gaps

| Aspect | Status | Notes |
|---|---|---|
| Export block | ABSENT | No PNG/GIF/WebM |
| `animatableParams` | ABSENT | Not declared |
| Preset format | NON-STANDARD | Flat object; missing `values: {...}` |
| State on SCRIPT_CONFIG | NON-STANDARD | `_globalT` on config |
| `_globalT` frame-rate-dependent | BUG | Not tied to `frame`; non-deterministic |
| Raw P5 colour values | NON-STANDARD | Conditional literals 20/245 |
