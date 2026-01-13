# Ribbon Breeze — Specification

## 1. Overview
- Purpose: Procedural ribbon field with wind-driven animation and 2.5D illusion
- Output Type: Animation + PNG/GIF export

## 2. Module Dependencies
| Category | Module ID | Import From |
|----------|-----------|-------------|
| Math | MATH-003 | shared/math-utils.js |
| Math | MATH-004 | shared/math-utils.js |
| Math | MATH-008 | shared/math-utils.js |
| Geo | GEO-008..014 | shared/geometry-utils.js |
| Pattern | PAT-005 | shared/pattern-utils.js |
| Canvas | CANVAS-006 | shared/canvas-utils.js |
| Anim | ANIM-001 | animation-foundation.js |

## 3. Sidebar Structure
TAB: CONTROLS
  BLOCK: Layout
    - slider: rows [4, 40]
    - slider: rowSpacing [0.5, 3]
    - slider: ribbonLength [100, 800]
    - slider: pointsPerRibbon [20, 200]
    - slider: thickness [1, 20]
  BLOCK: Wind
    - slider: k [0.01, 0.2]
    - slider: omega [0.01, 0.5]
    - slider: baseAmplitude [10, 100]
    - slider: noiseAmount [0, 1]

TAB: SHADING
  BLOCK: Mode
    - dropdown: shadingMode [gradient, inverted, flat, pattern, dither]
  BLOCK: Colours
    - color: frontColor
    - color: undersideColor
    - color: riserColor
    - color: lineColor
  BLOCK: Variation
    - slider: timeVariationStrength [0, 1]
    - slider: colourVariationPerRibbon [0, 1]

TAB: LOOP
  BLOCK: Perfect Loop
    - number: loopFrames [30, 600]
    - number: windCycles [1, 10]

TAB: CANVAS
  BLOCK: Size
    - slider: width [200, 1200]
    - slider: height [200, 1200]
  BLOCK: Export
    - button: Download PNG
    - button: Export GIF

## 4. Implementation Skeleton
```javascript
var TOOL_CONFIG = {
    title: 'RIBBON BREEZE',
    sidebar: [/* tabs/blocks as above */],
    canvas: { width: 800, height: 600 },
    onInit: function(ctx, canvas, values) {
        this.ribbonField = new RibbonField(values);
        this.windField = new WindField(values);
        this.timeLoop = new TimeLoop(values.loopFrames);
    },
    onDraw: function(ctx, canvas, values) {
        var phases = this.timeLoop.getPhases();
        this.ribbonField.update(this.windField, phases);
        this.ribbonField.render(ctx, values);
    },
    onDestroy: function() {
        if (this.animator) this.animator.destroy();
    }
};
```

