/**
 * MFP-SourceActions.js
 * 
 * All SOURCE tab logic - grid generation, export, etc.
 * NO DOM manipulation - pure logic only.
 */

import { FILAMENT_COLOURS, DEFAULTS } from './MFP-Constants.js';
import { calculateGridLayout, buildSequenceMap, simColour, rgb_to_key } from '../../../shared/algorithms/index.js';
import { exportArtworkSTLs } from '../../../shared/algorithms/index.js';

export class MFPSourceActions {
    constructor(sharedState) {
        this.state = sharedState;
    }
    
    /**
     * Import project from ZIP
     */
    async importProject(file, toolBase) {
        if (!file) return;
        
        try {
            toolBase.updateValue('projectStatus', '⏳ Loading project...');
            
            // Read ZIP file
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            const zipData = await zip.loadAsync(file);
            
            console.log('✅ ZIP loaded, files:', Object.keys(zipData.files).length);
            
            // Try to load grid-layout.json (v1.2 format)
            let layout = null;
            const layoutFile = zipData.files['grid-layout.json'];
            if (layoutFile) {
                const layoutText = await layoutFile.async('text');
                layout = JSON.parse(layoutText);
                console.log('✅ Loaded grid-layout.json');
            }
            
            // Fallback: try grid-config.json
            if (!layout) {
                const configFile = zipData.files['grid-config.json'];
                if (configFile) {
                    const configText = await configFile.async('text');
                    const config = JSON.parse(configText);
                    // Convert config to layout format
                    layout = {
                        palette: config.colours || config.palette,
                        tiles: config.sequences.map((seq, idx) => ({
                            sequence: seq,
                            row: Math.floor(idx / config.cols),
                            col: idx % config.cols
                        })),
                        metadata: {
                            rows: config.rows,
                            cols: config.cols,
                            tileSize: config.tileSize,
                            gap: config.gap,
                            layerCount: config.layerCount,
                            baseLayers: config.baseLayers || 2
                        }
                    };
                    console.log('✅ Migrated grid-config.json to layout format');
                }
            }
            
            if (!layout) {
                toolBase.updateValue('projectStatus', '❌ No grid-layout.json or grid-config.json found in project');
                return;
            }
            
            // Reconstruct gridData
            const sequences = layout.tiles.map(t => t.sequence);
            const colours = layout.palette;
            const meta = layout.metadata;
            
            this.state.gridData = {
                sequences,
                colours,
                rows: meta.rows,
                cols: meta.cols,
                tileSize: meta.tileSize,
                gap: meta.gap,
                width: meta.cols * (meta.tileSize + meta.gap) - meta.gap,
                height: meta.rows * (meta.tileSize + meta.gap) - meta.gap,
                layerCount: meta.layerCount,
                baseLayers: meta.baseLayers || 2,
                perimeterMargin: meta.perimeterMargin || 0,
                emptyCells: meta.emptyCells || []
            };
            
            this.state.sequences = sequences;
            
            // Rebuild sequence map
            this.state.sequenceMap = buildSequenceMap(sequences, colours, meta.cols, { simColour, rgb_to_key });
            
            // Update filament picker
            const filamentIndices = colours.map(c => {
                const index = FILAMENT_COLOURS.findIndex(fc => fc.n === c.n);
                return index !== -1 ? index : 0;
            });
            
            toolBase.updateValue('filamentPicker', filamentIndices);
            toolBase.updateValue('projectStatus', `✅ Loaded ${meta.rows}×${meta.cols} grid (${sequences.length} tiles)`);
            
            // Save to localStorage
            localStorage.setItem('lastGridData', JSON.stringify(this.state.gridData));
            
            // Load scan data if present
            const scanFolder = Object.keys(zipData.files).filter(f => f.startsWith('scans/'));
            if (scanFolder.length > 0) {
                console.log(`📁 Project contains ${scanFolder.length} scan files`);
                // Store for SCAN tab to access
                this.state.importedScanData = {
                    zip: zipData,
                    files: scanFolder
                };
            }
            
            toolBase.draw();
            
        } catch (err) {
            console.error('❌ Project import failed:', err);
            toolBase.updateValue('projectStatus', `❌ Import failed: ${err.message}`);
        }
    }
    
    /**
     * Generate grid - COMPLETE IMPLEMENTATION
     */
    generateGrid(values, toolBase) {
        const selectedIndices = values.filamentPicker || [];
        
        if (!selectedIndices || selectedIndices.length < 2) {
            toolBase.updateValue('gridStatus', '❌ Select at least 2 filaments first');
            return;
        }
        
        if (selectedIndices.length > 10) {
            toolBase.updateValue('gridStatus', '❌ Maximum 10 filaments allowed');
            return;
        }
        
        try {
            toolBase.updateValue('gridStatus', '⏳ Generating grid...');
            
            const colours = selectedIndices.map(idx => FILAMENT_COLOURS[idx]);
            const layerCount = values.layerCount || 4;
            const baseLayers = values.baseLayers || 2;
            const tileSize = values.tileSize || 10;
            const gap = values.gap || 2;
            const perimeterMargin = values.perimeterMargin || 0;
            const maxWidth = values.maxWidth || 220;
            const maxHeight = values.maxHeight || 220;
            
            // Generate all unique sequences
            const sequences = [];
            const numColours = colours.length;
            const numVariableLayers = layerCount - baseLayers;
            
            for (let i = 0; i < Math.pow(numColours, numVariableLayers); i++) {
                const seq = Array(layerCount).fill(0);
                
                // Base layers (cycle through all colours)
                for (let layer = 0; layer < baseLayers; layer++) {
                    seq[layer] = (layer % numColours) + 1;
                }
                
                // Variable layers (all combinations)
                let index = i;
                for (let layer = baseLayers; layer < layerCount; layer++) {
                    seq[layer] = (index % numColours) + 1;
                    index = Math.floor(index / numColours);
                }
                
                sequences.push(seq);
            }
            
            this.state.sequences = sequences;
            
            // Calculate grid dimensions
            const layout = calculateGridLayout({
                sequenceCount: sequences.length,
                tileSize,
                gap,
                perimeterMargin,
                maxWidth,
                maxHeight
            });
            
            // Store grid data
            this.state.gridData = {
                sequences,
                colours,
                rows: layout.rows,
                cols: layout.cols,
                tileSize,
                gap,
                width: layout.width,
                height: layout.height,
                layerCount,
                baseLayers,
                perimeterMargin,
                emptyCells: layout.emptyCells || [],
                fitsConstraints: layout.fits
            };
            
            // Build sequence map for rendering
            this.state.sequenceMap = buildSequenceMap(sequences, colours, layout.cols, { simColour, rgb_to_key });
            
            // Save to localStorage for SCAN tab
            localStorage.setItem('lastGridData', JSON.stringify(this.state.gridData));
            
            const status = layout.fits 
                ? `✅ Grid: ${layout.rows}×${layout.cols} = ${sequences.length} tiles (${layout.width.toFixed(1)}×${layout.height.toFixed(1)}mm)`
                : `❌ Grid won't fit (${layout.width.toFixed(1)}×${layout.height.toFixed(1)}mm). Max: ${maxWidth}×${maxHeight}mm`;
            
            toolBase.updateValue('gridStatus', status);
            toolBase.draw();
            
        } catch (err) {
            toolBase.updateValue('gridStatus', `❌ Generation failed: ${err.message}`);
            console.error('Grid generation error:', err);
        }
    }
    
    /**
     * Generate split grids - COMPLETE IMPLEMENTATION
     */
    generateSplitGrids(values, toolBase) {
        if (!this.state.splitGridInfo) {
            toolBase.updateValue('gridStatus', '❌ No split grid info available. Try "Generate Grid" first.');
            return;
        }
        
        const info = this.state.splitGridInfo;
        const grids = [];
        
        try {
            toolBase.updateValue('gridStatus', '⏳ Generating split grids...');
            
            // Split sequences into chunks
            for (let i = 0; i < info.gridsNeeded; i++) {
                const start = i * info.maxTilesPerGrid;
                const end = Math.min(start + info.maxTilesPerGrid, info.sequences.length);
                const chunkSequences = info.sequences.slice(start, end);
                
                // Calculate layout for this chunk
                const layout = calculateGridLayout({
                    sequenceCount: chunkSequences.length,
                    tileSize: info.tileSize,
                    gap: info.gap,
                    perimeterMargin: info.perimeterMargin || 0,
                    maxWidth: info.constraints.maxWidth,
                    maxHeight: info.constraints.maxHeight
                });
                
                if (!layout.fits) {
                    toolBase.updateValue('gridStatus', `❌ Grid ${i + 1} won't fit (${chunkSequences.length} tiles)`);
                    return;
                }
                
                grids.push({
                    index: i,
                    sequences: chunkSequences,
                    colours: info.colours,
                    rows: layout.rows,
                    cols: layout.cols,
                    tileSize: info.tileSize,
                    gap: info.gap,
                    width: layout.width,
                    height: layout.height,
                    emptyCells: layout.emptyCells,
                    layerCount: info.layerCount,
                    baseLayers: info.baseLayers
                });
            }
            
            // Store split grids
            this.state.splitGrids = grids;
            this.state.gridData = grids[0]; // Show first grid by default
            
            // Build sequence map for first grid
            this.state.sequenceMap = buildSequenceMap(
                grids[0].sequences,
                grids[0].colours,
                grids[0].cols,
                { simColour, rgb_to_key }
            );
            
            const status = `✅ Generated ${grids.length} grids:\n` +
                grids.map((g, i) => 
                    `Grid ${i + 1}: ${g.rows}×${g.cols} = ${g.sequences.length} tiles (${g.width.toFixed(1)}×${g.height.toFixed(1)}mm)`
                ).join('\n') +
                `\nShowing Grid 1. Use Export buttons for all grids.`;
            
            toolBase.updateValue('gridStatus', status);
            toolBase.draw();
            
        } catch (err) {
            toolBase.updateValue('gridStatus', `❌ Split grid generation failed: ${err.message}`);
            console.error('Split grid error:', err);
        }
    }
    
    /**
     * Export grid as PNG - COMPLETE IMPLEMENTATION
     */
    exportGridPNG(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.updateValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        try {
            const gridsToExport = this.state.splitGrids || [this.state.gridData];
            
            gridsToExport.forEach((grid, index) => {
                // Create high-res canvas for export
                const dpi = 300;
                const widthInches = grid.width / 25.4;
                const heightInches = grid.height / 25.4;
                
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = Math.round(widthInches * dpi);
                exportCanvas.height = Math.round(heightInches * dpi);
                const exportCtx = exportCanvas.getContext('2d');
                
                // Draw grid at high resolution
                this._drawCalibrationGrid(exportCtx, exportCanvas, grid);
                
                // Export as PNG
                exportCanvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    const filename = this._generateGridFilename(
                        grid, 
                        this.state.splitGrids ? index + 1 : null, 
                        this.state.splitGrids ? gridsToExport.length : null, 
                        'png'
                    );
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                });
            });
            
            const count = gridsToExport.length;
            toolBase.updateValue('exportStatus', `✅ Exported ${count} grid PNG${count > 1 ? 's' : ''}`);
            
        } catch (err) {
            toolBase.updateValue('exportStatus', `❌ PNG export failed: ${err.message}`);
            console.error('PNG export error:', err);
        }
    }
    
    /**
     * Export grid as STL - COMPLETE IMPLEMENTATION
     */
    exportGridSTL(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.updateValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        try {
            toolBase.updateValue('exportStatus', '⏳ Generating STL files...');
            
            const gridsToExport = this.state.splitGrids || [this.state.gridData];
            let totalFiles = 0;
            
            gridsToExport.forEach((grid, gridIndex) => {
                // Export grid STLs using the algorithm
                const stls = exportArtworkSTLs(
                    this._createGridLayerMaps(grid),
                    grid.colours.map(c => c.n),
                    {
                        imageWidth: grid.cols,
                        imageHeight: grid.rows,
                        printWidth: grid.width,
                        layerHeight: 0.08
                    }
                );
                
                // Download each STL with systematic filename
                Object.entries(stls).forEach(([originalFilename, content]) => {
                    // Extract color name from original filename (format: "artwork_ColorName.stl")
                    const colorMatch = originalFilename.match(/artwork_(.+)\.stl$/);
                    const colorName = colorMatch ? colorMatch[1] : 'unknown';
                    
                    // Generate base filename
                    const baseFilename = this._generateGridFilename(
                        grid, 
                        this.state.splitGrids ? gridIndex + 1 : null, 
                        this.state.splitGrids ? gridsToExport.length : null, 
                        'stl'
                    );
                    
                    // Insert color name before extension
                    const filename = baseFilename.replace('.stl', `-${colorName}.stl`);
                    
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                    totalFiles++;
                });
            });
            
            toolBase.updateValue('exportStatus', `✅ Exported ${totalFiles} STL files`);
            
        } catch (err) {
            toolBase.updateValue('exportStatus', `❌ STL export failed: ${err.message}`);
            console.error('STL export error:', err);
        }
    }
    
    /**
     * Export grid as CSV - COMPLETE IMPLEMENTATION
     */
    exportGridCSV(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.updateValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        try {
            const grid = this.state.gridData;
            
            // Generate CSV
            let csv = '# Calibration Grid Layout\n';
            csv += `# Generated: ${new Date().toISOString()}\n`;
            csv += `# Filaments: ${grid.colours.map(c => c.n).join(', ')}\n`;
            csv += `# Grid: ${grid.rows}×${grid.cols} tiles\n`;
            csv += `# Tile size: ${grid.tileSize}mm, Gap: ${grid.gap}mm\n`;
            csv += '#\n';
            csv += 'Index,Row,Col,Sequence,R,G,B,Hex\n';
            
            grid.sequences.forEach((seq, idx) => {
                const row = Math.floor(idx / grid.cols);
                const col = idx % grid.cols;
                const seqStr = seq.join('');
                const color = simColour(seq, grid.colours);
                const hex = `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
                
                csv += `${idx},${row},${col},"${seqStr}",${color.r},${color.g},${color.b},${hex}\n`;
            });
            
            // Download
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this._generateGridFilename(grid, null, null, 'csv');
            a.click();
            URL.revokeObjectURL(url);
            
            toolBase.updateValue('exportStatus', `✅ Exported grid CSV`);
            
        } catch (err) {
            toolBase.updateValue('exportStatus', `❌ CSV export failed: ${err.message}`);
            console.error('CSV export error:', err);
        }
    }
    
    /**
     * Export complete package as ZIP - COMPLETE IMPLEMENTATION
     */
    async exportCompletePackage(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.updateValue('exportProjectZipStatus', '❌ Generate grid first');
            return;
        }
        
        try {
            toolBase.updateValue('exportProjectZipStatus', '⏳ Building project ZIP...');
            
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            const grid = this.state.gridData;
            
            // Add grid-layout.json
            const layout = {
                version: '1.2.0',
                palette: grid.colours,
                tiles: grid.sequences.map((seq, idx) => ({
                    sequence: seq,
                    row: Math.floor(idx / grid.cols),
                    col: idx % grid.cols
                })),
                metadata: {
                    rows: grid.rows,
                    cols: grid.cols,
                    tileSize: grid.tileSize,
                    gap: grid.gap,
                    layerCount: grid.layerCount,
                    baseLayers: grid.baseLayers,
                    perimeterMargin: grid.perimeterMargin,
                    emptyCells: grid.emptyCells,
                    generatedAt: new Date().toISOString()
                }
            };
            zip.file('grid-layout.json', JSON.stringify(layout, null, 2));
            
            // Add README.txt
            const readme = this._generateReadme(grid);
            zip.file('README.txt', readme);
            
            // Add scan data if exists
            if (this.state.scanAnalysis) {
                const scanFolder = zip.folder('scans');
                
                // Save scan image
                if (this.state.scanImageElement) {
                    const canvas = document.createElement('canvas');
                    canvas.width = this.state.scanImageElement.width;
                    canvas.height = this.state.scanImageElement.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(this.state.scanImageElement, 0, 0);
                    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve));
                    scanFolder.file('scan.png', imageBlob);
                }
                
                // Save analysis data
                scanFolder.file('analysis.json', JSON.stringify(this.state.scanAnalysis, null, 2));
                
                // Save quantization config
                if (this.state.quantizationConfig) {
                    scanFolder.file('quantization-config.json', JSON.stringify(this.state.quantizationConfig, null, 2));
                }
                
                // Save calibrated palette GPL
                const gpl = this._generateCalibratedPaletteGPL(grid);
                scanFolder.file('calibrated-palette.gpl', gpl);
                
                // Save comparison CSV
                const comparisonCSV = this._generateComparisonCSV(grid);
                scanFolder.file('comparison.csv', comparisonCSV);
            }
            
            // Generate ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            
            // Download
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this._generateGridFilename(grid, null, null, 'zip');
            a.click();
            URL.revokeObjectURL(url);
            
            const hasScans = this.state.scanAnalysis ? ' (with scan data)' : '';
            toolBase.updateValue('exportProjectZipStatus', `✅ Exported complete project ZIP${hasScans}`);
            
        } catch (err) {
            toolBase.updateValue('exportProjectZipStatus', `❌ ZIP export failed: ${err.message}`);
            console.error('ZIP export error:', err);
        }
    }
    
    // ===== HELPER METHODS =====
    
    _generateGridFilename(gridData, gridIndex, totalGrids, extension) {
        // Format: cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm[-gXofY]-YYYYMMDD.ext
        const colors = gridData.colours.length;
        const layers = gridData.layerCount;
        const rows = gridData.rows;
        const cols = gridData.cols;
        const tileSize = gridData.tileSize;
        
        const now = new Date();
        const dateStamp = now.getFullYear().toString() +
                         (now.getMonth() + 1).toString().padStart(2, '0') +
                         now.getDate().toString().padStart(2, '0');
        
        let filename = `cal-${colors}c${layers}L-${rows}x${cols}-${tileSize}mm`;
        
        if (gridIndex !== null && totalGrids !== null && totalGrids > 1) {
            filename += `-g${gridIndex}of${totalGrids}`;
        }
        
        filename += `-${dateStamp}.${extension}`;
        return filename;
    }
    
    _drawCalibrationGrid(ctx, canvas, grid) {
        // Import renderer
        import('./MFP-GridRenderer.js').then(({ drawCalibrationGrid }) => {
            drawCalibrationGrid(ctx, canvas, grid, this.state.sequenceMap);
        });
    }
    
    _createGridLayerMaps(grid) {
        const { sequences, rows, cols, colours } = grid;
        const numLayers = sequences[0].length;
        const layerMaps = Array.from({ length: numLayers }, () => 
            Array.from({ length: colours.length }, () => new Set())
        );
        
        sequences.forEach((seq, idx) => {
            if (grid.emptyCells && grid.emptyCells.includes(idx)) return;
            
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            
            seq.forEach((filamentIdx, layerIdx) => {
                if (filamentIdx > 0) {
                    layerMaps[layerIdx][filamentIdx - 1].add(`${col},${row}`);
                }
            });
        });
        
        return layerMaps;
    }
    
    _generateReadme(grid) {
        return `MULTIFILAMENT PRINT CALIBRATION GRID
Generated: ${new Date().toISOString()}

GRID SPECIFICATIONS
-------------------
Dimensions: ${grid.rows}×${grid.cols} tiles
Physical size: ${grid.width.toFixed(1)}×${grid.height.toFixed(1)}mm
Tile size: ${grid.tileSize}mm
Gap: ${grid.gap}mm
Total tiles: ${grid.sequences.length}

FILAMENTS
---------
${grid.colours.map((c, i) => `${i + 1}. ${c.n} (${c.h})`).join('\n')}

LAYER STRUCTURE
---------------
Total layers: ${grid.layerCount}
Base layers: ${grid.baseLayers}
Variable layers: ${grid.layerCount - grid.baseLayers}

Each tile tests a unique combination of filament layers.
Print settings are in grid-layout.json.
`;
    }
    
    _generateCalibratedPaletteGPL(grid) {
        if (!this.state.scanAnalysis) return '';
        
        const filamentNames = grid.colours.map(c => c.n).join('');
        const uniquePalette = this._generateUniquePaletteFromAnalysis(grid);
        
        let gpl = 'GIMP Palette\n';
        gpl += `Name: ${filamentNames}\n`;
        gpl += `Columns: ${Math.min(uniquePalette.length, 16)}\n`;
        gpl += `# Calibrated from scanned print\n`;
        gpl += `# Generated: ${new Date().toISOString()}\n`;
        gpl += `# Filaments: ${grid.colours.map(c => c.n).join(', ')}\n`;
        gpl += '#\n';
        
        uniquePalette.forEach(color => {
            gpl += `${String(color.rgb.r).padStart(3)} ${String(color.rgb.g).padStart(3)} ${String(color.rgb.b).padStart(3)} ${color.sequenceStr}\n`;
        });
        
        return gpl;
    }
    
    _generateComparisonCSV(grid) {
        if (!this.state.scanAnalysis) return '';
        
        let csv = '# Expected vs Measured Color Comparison\n';
        csv += `# Generated: ${new Date().toISOString()}\n#\n`;
        csv += 'Index,Row,Col,Sequence,Expected_R,Expected_G,Expected_B,Measured_R,Measured_G,Measured_B,Delta_E,Std_R,Std_G,Std_B,Pixels_Sampled\n';
        
        this.state.scanAnalysis.forEach(tile => {
            const expectedColor = simColour(tile.sequence, grid.colours);
            const deltaR = tile.rgb.r - expectedColor.r;
            const deltaG = tile.rgb.g - expectedColor.g;
            const deltaB = tile.rgb.b - expectedColor.b;
            const deltaE = Math.sqrt(deltaR**2 + deltaG**2 + deltaB**2);
            
            csv += `${tile.index},${tile.row},${tile.col},"${tile.sequenceStr}",`;
            csv += `${expectedColor.r},${expectedColor.g},${expectedColor.b},`;
            csv += `${tile.rgb.r},${tile.rgb.g},${tile.rgb.b},`;
            csv += `${deltaE.toFixed(2)},`;
            csv += `${tile.std.r.toFixed(2)},${tile.std.g.toFixed(2)},${tile.std.b.toFixed(2)},`;
            csv += `${tile.pixelsSampled}\n`;
        });
        
        return csv;
    }
    
    _generateUniquePaletteFromAnalysis(grid) {
        const sequenceMap = new Map();
        
        this.state.scanAnalysis.forEach(data => {
            const key = data.sequenceStr;
            if (!sequenceMap.has(key)) {
                sequenceMap.set(key, {
                    sequence: data.sequence,
                    sequenceStr: key,
                    tiles: []
                });
            }
            sequenceMap.get(key).tiles.push(data);
        });
        
        const palette = [];
        sequenceMap.forEach(({ sequence, sequenceStr, tiles }) => {
            const avgR = Math.round(tiles.reduce((sum, t) => sum + t.rgb.r, 0) / tiles.length);
            const avgG = Math.round(tiles.reduce((sum, t) => sum + t.rgb.g, 0) / tiles.length);
            const avgB = Math.round(tiles.reduce((sum, t) => sum + t.rgb.b, 0) / tiles.length);
            
            palette.push({
                sequence,
                sequenceStr,
                rgb: { r: avgR, g: avgG, b: avgB },
                hex: `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`,
                tileCount: tiles.length
            });
        });
        
        return palette;
    }
}

