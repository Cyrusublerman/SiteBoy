# Loading System Architecture - Complete Guide

## ═══════════════════════════════════════════════════════════════════════
## ARCHITECTURE OVERVIEW
## ═══════════════════════════════════════════════════════════════════════

### **Question: How does the loading wheel work? Is it a component?**

**Answer**: The loading system is **built into ToolBase** (not a separate component). Every tool that uses ToolBase gets it automatically. It's pure inline DOM (no component layer) for maximum control and easy editing.

### **System-Wide by Design**
- **Location**: `assets/js/tools/core/tool-base.js` (lines 148-330)
- **Scope**: ALL tools using ToolBase framework
- **Tools that benefit**: Algorithm Test Lab, Media Manager, Color Quantizer, ASCII Art Generator, Multifilament Print, etc.

## ═══════════════════════════════════════════════════════════════════════
## HOW IT WORKS
## ═══════════════════════════════════════════════════════════════════════

### 1. **Three Simple Methods** (Added to ToolBase)

```javascript
// In any ToolBase tool's onDraw or callbacks:

this.showLoading('Processing 1000 iterations...', 0);
// Shows overlay with spinner + message
// Optional progress (0-100) adds progress bar

this.updateProgress(50, 'Halfway there...');
// Updates progress bar and message
// Can be called repeatedly during operation

this.hideLoading();
// Removes overlay completely
```

### 2. **Automatic Positioning**
The overlay positions itself over:
- **Canvas area** (if tool has canvas)
- **OR** entire tool element (if no canvas)

No manual positioning needed - it just works.

### 3. **Pure Inline DOM** (Not a Component)
Why inline DOM instead of BaseComponent?
- **Immediate control** - No component lifecycle delays
- **Easy to edit** - All code in one place (tool-base.js)
- **No dependencies** - Works even if ComponentLibrary fails
- **Performance** - No component overhead for simple overlay

## ═══════════════════════════════════════════════════════════════════════
## EDITING THE LOADING WHEEL
## ═══════════════════════════════════════════════════════════════════════

### **Single Source of Truth**
File: `assets/js/tools/core/tool-base.js`  
Methods: `showLoading()`, `updateProgress()`, `hideLoading()`  
Lines: 148-330

### **What You Can Easily Change**

#### **1. Spinner Appearance**
```javascript
// In showLoading(), find this section:
const spinner = document.createElement('div');
spinner.className = 'tool-loading-spinner';
spinner.style.cssText = `
    width: ${this.F * 4}px;              // Size
    height: ${this.F * 4}px;
    border: ${this.F / 4}px solid var(--c-border);  // Border width
    border-top-color: var(--c-text);     // Spinning color
    border-radius: 50%;
    animation: tool-spin 1s linear infinite;  // Speed
    margin-bottom: ${this.F}px;
`;
```

**Easy modifications**:
- **Size**: Change `F * 4` to `F * 6` for bigger spinner
- **Speed**: Change `1s` to `0.5s` for faster spin
- **Colors**: Change `var(--c-border)` and `var(--c-text)`
- **Style**: Could add glow, multiple borders, or replace with ASCII art

#### **2. Background Overlay**
```javascript
// In showLoading():
this.loadingOverlay.style.cssText = `
    background: rgba(0, 0, 0, 0.7);  // ← Change opacity here
    // or: background: var(--c-bg);  // Solid color
    // or: backdrop-filter: blur(5px);  // Blur effect
`;
```

#### **3. Message Styling**
```javascript
// In showLoading():
this.loadingMessage.style.cssText = `
    color: var(--c-text);
    font-family: 'Atkinson Hyperlegible', monospace;
    font-size: ${this.F}px;           // ← Change size
    text-transform: uppercase;         // ← Add this for all caps
    letter-spacing: 0.1em;            // ← Add this for spacing
`;
```

#### **4. Progress Bar Design**
```javascript
// In _createProgressBar():
const container = document.createElement('div');
container.style.cssText = `
    width: ${this.F * 20}px;          // Bar width
    height: ${this.F * 2}px;          // Bar height
    background: var(--c-border);      // Empty color
    border: 1px solid var(--c-text);  // Border
`;

const fill = document.createElement('div');
fill.style.cssText = `
    background: var(--c-text);        // Fill color
    // or: background: linear-gradient(...);  // Gradient
    // or: background: repeating-linear-gradient(...);  // Stripes
`;
```

### **Advanced Customizations**

#### **Replace Spinner with ASCII Art**
```javascript
// Instead of CSS spinner:
const spinner = document.createElement('pre');
spinner.textContent = `
  ████████
  ██    ██
  ██    ██
  ████████
`;
spinner.style.cssText = `
    color: var(--c-text);
    font-family: 'Atkinson Hyperlegible', monospace;
    font-size: ${this.F * 0.5}px;
    animation: tool-pulse 1s ease-in-out infinite;
`;
```

#### **Add Pulsing Effect**
```javascript
// In showLoading(), add to animation style:
style.textContent = `
    @keyframes tool-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    @keyframes tool-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.95); }
    }
`;
```

#### **VGA-Themed Loading Bar**
```javascript
// Striped progress bar:
const fill = document.createElement('div');
fill.style.cssText = `
    background: repeating-linear-gradient(
        45deg,
        var(--vga-white),
        var(--vga-white) 10px,
        var(--vga-gray) 10px,
        var(--vga-gray) 20px
    );
    animation: progress-stripes 0.5s linear infinite;
`;

// Add animation to move stripes:
style.textContent += `
    @keyframes progress-stripes {
        0% { background-position: 0 0; }
        100% { background-position: 28px 0; }
    }
`;
```

## ═══════════════════════════════════════════════════════════════════════
## USAGE PATTERNS
## ═══════════════════════════════════════════════════════════════════════

### **Pattern 1: Simple Loading (No Progress)**
```javascript
// For operations 100ms - 1s:
onDraw: async function(ctx, canvas, values) {
    this.showLoading('Rendering...');
    
    try {
        await someAsyncOperation();
    } finally {
        this.hideLoading();
    }
}
```

### **Pattern 2: With Progress Bar**
```javascript
// For operations > 1s:
onDraw: async function(ctx, canvas, values) {
    this.showLoading('Processing 1000 steps...', 0);
    
    await processInChunks(1000, 50, (start, end) => {
        for (let i = start; i < end; i++) {
            // Heavy work
        }
    }, (progress) => {
        this.updateProgress(progress * 100, `Step ${Math.floor(progress * 1000)}/1000`);
    });
    
    this.hideLoading();
}
```

### **Pattern 3: Conditional Loading**
```javascript
// Only show loading if operation might be slow:
onDraw: async function(ctx, canvas, values) {
    const dataSize = width * height;
    const { isHeavy } = estimateComputationCost(dataSize, 2);
    
    if (isHeavy) {
        this.showLoading('Processing large image...');
    }
    
    try {
        await processImage();
    } finally {
        if (isHeavy) this.hideLoading();
    }
}
```

## ═══════════════════════════════════════════════════════════════════════
## FUTURE ENHANCEMENTS
## ═══════════════════════════════════════════════════════════════════════

### Easy Additions (When Inspired)

**1. Cancellation Support**
```javascript
// Add cancel button:
const cancelBtn = document.createElement('button');
cancelBtn.textContent = 'Cancel (ESC)';
cancelBtn.onclick = () => this.cancelOperation();
overlay.appendChild(cancelBtn);
```

**2. Estimated Time Remaining**
```javascript
// Track start time and estimate:
const startTime = Date.now();
this.updateProgress(50, `50% - ~${estimatedTimeRemaining}s remaining`);
```

**3. Different Spinner Styles**
```javascript
// Dots instead of spinner:
const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let frame = 0;
setInterval(() => {
    spinner.textContent = dots[frame++ % dots.length];
}, 100);
```

**4. Multiple Simultaneous Operations**
```javascript
// Stack multiple progress bars:
this.showLoading('Processing...', 0);
this.addProgressBar('subTask1', 'Loading image...');
this.addProgressBar('subTask2', 'Applying filters...');
```

## ═══════════════════════════════════════════════════════════════════════
## WHY THIS DESIGN?
## ═══════════════════════════════════════════════════════════════════════

### **Advantages**
1. ✅ **System-Wide** - Every ToolBase tool gets it
2. ✅ **Zero Setup** - Just call showLoading/hideLoading
3. ✅ **Easy to Edit** - Single file, inline styles
4. ✅ **No Dependencies** - Pure DOM, no components
5. ✅ **Flexible** - Can customize per-tool if needed
6. ✅ **Performant** - Lightweight, no overhead
7. ✅ **Accessible** - Can add ARIA labels easily

### **vs Component Approach**
- **Component**: More reusable, but overkill for simple overlay
- **Inline**: Simpler, faster, easier to customize
- **Our Choice**: Inline (can componentize later if needed)

### **vs Global Spinner**
- **Global**: One spinner for entire app
- **ToolBase**: Per-tool spinner (multiple tools can show loading)
- **Our Choice**: Per-tool (more granular control)

## ═══════════════════════════════════════════════════════════════════════
## QUICK EDIT GUIDE
## ═══════════════════════════════════════════════════════════════════════

### When Inspired to Change It

**Step 1**: Open `assets/js/tools/core/tool-base.js`

**Step 2**: Find `showLoading()` method (around line 150)

**Step 3**: Modify the styles/structure:
- Spinner: Lines ~167-177
- Message: Lines ~180-190
- Overlay background: Line ~157
- Progress bar: `_createProgressBar()` method (line ~280)

**Step 4**: Test in any ToolBase tool:
```javascript
// Add to a tool's onDraw temporarily:
this.showLoading('Testing new style...', 50);
setTimeout(() => this.hideLoading(), 3000);
```

**Step 5**: All tools update instantly (system-wide change)

## ═══════════════════════════════════════════════════════════════════════
## SUMMARY
## ═══════════════════════════════════════════════════════════════════════

- **Location**: `assets/js/tools/core/tool-base.js`
- **Type**: Inline DOM (not component)
- **Scope**: All ToolBase tools (system-wide)
- **Editing**: Single file, easy CSS/DOM changes
- **When**: Edit when inspired, changes apply everywhere
- **Future**: Can add cancellation, time estimates, custom spinners

**The loading system is intentionally simple and centralized so you can easily customize it when inspiration strikes.**

