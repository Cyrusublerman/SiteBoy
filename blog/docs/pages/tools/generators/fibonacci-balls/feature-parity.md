# Fibonacci Balls — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: "Based on Fib_balls sketch" (per file header JSDoc)

No legacy specification exists to compare against. Parity analysis is limited to internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Fibonacci circle packing | PASS | Front-chain algorithm with fallback |
| Inner bouncing balls | PASS | One inner ball per outer where F[i-1] exists |
| HSL colour shift on collision | PASS | Hue, saturation, lightness all modified |
| Inner ball colour shift on wall bounce | PASS | Angle + speed + position factors |
| Trail rendering | PASS | Both outer and inner balls |
| Multi-pass collision separation | PASS | Configurable 1–16 passes |
| Impulse velocity resolution | PASS | Mass = r², restitution, damping |
| Wall bounce | PASS | Hard boundary with restitution |
| `velocityGrowth` chaos with speed cap | PASS | Cap at `canvasSize × 0.3` added v1.1.0; inner cap at `max(parent.r − inner.r, 1)` |
| P5.js HSL colour mode | PASS | Set in `p5Setup` |
| Rebuild on config change | PASS | `_cfgKey` guards `fibIndexForCanvas`/`maxFibIndex` |

## Standards Compliance Gaps (no parity reference)

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `png: true, gif: false, webm: false` added v1.1.0 |
| `canPrerender` | ABSENT | Infinite animation; appropriate |
| `animatableParams` | PASS | `animatableParams: []` declared inside `animation` block |
| Preset format | PASS | `{ name, values: {...} }` wrapper added v1.1.0 |
| State location | NON-STANDARD | `this.*` on SCRIPT_CONFIG; not inside class/component |
| CSS colour variables | ABSENT | P5 `background(0,0,8)` is raw HSL |
