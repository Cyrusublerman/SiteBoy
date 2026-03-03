# CANNY EDGE

Full four-stage Canny edge detector: Gaussian smoothing, Sobel gradient, non-maximum suppression, and hysteresis thresholding.

## Identity

| Field | Value |
|-------|-------|
| Type string | `canny` |
| Category | `EDGE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/edge/CannyNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Canny edge detection (4-stage) | Inline | — |

Inline — full pipeline: greyscale → separable Gaussian blur → Sobel gradient → non-maximum suppression (4-direction quantisation) → hysteresis thresholding (strong/weak/zero with connectivity promotion).

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
| `sigma` | SIGMA | slider+number | 0.5–5 | 1.4 | Gaussian sigma for pre-smoothing |
| `lowThreshold` | LOW THRESH | slider+number | 0.01–0.5 | 0.1 | Hysteresis lower threshold (fraction of max gradient) |
| `highThreshold` | HIGH THRESH | slider+number | 0.05–1 | 0.3 | Hysteresis upper threshold (fraction of max gradient) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. **Greyscale**: BT.601 luminance.
2. **Gaussian blur**: separable 1D kernel, radius `ceil(sigma × 3)`.
3. **Gradient**: apply 3×3 Sobel to blurred luminance; compute `mag` and `dir = atan2(Gy, Gx)`. Track `maxMag`.
4. **Non-maximum suppression (NMS)**: quantise gradient direction to 4 orientations (0°, 45°, 90°, 135°). Zero the pixel if not a local maximum along its gradient direction.
5. **Hysteresis thresholding**: classify pixels as strong (`≥ hi·maxMag` → 255), weak (`≥ lo·maxMag` → 128), or zero. Iteratively promote weak pixels adjacent to strong ones. Remaining weak pixels set to zero.
6. Write to R, G, B. Copy alpha.

### Output
Binary-ish edge map (0 = no edge, 255 = detected edge). Cleaner, thinner edges than Sobel alone.

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
CORRODED — sigma 1.4, low 0.08, high 0.2; then dilated and dithered.
