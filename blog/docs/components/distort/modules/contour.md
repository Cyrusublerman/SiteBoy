# CONTOUR

Extracts iso-luminance contour lines by detecting band boundaries in a quantised luminance map and rendering them with configurable stroke width.

## Identity

| Field | Value |
|-------|-------|
| Type string | `contour` |
| Category | `GEOMETRIC` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/geometric/ContourNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Luminance band-boundary edge detection | Inline | — |
| Morphological dilation (circular kernel) | Inline | — |

Inline — quantises luminance into `levels` uniform bands; marks pixels whose right or bottom neighbour is in a different band. Circular-kernel dilation expands marks by `strokeW` pixels. Contour pixels blended toward `strokeLevel`; others pass through.

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
| `levels` | LEVELS | slider+number | 2–32 | 8 | Number of iso-luminance bands |
| `strokeW` | STROKE W | slider+number | 0.5–4 | 1 | Contour line half-width in pixels |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `strokeLevel` | STROKE LVL | slider+number | 0–255 | 0 | Greyscale value of contour lines |
| `blendAmt` | BLEND | slider+number | 0–1 | 0.7 | Blend ratio between contour colour and source |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Compute BT.601 luminance and quantise to `levels` bands (`floor(lum × levels)`).
2. For each pixel, compare to right and below neighbours; mark as edge if bands differ.
3. Morphologically dilate edges with a circular kernel of radius `ceil(strokeW)`.
4. For each edge pixel: blend toward `strokeLevel` at `blendAmt`. For non-edge: pass through source unchanged.
5. Copy alpha.

### Output
Contour-line RGBA image. Iso-luminance lines overlaid on source.

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
