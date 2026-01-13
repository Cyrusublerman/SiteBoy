# Tool Build Guide — Vite ES Module Edition

**VERSION:** 3.0.0  
**UPDATED:** 2025-12-20 — Complete rewrite for Vite/ES Modules  
**RELATED:**
- `blog/docs/guides/tool-standards.md` — Minimum functionality requirements
- `blog/docs/guides/shared-utilities.md` — Reusable code registry
- `blog/docs/components/COMPONENT-REFERENCE.md` — Component API
- `assets/js/core/animation-foundation.js` — Animation system (REQUIRED for animated tools)

---

## Critical Changes from v2.x

**🔴 BREAKING CHANGES:**
- ❌ No IIFE wrappers
- ❌ No `window` globals
- ❌ No script tags
- ❌ Module-level TOOL_CONFIG is BROKEN
- ✅ ES Module imports/exports required
- ✅ Constructor-based config with arrow functions
- ✅ Explicit dependency injection

**If you have old tools using IIFE pattern, they MUST be migrated. See migration section at end.**

---

## Scope

This guide specifies how to create tool pages using `ToolBase` in a **Vite-based ES Module environment**.  
**Follow EXACTLY. No interpretation. No deviation.**

---

## Section Selection — Tools vs Art/Generative

**CRITICAL: Choose the correct section BEFORE building.**

| Section | URL Pattern | Content Type |
|---------|-------------|--------------|
| **Tools** | `#tools/name` | Utility tools, converters, calculators, analysis |
| **Art/Generative** | `#art/generative/name` | Generative art, visual patterns, animations |

### Decision Criteria

**Use `#tools/` when:**
- Tool transforms input → output (image converter, calculator)
- Tool is utility-focused (font analyzer, polygon calculator)
- Primary purpose is functional, not aesthetic

**Use `#art/generative/` when:**
- Primary output is visual/aesthetic
- Creates patterns, animations, or generative art
- Pattern/algorithm exploration tools
- Wave visualizers, noise generators, particle systems

### Examples

| Tool | Section | Reason |
|------|---------|--------|
| Color Quantizer | tools | Converts images (utility) |
| Polygon Calculator | tools | Math utility |
| Font Analyzer | tools | Analysis tool |
| Generative Pattern | art/generative | Creates visual patterns |
| Moiré Generator | art/generative | Visual interference art |
| Wave Interference | art/generative | Wave visualization |
| Lissajous | art/generative | Parametric curve art |

---

## File Structure

```
assets/js/tools/
├── tool-base.js              ← DO NOT MODIFY
├── tool-test-ui.js           ← Reference implementation (READ THIS!)
└── my-new-tool.js            ← Your new tool
```

All tools are ES Modules that import ToolBase and export their class.

---

## Naming Convention

| Item | Format | Example |
|------|--------|---------|
| File name | `kebab-case.js` | `wave-generator.js` |
| Class name | `PascalCase` | `WaveGenerator` |
| URL slug | `kebab-case` | `#tools/wave-generator` |
| Display name | `UPPERCASE` | `WAVE GENERATOR` |

---

## How Loading Works (Vite)

```
1. User navigates to #tools/my-tool
       ↓
2. app.js detects hash change
       ↓
3. tools_section.handleRoute('my-tool')
       ↓
4. tools_section calls renderLazyTool('my-tool')
       ↓
5. AssetLoader dynamic import:
   const module = await import('../tools/my-tool.js')
       ↓
6. Extract class: const ToolClass = module.default
       ↓
7. Instantiate: new ToolClass(container, { MF, ... })
       ↓
8. Tool renders via ToolBase
```

**Key difference from old system**: Tools are loaded **asynchronously** via dynamic imports, not script tags.

---

## Step 1: Create Tool File

Create `assets/js/tools/{tool-name}.js`:

```javascript
/**
 * {ToolName} - Brief description
 * 
 * @version 1.0.0
 * @author Your Name
 */

// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Core framework (REQUIRED)
import { ToolBase } from './tool-base.js';
import ComponentLibrary from '../shared/component-library.js';

// Optional: Animation system (if tool is animated)
import { AnimationFoundation } from '../core/animation-foundation.js';

// Optional: Utilities (as needed)
import { safePow, clamp, lerp } from '../shared/utils/math.js';
import { ColorSpaceConverter } from '../shared/utils/color.js';

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class ToolName {
    /**
     * @param {HTMLElement} container - Container to mount tool into
     * @param {Object} deps - Dependencies injected by tools_section
     * @param {Object} deps.MF - MathematicalFoundation utilities
     */
    constructor(container, deps = {}) {
        // Merge ComponentLibrary into dependencies
        this.deps = { ComponentLibrary, ...deps };
        
        // Initialize tool-specific state BEFORE creating config
        this.myState = null;
        this.animator = null;
        
        // Create ToolBase config with bound callbacks
        const config = this._createConfig();
        
        // Initialize ToolBase
        this.tool = new ToolBase(config, this.deps);
        this.tool.mount(container);
        
        console.log('✅ ToolName initialized');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Creates ToolBase configuration
     * MUST be instance method to allow arrow function binding
     */
    _createConfig() {
        return {
            title: 'TOOL NAME',  // UPPERCASE, shown in subheader
            
            // Optional: Animation export config
            animation: {
                type: 'loop',           // 'loop' | 'sequence' | 'infinite'
                loopFrames: 360,        // Total frames in one loop
                defaultFps: 60,         // Target framerate
                canPrerender: true      // Enable frame-by-frame export
            },
            
            // Sidebar structure: TAB → BLOCK → COMPONENT
            sidebar: [
                ['CONTROLS', [
                    ['Parameters', [
                        ['slider', 'Value', 0, 100, 1, { 
                            key: 'value', 
                            value: 50,
                            withNumber: true 
                        }],
                        ['color', 'Color', '#FF5500', { 
                            key: 'color' 
                        }],
                        ['dropdown', 'Mode', [
                            { value: 'A', label: 'Mode A' },
                            { value: 'B', label: 'Mode B' }
                        ], { 
                            key: 'mode', 
                            value: 'A' 
                        }]
                    ]],
                    ['Settings', [
                        ['toggle', 'Options', ['Grid', 'Debug'], { 
                            key: 'options',
                            selectedValues: [] 
                        }],
                        ['button', 'Reset', null, { 
                            key: 'reset' 
                        }]
                    ]]
                ]],
                
                ['EXPORT', [
                    ['Download', [
                        ['button', 'Export PNG', null, { 
                            key: 'exportPng',
                            variant: 'primary' 
                        }]
                    ]]
                ]]
            ],
            
            // Canvas configuration (F-multiple: 420 = 30F, 280 = 20F, etc.)
            canvas: {
                width: 420,
                height: 420,
                showControls: true  // Auto-injects CANVAS tab
            },
            
            // ═══════════════════════════════════════════════════════════════════
            // LIFECYCLE CALLBACKS
            // ═══════════════════════════════════════════════════════════════════
            
            // ✅ CRITICAL: Use arrow functions to preserve 'this' context
            // 'this' inside these callbacks will be the ToolName instance
            
            onInit: (values) => this._onInit(values),
            
            onUpdate: (key, value, allValues) => this._onUpdate(key, value, allValues),
            
            onDraw: (ctx, canvas, values) => this._onDraw(ctx, canvas, values)
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LIFECYCLE METHODS (Instance methods called by callbacks)
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Called once after UI is built
     * Initialize state, wire buttons, start animations
     */
    _onInit(values) {
        console.log('🎯 Tool initialized with values:', values);
        
        // Initialize state based on values
        this.myState = this._calculateInitialState(values);
        
        // Wire button handlers
        this._wireButtons();
        
        // Start animation if applicable
        if (this.deps.MF?.AnimationLoop) {
            this._startAnimation();
        }
    }
    
    /**
     * Called when any component value changes
     * @param {string} key - Component key that changed
     * @param {*} value - New value
     * @param {Object} allValues - All current values
     */
    _onUpdate(key, value, allValues) {
        console.log(`📝 ${key} changed to:`, value);
        
        // Handle specific parameter changes
        switch (key) {
            case 'value':
                this._updateValue(value);
                break;
            
            case 'mode':
                this._switchMode(value);
                break;
            
            case 'color':
                this._updateColor(value);
                break;
        }
        
        // Tool automatically redraws after onUpdate
    }
    
    /**
     * Called to render canvas
     * Auto-called after onInit and after every onUpdate
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} values - Current component values
     */
    _onDraw(ctx, canvas, values) {
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw based on current state
        if (this.myState) {
            this._drawMyVisualization(ctx, canvas, values);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS (Tool-specific logic)
    // ═══════════════════════════════════════════════════════════════════════════
    
    _calculateInitialState(values) {
        return {
            value: values.value || 50,
            color: values.color || '#FF5500',
            mode: values.mode || 'A'
        };
    }
    
    _updateValue(value) {
        this.myState.value = value;
    }
    
    _switchMode(mode) {
        this.myState.mode = mode;
        console.log('🔄 Switched to mode:', mode);
    }
    
    _updateColor(color) {
        this.myState.color = color;
    }
    
    _drawMyVisualization(ctx, canvas, values) {
        // Your drawing logic here
        ctx.fillStyle = this.myState.color;
        const size = this.myState.value;
        ctx.fillRect(
            (canvas.width - size) / 2,
            (canvas.height - size) / 2,
            size,
            size
        );
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // BUTTON WIRING
    // ═══════════════════════════════════════════════════════════════════════════
    
    _wireButtons() {
        // Wire reset button
        const resetBtn = this.tool.getComponent('reset');
        if (resetBtn?.element) {
            resetBtn.element.addEventListener('click', () => {
                this._reset();
            });
        }
        
        // Wire export button
        const exportBtn = this.tool.getComponent('exportPng');
        if (exportBtn?.element) {
            exportBtn.element.addEventListener('click', () => {
                this._exportPNG();
            });
        }
    }
    
    _reset() {
        this.tool.setValue('value', 50);
        this.tool.setValue('color', '#FF5500');
        this.tool.setValue('mode', 'A');
        this.myState = this._calculateInitialState(this.tool.getValues());
        this.tool.draw();
    }
    
    _exportPNG() {
        const canvas = this.tool.getCanvas();
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'tool-export.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ANIMATION (Optional - if tool is animated)
    // ═══════════════════════════════════════════════════════════════════════════
    
    _startAnimation() {
        this.animator = new AnimationFoundation.AnimationLoop({
            fps: 60,
            onFrame: () => {
                this._updateAnimation();
                this.tool.draw();
            }
        });
        this.animator.start();
    }
    
    _updateAnimation() {
        // Update state for next frame
        if (this.myState) {
            this.myState.value = (this.myState.value % 100) + 1;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Clean up resources when tool is destroyed
     * CRITICAL: Always implement this to prevent memory leaks
     */
    destroy() {
        console.log('🧹 Destroying ToolName...');
        
        // 1. Stop animations
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        
        // 2. Close audio contexts
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // 3. Clean up ToolBase
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        
        // 4. Clear state
        this.myState = null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Export as default (recommended for tools)
export default ToolName;

// Optional: Export with alias for compatibility
export { ToolName as ToolShortName };

// Log successful load
console.log('✅ ToolName loaded (ES Module)');
```

---

## Step 2: Register Tool in AssetLoader

Add to `assets/js/shared/asset-loader.js`:

```javascript
toolRegistry: {
    'my-tool': {
        path: './tools/my-tool.js',
        class: 'default'  // or 'ToolName' for named export
    },
    // ... other tools
}
```

---

## Step 3: Register Tool in tools_section.js

**CRITICAL: Register in ALL 5 places**

### Place 1: pages array
```javascript
pages: [
    '#tools',
    '#tools/my-tool',  // ✅ Add here
    // ... other tools
],
```

### Place 2: toolsSections object
```javascript
toolsSections: {
    'MY TOOL': '#tools/my-tool',  // ✅ Add here
    // ... other tools
},
```

### Place 3: getDropdownItems method
```javascript
getDropdownItems() {
    const allTools = {
        'TOOL TOC': '#tools',
        'MY TOOL': '#tools/my-tool',  // ✅ Add here
        // ... other tools
    };
    // ...
}
```

### Place 4: renderTool switch statement
```javascript
renderTool(toolId) {
    switch (toolId) {
        case 'my-tool':  // ✅ Add case
            this.renderMyTool();
            break;
        // ... other cases
    }
}
```

### Place 5: Add render method
```javascript
renderMyTool() {
    this.renderLazyTool('my-tool');  // Uses AssetLoader
}
```

---

## ToolBase API Reference

### Getting Values
```javascript
const value = this.tool.getValue('key');
const allValues = this.tool.getValues();
```

### Setting Values
```javascript
this.tool.setValue('key', newValue);
this.tool.setValues({ key1: value1, key2: value2 });
```

### Canvas Access
```javascript
const canvas = this.tool.getCanvas();
const ctx = this.tool.getContext();
this.tool.draw();  // Triggers onDraw
```

### Component Access
```javascript
const component = this.tool.getComponent('key');
if (component?.element) {
    component.element.addEventListener('click', handler);
}
```

### Status Display
```javascript
this.tool.setStatus('Processing...');
```

---

## Component Types Reference

All components follow format: `[type, ...args, { options }]`

### Slider (NumericInput)
```javascript
['slider', 'Label', min, max, step, { 
    key: 'sliderKey',
    value: defaultValue,
    withNumber: true,      // Show number input
    precision: 2           // Decimal places
}]
```

### Color Picker
```javascript
['color', 'Label', '#FF5500', { 
    key: 'colorKey',
    showHex: true          // Show hex input
}]
```

### Dropdown
```javascript
['dropdown', 'Label', [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' }
], { 
    key: 'dropdownKey',
    value: 'a'  // Default selection
}]
```

### Toggle Group
```javascript
['toggle', 'Label', ['Option 1', 'Option 2', 'Option 3'], { 
    key: 'toggleKey',
    selectedValues: [],    // Multi-select
    layout: 'list'         // or 'grid'
}]
```

### Button
```javascript
['button', 'Button Text', null, { 
    key: 'buttonKey',
    variant: 'primary'     // or 'danger', 'success'
}]
```

### File Input
```javascript
['file', 'Label', 'image/*', { 
    key: 'fileKey',
    buttonText: 'Choose File'
}]
```

### Text Label
```javascript
['label', 'Text content', { 
    variant: 'body'        // or 'caption', 'value'
}]
```

---

## Animation Export Config

For animated tools, add `animation` config:

```javascript
_createConfig() {
    return {
        title: 'ANIMATED TOOL',
        
        animation: {
            type: 'loop',           // Required: 'loop' | 'sequence' | 'infinite'
            loopFrames: 360,        // For 'loop': total frames in one cycle
            sequenceDuration: 10,   // For 'sequence': duration in seconds
            defaultFps: 60,         // Target framerate
            canPrerender: true      // Enable frame-by-frame export
        },
        
        canvas: {
            showControls: true      // Auto-injects CANVAS tab with export
        },
        
        // ... rest of config
    };
}
```

**What this provides automatically:**
- Format selector (PNG/JPEG/WebM/MP4)
- FPS control with duration calculation
- Real video recording via MediaRecorder
- Frame-by-frame export capability
- Aspect ratio presets

**DO NOT manually create export buttons for animations.**

---

## Common Patterns

### Pattern 1: Using Shared Utilities

```javascript
// Import at top
import { safePow, clamp, lerp } from '../shared/utils/math.js';
import { EquationEngine } from '../shared/algorithms/parametric/equation-engine.js';

// Use in methods
_calculate(base, exp) {
    const result = safePow(base, exp);
    return clamp(result, 0, 1);
}
```

### Pattern 2: Audio Synthesis

```javascript
_initAudio() {
    // Create on user interaction (autoplay policy)
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    gain.gain.value = 0.5;
    
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    
    oscillator.start();
    
    this.oscillator = oscillator;
}

destroy() {
    if (this.oscillator) {
        this.oscillator.stop();
    }
    if (this.audioContext) {
        this.audioContext.close();
    }
}
```

### Pattern 3: Image Processing

```javascript
_processImage(imageData) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // Process RGBA
        data[i]     = /* R */;
        data[i + 1] = /* G */;
        data[i + 2] = /* B */;
        data[i + 3] = /* A */;
    }
    
    return imageData;
}

_onDraw(ctx, canvas, values) {
    if (!this.sourceImage) return;
    
    ctx.drawImage(this.sourceImage, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const processed = this._processImage(imageData);
    ctx.putImageData(processed, 0, 0);
}
```

### Pattern 4: Multi-Mode Tools

```javascript
_createConfig() {
    return {
        sidebar: [
            ['MODES', [
                ['Mode Selection', [
                    ['dropdown', 'Active Mode', [
                        { value: 'MODE_A', label: 'Mode A' },
                        { value: 'MODE_B', label: 'Mode B' }
                    ], { key: 'activeMode', value: 'MODE_A' }]
                ]]
            ]],
            
            ['MODE_A', [
                // Mode A specific controls
            ]],
            
            ['MODE_B', [
                // Mode B specific controls
            ]]
        ],
        // ...
    };
}

_onUpdate(key, value, allValues) {
    if (key === 'activeMode') {
        this._switchMode(value);
        return;
    }
    
    // Handle mode-specific updates
    switch (this.currentMode) {
        case 'MODE_A':
            this._updateModeA(key, value);
            break;
        case 'MODE_B':
            this._updateModeB(key, value);
            break;
    }
}
```

---

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `ComponentLibrary not available` | Not passed in deps | Add `this.deps = { ComponentLibrary, ...deps }` |
| `ToolBase is not a constructor` | Import failed | Check `import { ToolBase } from './tool-base.js'` |
| `this._myMethod is not a function` | Callback context wrong | Use arrow functions in config |
| `Component type 'xxx' not found` | Unknown component type | Check component type table |
| `Module not found` | Wrong import path | Verify path and `.js` extension |
| `Cannot read property 'element'` | Component not found | Check key matches config exactly |
| Animation not stopping | Missing cleanup | Call `animator.destroy()` in destroy() |
| Audio keeps playing | Missing cleanup | Call `audioContext.close()` in destroy() |

---

## Testing Checklist

Before declaring tool complete:

### Functionality
- [ ] Tool loads without errors
- [ ] All components render correctly
- [ ] All sliders produce visible changes
- [ ] All dropdowns switch modes/options
- [ ] All buttons execute actions
- [ ] Canvas updates on parameter changes
- [ ] Export functionality works
- [ ] Reset button restores defaults

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] Proper cleanup in destroy()
- [ ] Animation stops when tool destroyed
- [ ] Audio stops when tool destroyed
- [ ] No memory leaks on repeated load/destroy

### Performance
- [ ] FPS stable (>30fps) during interaction
- [ ] No lag when moving sliders
- [ ] Export completes in reasonable time
- [ ] Canvas renders in <100ms

---

## Migration from v2.x (IIFE Pattern)

If you have tools using the old pattern:

### Quick Conversion Checklist

- [ ] Remove IIFE wrapper `(function() { })();`
- [ ] Add ES module imports at top
- [ ] Change `function ToolName()` to `export class ToolName`
- [ ] Move TOOL_CONFIG into `_createConfig()` method
- [ ] Change callbacks to arrow functions
- [ ] Convert `.prototype` methods to class methods
- [ ] Add `ComponentLibrary` to deps
- [ ] Remove `window.ToolName = ToolName`
- [ ] Add `export default ToolName`
- [ ] Update registration in tools_section.js

### Example Migration

**Before (v2.x - BROKEN)**:
```javascript
(function() {
    var TOOL_CONFIG = {
        onInit: function(values) {
            this.state = values;  // Wrong 'this'
        }
    };
    
    function MyTool(container) {
        this.tool = new window.ToolBase(TOOL_CONFIG);
    }
    
    window.MyTool = MyTool;
})();
```

**After (v3.0 - CORRECT)**:
```javascript
import { ToolBase } from './tool-base.js';
import ComponentLibrary from '../shared/component-library.js';

export class MyTool {
    constructor(container, deps = {}) {
        this.deps = { ComponentLibrary, ...deps };
        this.state = null;
        
        const config = {
            onInit: (values) => this._onInit(values)
        };
        
        this.tool = new ToolBase(config, this.deps);
    }
    
    _onInit(values) {
        this.state = values;  // Correct 'this'
    }
}

export default MyTool;
```

---

## Full Reference Implementation

See: `assets/js/tools/tool-test-ui.js`

This reference implementation demonstrates:
- Multi-mode tool (5 different modes)
- All component types
- Button wiring patterns
- File upload handling
- Canvas sizing
- AnimationFoundation integration
- Audio synthesis with Web Audio API
- Export functionality
- Proper cleanup patterns

**Read this file before creating complex tools.**

---

End of Tool Build Guide v3.0.0 - Vite Edition
