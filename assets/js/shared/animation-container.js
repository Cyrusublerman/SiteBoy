/**
 * AnimationContainer Component - SiteBoy Framework
 * 
 * Standard container for generative animations
 * Follows color-quantizer layout pattern: sidebar + canvas grid
 * 
 * @version 1.0.0
 */

import { BaseComponent } from './foundation.js';

/**
 * AnimationContainer - Standardized layout for generative animations
 * Creates a 2-column grid: fixed-width sidebar + flexible canvas area
 */
export class AnimationContainer extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'animation-canvas' }, deps);
        this.sidebarContent = [];
        this.canvasElement = null;
        this.enableExport = options.enableExport !== false; // Default true
        this.animationInstance = options.animationInstance || null;
        this.loopFrames = options.loopFrames || 0; // Loop length for export UI
    }
    
    render() {
        const dims = this.calculateDimensions('animation-canvas');
        const F = dims.F || 12;
        
        // Outer wrapper for vertical stacking
        const wrapper = this.createElement('div', 'animation-wrapper');
        
        // Main container - grid layout like color-quantizer (sidebar + canvas)
        const container = this.createElement('div', 'animation-container');
        
        // Sidebar for controls
        const sidebar = this.createElement('div', 'animation-sidebar');
        
        // Add user controls
        this.sidebarContent.forEach(item => {
            sidebar.appendChild(item);
        });
        
        // Canvas area
        const canvasArea = this.createElement('div', 'animation-canvas-area');
        if (this.canvasElement) {
            canvasArea.appendChild(this.canvasElement);
        }
        
        container.appendChild(sidebar);
        container.appendChild(canvasArea);
        
        // Add main container to wrapper
        wrapper.appendChild(container);
        
        // Add export controller at the bottom if enabled
        if (this.enableExport && this.animationInstance) {
            const { ExportController } = window.ComponentLibrary;
            if (ExportController) {
                const exportCtrl = new ExportController({
                    animation: this.animationInstance,
                    loopFrames: this.loopFrames
                }, this.deps);
                this.addChild(exportCtrl);
                wrapper.appendChild(exportCtrl.render());
            }
        }
        
        this.element = wrapper;
        return wrapper;
    }
    
    /**
     * Set the canvas element
     */
    setCanvas(canvas) {
        this.canvasElement = canvas;
    }
    
    /**
     * Add content to sidebar
     */
    addToSidebar(element) {
        this.sidebarContent.push(element);
    }
    
    /**
     * Clear sidebar
     */
    clearSidebar() {
        this.sidebarContent = [];
    }
}


