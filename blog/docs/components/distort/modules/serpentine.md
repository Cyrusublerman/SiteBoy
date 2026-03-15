# SERPENTINE

Simulates wave fronts advancing across the image with luminance-driven drag, producing flowing or serpentine line patterns.

## Identity

| Field | Value |
|-------|-------|
| Type string | `serpentine` |
| Category | `LINE RENDER` |
| Module type | vector |
| Source file | `assets/js/tools/processors/distort/nodes/line/SerpentineNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Wave-front luminance advection | `shared/algorithms/line/serpentine-line-engine.js` | — |
| `vectorToRaster` | `assets/js/tools/processors/distort/nodes/bridge/node-adapters.js` | — |

`shared/algorithms/line/serpentine-line-engine.js` — wave fronts spawn at `spacing` intervals from the image edge; each point in a front advances by `baseSpeed × (1 − drag)` per iteration, where `drag = lerp(dragLight, dragDark, 1 − lum)`. Sinusoidal lateral offset modulates each front.

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
| `mode` | MODE | dropdown | `flow`, `serpentine` | `flow` | Wave pattern mode |
| `spacing` | SPACING | slider+number | 2–40 | 6 | Distance between wave fronts in pixels |
| `amplitude` | AMPLITUDE | slider+number | 0.5–20 | 2.5 | Lateral sinusoidal displacement magnitude |
| `frequency` | FREQUENCY | slider+number | 0.1–5 | 1 | Sine frequency along the wave front |
| `iterations` | ITERATIONS | slider+number | 10–2000 | 200 | Total simulation steps |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `baseSpeed` | SPEED | slider+number | 0.05–3 | 0.5 | Base advance speed per step |
| `dragLight` | DRAG LIGHT | slider+number | 0–0.8 | 0 | Drag applied in bright areas |
| `dragDark` | DRAG DARK | slider+number | 0–0.95 | 0.5 | Drag applied in dark areas |

## Pipeline Behaviour

### Input
Full RGBA image (used for luminance field).

### Process
1. Build per-pixel luminance field from source.
2. Spawn wave fronts every `spawnInterval = spacing / baseSpeed` frames from the leading edge.
3. Each front is a row of points with sinusoidal initial offset `amplitude × sin(s × frequency × 0.01)`.
4. Each step: advance all active front points by `baseSpeed × (1 − drag(lum))`. Stop at far edge.
5. Render all front point arrays as line segments via `vectorToRaster` on a flat background.

### Output
Greyscale line wave image. Source colour is discarded; luminance drives point drag only.

### Preview strategy
`iterations` capped at 60.

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

**Output format:** Point arrays: one sub-array per wave front, each entry `[x, y]` after per-iteration advance.

`buildGeometry()` is called internally by `apply()` before `vectorToRaster`. At the tool level, `DistortActions.exportSVG()` calls `buildGeometry()` directly to bypass rasterisation. See `docs/specs/module-contracts.md` for the `LineSet` schema.

## Modulation targets
All `range`-type params accept image and expression drivers via the `+D` button in the NodePanel. No parameters in this module have pre-wired `getModulated()` calls in the current implementation — all values read directly from `this.params`.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
WAVEFORM — flow mode, 300 iterations.
