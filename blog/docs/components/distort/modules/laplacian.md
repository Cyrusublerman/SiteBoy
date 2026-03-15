# LAPLACIAN

Computes the Laplacian (second-order derivative) of the luminance channel to detect edges and blobs.

## Identity

| Field | Value |
|-------|-------|
| Type string | `laplacian` |
| Category | `EDGE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/edge/LaplacianNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Discrete Laplacian operator | `shared/algorithms/edge-detection/edge-operators.js` | — |

`shared/algorithms/edge-detection/edge-operators.js` — two kernel modes: 4-connected (`[0,1,0 / 1,−4,1 / 0,1,0]`) or 8-connected (`[1,1,1 / 1,−8,1 / 1,1,1]`). Output is absolute value of the convolution result.

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
| `mode` | MODE | dropdown | `4-conn`, `8-conn` | `4-conn` | Kernel connectivity — 4-connected detects axis-aligned edges; 8-connected includes diagonals |

### Tier 5 (quality/mode)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `normalize` | NORMALIZE | toggle | — | 1 | Rescale output to fill 0–255 range |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Convert to BT.601 luminance.
2. For each interior pixel, convolve with the selected Laplacian kernel.
3. Take absolute value of the result.
4. If `normalize`: scale all values by `255/maxV`.
5. Write to R, G, B. Copy alpha.

### Output
Greyscale Laplacian response image. Edges appear as bright pixels; uniform regions are dark.

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
