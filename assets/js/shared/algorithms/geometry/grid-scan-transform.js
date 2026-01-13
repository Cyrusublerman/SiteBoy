/**
 * Grid-Scan Transform
 * 
 * Transforms between grid coordinate space (mm) and scan coordinate space (pixels).
 * Handles scale, offset, and rotation for aligning calibration grids with scans.
 * 
 * @module grid-scan-transform
 */

/**
 * Transform grid coordinates (mm) to scan coordinates (px)
 * 
 * Applies transformation in order: scale → rotate → translate
 * 
 * @param {Object} gridPoint - Point in grid space {x, y} (mm)
 * @param {Object} transform - Transform parameters
 * @param {number} transform.offsetX - X translation (px)
 * @param {number} transform.offsetY - Y translation (px)
 * @param {number} transform.scaleX - X scale factor (px/mm)
 * @param {number} transform.scaleY - Y scale factor (px/mm)
 * @param {number} [transform.rotation=0] - Rotation angle (degrees, clockwise)
 * @returns {Object} Point in scan space {x, y} (px)
 * 
 * @example
 * const scanPoint = transformGridToScan({x: 10, y: 20}, {
 *   offsetX: 100,
 *   offsetY: 150,
 *   scaleX: 11.81,
 *   scaleY: 11.81,
 *   rotation: 0
 * });
 */
export function transformGridToScan(gridPoint, transform) {
    const { offsetX, offsetY, scaleX, scaleY, rotation = 0 } = transform;
    
    // Scale
    let x = gridPoint.x * scaleX;
    let y = gridPoint.y * scaleY;
    
    // Rotate (if rotation is enabled)
    if (rotation !== 0) {
        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;
        x = rotatedX;
        y = rotatedY;
    }
    
    // Translate
    x += offsetX;
    y += offsetY;
    
    return { x, y };
}

/**
 * Transform scan coordinates (px) to grid coordinates (mm)
 * Inverse of transformGridToScan
 * 
 * @param {Object} scanPoint - Point in scan space {x, y} (px)
 * @param {Object} transform - Transform parameters
 * @returns {Object} Point in grid space {x, y} (mm)
 */
export function transformScanToGrid(scanPoint, transform) {
    const { offsetX, offsetY, scaleX, scaleY, rotation = 0 } = transform;
    
    // Inverse translate
    let x = scanPoint.x - offsetX;
    let y = scanPoint.y - offsetY;
    
    // Inverse rotate
    if (rotation !== 0) {
        const rad = (-rotation * Math.PI) / 180; // Negative for inverse
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;
        x = rotatedX;
        y = rotatedY;
    }
    
    // Inverse scale
    x /= scaleX;
    y /= scaleY;
    
    return { x, y };
}

/**
 * Transform grid rectangle to scan rectangle
 * 
 * @param {Object} gridRect - Rectangle in grid space {x, y, width, height} (mm)
 * @param {Object} transform - Transform parameters
 * @returns {Object} Rectangle in scan space {x, y, width, height} (px)
 */
export function transformGridRectToScan(gridRect, transform) {
    const topLeft = transformGridToScan(
        { x: gridRect.x, y: gridRect.y },
        transform
    );
    
    const bottomRight = transformGridToScan(
        { x: gridRect.x + gridRect.width, y: gridRect.y + gridRect.height },
        transform
    );
    
    return {
        x: topLeft.x,
        y: topLeft.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y
    };
}

/**
 * Calculate tile rectangles in scan space for entire grid
 * 
 * @param {Object} gridConfig - Grid configuration
 * @param {number} gridConfig.rows - Number of rows
 * @param {number} gridConfig.cols - Number of columns
 * @param {number} gridConfig.tileSize - Tile size (mm)
 * @param {number} gridConfig.gap - Gap between tiles (mm)
 * @param {Array<number>} [gridConfig.emptyCells] - Indices of empty cells
 * @param {Object} transform - Transform parameters
 * @returns {Array<Object>} Array of tile rectangles in scan space with metadata
 * 
 * @example
 * const tiles = calculateTileRectsInScan(gridConfig, transform);
 * // Returns: [{index: 0, row: 0, col: 0, rect: {x, y, width, height}, isEmpty: false}, ...]
 */
export function calculateTileRectsInScan(gridConfig, transform) {
    const { rows, cols, tileSize, gap, emptyCells = [] } = gridConfig;
    const tiles = [];
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            const isEmpty = emptyCells.includes(index);
            
            // Grid coordinates (mm)
            const gridX = col * (tileSize + gap);
            const gridY = row * (tileSize + gap);
            
            const gridRect = {
                x: gridX,
                y: gridY,
                width: tileSize,
                height: tileSize
            };
            
            // Transform to scan coordinates (px)
            const scanRect = transformGridRectToScan(gridRect, transform);
            
            tiles.push({
                index,
                row,
                col,
                rect: scanRect,
                gridRect,
                isEmpty
            });
        }
    }
    
    return tiles;
}

/**
 * Find which tile contains a scan point (for click detection)
 * 
 * @param {Object} scanPoint - Point in scan space {x, y} (px)
 * @param {Array<Object>} tiles - Array of tile rectangles from calculateTileRectsInScan
 * @returns {Object|null} Tile object or null if no tile at point
 */
export function findTileAtScanPoint(scanPoint, tiles) {
    for (const tile of tiles) {
        const { rect } = tile;
        if (
            scanPoint.x >= rect.x &&
            scanPoint.x <= rect.x + rect.width &&
            scanPoint.y >= rect.y &&
            scanPoint.y <= rect.y + rect.height
        ) {
            return tile;
        }
    }
    return null;
}

/**
 * Calculate bounding box of entire grid in scan space
 * 
 * @param {Object} gridConfig - Grid configuration
 * @param {Object} transform - Transform parameters
 * @returns {Object} Bounding box {x, y, width, height} (px)
 */
export function calculateGridBoundsInScan(gridConfig, transform) {
    const { rows, cols, tileSize, gap } = gridConfig;
    
    const gridWidth = cols * tileSize + (cols - 1) * gap;
    const gridHeight = rows * tileSize + (rows - 1) * gap;
    
    const gridRect = {
        x: 0,
        y: 0,
        width: gridWidth,
        height: gridHeight
    };
    
    return transformGridRectToScan(gridRect, transform);
}

/**
 * Calculate automatic scale to fit grid in scan
 * Useful for initial overlay placement
 * 
 * @param {Object} gridConfig - Grid configuration
 * @param {Object} scanDimensions - {width, height} of scan image (px)
 * @param {number} [padding=40] - Padding from edges (px)
 * @returns {Object} Suggested transform {offsetX, offsetY, scaleX, scaleY, rotation}
 */
export function calculateAutoFitTransform(gridConfig, scanDimensions, padding = 40) {
    const { rows, cols, tileSize, gap } = gridConfig;
    
    const gridWidthMM = cols * tileSize + (cols - 1) * gap;
    const gridHeightMM = rows * tileSize + (rows - 1) * gap;
    
    const availableWidth = scanDimensions.width - 2 * padding;
    const availableHeight = scanDimensions.height - 2 * padding;
    
    // Calculate scale to fit (maintain aspect ratio)
    const scaleX = availableWidth / gridWidthMM;
    const scaleY = availableHeight / gridHeightMM;
    const scale = Math.min(scaleX, scaleY);
    
    // Center the grid
    const scaledGridWidth = gridWidthMM * scale;
    const scaledGridHeight = gridHeightMM * scale;
    const offsetX = (scanDimensions.width - scaledGridWidth) / 2;
    const offsetY = (scanDimensions.height - scaledGridHeight) / 2;
    
    return {
        offsetX,
        offsetY,
        scaleX: scale,
        scaleY: scale,
        rotation: 0
    };
}

