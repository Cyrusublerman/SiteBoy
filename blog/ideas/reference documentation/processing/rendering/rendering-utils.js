/**
 * @fileoverview Rendering Utilities
 * 
 * Sprite caching, canvas optimization, and rendering helpers.
 * 
 * @module rendering/rendering-utils
 * @wikipedia https://en.wikipedia.org/wiki/Sprite_(computer_graphics)
 * @wikipedia https://en.wikipedia.org/wiki/Double_buffering
 * 
 * Optimization techniques:
 * - Sprite caching: LRU cache for repeated element rendering
 * - Double buffering: off-screen canvas for flicker-free updates
 * - Batch rendering: group fills by color to reduce state changes
 * - Dirty region tracking: partial updates for performance
 * 
 * Sampling methods:
 * - Jittered grid: stratified sampling with random offset
 * - Stratified: one sample per cell with random position
 */

// ═══════════════════════════════════════════════════════════════════════════
// SPRITE CACHING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a sprite cache for repeated rendering of similar elements
 * 
 * @param {number} maxSize - Maximum number of cached sprites
 * @returns {Object} Sprite cache API
 */
export function createSpriteCache(maxSize = 100) {
    const cache = new Map();
    const accessOrder = []; // LRU tracking
    
    /**
     * Get or create cached sprite
     * @param {string} key - Unique key for this sprite
     * @param {number} width - Sprite width
     * @param {number} height - Sprite height
     * @param {Function} renderFn - Function to render sprite: (ctx, width, height) => void
     * @returns {HTMLCanvasElement} Cached sprite canvas
     */
    function getSprite(key, width, height, renderFn) {
        if (cache.has(key)) {
            // Move to end of access order (most recently used)
            const idx = accessOrder.indexOf(key);
            if (idx > -1) {
                accessOrder.splice(idx, 1);
                accessOrder.push(key);
            }
            return cache.get(key);
        }
        
        // Create new sprite
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        renderFn(ctx, width, height);
        
        // Evict oldest if at capacity
        while (cache.size >= maxSize) {
            const oldest = accessOrder.shift();
            cache.delete(oldest);
        }
        
        cache.set(key, canvas);
        accessOrder.push(key);
        
        return canvas;
    }
    
    /**
     * Clear entire cache
     */
    function clear() {
        cache.clear();
        accessOrder.length = 0;
    }
    
    /**
     * Get cache statistics
     */
    function stats() {
        return {
            size: cache.size,
            maxSize,
            keys: [...cache.keys()]
        };
    }
    
    return { getSprite, clear, stats };
}

/**
 * Create an off-screen buffer for double-buffering
 * 
 * @param {number} width - Buffer width
 * @param {number} height - Buffer height
 * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D}}
 */
export function createOffscreenBuffer(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
}

// ═══════════════════════════════════════════════════════════════════════════
// PSEUDO-3D RENDERING HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate pseudo-3D gradient stops for tile shading
 * 
 * @param {string} baseColor - Base color in hex or CSS format
 * @param {number} lightAngle - Light angle in radians
 * @param {number} intensity - Shading intensity (0-1)
 * @returns {{highlight: string, midtone: string, shadow: string}} Color stops
 */
export function calculate3DShading(baseColor, lightAngle, intensity) {
    // Parse base color (simplified, assumes hex)
    let r, g, b;
    if (baseColor.startsWith('#')) {
        const hex = baseColor.slice(1);
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    } else {
        // Default gray
        r = g = b = 128;
    }
    
    const highlightFactor = 1 + intensity * 0.3;
    const shadowFactor = 1 - intensity * 0.4;
    
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    
    return {
        highlight: `rgb(${clamp(r * highlightFactor)}, ${clamp(g * highlightFactor)}, ${clamp(b * highlightFactor)})`,
        midtone: baseColor,
        shadow: `rgb(${clamp(r * shadowFactor)}, ${clamp(g * shadowFactor)}, ${clamp(b * shadowFactor)})`
    };
}

/**
 * Create beveled edge gradient for tile
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Tile X
 * @param {number} y - Tile Y
 * @param {number} width - Tile width
 * @param {number} height - Tile height
 * @param {string} baseColor - Base color
 * @param {number} bevelWidth - Width of bevel effect
 * @returns {void} Renders directly to context
 */
export function renderBeveledTile(ctx, x, y, width, height, baseColor, bevelWidth) {
    const shading = calculate3DShading(baseColor, Math.PI / 4, 0.5);
    
    // Main fill
    ctx.fillStyle = shading.midtone;
    ctx.fillRect(x, y, width, height);
    
    // Top highlight
    ctx.fillStyle = shading.highlight;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width - bevelWidth, y + bevelWidth);
    ctx.lineTo(x + bevelWidth, y + bevelWidth);
    ctx.closePath();
    ctx.fill();
    
    // Left highlight
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + bevelWidth, y + bevelWidth);
    ctx.lineTo(x + bevelWidth, y + height - bevelWidth);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
    
    // Bottom shadow
    ctx.fillStyle = shading.shadow;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + bevelWidth, y + height - bevelWidth);
    ctx.lineTo(x + width - bevelWidth, y + height - bevelWidth);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();
    
    // Right shadow
    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width - bevelWidth, y + height - bevelWidth);
    ctx.lineTo(x + width - bevelWidth, y + bevelWidth);
    ctx.closePath();
    ctx.fill();
}

/**
 * Add rim highlight effect
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array<{x, y}>} path - Path points
 * @param {string} color - Rim color
 * @param {number} width - Rim width
 * @param {number} alpha - Rim opacity (0-1)
 */
export function renderRimHighlight(ctx, path, color, width, alpha) {
    if (path.length < 2) return;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    
    ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
// CANVAS OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Batch similar drawing operations for performance
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @returns {Object} Batch drawing API
 */
export function createBatchRenderer(ctx) {
    const batches = {
        fills: new Map(),    // fillStyle -> [{path}]
        strokes: new Map()   // strokeStyle+lineWidth -> [{path}]
    };
    
    /**
     * Add filled rectangle to batch
     */
    function fillRect(x, y, w, h, color) {
        if (!batches.fills.has(color)) {
            batches.fills.set(color, []);
        }
        batches.fills.get(color).push({ x, y, w, h });
    }
    
    /**
     * Add filled circle to batch
     */
    function fillCircle(cx, cy, r, color) {
        if (!batches.fills.has(color)) {
            batches.fills.set(color, []);
        }
        batches.fills.get(color).push({ cx, cy, r, type: 'circle' });
    }
    
    /**
     * Flush all batched operations to canvas
     */
    function flush() {
        // Render fills grouped by color
        for (const [color, items] of batches.fills) {
            ctx.fillStyle = color;
            ctx.beginPath();
            
            for (const item of items) {
                if (item.type === 'circle') {
                    ctx.moveTo(item.cx + item.r, item.cy);
                    ctx.arc(item.cx, item.cy, item.r, 0, Math.PI * 2);
                } else {
                    ctx.rect(item.x, item.y, item.w, item.h);
                }
            }
            
            ctx.fill();
        }
        
        // Clear batches
        batches.fills.clear();
        batches.strokes.clear();
    }
    
    return { fillRect, fillCircle, flush };
}

/**
 * Create dirty rectangle tracker for partial updates
 * 
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Object} Dirty region tracker
 */
export function createDirtyRegionTracker(width, height) {
    let dirtyRegion = null;
    
    /**
     * Mark region as dirty
     */
    function markDirty(x, y, w, h) {
        const region = {
            x: Math.floor(x),
            y: Math.floor(y),
            w: Math.ceil(w),
            h: Math.ceil(h)
        };
        
        if (!dirtyRegion) {
            dirtyRegion = region;
        } else {
            // Expand to include new region
            const x1 = Math.min(dirtyRegion.x, region.x);
            const y1 = Math.min(dirtyRegion.y, region.y);
            const x2 = Math.max(dirtyRegion.x + dirtyRegion.w, region.x + region.w);
            const y2 = Math.max(dirtyRegion.y + dirtyRegion.h, region.y + region.h);
            
            dirtyRegion = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        }
    }
    
    /**
     * Get and clear dirty region
     */
    function getDirtyRegion() {
        const region = dirtyRegion;
        dirtyRegion = null;
        return region;
    }
    
    /**
     * Check if there are dirty regions
     */
    function isDirty() {
        return dirtyRegion !== null;
    }
    
    return { markDirty, getDirtyRegion, isDirty };
}

// ═══════════════════════════════════════════════════════════════════════════
// JITTERED SAMPLING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate jittered grid samples
 * 
 * @param {number} width - Area width
 * @param {number} height - Area height
 * @param {number} cellSize - Grid cell size
 * @param {number} [jitterAmount=0.5] - Jitter as fraction of cell (0-1)
 * @param {Function} [rng=Math.random] - Random number generator
 * @returns {Array<{x: number, y: number}>} Sample points
 */
export function jitteredGridSamples(width, height, cellSize, jitterAmount = 0.5, rng = Math.random) {
    const points = [];
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    const maxJitter = cellSize * jitterAmount * 0.5;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const baseX = (col + 0.5) * cellSize;
            const baseY = (row + 0.5) * cellSize;
            
            const jitterX = (rng() - 0.5) * 2 * maxJitter;
            const jitterY = (rng() - 0.5) * 2 * maxJitter;
            
            const x = Math.max(0, Math.min(width, baseX + jitterX));
            const y = Math.max(0, Math.min(height, baseY + jitterY));
            
            points.push({ x, y });
        }
    }
    
    return points;
}

/**
 * Generate stratified samples within bounds
 * 
 * @param {number} width - Area width
 * @param {number} height - Area height
 * @param {number} samplesX - Samples per row
 * @param {number} samplesY - Samples per column
 * @param {Function} [rng=Math.random] - Random number generator
 * @returns {Array<{x: number, y: number}>} Sample points
 */
export function stratifiedSamples(width, height, samplesX, samplesY, rng = Math.random) {
    const points = [];
    const cellW = width / samplesX;
    const cellH = height / samplesY;
    
    for (let j = 0; j < samplesY; j++) {
        for (let i = 0; i < samplesX; i++) {
            points.push({
                x: (i + rng()) * cellW,
                y: (j + rng()) * cellH
            });
        }
    }
    
    return points;
}

