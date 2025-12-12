# Tool Build Guide — Precise Specification

**VERSION:** 1.0  
**REF:** `blog/docs/components/COMPONENT-REFERENCE.md`

---

## Scope

This guide specifies how to create tool pages using `ToolBase`.  
Follow EXACTLY. No interpretation. No deviation.

---

## File Structure

```
assets/js/tools/
├── tool-base.js           ← DO NOT MODIFY
├── tool-test-ui.js        ← Reference implementation
├── my-new-tool.js         ← Your new tool
```

---

## Step 1: Create Tool File

Create `assets/js/tools/{tool-name}.js`:

```javascript
(function() {
    'use strict';

    const TOOL_CONFIG = {
        title: 'TOOL NAME',  // UPPERCASE
        
        sidebar: [
            // TAB ARRAY: [TabName, [blocks]]
            ['CONTROLS', [
                // BLOCK ARRAY: [BlockTitle, [components]]
                ['Parameters', [
                    // COMPONENT ARRAY: [type, label, ...args, {options}]
                    ['slider', 'Value', 0, 100, 1, { value: 50 }],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },  // F-multiple (420 = 30F)
        
        onInit: function(values) {},
        onUpdate: function(key, value, allValues) {},
        onDraw: function(ctx, canvas, values) {},
    };

    function ToolName(container, deps) {
        this.container = container;
        this.deps = deps || {};
        this.tool = null;
        this.render();
    }
    
    ToolName.prototype.render = function() {
        try {
            this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
        } catch (error) {
            console.error('Tool error:', error);
            this.container.innerHTML = '<p>Error: ' + error.message + '</p>';
        }
    };
    
    ToolName.prototype.destroy = function() {
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    };

    window.ToolName = ToolName;
})();
```

---

## Step 2: Register Tool

### 2.1 Add to index.html

```html
<script src="assets/js/tools/my-new-tool.js"></script>
```

Add AFTER `tool-base.js`.

### 2.2 Add to tools_section.js

**In `pages` array:**
```javascript
pages: [
    // ... existing pages ...
    '#tools/my-new-tool',
],
```

**In `toolsSections`:**
```javascript
toolsSections: {
    // ... existing entries ...
    'MY NEW TOOL': '#tools/my-new-tool',
},
```

**In `allTools` (inside `getDropdownItems`):**
```javascript
allTools: {
    // ... existing entries ...
    'MY NEW TOOL': '#tools/my-new-tool',
},
```

**In `renderTool` switch:**
```javascript
case 'my-new-tool':
    this.renderMyNewTool();
    break;
```

**Add render method:**
```javascript
renderMyNewTool() {
    if (typeof window.MyNewTool === 'undefined') {
        console.error('MyNewTool class not found');
        return;
    }
    this.currentTool = new window.MyNewTool(
        window.App.contentContainer,
        { MF: window.MathematicalFoundation }
    );
}
```

---

## Step 3: Define Config

### SIDEBAR STRUCTURE

```javascript
sidebar: [
    [TAB_NAME, [              // String, Array
        [BLOCK_TITLE, [       // String, Array
            [COMPONENT],      // Array
            [COMPONENT],
        ]],
        [BLOCK_TITLE, [
            [COMPONENT],
        ]],
    ]],
    [TAB_NAME, [
        // more blocks...
    ]],
]
```

### COMPONENT FORMAT

```javascript
[TYPE, LABEL, ARG1, ARG2, ARG3, { OPTIONS }]
```

**EXACT FORMATS BY TYPE:**

| Type | Format |
|------|--------|
| `slider` | `['slider', label, min, max, step, {value, unit, precision, withNumber}]` |
| `number` | `['number', label, min, max, step, {value, precision, fieldWidth}]` |
| `stepper` | `['stepper', label, min, max, step, {value, withNumber}]` |
| `text` | `['text', label, defaultValue, {placeholder}]` |
| `textarea` | `['textarea', label, defaultValue, {placeholder, rows}]` |
| `dropdown` | `['dropdown', label, [options], {value}]` |
| `toggle` | `['toggle', label, [items], {selectedValues}]` |
| `radio` | `['radio', label, [items], {selectedValue}]` |
| `color` | `['color', label, hexValue, {showHex, swatches}]` |
| `file` | `['file', label, acceptMime, {buttonText, multiple}]` |
| `button` | `['button', buttonText, onClickFunction]` |
| `equation` | `['equation', templateString, {param: {value, min, max, step, precision}}]` |
| `label` | `['label', textContent, {variant, level}]` |
| `value` | `['value', displayValue, {label, unit}]` |
| `progress` | `['progress', label, value, {key, indeterminate}]` |

---

## Step 4: Handle Values

Values are stored by normalized key (lowercase, alphanumeric only).

```javascript
// Label: "Wave Amplitude" → key: "waveamplitude"
// Label: "Scale (%)" → key: "scale"
// Label: "X Position" → key: "xposition"
```

Access in callbacks:

```javascript
onUpdate: function(key, value, allValues) {
    console.log(key);           // "waveamplitude"
    console.log(value);         // 75
    console.log(allValues);     // {waveamplitude: 75, scale: 100, ...}
},

onDraw: function(ctx, canvas, values) {
    var amp = values.waveamplitude;
    var scale = values.scale;
    // Draw using values...
}
```

---

## Step 5: Canvas Drawing

```javascript
onDraw: function(ctx, canvas, values) {
    var w = canvas.width;
    var h = canvas.height;
    
    // 1. Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    
    // 2. Draw
    ctx.strokeStyle = values.wavecolor || '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // ... drawing code ...
    ctx.stroke();
}
```

---

## VALIDATION CHECKLIST

Before committing:

- [ ] File is IIFE wrapped
- [ ] Config title is UPPERCASE
- [ ] All component types are valid (see table)
- [ ] Canvas size is F-multiple
- [ ] Tool registered in index.html
- [ ] Tool registered in tools_section.js (4 places)
- [ ] window.ToolName exported
- [ ] destroy() calls tool.destroy()

---

## ERROR REFERENCE

| Error | Cause | Fix |
|-------|-------|-----|
| `ToolBase not loaded` | Script order | Load tool-base.js before your tool |
| `ToolXxx class not found` | Missing export | Add `window.ToolName = ToolName` |
| `Unknown component type` | Typo in type | Check component type table |
| `Cannot read property 'render'` | Bad component config | Check component format |

---

## FULL EXAMPLE

See: `assets/js/tools/tool-test-ui.js`

---

End of Tool Build Guide.
