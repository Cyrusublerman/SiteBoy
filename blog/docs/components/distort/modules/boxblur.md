# BOX BLUR

Applies a uniform box blur via a sliding-window separable pass, with optional multi-pass iteration.

## Identity

| Field | Value |
|-------|-------|
| Type string | `boxblur` |
| Category | `BLUR` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/blur/BoxBlurNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Separable sliding-window box blur | `shared/algorithms/image/blur-filters.js` | — |
| `Sampler.clamp` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

`shared/algorithms/image/blur-filters.js` — horizontal pass (`_bH`) then vertical pass (`_bV`). Each pass maintains a running sum over a window of `2r+1` pixels — O(1) per pixel per axis. Multi-pass controlled by `passes`.

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
| `radius` | RADIUS | slider+number | 1–50 | 3 | Half-width of the blur kernel in pixels |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `passes` | PASSES | slider+number | 1–5 | 1 | Number of repeated box blur passes (approximates Gaussian at 3+) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Copy source into a working buffer `cur`.
2. For each of `passes` iterations: apply horizontal sliding-window box blur `_bH(cur → tmp)`, then vertical `_bV(tmp → cur)`.
3. Copy final `cur` to destination.

### Output
Box-blurred RGBA image. Three passes approximate a Gaussian.

### Preview strategy
`radius` halved; `passes` capped at 2.

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
None in current PRESETS (GAUSS BLUR is preferred in existing presets).
