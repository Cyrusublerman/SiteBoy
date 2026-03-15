# STATIC HALFTONE

Renders parallel sinusoidal halftone lines where amplitude encodes local luminance, with configurable curve shaping.

## Identity

| Field | Value |
|-------|-------|
| Type string | `statichalftone` |
| Category | `LINE RENDER` |
| Module type | vector |
| Source file | `assets/js/tools/processors/distort/nodes/line/StaticHalftoneNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Sinusoidal halftone line rendering | `shared/algorithms/line/static-line-engine.js` | — |
| Amplitude curve shaping (`applyCurve`) | `shared/algorithms/line/static-line-engine.js` | — |
| `vectorToRaster` | `assets/js/tools/processors/distort/nodes/bridge/node-adapters.js` | — |

`shared/algorithms/line/static-line-engine.js` — `applyCurve` supports `linear`, `exponential` (`t^str`), `logarithmic` (natural-log remap), and `sigmoid` (logistic) shaping. Per-sample displacement `= maxAmplitude × curve(1−lum) × sin(s/len × freq + phase)`.

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
| `spacing` | SPACING | slider+number | 2–40 | 6 | Distance between halftone lines in pixels |
| `maxAmplitude` | MAX AMP | slider+number | 0.5–30 | 3 | Peak perpendicular displacement in pixels |
| `frequency` | FREQUENCY | slider+number | 5–300 | 60 | Number of sine cycles per line |
| `orientation` | ORIENT | dropdown | `horizontal`, `vertical` | `horizontal` | Line axis |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `sampleStep` | DENSITY | slider+number | 0.5–5 | 1 | Sample interval along each line |
| `phaseOffset` | PHASE | slider+number | 0–6.28 | 0 | Global phase offset |
| `phaseInc` | PHASE INC | slider+number | 0–3.14 | 0 | Per-line phase increment |
| `ampCurve` | AMP CURVE | dropdown | `linear`, `exponential`, `logarithmic`, `sigmoid` | `linear` | Amplitude response curve |
| `curveStrength` | CURVE STR | slider+number | 0.5–5 | 2 | Curve shaping parameter |

## Pipeline Behaviour

### Input
Full RGBA image (used for luminance only).

### Process
1. Build per-pixel luminance.
2. Generate `numLines = dim/spacing` parallel lines.
3. For each sample point along a line: read luminance `l`; apply `applyCurve(1−l)` → `curved`.
4. Perpendicular displacement `= maxAmplitude × curved × sin((s/len) × freq + phase)`.
5. Collect all displaced points as line segments; rasterise via `vectorToRaster`.

### Output
Greyscale halftone line image on flat background. Source colour is discarded.

### Preview strategy
No explicit reduction.

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

**Output format:** Point arrays: one sub-array per halftone line, each entry `[x, y]` after sinusoidal displacement.

`buildGeometry()` is called internally by `apply()` before `vectorToRaster`. At the tool level, `DistortActions.exportSVG()` calls `buildGeometry()` directly to bypass rasterisation. See `docs/specs/module-contracts.md` for the `LineSet` schema.

## Modulation targets
All `range`-type params accept image and expression drivers via the `+D` button in the NodePanel. No parameters in this module have pre-wired `getModulated()` calls in the current implementation — all values read directly from `this.params`.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
None in current PRESETS.
