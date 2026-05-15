# Unified Pattern — UI Layout

## Parameters

| Group | Key | Type | Default | Range |
|---|---|---|---|---|
| Layout | `gridSpacing` | slider | 50 | 10 → 100, step 1 |
| Layout | `jitter` | slider | 0.5 | 0 → 1, step 0.01 |
| Layout | `warpAmplitude` | slider | 0.3 | 0 → 1, step 0.01 |
| Layout | `warpFrequency` | slider | 1.0 | 0.1 → 5, step 0.1 |
| Layout | `occupancyThreshold` | slider | 0.8 | 0 → 1, step 0.01 |
| Shape | `cornerExponent` | slider | 4 | 2 → 20, step 0.5 |
| Shape | `aspectRatioMin` | slider | 0.6 | 0.3 → 1, step 0.01 |
| Shape | `aspectRatioMax` | slider | 1.5 | 1 → 3, step 0.01 |
| Shape | `nestingLevels` | slider | 2 | 0 → 6, step 1 |
| Shape | `nestingRatio` | slider | 0.7 | 0.5 → 0.9, step 0.01 |
| Shape | `blendRadius` | slider | 0.1 | 0 → 0.5, step 0.01 |
| Style | `palettePreset` | dropdown | Warm | Warm, Cool, Mixed, Earth, Pastel |
| Style | `paletteVariance` | slider | 0.3 | 0 → 1, step 0.01 |
| Style | `sizeMin` | slider | 15 | 5 → 30, step 1 |
| Style | `sizeMax` | slider | 40 | 20 → 80, step 1 |

**Total: 15 parameters** across 3 groups.

## Canvas

- 800×800, 2d context. (Spec and live agree.)

## Animation

- `type: 'none'` (static image per parameter state).

## Export

- PNG enabled.
- GIF/WebM disabled.
