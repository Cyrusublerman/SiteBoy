# Comprehensive Guide: Building Tools & Generative Art for SiteBoy

This document is the definitive reference for creating tools and generative art within the SiteBoy framework. It consolidates all architectural rules, patterns, lessons learned, and best practices.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [The F-System](#2-the-f-system)
3. [ToolBase Framework](#3-toolbase-framework)
4. [Component Library Usage](#4-component-library-usage)
5. [Animation Foundation](#5-animation-foundation)
6. [VGA Color Constraints](#6-vga-color-constraints)
7. [File Organization](#7-file-organization)
8. [Step-by-Step: Creating a New Tool](#8-step-by-step-creating-a-new-tool)
9. [Step-by-Step: Converting an Existing Tool](#9-step-by-step-converting-an-existing-tool)
10. [Common Issues & Solutions](#10-common-issues--solutions)
11. [Validation & Testing](#11-validation--testing)
12. [Feature Parity Checklist](#12-feature-parity-checklist)

---

## 1. Architecture Overview

### Core Principles

SiteBoy follows a **strict modular architecture** where each concern has exactly one owner:

| Concern | Owner File | Never Do Elsewhere |
|---------|------------|-------------------|
| Layout math | `mathematical-foundation.js` | Calculate dimensions |
| DOM operations | `base-component.js` | createElement, innerHTML |
| Animation loops | `animation-foundation.js` | requestAnimationFrame |
| Routing | `router.js` | pushState, popstate |
| App bootstrap | `app.js` | initialize() |
| UI components | `component-library.js` | Component classes |
| All styling | `assets/css/` modular system (`components.css`, `tools.css`, etc.) | Colors, sizes, fonts |

### Why This Matters

- **Consistency**: All tools look and behave the same
- **Maintainability**: Bug fixes apply everywhere
- **Testability**: Components tested in isolation
- **Performance**: Optimized code paths shared

---

## 2. The F-System

### Base Unit: F = 14px

All dimensions derive from F (configurable via CSS variable):

```css
:root {
    --f: 14px;
    --header-height: 28px;    /* 2F */
    --target-margin: 56px;    /* 4F */
    --sidebar-width: 420px;   /* 30F */
}
```

### When to Use F

| Context | Calculation | Example |
|---------|-------------|---------|
| Control height | 2F | `height: calc(var(--f) * 2)` |
| Padding | F | `padding: var(--f)` |
| Tight gap | F/2 | `gap: calc(var(--f) / 2)` |
| Text size | F | `font-size: var(--f)` |
| Small text | 0.8F | `font-size: calc(var(--f) * 0.8)` |

### When NOT to Use F

- Canvas pixel dimensions (use actual pixels)
- Border widths (always 1px)
- Animation durations (use seconds/ms)

---

## 3. ToolBase Framework

### What ToolBase Provides

ToolBase is the standard framework for all tool pages. It provides:

- ✅ Tabbed sidebar with scrolling
- ✅ Canvas with resize controls
- ✅ Export functionality (PNG)
- ✅ Pan/zoom support
- ✅ Fullscreen mode
- ✅ Responsive layout
- ✅ Component registration

### Standard Configuration

```javascript
const TOOL_CONFIG = {
    title: 'TOOL NAME',
    
    sidebar: [
        ['TAB NAME', [
            ['Block Name', [
                ['slider', 'Label', min, max, step, { key: 'paramKey', value: default }],
                ['button', 'Label', null, { key: 'buttonKey' }],
                ['toggle', 'Label', ['Option1', 'Option2'], { key: 'toggleKey' }],
                ['radio', 'Label', ['A', 'B', 'C'], { key: 'radioKey' }],
                ['dropdown', 'Label', ['opt1', 'opt2'], { key: 'dropKey' }],
            ]],
        ]],
        // Maximum 4-6 tabs recommended
    ],
    
    canvas: {
        width: 840,      // Default canvas width
        height: 840,     // Default canvas height
        displayMode: 'fit',  // 'fit', 'actual', or 'fill'
        showControls: true   // Show canvas control tab
    },
    
    onInit: function(values) {
        // Called once after render
        // Wire up buttons, initialize state
    },
    
    onUpdate: function(key, value, allValues) {
        // Called when any control changes
        // Handle parameter updates
    },
    
    onDraw: function(ctx, canvas, values) {
        // Called to render canvas
        // All drawing logic here
    }
};
```

### Tab Limit: Maximum 4 Tabs (Hard Limit)

The sidebar has limited width. Only 4 tabs fit properly:

**Good:** CONTROLS, ANIMATION, PRESETS, EXPORT
**Bad:** 5+ tabs (won't fit, UI breaks)

If you need more organization, use **blocks within tabs** instead of more tabs. For example, combine R/X/Y equation controls into a single "EQUATION" tab with blocks for each.

---

## 4. Component Library Usage

### DO: Use ComponentLibrary Components

```javascript
// In ComponentLibrary or extension
class MyList extends BaseComponent {
    render() {
        // DOM operations allowed HERE
        this.element = this.createElement('div', 'my-list');
        this.items.forEach(item => {
            const itemEl = this.createElement('div', 'my-list-item');
            // ... build item
            this.element.appendChild(itemEl);
        });
        return this.element;
    }
}
```

### DON'T: Create DOM in Tool Files

```javascript
// ❌ FORBIDDEN in tool files
const div = document.createElement('div');
div.innerHTML = '<span>Bad</span>';
container.appendChild(div);

// ✅ CORRECT - use existing components
const button = new ComponentLibrary.Button({ text: 'Good' });
container.appendChild(button.render());
```

### Extending ComponentLibrary

If you need a new component type:

1. Add to appropriate category file (`interactive.js`, `content.js`, etc.)
2. Extend `BaseComponent`
3. Export from `component-library.js`
4. Use CSS classes for styling (in `components.css` or `tools.css`)

**If the new component is built from existing subcomponents** (e.g. binding a toggle, slider, and numeric field into one bordered box), follow `blog/docs/guides/standards/composite-components.md`: one outer border, no gaps between cells, single-owner `1px` dividers, and per-edge border control so adjacent components never double their borders.

---

## 5. Animation Foundation

### AnimationLoop

For continuous animations (60fps render loops):

```javascript
// ✅ CORRECT
var animator = new window.AnimationFoundation.AnimationLoop({
    fps: 60,
    onFrame: function(deltaTime) {
        updateState(deltaTime);
        draw();
    }
});
animator.start();

// In destroy:
animator.destroy();
```

### IntervalAnimator

For periodic updates (not every frame):

```javascript
var animator = new window.AnimationFoundation.IntervalAnimator({
    interval: 100, // ms
    onTick: function() {
        updateData();
    }
});
```

### ❌ FORBIDDEN Patterns

```javascript
// ❌ NEVER do this in tool files
requestAnimationFrame(loop);
setInterval(tick, 100);
setTimeout(delayed, 1000);

// These must use AnimationFoundation wrappers
```

---

## 6. VGA Color Constraints

### Only These Colors Allowed

```css
--vga-black: #000000;
--vga-maroon: #800000;
--vga-green: #008000;
--vga-olive: #808000;
--vga-navy: #000080;
--vga-purple: #800080;
--vga-teal: #008080;
--vga-silver: #c0c0c0;
--vga-gray: #808080;
--vga-red: #ff0000;
--vga-lime: #00ff00;
--vga-yellow: #ffff00;
--vga-blue: #0000ff;
--vga-fuchsia: #ff00ff;
--vga-aqua: #00ffff;
--vga-white: #ffffff;
```

### Theme Variables

```css
--c-bg: var(--vga-black);
--c-text: var(--vga-silver);
--c-border: var(--vga-gray);
--c-accent: var(--vga-white);
```

### ❌ FORBIDDEN

```javascript
// ❌ NEVER
ctx.fillStyle = '#ff5500';
element.style.color = 'rgb(255, 100, 0)';
element.style.background = 'blue';

// ✅ CORRECT
ctx.fillStyle = '#ffffff';  // Must be exact VGA color
// OR for UI elements, use CSS classes with var(--vga-*)
```

---

## 7. File Organization

### Tool File Location

```
assets/js/tools/
├── tool-base.js           # Framework (DO NOT MODIFY)
├── tool-test-ui.js        # Reference implementation
├── my-tool.js             # Your tool
└── ...
```

### Naming Convention

| Type | Convention | Example |
|------|------------|---------|
| File | kebab-case | `wave-interference-tool.js` |
| Class | PascalCase | `WaveInterferenceTool` |
| Route | kebab-case | `#art/generative/wave-interference` |
| Key | camelCase | `phaseSpeed`, `gridSize` |

### Routing Setup

In `art_section.js` (for generative art):

```javascript
// Add to generativeAnimations array
{
    id: 'wave-interference',
    title: 'Wave Interference',
    type: 'component',
    componentClass: 'WaveInterferenceTool',
    scriptPath: '/assets/js/tools/wave-interference-tool.js',
    description: 'Description here',
    // ...
}

// Add to toolBaseMap
const toolBaseMap = {
    'wave-interference': 'WaveInterferenceTool',
    // ...
};
```

---

## 8. Step-by-Step: Creating a New Tool

### Step 1: Create Tool File

```javascript
// assets/js/tools/my-new-tool.js
(function() {
    'use strict';
    
    // Module state (animation, data, etc.)
    var animator = null;
    var state = { /* ... */ };
    
    // Tool configuration
    var TOOL_CONFIG = {
        title: 'MY NEW TOOL',
        sidebar: [
            ['CONTROLS', [
                ['Parameters', [
                    ['slider', 'Value', 0, 100, 1, { key: 'value', value: 50 }],
                ]],
            ]],
        ],
        canvas: { size: 840, displayMode: 'fit' },
        
        onInit: function(values) {
            var self = this;
            // Initialize animation if needed
            if (window.AnimationFoundation) {
                animator = new window.AnimationFoundation.AnimationLoop({
                    onFrame: function() { self.draw(); }
                });
                animator.start();
            }
        },
        
        onUpdate: function(key, value, allValues) {
            // Handle control changes
        },
        
        onDraw: function(ctx, canvas, values) {
            // Render
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // ...
        }
    };
    
    // Wrapper class
    function MyNewTool(container, deps) {
        this.container = container;
        this.deps = deps || {};
        this.tool = null;
    }
    
    MyNewTool.prototype.render = function() {
        if (!window.ToolBase) throw new Error('ToolBase not loaded');
        this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
        this.tool.mount(this.container);
        this.tool.draw();
    };
    
    MyNewTool.prototype.destroy = function() {
        if (animator) { animator.destroy(); animator = null; }
        if (this.tool) { this.tool.destroy(); this.tool = null; }
    };
    
    window.MyNewTool = MyNewTool;
})();
```

### Step 2: Add Routing

In appropriate section file (e.g., `tools_section.js`):

```javascript
// Add to routing
case 'my-new-tool':
    this.renderMyNewTool();
    break;

// Add render method
renderMyNewTool() {
    const tool = new window.MyNewTool(this.currentContainer, {
        MF: window.LayoutCalculator,
        Resize: window.ResizeManager
    });
    this.componentInstances.push(tool);
    tool.render();
}
```

### Step 3: Add Script Tag

In `index.html`:

```html
<script src="assets/js/tools/my-new-tool.js"></script>
```

### Step 4: Document

Create `blog/docs/pages/tools/my-new-tool.md` with:
- Description
- Parameters
- Usage
- Reusable code candidates

---

## 9. Step-by-Step: Converting an Existing Tool

When converting a standalone CodePen/reference implementation:

### Step 1: Analyze Original

- Count all parameters and their ranges
- Identify unique features (checkpoints, animations, etc.)
- Note mathematical functions used
- Check for interactive UI patterns

### Step 2: Map to ToolBase

| Original | ToolBase |
|----------|----------|
| Slider inputs | `['slider', ...]` |
| Button clicks | `['button', ...]` |
| Dropdown | `['dropdown', ...]` |
| Toggle/checkbox | `['toggle', ...]` |
| Radio buttons | `['radio', ...]` |
| Canvas drawing | `onDraw(ctx, canvas, values)` |
| Animation loop | Use AnimationFoundation |
| DOM manipulation | Use ComponentLibrary or remove |

### Step 3: Handle Special Features

For features not built into ToolBase:

1. **Can it use existing components?** → Use them
2. **Does it need a new component?** → Add to ComponentLibrary first
3. **Is it tool-specific logic?** → Keep in tool but follow patterns

### Step 4: Validate Feature Parity

Create checklist comparing original vs implementation:
- [ ] All parameters present
- [ ] All presets working
- [ ] All export options
- [ ] All animation modes
- [ ] All UI patterns

---

## 10. Common Issues & Solutions

### Issue: DOM Manipulation Needed

**Problem:** Need to create custom UI elements
**Solution:** Extend ComponentLibrary

```javascript
// In interactive.js
export class CustomList extends BaseComponent {
    // ... implementation with DOM ops allowed here
}
```

### Issue: Inline Styles Needed

**Problem:** Dynamic positioning/sizing
**Solution:** Use CSS classes + CSS variables

```css
/* In tools.css or components.css */
.dynamic-element {
    left: var(--dynamic-x);
    top: var(--dynamic-y);
}
```

```javascript
// In tool
element.style.setProperty('--dynamic-x', x + 'px');
```

### Issue: Complex Animation State

**Problem:** Multiple simultaneous animations
**Solution:** Use AnimationFoundation with state object

```javascript
var animState = {
    phase1: { active: false, progress: 0 },
    phase2: { active: false, progress: 0 }
};

animator = new AnimationFoundation.AnimationLoop({
    onFrame: function(dt) {
        if (animState.phase1.active) {
            animState.phase1.progress += dt / duration1;
        }
        // ... manage all phases
        draw();
    }
});
```

### Issue: Too Many Tabs

**Problem:** More than 6 tabs needed
**Solution:** Consolidate into blocks within tabs

```javascript
// Instead of:
['R1', [...]], ['R2', [...]], ['R_MOD', [...]], ['X1', [...]], ...

// Do:
['R(r) RADIAL', [
    ['Term 1', [...]], 
    ['Term 2', [...]], 
    ['Modulation', [...]]
]]
```

---

## 11. Validation & Testing

### Run Architecture Validation

```bash
bash scripts/validate-architecture.sh
```

This checks:
- No DOM manipulation outside allowed files
- No hardcoded colors
- No raw animation APIs
- No inline styles (warning)
- Tab counts

### Manual Testing Checklist

- [ ] Page loads without errors
- [ ] All tabs accessible
- [ ] All controls functional
- [ ] Canvas renders correctly
- [ ] Export works
- [ ] Resize handled
- [ ] Destroy cleans up (no memory leaks)

### Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari (if applicable)
- [ ] Mobile viewport

---

## 12. Feature Parity Checklist

When converting a tool, ensure these features are preserved:

### Core Features (Required)
- [ ] All equation/algorithm parameters
- [ ] Default values match original
- [ ] Parameter ranges match original
- [ ] Core rendering output identical

### UI Features (Required)
- [ ] All presets/landmarks
- [ ] Export functionality
- [ ] Play/pause (if animated)
- [ ] Reset/clear

### Advanced Features (Best Effort)
- [ ] Undo/redo
- [ ] Checkpoint system
- [ ] Keyboard shortcuts
- [ ] Equation display
- [ ] Draft mode rendering

### UX Polish (Nice to Have)
- [ ] Status messages
- [ ] Loading indicators
- [ ] Error handling
- [ ] Tooltips

---

## Appendix: Quick Reference

### ToolBase Lifecycle

```
Constructor → mount() → render() → onInit() → [user interaction] → onUpdate() → draw() → onDraw() → ... → destroy()
```

### Component Creation Pattern

```javascript
const component = new ComponentLibrary.Button({ text: 'Click' });
container.appendChild(component.render());
// Later:
component.destroy();
```

### Animation Pattern

```javascript
animator = new AnimationFoundation.AnimationLoop({ onFrame: tick });
animator.start();
// Later:
animator.destroy();
```

### Color Usage

```javascript
// Canvas
ctx.fillStyle = '#000000';  // VGA black only
ctx.fillStyle = '#ffffff';  // VGA white only

// CSS (in modular .css files only — never styles.css)
.element { color: var(--c-text); }
```

---

*Last updated: November 2024*
*Version: 1.0.0*

