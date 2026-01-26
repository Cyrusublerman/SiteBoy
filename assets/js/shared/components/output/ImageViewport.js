/**
 * ImageViewport — Image display with zoom/pan/display modes
 * 
 * Displays ImageData with proper viewport controls using CSS transforms.
 * Canvas resolution remains constant (= image size), zoom/pan affects CSS only.
 * 
 * Features:
 * - Display modes: fit (contain), fill (cover), actual (1:1 pixels)
 * - CSS-based zoom/pan (NOT context transform)
 * - Coordinate transforms (screen ↔ image space)
 * - Pixel grid overlay (actual mode)
 * - Eyedropper support via click callback
 * - Keyboard shortcuts (+, -, 0)
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class ImageViewport extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'image-viewport' }, deps);
        
        // Sizing
        this.width = options.width ?? 400;
        this.height = options.height ?? 400;
        
        // Display mode
        this.displayMode = options.displayMode ?? 'fit'; // 'fit' | 'fill' | 'actual'
        
        // Zoom/Pan
        this.enableZoom = options.enableZoom ?? false;
        this.enablePan = options.enablePan ?? false;
        this.minZoom = options.minZoom ?? 0.1;
        this.maxZoom = options.maxZoom ?? 10;
        this.zoomSpeed = options.zoomSpeed ?? 0.1;
        
        // Visual options
        this.showPixelGrid = options.showPixelGrid ?? false;
        this.bgColor = options.bgColor ?? 'var(--c-bg)';
        
        // Callbacks
        this.onPixelClick = options.onPixelClick ?? null;
        
        // Transform state
        this.transform = {
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            isDragging: false,
            startX: 0,
            startY: 0
        };
        
        // State
        this.canvasEl = null;
        this.ctx = null;
        this.imageData = null;
        this.containerEl = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const F = this.deps.MF?.F ?? 14;
        
        // Container
        this.element = this.createElement('div', 'image-viewport-container');
        this.element.style.cssText = `
            position: relative;
            width: ${this.width}px;
            height: ${this.height}px;
            overflow: hidden;
            background: ${this.bgColor};
            border: 1px solid var(--c-border);
            box-sizing: border-box;
        `;
        
        // Canvas wrapper (for centering/positioning)
        this.containerEl = this.createElement('div', 'image-viewport-canvas-wrapper');
        this.containerEl.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        `;
        
        // Canvas element (data canvas - resolution = image size)
        this.canvasEl = this.createElement('canvas', 'image-viewport-canvas');
        this.canvasEl.style.cssText = `
            display: block;
            transform-origin: center center;
            transition: transform 0.1s ease-out;
        `;
        
        this.ctx = this.canvasEl.getContext('2d', { willReadFrequently: true });
        
        this.containerEl.appendChild(this.canvasEl);
        this.element.appendChild(this.containerEl);
        
        // Apply initial display mode
        this._applyDisplayMode();
        
        // Setup interaction
        if (this.enableZoom || this.enablePan || this.onPixelClick) {
            this._setupInteraction();
        }
        
        return this.element;
    }
    
    /**
     * Set image data to display
     * Canvas resolution will match image dimensions exactly
     */
    setImageData(imageData) {
        if (!imageData) return;
        
        this.imageData = imageData;
        
        // Set canvas resolution to match image (constant, never changes)
        this.canvasEl.width = imageData.width;
        this.canvasEl.height = imageData.height;
        
        // Draw image data
        this.ctx.putImageData(imageData, 0, 0);
        
        // Reset transform when new image loaded
        this.resetView();
        
        window.debugLog('TOOLS', `ImageViewport: Image loaded ${imageData.width}×${imageData.height}`);
    }
    
    /**
     * Get current image data
     */
    getImageData() {
        if (!this.canvasEl) return null;
        return this.ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
    }
    
    /**
     * Set display mode
     */
    setDisplayMode(mode) {
        if (!['fit', 'fill', 'actual'].includes(mode)) {
            window.debugLog('TOOLS', `ImageViewport: Invalid display mode '${mode}', defaulting to 'fit'`);
            mode = 'fit';
        }
        
        this.displayMode = mode;
        this._applyDisplayMode();
        
        window.debugLog('TOOLS', `ImageViewport: Display mode set to '${mode}'`);
    }
    
    /**
     * Apply display mode via CSS
     */
    _applyDisplayMode() {
        if (!this.canvasEl) return;
        
        // Remove all mode classes
        this.element.classList.remove('mode-fit', 'mode-fill', 'mode-actual');
        this.element.classList.add(`mode-${this.displayMode}`);
        
        switch (this.displayMode) {
            case 'fit':
                // Scale to fit container, maintain aspect ratio
                this.canvasEl.style.maxWidth = '100%';
                this.canvasEl.style.maxHeight = '100%';
                this.canvasEl.style.width = 'auto';
                this.canvasEl.style.height = 'auto';
                this.canvasEl.style.imageRendering = 'auto';
                break;
                
            case 'fill':
                // Scale to fill container, may crop
                this.canvasEl.style.maxWidth = 'none';
                this.canvasEl.style.maxHeight = 'none';
                this.canvasEl.style.width = '100%';
                this.canvasEl.style.height = '100%';
                this.canvasEl.style.imageRendering = 'auto';
                break;
                
            case 'actual':
                // 1:1 pixel ratio, pixelated rendering
                this.canvasEl.style.maxWidth = 'none';
                this.canvasEl.style.maxHeight = 'none';
                this.canvasEl.style.width = `${this.canvasEl.width}px`;
                this.canvasEl.style.height = `${this.canvasEl.height}px`;
                this.canvasEl.style.imageRendering = 'pixelated';
                break;
        }
    }
    
    /**
     * Setup interaction handlers
     */
    _setupInteraction() {
        // Zoom with wheel
        if (this.enableZoom) {
            this.canvasEl.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY;
                const zoomFactor = delta < 0 ? (1 + this.zoomSpeed) : (1 - this.zoomSpeed);
                this.zoom(zoomFactor);
            }, { passive: false });
        }
        
        // Pan with drag
        if (this.enablePan) {
            this.canvasEl.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return; // Left click only
                
                this.transform.isDragging = true;
                this.transform.startX = e.clientX - this.transform.offsetX;
                this.transform.startY = e.clientY - this.transform.offsetY;
                this.canvasEl.style.cursor = 'grabbing';
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!this.transform.isDragging) return;
                
                this.transform.offsetX = e.clientX - this.transform.startX;
                this.transform.offsetY = e.clientY - this.transform.startY;
                this._updateTransform();
            });
            
            document.addEventListener('mouseup', () => {
                if (this.transform.isDragging) {
                    this.transform.isDragging = false;
                    this.canvasEl.style.cursor = this.enablePan ? 'grab' : 'default';
                }
            });
            
            // Set initial cursor
            this.canvasEl.style.cursor = 'grab';
        }
        
        // Click for pixel picking (eyedropper)
        if (this.onPixelClick) {
            this.canvasEl.addEventListener('click', (e) => {
                const coords = this.screenToImage(e.clientX, e.clientY);
                if (coords) {
                    this.onPixelClick(coords.x, coords.y);
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.element.matches(':hover') && !this.canvasEl.matches(':hover')) return;
            
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                this.zoom(1 + this.zoomSpeed);
            } else if (e.key === '-' || e.key === '_') {
                e.preventDefault();
                this.zoom(1 - this.zoomSpeed);
            } else if (e.key === '0') {
                e.preventDefault();
                this.resetView();
            }
        });
        
        // Double-click to reset
        this.canvasEl.addEventListener('dblclick', () => {
            this.resetView();
        });
    }
    
    /**
     * Zoom by factor (relative to current scale)
     */
    zoom(factor) {
        if (!this.enableZoom) return;
        
        const newScale = this.transform.scale * factor;
        const clampedScale = Math.max(this.minZoom, Math.min(this.maxZoom, newScale));
        
        this.transform.scale = clampedScale;
        this._updateTransform();
        
        window.debugLog('VERBOSE', `ImageViewport: Zoom ${this.transform.scale.toFixed(2)}×`);
    }
    
    /**
     * Pan by offset
     */
    pan(dx, dy) {
        if (!this.enablePan) return;
        
        this.transform.offsetX += dx;
        this.transform.offsetY += dy;
        this._updateTransform();
    }
    
    /**
     * Reset view to default (1× zoom, centered)
     */
    resetView() {
        this.transform.scale = 1;
        this.transform.offsetX = 0;
        this.transform.offsetY = 0;
        this._updateTransform();
        
        window.debugLog('TOOLS', 'ImageViewport: View reset');
    }
    
    /**
     * Update canvas CSS transform
     */
    _updateTransform() {
        if (!this.canvasEl) return;
        
        const { scale, offsetX, offsetY } = this.transform;
        
        // Apply CSS transform (NOT context transform)
        this.canvasEl.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }
    
    /**
     * Convert screen coordinates to image coordinates
     * Accounts for CSS transforms and display mode
     */
    screenToImage(screenX, screenY) {
        if (!this.canvasEl || !this.imageData) return null;
        
        const rect = this.canvasEl.getBoundingClientRect();
        
        // Check if click is within canvas bounds
        if (screenX < rect.left || screenX > rect.right || 
            screenY < rect.top || screenY > rect.bottom) {
            return null;
        }
        
        // Convert screen coords to canvas coords
        const canvasX = screenX - rect.left;
        const canvasY = screenY - rect.top;
        
        // Scale from CSS size to canvas resolution
        const scaleX = this.canvasEl.width / rect.width;
        const scaleY = this.canvasEl.height / rect.height;
        
        const imageX = Math.floor(canvasX * scaleX);
        const imageY = Math.floor(canvasY * scaleY);
        
        // Clamp to image bounds
        const clampedX = Math.max(0, Math.min(this.imageData.width - 1, imageX));
        const clampedY = Math.max(0, Math.min(this.imageData.height - 1, imageY));
        
        return { x: clampedX, y: clampedY };
    }
    
    /**
     * Export canvas as data URL
     */
    toDataURL(type = 'image/png', quality = 1) {
        if (!this.canvasEl) return '';
        return this.canvasEl.toDataURL(type, quality);
    }
    
    /**
     * Resize viewport container
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        
        if (this.element) {
            this.element.style.width = `${width}px`;
            this.element.style.height = `${height}px`;
        }
    }
    
    /**
     * Get current transform state
     */
    getTransform() {
        return {
            scale: this.transform.scale,
            offsetX: this.transform.offsetX,
            offsetY: this.transform.offsetY
        };
    }
    
    /**
     * Set transform state
     */
    setTransform(scale, offsetX, offsetY) {
        this.transform.scale = Math.max(this.minZoom, Math.min(this.maxZoom, scale));
        this.transform.offsetX = offsetX;
        this.transform.offsetY = offsetY;
        this._updateTransform();
    }
    
    destroy() {
        // Cleanup handled by BaseComponent
        super.destroy();
    }
}
