/**
 * Loading Overlay Component
 * 
 * System-wide loading indicator with spinner, message, and optional progress bar.
 * Used by ToolBase and any component that needs to show loading state.
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class LoadingOverlay extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'loading-overlay' }, deps);
        this.message = options.message || 'Processing...';
        this.progress = options.progress || null; // 0-100, or null for no progress bar
        this.F = deps.MF?.F || 14;
    }
    
    render() {
        if (this.element) return this.element;
        
        // Create overlay container
        this.element = this.createElement('div', 'loading-overlay');
        this.element.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            pointer-events: all;
        `;
        
        // Create spinner
        this.spinner = this.createElement('div', 'loading-spinner');
        this.spinner.style.cssText = `
            width: calc(var(--f) * 4);
            height: calc(var(--f) * 4);
            border: calc(var(--f) * 0.25) solid var(--c-border);
            border-top-color: var(--c-text);
            border-radius: 50%;
            animation: loading-spin 1s linear infinite;
            margin-bottom: var(--f);
        `;
        
        // Create message
        this.messageEl = this.createElement('div', 'loading-message');
        this.messageEl.textContent = this.message;
        this.messageEl.style.cssText = `
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: var(--f);
            margin-bottom: var(--f);
            text-align: center;
            padding: 0 calc(var(--f) * 2);
        `;
        
        this.element.appendChild(this.spinner);
        this.element.appendChild(this.messageEl);
        
        // Add progress bar if progress provided
        if (this.progress !== null) {
            this.progressBar = this._createProgressBar();
            this.element.appendChild(this.progressBar);
        }
        
        // Add spinner animation if not already added
        this._ensureSpinnerAnimation();
        
        return this.element;
    }
    
    /**
     * Update loading message
     */
    setMessage(message) {
        this.message = message;
        if (this.messageEl) {
            this.messageEl.textContent = message;
        }
    }
    
    /**
     * Update progress (0-100)
     */
    setProgress(percent, message = null) {
        if (message) {
            this.setMessage(message);
        }
        
        if (!this.progressBar && this.element) {
            // Progress bar not shown yet, add it
            this.progress = percent;
            this.progressBar = this._createProgressBar();
            this.element.appendChild(this.progressBar);
        }
        
        if (this.progressFill) {
            this.progressFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
        }
        
        if (this.progressText) {
            this.progressText.textContent = `${Math.floor(percent)}%`;
        }
    }
    
    /**
     * Create progress bar element
     * @private
     */
    _createProgressBar() {
        const container = this.createElement('div', 'loading-progress-container');
        container.style.cssText = `
            width: calc(var(--f) * 20);
            background: var(--c-border);
            height: calc(var(--f) * 2);
            border: 1px solid var(--c-text);
            position: relative;
            margin-top: var(--f);
        `;
        
        this.progressFill = this.createElement('div', 'loading-progress-fill');
        this.progressFill.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: var(--c-text);
            width: ${this.progress || 0}%;
            transition: width 0.1s linear;
        `;
        
        this.progressText = this.createElement('div', 'loading-progress-text');
        this.progressText.textContent = `${Math.floor(this.progress || 0)}%`;
        this.progressText.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: calc(var(--f) * 0.9);
            font-weight: bold;
            mix-blend-mode: difference;
        `;
        
        container.appendChild(this.progressFill);
        container.appendChild(this.progressText);
        
        return container;
    }
    
    /**
     * Ensure spinner animation is added to document
     * @private
     */
    _ensureSpinnerAnimation() {
        if (!document.getElementById('loading-spinner-animation')) {
            const style = this.createElement('style');
            style.id = 'loading-spinner-animation';
            style.textContent = `
                @keyframes loading-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    destroy() {
        // Remove from parent if mounted
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        // Clean up references
        this.spinner = null;
        this.messageEl = null;
        this.progressBar = null;
        this.progressFill = null;
        this.progressText = null;
        this.element = null;
    }
}

export default LoadingOverlay;

