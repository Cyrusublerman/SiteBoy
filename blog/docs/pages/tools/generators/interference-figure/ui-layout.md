# Interference Figure — UI Layout

**Status: Unimplemented stub.**

## Live Parameters (Current)

| Group | Key | Type | Default | Range |
|---|---|---|---|---|
| Pattern | `sources` | slider | 4 | 2 → 10, step 1 |

**Total: 1 parameter.** `sources` is not read by the draw function.

## Intended Parameters (per spec)

### CONTROLS tab

| Block | Key | Type | Range / Options |
|---|---|---|---|
| Pattern | `patternFamily` | dropdown | Rings / Spiral / Biaxial / Grid / Petal / Multi-Axis / Organic / Hybrid |
| Pattern | `patternMorph` | slider | 0 → 1 |
| Fields | `radialWeight` | slider | 0 → 1 |
| Fields | `spiralWeight` | slider | 0 → 1 |
| Fields | `spiralRate` | slider | −4 → 4 |
| Fields | `wedgeXWeight` | slider | 0 → 1 |
| Fields | `wedgeYWeight` | slider | 0 → 1 |
| Angular | `angularN2Weight` | slider | −1 → 1 |
| Angular | `angularN4Weight` | slider | −1 → 1 |
| Angular | `angularN6Weight` | slider | −1 → 1 |
| Angular | `angularN8Weight` | slider | −1 → 1 |
| Transform | `saddleWeight` | slider | −1 → 1 |
| Transform | `squareWeight` | slider | 0 → 1 |
| Transform | `plateRotation` | slider | −180 → 180 |
| Transform | `globalScale` | slider | 0.2 → 3 |
| Multi-Axis | `multiAxisCount` | stepper | 0 → 4 |
| Multi-Axis | `axisRadius` | slider | 0 → 0.5 |
| Multi-Axis | `axisAngleSpread` | slider | 0 → 180 |

### STYLE tab

| Block | Key | Type | Range / Options |
|---|---|---|---|
| Colour | `backgroundColor` | color | hex |
| Colour | `spectralMode` | dropdown | Physical / Stylised |
| Colour | `exposure` | slider | 0.5 → 2 |
| Colour | `gamma` | slider | 1.8 → 2.4 |
| Colour | `saturationBoost` | slider | 0.5 → 1.5 |
| Noise | `noiseWeight` | slider | 0 → 0.5 |
| Noise | `noiseScale` | slider | 0.2 → 4 |
| Noise | `noiseOctaves` | stepper | 1 → 5 |

**Total intended: 26 parameters** (across 3 functional tabs; PRESETS tab uses buttons, not parameters).

## Canvas (per spec)

- 420×420 (spec), 800×800 (live stub). Conflict.

## Export (per spec)

- PNG, SVG.

## Presets (per spec)

- 6 preset buttons in PRESETS tab: Rings, Spiral, Biaxial, Grid, Petal, Organic.
