# TRUCHET

Overlays a seeded random Truchet tile pattern (quarter-circle arcs) blended onto the source image.

## Identity

| Field | Value |
|-------|-------|
| Type string | `truchet` |
| Category | `PATTERN` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/pattern/TruchetNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Truchet tile arc SDF | `shared/algorithms/patterns/pattern-generators.js` | — |

`shared/algorithms/patterns/pattern-generators.js` — per-tile orientation determined by a bitwise hash of `(seed XOR tileX, tileY)`. Per-pixel distance to nearest arc computed analytically; stroke membership gates binary pattern. Pattern blended onto source via `multiply`, `screen`, or `overlay`.

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
| `tileSize` | TILE SIZE | slider+number | 5–100 | 20 | Tile cell size in pixels |
| `strokeWidth` | STROKE W | slider+number | 0.5–15 | 3 | Arc stroke width in pixels |

### Tier 5 (quality/mode)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `blendMode` | BLEND | dropdown | `multiply`, `screen`, `overlay` | `multiply` | How the pattern is composited onto source |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Determine tile grid dimensions from `tileSize`.
2. For each tile, hash `(ctx.nodeSeed XOR tileX, tileY)` bitwise to select one of two arc orientations. Same seed always produces the same tile layout.
3. For each pixel within the tile, compute minimum distance to the two candidate arc circles.
4. If `minDist < strokeWidth/2`: `pattern = 0` (dark); else `255` (light).
5. Blend pattern onto source per channel using selected blend mode.
6. Copy alpha.

### Output
Truchet arc pattern composited onto source RGBA image.

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
