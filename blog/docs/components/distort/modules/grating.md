# GRATING

Generates a sinusoidal grating pattern in one of four coordinate systems and blends it onto the source.

## Identity

| Field | Value |
|-------|-------|
| Type string | `grating` |
| Category | `PATTERN` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/pattern/GratingNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Sinusoidal grating (linear, radial, angular, spiral) | `shared/algorithms/patterns/pattern-generators.js` | — |

`shared/algorithms/patterns/pattern-generators.js` — `intensity = 0.5 + 0.5 × cos(2π × position/wavelength + phase)` where position is computed in the selected coordinate system. Blended per channel via `multiply`, `screen`, or `replace`.

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
| `type` | TYPE | dropdown | `linear`, `radial`, `angular`, `spiral` | `linear` | Coordinate system for grating |
| `wavelength` | WAVELENGTH | slider+number | 2–200 | 20 | Spatial period in pixels (linear/radial/spiral) or angular frequency multiplier (angular mode) |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `angle` | ANGLE | slider+number | 0–360 | 0 | Rotation of linear grating in degrees |
| `phase` | PHASE | slider+number | 0–1 | 0 | Phase offset of the cosine (normalised) |
| `spiralRate` | SPIRAL RATE | slider+number | 0.1–10 | 1 | Angular winding rate for spiral mode |

### Tier 5 (quality/mode)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `blendMode` | BLEND | dropdown | `multiply`, `screen`, `replace` | `multiply` | Compositing mode |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel, compute sinusoidal grating `intensity ∈ [0,1]` in the selected coordinate system:
   - **linear**: rotated projection along `angle`.
   - **radial**: Euclidean distance from centre.
   - **angular**: `atan2` angle from centre. In this mode `wavelength` is used as a raw multiplier to `θ` (radians), not a spatial period — higher values = more angular segments around 360°.
   - **spiral**: combined radial + angular (Archimedean spiral). `wavelength` controls the radial period; `spiralRate` controls angular winding rate.
2. Apply selected blend mode per channel. Copy alpha.

### Output
Grating-patterned RGBA image.

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
HOLOGRAM — linear grating at 30°, `screen` blend at 40% opacity.
