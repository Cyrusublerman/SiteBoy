/**
 * MFP-Scan.js - SCAN tab module
 * 
 * Handles scan analysis and grid alignment:
 * - Scan image upload
 * - Grid overlay with corner-based transform
 * - Canvas interaction (drag corners/body)
 * - Pixel sampling & color analysis
 * - Visual analysis view
 * - Export analysis results
 * 
 * Uses existing scan/ helper classes where appropriate.
 * Uses ComponentLibrary - NO direct DOM manipulation!
 */

import { FileInput } from '../../../shared/components/input/FileInput.js';
import { NumericInput } from '../../../shared/component-library.js';
import { Dropdown } from '../../../shared/components/input/Dropdown.js';
import { ToggleGroup } from '../../../shared/components/input/ToggleGroup.js';
import { StatusDisplay } from '../../../shared/component-library.js';
import { Button } from '../../../shared/component-library.js';

import { DEFAULTS } from './MFP-Constants.js';
import { drawScanOverlay, drawCornerHandles, drawScanImage } from './MFP-ScanRenderer.js';
import {
    getCanvasCoords,
    findCornerUnderMouse,
    isPointInQuad,
    getGridPoint,
    rafThrottle
} from './MFP-Utils.js';

// Import scan helper classes (from existing scan/ folder)
import { ScanOverlayController } from '../scan/scan-overlay-controller.js';
import { ScanTileAnalyzer } from '../scan/scan-tile-analyzer.js';

// Import algorithms
import {
    simColour,
    rgb2hex
} from '../../../shared/algorithms/color/color-utils.js';

export class MFPScanTab {
    constructor(sharedState) {
        this.state = sharedState;
        
        // UI components
        this.components = [];
        
        // Status displays
        this.scanImageStatus = null;
        this.scanStatus = null;
        
        // Canvas interaction state
        this.dragState = {
            isDragging: false,
            dragType: null, // 'corner', 'body'
            dragCornerIndex: -1,
            startX: 0,
            startY: 0,
            startCorners: null
        };
        
        // Hover state
        this.hoveredCornerIndex = -1;
        
        // Helper instances (use existing scan/ classes)
        this.overlayController = null; // ScanOverlayController
        this.tileAnalyzer = null; // ScanTileAnalyzer
        
        // Bind methods for event listeners
        this._handleMouseDown = this._handleMouseDown.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseUp = this._handleMouseUp.bind(this);
        this._handleMouseLeave = this._handleMouseLeave.bind(this);
        
        // RAF throttled redraw
        this._throttledDraw = null;
    }
    
    /**
     * Build sidebar using ComponentLibrary
     */
    getSidebar(toolBase) {
        this.components = [];
        
        const importedState = this.state.importedState || {};
        
        // REFERENCE GRID STATUS
        const gridStatusText = this.state.referenceGridData
            ? `✅ Grid: ${this.state.referenceGridData.colours.length}c${this.state.referenceGridData.layerCount}L ${this.state.referenceGridData.rows}×${this.state.referenceGridData.cols}`
            : '⚠️ No grid loaded. Go to SOURCE tab to generate/import.';
        
        const gridStatus = new StatusDisplay({
            status: this.state.referenceGridData ? 'success' : 'warning',
            message: gridStatusText
        });
        this.components.push(gridStatus);
        
        // IMPORT PROJECT/GRID
        const importProjectInput = new FileInput({
            label: 'Import Project ZIP',
            accept: '.zip',
            onChange: (file) => this._importProject(file, toolBase)
        });
        this.components.push(importProjectInput);
        
        const importCSVInput = new FileInput({
            label: 'Import Grid CSV',
            accept: '.csv',
            onChange: (file) => this._importCSV(file, toolBase)
        });
        this.components.push(importCSVInput);
        
        // USE LAST GRID
        const useLastGridBtn = new Button({
            label: 'Use Last Generated Grid',
            onClick: () => this._useLastGrid(toolBase)
        });
        this.components.push(useLastGridBtn);
        
        // SCAN IMAGE UPLOAD
        const scanImageInput = new FileInput({
            label: 'Upload Scan Image',
            accept: 'image/*',
            onChange: (file) => this._loadScanImage(file, toolBase)
        });
        this.components.push(scanImageInput);
        
        this.scanImageStatus = new StatusDisplay({
            status: 'idle',
            message: this.state.scanImageElement ? '✅ Scan loaded' : 'Upload scanned grid image'
        });
        this.components.push(this.scanImageStatus);
        
        // SCAN DISPLAY MODE
        const scanDisplayDropdown = new Dropdown({
            label: 'Display Mode',
            options: ['Fit', 'Fill', 'Actual Size'],
            selected: 'Fit',
            onChange: (value) => {
                toolBase.updateValue('scanDisplayMode', value);
                this._applyScanDisplayMode(value, toolBase);
            }
        });
        this.components.push(scanDisplayDropdown);
        
        // GRID OVERLAY OPTIONS
        const gridOptionsToggle = new ToggleGroup({
            label: 'Overlay Options',
            options: [
                { label: 'Show Sample Zones', value: 'sample' },
                { label: 'Show Expected Colors', value: 'colors' }
            ],
            selected: [],
            multiSelect: true,
            onChange: (selected) => {
                toolBase.updateValue('gridOptions', selected);
                toolBase.draw();
            }
        });
        this.components.push(gridOptionsToggle);
        
        // DEADZONE PERCENTAGE
        const deadzoneInput = new NumericInput({
            label: 'Deadzone (%)',
            value: importedState.deadzonePercent || DEFAULTS.deadzonePercent,
            min: 0,
            max: 50,
            step: 1,
            onChange: (value) => {
                toolBase.updateValue('deadzonePercent', value);
                if (this.tileAnalyzer) {
                    this.tileAnalyzer.setDeadZone(value / 100);
                }
                toolBase.draw();
            }
        });
        this.components.push(deadzoneInput);
        
        // GRID ALIGNMENT CONTROLS
        const gridOffsetXInput = new NumericInput({
            label: 'Grid Offset X (px)',
            value: 0,
            min: -1000,
            max: 1000,
            step: 1,
            onChange: (value) => {
                toolBase.updateValue('gridOffsetX', value);
                if (this.state.gridAlignment && this.state.gridAlignment.corners) {
                    const dx = value - (this.state.gridAlignment.offsetX || 0);
                    this.state.gridAlignment.corners.forEach(c => c.x += dx);
                    this.state.gridAlignment.offsetX = value;
                }
                toolBase.draw();
            }
        });
        this.components.push(gridOffsetXInput);
        
        const gridOffsetYInput = new NumericInput({
            label: 'Grid Offset Y (px)',
            value: 0,
            min: -1000,
            max: 1000,
            step: 1,
            onChange: (value) => {
                toolBase.updateValue('gridOffsetY', value);
                if (this.state.gridAlignment && this.state.gridAlignment.corners) {
                    const dy = value - (this.state.gridAlignment.offsetY || 0);
                    this.state.gridAlignment.corners.forEach(c => c.y += dy);
                    this.state.gridAlignment.offsetY = value;
                }
                toolBase.draw();
            }
        });
        this.components.push(gridOffsetYInput);
        
        const resetGridBtn = new Button({
            label: 'Reset Grid Alignment',
            onClick: () => this._resetGridAlignment(toolBase)
        });
        this.components.push(resetGridBtn);
        
        // ANALYSIS
        const analyzeScanBtn = new Button({
            label: 'Analyze Scan',
            variant: 'primary',
            onClick: () => this._analyzeScan(toolBase)
        });
        this.components.push(analyzeScanBtn);
        
        const viewAnalysisBtn = new Button({
            label: 'View Analysis Data',
            onClick: () => this._viewAnalysis(toolBase)
        });
        this.components.push(viewAnalysisBtn);
        
        this.scanStatus = new StatusDisplay({
            status: 'idle',
            message: this.state.scanAnalysis ? `✅ ${this.state.scanAnalysis.length} tiles analyzed` : ''
        });
        this.components.push(this.scanStatus);
        
        // EXPORT
        const exportPaletteBtn = new Button({
            label: 'Export Palette (GPL)',
            onClick: () => this._exportPalette(toolBase)
        });
        this.components.push(exportPaletteBtn);
        
        const exportQuantConfigBtn = new Button({
            label: 'Export Quantization Config',
            onClick: () => this._exportQuantConfig(toolBase)
        });
        this.components.push(exportQuantConfigBtn);
        
        const exportComparisonBtn = new Button({
            label: 'Export Comparison CSV',
            onClick: () => this._exportComparison(toolBase)
        });
        this.components.push(exportComparisonBtn);
        
        return this.components;
    }
    
    /**
     * Load scan image
     */
    async _loadScanImage(file, toolBase) {
        try {
            this.scanImageStatus.setStatus('info', '⏳ Loading scan image...');
            
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = url;
            });
            
            URL.revokeObjectURL(url);
            
            this.state.scanImageElement = img;
            
            // Resize canvas to match image
            const canvas = toolBase.canvas;
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Auto-calculate grid overlay if we have reference grid
            if (this.state.referenceGridData) {
                this._autoCalculateGridOverlay(toolBase);
            }
            
            // Apply display mode
            const mode = toolBase.values.scanDisplayMode || 'Fit';
            this._applyScanDisplayMode(mode, toolBase);
            
            toolBase.draw();
            
            this.scanImageStatus.setStatus('success', `✅ Loaded ${img.width}×${img.height}px`);
            
        } catch (err) {
            console.error('Scan image load error:', err);
            this.scanImageStatus.setStatus('error', `❌ Load failed: ${err.message}`);
        }
    }
    
    /**
     * Auto-calculate grid overlay position and scale
     */
    _autoCalculateGridOverlay(toolBase) {
        if (!this.state.scanImageElement || !this.state.referenceGridData) return;
        
        const values = toolBase.values;
        const scanWidth_mm = values.scanWidth || DEFAULTS.scanWidth;
        const scanHeight_mm = values.scanHeight || DEFAULTS.scanHeight;
        
        const gridData = this.state.referenceGridData;
        
        // Calculate pixels per mm
        const pxPerMm = this.state.scanImageElement.width / scanWidth_mm;
        
        // Calculate grid size in pixels
        const gridWidth_px = gridData.width * pxPerMm;
        const gridHeight_px = gridData.height * pxPerMm;
        
        // Center grid on scan
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
        
        // Initialize corner-based alignment
        this.state.gridAlignment = {
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
            flipped: false,
            autoCalculated: true,
            corners: [
                { x: gridX, y: gridY },                                    // TL
                { x: gridX + gridWidth_px, y: gridY },                     // TR
                { x: gridX + gridWidth_px, y: gridY + gridHeight_px },     // BR
                { x: gridX, y: gridY + gridHeight_px }                     // BL
            ]
        };
        
        console.log('✅ Grid overlay auto-calculated:', this.state.gridCalculated);
    }
    
    /**
     * Reset grid alignment to auto-calculated position
     */
    _resetGridAlignment(toolBase) {
        if (!this.state.scanImageElement || !this.state.referenceGridData) {
            this.scanStatus.setStatus('warning', '⚠️ No scan image or grid loaded');
            return;
        }
        
        this._autoCalculateGridOverlay(toolBase);
        
        // Update UI controls
        toolBase.updateValue('gridOffsetX', 0);
        toolBase.updateValue('gridOffsetY', 0);
        
        toolBase.draw();
        this.scanStatus.setStatus('success', '✅ Grid alignment reset');
    }
    
    /**
     * Apply scan display mode (fit/fill/actual)
     */
    _applyScanDisplayMode(mode, toolBase) {
        const canvas = toolBase.canvas;
        if (!canvas) return;
        
        const canvasArea = canvas.parentElement;
        if (!canvasArea) return;
        
        // Reset
        canvas.style.removeProperty('width');
        canvas.style.removeProperty('height');
        canvas.style.removeProperty('max-width');
        canvas.style.removeProperty('max-height');
        canvas.style.removeProperty('object-fit');
        
        switch(mode.toLowerCase()) {
            case 'fit':
                canvas.style.setProperty('max-width', '100%', 'important');
                canvas.style.setProperty('max-height', '100%', 'important');
                canvas.style.setProperty('object-fit', 'contain', 'important');
                canvasArea.style.overflow = 'hidden';
                break;
            case 'fill':
                canvas.style.setProperty('width', '100%', 'important');
                canvas.style.setProperty('height', '100%', 'important');
                canvas.style.setProperty('object-fit', 'cover', 'important');
                canvasArea.style.overflow = 'hidden';
                break;
            case 'actual size':
                canvas.style.setProperty('width', `${canvas.width}px`, 'important');
                canvas.style.setProperty('height', `${canvas.height}px`, 'important');
                canvasArea.style.overflow = 'auto';
                break;
        }
    }
    
    /**
     * Analyze scan (pixel sampling)
     */
    async _analyzeScan(toolBase) {
        if (!this.state.scanImageElement) {
            this.scanStatus.setStatus('error', '❌ Load scan image first');
            return;
        }
        if (!this.state.referenceGridData) {
            this.scanStatus.setStatus('error', '❌ Load grid first');
            return;
        }
        if (!this.state.gridCalculated) {
            this.scanStatus.setStatus('error', '❌ Grid overlay not calculated');
            return;
        }
        
        try {
            // Show loading state (TODO: update button appearance)
            this.scanStatus.setStatus('info', '⏳ Analyzing scan...');
            
            // Small delay to let UI update
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Create canvas to read pixel data
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.state.scanImageElement.width;
            tempCanvas.height = this.state.scanImageElement.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.state.scanImageElement, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            // TODO: Use ScanTileAnalyzer helper class
            // For now, placeholder
            this.state.scanAnalysis = []; // Placeholder
            
            this.scanStatus.setStatus('success', '✅ Analysis complete (placeholder)');
            
        } catch (err) {
            console.error('Scan analysis error:', err);
            this.scanStatus.setStatus('error', `❌ Analysis failed: ${err.message}`);
        }
    }
    
    /**
     * View analysis results (popup window)
     */
    _viewAnalysis(toolBase) {
        if (!this.state.scanAnalysis || this.state.scanAnalysis.length === 0) {
            this.scanStatus.setStatus('warning', '⚠️ No analysis data available');
            return;
        }
        
        // TODO: Open visual analysis window
        this.scanStatus.setStatus('info', 'Visual analysis: TODO');
    }
    
    /**
     * Export palette as GPL
     */
    _exportPalette(toolBase) {
        if (!this.state.scanAnalysis) {
            this.scanStatus.setStatus('error', '❌ Analyze scan first');
            return;
        }
        
        // TODO: Generate and download GPL file
        this.scanStatus.setStatus('info', 'Export palette: TODO');
    }
    
    /**
     * Export quantization config as JSON
     */
    _exportQuantConfig(toolBase) {
        if (!this.state.scanAnalysis) {
            this.scanStatus.setStatus('error', '❌ Analyze scan first');
            return;
        }
        
        // TODO: Generate and download quantization config
        this.scanStatus.setStatus('info', 'Export quant config: TODO');
    }
    
    /**
     * Export comparison CSV
     */
    _exportComparison(toolBase) {
        if (!this.state.scanAnalysis) {
            this.scanStatus.setStatus('error', '❌ Analyze scan first');
            return;
        }
        
        // TODO: Generate and download comparison CSV
        this.scanStatus.setStatus('info', 'Export comparison: TODO');
    }
    
    /**
     * Import project (delegates to MFP-ProjectIO)
     */
    async _importProject(file, toolBase) {
        this.scanStatus.setStatus('info', '⏳ Importing project...');
        // TODO: Phase 4
        this.scanStatus.setStatus('warning', '⚠️ Project import: TODO (Phase 4)');
    }
    
    /**
     * Import CSV (delegates to MFP-ProjectIO)
     */
    async _importCSV(file, toolBase) {
        this.scanStatus.setStatus('info', '⏳ Importing CSV...');
        // TODO: Phase 4
        this.scanStatus.setStatus('warning', '⚠️ CSV import: TODO (Phase 4)');
    }
    
    /**
     * Use last generated grid from localStorage
     */
    _useLastGrid(toolBase) {
        const stored = localStorage.getItem('multifilament_last_grid');
        if (!stored) {
            this.scanStatus.setStatus('warning', '⚠️ No saved grid found');
            return;
        }
        
        try {
            this.state.referenceGridData = JSON.parse(stored);
            this.scanStatus.setStatus('success', `✅ Loaded ${this.state.referenceGridData.sequences.length} tile grid`);
            
            // Recalculate overlay if scan is loaded
            if (this.state.scanImageElement) {
                this._autoCalculateGridOverlay(toolBase);
                toolBase.draw();
            }
        } catch (err) {
            console.error('Failed to parse saved grid:', err);
            this.scanStatus.setStatus('error', '❌ Failed to load saved grid');
        }
    }
    
    /**
     * Handle canvas mouse events
     */
    _handleMouseDown(e, toolBase) {
        if (!this.state.gridAlignment?.corners) return;
        
        const { x, y } = getCanvasCoords(e, toolBase.canvas);
        const cornerIndex = findCornerUnderMouse(x, y, this.state.gridAlignment.corners);
        
        if (cornerIndex !== -1) {
            // Start corner drag
            this.dragState.isDragging = true;
            this.dragState.dragType = 'corner';
            this.dragState.dragCornerIndex = cornerIndex;
            this.dragState.startX = x;
            this.dragState.startY = y;
            this.dragState.startCorners = this.state.gridAlignment.corners.map(c => ({...c}));
            toolBase.canvas.style.cursor = 'grabbing';
        } else if (isPointInQuad(x, y, this.state.gridAlignment.corners)) {
            // Start body drag
            this.dragState.isDragging = true;
            this.dragState.dragType = 'body';
            this.dragState.startX = x;
            this.dragState.startY = y;
            this.dragState.startCorners = this.state.gridAlignment.corners.map(c => ({...c}));
            toolBase.canvas.style.cursor = 'grabbing';
        }
    }
    
    _handleMouseMove(e, toolBase) {
        if (!this.state.gridAlignment?.corners) return;
        
        const { x, y } = getCanvasCoords(e, toolBase.canvas);
        
        if (this.dragState.isDragging) {
            const dx = x - this.dragState.startX;
            const dy = y - this.dragState.startY;
            
            if (this.dragState.dragType === 'corner') {
                // Update single corner
                const idx = this.dragState.dragCornerIndex;
                this.state.gridAlignment.corners[idx] = {
                    x: this.dragState.startCorners[idx].x + dx,
                    y: this.dragState.startCorners[idx].y + dy
                };
            } else if (this.dragState.dragType === 'body') {
                // Move all corners
                this.state.gridAlignment.corners = this.dragState.startCorners.map(c => ({
                    x: c.x + dx,
                    y: c.y + dy
                }));
            }
            
            this.state.gridAlignment.autoCalculated = false;
            
            // Throttled redraw
            if (this._throttledDraw) {
                this._throttledDraw();
            }
        } else {
            // Update cursor based on hover
            const cornerIndex = findCornerUnderMouse(x, y, this.state.gridAlignment.corners);
            this.hoveredCornerIndex = cornerIndex;
            
            if (cornerIndex !== -1) {
                toolBase.canvas.style.cursor = 'pointer';
            } else if (isPointInQuad(x, y, this.state.gridAlignment.corners)) {
                toolBase.canvas.style.cursor = 'move';
            } else {
                toolBase.canvas.style.cursor = 'default';
            }
            
            // Redraw if hover state changed
            if (this._throttledDraw) {
                this._throttledDraw();
            }
        }
    }
    
    _handleMouseUp(e, toolBase) {
        if (this.dragState.isDragging) {
            this.dragState.isDragging = false;
            this.dragState.dragType = null;
            this.dragState.dragCornerIndex = -1;
            toolBase.canvas.style.cursor = 'default';
        }
    }
    
    _handleMouseLeave(e, toolBase) {
        if (this.dragState.isDragging) {
            this.dragState.isDragging = false;
            this.dragState.dragType = null;
            toolBase.canvas.style.cursor = 'default';
        }
        this.hoveredCornerIndex = -1;
    }
    
    /**
     * Handle value updates
     */
    onUpdate(key, value, allValues, toolBase) {
        // Redraw if needed
        if (['gridOptions', 'deadzonePercent'].includes(key)) {
            toolBase.draw();
        }
    }
    
    /**
     * Draw canvas
     */
    onDraw(ctx, canvas, values) {
        if (this.state.scanImageElement) {
            // Draw scan image
            drawScanImage(ctx, canvas, this.state.scanImageElement);
            
            // Draw grid overlay if available
            if (this.state.referenceGridData && this.state.gridAlignment?.corners) {
                const options = {
                    showSampleZones: (values.gridOptions || []).includes('sample'),
                    showExpectedColors: (values.gridOptions || []).includes('colors'),
                    deadzonePercent: (values.deadzonePercent || DEFAULTS.deadzonePercent) / 100
                };
                
                drawScanOverlay(
                    ctx,
                    canvas,
                    this.state.gridAlignment.corners,
                    this.state.referenceGridData,
                    options,
                    simColour
                );
                
                // Draw corner handles
                drawCornerHandles(ctx, this.state.gridAlignment.corners, this.hoveredCornerIndex);
            }
        } else if (this.state.referenceGridData) {
            // Show message if grid loaded but no scan
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ff00';
            ctx.font = '16px "Atkinson Hyperlegible", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Upload Scanned Image', canvas.width / 2, canvas.height / 2);
            ctx.fillText('Grid ready to overlay', canvas.width / 2, canvas.height / 2 + 24);
        } else {
            // No grid or scan
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ff00';
            ctx.font = '16px "Atkinson Hyperlegible", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Upload Scan Image', canvas.width / 2, canvas.height / 2);
        }
    }
    
    /**
     * Tab activation
     */
    onActivate(toolBase) {
        // Setup canvas interaction
        const canvas = toolBase.canvas;
        if (canvas) {
            canvas.addEventListener('mousedown', (e) => this._handleMouseDown(e, toolBase));
            canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e, toolBase));
            canvas.addEventListener('mouseup', (e) => this._handleMouseUp(e, toolBase));
            canvas.addEventListener('mouseleave', (e) => this._handleMouseLeave(e, toolBase));
        }
        
        // Setup throttled draw
        this._throttledDraw = rafThrottle(() => toolBase.draw());
        
        toolBase.draw();
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.components.forEach(comp => {
            if (comp && typeof comp.destroy === 'function') {
                comp.destroy();
            }
        });
        this.components = [];
        
        // Remove canvas event listeners
        // (Note: ToolBase should handle this, but good practice to clean up)
    }
}

