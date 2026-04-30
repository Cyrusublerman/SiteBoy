# Wave Interference (P5) — Migration Log

## Status

Implemented. Version 1.1.0. Port of `wave_interference` sketch. Deterministic and frame-driven.

## Architectural Changes from Original Sketch

- Wrapped into `SCRIPT_CONFIG` module format with `p5Setup`/`p5Draw` hooks.
- Parameters exposed via slider UI (`amplitude`, `frequency`, `speed`, `s1–s4Loops`, `resolution`).
- Pixel block-replication controlled by `resolution` parameter.
- 3 presets added (Classic, High Freq, Low Detail).
- `animation.loopFrames` fixed at 3600.
- `animatableParams` declared.
- export block declared.

## 2026-04-28 merger (WIN-03)

**Merged into `wave-interference`.** `p5-wave-interference` is no longer a standalone entry in `ScriptRegistry`. Its full parameter surface was unified with `wave-interference.gen.js` under an `interferenceMode` toggle (`equations` / `normal-map` / `complex-ops`). The `equations` renderer corresponds to this script's original p5 pixel path. This folder is retained as historical documentation only.

## Open Items (historical — superseded by merger)

| priority | id | description | severity |
|---|---|---|---|
| 1 | worker-offload | Offload pixel computation to Worker/GPU path — assessed WONTFIX 2026-04-30 (p5-instance-bound) | WARN [PERFORMANCE] |
| 2 | fixed-cycle-constraint | runtime cycle control not exposed; loopFrames is fixed | NOTE [PARITY] |
