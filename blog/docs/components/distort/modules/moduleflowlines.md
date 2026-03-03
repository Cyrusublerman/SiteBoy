# MODULE FLOW LINES

Renders flow lines seeded on a grid and advected through a normalised image-derived gradient field, using shared algorithm modules.

## Identity

| Field | Value |
|-------|-------|
| Type string | `moduleflowlines` |
| Category | `LINE RENDER (MODULE)` |
| Module type | vector |
| Source file | `assets/js/tools/processors/distort/nodes/line/ModuleFlowLinesNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| `buildBaseGradient` | `assets/js/shared/algorithms/field/base-gradient.js` | `blog/docs/algorithms/field.md` (if present) |
| `normalizeField` | `assets/js/shared/algorithms/field/vector-field.js` | — |
| `buildFlowLines` | `assets/js/shared/algorithms/line/flow-line-engine.js` | — |
| `vectorToRaster` | `assets/js/tools/processors/distort/nodes/bridge/node-adapters.js` | — |

Uses shared algorithm SSoT for gradient extraction, normalisation, and flow-line construction. No inline algorithm logic.

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
| `strokeW` | STROKE W | slider+number | 0.25–4 | 1 | Line stroke width |
| `bgColor` | BG LEVEL | slider+number | 0–255 | 255 | Background fill level |
| `strokeColor` | STROKE LVL | slider+number | 0–255 | 0 | Stroke fill level |

### Tier 3 (primary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `spacing` | SPACING | slider+number | 2–40 | 8 | Grid spacing between seed points in pixels |
| `iterations` | ITERATIONS | slider+number | 4–200 | 24 | Number of advection steps per line |
| `stepSize` | STEP | slider+number | 0.25–5 | 1 | Advection step size in pixels |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Call `buildBaseGradient(src, w, h, true)` to produce a normalised gradient field.
2. Call `normalizeField(field)`.
3. Seed a uniform grid: every `spacing` pixels (with 1-step margin), collect `(x, y)` positions.
4. Call `buildFlowLines({ field, seeds, iterations, step })` to trace each seed through the gradient field.
5. Rasterise resulting line geometry via `vectorToRaster` with monochrome stroke on flat background.

### Output
Greyscale flow-line image on flat background. Source colour is discarded; gradient drives line paths.

### Preview strategy
`iterations` capped at 12.

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

This module implements `buildGeometry(w, h, ctx)` returning a `LineSet` for SVG export.

**Output format:** Point arrays: one sub-array per seed, each entry `[x, y]` from `buildFlowLines` advection trace.

`buildGeometry()` is called internally by `apply()` before `vectorToRaster`. At the tool level, `DistortActions.exportSVG()` calls `buildGeometry()` directly to bypass rasterisation. See `docs/specs/module-contracts.md` for the `LineSet` schema.

## Modulation targets
All `range`-type params accept image and expression drivers via the `+D` button in the NodePanel. No parameters in this module have pre-wired `getModulated()` calls in the current implementation — all values read directly from `this.params`.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
None in current PRESETS.
