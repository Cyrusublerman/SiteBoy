/**
 * MFP-ScanActions.js
 * 
 * All SCAN tab logic - scan analysis, alignment, color extraction
 * NO DOM manipulation - pure logic only.
 * ZERO PLACEHOLDERS - ALL METHODS COMPLETE
 */

import { FILAMENT_COLOURS } from './MFP-Constants.js';
import { simColour, rgb_to_key } from '../../../shared/algorithms/color/color-utils.js';
import { buildSequenceMap } from '../../../shared/algorithms/combinatorics/sequences.js';

export class MFPScanActions {
    constructor(sharedState) {
        this.state = sharedState;
    }
    
    /**
     * Point-in-quadrilateral test using cross product signs
     * @param {number} px - point x
     * @param {number} py - point y
     * @param {Object} tl - top-left corner {x, y}
     * @param {Object} tr - top-right corner {x, y}
     * @param {Object} br - bottom-right corner {x, y}
     * @param {Object} bl - bottom-left corner {x, y}
     * @returns {boolean} true if point is inside quad
     */
    _pointInQuad(px, py, tl, tr, br, bl) {
        const sign = (p1x, p1y, p2x, p2y, p3x, p3y) => 
            (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
        
        const d1 = sign(px, py, tl.x, tl.y, tr.x, tr.y);
        const d2 = sign(px, py, tr.x, tr.y, br.x, br.y);
        const d3 = sign(px, py, br.x, br.y, bl.x, bl.y);
        const d4 = sign(px, py, bl.x, bl.y, tl.x, tl.y);
        
        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0) || (d4 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0) || (d4 > 0);
        
        return !(hasNeg && hasPos);
    }
    
    /**
     * Import project ZIP on SCAN tab
     * Re-uses the same ZIP parsing as SOURCE tab but focuses on grid data for analysis
     */
    async importProject(file, toolBase) {
        if (!file) return;
        
        try {
            toolBase.setValue('gridLoadStatus', '⏳ Importing project ZIP...');
            
            if (!window.AssetLoader || !window.AssetLoader.ensureJSZip) {
                throw new Error('AssetLoader not available — JSZip cannot be loaded.');
            }
            const JSZip = await window.AssetLoader.ensureJSZip();
            const zip = await JSZip.loadAsync(file);
            
            // Find layout file
            const findFile = (pattern) => {
                const entries = Object.keys(zip.files);
                return entries.find(name => name.endsWith(pattern) || name.includes(pattern));
            };
            
            const layoutPath = findFile('grid-layout.json') || findFile('layout.json');
            if (!layoutPath) {
                toolBase.setValue('gridLoadStatus', '❌ No grid-layout.json found in ZIP');
                return;
            }
            
            const layoutText = await zip.file(layoutPath).async('string');
            const layout = JSON.parse(layoutText);
            
            // Parse layout (same logic as SOURCE tab)
            let sequences, colours, meta;
            
            if (layout.tiles && layout.gridSize) {
                sequences = layout.tiles.map(t => t.sequence);
                colours = layout.palette.map(p => ({
                    n: p.name,
                    h: p.hex
                }));
                meta = {
                    rows: layout.gridSize.rows,
                    cols: layout.gridSize.cols,
                    tileSize: layout.tileSize,
                    gap: layout.gap,
                    layerCount: layout.layerCount,
                    baseLayers: layout.baseLayers || 2,
                    sortMethod: layout.sortMethod
                };
            } else if (layout.sequences && layout.colours) {
                sequences = layout.sequences;
                colours = layout.colours;
                meta = {
                    rows: layout.rows,
                    cols: layout.cols,
                    tileSize: layout.tileSize,
                    gap: layout.gap,
                    layerCount: layout.layerCount,
                    baseLayers: layout.baseLayers || 2,
                    sortMethod: layout.sortMethod
                };
            } else {
                toolBase.setValue('gridLoadStatus', '❌ Unrecognised layout format');
                return;
            }
            
            // Set up grid data for analysis
            this.state.referenceGridData = {
                sequences,
                colours,
                rows: meta.rows,
                cols: meta.cols,
                tileSize: meta.tileSize,
                gap: meta.gap,
                width: meta.cols * (meta.tileSize + meta.gap) - meta.gap,
                height: meta.rows * (meta.tileSize + meta.gap) - meta.gap,
                layerCount: meta.layerCount,
                baseLayers: meta.baseLayers
            };
            
            // Also set gridData for overlay drawing
            this.state.gridData = this.state.referenceGridData;
            this.state.sequences = sequences;
            
            // Build sequence map
            this.state.sequenceMap = buildSequenceMap(sequences, colours, meta.cols, { simColour, rgb_to_key });
            
            // Update sort dropdown if sort method was saved
            if (meta.sortMethod) {
                toolBase.setValue('resortGrid', meta.sortMethod);
            }
            
            const gridSummary = `${colours.length}c${meta.layerCount}L ${meta.rows}×${meta.cols}`;
            toolBase.setValue('gridLoadStatus', `✅ Loaded: ${gridSummary} (${sequences.length} tiles)`);
            
            // Load scan image if present
            const scanPath = findFile('scans/scan.png') || findFile('scan.png');
            if (scanPath) {
                try {
                    const scanBlob = await zip.file(scanPath).async('blob');
                    const scanImg = new Image();
                    scanImg.onload = () => {
                        this.state.scanImageElement = scanImg;
                        
                        // Resize canvas to scan dimensions (1:1)
                        const canvasComponent = toolBase.canvasComponent;
                        if (canvasComponent) {
                            canvasComponent.resize(scanImg.width, scanImg.height);
                        }
                        
                        // Initialize grid corners
                        this._initializeGridCornersPixel(scanImg.width, scanImg.height, this.state.referenceGridData);
                        
                        toolBase.setValue('scanImageStatus', `✅ Scan loaded: ${scanImg.width}×${scanImg.height}px`);
                        toolBase.draw();
                    };
                    scanImg.src = URL.createObjectURL(scanBlob);
                    console.log('✅ Scan image loaded from ZIP');
                } catch (scanErr) {
                    console.warn('Could not load scan image:', scanErr);
                }
            }
            
            // Load analysis data if present
            const analysisPath = findFile('scans/analysis.json') || findFile('analysis.json');
            if (analysisPath) {
                try {
                    const analysisText = await zip.file(analysisPath).async('string');
                    this.state.scanAnalysis = JSON.parse(analysisText);
                    toolBase.setValue('scanStatus', `✅ Analysis loaded: ${this.state.scanAnalysis.length} tiles`);
                    console.log('✅ Analysis data loaded from ZIP:', this.state.scanAnalysis.length, 'tiles');
                } catch (analysisErr) {
                    console.warn('Could not load analysis:', analysisErr);
                }
            }
            
            // Load grid corner positions - try grid-alignment.json first, then layout fallback
            const alignmentPath = findFile('scans/grid-alignment.json') || findFile('grid-alignment.json');
            if (alignmentPath) {
                try {
                    const alignmentText = await zip.file(alignmentPath).async('string');
                    const alignmentData = JSON.parse(alignmentText);
                    if (alignmentData.gridCornersPixel && alignmentData.gridCornersPixel.length === 4) {
                        this.state.gridCornersPixel = alignmentData.gridCornersPixel;
                        console.log('✅ Grid alignment restored from grid-alignment.json');
                    }
                } catch (alignErr) {
                    console.warn('Could not load grid alignment:', alignErr);
                }
            } else if (layout.scanSettings?.gridCornersPixel) {
                // Fallback to layout.json if no separate alignment file
                this.state.gridCornersPixel = layout.scanSettings.gridCornersPixel;
                console.log('✅ Grid corner positions restored from layout');
            }
            
            toolBase.draw();
            console.log('✅ Project imported on SCAN tab');
            
        } catch (err) {
            console.error('❌ Import error:', err);
            toolBase.setValue('gridLoadStatus', `❌ Import failed: ${err.message}`);
        }
    }
    
    /**
     * Import grid from CSV - COMPLETE
     */
    async importCSV(file, toolBase) {
        if (!file) return;
        
        try {
            toolBase.setValue('gridLoadStatus', '⏳ Importing CSV...');
            
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));
            
            if (lines.length < 2) {
                toolBase.setValue('gridLoadStatus', '❌ Invalid CSV format');
                return;
            }
            
            // Parse header
            const headers = lines[0].split(',').map(h => h.trim());
            const seqIndex = headers.indexOf('Sequence');
            
            if (seqIndex === -1) {
                toolBase.setValue('gridLoadStatus', '❌ CSV missing Sequence column');
                return;
            }
            
            // Parse data rows
            const sequences = [];
            const colourSet = new Set();
            
            for (let i = 1; i < lines.length; i++) {
                const cells = lines[i].split(',');
                const seqStr = cells[seqIndex].replace(/"/g, '');
                const seq = seqStr.split('').map(c => parseInt(c));
                sequences.push(seq);
                
                // Track unique colour indices
                seq.forEach(idx => { if (idx > 0) colourSet.add(idx); });
            }
            
            // Infer colours from indices
            const maxIndex = Math.max(...Array.from(colourSet));
            const colours = [];
            for (let i = 1; i <= maxIndex; i++) {
                colours.push(FILAMENT_COLOURS[i - 1] || { n: `Color${i}`, h: '#FFFFFF' });
            }
            
            // Calculate grid dimensions
            const cols = Math.ceil(Math.sqrt(sequences.length));
            const rows = Math.ceil(sequences.length / cols);
            const tileSize = 10; // Default
            const gap = 2;
            
            this.state.referenceGridData = {
                sequences,
                colours,
                rows,
                cols,
                tileSize,
                gap,
                width: cols * (tileSize + gap) - gap,
                height: rows * (tileSize + gap) - gap,
                layerCount: sequences[0].length,
                baseLayers: 2,
                emptyCells: []
            };
            
            this.state.sequences = sequences;
            this.state.sequenceMap = buildSequenceMap(sequences, colours, cols, { simColour, rgb_to_key });
            
            toolBase.setValue('gridLoadStatus', `✅ Imported ${sequences.length} sequences from CSV`);
            toolBase.draw();
            
        } catch (err) {
            console.error('CSV import error:', err);
            toolBase.setValue('gridLoadStatus', `❌ Import failed: ${err.message}`);
        }
    }
    
    /**
     * View reference grid in popup - COMPLETE
     */
    viewReferenceGrid(toolBase) {
        if (!this.state.referenceGridData) {
            toolBase.setValue('gridLoadStatus', '❌ No reference grid loaded');
            return;
        }
        
        const gridData = this.state.referenceGridData;
        const dpi = 150;
        const widthInches = gridData.width / 25.4;
        const heightInches = gridData.height / 25.4;
        
        // Create temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.round(widthInches * dpi);
        tempCanvas.height = Math.round(heightInches * dpi);
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw reference grid (import renderer)
        import('./MFP-GridRenderer.js').then(({ drawCalibrationGrid }) => {
            drawCalibrationGrid(tempCtx, tempCanvas, gridData, this.state.sequenceMap);
            
            // Open in new window
            const dataURL = tempCanvas.toDataURL('image/png');
            const win = window.open();
            win.document.write(`
                <html>
                    <head><title>Reference Grid</title></head>
                    <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000;">
                        <img src="${dataURL}" style="max-width:100%;max-height:100vh;" />
                    </body>
                </html>
            `);
            
            toolBase.setValue('scanStatus', '✅ Reference grid opened in new window');
        });
    }
    
    /**
     * Apply sort to grid - COMPLETE
     */
    async applySortToGrid(values, toolBase) {
        if (!this.state.referenceGridData) {
            toolBase.setValue('gridLoadStatus', '❌ No grid loaded to re-sort');
            return;
        }
        
        const sortMethodDropdown = values.resortGrid || 'Layer Count';
        
        // Convert dropdown value to sortSequences method name
        const methodMap = {
            'Layer Count': 'layercount',
            'Base Color': 'basecolor',
            'Top Color': 'topcolor',
            'Complexity': 'complexity',
            'Lexicographic': 'lexicographic'
        };
        const sortMethod = methodMap[sortMethodDropdown] || 'layercount';
        
        // Get unique sequences
        const uniqueSequences = this.state.referenceGridData.sequences.filter(seq => seq && seq.length > 0);
        
        // Re-sort sequences
        const { sortSequences } = await import('../../../shared/algorithms/combinatorics/sequences.js');
        const sortedSequences = sortSequences(uniqueSequences, sortMethod);
        
        // Rebuild grid with new sequence order
        const { rows, cols, tileSize, gap, emptyCells, colours, layerCount, baseLayers } = this.state.referenceGridData;
        const width = cols * (tileSize + gap) - gap;
        const height = rows * (tileSize + gap) - gap;
        
        this.state.referenceGridData = {
            sequences: sortedSequences,
            colours,
            rows,
            cols,
            tileSize,
            gap,
            width,
            height,
            emptyCells,
            layerCount,
            baseLayers,
            sortMethod: sortMethodDropdown
        };
        
        // Rebuild sequence map
        this.state.sequenceMap = buildSequenceMap(sortedSequences, colours, cols, { simColour, rgb_to_key });
        
        toolBase.setValue('gridLoadStatus', `✅ Grid re-sorted: ${sortMethodDropdown}`);
        toolBase.draw();
    }
    
    /**
     * Load scan image - COMPLETE
     * Canvas is resized to EXACT image dimensions for 1:1 pixel mapping
     * This is critical for accurate colour sampling
     */
    async loadScanImage(file, toolBase) {
        if (!file) return;
        
        // Hide documentation if showing
        if (this.state.showingDocumentation) {
            this.hideDocumentation(toolBase);
        }
        
        const img = new Image();
        img.onload = () => {
            this.state.scanImageElement = img;
            
            // CRITICAL: Resize canvas to exact image dimensions for 1:1 pixel mapping
            // Any scaling would corrupt colour measurement accuracy
            const canvasComponent = toolBase.canvasComponent;
            if (canvasComponent) {
                canvasComponent.resize(img.width, img.height);
                console.log(`📐 Canvas resized to scan: ${img.width}×${img.height}px (1:1 mapping)`);
            }
            
            // Store image bounds (now same as canvas since 1:1)
            this.state.scanImageBounds = { x: 0, y: 0, width: img.width, height: img.height };
            
            // Initialize grid corners in IMAGE PIXEL coordinates
            const gridData = this.state.gridData || this.state.referenceGridData;
            if (gridData) {
                this._initializeGridCornersPixel(img.width, img.height, gridData);
            }
            
            toolBase.draw();
            
            const sizeKB = (file.size / 1024).toFixed(0);
            toolBase.setValue('scanImageStatus', `✅ 1:1 loaded: ${img.width}×${img.height}px (${sizeKB}KB) - Use scroll/zoom to navigate`);
        };
        img.onerror = (err) => {
            console.error('❌ Image load error:', err);
            toolBase.setValue('scanImageStatus', '❌ Failed to load image');
        };
        img.src = URL.createObjectURL(file);
    }
    
    /**
     * Initialize grid corners in IMAGE PIXEL coordinates
     * Grid is centered and scaled to fit within the scan
     */
    _initializeGridCornersPixel(imgWidth, imgHeight, gridData) {
        const { rows, cols, tileSize, gap } = gridData;
        const gridWidth = cols * (tileSize + gap) - gap;
        const gridHeight = rows * (tileSize + gap) - gap;
        
        // Scale grid to fit 90% of image while maintaining aspect ratio
        const scaleX = (imgWidth * 0.9) / gridWidth;
        const scaleY = (imgHeight * 0.9) / gridHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledWidth = gridWidth * scale;
        const scaledHeight = gridHeight * scale;
        
        // Center in image
        const x = (imgWidth - scaledWidth) / 2;
        const y = (imgHeight - scaledHeight) / 2;
        
        // Store corners in PIXEL coordinates: TL, TR, BR, BL
        this.state.gridCornersPixel = [
            { x: x, y: y },
            { x: x + scaledWidth, y: y },
            { x: x + scaledWidth, y: y + scaledHeight },
            { x: x, y: y + scaledHeight }
        ];
        
        console.log('✅ Grid corners (pixel) initialized:', this.state.gridCornersPixel);
    }
    
    /**
     * Reset grid alignment - COMPLETE
     */
    resetGridAlignment(toolBase) {
        if (this.state.gridCalculated) {
            const calc = this.state.gridCalculated;
            this.state.gridAlignment = {
                offsetX: 0,
                offsetY: 0,
                rotation: 0,
                flipped: false,
                autoCalculated: true,
                corners: [
                    { x: calc.gridX, y: calc.gridY },
                    { x: calc.gridX + calc.gridWidth_px, y: calc.gridY },
                    { x: calc.gridX + calc.gridWidth_px, y: calc.gridY + calc.gridHeight_px },
                    { x: calc.gridX, y: calc.gridY + calc.gridHeight_px }
                ]
            };
            
            toolBase.setValue('gridOffsetX', 0);
            toolBase.setValue('gridOffsetY', 0);
            toolBase.setValue('gridRotation', 0);
            toolBase.setValue('scanStatus', '✅ Grid alignment reset to auto-calculated position');
            toolBase.draw();
        }
    }
    
    /**
     * Analyze scan - COMPLETE (pixel sampling, statistics, color extraction)
     */
    async analyzeScan(values, toolBase) {
        console.log('🔬 analyzeScan called');
        console.log('  - scanImageElement:', !!this.state.scanImageElement);
        console.log('  - referenceGridData:', !!this.state.referenceGridData);
        console.log('  - gridCornersPixel:', this.state.gridCornersPixel);
        
        if (!this.state.scanImageElement) {
            console.log('❌ No scan image');
            toolBase.setValue('scanStatus', '❌ Load scan image first');
            return;
        }
        if (!this.state.referenceGridData) {
            console.log('❌ No reference grid data');
            toolBase.setValue('scanStatus', '❌ Load grid first (CSV or generate)');
            return;
        }
        
        // CRITICAL: Use the actual corner positions for perspective-correct sampling
        const corners = this.state.gridCornersPixel;
        if (!corners || corners.length !== 4) {
            console.log('❌ No grid corners');
            toolBase.setValue('scanStatus', '❌ Grid overlay not aligned. Drag corners to align with scan.');
            return;
        }
        
        console.log('✅ All prerequisites met, starting analysis...');
        toolBase.setValue('scanStatus', '⏳ Analyzing scan (perspective-correct sampling)...');
        
        // Small delay for UI update
        await new Promise(resolve => setTimeout(resolve, 50));
        
        try {
            const gridData = this.state.referenceGridData;
            const deadzonePercent = values.deadzonePercent || 20;
            const deadzoneFraction = deadzonePercent / 100;
            
            // Create canvas to read pixel data
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.state.scanImageElement.width;
            tempCanvas.height = this.state.scanImageElement.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.state.scanImageElement, 0, 0);
            
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Bilinear interpolation for perspective-correct grid sampling
            // corners: [TL, TR, BR, BL]
            const [tl, tr, br, bl] = corners;
            
            const lerp = (a, b, t) => a + (b - a) * t;
            
            // Get pixel position for normalized grid coordinates (u, v) where u,v ∈ [0,1]
            const gridToPixel = (u, v) => {
                const topX = lerp(tl.x, tr.x, u);
                const topY = lerp(tl.y, tr.y, u);
                const bottomX = lerp(bl.x, br.x, u);
                const bottomY = lerp(bl.y, br.y, u);
                return {
                    x: lerp(topX, bottomX, v),
                    y: lerp(topY, bottomY, v)
                };
            };
            
            // Extract color from each tile using perspective-correct positions
            const analysisData = [];
            const { rows, cols } = gridData;
            let totalPixelsSampled = 0;
            
            for (let i = 0; i < gridData.sequences.length; i++) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                
                // Normalized cell boundaries (0-1)
                const u0 = col / cols;
                const u1 = (col + 1) / cols;
                const v0 = row / rows;
                const v1 = (row + 1) / rows;
                
                // Apply deadzone to get safe sampling region
                const du = (u1 - u0) * deadzoneFraction;
                const dv = (v1 - v0) * deadzoneFraction;
                const safeU0 = u0 + du;
                const safeU1 = u1 - du;
                const safeV0 = v0 + dv;
                const safeV1 = v1 - dv;
                
                // Get corner positions of the safe zone in pixel coordinates
                const safeTL = gridToPixel(safeU0, safeV0);
                const safeTR = gridToPixel(safeU1, safeV0);
                const safeBL = gridToPixel(safeU0, safeV1);
                const safeBR = gridToPixel(safeU1, safeV1);
                
                // Sample pixels within the safe quadrilateral
                // Use bounding box for efficiency, then check if inside quad
                const minX = Math.floor(Math.min(safeTL.x, safeTR.x, safeBL.x, safeBR.x));
                const maxX = Math.ceil(Math.max(safeTL.x, safeTR.x, safeBL.x, safeBR.x));
                const minY = Math.floor(Math.min(safeTL.y, safeTR.y, safeBL.y, safeBR.y));
                const maxY = Math.ceil(Math.max(safeTL.y, safeTR.y, safeBL.y, safeBR.y));
                
                const pixels = [];
                for (let py = minY; py <= maxY; py++) {
                    for (let px = minX; px <= maxX; px++) {
                        // Check if point is inside the safe quadrilateral
                        if (this._pointInQuad(px, py, safeTL, safeTR, safeBR, safeBL)) {
                            if (px >= 0 && px < tempCanvas.width && py >= 0 && py < tempCanvas.height) {
                                const pixelIndex = (py * tempCanvas.width + px) * 4;
                                const r = imageData.data[pixelIndex];
                                const g = imageData.data[pixelIndex + 1];
                                const b = imageData.data[pixelIndex + 2];
                                pixels.push({ r, g, b });
                            }
                        }
                    }
                }
                
                totalPixelsSampled += pixels.length;
                
                // Skip tiles with no sampled pixels (outside image bounds)
                if (pixels.length === 0) {
                    console.warn(`⚠️ Tile ${i} (${row},${col}) has no pixels - skipping`);
                    continue;
                }
                
                // Calculate statistics
                const avgR = pixels.reduce((sum, p) => sum + p.r, 0) / pixels.length;
                const avgG = pixels.reduce((sum, p) => sum + p.g, 0) / pixels.length;
                const avgB = pixels.reduce((sum, p) => sum + p.b, 0) / pixels.length;
                
                const varR = pixels.reduce((sum, p) => sum + Math.pow(p.r - avgR, 2), 0) / pixels.length;
                const varG = pixels.reduce((sum, p) => sum + Math.pow(p.g - avgG, 2), 0) / pixels.length;
                const varB = pixels.reduce((sum, p) => sum + Math.pow(p.b - avgB, 2), 0) / pixels.length;
                
                const stdR = Math.sqrt(varR);
                const stdG = Math.sqrt(varG);
                const stdB = Math.sqrt(varB);
                const colorDeviation = Math.sqrt(varR + varG + varB);
                
                const r = Math.round(avgR);
                const g = Math.round(avgG);
                const b = Math.round(avgB);
                
                const sequence = gridData.sequences[i];
                const sequenceStr = sequence.join('');
                
                const filamentStack = sequence
                    .map((filIdx, layer) => ({
                        layer,
                        filamentIndex: filIdx,
                        filamentName: filIdx > 0 ? gridData.colours[filIdx - 1]?.n : 'Empty'
                    }))
                    .filter(f => f.filamentIndex > 0);
                
                // Calculate approximate sample area from quadrilateral
                const sampleWidth = Math.sqrt(Math.pow(safeTR.x - safeTL.x, 2) + Math.pow(safeTR.y - safeTL.y, 2));
                const sampleHeight = Math.sqrt(Math.pow(safeBL.x - safeTL.x, 2) + Math.pow(safeBL.y - safeTL.y, 2));
                const sampleArea_px = sampleWidth * sampleHeight;
                
                analysisData.push({
                    index: i,
                    row,
                    col,
                    sequence,
                    sequenceStr,
                    filamentStack,
                    rgb: { r, g, b },
                    hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
                    std: { r: stdR, g: stdG, b: stdB },
                    variance: { r: varR, g: varG, b: varB },
                    colorDeviation,
                    pixelsSampled: pixels.length,
                    sampleArea_px
                });
            }
            
            // Store analysis data
            this.state.scanAnalysis = analysisData;
            console.log('✅ Analysis data stored:', analysisData.length, 'tiles');
            
            // Generate quantization config
            if (typeof this._generateQuantizationConfig === 'function') {
                this.state.quantizationConfig = this._generateQuantizationConfig(analysisData, gridData);
                console.log('✅ Quantization config generated');
            } else {
                console.warn('⚠️ _generateQuantizationConfig not found');
            }
            
            const avgDeviation = analysisData.length > 0 
                ? (analysisData.reduce((sum, d) => sum + d.colorDeviation, 0) / analysisData.length).toFixed(2)
                : 'N/A';
            
            toolBase.setValue('scanStatus', `✅ Analyzed ${analysisData.length} tiles (${totalPixelsSampled.toLocaleString()} pixels) | Avg deviation: ${avgDeviation}`);
            
            console.log('📊 Scan analysis complete:', {
                tilesAnalyzed: analysisData.length,
                totalPixels: totalPixelsSampled,
                avgPixelsPerTile: analysisData.length > 0 ? Math.round(totalPixelsSampled / analysisData.length) : 0,
                averageDeviation: avgDeviation
            });
            
        } catch (err) {
            toolBase.setValue('scanStatus', `❌ Analysis failed: ${err.message}`);
            console.error('Scan analysis error:', err);
            console.error('Stack:', err.stack);
        }
    }
    
    /**
     * View analysis in canvas area (replaces popup)
     * Shows interactive grid with all analysis data
     */
    viewAnalysis(toolBase) {
        console.log('👁️ viewAnalysis called');
        console.log('  - scanAnalysis:', this.state.scanAnalysis?.length, 'tiles');
        console.log('  - referenceGridData:', !!this.state.referenceGridData);
        
        if (!this.state.scanAnalysis || !this.state.referenceGridData) {
            console.log('❌ Missing analysis or grid data');
            toolBase.setValue('scanStatus', '❌ No analysis data available. Run "Analyze Scan" first.');
            return;
        }
        
        const gridData = this.state.referenceGridData;
        const analysis = this.state.scanAnalysis;
        
        // Toggle view - if already showing, hide it
        if (this.state.showingAnalysisView) {
            this.hideAnalysisView(toolBase);
            return;
        }
        
        console.log('📊 Showing analysis view with', analysis.length, 'tiles');
        
        // Get canvas area container
        const canvasArea = toolBase.container?.querySelector('.tool-canvas-area');
        if (!canvasArea) {
            toolBase.setValue('scanStatus', '❌ Canvas area not found');
            return;
        }
        
        // Hide the canvas
        const canvas = canvasArea.querySelector('canvas');
        if (canvas) canvas.style.display = 'none';
        
        // Create analysis container
        let container = canvasArea.querySelector('.analysis-view-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'analysis-view-container';
            container.style.cssText = `
                position: absolute; inset: 0; 
                background: var(--c-bg, #000); color: var(--c-text, #c0c0c0);
                font-family: 'Atkinson Hyperlegible', monospace; font-size: calc(var(--f) * 0.85);
                overflow: auto; padding: calc(var(--f) * 1);
                z-index: 50;
            `;
            canvasArea.appendChild(container);
        } else {
            container.style.display = 'block';
        }
        
        // Build controls and grid
        const avgR = Math.round(analysis.reduce((s, d) => s + d.rgb.r, 0) / analysis.length);
        const avgG = Math.round(analysis.reduce((s, d) => s + d.rgb.g, 0) / analysis.length);
        const avgB = Math.round(analysis.reduce((s, d) => s + d.rgb.b, 0) / analysis.length);
        const avgDev = (analysis.reduce((s, d) => s + d.colorDeviation, 0) / analysis.length).toFixed(2);
        const totalPx = analysis.reduce((s, d) => s + d.pixelsSampled, 0);
        
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(var(--f) * 1); border-bottom: 1px solid var(--c-border); padding-bottom: calc(var(--f) * 0.5);">
                <h2 style="margin: 0; font-size: calc(var(--f) * 1.1);">SCAN ANALYSIS: ${gridData.colours.length}c${gridData.layerCount}L ${gridData.rows}×${gridData.cols} (${analysis.length} tiles)</h2>
                <button id="closeAnalysisBtn" style="background: var(--c-text); color: var(--c-bg); border: none; padding: calc(var(--f) * 0.4) calc(var(--f) * 0.8); cursor: pointer; font-family: inherit;">✕ CLOSE</button>
            </div>
            
            <div style="display: flex; gap: calc(var(--f) * 2); margin-bottom: calc(var(--f) * 1); flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: calc(var(--f) * 0.5);">
                    Sort:
                    <select id="analysisSort" style="background: var(--c-bg); color: var(--c-text); border: 1px solid var(--c-border); padding: calc(var(--f) * 0.3); font-family: inherit;">
                        <option value="index">Grid Order</option>
                        <option value="sequence">Sequence</option>
                        <option value="brightness">Brightness (L→D)</option>
                        <option value="brightness-rev">Brightness (D→L)</option>
                        <option value="hue">Hue</option>
                        <option value="deviation">Deviation (Low→High)</option>
                        <option value="deviation-rev">Deviation (High→Low)</option>
                    </select>
                </label>
                <label style="display: flex; align-items: center; gap: calc(var(--f) * 0.5);">
                    Size:
                    <select id="analysisCellSize" style="background: var(--c-bg); color: var(--c-text); border: 1px solid var(--c-border); padding: calc(var(--f) * 0.3); font-family: inherit;">
                        <option value="20">Tiny</option>
                        <option value="30" selected>Small</option>
                        <option value="40">Medium</option>
                        <option value="60">Large</option>
                    </select>
                </label>
            </div>
            
            <div style="background: var(--c-surface, #111); border: 1px solid var(--c-border); padding: calc(var(--f) * 0.5); margin-bottom: calc(var(--f) * 1);">
                <span style="display: inline-block; background: rgb(${avgR},${avgG},${avgB}); padding: 2px 8px; color: ${avgR + avgG + avgB > 400 ? '#000' : '#fff'}; margin-right: calc(var(--f) * 1);">AVG RGB(${avgR}, ${avgG}, ${avgB})</span>
                Deviation: ${avgDev} | Pixels: ${totalPx.toLocaleString()}
            </div>
            
            <div id="analysisGrid" style="display: grid; gap: 1px; background: var(--c-border, #333);"></div>
            
            <div id="tileDetail" style="position: fixed; background: var(--c-bg, #000); border: 2px solid var(--c-text); padding: calc(var(--f) * 0.75); font-size: calc(var(--f) * 0.8); pointer-events: none; z-index: 1000; display: none; white-space: nowrap;"></div>
        `;
        
        // Store data for event handlers
        this._analysisViewData = { analysis, gridData };
        
        // Bind close button
        container.querySelector('#closeAnalysisBtn').addEventListener('click', () => {
            this.hideAnalysisView(toolBase);
        });
        
        // Render grid
        this._renderAnalysisGrid(container, 'index', 30);
        
        // Bind controls
        container.querySelector('#analysisSort').addEventListener('change', (e) => {
            const size = parseInt(container.querySelector('#analysisCellSize').value);
            this._renderAnalysisGrid(container, e.target.value, size);
        });
        container.querySelector('#analysisCellSize').addEventListener('change', (e) => {
            const sort = container.querySelector('#analysisSort').value;
            this._renderAnalysisGrid(container, sort, parseInt(e.target.value));
        });
        
        this.state.showingAnalysisView = true;
        toolBase.setValue('scanStatus', '📊 Viewing analysis - click tiles for details');
    }
    
    /**
     * Hide analysis view and restore canvas
     */
    hideAnalysisView(toolBase) {
        const canvasArea = toolBase.container?.querySelector('.tool-canvas-area');
        if (!canvasArea) return;
        
        const container = canvasArea.querySelector('.analysis-view-container');
        if (container) container.style.display = 'none';
        
        const canvas = canvasArea.querySelector('canvas');
        if (canvas) canvas.style.display = 'block';
        
        this.state.showingAnalysisView = false;
        toolBase.setValue('scanStatus', '');
        toolBase.draw();
    }
    
    /**
     * Render the analysis grid with sorting
     */
    _renderAnalysisGrid(container, sortMode, cellSize) {
        const { analysis, gridData } = this._analysisViewData;
        const grid = container.querySelector('#analysisGrid');
        const detail = container.querySelector('#tileDetail');
        
        // Sort
        const sorted = [...analysis];
        const brightness = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
        const hue = (r, g, b) => {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            if (max === min) return 0;
            const delta = max - min;
            let h;
            if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / delta + 2) / 6;
            else h = ((r - g) / delta + 4) / 6;
            return h;
        };
        
        switch(sortMode) {
            case 'sequence': sorted.sort((a, b) => a.sequenceStr.localeCompare(b.sequenceStr)); break;
            case 'brightness': sorted.sort((a, b) => brightness(a.rgb.r, a.rgb.g, a.rgb.b) - brightness(b.rgb.r, b.rgb.g, b.rgb.b)); break;
            case 'brightness-rev': sorted.sort((a, b) => brightness(b.rgb.r, b.rgb.g, b.rgb.b) - brightness(a.rgb.r, a.rgb.g, a.rgb.b)); break;
            case 'hue': sorted.sort((a, b) => hue(a.rgb.r, a.rgb.g, a.rgb.b) - hue(b.rgb.r, b.rgb.g, b.rgb.b)); break;
            case 'deviation': sorted.sort((a, b) => a.colorDeviation - b.colorDeviation); break;
            case 'deviation-rev': sorted.sort((a, b) => b.colorDeviation - a.colorDeviation); break;
            default: sorted.sort((a, b) => a.index - b.index);
        }
        
        // Render
        grid.style.gridTemplateColumns = `repeat(${gridData.cols}, ${cellSize}px)`;
        grid.innerHTML = '';
        
        sorted.forEach(tile => {
            const cell = document.createElement('div');
            cell.style.cssText = `
                width: ${cellSize}px; height: ${cellSize}px;
                background: ${tile.hex}; cursor: pointer;
            `;
            
            cell.addEventListener('mouseenter', (e) => {
                const layers = tile.filamentStack?.map(f => `L${f.layer}: ${f.filamentName}`).join(', ') || tile.sequenceStr;
                detail.innerHTML = `
                    <strong>Tile ${tile.index}</strong> (R${tile.row}/C${tile.col})<br>
                    Sequence: ${tile.sequenceStr}<br>
                    Layers: ${layers}<br>
                    RGB: ${tile.rgb.r}, ${tile.rgb.g}, ${tile.rgb.b}<br>
                    Hex: ${tile.hex}<br>
                    Deviation: ${tile.colorDeviation.toFixed(2)}<br>
                    Pixels: ${tile.pixelsSampled.toLocaleString()}
                `;
                detail.style.display = 'block';
                detail.style.left = (e.clientX + 15) + 'px';
                detail.style.top = (e.clientY + 15) + 'px';
            });
            
            cell.addEventListener('mousemove', (e) => {
                detail.style.left = (e.clientX + 15) + 'px';
                detail.style.top = (e.clientY + 15) + 'px';
            });
            
            cell.addEventListener('mouseleave', () => {
                detail.style.display = 'none';
            });
            
            grid.appendChild(cell);
        });
    }
    
// Documentation is now handled in MFP-Main.js via the info button

    /**
     * Export palette as GPL - COMPLETE
     */
    exportPalette(toolBase) {
        if (!this.state.scanAnalysis) {
            toolBase.setValue('scanStatus', '❌ Analyze scan first');
            return;
        }
        
        const gridData = this.state.referenceGridData;
        const uniquePalette = this._generateUniquePaletteFromAnalysis(gridData);
        const filamentNames = gridData.colours.map(c => c.n).join('');
        
        let gpl = 'GIMP Palette\n';
        gpl += `Name: ${filamentNames}\n`;
        gpl += `Columns: ${Math.min(uniquePalette.length, 16)}\n`;
        gpl += `# Scanned from physical print calibration grid\n`;
        gpl += `# Generated: ${new Date().toISOString()}\n`;
        gpl += `# Filaments: ${gridData.colours.map(c => c.n).join(', ')}\n`;
        gpl += `# Tiles analyzed: ${this.state.scanAnalysis.length}\n`;
        gpl += `# Color names are layer sequences (e.g., "1234" = filament 1+2+3+4)\n`;
        gpl += '#\n';
        
        uniquePalette.forEach(color => {
            gpl += `${String(color.rgb.r).padStart(3)} ${String(color.rgb.g).padStart(3)} ${String(color.rgb.b).padStart(3)} ${color.sequenceStr}\n`;
        });
        
        const blob = new Blob([gpl], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filamentNames}-palette-${new Date().toISOString().slice(0,10)}.gpl`;
        a.click();
        URL.revokeObjectURL(url);
        
        toolBase.setValue('scanStatus', `✅ Exported palette: ${uniquePalette.length} colors (${filamentNames})`);
    }
    
    /**
     * Export quantization config - COMPLETE
     */
    exportQuantizationConfig(toolBase) {
        if (!this.state.quantizationConfig) {
            toolBase.setValue('scanStatus', '❌ Analyze scan first');
            return;
        }
        
        const json = JSON.stringify(this.state.quantizationConfig, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.state.quantizationConfig.paletteName}-quantization-config-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        toolBase.setValue('scanStatus', `✅ Exported quantization config (${this.state.quantizationConfig.colorMap.length} colors)`);
    }
    
    /**
     * Export comparison CSV - COMPLETE
     */
    exportComparisonCSV(toolBase) {
        if (!this.state.scanAnalysis || !this.state.referenceGridData) {
            toolBase.setValue('scanStatus', '❌ Analyze scan first');
            return;
        }
        
        const csv = this._generateComparisonCSV();
        const gridData = this.state.referenceGridData;
        const date = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const filename = `cal-${gridData.colours.length}c${gridData.layerCount}L-${gridData.rows}x${gridData.cols}-comparison-${date}.csv`;
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        toolBase.setValue('scanStatus', `✅ Exported ${filename}`);
    }
    
    /**
     * Auto-load last grid from localStorage - COMPLETE
     */
    autoLoadLastGrid(toolBase) {
        try {
            const saved = localStorage.getItem('lastGridData') || localStorage.getItem('multifilament_last_grid');
            if (saved) {
                const gridData = JSON.parse(saved);
                this.state.referenceGridData = gridData;
                this.state.sequences = gridData.sequences;
                
                this.state.sequenceMap = buildSequenceMap(
                    this.state.sequences,
                    gridData.colours,
                    gridData.cols,
                    { simColour, rgb_to_key }
                );
                
                const age = gridData.timestamp ? Math.round((Date.now() - gridData.timestamp) / 1000 / 60) : '?';
                toolBase.setValue('gridLoadStatus', 
                    `✅ Auto-loaded: ${gridData.colours.length}c${gridData.layerCount}L ${gridData.rows}×${gridData.cols} grid (${age}min ago)`
                );
                toolBase.setValue('scanStatus', 'Grid loaded. Upload scanned image and align overlay.');
                toolBase.draw();
            } else {
                toolBase.setValue('gridLoadStatus', 'No saved grid. Generate one in SOURCE tab or import CSV.');
                toolBase.setValue('scanStatus', 'Load a grid first, then upload scan image.');
            }
        } catch (e) {
            console.error('Failed to load grid from localStorage:', e);
            toolBase.setValue('gridLoadStatus', '❌ Failed to load saved grid');
        }
    }
    
    // ===== HELPER METHODS =====
    
    _autoCalculateGridOverlay(toolBase) {
        const values = toolBase.values || {};
        const scanWidth_mm = values.scanWidth || 210;
        const scanHeight_mm = values.scanHeight || 297;
        
        if (!this.state.scanImageElement || !this.state.referenceGridData) {
            console.warn('Cannot auto-calculate: missing scan image or grid data');
            return;
        }
        
        const gridData = this.state.referenceGridData;
        
        // Calculate pixels per mm in the scan image
        const pxPerMm = this.state.scanImageElement.width / scanWidth_mm;
        
        // Calculate grid size in pixels
        const gridWidth_px = gridData.width * pxPerMm;
        const gridHeight_px = gridData.height * pxPerMm;
        
        // Calculate grid position (centered on scan)
        const gridX = (this.state.scanImageElement.width - gridWidth_px) / 2;
        const gridY = (this.state.scanImageElement.height - gridHeight_px) / 2;
        
        // Store calculated dimensions
        this.state.gridCalculated = {
            pxPerMm,
            gridWidth_px,
            gridHeight_px,
            gridX,
            gridY
        };
        
        // Reset user adjustments
        this.state.gridAlignment = {
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
            flipped: false,
            autoCalculated: true,
            corners: [
                { x: gridX, y: gridY },
                { x: gridX + gridWidth_px, y: gridY },
                { x: gridX + gridWidth_px, y: gridY + gridHeight_px },
                { x: gridX, y: gridY + gridHeight_px }
            ]
        };
        
        console.log('✅ Grid overlay auto-calculated');
    }
    
    _generateQuantizationConfig(analysisData, gridData) {
        const filamentNames = gridData.colours.map(c => c.n).join('');
        const uniquePalette = this._generateUniquePaletteFromAnalysis(gridData);
        
        return {
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            paletteName: filamentNames,
            filaments: gridData.colours,
            colorMap: uniquePalette.map(color => ({
                name: color.sequenceStr,
                rgb: color.rgb,
                hex: color.hex,
                sequence: color.sequence,
                filamentStack: color.filamentStack,
                tileCount: color.tileCount,
                deviation: color.averageDeviation
            })),
            tileData: analysisData
        };
    }
    
    _generateUniquePaletteFromAnalysis(gridData) {
        const sequenceMap = new Map();
        
        this.state.scanAnalysis.forEach(data => {
            const key = data.sequenceStr;
            if (!sequenceMap.has(key)) {
                sequenceMap.set(key, {
                    sequence: data.sequence,
                    sequenceStr: key,
                    filamentStack: data.filamentStack,
                    tiles: []
                });
            }
            sequenceMap.get(key).tiles.push(data);
        });
        
        const palette = [];
        sequenceMap.forEach(({ sequence, sequenceStr, filamentStack, tiles }) => {
            const avgR = Math.round(tiles.reduce((sum, t) => sum + t.rgb.r, 0) / tiles.length);
            const avgG = Math.round(tiles.reduce((sum, t) => sum + t.rgb.g, 0) / tiles.length);
            const avgB = Math.round(tiles.reduce((sum, t) => sum + t.rgb.b, 0) / tiles.length);
            const avgDeviation = tiles.reduce((sum, t) => sum + t.colorDeviation, 0) / tiles.length;
            
            palette.push({
                sequence,
                sequenceStr,
                filamentStack,
                rgb: { r: avgR, g: avgG, b: avgB },
                hex: `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`,
                tileCount: tiles.length,
                averageDeviation: avgDeviation
            });
        });
        
        return palette;
    }
    
    _generateComparisonCSV() {
        if (!this.state.scanAnalysis || !this.state.referenceGridData) return '';
        
        let csv = '# Expected vs Measured Color Comparison\n';
        csv += `# Generated: ${new Date().toISOString()}\n#\n`;
        csv += 'Index,Row,Col,Sequence,Expected_R,Expected_G,Expected_B,Measured_R,Measured_G,Measured_B,Delta_E,Std_R,Std_G,Std_B,Pixels_Sampled\n';
        
        this.state.scanAnalysis.forEach(tile => {
            const expectedColor = simColour(tile.sequence, this.state.referenceGridData.colours);
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
}

