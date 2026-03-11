# Unified Pattern — Mechanisms

**Status: Unimplemented stub.** The live `draw` function fills the canvas black. This file documents intended mechanisms from the legacy spec and audit.

## Live Script State

| Item | Value |
|---|---|
| `draw` function | Fills canvas black, returns |
| Parameters | 1 slider: `scale` (1–10) — unused |
| Animation | Not declared |
| State | None |

## Intended Algorithm

### Superellipse SDF (GEO-020)

```
f(x, y; c, a, b, p) = (|(x−cx)/a|^p + |(y−cy)/b|^p)^(1/p) − 1
```

- `f < 0`: inside shape
- `f = 0`: shape boundary
- `f > 0`: outside shape

Parameters: `c = (cx, cy)` (cell centre), `a` (half-width), `b = a/aspectRatio` (half-height), `p = cornerExponent`.

### Smooth Min / Smooth Union (GEO-022)

```
smin(a, b, σ) = −σ · ln(exp(−a/σ) + exp(−b/σ))
```

σ = `blendRadius`. At σ = 0: hard min. As σ → ∞: increasingly smooth blend.

For N shapes: fold `smin` left to right: `smin(smin(f_0, f_1), f_2, ...)`.

### Domain Warp (GEO-019)

Before SDF evaluation, transform coordinates:
```
x' = x + warpAmplitude · noise(x·warpFreq, y·warpFreq)
y' = y + warpAmplitude · noise(x·warpFreq + 5.2, y·warpFreq + 1.3)
```

Using Perlin or simplex noise. The offset constants avoid correlation between axes.

### Nested Shapes (GEO-021)

For each cell centre `c_k`, generate `nestingLevels` additional shapes at scales:
```
size_i = sizeMin + (sizeMax − sizeMin) · rand()
size_i+1 = size_i · nestingRatio
```

All nested shapes from a cell share the same `(cx, cy)`, `p`, and aspect ratio.

### Colour Mapping (COLOR-008)

SDF value `v` maps to colour via:
- Sign of `v` selects inside vs outside colour from palette.
- Nested level index selects palette colour index.
- `paletteVariance` adds per-cell colour perturbation.

## Function Inventory (intended)

| Function | Module | Status |
|---|---|---|
| `jitteredGrid` | GEO-018 | Not implemented |
| `domainWarp` | GEO-019 | Not implemented |
| `superellipseSDF` | GEO-020 | Not implemented |
| `nestedShapes` | GEO-021 | Not implemented |
| `smoothUnion` | GEO-022 | Not implemented |
| `paletteMapper` | COLOR-008 | Not implemented |
| `sdfRenderer` | CANVAS-013 | Not implemented |
| `safePow` | MATH-001 | Inline (not extracted) |
| `clamp` | MATH-002 | Inline (not extracted) |
