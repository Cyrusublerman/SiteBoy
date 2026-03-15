# HISTOGRAM EQ

Globally equalises contrast by redistributing pixel intensities according to the cumulative luminance histogram.

## Identity

| Field | Value |
|-------|-------|
| Type string | `histogrameq` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/HistogramEQNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Global histogram equalisation | `shared/algorithms/image/colour-adjustments.js` | — |

`shared/algorithms/image/colour-adjustments.js` — BT.601 luminance histogram → CDF → `lut[i] = (cdf[i] − cdfMin) / (N − cdfMin) × 255`. Applied per channel with blend.

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
| `strength` | STRENGTH | slider+number | 0–1 | 1 | Blend between original and equalised output |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Compute BT.601 luminance for each pixel; accumulate a 256-bin histogram.
2. Compute the cumulative distribution function (CDF) over the histogram.
3. Find `cdfMin` (first non-zero CDF value). Build a 256-entry LUT: `lut[i] = (cdf[i] − cdfMin) / (N − cdfMin) × 255`.
4. For each pixel and channel: blend `out = src × (1 − strength) + lut[src] × strength`.
5. Copy alpha.

### Output
Contrast-equalised RGBA image. A single luminance-based LUT is applied equally to all three channels.

### Preview strategy
No reduction — LUT built in O(256), applied O(n).

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
