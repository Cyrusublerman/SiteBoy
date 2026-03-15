# HIGH PASS

Extracts fine detail by subtracting a Gaussian-blurred version and lifting the difference to mid-grey (128).

## Identity

| Field | Value |
|-------|-------|
| Type string | `highpass` |
| Category | `SHARPEN` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/sharpen/HighPassNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Separable Gaussian blur | `shared/algorithms/image/spatial-filters.js` | — |
| High-pass: `out = (src − blur) + 128` | `shared/algorithms/image/spatial-filters.js` | — |

`shared/algorithms/image/spatial-filters.js` — same Gaussian kernel as GaussBlur and UnsharpMask. Output lifts the signed difference to a neutral grey midpoint so the result can be used as a detail layer.

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
| `radius` | RADIUS | slider+number | 0.1–50 | 5 | Gaussian sigma defining the frequency cutoff |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Build a normalised Gaussian kernel from `radius`.
2. Separable horizontal then vertical convolution → blur buffer.
3. For each pixel per channel: `out = clamp((src − blur) + 128, 0, 255)`.
4. Copy alpha.

### Output
High-pass RGBA image. Mid-grey (128) represents no detail; lighter/darker pixels are positive/negative detail deviations from the blurred version.

### Preview strategy
`radius` halved.

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
