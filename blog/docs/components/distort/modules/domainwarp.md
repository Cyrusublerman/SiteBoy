# DOMAIN WARP

Iteratively warps the sample coordinates through a fractal Brownian motion noise field, creating highly distorted organic textures.

## Identity

| Field | Value |
|-------|-------|
| Type string | `domainwarp` |
| Category | `NOISE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/noise/DomainWarpNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Iterative domain warping | `shared/algorithms/noise/noise-functions.js` | — |
| `PerlinNoise.fbm` | `assets/js/tools/processors/distort/core/PerlinNoise.js` | — |
| `Sampler.bilinearDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

`shared/algorithms/noise/noise-functions.js` — each layer doubles scale and halves strength, offsetting `(wx, wy)` by two independent `fbm` evaluations (offset by `(5.2, 1.3)` to decorrelate x/y displacement fields).

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
| `strength` | STRENGTH | slider+number | 0–200 | 30 | Displacement magnitude in pixels |
| `scale` | SCALE | slider+number | 0.1–20 | 3 | UV scale of the base noise |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `octaves` | OCTAVES | slider+number | 1–8 | 4 | fBm octave count per layer evaluation |
| `layers` | LAYERS | slider+number | 1–3 | 1 | Number of warp iterations (each layer feeds into the next) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Instantiate `PerlinNoise(ctx.nodeSeed)`.
2. For each output pixel, initialise trace `(wx, wy) = (x, y)`.
3. For each layer `l ∈ [0, layers)`:
   - `sc = scale × 2^l`, `str = strength / 2^l`.
   - `wx += fbm(wx/w × sc, wy/h × sc, octaves) × str`.
   - `wy += fbm(wx/w × sc + 5.2, wy/h × sc + 1.3, octaves) × str`.
4. Sample source at `(wx, wy)` bilinearly.

### Output
Domain-warped RGBA image. Progressively more complex distortion with each additional layer.

### Preview strategy
`strength`, `scale`, and `octaves` params have `previewMax` values declared.

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
