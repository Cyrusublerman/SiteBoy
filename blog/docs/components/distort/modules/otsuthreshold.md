# OTSU THRESH

Automatically determines an optimal global threshold from the luminance histogram and produces either a binary output or a source mask.

## Identity

| Field | Value |
|-------|-------|
| Type string | `otsuthreshold` |
| Category | `SEGMENTATION` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/segmentation/OtsuThresholdNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| `otsuThreshold` | `assets/js/shared/algorithms/segmentation/thresholding.js` | — |

Shared segmentation SSoT. Otsu's method maximises inter-class variance over all possible threshold values to find the globally optimal binary split of the luminance histogram.

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

### Tier 5 (quality/mode)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `mode` | MODE | dropdown | `binary`, `mask` | `binary` | Output mode: pure black/white or gated source |
| `invert` | INVERT | toggle | — | false | Flip the foreground/background classification |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Compute BT.601 luminance for each pixel.
2. Call `otsuThreshold(luma)` to find the optimal threshold `bestT`.
3. For each pixel: `bit = luma > bestT ? 1 : 0`. If `invert`: `bit = 1 − bit`.
4. **Binary mode**: write `bit × 255` to R, G, B.
5. **Mask mode**: write `src[R] × bit, src[G] × bit, src[B] × bit` (gates source through binary mask).
6. Copy alpha.

### Output
**Binary**: black-and-white segmentation map. **Mask**: source RGB preserved in foreground class, zeroed in background class.

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
