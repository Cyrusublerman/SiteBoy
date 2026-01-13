# Tool Migration Template - Old to New Pattern

**Use this file as a reference when converting existing tools to Vite ES Module pattern.**

---

## Complete Side-by-Side Example

### OLD PATTERN (Pre-Vite - BROKEN)

```javascript
/**
 * MyTool - Example Tool
 * @version 1.0.0
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════
    // MODULE-LEVEL CONFIG (WRONG - 'this' context breaks)
    // ═══════════════════════════════════════════════════════════════════
    
    var TOOL_CONFIG = {
        title: 'MY TOOL',
        
        sidebar: [
            ['CONTROLS', [
                ['Parameters', [
                    ['slider', 'Value', 0, 100, 1, { 
                        key: 'value', 
                        value: 50 
                    }],
                    ['color', 'Color', '#FF5500', { 
                        key: 'color' 
                    }],
                    ['dropdown', 'Mode', [
                        { value: 'A', label: 'Mode A' },
                        { value: 'B', label: 'Mode B' }
                    ], { 
                        key: 'mode' 
                    }]
                ]],
                ['Actions', [
                    ['button', 'Reset', null, { key: 'reset' }],
                    ['button', 'Export', null, { key: 'export' }]
                ]]
            ]]
        ],
        
        canvas: { width: 420, height: 420 },
        
        // ❌ WRONG: function() callbacks have wrong 'this' context
        onInit: function(values) {
            console.log('Init called');
            // 'this' here is ToolBase, NOT MyTool
            this.myState = [];              // ❌ Goes to wrong object
            this._initializeData(values);   // ❌ Method doesn't exist on ToolBase
            this._wireButtons();            // ❌ Method doesn't exist on ToolBase
        },
        
        onUpdate: function(key, value, allValues) {
            // 'this' here is ToolBase, NOT MyTool
            if (key === 'value') {
                this._updateValue(value);   // ❌ Method doesn't exist
            }
            if (key === 'mode') {
                this._switchMode(value);    // ❌ Method doesn't exist
            }
        },
        
        onDraw: function(ctx, canvas, values) {
            // 'this' here is ToolBase, NOT MyTool
            this._clearCanvas(ctx, canvas); // ❌ Method doesn't exist
            this._drawVisualization(ctx, canvas, values); // ❌ Method doesn't exist
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // CONSTRUCTOR (Old pattern)
    // ═══════════════════════════════════════════════════════════════════
    
    function MyTool(container, deps) {
        this.container = container;
        this.deps = deps || {};
        this.tool = null;
        
        // Tool state
        this.myState = [];
        this.currentMode = 'A';
        this.animator = null;
        
        this.render();
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // RENDER METHOD
    // ═══════════════════════════════════════════════════════════════════
    
    MyTool.prototype.render = function() {
        try {
            // ❌ WRONG: Uses window global
            if (!window.ToolBase) {
                throw new Error('ToolBase not loaded');
            }
            
            // ❌ WRONG: Uses window global
            // ❌ WRONG: TOOL_CONFIG callbacks will have wrong 'this'
            this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
            
        } catch (error) {
            console.error('❌ MyTool error:', error);
        }
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // HELPER METHODS (Prototype pattern)
    // ═══════════════════════════════════════════════════════════════════
    
    MyTool.prototype._initializeData = function(values) {
        this.myState = [];
        this.currentMode = values.mode || 'A';
    };
    
    MyTool.prototype._wireButtons = function() {
        var self = this;  // ⚠️ Need to save 'this' reference
        
        var resetBtn = this.tool.getComponent('reset');
        if (resetBtn && resetBtn.element) {
            resetBtn.element.addEventListener('click', function() {
                self._reset();  // ⚠️ Use saved reference
            });
        }
        
        var exportBtn = this.tool.getComponent('export');
        if (exportBtn && exportBtn.element) {
            exportBtn.element.addEventListener('click', function() {
                self._exportPNG();  // ⚠️ Use saved reference
            });
        }
    };
    
    MyTool.prototype._updateValue = function(value) {
        console.log('Value updated:', value);
    };
    
    MyTool.prototype._switchMode = function(mode) {
        this.currentMode = mode;
        console.log('Switched to mode:', mode);
    };
    
    MyTool.prototype._clearCanvas = function(ctx, canvas) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    MyTool.prototype._drawVisualization = function(ctx, canvas, values) {
        ctx.fillStyle = values.color || '#FF5500';
        var size = values.value || 50;
        ctx.fillRect(
            (canvas.width - size) / 2,
            (canvas.height - size) / 2,
            size,
            size
        );
    };
    
    MyTool.prototype._reset = function() {
        this.tool.setValue('value', 50);
        this.tool.setValue('color', '#FF5500');
        this.tool.setValue('mode', 'A');
        this.tool.draw();
    };
    
    MyTool.prototype._exportPNG = function() {
        var canvas = this.tool.getCanvas();
        if (canvas) {
            var link = document.createElement('a');
            link.download = 'my-tool-export.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };
    
    MyTool.prototype.destroy = function() {
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    };
    
    // ═══════════════════════════════════════════════════════════════════
    // EXPORT TO WINDOW (Old pattern)
    // ═══════════════════════════════════════════════════════════════════
    
    // ❌ WRONG: Window global export
    window.MyTool = MyTool;
    
})();
```

---

### NEW PATTERN (Vite - CORRECT)

```javascript
/**
 * MyTool - Example Tool
 * @version 2.0.0 - Migrated to Vite ES Modules
 */

// ═══════════════════════════════════════════════════════════════════════
// IMPORTS (NEW - Required for Vite)
// ═══════════════════════════════════════════════════════════════════════

// ✅ Core framework imports (REQUIRED)
import { ToolBase } from './tool-base.js';
import ComponentLibrary from '../shared/component-library.js';

// ✅ Optional: Animation (if tool is animated)
import { AnimationFoundation } from '../core/animation-foundation.js';

// ✅ Optional: Utilities (as needed)
// import { safePow, clamp } from '../shared/utils/math.js';
// import { ColorSpaceConverter } from '../shared/utils/color.js';

// ═══════════════════════════════════════════════════════════════════════
// CLASS DEFINITION (NEW - ES Module class)
// ═══════════════════════════════════════════════════════════════════════

export class MyTool {
    
    // ═══════════════════════════════════════════════════════════════════
    // CONSTRUCTOR (NEW pattern)
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * @param {HTMLElement} container - Container to mount tool into
     * @param {Object} deps - Dependencies injected by tools_section
     */
    constructor(container, deps = {}) {
        // ✅ Merge ComponentLibrary into dependencies
        this.deps = { ComponentLibrary, ...deps };
        
        // ✅ Initialize ALL state BEFORE creating config
        this.myState = [];
        this.currentMode = 'A';
        this.animator = null;
        
        // ✅ Create config with bound callbacks
        const config = this._createConfig();
        
        // ✅ Initialize ToolBase (no window global needed)
        this.tool = new ToolBase(config, this.deps);
        this.tool.mount(container);
        
        console.log('✅ MyTool initialized');
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // CONFIG (NEW - Instance method instead of module variable)
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Creates ToolBase configuration
     * ✅ CRITICAL: Must be instance method for arrow function binding
     */
    _createConfig() {
        return {
            title: 'MY TOOL',
            
            // Sidebar structure (UNCHANGED - same as old pattern)
            sidebar: [
                ['CONTROLS', [
                    ['Parameters', [
                        ['slider', 'Value', 0, 100, 1, { 
                            key: 'value', 
                            value: 50 
                        }],
                        ['color', 'Color', '#FF5500', { 
                            key: 'color' 
                        }],
                        ['dropdown', 'Mode', [
                            { value: 'A', label: 'Mode A' },
                            { value: 'B', label: 'Mode B' }
                        ], { 
                            key: 'mode' 
                        }]
                    ]],
                    ['Actions', [
                        ['button', 'Reset', null, { key: 'reset' }],
                        ['button', 'Export', null, { key: 'export' }]
                    ]]
                ]]
            ],
            
            // Canvas config (UNCHANGED)
            canvas: { width: 420, height: 420 },
            
            // ✅ CORRECT: Arrow functions preserve 'this' context
            // 'this' inside these callbacks is MyTool instance
            onInit: (values) => this._onInit(values),
            
            onUpdate: (key, value, allValues) => this._onUpdate(key, value, allValues),
            
            onDraw: (ctx, canvas, values) => this._onDraw(ctx, canvas, values)
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // LIFECYCLE METHODS (NEW - Called by arrow function callbacks)
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Called once after UI is built
     * ✅ 'this' is correctly bound to MyTool instance
     */
    _onInit(values) {
        console.log('🎯 Init called with values:', values);
        
        // ✅ Now these methods exist on 'this'
        this._initializeData(values);
        this._wireButtons();
    }
    
    /**
     * Called when any component value changes
     * ✅ 'this' is correctly bound to MyTool instance
     */
    _onUpdate(key, value, allValues) {
        // ✅ Now these methods exist on 'this'
        if (key === 'value') {
            this._updateValue(value);
        }
        if (key === 'mode') {
            this._switchMode(value);
        }
    }
    
    /**
     * Called to render canvas
     * ✅ 'this' is correctly bound to MyTool instance
     */
    _onDraw(ctx, canvas, values) {
        // ✅ Now these methods exist on 'this'
        this._clearCanvas(ctx, canvas);
        this._drawVisualization(ctx, canvas, values);
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // HELPER METHODS (CONVERTED from prototype to class methods)
    // ═══════════════════════════════════════════════════════════════════
    
    _initializeData(values) {
        this.myState = [];
        this.currentMode = values.mode || 'A';
    }
    
    _wireButtons() {
        // ✅ Arrow functions automatically bind 'this' - no 'self' needed
        const resetBtn = this.tool.getComponent('reset');
        if (resetBtn?.element) {
            resetBtn.element.addEventListener('click', () => {
                this._reset();  // ✅ 'this' is MyTool
            });
        }
        
        const exportBtn = this.tool.getComponent('export');
        if (exportBtn?.element) {
            exportBtn.element.addEventListener('click', () => {
                this._exportPNG();  // ✅ 'this' is MyTool
            });
        }
    }
    
    _updateValue(value) {
        console.log('Value updated:', value);
    }
    
    _switchMode(mode) {
        this.currentMode = mode;
        console.log('Switched to mode:', mode);
    }
    
    _clearCanvas(ctx, canvas) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    _drawVisualization(ctx, canvas, values) {
        ctx.fillStyle = values.color || '#FF5500';
        const size = values.value || 50;
        ctx.fillRect(
            (canvas.width - size) / 2,
            (canvas.height - size) / 2,
            size,
            size
        );
    }
    
    _reset() {
        this.tool.setValue('value', 50);
        this.tool.setValue('color', '#FF5500');
        this.tool.setValue('mode', 'A');
        this.tool.draw();
    }
    
    _exportPNG() {
        const canvas = this.tool.getCanvas();
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'my-tool-export.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }
    
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
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTS (NEW - ES Module exports)
// ═══════════════════════════════════════════════════════════════════════

// ✅ Export as default (recommended)
export default MyTool;

// ✅ Optional: Export with alias for compatibility
// export { MyTool as ToolShortName };

// ✅ Log successful load
console.log('✅ MyTool loaded (ES Module)');
```

---

## Transformation Checklist

Use this checklist when converting a tool:

### 1. File Header
- [ ] Remove `(function() {` wrapper (line 1)
- [ ] Remove `'use strict';` (not needed in ES modules)
- [ ] Add import statements at top

### 2. Add Imports
```javascript
// ✅ Add these at the top
import { ToolBase } from './tool-base.js';
import ComponentLibrary from '../shared/component-library.js';
```

### 3. Convert TOOL_CONFIG
- [ ] Delete module-level `var TOOL_CONFIG = { ... }`
- [ ] Create `_createConfig()` method inside class
- [ ] Move entire config object into `_createConfig()` return statement
- [ ] Keep sidebar/canvas structure exactly the same
- [ ] Change callbacks from `function() {}` to arrow functions `() =>`

**Before:**
```javascript
var TOOL_CONFIG = {
    title: 'MY TOOL',
    onInit: function(values) { ... }
};
```

**After:**
```javascript
_createConfig() {
    return {
        title: 'MY TOOL',
        onInit: (values) => this._onInit(values)
    };
}
```

### 4. Convert Constructor
- [ ] Change `function MyTool(container, deps) {` to `constructor(container, deps = {}) {`
- [ ] Add `this.deps = { ComponentLibrary, ...deps };` at start
- [ ] Keep all state initialization
- [ ] Add `const config = this._createConfig();` before ToolBase creation
- [ ] Change `window.ToolBase` to just `ToolBase`
- [ ] Pass `this.deps` to ToolBase constructor
- [ ] Remove the `render()` call (initialization happens in constructor now)

**Before:**
```javascript
function MyTool(container, deps) {
    this.myState = [];
    this.tool = new window.ToolBase(TOOL_CONFIG, deps);
    this.render();
}

MyTool.prototype.render = function() { ... };
```

**After:**
```javascript
constructor(container, deps = {}) {
    this.deps = { ComponentLibrary, ...deps };
    this.myState = [];
    const config = this._createConfig();
    this.tool = new ToolBase(config, this.deps);
    this.tool.mount(container);
}
```

### 5. Create Lifecycle Methods
For each callback in TOOL_CONFIG, create a corresponding instance method:

- [ ] Create `_onInit(values) { }` method
- [ ] Create `_onUpdate(key, value, allValues) { }` method
- [ ] Create `_onDraw(ctx, canvas, values) { }` method
- [ ] Move callback code into these methods

**Before (in TOOL_CONFIG):**
```javascript
onInit: function(values) {
    this.myState = [];
    this._wireButtons();
}
```

**After (in _createConfig and class method):**
```javascript
// In _createConfig():
onInit: (values) => this._onInit(values)

// As class method:
_onInit(values) {
    this.myState = [];
    this._wireButtons();
}
```

### 6. Convert Prototype Methods
- [ ] Remove all `MyTool.prototype.methodName = function() {` syntax
- [ ] Convert to class methods: `methodName() {`
- [ ] Update all `var` to `const`/`let`
- [ ] Remove `var self = this;` patterns (arrow functions handle this)
- [ ] Change event listeners to use arrow functions

**Before:**
```javascript
MyTool.prototype._wireButtons = function() {
    var self = this;
    btn.addEventListener('click', function() {
        self._reset();
    });
};
```

**After:**
```javascript
_wireButtons() {
    btn.addEventListener('click', () => {
        this._reset();
    });
}
```

### 7. Update Footer
- [ ] Remove `window.MyTool = MyTool;`
- [ ] Remove `})();` closing wrapper
- [ ] Add `export default MyTool;`
- [ ] Add console.log for loading confirmation

### 8. Variable Updates
- [ ] Change all `var` to `const` or `let`
- [ ] Remove unnecessary `var self = this;` patterns
- [ ] Use arrow functions for callbacks
- [ ] Use template literals instead of string concatenation (optional)

---

## Common Patterns

### Pattern 1: Using Shared Utilities

**OLD:**
```javascript
// ❌ Assumes global
var result = safePow(base, exp);
```

**NEW:**
```javascript
// ✅ Import first
import { safePow } from '../shared/utils/math.js';

// Then use
const result = safePow(base, exp);
```

### Pattern 2: Animation

**OLD:**
```javascript
// ❌ Uses window global
this.animator = new window.AnimationFoundation.AnimationLoop({ ... });
```

**NEW:**
```javascript
// ✅ Import first
import { AnimationFoundation } from '../core/animation-foundation.js';

// Then use
this.animator = new AnimationFoundation.AnimationLoop({ ... });
```

### Pattern 3: Event Listeners

**OLD:**
```javascript
var self = this;
btn.addEventListener('click', function() {
    self.doSomething();
});
```

**NEW:**
```javascript
btn.addEventListener('click', () => {
    this.doSomething();
});
```

---

## Quick Find & Replace Guide

Use these carefully (check each occurrence):

| Find | Replace | Notes |
|------|---------|-------|
| `(function() {` | DELETE | Remove IIFE start |
| `'use strict';` | DELETE | Not needed in modules |
| `var TOOL_CONFIG =` | `_createConfig() { return` | Convert to method |
| `onInit: function(values) {` | `onInit: (values) => this._onInit(values),` | Arrow function |
| `onUpdate: function(key, value, allValues) {` | `onUpdate: (key, value, allValues) => this._onUpdate(key, value, allValues),` | Arrow function |
| `onDraw: function(ctx, canvas, values) {` | `onDraw: (ctx, canvas, values) => this._onDraw(ctx, canvas, values)` | Arrow function |
| `function MyTool(container, deps) {` | `constructor(container, deps = {}) {` | Constructor |
| `MyTool.prototype.` | DELETE | Convert to class method |
| `= function() {` | `() {` | Class method syntax |
| `window.ToolBase` | `ToolBase` | Remove global |
| `window.MyTool = MyTool;` | `export default MyTool;` | ES export |
| `})();` | DELETE | Remove IIFE end |
| `var ` | `const ` or `let ` | Modern JS |
| `var self = this;` | DELETE | Arrow functions handle this |

---

## Testing After Conversion

1. **Load test:**
   ```
   Navigate to #tools/my-tool
   ✅ Should see: "✅ MyTool loaded (ES Module)"
   ❌ Should NOT see any import/export errors
   ```

2. **Render test:**
   ```
   ✅ Sidebar appears with all controls
   ✅ Canvas appears
   ✅ No console errors
   ```

3. **Interaction test:**
   ```
   ✅ Move sliders → values update
   ✅ Change dropdown → mode switches
   ✅ Click buttons → actions execute
   ✅ Canvas updates on changes
   ```

4. **Callback test:**
   ```
   ✅ No errors like "this._myMethod is not a function"
   ✅ State updates correctly
   ✅ All helper methods accessible
   ```

5. **Cleanup test:**
   ```
   Navigate away from tool
   ✅ No memory leaks
   ✅ Animations stop
   ✅ Audio stops
   ```

---

## Common Errors After Conversion

| Error | Cause | Fix |
|-------|-------|-----|
| `this._myMethod is not a function` | Forgot to convert callback to arrow function | In `_createConfig()`, use `onInit: (values) => this._onInit(values)` |
| `Cannot read property 'balls' of undefined` | State initialized after config | Move state initialization BEFORE `_createConfig()` call |
| `ComponentLibrary not available` | Forgot to pass in deps | Add `this.deps = { ComponentLibrary, ...deps }` |
| `ToolBase is not a constructor` | Import failed | Check import statement has `.js` extension |
| `Module not found` | Wrong import path | Verify relative path is correct |

---

## Final Checklist

Before declaring conversion complete:

- [ ] All IIFE/window global patterns removed
- [ ] All imports added with `.js` extensions
- [ ] Class uses `export default`
- [ ] Constructor has ComponentLibrary in deps
- [ ] Config moved to `_createConfig()` method
- [ ] All callbacks are arrow functions
- [ ] Lifecycle methods created (_onInit, _onUpdate, _onDraw)
- [ ] All prototype methods converted to class methods
- [ ] All `var` changed to `const`/`let`
- [ ] No `var self = this` patterns
- [ ] Event listeners use arrow functions
- [ ] Tool loads without errors
- [ ] All features work correctly
- [ ] Cleanup in destroy() works

---

## Example Files

**See these for complete working examples:**
- `tool-test-ui.js` - Complex multi-mode tool (reference implementation)
- `tool-build-guide-VITE.md` - Complete documentation
- `tool-standards-VITE.md` - Standards and utilities

---

End of Migration Template
