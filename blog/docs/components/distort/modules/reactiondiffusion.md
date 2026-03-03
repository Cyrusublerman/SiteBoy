# REACT-DIFFUSE

Simulates Gray–Scott reaction-diffusion, producing organic spot, coral, worm, and maze patterns from the image's luminance as a seed.

## Identity

| Field | Value |
|-------|-------|
| Type string | `reactiondiffusion` |
| Category | `PHYSICS` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/physics/ReactionDiffusionNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Gray–Scott reaction-diffusion | Inline | — |

Inline — two chemical species `u`, `v` on a 2D grid. Each step: `u_new = u + Du·∇²u − u·v² + feed·(1−u)`, `v_new = v + Dv·∇²v + u·v² − (feed+kill)·v`. Eight named parameter presets.

**Built-in presets:**

| Name | Du | Dv | feed | kill |
|------|----|----|------|------|
| `mitosis` | 0.2097 | 0.105 | 0.0367 | 0.0649 |
| `coral` | 0.16 | 0.08 | 0.06 | 0.062 |
| `spots` | 0.16 | 0.08 | 0.035 | 0.065 |
| `maze` | 0.21 | 0.105 | 0.029 | 0.057 |
| `worms` | 0.21 | 0.105 | 0.046 | 0.063 |
| `solitons` | 0.19 | 0.095 | 0.03 | 0.06 |
| `pulsating` | 0.19 | 0.095 | 0.026 | 0.055 |
| `chaos` | 0.16 | 0.08 | 0.026 | 0.052 |

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
| `preset` | PRESET | dropdown | `mitosis`, `coral`, `spots`, `maze`, `worms`, `solitons`, `pulsating`, `chaos` | `coral` | Gray–Scott parameter set |
| `steps` | STEPS | slider+number | 10–5000 | 500 | Number of simulation steps |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `seedSize` | SEED SIZE | slider+number | 5–100 | 20 | Side length of the central seed region in pixels |

## Pipeline Behaviour

### Input
Full RGBA image (used to seed `v` values from luminance within the seed region).

### Process
1. Initialise `u = 1`, `v = 0` everywhere.
2. Seed centre square `(cx±half, cy±half)` with `u = 0.5`, `v = 0.25 + lum × 0.1`.
3. For each of `steps` iterations: compute 4-neighbour Laplacian for `u` and `v`; apply reaction-diffusion equations; swap buffers.
4. Output `v` field scaled to `[0,255]` greyscale. Copy alpha from source.

### Output
Greyscale reaction-diffusion pattern image. Image-independent after seeding; source only influences the seed square.

> **Note:** `ctx.nodeSeed` is **not used**. The simulation is fully deterministic — identical parameters always produce identical output. Source image only affects the `v` initialisation values in the seed square, not the simulation trajectory.

> **Performance:** at `steps = 5000` this is O(n × steps) — very slow at full resolution. Preview cap at 100 steps is critical.

### Preview strategy
`steps` capped at 100.

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
