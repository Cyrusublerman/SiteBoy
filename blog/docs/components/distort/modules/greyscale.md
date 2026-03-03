# GREYSCALE

Converts the image to greyscale using a weighted luminance sum across the three RGB channels.

## Identity

| Field | Value |
|-------|-------|
| Type string | `greyscale` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/GreyscaleNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Weighted luminance sum | Inline | — |

Inline — per-pixel dot product `l = R·wr + G·wg + B·wb`; all three output channels set to `l`.

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
| `wr` | R WEIGHT | slider+number | 0–1 | 0.299 | Red channel contribution to luminance |
| `wg` | G WEIGHT | slider+number | 0–1 | 0.587 | Green channel contribution to luminance |
| `wb` | B WEIGHT | slider+number | 0–1 | 0.114 | Blue channel contribution to luminance |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel, compute luminance `l = R·wr + G·wg + B·wb`.
2. Write `l` to the R, G, and B channels of the destination pixel.
3. Copy alpha unchanged.

### Output
Greyscale RGBA image (all three channels equal).

### Preview strategy
No reduction — O(n) operation, no quality path needed.

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
SCAN, LIQUID, DROWNED, DATAMOSH (via `greyscale`), ENGRAVE, WAVEFORM, SIGNAL, LITHO, CORRODED, ETCH — majority of presets open with a GREYSCALE node.
