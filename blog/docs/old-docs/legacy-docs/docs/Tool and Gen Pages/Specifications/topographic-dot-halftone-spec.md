# Topographic Dot Halftone — Specification

## 1. Overview
- Purpose: Contour-aligned dot halftone with field-based shading
- Output Type: Static Image (PNG/SVG)

## 2. Module Dependencies
| Category | Module ID | Import From |
|----------|-----------|-------------|
| Math | MATH-002 | shared/math-utils.js |
| Math | MATH-009 | shared/math-utils.js |
| Img | IMG-007..009 | shared/image-utils.js |
| Geo | GEO-015 | shared/geometry-utils.js |
| Pattern | PAT-006, PAT-007 | shared/pattern-utils.js |
| Canvas | CANVAS-007 | shared/canvas-utils.js |

## 3. Sidebar Structure
TAB: INPUT
  BLOCK: Mode
    - dropdown: mode [vector, field, hybrid]
  BLOCK: Vector
    - fileInput: svgFile
    - dropdown: contourSource [SDF, Geodesic, Laplace]
  BLOCK: Field
    - fileInput: depthMap
    - fileInput: normalMap
    - fileInput: lumaImage
    - fileInput: maskImage

TAB: FIELD
  BLOCK: Weights
    - slider: weightDepth [0, 1]
    - slider: weightNormal [0, 1]
    - slider: weightLuma [0, 1]
  BLOCK: Influence
    - slider: normalInfluence [0, 1]
    - slider: depthInfluence [0, 1]
    - slider: shadingGamma [0.1, 3]

TAB: PATTERN
  BLOCK: Dots
    - slider: dotDensity [0.1, 20]
    - slider: minRadius [0.5, 5]
    - slider: maxRadius [2, 20]
  BLOCK: Lattice
    - slider: bandPitch [0.01, 0.5]
    - slider: alongPitch [0.01, 0.5]
    - slider: bandJitter [0, 0.5]

TAB: STYLE
  BLOCK: Colours
    - color: foreground
    - color: background
  BLOCK: Export
    - button: Download PNG
    - button: Download SVG

## 4. Implementation Skeleton
```javascript
var TOOL_CONFIG = {
    title: 'TOPOGRAPHIC DOT HALFTONE',
    sidebar: [/* tabs/blocks as above */],
    canvas: { width: 800, height: 800 },
    onInit: function(ctx, canvas, values) {
        this.fieldBuilder = new ContourFieldBuilder();
        this.dotLattice = new DotLattice();
    },
    onDraw: function(ctx, canvas, values) {
        var S = this.fieldBuilder.build(values);
        var T = tangentFromGradient(S);
        var dots = this.dotLattice.generate(S, T, values);
        renderDots(ctx, dots, values);
    }
};
```

