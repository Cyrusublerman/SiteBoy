/**
 * Scan Visualization Modes
 * 
 * Implements canvas rendering modes for scan analysis:
 * - Scan Only: Raw scan image
 * - Overlay: Scan + interactive grid overlay
 * - Analysis Preview: Show dead zones and sample areas
 * - Side-by-Side Comparison: Expected vs measured colors
 * 
 * This is a tool-specific module (rendering, visualization).
 * 
 * @module scan-visualization-modes
 */

import { visualizeDeadZone } from '../../../shared/algorithms/image/tile-color-extraction.js';
import { calculateTileRectsInScan } from '../../../shared/algorithms/geometry/grid-scan-transform.js';

/**
 * Render scan image only
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLImageElement} scanImage - Scan image
 */
export function renderScanOnly(ctx, canvas, scanImage) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(scanImage, 0, 0, canvas.width, canvas.height);
}

/**
 * Render scan with overlay
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLImageElement} scanImage - Scan image
 * @param {ScanOverlayController} overlayController - Overlay controller
 */
export function renderScanWithOverlay(ctx, canvas, scanImage, overlayController) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(scanImage, 0, 0, canvas.width, canvas.height);
    overlayController.render(ctx, {
        showGrid: true,
        showTileNumbers: false,
        showBounds: true,
        showHandles: true
    });
}

/**
 * Render analysis preview (dead zones visualization)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLImageElement} scanImage - Scan image
 * @param {Object} gridConfig - Grid configuration
 * @param {Object} transform - Transform state
 * @param {number} deadZone - Dead zone percentage
 */
export function renderAnalysisPreview(ctx, canvas, scanImage, gridConfig, transform, deadZone) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(scanImage, 0, 0, canvas.width, canvas.height);
    
    // Get all tile rectangles
    const tiles = calculateTileRectsInScan(gridConfig, transform);
    
    // Draw dead zone visualization for each tile
    tiles.forEach(tile => {
        if (!tile.isEmpty) {
            visualizeDeadZone(ctx, tile.rect, deadZone);
        }
    });
    
    // Draw legend
    ctx.save();
    const legendX = 10;
    const legendY = canvas.height - 70;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(legendX, legendY, 180, 60);
    
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fillRect(legendX + 5, legendY + 5, 15, 15);
    ctx.fillStyle = 'white';
    ctx.fillText('= Sample Area', legendX + 25, legendY + 7);
    
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(legendX + 5, legendY + 25, 15, 15);
    ctx.fillStyle = 'white';
    ctx.fillText('= Dead Zone', legendX + 25, legendY + 27);
    
    ctx.fillStyle = 'white';
    ctx.fillText(`Dead Zone: ${Math.round(deadZone * 100)}%`, legendX + 5, legendY + 45);
    
    ctx.restore();
}

/**
 * Render side-by-side comparison
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {HTMLImageElement} scanImage - Scan image
 * @param {Object} gridConfig - Grid configuration
 * @param {Object} transform - Transform state
 * @param {Array<Object>} library - Sequence library with measured colors
 */
export function renderComparison(ctx, canvas, scanImage, gridConfig, transform, library) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const halfWidth = canvas.width / 2;
    
    // Left side: Scan image
    ctx.save();
    ctx.drawImage(scanImage, 0, 0, halfWidth, canvas.height);
    ctx.restore();
    
    // Right side: Expected colors
    ctx.save();
    ctx.translate(halfWidth, 0);
    renderExpectedColors(ctx, halfWidth, canvas.height, gridConfig, transform, library);
    ctx.restore();
    
    // Draw divider line
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(halfWidth, canvas.height);
    ctx.stroke();
    
    // Draw labels
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    
    ctx.strokeText('SCAN', halfWidth / 2, 30);
    ctx.fillText('SCAN', halfWidth / 2, 30);
    
    ctx.strokeText('MEASURED', halfWidth + halfWidth / 2, 30);
    ctx.fillText('MEASURED', halfWidth + halfWidth / 2, 30);
}

/**
 * Render expected colors grid
 * @private
 */
function renderExpectedColors(ctx, width, height, gridConfig, transform, library) {
    // Get all tile rectangles
    const tiles = calculateTileRectsInScan(gridConfig, transform);
    
    // Create lookup map: index → measured color
    const colorMap = new Map();
    if (library) {
        library.forEach(entry => {
            colorMap.set(entry.gridPosition.index, entry.hex);
        });
    }
    
    // Draw each tile with its measured color
    tiles.forEach(tile => {
        if (tile.isEmpty) {
            // Draw gray for empty tiles
            ctx.fillStyle = '#808080';
        } else {
            // Use measured color or white if not analyzed yet
            const color = colorMap.get(tile.index) || '#FFFFFF';
            ctx.fillStyle = color;
        }
        
        ctx.fillRect(tile.rect.x, tile.rect.y, tile.rect.width, tile.rect.height);
        
        // Draw border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(tile.rect.x, tile.rect.y, tile.rect.width, tile.rect.height);
    });
}

/**
 * Render highlighted tile
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} tile - Tile object from calculateTileRectsInScan
 * @param {Object} [options={}] - Render options
 */
export function renderHighlightedTile(ctx, tile, options = {}) {
    const {
        color = 'rgba(255, 255, 0, 0.5)',
        borderColor = 'yellow',
        borderWidth = 3
    } = options;
    
    ctx.save();
    
    // Draw highlight fill
    ctx.fillStyle = color;
    ctx.fillRect(tile.rect.x, tile.rect.y, tile.rect.width, tile.rect.height);
    
    // Draw highlight border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(tile.rect.x, tile.rect.y, tile.rect.width, tile.rect.height);
    
    ctx.restore();
}

/**
 * Render analysis results overlay
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Array<Object>} analysisResults - Results from ScanTileAnalyzer
 * @param {Object} gridConfig - Grid configuration
 * @param {Object} transform - Transform state
 */
export function renderAnalysisResults(ctx, canvas, analysisResults, gridConfig, transform) {
    const tiles = calculateTileRectsInScan(gridConfig, transform);
    
    // Create result map
    const resultMap = new Map();
    analysisResults.forEach(result => {
        resultMap.set(result.index, result);
    });
    
    tiles.forEach(tile => {
        const result = resultMap.get(tile.index);
        if (!result || tile.isEmpty) return;
        
        // Color-code by success/variance
        let color;
        if (!result.success) {
            color = 'rgba(255, 0, 0, 0.5)'; // Red for failed
        } else if (result.variance > 20) {
            color = 'rgba(255, 165, 0, 0.5)'; // Orange for high variance
        } else {
            color = 'rgba(0, 255, 0, 0.3)'; // Green for good
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(tile.rect.x, tile.rect.y, tile.rect.width, tile.rect.height);
        
        // Draw variance number
        if (result.success) {
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const text = result.variance.toFixed(1);
            const centerX = tile.rect.x + tile.rect.width / 2;
            const centerY = tile.rect.y + tile.rect.height / 2;
            ctx.strokeText(text, centerX, centerY);
            ctx.fillText(text, centerX, centerY);
        }
    });
    
    // Draw legend
    ctx.save();
    const legendX = canvas.width - 200;
    const legendY = 10;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(legendX, legendY, 190, 90);
    
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const items = [
        { color: 'rgba(0, 255, 0, 0.5)', label: 'Good (variance <20)' },
        { color: 'rgba(255, 165, 0, 0.5)', label: 'High variance' },
        { color: 'rgba(255, 0, 0, 0.5)', label: 'Failed' }
    ];
    
    items.forEach((item, i) => {
        const y = legendY + 10 + i * 25;
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX + 5, y, 15, 15);
        ctx.fillStyle = 'white';
        ctx.fillText(item.label, legendX + 25, y + 2);
    });
    
    ctx.restore();
}

