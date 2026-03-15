# Order and Disorder — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/pattern/order-disorder.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: port of `order_and_disorder` sketch (noted in file header)

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Grid of points | PASS | Configurable spacing and margin |
| Rotating influence source | PASS | `sourceTheta` from `frame % loopFrames` |
| Bean-shaped influence zone | PASS | Asymmetric CW/CCW angular constraints |
| `alpha` field (0=disorder, 1=order) | PASS | Radial + angular combined distance |
| Perlin noise displacement | PASS | 2D per point with time component |
| Lerp toward grid home by alpha | PASS | Correct linear interpolation |
| Boundary jiggle | PASS | `transitionAmt` peaks at alpha=0.5 |
| `blendFactor` for arc measurement | PASS | Blends source vs actual radius |
| `innerRatio` core full-order zone | PASS | Hard inner boundary |
| CW vs CCW curve asymmetry | PASS | `curve=1` vs `curve=0.7` |
| All 16 parameters active | PASS | No inert params |

## Standards Compliance Gaps

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `png: true, gif: false, webm: false` added v1.1.0 |
| `canPrerender` | ABSENT | Not eligible — noise not loopable |
| `animatableParams` | PASS | `animatableParams: []` moved inside `animation` block |
| Preset format | PASS | `{ name, values: {...} }` wrapper added v1.1.0 |
| State on SCRIPT_CONFIG | NON-STANDARD | `_points`, `_lastParams` on config |
| Raw P5 colour values | NON-STANDARD | `background(255)`, `stroke(0)` |
| `animation.loopFrames` conflict | PASS | `loopFrames` removed from animation block; type set to `infinite` |
| Noise time not looping | PASS | Accepted as by design; type changed to `infinite`; GIF disabled |
| Canvas size hardcoded | PASS | `_buildPoints` now receives `p.width`/`p.height` |
