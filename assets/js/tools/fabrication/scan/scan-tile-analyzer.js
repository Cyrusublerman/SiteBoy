/**
 * Scan Tile Analyzer
 * 
 * Orchestrates tile-by-tile color extraction from scanned calibration grids.
 * Maps grid indices to scan coordinates and applies dead zone filtering.
 * 
 * This is a tool-specific module (state management, orchestration).
 * Uses algorithms from tile-color-extraction.js and grid-scan-transform.js.
 * 
 * @class ScanTileAnalyzer
 */

import {
    extractTileColor,
    extractMultipleTileColors
} from '../../../shared/algorithms/image/tile-color-extraction.js';
import {
    calculateTileRectsInScan
} from '../../../shared/algorithms/geometry/grid-scan-transform.js';

export class ScanTileAnalyzer {
    constructor(gridConfig, scanImageData, transform) {
        this.gridConfig = gridConfig;
        this.scanImageData = scanImageData;
        this.transform = transform;
        this.deadZone = 0.15; // Default 15% inset
        this.results = null;
    }
    
    /**
     * Set dead zone percentage
     * @param {number} deadZone - Inset percentage (0.0 to 0.5)
     */
    setDeadZone(deadZone) {
        this.deadZone = Math.max(0, Math.min(0.5, deadZone));
    }
    
    /**
     * Set transform (updates tile positions)
     * @param {Object} transform - Transform parameters
     */
    setTransform(transform) {
        this.transform = transform;
    }
    
    /**
     * Analyze all tiles in grid
     * @param {Function} [progressCallback] - Progress callback(current, total, result)
     * @returns {Array<Object>} Analysis results for each tile
     */
    analyzeAllTiles(progressCallback = null) {
        // Calculate all tile rectangles in scan space
        const tiles = calculateTileRectsInScan(this.gridConfig, this.transform);
        
        // Extract colors from each tile
        const results = [];
        
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            
            // Skip empty tiles
            if (tile.isEmpty) {
                results.push({
                    index: tile.index,
                    row: tile.row,
                    col: tile.col,
                    isEmpty: true,
                    success: false
                });
                if (progressCallback) {
                    progressCallback(i + 1, tiles.length, null);
                }
                continue;
            }
            
            try {
                // Extract color with dead zone
                const colorResult = extractTileColor(
                    this.scanImageData,
                    tile.rect,
                    this.deadZone
                );
                
                results.push({
                    index: tile.index,
                    row: tile.row,
                    col: tile.col,
                    isEmpty: false,
                    success: true,
                    ...colorResult
                });
                
                if (progressCallback) {
                    progressCallback(i + 1, tiles.length, colorResult);
                }
            } catch (error) {
                results.push({
                    index: tile.index,
                    row: tile.row,
                    col: tile.col,
                    isEmpty: false,
                    success: false,
                    error: error.message
                });
                
                if (progressCallback) {
                    progressCallback(i + 1, tiles.length, null);
                }
            }
        }
        
        this.results = results;
        return results;
    }
    
    /**
     * Analyze single tile by index
     * @param {number} tileIndex - Grid tile index
     * @returns {Object|null} Analysis result or null if failed
     */
    analyzeTile(tileIndex) {
        const tiles = calculateTileRectsInScan(this.gridConfig, this.transform);
        const tile = tiles[tileIndex];
        
        if (!tile || tile.isEmpty) {
            return null;
        }
        
        try {
            const colorResult = extractTileColor(
                this.scanImageData,
                tile.rect,
                this.deadZone
            );
            
            return {
                index: tile.index,
                row: tile.row,
                col: tile.col,
                isEmpty: false,
                success: true,
                ...colorResult
            };
        } catch (error) {
            return {
                index: tile.index,
                row: tile.row,
                col: tile.col,
                isEmpty: false,
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get analysis results
     * @returns {Array<Object>|null} Results or null if not analyzed yet
     */
    getResults() {
        return this.results;
    }
    
    /**
     * Get analysis statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        if (!this.results) {
            return { analyzed: 0, successful: 0, failed: 0, empty: 0, avgVariance: 0 };
        }
        
        const successful = this.results.filter(r => r.success);
        const failed = this.results.filter(r => !r.success && !r.isEmpty);
        const empty = this.results.filter(r => r.isEmpty);
        
        const variances = successful.map(r => r.variance || 0);
        const avgVariance = variances.length > 0
            ? variances.reduce((a, b) => a + b, 0) / variances.length
            : 0;
        
        return {
            analyzed: this.results.length,
            successful: successful.length,
            failed: failed.length,
            empty: empty.length,
            avgVariance: Math.round(avgVariance * 10) / 10
        };
    }
    
    /**
     * Find outliers (high variance tiles)
     * @param {number} threshold - Variance threshold
     * @returns {Array<Object>} Outlier tiles
     */
    findOutliers(threshold = 15) {
        if (!this.results) return [];
        
        return this.results.filter(r => 
            r.success && r.variance > threshold
        );
    }
    
    /**
     * Clear analysis results
     */
    clearResults() {
        this.results = null;
    }
}

