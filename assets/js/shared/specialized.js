/**
 * Specialized Components - SiteBoy Framework
 * 
 * COMPONENTS OWNED BY THIS FILE:
 * - VGAGrid (VGA-styled color grid component)
 * - MathematicalCanvas (mathematical visualization canvas)
 * - SVGDisplay (container for mathematical SVG visualizations)
 * - AnimationControls (play/pause/navigation controls)
 * 
 * DO NOT ADD DUPLICATES OF THESE COMPONENTS IN OTHER FILES!
 * This is the SINGLE SOURCE OF TRUTH for all specialized/advanced UI components.
 * 
 * USAGE PATTERN:
 * import { VGAGrid, MathematicalCanvas, SVGDisplay, AnimationControls } from './specialized.js';
 * const grid = new VGAGrid({ items: [...] }, deps);
 * 
 * DEPENDENCIES:
 * - foundation.js (BaseComponent)
 * 
 * 📖 PLACEMENT GUIDE: See COMPONENT_PLACEMENT_GUIDE.md for component placement rules
 * 🚨 BEFORE ADDING: Check if component already exists and verify correct category
 */

import { BaseComponent } from './foundation.js';

/**
 * VGAGrid - Color grid with VGA styling
 */
export class VGAGrid extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'vga-grid' }, deps);
        this.items = options.items || [];
        this.cols = options.cols || 4;
        this.showHex = options.showHex || false;
        this.onItemClick = options.onItemClick || null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'vga-grid component');
            
            // Apply Mathematical Foundation grid layout if available
            if (this.deps.MF) {
                const dimensions = this.deps.MF.calculateComponentDimensions('grid');
                this.element.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(${this.cols}, 1fr);
                    gap: calc(var(--f) * 0.25);
                    width: 100%;
                `;
            } else {
                this.element.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(${this.cols}, 1fr);
                    gap: 3px;
                    width: 100%;
                `;
            }
            
            this.items.forEach((item, index) => {
                const itemEl = this.createElement('div', 'vga-grid-item');
                itemEl.style.cssText = `
                    aspect-ratio: 1;
                    border: 1px solid var(--c-border);
                    background: ${item.color || item};
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Atkinson Hyperlegible', monospace;
                    font-size: calc(var(--f) * 0.7);
                `;
                
                if (this.showHex && (item.hex || item.value)) {
                    const hexEl = this.createElement('span', 'hex-value');
                    hexEl.textContent = item.hex || item.value || item;
                    hexEl.style.cssText = `
                        color: var(--c-text);
                        background: rgba(0,0,0,0.7);
                        padding: 2px 4px;
                        border-radius: 2px;
                    `;
                    itemEl.appendChild(hexEl);
                }
                
                if (this.onItemClick) {
                    itemEl.addEventListener('click', () => {
                        this.onItemClick(item, index);
                    });
                }
                
                this.element.appendChild(itemEl);
            });
        }
        return this.element;
    }
}

/**
 * MathematicalCanvas - Canvas for mathematical visualizations
 */
export class MathematicalCanvas extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'mathematical-canvas' }, deps);
        this.width = options.width || 400;
        this.height = options.height || 400;
        this.drawFunction = options.drawFunction || null;
        this.ctx = null;
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'mathematical-canvas component');
            this.element.style.cssText = `
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--f);
            `;
            
            this.canvas = this.createElement('canvas', 'math-canvas');
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.style.cssText = `
                display: block;
                max-width: 100%;
                max-height: 100%;
            `;
            
            this.ctx = this.canvas.getContext('2d');
            this.element.appendChild(this.canvas);
            
            if (this.drawFunction) {
                this.drawFunction(this.ctx, this.width, this.height);
            }
        }
        return this.element;
    }
    
    clear() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }
}

/**
 * SVGDisplay - Container for mathematical SVG visualizations
 */
export class SVGDisplay extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'svg-display' }, deps);
        this.width = options.width || '100%';
        this.height = options.height || '400px';
        this.viewBox = options.viewBox || '-3 -3 6 6';
        this.svgContent = options.svgContent || '';
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'svg-display component');
            this.element.style.cssText = `
                width: 100%;
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                padding: var(--f);
                box-sizing: border-box;
            `;
            
            this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svgElement.setAttribute('width', this.width);
            this.svgElement.setAttribute('height', this.height);
            this.svgElement.setAttribute('viewBox', this.viewBox);
            this.svgElement.style.cssText = `
                width: 100%;
                height: ${this.height};
                display: block;
            `;
            
            this.element.appendChild(this.svgElement);
        }
        return this.element;
    }
    
    setSVGContent(content) {
        if (this.svgElement) {
            this.svgElement.innerHTML = content;
        }
    }
    
    getSVGElement() {
        return this.svgElement;
    }
}

/**
 * AnimationControls - Play/pause/navigation controls
 */
export class AnimationControls extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'animation-controls' }, deps);
        this.isPlaying = false;
        this.currentFrame = options.currentFrame || 0;
        this.totalFrames = options.totalFrames || 1;
        this.onPlay = options.onPlay || (() => {});
        this.onPause = options.onPause || (() => {});
        this.onNext = options.onNext || (() => {});
        this.onPrevious = options.onPrevious || (() => {});
    }
    
    render() {
        if (!this.element) {
            this.element = this.createElement('div', 'animation-controls component');
            this.element.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: calc(var(--f) * 0.5);
                padding: var(--f);
                border: 1px solid var(--c-border);
                background: var(--c-bg);
            `;
            
            // Frame info
            this.frameInfo = this.createElement('div', 'frame-info');
            this.frameInfo.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: calc(var(--f) * 0.8);
                color: var(--c-text);
                text-align: center;
                margin-bottom: calc(var(--f) * 0.5);
            `;
            this.updateFrameInfo();
            this.element.appendChild(this.frameInfo);
            
            // Control buttons
            const buttonRow = this.createElement('div', 'control-buttons');
            buttonRow.style.cssText = `
                display: flex;
                gap: calc(var(--f) * 0.5);
                justify-content: center;
            `;
            
            // Previous button
            this.prevButton = this.createElement('button', 'btn control-btn');
            this.prevButton.textContent = '←';
            this.prevButton.style.cssText = `
                width: calc(var(--f) * 2);
                height: calc(var(--f) * 2);
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                color: var(--c-text);
                cursor: pointer;
                font-family: 'Atkinson Hyperlegible', monospace;
            `;
            this.prevButton.addEventListener('click', () => {
                this.onPrevious();
                this.updateFrameInfo();
            });
            
            // Play/Pause button
            this.playButton = this.createElement('button', 'btn control-btn');
            this.playButton.textContent = this.isPlaying ? '⏸' : '▶';
            this.playButton.style.cssText = `
                width: calc(var(--f) * 2);
                height: calc(var(--f) * 2);
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                color: var(--c-text);
                cursor: pointer;
                font-family: 'Atkinson Hyperlegible', monospace;
            `;
            this.playButton.addEventListener('click', () => {
                this.togglePlay();
            });
            
            // Next button
            this.nextButton = this.createElement('button', 'btn control-btn');
            this.nextButton.textContent = '→';
            this.nextButton.style.cssText = `
                width: calc(var(--f) * 2);
                height: calc(var(--f) * 2);
                border: 1px solid var(--c-border);
                background: var(--c-bg);
                color: var(--c-text);
                cursor: pointer;
                font-family: 'Atkinson Hyperlegible', monospace;
            `;
            this.nextButton.addEventListener('click', () => {
                this.onNext();
                this.updateFrameInfo();
            });
            
            buttonRow.appendChild(this.prevButton);
            buttonRow.appendChild(this.playButton);
            buttonRow.appendChild(this.nextButton);
            this.element.appendChild(buttonRow);
        }
        return this.element;
    }
    
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        this.playButton.textContent = this.isPlaying ? '⏸' : '▶';
        
        if (this.isPlaying) {
            this.onPlay();
        } else {
            this.onPause();
        }
    }
    
    updateFrameInfo() {
        if (this.frameInfo) {
            this.frameInfo.textContent = `Frame ${this.currentFrame + 1} / ${this.totalFrames}`;
        }
    }
    
    setFrameInfo(current, total) {
        this.currentFrame = current;
        this.totalFrames = total;
        this.updateFrameInfo();
    }
}