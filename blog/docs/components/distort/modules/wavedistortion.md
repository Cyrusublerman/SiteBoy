# WAVE DISTORT

Solves the 2D wave equation from a centre-seeded initial displacement and applies the resulting wave field as a pixel-displacement warp.

## Identity

| Field | Value |
|-------|-------|
| Type string | `wavedistortion` |
| Category | `PHYSICS` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/physics/WaveDistortionNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| 2D wave equation (finite differences) | Inline | — |
| `Sampler.bilinearDst` | `assets/js/tools/processors/distort/core/Sampler.js` | — |

Inline — explicit finite-difference wave solver: `next[i] = damping × (2×cur[i] − prev[i] + c² × Laplacian(cur)[i])`. Two initial displacement modes: Gaussian and damped cosine ripple.

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
| `steps` | STEPS | slider+number | 10–500 | 100 | Wave simulation steps |
| `strength` | STRENGTH | slider+number | 0–50 | 10 | Displacement map scale applied to source |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `speed` | SPEED | slider+number | 0.01–2 | 0.5 | Wave propagation speed (`c` in `c²` term) |
| `damping` | DAMPING | slider+number | 0.9–1 | 0.995 | Energy loss per step (1 = no damping) |
| `initType` | INIT | dropdown | `gaussian`, `ripple` | `gaussian` | Initial displacement profile |
| `radius` | RADIUS | slider+number | 0.01–0.5 | 0.1 | Initial displacement radius (fraction of min dimension) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Initialise displacement grid `cur = prev = initDisplacement(initType, radius)` (Gaussian bell or damped cosine ripple, seeded at image centre).
2. For each of `steps` iterations: for each interior pixel apply the wave equation (`next = damping × (2cur − prev + c²·Laplacian(cur))`); rotate `prev, cur, next` buffers.
3. Scale final displacement by `strength`. For each pixel, offset both `x` and `y` by the same scalar displacement value `disp` — the warp is always diagonal (equal horizontal and vertical shift). No independent x/y displacement control exists.

> **Note:** equal-axis displacement means the wave produces diagonal streaks rather than clean horizontal or vertical ripples. This is a known constraint of the implementation.

> **Performance:** at `steps = 500` the solver is O(n × steps). Expect significant latency at full resolution.

### Output
Wave-displacement-distorted RGBA image. Final ripple shape depends on `steps` and `speed`.

### Preview strategy
`steps` capped at 30.

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
