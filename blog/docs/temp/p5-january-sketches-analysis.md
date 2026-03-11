# p5.js January Sketches Analysis

Assessment of 14 p5.js sketches for migration to generator system.

---

## 1. Inventory

| Sketch | Category | Animation | Complexity | Migration Priority |
|--------|----------|-----------|------------|-------------------|
| wave_interference | wave | looping (3600 frames) | High | P1 - wave system exists |
| Wave_interference_colour | wave | looping | High | P1 - variant |
| Fib_balls | physics | continuous | High | P2 - complex physics |
| ring_polygon | pattern | looping (morphing) | Very High | P3 - complex geometry |
| Curtains | pattern | looping (3600 frames) | Very High | P3 - extensive modules |
| pulsing_recursive_grid | pattern | looping (360 frames) | Medium | P1 - simple recursion |
| order_and_disorder | pattern | looping (360 frames) | Medium | P1 - grid/noise |
| lines | pattern | looping | Low-Medium | P1 - likely simple |
| line_2_shape | pattern | looping | Medium | P2 |
| clockwise (x2) | animation | looping | Medium | P2 |
| shape_array_accident | pattern | unknown | Medium | P2 |
| Quine | special | unknown | Medium | P2 |
| Image_2_Cube | 3D/image | unknown | High | P3 - likely WEBGL |

---

## 2. Common Patterns Observed

### 2.1 Configuration Objects
All sketches use centralised config:
```javascript
const Config = {
    canvas: { width: 1080, height: 1080 },
    loopFrames: 3600,
    // domain-specific params
};
```
**Maps to:** SCRIPT_CONFIG.parameters with groups.

### 2.2 Module Pattern
Sketches split logic into object modules:
```javascript
const Wave = { height(px, py, source, time) { ... } };
const Normal = { calculate(px, py, sources, time, delta) { ... } };
```
**Maps to:** Either inline in script or extracted to algorithms library.

### 2.3 Global p5 Mode
All use global `setup()` / `draw()`:
```javascript
function setup() { createCanvas(1080, 1080); ... }
function draw() { ... }
```
**Requires:** Conversion to instance mode with `p5Setup` / `p5Draw`.

### 2.4 Frame-Based Animation
All use `frameCount` for time:
```javascript
var t = frameCount % Config.loopFrames;
```
**Maps to:** Use `frame` param passed to `p5Draw`.

### 2.5 Key Handlers
Many have debug/save hotkeys:
```javascript
function keyPressed() {
    if (key === 'd') saveCanvas('wave_' + nf(time, 5), 'png');
}
```
**Migration:** Remove - handled by generator toolbar export.

---

## 3. Colour Usage Assessment

| Sketch | Colour System | VGA Compliant | Notes |
|--------|--------------|---------------|-------|
| wave_interference | RGB computed | NO | Full RGB spectrum |
| Fib_balls | HSL computed | NO | Collision-based HSL |
| ring_polygon | Grayscale | YES (white/black) | Solid/gradient modes |
| pulsing_recursive_grid | HSL computed | NO | Area-mapped HSL |
| order_and_disorder | B&W | YES | Points only |

**Issue:** Most sketches compute colours algorithmically (HSL from geometry/physics).

**Options:**
1. Quantise output to VGA palette post-render
2. Map computed colours to VGA palette during render
3. Create "VGA mode" toggle as parameter
4. Accept non-VGA for generator output (allow for artistic sketches)

**Recommendation:** Option 4 - generators are artistic output, not UI. VGA constraint applies to UI chrome only.

---

## 4. Detailed Sketch Analysis

### 4.1 wave_interference
**Type:** Multi-source wave interference visualisation
**Resolution:** 1080×1080, configurable downsampling
**Animation:** 3600 frame loop, 4 orbiting wave sources
**Modules:**
- `SourceMotion` - perimeter path calculation
- `RefVector` - reference vector for colour computation
- `Wave` - wave height calculation
- `Normal` - surface normal computation
- `Delta` - rotation delta to RGB mapping
- `Color` - HSL/RGB conversion + hue shift

**Parameters (extractable):**
- wave.amplitude, wave.frequency, wave.speed
- source configs (loops, clockwise, startOffset)
- resolution, cycleFrames

**Migration complexity:** Medium-High (many modules)

---

### 4.2 Fib_balls
**Type:** Fibonacci circle packing with physics
**Resolution:** Dynamic (Fibonacci-based canvas size)
**Animation:** Continuous physics simulation
**Modules:**
- `Fibonacci` - sequence generator
- `ColorUtil` - collision-based colour changes
- `Physics` - separation, velocity resolution, wall bounce
- `Geometry` - tangent calculation, overlap detection
- `FrontChainPacker` - circle packing algorithm
- `InnerCircle`, `OuterCircle` - classes

**Parameters (extractable):**
- fibIndexForCanvas, maxFibIndex
- restitution, speeds, collision params
- colour shift scales, trail settings

**Migration complexity:** High (physics + classes)

**Note:** Uses `dist()`, `sqrt()`, `abs()` - p5 globals required.

---

### 4.3 ring_polygon (Curtains)
**Type:** Morphing polygon with 3D-like extrusion
**Resolution:** 1080×1080
**Animation:** 3600 frame loop, shape morphing 3→50 sides
**Modules:**
- `GeomUtils` - polygon geometry
- `ShapeGenerator` - polygon point generation
- `ArrayBuilder` - transforms (translate, rotate, skew, perspective)
- `Morpher` - shape interpolation
- `Timing` - animation timeline
- `defaultOscillator` - wave displacement
- `buildCurtainSegments` - F2 processor
- `drawCurtainSegments` - F3 renderer

**Parameters (extractable):**
- shapeConfig: count, outerRadius, resolution, polySpacing, min/maxSides
- transform: scaleX/Y, skewX/Y, perspectiveY
- extrusion: distance, factor, mode, vanishingPoint
- shadingMode: solid/solid-grey/gradient

**Migration complexity:** Very High (extensive module system)

**Note:** Best candidate for algorithm library extraction.

---

### 4.4 pulsing_recursive_grid
**Type:** Golden ratio recursive subdivision
**Resolution:** 800×800
**Animation:** 360 frame loop
**Algorithm:** Recursive subdivision with φ-based splits

**Parameters (extractable):**
- MAX_DEPTH (13)
- LOOP_FRAMES (360)

**Migration complexity:** Low (single recursive function)

**Note:** Good first p5 migration candidate.

---

### 4.5 order_and_disorder
**Type:** Grid of points with noise/influence field
**Resolution:** 1080×1080
**Animation:** 360 frame loop (rotating influence)
**Modules:**
- `BeanInfluence` - spatial influence calculation
- `GridPoint` - individual point with noise
- `PointField` - grid container

**Parameters (extractable):**
- gridSpacing, gridMargin
- noiseMaxOffset, noiseSpatialScale, noiseTimeScale
- jiggleAmount, jiggleSpeed
- constraint params

**Migration complexity:** Medium (class-based)

---

## 5. Algorithm Library Candidates

From these sketches, algorithms to extract:

| Algorithm | Source Sketch | Library Category |
|-----------|--------------|------------------|
| Circle packing (front-chain) | Fib_balls | geometry/packing |
| Fibonacci sequence | Fib_balls | math/sequences |
| Wave height/interference | wave_interference | physics/waves |
| Surface normal calculation | wave_interference | geometry/normals |
| Golden ratio subdivision | pulsing_recursive_grid | geometry/subdivision |
| Polygon morphing | ring_polygon | geometry/morphing |
| 2D transform matrices | ring_polygon | geometry/transforms |
| Noise-based displacement | order_and_disorder | noise/displacement |
| HSL↔RGB conversion | wave_interference, Fib_balls | colour/conversion |

---

## 6. Migration Template

For each sketch, conversion follows:

```javascript
// From global mode:
function setup() { ... }
function draw() { ... }

// To instance mode SCRIPT_CONFIG:
export const SCRIPT_CONFIG = {
    id: 'sketch-name',
    title: 'Sketch Name',
    category: 'pattern|wave|physics',
    canvas: { width: 1080, height: 1080, context: 'p5' },
    
    parameters: [
        { group: 'Core', params: [
            // Extracted from Config object
        ]}
    ],
    
    animation: {
        type: 'loop',
        loopFrames: 3600,
        defaultFps: 60
    },
    
    // Module functions become methods on config or separate imports
    _modules: { Wave, Normal, ... },
    
    p5Setup(p, params) {
        // Contents of setup() minus createCanvas
        p.noLoop();
        // Init modules with params
    },
    
    p5Draw(p, params, frame) {
        // Contents of draw() using params instead of Config
        const t = frame % params.loopFrames;
        // ...
    }
};
```

---

## 7. VGA Colour Adapter (Proposed)

For sketches with computed colours, add adapter:

```javascript
const VGA_PALETTE = [
    '#000000', '#800000', '#008000', '#808000',
    '#000080', '#800080', '#008080', '#c0c0c0',
    '#808080', '#ff0000', '#00ff00', '#ffff00',
    '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
];

function quantiseToVGA(r, g, b) {
    let minDist = Infinity, best = 0;
    for (let i = 0; i < 16; i++) {
        const hex = VGA_PALETTE[i];
        const vr = parseInt(hex.slice(1,3), 16);
        const vg = parseInt(hex.slice(3,5), 16);
        const vb = parseInt(hex.slice(5,7), 16);
        const d = (r-vr)**2 + (g-vg)**2 + (b-vb)**2;
        if (d < minDist) { minDist = d; best = i; }
    }
    return VGA_PALETTE[best];
}
```

**Usage:** Add `vgaMode` toggle parameter; if enabled, quantise all colours.

---

## 8. Migration Priority Order

### Phase 1 - Simple (immediate)
1. `pulsing_recursive_grid` - simple recursion, good first test
2. `order_and_disorder` - grid + noise, moderate complexity

### Phase 2 - Medium
3. `lines` / `line_2_shape` - likely simpler line drawings
4. `clockwise` - clock-based animation
5. `shape_array_accident` - pattern variation

### Phase 3 - Complex
6. `wave_interference` variants - extensive modules
7. `Fib_balls` - physics simulation
8. `ring_polygon`/`Curtains` - most complex, best for algorithm extraction

### Phase 4 - Special
9. `Image_2_Cube` - likely WebGL, image input
10. `Quine` - needs inspection

---

## 9. Recommendations

1. **Start with `pulsing_recursive_grid`** - simplest, tests p5 pipeline
2. **Extract algorithms before migrating complex sketches** - Wave, Fibonacci, Morphing
3. **Relax VGA for generator output** - artistic sketches need full colour
4. **Add loopFrames to animation config** - all sketches are loop-based
5. **Create p5-specific preset format** - many sketches have keyboard presets
6. **Consider batch export** - most need 360-3600 frame sequences

---

## 10. Files Location After Extraction

```
reference/p5js january/extracted/
├── wave_interference/sketch.js     ✓ read
├── fib_balls/sketch.js             ✓ read
├── ring_polygon/sketch.js          ✓ read
├── pulsing_recursive_grid/sketch.js ✓ read
├── order_and_disorder/sketch.js    ✓ read
├── lines/sketch.js                 (extracted)
└── ... (others need extraction)
```

