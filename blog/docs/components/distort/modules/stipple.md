# STIPPLE

Generates a luminance-weighted Poisson-disk stipple pattern — dense dots in dark areas, sparse in bright areas.

## Identity

| Field | Value |
|-------|-------|
| Type string | `stipple` |
| Category | `COMPOSITE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/composite/StippleNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Luminance-weighted Poisson-disk sampling | `shared/algorithms/image/compositing.js` | — |
| `SeededRNG` | `assets/js/tools/processors/distort/core/SeededRNG.js` | — |

`shared/algorithms/image/compositing.js` — spatial hash grid enforces minimum distance `minDist` between points. Luminance-proportional rejection probability gates point placement density. Accepted points rasterised as filled circles.

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

### Tier 2 (type-specific)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `bgLevel` | BG LEVEL | slider+number | 0–255 | 255 | Background fill level |
| `dotLevel` | DOT LEVEL | slider+number | 0–255 | 0 | Dot fill level |

### Tier 3 (primary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `minDist` | MIN DIST | slider+number | 2–20 | 4 | Minimum distance between dot centres |
| `dotRadius` | DOT RAD | slider+number | 0.5–5 | 1.5 | Dot radius in pixels |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `attempts` | ATTEMPTS | slider+number | 5–100 | 30 | Maximum candidate points attempted |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Build a BT.601 luminance map.
2. Create a spatial grid (`cellSize = minDist/√2`).
3. For up to 15000 candidate points (3000 in preview): generate random `(px, py)`. Sample luminance. Reject if `random > (1−lum)×0.8 + 0.1`. Check spatial grid for `minDist` violation. If accepted, store in grid.
4. Fill destination with `bgLevel`. Rasterise each accepted point as a filled circle of `dotRadius` in `dotLevel`.

### Output
Monochrome stipple image. Dark source areas have more, denser dots.

### Preview strategy
Maximum candidate points capped at 3000 (vs 15000 full).

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
