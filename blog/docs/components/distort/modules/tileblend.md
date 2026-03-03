# TILE BLEND

Blends each pixel with a second sample from a tiled, optionally mirrored offset of the same image, with post-blend exposure and gamma correction.

## Identity

| Field | Value |
|-------|-------|
| Type string | `tileblend` |
| Category | `COMPOSITE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/composite/TileBlendNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Tiled self-composite with blend modes | Inline | — |

Inline — wraps sample coordinates by `(offset + x) mod w, (offset + y) mod h` with optional axis-mirror. Three blend modes then exposure (`2^exposure`) and gamma (`pow(x, 1/gamma)`) applied.

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
| `blendMode` | BLEND | dropdown | `crossfade`, `multiply`, `difference` | `multiply` | How source and offset sample are combined |
| `mix` | MIX | slider+number | 0–1 | 0.5 | Crossfade ratio (crossfade mode only) |
| `offsetX` | OFFSET X | slider+number | 0–1 | 0.5 | Horizontal tile offset (fraction of width) |
| `offsetY` | OFFSET Y | slider+number | 0–1 | 0.5 | Vertical tile offset (fraction of height) |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `mirrorX` | MIRROR X | toggle | — | 0 | Mirror offset sample on x axis at midpoint |
| `mirrorY` | MIRROR Y | toggle | — | 0 | Mirror offset sample on y axis at midpoint |
| `exposure` | EXPOSURE | slider+number | -2–2 | 0 | Post-blend EV adjustment (`2^exposure`) |
| `gamma` | GAMMA | slider+number | 0.2–3 | 1 | Post-blend gamma correction |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each pixel at `(x, y)`: compute offset sample coordinates `(sx, sy) = ((x + ox) mod w, (y + oy) mod h)`.
2. If `mirrorX` and `sx > w/2`: `sx = w − sx`. Similarly for `mirrorY`.
3. For each channel: compute blended value from source `a` and offset sample `b` using selected mode.
4. Apply exposure: `out = out × 2^exposure`. Apply gamma: `out = pow(out, 1/gamma)`. Clamp to `[0,1]`.
5. Scale to `[0,255]`. Copy alpha.

### Output
Self-composited tiled RGBA image.

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
