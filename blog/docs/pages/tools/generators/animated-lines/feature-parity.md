# Animated Lines — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/pattern/animated-lines.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: merged port of `lines.js` / `line_2_shape.js` (noted in file header)

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Lines → polygon morph animation | PASS | Full morphology via arc intermediate |
| All regular polygons triangle to maxSides | PASS | Steps n=3 to maxSides |
| Rotation accumulation totalling π | PASS | `scaleFactor` normalisation correct |
| Per-loop rotation increment of π | PASS | `baseRot = loopIndex × π` |
| Timeline rebuild on timing params | PASS | `_timelineKey` guard |
| Smoothstep easing on all transitions | PASS | `0.5 − 0.5 × cos(t × π)` |
| Area-preserving polygon radius | PASS | `adjR` calculation |
| Square vertex offset (45°) | PASS | `vOffset = −π/2 − π/4` for n=4 |
| Centroid correction each frame | PASS | `_centroid` applied |
| `strokeWeight` control | PASS | Applied via `p.strokeWeight` |
| `speed` control | PASS | Renamed from `fps`; range 0.5–2.0 multiplier |

## Standards Compliance Gaps

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `png: true, gif: false, webm: false` added v1.1.0 |
| `canPrerender` | ABSENT | Infinite animation; appropriate |
| `animatableParams` | PASS | `animatableParams: []` declared in animation block |
| Preset format | PASS | `{ name, values: {...} }` wrapper added v1.1.0 |
| State on SCRIPT_CONFIG | NON-STANDARD | `this._timeline` etc. on exported object |
| Raw P5 colour values | NON-STANDARD | `background(20)`, `stroke(255)` |
| `fps` label misleading | PASS | Renamed to `speed` (0.5–2.0 multiplier) v1.1.0 |
