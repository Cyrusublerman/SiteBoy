# Interference Figure Generator — Specification

## 1. Overview
- Purpose: Crystal-like interference patterns from OPD fields with spectral colour
- Output Type: Static Image

## 2. Module Dependencies
| Category | Module ID | Import From |
|----------|-----------|-------------|
| Math | MATH-001 | shared/math-utils.js |
| Geo | GEO-026, GEO-027 | shared/geometry-utils.js |
| Physics | PHYS-006..010 | shared/physics-utils.js |
| Pattern | PAT-017 | shared/pattern-utils.js |
| Color | COLOR-009, COLOR-010 | shared/color-utils.js |

## 3. Sidebar Structure
TAB: CONTROLS
  BLOCK: Pattern
    - dropdown: patternFamily [Rings, Spiral, Biaxial, Grid, Petal, Multi-Axis, Organic, Hybrid]
    - slider: patternMorph [0, 1]
  BLOCK: Fields
    - slider: radialWeight [0, 1]
    - slider: spiralWeight [0, 1]
    - slider: spiralRate [-4, 4]
    - slider: wedgeXWeight [0, 1]
    - slider: wedgeYWeight [0, 1]
  BLOCK: Angular
    - slider: angularN2Weight [-1, 1]
    - slider: angularN4Weight [-1, 1]
    - slider: angularN6Weight [-1, 1]
    - slider: angularN8Weight [-1, 1]
  BLOCK: Transform
    - slider: saddleWeight [-1, 1]
    - slider: squareWeight [0, 1]
    - slider: plateRotation [-180, 180]
    - slider: globalScale [0.2, 3]
  BLOCK: Multi-Axis
    - stepper: multiAxisCount [0, 4]
    - slider: axisRadius [0, 0.5]
    - slider: axisAngleSpread [0, 180]

TAB: STYLE
  BLOCK: Colour
    - color: backgroundColor
    - dropdown: spectralMode [Physical, Stylised]
    - slider: exposure [0.5, 2]
    - slider: gamma [1.8, 2.4]
    - slider: saturationBoost [0.5, 1.5]
  BLOCK: Noise
    - slider: noiseWeight [0, 0.5]
    - slider: noiseScale [0.2, 4]
    - stepper: noiseOctaves [1, 5]

TAB: CANVAS
  BLOCK: Size
    - slider: width [196, 840]
    - slider: height [196, 840]
  BLOCK: Export
    - button: Download PNG
    - button: Download SVG

TAB: PRESETS
  BLOCK: Load
    - button: Load Rings
    - button: Load Spiral
    - button: Load Biaxial
    - button: Load Grid
    - button: Load Petal
    - button: Load Organic

## 4. Implementation Skeleton
```javascript
var TOOL_CONFIG = {
    title: 'INTERFERENCE FIGURES',
    sidebar: [/* tabs/blocks as above */],
    canvas: { width: 420, height: 420 },
    onDraw: function(ctx, canvas, values) {
        var coords = normalisedGrid(canvas, values);
        coords = polarTransform(coords, values);
        var D = opdBasisFields(coords, values);
        D = opdPerturbation(D, fractalNoise(values));
        var I = interferenceIntensity(D, values);
        if (values.polFactorEnabled) {
            I = polarisationFactor(I, values);
        }
        var rgb = spectralToRgb(I, values);
        rgb = toneMapper(rgb, values);
        renderImage(ctx, rgb);
    }
};
```

