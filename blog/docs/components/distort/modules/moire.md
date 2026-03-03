# MOIRE

Generates a Moiré interference pattern by combining two independent sinusoidal gratings through a binary operator.

## Identity

| Field | Value |
|-------|-------|
| Type string | `moire` |
| Category | `PATTERN` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/pattern/MoireNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Two-grating Moiré interference | Inline | — |

Inline — two independent linear gratings at configurable wavelengths and angles produce `i1`, `i2 ∈ [0,1]`; combined via a binary operator; result blended onto source.

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
| `wavelength1` | WAVE 1 | slider+number | 2–100 | 15 | Spatial period of the first grating |
| `angle1` | ANGLE 1 | slider+number | 0–180 | 0 | Orientation of the first grating in degrees |
| `wavelength2` | WAVE 2 | slider+number | 2–100 | 16 | Spatial period of the second grating |
| `angle2` | ANGLE 2 | slider+number | 0–180 | 5 | Orientation of the second grating in degrees |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `combineMode` | COMBINE | dropdown | `product`, `sum`, `xor`, `min`, `max` | `product` | Binary operator for combining the two gratings |

### Tier 5 (quality/mode)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `blendMode` | BLEND | dropdown | `multiply`, `screen`, `replace` | `multiply` | Compositing mode onto source |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel at `(x, y)`, compute projected position along each grating's axis.
2. `i1 = 0.5 + 0.5 × cos(2π × rx1 / wavelength1)`, `i2 = 0.5 + 0.5 × cos(2π × rx2 / wavelength2)`.
3. Combine via selected operator: `product` (`i1 × i2`), `sum` (`(i1+i2)/2`), `xor` (`|i1−i2|`), `min`, `max`.
4. Blend combined value onto source per channel. Copy alpha.

### Output
Moiré-patterned RGBA image. The beat frequency between the two gratings produces large-scale interference bands.

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
