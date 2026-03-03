# GAUSS BLUR

Applies a separable Gaussian blur with a normalised 1D kernel derived from sigma, with optional modulation map support.

## Identity

| Field | Value |
|-------|-------|
| Type string | `gaussblur` |
| Category | `BLUR` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/blur/GaussianBlurNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Separable Gaussian convolution | Inline (`_cH`, `_cV`, `_k`) | — |
| `Sampler` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

Inline — `_k(sigma, rad)` builds a normalised 1D Gaussian kernel of radius `ceil(sigma × 3)`. Horizontal then vertical separable convolution with clamped boundaries.

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
| `sigma` | SIGMA | slider+number | 0.1–30 | 2 | Standard deviation of Gaussian in pixels |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `passes` | PASSES | slider+number | 1–3 | 1 | Number of repeated blur passes |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Build a normalised 1D kernel of radius `ceil(sigma × 3)` from a Gaussian function.
2. For each of `passes` iterations: apply horizontal separable convolution, then vertical.
3. If a `sigma` modulation map is configured, blend the fully-blurred result with the original source per-pixel using the map value as blend weight.
4. Write to destination.

### Output
Gaussian-blurred RGBA image.

### Preview strategy
`sigma` halved; `passes` forced to 1.

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
`sigma` — modulation map controls per-pixel blend between unblurred source and fully-blurred result.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
SCAN, LIQUID, DROWNED — finishing blur. SIGNAL — mild softening at sigma 0.8.
