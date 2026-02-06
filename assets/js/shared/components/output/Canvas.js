/**
 * Canvas - Universal procedural rendering component
 * 
 * FEATURE FLAGS:
 * - enableZoom: Mouse wheel zoom (CSS transform, GPU-accelerated)
 * - enablePan: Drag to pan (CSS transform, GPU-accelerated)
 * - displayMode: 'auto' | 'fit' | 'fill' | 'actual'
 * - interactive: Enable click/drag/wheel events
 * - enableHUD: Enable HUD overlay system
 * 
 * ZOOM/PAN BEHAVIOR:
 * - Uses CSS transform (NOT context transform)
 * - Pixel buffer unchanged during zoom/pan
 * - GPU-accelerated, no redraw triggered
 * - Pixel patterns preserved (stretched/compressed visually)
 * 
 * USE FOR:
 * - Animations (60fps redraw via AnimationFoundation)
 * - Generative art
 * - Interactive graphics
 * - Charts/graphs
 * 
 * FOR STATIC IMAGES:
 * Use ImageViewport component — same zoom/pan behavior,
 * but uses setImageData() instead of draw() callback.
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class Canvas extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'canvas' }, deps);
        
        // === CORE ===
        this.contextType = options.context ?? '2d';
        this.width = options.width ?? 400;
        this.height = options.height ?? 400;
        this.aspectRatio = options.aspectRatio ?? null;
        this.draw = options.draw ?? null;
        
        // DPR scaling for high-DPI displays
        this.enableDPR = options.enableDPR ?? true;
        this.dpr = this.enableDPR ? (window.devicePixelRatio || 1) : 1;
        
        // === FEATURE FLAGS ===
        this.interactive = options.interactive ?? false;
        this.enableZoom = options.enableZoom ?? false;
        this.enablePan = options.enablePan ?? false;
        this.displayMode = options.displayMode ?? 'auto';
        this.enableHUD = options.enableHUD ?? (options.hud?.length > 0);
        
        // === ZOOM/PAN CONFIG ===
        this.minZoom = options.minZoom ?? 0.1;
        this.maxZoom = options.maxZoom ?? 10;
        this.zoomSpeed = options.zoomSpeed ?? 0.1;
        
        // === INTERACTION CALLBACKS ===
        this.onClick = options.onClick ?? null;
        this.onDrag = options.onDrag ?? null;
        this.onWheel = options.onWheel ?? null;
        
        // === LIFECYCLE CALLBACKS ===
        this.onResize = options.onResize ?? null;
        this.onMount = options.onMount ?? null;
        this.onDestroy = options.onDestroy ?? null;
        
        // === HUD CONFIG ===
        this.hud = options.hud ?? [];
        
        // === INTERNAL STATE ===
        this.canvasEl = null;
        this.ctx = null;
        this.viewportEl = null;  // Container for overflow clipping
        this.hudComponents = [];
        
        // Transform state (for CSS transform)
        this.transform = {
            x: 0,
            y: 0,
            scale: 1,
            isDragging: false,
            startX: 0,
            startY: 0
        };
        
        // Interaction state
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // Bound event handlers for cleanup
        this._boundHandlers = {};
    }
    
    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F ?? 14;
        
        // Outer container - fills parent for display modes to work correctly
        this.element = this.createElement('div', 'canvas-container component');
        this.element.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            background: var(--c-bg);
            box-sizing: border-box;
            overflow: hidden;
        `;
        
        // Viewport container (clips overflow for zoom/pan)
        this.viewportEl = this.createElement('div', 'canvas-viewport');
        this.viewportEl.style.cssText = `
            position: absolute;
            inset: 0;
            overflow: hidden;
        `;
        
        // Canvas element - scaled by DPR for sharp rendering on high-DPI displays
        this.canvasEl = this.createElement('canvas', 'canvas-element');
        
        // Buffer size = logical size × DPR
        this.canvasEl.width = this.width * this.dpr;
        this.canvasEl.height = this.height * this.dpr;
        
        // CSS size = logical size (CSS handles the scaling)
        this.canvasEl.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: ${this.width}px;
            height: ${this.height}px;
            transform-origin: 0 0;
        `;
        
        // Get context
        if (this.contextType === 'webgl') {
            this.ctx = this.canvasEl.getContext('webgl') || this.canvasEl.getContext('experimental-webgl');
        } else {
            this.ctx = this.canvasEl.getContext('2d');
            // Scale context so drawing operations use logical coordinates
            if (this.dpr !== 1) {
                this.ctx.scale(this.dpr, this.dpr);
            }
        }
        
        this.viewportEl.appendChild(this.canvasEl);
        this.element.appendChild(this.viewportEl);
        
        // Setup features based on flags
        if (this.interactive) {
            this._setupInteraction();
        }
        
        if (this.enableZoom || this.enablePan) {
            this._setupZoomPan();
        }
        
        if (this.enableHUD && this.hud.length > 0) {
            this._setupHUD(F);
        }
        
        // Initial draw
        if (this.draw) {
            this.redraw();
        }
        
        // Apply display mode after a frame to ensure viewport has dimensions
        requestAnimationFrame(() => {
            this._applyDisplayMode();
        });
        
        // Call mount callback
        if (this.onMount) {
            this.onMount();
        }
        
        return this.element;
    }
    
    // =========================================================================
    // SIZE MANAGEMENT
    // =========================================================================
    
    _updateContainerSize() {
        if (this.aspectRatio) {
            this.height = Math.round(this.width / this.aspectRatio);
        }
        
        // Container now fills parent - no fixed dimensions needed
        // Canvas element gets its resolution from this.width/this.height
        // Display mode CSS handles visual sizing
    }
    
    /**
     * Resize canvas and notify listeners
     */
    resize(width, height, options = {}) {
        const oldWidth = this.width;
        const oldHeight = this.height;
        
        this.width = width;
        this.height = height ?? (this.aspectRatio 
            ? Math.round(width / this.aspectRatio) 
            : width);
        
        // Update canvas buffer resolution (scaled by DPR)
        if (this.canvasEl) {
            this.canvasEl.width = this.width * this.dpr;
            this.canvasEl.height = this.height * this.dpr;
            this.canvasEl.style.width = `${this.width}px`;
            this.canvasEl.style.height = `${this.height}px`;
            
            // Re-apply DPR scale to context
            if (this.contextType === '2d' && this.ctx && this.dpr !== 1) {
                this.ctx.scale(this.dpr, this.dpr);
            }
        }
        
        // Update container size
        this._updateContainerSize();
        
        // Reapply display mode
        this._applyDisplayMode();
        
        // Reset transform if requested
        if (options.resetTransform) {
            this.resetTransform(false); // Don't redraw yet
        }
        
        // Notify listener
        if (this.onResize) {
            this.onResize(this.width, this.height, oldWidth, oldHeight);
        }
        
        // Redraw
        this.redraw();
    }
    
    // =========================================================================
    // DISPLAY MODE
    // =========================================================================
    
    _applyDisplayMode() {
        if (!this.canvasEl || !this.viewportEl) return;
        
        const mode = this.displayMode || 'auto';
        
        // Use LOGICAL dimensions (not buffer dimensions which are DPR-scaled)
        const canvasWidth = this.width;
        const canvasHeight = this.height;
        
        // Get viewport dimensions
        const viewportRect = this.viewportEl.getBoundingClientRect();
        const viewportWidth = viewportRect.width || canvasWidth;
        const viewportHeight = viewportRect.height || canvasHeight;
        
        // Calculate scale and position based on mode
        let scale = 1;
        let x = 0;
        let y = 0;
        
        switch (mode) {
            case 'fit':
                // Scale to fit entirely within viewport, maintaining aspect ratio
                const fitScaleX = viewportWidth / canvasWidth;
                const fitScaleY = viewportHeight / canvasHeight;
                scale = Math.min(fitScaleX, fitScaleY);
                // Center the canvas
                x = (viewportWidth - canvasWidth * scale) / 2;
                y = (viewportHeight - canvasHeight * scale) / 2;
                break;
                
            case 'fill':
                // Scale to fill viewport completely (may crop)
                const fillScaleX = viewportWidth / canvasWidth;
                const fillScaleY = viewportHeight / canvasHeight;
                scale = Math.max(fillScaleX, fillScaleY);
                // Center the canvas
                x = (viewportWidth - canvasWidth * scale) / 2;
                y = (viewportHeight - canvasHeight * scale) / 2;
                break;
                
            case 'actual':
                // 1:1 pixel size, centered
                scale = 1;
                x = (viewportWidth - canvasWidth) / 2;
                y = (viewportHeight - canvasHeight) / 2;
                break;
                
            case 'auto':
            default:
                // Same as actual - 1:1 centered
                scale = 1;
                x = (viewportWidth - canvasWidth) / 2;
                y = (viewportHeight - canvasHeight) / 2;
                break;
        }
        
        // Update transform state
        this.transform.x = x;
        this.transform.y = y;
        this.transform.scale = scale;
        
        // Apply the transform
        this._applyViewportTransform();
    }
    
    setDisplayMode(mode) {
        if (!['auto', 'fit', 'fill', 'actual'].includes(mode)) {
            console.warn(`Canvas: Invalid display mode '${mode}', using 'auto'`);
            mode = 'auto';
        }
        this.displayMode = mode;
        
        // Recalculate after a frame to ensure viewport dimensions are current
        requestAnimationFrame(() => {
            this._applyDisplayMode();
        });
    }
    
    // =========================================================================
    // ZOOM/PAN (CSS TRANSFORM)
    // =========================================================================
    
    _setupZoomPan() {
        // Store bound handlers for cleanup
        this._boundHandlers.wheelZoom = (e) => this._handleWheelZoom(e);
        this._boundHandlers.mousedownPan = (e) => this._handleMousedownPan(e);
        this._boundHandlers.mousemovePan = (e) => this._handleMousemovePan(e);
        this._boundHandlers.mouseupPan = (e) => this._handleMouseupPan(e);
        this._boundHandlers.keydown = (e) => this._handleKeydown(e);
        
        // Attach to viewport (container) so events work on empty space too
        const target = this.viewportEl || this.canvasEl;
        
        // Wheel for zoom
        target.addEventListener('wheel', this._boundHandlers.wheelZoom, { passive: false });
        
        // Pan with drag - start on viewport, move/up on document
        target.addEventListener('mousedown', this._boundHandlers.mousedownPan);
        document.addEventListener('mousemove', this._boundHandlers.mousemovePan);
        document.addEventListener('mouseup', this._boundHandlers.mouseupPan);
        
        // Keyboard shortcuts (global, checks hover)
        document.addEventListener('keydown', this._boundHandlers.keydown);
        
        // Set cursor on viewport
        if (this.enablePan) {
            target.style.cursor = 'grab';
        }
    }
    
    _handleWheelZoom(e) {
        if (!this.enableZoom) return;
        e.preventDefault();
        
        const rect = this.canvasEl.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomFactor = e.deltaY < 0 ? (1 + this.zoomSpeed) : (1 - this.zoomSpeed);
        this._zoomToPoint(mouseX, mouseY, zoomFactor);
    }
    
    _handleMousedownPan(e) {
        if (!this.enablePan) return;
        if (e.button !== 0 && e.button !== 1) return; // Left or middle click
        
        e.preventDefault();
        this.transform.isDragging = true;
        this.transform.startX = e.clientX - this.transform.x;
        this.transform.startY = e.clientY - this.transform.y;
        const target = this.viewportEl || this.canvasEl;
        target.style.cursor = 'grabbing';
    }
    
    _handleMousemovePan(e) {
        if (!this.transform.isDragging) return;
        
        this.transform.x = e.clientX - this.transform.startX;
        this.transform.y = e.clientY - this.transform.startY;
        this._applyViewportTransform();
    }
    
    _handleMouseupPan() {
        if (this.transform.isDragging) {
            this.transform.isDragging = false;
            const target = this.viewportEl || this.canvasEl;
            target.style.cursor = this.enablePan ? 'grab' : 'default';
        }
    }
    
    _handleKeydown(e) {
        const target = this.viewportEl || this.canvasEl;
        if (!target.matches(':hover')) return;
        
        if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            this.zoom(1 + this.zoomSpeed);
        } else if (e.key === '-' || e.key === '_') {
            e.preventDefault();
            this.zoom(1 - this.zoomSpeed);
        } else if (e.key === '0') {
            e.preventDefault();
            this.resetTransform();
        }
    }
    
    _zoomToPoint(x, y, factor) {
        const oldScale = this.transform.scale;
        const newScale = Math.max(this.minZoom, Math.min(this.maxZoom, oldScale * factor));
        
        if (newScale === oldScale) return;
        
        // Adjust pan to zoom towards point
        this.transform.x = x - (x - this.transform.x) * (newScale / oldScale);
        this.transform.y = y - (y - this.transform.y) * (newScale / oldScale);
        this.transform.scale = newScale;
        
        this._applyViewportTransform();
    }
    
    /**
     * Apply CSS transform - NO redraw, GPU compositing only
     * Transform origin is 0,0 (top-left), so translate positions the canvas
     * and scale enlarges/shrinks from top-left corner
     */
    _applyViewportTransform() {
        if (!this.canvasEl) return;
        
        const { x, y, scale } = this.transform;
        // Use translate3d for GPU acceleration, scale from transform-origin (0,0)
        this.canvasEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }
    
    /**
     * Reset viewport transform
     */
    resetTransform(shouldRedraw = true) {
        this.transform.x = 0;
        this.transform.y = 0;
        this.transform.scale = 1;
        this._applyViewportTransform();
        
        if (shouldRedraw) {
            this.redraw();
        }
    }
    
    /**
     * Zoom by factor (relative to current scale)
     */
    zoom(factor) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        this._zoomToPoint(centerX, centerY, factor);
    }
    
    /**
     * Pan by offset
     */
    pan(dx, dy) {
        this.transform.x += dx;
        this.transform.y += dy;
        this._applyViewportTransform();
    }
    
    // =========================================================================
    // INTERACTION
    // =========================================================================
    
    _setupInteraction() {
        // Store bound handlers
        this._boundHandlers.click = (e) => this._handleClick(e);
        this._boundHandlers.interactionMousedown = (e) => this._handleInteractionMousedown(e);
        this._boundHandlers.interactionMousemove = (e) => this._handleInteractionMousemove(e);
        this._boundHandlers.interactionMouseup = () => this._handleInteractionMouseup();
        this._boundHandlers.wheel = (e) => this._handleWheel(e);
        
        this.canvasEl.addEventListener('click', this._boundHandlers.click);
        this.canvasEl.addEventListener('mousedown', this._boundHandlers.interactionMousedown);
        document.addEventListener('mousemove', this._boundHandlers.interactionMousemove);
        document.addEventListener('mouseup', this._boundHandlers.interactionMouseup);
        
        if (this.onWheel) {
            this.canvasEl.addEventListener('wheel', this._boundHandlers.wheel, { passive: false });
        }
        
        this.canvasEl.style.cursor = this.onDrag ? 'grab' : 'default';
    }
    
    _handleClick(e) {
        if (this.onClick && !this.isDragging) {
            const coords = this._screenToCanvas(e.clientX, e.clientY);
            this.onClick(coords.x, coords.y, e);
        }
    }
    
    _handleInteractionMousedown(e) {
        if (this.onDrag) {
            this.isDragging = true;
            const coords = this._screenToCanvas(e.clientX, e.clientY);
            this.lastX = coords.x;
            this.lastY = coords.y;
            this.canvasEl.style.cursor = 'grabbing';
        }
    }
    
    _handleInteractionMousemove(e) {
        if (this.isDragging && this.onDrag) {
            const coords = this._screenToCanvas(e.clientX, e.clientY);
            const dx = coords.x - this.lastX;
            const dy = coords.y - this.lastY;
            this.onDrag(coords.x, coords.y, dx, dy, e);
            this.lastX = coords.x;
            this.lastY = coords.y;
        }
    }
    
    _handleInteractionMouseup() {
        if (this.isDragging) {
            this.isDragging = false;
            this.canvasEl.style.cursor = this.onDrag ? 'grab' : 'default';
        }
    }
    
    _handleWheel(e) {
        if (this.onWheel) {
            e.preventDefault();
            this.onWheel(e.deltaY, e);
        }
    }
    
    /**
     * Convert screen coordinates to canvas coordinates
     * Accounts for CSS transform
     */
    _screenToCanvas(screenX, screenY) {
        const rect = this.canvasEl.getBoundingClientRect();
        
        // Get position relative to canvas element's visual position
        const relX = screenX - rect.left;
        const relY = screenY - rect.top;
        
        // Scale from CSS size to canvas resolution
        const scaleX = this.canvasEl.width / rect.width;
        const scaleY = this.canvasEl.height / rect.height;
        
        return {
            x: Math.floor(relX * scaleX),
            y: Math.floor(relY * scaleY)
        };
    }
    
    // =========================================================================
    // HUD
    // =========================================================================
    
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
            z-index: 10;
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
    
    updateHUD(index, value) {
        if (this.hudComponents[index]) {
            this.hudComponents[index].setValue(value);
        }
    }
    
    // =========================================================================
    // DRAWING
    // =========================================================================
    
    /**
     * Trigger redraw - calls draw callback
     */
    redraw() {
        if (this.draw && this.ctx) {
            this.clear();
            this.draw(this.ctx, this.width, this.height);
        }
    }
    
    /**
     * Clear canvas - uses logical dimensions (context is DPR-scaled)
     */
    clear() {
        if (!this.ctx) return;
        
        if (this.contextType === '2d') {
            // Save, reset, clear at full buffer size, restore
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
            this.ctx.restore();
        } else {
            this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
        }
    }
    
    // =========================================================================
    // PUBLIC API
    // =========================================================================
    
    getContext() {
        return this.ctx;
    }
    
    getCanvas() {
        return this.canvasEl;
    }
    
    getImageData() {
        if (this.contextType === '2d') {
            return this.ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
        }
        return null;
    }
    
    /**
     * Put ImageData onto canvas
     * @param {ImageData} imageData - ImageData to display
     * @param {number} x - X offset (default 0)
     * @param {number} y - Y offset (default 0)
     */
    setImageData(imageData, x = 0, y = 0) {
        if (this.contextType === '2d' && this.ctx && imageData) {
            this.ctx.putImageData(imageData, x, y);
        }
    }
    
    getTransform() {
        return {
            x: this.transform.x,
            y: this.transform.y,
            scale: this.transform.scale
        };
    }
    
    setTransform(x, y, scale) {
        this.transform.x = x;
        this.transform.y = y;
        this.transform.scale = Math.max(this.minZoom, Math.min(this.maxZoom, scale));
        this._applyViewportTransform();
    }
    
    toDataURL(type = 'image/png', quality = 1) {
        return this.canvasEl?.toDataURL(type, quality) ?? '';
    }
    
    /**
     * Get canvas content as Blob
     * @param {string} type - MIME type (default 'image/png')
     * @param {number} quality - Quality 0-1 for JPEG (default 1)
     * @returns {Promise<Blob>}
     */
    toBlob(type = 'image/png', quality = 1) {
        return new Promise((resolve) => {
            if (!this.canvasEl) {
                resolve(null);
                return;
            }
            this.canvasEl.toBlob(resolve, type, quality);
        });
    }
    
    /**
     * Download canvas as file
     * @param {string} filename - Filename for download
     */
    download(filename = 'canvas.png') {
        const url = this.toDataURL();
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
    }
    
    // =========================================================================
    // LIFECYCLE
    // =========================================================================
    
    destroy() {
        // Call destroy callback
        if (this.onDestroy) {
            this.onDestroy();
        }
        
        // Remove document-level event listeners
        if (this._boundHandlers.mousemovePan) {
            document.removeEventListener('mousemove', this._boundHandlers.mousemovePan);
        }
        if (this._boundHandlers.mouseupPan) {
            document.removeEventListener('mouseup', this._boundHandlers.mouseupPan);
        }
        if (this._boundHandlers.keydown) {
            document.removeEventListener('keydown', this._boundHandlers.keydown);
        }
        if (this._boundHandlers.interactionMousemove) {
            document.removeEventListener('mousemove', this._boundHandlers.interactionMousemove);
        }
        if (this._boundHandlers.interactionMouseup) {
            document.removeEventListener('mouseup', this._boundHandlers.interactionMouseup);
        }
        
        // Clear bound handlers
        this._boundHandlers = {};
        
        // Destroy HUD components
        this.hudComponents.forEach(c => c.destroy());
        this.hudComponents = [];
        
        super.destroy();
    }
}
