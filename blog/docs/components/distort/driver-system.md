# DISTORT — Driver System

A **driver** is a dynamic value source that replaces or modulates a module parameter at render time. Any numeric parameter in any module can have a driver attached. Categorical/toggle params (dropdowns, toggles) cannot be driven.

**Reference:**
- Implementation: `assets/js/tools/processors/distort/core/ExpressionEval.js`
- Integration point: `EffectNode.getModulated(key, pixelIdx, ctx)`
- Module docs: `blog/docs/components/distort/modules/*.md` → `## Modulation targets`

---

## Driver Types

| Type | Trigger | Scope | Cost |
|------|---------|-------|------|
| `none` | Off — static param value used | — | zero |
| `image` | Greyscale image sampled at pixel position | Per-pixel | low |
| `expression` | Math expression evaluated with variables | Per-pixel or per-frame | low–high |

---

## Image Driver

A greyscale PNG is loaded into `EffectNode.modulation[key].mapId`. At each pixel, `modMaps[mapId][pixelIdx]` gives a value `m ∈ [0, 255]`.

**Controls exposed in NodePanel:**

| Control | Component | Description |
|---------|-----------|-------------|
| Driver image | file | Greyscale PNG; mapped to image dimensions at render |
| Amount | slider+number (0–1) | Scales the driver's influence: `0` = no effect, `1` = full drive |
| Invert | toggle | Inverts the map: `m = 255 − m` before use |

**Mapping to param value:**

```
normalised = (invert ? 255 − m : m) / 255        // 0–1
driven     = param.min + normalised * (param.max − param.min)
final      = lerp(staticValue, driven, amount)
```

`staticValue` is the slider value. At `amount = 0`, static value is used unchanged. At `amount = 1`, the image drives the param across its full range.

---

## Expression Driver

An expression is a single-line math string starting with `=`. `ExpressionEval.evaluate()` parses and executes it with whitelisted variables and functions.

```
= r * 0.25 * (frame % 360)
= sin(t * tau) * 30 + 30
= mix(5, 50, lum)
= clamp(sqrt(u*u + v*v) * 100, 0, 80)
```

**The `=` prefix is required.** Strings without `=` are treated as static numeric literals.

**Output mapping:**

Expression output is the raw param value — no normalisation is applied. The result is clamped to `[param.min, param.max]` before use. Write expressions that produce values in the param's natural range.

```
# To drive a sigma param (range 0.1–30) by luminance:
= lum * 30
# To animate a strength param (range 0–200) with a sine wave:
= 100 + sin(t * tau) * 80
```

---

## Variable Reference

### Per-pixel (spatial)

Evaluated once per pixel inside the render loop. Expressions using any of these variables are classified as **per-pixel scope** — called `w × h` times per render.

| Variable | Type | Range | Description |
|----------|------|-------|-------------|
| `r` | float | 0–1 | Red channel of source pixel (normalised) |
| `g` | float | 0–1 | Green channel of source pixel (normalised) |
| `b` | float | 0–1 | Blue channel of source pixel (normalised) |
| `a` | float | 0–1 | Alpha channel of source pixel (normalised) |
| `lum` | float | 0–1 | BT.601 luminance: `r·0.299 + g·0.587 + b·0.114` |
| `x` | int | 0–`w−1` | Pixel column index in pixels |
| `y` | int | 0–`h−1` | Pixel row index in pixels |
| `u` | float | 0–1 | Normalised horizontal position: `x / w` |
| `v` | float | 0–1 | Normalised vertical position: `y / h` |

### Per-frame (temporal)

Evaluated once per render. Expressions using only these variables are classified as **per-frame scope** — called once per render regardless of image size.

| Variable | Type | Range | Description |
|----------|------|-------|-------------|
| `frame` | int | 0–`frameCount−1` | Current frame index (0-based) |
| `frameCount` | int | ≥ 1 | Total frame count in the current sequence |
| `t` | float | 0–1 | Normalised time: `frame / max(1, frameCount − 1)` |
| `seed` | int | any | `ctx.nodeSeed` — deterministic per-module seed |

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `PI` | 3.14159… | π |
| `tau` | 6.28318… | 2π |
| `E` | 2.71828… | Euler's number |

---

## Function Reference

### Trigonometric

| Function | Description |
|----------|-------------|
| `sin(x)` | Sine (radians) |
| `cos(x)` | Cosine (radians) |
| `tan(x)` | Tangent (radians) |
| `asin(x)` | Arcsine → radians |
| `acos(x)` | Arccosine → radians |
| `atan(x)` | Arctangent → radians |
| `atan2(y, x)` | 2-argument arctangent → radians |

### Exponential / logarithmic

| Function | Description |
|----------|-------------|
| `sqrt(x)` | Square root |
| `pow(x, y)` | `x^y` |
| `exp(x)` | `e^x` |
| `log(x)` | Natural logarithm (base e) |
| `log2(x)` | Logarithm base 2 |

### Rounding

| Function | Description |
|----------|-------------|
| `floor(x)` | Round down |
| `ceil(x)` | Round up |
| `round(x)` | Round to nearest integer |
| `abs(x)` | Absolute value |
| `sign(x)` | −1, 0, or 1 |
| `fract(x)` | Fractional part: `x − floor(x)` |
| `mod(x, m)` | Floating-point modulo, handles negatives: `((x % m) + m) % m` |

### Range / interpolation

| Function | Signature | Description |
|----------|-----------|-------------|
| `min` | `min(a, b)` | Minimum of two values |
| `max` | `max(a, b)` | Maximum of two values |
| `clamp` | `clamp(x, lo, hi)` | Constrain `x` to `[lo, hi]` |
| `mix` | `mix(a, b, t)` | Linear interpolation: `a + (b−a)·t` |
| `smoothstep` | `smoothstep(lo, hi, x)` | Smooth Hermite ramp 0→1 between `lo` and `hi` |

### Noise / random

| Function | Description |
|----------|-------------|
| `random()` | Uniform random `[0, 1)` — **non-deterministic**; avoid in render loops |

---

## Scope Classification

The evaluator classifies each expression before executing:

1. **Per-frame** — expression contains only temporal variables (`frame`, `frameCount`, `t`, `seed`, constants). Evaluated once per render; result broadcast to all pixels.
2. **Per-pixel** — expression contains any spatial variable (`r`, `g`, `b`, `a`, `lum`, `x`, `y`, `u`, `v`). Evaluated inside the render loop at every pixel.

Per-pixel scope on a 2000×2000 image = 4M evaluations per frame. Keep per-pixel expressions simple. Complex per-pixel drives should use image drivers instead.

> **Note:** `random()` in a per-pixel expression gives uncorrelated noise per pixel per frame — it is NOT seeded. For seeded noise, use `sin(x * seed)` or similar deterministic approximation.

---

## UI Description

The driver button (`+D`) appears to the right of the label on every driveable parameter row in the NodePanel. It is hidden until the NodePanel row is hovered.

**Driver picker — image driver:**

```
[DRIVER TYPE: image ▾]
[Image: upload.png    ] [×]
[Amount ══════════╸   ] [0.80]
[Invert               ] [off]
```

**Driver picker — expression driver:**

```
[DRIVER TYPE: expr ▾]
[= r * 0.25 * (frame % 360)      ]
[live: 11.24  at centre pixel    ]
[⚠ syntax error: ...             ]  ← shown on parse failure
```

Live preview shows the expression result evaluated at the image centre pixel for the current frame. Updates on every keystroke with 300ms debounce.

**Inline indicator:** When a driver is active, the parameter row label gains a small `[D]` tag and the slider is greyed out (slider still adjustable as a static fallback, used at `amount = 0` for image drivers, ignored for expression drivers).

---

## Expression Examples

```
# Amplitude driven by luminance — brighter areas get more effect
= lum * 80

# Sine wave animation (param oscillates between 10 and 50)
= 30 + sin(t * tau) * 20

# The user's example: red channel × scalar × frame cycle
# Drives a 0-100 param: red content × frame position in a 360-frame loop
= r * 0.25 * (frame % 360)

# Radial gradient — effect strongest at centre
= (1 - clamp(sqrt((u-0.5)*(u-0.5) + (v-0.5)*(v-0.5)) * 2, 0, 1)) * 30

# Temporal pulse — sharp on-off 4× per loop
= floor(fract(t * 4) + 0.5) * 50

# Blue channel drives colour temperature
= b * 200 - 100

# Noise approximation using sine hash
= abs(sin(x * 0.1 + seed) * cos(y * 0.07 + seed)) * 20
```

---

## Operator Support

Standard JavaScript infix operators are available:

| Operator | Description |
|----------|-------------|
| `+` `-` `*` `/` | Arithmetic |
| `%` | Remainder (use `mod()` for sign-safe version) |
| `**` | Exponentiation |
| `?:` | Ternary conditional |
| `<` `>` `<=` `>=` `==` `!=` | Comparison (returns 0 or 1) |

---

## Implementation Notes

**Current state of `ExpressionEval.js`:**

The existing evaluator supports: `seed`, `frame`, `frameCount`, `PI`, `sin`, `cos`, `abs`, `floor`, `ceil`, `random`, `min`, `max`, `pow`.

**Extensions required for full driver system:**

| Addition | Type |
|----------|------|
| Per-pixel variables: `r`, `g`, `b`, `a`, `lum`, `x`, `y`, `u`, `v` | New params to `evaluate()` |
| Constants: `tau`, `E` | New bound vars |
| Temporal alias: `t` | New computed var |
| Functions: `tan`, `asin`, `acos`, `atan`, `atan2`, `sqrt`, `exp`, `log`, `log2`, `round`, `sign` | New bound fns |
| Utility fns: `fract`, `mod`, `clamp`, `mix`, `smoothstep` | Inline closures passed as bound vars |
| Scope classifier: `ExpressionEval.scope(expr)` | New static method → `'pixel'` \| `'frame'` |

**Extended `evaluate()` signature:**

```javascript
static evaluate(expr, vars = {}) {
  // vars: { seed, frame, frameCount, t,
  //         r, g, b, a, lum, x, y, u, v }
}

static scope(expr) {
  // Returns 'pixel' if expression references spatial vars,
  // 'frame' otherwise.
  const PIXEL_VARS = /\b(r|g|b|a|lum|x|y|u|v)\b/;
  return PIXEL_VARS.test(expr) ? 'pixel' : 'frame';
}
```

**Integration in `EffectNode.getModulated(key, pixelIdx, ctx)`:**

```javascript
getModulated(key, pixelIdx, ctx) {
  const d = this.modulation?.[key];
  if (!d) return this.params[key];

  if (d.type === 'image' && ctx.modMaps?.[d.mapId]) {
    const m = ctx.modMaps[d.mapId][pixelIdx] / 255;
    const inv = d.invert ? 1 - m : m;
    const p = this.paramDefs[key];
    const driven = p.min + inv * (p.max - p.min);
    return lerp(this.params[key], driven, d.amount);
  }

  if (d.type === 'expr' && d.expr) {
    const r = ctx.pixelVars?.[pixelIdx];   // pre-fetched per-pixel vars
    return ExpressionEval.evaluate(d.expr.slice(1), { ...ctx.frameVars, ...r });
  }

  return this.params[key];
}
```

Per-pixel vars (`ctx.pixelVars`) are pre-computed by Pipeline before the render loop when any expression in the stack has pixel scope, avoiding redundant channel extraction inside each node.
