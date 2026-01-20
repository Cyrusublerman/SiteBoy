/**
 * MFP-SourceActions.js
 * 
 * All SOURCE tab logic - grid generation, export, etc.
 * NO DOM manipulation - pure logic only.
 */

import { FILAMENT_COLOURS, DEFAULTS } from './MFP-Constants.js';
import { calculateGridLayout, calculateConstraints } from '../../../shared/algorithms/layout/grid-layout.js';
import { buildSequenceMap, generateSequences, sortSequences } from '../../../shared/algorithms/combinatorics/sequences.js';
import { simColour, rgb_to_key } from '../../../shared/algorithms/color/color-utils.js';
import { exportArtworkSTLs } from '../../../shared/algorithms/geometry/stl-generation.js';

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
            toolBase.setValue('projectStatus', '⏳ Loading project...');
            
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
                toolBase.setValue('projectStatus', '❌ No grid-layout.json or grid-config.json found in project');
                return;
            }
            
            // Handle different layout formats
            let sequences, colours, meta;
            
            if (layout.tiles && layout.gridSize) {
                // New format (from generateLayoutJSON algorithm)
                sequences = layout.tiles.map(t => t.sequence);
                colours = layout.palette.map(p => ({
                    n: p.name || p.n,
                    h: p.hex || p.h
                }));
                meta = {
                    rows: layout.gridSize.rows,
                    cols: layout.gridSize.cols,
                    tileSize: layout.tileSize || layout.dimensions?.tileSize,
                    gap: layout.gap,
                    layerCount: layout.layerCount,
                    baseLayers: layout.baseLayers || 2,
                    topLayers: layout.topLayers || 0,
                    perimeterMargin: layout.perimeterMargin || 0,
                    emptyCells: layout.tiles.filter(t => t.isEmpty).map(t => t.index),
                    sortMethod: layout.sortMethod,
                    // Constraints
                    maxWidth: layout.constraints?.maxWidth || layout.constraints?.bedWidth,
                    maxHeight: layout.constraints?.maxHeight || layout.constraints?.bedHeight,
                    scanWidth: layout.constraints?.scanWidth,
                    scanHeight: layout.constraints?.scanHeight,
                    // Filament settings
                    baseFilament: layout.baseFilament,
                    topFilament: layout.topFilament,
                    gapFilament: layout.gapFilament,
                    fillGaps: layout.fillGaps
                };
            } else if (layout.tiles && layout.metadata) {
                // Old format (simplified metadata)
                sequences = layout.tiles.map(t => t.sequence);
                colours = layout.palette || layout.colours;
                meta = layout.metadata;
            } else {
                toolBase.setValue('projectStatus', '❌ Unknown layout format');
                return;
            }
            
            console.log('✅ Parsed layout, meta:', meta);
            
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
            
            toolBase.setValue('filamentPicker', filamentIndices);
            
            // Update ALL UI controls with imported values from ALL tabs
            
            // SOURCE tab - Grid settings
            toolBase.setValue('layerCount', meta.layerCount);
            toolBase.setValue('baseLayers', meta.baseLayers || 2);
            toolBase.setValue('topLayers', meta.topLayers || 0);
            toolBase.setValue('tileSize', meta.tileSize);
            toolBase.setValue('gap', meta.gap);
            toolBase.setValue('perimeterMargin', meta.perimeterMargin || 0);
            toolBase.setValue('layerHeight', meta.layerHeight || 0.08);
            
            // SOURCE tab - Constraints
            if (meta.maxWidth) toolBase.setValue('bedWidth', meta.maxWidth);
            if (meta.maxHeight) toolBase.setValue('bedHeight', meta.maxHeight);
            if (meta.scanWidth) toolBase.setValue('scanWidth', meta.scanWidth);
            if (meta.scanHeight) toolBase.setValue('scanHeight', meta.scanHeight);
            
            // SOURCE tab - Filament dropdowns
            const filamentNames = colours.map(c => c.n);
            if (filamentNames.length > 0) {
                const defaultFilament = filamentNames[0];
                toolBase.setValue('baseFilament', meta.baseFilament || defaultFilament);
                toolBase.setValue('topFilament', meta.topFilament || defaultFilament);
                toolBase.setValue('gapFilament', meta.gapFilament || defaultFilament);
            }
            
            // SOURCE tab - Options
            if (meta.fillGaps) {
                toolBase.setValue('gapFillOptions', ['Fill Gaps']);
            }
            if (meta.sortMethod) {
                toolBase.setValue('sortMethod', meta.sortMethod);
            }
            if (meta.canvasView) {
                toolBase.setValue('canvasView', meta.canvasView);
            }
            if (meta.exportOptions) {
                toolBase.setValue('exportOptions', meta.exportOptions);
            }
            
            // SCAN tab settings
            if (meta.scanSettings) {
                const scan = meta.scanSettings;
                if (scan.displayMode) toolBase.setValue('scanDisplayMode', scan.displayMode);
                if (scan.deadzonePercent !== undefined) toolBase.setValue('deadzonePercent', scan.deadzonePercent);
                if (scan.gridOffsetX !== undefined) toolBase.setValue('gridOffsetX', scan.gridOffsetX);
                if (scan.gridOffsetY !== undefined) toolBase.setValue('gridOffsetY', scan.gridOffsetY);
                if (scan.gridRotation !== undefined) toolBase.setValue('gridRotation', scan.gridRotation);
                if (scan.gridOptions) toolBase.setValue('gridOptions', scan.gridOptions);
                if (scan.resortGrid) toolBase.setValue('resortGrid', scan.resortGrid);
            }
            
            // QUANTIZE tab settings
            if (meta.quantizeSettings) {
                const quant = meta.quantizeSettings;
                if (quant.printWidth !== undefined) toolBase.setValue('printWidth', quant.printWidth);
                if (quant.ditherStrength !== undefined) toolBase.setValue('ditherStrength', quant.ditherStrength);
                if (quant.minDetail !== undefined) toolBase.setValue('minDetail', quant.minDetail);
            }
            
            // EXPORT tab settings
            if (meta.exportSettings) {
                const exp = meta.exportSettings;
                if (exp.layerHeightExport !== undefined) toolBase.setValue('layerHeightExport', exp.layerHeightExport);
                if (exp.canvasMode) toolBase.setValue('canvasMode', exp.canvasMode);
            }
            
            toolBase.setValue('projectStatus', `✅ Loaded ${meta.rows}×${meta.cols} grid (${sequences.length} tiles) - All settings restored`);
            
            console.log('✅ All UI controls updated from imported project (ALL tabs)');
            
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
            toolBase.setValue('projectStatus', `❌ Import failed: ${err.message}`);
        }
    }
    
    /**
     * Generate live preview (automatic grid generation as settings change)
     * EXACT copy from working monolith - DO NOT MODIFY
     */
    generateLivePreview(values, toolBase) {
        console.log('🔧 generateLivePreview called', {
            selectedFilaments: this.state.selectedFilaments,
            values
        });
        
        // Generate preview grid without validation - just show what it would look like
        const selectedCount = this.state.selectedFilaments ? this.state.selectedFilaments.length : 0;
        if (selectedCount < 2) {
            console.log('❌ Not enough filaments:', selectedCount);
            return; // Requires at least 2 colors
        }
        
        const selectedColors = this.state.selectedFilaments.map(idx => FILAMENT_COLOURS[idx]);
        console.log('✅ Selected colors:', selectedColors);
        
        // Generate sequences using algorithm
        this.state.sequences = generateSequences(selectedColors.length, values.layerCount);
        
        // Calculate layout (force it even if oversized)
        const constraints = calculateConstraints({
            bedW: values.bedWidth,
            bedH: values.bedHeight,
            scanW: values.scanWidth,
            scanH: values.scanHeight
        });
        
        // Store both bed and scan constraints for visualization
        this.state.gridConstraints = {
            maxWidth: constraints.maxWidth,
            maxHeight: constraints.maxHeight,
            bedWidth: values.bedWidth,
            bedHeight: values.bedHeight,
            scanWidth: values.scanWidth,
            scanHeight: values.scanHeight
        };
        
        // Try to fit in constraints
        const layout = calculateGridLayout({
            sequenceCount: this.state.sequences.length,
            tileSize: values.tileSize,
            gap: values.gap,
            perimeterMargin: values.perimeterMargin || 0,
            maxWidth: constraints.maxWidth,
            maxHeight: constraints.maxHeight
        });
        
        if (layout.fits) {
            // Normal generation
            this.state.gridData = {
                sequences: this.state.sequences,
                colours: selectedColors,
                rows: layout.rows,
                cols: layout.cols,
                tileSize: values.tileSize,
                gap: values.gap,
                perimeterMargin: values.perimeterMargin || 0,
                width: layout.width,
                height: layout.height,
                emptyCells: layout.emptyCells,
                layerCount: values.layerCount,
                baseLayers: values.baseLayers,
                topLayers: values.topLayers,
                sortMethod: values.sortMethod || 'Layer Count',
                isPreview: true,
                fitsConstraints: true
            };
        } else {
            // Generate anyway, but mark as oversized
            // Use unconstrained square layout
            const cols = Math.ceil(Math.sqrt(this.state.sequences.length));
            const rows = Math.ceil(this.state.sequences.length / cols);
            const perimeterMargin = values.perimeterMargin || 0;
            const step = values.tileSize + values.gap;
            const gridWidth = cols * step - values.gap;
            const gridHeight = rows * step - values.gap;
            const width = gridWidth + (perimeterMargin * 2);
            const height = gridHeight + (perimeterMargin * 2);
            
            const totalCells = rows * cols;
            const emptyCells = [];
            for (let i = this.state.sequences.length; i < totalCells; i++) {
                emptyCells.push(i);
            }
            
            this.state.gridData = {
                sequences: this.state.sequences,
                colours: selectedColors,
                rows,
                cols,
                tileSize: values.tileSize,
                gap: values.gap,
                perimeterMargin: values.perimeterMargin || 0,
                width,
                height,
                emptyCells,
                layerCount: values.layerCount,
                baseLayers: values.baseLayers,
                topLayers: values.topLayers,
                sortMethod: values.sortMethod || 'Layer Count',
                isPreview: true,
                fitsConstraints: false
            };
        }
        
        // Build sequence map
        this.state.sequenceMap = buildSequenceMap(
            this.state.sequences,
            selectedColors,
            this.state.gridData.cols,
            { simColour, rgb_to_key }
        );
        
        // Sort sequences if needed
        if (values.sortMethod && values.sortMethod !== 'Layer Count') {
            const sorted = sortSequences(
                this.state.sequences,
                values.sortMethod,
                selectedColors,
                { simColour }
            );
            this.state.sequences = sorted.sequences;
            this.state.gridData.sequences = sorted.sequences;
            this.state.sequenceMap = buildSequenceMap(
                sorted.sequences,
                selectedColors,
                this.state.gridData.cols,
                { simColour, rgb_to_key }
            );
        }
        
        // Set status
        if (this.state.gridData.fitsConstraints) {
            toolBase.setValue('gridStatus', 
                `👁️ Preview: ${this.state.gridData.rows}×${this.state.gridData.cols} = ${this.state.sequences.length} tiles ` +
                `(${this.state.gridData.width.toFixed(1)}×${this.state.gridData.height.toFixed(1)}mm) - Click "Generate Grid" to finalize`
            );
        } else {
            const maxW = constraints.maxWidth;
            const maxH = constraints.maxHeight;
            toolBase.setValue('gridStatus',
                `⚠️ Preview: ${this.state.sequences.length} tiles won't fit ` +
                `(${this.state.gridData.width.toFixed(1)}×${this.state.gridData.height.toFixed(1)}mm > ${maxW}×${maxH}mm) - Reduce layers/colors/tilesize`
            );
        }
        
        // Update sequence count
        this.updateSequenceCount(toolBase);
        
        // Draw preview
        toolBase.draw();
    }
    
    /**
     * Update sequence count display
     */
    updateSequenceCount(toolBase) {
        const count = this.state.sequences ? this.state.sequences.length : 0;
        const colors = this.state.selectedFilaments ? this.state.selectedFilaments.length : 0;
        if (count > 0 && colors > 0) {
            toolBase.setValue('sequenceCount', `${count} unique tile sequences (${colors} colors)`);
        } else {
            toolBase.setValue('sequenceCount', '');
        }
    }
    
    /**
     * Generate grid - COMPLETE IMPLEMENTATION (finalizes preview or generates from scratch)
     */
    generateGrid(values, toolBase) {
        const selectedIndices = values.filamentPicker || this.state.selectedFilaments || [];
        
        if (!selectedIndices || selectedIndices.length < 2) {
            toolBase.setValue('gridStatus', '❌ Select at least 2 filaments first');
            return;
        }
        
        if (selectedIndices.length > 10) {
            toolBase.setValue('gridStatus', '❌ Maximum 10 filaments allowed');
            return;
        }
        
        // If we have a preview, finalize it
        if (this.state.gridData && this.state.gridData.isPreview) {
            if (this.state.gridData.fitsConstraints) {
                // Mark as finalized
                this.state.gridData.isPreview = false;
                this.state.splitGridInfo = null;
                this.state.splitGrids = null;
                
                // state IS sharedState - already synced
                
                // Save to localStorage
                localStorage.setItem('lastGridData', JSON.stringify(this.state.gridData));
                
                toolBase.setValue('gridStatus', `✅ Grid finalized: ${this.state.gridData.rows}×${this.state.gridData.cols} = ${this.state.sequences.length} tiles (${this.state.gridData.width.toFixed(1)}×${this.state.gridData.height.toFixed(1)}mm)`);
                toolBase.draw();
                return;
            } else {
                // Oversized
                toolBase.setValue('gridStatus', `❌ Grid won't fit. Reduce layers, colors, or tile size.`);
                return;
            }
        }
        
        // No preview - generate fresh
        try {
            toolBase.setValue('gridStatus', '⏳ Generating grid...');
            this.generateLivePreview(values, toolBase);
            
            if (this.state.gridData && this.state.gridData.fitsConstraints) {
                this.state.gridData.isPreview = false;
                
                // state IS sharedState - already synced
                
                localStorage.setItem('lastGridData', JSON.stringify(this.state.gridData));
                toolBase.setValue('gridStatus', `✅ Grid: ${this.state.gridData.rows}×${this.state.gridData.cols} = ${this.state.sequences.length} tiles`);
            }
        } catch (err) {
            toolBase.setValue('gridStatus', `❌ Generation failed: ${err.message}`);
            console.error('Grid generation error:', err);
        }
    }
    
    /**
     * Generate split grids - COMPLETE IMPLEMENTATION
     */
    generateSplitGrids(values, toolBase) {
        if (!this.state.splitGridInfo) {
            toolBase.setValue('gridStatus', '❌ No split grid info available. Try "Generate Grid" first.');
            return;
        }
        
        const info = this.state.splitGridInfo;
        const grids = [];
        
        try {
            toolBase.setValue('gridStatus', '⏳ Generating split grids...');
            
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
                    toolBase.setValue('gridStatus', `❌ Grid ${i + 1} won't fit (${chunkSequences.length} tiles)`);
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
            
            toolBase.setValue('gridStatus', status);
            toolBase.draw();
            
        } catch (err) {
            toolBase.setValue('gridStatus', `❌ Split grid generation failed: ${err.message}`);
            console.error('Split grid error:', err);
        }
    }
    
    /**
     * Export grid as PNG - COMPLETE IMPLEMENTATION
     */
    exportGridPNG(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.setValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        try {
            const gridsToExport = this.state.splitGrids || [this.state.gridData];
            const currentValues = toolBase.values || {};
            
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
                        currentValues,
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
            toolBase.setValue('exportStatus', `✅ Exported ${count} grid PNG${count > 1 ? 's' : ''}`);
            
        } catch (err) {
            toolBase.setValue('exportStatus', `❌ PNG export failed: ${err.message}`);
            console.error('PNG export error:', err);
        }
    }
    
    /**
     * Export grid as STL - COMPLETE IMPLEMENTATION
     */
    exportGridSTL(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.setValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        try {
            toolBase.setValue('exportStatus', '⏳ Generating STL files...');
            
            const gridsToExport = this.state.splitGrids || [this.state.gridData];
            let totalFiles = 0;
            
            gridsToExport.forEach((grid, gridIndex) => {
                // Get gap fill settings
                const gapFillEnabled = values.gapFillOptions && values.gapFillOptions.includes('Fill Gaps');
                const gapFilamentName = gapFillEnabled ? (values.gapFilament || 'Jade White') : null;
                
                // Export grid STLs using the algorithm (with proper grid spacing)
                const stls = exportArtworkSTLs(
                    this._createGridLayerMaps(grid),
                    grid.colours.map(c => c.n),
                    {
                        imageWidth: grid.cols,
                        imageHeight: grid.rows,
                        printWidth: grid.width,
                        layerHeight: 0.08,
                        // Grid mode: explicit tile/gap/perimeter sizes
                        isGrid: true,
                        tileSize: grid.tileSize,
                        gap: grid.gap,
                        perimeterMargin: grid.perimeterMargin || 0,
                        // Gap fill settings
                        gapFillEnabled: gapFillEnabled,
                        gapFilamentName: gapFilamentName,
                        baseLayers: grid.baseLayers
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
                        toolBase.values || {},
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
            
            toolBase.setValue('exportStatus', `✅ Exported ${totalFiles} STL files`);
            
        } catch (err) {
            toolBase.setValue('exportStatus', `❌ STL export failed: ${err.message}`);
            console.error('STL export error:', err);
        }
    }
    
    /**
     * Export grid as CSV - COMPLETE IMPLEMENTATION
     */
    exportGridCSV(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.setValue('exportStatus', '❌ Generate grid first');
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
            a.download = this._generateGridFilename(grid, toolBase.values || {}, null, null, 'csv');
            a.click();
            URL.revokeObjectURL(url);
            
            toolBase.setValue('exportStatus', `✅ Exported grid CSV`);
            
        } catch (err) {
            toolBase.setValue('exportStatus', `❌ CSV export failed: ${err.message}`);
            console.error('CSV export error:', err);
        }
    }
    
    /**
     * Export complete package as ZIP - COMPLETE IMPLEMENTATION
     */
    async exportCompletePackage(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.setValue('exportProjectZipStatus', '❌ Generate grid first');
            return;
        }
        
        try {
            toolBase.setValue('exportProjectZipStatus', '⏳ Building project ZIP...');
            
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            const grid = this.state.gridData;
            
            // Get current UI values for constraints/settings
            const currentValues = toolBase.values || {};
            
            // Add grid-layout.json (matching algorithm format + ALL settings from ALL tabs)
            const layout = {
                version: '1.2.0',
                generatedAt: new Date().toISOString(),
                layerCount: grid.layerCount,
                baseLayers: grid.baseLayers,
                topLayers: grid.topLayers || 0,
                sortMethod: grid.sortMethod || currentValues.sortMethod || 'Layer Count',
                tileSize: grid.tileSize,
                gap: grid.gap,
                layerHeight: currentValues.layerHeight || 0.08,
                perimeterMargin: grid.perimeterMargin || 0,
                gridSize: {
                    rows: grid.rows,
                    cols: grid.cols
                },
                dimensions: {
                    width: grid.width,
                    height: grid.height,
                    tileSize: grid.tileSize
                },
                constraints: {
                    maxWidth: currentValues.bedWidth || currentValues.maxWidth || 220,
                    maxHeight: currentValues.bedHeight || currentValues.maxHeight || 220,
                    bedWidth: currentValues.bedWidth || 220,
                    bedHeight: currentValues.bedHeight || 220,
                    scanWidth: currentValues.scanWidth || 210,
                    scanHeight: currentValues.scanHeight || 297
                },
                baseFilament: currentValues.baseFilament,
                topFilament: currentValues.topFilament,
                gapFilament: currentValues.gapFilament,
                fillGaps: currentValues.gapFillOptions && currentValues.gapFillOptions.includes('Fill Gaps'),
                // SOURCE tab settings
                canvasView: currentValues.canvasView || 'Combined',
                exportOptions: currentValues.exportOptions || [],
                // SCAN tab settings
                scanSettings: {
                    displayMode: currentValues.scanDisplayMode || 'Fit',
                    deadzonePercent: currentValues.deadzonePercent || 20,
                    gridOffsetX: currentValues.gridOffsetX || 0,
                    gridOffsetY: currentValues.gridOffsetY || 0,
                    gridRotation: currentValues.gridRotation || 0,
                    gridOptions: currentValues.gridOptions || [],
                    resortGrid: currentValues.resortGrid
                },
                // QUANTIZE tab settings
                quantizeSettings: {
                    printWidth: currentValues.printWidth || 170,
                    ditherStrength: currentValues.ditherStrength || 1.0,
                    minDetail: currentValues.minDetail || 0.8
                },
                // EXPORT tab settings
                exportSettings: {
                    layerHeightExport: currentValues.layerHeightExport || 0.08,
                    canvasMode: currentValues.canvasMode || 'Grid'
                },
                palette: grid.colours.map(c => ({
                    name: c.n,
                    hex: c.h
                })),
                tiles: grid.sequences.map((seq, idx) => {
                    const row = Math.floor(idx / grid.cols);
                    const col = idx % grid.cols;
                    const step = grid.tileSize + grid.gap;
                    
                    return {
                        index: idx,
                        row,
                        col,
                        position: {
                            x: col * step,
                            y: row * step,
                            width: grid.tileSize,
                            height: grid.tileSize
                        },
                        sequence: seq,
                        isEmpty: grid.emptyCells && grid.emptyCells.includes(idx)
                    };
                })
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
            a.download = this._generateGridFilename(grid, toolBase.values || {}, null, null, 'zip');
            a.click();
            URL.revokeObjectURL(url);
            
            const hasScans = this.state.scanAnalysis ? ' (with scan data)' : '';
            toolBase.setValue('exportProjectZipStatus', `✅ Exported complete project ZIP${hasScans}`);
            
        } catch (err) {
            toolBase.setValue('exportProjectZipStatus', `❌ ZIP export failed: ${err.message}`);
            console.error('ZIP export error:', err);
        }
    }
    
    // ===== HELPER METHODS =====
    
    /**
     * Generate systematic filename following the naming convention
     * Format: cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm-g{gap}mm-base{B}top{T}-{sort}-YYYYMMDD.{ext}
     */
    _generateGridFilename(gridData, currentValues, gridIndex, totalGrids, extension) {
        const colors = gridData.colours.length;
        const layers = gridData.layerCount;
        const rows = gridData.rows;
        const cols = gridData.cols;
        const tileSize = gridData.tileSize;
        const gap = gridData.gap;
        const baseLayers = gridData.baseLayers || 0;
        const topLayers = gridData.topLayers || 0;
        const sortMethod = (gridData.sortMethod || currentValues.sortMethod || 'LayerCount').toLowerCase().replace(/\s+/g, '');
        
        // Date stamp: YYYYMMDD
        const now = new Date();
        const dateStamp = now.getFullYear().toString() +
                         (now.getMonth() + 1).toString().padStart(2, '0') +
                         now.getDate().toString().padStart(2, '0');
        
        // Build filename parts
        let filename = `cal-${colors}c${layers}L-${rows}x${cols}-${tileSize}mm-g${gap}mm`;
        
        // Add base/top layers if non-zero
        if (baseLayers > 0 || topLayers > 0) {
            filename += `-base${baseLayers}top${topLayers}`;
        }
        
        // Add sort method
        filename += `-${sortMethod}`;
        
        // Add grid index if split
        if (gridIndex !== null && totalGrids !== null && totalGrids > 1) {
            filename += `-g${gridIndex}of${totalGrids}`;
        }
        
        // Add date stamp
        filename += `-${dateStamp}`;
        
        // Add extension
        filename += `.${extension}`;
        
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

