# Unified Pattern — UI Layout

**Status: Unimplemented stub.**

## Live Parameters (Current)

| Group | Key | Type | Default | Range |
|---|---|---|---|---|
| Pattern | `scale` | slider | 5 | 1 → 10, step 0.1 |

**Total: 1 parameter.** `scale` is not read by the draw function.

## Intended Parameters (per spec)

### LAYOUT tab

| Block | Key | Type | Range |
|---|---|---|---|
| Grid | `gridSpacing` | slider | 10 → 100 |
| Grid | `jitter` | slider | 0 → 1 |
| Warp | `warpAmplitude` | slider | 0 → 1 |
| Warp | `warpFrequency` | slider | 0.1 → 5 |
| Density | `occupancyThreshold` | slider | 0 → 1 |

### SHAPE tab

| Block | Key | Type | Range |
|---|---|---|---|
| Geometry | `cornerExponent` | slider | 2 → 20 |
| Geometry | `aspectRatioMin` | slider | 0.3 → 1 |
| Geometry | `aspectRatioMax` | slider | 1 → 3 |
| Nesting | `nestingLevels` | stepper | 0 → 6 |
| Nesting | `nestingRatio` | slider | 0.5 → 0.9 |
| Blend | `blendRadius` | slider | 0 → 0.5 |

### STYLE tab

| Block | Key | Type | Options / Range |
|---|---|---|---|
| Palette | `palettePreset` | dropdown | Warm / Cool / Mixed / Earth / Pastel |
| Palette | `paletteVariance` | slider | 0 → 1 |
| Size | `sizeMin` | slider | 5 → 30 |
| Size | `sizeMax` | slider | 20 → 80 |

**Total intended: 15 parameters.**

## Canvas (per spec and live)

- 800×800, 2d context. (Spec and live agree.)

## Animation

- Static image only. No animation tab in spec; no animation key in live.

## Export (per spec)

- PNG, SVG.
