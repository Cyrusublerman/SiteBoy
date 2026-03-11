# p5.js January Sketches Migration Plan

Migration plan for converting 14 p5.js sketches to the unified generator system.

---

## Overview

| Total Sketches | Migrated | Remaining | Est. Effort |
|----------------|----------|-----------|-------------|
| 14 | 1 | 13 | ~8-12 hours |

**Reference Implementation:** `golden-grid.gen.js` (migrated from `pulsing_recursive_grid`)

---

## Migration Phases

### Phase 1: Simple Patterns (2-3 hours)
Direct migrations with minimal refactoring.

| # | Sketch | Target ID | Complexity | Notes |
|---|--------|-----------|------------|-------|
| ✅ | pulsing_recursive_grid | `golden-grid` | Low | DONE - reference implementation |
| 1.1 | order_and_disorder | `order-disorder` | Medium | Grid + noise field, class-based |
| 1.2 | lines | `animated-lines` | Low | Needs extraction to assess |
| 1.3 | line_2_shape | `line-to-shape` | Low-Med | Needs extraction to assess |

### Phase 2: Clock/Rotation Animations (2 hours)
Time-based animations.

| # | Sketch | Target ID | Complexity | Notes |
|---|--------|-----------|------------|-------|
| 2.1 | clockwise (v1) | `clockwise` | Medium | Clock-based animation |
| 2.2 | clockwise (v2) | — | — | Skip if duplicate |
| 2.3 | shape_array_accident | `shape-array` | Medium | Pattern variation |

### Phase 3: Wave Systems (2-3 hours)
Wave interference - extract shared algorithms first.

| # | Sketch | Target ID | Complexity | Notes |
|---|--------|-----------|------------|-------|
| 3.1 | wave_interference | `p5-wave-interference` | High | Multi-source wave sim |
| 3.2 | Wave_interference_colour | `p5-wave-colour` | High | Colour variant |

**Pre-requisite:** Extract to `algorithms/physics/`:
- `wave-height.js` - wave height calculation
- `surface-normal.js` - normal computation
- `hsl-rgb.js` - colour conversion (if not exists)

### Phase 4: Complex Simulations (3-4 hours)
Physics and advanced geometry.

| # | Sketch | Target ID | Complexity | Notes |
|---|--------|-----------|------------|-------|
| 4.1 | Fib_balls | `fibonacci-balls` | Very High | Physics + circle packing |
| 4.2 | ring_polygon (Curtains) | `curtain-morph` | Very High | Shape morphing + extrusion |

**Pre-requisite:** Extract to `algorithms/`:
- `geometry/circle-packing.js` - front-chain packer
- `geometry/polygon-morph.js` - shape interpolation
- `physics/collision.js` - 2D physics
- `math/fibonacci.js` - sequence generator

### Phase 5: Special Cases (1-2 hours)
Requires investigation or special handling.

| # | Sketch | Target ID | Complexity | Notes |
|---|--------|-----------|------------|-------|
| 5.1 | Quine | `quine` | Medium | Self-referential - needs inspection |
| 5.2 | Image_2_Cube | `image-cube` | High | Likely WEBGL + image input |

---

## Per-Sketch Migration Checklist

### 1.1 order_and_disorder → `order-disorder`

**Source:** `reference/p5js january/order_and_disorder_*.zip`

**Parameters to extract:**
```javascript
{ group: 'Grid', params: [
    { key: 'gridSpacing', type: 'slider', min: 2, max: 20, default: 6 },
    { key: 'gridMargin', type: 'slider', min: 0, max: 50, default: 10 },
    { key: 'pointSize', type: 'slider', min: 1, max: 5, default: 2 }
]},
{ group: 'Noise', params: [
    { key: 'noiseMaxOffset', type: 'slider', min: 0, max: 50, default: 20 },
    { key: 'noiseSpatialScale', type: 'slider', min: 0.01, max: 0.1, step: 0.01, default: 0.03 },
    { key: 'noiseTimeScale', type: 'slider', min: 0.001, max: 0.05, step: 0.001, default: 0.016 }
]},
{ group: 'Influence', params: [
    { key: 'sourceRadius', type: 'slider', min: 50, max: 400, default: 270 },
    { key: 'innerConstraint', type: 'slider', min: 50, max: 300, default: 195 },
    { key: 'outerConstraint', type: 'slider', min: 50, max: 300, default: 165 }
]}
```

**Conversion notes:**
- Convert `BeanInfluence`, `GridPoint`, `PointField` classes to config methods
- Use `frame` param instead of `frameCount`
- Canvas: 1080×1080

---

### 1.2 lines → `animated-lines`

**Source:** `reference/p5js january/lines_*.zip`

**Status:** Needs extraction and inspection

**Tasks:**
- [ ] Extract zip
- [ ] Read sketch.js
- [ ] Identify parameters
- [ ] Create SCRIPT_CONFIG

---

### 1.3 line_2_shape → `line-to-shape`

**Source:** `reference/p5js january/line_2_shape_*.zip`

**Status:** Needs extraction and inspection

---

### 2.1 clockwise → `clockwise`

**Source:** `reference/p5js january/clockwise_*.zip` (two versions)

**Status:** Needs extraction - check if versions differ

---

### 2.2 shape_array_accident → `shape-array`

**Source:** `reference/p5js january/shape_array_accident._*.zip`

**Status:** Needs extraction and inspection

---

### 3.1 wave_interference → `p5-wave-interference`

**Source:** `reference/p5js january/wave_interference_*.zip`

**Parameters to extract:**
```javascript
{ group: 'Wave', params: [
    { key: 'amplitude', type: 'slider', min: 1, max: 20, default: 4 },
    { key: 'frequency', type: 'slider', min: 0.1, max: 1, step: 0.01, default: 0.251 },
    { key: 'speed', type: 'slider', min: 0.001, max: 0.1, step: 0.001, default: 0.02 }
]},
{ group: 'Sources', params: [
    { key: 'source1Loops', type: 'slider', min: 1, max: 30, default: 10 },
    { key: 'source2Loops', type: 'slider', min: 1, max: 30, default: 7 },
    { key: 'source3Loops', type: 'slider', min: 1, max: 30, default: 18 },
    { key: 'source4Loops', type: 'slider', min: 1, max: 30, default: 3 }
]},
{ group: 'Render', params: [
    { key: 'resolution', type: 'slider', min: 1, max: 8, default: 2 },
    { key: 'cycleFrames', type: 'slider', min: 360, max: 7200, default: 3600 }
]}
```

**Modules to inline or extract:**
- `SourceMotion` - perimeter path
- `RefVector` - reference vector
- `Wave` - height calculation
- `Normal` - surface normal
- `Delta` - rotation to RGB
- `Color` - HSL/RGB conversion

**Conversion notes:**
- Uses pixel manipulation (`loadPixels`, `updatePixels`)
- Heavy computation - consider WebWorker for export
- Canvas: 1080×1080

---

### 3.2 Wave_interference_colour → `p5-wave-colour`

**Source:** `reference/p5js january/Wave_interference_colour_*.zip`

**Status:** Variant of 3.1 - migrate after base version

---

### 4.1 Fib_balls → `fibonacci-balls`

**Source:** `reference/p5js january/Fib_balls_*.zip`

**Parameters to extract:**
```javascript
{ group: 'Fibonacci', params: [
    { key: 'fibIndexForCanvas', type: 'slider', min: 10, max: 18, default: 14 },
    { key: 'maxFibIndex', type: 'slider', min: 6, max: 14, default: 12 }
]},
{ group: 'Physics', params: [
    { key: 'restitution', type: 'slider', min: 0.5, max: 1, step: 0.01, default: 0.95 },
    { key: 'outerSpeed', type: 'slider', min: 0.1, max: 2, step: 0.1, default: 0.5 },
    { key: 'innerSpeed', type: 'slider', min: 0.1, max: 1, step: 0.1, default: 0.3 },
    { key: 'collisionPasses', type: 'slider', min: 1, max: 16, default: 8 }
]},
{ group: 'Visual', params: [
    { key: 'trailLength', type: 'slider', min: 0, max: 20, default: 5 },
    { key: 'trailAlphaDecay', type: 'slider', min: 0.3, max: 0.9, step: 0.1, default: 0.6 }
]}
```

**Classes to convert:**
- `Fibonacci` → utility function
- `ColorUtil` → inline methods
- `Physics` → algorithm extraction candidate
- `Geometry` → algorithm extraction candidate
- `FrontChainPacker` → algorithm extraction candidate
- `InnerCircle`, `OuterCircle` → config state objects

**Conversion notes:**
- Dynamic canvas size (Fibonacci-based)
- Continuous animation (not loop-based)
- HSL colour mode
- Click to regenerate → parameter or button

---

### 4.2 ring_polygon (Curtains) → `curtain-morph`

**Source:** `reference/p5js january/ring_polygon_*.zip`

**Parameters to extract:**
```javascript
{ group: 'Shape', params: [
    { key: 'shapeCount', type: 'slider', min: 1, max: 10, default: 5 },
    { key: 'outerRadius', type: 'slider', min: 100, max: 500, default: 420 },
    { key: 'polySpacing', type: 'slider', min: 20, max: 200, default: 150 },
    { key: 'minSides', type: 'slider', min: 3, max: 10, default: 4 },
    { key: 'maxSides', type: 'slider', min: 6, max: 50, default: 10 }
]},
{ group: 'Transform', params: [
    { key: 'scaleX', type: 'slider', min: 0.5, max: 2, step: 0.1, default: 1 },
    { key: 'scaleY', type: 'slider', min: 0.5, max: 2, step: 0.1, default: 1 },
    { key: 'skewX', type: 'slider', min: -0.5, max: 0.5, step: 0.05, default: 0 },
    { key: 'perspectiveY', type: 'slider', min: 0, max: 0.5, step: 0.05, default: 0 }
]},
{ group: 'Extrusion', params: [
    { key: 'extrusionMode', type: 'dropdown', options: ['parallel', 'vanishing'], default: 'vanishing' },
    { key: 'extrusionFactor', type: 'slider', min: 0.1, max: 0.8, step: 0.1, default: 0.4 },
    { key: 'shadingMode', type: 'dropdown', options: ['solid', 'solid-grey', 'gradient'], default: 'gradient' }
]},
{ group: 'Wave', params: [
    { key: 'waveAmplitude', type: 'slider', min: 0, max: 50, default: 10 },
    { key: 'waveCount', type: 'slider', min: 1, max: 100, default: 50 }
]}
```

**Modules to extract:**
- `GeomUtils` → `algorithms/geometry/polygon.js`
- `ShapeGenerator` → inline
- `ArrayBuilder` → `algorithms/geometry/transform-2d.js`
- `Morpher` → `algorithms/geometry/morph.js`
- `Timing` → inline (animation timeline)
- `buildCurtainSegments` → inline (F2)
- `drawCurtainSegments` → inline (F3)

**Conversion notes:**
- Most complex sketch (1125 lines)
- Best candidate for algorithm library extraction
- Canvas: 1080×1080
- Multiple debug modes (keyboard toggles)

---

### 5.1 Quine → `quine`

**Source:** `reference/p5js january/Quine_*.zip`

**Status:** Needs extraction and inspection
- Self-referential code?
- May have special requirements

---

### 5.2 Image_2_Cube → `image-cube`

**Source:** `reference/p5js january/Image_2_Cube_*.zip`

**Status:** Needs extraction and inspection
- Likely uses WEBGL context
- May require image input (FileInput component)
- Consider separate tool vs generator

---

## Algorithm Extraction Plan

Before Phase 3-4, extract shared algorithms:

### Priority 1 (needed for wave_interference)
```
algorithms/physics/wave-height.js
algorithms/geometry/surface-normal.js
```

### Priority 2 (needed for Fib_balls)
```
algorithms/geometry/circle-packing.js
algorithms/physics/collision-2d.js
algorithms/math/fibonacci.js
```

### Priority 3 (needed for Curtains)
```
algorithms/geometry/polygon-utils.js
algorithms/geometry/transform-2d.js
algorithms/geometry/shape-morph.js
```

---

## Colour Strategy

Most sketches use computed HSL colours (not VGA compliant).

**Decision:** Allow non-VGA colours in generator output.

**Optional:** Add `vgaQuantize` parameter that post-processes colours to nearest VGA.

---

## Testing Strategy

For each migrated sketch:

1. **Load Test:** Navigate to `#tools/generators?script={id}`
2. **Render Test:** Verify initial frame renders correctly
3. **Animation Test:** Play animation, verify smooth loop
4. **Parameter Test:** Adjust each slider, verify responsive
5. **Preset Test:** Apply each preset, verify expected result
6. **Export Test:** Export single frame PNG
7. **Compare:** Visual comparison with original sketch

---

## File Locations

### Source (to extract)
```
reference/p5js january/
├── *.zip (14 files)
└── extracted/
    ├── wave_interference/sketch.js ✓
    ├── fib_balls/sketch.js ✓
    ├── ring_polygon/sketch.js ✓
    ├── pulsing_recursive_grid/sketch.js ✓
    ├── order_and_disorder/sketch.js ✓
    └── lines/sketch.js ✓
```

### Target (generators)
```
assets/js/tools/generators/scripts/
├── pattern/
│   ├── golden-grid.gen.js ✓ (done)
│   ├── order-disorder.gen.js
│   ├── animated-lines.gen.js
│   ├── line-to-shape.gen.js
│   └── shape-array.gen.js
├── wave/
│   ├── p5-wave-interference.gen.js
│   └── p5-wave-colour.gen.js
├── physics/
│   └── fibonacci-balls.gen.js
└── other/
    ├── clockwise.gen.js
    ├── curtain-morph.gen.js
    ├── quine.gen.js
    └── image-cube.gen.js
```

---

## Progress Tracking

| Phase | Sketch | Status | Date |
|-------|--------|--------|------|
| 1 | pulsing_recursive_grid | ✅ Done | — |
| 1.1 | order_and_disorder | ⬜ Pending | — |
| 1.2 | lines | ⬜ Pending | — |
| 1.3 | line_2_shape | ⬜ Pending | — |
| 2.1 | clockwise | ⬜ Pending | — |
| 2.2 | shape_array_accident | ⬜ Pending | — |
| 3.1 | wave_interference | ⬜ Pending | — |
| 3.2 | Wave_interference_colour | ⬜ Pending | — |
| 4.1 | Fib_balls | ⬜ Pending | — |
| 4.2 | ring_polygon | ⬜ Pending | — |
| 5.1 | Quine | ⬜ Pending | — |
| 5.2 | Image_2_Cube | ⬜ Pending | — |

---

## Next Steps

1. Extract remaining zips to `extracted/` folder
2. Migrate Phase 1 sketches (order_and_disorder, lines, line_2_shape)
3. Extract algorithms before Phase 3
4. Complete Phase 2-5 in order
5. Final testing pass
