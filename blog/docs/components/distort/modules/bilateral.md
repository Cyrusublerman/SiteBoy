# BILATERAL

Edge-preserving blur that weights neighbours by both spatial distance and colour similarity.

## Identity

| Field | Value |
|-------|-------|
| Type string | `bilateral` |
| Category | `BLUR` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/blur/BilateralFilterNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Joint bilateral filter | `shared/algorithms/image/blur-filters.js` | — |

`shared/algorithms/image/blur-filters.js` — weight `= exp(−spatial² / 2σs² − colorDelta² / 2σr²)`. Kernel radius `= ceil(spatialSigma × 2)`. No lookup table — full per-pixel neighbourhood computation.

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
| `spatialSigma` | SPATIAL σ | slider+number | 1–20 (step 0.5) | 5 | Gaussian falloff with spatial distance |
| `rangeSigma` | RANGE σ | slider+number | 5–100 | 30 | Gaussian falloff with colour difference (higher = smoother across edges) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel at `(x, y)` (centre pixel colour `(cr, cg, cb)`):
2. Iterate over the neighbourhood of radius `ceil(spatialSigma × 2)`.
3. For each neighbour at `(nx, ny)` with colour `(nr, ng, nb)`:
   - `spatialWeight = exp(−(dx²+dy²) / (2σs²))`
   - `colorWeight = exp(−((nr−cr)²+(ng−cg)²+(nb−cb)²) / (2σr²))`
   - `weight = spatialWeight × colorWeight`
4. Accumulate weighted sums for each channel; divide by total weight.
5. Copy alpha.

### Output
Bilaterally filtered RGBA image. Smooth within regions, edges preserved.

### Preview strategy
`spatialSigma` halved.

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
None in current PRESETS. Note: O(n × (2r+1)²) — computationally expensive at high `spatialSigma`.
