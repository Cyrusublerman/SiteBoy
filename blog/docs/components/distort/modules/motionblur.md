# MOTION BLUR

Blurs along a directional vector by averaging a symmetrically sampled strip of pixels.

## Identity

| Field | Value |
|-------|-------|
| Type string | `motionblur` |
| Category | `BLUR` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/blur/MotionBlurNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Directional sample averaging | `shared/algorithms/image/blur-filters.js` | — |

`shared/algorithms/image/blur-filters.js` — `samples = max(3, distance)` nearest-neighbour samples symmetrically distributed along the direction vector. Clamped boundary.

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
| `angle` | ANGLE | slider+number | 0–360 | 0 | Direction of motion blur in degrees |
| `distance` | DISTANCE | slider+number | 1–100 | 10 | Blur length in pixels |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Compute direction vector `(dx, dy) = (cos(angle), sin(angle))`.
2. For each pixel, sample `max(3, distance)` positions symmetrically along the vector (centred on the pixel), at intervals of `distance / (samples−1)`.
3. Clamp sample coordinates to image bounds (nearest-neighbour).
4. Average the RGBA values of all samples and write to destination.

### Output
Directionally motion-blurred RGBA image.

### Preview strategy
`distance` halved.

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
