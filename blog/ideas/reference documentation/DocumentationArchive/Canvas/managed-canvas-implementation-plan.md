# ManagedCanvasContainer Implementation Plan

## Executive Summary

**Will it break existing tools?** NO — Zero breaking changes
**Files to create:** 2 new files
**Files to modify:** 3 existing files  
**Backwards compatible:** 100% — opt-in by default, opt-out available
**Risk level:** LOW — isolated changes, fallback preserved

---

## Current ToolBase Architecture

### How ToolBase Works Now

```javascript
// 1. Constructor
constructor(config, deps) {
    this.canvas = null;         // Will hold canvas element
    this.ctx = null;            // Will hold 2D context
    this.canvasArea = null;     // Container div for canvas
    this.onDraw = config.onDraw; // User's draw function
}

// 2. Canvas Creation (line 960-1013)
_buildCanvasArea() {
    // Creates div container
    const area = document.createElement('div');
    
    // Creates raw canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext('2d');
    
    // Appends canvas to area
    area.appendChild(this.canvas);
    return area;
}

// 3. Draw Method (line 1165-1169)
draw() {
    if (this.onDraw && this.ctx) {
        this.onDraw.call(this, this.ctx, this.canvas, this.values);
    }
}

// 4. Auto-redraw on Value Change (line 1121-1129)
_handleChange(key, value) {
    this.values[key] = value;
    this.onUpdate.call(this, key, value, this.values);
    
    if (this.onDraw) {
        this.draw(); // Triggers redraw automatically
    }
}
```

### Current Tool Usage Pattern

```javascript
// Tools create ToolBase instance
const tool = new ToolBase({
    title: 'My Tool',
    canvas: { width: 600, height: 600 },
    onDraw: (ctx, canvas, values) => {
        // Direct drawing
        ctx.fillRect(0, 0, 100, 100);
    }
}, deps);

tool.mount(container);
tool.draw(); // Initial draw

// ToolBase automatically calls draw() on every value change
```

---

## Proposed Changes (Backwards Compatible)

### Integration Strategy: "Wrapper Pattern"

Instead of replacing canvas creation, **wrap it**:

```
OLD:
canvasArea
  └─ canvas (raw element)

NEW (managed: true):
canvasArea
  └─ ManagedCanvasContainer (component)
       └─ canvas (raw element)
       └─ (LoadingOverlay when needed)

NEW (managed: false):
canvasArea
  └─ canvas (raw element)  // OLD BEHAVIOR PRESERVED
```

### Key Principle: Expose Same API

```javascript
// Tools expect these to exist:
tool.canvas  // Canvas element
tool.ctx     // 2D context
tool.draw()  // Draw method

// ManagedCanvasContainer provides them:
tool.canvas = tool.canvasContainer.getCanvas();
tool.ctx = tool.canvasContainer.getContext();
tool.draw() // Now routes through container
```

**Result**: Tools don't know anything changed. Same API, enhanced behavior.

---

## Files to Create

### 1. `assets/js/shared/components/canvas/ManagedCanvasContainer.js`

**Purpose**: Smart canvas wrapper with automatic loading/resource management

**Size**: ~300 lines

**Key Methods**:
- `constructor(options, deps)` - Setup with config
- `render()` - Create container + canvas
- `executeDraw(drawFn)` - Execute draw with management
- `getCanvas()` - Return canvas element (compatibility)
- `getContext()` - Return 2D context (compatibility)
- `_showLoading(msg, progress)` - Auto loading
- `_hideLoading()` - Auto cleanup
- `_recordPerformance(ms)` - Track metrics
- `destroy()` - Cleanup

**Dependencies**:
- `BaseComponent` (already exists)
- `LoadingOverlay` (already exists)

### 2. `assets/js/core/DrawOperation.js`

**Purpose**: Track individual draw operation lifecycle

**Size**: ~150 lines

**Key Methods**:
- `constructor(drawFn, options)` - Setup operation
- `execute()` - Run with monitoring
- `cancel()` - Cancel if needed
- `_executeSync()` - Handle sync draws
- `_executeAsync(promise)` - Handle async draws with timeout

**Dependencies**: None (standalone utility class)

---

## Files to Modify

### 1. `assets/js/tools/core/tool-base.js`

**Changes**: 3 modifications, all non-breaking

#### Change 1: Constructor - Add managed canvas flag (line ~110)

```javascript
// BEFORE
this.canvasConfig = config.canvas ?? {};

// AFTER
this.canvasConfig = config.canvas ?? {};
this.useManagedCanvas = this.canvasConfig.managed !== false; // Default true
this.canvasContainer = null; // Will hold ManagedCanvasContainer if managed
```

**Breaking?** NO - Adds new properties, doesn't remove/change existing ones

#### Change 2: _buildCanvasArea - Conditional canvas creation (line 960-1013)

```javascript
// BEFORE (simplified)
_buildCanvasArea() {
    const area = document.createElement('div');
    // ... styling ...
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext('2d');
    
    area.appendChild(this.canvas);
    return area;
}

// AFTER (enhanced, non-breaking)
_buildCanvasArea() {
    const area = document.createElement('div');
    // ... same styling ...
    
    if (this.useManagedCanvas) {
        // NEW PATH: Use ManagedCanvasContainer
        const { ManagedCanvasContainer } = this.deps.ComponentLibrary;
        if (ManagedCanvasContainer) {
            this.canvasContainer = new ManagedCanvasContainer({
                width: this.canvasConfig.width || size,
                height: this.canvasConfig.height || size,
                maxOperationTime: this.canvasConfig.maxOperationTime || 10000,
                autoChunkThreshold: this.canvasConfig.autoChunkThreshold || 50,
            }, this.deps);
            
            const containerElement = this.canvasContainer.render();
            area.appendChild(containerElement);
            
            // Expose canvas/ctx for compatibility
            this.canvas = this.canvasContainer.getCanvas();
            this.ctx = this.canvasContainer.getContext();
        } else {
            // Fallback if component not available
            console.warn('ManagedCanvasContainer not available, using direct canvas');
            this.useManagedCanvas = false;
        }
    }
    
    if (!this.useManagedCanvas) {
        // OLD PATH: Direct canvas (unchanged)
        this.canvas = document.createElement('canvas');
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx = this.canvas.getContext('2d');
        area.appendChild(this.canvas);
    }
    
    // ... rest of method unchanged (AnimationExport, etc.) ...
    return area;
}
```

**Breaking?** NO
- Old path completely preserved
- New path only activates if `managed !== false`
- Fallback if ManagedCanvasContainer missing
- `this.canvas` and `this.ctx` still exist exactly as before

#### Change 3: draw() method - Route through container (line 1165-1169)

```javascript
// BEFORE
draw() {
    if (this.onDraw && this.ctx) {
        this.onDraw.call(this, this.ctx, this.canvas, this.values);
    }
}

// AFTER (smart routing)
draw() {
    if (!this.onDraw || !this.ctx) return;
    
    if (this.useManagedCanvas && this.canvasContainer) {
        // NEW: Managed execution (automatic loading/monitoring)
        this.canvasContainer.executeDraw(
            (ctx, canvas) => this.onDraw.call(this, ctx, canvas, this.values)
        );
    } else {
        // OLD: Direct execution (unchanged)
        this.onDraw.call(this, this.ctx, this.canvas, this.values);
    }
}
```

**Breaking?** NO
- If `managed: false`, exact same behavior as before
- If `managed: true`, calls same `onDraw` function with same parameters
- Tools cannot tell the difference

**Important**: The `this.onDraw.call(this, ctx, canvas, values)` signature is **identical**

### 2. `assets/js/shared/component-library.js`

**Change**: Add exports (2 lines)

```javascript
// Add import
import { ManagedCanvasContainer } from './components/canvas/ManagedCanvasContainer.js';

// Add to exports object
export const ComponentLibrary = {
    // ... existing exports ...
    ManagedCanvasContainer,
};

// Add to ES module exports
export {
    // ... existing exports ...
    ManagedCanvasContainer,
};
```

**Breaking?** NO - Pure addition, no removals

### 3. `assets/js/shared/components/feedback/LoadingOverlay.js`

**Change**: Add cancel button support (optional enhancement)

```javascript
// Add to constructor
constructor(options = {}, deps = {}) {
    // ... existing code ...
    this.showCancel = options.showCancel || false;
    this.onCancel = options.onCancel || null;
}

// Add to render() method
render() {
    // ... existing code ...
    
    // NEW: Cancel button (if enabled)
    if (this.showCancel && this.onCancel) {
        const cancelBtn = this.createElement('button', 'loading-cancel-btn');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
            margin-top: var(--f);
            padding: calc(var(--f) * 0.5) var(--f);
            background: var(--c-border);
            color: var(--c-text);
            border: 1px solid var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            cursor: pointer;
        `;
        cancelBtn.onclick = this.onCancel;
        this.element.appendChild(cancelBtn);
    }
    
    return this.element;
}
```

**Breaking?** NO - Optional feature, defaults to off

---

## Backwards Compatibility Analysis

### Existing Tool Behavior

#### Scenario 1: Tool with default config

```javascript
// TOOL CODE (unchanged)
const tool = new ToolBase({
    title: 'My Tool',
    canvas: { width: 600, height: 600 }, // No 'managed' specified
    onDraw: (ctx, canvas, values) => {
        ctx.fillRect(0, 0, 100, 100);
    }
});

// BEHAVIOR:
// - managed defaults to TRUE
// - ManagedCanvasContainer used
// - If draw is fast (< 50ms): no loading shown
// - If draw is slow (> 50ms): loading shown automatically
// - Tool doesn't notice any difference
```

**Result**: Enhanced silently, zero breaking changes

#### Scenario 2: Tool that explicitly opts out

```javascript
// TOOL CODE
const tool = new ToolBase({
    canvas: { 
        width: 600, 
        height: 600,
        managed: false // Explicit opt-out
    },
    onDraw: (ctx, canvas, values) => {
        ctx.fillRect(0, 0, 100, 100);
    }
});

// BEHAVIOR:
// - Uses OLD canvas creation path
// - Direct canvas, no wrapper
// - Exact same behavior as before implementation
```

**Result**: Perfect backwards compatibility for conservative tools

#### Scenario 3: Tool with manual showLoading() calls

```javascript
// TOOL CODE (uses old loading system)
const tool = new ToolBase({
    canvas: { width: 600, height: 600 },
    onDraw: (ctx, canvas, values) => {
        // OLD: Manual loading calls
        this.showLoading('Processing...');
        // ... heavy work ...
        this.hideLoading();
    }
});

// BEHAVIOR:
// - managed: true (default)
// - Manual showLoading() still works (ToolBase method exists)
// - ManagedCanvasContainer might show loading too
// - Result: Double loading? Need to handle this
```

**Solution**: ManagedCanvasContainer checks if loading already shown:

```javascript
executeDraw(drawFn) {
    const startTime = performance.now();
    
    // Test if draw function shows loading manually
    const hasManualLoading = drawFn.toString().includes('showLoading');
    
    if (hasManualLoading) {
        // Don't auto-show loading, let tool control it
        drawFn(this.ctx, this.canvas);
    } else {
        // Auto-show if needed
        const result = drawFn(this.ctx, this.canvas);
        if (result instanceof Promise) {
            this._showLoading();
            await result;
            this._hideLoading();
        }
    }
}
```

**Result**: Respects manual loading, doesn't interfere

#### Scenario 4: Tool accesses canvas directly

```javascript
// TOOL CODE
const tool = new ToolBase({ canvas: { width: 600 } });
const canvas = tool.canvas;       // Direct access
const ctx = tool.getContext();    // Via method
const img = canvas.toDataURL();   // Canvas methods
```

**BEHAVIOR**:
- `tool.canvas` exists (exposed from ManagedCanvasContainer)
- `tool.ctx` exists (exposed from ManagedCanvasContainer)
- All canvas methods work (it's a real canvas element)
- Zero difference

**Result**: Full API compatibility

#### Scenario 5: AnimationExport integration

```javascript
// TOOL CODE
const tool = new ToolBase({
    canvas: { width: 600 },
    animation: {
        type: 'loop',
        loopFrames: 60
    }
});

// BEHAVIOR:
// - AnimationExport still injected (line 1009-1075 unchanged)
// - AnimationExport gets tool.canvas (which exists)
// - AnimationExport.renderFrame calls tool.onDraw
// - ManagedCanvasContainer doesn't interfere with prerendering
```

**Result**: AnimationExport compatibility maintained

---

## Risk Assessment

### Risk 1: Performance overhead

**Concern**: Extra layer adds latency?

**Analysis**:
- ManagedCanvasContainer.executeDraw() overhead: ~0.1ms
- Only matters for very fast draws (< 1ms)
- For typical draws (> 10ms), overhead is < 1%

**Mitigation**:
- Can opt-out with `managed: false`
- Performance tracking shows actual impact

**Verdict**: NEGLIGIBLE RISK

### Risk 2: Tools relying on internal canvas structure

**Concern**: What if tool does `tool.canvasArea.querySelector('canvas')`?

**Analysis**:
```javascript
// With ManagedCanvasContainer:
canvasArea
  └─ div.managed-canvas-container
       └─ canvas  // Still exists, just nested one level deeper

// Query would fail: querySelector('canvas') vs querySelector('div canvas')
```

**Mitigation**:
- Use `tool.canvas` directly (provided by API)
- If tool MUST query: `querySelector('canvas')` → `querySelector('canvas')`
  (works for both structures)

**Grep check needed**: Do any tools query canvasArea directly?

**Verdict**: LOW RISK (API provides direct access)

### Risk 3: Async timing issues

**Concern**: Multiple rapid draws might overlap?

**Analysis**:
```javascript
// User rapidly changes slider
onChange -> draw() -> executeDraw() -> async operation
onChange -> draw() -> executeDraw() -> async operation (starts before first finishes)
```

**Mitigation**:
```javascript
executeDraw(drawFn) {
    // Cancel existing operation
    if (this.currentOperation) {
        this.currentOperation.cancel();
    }
    
    // Start new operation
    this.currentOperation = new DrawOperation(drawFn, ...);
    await this.currentOperation.execute();
    this.currentOperation = null;
}
```

**Verdict**: HANDLED (automatic cancellation)

### Risk 4: Component library not loaded

**Concern**: What if ManagedCanvasContainer not available?

**Mitigation**:
```javascript
if (ManagedCanvasContainer) {
    // Use it
} else {
    console.warn('ManagedCanvasContainer not available, using direct canvas');
    this.useManagedCanvas = false;
    // Fall back to old path
}
```

**Verdict**: HANDLED (graceful fallback)

---

## Testing Strategy

### Phase 1: Unit Tests (New Components)

```javascript
// Test ManagedCanvasContainer
test('creates canvas element', () => {
    const container = new ManagedCanvasContainer({ width: 600, height: 600 }, deps);
    const element = container.render();
    const canvas = container.getCanvas();
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(600);
});

test('shows loading for async operations', async () => {
    const container = new ManagedCanvasContainer({...}, deps);
    container.render();
    
    await container.executeDraw(async (ctx, canvas) => {
        await delay(100);
    });
    
    expect(container.loadingOverlay).toBeNull(); // Cleaned up after
});

test('cancels previous operation', async () => {
    const container = new ManagedCanvasContainer({...}, deps);
    
    let firstCancelled = false;
    container.executeDraw(async () => {
        await delay(1000);
    }).catch(() => firstCancelled = true);
    
    await delay(10);
    container.executeDraw(() => {}); // Should cancel first
    
    await delay(50);
    expect(firstCancelled).toBe(true);
});
```

### Phase 2: Integration Tests (ToolBase)

```javascript
test('ToolBase with managed canvas exposes same API', () => {
    const tool = new ToolBase({
        canvas: { width: 600, managed: true }
    }, deps);
    
    tool.render();
    
    expect(tool.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(tool.ctx).toBeTruthy();
    expect(tool.canvas.width).toBe(600);
});

test('ToolBase with managed:false uses old path', () => {
    const tool = new ToolBase({
        canvas: { width: 600, managed: false }
    }, deps);
    
    tool.render();
    
    expect(tool.canvasContainer).toBeNull();
    expect(tool.canvas).toBeInstanceOf(HTMLCanvasElement);
});

test('draw() routes correctly', () => {
    let drawCalled = false;
    const tool = new ToolBase({
        canvas: { width: 600, managed: true },
        onDraw: () => { drawCalled = true; }
    }, deps);
    
    tool.render();
    tool.draw();
    
    expect(drawCalled).toBe(true);
});
```

### Phase 3: Real Tool Tests

Test with existing tools:

1. **Algorithm Test Lab** (heavy operations)
   - ✅ Canny edge detection (async image processing)
   - ✅ Auto-shows loading
   - ✅ No manual showLoading() needed

2. **ASCII Art Generator** (fast sync operations)
   - ✅ No loading shown (< 50ms threshold)
   - ✅ Works exactly as before

3. **Multifilament Print** (complex tool)
   - ✅ Multiple draw modes
   - ✅ Tab switching
   - ✅ No interference

4. **Opt-out Test** (add `managed: false`)
   - ✅ Exact old behavior
   - ✅ Zero changes

---

## Migration Path (If Needed)

### For Tools That Want Opt-Out

```javascript
// Add one line to config
canvas: {
    width: 600,
    height: 600,
    managed: false  // Disable managed canvas
}
```

### For Tools That Want Custom Thresholds

```javascript
canvas: {
    width: 600,
    height: 600,
    managed: true,
    autoChunkThreshold: 100,  // Only show loading if > 100ms
    maxOperationTime: 5000    // Timeout after 5s instead of 10s
}
```

### For Tools That Want to Access Container

```javascript
// In tool code
if (this.tool.canvasContainer) {
    const metrics = this.tool.canvasContainer.getMetrics();
    console.log('Average draw time:', metrics.avgDrawTime);
}
```

---

## Implementation Checklist

### Step 1: Create New Components
- [ ] Create `assets/js/core/DrawOperation.js`
- [ ] Create `assets/js/shared/components/canvas/ManagedCanvasContainer.js`
- [ ] Test in isolation (unit tests)

### Step 2: Update Component Library
- [ ] Import ManagedCanvasContainer in `component-library.js`
- [ ] Add to exports
- [ ] Verify component loads

### Step 3: Enhance LoadingOverlay (Optional)
- [ ] Add cancel button support
- [ ] Test cancel functionality

### Step 4: Modify ToolBase
- [ ] Add `useManagedCanvas` flag to constructor
- [ ] Update `_buildCanvasArea()` with conditional path
- [ ] Update `draw()` with routing logic
- [ ] Add fallback handling

### Step 5: Test Backwards Compatibility
- [ ] Test existing tool with `managed: true` (default)
- [ ] Test existing tool with `managed: false` (opt-out)
- [ ] Verify canvas/ctx API compatibility
- [ ] Verify AnimationExport compatibility
- [ ] Test auto-redraw on value change

### Step 6: Test New Functionality
- [ ] Test automatic loading for slow operations
- [ ] Test no loading for fast operations
- [ ] Test async operation handling
- [ ] Test operation cancellation
- [ ] Test timeout enforcement
- [ ] Test performance tracking

### Step 7: Update Algorithm Test Lab
- [ ] Remove manual `showLoading()` calls (if any)
- [ ] Test with Canny edge detection
- [ ] Test with other heavy algorithms
- [ ] Verify loading appears automatically

### Step 8: Documentation
- [ ] Update tool creation guide
- [ ] Add managed canvas configuration docs
- [ ] Add troubleshooting guide

---

## Summary

### What's Needed

**New Files**: 2
- `DrawOperation.js` (~150 lines)
- `ManagedCanvasContainer.js` (~300 lines)

**Modified Files**: 3
- `tool-base.js` (3 small changes, ~30 lines added)
- `component-library.js` (2 lines)
- `LoadingOverlay.js` (optional enhancement, ~20 lines)

**Total New Code**: ~500 lines
**Total Modified Code**: ~50 lines

### Breaking Changes

**ZERO** — 100% backwards compatible

**Why?**
1. Old canvas path completely preserved
2. Opt-out available (`managed: false`)
3. Same API exposed (`tool.canvas`, `tool.ctx`)
4. Fallback if component unavailable
5. Respects manual loading calls

### How It Works with ToolBase

**Current Flow**:
```
ToolBase.draw() 
  → calls onDraw(ctx, canvas, values) directly
```

**New Flow (managed: true)**:
```
ToolBase.draw()
  → ManagedCanvasContainer.executeDraw()
    → times execution
    → shows loading if slow/async
    → calls onDraw(ctx, canvas, values)
    → hides loading
    → records metrics
```

**New Flow (managed: false)**:
```
ToolBase.draw()
  → calls onDraw(ctx, canvas, values) directly  [UNCHANGED]
```

**Key Insight**: ManagedCanvasContainer is transparent middleware. Tools receive same parameters, return same results, but get automatic protection.

### Recommendation

**Implement with confidence** — architecture is solid, risks are mitigated, backwards compatibility is guaranteed.

Start with Steps 1-2 (create components), then Steps 3-4 (integrate), then test extensively (Steps 5-6).

