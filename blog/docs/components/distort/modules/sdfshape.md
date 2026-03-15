# SDF SHAPE

Composites a solid-colour analytical shape (circle, box, or ring) over the source image using a signed distance field with configurable softness.

## Identity

| Field | Value |
|-------|-------|
| Type string | `sdfshape` |
| Category | `GEOMETRIC` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/geometric/SDFShapeNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| SDF per-pixel evaluation (circle, box, ring) | `shared/algorithms/geometry/sdf-operations.js` | — |

`shared/algorithms/geometry/sdf-operations.js` — three SDF primitives: circle (`|p| − r`), box (Euclidean SDF for AABB), ring (`||p| − r| − ring_half`). Alpha from SDF: smooth ramp with softness, or hard threshold. Fill colour composited over source.

**`size` semantics per shape:**

| Shape | `size` interpretation |
|-------|-----------------------|
| `circle` | Radius in `[0, minDim]` |
| `box` | Half-side-length (square, not rectangle) in `[0, minDim]` |
| `ring` | Outer radius in `[0, minDim]`; ring width = `size × 0.15` |

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
| `shape` | SHAPE | dropdown | `circle`, `box`, `ring` | `circle` | SDF primitive type |
| `size` | SIZE | slider+number | 0.01–1 | 0.3 | Shape size (fraction of min dimension) |
| `fillR` | FILL R | slider+number | 0–255 | 0 | Red component of fill colour |
| `fillG` | FILL G | slider+number | 0–255 | 0 | Green component of fill colour |
| `fillB` | FILL B | slider+number | 0–255 | 0 | Blue component of fill colour |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `centreX` | CENTRE X | slider+number | 0–1 | 0.5 | Horizontal shape centre (normalised) |
| `centreY` | CENTRE Y | slider+number | 0–1 | 0.5 | Vertical shape centre (normalised) |
| `softness` | SOFTNESS | slider+number | 0–0.2 | 0.02 | Edge anti-aliasing width (fraction of min dimension) |
| `invert` | INVERT | toggle | — | false | Invert inside/outside classification |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel at `(x, y)`, compute `(dx, dy)` from centre and evaluate the SDF for the selected shape.
2. Compute alpha: with softness → smooth ramp `clamp(0.5 − dist/(softness × minDim), 0, 1)`; without → hard threshold (`dist < 0 → 1`).
3. If `invert`: `alpha = 1 − alpha`.
4. Composite fill colour over source: `out = src × (1 − alpha) + fill × alpha`. Copy alpha.

### Output
Shape-composited RGBA image.

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
