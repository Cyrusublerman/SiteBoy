# RADIAL RIPPLE

Applies radially expanding sinusoidal displacement from a centre point with exponential distance falloff.

## Identity

| Field | Value |
|-------|-------|
| Type string | `ripple` |
| Category | `REFRACTION` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/refraction/RadialRippleNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Radial sinusoidal displacement | Inline | — |
| `Sampler.sampleDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

Inline — displacement `= sin(dist/w × freq × 2π + phase) × amplitude × exp(−(dist/maxDist) × falloff)` along the outward angle.

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
| `amplitude` | AMPLITUDE | slider+number | 0–100 | 15 | Peak displacement in pixels |
| `frequency` | FREQUENCY | slider+number | 0.5–50 | 10 | Number of ripple cycles per image width |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `centreX` | CENTRE X | slider+number | 0–1 | 0.5 | Horizontal ripple origin (normalised) |
| `centreY` | CENTRE Y | slider+number | 0–1 | 0.5 | Vertical ripple origin (normalised) |
| `phase` | PHASE | slider+number | 0–6.28 (radians) | 0 | Phase offset of the ripple wave |
| `falloff` | FALLOFF | slider+number | 0–5 | 1 | Exponential attenuation rate with distance |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel at `(x, y)`, compute vector `(dx, dy)` from centre and Euclidean distance `dist`.
2. Skip if `dist < 0.001` (copy directly).
3. Compute radial displacement `off = sin(dist/w × freq × 2π + phase) × amplitude × exp(−(dist/maxDist) × falloff)`.
4. Sample source at `(x + cos(angle)·off, y + sin(angle)·off)` via `Sampler.sampleDst`.

### Output
Radially ripple-distorted RGBA image.

### Preview strategy
Sampling switches to nearest-neighbour.

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
DROWNED — amplitude 20, frequency 15, falloff 1.5.
