# DILATE/ERODE

Applies greyscale morphological dilation or erosion independently to each RGB channel using shared algorithm functions.

## Identity

| Field | Value |
|-------|-------|
| Type string | `dilateerode` |
| Category | `MORPHOLOGY` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/morphology/DilateErodeNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| `grayscaleDilate` | `assets/js/shared/algorithms/image/morphology.js` | — |
| `grayscaleErode` | `assets/js/shared/algorithms/image/morphology.js` | — |

Shared morphology SSoT. Dilation: replaces each pixel with the maximum of its neighbourhood. Erosion: minimum of its neighbourhood. Applied per channel independently.

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
| `mode` | MODE | dropdown | `dilate`, `erode` | `dilate` | Morphological operation |
| `radius` | RADIUS | slider+number | 1–10 | 1 | Structural element radius in pixels |

### Tier 5 (quality/mode)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `shape` | SHAPE | dropdown | `square`, `circle` | `square` | Structural element shape |

> **Note:** `shape` is declared in `paramDefs` but the current implementation calls `morph(r, w, h, radius)` with no shape argument — `grayscaleDilate`/`grayscaleErode` use a square neighbourhood regardless of this setting. The param is a forward-declared hook for when the morphology module gains shape support.

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Split source RGBA into three separate `Uint8Array` planes (R, G, B).
2. Apply `grayscaleDilate` or `grayscaleErode` to each plane independently with `radius`.
3. Recombine output planes into destination RGBA. Copy alpha.

### Output
Morphologically processed RGBA image. Dilation brightens, expands bright regions; erosion darkens, shrinks them.

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
CORRODED — dilate radius 1 circle on Canny edges.
