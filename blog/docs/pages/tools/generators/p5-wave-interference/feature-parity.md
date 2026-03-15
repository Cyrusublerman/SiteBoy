# Wave Interference (P5) — Feature Parity

No legacy specification or audit exists. Assessment is internal consistency and standards compliance only.

## Implemented Features

| feature | status | notes |
|---|---|---|
| 4-source perimeter orbit | PASS | deterministic, frame-based |
| scalar wave superposition | PASS | `_sumHeight` across pair |
| surface normal via finite difference | PASS | `_calcNormal`, delta=1 |
| angular-difference colour mapping | PASS | 6 angles → R, G, B |
| hue shift by total wave height | PASS | `_hueShift` applied |
| reference vector triangle traversal | PASS | 10 loops/cycle |
| pixel-buffer rendering | PASS | `loadPixels`/`updatePixels` |
| resolution block scaling | PASS | block-fill pixel replication |
| 3 presets | PASS | Classic, High Freq, Low Detail |

## Standards Compliance

| check | status | notes |
|---|---|---|
| preset format `{ name, values }` | PASS | standard format adopted |
| `animatableParams` declared | PASS | `['amplitude', 'speed', 'frequency']` |
| export options declared | PASS | `png: true, gif: true, webm: false` |
| `animation.loopFrames` fixed; no conflicting param | PASS | `cycleFrames` param removed |
| state via local vars not `SCRIPT_CONFIG` | PASS | only methods on SCRIPT_CONFIG |
| canvas size dynamic (not hardcoded) | PASS | `_perimeter` removed; `2*(W+H)` computed in p5Draw |
| CSS variable colours | N/A | pixel buffer (not CSS colours) |

## Architecture Notes

- Generator is deterministic — no `Math.random()`. Pre-render compatible.
- No accumulated state; each frame computed fresh from `frame` and `params`.
- Ref-atan2 values cached per-frame, not per-pixel.
