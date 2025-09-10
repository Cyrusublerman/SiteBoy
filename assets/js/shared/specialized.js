/**
 * Specialized Components - SiteBoy Framework
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - VGAGrid (VGA-styled color grid component)
 * - MathematicalCanvas (mathematical visualization canvas)
 * - ProgressBar (progress indicator component)
 * 
 * DO NOT ADD DUPLICATES OF THESE COMPONENTS IN OTHER FILES!
 * This is the SINGLE SOURCE OF TRUTH for all specialized/advanced UI components.
 * 
 * USAGE PATTERN:
 * import { VGAGrid, ProgressBar } from './specialized.js';
 * const grid = new VGAGrid({ items: [...] }, deps);
 * 
 * DEPENDENCIES:
 * - foundation.js (BaseComponent)
 * 
 * 📖 PLACEMENT GUIDE: See COMPONENT_PLACEMENT_GUIDE.md for component placement rules
 * 🚨 BEFORE ADDING: Check if component already exists and verify correct category
 */

import { BaseComponent } from './foundation.js';
import { CollapsibleBase } from './interactive.js';

/**
 * VGAGrid - Color grid with VGA styling
 */
export class VGAGrid extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'grid' }, deps);
        this.items = options.items || [];
        this.cols = options.cols || 4;
        this.rows = options.rows || 4;
        this.cellSize = options.cellSize || 20;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'vga-grid component');
            
            const grid = this.createElement('div', 'vga-grid-container');
            grid.style.cssText = `
                display: grid; 
                grid-template-columns: repeat(${this.cols}, ${this.cellSize}px);
                gap: 1px; 
                background: var(--c-border);
                border: 1px solid var(--c-border);
            `;
            
            // Generate VGA-style grid items
            for (let i = 0; i < this.cols * this.rows; i++) {
                const cell = this.createElement('div', 'vga-cell');
                cell.style.cssText = `
                    width: ${this.cellSize}px;
                    height: ${this.cellSize}px;
                    background: var(--vga-color-${i % 16});
                    border: 1px solid var(--c-border);
                    box-sizing: border-box;
                `;
                grid.appendChild(cell);
            }
            
            this.element.appendChild(grid);
        }
        return this.element;
    }
}

/**
 * MathematicalCanvas - Mathematical visualization canvas
 */
export class MathematicalCanvas extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'canvas' }, deps);
        this.width = options.width || 400;
        this.height = options.height || 300;
        this.drawFunction = options.drawFunction || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'mathematical-canvas component');
            
            const canvas = this.createElement('canvas', 'math-canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            canvas.style.cssText = `
                width: ${this.width}px;
                height: ${this.height}px;
                border: 1px solid var(--c-border);
                background: var(--c-bg);
            `;
            
            this.element.appendChild(canvas);
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            
            if (this.drawFunction) {
                this.drawFunction(this.ctx, this.width, this.height);
            }
        }
        return this.element;
    }
    
    getContext() {
        return this.ctx;
    }
    
    clear() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }
}

/**
 * ProgressBar - Progress indicator component
 */
export class ProgressBar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'progress' }, deps);
        this.value = Math.max(0, Math.min(100, options.value || 0));
        this.max = options.max || 100;
        // Support both showText and showPercent for compatibility
        this.showText = options.showText !== false || options.showPercent === true;
        this.size = options.size || 'm'; // s, m, l
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', `progress-bar progress-${this.size}`);
            
            const track = this.createElement('div', 'progress-track');
            track.style.cssText = `
                width: 100%;
                height: 20px;
                background: var(--c-bg);
                border: 1px solid var(--c-border);
                position: relative;
                overflow: hidden;
            `;
            
            const fill = this.createElement('div', 'progress-fill');
            fill.style.cssText = `
                width: ${this.value}%;
                height: 100%;
                background: var(--c-accent);
                transition: width 0.3s ease;
            `;
            
            track.appendChild(fill);
            this.element.appendChild(track);
            
            let textElement = null;
            if (this.showText) {
                textElement = this.createElement('div', 'progress-text');
                textElement.textContent = `${this.value}%`;
                textElement.style.cssText = `
                    text-align: center;
                    font-size: 12px;
                    margin-top: 4px;
                `;
                this.element.appendChild(textElement);
            }
            
            this.fillElement = fill;
            this.textElement = textElement;
        }
        return this.element;
    }
    
    setValue(value) {
        this.value = Math.max(0, Math.min(100, value));
        if (this.fillElement) {
            this.fillElement.style.width = `${this.value}%`;
        }
        if (this.textElement) {
            this.textElement.textContent = `${this.value}%`;
        }
    }
}

