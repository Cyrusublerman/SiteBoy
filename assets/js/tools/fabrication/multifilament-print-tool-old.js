/**
 * Multifilament Image Print Tool
 * 
 * Converts images to multi-color 3D printable STL files using calibrated printer profiles.
 * 
 * 3-Step Workflow:
 * 1. Grid Generation: Generate calibration grid, print, and scan it
 * 2. Scan Analysis: Extract actual printed colors from scanned grid
 * 3. Image Processing: Quantize image and export STL files
 * 
 * @version 1.0.0
 * @category Fabrication
 */

import { ToolBase } from '../core/tool-base.js';
import {
    generateSequences,
    buildSequenceMap,
    calculateSequenceCount
} from '../../shared/algorithms/combinatorics/sequences.js';
import {
    hex2rgb,
    rgb2hex,
    rgb_to_key,
    simColour,
    findClosest,
    generateGPL,
    parseGPL,
    avgColour
} from '../../shared/algorithms/color/color-utils.js';
import {
    quantizeImage,
    applyMinDetailFilter,
    expandToLayers
} from '../../shared/algorithms/color/quantization.js';
import {
    vectorizePixels,
    generateBox,
    exportArtworkSTLs
} from '../../shared/algorithms/geometry/stl-generation.js';
import {
    calculateGridLayout,
    calculateConstraints
} from '../../shared/algorithms/layout/grid-layout.js';
import {
    extractColors,
    autoCalculateScale,
    drawGridOverlay
} from '../../shared/algorithms/image/image-utils.js';

// VGA Color Palette for Grid Rendering
const VGA_COLORS = [
    '#000000', // Black
    '#800000', // Maroon
    '#008000', // Green
    '#808000', // Olive
    '#000080', // Navy
    '#800080', // Purple
    '#008080', // Teal
    '#c0c0c0', // Silver
    '#808080', // Gray
    '#ff0000', // Red
    '#00ff00', // Lime
    '#ffff00', // Yellow
    '#0000ff', // Blue
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#ffffff'  // White
];

export class MultifilamentPrintTool {
    constructor(container, deps) {
        this.container = container;
        this.deps = deps;
        
        // Internal state
        this.sourceImageElement = null;
        this.scanImageElement = null;
        this.sourceImageData = null;
        this.scanImageData = null;
        this.sequences = [];
        this.sequenceMap = null;
        this.gridData = null;
        this.palette = [];
        this.quantizedImage = null;
        this.layerMaps = [];
        
        // UI elements
        this.wrapper = null;
        this.topTabs = null;
        this.contentArea = null;
        this.currentTab = 'SOURCE';
        
        // Create ToolBase instance
        this.toolBase = null;
        this.render();
    }
    
    render() {
        try {
            const F = this.deps.MF?.F || 14;
            
            // Clear container
            this.container.innerHTML = '';
            
            // Create wrapper with flex layout
            this.wrapper = document.createElement('div');
            this.wrapper.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; position: relative;';
            
            // Create top-level tabs bar
            this.topTabs = this._buildTopTabs();
            this.wrapper.appendChild(this.topTabs);
            
            // Content area for ToolBase
            this.contentArea = document.createElement('div');
            this.contentArea.style.cssText = `
                flex: 1;
                min-height: 0;
                overflow: hidden;
                width: 100%;
            `;
            this.wrapper.appendChild(this.contentArea);
            
            this.container.appendChild(this.wrapper);
            
            // Build ToolBase with initial tab
            this._rebuildToolForTab(this.currentTab);
            
            console.log('✅ MultifilamentPrintTool rendered');
        } catch (error) {
            console.error('❌ MultifilamentPrintTool error:', error);
            this.container.innerHTML = `<div style="padding: 20px; color: var(--c-text);">
                <h2>MULTIFILAMENT PRINT TOOL ERROR</h2>
                <p style="color: red;">${error.message}</p>
            </div>`;
        }
    }
    
    _buildTopTabs() {
        const F = this.deps.MF?.F || 14;
        const tabs = document.createElement('div');
        tabs.style.cssText = `
            display: flex;
            width: 100%;
            height: ${F * 3}px;
            background: var(--c-bg);
            border-bottom: 1px solid var(--c-border);
            flex-shrink: 0;
        `;
        
        const tabNames = ['SOURCE', 'SCAN', 'QUANTIZE', 'EXPORT'];
        tabNames.forEach((name, index) => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.textContent = name;
            const isActive = name === this.currentTab;
            
            tab.style.cssText = `
                flex: 1;
                height: 100%;
                padding: 0 ${F}px;
                border: none;
                border-right: 1px solid var(--c-border);
                background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                font-weight: bold;
                text-transform: uppercase;
                cursor: pointer;
                transition: all 0.2s;
            `;
            
            if (index === tabNames.length - 1) {
                tab.style.borderRight = 'none';
            }
            
            tab.addEventListener('click', () => {
                this.currentTab = name;
                this._rebuildToolForTab(name);
                this._updateTabStyles();
            });
            
            tab.addEventListener('mouseenter', () => {
                if (name !== this.currentTab) {
                    tab.style.background = 'var(--c-border)';
                }
            });
            
            tab.addEventListener('mouseleave', () => {
                if (name !== this.currentTab) {
                    tab.style.background = 'var(--c-bg)';
                }
            });
            
            tabs.appendChild(tab);
        });
        
        return tabs;
    }
    
    _updateTabStyles() {
        const F = this.deps.MF?.F || 14;
        const buttons = this.topTabs.querySelectorAll('button');
        buttons.forEach(btn => {
            const isActive = btn.textContent === this.currentTab;
            btn.style.background = isActive ? 'var(--c-text)' : 'var(--c-bg)';
            btn.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
        });
    }
    
    _rebuildToolForTab(tab) {
        // Destroy existing ToolBase
        if (this.toolBase) {
            this.toolBase.destroy();
        }
        
        // Clear content area
        this.contentArea.innerHTML = '';
        
        // Create new ToolBase with tab-specific config
        const config = this._getConfigForTab(tab);
        this.toolBase = new ToolBase(config, this.deps);
        this.toolBase.mount(this.contentArea);
    }
    
    _getConfigForTab(tab) {
        const baseConfig = {
            canvas: {
                width: 800,
                height: 600
            },
            onInit: (values) => this._onInit(tab, values),
            onUpdate: (key, value, allValues) => this._onUpdate(tab, key, value, allValues),
            onDraw: (ctx, canvas, values) => this._onDraw(tab, ctx, canvas, values)
        };
        
        switch (tab) {
            case 'SOURCE':
                return {
                    ...baseConfig,
                    title: 'Grid Generation',
                    sidebar: this._getSourceSidebar()
                };
            case 'SCAN':
                return {
                    ...baseConfig,
                    title: 'Scan Analysis',
                    sidebar: this._getScanSidebar()
                };
            case 'QUANTIZE':
                return {
                    ...baseConfig,
                    title: 'Image Processing',
                    sidebar: this._getQuantizeSidebar()
                };
            case 'EXPORT':
                return {
                    ...baseConfig,
                    title: 'STL Export',
                    sidebar: this._getExportSidebar()
                };
            default:
                return baseConfig;
        }
    }
    
    _getSourceSidebar() {
        return [
            ['GRID GENERATION', [
                ['Filament Configuration', [
                    ['number', 'Filaments', 4, { key: 'filamentCount', min: 2, max: 8 }],
                    ['number', 'Layers', 4, { key: 'layerCount', min: 2, max: 8 }],
                ]],
                ['Tile Configuration', [
                    ['number', 'Tile Size (mm)', 10, { key: 'tileSize', min: 5, max: 20 }],
                    ['number', 'Gap (mm)', 1, { key: 'gap', min: 0, max: 5, step: 0.5 }],
                ]],
                ['Bed Constraints', [
                    ['number', 'Bed Width (mm)', 256, { key: 'bedWidth', min: 100, max: 400 }],
                    ['number', 'Bed Height (mm)', 256, { key: 'bedHeight', min: 100, max: 400 }],
                ]],
                ['Scan Constraints', [
                    ['number', 'Scan Width (mm)', 210, { key: 'scanWidth', min: 100, max: 300 }],
                    ['number', 'Scan Height (mm)', 297, { key: 'scanHeight', min: 100, max: 400 }],
                ]],
                ['Actions', [
                    ['button', 'Generate Grid', null, { key: 'generateGrid' }],
                    ['button', 'Export Grid PNG', null, { key: 'exportGrid' }],
                    ['label', '', { key: 'gridStatus', variant: 'caption' }],
                ]],
            ]],
        ];
    }
    
    _getScanSidebar() {
        return [
            ['SCAN ANALYSIS', [
                ['Image Upload', [
                    ['file', 'Scan Image', null, { key: 'scanImage', accept: 'image/*' }],
                ]],
                ['Alignment', [
                    ['number', 'Offset X (px)', 0, { key: 'offsetX', min: -500, max: 500 }],
                    ['number', 'Offset Y (px)', 0, { key: 'offsetY', min: -500, max: 500 }],
                    ['number', 'Scale X (px/mm)', 11.81, { key: 'scaleX', min: 1, max: 30, step: 0.01 }],
                    ['number', 'Scale Y (px/mm)', 11.81, { key: 'scaleY', min: 1, max: 30, step: 0.01 }],
                ]],
                ['Actions', [
                    ['button', 'Analyze Scan', null, { key: 'analyzeScan' }],
                    ['button', 'Export Palette (GPL)', null, { key: 'exportPalette' }],
                    ['label', '', { key: 'scanStatus', variant: 'caption' }],
                ]],
            ]],
        ];
    }
    
    _getQuantizeSidebar() {
        return [
            ['IMAGE PROCESSING', [
                ['Source Image', [
                    ['file', 'Source Image', null, { key: 'sourceImage', accept: 'image/*' }],
                ]],
                ['Processing Parameters', [
                    ['number', 'Print Width (mm)', 170, { key: 'printWidth', min: 50, max: 300 }],
                    ['number', 'Dither Strength', 1.0, { key: 'ditherStrength', min: 0, max: 1, step: 0.1 }],
                    ['number', 'Min Detail (mm)', 0.8, { key: 'minDetail', min: 0, max: 2, step: 0.1 }],
                ]],
                ['Actions', [
                    ['button', 'Quantize Image', null, { key: 'quantize' }],
                    ['label', '', { key: 'quantizeStatus', variant: 'caption' }],
                ]],
            ]],
        ];
    }
    
    _getExportSidebar() {
        return [
            ['STL EXPORT', [
                ['Export Parameters', [
                    ['number', 'Layer Height (mm)', 0.08, { key: 'layerHeight', min: 0.04, max: 0.3, step: 0.01 }],
                ]],
                ['Actions', [
                    ['button', 'Export STL Files', null, { key: 'exportSTL' }],
                    ['button', 'Export JSON', null, { key: 'exportJSON' }],
                    ['label', '', { key: 'exportStatus', variant: 'caption' }],
                ]],
            ]],
            ['CANVAS MODE', [
                ['View Mode', [
                    ['dropdown', 'Mode', ['Source', 'Scan', 'Grid', 'Quantized', 'Layer 0', 'Layer 1', 'Layer 2', 'Layer 3'], { key: 'canvasMode' }],
                ]],
            ]],
        ];
    }
    
    _onInit(values) {
        // Set default values
        this.toolBase.values.filamentCount = 4;
        this.toolBase.values.layerCount = 4;
        this.toolBase.values.tileSize = 10;
        this.toolBase.values.gap = 1;
        this.toolBase.values.bedWidth = 256;
        this.toolBase.values.bedHeight = 256;
        this.toolBase.values.scanWidth = 210;
        this.toolBase.values.scanHeight = 297;
        this.toolBase.values.offsetX = 0;
        this.toolBase.values.offsetY = 0;
        this.toolBase.values.scaleX = 11.81;
        this.toolBase.values.scaleY = 11.81;
        this.toolBase.values.printWidth = 170;
        this.toolBase.values.ditherStrength = 1.0;
        this.toolBase.values.minDetail = 0.8;
        this.toolBase.values.layerHeight = 0.08;
        this.toolBase.values.canvasMode = 'Source';
        
        // Wire buttons
        this._wireButton('generateGrid', () => this._generateGridAction());
        this._wireButton('exportGrid', () => this._exportGridAction());
        this._wireButton('analyzeScan', () => this._analyzeScanAction());
        this._wireButton('exportPalette', () => this._exportPaletteAction());
        this._wireButton('quantize', () => this._quantizeAction());
        this._wireButton('exportSTL', () => this._exportSTLAction());
        this._wireButton('exportJSON', () => this._exportJSONAction());
        
        // Wire file inputs
        this._wireFileInput('sourceImage', (file) => this._loadSourceImage(file));
        this._wireFileInput('scanImage', (file) => this._loadScanImage(file));
        
        this._setStatus('gridStatus', 'Configure grid parameters and click Generate Grid');
    }
    
    _onUpdate(key, value, allValues) {
        // Handle canvas mode change
        if (key === 'canvasMode') {
            this.toolBase.draw();
        }
        
        // Handle grid parameter changes
        if (['filamentCount', 'layerCount'].includes(key)) {
            const count = calculateSequenceCount(
                allValues.filamentCount || 4,
                allValues.layerCount || 4
            );
            this._setStatus('gridStatus', `Expected tiles: ${count}`);
        }
    }
    
    _onDraw(ctx, canvas, values) {
        const mode = values.canvasMode || 'Source';
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        switch (mode) {
            case 'Source':
                if (this.sourceImageElement) {
                    ctx.drawImage(this.sourceImageElement, 0, 0, canvas.width, canvas.height);
                } else {
                    this._drawPlaceholder(ctx, canvas, 'Load Source Image');
                }
                break;
                
            case 'Scan':
                if (this.scanImageElement) {
                    ctx.drawImage(this.scanImageElement, 0, 0, canvas.width, canvas.height);
                    // Draw grid overlay if available
                    if (this.gridData) {
                        this._drawGridOverlay(ctx, canvas);
                    }
                } else {
                    this._drawPlaceholder(ctx, canvas, 'Load Scan Image');
                }
                break;
                
            case 'Grid':
                if (this.gridData) {
                    this._drawCalibrationGrid(ctx, canvas);
                } else {
                    this._drawPlaceholder(ctx, canvas, 'Generate Grid First');
                }
                break;
                
            case 'Quantized':
                if (this.quantizedImage) {
                    ctx.putImageData(this.quantizedImage, 0, 0);
                } else {
                    this._drawPlaceholder(ctx, canvas, 'Quantize Image First');
                }
                break;
                
            case 'Layer 0':
            case 'Layer 1':
            case 'Layer 2':
            case 'Layer 3':
                const layerIndex = parseInt(mode.split(' ')[1]);
                this._drawLayerView(ctx, canvas, layerIndex);
                break;
        }
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // Action Handlers
    // ═════════════════════════════════════════════════════════════════════════
    
    _generateGridAction() {
        const values = this.toolBase.values;
        
        // Generate sequences
        this.sequences = generateSequences(values.filamentCount, values.layerCount);
        
        // Calculate grid layout
        const constraints = calculateConstraints({
            bedW: values.bedWidth,
            bedH: values.bedHeight,
            scanW: values.scanWidth,
            scanH: values.scanHeight
        });
        
        this.gridData = calculateGridLayout({
            sequenceCount: this.sequences.length,
            tileSize: values.tileSize,
            gap: values.gap,
            maxWidth: constraints.maxWidth,
            maxHeight: constraints.maxHeight
        });
        
        if (!this.gridData.fits) {
            this._setStatus('gridStatus', `❌ ${this.gridData.error}`);
            return;
        }
        
        // Assign sequences to grid data for scan analysis
        this.gridData.sequences = this.sequences;
        
        this._setStatus('gridStatus', `✅ Grid: ${this.gridData.cols}×${this.gridData.rows} = ${this.sequences.length} tiles`);
        
        // Switch to Grid mode
        this.toolBase.values.canvasMode = 'Grid';
        this.toolBase.draw();
    }
    
    _exportGridAction() {
        if (!this.gridData) {
            this._setStatus('gridStatus', '❌ Generate grid first');
            return;
        }
        
        // Create off-screen canvas for high-res grid
        const tempCanvas = document.createElement('canvas');
        const dpi = 300; // 300 DPI for printing
        const widthInches = this.gridData.width / 25.4; // mm to inches
        const heightInches = this.gridData.height / 25.4;
        tempCanvas.width = Math.round(widthInches * dpi);
        tempCanvas.height = Math.round(heightInches * dpi);
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw grid at high resolution
        this._drawCalibrationGrid(tempCtx, tempCanvas);
        
        // Export as PNG
        tempCanvas.toBlob((blob) => {
            this._downloadFile('calibration-grid.png', blob);
            this._setStatus('gridStatus', '✅ Grid PNG exported');
        });
    }
    
    _analyzeScanAction() {
        if (!this.scanImageData || !this.gridData) {
            this._setStatus('scanStatus', '❌ Load scan image and generate grid first');
            return;
        }
        
        const values = this.toolBase.values;
        
        // Extract colors using grid-aligned sampling
        const { palette, colorMap } = extractColors(
            this.toolBase.canvas,
            {
                sequences: this.sequences,
                rows: this.gridData.rows,
                cols: this.gridData.cols,
                tileSize: values.tileSize,
                gap: values.gap
            },
            {
                offsetX: values.offsetX,
                offsetY: values.offsetY,
                scaleX: values.scaleX,
                scaleY: values.scaleY
            }
        );
        
        this.palette = palette;
        
        // Build sequence map
        this.sequenceMap = buildSequenceMap(
            this.sequences,
            palette,
            this.gridData.cols,
            { simColour, rgb_to_key }
        );
        
        this._setStatus('scanStatus', `✅ Extracted ${palette.length} colors`);
        
        // Update canvas to show overlay
        this.toolBase.draw();
    }
    
    _exportPaletteAction() {
        if (!this.palette.length) {
            this._setStatus('scanStatus', '❌ Analyze scan first');
            return;
        }
        
        const gpl = generateGPL(this.palette, 'Multifilament Palette');
        const blob = new Blob([gpl], { type: 'text/plain' });
        this._downloadFile('palette.gpl', blob);
        
        this._setStatus('scanStatus', '✅ Palette GPL exported');
    }
    
    _quantizeAction() {
        if (!this.sourceImageData || !this.palette.length) {
            this._setStatus('quantizeStatus', '❌ Load source image and analyze scan first');
            return;
        }
        
        const values = this.toolBase.values;
        
        // Step 1: Quantize
        const quantized = quantizeImage(this.sourceImageData, this.palette, {
            ditherStrength: values.ditherStrength
        });
        
        // Step 2: Min detail filter
        const filtered = applyMinDetailFilter(
            quantized,
            this.palette,
            values.minDetail,
            values.printWidth
        );
        
        this.quantizedImage = filtered;
        
        // Step 3: Expand to layers
        this.layerMaps = expandToLayers(
            filtered,
            this.sequenceMap,
            values.filamentCount
        );
        
        this._setStatus('quantizeStatus', `✅ Quantized to ${this.palette.length} colors`);
        
        // Switch to Quantized mode
        this.toolBase.values.canvasMode = 'Quantized';
        this.toolBase.draw();
    }
    
    _exportSTLAction() {
        if (!this.layerMaps.length) {
            this._setStatus('exportStatus', '❌ Quantize image first');
            return;
        }
        
        const values = this.toolBase.values;
        const filamentNames = this.palette.map((c, i) => `Filament_${i + 1}`);
        
        const stls = exportArtworkSTLs(
            this.layerMaps,
            filamentNames,
            {
                imageWidth: this.sourceImageData.width,
                imageHeight: this.sourceImageData.height,
                printWidth: values.printWidth,
                layerHeight: values.layerHeight
            }
        );
        
        // Download each STL file
        Object.entries(stls).forEach(([filename, content]) => {
            const blob = new Blob([content], { type: 'text/plain' });
            this._downloadFile(filename, blob);
        });
        
        this._setStatus('exportStatus', `✅ Exported ${Object.keys(stls).length} STL files`);
    }
    
    _exportJSONAction() {
        const config = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            grid: {
                filamentCount: this.toolBase.values.filamentCount,
                layerCount: this.toolBase.values.layerCount,
                tileSize: this.toolBase.values.tileSize,
                gap: this.toolBase.values.gap,
                bedWidth: this.toolBase.values.bedWidth,
                bedHeight: this.toolBase.values.bedHeight,
                scanWidth: this.toolBase.values.scanWidth,
                scanHeight: this.toolBase.values.scanHeight
            },
            alignment: {
                offsetX: this.toolBase.values.offsetX,
                offsetY: this.toolBase.values.offsetY,
                scaleX: this.toolBase.values.scaleX,
                scaleY: this.toolBase.values.scaleY
            },
            processing: {
                printWidth: this.toolBase.values.printWidth,
                ditherStrength: this.toolBase.values.ditherStrength,
                minDetail: this.toolBase.values.minDetail,
                layerHeight: this.toolBase.values.layerHeight
            },
            palette: this.palette.map(c => rgb2hex(c))
        };
        
        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        this._downloadFile('multifilament-config.json', blob);
        
        this._setStatus('exportStatus', '✅ Config JSON exported');
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // File Loading
    // ═════════════════════════════════════════════════════════════════════════
    
    _loadSourceImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.sourceImageElement = img;
                
                // Create ImageData
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0);
                this.sourceImageData = tempCtx.getImageData(0, 0, img.width, img.height);
                
                this._setStatus('quantizeStatus', `✅ Source image loaded: ${img.width}×${img.height}px`);
                this.toolBase.values.canvasMode = 'Source';
                this.toolBase.draw();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    _loadScanImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.scanImageElement = img;
                
                // Create ImageData
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0);
                this.scanImageData = tempCtx.getImageData(0, 0, img.width, img.height);
                
                // Auto-calculate scale
                if (this.gridData) {
                    const scale = autoCalculateScale(
                        img.width,
                        img.height,
                        this.gridData.width,
                        this.gridData.height,
                        this.toolBase.values.scanWidth,
                        this.toolBase.values.scanHeight
                    );
                    this.toolBase.values.scaleX = scale.scaleX;
                    this.toolBase.values.scaleY = scale.scaleY;
                }
                
                this._setStatus('scanStatus', `✅ Scan image loaded: ${img.width}×${img.height}px`);
                this.toolBase.values.canvasMode = 'Scan';
                this.toolBase.draw();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // Rendering Helpers
    // ═════════════════════════════════════════════════════════════════════════
    
    _drawPlaceholder(ctx, canvas, message) {
        ctx.fillStyle = '#808080';
        ctx.font = '14px Atkinson Hyperlegible, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }
    
    _drawCalibrationGrid(ctx, canvas) {
        const { rows, cols, width, height } = this.gridData;
        const tileSize = this.toolBase.values.tileSize;
        const gap = this.toolBase.values.gap;
        
        // Calculate scale to fit canvas
        const scaleX = canvas.width / width;
        const scaleY = canvas.height / height;
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        // Center grid
        const offsetX = (canvas.width - width * scale) / 2;
        const offsetY = (canvas.height - height * scale) / 2;
        
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        
        // Draw grid
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                if (index >= this.sequences.length) continue;
                
                const sequence = this.sequences[index];
                const x = col * (tileSize + gap);
                const y = row * (tileSize + gap);
                
                // Simulate color for this sequence
                const color = simColour(sequence, VGA_COLORS.slice(0, this.toolBase.values.filamentCount).map(hex2rgb));
                const hexColor = rgb2hex(color);
                
                ctx.fillStyle = hexColor;
                ctx.fillRect(x, y, tileSize, tileSize);
                
                // Draw border
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 0.2;
                ctx.strokeRect(x, y, tileSize, tileSize);
            }
        }
        
        ctx.restore();
    }
    
    _drawGridOverlay(ctx, canvas) {
        const values = this.toolBase.values;
        const { rows, cols } = this.gridData;
        const tileSize = values.tileSize;
        const gap = values.gap;
        
        ctx.save();
        ctx.translate(values.offsetX, values.offsetY);
        ctx.scale(values.scaleX, values.scaleY);
        
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2 / values.scaleX;
        
        // Draw grid cells
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * (tileSize + gap);
                const y = row * (tileSize + gap);
                ctx.strokeRect(x, y, tileSize, tileSize);
            }
        }
        
        ctx.restore();
    }
    
    _drawLayerView(ctx, canvas, layerIndex) {
        if (!this.layerMaps.length || layerIndex >= this.layerMaps.length) {
            this._drawPlaceholder(ctx, canvas, 'Layer not available');
            return;
        }
        
        const layerMap = this.layerMaps[layerIndex];
        const width = this.sourceImageData.width;
        const height = this.sourceImageData.height;
        
        // Create ImageData for this layer
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        // Render each filament's pixels for this layer
        for (let fi = 0; fi < layerMap.length; fi++) {
            const pixels = layerMap[fi];
            const color = this.palette[fi] || { r: 255, g: 255, b: 255 };
            
            for (let coord of pixels) {
                const [x, y] = coord.split(',').map(Number);
                const idx = (y * width + x) * 4;
                data[idx] = color.r;
                data[idx + 1] = color.g;
                data[idx + 2] = color.b;
                data[idx + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // Utility Helpers
    // ═════════════════════════════════════════════════════════════════════════
    
    _wireButton(key, handler) {
        const component = this.toolBase.getComponent(key);
        if (component && component.element) {
            component.element.addEventListener('click', handler);
        }
    }
    
    _wireFileInput(key, handler) {
        const component = this.toolBase.getComponent(key);
        if (component && component.element) {
            const input = component.element.querySelector('input[type="file"]');
            if (input) {
                input.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) handler(file);
                });
            }
        }
    }
    
    _setStatus(key, message) {
        const component = this.toolBase.getComponent(key);
        if (component && component.updateContent) {
            component.updateContent(message);
        }
    }
    
    _downloadFile(filename, blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // ═════════════════════════════════════════════════════════════════════════
    // Cleanup
    // ═════════════════════════════════════════════════════════════════════════
    
    destroy() {
        if (this.toolBase) {
            this.toolBase.destroy();
        }
        
        // Clean up image references
        this.sourceImageElement = null;
        this.scanImageElement = null;
        this.sourceImageData = null;
        this.scanImageData = null;
        this.sequences = [];
        this.sequenceMap = null;
        this.gridData = null;
        this.palette = [];
        this.quantizedImage = null;
        this.layerMaps = [];
    }
}

