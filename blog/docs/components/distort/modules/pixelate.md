# PIXELATE

Divides the image into rectangular blocks and fills each with the average colour of its pixels.

## Identity

| Field | Value |
|-------|-------|
| Type string | `pixelate` |
| Category | `DISTORTION` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/distortion/PixelateNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Block average | `shared/algorithms/geometry/distortion.js` | — |

`shared/algorithms/geometry/distortion.js` — two-pass tile averaging: sum R, G, B across all pixels in each `blockSize × blockSize` tile; write the average to all pixels in the tile.

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
| `blockSize` | BLOCK SIZE | slider+number | 2–100 | 8 | Width and height of each pixel block |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Iterate over tiles in `blockSize × blockSize` steps.
2. Accumulate R, G, B over all pixels in the tile; compute averages.
3. Write the averaged colour to every pixel in the tile.
4. Alpha copied from source unchanged.

### Output
Pixelated RGBA image.

### Preview strategy
No explicit reduction — already fast at large block sizes; small sizes on preview are inherently cheaper.

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
