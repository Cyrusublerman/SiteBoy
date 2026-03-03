# HSL ADJUST

Shifts hue, scales saturation, and offsets lightness via a full per-pixel RGB→HSL→RGB round-trip.

## Identity

| Field | Value |
|-------|-------|
| Type string | `hsladjust` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/HSLAdjustNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| RGB↔HSL conversion | Inline | — |

Inline — standard min/max RGB→HSL formula; HSL→RGB via piecewise linear `hue2rgb`. No LUT — per-pixel computation.

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
| `hue` | HUE | slider+number | -180–180 | 0 | Hue rotation in degrees |
| `saturation` | SATURATION | slider+number | 0–3 | 1 | Saturation multiplier (1 = unchanged) |
| `lightness` | LIGHTNESS | slider+number | -1–1 | 0 | Lightness additive offset |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Convert each pixel's R, G, B (normalised to `[0,1]`) to HSL via min/max formula.
2. Shift hue: `H = (H + hue/360 + 1) mod 1`.
3. Scale saturation: `S = clamp(S × saturation, 0, 1)`.
4. Offset lightness: `L = clamp(L + lightness, 0, 1)`.
5. Convert back to RGB via `hue2rgb` piecewise function.
6. Write scaled-to-255 values; copy alpha.

### Output
Hue/saturation/lightness-adjusted RGBA image.

### Preview strategy
No reduction — no quality branch needed (O(n) per-pixel, no iterative step).

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
