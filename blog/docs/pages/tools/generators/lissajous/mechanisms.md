# Lissajous Curves — Mechanisms

Mathematical model class: generalised Lissajous parametric evaluation with additive terms and multiplicative modulation per axis.

## State Model

- Stateless procedural generator.
- No mutable runtime state beyond current `params`.
- Presets are prebuilt via `preset()` into `LANDMARKS`.

## Function Inventory (Live)

| Function | Role |
| --- | --- |
| `signedPow(v, p)` | Signed exponent helper using `safePow` |
| `preset(name, overrides)` | Builds complete preset objects |
| `draw(ctx, canvas, params)` | Full render path over `[0, 2pi]` |

## Draw Loop (Live)

1. Clear to black.
2. Precompute rotation trig once per frame.
3. Sample `points` along parameter `t`.
4. Evaluate X and Y sums/modulation inline.
5. Apply scale + rotation.
6. Apply out-of-range path-break guard.
7. Stroke one continuous path.

## Notes

- Legacy standalone `evaluate()` function no longer exists (logic is inlined).
- Phase keys are camelCase in live code.
- Generator remains deterministic for fixed params and sample index.
