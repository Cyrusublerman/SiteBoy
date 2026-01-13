# Smart Halftone Engine — Specification

## 1. Overview
- Purpose: Field-based modular halftoning with multiple style recipes
- Output Type: Static Image

## 2. Module Dependencies
| Category | Module ID | Import From |
|----------|-----------|-------------|
| Math | MATH-002, MATH-005 | shared/math-utils.js |
| Img | IMG-008, IMG-019, IMG-020 | shared/image-utils.js |
| Pattern | PAT-013..016 | shared/pattern-utils.js |
| Physics | PHYS-005 | shared/physics-utils.js |
| Geo | GEO-019, GEO-025 | shared/geometry-utils.js |

## 3. Sidebar Structure
TAB: CONTROLS
  BLOCK: Source
    - dropdown: inputSource [Image, Height, RD, AO, Custom]
    - slider: outputResolution [256, 4096]
    - number: seed [0, 1000000]
  BLOCK: Tone
    - stepper: toneLevels [2, 8]
    - dropdown: halftoneStyle [Base Lines, Smart Lines, Topographic, RD-Driven, Grid-Gradient, 3D-Aware]
    - stepper: familyCount [1, 6]
    - slider: baseFrequency [0.1, 20]
  BLOCK: Direction
    - dropdown: lineDirectionMode [Global, Image-Gradient, Surface-Slope, RD-Field]
  BLOCK: Contours
    - stepper: contourCount [1, 64]
    - slider: contourWidth [0.001, 0.25]
  BLOCK: RD
    - dropdown: rdPreset [Off, Spots, Stripes, Maze, Custom]
    - number: rdSteps [0, 5000]
  BLOCK: Warp
    - slider: domainWarpAmount [0, 1]

TAB: STYLE
  BLOCK: Appearance
    - color: strokeColour
    - color: backgroundColour
    - slider: strokeWidthBase [0.2, 4]
    - toggle: antiAlias
    - dropdown: fillMode [None, Gradient, Height, Tone]

TAB: CANVAS
  BLOCK: Export
    - button: Export Image
    - button: Export Vector

## 4. Implementation Skeleton
```javascript
var TOOL_CONFIG = {
    title: 'SMART HALFTONE',
    sidebar: [/* tabs/blocks as above */],
    canvas: { width: 800, height: 800 },
    onDraw: function(ctx, canvas, values) {
        var g = normalizeField(loadInput(values));
        var T = toneQuantizer(g, values.toneLevels);
        var direction = getDirectionField(g, values);
        var u = lineCoordinate(direction, values);
        var layers = [];
        if (values.halftoneStyle.includes('Lines')) {
            layers.push(lineFamilyGenerator(u, T, values));
        }
        if (values.halftoneStyle.includes('Topographic')) {
            layers.push(isoContourExtractor(g, values));
        }
        var final = layerCompositor(layers);
        renderMask(ctx, final, values);
    }
};
```

