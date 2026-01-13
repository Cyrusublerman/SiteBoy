# Generative Pattern Algorithm — Specification

## 1. Overview
- Purpose: Unified Truchet/blob/contour patterns with smooth transitions
- Output Type: Animation + Static Image

## 2. Module Dependencies
| Category | Module ID | Import From |
|----------|-----------|-------------|
| Math | MATH-003 | shared/math-utils.js |
| Geo | GEO-023, GEO-024 | shared/geometry-utils.js |
| Physics | PHYS-005 | shared/physics-utils.js |
| Img | IMG-018 | shared/image-utils.js |
| Pattern | PAT-010..012 | shared/pattern-utils.js |
| Anim | ANIM-012 | animation-foundation.js |

## 3. Sidebar Structure
TAB: POINTS
  BLOCK: Distribution
    - slider: density [0.1, 10]
    - slider: gridStrength [0, 1]
    - slider: clusterScale [0.1, 5]
    - slider: jitter [0, 1]
  BLOCK: Connectivity
    - slider: connectionRadius [0.5, 5]
    - stepper: maxDegree [2, 8]
    - slider: axisBias [0, 1]
    - slider: arcQuantisation [0, 1]

TAB: EVOLUTION
  BLOCK: RD
    - slider: Du [0.1, 0.5]
    - slider: Dv [0.01, 0.2]
    - slider: feedRate [0.01, 0.1]
    - slider: killRate [0.04, 0.08]
  BLOCK: Steps
    - number: iterations [0, 5000]

TAB: RENDER
  BLOCK: Mode
    - dropdown: renderMode [Truchet, Blob, Nested Contours, Global Contours]
  BLOCK: Style
    - slider: weightScale [0.5, 5]
    - slider: tileWindowSize [0.5, 2]
    - slider: boundaryCost [0, 1]

TAB: ANIMATION
  BLOCK: Flow
    - slider: flowSpeed [0, 2]
    - slider: noiseFrequency [0.1, 5]
  BLOCK: Export
    - button: Download PNG
    - button: Export GIF

## 4. Implementation Skeleton
```javascript
var TOOL_CONFIG = {
    title: 'GENERATIVE PATTERNS',
    sidebar: [/* tabs/blocks as above */],
    canvas: { width: 800, height: 800 },
    onInit: function(ctx, canvas, values) {
        this.pointSet = hybridPointDistribution(values);
        this.graph = proximityGraph(this.pointSet, values);
    },
    onDraw: function(ctx, canvas, values) {
        if (values.iterations > 0) {
            grayScottSolver(this.pointSet, values);
        }
        var sdf = distanceTransform(this.graph);
        switch (values.renderMode) {
            case 'Truchet': truchetTemplates(ctx, sdf); break;
            case 'Blob': blobUnion(ctx, sdf, values); break;
            default: nestedContours(ctx, sdf, values);
        }
    }
};
```

