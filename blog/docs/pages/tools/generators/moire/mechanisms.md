# Moiré — Mechanisms

## Algorithm Class

Binary interference field via superposition of radial/angular gratings with per-pixel threshold. Single-pass ImageData rendering. Stateless.

## Mathematical Model

### Coordinate System

```
x = (px / W) × 2 − 1      (normalised to [−1, 1])
y = (py / H) × 2 − 1
```

Canvas is 420×420 so pixel spacing is 2/420 ≈ 0.00476 per pixel.

### Grating Functions

**Radial grating:**
```
radialGrating(x, y, cx, cy, λ, φ) = 0.5 + 0.5 · sin(2π · (r/λ + φ))
```
where `r = √((x−cx)² + (y−cy)²)`.

**Angular grating:**
```
angularGrating(x, y, cx, cy, ω, δ) = 0.5 + 0.5 · sin(ω · atan2(y−cy, x−cx) + δ)
```

When `angularFreq > 0`, the radial grating for a centre is multiplied by its angular grating. The angular offset `δ` is hardcoded to `-π/2` for all centres.

### Multi-Centre Field

| Centre | Coordinates | Condition | Weight |
|---|---|---|---|
| A | `(0, 0)` | Always | `weightA` |
| B | `(centreOffset_eff, 0)` | `gratingCount ≥ 2` and `centreOffset > 0` | `weightB` |
| i (2..count−1) | rotated by `(i−1)·π/count` | `gratingCount ≥ i+1` | 1 (unweighted) |

Centre B oscillation:
```
centreOffset_eff = centreOffset + sin(animationTime × 2) × centreOsc
```

Additional centres (index ≥ 2) apply a coordinate rotation to the input coordinates before evaluating a radial-only grating at origin. This effectively rotates the grating, not the centre position:
```
xR = x·cos(angle) + y·sin(angle)
yR = −x·sin(angle) + y·cos(angle)
```
These additional gratings are not weighted and do not use `centreOffset`.

### Combination

Sequential pairwise combination applied left to right:
```
intensity_0 = gA
intensity_i = combineMoire(intensity_{i−1}, g_i, mode)
```

| Mode | Formula |
|---|---|
| sum | `(a + b) / 2` |
| product | `a × b` |
| min | `min(a, b)` |
| max | `max(a, b)` |

### Mask

| Type | Distance Formula |
|---|---|
| none | mask = 1 (no masking) |
| circle | `d = √(x² + y²)` |
| square | `d = max(|x|, |y|)` |
| triangle | `d = max(|x|·0.866 + y·0.5, −y) − 0.5; d = (d+0.5)/1` (see Issues) |

Soft mask: `mask = smoothstep(edge + softness, edge − softness, d)` where `edge = maskSize`.
Hard mask: `mask = d < maskSize ? 1 : 0`.

`smoothstep(e0, e1, x) = t²(3 − 2t)`, `t = clamp((x−e0)/(e1−e0), 0, 1)`.

Mask is applied by multiplication: `intensity_masked = intensity × mask`.

### Output

```
on = intensity_masked > threshold
if (invert) on = !on
color = on ? parseColor(fgColor) : parseColor(bgColor)
```

`parseColor(hex)` extracts integer RGB from a `#rrggbb` hex string.

### Animation

```
animationTime = (frame / 60) × phaseSpeed
phase = phaseOffset + animationTime
```

`frame` is the integer frame counter passed by the host. Phase advances `phaseSpeed` units per second (at 60 FPS base). Animation type is `'infinite'` — the generator runs continuously with no terminal frame.

## Function Inventory

| Function | Signature | Purpose |
|---|---|---|
| `radialGrating` | `(x, y, cx, cy, λ, φ) → [0,1]` | Concentric sinusoidal field from a single centre |
| `angularGrating` | `(x, y, cx, cy, ω, δ) → [0,1]` | Sectoral sinusoidal field (spokes) |
| `combineMoire` | `(a, b, mode) → float` | Pairwise field combiner (sum/product/min/max) |
| `smoothstep` | `(e0, e1, x) → [0,1]` | Cubic Hermite smooth step |
| `computeGratings` | `(x, y, λ, ωa, φ, cOff, wA, wB, count, mode) → float` | Evaluate all grating centres and combine |
| `computeMask` | `(x, y, type, size, softness) → [0,1]` | Shape mask field |
| `parseColor` | `(hex) → {r,g,b}` | Hex string to RGB integers |
| `draw` | `(ctx, canvas, params, frame) → void` | Main render: full pixel loop, threshold, putImageData |

## State Model

| Variable | Scope | Notes |
|---|---|---|
| `TWO_PI` | module constant | `Math.PI × 2` |
| All grating/mask state | local to `draw` | Derived from params + frame each call |

The generator is **fully stateless**. No module-level mutable state. No pre-built data structures.

## Render Pipeline

```
draw(ctx, canvas, params, frame)
  │
  ├─ 1. Parse params (wavelength, angularFreq, phase, combineMode, threshold, ...)
  ├─ 2. Compute animationTime from frame
  ├─ 3. Compute centreOffset_eff (add oscillation)
  ├─ 4. Parse fgColor, bgColor hex strings
  ├─ 5. Allocate ImageData(W, H)
  │
  └─ Pixel loop (W × H):
       ├─ Normalise (px, py) → (x, y) in [−1, 1]
       ├─ computeGratings(x, y, ...) → intensity
       ├─ computeMask(x, y, ...) → mask
       ├─ intensity_masked = intensity × mask
       ├─ on = intensity_masked > threshold; apply invert
       ├─ color = on ? fg : bg
       └─ Write RGBA to data[]
  └─ ctx.putImageData(imageData, 0, 0)
```
