/**
 * IframeSandbox - Secure iframe component with Canvas.js viewport features
 * 
 * Provides sandboxed iframe with full Canvas.js presentation features:
 * - Display modes: auto/fit/fill/actual
 * - Zoom/pan controls (CSS transform)
 * - Proper lifecycle management
 * - Security isolation
 * 
 * USE FOR:
 * - Executing user-provided code (P5.js, Processing.js, etc.)
 * - Isolating untrusted scripts
 * - Cross-origin content display
 * 
 * @extends BaseComponent
 * @version 2.0.0 - Canvas.js feature parity
 */

import { BaseComponent } from '../../foundation.js';

export class IframeSandbox extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'iframe-sandbox' }, deps);
        
        // Configuration
        this.width = options.width ?? 500;
        this.height = options.height ?? 500;
        this.sandbox = options.sandbox ?? 'allow-scripts allow-same-origin';
        this.className = options.className ?? 'iframe-sandbox';
        
        // Canvas.js feature parity
        this.enableZoom = options.enableZoom ?? false;
        this.enablePan = options.enablePan ?? false;
        this.displayMode = options.displayMode ?? 'auto';
        this.minZoom = options.minZoom ?? 0.1;
        this.maxZoom = options.maxZoom ?? 10;
        this.zoomSpeed = options.zoomSpeed ?? 0.1;
        
        // Callbacks
        this.onMessage = options.onMessage ?? null;
        
        // State
        this.iframeEl = null;
        this.viewportEl = null;
        this._boundMessageHandler = null;
        this._boundHandlers = {};
        this._isVisible = true;
        
        // Transform state (matches Canvas.js)
        this.transform = {
            x: 0,
            y: 0,
            scale: 1,
            isDragging: false,
            startX: 0,
            startY: 0
        };
    }
    
    render() {
        if (this.element) return this.element;
        
        // Outer container (matches Canvas.js structure)
        this.element = this.createElement('div', 'iframe-sandbox-container');
        this.element.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            background: var(--c-bg);
            box-sizing: border-box;
            overflow: hidden;
        `;
        
        // Viewport container (clips overflow for zoom/pan)
        this.viewportEl = this.createElement('div', 'iframe-sandbox-viewport');
        this.viewportEl.style.cssText = `
            position: absolute;
            inset: 0;
            overflow: hidden;
        `;
        
        // Interaction overlay (captures events above iframe)
        this.overlayEl = this.createElement('div', 'iframe-sandbox-overlay');
        this.overlayEl.style.cssText = `
            position: absolute;
            inset: 0;
            z-index: 10;
            pointer-events: ${(this.enableZoom || this.enablePan) ? 'auto' : 'none'};
        `;
        
        // Iframe element - CSS transform handles scaling/positioning
        this.iframeEl = this.createElement('iframe', this.className);
        this.iframeEl.sandbox = this.sandbox;
        this.iframeEl.width = this.width;
        this.iframeEl.height = this.height;
        this.iframeEl.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: ${this.width}px;
            height: ${this.height}px;
            transform-origin: 0 0;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;
        
        // Setup message handler if callback provided
        if (this.onMessage) {
            this._boundMessageHandler = (e) => {
                if (this.iframeEl && e.source === this.iframeEl.contentWindow) {
                    this.onMessage(e);
                }
            };
            window.addEventListener('message', this._boundMessageHandler);
        }
        
        this.viewportEl.appendChild(this.iframeEl);
        this.viewportEl.appendChild(this.overlayEl);  // Overlay on top
        this.element.appendChild(this.viewportEl);
        
        // Setup zoom/pan if enabled
        if (this.enableZoom || this.enablePan) {
            this._setupZoomPan();
        }
        
        // Apply display mode after a frame
        requestAnimationFrame(() => {
            this._applyDisplayMode();
        });
        
        return this.element;
    }
    
    // =========================================================================
    // DISPLAY MODE (matches Canvas.js)
    // =========================================================================
    
    _applyDisplayMode() {
        if (!this.iframeEl || !this.viewportEl) return;
        
        const mode = this.displayMode || 'auto';
        
        // Get viewport dimensions
        const viewportRect = this.viewportEl.getBoundingClientRect();
        const viewportWidth = viewportRect.width || this.width;
        const viewportHeight = viewportRect.height || this.height;
        
        // Calculate scale and position based on mode
        let scale = 1;
        let x = 0;
        let y = 0;
        
        switch (mode) {
            case 'fit':
                // Scale to fit entirely within viewport
                const fitScaleX = viewportWidth / this.width;
                const fitScaleY = viewportHeight / this.height;
                scale = Math.min(fitScaleX, fitScaleY);
                x = (viewportWidth - this.width * scale) / 2;
                y = (viewportHeight - this.height * scale) / 2;
                break;
                
            case 'fill':
                // Scale to fill viewport completely
                const fillScaleX = viewportWidth / this.width;
                const fillScaleY = viewportHeight / this.height;
                scale = Math.max(fillScaleX, fillScaleY);
                x = (viewportWidth - this.width * scale) / 2;
                y = (viewportHeight - this.height * scale) / 2;
                break;
                
            case 'actual':
                // 1:1 pixel size, centered
                scale = 1;
                x = (viewportWidth - this.width) / 2;
                y = (viewportHeight - this.height) / 2;
                break;
                
            case 'auto':
            default:
                // Same as actual - 1:1 centered
                scale = 1;
                x = (viewportWidth - this.width) / 2;
                y = (viewportHeight - this.height) / 2;
                break;
        }
        
        this.transform.x = x;
        this.transform.y = y;
        this.transform.scale = scale;
        
        this._applyViewportTransform();
    }
    
    setDisplayMode(mode) {
        if (!['auto', 'fit', 'fill', 'actual'].includes(mode)) {
            console.warn(`IframeSandbox: Invalid display mode '${mode}', using 'auto'`);
            mode = 'auto';
        }
        this.displayMode = mode;
        
        requestAnimationFrame(() => {
            this._applyDisplayMode();
        });
    }
    
    // =========================================================================
    // ZOOM/PAN (matches Canvas.js)
    // =========================================================================
    
    _setupZoomPan() {
        this._boundHandlers.wheelZoom = (e) => this._handleWheelZoom(e);
        this._boundHandlers.mousedownPan = (e) => this._handleMousedownPan(e);
        this._boundHandlers.mousemovePan = (e) => this._handleMousemovePan(e);
        this._boundHandlers.mouseupPan = (e) => this._handleMouseupPan(e);
        this._boundHandlers.dblclick = () => this.resetTransform();
        this._boundHandlers.keydown = (e) => this._handleKeydown(e);
        
        // Wheel for zoom - on OVERLAY (captures events above iframe)
        if (this.enableZoom) {
            this.overlayEl.addEventListener('wheel', this._boundHandlers.wheelZoom, { passive: false });
        }
        
        // Pan with drag - on OVERLAY
        if (this.enablePan) {
            this.overlayEl.addEventListener('mousedown', this._boundHandlers.mousedownPan);
            document.addEventListener('mousemove', this._boundHandlers.mousemovePan);
            document.addEventListener('mouseup', this._boundHandlers.mouseupPan);
            this.overlayEl.style.cursor = 'grab';
        }
        
        // Double-click to reset
        this.overlayEl.addEventListener('dblclick', this._boundHandlers.dblclick);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this._boundHandlers.keydown);
    }
    
    _handleWheelZoom(e) {
        if (!this.enableZoom) return;
        e.preventDefault();
        
        const rect = this.iframeEl.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomFactor = e.deltaY < 0 ? (1 + this.zoomSpeed) : (1 - this.zoomSpeed);
        this._zoomToPoint(mouseX, mouseY, zoomFactor);
    }
    
    _handleMousedownPan(e) {
        if (!this.enablePan) return;
        if (e.button !== 0 && e.button !== 1) return;
        
        e.preventDefault();
        this.transform.isDragging = true;
        this.transform.startX = e.clientX - this.transform.x;
        this.transform.startY = e.clientY - this.transform.y;
        this.overlayEl.style.cursor = 'grabbing';
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
            this.overlayEl.style.cursor = this.enablePan ? 'grab' : 'default';
        }
    }
    
    _handleKeydown(e) {
        if (!this.overlayEl.matches(':hover')) return;
        
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
        
        this.transform.x = x - (x - this.transform.x) * (newScale / oldScale);
        this.transform.y = y - (y - this.transform.y) * (newScale / oldScale);
        this.transform.scale = newScale;
        
        this._applyViewportTransform();
    }
    
    _applyViewportTransform() {
        if (!this.iframeEl) return;
        
        const { x, y, scale } = this.transform;
        this.iframeEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }
    
    resetTransform() {
        this._applyDisplayMode(); // Reapply display mode (resets to initial state)
    }
    
    zoom(factor) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        this._zoomToPoint(centerX, centerY, factor);
    }
    
    pan(dx, dy) {
        this.transform.x += dx;
        this.transform.y += dy;
        this._applyViewportTransform();
    }
    
    // =========================================================================
    // CONTENT MANAGEMENT
    // =========================================================================
    
    setContent(html) {
        if (!this.iframeEl) {
            console.error('IframeSandbox: Cannot set content, iframe not rendered');
            return;
        }
        
        const doc = this.iframeEl.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
    }
    
    clear() {
        if (!this.iframeEl) return;
        
        const doc = this.iframeEl.contentWindow.document;
        doc.open();
        doc.write('');
        doc.close();
    }
    
    show() {
        if (!this.iframeEl) return;
        this._isVisible = true;
        this.iframeEl.classList.remove('iframe-sandbox--hidden');
    }
    
    hide() {
        if (!this.iframeEl) return;
        this._isVisible = false;
        this.iframeEl.classList.add('iframe-sandbox--hidden');
    }
    
    isVisible() {
        return this._isVisible;
    }
    
    getIframe() {
        return this.iframeEl;
    }
    
    getContentWindow() {
        return this.iframeEl?.contentWindow ?? null;
    }
    
    // =========================================================================
    // LIFECYCLE
    // =========================================================================
    
    destroy() {
        // Remove message handler
        if (this._boundMessageHandler) {
            window.removeEventListener('message', this._boundMessageHandler);
            this._boundMessageHandler = null;
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
        
        this._boundHandlers = {};
        
        // Clear iframe content
        this.clear();
        
        // Remove iframe
        if (this.iframeEl) {
            this.iframeEl.remove();
            this.iframeEl = null;
        }
        
        super.destroy();
    }
}
