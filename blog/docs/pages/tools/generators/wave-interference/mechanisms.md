# Wave Interference — Mechanisms

## Algorithm Class

Spatial wave field composition via separable and radial component superposition with signed-power distortion. Stateless per-frame pixel computation. Two-pass normalisation for full dynamic range.

## Mathematical Model

### Coordinate System

Canvas coordinates `(px, py)` are normalised to a centred, scale-invariant space:

```
x = (px − cx) / scale
y = (py − cy) / scale
r = √(x² + y²)
```

A global rotation is applied before computing r, x, y:

```
x' = x·cos(θ) − y·sin(θ)
y' = x·sin(θ) + y·cos(θ)
```

where `θ = rotation × π / 180`. The rotation affects the orientation of all X(x) and Y(y) stripe patterns. R(r) is rotation-invariant because `r = √(x'² + y'²) = √(x² + y²)`.

### Wave Term Structure

Each component (R, X, Y) follows an identical term structure:

**Term k:**

```
term_k = A_k · safePow(coord_k − O_k, p_k) · wave(2π · f_k · coord + φ_k)
```

Where:
- `A_k` — amplitude (signed, scales and inverts term)
- `coord_k` — r, x, or y (as appropriate)
- `O_k` — spatial offset (shifts the envelope centre)
- `p_k` — power exponent applied to the offset coordinate
- `f_k` — frequency (cycles per normalised unit)
- `φ_k` — phase (radians)
- `wave` — sin or cos (selectable per term)

**safePow:**

```
safePow(base, exp) = sign(base) × |base|^exp    if |base| ≥ 1e-9 or exp ≥ 0
                   = 0                            if |base| < 1e-9 and exp < 0
```

This preserves the sign of the base while applying fractional or negative exponents. Negative `p` with `p < 0` produces divergent values near the offset centre unless the zero guard triggers.

### Modulation

Each component has an additive modulation layer that multiplicatively modulates the sum of its two terms:

```
result_mod = result · (1 + M · (safePow(sin(2π·fm1·coord + φm1), pm1) + safePow(sin(2π·fm2·coord + φm2), pm2)))
```

Modulation is only evaluated when `|M| > 0.001` (guard to skip computation when disabled). The modulation wave function is hardcoded to sin regardless of the term's wave_* selection.

### Composition

```
Sum mode:      I = R(r) + X(x) + Y(y)
Multiply mode: I = (1 + R(r)) · (1 + X(x)) · (1 + Y(y))
```

### Normalisation

Two-pass normalisation ensures full [0, 255] greyscale range regardless of amplitude settings:

```
Pass 1: track min_I, max_I over all W×H intensities
Pass 2: grey = floor((I − min_I) / (max_I − min_I) × 255)
```

Guard: if `max_I − min_I < ε` (uniform field), range defaults to 1 to avoid division by zero, producing a mid-grey canvas.

## Function Inventory

| Function | Signature | Purpose |
|---|---|---|
| `safePow` | `(base, exp) → float` | Signed exponentiation with zero guard for negative exponents |
| `waveFunc` | `(t, useCos) → float` | Dispatch to sin or cos |
| `computeR` | `(r, params) → float` | Evaluate full R(r) component (2 terms + modulation) |
| `computeX` | `(x, params) → float` | Evaluate full X(x) component (2 terms + modulation) |
| `computeY` | `(y, params) → float` | Evaluate full Y(y) component (2 terms + modulation) |
| `draw` | `(ctx, canvas, params, frame) → void` | Main render: allocate ImageData, two-pass compute, putImageData |
| `SCRIPT_CONFIG.computePixels` | `(imageData, params, frame) → ImageData` | Worker-safe duplicate of draw logic, returns filled ImageData |

## State Model

| Variable | Scope | Mutated? | Notes |
|---|---|---|---|
| `TWO_PI` | module constant | no | `Math.PI * 2` |
| `LANDMARKS` | module constant | no | Array of preset partial param objects |
| `imageData` | local to `draw` | per frame | Allocated fresh each frame via `createImageData` |
| `intensities` | local to `draw` | per frame | `Float32Array(W×H)` allocated each frame |
| `minI`, `maxI` | local to `draw` | per frame | Min/max across pixel pass |

The generator has **no persistent module-level mutable state**. Every frame is fully stateless.

## Rebuild Mechanism

No rebuild required. The generator has no initialisation phase, no pre-built data structures, and no `needsRebuild` logic. Every call to `draw` is independent.

## Render Pipeline

```
draw(ctx, canvas, params, frame)
  │
  ├─ 1. Extract global params: scale, rotation, blendMode
  ├─ 2. Compute cosR, sinR from rotation angle
  ├─ 3. Allocate: createImageData(W, H) → imageData
  ├─ 4. Allocate: Float32Array(W × H) → intensities
  │
  ├─ First Pass (W × H iterations):
  │    ├─ Normalise (px, py) → (x, y) centred and scaled
  │    ├─ Rotate (x, y) → (x', y')
  │    ├─ Compute r = √(x'² + y'²)
  │    ├─ Evaluate R(r), X(x'), Y(y')
  │    ├─ Combine by blendMode → intensity
  │    └─ Store in intensities[]; track min/max
  │
  ├─ Second Pass (W × H iterations):
  │    └─ Normalise each intensity → grey byte; write RGBA into data[]
  │
  └─ ctx.putImageData(imageData, 0, 0)
```

## Worker Execution (computePixels)

`SCRIPT_CONFIG.computePixels` is a self-contained method that duplicates the pixel computation logic using locally-defined inner functions (`_safePow`, `_wave`, `_R`, `_X`, `_Y`). It receives a pre-allocated `ImageData` object (whose buffer has been transferred to the Worker), fills it, and returns it.

Per `compute: { worker: true }`, the ComputeScheduler is responsible for:
1. Serialising `computePixels` and its inner function definitions.
2. Transferring the ImageData buffer to the Worker.
3. Receiving the filled buffer back.
4. Calling `ctx.putImageData` on the main thread.

The outer `draw` function is NOT invoked in Worker mode.

## Parameter Keys (non-camelCase)

Parameter keys use underscore notation: `phi_r1`, `phi_r2`, `phi_x1`, `phi_x2`, `phi_y1`, `phi_y2`, `wave_r1`, `wave_r2`, `wave_x1`, `wave_x2`, `wave_y1`, `wave_y2`. This violates the camelCase convention from `code-standards.md` (same pattern as `lissajous.gen.js`).
