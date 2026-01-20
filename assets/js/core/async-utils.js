/**
 * Async Processing Utilities
 * 
 * Utilities for handling heavy computations without blocking the UI.
 * Provides chunked processing, progress tracking, and cancellation support.
 * 
 * @module core/async-utils
 */

/**
 * Process heavy operation in chunks to keep UI responsive
 * Yields to browser between chunks to allow UI updates and prevent freezing
 * 
 * @param {number} totalIterations - Total number of iterations
 * @param {number} chunkSize - Iterations per chunk (lower = more responsive, slower overall)
 * @param {Function} processChunk - Callback(startIdx, endIdx) to process chunk
 * @param {Function} [onProgress] - Optional progress callback(fraction 0-1)
 * @returns {Promise<void>}
 * 
 * @example
 * await processInChunks(10000, 100, (start, end) => {
 *   for (let i = start; i < end; i++) {
 *     // Heavy computation
 *   }
 * }, (progress) => {
 *   console.log(`${Math.floor(progress * 100)}% complete`);
 * });
 */
export async function processInChunks(totalIterations, chunkSize, processChunk, onProgress = null) {
    for (let i = 0; i < totalIterations; i += chunkSize) {
        const end = Math.min(i + chunkSize, totalIterations);
        
        // Process chunk
        processChunk(i, end);
        
        // Report progress
        if (onProgress) {
            onProgress(end / totalIterations);
        }
        
        // Yield to browser (critical - allows UI updates, prevents freeze)
        // setTimeout 0 queues callback after current call stack clears
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

/**
 * Process 2D grid in chunks (for image processing)
 * 
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {number} rowsPerChunk - Rows to process per chunk
 * @param {Function} processChunk - Callback(startRow, endRow)
 * @param {Function} [onProgress] - Optional progress callback
 * @returns {Promise<void>}
 */
export async function processGridInChunks(width, height, rowsPerChunk, processChunk, onProgress = null) {
    for (let y = 0; y < height; y += rowsPerChunk) {
        const endY = Math.min(y + rowsPerChunk, height);
        
        processChunk(y, endY);
        
        if (onProgress) {
            onProgress(endY / height);
        }
        
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

/**
 * Cancellable operation wrapper
 * Allows long-running operations to be cancelled
 */
export class CancellableOperation {
    constructor() {
        this.cancelled = false;
    }
    
    /**
     * Mark operation as cancelled
     */
    cancel() {
        this.cancelled = true;
    }
    
    /**
     * Check if cancelled, throw if true
     * Call this periodically in loops
     * @throws {Error} If operation was cancelled
     */
    checkCancelled() {
        if (this.cancelled) {
            throw new Error('Operation cancelled by user');
        }
    }
    
    /**
     * Check if cancelled (non-throwing)
     * @returns {boolean}
     */
    isCancelled() {
        return this.cancelled;
    }
}

/**
 * Run async operation with timeout
 * 
 * @param {Promise} promise - Promise to run
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} [timeoutMessage] - Error message on timeout
 * @returns {Promise}
 * @throws {Error} If operation times out
 */
export async function withTimeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
    let timeoutId;
    
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(timeoutMessage));
        }, timeoutMs);
    });
    
    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Estimate if operation will be heavy based on data size
 * 
 * @param {number} dataSize - Size of data to process
 * @param {number} complexity - Algorithmic complexity factor (1 = O(n), 2 = O(n²))
 * @returns {Object} { isHeavy, needsChunking, estimatedMs }
 */
export function estimateComputationCost(dataSize, complexity = 1) {
    // Rough heuristic: operations per ms on typical hardware
    const opsPerMs = 100000;
    const totalOps = Math.pow(dataSize, complexity);
    const estimatedMs = totalOps / opsPerMs;
    
    return {
        isHeavy: estimatedMs > 100,
        needsChunking: estimatedMs > 1000,
        estimatedMs: Math.round(estimatedMs)
    };
}

export default {
    processInChunks,
    processGridInChunks,
    CancellableOperation,
    withTimeout,
    estimateComputationCost
};

