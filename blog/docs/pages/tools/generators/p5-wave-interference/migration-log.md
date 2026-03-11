# Wave Interference (P5) — Migration Log

## Status

**Implemented.** Version 1.0.0. Port of `wave_interference` sketch. Fully deterministic.

## Architectural Changes from Original Sketch

- Wrapped into `SCRIPT_CONFIG` module format with `p5Setup`/`p5Draw` hooks.
- Parameters exposed via slider UI (`amplitude`, `frequency`, `speed`, `s1–s4Loops`, `resolution`, `cycleFrames`).
- Pixel block-replication controlled by `resolution` parameter.
- 3 presets added (Classic, High Freq, Low Detail).

## Open Items

| priority | id | description | severity |
|---|---|---|---|
| 1 | loopframes-conflict | Fix `animation.loopFrames` / `cycleFrames` mismatch | WARN [BUG] |
| 2 | worker-offload | Offload pixel computation to Web Worker | WARN [PERFORMANCE] |
| 3 | perimeter-hardcode | Replace `_perimeter = 4320` with `2*(W+H)` at draw time | WARN [ARCHITECTURE] |
| 4 | cache-ref-atan2 | Cache 3 reference `atan2` values outside pixel loop | WARN [PERFORMANCE] |
| 5 | preset-format | Convert presets to `{ name, values: {...} }` format | WARN [STANDARDS] |
| 6 | animatable-params | Declare `animatableParams` | WARN [STANDARDS] |
| 7 | export-options | Add export options block | WARN [STANDARDS] |
