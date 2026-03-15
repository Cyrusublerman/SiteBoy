# SOBEL EDGE

Detects edges by computing the gradient magnitude via 3×3 Sobel kernels applied to the luminance channel.

## Identity

| Field | Value |
|-------|-------|
| Type string | `sobel` |
| Category | `EDGE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/edge/SobelNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Sobel gradient magnitude | `shared/algorithms/edge-detection/edge-operators.js` | — |

`shared/algorithms/edge-detection/edge-operators.js` — standard 3×3 Sobel kernels (Gx, Gy); `mag = sqrt(Gx² + Gy²)`. Optional normalisation by `255/maxMag`. Interior pixels only.

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
| `threshold` | THRESHOLD | slider+number | 0–255 | 0 | Minimum gradient magnitude to output as non-zero |

### Tier 5 (quality/mode)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `normalize` | NORMALIZE | toggle | — | 1 | Rescale output to fill 0–255 range |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Convert to BT.601 luminance (single-channel float buffer).
2. For each interior pixel, apply 3×3 Sobel kernels: `Gx` (horizontal edges), `Gy` (vertical edges).
3. Compute gradient magnitude `mag = sqrt(Gx² + Gy²)`.
4. If `normalize`: track maximum magnitude over the pass; scale all values by `255/maxMag`.
5. Apply threshold: `v = (mag × scale > threshold) ? mag × scale : 0`.
6. Write `v` to R, G, B. Copy alpha.

### Output
Greyscale edge-magnitude image. Border pixels (not covered by the 3×3 kernel) remain zero.

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
ETCH — threshold 10, normalised; inverted and dithered subsequently.
