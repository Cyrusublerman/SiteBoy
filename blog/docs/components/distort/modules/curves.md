# CURVES

Maps tonal values through a smoothstep-interpolated three-point curve (shadows, mids, highlights).

## Identity

| Field | Value |
|-------|-------|
| Type string | `curves` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/CurvesNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Piecewise smoothstep LUT | `shared/algorithms/image/colour-adjustments.js` | — |

`shared/algorithms/image/colour-adjustments.js` — three `(in, out)` control points; per-segment normalised `t` → smoothstep `t²(3−2t)` interpolation. `isLUT = true` enables LUT chaining.

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
| `shadowIn` | SHADOW IN | slider+number | 0–255 | 0 | Input value of shadow anchor |
| `shadowOut` | SHADOW OUT | slider+number | 0–255 | 0 | Output value of shadow anchor |
| `midIn` | MID IN | slider+number | 0–255 | 128 | Input value of midtone anchor |
| `midOut` | MID OUT | slider+number | 0–255 | 128 | Output value of midtone anchor |
| `highIn` | HIGH IN | slider+number | 0–255 | 255 | Input value of highlight anchor |
| `highOut` | HIGH OUT | slider+number | 0–255 | 255 | Output value of highlight anchor |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Build a 256-entry LUT from the three `(in, out)` control points.
2. For each input value `i`: clamp to first/last point if outside range; otherwise find the enclosing segment.
3. Compute normalised position `t` within segment; apply smoothstep: `st = t²(3−2t)`.
4. Interpolate output: `y = pt[seg].out + (pt[seg+1].out − pt[seg].out) × st`.
5. Apply LUT to R, G, B equally. Copy alpha.

### Output
Curve-remapped RGBA image.

### Preview strategy
No reduction — LUT built once, O(1) per pixel.

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
DARKROOM — subtle S-curve lift on shadows/highlights.
