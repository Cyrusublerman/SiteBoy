# Moiré Field Generator — Specification

## 1. Overview
- Purpose: Static and animated moiré patterns from interacting gratings
- Output Type: Animation + Static Image

## 2. Module Dependencies
| Category | Module ID | Import From |
|----------|-----------|-------------|
| Math | MATH-005 | shared/math-utils.js |
| Math | MATH-010, MATH-011 | shared/math-utils.js |
| Physics | PHYS-003, PHYS-004 | shared/physics-utils.js |
| Geo | GEO-017 | shared/geometry-utils.js |
| Img | IMG-010 | shared/image-utils.js |
| Anim | ANIM-011 | animation-foundation.js |
| Canvas | CANVAS-010 | shared/canvas-utils.js |

## 3. Sidebar Structure
TAB: CONTROLS
  BLOCK: Gratings
    - stepper: gratingCount [1, 4]
    - slider: baseWavelength [0.001, 0.1]
    - slider: angularFrequency [0, 24]
    - slider: angularModAmplitude [0, 2]
    - slider: phaseOffset [0, 1]
    - dropdown: gratingCombination [SUM, PRODUCT, MIN, MAX]
  BLOCK: Multi-Centre
    - slider: centreOffset [0, 1]
    - slider: centreWeightA [0, 1]
    - slider: centreWeightB [0, 1]
  BLOCK: Mask
    - dropdown: maskType [None, Circle, Triangle, Polygon]
    - slider: maskSize [0, 1]
    - slider: maskRotation [0, 360]
  BLOCK: Animation
    - toggle: animate
    - slider: phaseSpeed [0, 1]

TAB: STYLE
  BLOCK: Appearance
    - slider: lineThreshold [0, 1]
    - color: foreground
    - color: background
    - toggle: invert

TAB: CANVAS
  BLOCK: Size
    - slider: width [196, 2048]
    - slider: height [196, 2048]
  BLOCK: Export
    - button: Export PNG
    - button: Export SVG
    - button: Export GIF

## 4. Implementation Skeleton
```javascript
var TOOL_CONFIG = {
    title: 'MOIRÉ FIELD',
    sidebar: [/* tabs/blocks as above */],
    canvas: { width: 840, height: 840 },
    onInit: function(ctx, canvas, values) {
        this.initWebGL(canvas);
    },
    onDraw: function(ctx, canvas, values) {
        this.updateUniforms(values);
        this.renderGratings();
    }
};
```

