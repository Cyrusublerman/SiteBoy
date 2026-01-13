/**
 * MFP-GridRenderer - Pure canvas rendering functions for calibration grids
 * 
 * NO DOM manipulation - only canvas operations.
 * All functions are pure (no side effects).
 */

import { VGA_PALETTE } from './MFP-Constants.js';

/**
 * Draw detailed calibration grid with colors
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {Object} gridData - Grid data structure
 * @param {Function} simColour - Color simulation function
 * @param {Function} rgb2hex - RGB to hex converter
 * @param {string} mode - 'combined' | 'layer-N' | 'sequence'
 */
export function drawCalibrationGrid(ctx, canvas, gridData, simColour, rgb2hex, mode = 'combined') {
    const { sequences, colours, rows, cols, tileSize, gap, width, height, perimeterMargin = 0 } = gridData;
    
    // Calculate scaling to fit canvas
    const padding = 40;
    const availableWidth = canvas.width - padding * 2;
    const availableHeight = canvas.height - padding * 2;
    
    const scaleX = availableWidth / width;
    const scaleY = availableHeight / height;
    const scale = Math.min(scaleX, scaleY);
    
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    
    // Draw perimeter margin (dark grey border)
    if (perimeterMargin > 0) {
        const marginScaled = perimeterMargin * scale;
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, scaledWidth, marginScaled); // Top
        ctx.fillRect(0, scaledHeight - marginScaled, scaledWidth, marginScaled); // Bottom
        ctx.fillRect(0, marginScaled, marginScaled, scaledHeight - marginScaled * 2); // Left
        ctx.fillRect(scaledWidth - marginScaled, marginScaled, marginScaled, scaledHeight - marginScaled * 2); // Right
        
        // Offset for inner grid
        ctx.translate(marginScaled, marginScaled);
    }
    
    const tileSizeScaled = tileSize * scale;
    const gapScaled = gap * scale;
    const step = tileSizeScaled + gapScaled;
    
    // Draw each tile
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            const sequence = sequences[index];
            
            if (!sequence || sequence.length === 0) continue;
            
            const x = col * step;
            const y = row * step;
            
            let hexColor;
            
            if (mode === 'combined') {
                const color = simColour(sequence, colours);
                hexColor = rgb2hex(color);
            } else if (mode.startsWith('layer-')) {
                const layerIndex = parseInt(mode.split('-')[1]);
                const filamentIndex = sequence[layerIndex];
                
                if (filamentIndex === 0) {
                    hexColor = '#000000'; // Empty layer
                } else {
                    hexColor = colours[filamentIndex - 1].h;
                }
            } else if (mode === 'sequence') {
                // Use VGA palette based on sequence pattern
                const seqStr = sequence.join('');
                const hash = seqStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                hexColor = VGA_PALETTE[hash % VGA_PALETTE.length];
            } else {
                const color = simColour(sequence, colours);
                hexColor = rgb2hex(color);
            }
            
            // Fill tile (no border - outlines create false impression of gaps)
            ctx.fillStyle = hexColor;
            ctx.fillRect(x, y, tileSizeScaled, tileSizeScaled);
        }
    }
    
    ctx.restore();
}

/**
 * Draw grid statistics overlay
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {Object} gridData
 */
export function drawGridStats(ctx, canvas, gridData) {
    const { sequences, rows, cols, width, height, fitsConstraints } = gridData;
    
    ctx.save();
    ctx.font = '12px "Atkinson Hyperlegible", monospace';
    ctx.textAlign = 'center';
    
    const y = canvas.height - 15;
    const centerX = canvas.width / 2;
    
    // Color-code based on fit
    ctx.fillStyle = fitsConstraints === false ? '#ff0000' : '#00ff00';
    
    const stats = `Sequences: ${sequences.length} | Grid: ${rows}×${cols} | Size: ${width.toFixed(1)}×${height.toFixed(1)}mm`;
    ctx.fillText(stats, centerX, y);
    
    if (fitsConstraints === false) {
        ctx.fillStyle = '#ffff00';
        ctx.fillText('⚠ OVERSIZED - Use Split Grids', centerX, y - 20);
    }
    
    ctx.restore();
}

/**
 * Draw constraint bounds (bed/scan areas)
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {Object} gridData
 * @param {Object} constraints - {bedWidth, bedHeight, scanWidth, scanHeight}
 */
export function drawConstraintBounds(ctx, canvas, gridData, constraints) {
    if (!gridData || !constraints) return;
    
    const { width: gridWidth, height: gridHeight } = gridData;
    const { bedWidth, bedHeight, scanWidth, scanHeight } = constraints;
    
    // Calculate scale (same as grid rendering)
    const padding = 40;
    const availableWidth = canvas.width - padding * 2;
    const availableHeight = canvas.height - padding * 2;
    const scaleX = availableWidth / gridWidth;
    const scaleY = availableHeight / gridHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const scaledWidth = gridWidth * scale;
    const scaledHeight = gridHeight * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;
    
    ctx.save();
    
    // Draw bed constraint box (printer bed area)
    const bedScaledW = bedWidth * scale;
    const bedScaledH = bedHeight * scale;
    ctx.strokeStyle = '#ff00ff'; // Magenta for bed
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(offsetX, offsetY, bedScaledW, bedScaledH);
    
    // Label
    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`BED: ${bedWidth.toFixed(0)}×${bedHeight.toFixed(0)}mm`, offsetX + 5, offsetY + 15);
    
    // Draw scan constraint box
    const scanScaledW = scanWidth * scale;
    const scanScaledH = scanHeight * scale;
    ctx.strokeStyle = '#00ffff'; // Cyan for scan
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(offsetX, offsetY, scanScaledW, scanScaledH);
    
    // Label
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`SCAN: ${scanWidth.toFixed(0)}×${scanHeight.toFixed(0)}mm`, offsetX + 5, offsetY + 30);
    
    ctx.restore();
}

/**
 * Draw placeholder message
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {string} message
 */
export function drawPlaceholder(ctx, canvas, message) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = '16px "Atkinson Hyperlegible", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lines = message.split('\n');
    const lineHeight = 24;
    const totalHeight = lines.length * lineHeight;
    const startY = (canvas.height - totalHeight) / 2;
    
    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + i * lineHeight + lineHeight / 2);
    });
    
    ctx.restore();
}

