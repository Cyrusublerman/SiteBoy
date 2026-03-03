# DIFF OF GAUSS

Computes the Difference of Gaussians (DoG) — the subtraction of two Gaussian-blurred versions of the image — as an edge/frequency-band extractor.

## Identity

| Field | Value |
|-------|-------|
| Type string | `dog` |
| Category | `EDGE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/edge/DoGNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Difference of Gaussians | Inline | — |

Inline — internal `blur(src, sig)`: separable Gaussian, radius `ceil(sig × 3)`, horizontal then vertical with clamped boundary. DoG = `|G1 − G2|`; threshold gate.

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
| `sigma1` | SIGMA 1 | slider+number | 0.1–10 | 1 | Sigma of the first (finer) Gaussian |
| `sigma2` | SIGMA 2 | slider+number | 0.2–15 | 1.6 | Sigma of the second (coarser) Gaussian |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `threshold` | THRESHOLD | slider+number | 0–50 | 5 | Minimum `|G1 − G2|` required for non-zero output |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Convert to BT.601 luminance.
2. Compute `G1 = blur(lum, sigma1)` and `G2 = blur(lum, sigma2)` via separable Gaussian.
3. For each pixel: `v = |G1 − G2|`. If `v > threshold`: `out = min(255, v)`; else `out = 0`.
4. Write to R, G, B. Copy alpha.

### Output
Greyscale band-pass edge image. Bands between `sigma1` and `sigma2` appear bright; low-frequency and high-frequency content is suppressed.

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
None in current PRESETS.
