# Wave Colour — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: port of `Wave_interference_colour` sketch

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Complex-number wave field | PASS | `_Complex` class with polar form |
| 4 perimeter-orbiting sources | PASS | CW/CCW with configurable loop counts |
| 8 complex operators | PASS | add, multiply, power, rotate, mobius, fold, spiral, beat |
| Operator family classification | PASS | smooth/harsh/warp families |
| Deterministic operator evolution | PASS | Wang-hash PRNG `_seededRand`; seed = index×100000 + transitionCount |
| Polar lerp between operators | PASS | `_lerpPolar` with log magnitude |
| `smootherstep` easing | PASS | 5th-order |
| Surface normal estimation | PASS | 3-point forward-difference; centreHeight reused from colour pass |
| Phase-based hue mapping | PASS | Relative to reference vector |
| Magnitude-driven lightness | PASS | Exponential mapping |
| Normal-dotted saturation | PASS | |
| Rotating reference vector | PASS | Triangle traversal, 10 cycles/loop |
| Pixel buffer rendering | PASS | `loadPixels/updatePixels` |
| Block resolution scaling | PASS | 1–6 pixel block size |
| 14 parameters | PASS | All active |

## Standards Compliance

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `png: true, gif: true, webm: false` |
| `animatableParams` | PASS | Declared in `animation` block |
| Preset format `{ name, values }` | PASS | Standard format |
| State on SCRIPT_CONFIG | NON-STANDARD | `_opStates`, `_lastOpSpeeds` on config |
| Determinism | PASS | Operator evolution uses seeded Wang-hash PRNG |
| `animation.loopFrames` sync | PASS | p5Setup sets `this.animation.loopFrames = params.cycleFrames` |
