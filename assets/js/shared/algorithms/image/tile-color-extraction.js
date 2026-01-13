/**
 * Tile Color Extraction
 * 
 * Extracts average RGB color from a rectangular region with dead zone inset.
 * Used for analyzing scanned calibration grids where tile edges may be contaminated.
 * 
 * @module tile-color-extraction
 */

/**
 * Extract average color from tile area with dead zone inset
 * 
 * Dead zones prevent edge contamination from:
 * - Filament bleeding between tiles
 * - Poor layer adhesion at edges
 * - Scanner artifacts
 * - Lighting gradients
 * 
 * @param {ImageData} imageData - Full scan image data
 * @param {Object} rect - Tile rectangle {x, y, width, height} in image pixels
 * @param {number} deadZone - Inset percentage from each edge (0.0 to 0.5)
 * @returns {Object} {rgb: {r, g, b}, hex: string, sampleCount: number, variance: number, bounds: Object}
 * 
 * @example
 * const tileColor = extractTileColor(scanImageData, {x: 100, y: 200, width: 50, height: 50}, 0.15);
 * // Returns: {rgb: {r: 145, g: 187, b: 98}, hex: '#91BB62', sampleCount: 1225, variance: 8.3, bounds: {...}}
 */
export function extractTileColor(imageData, rect, deadZone) {
    // Validate inputs
    if (!imageData || !imageData.data) {
        throw new Error('Invalid ImageData object');
    }
    
    if (deadZone < 0 || deadZone > 0.5) {
        throw new Error('Dead zone must be between 0.0 and 0.5');
    }
    
    // Calculate safe sampling bounds with dead zone inset
    const insetX = Math.floor(rect.width * deadZone);
    const insetY = Math.floor(rect.height * deadZone);
    
    const safeBounds = {
        x: Math.floor(rect.x + insetX),
        y: Math.floor(rect.y + insetY),
        width: Math.floor(rect.width - 2 * insetX),
        height: Math.floor(rect.height - 2 * insetY)
    };
    
    // Ensure safe bounds are valid
    if (safeBounds.width < 1 || safeBounds.height < 1) {
        throw new Error('Dead zone too large - no pixels left to sample');
    }
    
    // Clamp to image bounds
    const clampedBounds = {
        x: Math.max(0, Math.min(safeBounds.x, imageData.width - 1)),
        y: Math.max(0, Math.min(safeBounds.y, imageData.height - 1)),
        width: Math.min(safeBounds.width, imageData.width - safeBounds.x),
        height: Math.min(safeBounds.height, imageData.height - safeBounds.y)
    };
    
    // Collect all RGB values in safe zone
    const samples = [];
    let sumR = 0, sumG = 0, sumB = 0;
    let count = 0;
    
    for (let y = clampedBounds.y; y < clampedBounds.y + clampedBounds.height; y++) {
        for (let x = clampedBounds.x; x < clampedBounds.x + clampedBounds.width; x++) {
            const idx = (y * imageData.width + x) * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            // const a = imageData.data[idx + 3]; // Ignore alpha
            
            samples.push({ r, g, b });
            sumR += r;
            sumG += g;
            sumB += b;
            count++;
        }
    }
    
    if (count === 0) {
        throw new Error('No pixels sampled - check bounds');
    }
    
    // Calculate average RGB
    const avgR = Math.round(sumR / count);
    const avgG = Math.round(sumG / count);
    const avgB = Math.round(sumB / count);
    
    const avgRGB = { r: avgR, g: avgG, b: avgB };
    
    // Calculate variance (measure of color uniformity)
    // Lower variance = more uniform color = higher quality sample
    const variance = calculateRGBVariance(samples, avgRGB);
    
    // Convert to hex
    const hex = rgbToHex(avgRGB);
    
    return {
        rgb: avgRGB,
        hex,
        sampleCount: count,
        variance: Math.round(variance * 10) / 10, // Round to 1 decimal
        bounds: clampedBounds
    };
}

/**
 * Calculate RGB variance as quality metric
 * Uses Euclidean distance in RGB space
 * 
 * @param {Array<Object>} samples - Array of {r, g, b} samples
 * @param {Object} average - Average RGB {r, g, b}
 * @returns {number} Variance value (lower = more uniform)
 */
function calculateRGBVariance(samples, average) {
    if (samples.length === 0) return 0;
    
    let sumSquaredDist = 0;
    
    for (const sample of samples) {
        const dr = sample.r - average.r;
        const dg = sample.g - average.g;
        const db = sample.b - average.b;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        sumSquaredDist += dist * dist;
    }
    
    return Math.sqrt(sumSquaredDist / samples.length);
}

/**
 * Convert RGB to hex string
 * 
 * @param {Object} rgb - {r, g, b} with values 0-255
 * @returns {string} Hex color string (e.g., '#91BB62')
 */
function rgbToHex(rgb) {
    const toHex = (n) => {
        const hex = Math.max(0, Math.min(255, n)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Batch extract colors from multiple tiles
 * 
 * @param {ImageData} imageData - Full scan image data
 * @param {Array<Object>} tiles - Array of tile rectangles
 * @param {number} deadZone - Dead zone percentage
 * @param {Function} progressCallback - Optional progress callback(current, total)
 * @returns {Array<Object>} Array of extraction results
 */
export function extractMultipleTileColors(imageData, tiles, deadZone, progressCallback = null) {
    const results = [];
    
    for (let i = 0; i < tiles.length; i++) {
        try {
            const result = extractTileColor(imageData, tiles[i], deadZone);
            results.push({
                ...result,
                tileIndex: i,
                success: true
            });
        } catch (error) {
            results.push({
                tileIndex: i,
                success: false,
                error: error.message
            });
        }
        
        if (progressCallback) {
            progressCallback(i + 1, tiles.length);
        }
    }
    
    return results;
}

/**
 * Visualize dead zones for debugging/preview
 * Draws green sample areas and red dead zones
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} rect - Tile rectangle
 * @param {number} deadZone - Dead zone percentage
 */
export function visualizeDeadZone(ctx, rect, deadZone) {
    const insetX = rect.width * deadZone;
    const insetY = rect.height * deadZone;
    
    // Draw full tile (red = dead zone)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    
    // Draw safe zone (green = sample area)
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.fillRect(
        rect.x + insetX,
        rect.y + insetY,
        rect.width - 2 * insetX,
        rect.height - 2 * insetY
    );
    
    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

