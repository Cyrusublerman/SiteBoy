# SiteBoy Tool Development Guide

**Quick Reference for Building Tools**

## Core Principles
- **F=12px mathematical foundation** for all dimensions
- **VGA colours only**: `var(--vga-*)` and `var(--c-*)`
- **Component-based**: Use `ComponentLibrary` components
- **Deterministic layout**: No arbitrary values

## Tool Pattern (Use This)

```javascript
class ToolName {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = deps;
        this.componentInstances = [];
        this.state = {};
    }
    
    render() {
        this.destroy();
        const F = this.deps.MF ? this.deps.MF.F : 12;
        this.createInterface(F);
    }
    
    createInterface(F) {
        // Use ComponentLibrary components
        // Follow F multiples for spacing
    }
    
    destroy() {
        for (const instance of this.componentInstances) {
            if (instance?.destroy) instance.destroy();
        }
        this.componentInstances = [];
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
**Guide v1.1** - Condensed for efficiency