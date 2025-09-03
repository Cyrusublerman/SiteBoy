/**
 * Specialized Components - SiteBoy Framework
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - VGAGrid (VGA-styled color grid component)
 * - MathematicalCanvas (mathematical visualization canvas)
 * - ProgressBar (progress indicator component)
 * - HierarchicalTOC (table of contents with hierarchy)
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
 * - interactive.js (CollapsibleBase for HierarchicalTOC)
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

/**
 * HierarchicalTOC - Table of Contents component with hierarchy
 */
export class HierarchicalTOC extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'toc' }, deps);
        this.sections = options.sections || [];
        this.onSectionClick = options.onSectionClick || null;
        this.onSubsectionClick = options.onSubsectionClick || null;
    }
    
    render() {
        if (!this.element) {
            const F = this.deps.MF ? this.deps.MF.F : 12;
            
            this.element = this.createElement('div', 'hierarchical-toc');
            
            // Calculate dimensions based on mathematical foundation
            const layout = this.deps.MF ? this.deps.MF.computeLayout() : { gridWidth: 800, headerHeight: 24 };
            const dimensions = this.calculateTOCDimensions(layout);
            
            this.element.style.cssText = `
                position: fixed;
                top: var(--content-y-with-sub);
                left: var(--layout-margin);
                width: ${dimensions.tocWidth}px;
                height: ${dimensions.tocHeight}px;
                background: var(--c-bg);
                border: 1px solid var(--c-border);
                overflow-y: auto;
                z-index: 100;
                font-family: 'Space Mono', monospace;
                font-size: ${F}px;
            `;
            
            // Generate TOC content
            this.generateTOCContent();
            
            // Subscribe to resize
            this.subscribeToResize();
        }
        return this.element;
    }
    
    calculateTOCDimensions(layout) {
        // Calculate TOC dimensions based on layout
        const tocWidth = Math.floor(layout.gridWidth * 0.25); // 25% of content width
        const tocHeight = Math.floor(layout.gridWidth * 0.5); // Proportional height
        
        return { tocWidth, tocHeight };
    }
    
    generateTOCContent() {
        if (!this.sections || this.sections.length === 0) {
            this.element.innerHTML = '<div style="padding: 12px; color: var(--c-text-dim);">No sections available</div>';
            return;
        }
        
        const F = this.deps.MF ? this.deps.MF.F : 12;
        
        this.sections.forEach((section, index) => {
            // Main section
            const sectionEl = this.createElement('div', 'toc-section');
            sectionEl.style.cssText = `
                padding: ${F/2}px ${F}px;
                border-bottom: 1px solid var(--c-border);
                cursor: pointer;
                font-weight: bold;
                text-transform: uppercase;
            `;
            sectionEl.textContent = section.title || `Section ${index + 1}`;
            
            if (this.onSectionClick) {
                sectionEl.addEventListener('click', () => this.onSectionClick(section, index));
            }
            
            this.element.appendChild(sectionEl);
            
            // Subsections
            if (section.subsections && section.subsections.length > 0) {
                section.subsections.forEach((subsection, subIndex) => {
                    const subEl = this.createElement('div', 'toc-subsection');
                    subEl.style.cssText = `
                        padding: ${F/3}px ${F*1.5}px;
                        border-bottom: 1px solid var(--c-border-light);
                        cursor: pointer;
                        font-size: ${F*0.9}px;
                        color: var(--c-text-dim);
                    `;
                    subEl.textContent = subsection.title || `Subsection ${subIndex + 1}`;
                    
                    if (this.onSubsectionClick) {
                        subEl.addEventListener('click', () => this.onSubsectionClick(subsection, index, subIndex));
                    }
                    
                    this.element.appendChild(subEl);
                });
            }
        });
    }
    
    /**
     * Handle resize event - recalculate dimensions
     */
    onResize() {
        if (this.element && this.deps.MF) {
            const layout = this.deps.MF.computeLayout();
            const dimensions = this.calculateTOCDimensions(layout);
            
            this.element.style.width = `${dimensions.tocWidth}px`;
            this.element.style.height = `${dimensions.tocHeight}px`;
            
            console.log('📚 HierarchicalTOC: Dimensions recalculated on resize');
        }
    }
}
