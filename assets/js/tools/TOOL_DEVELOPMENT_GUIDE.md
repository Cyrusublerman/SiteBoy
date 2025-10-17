# SiteBoy Tool Development Guide

**Quick Reference for Building Tools**

## Core Principles
- **F=12px mathematical foundation** for all dimensions
- **VGA colours only**: `var(--vga-*)` and `var(--c-*)`
- **Component-based**: Use `ComponentLibrary` components
- **Deterministic layout**: No arbitrary values
- **⚡ CleanupManager**: Use for automatic cleanup (no manual listener removal!)

## Tool Pattern (Use This)

```javascript
class ToolName {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        
        // ⚡ Use CleanupManager for automatic cleanup (NO manual cleanup needed!)
        this.eventHandlers = new CleanupManager.EventHandlerRegistry();
        this.intervals = new CleanupManager.IntervalRegistry();
        this.bodyElements = new CleanupManager.BodyElementRegistry();
        
        this.state = {};
    }
    
    render() {
        this.destroy(); // Always cleanup first
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        // Add event listeners (auto-tracked)
        this.eventHandlers.add(document, 'click', () => this.handleClick());
        
        // Add intervals (auto-tracked)
        this.intervals.add(() => this.update(), 100);
        
        // Add canvas to body (auto-tracked)
        const canvas = document.createElement('canvas');
        this.bodyElements.add(canvas);
        
        this.createInterface(F);
    }
    
    createInterface(F) {
        // Use ComponentLibrary components
        // Follow F multiples for spacing
    }
    
    destroy() {
        // ⚡ ONE LINE cleans everything automatically!
        CleanupManager.cleanupTool(this);
    }
}

window.ToolName = ToolName; // CRITICAL: Export to window
```

## 5-Step Setup

### 1. Create File
**Location**: `assets/js/tools/tool-name.js`

### 2. Add Script Import
**File**: `index.html`
```html
<script src="assets/js/tools/tool-name.js"></script>
```

### 3. Register in Tools Section
**File**: `assets/js/sections/tools_section.js`

**Add to pages array**:
```javascript
pages: [..., '#tools/tool-name'],
```

**Add to dropdown**:
```javascript
{ label: 'TOOL NAME', path: '#tools/tool-name' }
```

**Add switch case**:
```javascript
case 'tool-name':
    this.renderToolName();
    break;
```

**Add render method**:
```javascript
renderToolName() {
    const tool = new window.ToolName(this.currentContainer, {
        MF: window.MathematicalFoundation,
        Resize: window.ResizeManager
    });
    this.componentInstances.push(tool);
    tool.render();
    this.addBackLink();
}
```

### 4. Add to TOC
**Add item to TOC array**:
```javascript
{
    id: 'tool-name',
    title: 'TOOL NAME',
    description: 'Brief description'
}
```

### 5. Test
Navigate to `#tools/tool-name` and verify console shows no errors.

## Component Quick Reference

```javascript
// Buttons
new ComponentLibrary.Button({
    text: 'CLICK',
    onClick: () => {},
    variant: 'primary' // or 'secondary'
});

// Inputs
new ComponentLibrary.Input({
    type: 'text',
    placeholder: 'Text...',
    onChange: (value) => {}
});

// Numeric with +/- buttons
new ComponentLibrary.NumericInput({
    value: 50, min: 0, max: 100, step: 1,
    onChange: (value) => {}
});

// Dropdowns
new ComponentLibrary.Dropdown({
    items: [{ label: 'Option', value: 'val' }],
    onSelect: (item) => {}
});

// Progress
new ComponentLibrary.ProgressBar({
    value: 75, max: 100, showText: true
});
```

## Component Locations
- **Layout**: `assets/js/shared/layout.js` (Grid, Panel)
- **Content**: `assets/js/shared/content.js` (Heading, Paragraph, StatusDisplay)
- **Interactive**: `assets/js/shared/interactive.js` (Button, Input, Dropdown)
- **Graphs**: `assets/js/shared/graphs.js` (BarGraph, LineGraph, PieGraph)
- **Specialized**: `assets/js/shared/specialized.js` (Canvas, VGA components)

## Common Errors & Fixes

**"window.ToolName is not a constructor"**
1. ✅ Check script import in `index.html`
2. ✅ Check `window.ToolName = ToolName;` export
3. ✅ Check browser Network tab for 404s

**Tool loads but shows nothing**
- ✅ Check `render()` method exists
- ✅ Check `this.container.appendChild()` calls

**Navigation broken**
- ✅ Add to `pages` array in `tools_section.js`

**Layout issues**
- ✅ Use F multiples: `padding: ${F}px`
- ✅ Use VGA colors: `var(--c-text)`

## Debug Order
1. **Script loading** (index.html, Network tab)
2. **Window export** (console: `window.ToolName`)
3. **Navigation** (pages array)
4. **Render method** (console errors)

## Previous Issues

**Missing Script Import**: "window.X is not a constructor" usually means script not imported in `index.html`, not class definition issues. Always check script loading first.

---

## CleanupManager Quick Reference

### Before (Manual Cleanup - 40+ lines)
```javascript
class MyTool {
    constructor(container, deps) {
        this.boundHandlers = {
            mouseMove: null,
            click: null,
            // ... more handlers
        };
        this.updateInterval = null;
        this.canvas = null;
    }
    
    render() {
        // Setup listeners
        this.boundHandlers.mouseMove = (e) => this.handleMouse(e);
        document.addEventListener('mousemove', this.boundHandlers.mouseMove);
        
        // Setup interval
        this.updateInterval = setInterval(() => this.update(), 100);
        
        // Add canvas to body
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
    }
    
    destroy() {
        // Remove ALL listeners manually
        if (this.boundHandlers.mouseMove) {
            document.removeEventListener('mousemove', this.boundHandlers.mouseMove);
            this.boundHandlers.mouseMove = null;
        }
        if (this.boundHandlers.click) {
            document.removeEventListener('click', this.boundHandlers.click);
            this.boundHandlers.click = null;
        }
        // ... repeat for every listener
        
        // Clear interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Remove canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
        }
        
        // ... cleanup more resources
    }
}
```

### After (CleanupManager - 10 lines)
```javascript
class MyTool {
    constructor(container, deps) {
        this.eventHandlers = new CleanupManager.EventHandlerRegistry();
        this.intervals = new CleanupManager.IntervalRegistry();
        this.bodyElements = new CleanupManager.BodyElementRegistry();
    }
    
    render() {
        // Add listeners (auto-tracked)
        this.eventHandlers.add(document, 'mousemove', (e) => this.handleMouse(e));
        
        // Add interval (auto-tracked)
        this.intervals.add(() => this.update(), 100);
        
        // Add canvas (auto-tracked)
        const canvas = document.createElement('canvas');
        this.bodyElements.add(canvas);
    }
    
    destroy() {
        // ⚡ ONE LINE cleans EVERYTHING
        CleanupManager.cleanupTool(this);
    }
}
```

### Available Registries

```javascript
// Event listeners
this.eventHandlers = new CleanupManager.EventHandlerRegistry();
this.eventHandlers.add(document, 'click', handler);
this.eventHandlers.cleanup(); // Removes all

// Intervals
this.intervals = new CleanupManager.IntervalRegistry();
this.intervals.add(() => this.update(), 100);
this.intervals.cleanup(); // Clears all

// Timeouts
this.timeouts = new CleanupManager.TimeoutRegistry();
this.timeouts.add(() => this.delayed(), 1000);
this.timeouts.cleanup(); // Clears all

// Body elements
this.bodyElements = new CleanupManager.BodyElementRegistry();
this.bodyElements.add(canvasElement);
this.bodyElements.cleanup(); // Removes all
```

### Auto-Cleanup
```javascript
// Sections
cleanup() {
    CleanupManager.cleanupSection(this);
}

// Tools
destroy() {
    CleanupManager.cleanupTool(this);
}
```

**Benefits:**
- ✅ No manual listener removal
- ✅ No forgotten cleanup code
- ✅ No memory leaks
- ✅ 75% less boilerplate
- ✅ Consistent cleanup patterns
- ✅ Automatic resource tracking

---
**Guide v1.2** - Added CleanupManager