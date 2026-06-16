# p5.js Generator Standards

Standards for p5.js-based generators in the unified generator system.

**Authority:** `blog/docs/guides/standards/design-law.md` — visual and geometric law. Colour rules here (§4) apply design-law §6 to the p5 canvas context. Sizing rules (§5) apply design-law §4.

---

## 1. Scope

Applies to generators using `context: 'p5'` in the generator page (`#tools/generators`).

Does NOT apply to:
- Standalone p5 tools (e.g. `p5-to-video`) using IframeSandbox
- Page-specific p5 sketches using `P5ControlledSketch`

---

## 2. Script Config Structure

### Required Fields
```javascript
export const SCRIPT_CONFIG = {
    id: 'kebab-case-id',
    title: 'Display Title',
    category: 'parametric|wave|pattern|other',
    
    canvas: {
        width: 800,
        height: 800,
        context: 'p5'  // REQUIRED for p5 generators
    },
    
    parameters: [
        { group: 'Group Name', params: [...] }
    ],
    
    // p5-specific callbacks (REQUIRED)
    p5Setup(p, params) { },
    p5Draw(p, params, frame) { }
};
```

### Optional Fields
```javascript
{
    description: 'Description for INFO tab',
    version: '1.0.0',
    presets: [...],
    animation: {
        type: 'parametric|infinite|sequence',
        loopFrames: 360,
        defaultFps: 60,
        // Modulator descriptors — preferred format
        modulators: [
            {
                targetKey: 'speed',
                enabled: false,
                driver: { type: 'lfo', config: { waveform: 'sine', rate: 1 } },
                shape:   { easing: 'linear', invert: false },
                range:   { depth: 1, bias: 0, bipolar: true },
                combine: 'add',
                sync:    { clock: 'loop', rateMul: 1 }
            }
        ],
        // Legacy format — still accepted, migrated to modulators[] by shim
        animatableParams: ['param1', 'param2']
    },
    export: { png: true, gif: true, webm: false }
}
```

`animatableParams` (array of strings or `{ key, mode, rate }` objects) is accepted for backward compatibility. The schema shim in `script-types.js` migrates it to `modulators[]` automatically before validation. Do not use it in new scripts.

---

## 3. p5 Callback Signatures

### p5Setup(p, params)
Called once when generator loads or script changes.

```javascript
p5Setup(p, params) {
    // Canvas created by host - do NOT call createCanvas()
    p.colorMode(p.HSB, 360, 100, 100);
    p.noLoop();  // REQUIRED if using external animation control
    
    // Pre-compute expensive data
    this.precomputed = computeExpensiveData(params);
}
```

**Rules:**
- Do NOT call `createCanvas()` - host manages canvas
- Call `p.noLoop()` if animation controlled externally
- Use `this` for state (bound to SCRIPT_CONFIG object)

### p5Draw(p, params, frame)
Called per frame by AnimationFoundation.

```javascript
p5Draw(p, params, frame) {
    p.background(0);
    
    const { amplitude, frequency, phase } = params;
    // phase is driven by a modulator — draw() reads params only
    
    for (let i = 0; i < 100; i++) {
        const x = p.map(i, 0, 100, 0, p.width);
        const y = p.height/2 + amplitude * p.sin(frequency * x + phase);
        p.point(x, y);
    }
}
```

**Rules:**
- Params object contains current UI values (including values written by modulators).
- Frame is integer counter (0, 1, 2, …).
- Do NOT call `loop()` or manage animation internally.
- All drawing per frame — no persistent state between frames unless via `this`.
- **Frame purity (required):** `p5Draw` reads `params.<key>` only for time-driven motion. Do NOT derive animation from `frame` directly (e.g. `frame * speed` to drive rotation). Declare that motion as a `linear` or `lfo` modulator targeting the param instead. `frame` may only be used as an opaque deterministic seed or index (e.g. `p.noiseSeed(frame)`).

---

## 4. Colour Constraints

### Canvas Output Exception

Colours used for generator visual output — pixels drawn to the p5 canvas — are **exempt** from the VGA/CSS-variable constraint. Generators may use any colour model (RGB, HSB, HSL, arbitrary hex) for their rendered output. This exemption is strictly scoped to the canvas drawing surface. All UI surfaces surrounding the canvas (controls, labels, borders, backgrounds) must still use `var(--c-*)` tokens.

### VGA Palette for UI Controls

When a generator exposes a user-selectable colour parameter, the UI control (rendered as a dropdown) must be populated with the VGA palette. The selected value is passed to the draw function, which may use it as-is on the canvas.

```javascript
// ✅ VGA palette for UI colour selector
const VGA_PALETTE = [
    '#000000', '#800000', '#008000', '#808000',
    '#000080', '#800080', '#008080', '#c0c0c0',
    '#808080', '#ff0000', '#00ff00', '#ffff00',
    '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
];
// parameter-builder renders type:'color' as a dropdown with VGA_PALETTE options

// ✅ Canvas output may use any colour
p.fill(255, 100, 50);       // fine for canvas output
p.stroke('#ff5500');        // fine for canvas output
p.background('coral');      // fine for canvas output

// ❌ FORBIDDEN — UI surface colours (borders, text, backgrounds)
element.style.color = '#ff5500';     // must use var(--c-text)
element.style.background = 'coral'; // must use var(--c-bg)
```

### VGA Palette Reference

```javascript
const VGA = {
    black: '#000000', maroon: '#800000', green: '#008000', olive: '#808000',
    navy: '#000080', purple: '#800080', teal: '#008080', silver: '#c0c0c0',
    gray: '#808080', red: '#ff0000', lime: '#00ff00', yellow: '#ffff00',
    blue: '#0000ff', fuchsia: '#ff00ff', aqua: '#00ffff', white: '#ffffff'
};
```

---

## 5. Sizing Constraints

### Canvas Dimensions
- Declare default width×height in `SCRIPT_CONFIG.canvas` (e.g. 800×800).
- Host owns resize via OUTPUT → Size (`canvasWidth` / `canvasHeight`); do **not** call `resizeCanvas()` or mutate canvas size inside the sketch.
- Host display modes (Fit/Fill/Actual) apply a **uniform** CSS scale only — they must not change aspect ratio.
- In `p5Draw` / `draw`, always read live dimensions (`p.width`/`p.height` or `canvas.width`/`canvas.height`); never hardcode layout centres or bounds from the default config size.
- Setup caches (grids, buffers, graphs) must rebuild when canvas size changes. Host re-runs `p5Setup` after `resizeCanvas`; scripts may also compare `_lastCanvasW/H` in `p5Draw` if they rebuild outside setup.

### Element Sizing
Use F-system via passed helpers:

```javascript
p5Draw(p, params, frame) {
    const F = 14;  // Base unit (TODO: inject from host)
    
    p.strokeWeight(F * 0.1);    // 1.4px
    p.textSize(F);              // 14px
}
```

---

## 6. Animation Control

### External Control (Default)
Host manages animation via AnimationFoundation:
- `p.noLoop()` in setup
- Host calls `p.redraw()` per frame
- Frame counter passed to p5Draw

### Internal Control (Not Recommended)
If sketch MUST manage own loop:
```javascript
canvas: {
    context: 'p5',
    p5Loop: true  // Signal to host
}
```
Use sparingly - breaks export compatibility.

---

## 7. State Management

### Transient State
Use `this` for pre-computed or cached data:

```javascript
p5Setup(p, params) {
    this.points = computePoints(params);
}

p5Draw(p, params, frame) {
    for (const pt of this.points) {
        p.point(pt.x, pt.y);
    }
}
```

### Param-Dependent Recomputation
Mark expensive computations:

```javascript
parameters: [{
    group: 'Shape',
    params: [{
        key: 'complexity',
        type: 'slider',
        min: 1, max: 100, default: 10,
        recomputeOnChange: true  // Triggers p5Setup re-run
    }]
}]
```

---

## 8. Export Compatibility

### PNG Export
Works automatically via host canvas capture.

### Animation Export (GIF/WebM)
- Host advances frame, calls p5Draw, captures
- Sketch must be deterministic (same params + frame = same output)
- No random() without seeded RNG

### Seeded Randomness
```javascript
p5Setup(p, params) {
    p.randomSeed(params.seed);
    p.noiseSeed(params.seed);
}

p5Draw(p, params, frame) {
    // Reseed per frame for determinism
    p.randomSeed(params.seed + frame);
}
```

---

## 9. Forbidden Patterns

| Pattern | Reason | Alternative |
|---------|--------|-------------|
| `createCanvas()` | Host manages | Canvas auto-created |
| `loop()` / internal animation | Breaks export | Use external control |
| Non-VGA colours | Aesthetic rule | Use VGA palette |
| `loadImage()` async | Timing issues | Preload in separate system |
| DOM manipulation | BaseComponent rule | Use ComponentLibrary |
| Global mode | Conflicts | Instance mode only |
| `frame * speed` for rotation/motion | Breaks frame-purity | Declare a `linear` modulator on the param |
| `animatableParams` in new scripts | Legacy format | Use `animation.modulators[]` |

---

## 10. Example: Minimal p5 Generator

```javascript
/**
 * Circles - Simple p5.js generator example
 */

export const SCRIPT_CONFIG = {
    id: 'p5-circles',
    title: 'P5 Circles',
    category: 'pattern',
    version: '1.0.0',
    
    canvas: {
        width: 800,
        height: 800,
        context: 'p5'
    },
    
    parameters: [{
        group: 'Pattern',
        params: [
            { key: 'count', type: 'slider', label: 'Count', 
              min: 1, max: 50, default: 10 },
            { key: 'radius', type: 'slider', label: 'Radius', 
              min: 10, max: 200, default: 50 },
            { key: 'speed', type: 'slider', label: 'Speed', 
              min: 0.001, max: 0.1, step: 0.001, default: 0.02 }
        ]
    }],
    
    presets: [
        { name: 'Dense', count: 40, radius: 20, speed: 0.05 },
        { name: 'Sparse', count: 5, radius: 150, speed: 0.01 }
    ],
    
    animation: {
        type: 'infinite',
        defaultFps: 60
    },
    
    p5Setup(p, params) {
        p.noLoop();
        p.noFill();
        p.strokeWeight(2);
    },
    
    p5Draw(p, params, frame) {
        p.background('#000000');
        p.stroke('#00ff00');
        
        const { count, radius, speed } = params;
        const t = frame * speed;
        
        for (let i = 0; i < count; i++) {
            const angle = (p.TWO_PI / count) * i + t;
            const x = p.width/2 + p.cos(angle) * (p.width/3);
            const y = p.height/2 + p.sin(angle) * (p.height/3);
            const r = radius * (0.5 + 0.5 * p.sin(t * 2 + i));
            p.circle(x, y, r);
        }
    }
};
```

---

## 11. Checklist Reference

See `guides/checklists/p5-generator.md` for implementation checklist.

