# LENS BUBBLES

Places randomly positioned magnifying lens bubbles on the image, each applying a smooth radial magnification warp.

## Identity

| Field | Value |
|-------|-------|
| Type string | `lensbubbles` |
| Category | `REFRACTION` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/refraction/LensBubblesNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Radial magnification warp | Inline | — |
| `SeededRNG` | `assets/js/tools/processors/distort/core/SeededRNG.js` | — |
| `Sampler.sampleDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

Inline — magnification factor `m = 1 + (magnification−1) × edgeSoftness × (1−t²)` where `t = dist/r`. Source pulled toward bubble centre by `1/m`.

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
| `count` | COUNT | slider+number | 1–30 | 5 | Number of lens bubbles |
| `magnification` | MAGNIFY | slider+number | 0.2–5 | 1.5 | Peak magnification at bubble centre |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `minRadius` | MIN RAD | slider+number | 0.01–0.3 | 0.03 | Minimum bubble radius (fraction of image diagonal) |
| `maxRadius` | MAX RAD | slider+number | 0.02–0.5 | 0.12 | Maximum bubble radius (fraction of image diagonal) |
| `edgeSoft` | EDGE SOFT | slider+number | 0–1 | 0.2 | Width of soft transition at bubble edge |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Generate `count` bubble positions and radii using `SeededRNG` from `ctx.nodeSeed`.
2. For each pixel, iterate over bubbles in order; on the first bubble the pixel falls inside:
3. Compute `t = dist/r` (normalised radius). Apply edge softness factor.
4. Compute magnification factor `m = 1 + (magnification−1) × softFactor × (1−t²)`.
5. Pull source coordinate toward bubble centre: `(sx, sy) = centre + (dx, dy)/m`.
6. Break (first bubble wins).
7. Sample source via `Sampler.sampleDst` (bilinear or nearest).

### Output
Lens-distorted RGBA image with magnified bubble regions.

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
DROWNED — 8 bubbles, magnification 2, edgeSoft 0.3.
