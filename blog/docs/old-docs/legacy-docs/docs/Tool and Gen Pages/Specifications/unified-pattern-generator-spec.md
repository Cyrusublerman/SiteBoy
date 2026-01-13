# Unified Mid-Century Pattern Generator — Specification

## 1. Overview
- Purpose: Mid-century geometric motifs via superellipse SDF with continuous parameter space
- Output Type: Static Image

## 2. Module Dependencies
| Category | Module ID | Import From |
|----------|-----------|-------------|
| Math | MATH-001, MATH-002 | shared/math-utils.js |
| Geo | GEO-018..022 | shared/geometry-utils.js |
| Color | COLOR-008 | shared/color-utils.js |
| Canvas | CANVAS-013 | shared/canvas-utils.js |

## 3. Sidebar Structure
TAB: LAYOUT
  BLOCK: Grid
    - slider: gridSpacing [10, 100]
    - slider: jitter [0, 1]
  BLOCK: Warp
    - slider: warpAmplitude [0, 1]
    - slider: warpFrequency [0.1, 5]
  BLOCK: Density
    - slider: occupancyThreshold [0, 1]

TAB: SHAPE
  BLOCK: Geometry
    - slider: cornerExponent [2, 20]
    - slider: aspectRatioMin [0.3, 1]
    - slider: aspectRatioMax [1, 3]
  BLOCK: Nesting
    - stepper: nestingLevels [0, 6]
    - slider: nestingRatio [0.5, 0.9]
  BLOCK: Blend
    - slider: blendRadius [0, 0.5]

TAB: STYLE
  BLOCK: Palette
    - dropdown: palettePreset [Warm, Cool, Mixed, Earth, Pastel]
    - slider: paletteVariance [0, 1]
  BLOCK: Size
    - slider: sizeMin [5, 30]
    - slider: sizeMax [20, 80]

TAB: CANVAS
  BLOCK: Size
    - slider: width [200, 1200]
    - slider: height [200, 1200]
  BLOCK: Export
    - button: Download PNG
    - button: Download SVG

## 4. Implementation Skeleton
```javascript
var TOOL_CONFIG = {
    title: 'PATTERN GENERATOR',
    sidebar: [/* tabs/blocks as above */],
    canvas: { width: 800, height: 800 },
    onDraw: function(ctx, canvas, values) {
        var grid = jitteredGrid(values);
        var warp = domainWarp(values);
        var shapes = grid.map(c => {
            var nested = nestedShapes(c, values);
            return nested.map(s => superellipseSDF(s, warp));
        });
        var unions = smoothUnion(shapes, values.blendRadius);
        sdfRenderer(ctx, unions, paletteMapper(values));
    }
};
```

