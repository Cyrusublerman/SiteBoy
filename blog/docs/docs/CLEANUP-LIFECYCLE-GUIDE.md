# Cleanup & Lifecycle Management Guide

**CRITICAL:** All sections and tools MUST implement proper cleanup to prevent resource leaks.

## The Problem

When navigating between pages, JavaScript doesn't automatically remove:
- Event listeners on `document` or `window`
- Intervals and timeouts
- Canvas elements appended to `body`
- Global state modifications
- Network requests

This causes:
- ❌ Mouse tracking persisting across pages
- ❌ Intervals running after page switch
- ❌ Memory leaks
- ❌ Multiple event handlers stacking up

## The Solution: Automatic Cleanup System

The app automatically calls `cleanup()` on sections when navigating away.

### How It Works

1. **App tracks current section** (`app.js` lines 181-182)
2. **Before switching pages**, app calls `cleanupCurrentSection()` (line 431)
3. **Section's `cleanup()` is invoked** if it exists (line 511)
4. **New section loads** with clean slate

```javascript
// In app.js
buildPageForRoute(sectionName, subsectionName) {
    // ⚠️ CRITICAL: Clean up previous section BEFORE clearing DOM
    this.cleanupCurrentSection();
    
    // Clear content container
    this.contentContainer.innerHTML = '';
    
    // ... load new section
}
```

## Required Pattern for Sections

### Section Structure

```javascript
const MySection = {
    currentContainer: null,
    componentInstances: [],
    
    handleRoute(subsection, container, callbacks) {
        this.currentContainer = container;
        this.cleanup(); // Always cleanup first
        
        // Render content...
    },
    
    /**
     * Cleanup section - REQUIRED
     * Called automatically when navigating away
     */
    cleanup() {
        // 1. Clear container
        if (this.currentContainer) {
            this.currentContainer.innerHTML = '';
        }
        
        // 2. Destroy tracked components
        ComponentLibrary.destroyTracked(this.componentInstances);
    }
};
```

### Tool Pattern (Important!)

Tools must also implement cleanup since they're instantiated:

```javascript
class MyTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.componentInstances = [];
        this.updateInterval = null;
        
        // Store bound handlers for cleanup
        this.boundHandlers = {
            mouseMove: null,
            click: null,
            // ...
        };
    }
    
    render() {
        this.destroy(); // Always cleanup first
        
        // Setup event listeners (MUST use bound handlers)
        this.boundHandlers.mouseMove = (e) => this.handleMouseMove(e);
        document.addEventListener('mousemove', this.boundHandlers.mouseMove);
        
        // Setup intervals
        this.updateInterval = setInterval(() => this.update(), 100);
    }
    
    /**
     * Cleanup tool - REQUIRED
     * Called when navigating away or re-rendering
     */
    destroy() {
        console.log('🧹 Cleaning up MyTool...');
        
        // 1. Remove ALL event listeners
        if (this.boundHandlers.mouseMove) {
            document.removeEventListener('mousemove', this.boundHandlers.mouseMove);
            this.boundHandlers.mouseMove = null;
        }
        
        // 2. Clear intervals/timeouts
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // 3. Remove DOM elements added to body
        if (this.canvasElement && this.canvasElement.parentNode) {
            this.canvasElement.parentNode.removeChild(this.canvasElement);
            this.canvasElement = null;
        }
        
        // 4. Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // 5. Destroy tracked components
        for (const instance of this.componentInstances) {
            if (instance?.destroy) instance.destroy();
        }
        this.componentInstances = [];
        
        console.log('✅ MyTool cleaned up');
    }
}
```

## Cleanup Checklist

When implementing any page/tool, ensure you clean up:

### Event Listeners
```javascript
// ❌ BAD - Can't be removed later
document.addEventListener('mousemove', (e) => this.handleMouse(e));

// ✅ GOOD - Store reference
this.boundMouseHandler = (e) => this.handleMouse(e);
document.addEventListener('mousemove', this.boundMouseHandler);
// Later: document.removeEventListener('mousemove', this.boundMouseHandler);
```

### Intervals & Timeouts
```javascript
// ❌ BAD - Lost reference
setInterval(() => this.update(), 100);

// ✅ GOOD - Store reference
this.updateInterval = setInterval(() => this.update(), 100);
// Later: clearInterval(this.updateInterval);
```

### Canvas Elements
```javascript
// ❌ BAD - Canvas stays in DOM
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

// ✅ GOOD - Track and remove
this.canvas = document.createElement('canvas');
document.body.appendChild(this.canvas);
// Later: this.canvas.parentNode.removeChild(this.canvas);
```

### Component Instances
```javascript
// ✅ ALWAYS track and destroy
this.componentInstances = [];

const button = new ComponentLibrary.Button({...});
this.componentInstances.push(button);

// Later in cleanup:
ComponentLibrary.destroyTracked(this.componentInstances);
```

## Testing Cleanup

To verify cleanup is working:

1. Navigate to your page
2. Open DevTools Console
3. Navigate away to another page
4. Look for: `🧹 Cleaning up section: YourSection`
5. Look for: `✅ YourSection cleanup completed`

If you see: `⚠️ Section YourSection has no cleanup() method` - **FIX IMMEDIATELY**

### Manual Testing

```javascript
// Before leaving page, check:
console.log('Event listeners:', getEventListeners(document));
console.log('Active intervals:', /* check your interval IDs */);

// After leaving page and returning:
// - Mouse tracking should not be active
// - Intervals should not be running
// - Canvas should not be visible
```

## Common Mistakes

### ❌ Forgetting to Store Handler References
```javascript
// BAD - arrow function creates new reference each time
document.addEventListener('click', () => this.handleClick());
// Can't remove it later!
```

### ❌ Not Cleaning Up Body-Appended Elements
```javascript
// BAD - heatmap canvas stays in DOM forever
document.body.appendChild(canvas);
```

### ❌ Not Clearing Intervals
```javascript
// BAD - interval keeps running after page switch
setInterval(() => this.updateStats(), 100);
```

### ❌ Not Calling Cleanup in render()
```javascript
// BAD - old listeners stack up
render() {
    // Missing: this.destroy();
    document.addEventListener('click', this.handler);
}
```

## Architecture Notes

### Why This Pattern?

1. **Centralized**: App manages lifecycle, not individual sections
2. **Automatic**: No need to remember to cleanup manually
3. **Debuggable**: Console logs show exactly when cleanup happens
4. **Safe**: Missing cleanup logs warning, not crash

### Section vs Tool Cleanup

- **Sections**: Called automatically by router via `cleanup()`
- **Tools**: Called by section's cleanup via `ComponentLibrary.destroyTracked()`
- **Both**: Must implement their cleanup method

### Execution Order

```
User navigates away
    ↓
app.handleRouteChange()
    ↓
app.buildPageForRoute()
    ↓
app.cleanupCurrentSection()  ← Calls section.cleanup()
    ↓
section.cleanup()
    ↓
ComponentLibrary.destroyTracked() ← Calls tool.destroy()
    ↓
tool.destroy() ← Removes listeners, intervals, etc.
    ↓
DOM cleared (innerHTML = '')
    ↓
New section loaded
```

## Quick Reference

### Minimum Required Cleanup

```javascript
// Section
cleanup() {
    if (this.currentContainer) this.currentContainer.innerHTML = '';
    ComponentLibrary.destroyTracked(this.componentInstances);
}

// Tool
destroy() {
    // Remove event listeners
    // Clear intervals
    // Remove body elements
    // Clear container
    // Destroy components
}
```

### Debugging Cleanup Issues

```javascript
// Add logging to your cleanup
cleanup() {
    console.log('🧹 MySection cleanup - listeners:', this.boundHandlers);
    console.log('🧹 MySection cleanup - intervals:', this.intervals);
    console.log('🧹 MySection cleanup - components:', this.componentInstances.length);
    
    // ... cleanup code ...
    
    console.log('✅ MySection cleanup complete');
}
```

---

**Remember:** If you add ANY of these, you MUST clean them up:
- Event listeners on `document` or `window`
- Intervals or timeouts
- Elements appended to `body`
- Global variables or state
- Network requests (abort controllers)

**The rule:** If you create it, you destroy it.

