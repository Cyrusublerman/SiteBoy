# NOISE OVERLAY

Evaluates fractional Brownian motion Perlin noise per pixel and blends the result onto the source image.

## Identity

| Field | Value |
|-------|-------|
| Type string | `perlinoverlay` |
| Category | `NOISE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/noise/PerlinOverlayNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| `PerlinNoise.fbm` | `assets/js/tools/processors/distort/core/PerlinNoise.js` | — |

`PerlinNoise` instantiated from `ctx.nodeSeed`. `fbm` evaluated at normalised `(x/w × scale, y/h × scale)` with configurable octaves. Result `n ∈ [0,1]` blended per the selected mode.

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
| `scale` | SCALE | slider+number | 0.1–20 | 3 | UV scale of noise (higher = finer detail) |
| `strength` | STRENGTH | slider+number | 0–1 | 0.3 | Blend influence of the noise |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `octaves` | OCTAVES | slider+number | 1–8 | 4 | Number of fBm noise octaves |

### Tier 5 (quality/mode)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `blendMode` | BLEND | dropdown | `add`, `multiply`, `screen`, `overlay` | `add` | Noise compositing mode |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Instantiate `PerlinNoise(ctx.nodeSeed)`.
2. For each pixel at `(x, y)`, evaluate `n = (fbm(x/w × scale, y/h × scale, octaves) + 1) × 0.5` → `n ∈ [0,1]`.
3. Per channel, blend source value `sv` with noise `n` using selected mode and `strength`.
4. Clamp to `[0,255]`. Copy alpha.

### Output
Noise-overlaid RGBA image.

### Preview strategy
No reduction.

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
None in current PRESETS.
