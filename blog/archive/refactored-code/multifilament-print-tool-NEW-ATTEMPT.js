/**
 * Multifilament Image Print Tool
 * 
 * Converts images to multi-color 3D printable STL files using calibrated printer profiles.
 * 
 * Workflow:
 * 1. SOURCE: Generate calibration grid
 * 2. SCAN: Analyze scanned grid to extract actual colors
 * 3. QUANTIZE: Process source image with calibrated palette
 * 4. EXPORT: Generate STL files for each filament
 * 
 * @version 2.0.0
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
    parseGPL
} from '../../shared/algorithms/color/color-utils.js';
import {
    quantizeImage,
    applyMinDetailFilter,
    expandToLayers
} from '../../shared/algorithms/color/quantization.js';
import {
    vectorizePixels,
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
    '#000000', '#800000', '#008000', '#808000',
    '#000080', '#800080', '#008080', '#c0c0c0',
    '#808080', '#ff0000', '#00ff00', '#ffff00',
    '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
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
    
    _onInit(tab, values) {
        // Wire button handlers based on current tab
        switch (tab) {
            case 'SOURCE':
                this._wireButton('generateGrid', () => this._generateGridAction());
                this._wireButton('exportGrid', () => this._exportGridAction());
                this._setStatus('gridStatus', 'Configure grid parameters and click Generate Grid');
                break;
            case 'SCAN':
                this._wireFileInput('scanImage', (file) => this._loadScanImage(file));
                this._wireButton('analyzeScan', () => this._analyzeScanAction());
                this._wireButton('exportPalette', () => this._exportPaletteAction());
                this._setStatus('scanStatus', 'Upload scanned calibration grid');
                break;
            case 'QUANTIZE':
                this._wireFileInput('sourceImage', (file) => this._loadSourceImage(file));
                this._wireButton('quantize', () => this._quantizeAction());
                this._setStatus('quantizeStatus', 'Upload source image to quantize');
                break;
            case 'EXPORT':
                this._wireButton('exportSTL', () => this._exportSTLAction());
                this._wireButton('exportJSON', () => this._exportJSONAction());
                this._setStatus('exportStatus', 'Quantize an image first, then export STL');
                break;
        }
    }
    
    _onUpdate(tab, key, value, allValues) {
        // Handle canvas mode change
        if (key === 'canvasMode') {
            this.toolBase.draw();
        }
        
        // Handle grid parameter changes
        if (tab === 'SOURCE' && ['filamentCount', 'layerCount'].includes(key)) {
            const count = calculateSequenceCount(
                allValues.filamentCount || 4,
                allValues.layerCount || 4
            );
            this._setStatus('gridStatus', `Expected tiles: ${count}`);
        }
    }
    
    _onDraw(tab, ctx, canvas, values) {
        const mode = values.canvasMode || 'Source';
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Different rendering based on tab
        switch (tab) {
            case 'SOURCE':
                if (this.gridData) {
                    this._drawCalibrationGrid(ctx, canvas);
                } else {
                    this._drawPlaceholder(ctx, canvas, 'Click Generate Grid');
                }
                break;
            case 'SCAN':
                if (this.scanImageElement) {
                    ctx.drawImage(this.scanImageElement, 0, 0, canvas.width, canvas.height);
                    if (this.gridData) {
                        this._drawGridOverlay(ctx, canvas);
                    }
                } else {
                    this._drawPlaceholder(ctx, canvas, 'Upload Scan Image');
                }
                break;
            case 'QUANTIZE':
                if (this.quantizedImage) {
                    ctx.putImageData(this.quantizedImage, 0, 0);
                } else if (this.sourceImageElement) {
                    ctx.drawImage(this.sourceImageElement, 0, 0, canvas.width, canvas.height);
                } else {
                    this._drawPlaceholder(ctx, canvas, 'Upload Source Image');
                }
                break;
            case 'EXPORT':
                // Show different views based on canvas mode
                switch (mode) {
                    case 'Source':
                        if (this.sourceImageElement) {
                            ctx.drawImage(this.sourceImageElement, 0, 0, canvas.width, canvas.height);
                        } else {
                            this._drawPlaceholder(ctx, canvas, 'No Source Image');
                        }
                        break;
                    case 'Scan':
                        if (this.scanImageElement) {
                            ctx.drawImage(this.scanImageElement, 0, 0, canvas.width, canvas.height);
                        } else {
                            this._drawPlaceholder(ctx, canvas, 'No Scan Image');
                        }
                        break;
                    case 'Grid':
                        if (this.gridData) {
                            this._drawCalibrationGrid(ctx, canvas);
                        } else {
                            this._drawPlaceholder(ctx, canvas, 'No Grid Generated');
                        }
                        break;
                    case 'Quantized':
                        if (this.quantizedImage) {
                            ctx.putImageData(this.quantizedImage, 0, 0);
                        } else {
                            this._drawPlaceholder(ctx, canvas, 'No Quantized Image');
                        }
                        break;
                    default:
                        // Layer views
                        const layerMatch = mode.match(/Layer (\d+)/);
                        if (layerMatch && this.layerMaps[parseInt(layerMatch[1])]) {
                            this._drawLayer(ctx, canvas, parseInt(layerMatch[1]));
                        } else {
                            this._drawPlaceholder(ctx, canvas, 'Layer Not Available');
                        }
                        break;
                }
                break;
        }
    }
    
    // Helper methods
    _wireButton(key, callback) {
        const comp = this.toolBase.components.get(key);
        if (comp && comp.element) {
            comp.element.addEventListener('click', callback);
        }
    }
    
    _wireFileInput(key, callback) {
        const comp = this.toolBase.components.get(key);
        if (comp && comp.element) {
            const input = comp.element.querySelector('input[type="file"]');
            if (input) {
                input.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) callback(file);
                });
            }
        }
    }
    
    _setStatus(key, message) {
        const comp = this.toolBase.components.get(key);
        if (comp && comp.update) {
            comp.update({ text: message });
        }
    }
    
    _drawPlaceholder(ctx, canvas, text) {
        ctx.fillStyle = '#808080';
        ctx.font = '16px "Atkinson Hyperlegible", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    
    // Action handlers (simplified placeholders - implement full logic later)
    _generateGridAction() {
        console.log('Generate grid action');
        this._setStatus('gridStatus', 'Grid generation not yet implemented');
    }
    
    _exportGridAction() {
        console.log('Export grid action');
    }
    
    _analyzeScanAction() {
        console.log('Analyze scan action');
        this._setStatus('scanStatus', 'Scan analysis not yet implemented');
    }
    
    _exportPaletteAction() {
        console.log('Export palette action');
    }
    
    _quantizeAction() {
        console.log('Quantize action');
        this._setStatus('quantizeStatus', 'Quantization not yet implemented');
    }
    
    _exportSTLAction() {
        console.log('Export STL action');
        this._setStatus('exportStatus', 'STL export not yet implemented');
    }
    
    _exportJSONAction() {
        console.log('Export JSON action');
    }
    
    async _loadSourceImage(file) {
        const img = new Image();
        img.onload = () => {
            this.sourceImageElement = img;
            this.toolBase.draw();
            this._setStatus('quantizeStatus', 'Source image loaded');
        };
        img.src = URL.createObjectURL(file);
    }
    
    async _loadScanImage(file) {
        const img = new Image();
        img.onload = () => {
            this.scanImageElement = img;
            this.toolBase.draw();
            this._setStatus('scanStatus', 'Scan image loaded');
        };
        img.src = URL.createObjectURL(file);
    }
    
    _drawCalibrationGrid(ctx, canvas) {
        // Simplified grid drawing
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    }
    
    _drawGridOverlay(ctx, canvas) {
        // Simplified overlay
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 100, canvas.width - 200, canvas.height - 200);
    }
    
    _drawLayer(ctx, canvas, layerIndex) {
        this._drawPlaceholder(ctx, canvas, `Layer ${layerIndex} View`);
    }
    
    destroy() {
        if (this.toolBase) {
            this.toolBase.destroy();
        }
    }
}

