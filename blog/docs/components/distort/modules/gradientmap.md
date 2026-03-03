# GRADIENT MAP

Replaces pixel colour with a linear interpolation between two colours driven by luminance.

## Identity

| Field | Value |
|-------|-------|
| Type string | `gradientmap` |
| Category | `COLOUR / TONE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/colour/GradientMapNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Two-stop luminance gradient remap | Inline | — |

Inline — BT.601 luminance `t ∈ [0,1]`; `outC = darkC + (lightC − darkC) × t` per channel.

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
| `darkR` | DARK R | slider+number | 0–255 | 0 | Red component of shadow colour |
| `darkG` | DARK G | slider+number | 0–255 | 0 | Green component of shadow colour |
| `darkB` | DARK B | slider+number | 0–255 | 30 | Blue component of shadow colour |
| `lightR` | LIGHT R | slider+number | 0–255 | 255 | Red component of highlight colour |
| `lightG` | LIGHT G | slider+number | 0–255 | 200 | Green component of highlight colour |
| `lightB` | LIGHT B | slider+number | 0–255 | 150 | Blue component of highlight colour |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel compute BT.601 luminance `t = (R·0.299 + G·0.587 + B·0.114) / 255`.
2. Linearly interpolate each output channel: `outC = darkC + (lightC − darkC) × t`.
3. Round and write. Copy alpha.

### Output
Gradient-mapped RGBA image. All colour information from source is discarded; only luminance drives the output.

### Preview strategy
No reduction — O(n) per pixel.

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
