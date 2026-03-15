# AFFINE XFORM

Applies an inverse-mapped affine transform (translate, rotate, scale) about a configurable centre point.

## Identity

| Field | Value |
|-------|-------|
| Type string | `affine` |
| Category | `TRANSFORM` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/transform/AffineTransformNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Inverse affine transform (rotate + scale) | `shared/algorithms/image/spatial-filters.js` | — |
| `Sampler.sampleDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

`shared/algorithms/image/spatial-filters.js` — for each output pixel, back-project through the combined rotation + scale matrix about `centre`, offset by translation. `Sampler.sampleDst` performs bilinear or nearest-neighbour sampling.

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
| `translateX` | TRANSLATE X | slider+number | -1–1 | 0 | Horizontal translation (fraction of width) |
| `translateY` | TRANSLATE Y | slider+number | -1–1 | 0 | Vertical translation (fraction of height) |
| `rotate` | ROTATE | slider+number | -180–180 (step 0.5) | 0 | Rotation in degrees |
| `scaleX` | SCALE X | slider+number | 0.1–5 | 1 | Horizontal scale factor |
| `scaleY` | SCALE Y | slider+number | 0.1–5 | 1 | Vertical scale factor |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `centreX` | CENTRE X | slider+number | 0–1 | 0.5 | Horizontal pivot (normalised) |
| `centreY` | CENTRE Y | slider+number | 0–1 | 0.5 | Vertical pivot (normalised) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Compute centre in pixels: `(cx, cy) = (centreX·w, centreY·h)`. Translation in pixels: `(tx, ty) = (translateX·w, translateY·h)`.
2. For each output pixel `(x, y)`, compute offset from centre: `(px, py) = (x − cx − tx, y − cy − ty)`.
3. Apply inverse rotation (negate angle) and inverse scale: rotate `(px, py)` by `−rotate`, divide by `(scaleX, scaleY)`.
4. Add centre back to get source coordinate.
5. Sample source via `Sampler.sampleDst` (bilinear on full quality, nearest on preview).

### Output
Transformed RGBA image. Pixels that map outside source bounds are clamped.

### Preview strategy
Sampling mode switches from bilinear to nearest-neighbour.

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
