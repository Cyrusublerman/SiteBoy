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
    calculateSequenceCount,
    sortSequences,
    getSortMethods
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
    generateREADME,
    generateConfigJSON,
    generateManifest,
    generateLayoutJSON,
    generateFolderName,
    generateScanInstructions
} from '../../shared/algorithms/export/export-package.js';
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
    exportGridCSV,
    exportComparisonCSV,
    downloadCSV,
    parseGridCSV
} from '../../shared/algorithms/data/csv-export.js';
import {
    calculateGridLayout,
    calculateConstraints
} from '../../shared/algorithms/layout/grid-layout.js';
import {
    extractColors,
    autoCalculateScale,
    drawGridOverlay
} from '../../shared/algorithms/image/image-utils.js';

// Bambu Lab PLA Basic - 29 Colors
const FILAMENT_COLOURS = [
    {h:"#FFFFFF",n:"Jade White"},
    {h:"#EC008C",n:"Magenta"},
    {h:"#E4BD68",n:"Gold"},
    {h:"#3F8E43",n:"Mistletoe Green"},
    {h:"#C12E1F",n:"Red"},
    {h:"#5E43B7",n:"Purple"},
    {h:"#F7E6DE",n:"Beige"},
    {h:"#F55A74",n:"Pink"},
    {h:"#FEC600",n:"Sunflower Yellow"},
    {h:"#847D48",n:"Bronze"},
    {h:"#00B1B7",n:"Turquoise"},
    {h:"#482960",n:"Indigo Purple"},
    {h:"#D1D3D5",n:"Light Gray"},
    {h:"#F5547C",n:"Hot Pink"},
    {h:"#F4EE2A",n:"Yellow"},
    {h:"#6F5034",n:"Cocoa Brown"},
    {h:"#0086D6",n:"Cyan"},
    {h:"#5B6579",n:"Blue Grey"},
    {h:"#A6A9AA",n:"Silver"},
    {h:"#FF6A13",n:"Orange"},
    {h:"#BECF00",n:"Bright Green"},
    {h:"#9D432C",n:"Brown"},
    {h:"#0A2989",n:"Blue"},
    {h:"#545454",n:"Dark Gray"},
    {h:"#8E9089",n:"Gray"},
    {h:"#FF9016",n:"Pumpkin Orange"},
    {h:"#00AE42",n:"Bambu Green"},
    {h:"#9D2235",n:"Maroon Red"},
    {h:"#0056B8",n:"Cobalt Blue"},
    {h:"#000000",n:"Black"}
];

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
        this.gridRenderData = null; // For canvas click detection
        this.gridConstraints = null; // For constraint bounds rendering
        this.splitGridInfo = null; // For split grid suggestion
        this.splitGrids = null; // Array of split grids if generated
        this.palette = [];
        this.quantizedImage = null;
        this.layerMaps = [];
        
        // Filament selection state
        this.selectedFilaments = []; // Array of indices into FILAMENT_COLOURS
        this.filteredFilaments = FILAMENT_COLOURS; // For search filtering
        
        this.referenceGridData = null; // Grid to align against (from CSV or last generated)
        
        // Grid overlay alignment state (simple X/Y offset + rotation)
        this.gridAlignment = {
            offsetX: 0,         // Pixel offset from auto-calculated position
            offsetY: 0,
            rotation: 0,        // Degrees
            flipped: false,     // Mirror for back scans
            autoCalculated: false  // Whether auto-calc has been done
        };
        
        // Scan canvas display mode
        this.scanDisplayMode = 'fit'; // 'fit', 'fill', 'actual'
        
        // Scroll interval for edge-hover scrolling
        this.scrollInterval = null;
        
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
            
            // Add project status bar (initially hidden) - between tabs and content
            this.projectStatusBar = this._buildProjectStatusBar();
            this.wrapper.appendChild(this.projectStatusBar);
            
            // Content area for ToolBase
            this.contentArea = document.createElement('div');
            this.contentArea.style.cssText = `
                flex: 1;
                min-height: 0;
                width: 100%;
                position: relative;
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
    
    _buildProjectStatusBar() {
        const F = this.deps.MF?.F || 14;
        
        const statusBar = document.createElement('div');
        statusBar.style.cssText = `
            width: 100%;
            min-height: ${F * 2.5}px;
            background: var(--c-bg-secondary);
            border-top: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            display: none;
            align-items: center;
            padding: 0 ${F}px;
            flex-shrink: 0;
            gap: ${F * 0.5}px;
        `;
        
        // Icon
        const icon = document.createElement('span');
        icon.textContent = '📦';
        icon.style.cssText = `
            font-size: ${F * 1.2}px;
            flex-shrink: 0;
        `;
        
        // Project info text
        const infoText = document.createElement('div');
        infoText.style.cssText = `
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F * 0.9}px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            line-height: 1.3;
        `;
        infoText.textContent = '';
        
        // Clear button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.type = 'button';
        clearBtn.style.cssText = `
            padding: ${F * 0.4}px ${F * 0.8}px;
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F * 0.85}px;
            cursor: pointer;
            flex-shrink: 0;
            transition: all 0.2s;
        `;
        clearBtn.title = 'Clear loaded project';
        clearBtn.addEventListener('click', () => this._clearLoadedProject());
        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.background = 'var(--c-text)';
            clearBtn.style.color = 'var(--c-bg)';
        });
        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.background = 'var(--c-bg)';
            clearBtn.style.color = 'var(--c-text)';
        });
        
        statusBar.appendChild(icon);
        statusBar.appendChild(infoText);
        statusBar.appendChild(clearBtn);
        
        this.projectStatusBarText = infoText;
        
        return statusBar;
    }
    
    _updateProjectStatusBar() {
        if (!this.projectStatusBar || !this.projectStatusBarText) return;
        
        if (this.gridData && this.gridData.colours && this.gridData.colours.length > 0) {
            // Show status bar with project info
            const colors = this.gridData.colours.length;
            const layers = this.gridData.layerCount;
            const grid = `${this.gridData.rows}×${this.gridData.cols}`;
            const tiles = this.gridData.sequences.length;
            const colorNames = this.gridData.colours.map(c => c.n).join(', ');
            const sort = this.gridData.sortMethod || 'Layer Count';
            
            this.projectStatusBarText.textContent = `${colors} colors, ${layers} layers  •  ${grid} grid (${tiles} tiles)  •  ${colorNames}  •  Sorted by: ${sort}`;
            this.projectStatusBar.style.display = 'flex';
        } else {
            // Hide status bar
            this.projectStatusBar.style.display = 'none';
        }
    }
    
    _clearLoadedProject() {
        if (confirm('Clear loaded project? This will reset all data.')) {
            this.gridData = null;
            this.referenceGridData = null;
            this.sequences = null;
            this.sequenceMap = null;
            this.selectedFilaments = [0, 1, 2, 3]; // Reset to default
            this.importedState = null;
            this.importedStateApplied = false;
            
            localStorage.removeItem('multifilament_last_grid');
            
            this._updateProjectStatusBar();
            
            // Rebuild current tab to reflect cleared state
            this._rebuildToolForTab(this.currentTab);
            
            if (this.toolBase && this.toolBase.draw) {
                this.toolBase.draw();
            }
        }
    }
    
    _buildTopTabs() {
        const F = this.deps.MF?.F || 14;
        
        // Wrapper with overflow hidden
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            width: 100%;
            height: ${F * 3}px;
            background: var(--c-bg);
            border-bottom: 1px solid var(--c-border);
            flex-shrink: 0;
            position: relative;
            overflow: hidden;
        `;
        
        // Scrollable tabs container
        const tabs = document.createElement('div');
        tabs.className = 'top-tabs-scrollable';
        tabs.style.cssText = `
            display: flex;
            width: 100%;
            height: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
        `;
        
        // Hide webkit scrollbar
        const style = document.createElement('style');
        style.textContent = `.top-tabs-scrollable::-webkit-scrollbar { display: none; }`;
        wrapper.appendChild(style);
        
        const tabNames = ['SOURCE', 'SCAN', 'QUANTIZE', 'EXPORT'];
        tabNames.forEach((name, index) => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.textContent = name;
            const isActive = name === this.currentTab;
            
            tab.style.cssText = `
                flex: 1;
                min-width: max-content;
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
                white-space: nowrap;
                flex-shrink: 0;
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
        
        // Setup edge-hover scrolling
        this._setupEdgeScroll(tabs);
        
        wrapper.appendChild(tabs);
        return wrapper;
    }
    
    _setupEdgeScroll(container) {
        const EDGE_ZONE = 40; // pixels from edge to trigger scroll
        const SCROLL_SPEED = 3; // pixels per frame
        
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            
            // Clear existing interval
            if (this.scrollInterval) {
                clearInterval(this.scrollInterval);
                this.scrollInterval = null;
            }
            
            // Left edge - scroll left
            if (x < EDGE_ZONE && container.scrollLeft > 0) {
                this.scrollInterval = setInterval(() => {
                    container.scrollLeft -= SCROLL_SPEED;
                    if (container.scrollLeft <= 0) {
                        clearInterval(this.scrollInterval);
                        this.scrollInterval = null;
                    }
                }, 16);
            }
            // Right edge - scroll right
            else if (x > width - EDGE_ZONE) {
                const maxScroll = container.scrollWidth - container.clientWidth;
                if (container.scrollLeft < maxScroll) {
                    this.scrollInterval = setInterval(() => {
                        container.scrollLeft += SCROLL_SPEED;
                        if (container.scrollLeft >= maxScroll) {
                            clearInterval(this.scrollInterval);
                            this.scrollInterval = null;
                        }
                    }, 16);
                }
            }
        });
        
        container.addEventListener('mouseleave', () => {
            if (this.scrollInterval) {
                clearInterval(this.scrollInterval);
                this.scrollInterval = null;
            }
        });
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
        // For SCAN tab, canvas will be dynamically sized to match the uploaded image
        // For others, use standard size
        const canvasConfig = tab === 'SCAN' 
            ? { width: 800, height: 600, dynamic: true }  // Will be resized on image load
            : { width: 800, height: 600 };
            
        const baseConfig = {
            canvas: canvasConfig,
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
    
    _getSelectedFilamentNames() {
        // Return names of only selected filaments for dropdowns
        if (!this.selectedFilaments || this.selectedFilaments.length === 0) {
            return ['Select filaments first'];
        }
        return this.selectedFilaments.map(idx => FILAMENT_COLOURS[idx].n);
    }
    
    _getSourceSidebar() {
        // Use imported state if available, otherwise use defaults
        const state = this.importedState || {};
        
        // Single tab containing all blocks (top-level tabs are handled by custom _buildTopTabs)
        return [['CONTROLS', [
            ['PROJECT', [
                ['file', 'Import Project (ZIP)', null, { key: 'importProject', accept: '.zip' }],
                ['label', '', { key: 'projectStatus', variant: 'caption' }],
            ]],
            ['FILAMENT PICKER', [
                ['filament-picker', 'Select Filament Colors', FILAMENT_COLOURS, { 
                    key: 'filamentPicker',
                    min: 2, 
                    max: 10,
                    selectedIndices: this.selectedFilaments
                }],
            ]],
            ['PHYSICAL CONSTRAINTS', [
                ['number', 'Bed Width (mm)', state.bedWidth || 256, { key: 'bedWidth', min: 100, max: 400 }],
                ['number', 'Bed Height (mm)', state.bedHeight || 256, { key: 'bedHeight', min: 100, max: 400 }],
                ['number', 'Scan Width (mm)', state.scanWidth || 210, { key: 'scanWidth', min: 100, max: 300 }],
                ['number', 'Scan Height (mm)', state.scanHeight || 297, { key: 'scanHeight', min: 100, max: 400 }],
            ]],
            ['TILE CONFIGURATION', [
                ['number', 'Layers per Tile', state.layerCount || 4, { key: 'layerCount', min: 1, max: 10 }],
                ['number', 'Layer Height (mm)', state.layerHeight || 0.08, { key: 'layerHeight', min: 0.04, max: 0.4, step: 0.01 }],
                ['number', 'Tile Size (mm)', state.tileSize || 10, { key: 'tileSize', min: 2, max: 20, step: 0.5 }],
                ['number', 'Gap (mm)', state.gap !== undefined ? state.gap : 1, { key: 'gap', min: 0, max: 5, step: 0.5 }],
                ['number', 'Perimeter Margin (mm)', state.perimeterMargin !== undefined ? state.perimeterMargin : 0, { key: 'perimeterMargin', min: 0, max: 10, step: 0.5 }],
                ['label', 'Border around entire grid (for scan edge tolerance)', { variant: 'caption' }],
            ]],
            ['BASE & TOP LAYERS', [
                ['number', 'Base Layers (bottom)', state.baseLayers !== undefined ? state.baseLayers : 3, { key: 'baseLayers', min: 0, max: 10 }],
                ['dropdown', 'Base Filament', this._getSelectedFilamentNames(), { 
                    key: 'baseFilament',
                    value: state.baseFilament
                }],
                ['number', 'Top Layers (top)', state.topLayers || 0, { key: 'topLayers', min: 0, max: 10 }],
                ['dropdown', 'Top Filament', this._getSelectedFilamentNames(), { 
                    key: 'topFilament',
                    value: state.topFilament
                }],
            ]],
            ['GAP CONFIGURATION', [
                ['checkbox', 'Fill Mode', ['Fill Gaps'], { 
                    key: 'gapFillOptions', 
                    selectedValues: state.gapFillOptions || [] 
                }],
                ['dropdown', 'Gap Filament', this._getSelectedFilamentNames(), { 
                    key: 'gapFilament',
                    value: state.gapFilament
                }],
            ]],
            ['SORT & VIEW', [
                ['dropdown', 'Sort Method', ['Layer Count', 'Base Color', 'Top Color', 'Complexity', 'Lexicographic'], { 
                    value: state.sortMethod || 'Layer Count', 
                    key: 'sortMethod' 
                }],
                ['dropdown', 'Canvas View', ['Combined', 'Layer 0', 'Layer 1', 'Layer 2', 'Layer 3'], { 
                    value: 'Combined', 
                    key: 'canvasView' 
                }],
            ]],
            ['GENERATE GRID', [
                ['button', 'Generate Grid', null, { key: 'generateGrid' }],
                ['button', 'Generate Split Grids', null, { key: 'generateSplitGrids' }],
                ['label', '', { key: 'sequenceCount', variant: 'caption' }],
                ['label', '', { key: 'gridStatus', variant: 'caption' }],
            ]],
            ['EXPORT OPTIONS', [
                ['checkbox', 'Options', ['STL Combined', 'STL Per Layer', 'Sorted Variants', 'Layer Visuals'], { 
                    key: 'exportOptions',
                    selectedValues: ['STL Combined', 'STL Per Layer', 'Sorted Variants', 'Layer Visuals']
                }],
            ]],
            ['EXPORT ACTIONS', [
                ['button', 'Export Grid PNG', null, { key: 'exportGridPNG' }],
                ['button', 'Export Grid STLs', null, { key: 'exportGridSTL' }],
                ['button', 'Export Grid CSV', null, { key: 'exportGridCSV' }],
                ['button', '📦 Export Complete Package', null, { key: 'exportCompletePackage' }],
                ['label', '', { key: 'exportStatus', variant: 'caption' }],
            ]],
        ]]];
    }
    
    _getScanSidebar() {
        const sortMethods = ['Layer Count', 'Base Color', 'Top Color', 'Complexity', 'Lexicographic'];
        const state = this.importedState || {};
        
        // Show loaded grid info if available
        let gridStatusText = '';
        if (this.gridData) {
            const colors = this.gridData.colours.length;
            const layers = this.gridData.layerCount;
            const grid = `${this.gridData.rows}×${this.gridData.cols}`;
            const sort = this.gridData.sortMethod || 'Layer Count';
            gridStatusText = `✅ Grid loaded: ${colors}c${layers}L ${grid} (Sort: ${sort})`;
        }
        
        return [['CONTROLS', [
            ['GRID REFERENCE', [
                ['file', 'Import Project (ZIP)', null, { key: 'importProjectScan', accept: '.zip' }],
                ['file', 'Import Grid CSV', null, { key: 'importGridCSV', accept: '.csv' }],
                ['button', 'Use Last Generated Grid', null, { key: 'useLastGrid' }],
                ['button', 'View Reference Grid', null, { key: 'viewReferenceGrid' }],
                ['dropdown', 'Re-sort Grid', sortMethods, { 
                    key: 'resortGrid', 
                    value: state.sortMethod || this.gridData?.sortMethod || 'Layer Count' 
                }],
                ['button', 'Apply Sort', null, { key: 'applySortToGrid' }],
                ['label', gridStatusText, { key: 'gridLoadStatus', variant: 'caption' }],
            ]],
            ['SCAN IMAGE', [
                ['file', 'Scan Image', null, { key: 'scanImage', accept: 'image/*' }],
                ['label', '', { key: 'scanImageStatus', variant: 'caption' }],
                ['dropdown', 'Display Mode', ['Fit', 'Fill', 'Actual Size'], { 
                    key: 'scanDisplayMode',
                    value: 'Fit'
                }],
                ['label', 'Fit=contain, Fill=cover, Actual=1:1 pixels', { variant: 'caption' }],
            ]],
            ['GRID OVERLAY', [
                ['label', 'Grid auto-sized on image upload', { key: 'gridInfo', variant: 'caption' }],
                ['number', 'Fine Adjust X (px)', 0, { key: 'gridOffsetX', min: -50, max: 50, step: 1 }],
                ['number', 'Fine Adjust Y (px)', 0, { key: 'gridOffsetY', min: -50, max: 50, step: 1 }],
                ['number', 'Rotation (°)', 0, { key: 'gridRotation', min: -5, max: 5, step: 0.1 }],
                ['checkbox', 'Options', ['Flip/Mirror', 'Show Sample Zones', 'Show Expected Colors'], { 
                    key: 'gridOptions', 
                    selectedValues: ['Show Sample Zones'] 
                }],
                ['button', 'Reset Alignment', null, { key: 'resetGrid' }],
            ]],
            ['SAMPLING', [
                ['number', 'Deadzone (%)', 20, { key: 'deadzonePercent', min: 0, max: 40, step: 5 }],
                ['label', 'Edge border to exclude (20% = 40% total removed)', { variant: 'caption' }],
            ]],
            ['ANALYSIS', [
                ['button', 'Analyze Scan', null, { key: 'analyzeScan' }],
                ['button', 'View Analysis Data', null, { key: 'viewAnalysis' }],
                ['button', 'Export Palette (GPL)', null, { key: 'exportPalette' }],
                ['button', 'Export Quantization Config', null, { key: 'exportQuantConfig' }],
                ['button', 'Export Comparison CSV', null, { key: 'exportComparisonCSV' }],
                ['label', '', { key: 'scanStatus', variant: 'caption' }],
            ]],
        ]]];
    }
    
    _getQuantizeSidebar() {
        // Show loaded palette info if available
        let paletteStatusText = '';
        if (this.gridData && this.gridData.colours) {
            const colorNames = this.gridData.colours.map(c => c.n).join(', ');
            paletteStatusText = `✅ Palette loaded: ${this.gridData.colours.length} colors (${colorNames})`;
        } else {
            paletteStatusText = '⚠️ No palette loaded. Generate or import a grid first.';
        }
        
        return [['CONTROLS', [
            ['PALETTE STATUS', [
                ['label', paletteStatusText, { key: 'paletteStatus', variant: 'caption' }],
            ]],
            ['IMAGE PROCESSING', [
                ['file', 'Source Image', null, { key: 'sourceImage', accept: 'image/*' }],
                ['number', 'Print Width (mm)', 170, { key: 'printWidth', min: 50, max: 300 }],
                ['number', 'Dither Strength', 1.0, { key: 'ditherStrength', min: 0, max: 1, step: 0.1 }],
                ['number', 'Min Detail (mm)', 0.8, { key: 'minDetail', min: 0, max: 2, step: 0.1 }],
            ]],
            ['ACTIONS', [
                ['button', 'Quantize Image', null, { key: 'quantize' }],
                ['label', '', { key: 'quantizeStatus', variant: 'caption' }],
            ]],
        ]]];
    }
    
    _getExportSidebar() {
        const state = this.importedState || {};
        
        // Show project status if available
        let projectStatusText = '';
        let scanStatusText = '';
        
        if (this.gridData) {
            const colors = this.gridData.colours.length;
            const layers = this.gridData.layerCount;
            const grid = `${this.gridData.rows}×${this.gridData.cols}`;
            const tiles = this.gridData.sequences.length;
            projectStatusText = `✅ Grid: ${colors}c${layers}L ${grid} (${tiles} tiles)`;
            
            if (this.scanAnalysis && this.scanAnalysis.length > 0) {
                const avgDev = (this.scanAnalysis.reduce((s, t) => s + t.colorDeviation, 0) / this.scanAnalysis.length).toFixed(1);
                scanStatusText = `✅ Scan analyzed: ${this.scanAnalysis.length} tiles (Δ ${avgDev})`;
            } else {
                scanStatusText = '⚠️ No scan analysis (optional)';
            }
        } else {
            projectStatusText = '⚠️ No project loaded. Generate or import a grid first.';
        }
        
        return [['CONTROLS', [
            ['PROJECT STATUS', [
                ['label', projectStatusText, { key: 'exportProjectStatus', variant: 'caption' }],
                ['label', scanStatusText, { key: 'exportScanStatus', variant: 'caption' }],
            ]],
            ['COMPLETE PROJECT', [
                ['button', 'Export Complete Project ZIP', null, { key: 'exportCompleteProject' }],
                ['label', 'Includes grid, STL files, visuals, and scan analysis if available', { variant: 'caption' }],
                ['label', '', { key: 'exportProjectZipStatus', variant: 'caption' }],
            ]],
            ['STL EXPORT', [
                ['number', 'Layer Height (mm)', state.layerHeight || 0.08, { key: 'layerHeight', min: 0.04, max: 0.3, step: 0.01 }],
                ['button', 'Export STL Files Only', null, { key: 'exportSTL' }],
                ['button', 'Export JSON Only', null, { key: 'exportJSON' }],
                ['label', '', { key: 'exportStatus', variant: 'caption' }],
            ]],
            ['CANVAS MODE', [
                ['dropdown', 'Mode', ['Source', 'Scan', 'Grid', 'Quantized', 'Layer 0', 'Layer 1', 'Layer 2', 'Layer 3'], { key: 'canvasMode' }],
            ]],
        ]]];
    }
    
    _onInit(tab, values) {
        // Wire button handlers based on current tab
        switch (tab) {
            case 'SOURCE':
                this._wireFileInput('importProject', (file) => this._importProjectAction(file));
                this._wireButton('generateGrid', () => this._generateGridAction());
                this._wireButton('generateSplitGrids', () => this._generateSplitGridsAction());
                this._wireButton('exportGridPNG', () => this._exportGridPNGAction());
                this._wireButton('exportGridSTL', () => this._exportGridSTLAction());
                this._wireButton('exportGridCSV', () => this._exportGridCSVAction());
                this._wireButton('exportCompletePackage', () => this._exportCompletePackageAction());
                // Initial setup
                this._setStatus('gridStatus', 'Select 2-10 filaments, then click Generate Grid');
                this._setStatus('exportStatus', '');
                this._setStatus('projectStatus', 'Import complete project ZIP or start new');
                this._updateSequenceCount();
                // Wire canvas click handler for interactive grid
                if (this.toolBase.canvas) {
                    this.toolBase.canvas.addEventListener('click', (e) => this._handleCanvasClick(e));
                }
                break;
            case 'SCAN':
                this._wireFileInput('importProjectScan', (file) => this._importProjectAction(file));
                this._wireFileInput('importGridCSV', (file) => this._importGridCSVAction(file));
                this._wireButton('useLastGrid', () => this._useLastGridAction());
                this._wireButton('viewReferenceGrid', () => this._viewReferenceGridAction());
                this._wireButton('applySortToGrid', () => this._applySortToGridAction());
                this._wireFileInput('scanImage', (file) => this._loadScanImage(file));
                this._wireButton('resetGrid', () => this._resetGridAlignment());
                this._wireButton('analyzeScan', () => this._analyzeScanAction());
                this._wireButton('viewAnalysis', () => this._viewAnalysisAction());
                this._wireButton('exportPalette', () => this._exportPaletteAction());
                this._wireButton('exportQuantConfig', () => this._exportQuantizationConfigAction());
                this._wireButton('exportComparisonCSV', () => this._exportComparisonCSVAction());
                
                // Wire canvas interactions for corner dragging
                this._setupScanCanvasInteraction();
                
                // Wire keyboard controls for pixel-perfect nudging
                this._setupKeyboardControls();
                
                // Auto-load last grid if available
                this._autoLoadLastGrid();
                break;
            case 'QUANTIZE':
                this._wireFileInput('sourceImage', (file) => this._loadSourceImage(file));
                this._wireButton('quantize', () => this._quantizeAction());
                this._setStatus('quantizeStatus', 'Upload source image to quantize');
                break;
            case 'EXPORT':
                this._wireButton('exportCompleteProject', () => this._exportCompletePackageAction());
                this._wireButton('exportSTL', () => this._exportSTLAction());
                this._wireButton('exportJSON', () => this._exportJSONAction());
                break;
        }
    }
    
    _onUpdate(tab, key, value, allValues) {
        // Update selected filaments when filamentPicker changes
        if (key === 'filamentPicker_indices') {
            this.selectedFilaments = value;
            this._updateSequenceCount();
            this._updateFilamentDropdowns();
            if (tab === 'SOURCE') {
                this._generateLivePreview(); // Auto-generate when colors change
            }
        }
        
        // Handle canvas mode change
        if (key === 'canvasMode') {
            this.toolBase.draw();
        }
        
        // Handle grid overlay controls
        if (tab === 'SCAN') {
            if (key === 'scanDisplayMode') {
                const mode = value.toLowerCase();
                this.scanDisplayMode = mode;
                this._applyScanDisplayMode(mode);
                this.toolBase.draw();
            } else if (key === 'gridOffsetX') {
                this.gridAlignment.offsetX = value;
                this.toolBase.draw();
            } else if (key === 'gridOffsetY') {
                this.gridAlignment.offsetY = value;
                this.toolBase.draw();
            } else if (key === 'gridRotation') {
                this.gridAlignment.rotation = value;
                this.toolBase.draw();
            } else if (key === 'gridOptions') {
                // Checkbox array changed, redraw
                this.toolBase.draw();
            } else if (key === 'deadzonePercent') {
                // Deadzone changed, redraw
                this.toolBase.draw();
            }
        }
        
        // Handle canvas view change (SOURCE tab)
        if (key === 'canvasView') {
            this.toolBase.draw();
        }
        
        // Handle sort method change
        if (key === 'sortMethod') {
            this._applySortMethod(value);
        }
        
        // Handle grid parameter changes - update live preview
        if (tab === 'SOURCE' && ['layerCount', 'tileSize', 'gap', 'perimeterMargin', 'baseLayers', 'topLayers', 'bedWidth', 'bedHeight', 'scanWidth', 'scanHeight'].includes(key)) {
            this._updateSequenceCount();
            this._generateLivePreview(); // Auto-generate preview
        }
    }
    
    _generateLivePreview() {
        // Generate preview grid without validation - just show what it would look like
        const selectedCount = this.selectedFilaments ? this.selectedFilaments.length : 0;
        if (selectedCount < 2) return;
        
        const values = this.toolBase.values;
        const selectedColors = this.selectedFilaments.map(idx => FILAMENT_COLOURS[idx]);
        
        // Generate sequences
        this.sequences = generateSequences(selectedColors.length, values.layerCount);
        
        // Calculate layout (force it even if oversized)
        const constraints = calculateConstraints({
            bedW: values.bedWidth,
            bedH: values.bedHeight,
            scanW: values.scanWidth,
            scanH: values.scanHeight
        });
        
        // Store both bed and scan constraints for visualization
        this.gridConstraints = {
            maxWidth: constraints.maxWidth,
            maxHeight: constraints.maxHeight,
            bedWidth: values.bedWidth,
            bedHeight: values.bedHeight,
            scanWidth: values.scanWidth,
            scanHeight: values.scanHeight
        };
        
        // Try to fit in constraints
        const layout = calculateGridLayout({
            sequenceCount: this.sequences.length,
            tileSize: values.tileSize,
            gap: values.gap,
            perimeterMargin: values.perimeterMargin || 0,
            maxWidth: constraints.maxWidth,
            maxHeight: constraints.maxHeight
        });
        
        if (layout.fits) {
            // Normal generation
            this.gridData = {
                sequences: this.sequences,
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
            const cols = Math.ceil(Math.sqrt(this.sequences.length));
            const rows = Math.ceil(this.sequences.length / cols);
            const perimeterMargin = values.perimeterMargin || 0;
            const step = values.tileSize + values.gap;
            const gridWidth = cols * step - values.gap;
            const gridHeight = rows * step - values.gap;
            const width = gridWidth + (perimeterMargin * 2);
            const height = gridHeight + (perimeterMargin * 2);
            
            const totalCells = rows * cols;
            const emptyCells = [];
            for (let i = this.sequences.length; i < totalCells; i++) {
                emptyCells.push(i);
            }
            
            this.gridData = {
                sequences: this.sequences,
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
        this.sequenceMap = buildSequenceMap(
            this.sequences,
            selectedColors,
            this.gridData.cols,
            { simColour, rgb_to_key }
        );
        
        // Redraw
        this.toolBase.draw();
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
                    console.log('🎨 Drawing calibration grid, sequences:', this.gridData.sequences?.length);
                    this._drawCalibrationGrid(ctx, canvas);
                } else {
                    console.log('⚠️ No gridData available for drawing');
                    this._drawPlaceholder(ctx, canvas, 'Click Generate Grid');
                }
                break;
            case 'SCAN':
                if (this.scanImageElement) {
                    // Draw scan image at actual pixel size (canvas matches image dimensions)
                    ctx.drawImage(this.scanImageElement, 0, 0);
                    
                    // Draw grid overlay ONLY if we have both grid data AND calculations
                    if (this.referenceGridData && this.gridCalculated) {
                        this._drawPrecisionGridOverlay(ctx, canvas, 1.0, 0, 0, values);
                    }
                } else if (this.referenceGridData) {
                    // Show message if grid loaded but no scan
                    this._drawPlaceholder(ctx, canvas, 'Upload Scanned Image\nGrid ready to overlay');
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
    
    _updateSequenceCount() {
        const selectedCount = this.selectedFilaments ? this.selectedFilaments.length : 0;
        if (selectedCount < 2) {
            this._setStatus('sequenceCount', 'Select at least 2 filaments');
            return;
        }
        
        const values = this.toolBase.values;
        const count = calculateSequenceCount(
            selectedCount,
            values.layerCount || 4
        );
        
        // Calculate what the grid would look like
        const constraints = calculateConstraints({
            bedW: values.bedWidth || 256,
            bedH: values.bedHeight || 256,
            scanW: values.scanWidth || 210,
            scanH: values.scanHeight || 297
        });
        
        const layout = calculateGridLayout({
            sequenceCount: count,
            tileSize: values.tileSize || 10,
            gap: values.gap || 1,
            perimeterMargin: values.perimeterMargin || 0,
            maxWidth: constraints.maxWidth,
            maxHeight: constraints.maxHeight
        });
        
        if (layout.fits) {
            this._setStatus('sequenceCount', 
                `✓ ${count} tiles → ${layout.rows}×${layout.cols} grid (${Math.round(layout.width)}×${Math.round(layout.height)}mm)`
            );
        } else {
            // Calculate how many grids needed
            const step = (values.tileSize || 10) + (values.gap || 1);
            const maxTilesPerGrid = Math.floor((constraints.maxWidth + values.gap) / step) * 
                                   Math.floor((constraints.maxHeight + values.gap) / step);
            const gridsNeeded = Math.ceil(count / maxTilesPerGrid);
            
            this._setStatus('sequenceCount', 
                `⚠ ${count} tiles (needs ${gridsNeeded} grids of ${maxTilesPerGrid} tiles each)`
            );
        }
    }
    
    _updateFilamentDropdowns() {
        // Update base/top/gap filament dropdowns with currently selected filaments
        if (!this.toolBase || !this.toolBase.components) return;
        
        const filamentNames = this.selectedFilaments.length > 0
            ? this.selectedFilaments.map(idx => FILAMENT_COLOURS[idx].n)
            : ['Select filaments first'];
        
        const defaultValue = filamentNames.length > 1 ? filamentNames[filamentNames.length - 1] : filamentNames[0];
        
        // Helper function to update a single dropdown
        const updateDropdown = (key) => {
            const dropdown = this.toolBase.components.get(key);
            if (!dropdown) return;
            
            // Use the dropdown's setOptions method if available
            if (typeof dropdown.setOptions === 'function') {
                dropdown.setOptions(filamentNames);
            } else {
                dropdown.options = filamentNames;
            }
            
            // Update value if current value is not in new list
            if (!dropdown.value || !filamentNames.includes(dropdown.value)) {
                if (typeof dropdown.setValue === 'function') {
                    dropdown.setValue(defaultValue);
                } else {
                    dropdown.value = defaultValue;
                }
            }
            
            // Update the display (trigger button text) if element exists
            if (dropdown.element) {
                const triggerButton = dropdown.element.querySelector('.dropdown-trigger');
                if (triggerButton) {
                    triggerButton.textContent = dropdown.value + ' +';
                }
            }
        };
        
        // Update all three dropdowns
        updateDropdown('baseFilament');
        updateDropdown('topFilament');
        updateDropdown('gapFilament');
    }
    
    // Action handlers - Full implementation
    _generateGridAction() {
        // Validate filament selection
        if (!this.selectedFilaments || this.selectedFilaments.length < 2) {
            this._setStatus('gridStatus', '❌ Select at least 2 filaments first');
            return;
        }
        
        if (this.selectedFilaments.length > 10) {
            this._setStatus('gridStatus', '❌ Maximum 10 filaments allowed');
            return;
        }
        
        // If we already have a preview, just finalize it
        if (this.gridData && this.gridData.isPreview) {
            if (this.gridData.fitsConstraints) {
                // Mark as finalized (no longer preview)
                this.gridData.isPreview = false;
                this.splitGridInfo = null;
                this.splitGrids = null;
                
                // Save to localStorage for SCAN tab auto-load
                this._saveGridToLocalStorage();
                
                this._setStatus('gridStatus', `✅ Grid: ${this.gridData.rows}×${this.gridData.cols} = ${this.sequences.length} tiles (${this.gridData.width.toFixed(1)}×${this.gridData.height.toFixed(1)}mm)`);
                this.toolBase.draw();
                return;
            } else {
                // Oversized - offer split option
                const values = this.toolBase.values;
                const step = values.tileSize + values.gap;
                const maxTilesPerGrid = Math.floor((this.gridConstraints.maxWidth + values.gap) / step) * 
                                       Math.floor((this.gridConstraints.maxHeight + values.gap) / step);
                const gridsNeeded = Math.ceil(this.sequences.length / maxTilesPerGrid);
                
                this._setStatus('gridStatus', 
                    `❌ ${this.sequences.length} tiles won't fit (${this.gridData.width.toFixed(1)}×${this.gridData.height.toFixed(1)}mm).\n` +
                    `Max: ${this.gridConstraints.maxWidth.toFixed(1)}×${this.gridConstraints.maxHeight.toFixed(1)}mm\n` +
                    `Options:\n` +
                    `• Reduce layers (${values.layerCount} → ${values.layerCount - 1})\n` +
                    `• Reduce colors (${this.selectedFilaments.length} → ${this.selectedFilaments.length - 1})\n` +
                    `• Reduce tile size (${values.tileSize}mm → ${values.tileSize - 1}mm)\n` +
                    `• Click "Generate Split Grids" to create ${gridsNeeded} grids`
                );
                
                // Store split grid info
                this.splitGridInfo = {
                    sequences: this.sequences,
                    colours: this.gridData.colours,
                    gridsNeeded,
                    maxTilesPerGrid,
                    constraints: this.gridConstraints,
                    tileSize: values.tileSize,
                    gap: values.gap,
                    layerCount: values.layerCount,
                    baseLayers: values.baseLayers
                };
                
                return;
            }
        }
        
        // Shouldn't reach here if live preview is working
        this._generateLivePreview();
        if (this.gridData) {
            this.gridData.isPreview = false;
            this._setStatus('gridStatus', `✅ Grid: ${this.gridData.rows}×${this.gridData.cols} = ${this.sequences.length} tiles`);
        }
    }
    
    _generateSplitGridsAction() {
        if (!this.splitGridInfo) {
            this._setStatus('gridStatus', '❌ No split grid info available. Try "Generate Grid" first.');
            return;
        }
        
        const info = this.splitGridInfo;
        const grids = [];
        
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
                this._setStatus('gridStatus', `❌ Grid ${i + 1} won't fit (${chunkSequences.length} tiles)`);
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
        this.splitGrids = grids;
        this.gridData = grids[0]; // Show first grid by default
        
        // Build sequence map for first grid
        this.sequenceMap = buildSequenceMap(
            grids[0].sequences,
            grids[0].colours,
            grids[0].cols,
            { simColour, rgb_to_key }
        );
        
        this._setStatus('gridStatus', 
            `✅ Generated ${grids.length} grids:\n` +
            grids.map((g, i) => 
                `Grid ${i + 1}: ${g.rows}×${g.cols} = ${g.sequences.length} tiles (${g.width.toFixed(1)}×${g.height.toFixed(1)}mm)`
            ).join('\n') +
            `\nShowing Grid 1. Use Export buttons for all grids.`
        );
        
        // Redraw canvas
        this.toolBase.draw();
    }
    
    _generateGridFilename(gridData, gridIndex, totalGrids, extension) {
        // Format: cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm[-gXofY]-YYYYMMDD.ext
        // Example: cal-3c4L-9x9-10mm-g1of2-20260104.png
        const colors = gridData.colours.length;
        const layers = gridData.layerCount;
        const rows = gridData.rows;
        const cols = gridData.cols;
        const tileSize = gridData.tileSize;
        
        // Date stamp: YYYYMMDD
        const now = new Date();
        const dateStamp = now.getFullYear().toString() +
                         (now.getMonth() + 1).toString().padStart(2, '0') +
                         now.getDate().toString().padStart(2, '0');
        
        // Build filename parts
        let filename = `cal-${colors}c${layers}L-${rows}x${cols}-${tileSize}mm`;
        
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
    
    _exportGridPNGAction() {
        if (!this.gridData) {
            this._setStatus('gridStatus', '❌ Generate grid first');
            return;
        }
        
        const gridsToExport = this.splitGrids || [this.gridData];
        
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
            this._drawCalibrationGridDetailed(exportCtx, exportCanvas, grid);
            
            // Export as PNG
            exportCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const filename = this._generateGridFilename(
                    grid, 
                    this.splitGrids ? index + 1 : null, 
                    this.splitGrids ? gridsToExport.length : null, 
                    'png'
                );
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
            });
        });
        
        const count = gridsToExport.length;
        this._setStatus('gridStatus', `✅ Exported ${count} grid PNG${count > 1 ? 's' : ''}`);
    }
    
    _exportGridSTLAction() {
        if (!this.gridData) {
            this._setStatus('gridStatus', '❌ Generate grid first');
            return;
        }
        
        this._setStatus('gridStatus', 'Generating STL files...');
        
        const gridsToExport = this.splitGrids || [this.gridData];
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
                    this.splitGrids ? gridIndex + 1 : null, 
                    this.splitGrids ? gridsToExport.length : null, 
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
        
        this._setStatus('gridStatus', `✅ Exported ${totalFiles} STL files`);
    }
    
    _createGridLayerMaps(grid = this.gridData) {
        // Convert grid sequences to layer maps format
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
    
    async _analyzeScanAction() {
        // Prerequisites
        if (!this.scanImageElement) {
            this._setStatus('scanStatus', '❌ Load scan image first');
            return;
        }
        if (!this.referenceGridData) {
            this._setStatus('scanStatus', '❌ Load grid first (CSV or generate)');
            return;
        }
        if (!this.gridCalculated) {
            this._setStatus('scanStatus', '❌ Grid overlay not calculated. Upload scan image to trigger auto-calculation.');
            return;
        }
        
        // Show loading state
        const button = this.toolBase.components.get('analyzeScan');
        if (button?.element) {
            button.element.textContent = 'Analyzing...';
            button.element.style.filter = 'invert(1)';
            button.element.disabled = true;
        }
        
        this._setStatus('scanStatus', '⏳ Analyzing scan (sampling all pixels)...');
        
        // Use setTimeout to let UI update before heavy computation
        await new Promise(resolve => setTimeout(resolve, 50));
        
        try {
            const gridData = this.referenceGridData;
            const calc = this.gridCalculated;
            const align = this.gridAlignment;
            const values = this.toolBase?.values || {};
            
            // Get deadzone settings
            const deadzonePercent = values.deadzonePercent || 20;
            const deadzoneFraction = deadzonePercent / 100;
            
            // Create canvas to read pixel data
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.scanImageElement.width;
            tempCanvas.height = this.scanImageElement.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.scanImageElement, 0, 0);
            
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Extract color from each tile (sample all pixels in safe zone)
            const analysisData = [];
            const { rows, cols, tileSize, gap } = gridData;
            
            let totalPixelsSampled = 0;
            
            for (let i = 0; i < gridData.sequences.length; i++) {
                // Calculate tile position in image coordinates
                const row = Math.floor(i / cols);
                const col = i % cols;
                
                // Tile position in physical grid (mm)
                const tileX_mm = col * (tileSize + gap);
                const tileY_mm = row * (tileSize + gap);
                
                // Convert to image pixels (using calculated px/mm ratio)
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
                        
                        // Bounds check
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
                
                // Calculate standard deviation for each channel
                const varR = pixels.reduce((sum, p) => sum + Math.pow(p.r - avgR, 2), 0) / pixels.length;
                const varG = pixels.reduce((sum, p) => sum + Math.pow(p.g - avgG, 2), 0) / pixels.length;
                const varB = pixels.reduce((sum, p) => sum + Math.pow(p.b - avgB, 2), 0) / pixels.length;
                
                const stdR = Math.sqrt(varR);
                const stdG = Math.sqrt(varG);
                const stdB = Math.sqrt(varB);
                
                // Overall color deviation (Euclidean distance in RGB space)
                const colorDeviation = Math.sqrt(varR + varG + varB);
                
                // Round averages
                const r = Math.round(avgR);
                const g = Math.round(avgG);
                const b = Math.round(avgB);
                
                const sequence = gridData.sequences[i];
                const sequenceStr = sequence.join('');
                
                // Get filament names for this sequence
                const filamentStack = sequence
                    .map((filIdx, layer) => ({
                        layer,
                        filamentIndex: filIdx,
                        filamentName: filIdx > 0 ? gridData.colours[filIdx - 1]?.n : 'Empty'
                    }))
                    .filter(f => f.filamentIndex > 0);
                
                analysisData.push({
                    // Position
                    index: i,
                    row,
                    col,
                    
                    // Sequence info
                    sequence,
                    sequenceStr,
                    filamentStack,
                    
                    // Color measurements
                    rgb: { r, g, b },
                    hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
                    
                    // Statistics
                    std: { r: stdR, g: stdG, b: stdB },
                    variance: { r: varR, g: varG, b: varB },
                    colorDeviation,
                    
                    // Sample info
                    pixelsSampled: pixels.length,
                    sampleArea_px: safeSize * safeSize,
                    sampleArea_mm: (safeSize / calc.pxPerMm) ** 2
                });
            }
            
            // Store analysis data
            this.scanAnalysis = analysisData;
            
            // Generate unique palette (for similar sequences)
            const uniquePalette = this._generateUniquePaletteFromAnalysis(analysisData, gridData);
            
            // Generate RGB → Sequence lookup for quantization
            this.quantizationConfig = this._generateQuantizationConfig(analysisData, gridData);
            
            const avgDeviation = (analysisData.reduce((sum, d) => sum + d.colorDeviation, 0) / analysisData.length).toFixed(2);
            
            this._setStatus('scanStatus', `✅ Analyzed ${analysisData.length} tiles (${totalPixelsSampled.toLocaleString()} pixels) | Avg deviation: ${avgDeviation}`);
            
            console.log('📊 Scan analysis complete:', {
                tilesAnalyzed: analysisData.length,
                totalPixels: totalPixelsSampled,
                avgPixelsPerTile: Math.round(totalPixelsSampled / analysisData.length),
                averageDeviation: avgDeviation,
                uniqueSequences: uniquePalette.length,
                data: analysisData
            });
            
        } catch (err) {
            this._setStatus('scanStatus', `❌ Analysis failed: ${err.message}`);
            console.error('Scan analysis error:', err);
        } finally {
            // Restore button state
            const button = this.toolBase.components.get('analyzeScan');
            if (button?.element) {
                button.element.textContent = 'Analyze Scan';
                button.element.style.filter = '';
                button.element.disabled = false;
            }
        }
    }
    
    _generateUniquePaletteFromAnalysis(analysisData, gridData) {
        // Group by sequence
        const sequenceMap = new Map();
        
        analysisData.forEach(data => {
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
        
        // Average colors for each unique sequence
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
    
    _generateQuantizationConfig(analysisData, gridData) {
        // Create RGB → Sequence mapping for quantization
        // Format: palette name = filament order, color names = sequence numbers
        
        const filamentNames = gridData.colours.map(c => c.n).join('');
        const uniquePalette = this._generateUniquePaletteFromAnalysis(analysisData, gridData);
        
        return {
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            paletteName: filamentNames,
            filaments: gridData.colours,
            
            // Color lookup: RGB → Sequence
            colorMap: uniquePalette.map(color => ({
                name: color.sequenceStr,
                rgb: color.rgb,
                hex: color.hex,
                sequence: color.sequence,
                filamentStack: color.filamentStack,
                tileCount: color.tileCount,
                deviation: color.averageDeviation
            })),
            
            // Full analysis data for advanced use
            tileData: analysisData
        };
    }
    
    _exportPaletteAction() {
        if (!this.scanAnalysis) {
            this._setStatus('scanStatus', '❌ Analyze scan first');
            return;
        }
        
        const gridData = this.referenceGridData;
        const uniquePalette = this._generateUniquePaletteFromAnalysis(this.scanAnalysis, gridData);
        const filamentNames = gridData.colours.map(c => c.n).join('');
        
        // Generate GPL format
        let gpl = 'GIMP Palette\n';
        gpl += `Name: ${filamentNames}\n`;
        gpl += `Columns: ${Math.min(uniquePalette.length, 16)}\n`;
        gpl += `# Scanned from physical print calibration grid\n`;
        gpl += `# Generated: ${new Date().toISOString()}\n`;
        gpl += `# Filaments: ${gridData.colours.map(c => c.n).join(', ')}\n`;
        gpl += `# Tiles analyzed: ${this.scanAnalysis.length}\n`;
        gpl += `# Color names are layer sequences (e.g., "1234" = filament 1+2+3+4)\n`;
        gpl += '#\n';
        
        uniquePalette.forEach(color => {
            gpl += `${String(color.rgb.r).padStart(3)} ${String(color.rgb.g).padStart(3)} ${String(color.rgb.b).padStart(3)} ${color.sequenceStr}\n`;
        });
        
        // Download
        const blob = new Blob([gpl], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filamentNames}-palette-${new Date().toISOString().slice(0,10)}.gpl`;
        a.click();
        URL.revokeObjectURL(url);
        
        this._setStatus('scanStatus', `✅ Exported palette: ${uniquePalette.length} colors (${filamentNames})`);
    }
    
    _generateCalibratedPaletteGPL() {
        if (!this.scanAnalysis) return '';
        
        const gridData = this.referenceGridData;
        const uniquePalette = this._generateUniquePaletteFromAnalysis(this.scanAnalysis, gridData);
        const filamentNames = gridData.colours.map(c => c.n).join('');
        
        let gpl = 'GIMP Palette\n';
        gpl += `Name: ${filamentNames}\n`;
        gpl += `Columns: ${Math.min(uniquePalette.length, 16)}\n`;
        gpl += `# Calibrated from scanned print\n`;
        gpl += `# Generated: ${new Date().toISOString()}\n`;
        gpl += `# Filaments: ${gridData.colours.map(c => c.n).join(', ')}\n`;
        gpl += `# Tiles analyzed: ${this.scanAnalysis.length}\n`;
        gpl += '#\n';
        
        uniquePalette.forEach(color => {
            gpl += `${String(color.rgb.r).padStart(3)} ${String(color.rgb.g).padStart(3)} ${String(color.rgb.b).padStart(3)} ${color.sequenceStr}\n`;
        });
        
        return gpl;
    }
    
    _viewAnalysisAction() {
        if (!this.scanAnalysis || !this.referenceGridData) {
            this._setStatus('scanStatus', '❌ No analysis data available');
            return;
        }
        
        // Open a new window with interactive analysis view
        const win = window.open('', 'Analysis View', 'width=1200,height=800');
        if (!win) {
            this._setStatus('scanStatus', '❌ Popup blocked - allow popups for analysis view');
            return;
        }
        
        const gridData = this.referenceGridData;
        const analysis = this.scanAnalysis;
        
        // Generate HTML for analysis view
        win.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Scan Analysis - ${gridData.colours.length}c${gridData.layerCount}L ${gridData.rows}×${gridData.cols}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: #000;
            color: #0f0;
            font-family: 'Atkinson Hyperlegible', monospace;
            padding: 20px;
        }
        h1 {
            color: #00ff00;
            margin-bottom: 20px;
            font-size: 20px;
        }
        .controls {
            background: #111;
            border: 1px solid #0f0;
            padding: 15px;
            margin-bottom: 20px;
        }
        .controls label {
            display: inline-block;
            margin-right: 15px;
            color: #0ff;
        }
        .controls select {
            background: #000;
            color: #0f0;
            border: 1px solid #0f0;
            padding: 5px;
            font-family: monospace;
            margin-right: 20px;
        }
        .stats {
            background: #111;
            border: 1px solid #ff0;
            padding: 10px;
            margin-bottom: 20px;
            font-size: 12px;
            color: #ff0;
        }
        .grid-container {
            display: inline-block;
            background: #222;
            padding: 10px;
            border: 2px solid #0f0;
        }
        .grid {
            display: grid;
            gap: 2px;
            background: #000;
        }
        .cell {
            position: relative;
            border: 1px solid #333;
            cursor: pointer;
            transition: border-color 0.1s;
        }
        .cell:hover {
            border-color: #0ff !important;
            z-index: 10;
        }
        .cell-info {
            position: absolute;
            background: rgba(0,0,0,0.95);
            border: 2px solid #0ff;
            padding: 10px;
            color: #0ff;
            font-size: 11px;
            pointer-events: none;
            z-index: 1000;
            white-space: nowrap;
            display: none;
        }
        .cell:hover .cell-info {
            display: block;
        }
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
        
        function rgbToBrightness(r, g, b) {
            return 0.299 * r + 0.587 * g + 0.114 * b;
        }
        
        function rgbToHue(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
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
                case 'index':
                    sorted.sort((a, b) => a.index - b.index);
                    break;
                case 'sequence':
                    sorted.sort((a, b) => a.sequenceStr.localeCompare(b.sequenceStr));
                    break;
                case 'brightness':
                    sorted.sort((a, b) => {
                        const bA = rgbToBrightness(a.rgb.r, a.rgb.g, a.rgb.b);
                        const bB = rgbToBrightness(b.rgb.r, b.rgb.g, b.rgb.b);
                        return bA - bB;
                    });
                    break;
                case 'brightness-rev':
                    sorted.sort((a, b) => {
                        const bA = rgbToBrightness(a.rgb.r, a.rgb.g, a.rgb.b);
                        const bB = rgbToBrightness(b.rgb.r, b.rgb.g, b.rgb.b);
                        return bB - bA;
                    });
                    break;
                case 'hue':
                    sorted.sort((a, b) => {
                        const hA = rgbToHue(a.rgb.r, a.rgb.g, a.rgb.b);
                        const hB = rgbToHue(b.rgb.r, b.rgb.g, b.rgb.b);
                        return hA - hB;
                    });
                    break;
                case 'deviation':
                    sorted.sort((a, b) => a.colorDeviation - b.colorDeviation);
                    break;
                case 'deviation-rev':
                    sorted.sort((a, b) => b.colorDeviation - a.colorDeviation);
                    break;
                case 'red':
                    sorted.sort((a, b) => a.rgb.r - b.rgb.r);
                    break;
                case 'green':
                    sorted.sort((a, b) => a.rgb.g - b.rgb.g);
                    break;
                case 'blue':
                    sorted.sort((a, b) => a.rgb.b - b.rgb.b);
                    break;
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
        
        this._setStatus('scanStatus', '✅ Analysis view opened in new window');
    }
    
    _generateComparisonCSV() {
        if (!this.scanAnalysis || !this.referenceGridData) return '';
        
        let csv = '# Expected vs Measured Color Comparison\n';
        csv += `# Generated: ${new Date().toISOString()}\n`;
        csv += '#\n';
        csv += 'Index,Row,Col,Sequence,Expected_R,Expected_G,Expected_B,Measured_R,Measured_G,Measured_B,Delta_E,Std_R,Std_G,Std_B,Pixels_Sampled\n';
        
        this.scanAnalysis.forEach(tile => {
            // Get expected color from simulation
            const expectedColor = simColour(tile.sequence, this.referenceGridData.colours);
            
            // Calculate Delta E (color difference)
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
    
    _exportQuantizationConfigAction() {
        if (!this.quantizationConfig) {
            this._setStatus('scanStatus', '❌ Analyze scan first');
            return;
        }
        
        const json = JSON.stringify(this.quantizationConfig, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.quantizationConfig.paletteName}-quantization-config-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this._setStatus('scanStatus', `✅ Exported quantization config (${this.quantizationConfig.colorMap.length} colors)`);
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
    
    _exportGridCSVAction() {
        if (!this.gridData) {
            this._setStatus('gridStatus', '❌ Generate grid first');
            return;
        }
        
        const gridsToExport = this.splitGrids || [this.gridData];
        
        gridsToExport.forEach((grid, index) => {
            // Generate CSV content
            const csv = exportGridCSV(grid);
            
            // Trigger download with systematic filename
            const filename = this._generateGridFilename(
                grid, 
                this.splitGrids ? index + 1 : null, 
                this.splitGrids ? gridsToExport.length : null, 
                'csv'
            );
            downloadCSV(csv, filename);
        });
        
        const count = gridsToExport.length;
        this._setStatus('gridStatus', `✅ Exported ${count} grid CSV${count > 1 ? 's' : ''}`);
    }
    
    _exportComparisonCSVAction() {
        if (!this.scanAnalysis || !this.referenceGridData) {
            this._setStatus('scanStatus', '❌ Analyze scan first');
            return;
        }
        
        // Generate comparison CSV
        const csv = this._generateComparisonCSV();
        
        // Generate filename: cal-{colors}c{layers}L-{rows}x{cols}-comparison-YYYYMMDD.csv
        const date = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const filename = `cal-${this.referenceGridData.colours.length}c${this.referenceGridData.layerCount}L-${this.referenceGridData.rows}x${this.referenceGridData.cols}-comparison-${date}.csv`;
        
        // Trigger download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        this._setStatus('scanStatus', `✅ Exported ${filename}`);        
        this._setStatus('scanStatus', '✅ Comparison CSV exported');
    }
    
    // Grid storage and loading for SCAN tab
    _saveGridToLocalStorage() {
        try {
            const gridDataToSave = {
                sequences: this.gridData.sequences,
                colours: this.gridData.colours,
                rows: this.gridData.rows,
                cols: this.gridData.cols,
                tileSize: this.gridData.tileSize,
                gap: this.gridData.gap,
                width: this.gridData.width,
                height: this.gridData.height,
                emptyCells: this.gridData.emptyCells,
                layerCount: this.gridData.layerCount,
                baseLayers: this.gridData.baseLayers,
                timestamp: Date.now()
            };
            localStorage.setItem('multifilament_last_grid', JSON.stringify(gridDataToSave));
            
            // Update project status bar
            this._updateProjectStatusBar();
        } catch (e) {
            console.error('Failed to save grid to localStorage:', e);
        }
    }
    
    _autoLoadLastGrid() {
        try {
            const saved = localStorage.getItem('multifilament_last_grid');
            if (saved) {
                const gridData = JSON.parse(saved);
                this.gridData = gridData;
                this.referenceGridData = gridData; // Set reference for overlay
                this.sequences = gridData.sequences;
                
                // Build sequence map
                this.sequenceMap = buildSequenceMap(
                    this.sequences,
                    gridData.colours,
                    gridData.cols,
                    { simColour, rgb_to_key }
                );
                
                const age = Math.round((Date.now() - gridData.timestamp) / 1000 / 60);
                this._setStatus('gridLoadStatus', 
                    `✅ Auto-loaded: ${gridData.colours.length}c${gridData.layerCount}L ${gridData.rows}×${gridData.cols} grid (${age}min ago)`
                );
                this._setStatus('scanStatus', 'Grid loaded. Upload scanned image and align overlay.');
                
                // Update project status bar
                this._updateProjectStatusBar();
                
                this.toolBase.draw();
            } else {
                this._setStatus('gridLoadStatus', 'No saved grid. Generate one in SOURCE tab or import CSV.');
                this._setStatus('scanStatus', 'Load a grid first, then upload scan image.');
            }
        } catch (e) {
            console.error('Failed to load grid from localStorage:', e);
            this._setStatus('gridLoadStatus', '❌ Failed to load saved grid');
        }
    }
    
    _useLastGridAction() {
        this._autoLoadLastGrid();
    }
    
    async _applySortToGridAction() {
        if (!this.referenceGridData) {
            this._setStatus('gridLoadStatus', '❌ No grid loaded to re-sort');
            return;
        }
        
        const values = this.toolBase.values;
        const newSortMethod = values.resortGrid || 'Layer Count';
        
        // Get unique sequences (without position data)
        const uniqueSequences = this.referenceGridData.sequences.filter(seq => seq && seq.length > 0);
        
        // Re-sort sequences
        const { sortSequences } = await import('../../shared/algorithms/combinatorics/sequences.js');
        const sortedSequences = sortSequences(uniqueSequences, newSortMethod);
        
        // Rebuild grid with new sequence order
        const { rows, cols, tileSize, gap, emptyCells, colours, layerCount, baseLayers, topLayers } = this.referenceGridData;
        const width = cols * (tileSize + gap) - gap;
        const height = rows * (tileSize + gap) - gap;
        
        this.referenceGridData = {
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
            topLayers,
            sortMethod: newSortMethod
        };
        
        // Also update gridData if it's the same grid
        if (this.gridData && this.gridData.sequences === this.referenceGridData.sequences) {
            this.gridData = { ...this.referenceGridData };
        }
        
        // Rebuild sequence map
        const { buildSequenceMap, simColour, rgb_to_key } = await import('../../shared/algorithms/color/color-utils.js');
        this.sequenceMap = buildSequenceMap(
            sortedSequences,
            colours,
            cols,
            { simColour, rgb_to_key }
        );
        
        this._setStatus('gridLoadStatus', `✅ Grid re-sorted: ${newSortMethod}`);
        this.toolBase.draw();
    }
    
    async _detectAndMigrateProject(zipData) {
        // Debug: List all files in ZIP
        console.log('📂 ZIP contents:');
        const allFiles = Object.keys(zipData.files);
        allFiles.forEach(path => {
            console.log(`  - ${path}`);
        });
        
        // Helper to find file in nested structure
        const findFile = (...patterns) => {
            for (const pattern of patterns) {
                // Try exact match first
                let file = zipData.file(pattern);
                if (file) return file;
                
                // Try pattern match in nested folders
                const match = allFiles.find(path => path.endsWith('/' + pattern) || path.endsWith('\\' + pattern));
                if (match) {
                    return zipData.file(match);
                }
            }
            return null;
        };
        
        // Try to detect version from manifest
        let version = null;
        let layout = null;
        let config = null;
        
        // Try to find and read config.json (might contain colors)
        const configFile = findFile('config.json', 'data/config.json');
        if (configFile) {
            try {
                const configText = await configFile.async('text');
                config = JSON.parse(configText);
                console.log(`📋 Config found:`, config);
                // Check different possible locations for color data
                const colorCount = config.filaments?.length || config.colours?.length || config.palette?.length || 0;
                console.log(`📋 Config colors:`, colorCount);
                if (config.filaments) {
                    console.log('📋 Filaments:', config.filaments.map(f => f.name || f.n));
                }
            } catch (err) {
                console.warn('Could not parse config.json');
            }
        }
        
        // Try to find manifest
        const manifestFile = findFile('manifest.json', 'data/manifest.json');
        if (manifestFile) {
            try {
                const manifestText = await manifestFile.async('text');
                const manifest = JSON.parse(manifestText);
                version = manifest.version || manifest.toolVersion || '1.0.0';
                console.log(`📋 Manifest found, version: ${version}`);
            } catch (err) {
                console.warn('Could not parse manifest, assuming v1.0.0');
                version = '1.0.0';
            }
        }
        
        // Try to load grid layout
        const layoutFile = findFile('grid-layout.json', 'data/grid-layout.json', 'layout.json');
        
        if (layoutFile) {
            console.log(`📋 Layout file found: ${layoutFile.name}`);
            const layoutText = await layoutFile.async('text');
            layout = JSON.parse(layoutText);
            
            // Detect version from layout structure if not in manifest
            if (!version) {
                if (layout.version) {
                    version = layout.version;
                } else if (layout.sortMethod) {
                    version = '1.1.0'; // Has sortMethod
                } else if (layout.baseLayers !== undefined) {
                    version = '1.0.5'; // Has baseLayers
                } else {
                    version = '1.0.0'; // Original
                }
            }
        } else {
            // Very old format or CSV-only export - try to reconstruct from CSV
            const csvFile = findFile('sequences.csv', 'data/sequences.csv', 'grid.csv', 'data/grid.csv');
            
            if (csvFile) {
                console.log(`📋 CSV file found: ${csvFile.name}, reconstructing layout...`);
                const csvText = await csvFile.async('text');
                layout = await this._reconstructLayoutFromCSV(csvText);
                version = '0.9.0'; // Pre-layout format
            } else {
                console.error('❌ Could not find any grid data files in ZIP');
                console.log('Available files:', allFiles);
                throw new Error('Invalid project: no grid data files found. ZIP may be corrupt or incompatible.');
            }
        }
        
        // Apply migrations based on version
        layout = this._migrateLayout(layout, version, config);
        
        // If palette is still empty after migration, infer from sequences
        if (!layout.palette || layout.palette.length === 0) {
            console.warn('⚠️ No palette found after migration, inferring from sequences...');
            const filenameFromZip = Object.keys(zipData.files)[0].split('/')[0]; // Get root folder name
            const filenameData = this._parseFilename(filenameFromZip);
            layout.palette = this._inferPaletteFromSequences(layout.tiles, filenameData);
        }
        
        return { layout, version };
    }
    
    async _reconstructLayoutFromCSV(csvContent) {
        // Reconstruct layout from old CSV-only exports
        const { parseGridCSV } = await import('../../shared/algorithms/data/csv-export.js');
        const parsed = parseGridCSV(csvContent);
        
        return {
            version: '0.9.0',
            layerCount: parsed.layerCount || 4,
            baseLayers: parsed.baseLayers || 3,
            topLayers: parsed.topLayers || 0,
            sortMethod: parsed.sortMethod || 'Layer Count',
            gridSize: {
                rows: parsed.rows,
                cols: parsed.cols
            },
            dimensions: {
                width: parsed.cols * ((parsed.tileSize || 10) + (parsed.gap || 1)) - (parsed.gap || 1),
                height: parsed.rows * ((parsed.tileSize || 10) + (parsed.gap || 1)) - (parsed.gap || 1)
            },
            tileSize: parsed.tileSize || 10,
            gap: parsed.gap || 1,
            palette: parsed.colourNames.map(name => {
                const found = FILAMENT_COLOURS.find(c => c.n === name);
                return found ? { name: found.n, hex: found.h } : { name, hex: '#808080' };
            }),
            tiles: parsed.sequences.map((seq, index) => ({
                index,
                row: Math.floor(index / parsed.cols),
                col: index % parsed.cols,
                sequence: seq,
                isEmpty: false
            }))
        };
    }
    
    /**
     * Infer color palette from sequences when not provided in layout/config
     */
    _inferPaletteFromSequences(tiles, filenameData) {
        console.log('🎨 Inferring palette from sequences...');
        
        // Find max color index used across all sequences
        let maxIndex = 0;
        tiles.forEach(tile => {
            if (tile.sequence) {
                const max = Math.max(...tile.sequence);
                if (max > maxIndex) maxIndex = max;
            }
        });
        
        const colorCount = maxIndex; // e.g. if max is 4, we have colors 1-4
        console.log(`🎨 Found ${colorCount} colors in sequences (indices 1-${maxIndex})`);
        
        // Try to get color names from filename
        if (filenameData && filenameData.colors === colorCount) {
            console.log('✅ Filename matches inferred color count');
        }
        
        // Build palette from our known filament set
        // Default to first N colors from FILAMENT_COLOURS
        const palette = [];
        for (let i = 1; i <= colorCount; i++) {
            const filament = FILAMENT_COLOURS[i - 1] || { n: `Color ${i}`, h: '#808080' };
            palette.push({ name: filament.n, hex: filament.h });
        }
        
        console.log('🎨 Inferred palette:', palette);
        return palette;
    }
    
    _migrateLayout(layout, fromVersion, config) {
        // Apply migrations to bring old layouts up to current format
        const migrations = {
            '0.9.0': (data, cfg) => {
                // Already reconstructed from CSV, just ensure all fields exist
                return {
                    ...data,
                    version: '1.2.0',
                    sortMethod: data.sortMethod || 'Layer Count',
                    baseLayers: data.baseLayers || 3,
                    topLayers: data.topLayers || 0
                };
            },
            '1.0.0': (data, cfg) => {
                // Add sortMethod (introduced in v1.1.0)
                // Old v1.0.0 format stores colors in config.json
                let paletteSource = data.palette || data.colours || [];
                
                // Try config.json if layout doesn't have palette
                if (paletteSource.length === 0 && cfg) {
                    if (cfg.filaments && Array.isArray(cfg.filaments)) {
                        // Modern config format: { filaments: [{ name, hex, index }] }
                        paletteSource = cfg.filaments;
                        console.log('🔄 Using config.filaments:', cfg.filaments.map(f => f.name || f.n));
                    } else if (cfg.colours && Array.isArray(cfg.colours)) {
                        // Old config format: { colours: [{ n, h }] }
                        paletteSource = cfg.colours;
                        console.log('🔄 Using config.colours');
                    }
                }
                
                console.log('🔄 Migrating v1.0.0: palette source has', paletteSource.length, 'colors');
                return {
                    ...data,
                    version: '1.2.0',
                    sortMethod: data.sortMethod || 'Layer Count',
                    baseLayers: data.baseLayers || 3,
                    topLayers: data.topLayers || 0,
                    // Ensure palette has both name and hex
                    palette: paletteSource.map(p => ({
                        name: p.name || p.n || 'Unknown',
                        hex: p.hex || p.h || '#808080'
                    })),
                    // Ensure gridSize exists (might be missing in old format)
                    gridSize: data.gridSize || {
                        rows: data.dimensions?.rows || data.rows || 0,
                        cols: data.dimensions?.cols || data.cols || 0
                    },
                    // Ensure dimensions exists
                    dimensions: data.dimensions || {
                        width: data.width || 0,
                        height: data.height || 0
                    },
                    // Ensure tileSize and gap exist at top level
                    tileSize: data.tileSize || data.dimensions?.tileSize || 10,
                    gap: data.gap !== undefined ? data.gap : (data.dimensions?.gap !== undefined ? data.dimensions.gap : 1),
                    // Ensure layerCount exists
                    layerCount: data.layerCount || data.tiles?.[0]?.sequence?.length || 4
                };
            },
            '1.0.5': (data, cfg) => {
                // Add sortMethod and topLayers
                let paletteSource = data.palette || data.colours || [];
                if (paletteSource.length === 0 && cfg) {
                    paletteSource = cfg.filaments || cfg.colours || [];
                }
                return {
                    ...data,
                    version: '1.2.0',
                    sortMethod: data.sortMethod || 'Layer Count',
                    topLayers: data.topLayers || 0,
                    // Normalize palette format
                    palette: paletteSource.map(p => ({
                        name: p.name || p.n || 'Unknown',
                        hex: p.hex || p.h || '#808080'
                    })),
                    // Ensure gridSize exists
                    gridSize: data.gridSize || {
                        rows: data.dimensions?.rows || data.rows || 0,
                        cols: data.dimensions?.cols || data.cols || 0
                    },
                    // Ensure dimensions exists
                    dimensions: data.dimensions || {
                        width: data.width || 0,
                        height: data.height || 0
                    },
                    tileSize: data.tileSize || data.dimensions?.tileSize || 10,
                    gap: data.gap !== undefined ? data.gap : (data.dimensions?.gap !== undefined ? data.dimensions.gap : 1),
                    layerCount: data.layerCount || data.tiles?.[0]?.sequence?.length || 4
                };
            },
            '1.1.0': (data, cfg) => {
                // Add topLayers
                let paletteSource = data.palette || data.colours || [];
                if (paletteSource.length === 0 && cfg) {
                    paletteSource = cfg.filaments || cfg.colours || [];
                }
                return {
                    ...data,
                    version: '1.2.0',
                    topLayers: data.topLayers || 0,
                    // Normalize palette format
                    palette: paletteSource.map(p => ({
                        name: p.name || p.n || 'Unknown',
                        hex: p.hex || p.h || '#808080'
                    })),
                    gridSize: data.gridSize || {
                        rows: data.dimensions?.rows || data.rows || 0,
                        cols: data.dimensions?.cols || data.cols || 0
                    },
                    dimensions: data.dimensions || {
                        width: data.width || 0,
                        height: data.height || 0
                    },
                    tileSize: data.tileSize || data.dimensions?.tileSize || 10,
                    gap: data.gap !== undefined ? data.gap : (data.dimensions?.gap !== undefined ? data.dimensions.gap : 1),
                    layerCount: data.layerCount || data.tiles?.[0]?.sequence?.length || 4
                };
            },
            '1.2.0': (data, cfg) => {
                // Current version, no migration needed
                return data;
            }
        };
        
        // Find closest migration path
        const versionOrder = ['0.9.0', '1.0.0', '1.0.5', '1.1.0', '1.2.0'];
        const fromIndex = versionOrder.findIndex(v => fromVersion.startsWith(v));
        
        if (fromIndex === -1) {
            console.warn(`Unknown version ${fromVersion}, assuming 1.0.0`);
            return migrations['1.0.0'](layout, config);
        }
        
        // Apply migrations in sequence
        let migrated = layout;
        for (let i = fromIndex; i < versionOrder.length; i++) {
            const version = versionOrder[i];
            if (migrations[version]) {
                migrated = migrations[version](migrated, config);
            }
        }
        
        return migrated;
    }
    
    _checkMissingSettings(layout, version, filenameData) {
        const missing = [];
        
        // Check for critical settings that affect output
        if (!layout.sortMethod) {
            missing.push({
                name: 'Sort Method',
                field: 'sortMethod',
                suggestion: 'Layer Count',
                reason: 'Most common sorting method for initial calibration',
                options: ['Layer Count', 'Base Color', 'Top Color', 'Complexity', 'Lexicographic'],
                source: 'default'
            });
        }
        
        if (layout.topLayers === undefined) {
            missing.push({
                name: 'Top Layers',
                field: 'topLayers',
                suggestion: 0,
                reason: 'Original exports had no top layers (feature added later)',
                note: 'Keep at 0 to match original print',
                source: 'default'
            });
        }
        
        if (layout.baseLayers === undefined) {
            missing.push({
                name: 'Base Layers',
                field: 'baseLayers',
                suggestion: 3,
                reason: 'Standard base layer count for smooth first layer',
                note: 'Adjust if your print used different value',
                source: 'default'
            });
        }
        
        // Gap is NOT in filename, so if missing we must use default
        if (layout.gap === undefined) {
            missing.push({
                name: 'Gap',
                field: 'gap',
                suggestion: 1,
                reason: 'Gap size not stored in old exports, using standard 1mm',
                note: 'Adjust if your print used 0mm or 2mm gap',
                source: 'default'
            });
        }
        
        // Check if filename data matches layout data (validation)
        if (filenameData) {
            if (layout.layerCount !== filenameData.layers) {
                console.warn(`⚠️ Filename says ${filenameData.layers}L but layout has ${layout.layerCount}L`);
            }
            if (layout.gridSize.rows !== filenameData.rows || layout.gridSize.cols !== filenameData.cols) {
                console.warn(`⚠️ Filename says ${filenameData.rows}×${filenameData.cols} but layout has ${layout.gridSize.rows}×${layout.gridSize.cols}`);
            }
            if (layout.tileSize !== filenameData.tileSize) {
                console.warn(`⚠️ Filename says ${filenameData.tileSize}mm but layout has ${layout.tileSize}mm`);
            }
        }
        
        return missing;
    }
    
    async _promptForMissingSettings(missingSettings, layout, filenameData) {
        // Separate critical from auto-fixable
        const criticalSettings = missingSettings.filter(s => s.note && s.note.includes('Verify'));
        const autoFixable = missingSettings.filter(s => !s.note || !s.note.includes('Verify'));
        
        // Auto-apply non-critical defaults
        autoFixable.forEach(setting => {
            if (layout[setting.field] === undefined) {
                layout[setting.field] = setting.suggestion;
                console.log(`✅ Auto-applied: ${setting.field} = ${setting.suggestion} (${setting.reason})`);
            }
        });
        
        // Only prompt if there are critical settings to verify
        if (criticalSettings.length > 0) {
            let message = '⚠️ IMPORTED PROJECT NEEDS VERIFICATION\n\n';
            message += 'The following settings could not be determined from the file.\n';
            message += 'Please verify these match your original print:\n\n';
            
            criticalSettings.forEach((setting, i) => {
                message += `${i + 1}. ${setting.name}: ${setting.suggestion}\n`;
                message += `   ${setting.note}\n\n`;
            });
            
            message += 'Click OK to proceed with these values, or Cancel to abort.';
            
            const confirmed = confirm(message);
            if (!confirmed) {
                throw new Error('Import cancelled by user - settings need verification');
            }
            
            // Apply critical defaults if user confirmed
            criticalSettings.forEach(setting => {
                if (layout[setting.field] === undefined) {
                    layout[setting.field] = setting.suggestion;
                }
            });
        } else {
            console.log('✅ All missing settings auto-applied with defaults');
        }
    }
    
    async _applyImportedState(layout) {
        console.log('🔄 Applying imported state by storing values and rebuilding UI...');

        // Store all imported values in memory
        this.importedState = {
            layerCount: layout.layerCount,
            layerHeight: layout.layerHeight || 0.08,
            tileSize: layout.tileSize,
            gap: layout.gap,
            baseLayers: layout.baseLayers || 0,
            topLayers: layout.topLayers || 0,
            sortMethod: layout.sortMethod || 'Layer Count',
            bedWidth: layout.constraints?.bedWidth || layout.dimensions?.width || 200,
            bedHeight: layout.constraints?.bedHeight || layout.dimensions?.height || 200,
            scanWidth: layout.constraints?.scanWidth || layout.constraints?.bedWidth || layout.dimensions?.width || 200,
            scanHeight: layout.constraints?.scanHeight || layout.constraints?.bedHeight || layout.dimensions?.height || 200,
            baseFilament: layout.baseFilament || (this.gridData.colours[0]?.n || 'Jade White'),
            topFilament: layout.topFilament || layout.baseFilament || (this.gridData.colours[0]?.n || 'Jade White'),
            gapFilament: layout.gapFilament || layout.baseFilament || (this.gridData.colours[0]?.n || 'Jade White'),
            gapFillOptions: layout.fillGaps ? ['Fill Gaps'] : []
        };
        
        console.log('📦 Stored imported state:', this.importedState);

        // Switch to SOURCE tab and rebuild with imported values
        if (this.currentTab !== 'SOURCE') {
            console.log('🔄 Switching to SOURCE tab...');
        }
        this.currentTab = 'SOURCE';
        
        // Rebuild ToolBase - it will pull from this.importedState via _getSourceSidebar
        console.log('🔨 Rebuilding ToolBase with imported values...');
        this._rebuildToolForTab('SOURCE');
        
        // Wait for rebuild
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Now manually update filament dropdowns since they depend on selectedFilaments
        console.log('🎨 Updating filament dropdowns...');
        this._updateFilamentDropdowns();
        
        // Keep imported state for other tabs to use, but mark it as applied
        this.importedStateApplied = true;
        
        console.log('✅ All UI state applied via rebuild - state persistent across tabs');
    }
    
    _displayLoadedGrid() {
        // Force immediate display of loaded grid on canvas
        if (!this.gridData || !this.toolBase) {
            console.warn('⚠️ Cannot display grid: missing gridData or toolBase');
            console.log('gridData exists:', !!this.gridData);
            console.log('toolBase exists:', !!this.toolBase);
            return;
        }
        
        console.log('🖼️ Displaying loaded grid on canvas...');
        console.log('Grid sequences:', this.gridData.sequences?.length);
        console.log('Current tab:', this.currentTab);
        
        // Ensure split grid info is cleared (we loaded a complete grid)
        this.splitGridInfo = null;
        this.splitGrids = null;
        
        // Trigger immediate draw
        if (this.toolBase.draw) {
            console.log('🎨 Calling toolBase.draw() immediately...');
            this.toolBase.draw();
            console.log('✅ Canvas draw triggered');
        } else {
            console.warn('⚠️ toolBase.draw is not available');
        }
        
        // Additional delayed draws to ensure UI catches up
        setTimeout(() => {
            if (this.toolBase && this.toolBase.draw) {
                console.log('🔄 Delayed draw 1 (100ms)...');
                this.toolBase.draw();
            }
        }, 100);
        
        setTimeout(() => {
            if (this.toolBase && this.toolBase.draw) {
                console.log('🔄 Delayed draw 2 (300ms)...');
                this.toolBase.draw();
            }
        }, 300);
        
        setTimeout(() => {
            if (this.toolBase && this.toolBase.draw) {
                console.log('🔄 Delayed draw 3 (600ms)...');
                this.toolBase.draw();
            }
        }, 600);
    }
    
    _parseFilename(filename) {
        // Parse filename: cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm[-gXofY]-YYYYMMDD[_HHMMSS].zip
        // Example: cal-4c4L-10x10-10mm-20260106.zip
        // Also handles: calibration-4c6L-78x70-3mm-20260106_131843.zip
        const match = filename.match(/(?:cal(?:ibration)?)-(\d+)c(\d+)L-(\d+)x(\d+)-(\d+)mm(?:-g(\d+)of(\d+))?-(\d{8})(?:_\d{6})?\.zip/);
        
        if (match) {
            return {
                colors: parseInt(match[1]),
                layers: parseInt(match[2]),
                rows: parseInt(match[3]),
                cols: parseInt(match[4]),
                tileSize: parseInt(match[5]),
                gridIndex: match[6] ? parseInt(match[6]) : null,
                totalGrids: match[7] ? parseInt(match[7]) : null,
                date: match[8]
            };
        }
        
        return null;
    }
    
    async _importProjectAction(file) {
        console.log('📥 Starting project import:', file.name);
        
        // Try to parse filename first (fallback data source)
        const filenameData = this._parseFilename(file.name);
        if (filenameData) {
            console.log('📝 Parsed from filename:', filenameData);
        } else {
            console.warn('⚠️ Could not parse filename, will rely on internal data');
        }
        
        try {
            this._setStatus('projectStatus', '⏳ Loading project...');
            
            // Read ZIP file
            console.log('📦 Loading JSZip...');
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            console.log('📂 Reading ZIP file...');
            const zipData = await zip.loadAsync(file);
            console.log('✅ ZIP loaded, files:', Object.keys(zipData.files).length);
            
            // Detect project version and migrate if needed
            console.log('🔍 Detecting project version...');
            const { layout, version } = await this._detectAndMigrateProject(zipData);
            
            if (version) {
                console.log(`📦 Project version detected: ${version}`);
            }
            
            console.log('📋 Reconstructing gridData from layout...');
            console.log('Full layout structure:', JSON.stringify(layout, null, 2));
            console.log('Layout palette:', layout.palette);
            console.log('Layout tiles count:', layout.tiles?.length);
            console.log('Layout gridSize:', layout.gridSize);
            console.log('Layout dimensions:', layout.dimensions);
            
            // Ensure palette exists (old formats might use "colours" instead)
            if (!layout.palette && layout.colours) {
                console.log('⚠️ Old format detected: using "colours" instead of "palette"');
                layout.palette = layout.colours.map(c => ({
                    name: c.n || c.name,
                    hex: c.h || c.hex
                }));
            }
            
            // Reconstruct gridData from layout
            const colours = layout.palette.map(p => ({
                h: p.hex || p.h,
                n: p.name || p.n
            }));
            console.log('Colours reconstructed:', colours.length);
            
            this.gridData = {
                sequences: layout.tiles.map(t => t.sequence),
                colours,
                rows: layout.gridSize.rows,
                cols: layout.gridSize.cols,
                tileSize: layout.tileSize || layout.dimensions?.tileSize || 10,
                gap: layout.gap !== undefined ? layout.gap : 1,
                width: layout.dimensions.width,
                height: layout.dimensions.height,
                emptyCells: layout.tiles
                    .filter(t => t.isEmpty)
                    .map(t => t.index),
                layerCount: layout.layerCount,
                baseLayers: layout.baseLayers || 3,
                topLayers: layout.topLayers || 0,
                sortMethod: layout.sortMethod || 'Layer Count',
                timestamp: Date.now()
            };
            
            console.log('✅ GridData reconstructed:', {
                sequences: this.gridData.sequences.length,
                colours: this.gridData.colours.length,
                rows: this.gridData.rows,
                cols: this.gridData.cols,
                tileSize: this.gridData.tileSize,
                gap: this.gridData.gap,
                width: this.gridData.width,
                height: this.gridData.height
            });
            
            this.referenceGridData = this.gridData;
            this.sequences = this.gridData.sequences;
            
            // Build sequence map for color simulation
            // Import only the functions we need for color simulation
            const { simColour, rgb_to_key } = await import('../../shared/algorithms/color/color-utils.js');
            
            // Store for later use (e.g., drawing expected colors)
            this.simColour = simColour;
            this.rgb_to_key = rgb_to_key;
            
            // Build a simple sequence map for rendering
            this.sequenceMap = new Map();
            this.sequences.forEach((seq, index) => {
                const color = simColour(seq, colours);
                const key = rgb_to_key(color);
                if (!this.sequenceMap.has(key)) {
                    this.sequenceMap.set(key, {
                        sequence: seq,
                        simulated: color,
                        indices: []
                    });
                }
                this.sequenceMap.get(key).indices.push(index);
            });
            
            // Check for missing settings and prompt user
            console.log('⚙️ Checking for missing settings...');
            const missingSettings = this._checkMissingSettings(layout, version, filenameData);
            console.log('Missing settings:', missingSettings.length);
            if (missingSettings.length > 0) {
                console.log('⚠️ Prompting user for missing settings...');
                await this._promptForMissingSettings(missingSettings, layout, filenameData);
            }
            
            // Update UI with loaded data
            console.log('🎨 Updating filament selection...');
            this.selectedFilaments = colours.map(c => 
                FILAMENT_COLOURS.findIndex(fc => fc.n === c.n)
            ).filter(i => i !== -1);
            console.log('Selected filaments:', this.selectedFilaments);
            
            // Force complete UI rebuild
            console.log('🔄 Applying imported state to UI...');
            await this._applyImportedState(layout);
            console.log('✅ UI state applied');
            
            // Store in localStorage for "Use Last Generated Grid"
            localStorage.setItem('multifilament_last_grid', JSON.stringify(this.gridData));
            
            // Update project status bar
            this._updateProjectStatusBar();
            
            // Display success message with version info
            const fileCount = Object.keys(zipData.files).length;
            const versionInfo = version ? ` [v${version}]` : '';
            let statusMsg = `✅ Project loaded: ${colours.length}c${layout.layerCount}L ${layout.gridSize.rows}×${layout.gridSize.cols} grid${versionInfo} (${fileCount} files)`;
            
            if (version && !version.startsWith('1.2')) {
                statusMsg = `✅ Project loaded & migrated: ${colours.length}c${layout.layerCount}L ${layout.gridSize.rows}×${layout.gridSize.cols} (v${version} → v1.2.0)`;
            }
            
            this._setStatus('projectStatus', statusMsg);
            this._setStatus('gridStatus', `✅ Grid loaded from project (Sort: ${this.gridData.sortMethod})`);
            
            // Update sequence count display
            console.log('📊 Updating sequence count...');
            this._updateSequenceCount();
            
            // Check for scan data in ZIP
            console.log('🔍 Checking for scan analysis data...');
            const scanFolder = Object.keys(zipData.files).find(k => k.includes('/scans/'));
            if (scanFolder) {
                console.log('📸 Scan data found, loading...');
                await this._loadScanDataFromZip(zipData);
            }
            
            // Force canvas to show the loaded grid immediately
            console.log('🎨 Forcing canvas display of loaded grid...');
            console.log('Current tab:', this.currentTab);
            console.log('ToolBase exists:', !!this.toolBase);
            console.log('GridData exists:', !!this.gridData);
            
            // Trigger immediate and delayed redraws
            this._displayLoadedGrid();
            
            console.log('✅✅✅ Import process complete!');
            console.log('Grid data summary:', {
                sequences: this.gridData.sequences.length,
                colors: this.gridData.colours.length,
                dimensions: `${this.gridData.rows}×${this.gridData.cols}`,
                tileSize: this.gridData.tileSize,
                gap: this.gridData.gap
            });
            
        } catch (err) {
            this._setStatus('projectStatus', `❌ Import failed: ${err.message}`);
            console.error('Project import error:', err);
        }
    }
    
    async _loadScanDataFromZip(zipData) {
        try {
            // Helper to find files in nested ZIP structures
            const findFile = (endsWith) => {
                const fileKey = Object.keys(zipData.files).find(k => k.endsWith(endsWith));
                return fileKey ? zipData.files[fileKey] : null;
            };
            
            // Load scan image
            const scanFile = findFile('.png') || findFile('.jpg') || findFile('.jpeg');
            if (scanFile) {
                console.log('📸 Loading scan image...');
                const scanBlob = await scanFile.async('blob');
                const scanUrl = URL.createObjectURL(scanBlob);
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = scanUrl;
                });
                
                this.scanImageElement = img;
                console.log(`✅ Scan image loaded: ${img.width}×${img.height}px`);
                
                // If on SCAN tab, display it
                if (this.currentTab === 'SCAN') {
                    const canvas = this.toolBase.canvas;
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    
                    this._autoCalculateGridOverlay();
                    const values = this.toolBase.values;
                    this._applyScanDisplayMode(values.scanDisplayMode || 'fit');
                }
            }
            
            // Load analysis data
            const analysisFile = findFile('analysis.json');
            if (analysisFile) {
                console.log('📊 Loading analysis data...');
                const analysisText = await analysisFile.async('text');
                const analysisData = JSON.parse(analysisText);
                this.scanAnalysis = analysisData.tiles;
                console.log(`✅ Analysis data loaded: ${this.scanAnalysis.length} tiles`);
                
                this._setStatus('scanStatus', `✅ Loaded scan analysis (${this.scanAnalysis.length} tiles, avg deviation: ${analysisData.summary.averageDeviation})`);
            }
            
            // Load quantization config
            const quantFile = findFile('quantization-config.json');
            if (quantFile) {
                console.log('🎨 Loading quantization config...');
                const quantText = await quantFile.async('text');
                this.quantizationConfig = JSON.parse(quantText);
                console.log(`✅ Quantization config loaded: ${Object.keys(this.quantizationConfig.colorMap).length} colors`);
            }
            
            // Load calibrated palette
            const paletteFile = findFile('calibrated-palette.gpl');
            if (paletteFile) {
                console.log('🎨 Loading calibrated palette...');
                const paletteText = await paletteFile.async('text');
                this.scannedPalette = paletteText;
                console.log('✅ Calibrated palette loaded');
            }
            
            console.log('✅ All scan data loaded from ZIP');
        } catch (err) {
            console.warn('⚠️ Error loading scan data from ZIP:', err);
        }
    }
    
    _importGridCSVAction(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvContent = e.target.result;
                const parsedData = parseGridCSV(csvContent);
                
                // Match colour names to our palette
                const colours = [];
                parsedData.colourNames.forEach(name => {
                    const found = FILAMENT_COLOURS.find(c => c.n === name);
                    if (found) {
                        colours.push(found);
                    } else {
                        throw new Error(`Unknown colour: ${name}. Ensure CSV uses exact colour names from palette.`);
                    }
                });
                
                // Use parsed metadata or infer from sequences
                const layerCount = parsedData.layerCount || parsedData.sequences[0]?.length || 4;
                const tileSize = parsedData.tileSize || 10;
                const gap = parsedData.gap || 1;
                const baseLayers = parsedData.baseLayers || 3;
                const topLayers = parsedData.topLayers || 0;
                const sortMethod = parsedData.sortMethod || 'Layer Count';
                const width = parsedData.cols * (tileSize + gap) - gap;
                const height = parsedData.rows * (tileSize + gap) - gap;
                
                // Reconstruct complete grid data
                this.gridData = {
                    sequences: parsedData.sequences,
                    colours,
                    rows: parsedData.rows,
                    cols: parsedData.cols,
                    tileSize,
                    gap,
                    width,
                    height,
                    emptyCells: parsedData.emptyCells,
                    layerCount,
                    baseLayers,
                    topLayers,
                    sortMethod
                };
                
                this.referenceGridData = this.gridData; // Set reference for overlay
                this.sequences = parsedData.sequences;
                
                // Build sequence map
                this.sequenceMap = buildSequenceMap(
                    this.sequences,
                    colours,
                    parsedData.cols,
                    { simColour, rgb_to_key }
                );
                
                // Update re-sort dropdown to match imported sort method
                if (this.toolBase) {
                    const resortDropdown = this.toolBase.components.get('resortGrid');
                    if (resortDropdown && typeof resortDropdown.setValue === 'function') {
                        resortDropdown.setValue(sortMethod);
                    }
                }
                
                this._setStatus('gridLoadStatus', 
                    `✅ Imported: ${colours.length}c${layerCount}L ${parsedData.rows}×${parsedData.cols} grid (Sort: ${sortMethod})`
                );
                this._setStatus('scanStatus', 'Grid loaded. Upload scanned image and align overlay.');
                
                // Update project status bar
                this._updateProjectStatusBar();
                
                this.toolBase.draw();
            } catch (err) {
                this._setStatus('gridLoadStatus', `❌ Import failed: ${err.message}`);
                console.error('CSV import error:', err);
            }
        };
        reader.readAsText(file);
    }
    
    _handleCanvasClick(event) {
        if (!this.gridData || !this.gridRenderData) return;
        
        const canvas = this.toolBase.canvas;
        const rect = canvas.getBoundingClientRect();
        
        // Get click position in CSS pixels
        const cssX = event.clientX - rect.left;
        const cssY = event.clientY - rect.top;
        
        // Convert to canvas pixels (accounting for canvas internal resolution)
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const canvasX = cssX * scaleX;
        const canvasY = cssY * scaleY;
        
        // Get grid render data (set during draw)
        const { cellSize, offsetX, offsetY, rows, cols, scale } = this.gridRenderData;
        
        // Convert to grid coordinates
        const gridX = (canvasX - offsetX) / scale;
        const gridY = (canvasY - offsetY) / scale;
        const col = Math.floor(gridX / (this.gridData.tileSize + this.gridData.gap));
        const row = Math.floor(gridY / (this.gridData.tileSize + this.gridData.gap));
        
        // Check bounds
        if (col < 0 || col >= cols || row < 0 || row >= rows) return;
        
        const index = row * cols + col;
        
        // Check if empty cell
        if (this.gridData.emptyCells && this.gridData.emptyCells.includes(index)) {
            this._showSequencePopup(null, index, row, col);
            return;
        }
        
        // Check if valid sequence
        if (index >= this.gridData.sequences.length) return;
        
        const sequence = this.gridData.sequences[index];
        this._showSequencePopup(sequence, index, row, col);
    }
    
    _showSequencePopup(sequence, index, row, col) {
        // Create popup element if it doesn't exist
        if (!this.sequencePopup) {
            this.sequencePopup = document.createElement('div');
            this.sequencePopup.className = 'sequence-popup';
            this.sequencePopup.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--vga-black);
                border: 2px solid var(--vga-white);
                padding: calc(var(--f) * 1);
                min-width: 300px;
                z-index: 1000;
                font-family: 'Atkinson Hyperlegible', monospace;
                color: var(--vga-white);
            `;
            document.body.appendChild(this.sequencePopup);
        }
        
        // Build popup content
        let html = `<h4 style="margin: 0 0 calc(var(--f) * 0.5) 0;">Grid Position: [${row}, ${col}] (Index: ${index})</h4>`;
        
        if (!sequence) {
            html += '<p style="margin: 0; color: var(--vga-grey);">Empty Cell</p>';
        } else {
            const color = simColour(sequence, this.gridData.colours);
            html += `<p style="margin: calc(var(--f) * 0.3) 0;"><strong>RGB:</strong> (${color.r}, ${color.g}, ${color.b})</p>`;
            html += `<p style="margin: calc(var(--f) * 0.3) 0;"><strong>Sequence:</strong> [${sequence.join(', ')}]</p>`;
            html += '<div style="margin-top: calc(var(--f) * 0.5);">';
            html += '<strong>Layers (bottom to top):</strong>';
            sequence.forEach((filIdx, layerIdx) => {
                if (filIdx === 0) {
                    html += `<div style="padding: calc(var(--f) * 0.2); margin: 2px 0; background: var(--vga-grey); color: var(--vga-black);">Layer ${layerIdx}: Empty</div>`;
                } else {
                    const filColor = this.gridData.colours[filIdx - 1];
                    html += `<div style="padding: calc(var(--f) * 0.2); margin: 2px 0; background: ${filColor.h}; color: var(--vga-white);">Layer ${layerIdx}: ${filColor.n}</div>`;
                }
            });
            html += '</div>';
        }
        
        html += `<button style="margin-top: calc(var(--f) * 0.5); padding: calc(var(--f) * 0.3); background: var(--vga-white); color: var(--vga-black); border: none; cursor: pointer;" onclick="this.parentElement.style.display='none'">Close</button>`;
        
        this.sequencePopup.innerHTML = html;
        this.sequencePopup.style.display = 'block';
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
            
            // Resize canvas to EXACTLY match the image dimensions
            const canvas = this.toolBase.canvas;
            const oldWidth = canvas.width;
            const oldHeight = canvas.height;
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            console.log(`📐 Canvas resized: ${oldWidth}×${oldHeight} → ${img.width}×${img.height}px`);
            console.log(`   Image natural size: ${img.naturalWidth}×${img.naturalHeight}px`);
            
            // Apply display mode (fit by default)
            const mode = this.scanDisplayMode || 'fit';
            console.log(`   Applying display mode: ${mode}`);
            this._applyScanDisplayMode(mode);
            
            // Calculate grid positioning if grid exists
            if (this.referenceGridData) {
                console.log(`   Calculating grid overlay...`);
                this._autoCalculateGridOverlay();
            }
            
            console.log(`   Triggering redraw...`);
            this.toolBase.draw();
            
            const sizeKB = (file.size / 1024).toFixed(0);
            this._setStatus('scanImageStatus', `✅ Loaded ${img.width}×${img.height}px (${sizeKB}KB) | Mode: ${mode}`);
        };
        img.onerror = (err) => {
            console.error('❌ Image load error:', err);
            this._setStatus('scanImageStatus', '❌ Failed to load image');
        };
        img.src = URL.createObjectURL(file);
    }
    
    _autoCalculateGridOverlay() {
        // Get scan physical dimensions from SOURCE tab
        const values = this.toolBase?.values || {};
        const scanWidth_mm = values.scanWidth || this.importedState?.scanWidth || 210;
        const scanHeight_mm = values.scanHeight || this.importedState?.scanHeight || 297;
        
        if (!this.scanImageElement || !this.referenceGridData) {
            console.warn('Cannot auto-calculate: missing scan image or grid data');
            return;
        }
        
        const gridData = this.referenceGridData;
        
        console.log('🎯 Auto-calculating grid overlay:');
        console.log('  Scan physical:', scanWidth_mm, '×', scanHeight_mm, 'mm');
        console.log('  Scan image:', this.scanImageElement.width, '×', this.scanImageElement.height, 'px');
        console.log('  Grid physical:', gridData.width, '×', gridData.height, 'mm');
        
        // Calculate pixels per mm in the scan image
        const pxPerMm = this.scanImageElement.width / scanWidth_mm;
        console.log('  Scan resolution:', pxPerMm.toFixed(3), 'px/mm');
        
        // Calculate grid size in pixels (EXACT!)
        const gridWidth_px = gridData.width * pxPerMm;
        const gridHeight_px = gridData.height * pxPerMm;
        console.log('  Grid in pixels:', gridWidth_px.toFixed(1), '×', gridHeight_px.toFixed(1));
        
        // Calculate grid position (centered on scan)
        const gridX = (this.scanImageElement.width - gridWidth_px) / 2;
        const gridY = (this.scanImageElement.height - gridHeight_px) / 2;
        console.log('  Grid position:', gridX.toFixed(1), ',', gridY.toFixed(1));
        
        // Store calculated dimensions
        this.gridCalculated = {
            pxPerMm,
            gridWidth_px,
            gridHeight_px,
            gridX,
            gridY
        };
        
        // Reset user adjustments - store grid as 4 corner points for transform
        this.gridAlignment = {
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
            flipped: false,
            autoCalculated: true,
            // Corner points (top-left, top-right, bottom-right, bottom-left)
            corners: [
                { x: gridX, y: gridY },                                    // TL
                { x: gridX + gridWidth_px, y: gridY },                     // TR
                { x: gridX + gridWidth_px, y: gridY + gridHeight_px },     // BR
                { x: gridX, y: gridY + gridHeight_px }                     // BL
            ]
        };
        
        // Update UI controls
        const offsetXComp = this.toolBase.components.get('gridOffsetX');
        const offsetYComp = this.toolBase.components.get('gridOffsetY');
        const rotationComp = this.toolBase.components.get('gridRotation');
        
        if (offsetXComp && typeof offsetXComp.setValue === 'function') offsetXComp.setValue(0);
        if (offsetYComp && typeof offsetYComp.setValue === 'function') offsetYComp.setValue(0);
        if (rotationComp && typeof rotationComp.setValue === 'function') rotationComp.setValue(0);
        
        console.log('✅ Grid overlay auto-calculated');
    }
    
    _viewReferenceGridAction() {
        if (!this.referenceGridData) {
            this._setStatus('gridLoadStatus', '❌ No reference grid loaded');
            return;
        }
        
        // Create a temporary canvas to show the reference grid
        const tempCanvas = document.createElement('canvas');
        const gridWidth = this.referenceGridData.width;
        const gridHeight = this.referenceGridData.height;
        const dpi = 150;
        const widthInches = gridWidth / 25.4;
        const heightInches = gridHeight / 25.4;
        
        tempCanvas.width = Math.round(widthInches * dpi);
        tempCanvas.height = Math.round(heightInches * dpi);
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw reference grid
        this._drawCalibrationGridDetailed(tempCtx, tempCanvas, this.referenceGridData);
        
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
    }
    
    _autoAlignAction() {
        // Check prerequisites
        if (!this.scanImageElement) {
            this._setStatus('scanStatus', '❌ Load scan image first');
            return;
        }
        if (!this.referenceGridData) {
            this._setStatus('scanStatus', '❌ Load grid first');
            return;
        }
        if (!this.toolBase || !this.toolBase.canvas) {
            this._setStatus('scanStatus', '❌ Canvas not available');
            return;
        }
        
        // Get scan physical dimensions from SOURCE tab settings
        const values = this.toolBase.values || {};
        const scanWidth_mm = values.scanWidth || this.importedState?.scanWidth || 210; // mm
        const scanHeight_mm = values.scanHeight || this.importedState?.scanHeight || 297; // mm
        
        const canvas = this.toolBase.canvas;
        const gridData = this.referenceGridData;
        
        console.log('🎯 CORRECTED Auto-align calculation:');
        console.log('  Grid physical size:', gridData.width, '×', gridData.height, 'mm');
        console.log('  Scan paper size:', scanWidth_mm, '×', scanHeight_mm, 'mm');
        console.log('  Scan image resolution:', this.scanImageElement.width, '×', this.scanImageElement.height, 'px');
        console.log('  Canvas size:', canvas.width, '×', canvas.height, 'px');
        
        // Step 1: How scan image fits on canvas (aspect ratio preserved)
        const scaleX = canvas.width / this.scanImageElement.width;
        const scaleY = canvas.height / this.scanImageElement.height;
        const displayScale = Math.min(scaleX, scaleY);
        
        const scanDrawWidth = this.scanImageElement.width * displayScale;
        const scanDrawHeight = this.scanImageElement.height * displayScale;
        const scanDrawX = (canvas.width - scanDrawWidth) / 2;
        const scanDrawY = (canvas.height - scanDrawHeight) / 2;
        
        console.log('  Scan displayed at:', scanDrawWidth.toFixed(1), '×', scanDrawHeight.toFixed(1), 'px');
        console.log('  Scan position on canvas:', scanDrawX.toFixed(1), ',', scanDrawY.toFixed(1));
        
        // Step 2: Pixels per mm in the DISPLAYED scan
        const pxPerMm_displayed = scanDrawWidth / scanWidth_mm;
        console.log('  Displayed resolution:', pxPerMm_displayed.toFixed(3), 'px/mm');
        
        // Step 3: Grid dimensions in DISPLAYED pixels (this is what overlay should be)
        const gridDisplayWidth = gridData.width * pxPerMm_displayed;
        const gridDisplayHeight = gridData.height * pxPerMm_displayed;
        console.log('  Grid should display as:', gridDisplayWidth.toFixed(1), '×', gridDisplayHeight.toFixed(1), 'px');
        
        // Step 4: Overlay scale = displayed px per mm
        // When we draw grid in mm units and apply this scale, it converts to displayed pixels
        const optimalScale = pxPerMm_displayed;
        console.log('  Overlay scale:', optimalScale.toFixed(3));
        
        // Step 5: Position grid centered on scan
        // Grid is centered on the scan paper, so offset from scan edge
        const gridOffsetX_mm = (scanWidth_mm - gridData.width) / 2;
        const gridOffsetY_mm = (scanHeight_mm - gridData.height) / 2;
        const gridOffsetX_px = gridOffsetX_mm * pxPerMm_displayed;
        const gridOffsetY_px = gridOffsetY_mm * pxPerMm_displayed;
        
        const optimalX = scanDrawX + gridOffsetX_px;
        const optimalY = scanDrawY + gridOffsetY_px;
        console.log('  Grid offset from scan edge:', gridOffsetX_mm.toFixed(1), '×', gridOffsetY_mm.toFixed(1), 'mm');
        console.log('  Grid position on canvas:', optimalX.toFixed(1), ',', optimalY.toFixed(1));
        
        // Verify grid stays within scan bounds
        const gridRight = optimalX + gridDisplayWidth;
        const gridBottom = optimalY + gridDisplayHeight;
        const scanRight = scanDrawX + scanDrawWidth;
        const scanBottom = scanDrawY + scanDrawHeight;
        
        if (gridRight > scanRight || gridBottom > scanBottom || optimalX < scanDrawX || optimalY < scanDrawY) {
            console.warn('⚠️ WARNING: Grid extends outside scan bounds!');
            console.warn('  Grid bounds:', optimalX.toFixed(1), ',', optimalY.toFixed(1), 'to', gridRight.toFixed(1), ',', gridBottom.toFixed(1));
            console.warn('  Scan bounds:', scanDrawX.toFixed(1), ',', scanDrawY.toFixed(1), 'to', scanRight.toFixed(1), ',', scanBottom.toFixed(1));
        } else {
            console.log('✅ Grid fits within scan bounds');
        }
        
        // Store grid calculations (no longer need to apply scale/position since canvas is actual size)
        this.gridCalculated = calc;
        
        this.toolBase.draw();
        this._setStatus('scanStatus', `✅ Grid auto-calculated: ${calc.pxPerMm.toFixed(2)} px/mm`);
    }
    
    _resetGridAlignment() {
        this.gridAlignment.offsetX = 0;
        this.gridAlignment.offsetY = 0;
        this.gridAlignment.rotation = 0;
        this.gridAlignment.flipped = false;
        
        // Update UI
        const offsetXComp = this.toolBase.components.get('gridOffsetX');
        const offsetYComp = this.toolBase.components.get('gridOffsetY');
        const rotationComp = this.toolBase.components.get('gridRotation');
        
        if (offsetXComp) offsetXComp.setValue(0);
        if (offsetYComp) offsetYComp.setValue(0);
        if (rotationComp) rotationComp.setValue(0);
        
        this.toolBase.draw();
        this._setStatus('scanStatus', '✅ Grid alignment reset');
    }
    
    _setupScanCanvasInteraction() {
        const canvas = this.toolBase.canvas;
        if (!canvas) return;
        
        // Track drag state
        this.scanDragState = {
            isDragging: false,
            dragType: null, // 'corner', 'body', 'pan'
            dragCornerIndex: -1,
            startX: 0,
            startY: 0,
            startCorners: null,
            rafId: null
        };
        
        const getCanvasCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) * (canvas.width / rect.width),
                y: (e.clientY - rect.top) * (canvas.height / rect.height)
            };
        };
        
        const isPointInQuad = (x, y, corners) => {
            // Check if point is inside the quad using cross product
            const sign = (p1, p2, p3) => {
                return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
            };
            
            const d1 = sign({x, y}, corners[0], corners[1]);
            const d2 = sign({x, y}, corners[1], corners[2]);
            const d3 = sign({x, y}, corners[2], corners[3]);
            const d4 = sign({x, y}, corners[3], corners[0]);
            
            const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0) || (d4 < 0);
            const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0) || (d4 > 0);
            
            return !(hasNeg && hasPos);
        };
        
        const findCornerUnderMouse = (mouseX, mouseY) => {
            if (!this.gridAlignment?.corners) return -1;
            
            const HANDLE_RADIUS = 15; // Larger for easier grabbing
            
            for (let i = 0; i < this.gridAlignment.corners.length; i++) {
                const corner = this.gridAlignment.corners[i];
                const dx = mouseX - corner.x;
                const dy = mouseY - corner.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist <= HANDLE_RADIUS) {
                    return i;
                }
            }
            return -1;
        };
        
        const scheduleDraw = () => {
            if (this.scanDragState.rafId) return;
            this.scanDragState.rafId = requestAnimationFrame(() => {
                this.toolBase.draw();
                this.scanDragState.rafId = null;
            });
        };
        
        // Mouse down - start drag
        canvas.addEventListener('mousedown', (e) => {
            if (this.currentTab !== 'SCAN') return;
            if (!this.gridAlignment?.corners) return;
            
            const { x, y } = getCanvasCoords(e);
            const cornerIndex = findCornerUnderMouse(x, y);
            
            if (cornerIndex !== -1) {
                // Start corner drag
                this.scanDragState.isDragging = true;
                this.scanDragState.dragType = 'corner';
                this.scanDragState.dragCornerIndex = cornerIndex;
                this.scanDragState.startX = x;
                this.scanDragState.startY = y;
                this.scanDragState.startCorners = this.gridAlignment.corners.map(c => ({...c}));
                canvas.style.cursor = 'grabbing';
                e.preventDefault();
            } else if (isPointInQuad(x, y, this.gridAlignment.corners)) {
                // Start body drag
                this.scanDragState.isDragging = true;
                this.scanDragState.dragType = 'body';
                this.scanDragState.startX = x;
                this.scanDragState.startY = y;
                this.scanDragState.startCorners = this.gridAlignment.corners.map(c => ({...c}));
                canvas.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });
        
        // Mouse move - drag corner/body or show cursor
        canvas.addEventListener('mousemove', (e) => {
            if (this.currentTab !== 'SCAN') return;
            if (!this.gridAlignment?.corners) return;
            
            const { x, y } = getCanvasCoords(e);
            
            if (this.scanDragState.isDragging) {
                const dx = x - this.scanDragState.startX;
                const dy = y - this.scanDragState.startY;
                
                if (this.scanDragState.dragType === 'corner') {
                    // Update single corner
                    const cornerIndex = this.scanDragState.dragCornerIndex;
                    this.gridAlignment.corners[cornerIndex] = {
                        x: this.scanDragState.startCorners[cornerIndex].x + dx,
                        y: this.scanDragState.startCorners[cornerIndex].y + dy
                    };
                } else if (this.scanDragState.dragType === 'body') {
                    // Move all corners together
                    this.gridAlignment.corners = this.scanDragState.startCorners.map(c => ({
                        x: c.x + dx,
                        y: c.y + dy
                    }));
                }
                
                this.gridAlignment.autoCalculated = false;
                scheduleDraw();
                e.preventDefault();
            } else {
                // Update cursor based on hover
                const cornerIndex = findCornerUnderMouse(x, y);
                if (cornerIndex !== -1) {
                    canvas.style.cursor = 'pointer';
                } else if (isPointInQuad(x, y, this.gridAlignment.corners)) {
                    canvas.style.cursor = 'move';
                } else {
                    canvas.style.cursor = 'default';
                }
            }
        });
        
        // Mouse up - end drag
        canvas.addEventListener('mouseup', (e) => {
            if (this.scanDragState.isDragging) {
                this.scanDragState.isDragging = false;
                this.scanDragState.dragType = null;
                this.scanDragState.dragCornerIndex = -1;
                canvas.style.cursor = 'default';
                e.preventDefault();
            }
        });
        
        // Mouse leave - cancel drag
        canvas.addEventListener('mouseleave', () => {
            if (this.scanDragState.isDragging) {
                this.scanDragState.isDragging = false;
                this.scanDragState.dragType = null;
                canvas.style.cursor = 'default';
            }
        });
    }
    
    _setupKeyboardControls() {
        if (this._keyboardHandler) return; // Already setup
        
        this._keyboardHandler = (e) => {
            // Only handle arrows when SCAN tab is active and focused
            if (this.currentTab !== 'SCAN') return;
            
            const nudgeAmount = e.shiftKey ? 10 : 1; // Shift = 10px, normal = 1px
            
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.gridAlignment.offsetX -= nudgeAmount;
                    this._updateGridOffsetUI();
                    this.toolBase.draw();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.gridAlignment.offsetX += nudgeAmount;
                    this._updateGridOffsetUI();
                    this.toolBase.draw();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.gridAlignment.offsetY -= nudgeAmount;
                    this._updateGridOffsetUI();
                    this.toolBase.draw();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.gridAlignment.offsetY += nudgeAmount;
                    this._updateGridOffsetUI();
                    this.toolBase.draw();
                    break;
            }
        };
        
        window.addEventListener('keydown', this._keyboardHandler);
    }
    
    _updateGridOffsetUI() {
        const offsetXComp = this.toolBase.components.get('gridOffsetX');
        const offsetYComp = this.toolBase.components.get('gridOffsetY');
        
        if (offsetXComp && typeof offsetXComp.setValue === 'function') {
            offsetXComp.setValue(this.gridAlignment.offsetX);
        }
        if (offsetYComp && typeof offsetYComp.setValue === 'function') {
            offsetYComp.setValue(this.gridAlignment.offsetY);
        }
    }
    
    _resetAlignmentAction() {
        // Reset grid alignment to zero
        this.gridAlignment.offsetX = 0;
        this.gridAlignment.offsetY = 0;
        this.gridAlignment.rotation = 0;
        this.gridAlignment.flipped = false;
        
        // Update UI controls
        if (this.toolBase) {
            const offsetXComp = this.toolBase.components.get('gridOffsetX');
            const offsetYComp = this.toolBase.components.get('gridOffsetY');
            const rotationComp = this.toolBase.components.get('gridRotation');
            
            if (offsetXComp && typeof offsetXComp.setValue === 'function') {
                offsetXComp.setValue(0);
            }
            if (offsetYComp && typeof offsetYComp.setValue === 'function') {
                offsetYComp.setValue(0);
            }
            if (rotationComp && typeof rotationComp.setValue === 'function') {
                rotationComp.setValue(0);
            }
        }
        
        this.toolBase.draw();
        this._setStatus('scanStatus', '✅ Alignment reset');
    }
    
    _applyScanDisplayMode(mode) {
        if (!this.toolBase || !this.toolBase.canvas) {
            console.warn('⚠️ Cannot apply display mode: canvas not available');
            return;
        }
        
        const canvas = this.toolBase.canvas;
        const canvasArea = canvas.parentElement;
        
        console.log(`📺 _applyScanDisplayMode called:`);
        console.log(`   Mode requested: "${mode}"`);
        console.log(`   Canvas element size: ${canvas.width}×${canvas.height}px`);
        console.log(`   Canvas computed style: ${window.getComputedStyle(canvas).width} × ${window.getComputedStyle(canvas).height}`);
        
        // Reset any inline size styles (use removeProperty for cleaner reset)
        canvas.style.removeProperty('width');
        canvas.style.removeProperty('height');
        canvas.style.removeProperty('object-fit');
        canvas.style.removeProperty('max-width');
        canvas.style.removeProperty('max-height');
        canvas.style.removeProperty('image-rendering');
        
        switch (mode.toLowerCase()) {
            case 'fit':
                // Fit entire image in container (letterbox/pillarbox if needed)
                canvas.style.setProperty('width', '100%', 'important');
                canvas.style.setProperty('height', '100%', 'important');
                canvas.style.setProperty('object-fit', 'contain', 'important');
                canvas.style.setProperty('image-rendering', 'auto', 'important');
                canvas.style.setProperty('max-width', 'none', 'important');
                canvas.style.setProperty('max-height', 'none', 'important');
                console.log('   ✓ Applied: Fit (contain, responsive)');
                break;
            
            case 'fill':
                // Fill container, may crop edges
                canvas.style.setProperty('width', '100%', 'important');
                canvas.style.setProperty('height', '100%', 'important');
                canvas.style.setProperty('object-fit', 'cover', 'important');
                canvas.style.setProperty('image-rendering', 'auto', 'important');
                canvas.style.setProperty('max-width', 'none', 'important');
                canvas.style.setProperty('max-height', 'none', 'important');
                console.log('   ✓ Applied: Fill (cover, responsive)');
                break;
            
            case 'actual size':
                // Show at exact pixel dimensions (1:1, may need scrolling)
                const actualWidth = `${canvas.width}px`;
                const actualHeight = `${canvas.height}px`;
                canvas.style.setProperty('width', actualWidth, 'important');
                canvas.style.setProperty('height', actualHeight, 'important');
                canvas.style.setProperty('object-fit', 'none', 'important');
                canvas.style.setProperty('image-rendering', 'pixelated', 'important');
                canvas.style.setProperty('max-width', 'none', 'important');
                canvas.style.setProperty('max-height', 'none', 'important');
                console.log(`   ✓ Applied: Actual Size (${actualWidth}×${actualHeight}, 1:1)`);
                break;
            
            default:
                console.warn(`   ⚠️ Unknown mode: "${mode}"`);
                break;
        }
        
        // Ensure canvas area allows scrolling for actual size mode
        if (mode === 'actual size') {
            canvasArea.style.overflow = 'auto';
            canvasArea.style.alignItems = 'flex-start';
            canvasArea.style.justifyContent = 'flex-start';
            console.log('   ✓ Canvas area: scrollable');
        } else {
            canvasArea.style.overflow = 'hidden';
            canvasArea.style.alignItems = 'center';
            canvasArea.style.justifyContent = 'center';
            console.log('   ✓ Canvas area: centered');
        }
        
        console.log(`   Final computed style: ${window.getComputedStyle(canvas).width} × ${window.getComputedStyle(canvas).height}`);
    }
    
    _drawCalibrationGrid(ctx, canvas) {
        if (!this.gridData) {
            console.log('⚠️ _drawCalibrationGrid: No gridData');
            this._drawPlaceholder(ctx, canvas, 'Click Generate Grid');
            return;
        }
        
        console.log('🎨 _drawCalibrationGrid called with gridData:', {
            sequences: this.gridData.sequences?.length,
            colours: this.gridData.colours?.length,
            rows: this.gridData.rows,
            cols: this.gridData.cols
        });
        
        // Get canvas view mode
        const values = this.toolBase.values;
        const viewMode = values.canvasView || 'Combined';
        console.log('View mode:', viewMode);
        
        this._drawCalibrationGridDetailed(ctx, canvas, this.gridData, viewMode);
        
        // Draw constraint bounding boxes if we have constraints
        if (this.gridConstraints) {
            this._drawConstraintBounds(ctx, canvas);
        }
    }
    
    _drawCalibrationGridDetailed(ctx, canvas, gridData, mode = 'Combined') {
        console.log('🎨 _drawCalibrationGridDetailed called, mode:', mode);
        const { sequences, colours, rows, cols, tileSize, gap, width, height, emptyCells, perimeterMargin = 0 } = gridData;
        console.log('Grid details:', { sequences: sequences?.length, colours: colours?.length, rows, cols, tileSize, gap, perimeterMargin });
        
        // Calculate scale to fit canvas with padding
        const padding = 40;
        const availableWidth = canvas.width - padding * 2;
        const availableHeight = canvas.height - padding * 2;
        const scaleX = availableWidth / width;
        const scaleY = availableHeight / height;
        const scale = Math.min(scaleX, scaleY);
        
        // Center the grid
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;
        
        // Store for click detection
        this.gridRenderData = { 
            cellSize: tileSize * scale, 
            offsetX, 
            offsetY, 
            rows, 
            cols, 
            scale,
            perimeterMargin: perimeterMargin * scale 
        };
        
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        
        // Draw perimeter margin as a border (if enabled)
        if (perimeterMargin > 0) {
            ctx.strokeStyle = '#808080';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(0, 0, width, height);
            
            // Fill perimeter margin area with dark grey
            ctx.fillStyle = '#202020';
            // Top
            ctx.fillRect(0, 0, width, perimeterMargin);
            // Bottom
            ctx.fillRect(0, height - perimeterMargin, width, perimeterMargin);
            // Left
            ctx.fillRect(0, perimeterMargin, perimeterMargin, height - (perimeterMargin * 2));
            // Right
            ctx.fillRect(width - perimeterMargin, perimeterMargin, perimeterMargin, height - (perimeterMargin * 2));
        }
        
        // Translate to inner grid area (after perimeter margin)
        ctx.translate(perimeterMargin, perimeterMargin);
        
        // Draw gap fill if enabled
        const values = this.toolBase?.values || {};
        const gapFillEnabled = values.gapFillOptions && values.gapFillOptions.includes('Fill Gaps');
        
        // Calculate inner grid dimensions (without margin)
        const innerWidth = width - (perimeterMargin * 2);
        const innerHeight = height - (perimeterMargin * 2);
        
        if (gap > 0 && gapFillEnabled) {
            // Get gap filament color
            const gapFilamentName = values.gapFilament || 'White';
            const gapFilamentColor = FILAMENT_COLOURS.find(f => f.n === gapFilamentName);
            const gapHex = gapFilamentColor ? gapFilamentColor.h : '#FFFFFF';
            
            // Fill entire inner grid area with gap color
            ctx.fillStyle = gapHex;
            ctx.fillRect(0, 0, innerWidth, innerHeight);
        }
        
        // Draw each tile
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                
                const x = col * (tileSize + gap);
                const y = row * (tileSize + gap);
                
                // Check if this is an empty cell
                if (emptyCells && emptyCells.includes(index)) {
                    // Draw empty cell with grey + X (or skip if gap fill is enabled)
                    if (!gapFillEnabled) {
                    ctx.fillStyle = '#404040';
                    ctx.fillRect(x, y, tileSize, tileSize);
                    
                    ctx.strokeStyle = '#808080';
                    ctx.lineWidth = 0.3;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + tileSize, y + tileSize);
                    ctx.moveTo(x + tileSize, y);
                    ctx.lineTo(x, y + tileSize);
                    ctx.stroke();
                    }
                    continue;
                }
                
                if (index >= sequences.length) continue;
                
                const sequence = sequences[index];
                
                // Determine color based on view mode
                let hexColor;
                if (mode === 'Combined' || mode === 'combined') {
                    // Show simulated final color (all layers)
                const color = simColour(sequence, colours);
                    hexColor = rgb2hex(color);
                } else if (mode.startsWith('Layer ') || mode.startsWith('layer-')) {
                    // Show specific layer only
                    const layerMatch = mode.match(/(\d+)/);
                    if (layerMatch) {
                        const layerIndex = parseInt(layerMatch[1]);
                        const filamentIndex = sequence[layerIndex];
                        
                        if (filamentIndex === 0 || filamentIndex === undefined) {
                            // Empty layer - show grey
                            hexColor = '#303030';
                        } else {
                            // Show filament color
                            hexColor = colours[filamentIndex - 1].h;
                        }
                    } else {
                        hexColor = '#404040';
                    }
                } else {
                    // Default to combined
                    const color = simColour(sequence, colours);
                    hexColor = rgb2hex(color);
                }
                
                // Fill tile (no border - outlines create false impression of gaps)
                ctx.fillStyle = hexColor;
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
        
        ctx.restore();
        
        // Draw stats below
        this._drawGridStats(ctx, canvas, gridData);
    }
    
    _drawGridStats(ctx, canvas, gridData) {
        const { sequences, rows, cols, width, height, fitsConstraints } = gridData;
        
        ctx.save();
        ctx.font = '12px "Atkinson Hyperlegible", monospace';
        ctx.textAlign = 'center';
        
        const y = canvas.height - 15;
        const centerX = canvas.width / 2;
        
        // Color-code based on fit
        ctx.fillStyle = fitsConstraints === false ? '#ff0000' : '#00ff00';
        
        const stats = `Sequences: ${sequences.length} | Grid: ${rows}×${cols} | Size: ${width.toFixed(1)}×${height.toFixed(1)}mm`;
        ctx.fillText(stats, centerX, y);
        
        if (fitsConstraints === false) {
            ctx.fillStyle = '#ffff00';
            ctx.fillText('⚠ OVERSIZED - Use Split Grids', centerX, y - 20);
        }
        
        ctx.restore();
    }
    
    _drawConstraintBounds(ctx, canvas) {
        if (!this.gridData || !this.gridConstraints) return;
        
        const { width: gridWidth, height: gridHeight } = this.gridData;
        const { bedWidth, bedHeight, scanWidth, scanHeight } = this.gridConstraints;
        
        // Calculate same scale/offset as grid rendering
        const padding = 40;
        const availableWidth = canvas.width - padding * 2;
        const availableHeight = canvas.height - padding * 2;
        const scaleX = availableWidth / gridWidth;
        const scaleY = availableHeight / gridHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledWidth = gridWidth * scale;
        const scaledHeight = gridHeight * scale;
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;
        
        ctx.save();
        
        // Draw bed constraint box (printer bed area)
        const bedScaledW = bedWidth * scale;
        const bedScaledH = bedHeight * scale;
        ctx.strokeStyle = '#ff00ff'; // Magenta for bed
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(offsetX, offsetY, bedScaledW, bedScaledH);
        
        // Label
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`BED: ${bedWidth.toFixed(0)}×${bedHeight.toFixed(0)}mm`, offsetX + 5, offsetY + 15);
        
        // Draw scan constraint box (scan paper size)
        const scanScaledW = scanWidth * scale;
        const scanScaledH = scanHeight * scale;
        ctx.strokeStyle = '#00ffff'; // Cyan for scan
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(offsetX, offsetY, scanScaledW, scanScaledH);
        
        // Label
        ctx.fillStyle = '#00ffff';
        ctx.fillText(`SCAN: ${scanWidth.toFixed(0)}×${scanHeight.toFixed(0)}mm`, offsetX + 5, offsetY + 30);
        
        // Draw legend
        const legendX = canvas.width - 200;
        const legendY = 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(legendX, legendY, 190, 60);
        
        ctx.textAlign = 'left';
        ctx.font = '11px monospace';
        
        ctx.strokeStyle = '#ff00ff';
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(legendX + 5, legendY + 15);
        ctx.lineTo(legendX + 30, legendY + 15);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Bed Constraint', legendX + 35, legendY + 18);
        
        ctx.strokeStyle = '#00ffff';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(legendX + 5, legendY + 35);
        ctx.lineTo(legendX + 30, legendY + 35);
        ctx.stroke();
        ctx.fillText('Scan Constraint', legendX + 35, legendY + 38);
        
        ctx.restore();
    }
    
    _drawPrecisionGridOverlay(ctx, canvas, displayScale, drawX, drawY, values) {
        const gridData = this.referenceGridData;
        const calc = this.gridCalculated;
        const align = this.gridAlignment;
        
        if (!align?.corners || align.corners.length !== 4) {
            console.warn('Grid corners not initialized');
            return;
        }
        
        // Get options
        const options = values.gridOptions || [];
        const showSampleZones = options.includes('Show Sample Zones');
        const showExpectedColors = options.includes('Show Expected Colors');
        const deadzonePercent = (values.deadzonePercent || 10) / 100;
        
        const corners = align.corners;
        const { rows, cols } = gridData;
        
        // Helper: bilinear interpolation
        const lerp = (a, b, t) => a + (b - a) * t;
        const lerp2D = (p0, p1, t) => ({
            x: lerp(p0.x, p1.x, t),
            y: lerp(p0.y, p1.y, t)
        });
        
        // Helper: get point in grid
        const getGridPoint = (col, row) => {
            const tCol = col / cols;
            const tRow = row / rows;
            
            // Bilinear interpolation
            const top = lerp2D(corners[0], corners[1], tCol);
            const bottom = lerp2D(corners[3], corners[2], tCol);
            return lerp2D(top, bottom, tRow);
        };
        
        ctx.save();
        
        // Draw ALL grid lines in one pass
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // Vertical lines
        for (let col = 0; col <= cols; col++) {
            const top = getGridPoint(col, 0);
            const bottom = getGridPoint(col, rows);
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(bottom.x, bottom.y);
        }
        
        // Horizontal lines
        for (let row = 0; row <= rows; row++) {
            const left = getGridPoint(0, row);
            const right = getGridPoint(cols, row);
            ctx.moveTo(left.x, left.y);
            ctx.lineTo(right.x, right.y);
        }
        
        ctx.stroke();
        
        // Draw zones/colors if needed
        if (showSampleZones || showExpectedColors) {
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const tileIndex = row * cols + col;
                    
                    // Get tile corners
                    const tl = getGridPoint(col, row);
                    const tr = getGridPoint(col + 1, row);
                    const bl = getGridPoint(col, row + 1);
                    const br = getGridPoint(col + 1, row + 1);
                    
                    if (showSampleZones) {
                        // Draw deadzone
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                        ctx.beginPath();
                        ctx.moveTo(tl.x, tl.y);
                        ctx.lineTo(tr.x, tr.y);
                        ctx.lineTo(br.x, br.y);
                        ctx.lineTo(bl.x, bl.y);
                        ctx.closePath();
                        ctx.fill();
                        
                        // Safe zone (inset by deadzone percentage)
                        const safeTL = lerp2D(tl, br, deadzonePercent);
                        const safeTR = lerp2D(tr, bl, deadzonePercent);
                        const safeBR = lerp2D(br, tl, deadzonePercent);
                        const safeBL = lerp2D(bl, tr, deadzonePercent);
                        
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.beginPath();
                        ctx.moveTo(safeTL.x, safeTL.y);
                        ctx.lineTo(safeTR.x, safeTR.y);
                        ctx.lineTo(safeBR.x, safeBR.y);
                        ctx.lineTo(safeBL.x, safeBL.y);
                        ctx.closePath();
                        ctx.fill();
                        
                        ctx.strokeStyle = '#000000';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                    
                    if (showExpectedColors && tileIndex < gridData.sequences.length) {
                        const sequence = gridData.sequences[tileIndex];
                        if (sequence && this.simColour) {
                            const color = this.simColour(sequence, gridData.colours);
                            
                            // Center swatch
                            const centerX = (tl.x + tr.x + bl.x + br.x) / 4;
                            const centerY = (tl.y + tr.y + bl.y + br.y) / 4;
                            const size = 8;
                            
                            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                            ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
                            ctx.strokeStyle = '#ffffff';
                            ctx.lineWidth = 1;
                            ctx.strokeRect(centerX - size/2, centerY - size/2, size, size);
                        }
                    }
                }
            }
        }
        
        ctx.restore();
        
        // Draw corner handles
        this._drawCornerHandles(ctx, corners);
    }
    
    _drawCornerHandles(ctx, corners) {
        const HANDLE_RADIUS = 8;
        const HANDLE_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00']; // TL, TR, BR, BL
        const LABELS = ['TL', 'TR', 'BR', 'BL'];
        
        ctx.save();
        
        corners.forEach((corner, i) => {
            // Outer circle (white border)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(corner.x, corner.y, HANDLE_RADIUS + 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner circle (colored)
            ctx.fillStyle = HANDLE_COLORS[i];
            ctx.beginPath();
            ctx.arc(corner.x, corner.y, HANDLE_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            
            // Black outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(corner.x, corner.y, HANDLE_RADIUS, 0, Math.PI * 2);
            ctx.stroke();
            
            // Label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(LABELS[i], corner.x, corner.y);
        });
        
        ctx.restore();
    }
    
    _drawGridOverlay(ctx, canvas) {
        // DEPRECATED: Use _drawPrecisionGridOverlay instead
        // This function is no longer used
        return;
        
        if (!this.referenceGridData) return;
        
        const { rows, cols, tileSize, gap } = this.referenceGridData;
        
        // Get overlay style from UI
        const values = this.toolBase?.values || {};
        const overlayStyle = values.overlayStyle || 'Outline Only';
        
        ctx.save();
        
        // Apply transforms
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);
        
        // Set overlay opacity
        ctx.globalAlpha = opacity;
        
        const step = tileSize + gap;
        const gridWidth = cols * step - gap;
        const gridHeight = rows * step - gap;
        
        // Draw based on selected style
        switch (overlayStyle) {
            case 'Outline Only':
                this._drawOutlineOverlay(ctx, gridWidth, gridHeight);
                break;
            case 'Major Grid (Every 10)':
                this._drawMajorGridOverlay(ctx, rows, cols, step, tileSize, gridWidth, gridHeight, 10);
                break;
            case 'Major Grid (Every 5)':
                this._drawMajorGridOverlay(ctx, rows, cols, step, tileSize, gridWidth, gridHeight, 5);
                break;
            case 'Corner + Center':
                this._drawCornerCenterOverlay(ctx, gridWidth, gridHeight);
                break;
            case 'Edge Markers':
                this._drawEdgeMarkersOverlay(ctx, rows, cols, step, tileSize, gridWidth, gridHeight);
                break;
            case 'Full Grid (Dense)':
                this._drawFullGridOverlay(ctx, rows, cols, step, tileSize);
                break;
        }
        
        // Always draw corner handles
        ctx.globalAlpha = 1.0;
        const handleSize = 10 / scale; // Scale handle size inversely so they stay visible
        const corners = [
            [0, 0],
            [gridWidth, 0],
            [0, gridHeight],
            [gridWidth, gridHeight]
        ];
        
        corners.forEach(([cx, cy]) => {
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 / scale;
            ctx.strokeRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
        });
        
        ctx.restore();
    }
    
    _drawOutlineOverlay(ctx, gridWidth, gridHeight) {
        // Just the outer rectangle
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, gridWidth, gridHeight);
        
        // Semi-transparent fill to see grid area
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fillRect(0, 0, gridWidth, gridHeight);
    }
    
    _drawMajorGridOverlay(ctx, rows, cols, step, tileSize, gridWidth, gridHeight, interval) {
        // Outer rectangle
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, gridWidth, gridHeight);
        
        // Major grid lines
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        
        // Vertical lines
        for (let col = interval; col < cols; col += interval) {
            const x = col * step;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, gridHeight);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let row = interval; row < rows; row += interval) {
            const y = row * step;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(gridWidth, y);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    _drawCornerCenterOverlay(ctx, gridWidth, gridHeight) {
        // Outer rectangle
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, gridWidth, gridHeight);
        
        // Center crosshairs
        const centerX = gridWidth / 2;
        const centerY = gridHeight / 2;
        const crossSize = 20;
        
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        
        // Horizontal crosshair
        ctx.beginPath();
        ctx.moveTo(centerX - crossSize, centerY);
        ctx.lineTo(centerX + crossSize, centerY);
        ctx.stroke();
        
        // Vertical crosshair
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - crossSize);
        ctx.lineTo(centerX, centerY + crossSize);
        ctx.stroke();
    }
    
    _drawEdgeMarkersOverlay(ctx, rows, cols, step, tileSize, gridWidth, gridHeight) {
        // Outer rectangle
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, gridWidth, gridHeight);
        
        // Edge markers every 10 tiles
        const interval = 10;
        const markerLength = 10;
        
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        
        // Top edge markers
        for (let col = 0; col <= cols; col += interval) {
            const x = col * step;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, -markerLength);
            ctx.stroke();
        }
        
        // Left edge markers
        for (let row = 0; row <= rows; row += interval) {
            const y = row * step;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(-markerLength, y);
            ctx.stroke();
        }
    }
    
    _drawFullGridOverlay(ctx, rows, cols, step, tileSize) {
        // This is the old dense version - now optional
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellX = col * step;
                const cellY = row * step;
                
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(cellX, cellY, tileSize, tileSize);
            }
        }
    }
    
    _drawLayer(ctx, canvas, layerIndex) {
        this._drawPlaceholder(ctx, canvas, `Layer ${layerIndex} View`);
    }
    
    _applySortMethod(methodName) {
        if (!this.gridData || !this.gridData.sequences) return;
        
        // Map display name to sort method ID
        const sortMap = {
            'Layer Count': 'layercount',
            'Base Color': 'basecolor',
            'Top Color': 'topcolor',
            'Complexity': 'complexity',
            'Lexicographic': 'lexicographic'
        };
        
        const sortMethod = sortMap[methodName] || 'layercount';
        
        // Sort sequences
        this.gridData.sequences = sortSequences(this.gridData.sequences, sortMethod);
        
        // Rebuild sequence map with new order
        this.sequenceMap = buildSequenceMap(
            this.gridData.sequences,
            this.gridData.colours,
            this.gridData.cols,
            { simColour, rgb_to_key }
        );
        
        // Redraw canvas
        this.toolBase.draw();
        
        this._setStatus('gridStatus', `✅ Sorted by ${methodName}`);
    }
    
    async _exportCompletePackageAction() {
        if (!this.gridData) {
            this._setStatus('exportProjectZipStatus', '❌ Generate grid first');
            return;
        }
        
        try {
            this._setStatus('exportProjectZipStatus', '⏳ Creating export package...');
            
            // Dynamically import JSZip
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            
            // Get export options
            const values = this.toolBase.values;
            const exportOptions = {
                stlCombined: values.exportSTLCombined !== false,
                stlPerLayer: values.exportSTLLayers !== false,
                sortedVariants: values.exportSortedVariants !== false,
                layerVisuals: values.exportLayerVisuals !== false
            };
            
            // Generate folder name
            const folderName = generateFolderName(this.gridData);
            
            // Track files for manifest
            const manifestFiles = [];
            
            // 1. Add README.txt
            const config = {
                gridId: folderName,
                layerHeight: values.layerHeight || 0.08,
                baseDirection: 'bottom',
                sortOrder: values.sortMethod || 'Layer Count'
            };
            const readme = generateREADME(this.gridData, config);
            zip.file(`${folderName}/README.txt`, readme);
            manifestFiles.push({
                path: 'README.txt',
                size: readme.length,
                description: 'Human-readable documentation'
            });
            
            // 2. Add config.json
            const configJSON = generateConfigJSON(this.gridData, {
                ...config,
                constraints: {
                    bedWidth: values.bedWidth,
                    bedHeight: values.bedHeight,
                    scanWidth: values.scanWidth,
                    scanHeight: values.scanHeight
                }
            });
            zip.file(`${folderName}/config.json`, configJSON);
            manifestFiles.push({
                path: 'config.json',
                size: configJSON.length,
                description: 'Machine-readable configuration'
            });
            
            // 3. Add scan analysis data if available
            if (this.scanAnalysis) {
                this._setStatus('exportStatus', '⏳ Adding scan analysis...');
                const scansFolder = zip.folder(`${folderName}/scans`);
                
                // Add scan image if available
                if (this.scanImageElement) {
                    const scanCanvas = document.createElement('canvas');
                    scanCanvas.width = this.scanImageElement.width;
                    scanCanvas.height = this.scanImageElement.height;
                    const scanCtx = scanCanvas.getContext('2d');
                    scanCtx.drawImage(this.scanImageElement, 0, 0);
                    
                    const scanBlob = await new Promise(resolve => scanCanvas.toBlob(resolve, 'image/png'));
                    scansFolder.file(`scan-${new Date().toISOString().slice(0,10)}.png`, scanBlob);
                    manifestFiles.push({
                        path: 'scans/scan-*.png',
                        size: scanBlob.size,
                        description: 'Scanned calibration grid image'
                    });
                }
                
                // Add scan analysis JSON
                const analysisJSON = JSON.stringify({
                    version: '1.0.0',
                    analyzedAt: new Date().toISOString(),
                    tiles: this.scanAnalysis,
                    summary: {
                        tilesAnalyzed: this.scanAnalysis.length,
                        totalPixels: this.scanAnalysis.reduce((sum, t) => sum + t.pixelsSampled, 0),
                        averageDeviation: (this.scanAnalysis.reduce((sum, t) => sum + t.colorDeviation, 0) / this.scanAnalysis.length).toFixed(3)
                    }
                }, null, 2);
                scansFolder.file('analysis.json', analysisJSON);
                manifestFiles.push({
                    path: 'scans/analysis.json',
                    size: analysisJSON.length,
                    description: 'Complete scan analysis with statistics'
                });
                
                // Add quantization config
                if (this.quantizationConfig) {
                    const quantJSON = JSON.stringify(this.quantizationConfig, null, 2);
                    scansFolder.file('quantization-config.json', quantJSON);
                    manifestFiles.push({
                        path: 'scans/quantization-config.json',
                        size: quantJSON.length,
                        description: 'RGB to sequence mapping for quantization'
                    });
                }
                
                // Add calibrated palette (GPL)
                const calibratedPalette = this._generateCalibratedPaletteGPL();
                scansFolder.file('calibrated-palette.gpl', calibratedPalette);
                manifestFiles.push({
                    path: 'scans/calibrated-palette.gpl',
                    size: calibratedPalette.length,
                    description: 'Calibrated color palette from scan'
                });
                
                // Add comparison CSV
                const comparisonCSV = this._generateComparisonCSV();
                scansFolder.file('comparison.csv', comparisonCSV);
                manifestFiles.push({
                    path: 'scans/comparison.csv',
                    size: comparisonCSV.length,
                    description: 'Expected vs measured color comparison'
                });
            }
            
            // 4. Add data files
            const dataFolder = zip.folder(`${folderName}/data`);
            
            // grid-layout.json
            const layoutJSON = generateLayoutJSON(this.gridData);
            dataFolder.file('grid-layout.json', layoutJSON);
            manifestFiles.push({
                path: 'data/grid-layout.json',
                size: layoutJSON.length,
                description: 'Physical grid layout and tile positions'
            });
            
            // sequences.json
            const sequencesJSON = JSON.stringify({
                sequences: this.gridData.sequences,
                colours: this.gridData.colours,
                metadata: {
                    total: this.gridData.sequences.length,
                    layerCount: this.gridData.layerCount,
                    sortMethod: values.sortMethod || 'Layer Count'
                }
            }, null, 2);
            dataFolder.file('sequences.json', sequencesJSON);
            manifestFiles.push({
                path: 'data/sequences.json',
                size: sequencesJSON.length,
                description: 'Complete sequence data'
            });
            
            // sequences.csv
            const csv = exportGridCSV(this.gridData);
            dataFolder.file('sequences.csv', csv);
            manifestFiles.push({
                path: 'data/sequences.csv',
                size: csv.length,
                description: 'Sequence data in CSV format'
            });
            
            // palette.gpl
            const palette = generateGPL(this.sequenceMap, this.gridData.colours);
            dataFolder.file('palette.gpl', palette);
            manifestFiles.push({
                path: 'data/palette.gpl',
                size: palette.length,
                description: 'GIMP palette (predicted colors)'
            });
            
            // 5. Add grid visuals
            if (exportOptions.layerVisuals) {
                this._setStatus('exportProjectZipStatus', '⏳ Generating visuals...');
                const gridsFolder = zip.folder(`${folderName}/grids`);
                
                // Combined view
                const combinedPNG = await this._generateGridPNG(this.gridData, 'combined');
                gridsFolder.file('grid-full-combined.png', combinedPNG);
                manifestFiles.push({
                    path: 'grids/grid-full-combined.png',
                    size: combinedPNG.size,
                    description: 'Visual reference: all layers combined'
                });
                
                // Per-layer views
                for (let i = 0; i < this.gridData.layerCount; i++) {
                    const layerPNG = await this._generateGridPNG(this.gridData, `layer-${i}`);
                    gridsFolder.file(`grid-layer-${i}.png`, layerPNG);
                    manifestFiles.push({
                        path: `grids/grid-layer-${i}.png`,
                        size: layerPNG.size,
                        description: `Visual reference: layer ${i} only`
                    });
                }
            }
            
            // 6. Add STL files
            this._setStatus('exportProjectZipStatus', '⏳ Generating STL files...');
            const stlFolder = zip.folder(`${folderName}/stl`);
            
            if (exportOptions.stlCombined) {
                const combinedFolder = stlFolder.folder('combined');
                const stls = exportArtworkSTLs(
                    this._createGridLayerMaps(this.gridData),
                    this.gridData.colours.map(c => c.n),
                    {
                        imageWidth: this.gridData.cols,
                        imageHeight: this.gridData.rows,
                        printWidth: this.gridData.width,
                        layerHeight: values.layerHeight || 0.08
                    }
                );
                
                for (const [filename, content] of Object.entries(stls)) {
                    combinedFolder.file(filename, content);
                    manifestFiles.push({
                        path: `stl/combined/${filename}`,
                        size: content.length,
                        description: `STL: ${filename.replace('artwork_', '').replace('.stl', '')} (all layers)`
                    });
                }
            }
            
            if (exportOptions.stlPerLayer) {
                const layersFolder = stlFolder.folder('layers');
                // Generate STLs per layer (implement this later if needed)
                // For now, add placeholder
                layersFolder.file('README.txt', 'Per-layer STL export coming soon');
            }
            
            // 6. Add scans folder with instructions
            const scansFolder = zip.folder(`${folderName}/scans`);
            const scanInstructions = generateScanInstructions();
            scansFolder.file('INSTRUCTIONS.txt', scanInstructions);
            manifestFiles.push({
                path: 'scans/INSTRUCTIONS.txt',
                size: scanInstructions.length,
                description: 'Scanning instructions'
            });
            
            // 7. Add sorted variants if requested
            if (exportOptions.sortedVariants) {
                this._setStatus('exportStatus', '⏳ Generating sorted variants...');
                await this._addSortedVariants(zip, folderName, manifestFiles);
            }
            
            // 8. Add manifest.json
            const manifest = generateManifest(manifestFiles);
            zip.file(`${folderName}/manifest.json`, manifest);
            
            // Generate and download ZIP
            this._setStatus('exportStatus', '⏳ Compressing...');
            const blob = await zip.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });
            
            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${folderName}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this._setStatus('exportStatus', `✅ Exported complete package: ${folderName}.zip`);
            
        } catch (error) {
            console.error('Export package error:', error);
            this._setStatus('exportStatus', `❌ Export failed: ${error.message}`);
        }
    }
    
    async _generateGridPNG(gridData, mode) {
        // Create high-res canvas for export
        const dpi = 300;
        const widthInches = gridData.width / 25.4;
        const heightInches = gridData.height / 25.4;
        
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = Math.round(widthInches * dpi);
        exportCanvas.height = Math.round(heightInches * dpi);
        const exportCtx = exportCanvas.getContext('2d');
        
        // Draw grid at high resolution
        this._drawCalibrationGridDetailed(exportCtx, exportCanvas, gridData, mode);
        
        // Convert to blob
        return new Promise((resolve) => {
            exportCanvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    }
    
    async _addSortedVariants(zip, folderName, manifestFiles) {
        const sortMethods = getSortMethods();
        const sortedFolder = zip.folder(`${folderName}/sorted`);
        
        for (const method of sortMethods) {
            const methodFolder = sortedFolder.folder(method.id);
            
            // Sort sequences
            const sorted = sortSequences([...this.gridData.sequences], method.id);
            
            // Create temporary grid data with sorted sequences
            const sortedGrid = {
                ...this.gridData,
                sequences: sorted
            };
            
            // Generate data file
            const dataJSON = JSON.stringify({
                sortMethod: method.id,
                description: method.description,
                sequences: sorted
            }, null, 2);
            methodFolder.file('sequences.json', dataJSON);
            
            // Generate visual (optional, can be slow)
            // const visual = await this._generateGridPNG(sortedGrid, 'combined');
            // methodFolder.file('visual.png', visual);
        }
    }
    
    destroy() {
        // Clear scroll interval
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
        
        // Destroy ToolBase
        if (this.toolBase) {
            this.toolBase.destroy();
        }
    }
}



