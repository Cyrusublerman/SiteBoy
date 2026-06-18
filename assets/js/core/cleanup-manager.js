/**
 * Cleanup Manager - Centralized Resource Cleanup Utilities
 * 
 * ⚠️ USAGE: Import and use these helpers instead of writing cleanup code repeatedly
 * 
 * EXAMPLE SECTION:
 * const MySection = {
 *     componentInstances: [],
 *     eventHandlers: new CleanupManager.EventHandlerRegistry(),
 *     intervals: new CleanupManager.IntervalRegistry(),
 *     
 *     handleRoute(subsection, container, callbacks) {
 *         this.cleanup(); // Always cleanup first
 *         
 *         // Add event listeners (auto-tracked)
 *         this.eventHandlers.add(document, 'mousemove', (e) => this.handleMouse(e));
 *         
 *         // Add intervals (auto-tracked)
 *         this.intervals.add(() => this.update(), 100);
 *     },
 *     
 *     cleanup() {
 *         CleanupManager.cleanupSection(this);
 *     }
 * };
 * 
 * EXAMPLE TOOL:
 * class MyTool {
 *     constructor(container, deps) {
 *         this.container = container;
 *         this.componentInstances = [];
 *         this.eventHandlers = new CleanupManager.EventHandlerRegistry();
 *         this.intervals = new CleanupManager.IntervalRegistry();
 *         this.bodyElements = new CleanupManager.BodyElementRegistry();
 *     }
 *     
 *     render() {
 *         this.destroy();
 *         
 *         // Add event listener (auto-tracked)
 *         this.eventHandlers.add(document, 'click', () => this.handleClick());
 *         
 *         // Add interval (auto-tracked)
 *         this.intervals.add(() => this.updateStats(), 100);
 *         
 *         // Add canvas to body (auto-tracked)
 *         const canvas = document.createElement('canvas');
 *         this.bodyElements.add(canvas);
 *     }
 *     
 *     destroy() {
 *         CleanupManager.cleanupTool(this);
 *     }
 * }
 * 
 * @version 1.0.0
 */

const CleanupManager = {
    /**
     * Clean up a section (auto-detects registries)
     * @param {Object} section - Section object with cleanup resources
     */
    cleanupSection(section) {
        window.debugLog('VERBOSE', '🧹 CleanupManager: Cleaning section...');
        
        // Clear container
        if (section.currentContainer) {
            section.currentContainer.innerHTML = '';
        }
        
        // Clean up event handlers
        if (section.eventHandlers?.cleanup) {
            section.eventHandlers.cleanup();
        }
        
        // Clean up intervals
        if (section.intervals?.cleanup) {
            section.intervals.cleanup();
        }
        
        // Clean up timeouts
        if (section.timeouts?.cleanup) {
            section.timeouts.cleanup();
        }
        
        // Clean up body elements
        if (section.bodyElements?.cleanup) {
            section.bodyElements.cleanup();
        }
        
        // Destroy component instances
        if (section.componentInstances && window.ComponentLibrary) {
            window.ComponentLibrary.destroyTracked(section.componentInstances);
        }
        
        window.debugLog('VERBOSE', '✅ CleanupManager: Section cleaned');
    },
    
    /**
     * Clean up a tool (auto-detects registries)
     * @param {Object} tool - Tool instance with cleanup resources
     */
    cleanupTool(tool) {
        window.debugLog('VERBOSE', '🧹 CleanupManager: Cleaning tool...');
        
        // Clean up event handlers
        if (tool.eventHandlers?.cleanup) {
            tool.eventHandlers.cleanup();
        }
        
        // Clean up intervals
        if (tool.intervals?.cleanup) {
            tool.intervals.cleanup();
        }
        
        // Clean up timeouts
        if (tool.timeouts?.cleanup) {
            tool.timeouts.cleanup();
        }
        
        // Clean up body elements
        if (tool.bodyElements?.cleanup) {
            tool.bodyElements.cleanup();
        }
        
        // Clear container
        if (tool.container) {
            tool.container.innerHTML = '';
        }
        
        // Destroy component instances
        if (tool.componentInstances && window.ComponentLibrary) {
            window.ComponentLibrary.destroyTracked(tool.componentInstances);
        }
        
        window.debugLog('VERBOSE', '✅ CleanupManager: Tool cleaned');
    },
    
    /**
     * Event Handler Registry - Auto-tracks and removes event listeners
     */
    EventHandlerRegistry: class {
        constructor() {
            this.handlers = [];
        }
        
        /**
         * Add event listener (auto-tracked for removal)
         * @param {Element} target - Event target (document, window, element)
         * @param {string} event - Event name ('click', 'mousemove', etc.)
         * @param {Function} handler - Event handler function
         * @param {Object} options - Event listener options
         */
        add(target, event, handler, options = false) {
            target.addEventListener(event, handler, options);
            this.handlers.push({ target, event, handler, options });
        }
        
        /**
         * Remove all tracked event listeners
         */
        cleanup() {
            this.handlers.forEach(({ target, event, handler, options }) => {
                target.removeEventListener(event, handler, options);
            });
            this.handlers = [];
            window.debugLog('VERBOSE', '  ✓ Event listeners removed');
        }
        
        /**
         * Get count of tracked handlers
         */
        get count() {
            return this.handlers.length;
        }
    },
    
    /**
     * Interval Registry - Auto-tracks and clears intervals
     */
    IntervalRegistry: class {
        constructor() {
            this.intervals = [];
        }
        
        /**
         * Add interval (auto-tracked for clearing)
         * @param {Function} callback - Interval callback
         * @param {number} delay - Delay in milliseconds
         * @returns {number} Interval ID
         */
        add(callback, delay) {
            const id = setInterval(callback, delay);
            this.intervals.push(id);
            return id;
        }
        
        /**
         * Remove specific interval
         * @param {number} id - Interval ID to remove
         */
        remove(id) {
            clearInterval(id);
            this.intervals = this.intervals.filter(i => i !== id);
        }
        
        /**
         * Clear all tracked intervals
         */
        cleanup() {
            this.intervals.forEach(id => clearInterval(id));
            this.intervals = [];
            window.debugLog('VERBOSE', '  ✓ Intervals cleared');
        }
        
        /**
         * Get count of tracked intervals
         */
        get count() {
            return this.intervals.length;
        }
    },
    
    /**
     * Timeout Registry - Auto-tracks and clears timeouts
     */
    TimeoutRegistry: class {
        constructor() {
            this.timeouts = [];
        }
        
        /**
         * Add timeout (auto-tracked for clearing)
         * @param {Function} callback - Timeout callback
         * @param {number} delay - Delay in milliseconds
         * @returns {number} Timeout ID
         */
        add(callback, delay) {
            const id = setTimeout(callback, delay);
            this.timeouts.push(id);
            return id;
        }
        
        /**
         * Remove specific timeout
         * @param {number} id - Timeout ID to remove
         */
        remove(id) {
            clearTimeout(id);
            this.timeouts = this.timeouts.filter(t => t !== id);
        }
        
        /**
         * Clear all tracked timeouts
         */
        cleanup() {
            this.timeouts.forEach(id => clearTimeout(id));
            this.timeouts = [];
            window.debugLog('VERBOSE', '  ✓ Timeouts cleared');
        }
        
        /**
         * Get count of tracked timeouts
         */
        get count() {
            return this.timeouts.length;
        }
    },
    
    /**
     * Body Element Registry - Auto-tracks and removes elements added to body
     */
    BodyElementRegistry: class {
        constructor() {
            this.elements = [];
        }
        
        /**
         * Add element to body (auto-tracked for removal)
         * @param {Element} element - Element to add to body
         * @returns {Element} The added element
         */
        add(element) {
            document.body.appendChild(element);
            this.elements.push(element);
            return element;
        }
        
        /**
         * Remove specific element
         * @param {Element} element - Element to remove
         */
        remove(element) {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.elements = this.elements.filter(e => e !== element);
        }
        
        /**
         * Remove all tracked elements
         */
        cleanup() {
            this.elements.forEach(element => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
            this.elements = [];
            window.debugLog('VERBOSE', '  ✓ Body elements removed');
        }
        
        /**
         * Get count of tracked elements
         */
        get count() {
            return this.elements.length;
        }
    },
    
    /**
     * Create a complete cleanup context for a section/tool
     * @returns {Object} Cleanup context with all registries
     */
    createContext() {
        return {
            eventHandlers: new this.EventHandlerRegistry(),
            intervals: new this.IntervalRegistry(),
            timeouts: new this.TimeoutRegistry(),
            bodyElements: new this.BodyElementRegistry(),
            componentInstances: []
        };
    }
};

// Export to window
window.CleanupManager = CleanupManager;

window.debugLog('VERBOSE', '🧹 CleanupManager v1.0.0 ready - Centralized cleanup utilities loaded');

