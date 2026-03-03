# HALFTONE DOT

Renders a rotated grid of circular dots whose radius is inversely proportional to local luminance, simulating a screen-print halftone.

## Identity

| Field | Value |
|-------|-------|
| Type string | `halftonepattern` |
| Category | `PATTERN` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/pattern/HalftonePatternNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Luminance-driven rotated dot grid | Inline | — |

Inline — rotated dot grid placement via `cos/sin` of `angle`; dot radius `= minDot + (1−lum) × (maxDot−minDot)`; filled circle rasterisation.

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
| `bgLevel` | BG LEVEL | slider+number | 0–255 | 255 | Background fill level |
| `dotLevel` | DOT LEVEL | slider+number | 0–255 | 0 | Dot fill level |

### Tier 3 (primary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `spacing` | SPACING | slider+number | 2–40 | 8 | Distance between dot centres |
| `angle` | ANGLE | slider+number | 0–180 | 45 | Rotation of dot grid in degrees |
| `minDot` | MIN DOT | slider+number | 0–5 | 0.5 | Minimum dot radius (for bright pixels) |
| `maxDot` | MAX DOT | slider+number | 1–15 | 4 | Maximum dot radius (for dark pixels) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Fill destination with `bgLevel` (all pixels).
2. Build a luminance map from source.
3. Generate a rotated dot grid: for each grid point `(gi, gj)` in a larger-than-image lattice, compute screen position `(px, py) = centre + rotate(gi·spacing, gj·spacing, angle)`.
4. For each grid point inside image bounds: sample luminance at `(px, py)`, compute `radius = minDot + (1−l) × (maxDot−minDot)`.
5. Rasterise a filled circle of that radius at `(px, py)` in `dotLevel`.

> **Constraint:** `maxDot` should be ≤ `spacing / 2` to avoid dot overlap. At `maxDot > spacing/2`, dense dark areas produce merged circles rather than distinct dots.

### Output
Monochrome halftone dot image. Darker source areas → larger dots; brighter areas → smaller dots.

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
LITHO — spacing 6, angle 45°, minDot 0.5, maxDot 3.
