/**
 * Canvas Utilities - SiteBoy Framework
 * 
 * Performance utilities for canvas rendering:
 * - Motion blur (fade overlay)
 * - Batch drawing (reduce draw calls)
 * - Interactive rotation (mouse/touch drag)
 * - Off-screen canvas helpers (image processing)
 * 
 * Based on DePasquale.art analysis findings.
 * 
 * @version 1.1.0
 */

/**
 * Create an off-screen canvas for image processing
 * Centralises document.createElement('canvas') calls
 * 
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}}
 */
export function createOffscreenCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
}

/**
 * Convert an image to ImageData using an off-screen canvas
 * 
 * @param {HTMLImageElement} img - Image to convert
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {ImageData}
 */
export function imageToImageData(img, width, height) {
    const { canvas, ctx } = createOffscreenCanvas(width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
}

/**
 * Apply motion blur by drawing a semi-transparent overlay
 * instead of clearing the canvas completely.
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} [alpha=0.02] - Opacity of fade (0-1, lower = longer trails)
 * @param {string} [color='#000000'] - Background color (VGA hex)
 */
export function applyMotionBlur(ctx, width, height, alpha = 0.02, color = '#000000') {
    // Parse hex color to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
}

/**
 * BatchDrawer - Batch multiple draw calls by style for performance
 * 
 * Instead of N separate beginPath/fill calls, groups by style
 * and draws all shapes with the same style in one call.
 * 
 * Usage:
 * ```javascript
 * const batch = new BatchDrawer(ctx);
 * for (const particle of particles) {
 *     batch.addRect(particle.x, particle.y, 2, 2, particle.color);
 * }
 * batch.flush();
 * ```
 */
export class BatchDrawer {
    /**
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.rectBatches = new Map(); // style -> [{x, y, w, h}, ...]
        this.arcBatches = new Map();  // style -> [{x, y, r, start, end}, ...]
    }
    
    /**
     * Add a rectangle to the batch
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} w - Width
     * @param {number} h - Height
     * @param {string} style - Fill style (VGA hex color)
     */
    addRect(x, y, w, h, style) {
        if (!this.rectBatches.has(style)) {
            this.rectBatches.set(style, []);
        }
        this.rectBatches.get(style).push({ x, y, w, h });
    }
    
    /**
     * Add an arc/circle to the batch
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} r - Radius
     * @param {number} [start=0] - Start angle (radians)
     * @param {number} [end=Math.PI*2] - End angle (radians)
     * @param {string} style - Fill style (VGA hex color)
     */
    addArc(x, y, r, style, start = 0, end = Math.PI * 2) {
        if (!this.arcBatches.has(style)) {
            this.arcBatches.set(style, []);
        }
        this.arcBatches.get(style).push({ x, y, r, start, end });
    }
    
    /**
     * Draw all batched shapes and clear batches
     */
    flush() {
        const ctx = this.ctx;
        
        // Draw all rectangles grouped by style
        for (const [style, rects] of this.rectBatches) {
            ctx.fillStyle = style;
            ctx.beginPath();
            for (const rect of rects) {
                ctx.rect(rect.x, rect.y, rect.w, rect.h);
            }
            ctx.fill();
        }
        
        // Draw all arcs grouped by style
        for (const [style, arcs] of this.arcBatches) {
            ctx.fillStyle = style;
            ctx.beginPath();
            for (const arc of arcs) {
                ctx.moveTo(arc.x + arc.r, arc.y);
                ctx.arc(arc.x, arc.y, arc.r, arc.start, arc.end);
            }
            ctx.fill();
        }
        
        this.clear();
    }
    
    /**
     * Clear all batches without drawing
     */
    clear() {
        this.rectBatches.clear();
        this.arcBatches.clear();
    }
}

/**
 * InteractiveRotation - Handle mouse/touch drag for 3D rotation
 * 
 * Tracks rotation state that can be used for 3D projection transforms.
 * 
 * Usage:
 * ```javascript
 * const rotation = new InteractiveRotation(canvas, {
 *     sensitivity: 0.01,
 *     onRotate: (rot) => tool.draw()
 * });
 * 
 * // In draw:
 * const { x, y } = rotation.getRotation();
 * // Apply rotation to 3D transforms
 * ```
 */
export class InteractiveRotation {
    /**
     * @param {HTMLCanvasElement} canvas - Canvas element to attach listeners to
     * @param {object} options - Configuration options
     * @param {number} [options.sensitivity=0.01] - Rotation sensitivity
     * @param {function} [options.onRotate] - Callback when rotation changes
     * @param {number} [options.initialX=0] - Initial X rotation (radians)
     * @param {number} [options.initialY=0] - Initial Y rotation (radians)
     */
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.sensitivity = options.sensitivity ?? 0.01;
        this.onRotate = options.onRotate ?? null;
        
        // Rotation state (radians)
        this.rotation = {
            x: options.initialX ?? 0,
            y: options.initialY ?? 0
        };
        
        // Drag state
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // Bind handlers for cleanup
        this._onMouseDown = this._handleMouseDown.bind(this);
        this._onMouseMove = this._handleMouseMove.bind(this);
        this._onMouseUp = this._handleMouseUp.bind(this);
        this._onTouchStart = this._handleTouchStart.bind(this);
        this._onTouchMove = this._handleTouchMove.bind(this);
        this._onTouchEnd = this._handleTouchEnd.bind(this);
        
        // Attach listeners
        this._attachListeners();
    }
    
    _attachListeners() {
        this.canvas.addEventListener('mousedown', this._onMouseDown);
        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
        
        this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
        document.addEventListener('touchmove', this._onTouchMove, { passive: false });
        document.addEventListener('touchend', this._onTouchEnd);
        
        this.canvas.style.cursor = 'grab';
    }
    
    _handleMouseDown(e) {
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
    }
    
    _handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        
        this.rotation.y += dx * this.sensitivity;
        this.rotation.x += dy * this.sensitivity;
        
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        
        if (this.onRotate) {
            this.onRotate(this.rotation);
        }
    }
    
    _handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        }
    }
    
    _handleTouchStart(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            this.isDragging = true;
            this.lastX = e.touches[0].clientX;
            this.lastY = e.touches[0].clientY;
        }
    }
    
    _handleTouchMove(e) {
        if (!this.isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const dx = touch.clientX - this.lastX;
        const dy = touch.clientY - this.lastY;
        
        this.rotation.y += dx * this.sensitivity;
        this.rotation.x += dy * this.sensitivity;
        
        this.lastX = touch.clientX;
        this.lastY = touch.clientY;
        
        if (this.onRotate) {
            this.onRotate(this.rotation);
        }
    }
    
    _handleTouchEnd() {
        this.isDragging = false;
    }
    
    /**
     * Get current rotation state
     * @returns {{x: number, y: number}} Rotation in radians
     */
    getRotation() {
        return { ...this.rotation };
    }
    
    /**
     * Set rotation directly
     * @param {number} x - X rotation (radians)
     * @param {number} y - Y rotation (radians)
     */
    setRotation(x, y) {
        this.rotation.x = x;
        this.rotation.y = y;
        if (this.onRotate) {
            this.onRotate(this.rotation);
        }
    }
    
    /**
     * Reset rotation to initial values
     */
    reset() {
        this.rotation.x = 0;
        this.rotation.y = 0;
        if (this.onRotate) {
            this.onRotate(this.rotation);
        }
    }
    
    /**
     * Clean up event listeners
     */
    destroy() {
        this.canvas.removeEventListener('mousedown', this._onMouseDown);
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);
        
        this.canvas.removeEventListener('touchstart', this._onTouchStart);
        document.removeEventListener('touchmove', this._onTouchMove);
        document.removeEventListener('touchend', this._onTouchEnd);
        
        this.canvas.style.cursor = '';
        this.onRotate = null;
    }
}

// Namespace export
export const CanvasUtils = {
    applyMotionBlur,
    BatchDrawer,
    InteractiveRotation,
    createOffscreenCanvas,
    imageToImageData
};

// UMD export for non-module usage (ToolBase compatibility)
if (typeof window !== 'undefined') {
    window.CanvasUtils = CanvasUtils;
    console.log('🎨 CanvasUtils v1.1.0 ready - Motion blur, batch drawing, interactive rotation, off-screen canvas');
}

