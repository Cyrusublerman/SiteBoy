# INTERFERENCE

Simulates thin-film optical interference, producing luminance-dependent iridescent colour fringes based on film thickness and viewing angle.

## Identity

| Field | Value |
|-------|-------|
| Type string | `interference` |
| Category | `OPTICS` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/optics/InterferenceNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Thin-film interference (OPD model) | `shared/algorithms/optics/interference.js` | — |

`shared/algorithms/optics/interference.js` — optical path difference `OPD = 2 × n × d × cos(θ)` where `n = 1.33` (oil/water refractive index, **hardcoded**), `d = filmThickness + lum × 200 × iridescence`, `θ = viewAngle`. Per-channel reflectance `= 0.5 + 0.5 × cos(2π × OPD / λ)` for wavelengths λ: 650nm (R), 550nm (G), 450nm (B).

> **Note:** refractive index `n = 1.33` is a module-level constant. It is not exposed as a parameter — changing it requires editing the source. The value approximates water or thin mineral oil.

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
| `filmThickness` | THICKNESS | slider+number | 100–800 (step 10) | 300 | Base film thickness in nanometres |
| `iridescence` | IRIDESCENCE | slider+number | 0–2 | 1 | Luminance modulation of thickness (0 = uniform film) |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `viewAngle` | VIEW ANGLE | slider+number | 0–60 | 0 | Viewing angle in degrees (affects OPD via `cos`) |
| `blendAmt` | BLEND | slider+number | 0–1 | 0.5 | Blend ratio between interference colours and source |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel, compute BT.601 luminance `lum ∈ [0,1]`.
2. Compute film thickness `d = filmThickness + lum × 200 × iridescence`.
3. Compute `OPD = 2 × 1.33 × d × cos(viewAngle × π/180)`.
4. Per channel: `reflectance = 0.5 + 0.5 × cos(2π × OPD / λ)` for λ ∈ {650, 550, 450} nm.
5. Blend: `out = src × (1 − blendAmt) + reflectance × 255 × blendAmt`. Copy alpha.

### Output
Interference-coloured RGBA image. Different luminance values produce different phase offsets, creating shifting colour fringes.

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
