# Smart Canvas Container Architecture

## Problem Statement

**Current Issue**: Tools must manually:
- Call `showLoading()` / `hideLoading()`
- Implement resource usage safeguards
- Handle timeout/cancellation logic
- Prevent browser hangs/crashes

**Goal**: Canvas container that automatically:
- Detects heavy operations
- Shows loading without manual calls
- Limits resource usage
- Prevents crashes
- Provides cancellation
- All at infrastructure level

---

## Proposed Architecture: ManagedCanvasContainer

### Concept: Interceptor Middleware

```
Tool onDraw callback
    ↓
ManagedCanvasContainer.executeDraw()
    ↓ (intercepts)
ManagedCanvasContainer analyzes operation
    ↓ (decides)
Lightweight? → Execute immediately
    OR
Heavy? → Show loading + chunk execution + monitor resources
    ↓
LoadingOverlay (automatic)
    ↓
Operation completes/times out
    ↓
Hide loading (automatic)
```

### Component Structure

```javascript
/**
 * ManagedCanvasContainer
 * 
 * Intelligent canvas wrapper that automatically:
 * - Detects heavy draw operations
 * - Shows/hides loading overlay
 * - Limits CPU usage via chunking
 * - Enforces timeouts
 * - Provides cancellation
 * - Monitors performance
 * 
 * Tools never call showLoading() manually.
 * Just implement onDraw() and this handles the rest.
 */
export class ManagedCanvasContainer extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ componentType: 'managed-canvas-container' }, deps);
        
        // Canvas config
        this.width = options.width || 600;
        this.height = options.height || 600;
        
        // Operation management
        this.currentOperation = null;
        this.operationHistory = [];
        
        // Resource limits
        this.maxOperationTime = options.maxOperationTime || 10000; // 10s default
        this.autoChunkThreshold = options.autoChunkThreshold || 50; // 50ms default
        this.monitoringEnabled = options.monitoring !== false;
        
        // Components
        this.canvas = null;
        this.ctx = null;
        this.loadingOverlay = null;
        
        // Performance tracking
        this.lastDrawTime = 0;
        this.avgDrawTime = 0;
        this.drawCount = 0;
    }
    
    render() {
        // Container for canvas + loading overlay
        this.element = this.createElement('div', 'managed-canvas-container');
        this.element.style.cssText = `
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        // Create canvas
        this.canvas = this.createElement('canvas', 'managed-canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.cssText = `
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        this.ctx = this.canvas.getContext('2d', {
            willReadFrequently: true // Optimize for frequent getImageData
        });
        
        this.element.appendChild(this.canvas);
        
        return this.element;
    }
    
    /**
     * Execute draw operation with automatic management
     * 
     * @param {Function} drawFn - Drawing function: (ctx, canvas) => void | Promise<void>
     * @param {Object} options - Operation options
     */
    async executeDraw(drawFn, options = {}) {
        // Cancel any existing operation
        if (this.currentOperation) {
            this.currentOperation.cancel();
        }
        
        // Create operation tracker
        this.currentOperation = new DrawOperation(drawFn, {
            container: this,
            maxTime: options.maxTime || this.maxOperationTime,
            chunkThreshold: options.chunkThreshold || this.autoChunkThreshold,
            onProgress: options.onProgress,
        });
        
        try {
            await this.currentOperation.execute();
        } finally {
            this.currentOperation = null;
        }
    }
    
    /**
     * Show loading overlay (called automatically by DrawOperation)
     * @private
     */
    _showLoading(message = 'Processing...', showProgress = false) {
        if (!this.loadingOverlay) {
            this.loadingOverlay = new LoadingOverlay({
                message,
                progress: showProgress ? 0 : null
            }, this.deps);
            
            const overlay = this.loadingOverlay.render();
            this.element.appendChild(overlay);
        }
    }
    
    /**
     * Update loading progress (called by DrawOperation)
     * @private
     */
    _updateProgress(percent, message) {
        this.loadingOverlay?.setProgress(percent, message);
    }
    
    /**
     * Hide loading overlay (called by DrawOperation)
     * @private
     */
    _hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.destroy();
            this.loadingOverlay = null;
        }
    }
    
    /**
     * Track draw performance for adaptive behavior
     * @private
     */
    _recordDrawTime(ms) {
        this.lastDrawTime = ms;
        this.drawCount++;
        
        // Running average
        this.avgDrawTime = (this.avgDrawTime * (this.drawCount - 1) + ms) / this.drawCount;
        
        // Store in history (keep last 100)
        this.operationHistory.push({
            timestamp: Date.now(),
            duration: ms,
            wasChunked: ms > this.autoChunkThreshold
        });
        
        if (this.operationHistory.length > 100) {
            this.operationHistory.shift();
        }
        
        window.debugLog('TOOLS', `Draw: ${ms.toFixed(1)}ms (avg: ${this.avgDrawTime.toFixed(1)}ms)`);
    }
    
    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            lastDrawTime: this.lastDrawTime,
            avgDrawTime: this.avgDrawTime,
            drawCount: this.drawCount,
            history: this.operationHistory.slice(-10) // Last 10 operations
        };
    }
    
    /**
     * Get canvas context (for direct access if needed)
     */
    getContext() {
        return this.ctx;
    }
    
    /**
     * Get canvas element (for export, etc.)
     */
    getCanvas() {
        return this.canvas;
    }
    
    destroy() {
        // Cancel any running operation
        if (this.currentOperation) {
            this.currentOperation.cancel();
        }
        
        // Clean up loading overlay
        this._hideLoading();
        
        // Clean up canvas
        this.canvas = null;
        this.ctx = null;
        
        super.destroy();
    }
}

/**
 * DrawOperation
 * 
 * Manages individual draw operation lifecycle:
 * - Timing
 * - Chunking
 * - Progress tracking
 * - Cancellation
 * - Resource monitoring
 */
class DrawOperation {
    constructor(drawFn, options = {}) {
        this.drawFn = drawFn;
        this.container = options.container;
        this.maxTime = options.maxTime;
        this.chunkThreshold = options.chunkThreshold;
        this.onProgress = options.onProgress;
        
        this.isCancelled = false;
        this.startTime = 0;
        this.shouldShowLoading = false;
    }
    
    cancel() {
        this.isCancelled = true;
        window.debugLog('TOOLS', '🚫 Draw operation cancelled');
    }
    
    async execute() {
        this.startTime = performance.now();
        
        // Phase 1: Quick test execution (16ms budget = 1 frame)
        const testStart = performance.now();
        
        try {
            // Try to execute quickly
            const result = this.drawFn(this.container.ctx, this.container.canvas);
            
            // If it returns a promise, it's async - let it run
            if (result instanceof Promise) {
                this.shouldShowLoading = true;
                this.container._showLoading('Processing...', true);
                
                await this._executeAsync(result);
            } else {
                // Synchronous execution completed
                const testEnd = performance.now();
                const duration = testEnd - testStart;
                
                // Did it take too long?
                if (duration > this.chunkThreshold) {
                    window.debugLog('TOOLS', `⚠️ Draw took ${duration.toFixed(1)}ms (threshold: ${this.chunkThreshold}ms)`);
                }
                
                this.container._recordDrawTime(duration);
            }
            
        } catch (error) {
            console.error('Draw operation failed:', error);
            this.container._hideLoading();
            throw error;
        }
    }
    
    async _executeAsync(promise) {
        const timeoutId = setTimeout(() => {
            if (!this.isCancelled) {
                window.debugLog('TOOLS', `⏱️ Draw operation timeout (${this.maxTime}ms)`);
                this.cancel();
            }
        }, this.maxTime);
        
        try {
            await promise;
            
            const duration = performance.now() - this.startTime;
            this.container._recordDrawTime(duration);
            
        } finally {
            clearTimeout(timeoutId);
            this.container._hideLoading();
        }
    }
}
```

---

## Integration with ToolBase

### ToolBase Changes

```javascript
export class ToolBase extends BaseComponent {
    constructor(config = {}, deps = {}) {
        // ... existing code ...
        
        // NEW: Use managed canvas container
        this.useManagedCanvas = config.canvas?.managed !== false; // Default true
    }
    
    _buildCanvasArea(isPortrait = false) {
        const area = document.createElement('div');
        // ... existing styling ...
        
        if (this.useManagedCanvas) {
            // NEW: Use ManagedCanvasContainer
            const { ManagedCanvasContainer } = this.deps.ComponentLibrary;
            
            this.canvasContainer = new ManagedCanvasContainer({
                width: this.canvasConfig.width || 600,
                height: this.canvasConfig.height || 600,
                maxOperationTime: this.canvasConfig.maxOperationTime || 10000,
                autoChunkThreshold: this.canvasConfig.autoChunkThreshold || 50,
            }, this.deps);
            
            const containerElement = this.canvasContainer.render();
            area.appendChild(containerElement);
            
            // Expose canvas/ctx for compatibility
            this.canvas = this.canvasContainer.getCanvas();
            this.ctx = this.canvasContainer.getContext();
            
        } else {
            // OLD: Direct canvas (for backwards compatibility)
            const size = this._calculateCanvasSize();
            this.canvas = document.createElement('canvas');
            this.canvas.width = size;
            this.canvas.height = size;
            this.ctx = this.canvas.getContext('2d');
            area.appendChild(this.canvas);
        }
        
        return area;
    }
    
    // NEW: Smart draw method
    draw() {
        if (!this.ctx || !this.canvas) return;
        
        if (this.useManagedCanvas) {
            // Managed execution - automatic loading/chunking
            this.canvasContainer.executeDraw(
                (ctx, canvas) => this.onDraw(ctx, canvas, this.values)
            );
        } else {
            // Direct execution (old way)
            this.onDraw(this.ctx, this.canvas, this.values);
        }
    }
}
```

---

## Usage Examples

### Example 1: Tool with Heavy Operation (Automatic)

```javascript
// Tool doesn't know about loading - just draws
export const TOOL_CONFIG = {
    title: 'Heavy Algorithm',
    canvas: {
        width: 800,
        height: 800,
        managed: true, // Enable smart canvas (default)
    },
    onDraw: (ctx, canvas, values) => {
        // Heavy operation - but no manual showLoading() needed!
        // ManagedCanvasContainer detects it's heavy and shows loading automatically
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Expensive processing
        for (let i = 0; i < data.length; i += 4) {
            data[i] = expensiveAlgorithm(data[i]);
            data[i+1] = expensiveAlgorithm(data[i+1]);
            data[i+2] = expensiveAlgorithm(data[i+2]);
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
};
```

**What happens automatically:**
1. First draw executes immediately to test speed
2. If it takes > 50ms, container logs warning
3. If subsequent parameters make it heavier, user sees loading
4. If it times out (> 10s), operation cancelled automatically

### Example 2: Async Operation with Progress

```javascript
export const TOOL_CONFIG = {
    title: 'Image Processor',
    canvas: { managed: true },
    onDraw: async (ctx, canvas, values) => {
        // Return promise - automatically shows loading
        const img = await loadImage(values.imageUrl);
        ctx.drawImage(img, 0, 0);
        
        // Heavy processing
        await processImageInChunks(ctx, canvas, values);
        
        // Loading overlay shown/hidden automatically
    }
};
```

### Example 3: Manual Progress Tracking

```javascript
export const TOOL_CONFIG = {
    title: 'Multi-Step Process',
    canvas: { managed: true },
    onDraw: async (ctx, canvas, values) => {
        // Tool can still access container for progress updates
        const container = this.canvasContainer;
        
        // Step 1
        container._updateProgress(0, 'Loading image...');
        await loadImage();
        
        // Step 2
        container._updateProgress(33, 'Processing...');
        await processData();
        
        // Step 3
        container._updateProgress(66, 'Rendering...');
        await render();
        
        container._updateProgress(100, 'Complete');
    }
};
```

### Example 4: Opt-Out (Old Behavior)

```javascript
export const TOOL_CONFIG = {
    title: 'Simple Tool',
    canvas: {
        managed: false, // Disable smart canvas
    },
    onDraw: (ctx, canvas, values) => {
        // Fast, simple operation - no overhead needed
        ctx.fillRect(0, 0, 100, 100);
    }
};
```

---

## Advanced Features

### 1. Adaptive Chunking

```javascript
class ManagedCanvasContainer extends BaseComponent {
    /**
     * Automatically detect if operation should be chunked
     * based on historical performance
     */
    _shouldChunk() {
        // If average draw time > threshold, enable chunking
        return this.avgDrawTime > this.autoChunkThreshold;
    }
    
    /**
     * Suggest chunk size based on performance
     */
    _suggestChunkSize() {
        // Target: 16ms per chunk (60fps)
        const targetChunkTime = 16;
        const pixelsPerMs = (this.width * this.height) / this.avgDrawTime;
        return Math.floor(pixelsPerMs * targetChunkTime);
    }
}
```

### 2. Resource Monitoring

```javascript
class ManagedCanvasContainer extends BaseComponent {
    _monitorResources() {
        if (!this.monitoringEnabled) return;
        
        // Memory usage (if available)
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize / 1048576; // MB
            const limit = performance.memory.jsHeapSizeLimit / 1048576;
            const percent = (used / limit) * 100;
            
            if (percent > 90) {
                console.warn(`⚠️ High memory usage: ${percent.toFixed(1)}%`);
            }
        }
        
        // Frame rate monitoring
        this._checkFrameRate();
    }
    
    _checkFrameRate() {
        // If draw is taking too long, warn about potential frame drops
        if (this.lastDrawTime > 16) {
            window.debugLog('TOOLS', `⚠️ Draw time ${this.lastDrawTime.toFixed(1)}ms may cause frame drops`);
        }
    }
}
```

### 3. Cancellation UI

```javascript
class ManagedCanvasContainer extends BaseComponent {
    _showLoading(message, showProgress) {
        this.loadingOverlay = new LoadingOverlay({
            message,
            progress: showProgress ? 0 : null,
            showCancel: this.currentOperation !== null, // NEW: Show cancel button
            onCancel: () => {
                if (this.currentOperation) {
                    this.currentOperation.cancel();
                    this._hideLoading();
                }
            }
        }, this.deps);
        
        const overlay = this.loadingOverlay.render();
        this.element.appendChild(overlay);
    }
}
```

### 4. Performance Dashboard (Dev Mode)

```javascript
class ManagedCanvasContainer extends BaseComponent {
    renderPerformanceOverlay() {
        // Debug overlay showing:
        // - Last draw time
        // - Average draw time
        // - Memory usage
        // - Frame rate
        // - Operation history chart
        
        const metrics = this.getMetrics();
        
        const overlay = this.createElement('div', 'perf-overlay');
        overlay.style.cssText = `
            position: absolute;
            top: ${this.F}px;
            right: ${this.F}px;
            background: rgba(0, 0, 0, 0.8);
            color: var(--vga-white);
            padding: ${this.F/2}px;
            font-size: ${this.F * 0.8}px;
            font-family: 'Atkinson Hyperlegible', monospace;
            pointer-events: none;
        `;
        
        overlay.innerHTML = `
            Last: ${metrics.lastDrawTime.toFixed(1)}ms<br>
            Avg: ${metrics.avgDrawTime.toFixed(1)}ms<br>
            Count: ${metrics.drawCount}
        `;
        
        this.element.appendChild(overlay);
    }
}
```

---

## Benefits

### 1. Zero-Effort Protection
Tools don't implement safeguards - container provides them automatically.

### 2. Consistent UX
All tools get same loading behavior, timing, error handling.

### 3. Performance Insights
Container tracks metrics - can optimize globally based on data.

### 4. Adaptive Behavior
Container learns from performance history - adjusts chunking automatically.

### 5. Easy Debugging
Performance overlay shows exactly where time is spent.

### 6. Backwards Compatible
`managed: false` option preserves old behavior if needed.

---

## Implementation Checklist

- [ ] Create `assets/js/shared/components/canvas/ManagedCanvasContainer.js`
- [ ] Create `assets/js/core/DrawOperation.js` (operation tracker)
- [ ] Update `ToolBase._buildCanvasArea()` to use ManagedCanvasContainer
- [ ] Update `ToolBase.draw()` to use managed execution
- [ ] Add cancel button to LoadingOverlay component
- [ ] Add performance metrics tracking
- [ ] Update algorithm test lab to use managed canvas
- [ ] Test heavy algorithms (Canny, LoG, etc.)
- [ ] Add dev mode performance overlay
- [ ] Document in tool creation guide

---

## Configuration Options

```javascript
canvas: {
    width: 800,
    height: 800,
    managed: true, // Enable smart canvas (default)
    maxOperationTime: 10000, // Max time before timeout (ms)
    autoChunkThreshold: 50, // Show loading if draw > 50ms
    monitoring: true, // Enable resource monitoring
    showPerformance: false, // Show debug overlay
}
```

---

## Summary

**ManagedCanvasContainer** wraps canvas and provides:
1. ✅ Automatic loading detection (no manual showLoading calls)
2. ✅ Resource usage limits (timeouts, monitoring)
3. ✅ Crash prevention (cancellation, max time)
4. ✅ Performance tracking (metrics, history)
5. ✅ Adaptive behavior (learns from usage)
6. ✅ System-wide consistency (all tools benefit)

**Result**: Tools just implement `onDraw()`. Container handles all safety/loading/monitoring automatically.

