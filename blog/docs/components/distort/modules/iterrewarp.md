# ITER REWARP

Accumulates multiple randomly jittered, rotated, and scaled copies of the source image with weighted blending.

## Identity

| Field | Value |
|-------|-------|
| Type string | `iterrewarp` |
| Category | `ACCUMULATION` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/accumulation/IterativeRewarpNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Weighted multi-sample accumulation | `shared/algorithms/physics/accumulation.js` | — |
| `SeededRNG`, `hashSeed` | `assets/js/tools/processors/distort/core/SeededRNG.js` | — |

`shared/algorithms/physics/accumulation.js` — for each of `samples` iterations, derive a seeded RNG from `hashSeed(nodeSeed, si, 999)`, generate random translate, rotate, and scale jitter, compute bilinear sample from source at the transformed position, accumulate weighted RGBA into float accumulators, normalise.

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
| `samples` | SAMPLES | slider+number | 2–20 | 5 | Number of accumulated copies |
| `jitterX` | JITTER X | slider+number | 0–100 | 10 | Maximum horizontal translation per sample (pixels) |
| `jitterY` | JITTER Y | slider+number | 0–100 | 10 | Maximum vertical translation per sample (pixels) |
| `opacityMode` | BLEND | dropdown | `equal`, `decay` | `decay` | Weight distribution across samples |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `decay` | DECAY | slider+number | 0.1–0.99 | 0.7 | Per-sample weight multiplier (`decay^si`) in decay mode |
| `rotJitter` | ROT JITTER | slider+number | 0–10 | 0 | Maximum rotation per sample in degrees |
| `scaleJitter` | SC JITTER | slider+number | 0–0.5 | 0 | Maximum scale deviation per sample |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each sample index `si ∈ [0, samples)`: derive an RNG from `hashSeed(nodeSeed, si, 999)`.
2. Generate random translate `(ox, oy)`, rotation `rot`, and scale `sc` within the respective jitter bounds.
3. Compute weight: `decay^si` (decay mode) or `1` (equal mode).
4. Sample source at the transformed coordinate bilinearly; accumulate into float RGBA accumulators scaled by weight.
5. Normalise accumulators by total weight and write to destination.

### Output
Ghost-echo / motion-blur-style RGBA image created by temporal accumulation of transformed copies.

### Preview strategy
`samples` capped at 8.

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
DROWNED — 8 samples, decay 0.75, 1.5° rot jitter.
