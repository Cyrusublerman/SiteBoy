/**
 * Generic Worker - Inline Web Worker for Algorithm Processing
 * 
 * Creates an inline worker using Blob URL that can execute pure algorithm functions
 * in a background thread without blocking the UI.
 * 
 * Architecture:
 * - Worker runs in separate thread
 * - Imports algorithm bundle via importScripts()
 * - Receives task messages, executes algorithms, returns results
 * - Supports progress reporting and cancellation
 * 
 * @module workers/generic-worker
 */

/**
 * Create a generic worker instance
 * 
 * The worker code is defined inline and converted to a Blob URL.
 * This avoids needing separate .worker.js files and works with Vite bundling.
 * 
 * @returns {Worker} Worker instance
 */
export function createGenericWorker() {
    // Worker code as string (will be converted to Blob)
    const workerCode = `
// ═══════════════════════════════════════════════════════════════
// WORKER CONTEXT - Runs in separate thread
// ═══════════════════════════════════════════════════════════════

// Import algorithm modules (will be loaded from bundle)
let Algorithms = null;
let isInitialized = false;

/**
 * Initialize worker by importing algorithm bundle
 */
async function initialize() {
    if (isInitialized) return;
    
    try {
        // Get the base URL from the worker location
        const baseUrl = self.location.origin;
        // Import algorithms bundle (ES module in worker context)
        const module = await import(baseUrl + '/assets/js/shared/workers/algorithms-bundle.js');
        Algorithms = module;
        isInitialized = true;
        self.postMessage({ type: 'READY' });
    } catch (err) {
        self.postMessage({ 
            type: 'ERROR', 
            message: 'Failed to load algorithms: ' + err.message + ' (stack: ' + err.stack + ')'
        });
    }
}

/**
 * Execute algorithm by name
 * @param {string} algorithmPath - Dot-separated path like 'Dither.floydSteinberg'
 * @param {Object} data - Input data
 * @param {Object} options - Algorithm options
 * @param {number} taskId - Task ID for progress reporting
 */
function executeAlgorithm(algorithmPath, data, options, taskId) {
    if (!isInitialized) {
        throw new Error('Worker not initialized');
    }
    
    // Navigate to algorithm function using dot notation
    const parts = algorithmPath.split('.');
    let fn = Algorithms;
    
    for (const part of parts) {
        fn = fn[part];
        if (!fn) {
            throw new Error(\`Algorithm not found: \${algorithmPath}\`);
        }
    }
    
    if (typeof fn !== 'function') {
        throw new Error(\`\${algorithmPath} is not a function\`);
    }
    
    // Add progress callback to data if algorithm supports it
    const dataWithProgress = {
        ...data,
        onProgress: (percent) => {
            self.postMessage({
                type: 'PROGRESS',
                id: taskId,
                percent: percent
            });
        }
    };
    
    // Execute the algorithm
    return fn(dataWithProgress, options);
}

/**
 * Message handler
 */
self.onmessage = async function(e) {
    const { type, id, algorithmName, data, options } = e.data;
    
    try {
        switch (type) {
            case 'INIT':
                await initialize();
                break;
                
            case 'RUN':
                if (!isInitialized) {
                    await initialize();
                }
                
                // Execute algorithm with progress reporting
                const result = executeAlgorithm(algorithmName, data, options, id);
                
                // Return result
                self.postMessage({
                    type: 'COMPLETE',
                    id: id,
                    result: result
                });
                break;
                
            case 'CANCEL':
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
        self.postMessage({
            type: 'ERROR',
            id: id,
            message: error.message,
            stack: error.stack
        });
    }
};

// Auto-initialize on load
initialize();
`;

    // Convert worker code to Blob URL
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    // Create worker
    const worker = new Worker(workerUrl, { type: 'module' });
    
    // Store URL for cleanup
    worker._blobUrl = workerUrl;
    
    return worker;
}

/**
 * Terminate worker and cleanup resources
 * 
 * @param {Worker} worker - Worker to terminate
 */
export function terminateWorker(worker) {
    if (worker) {
        worker.terminate();
        
        // Cleanup Blob URL
        if (worker._blobUrl) {
            URL.revokeObjectURL(worker._blobUrl);
        }
    }
}

