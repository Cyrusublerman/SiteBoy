# SPHERIZE

Applies a spherical lens distortion within a circular region, pinching (positive) or bulging (negative) the image.

## Identity

| Field | Value |
|-------|-------|
| Type string | `spherize` |
| Category | `DISTORTION` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/distortion/SpherizeNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Radial power-curve remap | Inline | — |
| `Sampler.bilinearDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

Inline — normalised distance `t = dist/r` remapped by power curve: `newR = t^(1+amount)·r` (positive/pinch) or `newR = t^(1/(1−amount))·r` (negative/bulge). Displacement vector rescaled accordingly.

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
| `amount` | AMOUNT | slider+number | -1–1 | 0.5 | Distortion strength (+pinch / −bulge) |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `centreX` | CENTRE X | slider+number | 0–1 | 0.5 | Horizontal distortion centre (normalised) |
| `centreY` | CENTRE Y | slider+number | 0–1 | 0.5 | Vertical distortion centre (normalised) |
| `radius` | RADIUS | slider+number | 0.01–1 | 0.5 | Effect radius (fraction of min dimension) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Compute pixel radius `r = radius × min(w, h)`.
2. For each pixel inside the circle: compute normalised distance `t = dist/r`.
3. Apply power curve:
   - `amount > 0`: `newR = t^(1+amount) × r` (pulls centre inward — pinch).
   - `amount ≤ 0`: `newR = t^(1/(1−amount)) × r` (pushes centre outward — bulge).
4. Scale displacement vector by `newR/dist`, sample source bilinearly.
5. Pixels outside radius copied verbatim.

### Output
Spherically distorted RGBA image within the specified circle.

### Preview strategy
No explicit reduction.

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
