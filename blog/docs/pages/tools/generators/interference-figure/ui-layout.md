# Interference Figure — UI Layout

## Parameters (Live)

| Block | Key | Type | Range / Options |
|---|---|---|---|
| Pattern | `patternFamily` | dropdown | Rings / Spiral / Biaxial / Grid / Petal / Multi-Axis / Organic / Hybrid |
| Pattern | `patternMorph` | slider | 0 → 1 (step 0.01) |
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

Total: 26 parameters.

## Host Surfaces

- `PARAMS`: Pattern, Fields, Angular, Transform, Multi-Axis, Colour, Noise.
- `CANVAS`: host-managed size/background tab.
- `ANIMATE`: present but inactive (`animation.type: none`).
- `EXPORT`: PNG enabled; GIF/WebM disabled.
- `INFO`: present via `infoSections`.

## Canvas and Export

- Canvas: `420 x 420`.
- Export: PNG only.
- SVG: unsupported.

## Presets

- Rings
- Spiral
- Biaxial
- Grid
- Petal
- Organic
