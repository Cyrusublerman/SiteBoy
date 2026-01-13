# Tool Template - Vite ES Module Pattern

**This is the authoritative reference template for all tools in the Vite environment.**  
Compare your tool code against this structure to verify correctness.

---

## Complete Tool Template

```javascript
/**
 * ToolName - Brief description of what this tool does
 * 
 * @version 1.0.0
 * @author Your Name
 */

// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// REQUIRED: Core framework
import { ToolBase } from './tool-base.js';
import ComponentLibrary from '../shared/component-library.js';

// OPTIONAL: Animation system (include if tool has animations)
import { AnimationFoundation } from '../core/animation-foundation.js';

// OPTIONAL: Math utilities (include as needed)
import { safePow, clamp, lerp, map } from '../shared/utils/math.js';

// OPTIONAL: Color utilities (include as needed)
import { ColorSpaceConverter } from '../shared/utils/color.js';
import { deltaE76, deltaE94 } from '../shared/utils/color-distance.js';

// OPTIONAL: Image processing (include as needed)
import { ImageProcessor } from '../shared/utils/image-processor.js';

// OPTIONAL: Parametric equations (include as needed)
import { EquationEngine } from '../shared/algorithms/parametric/equation-engine.js';

// OPTIONAL: Audio synthesis (include as needed)
import { AudioSynthesizer } from '../shared/utils/audio-synthesizer.js';

// ═══════════════════════════════════════════════════════════════════════════════
// CLASS DEFINITION
// ═══════════════════════════════════════════════════════════════════════════════

export class ToolName {
    
    /**
     * Constructor - Called when tool is instantiated
     * 
     * @param {HTMLElement} container - DOM container to mount tool into
     * @param {Object} deps - Dependencies injected by tools_section.js
     * @param {Object} deps.MF - MathematicalFoundation utilities
     */
    constructor(container, deps = {}) {
        // REQUIRED: Merge ComponentLibrary into dependencies
        this.deps = { ComponentLibrary, ...deps };
        
        // REQUIRED: Initialize ALL tool-specific state BEFORE creating config
        // This must come before _createConfig() call
        this.myData = null;
        this.currentMode = null;
        this.imageData = null;
        this.animator = null;
        this.audioContext = null;
        this.isPlaying = false;
        
        // REQUIRED: Create ToolBase configuration
        const config = this._createConfig();
        
        // REQUIRED: Initialize ToolBase and mount to container
        this.tool = new ToolBase(config, this.deps);
        this.tool.mount(container);
        
        // OPTIONAL: Log initialization
        console.log('✅ ToolName initialized');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Creates ToolBase configuration object
     * 
     * CRITICAL: Must be instance method (not module-level variable)
     * CRITICAL: Callbacks must use arrow functions to preserve 'this' context
     * 
     * @returns {Object} ToolBase configuration
     */
    _createConfig() {
        return {
            // REQUIRED: Tool title (displayed in subheader)
            title: 'TOOL NAME',
            
            // OPTIONAL: Animation export configuration
            // Include this if tool produces animations
            animation: {
                type: 'loop',           // 'loop' | 'sequence' | 'infinite'
                loopFrames: 360,        // For 'loop': total frames in cycle
                sequenceDuration: 10,   // For 'sequence': duration in seconds
                defaultFps: 60,         // Target framerate
                canPrerender: true      // Enable frame-by-frame export
            },
            
            // REQUIRED: Sidebar structure
            // Format: Array of tabs, each containing blocks, each containing components
            sidebar: [
                // Tab 1: Main controls
                ['CONTROLS', [
                    // Block 1: Parameters
                    ['Parameters', [
                        // Slider component
                        ['slider', 'Parameter Name', min, max, step, { 
                            key: 'paramKey',        // REQUIRED: Unique identifier
                            value: defaultValue,    // REQUIRED: Initial value
                            withNumber: true,       // OPTIONAL: Show number input
                            precision: 2            // OPTIONAL: Decimal places
                        }],
                        
                        // Color picker component
                        ['color', 'Color Name', '#FF5500', { 
                            key: 'colorKey',        // REQUIRED
                            showHex: true           // OPTIONAL: Show hex input
                        }],
                        
                        // Dropdown component
                        ['dropdown', 'Dropdown Name', [
                            { value: 'mode_a', label: 'Mode A' },
                            { value: 'mode_b', label: 'Mode B' },
                            { value: 'mode_c', label: 'Mode C' }
                        ], { 
                            key: 'modeKey',         // REQUIRED
                            value: 'mode_a'         // REQUIRED: Default selection
                        }],
                        
                        // Toggle group component
                        ['toggle', 'Toggle Name', ['Option 1', 'Option 2', 'Option 3'], { 
                            key: 'toggleKey',       // REQUIRED
                            selectedValues: [],     // REQUIRED: Initially selected (array)
                            layout: 'list'          // OPTIONAL: 'list' | 'grid'
                        }]
                    ]]
                ]],
                
                // Tab 2: Export controls
                ['EXPORT', [
                    // Block 2: Download
                    ['Download', [
                        // Button component
                        ['button', 'Export PNG', null, { 
                            key: 'exportBtn',       // REQUIRED
                            variant: 'primary'      // OPTIONAL: 'primary' | 'danger' | 'success'
                        }],
                        
                        ['button', 'Reset', null, { 
                            key: 'resetBtn' 
                        }]
                    ]]
                ]]
            ],
            
            // REQUIRED: Canvas configuration
            canvas: {
                width: 420,             // REQUIRED: Canvas width (use F-multiples: 420 = 30F)
                height: 420,            // REQUIRED: Canvas height
                showControls: true      // OPTIONAL: Auto-inject CANVAS tab with controls
            },
            
            // ═══════════════════════════════════════════════════════════════════
            // LIFECYCLE CALLBACKS
            // ═══════════════════════════════════════════════════════════════════
            
            // CRITICAL: All callbacks MUST use arrow functions
            // Arrow functions preserve 'this' context to refer to ToolName instance
            
            /**
             * onInit callback - Called once after UI is built
             * REQUIRED: Use arrow function
             */
            onInit: (values) => this._onInit(values),
            
            /**
             * onUpdate callback - Called when any component value changes
             * REQUIRED: Use arrow function
             */
            onUpdate: (key, value, allValues) => this._onUpdate(key, value, allValues),
            
            /**
             * onDraw callback - Called to render canvas
             * REQUIRED: Use arrow function
             */
            onDraw: (ctx, canvas, values) => this._onDraw(ctx, canvas, values)
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LIFECYCLE METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Initialization - Called once after UI is built
     * 
     * Use this to:
     * - Initialize state based on default values
     * - Wire button event handlers
     * - Start animations
     * - Set up audio contexts
     * 
     * @param {Object} values - Initial component values
     */
    _onInit(values) {
        console.log('🎯 Tool initialized with values:', values);
        
        // Initialize state from values
        this.myData = this._initializeData(values);
        this.currentMode = values.modeKey || 'mode_a';
        
        // Wire button handlers
        this._wireButtons();
        
        // OPTIONAL: Start animation if applicable
        if (this.deps.MF?.AnimationLoop) {
            this._startAnimation();
        }
        
        // OPTIONAL: Set up audio if applicable
        // Note: Must be called after user interaction due to autoplay policy
        // this._initAudio();
    }
    
    /**
     * Update handler - Called when any component value changes
     * 
     * Use this to:
     * - Update tool state based on new values
     * - Recalculate derived data
     * - Switch modes
     * 
     * Note: Canvas automatically redraws after this method
     * 
     * @param {string} key - Component key that changed
     * @param {*} value - New value
     * @param {Object} allValues - All current component values
     */
    _onUpdate(key, value, allValues) {
        console.log(`📝 ${key} changed to:`, value);
        
        // Handle specific parameter changes
        switch (key) {
            case 'paramKey':
                this._handleParameterChange(value);
                break;
            
            case 'modeKey':
                this._switchMode(value);
                break;
            
            case 'colorKey':
                this._updateColor(value);
                break;
            
            case 'toggleKey':
                this._handleToggleChange(value);
                break;
        }
        
        // Canvas will automatically redraw after this method completes
    }
    
    /**
     * Draw handler - Called to render canvas
     * 
     * Called automatically:
     * - After _onInit()
     * - After every _onUpdate()
     * - When this.tool.draw() is called manually
     * 
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} values - Current component values
     */
    _onDraw(ctx, canvas, values) {
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw based on current mode and state
        if (this.myData) {
            switch (this.currentMode) {
                case 'mode_a':
                    this._drawModeA(ctx, canvas, values);
                    break;
                
                case 'mode_b':
                    this._drawModeB(ctx, canvas, values);
                    break;
                
                case 'mode_c':
                    this._drawModeC(ctx, canvas, values);
                    break;
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Initialize tool data based on values
     */
    _initializeData(values) {
        return {
            param: values.paramKey || 50,
            color: values.colorKey || '#FF5500',
            mode: values.modeKey || 'mode_a',
            options: values.toggleKey || []
        };
    }
    
    /**
     * Handle parameter value changes
     */
    _handleParameterChange(value) {
        if (this.myData) {
            this.myData.param = value;
        }
    }
    
    /**
     * Switch between modes
     */
    _switchMode(mode) {
        this.currentMode = mode;
        console.log('🔄 Switched to mode:', mode);
        
        // Recalculate data for new mode if needed
        this.myData = this._recalculateForMode(mode);
    }
    
    /**
     * Update color
     */
    _updateColor(color) {
        if (this.myData) {
            this.myData.color = color;
        }
    }
    
    /**
     * Handle toggle changes
     */
    _handleToggleChange(selectedValues) {
        if (this.myData) {
            this.myData.options = selectedValues;
        }
    }
    
    /**
     * Recalculate data for mode
     */
    _recalculateForMode(mode) {
        // Mode-specific calculations
        return {
            ...this.myData,
            mode: mode
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // DRAWING METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Draw mode A visualization
     */
    _drawModeA(ctx, canvas, values) {
        ctx.fillStyle = values.colorKey || '#FF5500';
        const size = values.paramKey || 50;
        ctx.fillRect(
            (canvas.width - size) / 2,
            (canvas.height - size) / 2,
            size,
            size
        );
    }
    
    /**
     * Draw mode B visualization
     */
    _drawModeB(ctx, canvas, values) {
        ctx.strokeStyle = values.colorKey || '#FF5500';
        ctx.lineWidth = 2;
        const radius = values.paramKey || 50;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    /**
     * Draw mode C visualization
     */
    _drawModeC(ctx, canvas, values) {
        ctx.strokeStyle = values.colorKey || '#FF5500';
        ctx.lineWidth = 2;
        const size = values.paramKey || 50;
        
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2 - size);
        ctx.lineTo(canvas.width / 2 + size, canvas.height / 2 + size);
        ctx.lineTo(canvas.width / 2 - size, canvas.height / 2 + size);
        ctx.closePath();
        ctx.stroke();
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // BUTTON HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Wire button event handlers
     * CRITICAL: Use arrow functions in addEventListener to preserve 'this'
     */
    _wireButtons() {
        // Export button
        const exportBtn = this.tool.getComponent('exportBtn');
        if (exportBtn?.element) {
            exportBtn.element.addEventListener('click', () => {
                this._exportPNG();
            });
        }
        
        // Reset button
        const resetBtn = this.tool.getComponent('resetBtn');
        if (resetBtn?.element) {
            resetBtn.element.addEventListener('click', () => {
                this._reset();
            });
        }
    }
    
    /**
     * Export canvas as PNG
     */
    _exportPNG() {
        const canvas = this.tool.getCanvas();
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'tool-export.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            console.log('✅ PNG exported');
        }
    }
    
    /**
     * Reset tool to default values
     */
    _reset() {
        this.tool.setValue('paramKey', 50);
        this.tool.setValue('colorKey', '#FF5500');
        this.tool.setValue('modeKey', 'mode_a');
        this.tool.setValue('toggleKey', []);
        
        this.myData = this._initializeData(this.tool.getValues());
        this.currentMode = 'mode_a';
        
        this.tool.draw();
        console.log('🔄 Tool reset to defaults');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // ANIMATION (OPTIONAL - Include if tool has animations)
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Start animation loop
     */
    _startAnimation() {
        this.animator = new AnimationFoundation.AnimationLoop({
            fps: 60,
            onFrame: () => {
                this._updateAnimationFrame();
                this.tool.draw();
            }
        });
        this.animator.start();
    }
    
    /**
     * Update animation state for next frame
     */
    _updateAnimationFrame() {
        if (this.myData) {
            // Update animation state
            this.myData.animationTime = (this.myData.animationTime || 0) + 0.01;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // AUDIO (OPTIONAL - Include if tool has audio)
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Initialize audio context
     * CRITICAL: Must be called after user interaction (autoplay policy)
     */
    _initAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create audio nodes
        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();
        
        this.oscillator.frequency.value = 440;
        this.oscillator.type = 'sine';
        this.gainNode.gain.value = 0.5;
        
        // Connect nodes
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
    }
    
    /**
     * Play audio
     */
    _playAudio() {
        if (this.audioContext && !this.isPlaying) {
            this.oscillator.start();
            this.isPlaying = true;
        }
    }
    
    /**
     * Stop audio
     */
    _stopAudio() {
        if (this.oscillator && this.isPlaying) {
            this.oscillator.stop();
            this.isPlaying = false;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Clean up resources when tool is destroyed
     * 
     * CRITICAL: Always implement this method to prevent memory leaks
     * Called when:
     * - User navigates away from tool
     * - Tool is being replaced
     * - Page is unloading
     */
    destroy() {
        console.log('🧹 Destroying ToolName...');
        
        // 1. Stop and destroy animations
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        
        // 2. Stop and close audio
        if (this.oscillator && this.isPlaying) {
            this.oscillator.stop();
            this.oscillator = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // 3. Destroy ToolBase instance (cleans up all components)
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        
        // 4. Clear references to data
        this.myData = null;
        this.imageData = null;
        
        console.log('✅ ToolName destroyed');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// REQUIRED: Default export
export default ToolName;

// OPTIONAL: Named alias export (for compatibility with different import patterns)
export { ToolName as ToolShortName };

// OPTIONAL: Log successful module load
console.log('✅ ToolName loaded (ES Module)');
```

---

## Structure Verification Checklist

Use this to verify your tool follows the correct pattern:

### File Structure
- [ ] Imports at top (lines 1-30)
- [ ] Class definition starts with `export class ToolName`
- [ ] Constructor method first
- [ ] _createConfig() method second
- [ ] Lifecycle methods (_onInit, _onUpdate, _onDraw) next
- [ ] Helper methods after lifecycle
- [ ] destroy() method at end
- [ ] Exports at bottom

### Imports Section
- [ ] `import { ToolBase } from './tool-base.js'` present
- [ ] `import ComponentLibrary from '../shared/component-library.js'` present
- [ ] All imports have `.js` extension
- [ ] Optional imports only included if used
- [ ] No `window.` references

### Constructor
- [ ] Signature: `constructor(container, deps = {})`
- [ ] First line: `this.deps = { ComponentLibrary, ...deps };`
- [ ] All state initialized before _createConfig() call
- [ ] Calls `const config = this._createConfig();`
- [ ] Calls `this.tool = new ToolBase(config, this.deps);`
- [ ] Calls `this.tool.mount(container);`

### Config Method
- [ ] Named `_createConfig()`
- [ ] Returns object with title, sidebar, canvas
- [ ] All callbacks use arrow functions: `() => this._method()`
- [ ] Never uses `function() {}`
- [ ] Sidebar structure: tabs → blocks → components

### Lifecycle Methods
- [ ] `_onInit(values)` exists as instance method
- [ ] `_onUpdate(key, value, allValues)` exists as instance method
- [ ] `_onDraw(ctx, canvas, values)` exists as instance method
- [ ] All use `this.` to access instance properties
- [ ] No arrow function definitions (regular methods)

### Button Wiring
- [ ] Uses `this.tool.getComponent(key)`
- [ ] Event listeners use arrow functions: `() => this._method()`
- [ ] No `var self = this;` pattern

### Exports
- [ ] `export default ToolName;` at bottom
- [ ] Optional: `export { ToolName as Alias };`
- [ ] No `window.ToolName = ToolName`

---

## Component Format Reference

All components follow the array format:

```javascript
[type, ...args, { options }]
```

### Common Components

```javascript
// Slider
['slider', 'Label', min, max, step, { key: 'uniqueKey', value: default }]

// Color picker
['color', 'Label', '#HEX', { key: 'uniqueKey' }]

// Dropdown
['dropdown', 'Label', [
    { value: 'id1', label: 'Display 1' },
    { value: 'id2', label: 'Display 2' }
], { key: 'uniqueKey', value: 'id1' }]

// Toggle group
['toggle', 'Label', ['Opt1', 'Opt2', 'Opt3'], { 
    key: 'uniqueKey', 
    selectedValues: [] 
}]

// Button
['button', 'Button Text', null, { key: 'uniqueKey' }]

// File input
['file', 'Label', 'image/*', { key: 'uniqueKey' }]
```

---

## Critical Rules

### Rule 1: Arrow Functions in Config
```javascript
// CORRECT
onInit: (values) => this._onInit(values)

// WRONG - 'this' will be wrong object
onInit: function(values) { this._onInit(values) }
```

### Rule 2: State Before Config
```javascript
// CORRECT
constructor(container, deps = {}) {
    this.deps = { ComponentLibrary, ...deps };
    this.myState = null;              // State first
    const config = this._createConfig();  // Config second
}

// WRONG - state after config
constructor(container, deps = {}) {
    const config = this._createConfig();  // Config first
    this.myState = null;              // State second - TOO LATE
}
```

### Rule 3: ComponentLibrary in Deps
```javascript
// CORRECT
this.deps = { ComponentLibrary, ...deps };
this.tool = new ToolBase(config, this.deps);

// WRONG - ComponentLibrary missing
this.tool = new ToolBase(config, deps);
```

### Rule 4: Arrow Functions in Event Listeners
```javascript
// CORRECT
btn.addEventListener('click', () => {
    this._method();
});

// WRONG - 'this' will be button element
btn.addEventListener('click', function() {
    this._method();
});
```

### Rule 5: Cleanup in destroy()
```javascript
// CORRECT
destroy() {
    if (this.animator) {
        this.animator.destroy();
        this.animator = null;
    }
    if (this.tool) {
        this.tool.destroy();
        this.tool = null;
    }
}

// WRONG - missing cleanup
destroy() {
    // Nothing here - memory leak!
}
```

---

## ToolBase API Reference

Methods available via `this.tool`:

```javascript
// Get component values
const value = this.tool.getValue('key');
const allValues = this.tool.getValues();

// Set component values
this.tool.setValue('key', newValue);

// Get component instance
const component = this.tool.getComponent('key');

// Canvas access
const canvas = this.tool.getCanvas();
const ctx = this.tool.getContext();

// Trigger redraw
this.tool.draw();

// Set status text
this.tool.setStatus('Status message');
```

---

End of Tool Template Reference
