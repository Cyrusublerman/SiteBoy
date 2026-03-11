# Tile Mosaic — UI Layout

**Status: Unimplemented stub.**

## Live Parameters (Current)

| Group | Key | Type | Default | Range |
|---|---|---|---|---|
| Tiles | `tileSize` | slider | 40 | 10 → 100, step 5 |

**Total: 1 parameter.** `tileSize` is not read by the draw function.

## Intended Parameters (per spec)

### CONTROLS tab

| Block | Key | Type | Range / Options |
|---|---|---|---|
| Grid | `gridColumns` | slider | 4 → 80 |
| Grid | `gridRows` | slider | 4 → 80 |
| Grid | `tileSize` | slider | 10 → 80 |
| Layout | `layoutMode` | dropdown | Uniform Grid / Packed Rects A / Packed Rects B |
| Layout | `tileTypes` | toggle (multi) | Concentric / Wedge / Stripe / Solid / Texture / Micro |
| Layout | `randomSeed` | number | 0 → 999999 |
| Behavior | `animationMode` | dropdown | Static / Morph Layouts / Breathing / Texture Drift / All |
| Behavior | `animationSpeed` | slider | 0.1 → 5 |

### STYLE tab

| Block | Key | Type | Range / Options |
|---|---|---|---|
| Palette | `paletteSelection` | dropdown | Warm / Cool / Mixed / Earth / Pastel / High-Contrast |
| Palette | `paletteVariance` | slider | 0 → 1 |
| Depth | `depthStrength` | slider | 0 → 1 |
| Depth | `highlightIntensity` | slider | 0 → 1 |
| Depth | `globalLightAngle` | slider | 0 → 360 |
| Texture | `textureStrength` | slider | 0 → 1 |
| Texture | `overlayMode` | dropdown | None / Noise / Noise+Light |

**Total intended: 15 parameters.**

## Canvas (per spec)

- 900×900 (spec), 800×800 (live stub). Conflict.

## Export (per spec)

- PNG, SVG, GIF.
