# CHANNEL MIXER

Applies a 3×3 linear matrix to mix RGB channels, enabling colour cross-talk and channel remapping.

## Identity

| Field | Value |
|-------|-------|
| Type string | `channelmixer` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/ChannelMixerNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| 3×3 RGB matrix multiply | `shared/algorithms/image/colour-adjustments.js` | — |

`shared/algorithms/image/colour-adjustments.js` — `outR = R·rr + G·rg + B·rb`, `outG = R·gr + G·gg + B·gb`, `outB = R·br + G·bg + B·bb`. Clamped to `[0,255]`.

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
| `rr` | R→R | slider+number | -2–2 | 1 | Red self-contribution to output red |
| `rg` | G→R | slider+number | -2–2 | 0 | Green contribution to output red |
| `rb` | B→R | slider+number | -2–2 | 0 | Blue contribution to output red |
| `gr` | R→G | slider+number | -2–2 | 0 | Red contribution to output green |
| `gg` | G→G | slider+number | -2–2 | 1 | Green self-contribution to output green |
| `gb` | B→G | slider+number | -2–2 | 0 | Blue contribution to output green |
| `br` | R→B | slider+number | -2–2 | 0 | Red contribution to output blue |
| `bg` | G→B | slider+number | -2–2 | 0 | Green contribution to output blue |
| `bb` | B→B | slider+number | -2–2 | 1 | Blue self-contribution to output blue |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel, read R, G, B as integers.
2. Compute three dot products: `outR = R·rr + G·rg + B·rb`, `outG = R·gr + G·gg + B·gb`, `outB = R·br + G·bg + B·bb`.
3. Clamp each result to `[0,255]` and round.
4. Write to destination. Copy alpha.

### Output
Channel-mixed RGBA image. Default identity matrix produces no change.

### Preview strategy
No reduction — O(n) per pixel, no iterative step.

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
