# LEVELS

Remaps the input tonal range with black/white point clipping, gamma correction, and output level scaling.

## Identity

| Field | Value |
|-------|-------|
| Type string | `levels` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/LevelsNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| LUT-based levels remap | `shared/algorithms/image/colour-adjustments.js` | — |

`shared/algorithms/image/colour-adjustments.js` — builds a 256-entry LUT: normalises input to `[0,1]` within `[blackPoint, whitePoint]`, applies `pow(x, 1/gamma)`, scales to `[outBlack, outWhite]`. `isLUT = true` — consecutive LUT nodes (INVERT, CURVES, POSTERIZE, TEMP/TINT) can chain without intermediate pixel passes.

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
| `blackPoint` | BLACK IN | slider+number | 0–255 | 0 | Input shadow clip point |
| `whitePoint` | WHITE IN | slider+number | 0–255 | 255 | Input highlight clip point |
| `midGamma` | GAMMA | slider+number | 0.1–3 | 1 | Midtone gamma correction |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `outBlack` | BLACK OUT | slider+number | 0–255 | 0 | Output shadow floor |
| `outWhite` | WHITE OUT | slider+number | 0–255 | 255 | Output highlight ceiling |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Build a 256-entry `Uint8Array` LUT from the five parameters.
2. For each input value `i ∈ [0,255]`: normalise to `[0,1]` using `(i − blackPoint) / (whitePoint − blackPoint)`, clamped.
3. Apply inverse-gamma power curve: `pow(x, 1 / midGamma)`.
4. Rescale to `[outBlack, outWhite]` and round.
5. Apply identical LUT to R, G, and B channels of each pixel. Copy alpha.

### Output
Tone-remapped RGBA image.

### Preview strategy
No reduction — LUT built once, applied O(1) per pixel.

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
SCAN, LIQUID, DROWNED, SIGNAL, CORRODED, ETCH — used as a tone-finishing step.
