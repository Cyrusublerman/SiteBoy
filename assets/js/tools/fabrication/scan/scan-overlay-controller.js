/**
 * Scan Overlay Controller
 * 
 * Manages interactive overlay state for aligning calibration grids with scans.
 * Handles drag, resize, and rotation interactions on canvas.
 * 
 * This is a tool-specific module (stateful, UI-focused).
 * Uses algorithms from grid-scan-transform.js for coordinate math.
 * 
 * @class ScanOverlayController
 */

import {
    transformGridToScan,
    calculateTileRectsInScan,
    calculateGridBoundsInScan,
    calculateAutoFitTransform
} from '../../../shared/algorithms/geometry/grid-scan-transform.js';

export class ScanOverlayController {
    constructor(gridConfig, scanDimensions) {
        this.gridConfig = gridConfig;
        this.scanDimensions = scanDimensions;
        
        // Transform state
        this.transform = calculateAutoFitTransform(gridConfig, scanDimensions);
        
        // Interaction state
        this.isDragging = false;
        this.isResizing = false;
        this.dragStart = null;
        this.resizeHandle = null; // 'tl', 'tr', 'bl', 'br', 't', 'b', 'l', 'r'
        
        // Visibility toggles
        this.showGrid = true;
        this.showTileNumbers = false;
        this.showBounds = true;
        
        // Handle size for resize interactions
        this.handleSize = 10;
    }
    
    /**
     * Get current transform state
     * @returns {Object} Transform parameters
     */
    getTransform() {
        return { ...this.transform };
    }
    
    /**
     * Set transform state
     * @param {Object} transform - New transform parameters
     */
    setTransform(transform) {
        this.transform = { ...this.transform, ...transform };
    }
    
    /**
     * Reset transform to auto-fit
     */
    resetTransform() {
        this.transform = calculateAutoFitTransform(this.gridConfig, this.scanDimensions);
    }
    
    /**
     * Handle mouse down event
     * @param {Object} point - Mouse position {x, y} in canvas coordinates
     * @returns {boolean} True if interaction started
     */
    onMouseDown(point) {
        // Check if clicking on resize handle
        const handle = this._getHandleAtPoint(point);
        if (handle) {
            this.isResizing = true;
            this.resizeHandle = handle;
            this.dragStart = point;
            return true;
        }
        
        // Check if clicking inside grid bounds
        const bounds = calculateGridBoundsInScan(this.gridConfig, this.transform);
        if (this._isPointInRect(point, bounds)) {
            this.isDragging = true;
            this.dragStart = point;
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle mouse move event
     * @param {Object} point - Mouse position {x, y} in canvas coordinates
     */
    onMouseMove(point) {
        if (this.isDragging) {
            const dx = point.x - this.dragStart.x;
            const dy = point.y - this.dragStart.y;
            this.transform.offsetX += dx;
            this.transform.offsetY += dy;
            this.dragStart = point;
        } else if (this.isResizing) {
            this._handleResize(point);
        }
    }
    
    /**
     * Handle mouse up event
     */
    onMouseUp() {
        this.isDragging = false;
        this.isResizing = false;
        this.dragStart = null;
        this.resizeHandle = null;
    }
    
    /**
     * Get cursor style for current mouse position
     * @param {Object} point - Mouse position
     * @returns {string} CSS cursor value
     */
    getCursor(point) {
        const handle = this._getHandleAtPoint(point);
        if (handle) {
            const cursorMap = {
                'tl': 'nwse-resize', 'tr': 'nesw-resize',
                'bl': 'nesw-resize', 'br': 'nwse-resize',
                't': 'ns-resize', 'b': 'ns-resize',
                'l': 'ew-resize', 'r': 'ew-resize'
            };
            return cursorMap[handle];
        }
        
        const bounds = calculateGridBoundsInScan(this.gridConfig, this.transform);
        if (this._isPointInRect(point, bounds)) {
            return 'move';
        }
        
        return 'default';
    }
    
    /**
     * Render overlay on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} [options={}] - Rendering options
     */
    render(ctx, options = {}) {
        const {
            showGrid = this.showGrid,
            showTileNumbers = this.showTileNumbers,
            showBounds = this.showBounds,
            showHandles = true
        } = options;
        
        ctx.save();
        
        // Get all tile rectangles in scan space
        const tiles = calculateTileRectsInScan(this.gridConfig, this.transform);
        
        // Draw tiles
        if (showGrid) {
            tiles.forEach(tile => {
                const { rect, isEmpty } = tile;
                
                // Draw tile outline
                ctx.strokeStyle = isEmpty ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.7)';
                ctx.lineWidth = 1;
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                
                // Draw tile number
                if (showTileNumbers && !isEmpty) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.font = '10px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        tile.index.toString(),
                        rect.x + rect.width / 2,
                        rect.y + rect.height / 2
                    );
                }
            });
        }
        
        // Draw grid bounds
        if (showBounds) {
            const bounds = calculateGridBoundsInScan(this.gridConfig, this.transform);
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
            ctx.lineWidth = 2;
            ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }
        
        // Draw resize handles
        if (showHandles) {
            this._renderHandles(ctx);
        }
        
        ctx.restore();
    }
    
    /**
     * Get handle at point (for resize detection)
     * @private
     */
    _getHandleAtPoint(point) {
        const bounds = calculateGridBoundsInScan(this.gridConfig, this.transform);
        const handles = this._getHandlePositions(bounds);
        const threshold = this.handleSize;
        
        for (const [name, pos] of Object.entries(handles)) {
            const dist = Math.sqrt(
                Math.pow(point.x - pos.x, 2) + Math.pow(point.y - pos.y, 2)
            );
            if (dist <= threshold) {
                return name;
            }
        }
        
        return null;
    }
    
    /**
     * Get positions of all resize handles
     * @private
     */
    _getHandlePositions(bounds) {
        const { x, y, width, height } = bounds;
        return {
            'tl': { x, y },
            'tr': { x: x + width, y },
            'bl': { x, y: y + height },
            'br': { x: x + width, y: y + height },
            't': { x: x + width / 2, y },
            'b': { x: x + width / 2, y: y + height },
            'l': { x, y: y + height / 2 },
            'r': { x: x + width, y: y + height / 2 }
        };
    }
    
    /**
     * Render resize handles
     * @private
     */
    _renderHandles(ctx) {
        const bounds = calculateGridBoundsInScan(this.gridConfig, this.transform);
        const handles = this._getHandlePositions(bounds);
        
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.lineWidth = 1;
        
        for (const pos of Object.values(handles)) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.handleSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }
    
    /**
     * Handle resize interaction
     * @private
     */
    _handleResize(point) {
        const dx = point.x - this.dragStart.x;
        const dy = point.y - this.dragStart.y;
        
        const handle = this.resizeHandle;
        const bounds = calculateGridBoundsInScan(this.gridConfig, this.transform);
        
        // Calculate scale change based on handle
        switch (handle) {
            case 'br': // bottom-right: scale both
            case 'tr': // top-right
            case 'bl': // bottom-left
            case 'tl': // top-left
                {
                    const centerX = bounds.x + bounds.width / 2;
                    const centerY = bounds.y + bounds.height / 2;
                    const oldDist = Math.sqrt(
                        Math.pow(this.dragStart.x - centerX, 2) +
                        Math.pow(this.dragStart.y - centerY, 2)
                    );
                    const newDist = Math.sqrt(
                        Math.pow(point.x - centerX, 2) +
                        Math.pow(point.y - centerY, 2)
                    );
                    const scaleFactor = newDist / oldDist;
                    this.transform.scaleX *= scaleFactor;
                    this.transform.scaleY *= scaleFactor;
                }
                break;
            case 'r': // right edge: scale X only
            case 'l': // left edge
                {
                    const scaleFactor = 1 + (dx / bounds.width);
                    this.transform.scaleX *= scaleFactor;
                }
                break;
            case 't': // top edge: scale Y only
            case 'b': // bottom edge
                {
                    const scaleFactor = 1 + (dy / bounds.height);
                    this.transform.scaleY *= scaleFactor;
                }
                break;
        }
        
        this.dragStart = point;
    }
    
    /**
     * Check if point is inside rectangle
     * @private
     */
    _isPointInRect(point, rect) {
        return (
            point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height
        );
    }
    
    /**
     * Save transform to localStorage
     * @param {string} key - Storage key
     */
    saveTransform(key) {
        localStorage.setItem(key, JSON.stringify(this.transform));
    }
    
    /**
     * Load transform from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} True if loaded successfully
     */
    loadTransform(key) {
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                this.transform = JSON.parse(stored);
                return true;
            } catch (e) {
                console.error('Failed to parse stored transform:', e);
            }
        }
        return false;
    }
}

