# POSTERIZE

Uniformly quantises each channel to N discrete levels, producing flat tonal banding.

## Identity

| Field | Value |
|-------|-------|
| Type string | `posterize` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/PosterizeNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Uniform channel quantisation | `shared/algorithms/image/colour-adjustments.js` | — |

`shared/algorithms/image/colour-adjustments.js` — `step = 1/N`; `level = floor((v/255) / step)`, clamped to `N−1`; `out = round((level / (N−1)) × 255)`. `isLUT = true` for chaining.

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
| `levels` | LEVELS | slider+number | 2–32 | 4 | Number of discrete output tones per channel |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Build a 256-entry LUT: for each input `v`, compute `step = 1/levels`, determine level index `l = floor((v/255)/step)` clamped to `levels−1`, map to output `round((l/(levels−1))×255)`.
2. Apply the LUT identically to R, G, B. Copy alpha.

### Output
Posterised RGBA image with each channel reduced to `levels` discrete values.

### Preview strategy
No reduction — LUT built once, O(1) per pixel.

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
LITHO — 4-level posterize before halftone dot overlay.
