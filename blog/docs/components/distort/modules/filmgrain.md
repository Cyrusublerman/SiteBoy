# FILM GRAIN

Adds photographic film grain by overlaying seeded random noise scaled by luminance response, with optional chromatic grain.

## Identity

| Field | Value |
|-------|-------|
| Type string | `filmgrain` |
| Category | `TEXTURE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/texture/FilmGrainNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Downsampled random grain + luminance response | `shared/algorithms/image/texture-overlays.js` | — |
| `SeededRNG` | `assets/js/tools/processors/distort/core/SeededRNG.js` | — |

`shared/algorithms/image/texture-overlays.js` — a downsampled noise grid (`size` pixels per cell) of uniform random values in `[-1,1]`. `lumResp` attenuates grain proportionally to distance from mid-grey. Supports `getModulated` for per-pixel `amount`.

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
| `amount` | AMOUNT | slider+number | 0–100 | 25 | Grain intensity (percentage) |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `size` | SIZE | slider+number | 1–3 | 1 | Grain cell size in pixels (1 = per-pixel) |
| `lumResp` | LUM RESP | slider+number | 0–1 | 0.5 | Attenuation of grain in shadows and highlights |
| `chromatic` | CHROMATIC | toggle | — | false | Use independent noise for each RGB channel |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Generate a downsampled noise grid `(ceil(w/size) × ceil(h/size))` from `SeededRNG`. Each cell value `∈ [-1,1]`. Chromatic mode creates three independent grids.
2. For each pixel: look up noise cell `gi = floor(y/size)×gw + floor(x/size)`.
3. Compute luminance `lum`; `lumWeight = 1 − lumResp × |lum − 0.5| × 2` (attenuates grain at extremes).
4. `str = (amount/100) × lumWeight × 255`.
5. Add `noise[gi] × str` to each channel. Clamp to `[0,255]`. Copy alpha.

### Output
Film-grain-textured RGBA image.

### Preview strategy
No reduction — grain is generated at render time.

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
`amount` — supports per-pixel modulation via `getModulated` and `ctx.modMaps`.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
DARKROOM — amount 15, size 1, lumResp 0.5, monochrome.
