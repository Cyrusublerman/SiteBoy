/**
 * MFP-ProjectIO.js - Project Import/Export Module
 * 
 * Handles ZIP file creation and parsing for multifilament print projects.
 * Supports version migration and scan analysis inclusion.
 * 
 * Uses JSZip library for ZIP operations.
 */

// Assuming JSZip is available globally or imported
// import JSZip from 'jszip'; // If using modules

import { FILAMENT_COLOURS } from './MFP-Constants.js';

/**
 * Export project as ZIP
 * @param {Object} projectData - Complete project state
 * @param {string} filename - ZIP filename (without extension)
 * @returns {Promise<void>}
 */
export async function exportProjectZIP(projectData, filename = 'multifilament-project') {
    const JSZip = window.JSZip;
    if (!JSZip) {
        throw new Error('JSZip library not loaded');
    }
    
    const zip = new JSZip();
    
    // Create root README
    const readme = generateReadme(projectData);
    zip.file('README.md', readme);
    
    // Add grid files
    if (projectData.gridData) {
        // Grid config JSON
        const gridConfig = {
            version: '2.0',
            colours: projectData.selectedFilaments.map(idx => FILAMENT_COLOURS[idx]),
            layerCount: projectData.gridData.layerCount,
            rows: projectData.gridData.rows,
            cols: projectData.gridData.cols,
            width: projectData.gridData.width,
            height: projectData.gridData.height,
            tileSize: projectData.gridData.tileSize,
            gapSize: projectData.gridData.gapSize,
            sequences: projectData.sequences,
            generatedAt: new Date().toISOString()
        };
        zip.file('grid-config.json', JSON.stringify(gridConfig, null, 2));
        
        // Grid layout JSON
        const gridLayout = {
            rows: projectData.gridData.rows,
            cols: projectData.gridData.cols,
            sequences: projectData.sequences
        };
        zip.file('grid-layout.json', JSON.stringify(gridLayout, null, 2));
        
        // TODO: Add grid PNG, CSV, STL
    }
    
    // Add scan analysis if available
    if (projectData.scanAnalysis && projectData.scanImageElement) {
        const scanFolder = zip.folder('scans');
        
        // Scan image as PNG
        const scanPNG = await imageToPNGBlob(projectData.scanImageElement);
        scanFolder.file('scan.png', scanPNG);
        
        // Analysis JSON
        const analysisJSON = {
            version: '2.0',
            analyzedAt: new Date().toISOString(),
            tiles: projectData.scanAnalysis,
            gridAlignment: projectData.gridAlignment
        };
        scanFolder.file('analysis.json', JSON.stringify(analysisJSON, null, 2));
        
        // Quantization config if available
        if (projectData.quantizationConfig) {
            scanFolder.file('quantization-config.json', JSON.stringify(projectData.quantizationConfig, null, 2));
        }
        
        // Calibrated palette GPL
        if (projectData.scanAnalysis) {
            const gpl = generateGIMPPalette(projectData.scanAnalysis, projectData.selectedFilaments);
            scanFolder.file('calibrated-palette.gpl', gpl);
        }
        
        // Comparison CSV
        if (projectData.scanAnalysis) {
            const csv = generateComparisonCSV(projectData.scanAnalysis, projectData.selectedFilaments);
            scanFolder.file('comparison.csv', csv);
        }
    }
    
    // Generate and download ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.zip`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Import project from ZIP
 * @param {File} zipFile - ZIP file object
 * @returns {Promise<Object>} Parsed project data
 */
export async function importProjectZIP(zipFile) {
    const JSZip = window.JSZip;
    if (!JSZip) {
        throw new Error('JSZip library not loaded');
    }
    
    const zip = await JSZip.loadAsync(zipFile);
    const projectData = {
        selectedFilaments: [],
        gridData: null,
        sequences: null,
        sequenceMap: null,
        scanImageElement: null,
        scanAnalysis: null,
        gridAlignment: null,
        quantizationConfig: null,
        version: 'unknown'
    };
    
    // Load grid config
    const gridConfigFile = zip.file('grid-config.json');
    if (gridConfigFile) {
        const gridConfigText = await gridConfigFile.async('text');
        const gridConfig = JSON.parse(gridConfigText);
        
        projectData.version = gridConfig.version || '1.0';
        projectData.gridData = {
            colours: gridConfig.colours,
            layerCount: gridConfig.layerCount,
            rows: gridConfig.rows,
            cols: gridConfig.cols,
            width: gridConfig.width,
            height: gridConfig.height,
            tileSize: gridConfig.tileSize,
            gapSize: gridConfig.gapSize
        };
        projectData.sequences = gridConfig.sequences;
        
        // Map colours back to filament indices
        projectData.selectedFilaments = gridConfig.colours.map(c =>
            FILAMENT_COLOURS.findIndex(f => f.n === c.n)
        ).filter(idx => idx !== -1);
        
        // Build sequence map
        projectData.sequenceMap = new Map();
        gridConfig.sequences.forEach((seq, idx) => {
            const key = seq.join(',');
            projectData.sequenceMap.set(key, idx);
        });
    }
    
    // Load scan image if available
    const scanImageFile = zip.file('scans/scan.png');
    if (scanImageFile) {
        const scanBlob = await scanImageFile.async('blob');
        projectData.scanImageElement = await blobToImage(scanBlob);
    }
    
    // Load scan analysis if available
    const analysisFile = zip.file('scans/analysis.json');
    if (analysisFile) {
        const analysisText = await analysisFile.async('text');
        const analysis = JSON.parse(analysisText);
        projectData.scanAnalysis = analysis.tiles;
        projectData.gridAlignment = analysis.gridAlignment;
    }
    
    // Load quantization config if available
    const quantConfigFile = zip.file('scans/quantization-config.json');
    if (quantConfigFile) {
        const quantText = await quantConfigFile.async('text');
        projectData.quantizationConfig = JSON.parse(quantText);
    }
    
    return projectData;
}

/**
 * Import grid from CSV
 * @param {File} csvFile - CSV file object
 * @returns {Promise<Object>} Parsed grid data
 */
export async function importGridCSV(csvFile) {
    const text = await csvFile.text();
    const lines = text.trim().split('\n');
    
    if (lines.length < 2) {
        throw new Error('Invalid CSV format');
    }
    
    // Parse header
    const header = lines[0].split(',').map(h => h.trim());
    
    // Parse rows
    const sequences = [];
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(v => v.trim());
        if (row.length > 0 && row[0] !== '') {
            // Extract sequence (assuming format: idx, L1, L2, L3, ...)
            const seq = row.slice(1).map(v => parseInt(v, 10)).filter(n => !isNaN(n));
            sequences.push(seq);
        }
    }
    
    // Infer grid dimensions and filaments
    const maxValue = Math.max(...sequences.flat());
    const layerCount = sequences[0]?.length || 0;
    
    return {
        sequences,
        layerCount,
        inferredFilamentCount: maxValue + 1
    };
}

/**
 * Generate README content
 * @param {Object} projectData
 * @returns {string}
 */
function generateReadme(projectData) {
    const lines = [
        '# Multifilament Print Project',
        '',
        '## Grid Configuration',
        `- Colours: ${projectData.selectedFilaments?.length || 0}`,
        `- Layers: ${projectData.gridData?.layerCount || 0}`,
        `- Grid: ${projectData.gridData?.rows || 0}×${projectData.gridData?.cols || 0}`,
        `- Tile Size: ${projectData.gridData?.tileSize || 0}mm`,
        `- Gap Size: ${projectData.gridData?.gapSize || 0}mm`,
        '',
        '## Files',
        '- `grid-config.json` - Complete grid configuration',
        '- `grid-layout.json` - Grid layout and sequences',
        ''
    ];
    
    if (projectData.scanAnalysis) {
        lines.push('## Scan Analysis');
        lines.push('- `scans/scan.png` - Scanned calibration image');
        lines.push('- `scans/analysis.json` - Tile-by-tile color analysis');
        lines.push('- `scans/calibrated-palette.gpl` - GIMP palette');
        lines.push('- `scans/comparison.csv` - Expected vs actual colors');
        lines.push('');
    }
    
    lines.push('Generated by SiteBoy Multifilament Print Tool');
    lines.push(`Date: ${new Date().toISOString()}`);
    
    return lines.join('\n');
}

/**
 * Generate GIMP Palette (GPL) file
 * @param {Array} scanAnalysis
 * @param {Array} selectedFilaments
 * @returns {string}
 */
function generateGIMPPalette(scanAnalysis, selectedFilaments) {
    const lines = [
        'GIMP Palette',
        'Name: Multifilament Calibrated',
        '#'
    ];
    
    scanAnalysis.forEach((tile, idx) => {
        if (tile.success && tile.avgR !== undefined) {
            const name = `Tile${idx}_F${tile.filamentIndex || 0}`;
            lines.push(`${Math.round(tile.avgR)} ${Math.round(tile.avgG)} ${Math.round(tile.avgB)} ${name}`);
        }
    });
    
    return lines.join('\n');
}

/**
 * Generate comparison CSV
 * @param {Array} scanAnalysis
 * @param {Array} selectedFilaments
 * @returns {string}
 */
function generateComparisonCSV(scanAnalysis, selectedFilaments) {
    const lines = [
        'Tile,Expected_R,Expected_G,Expected_B,Actual_R,Actual_G,Actual_B,Delta_E,Variance'
    ];
    
    scanAnalysis.forEach((tile, idx) => {
        if (tile.success && tile.avgR !== undefined) {
            const expected = FILAMENT_COLOURS[selectedFilaments[tile.filamentIndex || 0]];
            const deltaE = tile.deltaE || 0;
            const variance = tile.variance || 0;
            
            lines.push([
                idx,
                expected.r, expected.g, expected.b,
                Math.round(tile.avgR), Math.round(tile.avgG), Math.round(tile.avgB),
                deltaE.toFixed(2),
                variance.toFixed(2)
            ].join(','));
        }
    });
    
    return lines.join('\n');
}

/**
 * Convert Image element to PNG Blob
 * @param {HTMLImageElement} img
 * @returns {Promise<Blob>}
 */
async function imageToPNGBlob(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png');
    });
}

/**
 * Convert Blob to Image element
 * @param {Blob} blob
 * @returns {Promise<HTMLImageElement>}
 */
async function blobToImage(blob) {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    return new Promise((resolve, reject) => {
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = reject;
        img.src = url;
    });
}

