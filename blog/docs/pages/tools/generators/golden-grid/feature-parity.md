# Golden Grid — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/pattern/golden-grid.gen.js` v1.0.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: port of `pulsing_recursive_grid` sketch (noted in file header)

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Golden ratio recursive subdivision | PASS | Alternating vertical/horizontal at each depth |
| Animated ratio oscillation between P_SMALL and P_BIG | PASS | `PHI^sin(2πt)` formula |
| Flip alternation to prevent corner collapse | PASS | `flipped` flag propagated |
| Log-normalised colour from proportions | PASS | `_logNorm` applied per channel |
| Hue sawtooth animation | PASS | `(wNorm + t×hueSpeed) % 1` |
| Saturation triangle-wave animation | PASS | Correct triangle formula |
| Lightness triangle-wave animation | PASS | Area proportion as input |
| `maxDepth` control | PASS | 4–16, step 1 |
| `loopFrames` control | PASS | Affects time `t` and loop period |
| `hueSpeed`, `satSpeed`, `lumSpeed` controls | PASS | All three animate independently |
| P5 HSL [0,1] colour mode | PASS | `colorMode(HSL, 1, 1, 1)` |
| `noSmooth()` crisp aliasing | PASS | Set in `p5Setup` |

## Standards Compliance Gaps

| Aspect | Status | Notes |
|---|---|---|
| Export block | ABSENT | No PNG/GIF/WebM |
| `canPrerender` | ABSENT | Not set; `type: 'loop'` implies support |
| `animatableParams` | ABSENT | Not declared |
| Preset format | NON-STANDARD | Flat object; missing `values: {...}` |
| State on SCRIPT_CONFIG | PARTIAL | `_normBounds` property is dead (precomputed but never read) |
| `animation.loopFrames` conflict | BUG | Static 360; does not track `params.loopFrames` |
| `_getRatio` redundant per-node calls | INEFFICIENCY | Same result every call within a frame |
