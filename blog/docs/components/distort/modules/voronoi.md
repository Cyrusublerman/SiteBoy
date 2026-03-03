# VORONOI

Segments the image into Voronoi cells from seeded random points and renders them as distance gradient, flat colour, or edge map.

## Identity

| Field | Value |
|-------|-------|
| Type string | `voronoi` |
| Category | `GEOMETRIC` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/geometric/VoronoiNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Brute-force Voronoi (nearest + second-nearest) | Inline | — |
| `SeededRNG` | `assets/js/tools/processors/distort/core/SeededRNG.js` | — |

Inline — for each pixel, iterate all `pointCount` sites to find minimum and second-minimum squared Euclidean distance. Three rendering modes driven by these distances. All blended with source at `blendAmt`.

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
| `pointCount` | POINTS | slider+number | 4–512 | 64 | Number of Voronoi seed sites |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `blendAmt` | BLEND | slider+number | 0–1 | 0.5 | Blend ratio between Voronoi pattern and source |

### Tier 5 (quality/mode)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `colorMode` | MODE | dropdown | `distance`, `cell`, `edge` | `cell` | Voronoi rendering mode |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Generate `pointCount` random sites with random RGB colours from `SeededRNG`.
2. For each pixel, find nearest site (min distance `d1`) and second-nearest (min distance `d2`).
3. Render per mode:
   - **distance**: `v = min(255, sqrt(d1))` — greyscale proximity map.
   - **cell**: fill with the seeded RGB colour of the nearest site.
   - **edge**: `d2 − d1 < 2px → 0 (black)`; else `255` — white within cells, black at boundaries.
4. Blend with source at `blendAmt`.

### Output
Voronoi-patterned RGBA image blended with source.

### Preview strategy
No reduction — `O(n × pointCount)`.

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
