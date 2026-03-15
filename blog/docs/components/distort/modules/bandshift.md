# BAND SHIFT

Divides the image into horizontal or vertical bands and shifts each by a per-band lateral offset.

## Identity

| Field | Value |
|-------|-------|
| Type string | `bandshift` |
| Category | `WARP` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/warp/BandShiftNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Per-band offset computation | `shared/algorithms/geometry/warp.js` | — |
| `PerlinNoise.noise2D` | `assets/js/tools/processors/distort/core/PerlinNoise.js` | — |
| `SeededRNG` | `assets/js/tools/processors/distort/core/SeededRNG.js` | — |
| `Sampler.bilinearDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

`shared/algorithms/geometry/warp.js` — pre-computes a `Float32Array` of per-band offsets using sine, stepped random, or Perlin noise modes. Each pixel's offset determined by its band index.

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
| `axis` | AXIS | dropdown | `horizontal`, `vertical` | `horizontal` | Axis along which bands run |
| `bandSize` | BAND SIZE | slider+number | 2–200 | 20 | Height (or width) of each band in pixels |
| `intensity` | INTENSITY | slider+number | 0–200 | 30 | Maximum lateral shift in pixels |
| `offsetType` | OFFSET | dropdown | `noise`, `sine`, `stepped` | `noise` | Function used to compute per-band shift |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `phase` | PHASE | slider+number | 0–6.28 | 0 | Phase offset for sine/noise |
| `freq` | FREQ | slider+number | 0.1–10 | 1 | Frequency multiplier for sine mode |
| `noiseScale` | NOISE SC | slider+number | 0.1–10 | 2 | Spatial scale of noise offset |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Compute number of bands `= ceil(dim / bandSize)`.
2. For each band index `b`, compute offset:
   - `sine`: `sin(b/numBands × freq × 2π + phase) × intensity`.
   - `stepped`: `round(rng.next() × 4 − 2) × intensity × 0.5` (4 quantised random steps).
   - `noise`: `noise2D(b/numBands × noiseScale, phase) × intensity`.
3. For each pixel, look up its band offset and sample source at the laterally shifted position via `Sampler.bilinearDst`.

### Output
Band-shifted RGBA image. Creates glitch/scan-line displacement effects.

### Preview strategy
No explicit reduction path.

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
SCAN — two-axis band shifts. DATAMOSH — horizontal noise shift, intensity 80. SIGNAL — sine mode, 3 frequencies.
