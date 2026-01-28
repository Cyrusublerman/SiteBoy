/**
 * Processing Worker - Runs algorithms in background thread
 * 
 * This is a dedicated worker file (not inline) to avoid Blob URL + ES module issues.
 * 
 * @module workers/processing-worker
 */

console.log('🔧 Processing worker starting...');

// Import algorithm modules
let Algorithms = null;
let isInitialized = false;

/**
 * Initialize worker by importing algorithm bundle
 */
async function initialize() {
    if (isInitialized) return;
    
    console.log('🔧 Worker initializing, importing algorithms...');
    
    try {
        // Import algorithms bundle
        const module = await import('./algorithms-bundle.js');
        Algorithms = module;
        isInitialized = true;
        console.log('✅ Worker initialized successfully');
        console.log('✅ Available algorithms:', Object.keys(module));
        self.postMessage({ type: 'READY' });
    } catch (err) {
        console.error('❌ Worker initialization failed:', err);
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        self.postMessage({ 
            type: 'ERROR', 
            message: 'Failed to load algorithms: ' + err.message + '\n' + err.stack
        });
    }
}

/**
 * Execute algorithm by name
 */
function executeAlgorithm(algorithmPath, data, options, taskId) {
    console.log('🔧 Worker executing algorithm:', algorithmPath);
    
    if (!isInitialized) {
        throw new Error('Worker not initialized');
    }
    
    // Navigate to algorithm function using dot notation
    const parts = algorithmPath.split('.');
    let fn = Algorithms;
    
    console.log('🔧 Navigating to algorithm:', parts);
    
    for (const part of parts) {
        fn = fn[part];
        if (!fn) {
            console.error('❌ Algorithm not found at path:', parts.join('.'));
            console.error('Available at current level:', Object.keys(fn || {}));
            throw new Error(`Algorithm not found: ${algorithmPath}`);
        }
    }
    
    if (typeof fn !== 'function') {
        console.error('❌ Path does not resolve to function:', algorithmPath);
        console.error('Resolved to:', typeof fn);
        throw new Error(`${algorithmPath} is not a function`);
    }
    
    console.log('✅ Found algorithm function, executing...');
    
    // Execute the algorithm with data (no onProgress since functions can't be cloned)
    const result = fn(data, options);
    console.log('✅ Algorithm execution complete');
    return result;
}

/**
 * Message handler
 */
self.onmessage = async function(e) {
    const { type, id, algorithmName, data, options } = e.data;
    
    console.log('🔧 Worker received message:', type, id ? `(task ${id})` : '');
    
    try {
        switch (type) {
            case 'INIT':
                await initialize();
                break;
                
            case 'RUN':
                console.log('🔧 Processing RUN command for task:', id);
                const runStartTime = performance.now();
                
                if (!isInitialized) {
                    console.log('🔧 Worker not initialized, initializing now...');
                    await initialize();
                }
                
                console.log('🔧 Executing algorithm at:', (performance.now() - runStartTime).toFixed(2), 'ms');
                
                // Execute algorithm with progress reporting
                let result = executeAlgorithm(algorithmName, data, options, id);
                
                console.log('🔧 Algorithm complete at:', (performance.now() - runStartTime).toFixed(2), 'ms');
                
                // Use transferable objects for ImageData (zero-copy transfer)
                const transferList = [];
                if (result && result.data && result.width && result.height) {
                    console.log('🔧 Preparing ImageData result for transfer');
                    console.log('🔧 Result data type:', result.data.constructor.name);
                    console.log('🔧 Result data length:', result.data.length);
                    // Get the underlying ArrayBuffer (transferable)
                    const buffer = result.data.buffer;
                    transferList.push(buffer);
                    
                    result = {
                        data: result.data, // Uint8ClampedArray
                        width: result.width,
                        height: result.height
                    };
                }
                
                console.log('✅ Sending result back to main thread at:', (performance.now() - runStartTime).toFixed(2), 'ms');
                console.log('🔧 Transfer list length:', transferList.length);
                // Return result with transfer list for zero-copy performance
                self.postMessage({
                    type: 'COMPLETE',
                    id: id,
                    result: result
                }, transferList);
                break;
                
            case 'CANCEL':
                console.log('🔧 Task cancelled:', id);
                // Worker cancellation (future enhancement)
                self.postMessage({
                    type: 'CANCELLED',
                    id: id
                });
                break;
                
            default:
                throw new Error('Unknown message type: ' + type);
        }
    } catch (error) {
        console.error('❌ Worker error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        self.postMessage({
            type: 'ERROR',
            id: id,
            message: error.message,
            stack: error.stack
        });
    }
};

// Auto-initialize on load
console.log('🔧 Worker loaded, auto-initializing...');
initialize();

