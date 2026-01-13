/**
 * Sequence Library Builder
 * 
 * Builds final sequence library from analyzed tile colors.
 * Matches extracted colors to grid sequences and validates completeness.
 * 
 * This is a tool-specific module (orchestration, validation).
 * 
 * @class SequenceLibraryBuilder
 */

import {
    groupBySimilarity,
    sortByHue,
    sortByLuminance,
    calculateColorStatistics
} from '../../../shared/algorithms/color/color-similarity-grouping.js';

export class SequenceLibraryBuilder {
    constructor(gridConfig, analysisResults) {
        this.gridConfig = gridConfig;
        this.analysisResults = analysisResults;
        this.library = null;
    }
    
    /**
     * Build sequence library from analysis results
     * @returns {Array<Object>} Sequence library entries
     */
    buildLibrary() {
        const library = [];
        
        for (const result of this.analysisResults) {
            // Skip failed or empty tiles
            if (!result.success || result.isEmpty) {
                continue;
            }
            
            // Get sequence for this tile
            const sequence = this.gridConfig.sequences[result.index];
            if (!sequence) {
                console.warn(`No sequence found for tile ${result.index}`);
                continue;
            }
            
            // Get filament names for this sequence
            const filaments = this._getFilamentNames(sequence);
            
            // Build library entry
            library.push({
                rgb: result.rgb,
                hex: result.hex,
                sequence,
                filaments,
                gridPosition: {
                    row: result.row,
                    col: result.col,
                    index: result.index
                },
                sampleCount: result.sampleCount,
                variance: result.variance
            });
        }
        
        this.library = library;
        return library;
    }
    
    /**
     * Get filament names for a sequence
     * @private
     */
    _getFilamentNames(sequence) {
        const filamentIndices = new Set();
        for (const idx of sequence) {
            if (idx > 0) {
                filamentIndices.add(idx - 1); // Convert 1-based to 0-based
            }
        }
        
        const names = [];
        for (const idx of filamentIndices) {
            if (this.gridConfig.colours[idx]) {
                names.push(this.gridConfig.colours[idx].n);
            }
        }
        
        return names;
    }
    
    /**
     * Get library
     * @returns {Array<Object>|null} Library or null if not built yet
     */
    getLibrary() {
        return this.library;
    }
    
    /**
     * Sort library by various criteria
     * @param {string} sortBy - 'hue', 'luminance', 'variance', 'index'
     * @returns {Array<Object>} Sorted library
     */
    sortLibrary(sortBy = 'index') {
        if (!this.library) return [];
        
        switch (sortBy) {
            case 'hue':
                return sortByHue(this.library);
            case 'luminance':
                return sortByLuminance(this.library);
            case 'variance':
                return [...this.library].sort((a, b) => a.variance - b.variance);
            case 'index':
            default:
                return [...this.library].sort((a, b) => 
                    a.gridPosition.index - b.gridPosition.index
                );
        }
    }
    
    /**
     * Group library by similarity
     * @param {number} threshold - ΔE2000 threshold
     * @returns {Array<Array<Object>>} Grouped library
     */
    groupLibrary(threshold = 10) {
        if (!this.library) return [];
        return groupBySimilarity(this.library, threshold);
    }
    
    /**
     * Get library statistics
     * @returns {Object} Statistics
     */
    getStatistics() {
        if (!this.library) {
            return { totalColors: 0, avgVariance: 0, maxVariance: 0, minVariance: 0 };
        }
        
        return calculateColorStatistics(this.library);
    }
    
    /**
     * Export library as JSON
     * @returns {string} JSON string
     */
    exportJSON() {
        if (!this.library) return '[]';
        
        return JSON.stringify({
            version: '1.0.0',
            gridConfig: {
                rows: this.gridConfig.rows,
                cols: this.gridConfig.cols,
                layerCount: this.gridConfig.layerCount,
                filaments: this.gridConfig.colours.map(c => ({ name: c.n, hex: c.h }))
            },
            library: this.library,
            statistics: this.getStatistics(),
            generatedAt: new Date().toISOString()
        }, null, 2);
    }
    
    /**
     * Export library as GPL palette (GIMP)
     * @returns {string} GPL format string
     */
    exportGPL() {
        if (!this.library) return '';
        
        let gpl = 'GIMP Palette\n';
        gpl += 'Name: Calibrated Multifilament Palette\n';
        gpl += `Columns: 16\n`;
        gpl += '#\n';
        
        for (const entry of this.library) {
            const { r, g, b } = entry.rgb;
            const name = entry.filaments.join('+') || 'Color';
            // GPL format: R G B\tName
            gpl += `${r.toString().padStart(3)} ${g.toString().padStart(3)} ${b.toString().padStart(3)}\t${name}\n`;
        }
        
        return gpl;
    }
    
    /**
     * Export comparison CSV (expected vs measured)
     * @returns {string} CSV string
     */
    exportComparisonCSV() {
        if (!this.library) return '';
        
        let csv = 'Index,Sequence,Expected RGB,Measured RGB,Measured Hex,Row,Col,Filaments,Variance,Sample Count\n';
        
        for (const entry of this.library) {
            const { index, row, col } = entry.gridPosition;
            
            // Get expected RGB from grid CSV (if available)
            const expectedRGB = this.gridConfig.tiles?.[index]?.expectedRGB || { r: 0, g: 0, b: 0 };
            const expectedStr = `"rgb(${expectedRGB.r},${expectedRGB.g},${expectedRGB.b})"`;
            
            const measuredStr = `"rgb(${entry.rgb.r},${entry.rgb.g},${entry.rgb.b})"`;
            const sequenceStr = `"${JSON.stringify(entry.sequence)}"`;
            const filamentsStr = `"${entry.filaments.join(', ')}"`;
            
            csv += `${index},${sequenceStr},${expectedStr},${measuredStr},${entry.hex},${row},${col},${filamentsStr},${entry.variance},${entry.sampleCount}\n`;
        }
        
        return csv;
    }
    
    /**
     * Validate library completeness
     * @returns {Object} Validation result
     */
    validate() {
        if (!this.library) {
            return { valid: false, errors: ['Library not built'] };
        }
        
        const errors = [];
        const warnings = [];
        
        // Check if all non-empty tiles were analyzed
        const expectedTiles = this.gridConfig.sequences.length - (this.gridConfig.emptyCells?.length || 0);
        if (this.library.length < expectedTiles) {
            warnings.push(`Only ${this.library.length}/${expectedTiles} tiles analyzed`);
        }
        
        // Check for high variance tiles
        const highVarianceTiles = this.library.filter(e => e.variance > 20);
        if (highVarianceTiles.length > 0) {
            warnings.push(`${highVarianceTiles.length} tiles have high variance (>20)`);
        }
        
        // Check for missing sequences
        const librarySequences = new Set(this.library.map(e => JSON.stringify(e.sequence)));
        const gridSequences = new Set(this.gridConfig.sequences.map(s => JSON.stringify(s)));
        const missingSequences = [];
        for (const seq of gridSequences) {
            if (!librarySequences.has(seq)) {
                missingSequences.push(JSON.parse(seq));
            }
        }
        if (missingSequences.length > 0) {
            warnings.push(`${missingSequences.length} sequences not found in scan`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            completeness: (this.library.length / expectedTiles) * 100
        };
    }
}

