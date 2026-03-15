# CHROMATIC AB

Simulates chromatic aberration by laterally displacing the red and blue channels outward from a centre point.

## Identity

| Field | Value |
|-------|-------|
| Type string | `chromaticab` |
| Category | `DISTORTION` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/distortion/ChromaticAbNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Radial channel shift | `shared/algorithms/geometry/distortion.js` | — |

`shared/algorithms/geometry/distortion.js` — for each pixel, compute normalised radial distance `t = dist/maxDist` and angle `ang = atan2(dy, dx)`. Red and blue channels sampled from shifted positions; green channel copied from source.

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
| `redShift` | RED SHIFT | slider+number | -20–20 | 2 | Radial shift magnitude for the red channel |
| `blueShift` | BLUE SHIFT | slider+number | -20–20 | -2 | Radial shift magnitude for the blue channel |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `centreX` | CENTRE X | slider+number | 0–1 | 0.5 | Horizontal aberration origin (normalised) |
| `centreY` | CENTRE Y | slider+number | 0–1 | 0.5 | Vertical aberration origin (normalised) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel at `(x, y)`, compute vector from centre `(dx, dy)`, `dist`, and radial angle `ang`.
2. Normalised distance `t = dist / maxDist` where `maxDist = sqrt(w²+h²)/2`.
3. Sample red channel from `(x + cos(ang)·t·redShift, y + sin(ang)·t·redShift)`.
4. Sample blue channel from `(x + cos(ang)·t·blueShift, y + sin(ang)·t·blueShift)`.
5. Copy green channel and alpha from the original source pixel.

### Output
Chromatic-aberration RGBA image with R and B channels radially offset from G.

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
All `range`-type params accept image and expression drivers via the `+D` button in the NodePanel. `redShift` and `blueShift` do not support per-pixel modulation in the current implementation — `apply()` has no `ctx` parameter.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
HOLOGRAM — redShift +4, blueShift −4.
