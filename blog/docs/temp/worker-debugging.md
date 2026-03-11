# Web Worker Debugging Guide

## Current Issue

Workers are failing with `DOMException` when trying to process images.

## Expected Console Output (When Working)

### On Page Load:
```
✅ ToolBase loaded (ES Module)
✅ ColourQuantizerTool loaded (ES Module)
```

### On First Process Click:
```
🔧 Creating worker from URL: http://localhost:3000/assets/js/shared/workers/processing-worker.js
✅ Worker created successfully, ID: 0
🔧 Processing worker starting...         (from worker)
🔧 Worker initializing, importing algorithms...   (from worker)
✅ Worker initialized successfully       (from worker)
✅ Available algorithms: [ColorSpace, Dither, ...]  (from worker)
🔧 Worker 0 message: READY
✅ Worker 0 ready
🔧 Executing task 1 on worker 0
🔧 Algorithm: processDither
🔧 Task 1 sent to worker
🔧 Worker received message: RUN (task 1)   (from worker)
🔧 Processing RUN command for task: 1     (from worker)
🔧 Worker executing algorithm: processDither  (from worker)
✅ Found algorithm function, executing...  (from worker)
✅ Algorithm execution complete            (from worker)
✅ Sending result back to main thread      (from worker)
🔧 Worker 0 message: COMPLETE (task 1)
✅ Task 1 complete
Processed in X.XXs
```

## Actual Output (Failing):
```
LoadingOverlay component not available
Processing error: [object DOMException]
```

## Possible Root Causes

### 1. Worker File Not Found (404)
**Check**: Network tab for `processing-worker.js`
**Fix**: Verify file exists at `assets/js/shared/workers/processing-worker.js`

### 2. Module Import Failure in Worker
**Symptom**: Worker loads but can't import `algorithms-bundle.js`
**Check**: Worker console for "Worker initialization failed"
**Fix**: Verify relative import path in worker

### 3. CORS / Security Policy
**Symptom**: DOMException with "SecurityError"
**Check**: Console for CORS errors
**Fix**: Ensure dev server serves worker files correctly

### 4. Vite Module Resolution
**Symptom**: `new URL('./processing-worker.js', import.meta.url)` resolves incorrectly
**Check**: Log the resolved URL
**Fix**: Use different URL construction approach

### 5. Structured Clone Transfer Failure
**Symptom**: Worker starts but postMessage fails
**Check**: Console for "Data could not be cloned"
**Fix**: Ensure ImageData can be transferred (it should be cloneable by default)

## Quick Test Commands

Run these in browser console after loading the tool:

```javascript
// Test 1: Check if ProcessingManager exists
window._testWorker = async function() {
    const PM = (await import('/assets/js/shared/workers/processing-manager.js')).default;
    console.log('ProcessingManager:', PM);
    console.log('Stats:', PM.getStats());
};

// Test 2: Try creating a worker directly
const testWorker = new Worker(
    new URL('/assets/js/shared/workers/processing-worker.js', location.origin),
    { type: 'module' }
);
testWorker.onmessage = (e) => console.log('Worker message:', e.data);
testWorker.onerror = (e) => console.error('Worker error:', e);

// Test 3: Check if worker file is accessible
fetch('/assets/js/shared/workers/processing-worker.js')
    .then(r => r.text())
    .then(t => console.log('Worker file length:', t.length))
    .catch(e => console.error('Worker file not found:', e));
```

## Alternative Approach: Inline Data URI Worker

If file-based workers fail, we can use a Data URI approach:

```javascript
// Build worker code as string
const workerCode = `
importScripts('http://localhost:3000/assets/js/shared/workers/algorithms-bundle.js');
// ... rest of worker code
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
```

But this has limitations with ES modules.

## Next Steps

1. **Enable TOOLS debug category** to see all worker logs
2. **Check Network tab** for 404s on worker files  
3. **Test direct worker creation** using console commands above
4. **If all fails**: Fall back to chunked synchronous processing with `requestIdleCallback`


