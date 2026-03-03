# TWIRL

Rotates pixels within a circular region by an angle that decreases from the centre outward, creating a swirl effect.

## Identity

| Field | Value |
|-------|-------|
| Type string | `twirl` |
| Category | `DISTORTION` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/distortion/TwirlNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Radial twist rotation | Inline | — |
| `Sampler.bilinearDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

Inline — falloff `t = 1 − dist/r`; twist angle `= t² × maxAngle`. Standard 2D rotation applied to the displacement vector from centre.

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
| `angle` | ANGLE | slider+number | -720–720 | 180 | Total twist at the centre in degrees |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `centreX` | CENTRE X | slider+number | 0–1 | 0.5 | Horizontal twirl centre (normalised) |
| `centreY` | CENTRE Y | slider+number | 0–1 | 0.5 | Vertical twirl centre (normalised) |
| `radius` | RADIUS | slider+number | 0.01–1 | 0.5 | Effect radius (fraction of min dimension) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Compute effect radius `r = radius × min(w, h)`.
2. For each pixel inside the circle: compute displacement `(dx, dy)` from centre and distance `dist`.
3. Falloff `t = 1 − dist/r`; twist angle `θ = t² × angle × π/180`.
4. Rotate `(dx, dy)` by `θ` and add back to centre to get source coordinate.
5. Sample source bilinearly. Pixels outside radius copied verbatim.

### Output
Twirl-distorted RGBA image. Centre has maximum rotation, fading smoothly to zero at the edge radius.

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
