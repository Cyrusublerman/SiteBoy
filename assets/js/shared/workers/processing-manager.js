/**
 * ProcessingManager - Web Worker Pool for Algorithm Processing
 * 
 * Manages a pool of Web Workers for offloading heavy computation to background threads.
 * Provides a simple async API for tools to process data without blocking the UI.
 * 
 * Features:
 * - Worker pool with configurable size
 * - Task queue for when all workers are busy
 * - Progress reporting via callbacks
 * - Cancellation support via AbortController
 * - Automatic worker lifecycle management
 * 
 * @module workers/processing-manager
 */

/**
 * ProcessingManager - Singleton worker pool manager
 */
class ProcessingManager {
    constructor() {
        this.workers = [];
        this.availableWorkers = [];
        this.taskQueue = [];
        this.activeTasks = new Map();
        this.nextTaskId = 1;
        this.poolSize = Math.min(navigator.hardwareConcurrency || 4, 4); // Max 4 workers
        this.maxTasksPerWorker = 50; // Recycle workers after N tasks
        this.isInitialized = false;
        
        window.debugLog('TOOLS', 'ProcessingManager created with pool size:', this.poolSize);
    }
    
    /**
     * Initialize worker pool
     * @private
     */
    async initialize() {
        if (this.isInitialized) return;
        
        window.debugLog('TOOLS', 'Initializing worker pool...');
        
        // Create initial worker
        const worker = this._createWorker();
        this.workers.push(worker);
        this.availableWorkers.push(worker);
        
        this.isInitialized = true;
        window.debugLog('TOOLS', 'Worker pool initialized (1 worker, will scale to ' + this.poolSize + ')');
    }
    
    /**
     * Scale up worker pool to handle load
     * @private
     */
    _scalePool() {
        // Only scale if we have queued tasks and room to grow
        if (this.taskQueue.length > 0 && this.workers.length < this.poolSize) {
            const needed = Math.min(
                this.taskQueue.length,
                this.poolSize - this.workers.length
            );
            
            for (let i = 0; i < needed; i++) {
                const worker = this._createWorker();
                this.workers.push(worker);
                this.availableWorkers.push(worker);
                window.debugLog('TOOLS', `Scaled pool to ${this.workers.length} workers`);
            }
        }
    }
    
    /**
     * Create a new worker
     * @private
     */
    _createWorker() {
        try {
            const workerUrl = new URL('./processing-worker.js', import.meta.url);
            window.debugLog('TOOLS', 'Creating worker from URL:', workerUrl.href);
            
            const worker = new Worker(workerUrl, { type: 'module' });
            worker._taskCount = 0;
            worker._id = this.workers.length;
            
            // Setup message handler
            worker.onmessage = (e) => this._handleWorkerMessage(worker, e);
            worker.onerror = (e) => {
                console.error('Worker error event:', e);
                console.error('Worker error message:', e.message);
                console.error('Worker error filename:', e.filename);
                console.error('Worker error lineno:', e.lineno);
                this._handleWorkerError(worker, e);
            };
            
            window.debugLog('TOOLS', 'Worker created successfully, ID:', worker._id);
            return worker;
        } catch (err) {
            console.error('Failed to create worker:', err);
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
            throw err;
        }
    }
    
    /**
     * Handle worker messages
     * @private
     */
    _handleWorkerMessage(worker, event) {
        const { type, id, result, message, percent } = event.data;
        
        window.debugLog('TOOLS', `Worker ${worker._id} message:`, type, id ? `(task ${id})` : '');
        
        const task = this.activeTasks.get(id);
        if (!task && type !== 'READY') {
            window.debugLog('TOOLS', `No task found for ID ${id}, ignoring message`);
            return;
        }
        
        switch (type) {
            case 'READY':
                window.debugLog('TOOLS', `Worker ${worker._id} ready`);
                break;
                
            case 'COMPLETE':
                const duration = task.startTime ? (performance.now() - task.startTime).toFixed(2) : '?';
                window.debugLog('TOOLS', `Task ${id} complete in ${duration}ms`);
                console.log(`⏱️ Worker round-trip time: ${duration}ms`);
                task.resolve(result);
                this._completeTask(id, worker);
                break;
                
            case 'ERROR':
                console.error('Worker processing error:', message);
                task.reject(new Error(message));
                this._completeTask(id, worker);
                break;
                
            case 'PROGRESS':
                if (task && task.onProgress) {
                    task.onProgress(percent);
                }
                break;
                
            case 'CANCELLED':
                task.reject(new Error('Task cancelled'));
                this._completeTask(id, worker);
                break;
        }
    }
    
    /**
     * Handle worker errors
     * @private
     */
    _handleWorkerError(worker, error) {
        console.error('Worker error:', error);
        
        // Find and reject all tasks running on this worker
        for (const [id, task] of this.activeTasks.entries()) {
            if (task.worker === worker) {
                task.reject(new Error('Worker crashed: ' + error.message));
                this.activeTasks.delete(id);
            }
        }
        
        // Remove crashed worker from pool
        const index = this.workers.indexOf(worker);
        if (index > -1) {
            this.workers.splice(index, 1);
        }
        
        const availIndex = this.availableWorkers.indexOf(worker);
        if (availIndex > -1) {
            this.availableWorkers.splice(availIndex, 1);
        }
        
        // Create replacement worker if needed
        if (this.workers.length < 1) {
            const newWorker = this._createWorker();
            this.workers.push(newWorker);
            this.availableWorkers.push(newWorker);
        }
    }
    
    /**
     * Complete task and return worker to pool
     * @private
     */
    _completeTask(taskId, worker) {
        this.activeTasks.delete(taskId);
        worker._taskCount++;
        
        // Recycle worker if it's processed too many tasks
        if (worker._taskCount >= this.maxTasksPerWorker) {
            window.debugLog('TOOLS', `Recycling worker ${worker._id} after ${worker._taskCount} tasks`);
            this._recycleWorker(worker);
        } else {
            // Return worker to pool
            this.availableWorkers.push(worker);
        }
        
        // Process next queued task
        this._processQueue();
    }
    
    /**
     * Recycle a worker (terminate and replace)
     * @private
     */
    _recycleWorker(worker) {
        const index = this.workers.indexOf(worker);
        if (index > -1) {
            this.workers.splice(index, 1);
        }
        
        worker.terminate();
        
        // Create new worker
        const newWorker = this._createWorker();
        this.workers.push(newWorker);
        this.availableWorkers.push(newWorker);
    }
    
    /**
     * Process queued tasks
     * @private
     */
    _processQueue() {
        // Scale up pool if needed
        if (this.taskQueue.length > 0 && this.workers.length < this.poolSize) {
            this._scalePool();
        }
        
        while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
            const task = this.taskQueue.shift();
            this._executeTask(task);
        }
    }
    
    /**
     * Execute a task on an available worker
     * @private
     */
    _executeTask(task) {
        const worker = this.availableWorkers.shift();
        task.worker = worker;
        task.startTime = performance.now();
        
        window.debugLog('TOOLS', `Executing task ${task.id} on worker ${worker._id}`);
        window.debugLog('TOOLS', `Algorithm: ${task.algorithmName}`);
        
        // Setup cancellation
        if (task.signal) {
            task.signal.addEventListener('abort', () => {
                window.debugLog('TOOLS', `Task ${task.id} aborted`);
                worker.postMessage({ type: 'CANCEL', id: task.id });
            });
        }
        
        // Send task to worker (without onProgress - it stays in task for message handling)
        try {
            // Remove non-cloneable properties from options
            const { onProgress, signal, ...workerOptions } = task.options || {};
            
            // DON'T use transferables for input data - we need to keep the original!
            // Only the worker's RESULT will be transferred back (zero-copy)
            // Input data is structured cloned (fast enough for one-way transfer)
            
            window.debugLog('TOOLS', `Task ${task.id} sending data (structured clone, not transfer)`);
            
            worker.postMessage({
                type: 'RUN',
                id: task.id,
                algorithmName: task.algorithmName,
                data: task.data,
                options: workerOptions
            }); // No transfer list - use structured clone
            
            window.debugLog('TOOLS', `Task ${task.id} sent to worker`);
        } catch (err) {
            console.error('Failed to post message to worker:', err);
            task.reject(err);
            this.availableWorkers.push(worker);
        }
    }
    
    /**
     * Process data using an algorithm in a worker
     * 
     * @param {string} algorithmName - Algorithm path like 'Dither.floydSteinberg'
     * @param {Object} data - Input data
     * @param {Object} options - Options
     * @param {Function} options.onProgress - Progress callback (percent)
     * @param {AbortSignal} options.signal - Abort signal for cancellation
     * @returns {Promise<any>} Processing result
     * 
     * @example
     * const result = await ProcessingManager.process('Dither.floydSteinberg', {
     *     imageData: myImageData,
     *     palette: ['#000000', '#FFFFFF']
     * }, {
     *     onProgress: (p) => console.log(`${p}% complete`)
     * });
     */
    async process(algorithmName, data, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        const taskId = this.nextTaskId++;
        
        return new Promise((resolve, reject) => {
            const task = {
                id: taskId,
                algorithmName,
                data,
                options,
                resolve,
                reject,
                onProgress: options.onProgress,
                signal: options.signal,
                worker: null
            };
            
            this.activeTasks.set(taskId, task);
            
            // Execute immediately if worker available, otherwise queue
            if (this.availableWorkers.length > 0) {
                this._executeTask(task);
            } else {
                this.taskQueue.push(task);
                window.debugLog('TOOLS', `Task ${taskId} queued (${this.taskQueue.length} in queue)`);
            }
        });
    }
    
    /**
     * Cancel a specific task
     * @param {number} taskId - Task ID to cancel
     */
    cancel(taskId) {
        const task = this.activeTasks.get(taskId);
        if (task && task.worker) {
            task.worker.postMessage({ type: 'CANCEL', id: taskId });
        }
    }
    
    /**
     * Cancel all active tasks
     */
    cancelAll() {
        for (const [id, task] of this.activeTasks.entries()) {
            if (task.worker) {
                task.worker.postMessage({ type: 'CANCEL', id });
            }
        }
    }
    
    /**
     * Destroy all workers and cleanup
     */
    destroy() {
        this.cancelAll();
        
        for (const worker of this.workers) {
            worker.terminate();
        }
        
        this.workers = [];
        this.availableWorkers = [];
        this.taskQueue = [];
        this.activeTasks.clear();
        this.isInitialized = false;
        
        window.debugLog('TOOLS', 'ProcessingManager destroyed');
    }
    
    /**
     * Get pool statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            poolSize: this.poolSize,
            activeWorkers: this.workers.length,
            availableWorkers: this.availableWorkers.length,
            activeTasks: this.activeTasks.size,
            queuedTasks: this.taskQueue.length
        };
    }
}

// Create singleton instance
const instance = new ProcessingManager();

// Export singleton
export default instance;

// Also export class for testing
export { ProcessingManager };

