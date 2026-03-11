# Algorithm Test Lab — Canvas Architecture Fix Plan

## Scope
Refactor `assets/js/tools/utilities/algorithms-test-lab.js` to comply with file ownership rules and properly use canvas infrastructure.

## Current Violations

| Type | Lines | Count |
|------|-------|-------|
| `requestAnimationFrame` | 223 | 1 |
| `cancelAnimationFrame` | 187 | 1 |
| `document.createElement` | 113, 3733, 3752, 3795, 3813, 3853 | 6 |
| `.innerHTML` | 933, 1438, 1444, 1456, 1462, 1467, 3711 | 7 |
| `.appendChild` | 1433, 1459, 3749, 3754, 3756, 3849, 3867, 3872 | 8 |
| Inline `style.cssText` | Multiple | ~15 |

---

## Phase 1: Animation Foundation Migration

### Target
Lines 174-224 — animation loop functions

### Current
```javascript
function startAnimation(tool) { ... requestAnimationFrame ... }
function stopAnimation() { ... cancelAnimationFrame ... }
function animationLoop(tool) { ... requestAnimationFrame ... }
```

### Replacement
```javascript
import AnimationFoundation from '../../core/animation-foundation.js';

// In AnimatedAlgorithm class or state
this.animator = new AnimationFoundation.IntervalAnimator({
    interval: 1000 / animationState.frameRate,
    onTick: () => {
        if (!animationState.instance?.step()) {
            this.animator.stop();
            return;
        }
        if (tool?.draw) tool.draw();
        if (animationState.instance.isComplete()) {
            this.animator.stop();
        }
    }
});
```

### Files Modified
- `algorithms-test-lab.js` — Replace animation functions

---

## Phase 2: ComponentLibrary Extensions

### 2A: CanvasModeTabs Component

**Purpose**: Replace inline tab creation (OUTPUT/ABOUT)

**Add to**: `component-library.js`

```javascript
class CanvasModeTabs extends BaseComponent {
    constructor(options, deps) {
        super(options, deps);
        this.tabs = options.tabs ?? []; // [{id, label}]
        this.activeTab = options.activeTab ?? this.tabs[0]?.id;
        this.onChange = options.onChange ?? null;
    }
    render() { /* Use createElement, CSS class 'canvas-mode-tabs' */ }
    setActive(tabId) { /* Update state, styles, callback */ }
}
```

**CSS** (add to `styles.css`):
```css
.canvas-mode-tabs { display: flex; width: 100%; border-bottom: 1px solid var(--c-border); }
.canvas-mode-tabs__btn { flex: 1; height: calc(var(--f) * 2); border: none; background: var(--c-bg); color: var(--c-text); font-family: var(--font-family); cursor: pointer; }
.canvas-mode-tabs__btn--active { background: var(--c-text); color: var(--c-bg); }
.canvas-mode-tabs__btn:not(:last-child) { border-right: 1px solid var(--c-border); }
```

### 2B: FlexContainer Component

**Purpose**: Replace inline wrapper divs

**Add to**: `component-library.js`

```javascript
class FlexContainer extends BaseComponent {
    constructor(options, deps) {
        super(options, deps);
        this.direction = options.direction ?? 'column';
        this.className = options.className ?? '';
    }
    render() { /* flex container with CSS class */ }
    appendChild(component) { /* Safe child addition */ }
}
```

### Files Modified
- `component-library.js` — Add CanvasModeTabs, FlexContainer
- `styles.css` — Add component classes

---

## Phase 3: Tool File Refactor

### 3A: Replace _actualRender()

**Before** (lines 3729-3780):
```javascript
this.wrapper = document.createElement('div');
this.wrapper.style.cssText = '...';
this.contentArea = document.createElement('div');
...
```

**After**:
```javascript
const { FlexContainer } = this.deps.ComponentLibrary;

this.wrapper = new FlexContainer({ 
    className: 'atl-wrapper',
    direction: 'column' 
}, this.deps);

this.contentArea = new FlexContainer({
    className: 'atl-content',
    direction: 'column'
}, this.deps);

this.wrapper.appendChild(this.categoryBar);
this.wrapper.appendChild(this.contentArea);
this.container.appendChild(this.wrapper.render());
```

### 3B: Replace _addCanvasTabs()

**Before** (lines 3785-3875):
```javascript
const tabsContainer = document.createElement('div');
tabs.forEach((tab) => {
    const btn = document.createElement('button');
    btn.style.cssText = '...';
    ...
});
```

**After**:
```javascript
const { CanvasModeTabs } = this.deps.ComponentLibrary;

this.canvasTabs = new CanvasModeTabs({
    tabs: [
        { id: 'output', label: 'OUTPUT' },
        { id: 'about', label: 'ABOUT' }
    ],
    activeTab: state.viewMode,
    onChange: (tabId) => this._setCanvasTab(tabId)
}, this.deps);

canvasArea.insertBefore(this.canvasTabs.render(), canvasArea.firstChild);
```

### 3C: Replace About Panel DOM

**Before** (lines 1430-1468):
```javascript
state.aboutPanel.innerHTML = '<div>...</div>';
state.aboutPanel.appendChild(renderedElement);
```

**After**:
```javascript
// Use existing MarkdownBody component, track in componentInstances
if (this.aboutContent) this.aboutContent.destroy();
this.aboutContent = new ComponentLibrary.MarkdownBody({ markdownText });
this.componentInstances.push(this.aboutContent);

// Clear and append via BaseComponent methods
state.aboutPanel.replaceChildren(this.aboutContent.render());
```

---

## Phase 4: Canvas Utils Integration

### 4A: Off-Screen Canvas Utility

**Add to** `canvas.js`:
```javascript
export function createOffscreenCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return { canvas, ctx: canvas.getContext('2d') };
}

export function imageToImageData(img, width, height) {
    const { canvas, ctx } = createOffscreenCanvas(width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
}
```

**Replace** (line 113):
```javascript
// Before
const tempCanvas = document.createElement('canvas');

// After
import { imageToImageData } from '../../shared/utils/canvas.js';
imageState.currentImageData = imageToImageData(img, canvas.width, canvas.height);
```

### 4B: BatchDrawer for Sampling Algorithms

**Opportunity**: `renderSampling()` draws many points individually.

**Before**:
```javascript
points.forEach(p => {
    ctx.fillStyle = VGA[idx];
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
});
```

**After**:
```javascript
import { BatchDrawer } from '../../shared/utils/canvas.js';

const batch = new BatchDrawer(ctx);
points.forEach(p => batch.addRect(p.x - 2, p.y - 2, 4, 4, VGA[idx]));
batch.flush();
```

---

## Phase 5: CSS Migration

### New Classes (add to `styles.css`)

```css
/* Algorithm Test Lab */
.atl-wrapper { width: 100%; height: 100%; display: flex; flex-direction: column; }
.atl-content { flex: 1; min-height: 0; overflow: hidden; }
.atl-canvas-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 0; overflow: hidden; }
.atl-loading { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--font-family); color: var(--vga-white); }
.atl-about-message { padding: calc(var(--f) * 2); font-family: var(--font-family); }
.atl-about-error { color: var(--vga-red); }
```

---

## Execution Order

| Step | Phase | Effort | Risk |
|------|-------|--------|------|
| 1 | P1: AnimationFoundation | Low | Low |
| 2 | P2A: CanvasModeTabs | Medium | Low |
| 3 | P4A: Off-screen canvas util | Low | Low |
| 4 | P5: CSS classes | Low | Low |
| 5 | P3A-C: Tool refactor | High | Medium |
| 6 | P4B: BatchDrawer | Low | Low |
| 7 | P2B: FlexContainer (if needed) | Medium | Low |

---

## Validation Checklist

After refactor:
- [ ] No `requestAnimationFrame`/`cancelAnimationFrame` in tool file
- [ ] No `document.createElement` in tool file
- [ ] No `.innerHTML` in tool file  
- [ ] No `.appendChild` in tool file (use component methods)
- [ ] No inline `style.cssText` (CSS classes only)
- [ ] All new components extend BaseComponent
- [ ] All components tracked in `componentInstances`
- [ ] All animators destroyed in `destroy()`
- [ ] Grep validation passes

### Grep Validation Commands
```bash
grep -n "requestAnimationFrame\|cancelAnimationFrame" algorithms-test-lab.js
grep -n "document\.createElement" algorithms-test-lab.js
grep -n "\.innerHTML" algorithms-test-lab.js
grep -n "style\.cssText" algorithms-test-lab.js
```

All should return 0 matches.

---

## Dependencies

| New Import | From |
|------------|------|
| AnimationFoundation | `../../core/animation-foundation.js` |
| imageToImageData | `../../shared/utils/canvas.js` |
| BatchDrawer | `../../shared/utils/canvas.js` |
| CanvasModeTabs | ComponentLibrary (after adding) |

---

## Notes

- ToolBase already uses `Canvas` component correctly; no changes needed there
- About panel loading state can use a simple Text component with 'Loading...'
- CategoryTabsBar already exists and is used correctly
- `console.log` statements should migrate to `window.debugLog('TOOLS', ...)`

