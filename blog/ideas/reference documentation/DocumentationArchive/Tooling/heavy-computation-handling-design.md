# Heavy Computation Handling - Design Document

## Problem
Heavy algorithms (reaction-diffusion, wave solver, large-scale edge detection) can:
- Lock up the browser UI (blocking main thread)
- Crash/hang on slow devices
- Give no feedback during processing
- Can't be cancelled once started

## Solution Architecture

### 1. Loading State Management (ToolBase)
```javascript
class ToolBase {
  showLoading(message = 'Processing...', progress = null) {
    // Show overlay with spinner + message + optional progress bar
  }
  
  hideLoading() {
    // Remove overlay
  }
  
  updateProgress(percent, message) {
    // Update progress bar and message
  }
}
```

### 2. Chunked Processing Utilities
```javascript
// Break heavy loops into chunks with yields
async function processInChunks(totalIterations, chunkSize, callback, onProgress) {
  for (let i = 0; i < totalIterations; i += chunkSize) {
    const end = Math.min(i + chunkSize, totalIterations);
    callback(i, end); // Process chunk
    
    if (onProgress) {
      onProgress(end / totalIterations);
    }
    
    // Yield to browser (allow UI updates, prevent freeze)
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

### 3. Cancellable Operations
```javascript
class CancellableOperation {
  constructor() {
    this.cancelled = false;
  }
  
  cancel() {
    this.cancelled = true;
  }
  
  checkCancelled() {
    if (this.cancelled) throw new Error('Operation cancelled');
  }
}
```

### 4. Web Worker Approach (Future)
For very heavy algorithms:
- Run in Web Worker (separate thread)
- Post messages for progress
- Transfer large arrays efficiently
- Keep UI responsive

## Implementation Priorities

### Phase 1: Essential (Implement Now)
- [x] Loading overlay component in ToolBase
- [x] showLoading/hideLoading/updateProgress API
- [x] Chunked processing utility
- [x] Wrap heavy draw operations

### Phase 2: Enhanced
- [ ] Cancellation support (Escape key cancels)
- [ ] Estimated time remaining
- [ ] Memory usage warnings
- [ ] Frame budget tracking

### Phase 3: Advanced
- [ ] Web Worker integration for heavy algorithms
- [ ] Progress streaming from workers
- [ ] Automatic chunking detection

## Usage Pattern

```javascript
// In onDraw callback:
onDraw: async function(ctx, canvas, values) {
  // Heavy algorithm that might freeze browser
  this.showLoading('Simulating wave propagation...');
  
  try {
    // Option A: Chunked processing
    await processInChunks(1000, 50, (start, end) => {
      for (let i = start; i < end; i++) {
        // Heavy iteration
      }
    }, (progress) => {
      this.updateProgress(progress * 100, `${Math.floor(progress * 100)}% complete`);
    });
    
    // Option B: Just show spinner for fast operations
    await heavyAlgorithm();
    
  } finally {
    this.hideLoading();
  }
}
```

## Algorithm Test Lab Integration

### Current Issue
```javascript
// Blocks UI, can crash:
function renderReactionDiffusion(algoId, ctx, canvas, values) {
  for (let step = 0; step < 1000; step++) {
    // Heavy computation - freezes browser
  }
}
```

### Fixed Version
```javascript
async function renderReactionDiffusion(algoId, ctx, canvas, values) {
  tool.showLoading('Simulating 1000 steps...');
  
  await processInChunks(1000, 10, (start, end) => {
    for (let step = start; step < end; step++) {
      // Process chunk
    }
  }, (progress) => {
    tool.updateProgress(progress * 100);
  });
  
  tool.hideLoading();
}
```

## Visual Design (Loading Overlay)

```
┌────────────────────────────────────┐
│                                    │
│         [SPINNER ANIMATION]        │
│                                    │
│       Processing algorithm...      │
│                                    │
│    ████████████░░░░░░░░░  65%     │
│                                    │
│      [Press ESC to cancel]         │
│                                    │
└────────────────────────────────────┘
```

- Centered overlay (semi-transparent background)
- Spinner (CSS animation, no images)
- Progress bar (when available)
- Message (what's happening)
- Cancel hint (if cancellable)

## Performance Thresholds

| Operation | Time Limit | Action |
|-----------|------------|--------|
| < 16ms | No loading | Instant, no UI |
| 16-100ms | Debounce | Small delay, no loading |
| 100ms-1s | Show spinner | Simple loading indicator |
| > 1s | Show progress | Progress bar + chunks |
| > 5s | Warn user | "This may take a while..." |

## Memory Safeguards

For large canvas operations:
```javascript
// Check memory constraints
const pixelCount = width * height;
const bytesNeeded = pixelCount * 4 * numBuffers;
const maxSafeSize = 4096 * 4096 * 4 * 3; // ~192MB

if (bytesNeeded > maxSafeSize) {
  tool.showWarning('Canvas too large - may cause performance issues');
}
```

## Benefits

1. **No more crashes** - Chunked processing prevents freeze
2. **Better UX** - User knows something is happening
3. **Responsive UI** - Can still interact with other elements
4. **Cancellable** - Stop long operations
5. **Reusable** - Every tool gets this for free
6. **Debuggable** - Clear feedback on what's slow

## Implementation Files

- `assets/js/tools/core/tool-base.js` - Loading state management
- `assets/js/core/async-utils.js` - Chunked processing utilities (new file)
- `assets/css/styles.css` - Loading overlay styles
- `assets/js/tools/utilities/algorithms-test-lab.js` - Example usage

## Testing Strategy

1. Add `setTimeout(1000)` to simulate slow algorithm
2. Verify loading overlay appears
3. Verify UI remains responsive
4. Test progress updates
5. Test cancellation (future)
6. Test on slow devices/large canvases

