# DELAUNAY MESH

Triangulates a set of seeded random points via Bowyer–Watson Delaunay algorithm and renders the mesh as flat-colour triangles or a wireframe overlay.

## Identity

| Field | Value |
|-------|-------|
| Type string | `delaunaymesh` |
| Category | `COMPOSITE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/composite/DelaunayMeshNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Bowyer–Watson Delaunay triangulation | Inline (`_triangulate`) | — |
| `SeededRNG` | `assets/js/tools/processors/distort/core/SeededRNG.js` | — |

Inline — Bowyer–Watson incremental insertion. Triangle rendering via `OffscreenCanvas` 2D context. Flat mode: centroid-sampled fill colour; wire mode: `wireLevel` grey strokes alpha-composited over source.

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
| `pointCount` | POINTS | slider+number | 10–2000 | 200 | Number of random triangulation seed points |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `wireWeight` | WIRE W | slider+number | 0–3 | 0.5 | Wireframe stroke weight in pixels |
| `wireLevel` | WIRE LVL | slider+number | 0–255 | 40 | Wireframe stroke fill level |

### Tier 5 (quality/mode)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `colorMode` | MODE | dropdown | `flat`, `wire` | `flat` | Rendering mode |

## Pipeline Behaviour

### Input
Full RGBA image (source colour sampled at triangle centroids in flat mode).

### Process
1. Generate `pointCount` random points (plus four corner anchors) from `SeededRNG`.
2. Run Bowyer–Watson Delaunay triangulation.
3. Render via `OffscreenCanvas`:
   - **flat**: each triangle filled with source colour at its centroid.
   - **wire**: source drawn as base; wireframe strokes rendered in `wireLevel` and alpha-composited.
4. Write canvas pixels to destination.

### Output
Triangulated mesh RGBA image.

### Preview strategy
`pointCount` capped at 100.

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
