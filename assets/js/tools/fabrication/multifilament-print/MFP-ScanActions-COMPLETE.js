/**
 * MFP-ScanActions.js
 * 
 * All SCAN tab logic - scan analysis, alignment, color extraction
 * NO DOM manipulation - pure logic only.
 * ZERO PLACEHOLDERS - ALL METHODS COMPLETE
 */

import { FILAMENT_COLOURS } from './MFP-Constants.js';
import { simColour, rgb_to_key, buildSequenceMap } from '../../../shared/algorithms/index.js';

export class MFPScanActions {
    constructor(sharedState) {
        this.state = sharedState;
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
        
        const sortMethod = values.resortGrid || 'Layer Count';
        
        // Get unique sequences
        const uniqueSequences = this.state.referenceGridData.sequences.filter(seq => seq && seq.length > 0);
        
        // Re-sort sequences
        const { sortSequences } = await import('../../../shared/algorithms/index.js');
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
            sortMethod
        };
        
        // Rebuild sequence map
        this.state.sequenceMap = buildSequenceMap(sortedSequences, colours, cols, { simColour, rgb_to_key });
        
        toolBase.setValue('gridLoadStatus', `✅ Grid re-sorted: ${sortMethod}`);
        toolBase.draw();
    }
    
    /**
     * Load scan image - COMPLETE
     */
    async loadScanImage(file, toolBase) {
        if (!file) return;
        
        const img = new Image();
        img.onload = () => {
            this.state.scanImageElement = img;
            
            // Calculate grid positioning if grid exists
            if (this.state.referenceGridData) {
                this._autoCalculateGridOverlay(toolBase);
            }
            
            toolBase.draw();
            
            const sizeKB = (file.size / 1024).toFixed(0);
            toolBase.setValue('scanImageStatus', `✅ Loaded ${img.width}×${img.height}px (${sizeKB}KB)`);
        };
        img.onerror = (err) => {
            console.error('❌ Image load error:', err);
            toolBase.setValue('scanImageStatus', '❌ Failed to load image');
        };
        img.src = URL.createObjectURL(file);
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
        if (!this.state.scanImageElement) {
            toolBase.setValue('scanStatus', '❌ Load scan image first');
            return;
        }
        if (!this.state.referenceGridData) {
            toolBase.setValue('scanStatus', '❌ Load grid first (CSV or generate)');
            return;
        }
        if (!this.state.gridCalculated) {
            toolBase.setValue('scanStatus', '❌ Grid overlay not calculated. Upload scan image to trigger auto-calculation.');
            return;
        }
        
        toolBase.setValue('scanStatus', '⏳ Analyzing scan (sampling all pixels)...');
        
        // Small delay for UI update
        await new Promise(resolve => setTimeout(resolve, 50));
        
        try {
            const gridData = this.state.referenceGridData;
            const calc = this.state.gridCalculated;
            const align = this.state.gridAlignment || { offsetX: 0, offsetY: 0 };
            
            const deadzonePercent = values.deadzonePercent || 20;
            const deadzoneFraction = deadzonePercent / 100;
            
            // Create canvas to read pixel data
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.state.scanImageElement.width;
            tempCanvas.height = this.state.scanImageElement.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.state.scanImageElement, 0, 0);
            
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Extract color from each tile
            const analysisData = [];
            const { rows, cols, tileSize, gap } = gridData;
            let totalPixelsSampled = 0;
            
            for (let i = 0; i < gridData.sequences.length; i++) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                
                // Tile position in physical grid (mm)
                const tileX_mm = col * (tileSize + gap);
                const tileY_mm = row * (tileSize + gap);
                
                // Convert to image pixels
                const tileX_px = calc.gridX + (tileX_mm * calc.pxPerMm) + align.offsetX;
                const tileY_px = calc.gridY + (tileY_mm * calc.pxPerMm) + align.offsetY;
                const tileSize_px = tileSize * calc.pxPerMm;
                
                // Calculate safe zone (excluding deadzone)
                const deadzone_px = tileSize_px * deadzoneFraction;
                const safeX = Math.round(tileX_px + deadzone_px);
                const safeY = Math.round(tileY_px + deadzone_px);
                const safeSize = Math.round(tileSize_px - (deadzone_px * 2));
                
                // Sample all pixels in safe zone
                const pixels = [];
                for (let py = 0; py < safeSize; py++) {
                    for (let px = 0; px < safeSize; px++) {
                        const imgX = safeX + px;
                        const imgY = safeY + py;
                        
                        if (imgX >= 0 && imgX < tempCanvas.width && imgY >= 0 && imgY < tempCanvas.height) {
                            const pixelIndex = (imgY * tempCanvas.width + imgX) * 4;
                            const r = imageData.data[pixelIndex];
                            const g = imageData.data[pixelIndex + 1];
                            const b = imageData.data[pixelIndex + 2];
                            pixels.push({ r, g, b });
                        }
                    }
                }
                
                totalPixelsSampled += pixels.length;
                
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
                    sampleArea_px: safeSize * safeSize,
                    sampleArea_mm: (safeSize / calc.pxPerMm) ** 2
                });
            }
            
            // Store analysis data
            this.state.scanAnalysis = analysisData;
            
            // Generate quantization config
            this.state.quantizationConfig = this._generateQuantizationConfig(analysisData, gridData);
            
            const avgDeviation = (analysisData.reduce((sum, d) => sum + d.colorDeviation, 0) / analysisData.length).toFixed(2);
            
            toolBase.setValue('scanStatus', `✅ Analyzed ${analysisData.length} tiles (${totalPixelsSampled.toLocaleString()} pixels) | Avg deviation: ${avgDeviation}`);
            
            console.log('📊 Scan analysis complete:', {
                tilesAnalyzed: analysisData.length,
                totalPixels: totalPixelsSampled,
                avgPixelsPerTile: Math.round(totalPixelsSampled / analysisData.length),
                averageDeviation: avgDeviation
            });
            
        } catch (err) {
            toolBase.setValue('scanStatus', `❌ Analysis failed: ${err.message}`);
            console.error('Scan analysis error:', err);
        }
    }
    
    /**
     * View analysis in interactive grid popup - COMPLETE (250+ lines HTML/JS)
     */
    viewAnalysis(toolBase) {
        if (!this.state.scanAnalysis || !this.state.referenceGridData) {
            toolBase.setValue('scanStatus', '❌ No analysis data available');
            return;
        }
        
        const win = window.open('', 'Analysis View', 'width=1200,height=800');
        if (!win) {
            toolBase.setValue('scanStatus', '❌ Popup blocked - allow popups for analysis view');
            return;
        }
        
        const gridData = this.state.referenceGridData;
        const analysis = this.state.scanAnalysis;
        
        win.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Scan Analysis - ${gridData.colours.length}c${gridData.layerCount}L ${gridData.rows}×${gridData.cols}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; color: #0f0; font-family: 'Atkinson Hyperlegible', monospace; padding: 20px; }
        h1 { color: #00ff00; margin-bottom: 20px; font-size: 20px; }
        .controls { background: #111; border: 1px solid #0f0; padding: 15px; margin-bottom: 20px; }
        .controls label { display: inline-block; margin-right: 15px; color: #0ff; }
        .controls select { background: #000; color: #0f0; border: 1px solid #0f0; padding: 5px; font-family: monospace; margin-right: 20px; }
        .stats { background: #111; border: 1px solid #ff0; padding: 10px; margin-bottom: 20px; font-size: 12px; color: #ff0; }
        .grid-container { display: inline-block; background: #222; padding: 10px; border: 2px solid #0f0; }
        .grid { display: grid; gap: 2px; background: #000; }
        .cell { position: relative; border: 1px solid #333; cursor: pointer; transition: border-color 0.1s; }
        .cell:hover { border-color: #0ff !important; z-index: 10; }
        .cell-info { position: absolute; background: rgba(0,0,0,0.95); border: 2px solid #0ff; padding: 10px; color: #0ff; font-size: 11px; pointer-events: none; z-index: 1000; white-space: nowrap; display: none; }
        .cell:hover .cell-info { display: block; }
    </style>
</head>
<body>
    <h1>🔬 SCAN ANALYSIS: ${gridData.colours.length}c${gridData.layerCount}L ${gridData.rows}×${gridData.cols} (${analysis.length} tiles)</h1>
    
    <div class="controls">
        <label>Sort by:
            <select id="sortMode" onchange="updateSort()">
                <option value="index">Grid Order (Row/Col)</option>
                <option value="sequence">Sequence</option>
                <option value="brightness">Brightness (L→D)</option>
                <option value="brightness-rev">Brightness (D→L)</option>
                <option value="hue">Hue (Rainbow)</option>
                <option value="deviation">Color Deviation (Low→High)</option>
                <option value="deviation-rev">Color Deviation (High→Low)</option>
                <option value="red">Red Channel</option>
                <option value="green">Green Channel</option>
                <option value="blue">Blue Channel</option>
            </select>
        </label>
        
        <label>Cell Size:
            <select id="cellSize" onchange="updateCellSize()">
                <option value="20">Tiny (20px)</option>
                <option value="40" selected>Small (40px)</option>
                <option value="60">Medium (60px)</option>
                <option value="80">Large (80px)</option>
                <option value="100">Huge (100px)</option>
            </select>
        </label>
    </div>
    
    <div class="stats" id="stats"></div>
    
    <div class="grid-container">
        <div class="grid" id="grid"></div>
    </div>
    
    <script>
        const analysisData = ${JSON.stringify(analysis)};
        const gridCols = ${gridData.cols};
        let currentSort = 'index';
        let currentCellSize = 40;
        
        function rgbToBrightness(r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b; }
        
        function rgbToHue(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            if (max === min) return 0;
            const delta = max - min;
            let h;
            if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / delta + 2) / 6;
            else h = ((r - g) / delta + 4) / 6;
            return h;
        }
        
        function sortData(mode) {
            const sorted = [...analysisData];
            switch(mode) {
                case 'index': sorted.sort((a, b) => a.index - b.index); break;
                case 'sequence': sorted.sort((a, b) => a.sequenceStr.localeCompare(b.sequenceStr)); break;
                case 'brightness': sorted.sort((a, b) => rgbToBrightness(a.rgb.r, a.rgb.g, a.rgb.b) - rgbToBrightness(b.rgb.r, b.rgb.g, b.rgb.b)); break;
                case 'brightness-rev': sorted.sort((a, b) => rgbToBrightness(b.rgb.r, b.rgb.g, b.rgb.b) - rgbToBrightness(a.rgb.r, a.rgb.g, a.rgb.b)); break;
                case 'hue': sorted.sort((a, b) => rgbToHue(a.rgb.r, a.rgb.g, a.rgb.b) - rgbToHue(b.rgb.r, b.rgb.g, b.rgb.b)); break;
                case 'deviation': sorted.sort((a, b) => a.colorDeviation - b.colorDeviation); break;
                case 'deviation-rev': sorted.sort((a, b) => b.colorDeviation - a.colorDeviation); break;
                case 'red': sorted.sort((a, b) => a.rgb.r - b.rgb.r); break;
                case 'green': sorted.sort((a, b) => a.rgb.g - b.rgb.g); break;
                case 'blue': sorted.sort((a, b) => a.rgb.b - b.rgb.b); break;
            }
            return sorted;
        }
        
        function updateStats() {
            const avgR = Math.round(analysisData.reduce((s, d) => s + d.rgb.r, 0) / analysisData.length);
            const avgG = Math.round(analysisData.reduce((s, d) => s + d.rgb.g, 0) / analysisData.length);
            const avgB = Math.round(analysisData.reduce((s, d) => s + d.rgb.b, 0) / analysisData.length);
            const avgDev = (analysisData.reduce((s, d) => s + d.colorDeviation, 0) / analysisData.length).toFixed(2);
            const totalPx = analysisData.reduce((s, d) => s + d.pixelsSampled, 0);
            
            document.getElementById('stats').innerHTML = 
                'Average Color: <span style="background:rgb(' + avgR + ',' + avgG + ',' + avgB + ');padding:2px 8px;color:#000;font-weight:bold;">RGB(' + avgR + ', ' + avgG + ', ' + avgB + ')</span> | ' +
                'Avg Deviation: ' + avgDev + ' | ' +
                'Total Pixels: ' + totalPx.toLocaleString();
        }
        
        function render() {
            const sorted = sortData(currentSort);
            const grid = document.getElementById('grid');
            grid.style.gridTemplateColumns = 'repeat(' + gridCols + ', ' + currentCellSize + 'px)';
            grid.innerHTML = '';
            
            sorted.forEach(tile => {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.width = currentCellSize + 'px';
                cell.style.height = currentCellSize + 'px';
                cell.style.background = tile.hex;
                
                const info = document.createElement('div');
                info.className = 'cell-info';
                info.innerHTML = 
                    'Tile: ' + tile.index + ' (R' + tile.row + '/C' + tile.col + ')<br>' +
                    'Sequence: ' + tile.sequenceStr + '<br>' +
                    'RGB: ' + tile.rgb.r + ', ' + tile.rgb.g + ', ' + tile.rgb.b + '<br>' +
                    'Hex: ' + tile.hex + '<br>' +
                    'Deviation: ' + tile.colorDeviation.toFixed(2) + '<br>' +
                    'Pixels: ' + tile.pixelsSampled.toLocaleString();
                
                cell.appendChild(info);
                grid.appendChild(cell);
            });
        }
        
        function updateSort() {
            currentSort = document.getElementById('sortMode').value;
            render();
        }
        
        function updateCellSize() {
            currentCellSize = parseInt(document.getElementById('cellSize').value);
            render();
        }
        
        updateStats();
        render();
    </script>
</body>
</html>
        `);
        
        toolBase.setValue('scanStatus', '✅ Analysis view opened in new window');
    }
    
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

