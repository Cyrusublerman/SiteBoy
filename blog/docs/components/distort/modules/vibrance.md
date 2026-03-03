# VIBRANCE

Boosts saturation selectively — already-saturated pixels receive less boost than desaturated ones.

## Identity

| Field | Value |
|-------|-------|
| Type string | `vibrance` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/VibranceNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Saturation-aware selective boost | Inline | — |

Inline — `sat = max − min` (chroma range); `amt = vibrance × (1 − sat)²`; each channel pushed away from mean: `out = ch + (ch − avg) × amt`.

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
| `vibrance` | VIBRANCE | slider+number | -1–1 | 0 | Saturation boost amount (0 = no change) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Normalise each pixel's R, G, B to `[0,1]`.
2. Compute chroma range `sat = max(R,G,B) − min(R,G,B)`.
3. Compute per-pixel amount `amt = vibrance × (1 − sat)²` — quadratic falloff protects already-saturated pixels.
4. Compute per-channel mean `avg = (R + G + B) / 3`.
5. Push each channel away from the mean: `out = ch + (ch − avg) × amt`.
6. Clamp to `[0,1]`, scale to `[0,255]`. Copy alpha.

### Output
Vibrance-adjusted RGBA image.

### Preview strategy
No reduction — O(n) per pixel.

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
DARKROOM — subtle vibrance boost.
