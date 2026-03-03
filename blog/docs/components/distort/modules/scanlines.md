# SCANLINES

Overlays horizontal scanline darkening by periodically attenuating alternating rows.

## Identity

| Field | Value |
|-------|-------|
| Type string | `scanlines` |
| Category | `TEXTURE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/texture/ScanlinesNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Periodic row attenuation | Inline | — |

Inline — for each row, `(y mod spacing) / spacing < thickness` selects the darkened rows; `factor = 1 − opacity` applied as a channel multiplier. Applied per row with no per-pixel branch inside x.

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
| `spacing` | SPACING | slider+number | 1–10 | 2 | Period of scanline pattern in rows |
| `thickness` | THICKNESS | slider+number | 0–1 | 0.5 | Fraction of each period that is darkened |
| `opacity` | OPACITY | slider+number | 0–1 | 0.3 | Darkening amount (0 = none, 1 = black lines) |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. For each row `y`: compute `factor = ((y mod spacing) / spacing < thickness) ? (1 − opacity) : 1`.
2. For each pixel in the row: multiply R, G, B by `factor`. Copy alpha.

### Output
Scanline-overlaid RGBA image.

### Preview strategy
No reduction — O(n) trivially fast.

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
HOLOGRAM — spacing 3, thickness 0.3, opacity 0.2.
