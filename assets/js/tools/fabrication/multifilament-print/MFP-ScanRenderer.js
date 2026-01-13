/**
 * MFP-ScanRenderer - Pure canvas rendering for scan overlay with corner transform
 * 
 * NO DOM manipulation - only canvas operations.
 * Handles grid overlay drawing with corner-based transformation.
 */

import { getGridPoint, lerp2D } from './MFP-Utils.js';

/**
 * Draw precision grid overlay with corner-based transform
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {Array} corners - 4 corner points [TL, TR, BR, BL]
 * @param {Object} gridData - {rows, cols, tileSize, gap, sequences, colours}
 * @param {Object} options - {showSampleZones, showExpectedColors, deadzonePercent}
 * @param {Function} simColour - Color simulation function
 */
export function drawScanOverlay(ctx, canvas, corners, gridData, options, simColour) {
    if (!corners || corners.length !== 4) {
        console.warn('Grid corners not initialized');
        return;
    }
    
    const { rows, cols } = gridData;
    const { showSampleZones = false, showExpectedColors = false, deadzonePercent = 0.1 } = options;
    
    ctx.save();
    
    // Draw ALL grid lines in one path (performance optimization)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Vertical lines
    for (let col = 0; col <= cols; col++) {
        const top = getGridPoint(corners, col, 0, cols, rows);
        const bottom = getGridPoint(corners, col, rows, cols, rows);
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(bottom.x, bottom.y);
    }
    
    // Horizontal lines
    for (let row = 0; row <= rows; row++) {
        const left = getGridPoint(corners, 0, row, cols, rows);
        const right = getGridPoint(corners, cols, row, cols, rows);
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
    }
    
    ctx.stroke();
    
    // Draw zones/colors if requested
    if (showSampleZones || showExpectedColors) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const tileIndex = row * cols + col;
                
                // Get tile corners using bilinear interpolation
                const tl = getGridPoint(corners, col, row, cols, rows);
                const tr = getGridPoint(corners, col + 1, row, cols, rows);
                const bl = getGridPoint(corners, col, row + 1, cols, rows);
                const br = getGridPoint(corners, col + 1, row + 1, cols, rows);
                
                if (showSampleZones) {
                    // Draw deadzone (outer border to avoid)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.beginPath();
                    ctx.moveTo(tl.x, tl.y);
                    ctx.lineTo(tr.x, tr.y);
                    ctx.lineTo(br.x, br.y);
                    ctx.lineTo(bl.x, bl.y);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Safe zone (inset by deadzone percentage)
                    const safeTL = lerp2D(tl, br, deadzonePercent);
                    const safeTR = lerp2D(tr, bl, deadzonePercent);
                    const safeBR = lerp2D(br, tl, deadzonePercent);
                    const safeBL = lerp2D(bl, tr, deadzonePercent);
                    
                    // Clear safe zone
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.beginPath();
                    ctx.moveTo(safeTL.x, safeTL.y);
                    ctx.lineTo(safeTR.x, safeTR.y);
                    ctx.lineTo(safeBR.x, safeBR.y);
                    ctx.lineTo(safeBL.x, safeBL.y);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Outline safe zone
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
                
                if (showExpectedColors && tileIndex < gridData.sequences.length) {
                    const sequence = gridData.sequences[tileIndex];
                    if (sequence && simColour) {
                        const color = simColour(sequence, gridData.colours);
                        
                        // Draw small swatch in center
                        const centerX = (tl.x + tr.x + bl.x + br.x) / 4;
                        const centerY = (tl.y + tr.y + bl.y + br.y) / 4;
                        const size = 8;
                        
                        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                        ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
                        
                        // White border for visibility
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(centerX - size/2, centerY - size/2, size, size);
                    }
                }
            }
        }
    }
    
    ctx.restore();
}

/**
 * Draw corner handles for dragging
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} corners - 4 corner points [TL, TR, BR, BL]
 * @param {number} hoveredIndex - Index of hovered corner (-1 if none)
 */
export function drawCornerHandles(ctx, corners, hoveredIndex = -1) {
    const HANDLE_RADIUS = 8;
    const HANDLE_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00']; // TL, TR, BR, BL
    const LABELS = ['TL', 'TR', 'BR', 'BL'];
    
    ctx.save();
    
    corners.forEach((corner, i) => {
        const radius = (i === hoveredIndex) ? HANDLE_RADIUS + 2 : HANDLE_RADIUS;
        
        // Outer circle (white border)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, radius + 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner circle (colored)
        ctx.fillStyle = HANDLE_COLORS[i];
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Black outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(LABELS[i], corner.x, corner.y);
    });
    
    ctx.restore();
}

/**
 * Draw scan image
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} image
 */
export function drawScanImage(ctx, canvas, image) {
    ctx.save();
    ctx.drawImage(image, 0, 0);
    ctx.restore();
}

