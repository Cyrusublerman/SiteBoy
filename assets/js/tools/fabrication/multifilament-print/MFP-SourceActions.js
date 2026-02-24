/**
 * MFP-SourceActions.js
 * 
 * All SOURCE tab logic - grid generation, export, etc.
 * NO DOM manipulation - pure logic only.
 */

import { FILAMENT_COLOURS, DEFAULTS } from './MFP-Constants.js';
import { calculateGridLayout, calculateConstraints } from '../../../shared/algorithms/layout/grid-layout.js';
import { buildSequenceMap, generateSequences, sortSequences } from '../../../shared/algorithms/combinatorics/sequences.js';
import { simColour, rgb_to_key, rgb2hex } from '../../../shared/algorithms/color/color-utils.js';
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
            if (!window.AssetLoader || !window.AssetLoader.ensureJSZip) {
                throw new Error('AssetLoader not available — JSZip cannot be loaded.');
            }
            const JSZip = await window.AssetLoader.ensureJSZip();
            const zip = new JSZip();
            const zipData = await zip.loadAsync(file);
            
            // Debug: List all files in ZIP
            const allFiles = Object.keys(zipData.files);
            console.log('📂 ZIP contents:');
            allFiles.forEach(path => {
                console.log(`  - ${path}`);
            });
            console.log('✅ ZIP loaded, files:', allFiles.length);
            
            // Helper to find file in nested structure (handles subdirectories)
            const findFile = (...patterns) => {
                for (const pattern of patterns) {
                    // Try exact match first
                    let file = zipData.file(pattern);
                    if (file) return file;
                    
                    // Try pattern match in nested folders
                    const match = allFiles.find(path => 
                        path.endsWith('/' + pattern) || 
                        path.endsWith('\\' + pattern) ||
                        path === pattern
                    );
                    if (match) {
                        return zipData.file(match);
                    }
                }
                return null;
            };
            
            // Try to load grid-layout.json (v1.2 format)
            let layout = null;
            const layoutFile = findFile('grid-layout.json', 'data/grid-layout.json', 'layout.json');
            if (layoutFile) {
                console.log(`📋 Layout file found: ${layoutFile.name}`);
                const layoutText = await layoutFile.async('text');
                layout = JSON.parse(layoutText);
                console.log('✅ Loaded grid-layout.json');
            }
            
            // Fallback: try grid-config.json
            if (!layout) {
                const configFile = findFile('grid-config.json', 'data/grid-config.json', 'config.json');
                if (configFile) {
                    console.log(`📋 Config file found: ${configFile.name}`);
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
            
            // Fallback: try CSV reconstruction
            if (!layout) {
                const csvFile = findFile('sequences.csv', 'data/sequences.csv', 'grid.csv', 'data/grid.csv');
                if (csvFile) {
                    console.log(`📋 CSV file found: ${csvFile.name}, reconstructing layout...`);
                    const csvText = await csvFile.async('text');
                    layout = this._reconstructLayoutFromCSV(csvText, file.name);
                    console.log('✅ Reconstructed layout from CSV');
                }
            }
            
            if (!layout) {
                toolBase.setValue('projectStatus', '❌ No grid-layout.json, grid-config.json, or CSV found in project');
                console.error('❌ Could not find any layout file. ZIP contents:', allFiles);
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
            
            // ALSO set referenceGridData so SCAN tab analysis works
            this.state.referenceGridData = this.state.gridData;
            
            this.state.sequences = sequences;
            
            // Rebuild sequence map
            this.state.sequenceMap = buildSequenceMap(sequences, colours, meta.cols, { simColour, rgb_to_key });
            
            // Update filament picker
            const filamentIndices = colours.map(c => {
                const index = FILAMENT_COLOURS.findIndex(fc => fc.n === c.n);
                return index !== -1 ? index : 0;
            });
            
            // CRITICAL: Update sharedState.selectedFilaments so live preview works after import
            this.state.selectedFilaments = filamentIndices;
            
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
            
            // SCAN tab settings (ALL controls)
            if (meta.scanSettings) {
                const scan = meta.scanSettings;
                if (scan.displayMode) toolBase.setValue('scanDisplayMode', scan.displayMode);
                if (scan.deadzonePercent !== undefined) toolBase.setValue('deadzonePercent', scan.deadzonePercent);
                if (scan.gridOffsetX !== undefined) toolBase.setValue('gridOffsetX', scan.gridOffsetX);
                if (scan.gridOffsetY !== undefined) toolBase.setValue('gridOffsetY', scan.gridOffsetY);
                if (scan.gridRotation !== undefined) toolBase.setValue('gridRotation', scan.gridRotation);
                if (scan.gridOptions) toolBase.setValue('gridOptions', scan.gridOptions);
                if (scan.expectedOpacity !== undefined) toolBase.setValue('expectedOpacity', scan.expectedOpacity);
                if (scan.resortGrid) toolBase.setValue('resortGrid', scan.resortGrid);
            }
            
            // QUANTIZE tab settings (ALL controls)
            if (meta.quantizeSettings) {
                const quant = meta.quantizeSettings;
                if (quant.printWidth !== undefined) toolBase.setValue('printWidth', quant.printWidth);
                if (quant.ditherAlgorithm) toolBase.setValue('ditherAlgorithm', quant.ditherAlgorithm);
                if (quant.ditherStrength !== undefined) toolBase.setValue('ditherStrength', quant.ditherStrength);
                if (quant.minDetail !== undefined) toolBase.setValue('minDetail', quant.minDetail);
                // Optimisation controls
                if (quant.analysisMode) toolBase.setValue('analysisMode', quant.analysisMode);
                if (quant.colourVariance !== undefined) toolBase.setValue('colourVariance', quant.colourVariance);
                if (quant.layerPreference) toolBase.setValue('layerPreference', quant.layerPreference);
                if (quant.groupingWeight !== undefined) toolBase.setValue('groupingWeight', quant.groupingWeight);
                // Simplification controls
                if (quant.minimumClusterPx !== undefined)      toolBase.setValue('minimumClusterPx', quant.minimumClusterPx);
                if (quant.smoothingMethod)                     toolBase.setValue('smoothingMethod', quant.smoothingMethod);
                if (quant.paletteMergeThreshold !== undefined) toolBase.setValue('paletteMergeThreshold', quant.paletteMergeThreshold);
                if (quant.perimAreaRatio !== undefined)        toolBase.setValue('perimAreaRatio', quant.perimAreaRatio);
                if (quant.perimAreaMaxPx !== undefined)        toolBase.setValue('perimAreaMaxPx', quant.perimAreaMaxPx);
                
                // Restore image adjustment values
                if (quant.imageAdjustments) {
                    const adj = quant.imageAdjustments;
                    const bundle = toolBase.components?.get('imageAdjust');
                    if (bundle && typeof bundle.setValues === 'function') {
                        bundle.setValues(adj);
                        console.log('✅ Image adjustment values restored');
                    } else if (bundle && bundle.values) {
                        // Fallback: set values directly
                        Object.assign(bundle.values, adj);
                        console.log('✅ Image adjustment values restored (direct)');
                    }
                }
            }
            
            // OUTPUTS tab settings (ALL controls)
            if (meta.outputsSettings) {
                const out = meta.outputsSettings;
                if (out.stlPrintWidth !== undefined) toolBase.setValue('stlPrintWidth', out.stlPrintWidth);
                if (out.stlLayerHeight !== undefined) toolBase.setValue('stlLayerHeight', out.stlLayerHeight);
                if (out.outputsCanvasView) toolBase.setValue('outputsCanvasView', out.outputsCanvasView);
            }
            
            toolBase.setValue('projectStatus', `✅ Loaded ${meta.rows}×${meta.cols} grid (${sequences.length} tiles) - All settings restored`);
            
            // Update file input to show imported filename
            toolBase.setValue('importProject_filename', file.name);
            toolBase.setValue('importProjectScan_filename', file.name);
            
            // Set re-sort grid dropdown to match imported sort method
            if (meta.sortMethod) {
                toolBase.setValue('resortGrid', meta.sortMethod);
            }
            
            // Update status labels on OTHER tabs to reflect imported project
            const gridSummary = `${colours.length}c${meta.layerCount}L ${meta.rows}×${meta.cols}`;
            
            // SCAN tab
            toolBase.setValue('gridLoadStatus', `✅ Project loaded: ${gridSummary} grid (${sequences.length} tiles)`);
            
            // NOTE: paletteStatus will be updated after palette is loaded/generated (below)
            
            // EXPORT tab
            toolBase.setValue('exportProjectStatus', `✅ Project loaded: ${gridSummary} grid ready for export`);
            
            console.log('✅ All UI controls updated from imported project (ALL tabs)');
            
            // Save to localStorage
            localStorage.setItem('lastGridData', JSON.stringify(this.state.gridData));
            
            // Load ALL scan-related data (image, alignment, analysis)
            let scanDataLoaded = false;
            
            // 1. Load scan image
            const scanImageFile = findFile('scans/scan.png', 'scan.png');
            if (scanImageFile) {
                try {
                    const scanBlob = await scanImageFile.async('blob');
                    const scanImg = new Image();
                    const loadPromise = new Promise((resolve, reject) => {
                        scanImg.onload = () => resolve(scanImg);
                        scanImg.onerror = reject;
                    });
                    scanImg.src = URL.createObjectURL(scanBlob);
                    
                    const loadedImg = await loadPromise;
                    this.state.scanImageElement = loadedImg;
                    scanDataLoaded = true;
                    console.log(`✅ Scan image loaded: ${loadedImg.width}×${loadedImg.height}px`);
                    
                    // Resize canvas if on SCAN tab
                    const canvasComponent = toolBase.canvasComponent;
                    if (canvasComponent) {
                        canvasComponent.resize(loadedImg.width, loadedImg.height);
                    }
                    
                    toolBase.setValue('scanImageStatus', `✅ Scan loaded: ${loadedImg.width}×${loadedImg.height}px`);
                } catch (imgErr) {
                    console.warn('⚠️ Could not load scan image:', imgErr);
                }
            }
            
            // 2. Load grid alignment (corners)
            const alignmentFile = findFile('scans/grid-alignment.json', 'grid-alignment.json');
            if (alignmentFile) {
                try {
                    const alignmentText = await alignmentFile.async('text');
                    const alignmentData = JSON.parse(alignmentText);
                    if (alignmentData.gridCornersPixel && alignmentData.gridCornersPixel.length === 4) {
                        this.state.gridCornersPixel = alignmentData.gridCornersPixel;
                        scanDataLoaded = true;
                        console.log('✅ Grid alignment loaded from grid-alignment.json');
                    }
                } catch (alignErr) {
                    console.warn('⚠️ Could not load grid alignment:', alignErr);
                }
            } else if (meta.scanSettings?.gridCornersPixel) {
                // Fallback to layout.json
                this.state.gridCornersPixel = meta.scanSettings.gridCornersPixel;
                scanDataLoaded = true;
                console.log('✅ Grid alignment restored from layout.json');
            }
            
            // 3. Load analysis data
            const analysisFile = findFile('scans/analysis.json', 'analysis.json');
            if (analysisFile) {
                try {
                    const analysisText = await analysisFile.async('text');
                    const analysisData = JSON.parse(analysisText);
                    this.state.scanAnalysis = Array.isArray(analysisData) ? analysisData : (analysisData.tiles || []);
                    scanDataLoaded = true;
                    console.log(`✅ Loaded scan analysis: ${this.state.scanAnalysis.length} tiles`);
                    toolBase.setValue('exportScanStatus', `✅ Scan analysis loaded: ${this.state.scanAnalysis.length} tiles analysed`);
                    toolBase.setValue('scanStatus', `✅ Analysis loaded: ${this.state.scanAnalysis.length} tiles (from project)`);
                } catch (analysisErr) {
                    console.warn('⚠️ Could not load scan analysis:', analysisErr);
                }
            }
            
            // 4. Load quantization config OR calibration palette
            let paletteLoaded = false;
            const quantConfigFile = findFile('scans/quantization-config.json', 'quantization-config.json');
            const calibPaletteFile = findFile('scans/calibration-palette.json', 'calibration-palette.json');
            
            console.log('📦 Palette file search:', {
                quantConfigFile: !!quantConfigFile,
                calibPaletteFile: !!calibPaletteFile,
                hasGridData: !!this.state.gridData
            });
            
            if (quantConfigFile) {
                try {
                    const quantText = await quantConfigFile.async('text');
                    this.state.quantizationConfig = JSON.parse(quantText);
                    paletteLoaded = true;
                    console.log('✅ Loaded quantization config');
                } catch (quantErr) {
                    console.warn('⚠️ Could not load quantization config:', quantErr);
                }
            } else if (calibPaletteFile) {
                // Load calibration-palette.json and convert to quantization config format
                try {
                    const paletteText = await calibPaletteFile.async('text');
                    const paletteData = JSON.parse(paletteText);
                    
                    // Convert to quantization config format
                    const colors = paletteData.colors || [];
                    this.state.quantizationConfig = {
                        version: paletteData.version || '1.0.0',
                        type: paletteData.type || 'imported',
                        generatedAt: paletteData.generatedAt || new Date().toISOString(),
                        paletteName: paletteData.filaments?.map(f => f.name).join('') || 'Imported',
                        filaments: paletteData.filaments || this.state.gridData.colours || [],
                        layerCount: paletteData.layerCount || colors[0]?.sequence?.length || 4,
                        baseLayers: paletteData.baseLayers || 0,
                        topLayers: paletteData.topLayers || 0,
                        colorMap: colors.map(c => ({
                            name: c.sequenceStr || c.sequence?.join(''),
                            rgb: Array.isArray(c.rgb) ? { r: c.rgb[0], g: c.rgb[1], b: c.rgb[2] } : c.rgb,
                            hex: c.hex,
                            sequence: c.sequence,
                            filamentStack: null,
                            tileCount: 1,
                            deviation: c.deviation || null
                        })),
                        tileData: null
                    };
                    paletteLoaded = true;
                    console.log(`✅ Loaded calibration palette: ${colors.length} colours`);
                } catch (paletteErr) {
                    console.warn('⚠️ Could not load calibration palette:', paletteErr);
                }
            }
            
            // If no palette was loaded, generate predicted one from grid data
            if (!paletteLoaded && this.state.gridData) {
                this._generatePredictedQuantizationConfig(this.state.gridData);
                paletteLoaded = true;
                console.log('✅ Generated predicted quantization config from grid data');
            }
            
            // Update QUANTIZE tab status
            console.log('📊 Palette status update:', {
                paletteLoaded,
                hasQuantConfig: !!this.state.quantizationConfig,
                colorCount: this.state.quantizationConfig?.colorMap?.length
            });
            
            if (this.state.quantizationConfig) {
                const colorCount = this.state.quantizationConfig.colorMap?.length || 0;
                const type = this.state.quantizationConfig.type || 'loaded';
                toolBase.setValue('paletteStatus', `✅ Palette ready: ${colorCount} colours (${type})`);
                console.log(`✅ Set paletteStatus: Palette ready: ${colorCount} colours (${type})`);
            } else {
                console.warn('⚠️ No quantizationConfig after import!');
            }
            
            // Update status based on what was loaded
            if (scanDataLoaded) {
                const parts = [];
                if (this.state.scanImageElement) parts.push('image');
                if (this.state.gridCornersPixel) parts.push('alignment');
                if (this.state.scanAnalysis) parts.push('analysis');
                toolBase.setValue('exportScanStatus', `✅ Scan data loaded: ${parts.join(', ')}`);
            } else {
                toolBase.setValue('exportScanStatus', 'ℹ️ No scan data in project (optional)');
            }

            // Load quantize tab assets: source image, quantized image, sequence map
            const _loadImage = (blob) => {
                const img = new Image();
                return new Promise((res, rej) => {
                    img.onload = () => res(img);
                    img.onerror = rej;
                    img.src = URL.createObjectURL(blob);
                });
            };

            const sourceImgFile = findFile('quantize/source-image.png', 'source-image.png');
            if (sourceImgFile) {
                try {
                    const blob = await sourceImgFile.async('blob');
                    this.state.sourceImageElement = await _loadImage(blob);
                    console.log(`✅ Source image restored: ${this.state.sourceImageElement.width}×${this.state.sourceImageElement.height}px`);
                } catch (err) {
                    console.warn('⚠️ Could not restore source image:', err);
                }
            }

            const quantImgFile = findFile('quantize/quantized-image.png', 'quantized-image.png');
            if (quantImgFile) {
                try {
                    const blob = await quantImgFile.async('blob');
                    this.state.quantizedImageElement = await _loadImage(blob);
                    toolBase.setValue('quantizeStatus', `✅ Quantised image restored from project (${this.state.quantizedImageElement.width}×${this.state.quantizedImageElement.height}px)`);
                    console.log(`✅ Quantized image restored: ${this.state.quantizedImageElement.width}×${this.state.quantizedImageElement.height}px`);
                } catch (err) {
                    console.warn('⚠️ Could not restore quantized image:', err);
                }
            }

            const seqMapFile = findFile('quantize/quantized-sequence-map.json', 'quantized-sequence-map.json');
            if (seqMapFile) {
                try {
                    const data = JSON.parse(await seqMapFile.async('text'));
                    this.state.quantizedSequenceMap = {
                        width: data.width,
                        height: data.height,
                        map: new Uint16Array(data.map),
                        palette: data.palette
                    };
                    console.log(`✅ Quantized sequence map restored: ${data.width}×${data.height}px, ${data.palette?.length || 0} palette entries`);
                } catch (err) {
                    console.warn('⚠️ Could not restore quantized sequence map:', err);
                }
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
            // Convert dropdown value to sortSequences method name
            const methodMap = {
                'Layer Count': 'layercount',
                'Base Color': 'basecolor',
                'Top Color': 'topcolor',
                'Complexity': 'complexity',
                'Lexicographic': 'lexicographic'
            };
            const sortMethod = methodMap[values.sortMethod] || 'layercount';
            
            // sortSequences returns sorted array directly
            const sortedSequences = sortSequences(this.state.sequences, sortMethod);
            this.state.sequences = sortedSequences;
            this.state.gridData.sequences = sortedSequences;
            this.state.sequenceMap = buildSequenceMap(
                sortedSequences,
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
                
                const gridData = this.state.gridData;
                const gridSummary = `${gridData.colours.length}c${gridData.layerCount}L ${gridData.rows}×${gridData.cols}`;
                
                toolBase.setValue('gridStatus', `✅ Grid finalized: ${gridData.rows}×${gridData.cols} = ${this.state.sequences.length} tiles (${gridData.width.toFixed(1)}×${gridData.height.toFixed(1)}mm)`);
                
                // Generate PREDICTED palette for QUANTIZE tab (before scan calibration)
                this._generatePredictedQuantizationConfig(gridData);
                
                // Update other tabs
                toolBase.setValue('gridLoadStatus', `✅ Grid generated: ${gridSummary} (${this.state.sequences.length} tiles)`);
                toolBase.setValue('paletteStatus', `✅ Predicted palette ready: ${this.state.quantizationConfig?.colorMap?.length || 0} colours`);
                toolBase.setValue('exportProjectStatus', `✅ Grid ready: ${gridSummary} for export`);
                toolBase.setValue('exportScanStatus', 'ℹ️ No scan data yet (optional - use SCAN tab)');
                
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
                
                const gridData = this.state.gridData;
                const gridSummary = `${gridData.colours.length}c${gridData.layerCount}L ${gridData.rows}×${gridData.cols}`;
                
                toolBase.setValue('gridStatus', `✅ Grid: ${gridData.rows}×${gridData.cols} = ${this.state.sequences.length} tiles`);
                
                // Generate PREDICTED palette for QUANTIZE tab (before scan calibration)
                this._generatePredictedQuantizationConfig(gridData);
                
                // Update other tabs
                toolBase.setValue('gridLoadStatus', `✅ Grid generated: ${gridSummary} (${this.state.sequences.length} tiles)`);
                toolBase.setValue('paletteStatus', `✅ Predicted palette ready: ${this.state.quantizationConfig?.colorMap?.length || 0} colours`);
                toolBase.setValue('exportProjectStatus', `✅ Grid ready: ${gridSummary} for export`);
                toolBase.setValue('exportScanStatus', 'ℹ️ No scan data yet (optional - use SCAN tab)');
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
                
                // Get base/top filament settings
                const baseFilamentName = values.baseFilament || grid.colours[0]?.n;
                const topFilamentName = values.topFilament || grid.colours[0]?.n;
                
                // Create layer maps with base/top layers included
                const layerMaps = this._createGridLayerMaps(grid, {
                    baseFilamentName,
                    topFilamentName
                });
                
                // Calculate total layers for STL generation
                const sequenceLayers = grid.sequences[0]?.length || 1;
                const totalLayers = (grid.baseLayers || 0) + sequenceLayers + (grid.topLayers || 0);
                
                // Export grid STLs using the algorithm (with proper grid spacing)
                const stls = exportArtworkSTLs(
                    layerMaps,
                    grid.colours.map(c => c.n),
                    {
                        imageWidth: grid.cols,
                        imageHeight: grid.rows,
                        printWidth: grid.width,
                        layerHeight: values.layerHeight || 0.08,
                        // Grid mode: explicit tile/gap/perimeter sizes
                        isGrid: true,
                        tileSize: grid.tileSize,
                        gap: grid.gap,
                        perimeterMargin: grid.perimeterMargin || 0,
                        // Gap fill settings
                        gapFillEnabled: gapFillEnabled,
                        gapFilamentName: gapFilamentName,
                        baseLayers: grid.baseLayers || 0,
                        totalLayers: totalLayers
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
            toolBase.setValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        try {
            toolBase.setValue('exportStatus', '⏳ Building project ZIP...');
            
            if (!window.AssetLoader || !window.AssetLoader.ensureJSZip) {
                throw new Error('AssetLoader not available — JSZip cannot be loaded.');
            }
            const JSZip = await window.AssetLoader.ensureJSZip();
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
                // SCAN tab settings (ALL controls)
                scanSettings: {
                    displayMode: currentValues.scanDisplayMode || 'Fit',
                    deadzonePercent: currentValues.deadzonePercent ?? 20,
                    gridOffsetX: currentValues.gridOffsetX ?? 0,
                    gridOffsetY: currentValues.gridOffsetY ?? 0,
                    gridRotation: currentValues.gridRotation ?? 0,
                    gridOptions: currentValues.gridOptions || ['Show Sample Zones'],
                    expectedOpacity: currentValues.expectedOpacity ?? 50,
                    resortGrid: currentValues.resortGrid || 'Layer Count',
                    // Grid corner positions for perspective-correct alignment
                    gridCornersPixel: this.state.gridCornersPixel || null
                },
                // QUANTIZE tab settings (ALL controls)
                quantizeSettings: {
                    printWidth: currentValues.printWidth ?? 170,
                    ditherAlgorithm: currentValues.ditherAlgorithm || 'Floyd-Steinberg',
                    ditherStrength: currentValues.ditherStrength ?? 1.0,
                    minDetail: currentValues.minDetail ?? 0.8,
                    // Optimisation controls
                    analysisMode: currentValues.analysisMode || 'Fast',
                    colourVariance: currentValues.colourVariance ?? 0,
                    layerPreference: currentValues.layerPreference || 'None',
                    groupingWeight: currentValues.groupingWeight ?? 0.3,
                    // Simplification controls
                    minimumClusterPx: currentValues.minimumClusterPx ?? 0,
                    smoothingMethod: currentValues.smoothingMethod || 'None',
                    paletteMergeThreshold: currentValues.paletteMergeThreshold ?? 0,
                    perimAreaRatio: currentValues.perimAreaRatio ?? 0,
                    perimAreaMaxPx: currentValues.perimAreaMaxPx ?? 50,
                    // Image adjustment bundle values
                    imageAdjustments: this._getImageAdjustmentValues(toolBase)
                },
                // OUTPUTS tab settings (ALL controls)
                outputsSettings: {
                    stlPrintWidth: currentValues.stlPrintWidth ?? 170,
                    stlLayerHeight: currentValues.stlLayerHeight ?? 0.08,
                    outputsCanvasView: currentValues.outputsCanvasView || 'Quantised Image'
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
            
            // Check export options
            const exportOptions = currentValues.exportOptions || ['STL Combined', 'STL Per Layer', 'Layer Visuals'];
            
            // Add STL files if requested
            if (exportOptions.includes('STL Combined') || exportOptions.includes('STL Per Layer')) {
                const stlFolder = zip.folder('stl');
                
                try {
                    // Get gap fill settings
                    const gapFillEnabled = currentValues.gapFillOptions && currentValues.gapFillOptions.includes('Fill Gaps');
                    const gapFilamentName = gapFillEnabled ? (currentValues.gapFilament || 'Jade White') : null;
                    
                    // Get base/top filament settings
                    const baseFilamentName = currentValues.baseFilament || grid.colours[0]?.n;
                    const topFilamentName = currentValues.topFilament || grid.colours[0]?.n;
                    
                    // Create layer maps with base/top layers included
                    const layerMaps = this._createGridLayerMaps(grid, {
                        baseFilamentName,
                        topFilamentName
                    });
                    
                    // Calculate total layers
                    const sequenceLayers = grid.sequences[0]?.length || 1;
                    const totalLayers = (grid.baseLayers || 0) + sequenceLayers + (grid.topLayers || 0);
                    
                    // Generate STLs
                    const stls = exportArtworkSTLs(
                        layerMaps,
                        grid.colours.map(c => c.n),
                        {
                            imageWidth: grid.cols,
                            imageHeight: grid.rows,
                            printWidth: grid.width,
                            layerHeight: currentValues.layerHeight || 0.08,
                            isGrid: true,
                            tileSize: grid.tileSize,
                            gap: grid.gap,
                            perimeterMargin: grid.perimeterMargin || 0,
                            gapFillEnabled: gapFillEnabled,
                            gapFilamentName: gapFilamentName,
                            baseLayers: grid.baseLayers || 0,
                            totalLayers: totalLayers
                        }
                    );
                    
                    // Add each STL to the folder
                    Object.entries(stls).forEach(([filename, content]) => {
                        stlFolder.file(filename, content);
                    });
                    
                    console.log(`✅ Added ${Object.keys(stls).length} STL files to ZIP`);
                } catch (stlErr) {
                    console.error('STL generation error:', stlErr);
                    // Continue with other exports even if STL fails
                }
            }
            
            // Add grid PNG if Layer Visuals requested
            if (exportOptions.includes('Layer Visuals')) {
                const imagesFolder = zip.folder('images');
                
                try {
                    // Generate high-res grid PNG
                    const dpi = 300;
                    const widthInches = grid.width / 25.4;
                    const heightInches = grid.height / 25.4;
                    
                    const exportCanvas = document.createElement('canvas');
                    exportCanvas.width = Math.round(widthInches * dpi);
                    exportCanvas.height = Math.round(heightInches * dpi);
                    const exportCtx = exportCanvas.getContext('2d');
                    
                    // Draw grid at high resolution
                    await this._drawGridToCanvas(exportCtx, exportCanvas, grid, currentValues);
                    
                    // Convert to blob and add to ZIP
                    const pngBlob = await new Promise(resolve => exportCanvas.toBlob(resolve, 'image/png'));
                    imagesFolder.file('grid-combined.png', pngBlob);
                    
                    // Generate per-layer images if requested
                    const layerCount = grid.layerCount || grid.sequences[0]?.length || 4;
                    for (let layer = 0; layer < layerCount; layer++) {
                        const layerCanvas = document.createElement('canvas');
                        layerCanvas.width = exportCanvas.width;
                        layerCanvas.height = exportCanvas.height;
                        const layerCtx = layerCanvas.getContext('2d');
                        
                        await this._drawGridToCanvas(layerCtx, layerCanvas, grid, { ...currentValues, canvasView: `Layer ${layer}` });
                        
                        const layerBlob = await new Promise(resolve => layerCanvas.toBlob(resolve, 'image/png'));
                        imagesFolder.file(`grid-layer-${layer}.png`, layerBlob);
                    }
                    
                    console.log('✅ Added grid images to ZIP');
                } catch (imgErr) {
                    console.error('Image generation error:', imgErr);
                    // Continue with other exports even if image fails
                }
            }
            
            // ALWAYS save scan data if ANY scan-related state exists
            // (not just when analysis is complete)
            const hasScanImage = !!this.state.scanImageElement;
            const hasGridCorners = this.state.gridCornersPixel && this.state.gridCornersPixel.length === 4;
            const hasAnalysis = !!this.state.scanAnalysis;
            const hasQuantConfig = !!this.state.quantizationConfig;
            
            if (hasScanImage || hasGridCorners || hasAnalysis) {
                const scanFolder = zip.folder('scans');
                
                // ALWAYS save scan image if it exists
                if (hasScanImage) {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = this.state.scanImageElement.width;
                        canvas.height = this.state.scanImageElement.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(this.state.scanImageElement, 0, 0);
                        const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                        scanFolder.file('scan.png', imageBlob);
                        console.log('✅ Saved scan.png to ZIP');
                    } catch (imgErr) {
                        console.error('❌ Failed to save scan image:', imgErr);
                    }
                }
                
                // Save grid alignment data separately (for import without re-aligning)
                if (hasGridCorners) {
                    const alignmentData = {
                        gridCornersPixel: this.state.gridCornersPixel,
                        imageWidth: this.state.scanImageElement?.width || null,
                        imageHeight: this.state.scanImageElement?.height || null,
                        savedAt: new Date().toISOString()
                    };
                    scanFolder.file('grid-alignment.json', JSON.stringify(alignmentData, null, 2));
                    console.log('✅ Saved grid-alignment.json to ZIP');
                }
                
                // Save analysis data if exists
                if (hasAnalysis) {
                    scanFolder.file('analysis.json', JSON.stringify(this.state.scanAnalysis, null, 2));
                    console.log('✅ Saved analysis.json to ZIP');
                }
                
                // Save quantization config if exists
                if (hasQuantConfig) {
                    scanFolder.file('quantization-config.json', JSON.stringify(this.state.quantizationConfig, null, 2));
                    console.log('✅ Saved quantization-config.json to ZIP');
                }
                
                // Generate and save EXPECTED colours grid PNG (predicted from filament stacking)
                try {
                    const expectedPng = await this._generateColourGridPNG(grid, 'expected');
                    if (expectedPng) {
                        scanFolder.file('expected-colours-grid.png', expectedPng);
                        console.log('✅ Saved expected-colours-grid.png to ZIP');
                    }
                } catch (expErr) {
                    console.warn('⚠️ Could not generate expected colours grid:', expErr);
                }
                
                // Generate and save ANALYSED colours grid PNG (from scan)
                if (hasAnalysis) {
                    try {
                        const analysedPng = await this._generateColourGridPNG(grid, 'analysed', this.state.scanAnalysis);
                        if (analysedPng) {
                            scanFolder.file('analysed-colours-grid.png', analysedPng);
                            console.log('✅ Saved analysed-colours-grid.png to ZIP');
                        }
                    } catch (anaErr) {
                        console.warn('⚠️ Could not generate analysed colours grid:', anaErr);
                    }
                }
                
                // Generate and save CALIBRATION PALETTE JSON (RGB → sequence mapping)
                const paletteJson = this._generateCalibrationPaletteJSON(grid, hasAnalysis ? this.state.scanAnalysis : null);
                scanFolder.file('calibration-palette.json', JSON.stringify(paletteJson, null, 2));
                console.log('✅ Saved calibration-palette.json to ZIP');
                
                // Save calibrated palette GPL if we have analysis
                if (hasAnalysis) {
                    const gpl = this._generateCalibratedPaletteGPL(grid);
                    scanFolder.file('calibrated-palette.gpl', gpl);
                    
                    // Save comparison CSV
                    const comparisonCSV = this._generateComparisonCSV(grid);
                    scanFolder.file('comparison.csv', comparisonCSV);
                }
            }
            
            // Save quantized image + source image + sequence map if available
            if (this.state.quantizedImageElement) {
                try {
                    const qCanvas = document.createElement('canvas');
                    qCanvas.width  = this.state.quantizedImageElement.naturalWidth || this.state.quantizedImageElement.width;
                    qCanvas.height = this.state.quantizedImageElement.naturalHeight || this.state.quantizedImageElement.height;
                    const qCtx = qCanvas.getContext('2d');
                    qCtx.drawImage(this.state.quantizedImageElement, 0, 0);
                    const qBlob = await new Promise(resolve => qCanvas.toBlob(resolve, 'image/png'));
                    const quantizeFolder = zip.folder('quantize');
                    quantizeFolder.file('quantized-image.png', qBlob);
                    if (this.state.sourceImageElement) {
                        const sCanvas = document.createElement('canvas');
                        sCanvas.width  = this.state.sourceImageElement.naturalWidth || this.state.sourceImageElement.width;
                        sCanvas.height = this.state.sourceImageElement.naturalHeight || this.state.sourceImageElement.height;
                        sCanvas.getContext('2d').drawImage(this.state.sourceImageElement, 0, 0);
                        const sBlob = await new Promise(resolve => sCanvas.toBlob(resolve, 'image/png'));
                        quantizeFolder.file('source-image.png', sBlob);
                    }
                    // Save quantized sequence map (Uint16Array serialised as plain array)
                    if (this.state.quantizedSequenceMap) {
                        const { width, height, map, palette } = this.state.quantizedSequenceMap;
                        quantizeFolder.file('quantized-sequence-map.json', JSON.stringify({
                            width, height, map: Array.from(map), palette
                        }));
                        console.log('✅ Saved quantized-sequence-map.json to ZIP');
                    }
                    console.log('✅ Saved quantized images to ZIP');
                } catch (qErr) {
                    console.warn('⚠️ Could not save quantized image:', qErr);
                }
            }

            // Save artwork STLs if generated
            if (this.state.exportSTLData && this.state.exportSTLData.stls) {
                try {
                    const artworkFolder = zip.folder('artwork-stl');
                    Object.entries(this.state.exportSTLData.stls).forEach(([filename, content]) => {
                        artworkFolder.file(filename, content);
                    });
                    console.log(`✅ Saved ${Object.keys(this.state.exportSTLData.stls).length} artwork STL files to ZIP`);
                } catch (astlErr) {
                    console.warn('⚠️ Could not save artwork STLs:', astlErr);
                }
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
            toolBase.setValue('exportStatus', `✅ Exported complete project ZIP${hasScans}`);
            
        } catch (err) {
            toolBase.setValue('exportStatus', `❌ ZIP export failed: ${err.message}`);
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
    
    /**
     * Draw grid to canvas for export (synchronous version)
     */
    async _drawGridToCanvas(ctx, canvas, grid, values) {
        const { sequences, colours, rows, cols, tileSize, gap, width, height, emptyCells, perimeterMargin = 0 } = grid;
        
        // Get view mode
        const viewMode = values.canvasView || 'Combined';
        const gapFillEnabled = values.gapFillOptions && values.gapFillOptions.includes('Fill Gaps');
        
        // Calculate scale to fill canvas
        const scaleX = canvas.width / width;
        const scaleY = canvas.height / height;
        const scale = Math.min(scaleX, scaleY);
        
        // Clear with black
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.scale(scale, scale);
        
        // Draw perimeter margin
        if (perimeterMargin > 0 && gapFillEnabled) {
            const gapFilamentName = values.gapFilament || 'Jade White';
            const gapFilamentColor = colours.find(c => c.n === gapFilamentName);
            const gapHex = gapFilamentColor ? gapFilamentColor.h : '#FFFFFF';
            
            ctx.fillStyle = gapHex;
            ctx.fillRect(0, 0, width, perimeterMargin);
            ctx.fillRect(0, height - perimeterMargin, width, perimeterMargin);
            ctx.fillRect(0, perimeterMargin, perimeterMargin, height - (perimeterMargin * 2));
            ctx.fillRect(width - perimeterMargin, perimeterMargin, perimeterMargin, height - (perimeterMargin * 2));
        }
        
        ctx.translate(perimeterMargin, perimeterMargin);
        
        const innerWidth = width - (perimeterMargin * 2);
        const innerHeight = height - (perimeterMargin * 2);
        
        // Draw gap fill background
        if (gap > 0 && gapFillEnabled) {
            const gapFilamentName = values.gapFilament || 'Jade White';
            const gapFilamentColor = colours.find(c => c.n === gapFilamentName);
            const gapHex = gapFilamentColor ? gapFilamentColor.h : '#FFFFFF';
            
            ctx.fillStyle = gapHex;
            ctx.fillRect(0, 0, innerWidth, innerHeight);
        }
        
        // Draw each tile
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                const x = col * (tileSize + gap);
                const y = row * (tileSize + gap);
                
                if (emptyCells && emptyCells.includes(index)) {
                    if (!gapFillEnabled) {
                        ctx.fillStyle = '#404040';
                        ctx.fillRect(x, y, tileSize, tileSize);
                    }
                    continue;
                }
                
                if (index >= sequences.length) continue;
                
                const sequence = sequences[index];
                let hexColor;
                
                if (viewMode === 'Combined' || viewMode === 'combined') {
                    const color = simColour(sequence, colours);
                    hexColor = rgb2hex(color);
                } else if (viewMode.startsWith('Layer ')) {
                    const layerMatch = viewMode.match(/(\d+)/);
                    if (layerMatch) {
                        const layerIndex = parseInt(layerMatch[1]);
                        const filamentIndex = sequence[layerIndex];
                        
                        if (filamentIndex === 0 || filamentIndex === undefined) {
                            hexColor = '#303030';
                        } else {
                            hexColor = colours[filamentIndex - 1].h;
                        }
                    } else {
                        hexColor = '#404040';
                    }
                } else {
                    const color = simColour(sequence, colours);
                    hexColor = rgb2hex(color);
                }
                
                ctx.fillStyle = hexColor;
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
        
        ctx.restore();
    }
    
    /**
     * Create layer maps for STL generation
     * 
     * Handles base layers, sequence layers, and top layers:
     * - Base layers: All tiles filled with base filament
     * - Sequence layers: Each tile gets its sequence colours
     * - Top layers: All tiles filled with top filament
     * 
     * @param {Object} grid - Grid data
     * @param {Object} options - Options for base/top layers
     * @returns {Array<Array<Set<string>>>} [layer][filament] = Set("x,y")
     */
    _createGridLayerMaps(grid, options = {}) {
        const { sequences, rows, cols, colours, baseLayers = 0, topLayers = 0 } = grid;
        const { baseFilamentName, topFilamentName } = options;
        
        const sequenceLayers = sequences[0]?.length || 1;
        const totalLayers = baseLayers + sequenceLayers + topLayers;
        
        // Find filament indices for base/top
        const baseFilamentIdx = baseFilamentName 
            ? colours.findIndex(c => c.n === baseFilamentName)
            : 0;
        const topFilamentIdx = topFilamentName 
            ? colours.findIndex(c => c.n === topFilamentName)
            : 0;
        
        // Create empty layer maps
        const layerMaps = Array.from({ length: totalLayers }, () => 
            Array.from({ length: colours.length }, () => new Set())
        );
        
        // Get all non-empty tile positions
        const allTilePositions = [];
        sequences.forEach((seq, idx) => {
            if (grid.emptyCells && grid.emptyCells.includes(idx)) return;
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            allTilePositions.push({ row, col, coord: `${col},${row}` });
        });
        
        // Fill base layers (all tiles with base filament)
        for (let li = 0; li < baseLayers; li++) {
            if (baseFilamentIdx >= 0) {
                allTilePositions.forEach(({ coord }) => {
                    layerMaps[li][baseFilamentIdx].add(coord);
                });
            }
        }
        
        // Fill sequence layers
        sequences.forEach((seq, idx) => {
            if (grid.emptyCells && grid.emptyCells.includes(idx)) return;
            
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const coord = `${col},${row}`;
            
            seq.forEach((filamentIdx, seqLayerIdx) => {
                if (filamentIdx > 0) {
                    const actualLayer = baseLayers + seqLayerIdx;
                    layerMaps[actualLayer][filamentIdx - 1].add(coord);
                }
            });
        });
        
        // Fill top layers (all tiles with top filament)
        for (let li = 0; li < topLayers; li++) {
            const actualLayer = baseLayers + sequenceLayers + li;
            if (topFilamentIdx >= 0) {
                allTilePositions.forEach(({ coord }) => {
                    layerMaps[actualLayer][topFilamentIdx].add(coord);
                });
            }
        }
        
        console.log(`📐 Created layer maps: ${baseLayers} base + ${sequenceLayers} sequence + ${topLayers} top = ${totalLayers} total`);
        
        return layerMaps;
    }
    
    /**
     * Get current image adjustment values from the bundle
     */
    _getImageAdjustmentValues(toolBase) {
        try {
            const adjustBundle = toolBase?.components?.get('imageAdjust');
            if (!adjustBundle) return null;
            
            // Get values from the adjustment bundle
            return {
                brightness: adjustBundle.values?.brightness ?? 0,
                contrast: adjustBundle.values?.contrast ?? 0,
                saturation: adjustBundle.values?.saturation ?? 0,
                exposure: adjustBundle.values?.exposure ?? 0,
                highlights: adjustBundle.values?.highlights ?? 0,
                shadows: adjustBundle.values?.shadows ?? 0,
                temperature: adjustBundle.values?.temperature ?? 0,
                tint: adjustBundle.values?.tint ?? 0,
                vibrance: adjustBundle.values?.vibrance ?? 0,
                gamma: adjustBundle.values?.gamma ?? 1.0
            };
        } catch (err) {
            console.warn('Could not get image adjustment values:', err);
            return null;
        }
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
    
    /**
     * Generate PREDICTED quantization config from grid data (no scan needed)
     * Uses simulated/expected colours based on filament stacking
     * This allows the QUANTIZE tab to work immediately after grid generation
     */
    _generatePredictedQuantizationConfig(gridData) {
        const { sequences, colours, layerCount, baseLayers, topLayers } = gridData;
        
        // Simple colour blending (average of non-empty layers)
        const simColour = (sequence, colours) => {
            const nonEmpty = sequence.filter(idx => idx > 0);
            if (nonEmpty.length === 0) return { r: 255, g: 255, b: 255 };
            
            let sumR = 0, sumG = 0, sumB = 0;
            nonEmpty.forEach(idx => {
                const c = colours[idx - 1];
                if (c) {
                    const hex = c.h.replace('#', '');
                    sumR += parseInt(hex.substr(0, 2), 16);
                    sumG += parseInt(hex.substr(2, 2), 16);
                    sumB += parseInt(hex.substr(4, 2), 16);
                }
            });
            return {
                r: Math.round(sumR / nonEmpty.length),
                g: Math.round(sumG / nonEmpty.length),
                b: Math.round(sumB / nonEmpty.length)
            };
        };
        
        // Build unique colour palette from sequences
        const sequenceMap = new Map();
        
        sequences.forEach((seq, idx) => {
            const key = seq.join('');
            if (!sequenceMap.has(key)) {
                const rgb = simColour(seq, colours);
                const hex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
                
                sequenceMap.set(key, {
                    sequence: seq,
                    sequenceStr: key,
                    rgb,
                    hex,
                    filamentStack: seq.map((fIdx, layerIdx) => ({
                        layer: layerIdx,
                        filamentIndex: fIdx,
                        filamentName: fIdx > 0 ? colours[fIdx - 1]?.n : 'Empty'
                    })),
                    tileCount: 0
                });
            }
            sequenceMap.get(key).tileCount++;
        });
        
        const colorMap = Array.from(sequenceMap.values()).map(entry => ({
            name: entry.sequenceStr,
            rgb: entry.rgb,
            hex: entry.hex,
            sequence: entry.sequence,
            filamentStack: entry.filamentStack,
            tileCount: entry.tileCount,
            deviation: null  // No deviation for predicted colours
        }));
        
        const filamentNames = colours.map(c => c.n).join('');
        
        this.state.quantizationConfig = {
            version: '1.0.0',
            type: 'predicted',  // Not from scan
            generatedAt: new Date().toISOString(),
            paletteName: filamentNames,
            filaments: colours,
            layerCount: layerCount || sequences[0]?.length || 4,
            baseLayers: baseLayers || 0,
            topLayers: topLayers || 0,
            colorMap,
            tileData: null  // No tile data until scan
        };
        
        console.log(`✅ Predicted quantization config generated: ${colorMap.length} unique colours`);
    }
    
    /**
     * Generate a colour grid PNG showing expected or analysed colours
     * @param {Object} grid - Grid data
     * @param {string} type - 'expected' or 'analysed'
     * @param {Array} analysisData - Analysis data (required for 'analysed' type)
     * @returns {Promise<Blob>} PNG blob
     */
    async _generateColourGridPNG(grid, type, analysisData = null) {
        const { rows, cols, sequences, colours } = grid;
        
        // Calculate cell size for readable output (min 20px per cell)
        const cellSize = Math.max(20, Math.min(60, Math.floor(2000 / Math.max(rows, cols))));
        const width = cols * cellSize;
        const height = rows * cellSize;
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        // Import simColour for expected colours
        const { simColour } = await import('../../../shared/algorithms/color/color-utils.js');
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const idx = row * cols + col;
                const x = col * cellSize;
                const y = row * cellSize;
                
                let colour = null;
                
                if (type === 'analysed' && analysisData) {
                    // Use analysed colour from scan
                    const tile = analysisData.find(d => d.index === idx);
                    if (tile) {
                        colour = tile.rgb;
                    }
                } else if (type === 'expected' && sequences && sequences[idx]) {
                    // Use simulated colour from filament stack
                    colour = simColour(sequences[idx], colours);
                }
                
                if (colour && (colour.r !== undefined || colour.r !== 255 || colour.g !== 255 || colour.b !== 255)) {
                    ctx.fillStyle = `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
        
        // Add grid lines
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        for (let i = 0; i <= cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, height);
            ctx.stroke();
        }
        for (let i = 0; i <= rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(width, i * cellSize);
            ctx.stroke();
        }
        
        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    }
    
    /**
     * Generate calibration palette JSON with RGB → sequence mapping
     * This is the key file for quantization - maps colours to filament stacks
     * @param {Object} grid - Grid data
     * @param {Array} analysisData - Optional analysis data for scanned colours
     * @returns {Object} Palette JSON
     */
    _generateCalibrationPaletteJSON(grid, analysisData = null) {
        const { sequences, colours, layerCount, baseLayers, topLayers } = grid;
        
        // Import simColour synchronously isn't possible, so we'll compute inline
        const simColour = (sequence, colours) => {
            const nonEmpty = sequence.filter(idx => idx > 0);
            if (nonEmpty.length === 0) return { r: 255, g: 255, b: 255 };
            
            let sumR = 0, sumG = 0, sumB = 0;
            nonEmpty.forEach(idx => {
                const c = colours[idx - 1];
                if (c) {
                    const hex = c.h.replace('#', '');
                    sumR += parseInt(hex.substr(0, 2), 16);
                    sumG += parseInt(hex.substr(2, 2), 16);
                    sumB += parseInt(hex.substr(4, 2), 16);
                }
            });
            return {
                r: Math.round(sumR / nonEmpty.length),
                g: Math.round(sumG / nonEmpty.length),
                b: Math.round(sumB / nonEmpty.length)
            };
        };
        
        // Build filaments array
        const filaments = colours.map((c, i) => ({
            index: i + 1,
            name: c.n,
            hex: c.h
        }));
        
        // Build colours array with RGB → sequence mapping
        const colorsArray = [];
        const seenHex = new Set();
        
        sequences.forEach((seq, idx) => {
            // Get colour - prefer analysed, fall back to expected
            let rgb, hex, deviation = null;
            
            if (analysisData) {
                const tile = analysisData.find(d => d.index === idx);
                if (tile) {
                    rgb = [tile.rgb.r, tile.rgb.g, tile.rgb.b];
                    hex = tile.hex;
                    deviation = tile.colorDeviation;
                }
            }
            
            if (!rgb) {
                // Use expected/simulated colour
                const expected = simColour(seq, colours);
                rgb = [expected.r, expected.g, expected.b];
                hex = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
            }
            
            // Only add unique colours
            if (!seenHex.has(hex)) {
                seenHex.add(hex);
                colorsArray.push({
                    hex,
                    rgb,
                    sequence: seq,
                    sequenceStr: seq.join(''),
                    ...(deviation !== null && { deviation })
                });
            }
        });
        
        return {
            version: '1.0',
            type: analysisData ? 'calibration-palette' : 'predicted-palette',
            generatedAt: new Date().toISOString(),
            filaments,
            layerCount: layerCount || sequences[0]?.length || 4,
            baseLayers: baseLayers || 0,
            topLayers: topLayers || 0,
            colorCount: colorsArray.length,
            colors: colorsArray
        };
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
    
    /**
     * Reconstruct layout from CSV file (legacy format support)
     * 
     * CSV format:
     * Index,Row,Col,Sequence,R,G,B,Hex
     * 0,0,0,"1234",128,128,128,#808080
     */
    _reconstructLayoutFromCSV(csvText, filename) {
        const lines = csvText.split('\n').filter(line => 
            line.trim() && !line.startsWith('#')
        );
        
        if (lines.length < 2) {
            console.error('CSV has no data rows');
            return null;
        }
        
        // Skip header
        const dataLines = lines.slice(1);
        
        // Parse sequences
        const tiles = [];
        let maxRow = 0;
        let maxCol = 0;
        
        for (const line of dataLines) {
            // Parse CSV - handle quoted sequences
            const match = line.match(/^(\d+),(\d+),(\d+),"([^"]+)"(?:,.*)?$/);
            if (!match) continue;
            
            const [, indexStr, rowStr, colStr, seqStr] = match;
            const index = parseInt(indexStr);
            const row = parseInt(rowStr);
            const col = parseInt(colStr);
            const sequence = seqStr.split('').map(c => parseInt(c));
            
            tiles.push({ index, row, col, sequence });
            maxRow = Math.max(maxRow, row);
            maxCol = Math.max(maxCol, col);
        }
        
        if (tiles.length === 0) {
            console.error('No valid tiles parsed from CSV');
            return null;
        }
        
        // Sort by index
        tiles.sort((a, b) => a.index - b.index);
        
        // Try to infer palette from filename
        const filenameData = this._parseFilename(filename);
        let palette = null;
        
        if (filenameData && filenameData.colorCount) {
            palette = this._inferPaletteFromSequences(tiles, filenameData);
        }
        
        // Default palette if not inferred
        if (!palette) {
            const colorCount = Math.max(...tiles.flatMap(t => t.sequence));
            palette = [];
            for (let i = 0; i < colorCount; i++) {
                palette.push({
                    name: `Color ${i + 1}`,
                    hex: FILAMENT_COLOURS[i % FILAMENT_COLOURS.length].h
                });
            }
        }
        
        const layerCount = tiles[0]?.sequence.length || 4;
        
        return {
            palette,
            gridSize: {
                rows: maxRow + 1,
                cols: maxCol + 1
            },
            layerCount,
            tiles: tiles.map(t => ({
                index: t.index,
                row: t.row,
                col: t.col,
                sequence: t.sequence
            }))
        };
    }
    
    /**
     * Parse filename for metadata
     * Format: cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm-...
     */
    _parseFilename(filename) {
        // Match pattern like "cal-4c4L-8x8-5mm-..."
        const match = filename.match(/cal-(\d+)c(\d+)L-(\d+)x(\d+)-(\d+(?:\.\d+)?)mm/);
        if (!match) return null;
        
        return {
            colorCount: parseInt(match[1]),
            layerCount: parseInt(match[2]),
            rows: parseInt(match[3]),
            cols: parseInt(match[4]),
            tileSize: parseFloat(match[5])
        };
    }
    
    /**
     * Infer palette from sequences and filename data
     */
    _inferPaletteFromSequences(tiles, filenameData) {
        const colorCount = filenameData?.colorCount || 
            Math.max(...tiles.flatMap(t => t.sequence));
        
        const palette = [];
        for (let i = 0; i < colorCount; i++) {
            palette.push({
                name: FILAMENT_COLOURS[i % FILAMENT_COLOURS.length].n,
                hex: FILAMENT_COLOURS[i % FILAMENT_COLOURS.length].h
            });
        }
        
        return palette;
    }
}

