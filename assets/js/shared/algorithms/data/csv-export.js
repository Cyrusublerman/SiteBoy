/**
 * CSV Export Module
 * Handles exporting grid and comparison data as CSV files
 */

import { simColour } from '../color/color-utils.js';

/**
 * Export grid data as CSV
 * @source blog/ideas/reference documentation/Experiments-main/js/export.js:338-354
 * @param {Object} gridData - Grid data object
 * @param {Array<Array<number>>} gridData.sequences - Array of sequences
 * @param {number} gridData.rows - Number of rows
 * @param {number} gridData.cols - Number of columns
 * @param {Array<Object>} gridData.colours - Array of colour objects {h, n}
 * @param {Array<number>} gridData.emptyCells - Array of empty cell indices
 * @param {string} gridData.sortMethod - Sorting method used (optional)
 * @param {Object} gridData.metadata - Additional metadata (optional)
 * @returns {string} CSV content
 */
export function exportGridCSV(gridData) {
    const { sequences, rows, cols, colours, emptyCells = [], sortMethod, baseLayers, topLayers, tileSize, gap, layerCount } = gridData;
    
    // Add metadata as comments at the top
    let csv = '# Multifilament Print Calibration Grid\n';
    csv += `# Generated: ${new Date().toISOString()}\n`;
    csv += `# Colors: ${colours.length}\n`;
    csv += `# Layers: ${layerCount || sequences[0]?.length || 'unknown'}\n`;
    csv += `# Grid Size: ${rows}×${cols}\n`;
    csv += `# Tile Size: ${tileSize || 10}mm\n`;
    csv += `# Gap: ${gap || 1}mm\n`;
    csv += `# Base Layers: ${baseLayers || 0}\n`;
    csv += `# Top Layers: ${topLayers || 0}\n`;
    csv += `# Sort Method: ${sortMethod || 'Layer Count'}\n`;
    csv += `# Color Palette: ${colours.map(c => c.n).join(', ')}\n`;
    csv += '#\n';
    csv += 'Index,Sequence,Expected RGB,Row,Col,Filament Names\n';
    
    // Export filled cells
    sequences.forEach((seq, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const color = simColour(seq, colours);
        const filNames = seq
            .filter(v => v > 0)
            .map(v => colours[v - 1].n)
            .join('|');
        
        csv += `${index},"[${seq.join(' ')}]","${color.r} ${color.g} ${color.b}",${row},${col},"${filNames}"\n`;
    });
    
    // Export empty cells
    emptyCells.forEach(index => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        csv += `${index},"[empty]","240 240 240",${row},${col},"(empty cell)"\n`;
    });
    
    return csv;
}

/**
 * Export comparison CSV (expected vs measured colours)
 * Used in scan phase to verify calibration accuracy
 * @source blog/ideas/reference documentation/Experiments-main/js/export.js:338-354
 * @param {Object} gridData - Grid data object
 * @param {Array<Array<number>>} gridData.sequences - Array of sequences
 * @param {Array<Object>} gridData.colours - Array of colour objects
 * @param {Array<Object>} scannedPalette - Array of measured RGB objects {r, g, b}
 * @returns {string} CSV content
 */
export function exportComparisonCSV(gridData, scannedPalette) {
    const { sequences, colours } = gridData;
    
    let csv = 'Index,Sequence,Expected,Measured\n';
    
    sequences.forEach((seq, i) => {
        if (i >= scannedPalette.length) return;
        
        const expected = simColour(seq, colours);
        const measured = scannedPalette[i];
        
        csv += `${i},"[${seq.join(' ')}]","${expected.r} ${expected.g} ${expected.b}","${measured.r} ${measured.g} ${measured.b}"\n`;
    });
    
    return csv;
}

/**
 * Parse grid CSV back into gridData structure
 * @param {string} csvContent - CSV file content
 * @returns {Object} Partial gridData object with metadata
 */
export function parseGridCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('Invalid CSV: no data rows');
    }
    
    // Parse metadata from comment lines
    const metadata = {
        sortMethod: 'Layer Count',
        layerCount: 4,
        tileSize: 10,
        gap: 1,
        baseLayers: 3,
        topLayers: 0,
        generatedDate: null,
        colorCount: null
    };
    
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line.startsWith('#')) {
            headerIndex = i;
            break;
        }
        
        // Parse metadata
        if (line.includes('Sort Method:')) {
            metadata.sortMethod = line.split('Sort Method:')[1].trim();
        } else if (line.includes('Layers:')) {
            metadata.layerCount = parseInt(line.split('Layers:')[1].trim()) || 4;
        } else if (line.includes('Tile Size:')) {
            metadata.tileSize = parseFloat(line.split('Tile Size:')[1].replace('mm', '').trim()) || 10;
        } else if (line.includes('Gap:')) {
            metadata.gap = parseFloat(line.split('Gap:')[1].replace('mm', '').trim()) || 1;
        } else if (line.includes('Base Layers:')) {
            metadata.baseLayers = parseInt(line.split('Base Layers:')[1].trim()) || 0;
        } else if (line.includes('Top Layers:')) {
            metadata.topLayers = parseInt(line.split('Top Layers:')[1].trim()) || 0;
        } else if (line.includes('Generated:')) {
            metadata.generatedDate = line.split('Generated:')[1].trim();
        } else if (line.includes('Colors:')) {
            metadata.colorCount = parseInt(line.split('Colors:')[1].trim());
        }
    }
    
    // Skip metadata comments and header
    const dataLines = lines.slice(headerIndex + 1);
    
    const sequences = [];
    const emptyCells = [];
    const colourNames = new Set();
    let maxRow = 0;
    let maxCol = 0;
    
    dataLines.forEach(line => {
        // Skip empty lines
        if (!line.trim()) return;
        
        // Parse CSV line (handle quoted fields)
        const match = line.match(/^(\d+),"([^"]+)","([^"]+)",(\d+),(\d+),"([^"]*)"/);
        if (!match) return;
        
        const [, index, seqStr, rgbStr, row, col, filNamesStr] = match;
        const idx = parseInt(index);
        const r = parseInt(row);
        const c = parseInt(col);
        
        maxRow = Math.max(maxRow, r);
        maxCol = Math.max(maxCol, c);
        
        // Check if empty cell
        if (seqStr === '[empty]') {
            emptyCells.push(idx);
            return;
        }
        
        // Parse sequence: "[1 2 3 4]" -> [1, 2, 3, 4]
        const seq = seqStr.slice(1, -1).split(/\s+/).map(Number);
        sequences[idx] = seq;
        
        // Collect unique colour names
        if (filNamesStr !== '(empty cell)') {
            filNamesStr.split('|').forEach(name => colourNames.add(name));
        }
    });
    
    const rows = maxRow + 1;
    const cols = maxCol + 1;
    
    // Return data with metadata
    return {
        sequences,
        rows,
        cols,
        emptyCells,
        colourNames: Array.from(colourNames),
        sortMethod: metadata.sortMethod,
        layerCount: metadata.layerCount,
        tileSize: metadata.tileSize,
        gap: metadata.gap,
        baseLayers: metadata.baseLayers,
        topLayers: metadata.topLayers,
        generatedDate: metadata.generatedDate,
        colorCount: metadata.colorCount
    };
}

/**
 * Trigger browser download of CSV file
 * @param {string} content - CSV content
 * @param {string} filename - Filename for download
 */
export function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

