# MODULE SERPENTINE

Renders image-independent serpentine wave lines using the shared serpentine-line-engine algorithm.

## Identity

| Field | Value |
|-------|-------|
| Type string | `moduleserpentine` |
| Category | `LINE RENDER (MODULE)` |
| Module type | vector |
| Source file | `assets/js/tools/processors/distort/nodes/line/ModuleSerpentineNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| `buildSerpentineLines` | `assets/js/shared/algorithms/line/serpentine-line-engine.js` | — |
| `vectorToRaster` | `assets/js/tools/processors/distort/nodes/bridge/node-adapters.js` | — |

Uses the shared serpentine algorithm SSoT. No inline algorithm logic. Source pixels are not read — geometry is entirely parametric.

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
| `spacing` | SPACING | slider+number | 2–40 | 8 | Distance between serpentine lines |
| `amplitude` | AMPLITUDE | slider+number | 0.5–20 | 3 | Peak lateral displacement of each line |
| `frequency` | FREQUENCY | slider+number | 0.05–1.5 | 0.2 | Sine frequency along the line axis |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `jitter` | JITTER | slider+number | 0–4 | 0.4 | Random per-point jitter added to each line (uses `ctx.nodeSeed`) |

## Pipeline Behaviour

### Input
Source pixels are not used. Dimensions `(w, h)` are used for geometry scaling only.

### Process
1. Call `buildSerpentineLines({ width, height, spacing, amplitude, frequency, seed: ctx.nodeSeed, jitter })`.
2. Rasterise resulting line geometry via `vectorToRaster` with monochrome stroke on flat background.

### Output
Greyscale serpentine wave image on flat background.

### Preview strategy
`jitter` halved in preview.

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

**Output format:** Point arrays: one sub-array per wave line, each entry `[x, y]` from `buildSerpentineLines`.

`buildGeometry()` is called internally by `apply()` before `vectorToRaster`. At the tool level, `DistortActions.exportSVG()` calls `buildGeometry()` directly to bypass rasterisation. See `docs/specs/module-contracts.md` for the `LineSet` schema.

## Modulation targets
All `range`-type params accept image and expression drivers via the `+D` button in the NodePanel. No parameters in this module have pre-wired `getModulated()` calls in the current implementation — all values read directly from `this.params`.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
None in current PRESETS.
