/**
 * Canvas - Universal canvas rendering component
 * 
 * Modes:
 * - context: '2d' — standard 2D canvas
 * - context: 'webgl' — WebGL canvas
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Canvas extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'canvas' }, deps);
        
        // Context
        this.contextType = options.context ?? '2d'; // '2d' | 'webgl'
        
        // Sizing
        this.width = options.width ?? 400;
        this.height = options.height ?? 400;
        this.aspectRatio = options.aspectRatio ?? null; // If set, overrides height
        
        // Rendering
        this.draw = options.draw ?? null; // (ctx, width, height) => void
        
        // Interaction
        this.interactive = options.interactive ?? false;
        this.onClick = options.onClick ?? null; // (x, y, event) => void
        this.onDrag = options.onDrag ?? null; // (x, y, dx, dy, event) => void
        this.onWheel = options.onWheel ?? null; // (delta, event) => void
        
        // HUD overlays
        this.hud = options.hud ?? []; // Array of Text component configs
        
        // State
        this.canvasEl = null;
        this.ctx = null;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.hudComponents = [];
    }
    
    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F ?? 14;
        
        this.element = this.createElement('div', 'canvas-container component');
        this.element.style.cssText = `
            position: relative;
            display: inline-block;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            box-sizing: border-box;
        `;
        
        // Create canvas
        this.canvasEl = this.createElement('canvas', 'canvas-element');
        this._updateSize();
        this.canvasEl.style.cssText = `
            display: block;
        `;
        
        // Get context
        if (this.contextType === 'webgl') {
            this.ctx = this.canvasEl.getContext('webgl') || this.canvasEl.getContext('experimental-webgl');
        } else {
            this.ctx = this.canvasEl.getContext('2d');
        }
        
        this.element.appendChild(this.canvasEl);
        
        // Setup interaction
        if (this.interactive) {
            this._setupInteraction();
        }
        
        // Setup HUD
        if (this.hud.length > 0) {
            this._setupHUD(F);
        }
        
        // Initial draw
        if (this.draw) {
            this.redraw();
        }
        
        return this.element;
    }
    
    _updateSize() {
        if (this.aspectRatio) {
            this.height = Math.round(this.width / this.aspectRatio);
        }
        
        if (this.canvasEl) {
            this.canvasEl.width = this.width;
            this.canvasEl.height = this.height;
        }
        
        if (this.element) {
            this.element.style.width = `${this.width}px`;
            this.element.style.height = `${this.height}px`;
        }
    }
    
    _setupInteraction() {
        // Click
        this.canvasEl.addEventListener('click', (e) => {
            if (this.onClick && !this.isDragging) {
                const rect = this.canvasEl.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.onClick(x, y, e);
            }
        });
        
        // Drag
        this.canvasEl.addEventListener('mousedown', (e) => {
            if (this.onDrag) {
                this.isDragging = true;
                const rect = this.canvasEl.getBoundingClientRect();
                this.lastX = e.clientX - rect.left;
                this.lastY = e.clientY - rect.top;
                this.canvasEl.style.cursor = 'grabbing';
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.onDrag) {
                const rect = this.canvasEl.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const dx = x - this.lastX;
                const dy = y - this.lastY;
                this.onDrag(x, y, dx, dy, e);
                this.lastX = x;
                this.lastY = y;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.canvasEl.style.cursor = this.onDrag ? 'grab' : 'default';
            }
        });
        
        // Wheel
        if (this.onWheel) {
            this.canvasEl.addEventListener('wheel', (e) => {
                e.preventDefault();
                this.onWheel(e.deltaY, e);
            });
        }
        
        // Cursor
        this.canvasEl.style.cursor = this.onDrag ? 'grab' : 'default';
    }
    
    _setupHUD(F) {
        const hudContainer = this.createElement('div', 'canvas-hud');
        hudContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            padding: ${F * 0.5}px;
        `;
        
        // Import Text dynamically to avoid circular deps
        import('./Text.js').then(({ Text }) => {
            this.hud.forEach(config => {
                const text = new Text({
                    variant: 'value',
                    ...config
                }, this.deps);
                
                const el = text.render();
                el.style.position = 'absolute';
                
                // Position based on anchor
                const anchor = config.anchor ?? 'top-left';
                if (anchor.includes('top')) el.style.top = `${F * 0.5}px`;
                if (anchor.includes('bottom')) el.style.bottom = `${F * 0.5}px`;
                if (anchor.includes('left')) el.style.left = `${F * 0.5}px`;
                if (anchor.includes('right')) el.style.right = `${F * 0.5}px`;
                
                el.style.background = 'var(--c-bg)';
                el.style.padding = `${F * 0.25}px ${F * 0.5}px`;
                
                hudContainer.appendChild(el);
                this.hudComponents.push(text);
            });
        });
        
        this.element.appendChild(hudContainer);
    }
    
    // Public API
    redraw() {
        if (this.draw && this.ctx) {
            this.draw(this.ctx, this.width, this.height);
        }
    }
    
    clear() {
        if (this.ctx) {
            if (this.contextType === '2d') {
                this.ctx.clearRect(0, 0, this.width, this.height);
            } else {
                this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
            }
        }
    }
    
    resize(width, height) {
        this.width = width;
        if (height) this.height = height;
        this._updateSize();
        this.redraw();
    }
    
    getContext() {
        return this.ctx;
    }
    
    getCanvas() {
        return this.canvasEl;
    }
    
    getImageData() {
        if (this.contextType === '2d') {
            return this.ctx.getImageData(0, 0, this.width, this.height);
        }
        return null;
    }
    
    toDataURL(type = 'image/png', quality = 1) {
        return this.canvasEl?.toDataURL(type, quality) ?? '';
    }
    
    download(filename = 'canvas.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.toDataURL();
        link.click();
    }
    
    updateHUD(index, value) {
        if (this.hudComponents[index]) {
            this.hudComponents[index].setValue(value);
        }
    }
    
    destroy() {
        this.hudComponents.forEach(c => c.destroy());
        this.hudComponents = [];
        super.destroy();
    }
}

