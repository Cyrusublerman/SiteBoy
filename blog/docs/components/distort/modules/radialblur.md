# RADIAL BLUR

Blurs radially from a centre point in either zoom (scale) or spin (rotation) mode.

## Identity

| Field | Value |
|-------|-------|
| Type string | `radialblur` |
| Category | `BLUR` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/blur/RadialBlurNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Radial sample averaging (zoom / spin) | Inline | — |

Inline — `samples` positions computed by scaling or rotating the displacement vector from centre; nearest-neighbour sampling; averaged per channel.

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
| `type` | TYPE | dropdown | `zoom`, `spin` | `zoom` | Radial blur mode |
| `amount` | AMOUNT | slider+number | 1–50 | 10 | Blur magnitude (scale/angle range) |
| `centreX` | CENTRE X | slider+number | 0–1 | 0.5 | Horizontal blur origin (normalised) |
| `centreY` | CENTRE Y | slider+number | 0–1 | 0.5 | Vertical blur origin (normalised) |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `samples` | SAMPLES | slider+number | 4–32 | 12 | Number of averaged samples per pixel |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel, compute displacement `(px, py)` from centre.
2. For each of `samples` steps (parameterised `t ∈ [−1, 1]`):
   - **Zoom**: scale the displacement by `1 + t × amount × 0.002` and add back to centre. At `amount = 50` the scale range is `[0.9, 1.1]` — a ±10% zoom band.
   - **Spin**: rotate the displacement by `t × amount × 0.002` radians around centre. At `amount = 50` the rotation range is `±0.1 rad ≈ ±5.7°`.
3. Clamp and round to nearest pixel; sample source.
4. Average all RGBA samples and write.

### Output
Radially blurred RGBA image (streaked toward/away from centre or rotated around it).

### Preview strategy
`samples` halved.

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
