# LIFT/GAM/GAIN

DaVinci-style Lift/Gamma/Gain tonal grading with an optional contrast pivot operator.

## Identity

| Field | Value |
|-------|-------|
| Type string | `contrast` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/ContrastNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Lift/Gamma/Gain chain | `shared/algorithms/image/colour-adjustments.js` | — |

`shared/algorithms/image/colour-adjustments.js` — `x = (v/255 × gain) + lift` → `pow(max(0, x), 1/gamma)` → optional contrast pivot: `x = pivot + (x − pivot) × (1 + contrast)`.

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
| `lift` | LIFT | slider+number | -0.5–0.5 | 0 | Additive shadow offset (darkens/brightens blacks) |
| `gamma` | GAMMA | slider+number | 0.2–3 | 1 | Midtone power curve |
| `gain` | GAIN | slider+number | 0–3 | 1 | Highlight multiplier |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `contrast` | CONTRAST | slider+number | -1–1 | 0 | Contrast stretch/compress around pivot |
| `pivot` | PIVOT | slider+number | 0–1 | 0.5 | Luminance value held constant during contrast |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Build a 256-entry LUT via `_map(i)` for `i ∈ [0,255]`.
2. `_map`: scale input to float (`i/255`), multiply by `gain`, add `lift`.
3. Apply gamma: `pow(max(0, x), 1/gamma)`.
4. If `contrast ≠ 0`: expand/compress around `pivot`: `x = pivot + (x − pivot) × (1 + contrast)`.
5. Clamp to `[0,1]` and scale to `[0,255]`.
6. Apply LUT identically to R, G, B. Copy alpha.

### Output
Tone-graded RGBA image.

### Preview strategy
No reduction — LUT built once, O(1) per pixel application.

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
LIQUID — applies subtle lift/gamma/gain before flow field.
