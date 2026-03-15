# MEDIAN

Replaces each pixel with the median value over a square neighbourhood, suppressing noise while preserving edges.

## Identity

| Field | Value |
|-------|-------|
| Type string | `median` |
| Category | `BLUR` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/blur/MedianFilterNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Brute-force median filter | `shared/algorithms/image/blur-filters.js` | — |

`shared/algorithms/image/blur-filters.js` — collects `(2r+1)²` neighbourhood samples per channel into a reused `Uint8Array`, sorts, picks the middle index. No spatial optimisation.

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
| `radius` | RADIUS | slider+number | 1–5 | 1 | Half-width of neighbourhood in pixels |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel at `(x, y)`, for each of R, G, B channels:
2. Gather `(2r+1)²` samples from the clamped neighbourhood into a buffer.
3. Sort the buffer; write the middle value to the destination channel.
4. Copy alpha.

### Output
Median-filtered RGBA image. Impulse noise removed; step edges preserved better than Gaussian blur.

### Preview strategy
`radius` halved.

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

> **Performance:** `O(n × (2r+1)²)` with a per-channel sort at each pixel. Radius 5 = 121 neighbours per pixel — heavy at full resolution; preview halving of radius is critical.

## Presets using this node
None in current PRESETS.
