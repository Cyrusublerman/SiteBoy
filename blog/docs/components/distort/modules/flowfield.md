# FLOW FIELD

Warps the image using backward advection through a fractal Brownian motion noise vector field, with optional curl blending.

## Identity

| Field | Value |
|-------|-------|
| Type string | `flowfield` |
| Category | `WARP` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/warp/FlowFieldNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| fBm Perlin noise field | `assets/js/tools/processors/distort/core/PerlinNoise.js` | — |
| `Sampler.sampleDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

`PerlinNoise.fbm` with configurable octaves, lacunarity, and gain. Two independent noise evaluations per step give x/y displacement. Curl blending rotates the displacement 90° to produce rotational flow.

## Parameters

### NodePanel (Universal)

All modules are managed by the NodePanel component. These controls are always present regardless of module type.

**Interactive controls (not stored as module params):**

| Control | Component | Description |
|---------|-----------|-------------|
| Drag handle | drag-handle | Reorder module in the effect stack |
| Enable | toggle | Off = bypass; unmodified source passes through to next module |
| Solo | button | Isolate module; all others suppressed until solo is cleared |

**Composition params (applied after module `apply()` writes its output):**

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `opacity` | OPACITY | slider+number | 0–1 | 1 | Scales module output before compositing onto source |
| `blendMode` | BLEND MODE | dropdown | `normal` `multiply` `screen` `overlay` `add` `difference` `darken` `lighten` | `normal` | Compositing mode for blending module output onto source |

### Tier 3 (primary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `noiseScale` | NOISE SCALE | slider+number | 0.1–20 | 3 | UV scale of the noise field (higher = finer structure) |
| `strength` | STRENGTH | slider+number | 0–200 | 40 | Displacement magnitude in pixels |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `octaves` | OCTAVES | slider+number | 1–8 | 3 | Number of fBm noise octaves |
| `lacunarity` | LACUNARITY | slider+number | 1–4 | 2 | Frequency multiplier per octave |
| `gain` | GAIN | slider+number | 0.1–0.9 | 0.5 | Amplitude falloff per octave |
| `curl` | CURL | slider+number | -1–1 | 0 | Blend from irrotational to solenoidal (curl) flow |
| `advectSteps` | ADVECT | slider+number | 1–10 | 1 | Number of advection integration steps per pixel |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Instantiate `PerlinNoise` from `ctx.nodeSeed`.
2. For each output pixel, initialise source position `(sx, sy) = (x, y)`.
3. For each of `advectSteps` sub-steps: evaluate `fbm` at normalised `(sx/w, sy/h)` scaled by `noiseScale` to get `(dx, dy)`. If `curl ≠ 0`, blend with the perpendicular `(dy, −dx)`. Subtract `(dx, dy) × (strength / advectSteps)` from `(sx, sy)`.
4. Sample source at final `(sx, sy)` via `Sampler.sampleDst` (bilinear or nearest).

### Output
Noise-warped RGBA image.

### Preview strategy
`advectSteps` capped at 3; sampling forced to nearest; `strength` scaled by `ctx.previewScale` if present.

## Mask controls

Applied after compositing. Mask luminance drives blend weight per-pixel: white = full module effect, black = module has no effect (source passes through).

| Control | Component | Options / Range | Description |
|---------|-----------|-----------------|-------------|
| Mode | dropdown | `none` / `upload` / `luminance` / `gradient` | Source for the mask image |
| Image | file | — | Greyscale PNG upload (upload mode only) |
| Invert | toggle | — | Flip mask values before applying |
| Blur | slider+number | 0–20 px | Gaussian blur applied to mask edges before compositing |

**Modes:**
- `none` — no mask; module effect applies uniformly across all pixels
- `upload` — user-supplied greyscale image mapped to image dimensions
- `luminance` — source image luminance at point of masking drives the blend weight
- `gradient` — system-generated linear or radial gradient

## Modulation targets
All `range`-type params accept image and expression drivers via the `+D` button in the NodePanel. No parameters in this module have pre-wired `getModulated()` calls in the current implementation — all values read directly from `this.params`.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
LIQUID — strength 80, curl 0.3, 4 steps. DATAMOSH — strength 30, 2 steps.
