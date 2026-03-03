# POLAR COORDS

Converts the image between rectangular and polar coordinate systems.

## Identity

| Field | Value |
|-------|-------|
| Type string | `polarcoords` |
| Category | `DISTORTION` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/distortion/PolarCoordsNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Rectangular ↔ polar coordinate remap | Inline | — |
| `Sampler.bilinearDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

Inline — `rectToPolar`: output `(x, y)` maps to source at `(cx + cos(angle)·r, cy + sin(angle)·r)` where `angle = x/w·2π`, `r = y/h·maxR`. `polarToRect`: inverse mapping from polar to rectangular space.

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
| `mode` | MODE | dropdown | `rectToPolar`, `polarToRect` | `rectToPolar` | Transform direction |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `centreX` | CENTRE X | slider+number | 0–1 | 0.5 | Horizontal polar origin (normalised) |
| `centreY` | CENTRE Y | slider+number | 0–1 | 0.5 | Vertical polar origin (normalised) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
**rectToPolar:**
1. For each output pixel `(x, y)`: interpret x as angle `= (x/w)·2π` and y as radius `= (y/h)·maxR`.
2. Back-map to source Cartesian coordinates `(cx + cos(angle)·r, cy + sin(angle)·r)`.
3. Sample source bilinearly.

**polarToRect:**
1. For each output pixel, compute polar coordinates relative to centre.
2. Map angle to x-axis (normalised) and radius to y-axis.
3. Sample source bilinearly.

### Output
Coordinate-remapped RGBA image. Wraps a linear image into a ring, or unwraps a radial pattern into a horizontal band.

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
