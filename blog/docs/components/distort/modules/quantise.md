# QUANTISE

Maps each pixel to the nearest colour in a fixed palette using Euclidean distance in RGB space.

## Identity

| Field | Value |
|-------|-------|
| Type string | `quantise` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/QuantiseNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Nearest-colour quantisation (RGB Euclidean) | Inline | — |

Inline — squared Euclidean distance to each palette entry; minimum wins. No dithering.

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
| `palette` | PALETTE | dropdown | `1-bit`, `2-bit`, `3-bit`, `gameboy`, `nes`, `pastel` | `1-bit` | Target colour palette |

**Built-in palettes:**

| Name | Colours | Description |
|------|---------|-------------|
| `1-bit` | 2 | Black and white |
| `2-bit` | 4 | Greyscale steps |
| `3-bit` | 8 | RGB primaries + secondaries |
| `gameboy` | 4 | Original Game Boy greens |
| `nes` | 16 | NES system palette subset |
| `pastel` | 6 | Soft pastel hues |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Load the RGB triplets for the selected palette.
2. For each pixel, compute squared Euclidean RGB distance to every palette entry.
3. Assign the colour of the closest entry.
4. Copy alpha.

### Output
Palette-quantised RGBA image. Hard boundaries — no spatial dithering applied.

### Preview strategy
No reduction — O(n × palette_size) per pixel; palette_size ≤ 16.

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
DATAMOSH — `3-bit` palette applied after band-shift.
