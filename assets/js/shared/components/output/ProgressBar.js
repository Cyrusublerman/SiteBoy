/**
 * ProgressBar - Progress indicator component
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class ProgressBar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'progress-bar' }, deps);
        
        this.value = options.value ?? 0; // 0-100
        this.indeterminate = options.indeterminate ?? false;
        this.showLabel = options.showLabel ?? true;
        this.label = options.label ?? '';
        this.format = options.format ?? ((v) => `${Math.round(v)}%`);
        
        this.fillEl = null;
        this.labelEl = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'progress-bar component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
            width: 100%;
        `;
        
        // Label row
        if (this.showLabel || this.label) {
            const labelRow = this.createElement('div', 'progress-label-row');
            labelRow.style.cssText = `
                display: flex;
                justify-content: space-between;
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
            `;
            
            if (this.label) {
                const textLabel = this.createElement('span', 'progress-text-label');
                textLabel.textContent = this.label;
                labelRow.appendChild(textLabel);
            }
            
            if (this.showLabel) {
                this.labelEl = this.createElement('span', 'progress-value-label');
                this.labelEl.textContent = this.indeterminate ? '...' : this.format(this.value);
                labelRow.appendChild(this.labelEl);
            }
            
            this.element.appendChild(labelRow);
        }
        
        // Track - container for fill bar
        const track = this.createElement('div', 'progress-track');
        track.style.cssText = `
            width: 100%;
            height: ${F}px;
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
        `;
        
        // Fill element
        this.fillEl = this.createElement('div', 'progress-fill');
        
        if (this.indeterminate) {
            this.fillEl.style.cssText = `
                position: absolute;
                top: 0;
                left: -30%;
                width: 30%;
                height: 100%;
                background: var(--c-text);
                animation: progress-indeterminate 1.5s infinite ease-in-out;
            `;
            
            // Add keyframes
            if (!document.getElementById('progress-keyframes')) {
                const style = document.createElement('style');
                style.id = 'progress-keyframes';
                style.textContent = `
                    @keyframes progress-indeterminate {
                        0% { left: -30%; }
                        100% { left: 100%; }
                    }
                `;
                document.head.appendChild(style);
            }
        } else {
            // Fill bar - absolute positioned to fill track
            // Use highlight color if available, else text color
            this.fillEl.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: ${Math.max(0, Math.min(100, this.value))}%;
                height: 100%;
                background: var(--c-highlight, var(--c-text));
                transition: width 0.15s ease-out;
            `;
        }
        
        track.appendChild(this.fillEl);
        this.element.appendChild(track);
        
        return this.element;
    }
    
    // Public API
    setValue(value) {
        this.value = Math.max(0, Math.min(100, value));
        
        if (this.fillEl && !this.indeterminate) {
            this.fillEl.style.width = `${this.value}%`;
        }
        
        if (this.labelEl) {
            this.labelEl.textContent = this.format(this.value);
        }
    }
    
    setIndeterminate(indeterminate) {
        this.indeterminate = indeterminate;
        // Re-render to update animation
        if (this.element) {
            const parent = this.element.parentNode;
            this.element.remove();
            this.element = null;
            if (parent) parent.appendChild(this.render());
        }
    }
    
    complete() {
        this.setValue(100);
    }
    
    reset() {
        this.setValue(0);
    }
}

