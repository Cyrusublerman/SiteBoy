# P5.js & Generative Art System Assessment

## Current State Analysis

### Existing Generator Tools (16 tools)

| Tool | File | Pattern | Animation | Export | Notes |
|------|------|---------|-----------|--------|-------|
| circles | circles-tool.js | ToolBase | AnimationLoop | PNG | |
| torus | torus-tool.js | ToolBase | AnimationLoop | PNG | |
| harmonics | harmonics-tool.js | ToolBase | AnimationLoop | PNG | |
| lissajous | lissajous-tool.js | ToolBase | AnimationLoop | PNG/ZIP/WebM/GIF | Sequencer, presets, history |
| squares | squares-tool.js | ToolBase | AnimationLoop | PNG | |
| cymatics | cymatics-tool.js | ToolBase | AnimationLoop | PNG | Particle system |
| wave-interference | wave-interference-tool.js | ToolBase | AnimationLoop | PNG/SVG | WebGL + CPU fallback, checkpoints |
| generative-pattern | generative-pattern.js | ToolBase | AnimationLoop | PNG | |
| unified-pattern | unified-pattern.js | ToolBase | AnimationLoop | PNG | |
| moire-generator | moire-generator.js | ToolBase | AnimationLoop | PNG | |
| interference-figure | interference-figure.js | ToolBase | AnimationLoop | PNG | |
| ribbon-breeze | ribbon-breeze.js | ToolBase | AnimationLoop | PNG | |
| tile-mosaic | tile-mosaic.js | ToolBase | AnimationLoop | PNG | |
| wave-equation-synth | wave-equation-synth.js | ToolBase | AnimationLoop | PNG | |
| clock | solar-system-tool.js | ToolBase | AnimationLoop | PNG | |
| defecated | defecated-tool.js | ToolBase | AnimationLoop | PNG | |

### Related Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| p5-to-video | Convert p5.js code to video | Uses IframeSandbox, CCapture.js |

---

## Architecture Assessment

### Strengths

1. **ToolBase System**
   - Declarative configuration via arrays
   - Auto-injects CANVAS + ANIMATION tabs when configured
   - Unified sidebar/canvas layout
   - Component dependency injection

2. **AnimationFoundation**
   - Standardised AnimationLoop class
   - Unified lifecycle: start/stop/pause/destroy
   - Frame timing control
   - Automatic cleanup integration

3. **ComponentLibrary Integration**
   - Slider, dropdown, toggle, radio, button, etc.
   - Sequencer component for checkpoint animation
   - CheckpointList for state management

### Weaknesses

1. **No Unified p5.js Integration**
   - Each tool implements its own draw loop
   - No standard canvas abstraction for p5.js
   - p5-to-video uses IframeSandbox (security isolation) but not integrated with tools

2. **Inconsistent Feature Sets**
   - Lissajous: Full sequencer, presets, history, multi-format export
   - Wave-interference: Checkpoints, phase animation, SVG export, WebGL
   - Others: Minimal export (PNG only)

3. **Navigation Problem**
   - 16+ separate pages in `#tools/generators/*`
   - Flat list in navigation dropdown
   - No grouping or gallery view

4. **Missing Standardisation**
   - No common preset system
   - No common parameter save/load
   - No common animation export
   - No documentation integration

---

## Proposed Unified System

### Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GenerativeToolHost                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Sidebar (4 tabs max)                                     │  │
│  │  ┌─────────┬─────────┬─────────┬─────────┐              │  │
│  │  │ PARAMS  │ ANIMATE │ EXPORT  │ INFO    │              │  │
│  │  └─────────┴─────────┴─────────┴─────────┘              │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ Script-defined controls (injected from config)   │   │  │
│  │  │ • Sliders, toggles, dropdowns                    │   │  │
│  │  │ • Presets dropdown                               │   │  │
│  │  │ • Randomise button                               │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Canvas Area                                              │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │                                                    │   │  │
│  │  │             Script Canvas Output                   │   │  │
│  │  │             (p5.js or 2D context)                  │   │  │
│  │  │                                                    │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  ▶ Play  ■ Stop  ⏸ Pause  | Frame: 1234         │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Script Definition Standard

Each p5.js script defines a standardised config object:

```javascript
// scripts/lissajous.gen.js
export const SCRIPT_CONFIG = {
    // Metadata
    id: 'lissajous',
    title: 'Lissajous Curves',
    category: 'parametric',
    description: 'Parametric harmonic curves with independent X/Y parameters',
    version: '3.7.0',
    
    // Canvas configuration
    canvas: {
        width: 800,
        height: 800,
        context: '2d',  // '2d' | 'webgl' | 'p5'
        background: '#000000'
    },
    
    // Parameter definitions (drives GUI generation)
    parameters: [
        // Grouped parameters
        {
            group: 'X-Axis Term 1',
            params: [
                { key: 'Ax1', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 1 },
                { key: 'wx1', type: 'slider', label: 'Frequency', min: -300, max: 300, step: 1, default: 1 },
                { key: 'px1', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1 },
                { key: 'phi_x1', type: 'slider', label: 'Phase', min: -3.14, max: 3.14, step: 0.01, default: 0 }
            ]
        },
        // ...more groups
    ],
    
    // Presets (named parameter sets)
    presets: [
        { name: 'Complex Interference: 300hz', Ax1: 1.7, wx1: 2, ... },
        { name: 'Rosette: 1:3', Ax1: 1, wx1: 1, ... }
    ],
    
    // Animation configuration
    animation: {
        type: 'parametric',  // 'parametric' | 'infinite' | 'sequence'
        loopFrames: 0,       // 0 = no loop, N = N-frame loop
        animatableParams: ['phi_x1', 'phi_x2', 'phi_y1', 'phi_y2'],
        defaultFps: 60
    },
    
    // Export capabilities
    export: {
        png: true,
        svg: true,
        gif: true,
        webm: true,
        sequence: true
    },
    
    // Draw function (pure: params → canvas)
    draw: function(ctx, canvas, params, frame) {
        // Pure drawing logic
        // ctx = 2D context | WebGL context | p5 instance
        // params = current parameter values
        // frame = current frame number (for animation)
    },
    
    // Optional: custom setup
    setup: function(ctx, canvas, params) {
        // One-time initialisation
    },
    
    // Optional: pre-render hook for animation export
    renderFrame: function(ctx, canvas, params, frameIndex, totalFrames) {
        // Render specific frame for export
    }
};
```

### Host Component Design

```javascript
// GenerativeToolHost.js
export class GenerativeToolHost {
    constructor(container, scriptConfig, deps) {
        this.config = scriptConfig;
        this.deps = deps;
        
        // State
        this.params = this.getDefaultParams();
        this.animator = null;
        this.frame = 0;
        this.isPlaying = false;
        
        // Build ToolBase config from script config
        const toolConfig = this.buildToolConfig();
        this.tool = new ToolBase(toolConfig, deps);
        this.tool.mount(container);
    }
    
    buildToolConfig() {
        return {
            title: this.config.title,
            sidebar: this.buildSidebar(),
            canvas: this.config.canvas,
            animation: this.config.animation,
            onInit: (values) => this.handleInit(values),
            onUpdate: (key, value, all) => this.handleUpdate(key, value, all),
            onDraw: (ctx, canvas, values) => this.handleDraw(ctx, canvas, values)
        };
    }
    
    buildSidebar() {
        // Generate sidebar from config.parameters
        // Max 4 tabs: PARAMS, ANIMATE, EXPORT, INFO
    }
}
```

---

## Recommended Tab Structure (4 tabs max)

### Tab 1: PARAMS
- Parameter controls (auto-generated from config)
- Grouped into collapsible blocks
- Preset dropdown
- Randomise button
- Reset button

### Tab 2: ANIMATE
- Play/Pause/Stop controls
- Speed control
- Phase animation toggles (per-parameter)
- Loop toggle
- Sequencer (checkpoint save/load/reorder)

### Tab 3: EXPORT
- Format selection (PNG, SVG, GIF, WebM, ZIP)
- Resolution selector
- Frame count (for animation)
- FPS control
- Export button
- Progress indicator

### Tab 4: INFO (optional)
- Algorithm description
- Parameter documentation
- Reference links
- Version info

---

## Navigation Improvements

### Option A: Gallery Index Page
Replace flat list with visual gallery:
- Thumbnail grid of all generators
- Category filtering (parametric, wave, particle, etc.)
- Search/filter by name
- Favourites

### Option B: Grouped Dropdown
Hierarchical navigation dropdown:
```
GENERATORS
├─ PARAMETRIC
│  ├─ Lissajous
│  ├─ Harmonics
│  └─ Torus
├─ WAVE
│  ├─ Wave Interference
│  ├─ Cymatics
│  └─ Moire
├─ PATTERN
│  ├─ Generative Pattern
│  └─ Tile Mosaic
└─ OTHER
   ├─ Solar System Clock
   └─ ...
```

### Option C: Combined
- Gallery index page (default)
- In-tool dropdown to switch scripts without navigation
- URL updates as script changes: `#tools/generators?script=lissajous`

---

## Export System Standardisation

### Static Export
1. PNG (always available)
2. SVG (if script supports vector output)

### Animation Export
1. **Frame Sequence ZIP** - Universal, highest quality
2. **WebM** - Fast encoding, web playback
3. **GIF** - Compatibility, larger files

### Export Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Render    │ →  │   Encode    │ →  │  Download   │
│   Frames    │    │   Format    │    │   Blob      │
└─────────────┘    └─────────────┘    └─────────────┘
      ↑                  ↑                   ↑
AnimationFoundation  ExportUtils        downloadBlob
.FrameSequencer      (algorithms lib)   (shared utils)
```

---

## Performance Considerations

### Rendering Optimisation
1. **WebGL preferred** for pixel-based patterns (Wave Interference already does this)
2. **Offscreen canvas** for export rendering
3. **Worker threads** for GIF encoding (via CCapture)

### Memory Management
1. Frame buffers cleared between exports
2. Animator.destroy() called on navigation
3. Checkpoint limit (50 max)

### Canvas Sizing
- Default: 800×800 (good balance)
- Auto-resize to container (ToolBase handles this)
- Export resolution independent of display

---

## Implementation Priority

### Phase 1: Script Config Standard
1. Define `SCRIPT_CONFIG` interface
2. Create `GenerativeToolHost` component
3. Migrate one tool (Lissajous) as reference

### Phase 2: Sidebar Standardisation
1. Auto-generate from parameters config
2. Implement preset system
3. Add randomise functionality

### Phase 3: Animation System
1. Unified animation controls
2. Phase animation per-parameter
3. Sequencer integration

### Phase 4: Export System
1. PNG/SVG always available
2. Animation export (GIF/WebM/ZIP)
3. Progress indication

### Phase 5: Navigation
1. Gallery index page
2. In-tool script switcher
3. Categories and filtering

### Phase 6: Tool Migration
1. Migrate all 16 generators to new system
2. Deprecate standalone implementations
3. Single entry point: `#tools/generators`

---

## Script File Organisation

```
assets/js/tools/generators/
├── core/
│   ├── generative-tool-host.js    # Host component
│   └── script-config-types.js     # TypeScript-style interfaces
├── scripts/
│   ├── lissajous.gen.js           # Pure script configs
│   ├── wave-interference.gen.js
│   ├── cymatics.gen.js
│   └── ...
└── index.js                        # Script registry
```

### Script Registry

```javascript
// generators/index.js
export const SCRIPT_REGISTRY = {
    'lissajous': () => import('./scripts/lissajous.gen.js'),
    'wave-interference': () => import('./scripts/wave-interference.gen.js'),
    // ... lazy-loaded scripts
};

export const SCRIPT_CATEGORIES = {
    'parametric': ['lissajous', 'harmonics', 'torus'],
    'wave': ['wave-interference', 'cymatics', 'moire-generator'],
    'pattern': ['generative-pattern', 'tile-mosaic'],
    // ...
};
```

---

## UX/UI Standards Checklist

### Must Have
- [ ] Consistent sidebar layout (4 tabs max)
- [ ] Play/Pause/Stop in fixed position (canvas area footer)
- [ ] Frame counter visible during animation
- [ ] Export progress indicator
- [ ] Preset dropdown in consistent location
- [ ] Reset button easily accessible

### Should Have
- [ ] Keyboard shortcuts (Space = play/pause, R = reset)
- [ ] Parameter tooltips with value display
- [ ] History/undo for parameter changes
- [ ] Copy current parameters as JSON
- [ ] Share URL with parameters encoded

### Nice to Have
- [ ] Dark/light theme awareness
- [ ] Touch-friendly controls for mobile
- [ ] Canvas gesture controls (pinch zoom)
- [ ] Audio sync for musical generators

---

---

## File Directory Organisation

### Current Structure (Problematic)

```
assets/js/tools/
├── core/
│   ├── tool-base.js           # ToolBase class
│   └── tool-test-ui.js        # Testing UI
├── generators/                 # 16 standalone files
│   ├── circles-tool.js        # Each ~200-900 lines
│   ├── cymatics-tool.js       # Each implements own state, draw, etc.
│   ├── lissajous-tool.js      # HIGH duplication
│   └── ... (13 more)
├── processors/
├── fabrication/
└── utilities/
```

**Problems:**
- Each generator is 200-900+ lines
- Duplicated boilerplate (ToolBase config, AnimationLoop setup, export wiring)
- No shared abstractions for common patterns
- Difficult to add features to all tools

### Proposed Structure (Modular)

```
assets/js/tools/
├── core/
│   ├── tool-base.js                    # Existing ToolBase
│   └── tool-test-ui.js
│
├── generators/
│   ├── core/
│   │   ├── generative-tool-host.js     # NEW: Host component
│   │   ├── script-registry.js          # NEW: Script loader/registry
│   │   ├── script-config.types.js      # NEW: TypeScript-style interfaces
│   │   └── parameter-builder.js        # NEW: Auto-generate sidebar from params
│   │
│   ├── scripts/                         # Pure script configs (~50-150 lines each)
│   │   ├── parametric/
│   │   │   ├── lissajous.gen.js
│   │   │   ├── harmonics.gen.js
│   │   │   └── torus.gen.js
│   │   ├── wave/
│   │   │   ├── wave-interference.gen.js
│   │   │   ├── cymatics.gen.js
│   │   │   └── moire.gen.js
│   │   ├── pattern/
│   │   │   ├── generative-pattern.gen.js
│   │   │   └── tile-mosaic.gen.js
│   │   └── other/
│   │       ├── solar-system.gen.js
│   │       └── defecated.gen.js
│   │
│   ├── shared/                          # Shared script utilities
│   │   ├── evaluation.js               # safePow, lerp, wrap, etc.
│   │   ├── presets.js                  # Preset management
│   │   └── webgl-renderer.js           # Shared WebGL setup
│   │
│   └── index.js                         # Entry point, script registry
│
├── processors/
├── fabrication/
└── utilities/
```

### File Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Script config | `{name}.gen.js` | `lissajous.gen.js` |
| Host component | `{name}-host.js` | `generative-tool-host.js` |
| Shared utility | `{function}.js` | `evaluation.js` |
| Registry | `{scope}-registry.js` | `script-registry.js` |

---

## Tool Conversion Process

### Phase 1: Extract Script Config

**Before (lissajous-tool.js ~970 lines):**
```javascript
// Mixed concerns: state, config, drawing, UI wiring
var params = { Ax1: 1, wx1: 1, ... };
var LANDMARKS = [...];
export const TOOL_CONFIG = {
    title: 'LISSAJOUS',
    sidebar: [...huge array...],
    onInit: function(values) { ...wiring... },
    onUpdate: function(key, value) { ...handlers... },
    onDraw: function(ctx, canvas, values) { ...drawing... }
};
function LissajousTool(container, deps) { ... }
```

**After (lissajous.gen.js ~200 lines):**
```javascript
// Pure declarative config + draw function
export const SCRIPT_CONFIG = {
    id: 'lissajous',
    title: 'Lissajous Curves',
    category: 'parametric',
    version: '4.0.0',
    
    canvas: { width: 800, height: 800, context: '2d' },
    
    // Parameters drive auto-generated sidebar
    parameters: [
        {
            group: 'X-Axis Term 1',
            params: [
                { key: 'Ax1', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 1 },
                { key: 'wx1', type: 'slider', label: 'Frequency', min: -300, max: 300, step: 1, default: 1 },
                // ...
            ]
        }
    ],
    
    presets: LANDMARKS,  // Import from shared
    
    animation: {
        animatableParams: ['phi_x1', 'phi_x2', 'phi_y1', 'phi_y2'],
        defaultSpeed: 1,
        defaultLoopFrames: 60
    },
    
    // Pure draw function
    draw: (ctx, canvas, params, frame) => {
        // Import shared evaluation functions
        const { evaluate, formatEquation } = LissajousEval;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        for (let i = 0; i <= params.points; i++) {
            const t = (i / params.points) * TWO_PI;
            const pt = evaluate(t, params);
            // ...
        }
        ctx.stroke();
    }
};
```

### Phase 2: Conversion Checklist

For each tool:

1. **Extract metadata**
   - [ ] id, title, category, version
   - [ ] description (from comments)

2. **Extract parameters**
   - [ ] Group sliders/toggles by logical section
   - [ ] Define min/max/step/default for each
   - [ ] Identify animatable parameters

3. **Extract presets**
   - [ ] Copy LANDMARKS/PRESETS array
   - [ ] Ensure all param keys are included

4. **Extract draw logic**
   - [ ] Isolate pure drawing code
   - [ ] Remove all UI wiring
   - [ ] Import shared utilities (safePow, lerp)

5. **Verify exports**
   - [ ] PNG always
   - [ ] SVG if vector output possible
   - [ ] Animation if params are animatable

6. **Test in host**
   - [ ] Load script in GenerativeToolHost
   - [ ] Verify all controls work
   - [ ] Verify presets apply correctly
   - [ ] Verify animation works
   - [ ] Verify export works

### Conversion Priority Order

| Priority | Tool | Reason |
|----------|------|--------|
| 1 | lissajous | Most complex, best reference |
| 2 | wave-interference | WebGL + checkpoints |
| 3 | cymatics | Particle system |
| 4 | circles | Simple, quick win |
| 5-16 | Others | Alphabetical |

---

## Library Usage Patterns

### Algorithms Library (Pure Functional)

Location: `assets/js/shared/algorithms/`

**Usage in scripts:**
```javascript
// Import from algorithms index
import { 
    WaveSolver, 
    safePow, 
    lerp 
} from '../../../shared/algorithms/index.js';

// Use in draw function
const draw = (ctx, canvas, params) => {
    const wave = WaveSolver.travellingWaveRadial(dist, time, {
        freq: params.frequency,
        amp: params.amplitude
    });
};
```

**DO:**
- Import specific functions
- Use for pure mathematical operations
- Cite sources in JSDoc

**DON'T:**
- Import entire library
- Use for DOM manipulation
- Modify algorithm functions in tool files

### ComponentLibrary (OOP Components)

Location: `assets/js/shared/component-library.js`

**Usage pattern:**
```javascript
// Import via deps (dependency injection)
const { NumericInput, Dropdown, Button } = deps.ComponentLibrary;

// Instantiate with options
const slider = new NumericInput({
    label: 'Amplitude',
    min: -2,
    max: 2,
    step: 0.1,
    value: 1,
    onChange: (value) => this.handleChange('amp', value)
}, deps);

// Render and track
const element = slider.render();
container.appendChild(element);
this.componentInstances.push(slider);
```

### AnimationFoundation

Location: `assets/js/core/animation-foundation.js`

**Usage pattern:**
```javascript
import { AnimationLoop } from '../../core/animation-foundation.js';

// In host component
this.animator = new AnimationLoop({
    fps: 60,
    onFrame: () => {
        this.frame++;
        this.updateAnimation();
        this.draw();
    }
});

// Start/stop
this.animator.start();
this.animator.pause();
this.animator.stop();

// ALWAYS destroy on cleanup
destroy() {
    if (this.animator) {
        this.animator.destroy();
        this.animator = null;
    }
}
```

---

## ToolBase Sidebar Construction Analysis

### Current Architecture

ToolBase builds sidebar from a nested array DSL:

```javascript
sidebar: [
    // Tab level (max 4)
    ['TAB_NAME', [
        // Block level (collapsible sections)
        ['Block Title', [
            // Component level
            ['type', 'Label', ...args, { key, options }],
        ]],
    ]],
]
```

### Component Definition Format

```javascript
// Slider
['slider', 'Label', min, max, step, { key: 'paramKey', value: default, withNumber: true }]

// Dropdown
['dropdown', 'Label', ['Option1', 'Option2'], { key: 'selectKey' }]

// Toggle/Checkbox
['toggle', 'Label', ['On'], { key: 'toggleKey', selectedValues: [] }]

// Button
['button', 'Button Text', null, { key: 'buttonKey' }]

// Radio
['radio', 'Label', ['A', 'B', 'C'], { key: 'radioKey', selectedValue: 'A' }]

// Label/Text
['label', 'Static text', { variant: 'caption' }]
```

### Styling System

All styling uses:
1. **CSS Variables** - `var(--c-text)`, `var(--c-bg)`, `var(--c-border)`
2. **F-System** - `this.F`, `this.F2` for spacing
3. **Inline styles** - Only in ToolBase internals, not in tool files

**ToolBase sidebar widths:**
- Default: `30F` (420px at F=14)
- Tab bar height: `2F` (28px)
- Block padding: `F` (14px)
- Component gap: `F2` (7px)

### Problematic Patterns to Avoid

```javascript
// ❌ BAD: Direct DOM in tool file
const div = document.createElement('div');
div.style.padding = '8px';

// ✅ GOOD: Use ComponentLibrary
const text = new Text({ content: 'Label' }, deps);
container.appendChild(text.render());

// ❌ BAD: Hardcoded pixels
element.style.width = '200px';

// ✅ GOOD: F-based calculations
element.style.width = `calc(var(--f) * 14)`;

// ❌ BAD: Raw colours
ctx.fillStyle = '#ff5500';

// ✅ GOOD: VGA palette only
ctx.fillStyle = '#c0c0c0';  // VGA silver
```

---

## OOP & Modular Code Patterns

### Class Hierarchy

```
BaseComponent (foundation.js)
    ↳ ToolBase (tool-base.js)
        ↳ GenerativeToolHost (generative-tool-host.js)  // NEW
    ↳ ComponentLibrary components
        ↳ NumericInput, Dropdown, Button, etc.
```

### GenerativeToolHost Design (OOP)

```javascript
/**
 * GenerativeToolHost - Host component for generative scripts
 * 
 * Responsibilities:
 * - Load and validate script configs
 * - Generate ToolBase config from script parameters
 * - Manage animation lifecycle
 * - Handle preset/export/randomise
 * 
 * Single Responsibility: Hosting scripts, NOT drawing
 */
export class GenerativeToolHost extends BaseComponent {
    constructor(container, scriptConfig, deps = {}) {
        super({ componentType: 'generative-host' }, deps);
        
        // Validate script config
        this.validateConfig(scriptConfig);
        
        // Store config
        this.scriptConfig = scriptConfig;
        this.container = container;
        
        // State
        this.params = this.getDefaultParams();
        this.frame = 0;
        this.isPlaying = false;
        
        // Components (tracked for cleanup)
        this.tool = null;
        this.animator = null;
        
        // Initialise
        this.init();
    }
    
    /**
     * Validate script config matches expected interface
     */
    validateConfig(config) {
        const required = ['id', 'title', 'parameters', 'draw'];
        for (const key of required) {
            if (!config[key]) {
                throw new Error(`Script config missing required field: ${key}`);
            }
        }
    }
    
    /**
     * Get default parameter values from config
     */
    getDefaultParams() {
        const params = {};
        for (const group of this.scriptConfig.parameters) {
            for (const param of group.params) {
                params[param.key] = param.default ?? 0;
            }
        }
        return params;
    }
    
    /**
     * Build ToolBase sidebar config from script parameters
     */
    buildSidebarConfig() {
        const tabs = [];
        
        // PARAMS tab - auto-generated from parameters
        const paramsTab = ['PARAMS', this.buildParamsBlocks()];
        tabs.push(paramsTab);
        
        // ANIMATE tab - standard controls
        tabs.push(this.buildAnimateTab());
        
        // EXPORT tab - standard controls
        tabs.push(this.buildExportTab());
        
        // INFO tab (optional)
        if (this.scriptConfig.description) {
            tabs.push(this.buildInfoTab());
        }
        
        return tabs;
    }
    
    /**
     * Build parameter blocks from script config
     */
    buildParamsBlocks() {
        const blocks = [];
        
        // Presets block (always first)
        if (this.scriptConfig.presets?.length > 0) {
            blocks.push(['Presets', [
                ['dropdown', 'Preset', this.getPresetNames(), { key: 'preset' }],
                ['button', 'Randomise', null, { key: 'randomise' }],
                ['button', 'Reset', null, { key: 'reset' }],
            ]]);
        }
        
        // Parameter groups
        for (const group of this.scriptConfig.parameters) {
            const components = group.params.map(p => this.paramToComponent(p));
            blocks.push([group.group, components]);
        }
        
        return blocks;
    }
    
    /**
     * Convert parameter definition to component definition
     */
    paramToComponent(param) {
        switch (param.type) {
            case 'slider':
                return ['slider', param.label, param.min, param.max, param.step, {
                    key: param.key,
                    value: param.default,
                    withNumber: true,
                    precision: param.precision
                }];
            case 'toggle':
                return ['toggle', param.label, param.options, {
                    key: param.key,
                    selectedValues: param.default ? [param.default] : []
                }];
            case 'dropdown':
                return ['dropdown', param.label, param.options, {
                    key: param.key,
                    value: param.default
                }];
            default:
                throw new Error(`Unknown parameter type: ${param.type}`);
        }
    }
    
    /**
     * Handle parameter updates
     */
    handleUpdate(key, value) {
        // Special keys
        if (key === 'preset') {
            this.applyPreset(value);
            return;
        }
        if (key === 'randomise') {
            this.randomiseParams();
            return;
        }
        if (key === 'reset') {
            this.resetParams();
            return;
        }
        if (key === 'playPause') {
            this.togglePlay();
            return;
        }
        
        // Regular parameter update
        this.params[key] = value;
        this.draw();
    }
    
    /**
     * Draw current frame
     */
    draw() {
        const ctx = this.tool.ctx;
        const canvas = this.tool.canvas;
        
        // Clear or apply background
        if (this.scriptConfig.canvas?.background) {
            ctx.fillStyle = this.scriptConfig.canvas.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Call script's draw function
        this.scriptConfig.draw(ctx, canvas, this.params, this.frame);
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        super.destroy();
    }
}
```

### Separation of Concerns

| Concern | Owner | Location |
|---------|-------|----------|
| Script config | Script file | `scripts/{category}/{name}.gen.js` |
| UI generation | GenerativeToolHost | `core/generative-tool-host.js` |
| Sidebar layout | ToolBase | `core/tool-base.js` |
| Component rendering | ComponentLibrary | `shared/component-library.js` |
| Animation loop | AnimationFoundation | `core/animation-foundation.js` |
| Drawing | Script draw() | Script file |
| Export | ExportUtils | `shared/algorithms/export/` |

### Dependency Injection Pattern

```javascript
// All dependencies passed via deps object
const host = new GenerativeToolHost(container, scriptConfig, {
    ComponentLibrary: ComponentLibrary,
    AnimationLoop: AnimationLoop,
    ExportUtils: ExportUtils,
    MF: MathematicalFoundation
});
```

---

## Code Quality Standards

### JSDoc for Script Configs

```javascript
/**
 * Lissajous Curves - Parametric harmonic curves
 * 
 * @script lissajous
 * @category parametric
 * @version 4.0.0
 * 
 * @formula x(t) = A₁cos^p₁(ω₁t + φ₁) + A₂cos^p₂(ω₂t + φ₂)
 * @formula y(t) = A₁sin^p₁(ω₁t + φ₁) + A₂sin^p₂(ω₂t + φ₂)
 * 
 * @see https://en.wikipedia.org/wiki/Lissajous_curve
 */
export const SCRIPT_CONFIG = { ... };
```

### Error Handling

```javascript
// Validate early, fail fast
validateConfig(config) {
    if (!config.id) throw new Error('Script missing id');
    if (!config.draw || typeof config.draw !== 'function') {
        throw new Error('Script missing draw function');
    }
}

// Guard in draw
draw() {
    if (!this.tool?.ctx) return;
    try {
        this.scriptConfig.draw(this.tool.ctx, this.tool.canvas, this.params, this.frame);
    } catch (err) {
        console.error(`Draw error in ${this.scriptConfig.id}:`, err);
    }
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Class | PascalCase | `GenerativeToolHost` |
| Method | camelCase | `handleUpdate()` |
| Private method | _prefixed | `_buildSidebar()` |
| Constant | UPPER_SNAKE | `DEFAULT_FPS` |
| Parameter key | camelCase | `phaseX1` |
| Script ID | kebab-case | `wave-interference` |

---

## Summary

The current system has solid foundations (ToolBase, AnimationFoundation, ComponentLibrary) but lacks standardisation across generator tools. The proposed unified system:

1. **Defines a standard script config format** - Pure declarative, no boilerplate
2. **Creates a host component** - Generates UI from config
3. **Standardises features** - All tools get presets, animation, export
4. **Improves navigation** - Gallery view, script switching
5. **Ensures consistency** - Same UX across all generators

### Key Architectural Changes

| Current | Proposed |
|---------|----------|
| 16 standalone files (~970 lines each) | 16 script configs (~150 lines each) |
| Duplicated ToolBase wiring | Single GenerativeToolHost |
| Inconsistent features | Standardised UI for all |
| Flat navigation list | Gallery + categories |
| Manual export setup | Auto-configured exports |

### Estimated LOC Reduction

| File Type | Current Total | Proposed Total | Reduction |
|-----------|---------------|----------------|-----------|
| Tool files | ~12,000 | ~2,400 | -80% |
| Host + registry | 0 | ~800 | New |
| **Net** | ~12,000 | ~3,200 | **-73%** |

This approach allows:
- Easy creation of new generators (just define config + draw function)
- Consistent user experience
- Reduced code duplication
- Single point of maintenance for UI/export features

