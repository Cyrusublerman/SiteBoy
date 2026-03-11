# P5ToVideoTool Fix Plan

## Overview
Refactor P5ToVideoTool to comply with SiteBoy architecture while preserving approved CCapture.js exception.

---

## Phase 1: Infrastructure

### 1.1 Create IframeSandbox Component
**File:** `assets/js/shared/components/output/IframeSandbox.js`

Purpose: Reusable sandboxed iframe for untrusted code execution.

```javascript
export class IframeSandbox extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ componentType: 'iframe-sandbox' }, deps);
        this.width = options.width ?? 500;
        this.height = options.height ?? 500;
        this.sandbox = options.sandbox ?? 'allow-scripts allow-same-origin';
        this.onMessage = options.onMessage ?? null;
        this.iframeEl = null;
        this._boundMessageHandler = null;
    }
    
    render() // Creates iframe with CSS class, sets up message listener
    setContent(html) // Writes HTML to iframe
    clear() // Removes iframe content
    show() / hide() // Visibility control
    destroy() // Removes message listener, cleans up iframe
}
```

Features:
- Proper BaseComponent lifecycle
- CSS class-based styling (no inline)
- Message handler cleanup in destroy()
- Configurable sandbox attributes

### 1.2 Add ToolBase `mode: 'none'`
**File:** `assets/js/tools/core/tool-base.js`

In `_buildCanvasArea()`, add check:
```javascript
if (this.canvasConfig.mode === 'none') {
    // Return empty area, tool will populate
    return area;
}
```

This prevents Canvas component creation when not needed.

### 1.3 Add CSS Classes
**File:** `assets/css/styles.css`

```css
/* P5 to Video Tool */
.p5-code-textarea {
    font-family: 'Atkinson Hyperlegible Mono', monospace;
    font-size: calc(var(--f) * 0.857);
    min-height: calc(var(--f) * 25);
    resize: vertical;
    tab-size: 2;
    white-space: pre;
}

.iframe-sandbox {
    border: 1px solid var(--c-border);
    background: var(--vga-white);
}

.iframe-sandbox--hidden {
    position: absolute;
    left: -9999px;
    visibility: hidden;
}

.iframe-sandbox--500 {
    width: calc(var(--f) * 35.7);
    height: calc(var(--f) * 35.7);
}
```

### 1.4 Export IframeSandbox
**File:** `assets/js/shared/component-library.js`

Add import and export:
```javascript
import { IframeSandbox } from './components/output/IframeSandbox.js';
// ... in exports ...
IframeSandbox,
```

---

## Phase 2: Refactor P5ToVideoTool

### 2.1 Class Declaration
```javascript
// Before
export class P5ToVideoTool {

// After
import { BaseComponent } from '../../shared/foundation.js';
export class P5ToVideoTool extends BaseComponent {
    constructor(container, deps = {}) {
        super({ componentType: 'p5-to-video' }, deps);
```

### 2.2 Use mode: 'none'
```javascript
// In render()
const tool = new ToolBase({
    title: 'P5.JS TO VIDEO',
    sidebar: [...],
    canvas: {
        mode: 'none',  // Don't create Canvas component
        width: 500,
        height: 500
    },
    // ...
});
```

### 2.3 Use IframeSandbox
```javascript
// Replace direct iframe creation
this.previewFrame = new IframeSandbox({
    width: 500,
    height: 500,
    sandbox: 'allow-scripts allow-same-origin allow-downloads',
    onMessage: (e) => this.handleMessage(e)
}, this.deps);

const frameEl = this.previewFrame.render();
this.tool.canvasArea.appendChild(frameEl);
this.componentInstances.push(this.previewFrame);
```

### 2.4 Use Shared Utilities
```javascript
// Imports
import { downloadBlob } from '../../shared/utils/download.js';
import { P5Canvas } from '../../shared/p5-integration.js';

// In loadExternalLibraries()
await P5Canvas.ensureP5Loaded();
// CCapture still needs custom loading (not in shared lib)

// In handleMessage() - remove downloadBlob method, use import
downloadBlob(blob, `animation.${ext}`);
```

### 2.5 Remove Inline Styles
Replace all `element.style.cssText` and `element.style.X` with CSS classes:

| Location | Current | Replace With |
|----------|---------|--------------|
| styleCodeTextarea() | 6 style properties | `.p5-code-textarea` class |
| runPreview() iframe | inline cssText | `.iframe-sandbox.iframe-sandbox--500` |
| startRecording() hidden | inline cssText | `.iframe-sandbox--hidden` |
| canvas show/hide | display: none/block | `.hidden` utility class |

### 2.6 Fix Memory Leak
```javascript
// In constructor
this.messageHandler = null;

// In startRecording()
if (this.messageHandler) {
    window.removeEventListener('message', this.messageHandler);
}
this.messageHandler = (e) => this.handleMessage(e);
window.addEventListener('message', this.messageHandler);

// In destroy()
if (this.messageHandler) {
    window.removeEventListener('message', this.messageHandler);
    this.messageHandler = null;
}
```

### 2.7 Replace console.log
```javascript
// Before
console.log('✅ P5ToVideoTool loaded (ES Module)');

// After
window.debugLog('INIT', '✅ P5ToVideoTool loaded (ES Module)');
```

---

## Phase 3: Page JSON

**File:** `assets/data/pages/tools/processors/p5-to-video.json`

```json
{
    "header": "P5 TO VIDEO",
    "subheader": "Convert P5.js sketches to video/GIF",
    "url": "/tools/processors/p5-to-video",
    "blocks": [
        {
            "type": "CanvasWidget",
            "props": {
                "toolId": "p5-to-video"
            }
        }
    ]
}
```

---

## Execution Order

| Step | Task | File(s) | Dependencies |
|------|------|---------|--------------|
| 1 | Create IframeSandbox | components/output/IframeSandbox.js | None |
| 2 | Export IframeSandbox | component-library.js | Step 1 |
| 3 | Add mode: 'none' | tool-base.js | None |
| 4 | Add CSS classes | styles.css | None |
| 5 | Refactor P5ToVideoTool | p5-to-video.js | Steps 1-4 |
| 6 | Create page JSON | p5-to-video.json | Step 5 |
| 7 | Test | Browser | All |

---

## Files Modified

| File | Changes |
|------|---------|
| `assets/js/shared/components/output/IframeSandbox.js` | NEW |
| `assets/js/shared/component-library.js` | Add IframeSandbox export |
| `assets/js/tools/core/tool-base.js` | Add mode: 'none' support |
| `assets/css/styles.css` | Add iframe/code-editor classes |
| `assets/js/tools/processors/p5-to-video.js` | Full refactor |
| `assets/data/pages/tools/processors/p5-to-video.json` | NEW |

---

## Verification Checklist

- [ ] IframeSandbox extends BaseComponent
- [ ] IframeSandbox properly cleans up message listeners
- [ ] ToolBase mode: 'none' skips canvas creation
- [ ] P5ToVideoTool extends BaseComponent
- [ ] No inline styles in P5ToVideoTool
- [ ] Uses downloadBlob from utils
- [ ] Uses P5Canvas.ensureP5Loaded()
- [ ] Message listener tracked and removed in destroy()
- [ ] Uses debugLog not console.log
- [ ] All CSS uses var(--f) and var(--c-*) / var(--vga-*)
- [ ] Page JSON loads tool correctly
- [ ] Preview runs P5 sketch
- [ ] Recording exports WebM/GIF/PNG
- [ ] Silent recording works
- [ ] Tool cleanup leaves no orphan listeners

---

## Exception Retained

Per `p5-to-video-exception-rationale.md`, the following remain:
- CCapture.js for frame capture (not AnimationExport)
- Iframe-based execution (not direct canvas)
- Custom recording logic (hijacks P5 draw loop)

These are architecturally necessary for this meta-tool.


