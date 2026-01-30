# Tool Build Guide — Precise Specification

**VERSION:** 2.3  
**UPDATED:** 2026-01-30 — Added ToolBase Universal Extensions (category tabs, canvas mode tabs, dynamic sidebar)  
**RELATED:**
- `blog/docs/guides/tool-standards.md` — Minimum functionality requirements
- `blog/docs/guides/shared-utilities.md` — Reusable code registry
- `blog/docs/components/COMPONENT-REFERENCE.md` — Component API
- `assets/js/core/animation-foundation.js` — Animation system (REQUIRED for animated tools)

---

## Scope

This guide specifies how to create tool pages using `ToolBase`.  
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

### Registration Locations

| Section | Registration File | Array/Object |
|---------|------------------|--------------|
| Tools | `tools_section.js` | `pages`, `toolsSections`, `getDropdownItems` |
| Art/Generative | `art_section.js` | `pages`, `generativeAnimations` |

**Both use:** `asset-loader.js` → `toolRegistry`

---

## File Structure

```
assets/js/tools/
├── tool-base.js           ← DO NOT MODIFY
├── tool-test-ui.js        ← Reference implementation (read this!)
├── my-new-tool.js         ← Your new tool
```

---

## File Locations

All files must go in specific locations:

```
SiteBoy/
├── assets/
│   └── js/
│       └── tools/
│           ├── tool-base.js         ← DO NOT MODIFY
│           ├── tool-test-ui.js      ← Reference implementation
│           └── my-new-tool.js       ← YOUR TOOL FILE HERE
│
├── index.html                        ← Add script tag here
│
└── assets/
    └── js/
        └── sections/
            └── tools_section.js      ← Register routing here (4 places)
```

### Naming Convention

| Item | Format | Example |
|------|--------|---------|
| File name | `kebab-case.js` | `wave-generator.js` |
| Class name | `PascalCase` | `WaveGenerator` |
| URL slug | `kebab-case` | `#tools/wave-generator` |
| Display name | `UPPERCASE` | `WAVE GENERATOR` |

---

## How Routing Works

When user navigates to `#tools/my-tool`:

```
1. URL changes to #tools/my-tool
       ↓
2. app.js detects hash change
       ↓
3. app.js calls tools_section.handleRoute('my-tool')
       ↓
4. tools_section checks 'pages' array for '#tools/my-tool'
       ↓
5. tools_section calls renderTool('my-tool')
       ↓
6. renderTool switch → renderMyTool()
       ↓
7. Your tool class instantiated → render() called
```

### Subheader Dropdown (TOC)

The subheader dropdown shows all tools. It's populated from `allTools` in `getDropdownItems()`:

```javascript
// In tools_section.js
getDropdownItems() {
    const allTools = {
        'TOOL TOC': '#tools',           // Always first
        'MY NEW TOOL': '#tools/my-new-tool',  // Your entry
        // ... other tools ...
    };
    return Object.entries(allTools).map(([name, url]) => ({
        text: name,
        url: url,
        active: window.location.hash === url
    }));
}
```

### Tools TOC Page

The main `#tools` page shows a table of contents. It reads from `toolsSections`:

```javascript
// In tools_section.js
toolsSections: {
    'MY NEW TOOL': '#tools/my-new-tool',
    // ... other tools ...
},
```

---

## Step 1: Create Tool File

Create `assets/js/tools/{tool-name}.js`:

```javascript
/**
 * {ToolName} - Brief description
 * @version 1.0.0
 */
(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════

    var TOOL_CONFIG = {
        title: 'TOOL NAME',  // UPPERCASE, shown in header
        
        sidebar: [
            ['CONTROLS', [
                ['Parameters', [
                    ['slider', 'Value', 0, 100, 1, { value: 50, key: 'value' }],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },  // F-multiple (420 = 30F)
        
        onInit: function(values) {
            // Called once after mount
        },
        
        onUpdate: function(key, value, allValues) {
            // Called when any input changes
        },
        
        onDraw: function(ctx, canvas, values) {
            // Called after init and on changes
        },
    };

    // ═══════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════

    function ToolName(container, deps) {
        this.container = container;
        this.deps = deps || {};
        this.tool = null;
        
        // Tool-specific state
        // this.myState = [];
        
        this.render();
    }
    
    ToolName.prototype.render = function() {
        try {
            if (!window.ToolBase) {
                throw new Error('ToolBase not loaded');
            }
            
            this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);  // ← MUST use mount(), NOT appendChild(render())
            this.tool.draw();
            
            console.log('✅ ToolName rendered');
        } catch (error) {
            console.error('❌ ToolName error:', error);
            this.container.innerHTML = 
                '<div style="padding: 20px; color: var(--c-text);">' +
                '<h2>TOOL NAME ERROR</h2>' +
                '<p style="color: red;">' + error.message + '</p>' +
                '</div>';
        }
    };
    
    ToolName.prototype.destroy = function() {
        // 1. Clean up AnimationFoundation animators (REQUIRED for animated tools)
        // Note: animator is typically module-level, not this.animator
        // If you stored animator on the instance:
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        
        // 2. Clean up audio contexts
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // 3. Destroy ToolBase instance
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // EXPORT
    // ═══════════════════════════════════════════════════════════════════

    window.ToolName = ToolName;
    console.log('✅ ToolName loaded');
})();
```

---

## Step 2: Register Tool (5 Steps)

### 2.1 Add Script to index.html

**Location:** `index.html` (near end, with other tool scripts)

```html
<!-- After tool-base.js, before closing </body> -->
<script src="assets/js/tools/my-new-tool.js"></script>
```

**Why:** Loads your tool class into `window.MyNewTool`.

---

### 2.2 Add to `pages` Array

**Location:** `assets/js/sections/tools_section.js` → top of file

```javascript
pages: [
    '#tools',                    // TOC page
    '#tools/tool-test',          // existing
    // ... other existing tools ...
    '#tools/my-new-tool',        // ← ADD YOUR TOOL
],
```

**Why:** Tells router this URL is valid (prevents 404).

---

### 2.3 Add to `toolsSections`

**Location:** `assets/js/sections/tools_section.js` → `toolsSections` object

```javascript
toolsSections: {
    'TOOL TEST': '#tools/tool-test',
    // ... other existing tools ...
    'MY NEW TOOL': '#tools/my-new-tool',  // ← ADD YOUR TOOL
},
```

**Why:** Shows tool in the Tools TOC page listing.

---

### 2.4 Add to `allTools` (Subheader Dropdown)

**Location:** `assets/js/sections/tools_section.js` → inside `getDropdownItems()`

```javascript
getDropdownItems() {
    const allTools = {
        'TOOLS TOC': '#tools',
        'TOOL-TEST': '#tools/tool-test',
        // ... other existing tools ...
        'MY NEW TOOL': '#tools/my-new-tool',  // ← ADD YOUR TOOL
    };
    // ...
}
```

**Why:** Shows tool in subheader dropdown for navigation.

---

### 2.5 Add Switch Case + Render Method

**Location:** `assets/js/sections/tools_section.js` → `renderTool()` method

```javascript
renderTool(toolName) {
    switch (toolName) {
        case 'tool-test':
            this.renderToolTest();
            break;
        // ... other existing cases ...
        
        case 'my-new-tool':           // ← ADD CASE
            this.renderMyNewTool();
            break;
            
        default:
            this.renderToolTOC();
    }
}
```

**Location:** `assets/js/sections/tools_section.js` → add new method

```javascript
renderMyNewTool() {
    if (typeof window.MyNewTool === 'undefined') {
        console.error('MyNewTool class not found on window');
        this.container.innerHTML = '<p>Error: MyNewTool not loaded</p>';
        return;
    }
    this.currentTool = new window.MyNewTool(
        window.App.contentContainer,
        { MF: window.MathematicalFoundation }
    );
}
```

**Why:** Actually instantiates and renders your tool when navigated to.

---

### Registration Checklist

| Step | File | What to Add | Effect |
|------|------|-------------|--------|
| 2.1 | `index.html` | `<script src="...">` | Loads JS file |
| 2.2 | `tools_section.js` | `pages` array entry | Valid route |
| 2.3 | `tools_section.js` | `toolsSections` entry | Shows in TOC |
| 2.4 | `tools_section.js` | `allTools` entry | Shows in dropdown |
| 2.5 | `tools_section.js` | switch case + method | Renders tool |

**If any step is missing:**
- Missing 2.1 → "class not found" error
- Missing 2.2 → 404 / route not recognized
- Missing 2.3 → Not in TOC listing
- Missing 2.4 → Not in subheader dropdown
- Missing 2.5 → Nothing renders when navigating

---

## Step 3: Sidebar Structure

### 3 LEVELS REQUIRED: TAB → BLOCK → COMPONENT

```
sidebar ──┬── TAB ──┬── BLOCK ──┬── component
          │         │           ├── component
          │         │           └── component
          │         │
          │         └── BLOCK ──┬── component
          │                     └── component
          │
          └── TAB ──┬── BLOCK ──┬── component
                    │           └── component
                    └── BLOCK ──── component
```

### Standard Tab Names (use these)

```javascript
['CONTROLS', [...]]     // Primary parameters
['CANVAS', [...]]       // Size, export, display
['ANIMATION', [...]]    // Playback (if animated)
['PRESETS', [...]]      // Saved configs
['INFO', [...]]         // Help, formulas
```

### Standard Block Names (use these)

```javascript
['Parameters', [...]]   // Main adjustable values
['Style', [...]]        // Colors, stroke, fill
['Canvas', [...]]       // Size, resolution
['Export', [...]]       // Download buttons
['Playback', [...]]     // Animation controls
['Source', [...]]       // File input
['Output', [...]]       // Results display
```

### ❌ WRONG (missing BLOCK level)

```javascript
sidebar: [
    ['CONTROLS', [
        ['slider', 'Value', 0, 100, 1],  // ERROR: component directly in tab
    ]],
]
```

### ✓ CORRECT

```javascript
sidebar: [
    ['CONTROLS', [
        ['Parameters', [                    // Block wrapper REQUIRED
            ['slider', 'Value', 0, 100, 1, { key: 'value' }],
        ]],
    ]],
]
```

---

## Step 4: Component Types

### Format

```javascript
[TYPE, LABEL, ARG1, ARG2, ARG3, { key: 'keyName', ...options }]
```

**Always provide explicit `key` in options object.**

### Complete Reference

#### Numeric Inputs

| Type | Format | Example |
|------|--------|---------|
| `slider` | `['slider', label, min, max, step, {value, key, withNumber}]` | `['slider', 'Scale', 10, 200, 1, {value: 100, key: 'scale'}]` |
| `number` | `['number', label, min, max, step, {value, key, precision}]` | `['number', 'Count', 1, 100, 1, {value: 10, key: 'count'}]` |
| `stepper` | `['stepper', label, min, max, step, {value, key}]` | `['stepper', 'Sides', 3, 12, 1, {value: 6, key: 'sides'}]` |

#### Text Inputs

| Type | Format | Example |
|------|--------|---------|
| `text` | `['text', label, defaultValue, {key, placeholder}]` | `['text', 'Name', '', {key: 'name', placeholder: 'Enter...'}]` |
| `textarea` | `['textarea', label, defaultValue, {key, rows}]` | `['textarea', 'Notes', '', {key: 'notes', rows: 4}]` |

#### Selection Inputs

| Type | Format | Example |
|------|--------|---------|
| `dropdown` | `['dropdown', label, [options], {key, value}]` | `['dropdown', 'Mode', ['A', 'B'], {key: 'mode', value: 'A'}]` |
| `toggle` | `['toggle', label, [items], {key, selectedValues}]` | `['toggle', 'Options', ['Loop', 'Grid'], {key: 'opts', selectedValues: []}]` |
| `radio` | `['radio', label, [items], {key, selectedValue}]` | `['radio', 'Type', ['Sine', 'Square'], {key: 'type', selectedValue: 'Sine'}]` |
| `checkbox` | `['checkbox', label, [items], {key, selectedValues}]` | Same as toggle (alias) |

#### Other Inputs

| Type | Format | Example |
|------|--------|---------|
| `color` | `['color', label, hexValue, {key, showHex}]` | `['color', 'Fill', '#FFFFFF', {key: 'fill'}]` |
| `file` | `['file', label, acceptMime, {key, buttonText}]` | `['file', 'Image', 'image/*', {key: 'imageFile'}]` |
| `button` | `['button', text, onClick, {key, size}]` | `['button', 'Reset', null, {key: 'reset'}]` |
| `equation` | `['equation', template, {key, param1: {value}, ...}]` | See equation docs |

#### Output Components

| Type | Format | Example |
|------|--------|---------|
| `label` | `['label', text, {variant, key}]` | `['label', 'Info text', {variant: 'body'}]` |
| `value` | `['value', value, {label, unit, key}]` | `['value', '0', {label: 'Count', unit: 'px', key: 'countDisplay'}]` |
| `progress` | `['progress', label, value, {key}]` | `['progress', 'Loading', 0, {key: 'progress'}]` |

#### Variant Options

| Component | variant values |
|-----------|---------------|
| `label` | `'heading'`, `'subheading'`, `'body'`, `'caption'`, `'value'`, `'error'`, `'success'` |
| `button` | size: `'s'`, `'m'`, `'l'` |

---

## Step 5: Keys and Values

### Key Convention: camelCase

```javascript
// ALWAYS provide explicit key:
['slider', 'Ball Size', 5, 50, 1, { key: 'ballSize', value: 20 }]

// Access in callbacks:
values.ballSize  // ✓ CORRECT

// NOT these:
values.ball_size  // ❌ snake_case
values.BallSize   // ❌ PascalCase
values['Ball Size']  // ❌ original label
```

### Auto-generated Keys (if no explicit key)

| Label | Auto Key |
|-------|----------|
| "Ball Count" | `ballCount` |
| "Wave Amplitude" | `waveAmplitude` |
| "X Position" | `xPosition` |
| "Scale (%)" | `scale` |

**Recommendation: Always use explicit keys to avoid confusion.**

---

## Step 6: ToolBase API

### CRITICAL: Mount Pattern

**ALWAYS use `mount()` method. NEVER manually append render().**

```javascript
// ✅ CORRECT - use mount()
this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
this.tool.mount(this.container);

// ❌ WRONG - breaks sidebar/canvas layout
this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
this.container.innerHTML = '';
this.container.appendChild(this.tool.render());
```

**Why:** `mount()` adds the essential `tool-viewport` CSS class to the container, which is required for proper sidebar/canvas layout. Without it, the sidebar won't display correctly.

### Available Methods (in callbacks, `this` = ToolBase instance)

| Method | Returns | Description |
|--------|---------|-------------|
| `this.draw()` | void | Trigger onDraw callback |
| `this.getValue(key)` | any | Get single value |
| `this.getValues()` | object | Get all values |
| `this.setValue(key, value)` | void | Set value and update component |
| `this.getCanvas()` | HTMLCanvasElement | Get canvas element |
| `this.getContext()` | CanvasRenderingContext2D | Get 2D context |
| `this.getComponent(key)` | Component | Get component by key |
| `this.setStatus(text)` | void | Update status text below canvas |
| `this.resizeCanvas(w, h, opts)` | void | Resize canvas resolution |
| `this.setDisplayMode(mode)` | void | Set 'fit' or 'actual' display |
| **`this.rebuildSidebar(config)`** | void | **Rebuild sidebar without destroying canvas** |
| **`this.setActiveCategory(id)`** | void | **Set active category tab programmatically** |
| **`this.setActiveCanvasTab(id)`** | void | **Set active canvas mode tab programmatically** |

### Responsive Layout

ToolBase automatically switches layout based on viewport:
- **Landscape** (width ≥ 800px): Sidebar left, canvas right
- **Portrait** (width < 800px): Canvas top, sidebar below

---

## Step 6A: Advanced ToolBase Features (Optional)

### Category Tabs (Top-Level Page Selection)

Category tabs appear above the entire tool for high-level organization. Useful for tools with multiple distinct "pages" of content (e.g., Algorithms Test Lab with 6 algorithm categories).

#### Configuration

```javascript
var TOOL_CONFIG = {
    title: 'MY MULTI-PAGE TOOL',
    
    categoryTabs: {
        categories: [
            { id: 'page1', title: 'NOISE, SAMPLING, PATTERNS' },
            { id: 'page2', title: 'EDGES, FILTERING, SEGMENTATION' },
            { id: 'page3', title: 'CURVES, DISTANCE, TOPOLOGY' }
        ],
        activeCategory: 'page1',
        enableScrollbar: true,
        onCategoryChange: function(categoryId, tool) {
            // Update sidebar for new category
            var newSidebar = buildSidebarForCategory(categoryId);
            tool.rebuildSidebar(newSidebar);
            tool.draw();
        }
    },
    
    sidebar: buildSidebarForCategory('page1'),
    // ... rest of config
};
```

#### Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│ NOISE, SAMPLING  │ EDGES, FILTERING │ CURVES, DISTANCE  │ ← Category Tabs
├─────────────────────────────────────────────────────────┤
│ Sidebar │ Canvas                                        │
│ for     │ Area                                          │
│ Page 1  │                                               │
└─────────────────────────────────────────────────────────┘
```

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `categories` | Array<{id, title}> | required | Category definitions |
| `activeCategory` | string | first category | Initially active category |
| `enableScrollbar` | boolean | `true` | Show visible scrollbar if tabs overflow |
| `onCategoryChange` | function(id, tool) | none | Called when category switches |

#### Helper: buildSidebarForCategory()

```javascript
function buildSidebarForCategory(categoryId) {
    switch (categoryId) {
        case 'page1':
            return [
                ['NOISE', [
                    ['Perlin 2D', [/* controls */]],
                    ['Simplex 2D', [/* controls */]],
                ]],
            ];
        case 'page2':
            return [
                ['EDGE', [
                    ['Sobel', [/* controls */]],
                    ['Canny', [/* controls */]],
                ]],
            ];
        // ... more categories
    }
}
```

---

### Canvas Mode Tabs (OUTPUT/ABOUT Style)

Canvas mode tabs appear above the canvas area for switching between output view and documentation. Common pattern: OUTPUT | ABOUT.

#### Configuration

```javascript
var TOOL_CONFIG = {
    title: 'MY DOCUMENTED TOOL',
    
    canvasModeTabs: {
        tabs: [
            { id: 'output', label: 'OUTPUT' },
            { id: 'about', label: 'ABOUT' }
        ],
        defaultTab: 'output',
        onTabChange: function(tabId, tool) {
            if (tabId === 'output') {
                showCanvas(tool);
            } else if (tabId === 'about') {
                showAboutPanel(tool);
            }
        }
    },
    
    // ... rest of config
};
```

#### Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│ Sidebar │ ┌─────────────────────────────────────────┐ │
│         │ │ OUTPUT │ ABOUT │                        │ │ ← Canvas Mode Tabs
│         │ ├─────────────────────────────────────────┤ │
│         │ │                                         │ │
│         │ │ Canvas or About Content                 │ │
│         │ │                                         │ │
└─────────────────────────────────────────────────────────┘
```

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `tabs` | Array<{id, label}> | required | Tab definitions |
| `defaultTab` | string | first tab | Initially active tab |
| `onTabChange` | function(id, tool) | none | Called when tab switches |

#### Show/Hide Pattern

```javascript
// Module-level state
var aboutPanel = null;
var canvasVisible = true;

function showCanvas(tool) {
    if (tool.canvasComponent && tool.canvasComponent.element) {
        tool.canvasComponent.element.style.display = 'flex';
    }
    if (aboutPanel) {
        aboutPanel.style.display = 'none';
    }
    canvasVisible = true;
}

function showAboutPanel(tool) {
    if (tool.canvasComponent && tool.canvasComponent.element) {
        tool.canvasComponent.element.style.display = 'none';
    }
    
    if (!aboutPanel) {
        aboutPanel = document.createElement('div');
        aboutPanel.style.cssText = `
            width: 100%;
            height: 100%;
            overflow: auto;
            background: var(--c-bg);
            padding: calc(var(--f) * 2);
        `;
        aboutPanel.innerHTML = '<h2>About This Tool</h2><p>Documentation...</p>';
        tool.canvasArea.appendChild(aboutPanel);
    }
    
    aboutPanel.style.display = 'block';
    canvasVisible = false;
}
```

---

### Dynamic Sidebar Rebuilding

`rebuildSidebar()` allows changing sidebar content without destroying the canvas. Essential for multi-page tools.

#### API

```javascript
tool.rebuildSidebar(newSidebarConfig)
```

#### Example: Category Switching

```javascript
categoryTabs: {
    onCategoryChange: function(categoryId, tool) {
        // Build new sidebar for this category
        var newSidebar = [
            ['TAB 1', [
                ['Block', [
                    ['slider', 'Param', 0, 100, 1, { key: 'param1', value: 50 }],
                ]],
            ]],
        ];
        
        // Rebuild sidebar (preserves canvas and scroll position)
        tool.rebuildSidebar(newSidebar);
        
        // Redraw with new values
        tool.draw();
    }
}
```

#### What rebuildSidebar() Does

1. Preserves scroll position
2. Destroys old sidebar components
3. Clears sidebar DOM
4. Builds new sidebar from config
5. Restores scroll position
6. Re-collects values from new components
7. Triggers `onInit` with new values

#### What It Preserves

- Canvas state (no redraw needed)
- Canvas zoom/pan state
- Module-level state variables
- Event listeners on canvas

#### When to Use

| Use Case | Example |
|----------|---------|
| **Multi-page tools** | Algorithm categories, different tool modes |
| **Dynamic parameter sets** | Parameters depend on selected algorithm/mode |
| **Conditional controls** | Show advanced controls only when enabled |

---

### Tab Control Methods

Control tabs programmatically from code:

```javascript
// Set active category tab
tool.setActiveCategory('page2');

// Set active canvas mode tab
tool.setActiveCanvasTab('about');
```

---

### Complete Multi-Feature Example

Combining category tabs, canvas mode tabs, and dynamic sidebar:

```javascript
var TOOL_CONFIG = {
    title: 'ALGORITHMS TEST LAB',
    
    // Top-level category tabs
    categoryTabs: {
        categories: [
            { id: 'noise', title: 'NOISE, SAMPLING, PATTERNS' },
            { id: 'edges', title: 'EDGES, FILTERING, SEGMENTATION' },
            { id: 'curves', title: 'CURVES, DISTANCE, TOPOLOGY' }
        ],
        activeCategory: 'noise',
        enableScrollbar: true,
        onCategoryChange: function(categoryId, tool) {
            state.currentCategory = categoryId;
            tool.rebuildSidebar(buildSidebarForCategory(categoryId));
            tool.draw();
        }
    },
    
    // Canvas area tabs
    canvasModeTabs: {
        tabs: [
            { id: 'output', label: 'OUTPUT' },
            { id: 'about', label: 'ABOUT' }
        ],
        defaultTab: 'output',
        onTabChange: function(tabId, tool) {
            if (tabId === 'output') {
                showCanvas(tool);
            } else {
                showAboutPanel(tool);
            }
        }
    },
    
    sidebar: buildSidebarForCategory('noise'),
    canvas: { width: 720, height: 720 },
    
    onInit: function(values) {
        // Initial setup
    },
    
    onUpdate: function(key, value, allValues) {
        // Handle changes
    },
    
    onDraw: function(ctx, canvas, values) {
        // Render based on current category
        if (state.currentCategory === 'noise') {
            drawNoiseVisualization(ctx, canvas, values);
        } else if (state.currentCategory === 'edges') {
            drawEdgeDetection(ctx, canvas, values);
        }
        // ... etc
    }
};
```

---

### Advanced Features: When to Use

| Feature | Use When | Don't Use When |
|---------|----------|----------------|
| **Category Tabs** | Tool has 3+ distinct pages/modes with different sidebars | Tool has simple mode switching |
| **Canvas Mode Tabs** | Need OUTPUT/ABOUT or other view modes above canvas | Single canvas view is sufficient |
| **rebuildSidebar()** | Sidebar content depends on user selection | Sidebar is static |

**Rule of thumb:**
- 1-2 tabs → Use regular sidebar tabs
- 3-4 major sections → Consider category tabs
- Need documentation view → Use canvas mode tabs
- Dynamic parameters → Use rebuildSidebar()

---

## Step 7: Callbacks

### onInit(values)

Called once after mount. Use for:
- Initialize state
- Wire button handlers

```javascript
onInit: function(values) {
    var self = this;
    
    // Wire button handlers
    var resetBtn = this.getComponent('reset');
    if (resetBtn && resetBtn.element) {
        resetBtn.element.addEventListener('click', function() {
            self._reset();
        });
    }
    
    // Initialize state
    this._initializeState(values);
},
```

### onUpdate(key, value, allValues)

Called when any input changes. Use for:
- React to specific changes
- Canvas resize
- File uploads

```javascript
onUpdate: function(key, value, allValues) {
    // Canvas resize
    if (key === 'canvasWidth' || key === 'canvasHeight') {
        this.resizeCanvas(allValues.canvasWidth, allValues.canvasHeight);
    }
    
    // File upload
    if (key === 'imageFile' && value) {
        this._handleFileUpload(value);
    }
    
    // Parameter changes auto-trigger draw()
},
```

### onDraw(ctx, canvas, values)

Called after init and after any change. Use for:
- Canvas rendering

```javascript
onDraw: function(ctx, canvas, values) {
    var w = canvas.width;
    var h = canvas.height;
    
    // 1. Clear
    ctx.fillStyle = values.bgColor || '#000000';
    ctx.fillRect(0, 0, w, h);
    
    // 2. Draw
    ctx.strokeStyle = values.strokeColor || '#FFFFFF';
    ctx.lineWidth = values.lineWidth || 2;
    
    // ... drawing code ...
},
```

---

## Step 8: Animation Pattern

**MANDATORY: Use AnimationFoundation. NO raw requestAnimationFrame/setInterval.**

### AnimationFoundation Classes

| Class | Use Case |
|-------|----------|
| `AnimationLoop` | Continuous animation at target FPS |
| `FrameSequencer` | Step through discrete frames |
| `ThrottledLoop` | Low-frequency updates (physics, time) |
| `IntervalAnimator` | Fixed interval updates |

### Basic Animation (AnimationLoop)

```javascript
// Module-level state
var animator = null;

var TOOL_CONFIG = {
    sidebar: [
        ['ANIMATION', [
            ['Playback', [
                ['button', 'Play/Pause', null, { key: 'playPause' }],
                ['slider', 'FPS', 1, 60, 1, { value: 30, key: 'fps' }],
            ]],
        ]],
    ],
    
    onInit: function(values) {
        var self = this;
        
        // Initialize animator
        if (window.AnimationFoundation && window.AnimationFoundation.AnimationLoop) {
            animator = new window.AnimationFoundation.AnimationLoop({
                fps: values.fps || 30,
                onFrame: function() {
                    self.draw();
                }
            });
        }
        
        // Wire play button
        var playBtn = this.getComponent('playPause');
        if (playBtn && playBtn.element) {
            playBtn.element.addEventListener('click', function() {
                if (animator) {
                    if (animator.isRunning && !animator.isPaused) {
                        animator.pause();
                    } else if (animator.isPaused) {
                        animator.resume();
                    } else {
                        animator.start();
                    }
                }
            });
        }
    },
    
    onUpdate: function(key, value, allValues) {
        if (key === 'fps' && animator) {
            animator.fps = value;
        }
    },
};

// In destroy():
ToolName.prototype.destroy = function() {
    if (animator) {
        animator.destroy();
        animator = null;
    }
    // ... rest of cleanup
};
```

### Frame Sequence Animation (FrameSequencer)

For stepping through discrete frames (like pixel-tiler):

```javascript
var animator = null;
var currentFrame = 0;
var totalFrames = 24;

onInit: function(values) {
    var self = this;
    
    if (window.AnimationFoundation && window.AnimationFoundation.FrameSequencer) {
        animator = new window.AnimationFoundation.FrameSequencer({
            fps: values.fps || 24,
            onFrame: function() {
                currentFrame = (currentFrame + 1) % totalFrames;
                self.draw();
            }
        });
    }
},
```

### Throttled Updates (ThrottledLoop)

For infrequent updates like physics simulation:

```javascript
if (window.AnimationFoundation && window.AnimationFoundation.ThrottledLoop) {
    animator = new window.AnimationFoundation.ThrottledLoop({
        intervalMs: 1000, // Update once per second
        onFrame: function() {
            self._updateSimulation();
            self.draw();
        }
    });
}
```

---

## Step 9: File Upload Pattern

```javascript
['Source', [
    ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
]],

// In onUpdate:
onUpdate: function(key, value, allValues) {
    if (key === 'imageFile' && value) {
        var self = this;
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                self._sourceImage = img;
                self.draw();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(value);
    }
},
```

---

## Step 10: Export Pattern

```javascript
['Export', [
    ['button', 'Download PNG', null, { key: 'exportPng' }],
    ['button', 'Download SVG', null, { key: 'exportSvg' }],
]],

// In onInit, wire buttons:
onInit: function(values) {
    var self = this;
    
    var pngBtn = this.getComponent('exportPng');
    if (pngBtn && pngBtn.element) {
        pngBtn.element.addEventListener('click', function() {
            var canvas = self.getCanvas();
            var a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = 'export.png';
            a.click();
        });
    }
},
```

---

## Step 11: Canvas Sizing

```javascript
['Canvas', [
    ['slider', 'Width', 14, 2048, 1, { value: 420, key: 'canvasWidth' }],
    ['slider', 'Height', 14, 2048, 1, { value: 420, key: 'canvasHeight' }],
    ['radio', 'Display', ['Fit', 'Actual'], { key: 'displayMode', selectedValue: 'Fit' }],
    ['toggle', 'Scaling', ['Crisp Pixels'], { key: 'crispPixels', selectedValues: ['Crisp Pixels'] }],
]],

// In onUpdate:
onUpdate: function(key, value, allValues) {
    if (key === 'canvasWidth' || key === 'canvasHeight' || 
        key === 'displayMode' || key === 'crispPixels') {
        
        var crisp = (allValues.crispPixels || []).indexOf('Crisp Pixels') >= 0;
        
        this.resizeCanvas(
            allValues.canvasWidth || 420,
            allValues.canvasHeight || 420,
            {
                displayMode: (allValues.displayMode || 'Fit').toLowerCase(),
                snapToF: crisp
            }
        );
    }
},
```

### Crisp Pixels

When enabled, uses integer scale factors (1:1, 1:2, 1:3, 1:4...) for pixel-perfect rendering:
- 840×840 in 500px container → 1:2 scale → 420×420 display
- Uses `image-rendering: pixelated`

---

## Step 12: Audio Pattern

**MANDATORY: Clean up AudioContext in destroy().**

### Basic Audio Setup

```javascript
// Module-level state
var audioAnimator = null;  // For visualization loop

// Instance state in constructor:
this.audioContext = null;
this.oscillator = null;
this.gainNode = null;
this.analyser = null;
this.isPlaying = false;
```

### Audio Controls Config

```javascript
['CONTROLS', [
    ['Audio', [
        ['button', 'Play', null, { key: 'audioPlay' }],
        ['button', 'Stop', null, { key: 'audioStop' }],
        ['slider', 'Volume', 0, 100, 1, { value: 50, key: 'volume' }],
        ['slider', 'Frequency', 20, 2000, 1, { value: 440, key: 'frequency' }],
        ['dropdown', 'Waveform', ['sine', 'square', 'sawtooth', 'triangle'], { key: 'waveform', value: 'sine' }],
    ]],
    ['Output', [
        ['progress', 'Level', 0, { key: 'audioLevel' }],
    ]],
]],
```

### Initialize AudioContext

```javascript
onInit: function(values) {
    var self = this;
    
    // Wire play button
    var playBtn = this.getComponent('audioPlay');
    if (playBtn && playBtn.element) {
        playBtn.element.addEventListener('click', function() {
            self._startAudio();
        });
    }
    
    // Wire stop button
    var stopBtn = this.getComponent('audioStop');
    if (stopBtn && stopBtn.element) {
        stopBtn.element.addEventListener('click', function() {
            self._stopAudio();
        });
    }
},
```

### Start Audio

```javascript
ToolName.prototype._startAudio = function() {
    var values = this.tool.getValues();
    
    // Create AudioContext on first use (requires user gesture)
    if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create nodes
        this.gainNode = this.audioContext.createGain();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        
        // Connect: oscillator → gain → analyser → destination
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }
    
    // Resume if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }
    
    // Create oscillator (must create new one each time)
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = values.waveform || 'sine';
    this.oscillator.frequency.value = values.frequency || 440;
    this.oscillator.connect(this.gainNode);
    
    // Set volume
    this.gainNode.gain.value = (values.volume || 50) / 100 * 0.5;
    
    // Start
    this.oscillator.start();
    this.isPlaying = true;
    
    // Start visualization using AnimationFoundation
    this._startVisualization();
};
```

### Visualization Loop (with AnimationFoundation)

```javascript
ToolName.prototype._startVisualization = function() {
    var self = this;
    
    if (!window.AnimationFoundation || !window.AnimationFoundation.AnimationLoop) {
        console.warn('AnimationFoundation not available');
        return;
    }
    
    // Stop existing visualizer
    if (audioAnimator) {
        audioAnimator.destroy();
    }
    
    var dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    audioAnimator = new window.AnimationFoundation.AnimationLoop({
        fps: 30,  // 30fps is sufficient for visualization
        onFrame: function() {
            if (!self.isPlaying) {
                audioAnimator.stop();
                return;
            }
            
            // Get frequency data
            self.analyser.getByteFrequencyData(dataArray);
            
            // Calculate average level
            var sum = 0;
            for (var i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            var level = (sum / dataArray.length / 255) * 100;
            
            // Update level display
            var levelComp = self.tool.getComponent('audioLevel');
            if (levelComp && levelComp.setValue) {
                levelComp.setValue(level);
            }
            
            // Redraw canvas
            self.tool.draw();
        }
    });
    
    audioAnimator.start();
};
```

### Stop Audio

```javascript
ToolName.prototype._stopAudio = function() {
    if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
    }
    
    this.isPlaying = false;
    
    // Stop visualization
    if (audioAnimator) {
        audioAnimator.stop();
    }
};
```

### Update Audio Parameters

```javascript
onUpdate: function(key, value, allValues) {
    if (!this.isPlaying) return;
    
    switch (key) {
        case 'frequency':
            if (this.oscillator) {
                this.oscillator.frequency.value = value;
            }
            break;
        case 'waveform':
            if (this.oscillator) {
                this.oscillator.type = value;
            }
            break;
        case 'volume':
            if (this.gainNode) {
                this.gainNode.gain.value = value / 100 * 0.5;
            }
            break;
    }
},
```

### Clean Up (CRITICAL)

```javascript
ToolName.prototype.destroy = function() {
    // Stop audio
    this._stopAudio();
    
    // Destroy visualization animator
    if (audioAnimator) {
        audioAnimator.destroy();
        audioAnimator = null;
    }
    
    // Close AudioContext (REQUIRED)
    if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
    }
    
    // Destroy ToolBase
    if (this.tool) {
        this.tool.destroy();
        this.tool = null;
    }
};
```

### Draw Waveform

```javascript
onDraw: function(ctx, canvas, values) {
    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!this.analyser || !this.isPlaying) {
        // Show placeholder
        ctx.fillStyle = '#333333';
        ctx.font = '14px "Atkinson Hyperlegible", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Press "Play" to start', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Get frequency data
    var dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Draw bars
    var numBars = 64;
    var step = Math.floor(dataArray.length / numBars);
    var barWidth = (canvas.width - 20) / numBars;
    
    ctx.fillStyle = '#AAAAAA';
    for (var i = 0; i < numBars; i++) {
        var avg = 0;
        for (var j = 0; j < step; j++) {
            avg += dataArray[i * step + j];
        }
        avg /= step;
        
        var barHeight = (avg / 255) * (canvas.height - 40);
        ctx.fillRect(
            10 + i * barWidth,
            canvas.height - 20 - barHeight,
            barWidth - 2,
            barHeight
        );
    }
},
```

---

## Minimum Functionality

### All Visual Tools

```javascript
['CANVAS', [
    ['Canvas', [
        ['slider', 'Width', 14, 2048, 1, { value: 420, key: 'canvasWidth' }],
        ['slider', 'Height', 14, 2048, 1, { value: 420, key: 'canvasHeight' }],
    ]],
    ['Export', [
        ['button', 'Download PNG', null, { key: 'exportPng' }],
        ['button', 'Clear', null, { key: 'clear' }],
    ]],
]],
```

### All Animated Tools

```javascript
['ANIMATION', [
    ['Playback', [
        ['button', 'Play/Pause', null, { key: 'playPause' }],
        ['button', 'Reset', null, { key: 'reset' }],
        ['slider', 'FPS', 1, 60, 1, { value: 30, key: 'fps' }],
        ['toggle', 'Options', ['Loop'], { key: 'animOpts', selectedValues: ['Loop'] }],
    ]],
    ['Export', [
        ['button', 'Export Frame', null, { key: 'exportFrame' }],
        ['button', 'Export GIF', null, { key: 'exportGif' }],
    ]],
]],
```

### All Audio Tools

```javascript
['CONTROLS', [
    ['Audio', [
        ['button', 'Play', null, { key: 'audioPlay' }],
        ['button', 'Stop', null, { key: 'audioStop' }],
        ['slider', 'Volume', 0, 100, 1, { value: 50, key: 'volume' }],
    ]],
]],
```

---

## Algorithms Library Dependency

**CRITICAL:** Tools that use the algorithms library (`window.Algorithms`) must declare it as a dependency in `asset-loader.js`. Do NOT load the algorithms library in `index.html`.

### Registration in asset-loader.js

```javascript
// In toolRegistry object:
'my-algorithm-tool': {
    script: 'assets/js/tools/my-algorithm-tool.js',
    className: 'MyAlgorithmTool',
    dependencies: ['algorithms']  // ← REQUIRED for algorithm-using tools
},
```

### Accessing Algorithms in Tool

```javascript
// At module level (after TOOL_CONFIG):
var A = null;

// In constructor or render():
function MyTool(container, deps) {
    this.container = container;
    this.deps = deps || {};
    this.tool = null;
}

MyTool.prototype.render = function() {
    // Algorithms guaranteed loaded by AssetLoader dependency
    A = window.Algorithms;
    
    this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
    this.tool.mount(this.container);
    this.tool.draw();
    return this;
};
```

### Available Algorithm Modules

```javascript
A.Noise          // simplex2D, perlin2D, seedNoise
A.Sampling       // jitteredGrid, poissonDisk
A.SpatialIndex   // KDTree, findClosePointPairs  
A.MarchingSquares // marchingSquares, extractContours
A.ReactionDiffusion // step, CA_RULES
A.Advection      // advectParticleEuler, curlNoiseVelocityField
A.Patterns       // truchetTileGrid
A.Rendering      // renderBlobs, renderConcentricContours
A.MathUtils      // hashInt, seededRandom
```

**NEVER:** Import algorithms via ES module `import` in IIFE tools.
**NEVER:** Load algorithms library in `index.html` (violates lazy loading).
**ALWAYS:** Declare `dependencies: ['algorithms']` in asset-loader.js.

---

## Validation Checklist

Before committing:

### Structure
- [ ] File is IIFE wrapped `(function() { ... })();`
- [ ] `'use strict';` at top
- [ ] Config title is UPPERCASE
- [ ] Sidebar has 3 levels: TAB → BLOCK → COMPONENT
- [ ] All components have explicit `key` in options
- [ ] All keys are camelCase
- [ ] **Uses `this.tool.mount(this.container)` NOT `appendChild(render())`**
- [ ] **Has `render()` method on prototype (called by art_section/tools_section)**

### Section Placement
- [ ] Utility tools → `tools_section.js`
- [ ] Generative art → `art_section.js`

### Registration
- [ ] Tool registered in `asset-loader.js` `toolRegistry` with correct `dependencies`
- [ ] Tool registered in section file (`tools_section.js` or `art_section.js`)
- [ ] `window.ToolName = ToolName;` at end
- [ ] Console log confirms load: `console.log('✅ ToolName loaded');`
- [ ] **Algorithm-using tools have `dependencies: ['algorithms']` in asset-loader.js**

### Canvas
- [ ] Canvas size is F-multiple (14, 28, 42... 420, etc.)
- [ ] Minimum functionality included (see tool-standards.md)

### Animation (if applicable)
- [ ] **Uses `animation` config in TOOL_CONFIG (NOT manual export buttons)**
- [ ] Uses AnimationFoundation (NOT raw requestAnimationFrame)
- [ ] Animator created: `new AnimationFoundation.AnimationLoop({...})`

### Parameter Functionality
- [ ] **Every slider/control in sidebar actually affects output**
- [ ] **Every parameter in design spec is wired to a control**
- [ ] **onUpdate handler processes all keys defined in sidebar**
- [ ] **Tested: moving each slider produces visible change**
- [ ] Animator destroyed in `destroy()`: `animator.destroy()`
- [ ] No setInterval/setTimeout for animation (use AnimationFoundation)

### Algorithm Usage (MANDATORY)
- [ ] **NO inline algorithm implementations**
- [ ] All noise functions imported from `algorithms/noise/`
- [ ] All physics/simulation from `algorithms/physics/`
- [ ] All geometry from `algorithms/geometry/`
- [ ] Checked algorithms library BEFORE implementing

### Parameter Verification (MANDATORY)
- [ ] **Every slider tested: produces visible change**
- [ ] **Every dropdown option tested: each option works**
- [ ] **Every button tested: performs stated action**

### Spec Compliance (MANDATORY)

**Step 1: Parameter Coverage Verification**

Open design spec `01-design-spec.md` Section 2. For EACH parameter listed:

- [ ] **100% Parameter Coverage Check:**
  ```markdown
  Design Spec Section 2 lists {N} parameters:
  - [ ] Parameter 1: {name} → Found in sidebar at {tab}/{block} ✓
  - [ ] Parameter 2: {name} → Found in sidebar at {tab}/{block} ✓
  ...
  - [ ] Parameter N: {name} → Found in sidebar at {tab}/{block} ✓
  
  Sidebar config has {M} controls:
  - [ ] Control 1: {key} → Defined in Section 2 as {name} ✓
  - [ ] Control 2: {key} → Defined in Section 2 as {name} ✓
  ...
  - [ ] Control M: {key} → Defined in Section 2 as {name} ✓
  
  Result: N = M (bijection verified) ✓
  ```

- [ ] **No parameter appears in multiple blocks**
- [ ] **No parameters missing from spec**
- [ ] **No extra parameters not in spec**

**Step 2: Dropdown Options Verification**

For EACH dropdown in spec:

- [ ] **All dropdown options from spec implemented**
  ```markdown
  Spec says: Evolution Mode [None, RD, CA]
  Code has: ['None', 'Reaction-Diffusion', 'Cellular Automaton'] ✓
  ```

**Step 3: Export Verification**

- [ ] **All exports from spec working (not stubs)**
  - If spec says "Download PNG" → Verify PNG export works
  - If spec says "Export GIF" → Verify animation export works (via animation config)
  - NO stub implementations (no alert("Coming soon"))

**Step 4: Interaction Verification**

Open design spec Section 4. For EACH listed interaction:

- [ ] **All interactions from spec working**
  ```markdown
  Spec says: "Density changes → Regenerate point set"
  Code: onUpdate checks 'density' → calls buildPoints() ✓
  Test: Moved slider, saw point count change ✓
  ```

### Audio (if applicable)
- [ ] AudioContext created on user gesture (not in constructor)
- [ ] Uses AnimationFoundation for visualization loop
- [ ] Oscillators stopped and disconnected in stop
- [ ] AudioContext closed in `destroy()`: `audioContext.close()`
- [ ] Resume suspended context: `if (audioContext.state === 'suspended') audioContext.resume()`

### Cleanup
- [ ] `destroy()` cleans up AnimationFoundation animators
- [ ] `destroy()` closes AudioContext if used
- [ ] `destroy()` calls `this.tool.destroy()`

---

## ═══════════════════════════════════════════════════════════════════════════
## MANDATORY REQUIREMENTS — READ BEFORE IMPLEMENTING
## ═══════════════════════════════════════════════════════════════════════════

### RULE 1: Algorithm Library Usage (MANDATORY)

**NO inline algorithm implementations. MUST import from `algorithms/` library.**

```javascript
// ❌ FORBIDDEN — Fake inline implementation
function simplexNoise2D(x, y, seed) {
    return Math.sin(x * 2.1 + seed) * Math.cos(y * 2.3);  // THIS IS NOT SIMPLEX
}

// ✅ REQUIRED — Import from algorithms library
import { simplex2D } from '../shared/algorithms/noise/noise-functions.js';
// Then use: simplex2D(x, y)
```

**Available Algorithm Modules:**

| Category | Location | Functions |
|----------|----------|-----------|
| Noise | `algorithms/noise/` | `simplex2D`, `fbm`, `turbulence` |
| Physics | `algorithms/physics/` | `reactionDiffusion`, `waveSolver` |
| Geometry | `algorithms/geometry/` | `marchingSquares`, `delaunay` |
| Patterns | `algorithms/patterns/` | `truchet`, `halftone` |
| Distance | `algorithms/distance/` | `sdf`, `geodesic` |

**Before implementing ANY algorithm:**
1. Check if it exists in `assets/js/shared/algorithms/`
2. If exists → IMPORT IT
3. If missing → Add to library FIRST, then import

---

### RULE 2: Animation Export Config (MANDATORY for animated tools)

**All animated tools MUST use the `animation` config in TOOL_CONFIG.**

```javascript
// ❌ FORBIDDEN — Manual stub buttons
['button', 'Export GIF', null, { key: 'exportGif' }],
// with handler: alert('Coming soon')  // FAKE

// ✅ REQUIRED — Use animation config
var TOOL_CONFIG = {
    title: 'MY ANIMATED TOOL',
    
    animation: {
        type: 'loop',           // 'loop' | 'sequence' | 'infinite'
        loopFrames: 360,        // Total frames in one loop
        defaultFps: 60,         // Target framerate
        canPrerender: true      // Enable frame-by-frame export
    },
    
    canvas: {
        showControls: true      // Auto-injects CANVAS tab with export
    },
    
    // ... rest of config
};
```

**What `animation` config provides automatically:**
- Format selector (PNG/JPEG/WebM/MP4)
- FPS control with loop duration info
- Real video recording via MediaRecorder
- Frame-by-frame export capability
- Aspect ratio presets

**DO NOT manually create export buttons for animations.**

---

### RULE 3: Parameter Verification (MANDATORY)

**Every parameter MUST be tested to verify it produces visible change.**

After implementing, for EACH slider/dropdown/stepper:

| Parameter | Test | Expected Result | Actual Result | Pass? |
|-----------|------|-----------------|---------------|-------|
| Density | Move 0.1 → 2.0 | Point count changes | ??? | ✓/✗ |
| Noise Scale | Move 0.1 → 5.0 | Pattern scale changes | ??? | ✓/✗ |

**If a parameter doesn't produce visible change:**
1. The implementation is WRONG
2. Fix it before declaring done
3. Do not ship parameters that do nothing

---

### RULE 4: Spec Compliance (MANDATORY)

**Every item in design spec MUST be implemented. No exceptions.**

| Spec Says | Implementation Must |
|-----------|---------------------|
| Dropdown with options [A, B, C] | Dropdown with ALL three options working |
| Slider range 0–1 | Slider with EXACT range 0–1 |
| Export PNG | Working PNG export |
| Export GIF | Working animation export (via `animation` config) |

**Checklist after implementation:**

```markdown
## Spec Compliance Check

### Parameters (from design spec)
- [ ] Parameter 1: Implemented with correct range ✓
- [ ] Parameter 2: Implemented with correct range ✓
- [ ] Parameter 3: MISSING ← FIX THIS

### Exports (from design spec)
- [ ] PNG: Working ✓
- [ ] SVG: Exports FULL rendering (not just points) ✓
- [ ] GIF/Video: Via animation config ✓

### Interactions (from design spec)
- [ ] Click does X: Implemented ✓
- [ ] Slider Y changes Z: Tested and verified ✓
```

---

### RULE 5: No Stub Implementations

**If a feature is specified, it MUST work. No stubs, no "coming soon".**

```javascript
// ❌ FORBIDDEN
wireButton(this, 'exportSvg', function() {
    alert('SVG export coming soon');  // STUB — NOT ALLOWED
});

// ❌ FORBIDDEN
function exportSVG(tool) {
    // Only exports points, not full rendering
    for (var i = 0; i < points.length; i++) {
        svg += '<circle ...';  // INCOMPLETE
    }
}

// ✅ REQUIRED
function exportSVG(tool) {
    // Export COMPLETE rendering matching canvas output
    var mode = values.renderMode;
    switch (mode) {
        case 'Truchet': exportTruchetSVG(svg, values); break;
        case 'Blob': exportBlobSVG(svg, values); break;
        // ... ALL modes
    }
}
```

---

## Step 14: Mandatory Parameter Testing Protocol

**CRITICAL: Test EVERY parameter before declaring tool complete.**

### 14.1 Setup Testing Environment

Open browser console and inject test logging:

```javascript
// In browser console while tool is loaded
var originalOnUpdate = window.currentToolInstance.tool.onUpdate;
window.currentToolInstance.tool.onUpdate = function(key, val, allVals) {
    console.log(`%c[PARAM TEST] ${key} = ${val}`, 'color: #00ff00; font-weight: bold');
    return originalOnUpdate.call(this, key, val, allVals);
};
```

### 14.2 Test Each Parameter

For EACH slider/dropdown/stepper/toggle in sidebar:

| Test Step | Action | Expected Result | Pass Criteria |
|-----------|--------|----------------|---------------|
| 1. Console log | Move slider/change value | Console shows `[PARAM TEST] {key} = {value}` | onUpdate called |
| 2. Visual change | Move slider min → max | Canvas output changes visibly | User can see difference |
| 3. Edge cases | Set to min, max, default | No errors, reasonable output | No console errors |
| 4. Performance | Move slider rapidly | FPS stable, no lag | No significant slowdown |

### 14.3 Document Test Results

Create test results table in tool's documentation folder:

```markdown
## Parameter Test Results — {Tool Name}

Tested by: {Your Name}
Date: {Date}
Browser: {Chrome/Firefox/Safari} {Version}

| Parameter | Range | Visual Change | Performance | Edge Cases | Pass? |
|-----------|-------|---------------|-------------|------------|-------|
| Density | 0.1→2.0 | Point count changes from ~50 to ~500 | FPS 60→45 | Min OK, Max OK | ✓ |
| Grid Strength | 0→1 | Grid alignment smooth transition | FPS stable | Min OK, Max OK | ✓ |
| Cluster Scale | 0.1→5.0 | Noise filtering visible | FPS stable | Min OK, Max sparse | ⚠️ |
| ... | ... | ... | ... | ... | ... |

### Issues Found:
- Cluster Scale at 5.0 produces very sparse output (maybe increase range to 10.0?)
- Density at 2.0 drops FPS to 45 (acceptable but note in docs)

### Pass Rate: 20/22 parameters (91%)
```

### 14.4 Testing Checklist

- [ ] **All sliders tested: min → max produces visible change**
- [ ] **All dropdowns tested: each option works correctly**
- [ ] **All buttons tested: perform stated action**
- [ ] **All toggles tested: on/off states work**
- [ ] **Performance acceptable: no parameter causes FPS < 30**
- [ ] **Edge cases handled: min/max values don't crash**
- [ ] **Test results documented in tool folder**

### 14.5 Failure Protocol

If any parameter fails test:

1. **Identify root cause:**
   - Parameter not in onUpdate handler? → Add it
   - Parameter in onUpdate but no effect? → Check logic
   - Parameter causes crash? → Add bounds checking

2. **Fix the issue**

3. **Re-test**

4. **Update test results table**

**DO NOT ship tool with failing parameters.**

---

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| Sidebar not visible/broken | Used `appendChild(render())` instead of `mount()` | Use `this.tool.mount(this.container)` |
| `ToolBase not loaded` | Script order wrong | Load tool-base.js BEFORE your tool in index.html |
| `ComponentLibrary not available` | ComponentLibrary not loaded | Load component-library.js BEFORE tool-base.js |
| `CategoryTabsBar component not available` | CategoryTabsBar not in ComponentLibrary | Check component-library.js includes CategoryTabsBar |
| `CanvasModeTabs component not available` | CanvasModeTabs not in ComponentLibrary | Check component-library.js includes CanvasModeTabs |
| Category tabs too tall/wrong position | Missing F-based offset | ToolBase handles this automatically; check categoryTabs config |
| Sidebar doesn't rebuild | Wrong config format | Check `rebuildSidebar()` receives standard sidebar array |
| Canvas destroyed on category change | Using old rebuild pattern | Use `tool.rebuildSidebar()`, NOT destroy/recreate ToolBase |
| `ToolXxx class not found` | Missing window export | Add `window.ToolName = ToolName;` at end of IIFE |
| `Unknown component type: xxx` | Typo in type string | Check component type table above |
| `ComponentLibrary.Tool may not have: xxx` | Missing Tool component | Check ComponentLibrary has ToolNumericInput, ToolDropdown, etc. |
| `Cannot read property 'render'` | Bad component config | Check component format matches table exactly |
| `components.forEach is not a function` | Missing BLOCK level | Wrap components in `['BlockTitle', [...]]` inside tabs |
| `values.xxx is undefined` | Key mismatch | Use EXACT key from config (camelCase, case-sensitive) |
| `Cannot read property 'element' of undefined` | Wrong key in getComponent | Check the key matches exactly |
| Canvas not updating | Forgot to call draw() | draw() auto-called after onUpdate; check onDraw exists |
| Animation not stopping | Using raw RAF | Use AnimationFoundation; call animator.destroy() in destroy() |
| `AnimationFoundation is undefined` | Not loaded | Load animation-foundation.js; check window.AnimationFoundation |
| Audio not playing | Autoplay policy | Create AudioContext on user click; call `audioContext.resume()` |
| Audio keeps playing | Missing cleanup | Call `oscillator.stop()` and `audioContext.close()` in destroy() |
| `audioContext.close is not a function` | Already closed | Check `if (this.audioContext)` before closing |

---

## Full Example

See: `assets/js/tools/tool-test-ui.js` and `assets/js/tools/utilities/algorithms-test-lab.js`

### tool-test-ui.js
Reference implementation demonstrating:
- Multi-mode tool (Animation, Image, SVG, Graphs, Audio)
- All component types
- Button wiring
- File uploads
- Canvas sizing
- AnimationFoundation loops (animation + audio visualization)
- AudioContext audio playback with FM synthesis
- Export functionality
- Proper cleanup on mode switch and destroy

### algorithms-test-lab.js
Advanced implementation demonstrating:
- **Category tabs** for 6 algorithm pages
- **Canvas mode tabs** (OUTPUT/ABOUT)
- **Dynamic sidebar rebuilding** via `rebuildSidebar()`
- Selectable/collapsible block headers
- Complex multi-page tool architecture
- Integration with algorithms library
- About panel documentation system

---

End of Tool Build Guide v2.3
