# Tool Building Guide - SiteBoy Framework

## Overview

This document outlines the **exact process** for building tool pages using SiteBoy's declarative architecture. The framework provides a standardized, maintainable approach to tool development with guaranteed layout consistency.

## Architecture Overview

```
TOOL_CONFIG (declarative) → ToolBase (interpreter) → ComponentLibrary (UI) → DOM
```

### Core Components

- **TOOL_CONFIG**: Declarative configuration object defining UI structure
- **ToolBase**: Framework class that interprets TOOL_CONFIG and manages lifecycle
- **ComponentLibrary**: Reusable UI components (sliders, buttons, etc.)
- **Sections**: Page containers with routing and navigation

## Step-by-Step Tool Building Process

### Step 1: Define TOOL_CONFIG

Create a declarative configuration object that defines your tool's entire UI structure:

```javascript
export const TOOL_CONFIG = {
    title: 'TOOL NAME',

    // Animation export configuration (optional)
    animation: {
        type: 'loop',
        loopFrames: 600,
        defaultFps: 60
    },

    // Sidebar structure: TAB → BLOCK → COMPONENT
    sidebar: [
        // TAB 1
        ['CONTROLS', [
            ['Parameters', [
                ['slider', 'Value', 0, 100, 1, { key: 'value', value: 50 }],
                ['color', 'Color', '#FF5500', { key: 'color' }],
                ['dropdown', 'Mode', ['A', 'B', 'C'], { key: 'mode', value: 'A' }]
            ]],
            ['Settings', [
                ['toggle', 'Options', ['Debug', 'Grid'], { key: 'options', selectedValues: [] }],
                ['button', 'Reset', null, { key: 'reset' }]
            ]]
        ]],

        // TAB 2
        ['EXPORT', [
            ['Download', [
                ['button', 'Export PNG', null, { key: 'exportPng' }],
                ['button', 'Clear Canvas', null, { key: 'clear' }]
            ]]
        ]]
    ],

    // Canvas configuration
    canvas: {
        width: 420,  // F * 30 = 420px
        height: 420,
        showControls: true  // Auto-injects CANVAS tab
    },

    // Lifecycle callbacks
    onInit: function(values) {
        console.log('Tool initialized with:', values);
        // Setup initial state, wire buttons, etc.
    },

    onUpdate: function(key, value, allValues) {
        console.log(`${key} changed to:`, value);
        // Handle parameter changes, update canvas, etc.
    },

    onDraw: function(ctx, canvas, values) {
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw based on values
        ctx.fillStyle = values.color || '#FFFFFF';
        ctx.fillRect(10, 10, values.value || 50, values.value || 50);
    }
};
```

### Step 2: Create Tool Class

Extend the framework with your tool's specific logic:

```javascript
import { ToolBase } from './tool-base.js';
import { ComponentLibrary } from '../shared/component-library.js';

export class ToolName extends ToolBase {
    constructor(container, deps = {}) {
        // Merge ComponentLibrary into deps
        deps = {
            ComponentLibrary,
            ...deps
        };

        // Initialize with TOOL_CONFIG
        super(TOOL_CONFIG, deps);

        // Tool-specific state
        this.myState = {};

        // Call parent render to build UI
        this.render();
    }

    // Override methods as needed
    render() {
        // Call parent render (builds sidebar + canvas)
        const element = super.render();

        // Add tool-specific setup
        this.setupCustomLogic();

        return element;
    }

    setupCustomLogic() {
        // Wire custom buttons, setup state, etc.
        const resetBtn = this.getComponent('reset');
        if (resetBtn && resetBtn.element) {
            resetBtn.element.addEventListener('click', () => {
                this.resetTool();
            });
        }
    }

    resetTool() {
        // Custom reset logic
        this.myState = {};
        this.setValue('value', 50);
        this.setValue('color', '#FF5500');
        this.draw();
    }
}

console.log('✅ ToolName loaded (ES Module)');
```

### Step 3: Register Tool in Section

Add the tool to the tools section routing:

```javascript
// assets/js/sections/tools_section.js

// Add to pages array
pages: [
    '#tools',
    '#tools/tool-name',  // Add your tool URL
    // ... existing tools
],

// Add to TOC
toolsSections: {
    'TOOL NAME': '#tools/tool-name',
    // ... existing tools
},

// Add to dropdown
getDropdownItems() {
    const allTools = {
        'TOOL NAME': '#tools/tool-name',
        // ... existing tools
    };
    // ... rest of method
},

// Add switch case
renderTool(toolId) {
    switch (toolId) {
        case 'tool-name':
            this.renderToolName();  // Add your render method
            break;
        // ... existing cases
    }
},

// Add render method
renderToolName() {
    if (typeof window.ToolName === 'undefined') {
        console.error('ToolName class not found');
        this.container.innerHTML = '<p>Error: ToolName not loaded</p>';
        return;
    }

    this.currentTool = new window.ToolName(
        window.App.contentContainer,
        { MF: window.MathematicalFoundation }
    );
}
```

### Step 4: Update Main Entry Point

Ensure your tool is imported in the main application:

```javascript
// src/main.js
import '../assets/js/tools/tool-name.js';  // Add your tool import
// ... other imports
```

### Step 5: Component Registration

Ensure all components used in TOOL_CONFIG are available:

```javascript
// Component types used in TOOL_CONFIG must exist in ComponentLibrary:
// - 'slider' → NumericInput
// - 'color' → ColorInput
// - 'dropdown' → Dropdown
// - 'toggle' → ToggleGroup
// - 'button' → Button
```

## File Structure

```
assets/js/tools/
├── tool-base.js           # Framework core
├── tool-name.js          # Your tool implementation
└── ...

assets/js/sections/
└── tools_section.js      # Tool routing and registration

src/
└── main.js              # Application entry point
```

## Component Type Reference

### Input Components

| Type | Format | Example |
|------|--------|---------|
| `slider` | `['slider', label, min, max, step, {key, value}]` | `['slider', 'Size', 10, 200, 1, {key: 'size', value: 100}]` |
| `color` | `['color', label, defaultHex, {key}]` | `['color', 'Fill', '#FF0000', {key: 'fillColor'}]` |
| `dropdown` | `['dropdown', label, [options], {key, value}]` | `['dropdown', 'Mode', ['A', 'B'], {key: 'mode', value: 'A'}]` |
| `toggle` | `['toggle', label, [items], {key, selectedValues}]` | `['toggle', 'Options', ['Grid', 'Debug'], {key: 'opts'}]` |
| `button` | `['button', text, onClick, {key}]` | `['button', 'Reset', null, {key: 'reset'}]` |

### Layout Rules

- **3-level hierarchy**: `TAB → BLOCK → COMPONENT`
- **Standard tab names**: `CONTROLS`, `CANVAS`, `EXPORT`
- **Standard block names**: `Parameters`, `Settings`, `Download`
- **Canvas size**: Multiples of F (14px base unit)
- **Keys**: camelCase, unique across tool

## Integration Points

### With ToolBase API

```javascript
// In tool class
this.getValue('key');        // Get component value
this.setValue('key', value); // Set component value
this.getComponent('key');    // Get component instance
this.draw();                 // Trigger canvas redraw
this.setStatus('text');      // Update status display
```

### With ComponentLibrary

```javascript
// Components are accessed via deps.ComponentLibrary
const Button = deps.ComponentLibrary.Button;
const Slider = deps.ComponentLibrary.NumericInput;
```

### With AnimationFoundation

```javascript
// For animated tools
import { AnimationFoundation } from '../core/animation-foundation.js';

const animator = new AnimationFoundation.AnimationLoop({
    fps: 60,
    onFrame: () => this.draw()
});
```

## Tool-Test Example Implementation

Here's how the tool-test page is built:

### TOOL_CONFIG Structure

```javascript
export const TOOL_CONFIG = {
    title: 'TOOL TEST UI',

    animation: {
        type: 'loop',
        loopFrames: 600,
        defaultFps: 60
    },

    sidebar: [
        ['MODES', [
            ['Mode Selection', [
                ['dropdown', 'Active Mode', [
                    {value: 'ANIMATION', label: 'Animation - Bouncing Balls'},
                    {value: 'IMAGE', label: 'Image Processing'},
                    {value: 'SVG', label: 'SVG Polygon Editor'},
                    {value: 'GRAPHS', label: 'Data Visualization'},
                    {value: 'AUDIO', label: 'Audio Synthesis'}
                ], {key: 'activeMode', value: 'ANIMATION'}]
            ]]
        ]],

        ['ANIMATION', [
            ['Physics Settings', [
                ['slider', 'Ball Count', 1, 20, 1, {key: 'ballCount', value: 5}],
                ['slider', 'Gravity', 0.1, 2.0, 0.1, {key: 'gravity', value: 0.5}],
                ['slider', 'Bounce', 0.1, 1.0, 0.1, {key: 'bounce', value: 0.8}]
            ]],
            ['Appearance', [
                ['color', 'Ball Color', '#FF5500', {key: 'ballColor'}],
                ['toggle', 'Display Options', ['Show Trails', 'Wireframe', 'Debug Info'], {key: 'displayOpts'}]
            ]]
        ]],

        // ... additional tabs for IMAGE, SVG, GRAPHS, AUDIO
    ],

    canvas: {
        width: 420,
        height: 420,
        showControls: true
    },

    onInit: function(values) { /* ... */ },
    onUpdate: function(key, value, allValues) { /* ... */ },
    onDraw: function(ctx, canvas, values) { /* ... */ }
};
```

### Tool Class Implementation

```javascript
export class ToolTestUI {
    constructor(container, deps = {}) {
        this.deps = {
            ComponentLibrary,
            ...deps
        };

        this.tool = new ToolBase(TOOL_CONFIG, this.deps);
        this.tool.mount(container);

        // Mode-specific state
        this.currentMode = 'ANIMATION';
        this.balls = [];
        this.sourceImage = null;
        // ... other state
    }
}
```

## Quality Assurance Checklist

### Configuration
- [ ] TOOL_CONFIG has valid 3-level hierarchy (TAB → BLOCK → COMPONENT)
- [ ] All component keys are unique camelCase
- [ ] Canvas size is F-multiple (14, 28, 42, 420, etc.)
- [ ] Standard tab/block names used where appropriate

### Implementation
- [ ] Tool class extends ToolBase or implements required methods
- [ ] ComponentLibrary passed in deps
- [ ] All TOOL_CONFIG callbacks implemented
- [ ] Tool registered in all 4 places in tools_section.js

### Functionality
- [ ] All sliders/buttons produce visible changes
- [ ] Canvas renders correctly
- [ ] Export functionality works
- [ ] Tool loads without console errors

### Performance
- [ ] No memory leaks on mode switching
- [ ] Canvas redraws efficiently
- [ ] Component cleanup on tool destroy

## Common Issues & Solutions

### Tool Not Loading
**Symptom**: "Tool not available" error
**Cause**: Tool not registered in tools_section.js
**Solution**: Add to pages, toolsSections, getDropdownItems, and switch case

### Components Not Rendering
**Symptom**: Empty sidebar or broken UI
**Cause**: Component type not in ComponentLibrary
**Solution**: Check COMPONENT_TYPES mapping in tool-base.js

### Canvas Not Drawing
**Symptom**: Black/empty canvas
**Cause**: onDraw callback not implemented or values undefined
**Solution**: Implement onDraw and handle undefined values

### Memory Leaks
**Symptom**: Performance degrades over time
**Cause**: Event listeners or animation loops not cleaned up
**Solution**: Implement proper destroy() method

This process ensures all tools follow the same architectural patterns, guaranteeing consistent user experience and maintainability.

