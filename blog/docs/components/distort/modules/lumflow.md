# LUMINANCE FLOW

Renders a rasterised line field where line positions are iteratively displaced by the image's luminance gradient, producing contour-following flow patterns.

## Identity

| Field | Value |
|-------|-------|
| Type string | `lumflow` |
| Category | `LINE RENDER` |
| Module type | vector |
| Source file | `assets/js/tools/processors/distort/nodes/line/LuminanceFlowNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Luminance gradient vector field | `shared/algorithms/line/flow-line-engine.js` | — |
| Iterative line advection | `shared/algorithms/line/flow-line-engine.js` | — |
| `vectorToRaster` | `assets/js/tools/processors/distort/nodes/bridge/node-adapters.js` | — |

`shared/algorithms/line/flow-line-engine.js` — `VectorFieldMap` computes a Sobel-like per-pixel gradient (luminance, magnitude, angle). `LineGenerator` seeds lines by pattern type and iteratively accumulates displacements from the gradient field. `vectorToRaster` converts line geometry to pixels.

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
| `strokeWeight` | STROKE W | slider+number | 0.1–4 | 0.7 | Line stroke width in pixels |
| `bgBrightness` | BG LEVEL | slider+number | 0–255 | 10 | Background fill level |

### Tier 3 (primary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `patternType` | PATTERN | dropdown | `horizontal`, `vertical`, `diagonal`, `grid`, `radial`, `concentric` | `horizontal` | Line seeding pattern |
| `spacing` | SPACING | slider+number | 1–40 | 8 | Distance between seed lines in pixels |
| `amplitude` | AMPLITUDE | slider+number | 0–80 | 15 | Maximum luminance-driven displacement per iteration |
| `iterations` | ITERATIONS | slider+number | 1–20 | 3 | Number of advection passes |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `resolution` | STEP | slider+number | 1–10 | 2 | Sample step size along each line |
| `lumExp` | LUM EXP | slider+number | 0.2–4 | 1 | Luminance exponent for displacement weighting |
| `damping` | DAMPING | slider+number | 0.01–1 | 0.95 | Decay of accumulated displacements between iterations |

## Pipeline Behaviour

### Input
Full RGBA image (used for luminance gradient extraction).

### Process
1. Build `VectorFieldMap` from source: per-pixel BT.601 luminance, Sobel gradient magnitude and direction, tangent direction.
2. `LineGenerator` creates seed points from the selected `patternType` at `spacing` intervals.
3. For each of `iterations`: damp accumulated displacements by `(1 − damping)`; add `lum^lumExp × amplitude` displacement from the gradient field at each line point's position.
4. Assemble rasterised lines (seed + total accumulated displacement) and call `vectorToRaster` with white stroke (alpha 204) on `bgBrightness` background.

> **Note:** stroke colour is hardcoded to white at alpha 204. Unlike SERPENTINE and STATICHALFTONE which expose `strokeColor`, luminance flow does not — the only tonal control is `bgBrightness`.

### Output
Greyscale rasterised line image on a flat background. Source colour information is discarded.

### Preview strategy
`iterations` capped at 2.

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


## Vector geometry export

This module implements `applyVector(src, w, h, p, ctx)` returning a `LineSet` for SVG export.

**Output format:** Point arrays: one sub-array per seed line, each entry `[x, y]` after advection displacement.

`applyVector()` is called internally by `apply()` before `vectorToRaster`. At the tool level, `DistortActions.exportSVG()` calls `applyVector()` directly to bypass rasterisation. See `docs/specs/module-contracts.md` for the `LineSet` schema.

## Modulation targets
All `range`-type params accept image and expression drivers via the `+D` button in the NodePanel. No parameters in this module have pre-wired `getModulated()` calls in the current implementation — all values read directly from `this.params`.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
ENGRAVE — horizontal lines, spacing 6, amplitude 15.
