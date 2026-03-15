# VIGNETTE

Darkens or brightens the edges of the image with a smooth elliptical falloff, controllable in shape and softness.

## Identity

| Field | Value |
|-------|-------|
| Type string | `vignette` |
| Category | `TEXTURE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/texture/VignetteNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Elliptical distance vignette | `shared/algorithms/image/texture-overlays.js` | — |

`shared/algorithms/image/texture-overlays.js` — normalised elliptical distance from centre; `edge = 1 − softness`; inside edge → full brightness; outside → linear falloff to zero. `factor = 1 − amount × (1 − v²)`. Supports `amount` modulation.

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
| `amount` | AMOUNT | slider+number | 0–1 | 0.5 | Vignette darkening strength |
| `softness` | SOFTNESS | slider+number | 0.01–1 | 0.5 | Width of the gradual transition zone |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `roundness` | ROUNDNESS | slider+number | 0–1 | 1 | Shape blending: 0 = axis-scaled ellipse, 1 = circle |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Compute normalised `(dx, dy)` from image centre.
2. Apply `roundness` to ellipse semi-axes: `rx = roundness + (1−roundness) × w/max(w,h)`.
3. Compute elliptical distance `dist = sqrt(dx²/rx² + dy²/ry²)`.
4. Compute brightness factor `v`: `1` inside `edge = 1−softness`; linear falloff outside.
5. `factor = 1 − amount × (1 − v²)`. Multiply each channel by `factor`. Copy alpha.

### Output
Vignette-applied RGBA image.

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
`amount` — supports per-pixel modulation via `getModulated` and `ctx.modMaps`.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
HOLOGRAM — amount 0.6, softness 0.5, roundness 0.8. DARKROOM — amount 0.4, softness 0.6, roundness 0.9.
