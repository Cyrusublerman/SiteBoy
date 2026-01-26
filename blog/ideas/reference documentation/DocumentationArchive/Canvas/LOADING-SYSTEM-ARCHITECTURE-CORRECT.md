# Loading System - CORRECT Architecture (Component-Based)

## ═══════════════════════════════════════════════════════════════════════
## ARCHITECTURE (FIXED - No Inline DOM)
## ═══════════════════════════════════════════════════════════════════════

### **LoadingOverlay is a Proper Component**

**File**: `assets/js/shared/components/feedback/LoadingOverlay.js`  
**Type**: BaseComponent (follows all architectural rules)  
**Location**: ComponentLibrary.LoadingOverlay

### **Why Component, Not Inline DOM?**

**Rule**: NO inline DOM ever (document.createElement forbidden outside BaseComponent)

**Previous mistake**: I initially created inline DOM in ToolBase  
**Correct approach**: LoadingOverlay extends BaseComponent, uses createElement() method

## ═══════════════════════════════════════════════════════════════════════
## HOW IT WORKS
## ═══════════════════════════════════════════════════════════════════════

### **ToolBase Integration**

```javascript
// In ToolBase constructor:
this.loadingOverlayComponent = null;

// showLoading creates the component:
showLoading(message, progress) {
    const LoadingOverlay = this.deps.ComponentLibrary?.LoadingOverlay;
    this.loadingOverlayComponent = new LoadingOverlay({ message, progress }, this.deps);
    const overlayElement = this.loadingOverlayComponent.render();
    target.appendChild(overlayElement);
}

// hideLoading destroys it:
hideLoading() {
    if (this.loadingOverlayComponent) {
        this.loadingOverlayComponent.destroy();
        this.loadingOverlayComponent = null;
    }
}
```

### **Usage (Same API)**

```javascript
// In any ToolBase tool:
this.showLoading('Processing...', 0);
this.updateProgress(50, 'Halfway...');
this.hideLoading();
```

## ═══════════════════════════════════════════════════════════════════════
## EDITING THE LOADING COMPONENT
## ═══════════════════════════════════════════════════════════════════════

### **Single Source of Truth**
File: `assets/js/shared/components/feedback/LoadingOverlay.js`  
Class: LoadingOverlay extends BaseComponent

### **What You Can Edit**

#### **1. Spinner Appearance** (lines ~40-51)
```javascript
this.spinner = this.createElement('div', 'loading-spinner');
this.spinner.style.cssText = `
    width: calc(var(--f) * 4);              // Size
    height: calc(var(--f) * 4);
    border: calc(var(--f) * 0.25) solid var(--c-border);
    border-top-color: var(--c-text);        // Spinning color
    border-radius: 50%;
    animation: loading-spin 1s linear infinite;  // Speed
    margin-bottom: var(--f);
`;
```

#### **2. Background Overlay** (lines ~24-36)
```javascript
this.element = this.createElement('div', 'loading-overlay');
this.element.style.cssText = `
    background: rgba(0, 0, 0, 0.7);  // ← Change opacity
    // or: background: var(--c-bg);  // Solid
    // or: backdrop-filter: blur(5px);  // Blur
`;
```

#### **3. Message Styling** (lines ~54-64)
```javascript
this.messageEl.style.cssText = `
    color: var(--c-text);
    font-size: var(--f);              // Change size
    text-transform: uppercase;         // Add this
    letter-spacing: 0.1em;            // Add spacing
`;
```

#### **4. Progress Bar** (lines ~118-165)
```javascript
// In _createProgressBar():
container.style.cssText = `
    width: calc(var(--f) * 20);      // Width
    height: calc(var(--f) * 2);      // Height
    background: var(--c-border);      // Empty color
`;

this.progressFill.style.cssText = `
    background: var(--c-text);        // Fill color
    // or: repeating-linear-gradient(...);  // Stripes
`;
```

### **Advanced Customizations**

#### **Replace Spinner with ASCII Art**
```javascript
// In render(), replace spinner section:
this.spinner = this.createElement('pre');
this.spinner.textContent = `
  ████████
  ██    ██
  ████████
`;
this.spinner.style.cssText = `
    color: var(--c-text);
    font-family: 'Atkinson Hyperlegible', monospace;
    font-size: calc(var(--f) * 0.5);
    animation: loading-pulse 1s ease-in-out infinite;
`;

// Update _ensureSpinnerAnimation() to add pulse:
style.textContent = `
    @keyframes loading-spin { ... }
    @keyframes loading-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
```

#### **VGA-Themed Striped Progress Bar**
```javascript
this.progressFill.style.cssText = `
    background: repeating-linear-gradient(
        45deg,
        var(--vga-white),
        var(--vga-white) 10px,
        var(--vga-gray) 10px,
        var(--vga-gray) 20px
    );
    animation: progress-stripes 0.5s linear infinite;
`;

// Add to animation:
@keyframes progress-stripes {
    0% { background-position: 0 0; }
    100% { background-position: 28px 0; }
}
`;
```

## ═══════════════════════════════════════════════════════════════════════
## ARCHITECTURAL COMPLIANCE
## ═══════════════════════════════════════════════════════════════════════

### **✅ Follows All Rules**

1. ✅ **Extends BaseComponent** - Proper OOP inheritance
2. ✅ **Uses createElement()** - No document.createElement directly
3. ✅ **CSS Variables** - Uses var(--f), var(--c-text), etc.
4. ✅ **No Inline Styles in Tools** - All styles in component
5. ✅ **Proper Cleanup** - destroy() method removes all references
6. ✅ **ComponentLibrary Export** - Available system-wide

### **Component Lifecycle**

```javascript
// Create
const overlay = new LoadingOverlay({ message, progress }, deps);

// Render (creates DOM via BaseComponent.createElement)
const element = overlay.render();
parent.appendChild(element);

// Update
overlay.setProgress(50);
overlay.setMessage('New message');

// Destroy (proper cleanup)
overlay.destroy();
```

## ═══════════════════════════════════════════════════════════════════════
## USAGE PATTERNS
## ═══════════════════════════════════════════════════════════════════════

### **Pattern 1: Simple Loading**
```javascript
onDraw: async function(ctx, canvas, values) {
    this.showLoading('Rendering...');
    
    try {
        await someOperation();
    } finally {
        this.hideLoading();
    }
}
```

### **Pattern 2: With Progress**
```javascript
onDraw: async function(ctx, canvas, values) {
    this.showLoading('Processing...', 0);
    
    await processInChunks(1000, 50, (start, end) => {
        // Work
    }, (progress) => {
        this.updateProgress(progress * 100);
    });
    
    this.hideLoading();
}
```

### **Pattern 3: Direct Component Usage**
```javascript
// If you need more control, use component directly:
const overlay = new window.ComponentLibrary.LoadingOverlay({
    message: 'Custom loading...',
    progress: 25
}, { MF: window.MathematicalFoundation });

const element = overlay.render();
document.body.appendChild(element);

// Later:
overlay.setProgress(75, 'Almost done...');
overlay.destroy();
```

## ═══════════════════════════════════════════════════════════════════════
## FILE STRUCTURE
## ═══════════════════════════════════════════════════════════════════════

```
assets/js/
├── shared/
│   ├── components/
│   │   └── feedback/
│   │       └── LoadingOverlay.js          ← Component definition
│   ├── component-library.js               ← Exports LoadingOverlay
│   └── foundation.js                      ← BaseComponent
└── tools/
    └── core/
        └── tool-base.js                   ← Uses LoadingOverlay
```

## ═══════════════════════════════════════════════════════════════════════
## WHY THIS DESIGN?
## ═══════════════════════════════════════════════════════════════════════

### **Advantages**

1. ✅ **Architectural Compliance** - No inline DOM
2. ✅ **Reusable** - Can use outside ToolBase if needed
3. ✅ **Testable** - Standard component lifecycle
4. ✅ **Maintainable** - One component, standard patterns
5. ✅ **Flexible** - Can subclass for custom versions
6. ✅ **System-Wide** - All ToolBase tools get it
7. ✅ **Easy to Edit** - Single file, standard component structure

### **vs Inline DOM (Previous Mistake)**

| Approach | Compliant? | Reusable? | Maintainable? |
|----------|------------|-----------|---------------|
| Inline DOM | ❌ Violates rules | ❌ Tied to ToolBase | ⚠️ Harder to edit |
| Component | ✅ Follows rules | ✅ Yes | ✅ Standard patterns |

## ═══════════════════════════════════════════════════════════════════════
## QUICK EDIT GUIDE
## ═══════════════════════════════════════════════════════════════════════

### **When Inspired to Change It**

**Step 1**: Open `assets/js/shared/components/feedback/LoadingOverlay.js`

**Step 2**: Find section to edit:
- Spinner: render() method, lines ~40-51
- Message: render() method, lines ~54-64
- Progress bar: _createProgressBar() method, lines ~118-165
- Overlay background: render() method, lines ~24-36

**Step 3**: Modify using BaseComponent patterns:
- Use `this.createElement()` for new elements
- Use CSS variables (var(--f), var(--c-text))
- Use inline styles (component owns its styles)

**Step 4**: Test in any ToolBase tool

**Step 5**: All tools update instantly (system-wide change)

## ═══════════════════════════════════════════════════════════════════════
## SUMMARY
## ═══════════════════════════════════════════════════════════════════════

- **Type**: BaseComponent (NOT inline DOM)
- **Location**: `assets/js/shared/components/feedback/LoadingOverlay.js`
- **Exported**: ComponentLibrary.LoadingOverlay
- **Usage**: Via ToolBase methods (showLoading/hideLoading/updateProgress)
- **Scope**: All ToolBase tools
- **Editing**: Single component file, follows all architectural rules
- **Compliance**: ✅ No inline DOM, proper OOP, CSS variables, cleanup

**The loading system is now architecturally correct and easy to customize when inspiration strikes.**

