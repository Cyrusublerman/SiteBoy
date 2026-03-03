# ADVECTION

Traces each pixel backward through a velocity field for multiple steps, producing fluid-like warping effects.

## Identity

| Field | Value |
|-------|-------|
| Type string | `advection` |
| Category | `WARP` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/warp/AdvectionNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Backward advection integration | Inline | — |
| `PerlinNoise.fbm` | `assets/js/tools/processors/distort/core/PerlinNoise.js` | — |
| `Sampler.bilinearDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

Inline — per-pixel backward Euler integration over `steps` steps. Three velocity field types: fBm noise, radial, and vortex (perpendicular to radial).

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
| `velocityType` | VELOCITY | dropdown | `noise`, `radial`, `vortex` | `noise` | Vector field generator |
| `steps` | STEPS | slider+number | 1–30 | 5 | Integration step count |
| `speed` | SPEED | slider+number | 0.1–20 | 2 | Displacement per step in pixels |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `noiseScale` | NOISE SC | slider+number | 0.1–20 | 3 | UV scale of the noise field (noise mode only) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Instantiate `PerlinNoise` from `ctx.nodeSeed`.
2. For each output pixel, initialise trace position `(px, py) = (x, y)`.
3. For each step: compute velocity `(vx, vy)` from the chosen field:
   - **noise**: `(fbm(px/w·scale, py/h·scale, 3), fbm(…+31.7, …+47.3, 3))`.
   - **radial**: normalised outward unit vector from image centre.
   - **vortex**: perpendicular to radial (90° rotation).
4. Subtract `(vx, vy) × speed` from `(px, py)`.
5. Sample source at final `(px, py)` via `Sampler.bilinearDst`.

### Output
Advection-warped RGBA image.

### Preview strategy
`steps` capped at 3.

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
