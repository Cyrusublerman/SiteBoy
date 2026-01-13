/**
 * @fileoverview Grid Layout Calculation — Optimal grid arrangement for calibration prints
 * 
 * Calculates grid dimensions to fit a given number of tiles within physical constraints
 * (print bed size, scan paper size). Used for generating calibration grids.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/grid/layout.js
 */

/**
 * Calculate grid layout to fit sequences within constraints
 * 
 * Finds optimal rows×cols arrangement to fit all sequences while respecting
 * maximum width/height constraints. Attempts square-ish layout first, then
 * adjusts to fit constraints.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/grid/layout.js:17-88
 * @param {Object} params - Layout parameters
 * @param {number} params.sequenceCount - Number of sequences/tiles to fit
 * @param {number} params.tileSize - Size of each tile in mm
 * @param {number} params.gap - Gap between tiles in mm
 * @param {number} params.perimeterMargin - Border around entire grid in mm (default: 0)
 * @param {number} params.maxWidth - Maximum width constraint in mm
 * @param {number} params.maxHeight - Maximum height constraint in mm
 * @returns {Object} Layout result
 * @returns {number} returns.rows - Number of rows
 * @returns {number} returns.cols - Number of columns
 * @returns {number} returns.width - Total width in mm (including perimeter margin)
 * @returns {number} returns.height - Total height in mm (including perimeter margin)
 * @returns {number} returns.perimeterMargin - Perimeter margin used
 * @returns {number[]} returns.emptyCells - Indices of empty cells
 * @returns {boolean} returns.fits - Whether sequences fit within constraints
 * @returns {string|null} returns.error - Error message if doesn't fit
 * 
 * @example
 * const layout = calculateGridLayout({
 *   sequenceCount: 340,  // 4 colors × 4 layers
 *   tileSize: 10,
 *   gap: 1,
 *   perimeterMargin: 5,  // 5mm border around entire grid
 *   maxWidth: 210,       // A4 width
 *   maxHeight: 297       // A4 height
 * });
 * // Returns: {rows: 18, cols: 19, width: 218, height: 207, emptyCells: [340,341,...], fits: true}
 */
export function calculateGridLayout({
    sequenceCount,
    tileSize,
    gap,
    perimeterMargin = 0,
    maxWidth,
    maxHeight
}) {
    // Reduce available space by perimeter margin (2× because margin on both sides)
    const availableWidth = maxWidth - (perimeterMargin * 2);
    const availableHeight = maxHeight - (perimeterMargin * 2);
    
    const step = tileSize + gap;
    const tilesPerRow = Math.floor((availableWidth + gap) / step);
    const tilesPerCol = Math.floor((availableHeight + gap) / step);
    const maxTiles = tilesPerRow * tilesPerCol;

    // Check if sequences fit at all
    if (sequenceCount > maxTiles) {
        return {
            rows: 0,
            cols: 0,
            width: 0,
            height: 0,
            perimeterMargin,
            emptyCells: [],
            fits: false,
            error: `${sequenceCount} sequences won't fit in ${maxWidth}×${maxHeight}mm with ${perimeterMargin}mm margin (max ${maxTiles} tiles)`
        };
    }

    // Start with square-ish layout
    let cols = Math.ceil(Math.sqrt(sequenceCount));
    let rows = Math.ceil(sequenceCount / cols);

    // Adjust to fit constraints
    while (cols > tilesPerRow || rows > tilesPerCol) {
        if (cols > tilesPerRow) {
            rows++;
            cols = Math.ceil(sequenceCount / rows);
        } else {
            cols++;
            rows = Math.ceil(sequenceCount / cols);
        }
        if (rows * cols > maxTiles) {
            return {
                rows: 0,
                cols: 0,
                width: 0,
                height: 0,
                perimeterMargin,
                emptyCells: [],
                fits: false,
                error: 'Cannot fit within constraints'
            };
        }
    }

    // Calculate empty cells
    const totalCells = rows * cols;
    const emptyCells = [];
    for (let i = sequenceCount; i < totalCells; i++) {
        emptyCells.push(i);
    }

    // Calculate physical dimensions (grid itself, without margin)
    const gridWidth = cols * step - gap;
    const gridHeight = rows * step - gap;
    
    // Total dimensions include perimeter margin on all sides
    const width = gridWidth + (perimeterMargin * 2);
    const height = gridHeight + (perimeterMargin * 2);

    return {
        rows,
        cols,
        width,
        height,
        perimeterMargin,
        emptyCells,
        fits: true,
        error: null
    };
}

/**
 * Calculate print constraints from bed and scan sizes
 * 
 * Returns the minimum of bed size and scan size for each dimension.
 * Ensures generated grid fits both the printer bed and the scanning paper.
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/grid/layout.js:101-106
 * @param {Object} params - Constraint parameters
 * @param {number} params.bedW - Printer bed width in mm
 * @param {number} params.bedH - Printer bed height in mm
 * @param {number} params.scanW - Scan paper width in mm (e.g., A4 = 210mm)
 * @param {number} params.scanH - Scan paper height in mm (e.g., A4 = 297mm)
 * @returns {{maxWidth: number, maxHeight: number}} Maximum dimensions
 * 
 * @example
 * const constraints = calculateConstraints({
 *   bedW: 256,  // Printer bed
 *   bedH: 256,
 *   scanW: 210, // A4 paper
 *   scanH: 297
 * });
 * // Returns: {maxWidth: 210, maxHeight: 256}
 * // Grid must fit A4 paper width and printer bed height
 */
export function calculateConstraints({ bedW, bedH, scanW, scanH }) {
    return {
        maxWidth: Math.min(bedW, scanW),
        maxHeight: Math.min(bedH, scanH)
    };
}

