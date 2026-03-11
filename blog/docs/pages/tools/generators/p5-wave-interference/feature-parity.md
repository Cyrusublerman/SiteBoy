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
| preset format `{ name, values }` | FAIL | flat object format used |
| `animatableParams` declared | FAIL | not declared |
| export options declared | FAIL | no export block |
| `animation.loopFrames` matches `cycleFrames` param | FAIL | hardcoded 3600, param adjustable 360–7200 |
| state via local vars not `SCRIPT_CONFIG` | PASS | only constants on SCRIPT_CONFIG |
| canvas size dynamic (not hardcoded) | WARN | `_perimeter` hardcoded to 4320 for 1080×1080 |
| CSS variable colours | N/A | pixel buffer (not CSS colours) |

## Architecture Notes

- Generator is deterministic — no `Math.random()`. Pre-render compatible.
- No accumulated state; each frame computed fresh from `frame` and `params`.
- `_perimeter` hardcoding limits canvas resizing without breaking source positions.
- Ref-atan2 values (from `ref` vector) computed per-pixel rather than cached per-frame — minor inefficiency.
