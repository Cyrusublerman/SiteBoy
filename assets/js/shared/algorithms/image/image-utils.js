/**
 * @fileoverview Image Utilities — Scan analysis and color extraction
 * 
 * Utilities for analyzing scanned calibration grids and extracting colors
 * from grid-aligned positions.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/scan/index.js
 */

import { rgb_to_key, avgColour } from '../color/color-utils.js';

/**
 * Extract colors from scanned calibration grid
 * 
 * Uses grid-aligned sampling (not random!) to extract actual printed colors.
 * Samples from the center of each grid tile using 5×5 pixel averaging for robustness.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/scan/index.js:17-71
 * @param {HTMLCanvasElement} canvas - Canvas containing scanned image
 * @param {Object} gridData - Grid data with sequences, rows, cols, tileSize, gap
 * @param {Object} alignment - Alignment parameters
 * @param {number} alignment.offsetX - X offset in pixels
 * @param {number} alignment.offsetY - Y offset in pixels
 * @param {number} alignment.scaleX - X scale (pixels per mm)
 * @param {number} alignment.scaleY - Y scale (pixels per mm)
 * @returns {{palette: Array<{r,g,b}>, colorMap: Map<string, Object>}} Extracted colors
 * 
 * @example
 * const canvas = document.getElementById('scanCanvas');
 * const ctx = canvas.getContext('2d');
 * ctx.drawImage(scanImage, 0, 0);
 * 
 * const { palette, colorMap } = extractColors(canvas, gridData, {
 *   offsetX: 100,
 *   offsetY: 100,
 *   scaleX: 11.81,  // pixels per mm
 *   scaleY: 11.81
 * });
 * 
 * console.log(`Extracted ${palette.length} unique colors`);
 * // palette[0] is most frequent color
 */
export function extractColors(canvas, gridData, alignment) {
    const ctx = canvas.getContext('2d');
    const { sequences, rows, cols, tileSize, gap } = gridData;
    const { offsetX, offsetY, scaleX, scaleY } = alignment;

    const colorMap = new Map();
    const sampleRadius = 5; // Sample 5x5 pixel area

    sequences.forEach((seq, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;

        // Calculate grid position in mm
        const gridX = col * (tileSize + gap) + tileSize / 2;
        const gridY = row * (tileSize + gap) + tileSize / 2;

        // Transform to scan coordinates
        const scanX = Math.round(gridX * scaleX + offsetX);
        const scanY = Math.round(gridY * scaleY + offsetY);

        // Sample area around this point
        const sampleData = ctx.getImageData(
            scanX - sampleRadius,
            scanY - sampleRadius,
            sampleRadius * 2,
            sampleRadius * 2
        );

        const avgColor = avgColour(sampleData);
        const key = rgb_to_key(avgColor);

        if (!colorMap.has(key)) {
            colorMap.set(key, {
                color: avgColor,
                count: 1,
                positions: [i]
            });
        } else {
            const entry = colorMap.get(key);
            entry.count++;
            entry.positions.push(i);
        }
    });

    // Convert to palette sorted by frequency
    const palette = Array.from(colorMap.values())
        .map(e => e.color)
        .sort((a, b) => {
            const countA = colorMap.get(rgb_to_key(a)).count;
            const countB = colorMap.get(rgb_to_key(b)).count;
            return countB - countA;
        });

    return { palette, colorMap };
}

/**
 * Auto-calculate scale from A4 scan dimensions
 * 
 * Calculates pixels-per-mm scale factors from scanned image dimensions
 * and known paper size.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/scan/index.js:84-94
 * @param {number} scanWidth - Scan image width in pixels
 * @param {number} scanHeight - Scan image height in pixels
 * @param {number} gridWidth - Grid width in mm (for validation)
 * @param {number} gridHeight - Grid height in mm (for validation)
 * @param {number} [a4Width=210] - A4 width in mm
 * @param {number} [a4Height=297] - A4 height in mm
 * @returns {{scaleX: number, scaleY: number}} Scale in pixels per mm
 * 
 * @example
 * // 300 DPI scan of A4 (210×297mm)
 * const scale = autoCalculateScale(
 *   2480,  // Scan width in pixels
 *   3508,  // Scan height in pixels
 *   200,   // Grid width in mm
 *   280    // Grid height in mm
 * );
 * // Returns: {scaleX: 11.81, scaleY: 11.81} (approx 300 DPI)
 */
export function autoCalculateScale(scanWidth, scanHeight, gridWidth, gridHeight, a4Width = 210, a4Height = 297) {
    // Calculate pixels per mm for the scan
    const scanPxPerMmX = scanWidth / a4Width;
    const scanPxPerMmY = scanHeight / a4Height;

    // Grid is in mm, so scale = pixels per mm
    return {
        scaleX: scanPxPerMmX,
        scaleY: scanPxPerMmY
    };
}

/**
 * Draw grid overlay on scan canvas for visual alignment feedback
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/scan/index.js:104-129
 * @param {HTMLCanvasElement} canvas - Canvas to draw on
 * @param {Object} gridData - Grid data
 * @param {Object} alignment - Alignment parameters
 * @param {string} [color='rgba(255, 0, 0, 0.5)'] - Overlay color
 * 
 * @example
 * drawGridOverlay(canvas, gridData, alignment, 'rgba(0, 255, 0, 0.3)');
 * // Draws green semi-transparent grid overlay for alignment verification
 */
export function drawGridOverlay(canvas, gridData, alignment, color = 'rgba(255, 0, 0, 0.5)') {
    const ctx = canvas.getContext('2d');
    const { rows, cols, tileSize, gap, width, height } = gridData;
    const { offsetX, offsetY, scaleX, scaleY } = alignment;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scaleX, scaleY);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2 / scaleX; // Adjust line width for scale

    // Draw grid outline
    ctx.strokeRect(0, 0, width, height);

    // Draw individual cells
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * (tileSize + gap);
            const y = row * (tileSize + gap);
            ctx.strokeRect(x, y, tileSize, tileSize);
        }
    }

    ctx.restore();
}

