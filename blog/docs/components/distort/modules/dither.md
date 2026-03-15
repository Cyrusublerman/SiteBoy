# DITHER

Quantises to N grey levels with optional spatial error diffusion (Floyd-Steinberg) or ordered (Bayer 8×8) dithering.

## Identity

| Field | Value |
|-------|-------|
| Type string | `dither` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/DitherNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Floyd-Steinberg error diffusion | `shared/algorithms/image/colour-adjustments.js` | — |
| Bayer 8×8 ordered dither | `shared/algorithms/image/colour-adjustments.js` | — |

Module-level constant `BAYER8` (64-entry matrix). Floyd-Steinberg diffuses quantisation error to 4 neighbours with standard weights (7/16, 3/16, 5/16, 1/16). Bayer adds a threshold offset from the matrix before quantisation.

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
| `method` | METHOD | dropdown | `floyd-steinberg`, `bayer`, `none` | `floyd-steinberg` | Dither algorithm |
| `levels` | LEVELS | slider+number | 2–16 | 2 | Number of quantisation levels |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `strength` | STRENGTH | slider+number | 0–2 | 1 | Error/threshold magnitude multiplier |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
**Bayer path:**
1. For each pixel at `(x, y)`: look up threshold `= (BAYER8[(y%8)×8 + (x%8)] / 64 − 0.5) × step × strength`.
2. Add threshold to each channel and quantise to the nearest level step. Clamp and round.

**Floyd-Steinberg path:**
1. Copy source RGB to a `Float32Array` buffer (per-channel).
2. Traverse pixels left-to-right, top-to-bottom: quantise each channel to the nearest level step, compute error `= (old − quantised) × strength`, diffuse error to 4 neighbours with weights 7/16, 3/16, 5/16, 1/16.
3. Write clamped result to destination.

**None:** Direct buffer copy.

Alpha is always copied unchanged.

### Output
Dithered RGBA image at `levels` discrete values per channel.

### Preview strategy
No preview reduction — but `none` mode is always fast; `bayer` is O(n); Floyd-Steinberg is O(n) with constant neighbourhood.

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
DATAMOSH — Bayer dither with 4 levels. SIGNAL — Floyd-Steinberg at 80% strength. CORRODED — Floyd-Steinberg 2-level. ETCH — Bayer 3-level at 70% strength.
