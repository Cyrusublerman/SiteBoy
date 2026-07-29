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
import { IntervalAnimator } from '../core/animation-foundation.js';

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

/**
 * InlineCarousel — card-scale multi-image viewer for object (-o) gallery cards.
 * Prev/next toolbar per semiotics §5; image click opens scoped lightbox (consumer).
 */
export class InlineCarousel extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'inline-carousel' }, deps);
        this.images        = options.images || [];
        this._index        = options.startIndex ?? 0;
        this.onImageClick  = options.onImageClick || null;
        /** Milliseconds between automatic advances; 0 keeps the carousel manual. */
        this.autoAdvanceMs = options.autoAdvanceMs ?? 0;
        this._imgEl        = null;
        this._counterEl    = null;
        this._advanceAnimator = null;
    }

    render() {
        if (this.element) return this.element;
        const F = this.deps.MF ? this.deps.MF.F : 14;

        this.element = this.createElement('div', 'inline-carousel');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
            border: 1px solid var(--c-border);
        `;

        const bar = this.createElement('div', 'inline-carousel__bar');
        bar.style.cssText = `
            display: flex;
            align-items: stretch;
            height: ${F * 2}px;
            flex-shrink: 0;
            border-bottom: 1px solid var(--c-border);
        `;

        this._counterEl = this.createElement('div', 'inline-carousel__counter');
        this._counterEl.style.cssText = `
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
            padding: 0 ${F}px;
            font-size: ${F * 0.75}px;
            text-transform: uppercase;
            color: var(--c-text);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        `;
        bar.appendChild(this._counterEl);

        const prev = this._barBtn('PREV', '←', 'left', F);
        prev.addEventListener('click', (e) => { e.stopPropagation(); this._navigate(-1); });
        bar.appendChild(prev);

        const next = this._barBtn('NEXT', '→', 'right', F);
        next.addEventListener('click', (e) => { e.stopPropagation(); this._navigate(1); });
        bar.appendChild(next);

        const wrap = this.createElement('div', 'inline-carousel__wrap');
        wrap.style.cssText = `
            position: relative;
            width: 100%;
            aspect-ratio: 1 / 1;
            overflow: hidden;
            cursor: zoom-in;
            background: var(--c-bg);
        `;

        this._imgEl = this.createElement('img', 'inline-carousel__img');
        this._imgEl.draggable = false;
        this._imgEl.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        `;
        this._imgEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onImageClick) this.onImageClick(this._index, this.images[this._index]);
        });
        wrap.appendChild(this._imgEl);
        wrap.addEventListener('click', (e) => e.stopPropagation());

        this.element.appendChild(bar);
        this.element.appendChild(wrap);
        this._showIndex(this._index);

        if (this.autoAdvanceMs > 0 && this.images.length > 1) {
            this._advanceAnimator = new IntervalAnimator({
                interval: this.autoAdvanceMs,
                onFrame: () => this._navigate(1),
            });
            this._advanceAnimator.start();
        }

        return this.element;
    }

    _barBtn(label, glyph, side, F) {
        const btn = this.createElement('button', 'inline-carousel__btn');
        btn.type = 'button';
        btn.style.cssText = `
            width: ${F * 6}px;
            flex-shrink: 0;
            height: 100%;
            padding: 0;
            background: var(--c-bg);
            color: var(--c-text);
            border: none;
            border-left: 1px solid var(--c-border);
            cursor: pointer;
            font-family: inherit;
            font-size: ${F * 0.75}px;
            text-transform: uppercase;
            text-align: center;
        `;
        const g = this.createElement('span');
        const l = this.createElement('span');
        if (side === 'left') {
            g.textContent = glyph;
            l.textContent = ' ' + label;
            btn.appendChild(g);
            btn.appendChild(l);
        } else {
            l.textContent = label;
            g.textContent = ' ' + glyph;
            btn.appendChild(l);
            btn.appendChild(g);
        }
        btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--c-text)'; btn.style.color = 'var(--c-bg)'; });
        btn.addEventListener('mouseleave', () => { btn.style.background = 'var(--c-bg)'; btn.style.color = 'var(--c-text)'; });
        return btn;
    }

    _navigate(dir) {
        if (this.images.length <= 1) return;
        this._index = (this._index + dir + this.images.length) % this.images.length;
        this._showIndex(this._index);
    }

    _showIndex(idx) {
        const img = this.images[idx];
        if (!img || !this._imgEl) return;
        const src = img.thumb || img.src || '';
        if (img.thumb && img.src && img.thumb !== img.src) {
            this._imgEl.dataset.src = img.src;
            this._imgEl.src = src;
            this._imgEl.onload = () => { if (this._imgEl.dataset.src) this._imgEl.src = this._imgEl.dataset.src; };
        } else {
            this._imgEl.src = src;
        }
        this._imgEl.alt = img.title || '';
        if (this._counterEl) {
            const cur = String(idx + 1).padStart(2, '0');
            const tot = String(this.images.length).padStart(2, '0');
            this._counterEl.textContent = `${cur} / ${tot}`;
        }
    }

    destroy() {
        this._advanceAnimator?.destroy();
        this._advanceAnimator = null;
        if (this.element) { this.element.remove(); this.element = null; }
        super.destroy();
    }
}