# CLAHE

Contrast-Limited Adaptive Histogram Equalisation — divides the image into tiles, equalises each independently with clip limiting, and bilinearly interpolates between tile LUTs to eliminate boundary artefacts.

## Identity

| Field | Value |
|-------|-------|
| Type string | `clahe` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/CLAHENode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| CLAHE (Contrast-Limited AHE) | `shared/algorithms/image/colour-adjustments.js` | — |

`shared/algorithms/image/colour-adjustments.js` — two-phase: (1) per-tile luminance histogram with clip-limit redistribution → CDF LUT; (2) bilinear interpolation across four adjacent tile LUTs per pixel.

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
| `tileSize` | TILE SIZE | slider+number | 8–64 (step 8) | 32 | Size in pixels of each adaptive tile |
| `clipLimit` | CLIP LIMIT | slider+number | 1–10 (step 0.5) | 3 | Histogram bin count limit (× tile pixels / 256) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
**Phase 1 — Per-tile LUT construction:**
1. Divide the image into `ceil(w/tileSize) × ceil(h/tileSize)` tiles (boundary tiles may be smaller).
2. For each tile, build a 256-bin BT.601 luminance histogram.
3. Apply clip limiting: bins exceeding `clipCount = round(clipLimit × tilePixels / 256)` are clipped; total excess redistributed uniformly (`inc = floor(excess / 256)`).
4. Compute CDF and normalise to a `[0,255]` LUT.

**Phase 2 — Bilinear interpolation:**
5. For each output pixel, compute fractional tile coordinates with a half-tile offset (`ftx = (x − tileSize/2) / tileSize`).
6. Identify four neighbouring tile LUTs. Compute bilinear weights.
7. For each of R, G, B: look up the channel value in all four tile LUTs and blend bilinearly. Copy alpha.

### Output
Locally equalised RGBA image with smooth transitions between tile regions.

### Preview strategy
No explicit reduction — computation is `O(tiles × tilePixels + pixels)`. Smaller tile sizes implicitly reduce per-tile cost.

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
