# Lissajous Curves — Mechanisms

Mathematical model class: generalised parametric Lissajous figures — bivariate sums of phase-shifted, amplitude-scaled, power-distorted cosine/sine terms with multiplicative modulation.

---

## State Model

This generator is purely stateless. No `this.*` variables exist. Each call to `draw()` is completely independent. The `draw` function is a module-level function. The `preset()` helper builds a constant `LANDMARKS` array at module load; this is not mutable per-frame state.

No state model table is applicable. The generator holds no persistent state between frames.

---

## Function Inventory

| Function | Role | Inputs | Output | Complexity |
| --- | --- | --- | --- | --- |
| `signedPow(v, p)` | Signed power: preserves sign, applies exponent to absolute value; special-cases p≈1 to avoid unnecessary computation | `v: number` (base), `p: number` (exponent) | `number` — `sign(v) × |v|^p` | O(1) |
| `preset(name, overrides)` | Constructs a complete preset object by merging all parameter defaults with the given overrides; called only at module load to build `LANDMARKS` | `name: string`, `overrides: object` | preset object with all 30+ parameter keys | O(1) |
| `evaluate(t, p)` | Evaluates the full parametric equation at parameter t; computes X and Y from their respective three-component sums; applies scale and rotation; returns canvas-space coordinates | `t: number` (parameter, radians), `p: object` (params) | `{x: number, y: number}` — canvas position relative to centre | O(1) |
| `draw(ctx, canvas, params, frame)` | Main render hook: clears canvas, samples the parametric curve at `params.points` points over [0, 2π], draws as a single stroke path | `ctx` (Canvas2D), `canvas`, `params`, `frame` (unused) | void | O(points) |

---

## Mathematical Model

**Signed power function:**
`signedPow(v, p) = sign(v) × |v|^p`

where:
- `v` — input value; any real number
- `p` — power exponent; any real number, range [-7, 7] for user-facing params
- Special case: if `|p − 1| < 10⁻⁹`, returns `v` directly (avoids `safePow` for identity case)
- Uses imported `safePow(|v|, p)` which handles `|v| = 0` with negative `p` gracefully (returns 0)

**X parametric equation:**
`X(t) = Ax1 · signedPow(cos(wx1·t + φx1), px1) + Ax2 · signedPow(cos(wx2·t + φx2), px2) + Mx · signedPow(cos(wxm1·t + φxm1), pxm1) · signedPow(sin(wxm2·t + φxm2), pxm2)`

where:
- `t` — parametric variable; radians, range [0, 2π) per curve cycle
- `Ax1` — amplitude of first X term; dimensionless, range [-2, 2]; from `params.Ax1`
- `wx1` — angular frequency of first X term; dimensionless multiplier of t; range [-300, 300]; from `params.wx1`
- `px1` — power exponent for first X term; distorts cosine waveform; range [-7, 7]; from `params.px1`
- `φx1` — phase offset for first X term; radians, range [-2π, 2π]; from `params.phi_x1`
- `Ax2, wx2, px2, φx2` — same roles for the second X term; `Ax2` default 0 (term inactive)
- `Mx` — modulation amplitude; scales the cross-term product; range [-2, 2]; default 0 (modulation inactive)
- `wxm1, pxm1, φxm1` — frequency, power, phase of the cos factor in the modulation term
- `wxm2, pxm2, φxm2` — frequency, power, phase of the sin factor in the modulation term

**Y parametric equation:**
`Y(t) = Ay1 · signedPow(sin(wy1·t + φy1), py1) + Ay2 · signedPow(sin(wy2·t + φy2), py2) + My · signedPow(sin(wym1·t + φym1), pym1) · signedPow(cos(wym2·t + φym2), pym2)`

where:
- `Ay1, wy1, py1, φy1` — same roles as X counterparts, applied to sine instead of cosine
- `My, wym1, pym1, φym1, wym2, pym2, φym2` — Y modulation term parameters; note the modulation term reverses the order (sin × cos vs X's cos × sin), preserving the orthogonal character

**Scale and rotation:**
`Xs = X · scale`, `Ys = Y · scale`
`rot = rotation × π / 180`
`x_out = Xs · cos(rot) − Ys · sin(rot)`
`y_out = Xs · sin(rot) + Ys · cos(rot)`

where:
- `scale` — pixel scale factor; range [20, 300]; from `params.scale`
- `rotation` — clockwise rotation in degrees; range [0, 360]; from `params.rotation`
- `cos(rot), sin(rot)` are computed inside `evaluate()` on every call (see performance note)

**Canvas position:**
`px = centerX + x_out`, `py = centerY + y_out`
where `centerX = canvas.width / 2 = 400`, `centerY = canvas.height / 2 = 400`

**Parameter sampling:**
`t_i = (i / points) × 2π` for i ∈ [0, points)

where:
- `points` — number of sample points per curve; integer, range [1000, 80000]; from `params.points`
- Higher values increase density of the path but raise rendering cost linearly

**Precision note:** the signedPow function with large negative exponents (e.g. p = -7) applied to values near zero can produce very large outputs. No output clipping is applied in `evaluate()`. At extreme parameter combinations, points far off-screen will be included in the stroke path but will not be visible. The host's canvas clip region will prevent rendering them.

**Closure condition:** a Lissajous curve closes (forms a complete loop) when the ratio wx1:wy1 is rational. With integer frequencies and a parameter range of [0, 2π], all active integer frequency components complete an integer number of cycles, producing a closed path.

---

## Render Loop Order

`draw(ctx, canvas, params, frame)` executes in this order:

1. Compute W, H, centerX, centerY from canvas dimensions
2. Clear canvas: `ctx.fillStyle = '#000000'`, `ctx.fillRect(0, 0, W, H)`
3. Set draw state: `ctx.strokeStyle = '#ffffff'`, `ctx.lineWidth = 1`, `ctx.beginPath()`
4. For i ∈ [0, `params.points`): compute `t = (i / points) × TWO_PI`; call `evaluate(t, params)` to get `{x, y}`; compute `px = centerX + x`, `py = centerY + y`; on first iteration: `ctx.moveTo(px, py)`; on subsequent: `ctx.lineTo(px, py)`
5. `ctx.stroke()` — render the complete path as a single draw call

---

## Rebuild Mechanism

No rebuild mechanism exists. The generator is stateless. Every frame is computed entirely from the current `params` values with no comparison to prior state. Changing any parameter takes effect immediately on the next frame with no reset, rebuild, or continuity penalty.
