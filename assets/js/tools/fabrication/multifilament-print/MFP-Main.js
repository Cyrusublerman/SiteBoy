/**
 * Multifilament Print Tool - Main Entry Point
 * 
 * RESTORED from working monolith with ALL functionality intact.
 * This is NOT a simplified version - it has EVERY control and feature.
 */

import { ToolBase } from '../../core/tool-base.js';
import ComponentLibrary from '../../../shared/component-library.js';
import { LayoutCalculator } from '../../../core/config.js';
import { FILAMENT_COLOURS, DEFAULTS } from './MFP-Constants.js';
import { simColour, rgb2hex } from '../../../shared/algorithms/color/color-utils.js';
import { MFPSourceActions } from './MFP-SourceActions.js';
import { MFPScanActions } from './MFP-ScanActions.js';
import { MFPQuantizeActions } from './MFP-QuantizeActions.js';
import { MFPExportActions } from './MFP-ExportActions.js';

export class MultifilamentPrintTool {
    constructor(container, deps = {}) {
        console.log('🏗️ MFP Constructor called');
        this.container = container;
        this.deps = {
            ComponentLibrary,
            MF: LayoutCalculator,
            ...deps
        };
        
        // Shared state across tabs
        this.sharedState = {
            selectedFilaments: [],
            gridData: null,
            sequences: null,
            sequenceMap: null,
            scanImageElement: null,
            scanAnalysis: null,
            sourceImageElement: null,
            quantizedImage: null,
            importedState: null,
            showDocs: false  // Documentation viewer toggle
        };
        
        console.log('🏗️ MFP sharedState initialized:', this.sharedState);
        
        // Action modules (NO DOM manipulation - pure logic)
        this.sourceActions = new MFPSourceActions(this.sharedState);
        this.scanActions = new MFPScanActions(this.sharedState);
        this.quantizeActions = new MFPQuantizeActions(this.sharedState);
        this.exportActions = new MFPExportActions(this.sharedState);
        
        console.log('🏗️ MFP Action modules created');
        
        // Build config with ALL tabs and controls
        const config = {
            title: 'Multifilament Print',
            sidebar: this._getSidebarConfig(),
            canvas: {
                width: 800,
                height: 600,
                enabled: true
            },
            onInit: (values) => this._handleInit(values),
            onUpdate: (key, value, allValues) => this._handleUpdate(key, value, allValues),
            onDraw: (ctx, canvas, values) => this._handleDraw(ctx, canvas, values)
        };
        
        console.log('🏗️ MFP Creating ToolBase with config:', config);
        this.toolBase = new ToolBase(config, this.deps);
        console.log('🏗️ MFP Mounting ToolBase to container');
        this.toolBase.mount(container);
        console.log('🏗️ MFP Mount complete');
        
        // Add info button to canvas area
        this._addInfoButton();
    }
    
    _addInfoButton() {
        // Get canvas container
        const canvasArea = this.container.querySelector('.tool-canvas-area');
        if (!canvasArea) {
            console.warn('Canvas area not found, cannot add info button');
            return;
        }
        
        // Create info button - 2F square, flush top-right
        const infoButton = document.createElement('button');
        infoButton.className = 'info-button';
        infoButton.textContent = 'i';  // lowercase i
        infoButton.title = 'View Documentation';
        infoButton.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: calc(var(--f) * 2);
            height: calc(var(--f) * 2);
            background: var(--c-bg);
            color: var(--c-text);
            border: 1px solid var(--c-border);
            border-top: none;
            border-right: none;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: calc(var(--f) * 1);
            font-weight: normal;
            font-style: normal;
            text-transform: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            transition: all 0.2s;
            margin: 0;
            padding: 0;
        `;
        
        // Hover effect
        infoButton.addEventListener('mouseenter', () => {
            infoButton.style.background = 'var(--c-text)';
            infoButton.style.color = 'var(--c-bg)';
        });
        infoButton.addEventListener('mouseleave', () => {
            infoButton.style.background = 'var(--c-bg)';
            infoButton.style.color = 'var(--c-text)';
        });
        
        // Click handler
        infoButton.addEventListener('click', () => {
            this.sharedState.showDocs = !this.sharedState.showDocs;
            this._toggleDocumentation();
        });
        
        // Ensure canvas area is position: relative
        const currentPosition = window.getComputedStyle(canvasArea).position;
        if (currentPosition === 'static') {
            canvasArea.style.position = 'relative';
        }
        
        canvasArea.appendChild(infoButton);
        this.infoButton = infoButton;
    }
    
    async _toggleDocumentation() {
        const canvasArea = this.container.querySelector('.tool-canvas-area');
        if (!canvasArea) return;
        
        if (this.sharedState.showDocs) {
            // Show documentation
            const canvas = canvasArea.querySelector('canvas');
            if (canvas) {
                canvas.style.display = 'none';
            }
            
            // Create or show docs container
            if (!this.docsContainer) {
                this.docsContainer = document.createElement('div');
                this.docsContainer.className = 'tool-docs-viewer';
                this.docsContainer.style.cssText = `
                    width: 100%;
                    height: 100%;
                    overflow-y: auto;
                    padding: calc(var(--f) * 2);
                    background: var(--c-bg);
                    color: var(--c-text);
                `;
                
                // Determine current tab
                const currentTab = this.toolBase.currentTab || 'SOURCE';
                const tabFile = currentTab.toLowerCase(); // source, scan, quantize, export
                
                // Load tab-specific documentation
                const docPath = `/blog/docs/pages/tools/MFP/${tabFile}.md`;
                
                console.log('Loading documentation for tab:', currentTab, 'from:', docPath);
                
                try {
                    const response = await fetch(docPath);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    const markdown = await response.text();
                    
                    // Use MarkdownBody component
                    const MarkdownBody = ComponentLibrary.MarkdownBody;
                    if (MarkdownBody) {
                        this.markdownComponent = new MarkdownBody({
                            markdownText: markdown,
                            className: 'tool-documentation'
                        }, this.deps);
                        
                        const markdownEl = this.markdownComponent.render();
                        this.docsContainer.appendChild(markdownEl);
                    } else {
                        // Fallback: plain text with basic formatting
                        const pre = document.createElement('pre');
                        pre.textContent = markdown;
                        pre.style.cssText = `
                            font-family: 'Atkinson Hyperlegible', monospace;
                            font-size: calc(var(--f) * 0.9);
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            line-height: 1.6;
                        `;
                        this.docsContainer.appendChild(pre);
                    }
                } catch (err) {
                    console.error('Failed to load documentation:', err);
                    this.docsContainer.innerHTML = `
                        <div style="color: var(--vga-red); padding: calc(var(--f) * 2); font-family: 'Atkinson Hyperlegible', monospace;">
                            <h2 style="color: var(--vga-yellow);">Documentation Not Found</h2>
                            <p>Could not load: <code>${docPath}</code></p>
                            <p>Tab: ${currentTab}</p>
                            <p>Error: ${err.message}</p>
                            <p>Check browser console for details.</p>
                        </div>
                    `;
                }
                
                canvasArea.appendChild(this.docsContainer);
            } else {
                this.docsContainer.style.display = 'block';
            }
            
            // Update button style
            this.infoButton.style.background = 'var(--c-text)';
            this.infoButton.style.color = 'var(--c-bg)';
            
        } else {
            // Show canvas
            const canvas = canvasArea.querySelector('canvas');
            if (canvas) {
                canvas.style.display = 'block';
            }
            
            if (this.docsContainer) {
                this.docsContainer.style.display = 'none';
            }
            
            // Update button style
            this.infoButton.style.background = 'var(--c-bg)';
            this.infoButton.style.color = 'var(--c-text)';
        }
    }
    
    _getSelectedFilamentNames() {
        if (!this.sharedState.selectedFilaments || this.sharedState.selectedFilaments.length === 0) {
            return ['Select filaments first'];
        }
        return this.sharedState.selectedFilaments.map(idx => FILAMENT_COLOURS[idx].n);
    }
    
    _getSidebarConfig() {
        const state = this.sharedState.importedState || {};
        
        return [
            // SOURCE TAB - COMPLETE WITH ALL CONTROLS
            ['SOURCE', [
                ['PROJECT', [
                    ['file', 'Import Project (ZIP)', {key: 'importProject', accept: '.zip'}],
                    ['label', 'Import complete project ZIP or start new', {key: 'projectStatus', variant: 'caption'}],
                ]],
                ['FILAMENT PICKER', [
                    ['filament-picker', 'Select Filament Colors (2-10)', FILAMENT_COLOURS, { 
                        key: 'filamentPicker',
                        min: 2, 
                        max: 10,
                        selectedIndices: this.sharedState.selectedFilaments
                    }],
                ]],
                ['PHYSICAL CONSTRAINTS', [
                    ['number', 'Bed Width (mm)', 100, 400, 1, {key: 'bedWidth', value: state.bedWidth || DEFAULTS.bedWidth, withNumber: true}],
                    ['number', 'Bed Height (mm)', 100, 400, 1, {key: 'bedHeight', value: state.bedHeight || DEFAULTS.bedHeight, withNumber: true}],
                    ['number', 'Scan Width (mm)', 100, 300, 1, {key: 'scanWidth', value: state.scanWidth || DEFAULTS.scanWidth, withNumber: true}],
                    ['number', 'Scan Height (mm)', 100, 400, 1, {key: 'scanHeight', value: state.scanHeight || DEFAULTS.scanHeight, withNumber: true}],
                ]],
                ['TILE CONFIGURATION', [
                    ['number', 'Layers per Tile', 1, 10, 1, {key: 'layerCount', value: state.layerCount || DEFAULTS.layerCount, withNumber: true}],
                    ['number', 'Layer Height (mm)', 0.04, 0.4, 0.01, {key: 'layerHeight', value: state.layerHeight || DEFAULTS.layerHeight, withNumber: true}],
                    ['number', 'Tile Size (mm)', 2, 20, 0.5, {key: 'tileSize', value: state.tileSize || DEFAULTS.tileSize, withNumber: true}],
                    ['number', 'Gap (mm)', 0, 5, 0.5, {key: 'gap', value: state.gap !== undefined ? state.gap : DEFAULTS.gap, withNumber: true}],
                    ['number', 'Perimeter Margin (mm)', 0, 10, 0.5, {key: 'perimeterMargin', value: state.perimeterMargin || DEFAULTS.perimeterMargin, withNumber: true}],
                    ['label', 'Border around entire grid (for scan edge tolerance)', {variant: 'caption'}],
                ]],
                ['BASE & TOP LAYERS', [
                    ['number', 'Base Layers (bottom)', 0, 10, 1, {key: 'baseLayers', value: state.baseLayers !== undefined ? state.baseLayers : DEFAULTS.baseLayers, withNumber: true}],
                    ['dropdown', 'Base Filament', this._getSelectedFilamentNames(), {key: 'baseFilament', value: state.baseFilament}],
                    ['number', 'Top Layers (top)', 0, 10, 1, {key: 'topLayers', value: state.topLayers || DEFAULTS.topLayers, withNumber: true}],
                    ['dropdown', 'Top Filament', this._getSelectedFilamentNames(), {key: 'topFilament', value: state.topFilament}],
                ]],
                ['GAP & PERIMETER', [
                    ['toggle', 'Fill Gaps & Perimeter', ['Fill Gaps'], {key: 'gapFillOptions', selected: state.gapFillOptions || [], multiSelect: true}],
                    ['dropdown', 'Fill Filament', this._getSelectedFilamentNames(), {key: 'gapFilament', value: state.gapFilament}],
                    ['label', 'Fills gaps between tiles AND perimeter margin', {variant: 'caption'}],
                ]],
                ['SORT & VIEW', [
                    ['dropdown', 'Sort Method', ['Layer Count', 'Base Color', 'Top Color', 'Complexity', 'Lexicographic'], {value: state.sortMethod || DEFAULTS.sortMethod, key: 'sortMethod'}],
                    ['dropdown', 'Canvas View', ['Combined', 'Layer 0', 'Layer 1', 'Layer 2', 'Layer 3'], {value: 'Combined', key: 'canvasView'}],
                ]],
                ['GENERATE GRID', [
                    ['button', 'Generate Grid', null, {key: 'generateGrid', variant: 'primary'}],
                    ['button', 'Generate Split Grids', null, {key: 'generateSplitGrids'}],
                    ['label', '', {key: 'sequenceCount', variant: 'caption'}],
                    ['label', 'Select 2-10 filaments, then click Generate Grid', {key: 'gridStatus', variant: 'caption'}],
                ]],
                ['EXPORT OPTIONS', [
                    ['toggle', 'Options', ['STL Combined', 'STL Per Layer', 'Sorted Variants', 'Layer Visuals'], {
                        key: 'exportOptions',
                        selected: ['STL Combined', 'STL Per Layer', 'Sorted Variants', 'Layer Visuals'],
                        multiSelect: true
                    }],
                ]],
                ['EXPORT ACTIONS', [
                    ['button', 'Export Grid PNG', null, {key: 'exportGridPNG'}],
                    ['button', 'Export Grid STLs', null, {key: 'exportGridSTL'}],
                    ['button', 'Export Grid CSV', null, {key: 'exportGridCSV'}],
                    ['button', '📦 Export Complete Package', null, {key: 'exportCompletePackage', variant: 'primary'}],
                    ['label', '', {key: 'exportStatus', variant: 'caption'}],
                ]],
            ]],
            
            // SCAN TAB - COMPLETE WITH ALL CONTROLS
            ['SCAN', [
                ['GRID REFERENCE', [
                    ['file', 'Import Project (ZIP)', {key: 'importProjectScan', accept: '.zip'}],
                    ['file', 'Import Grid CSV', {key: 'importGridCSV', accept: '.csv'}],
                    ['button', 'Use Last Generated Grid', null, {key: 'useLastGrid'}],
                    ['button', 'View Reference Grid', null, {key: 'viewReferenceGrid'}],
                    ['dropdown', 'Re-sort Grid', ['Layer Count', 'Base Color', 'Top Color', 'Complexity', 'Lexicographic'], {key: 'resortGrid', value: state.sortMethod || DEFAULTS.sortMethod}],
                    ['button', 'Apply Sort', null, {key: 'applySortToGrid'}],
                    ['label', '', {key: 'gridLoadStatus', variant: 'caption'}],
                ]],
                ['SCAN IMAGE', [
                    ['file', 'Scan Image', {key: 'scanImage', accept: 'image/*'}],
                    ['label', '', {key: 'scanImageStatus', variant: 'caption'}],
                    ['dropdown', 'Display Mode', ['Fit', 'Fill', 'Actual Size'], {key: 'scanDisplayMode', value: 'Fit'}],
                    ['label', 'Fit=contain, Fill=cover, Actual=1:1 pixels', {variant: 'caption'}],
                ]],
                ['GRID OVERLAY', [
                    ['label', 'Grid auto-sized on image upload', {key: 'gridInfo', variant: 'caption'}],
                    ['number', 'Fine Adjust X (px)', -50, 50, 1, {key: 'gridOffsetX', value: 0, withNumber: true}],
                    ['number', 'Fine Adjust Y (px)', -50, 50, 1, {key: 'gridOffsetY', value: 0, withNumber: true}],
                    ['number', 'Rotation (°)', -5, 5, 0.1, {key: 'gridRotation', value: 0, withNumber: true}],
                    ['toggle', 'Options', ['Flip/Mirror', 'Show Sample Zones', 'Show Expected Colors'], {
                        key: 'gridOptions',
                        selected: ['Show Sample Zones'],
                        multiSelect: true
                    }],
                    ['button', 'Reset Alignment', null, {key: 'resetGrid'}],
                ]],
                ['SAMPLING', [
                    ['number', 'Deadzone (%)', 0, 40, 5, {key: 'deadzonePercent', value: DEFAULTS.deadzonePercent, withNumber: true}],
                    ['label', 'Edge border to exclude (20% = 40% total removed)', {variant: 'caption'}],
                ]],
                ['ANALYSIS', [
                    ['button', 'Analyze Scan', null, {key: 'analyzeScan', variant: 'primary'}],
                    ['button', 'View Analysis Data', null, {key: 'viewAnalysis'}],
                    ['button', 'Export Palette (GPL)', null, {key: 'exportPalette'}],
                    ['button', 'Export Quantization Config', null, {key: 'exportQuantConfig'}],
                    ['button', 'Export Comparison CSV', null, {key: 'exportComparisonCSV'}],
                    ['label', '', {key: 'scanStatus', variant: 'caption'}],
                ]],
            ]],
            
            // QUANTIZE TAB - COMPLETE WITH ALL CONTROLS
            ['QUANTIZE', [
                ['PALETTE STATUS', [
                    ['label', '⚠️ No palette loaded. Generate or import a grid first.', {key: 'paletteStatus', variant: 'caption'}],
                ]],
                ['IMAGE PROCESSING', [
                    ['file', 'Source Image', {key: 'sourceImage', accept: 'image/*'}],
                    ['number', 'Print Width (mm)', 50, 300, 1, {key: 'printWidth', value: 170, withNumber: true}],
                    ['number', 'Dither Strength', 0, 1, 0.1, {key: 'ditherStrength', value: 1.0, withNumber: true}],
                    ['number', 'Min Detail (mm)', 0, 2, 0.1, {key: 'minDetail', value: 0.8, withNumber: true}],
                ]],
                ['ACTIONS', [
                    ['button', 'Quantize Image', null, {key: 'quantize', variant: 'primary'}],
                    ['label', '', {key: 'quantizeStatus', variant: 'caption'}],
                ]],
            ]],
            
            // EXPORT TAB - COMPLETE WITH ALL CONTROLS
            ['EXPORT', [
                ['PROJECT STATUS', [
                    ['label', '⚠️ No project loaded. Generate or import a grid first.', {key: 'exportProjectStatus', variant: 'caption'}],
                    ['label', '⚠️ No scan analysis (optional)', {key: 'exportScanStatus', variant: 'caption'}],
                ]],
                ['COMPLETE PROJECT', [
                    ['button', 'Export Complete Project ZIP', null, {key: 'exportCompleteProject', variant: 'primary'}],
                    ['label', 'Includes grid, STL files, visuals, and scan analysis if available', {variant: 'caption'}],
                    ['label', '', {key: 'exportProjectZipStatus', variant: 'caption'}],
                ]],
                ['STL EXPORT', [
                    ['number', 'Layer Height (mm)', 0.04, 0.3, 0.01, {key: 'layerHeightExport', value: state.layerHeight || DEFAULTS.layerHeight, withNumber: true}],
                    ['button', 'Export STL Files Only', null, {key: 'exportSTL'}],
                    ['button', 'Export JSON Only', null, {key: 'exportJSON'}],
                    ['label', '', {key: 'exportSTLStatus', variant: 'caption'}],
                ]],
                ['CANVAS MODE', [
                    ['dropdown', 'Mode', ['Source', 'Scan', 'Grid', 'Quantized', 'Layer 0', 'Layer 1', 'Layer 2', 'Layer 3'], {key: 'canvasMode', value: 'Grid'}],
                ]],
            ]]
        ];
    }
    
    _handleInit(values) {
        console.log('🎬 MFP _handleInit called:', { values });
        window.debugLog('TOOLS', `MFP: Init`);
        
        // Initialize SOURCE tab (always first tab)
        console.log('🎬 Initializing SOURCE tab');
        this.sourceActions.updateSequenceCount(this.toolBase);
    }
    
    _handleUpdate(key, value, allValues) {
        console.log('🔄 MFP _handleUpdate called:', { key, value, allValues });
        window.debugLog('TOOLS', `MFP: Update ${key}`);
        
        // Handle all buttons and inputs from ALL tabs
        switch(key) {
            // SOURCE tab
            case 'importProject': this.sourceActions.importProject(value, this.toolBase); break;
            case 'filamentPicker_indices':  // ToolBase sends '_indices' suffix!
                console.log('🎨 filamentPicker_indices changed:', value);
                this.sharedState.selectedFilaments = value || [];
                console.log('🎨 Updated sharedState.selectedFilaments:', this.sharedState.selectedFilaments);
                this.sourceActions.updateSequenceCount(this.toolBase);
                // Live preview - generate as soon as 2+ filaments selected (EXACT behavior from monolith)
                if (this.sharedState.selectedFilaments.length >= 2) {
                    console.log('🎨 Triggering generateLivePreview...');
                    this.sourceActions.generateLivePreview(allValues, this.toolBase);
                } else {
                    console.log('🎨 Not enough filaments to preview (need 2+)');
                }
                break;
            case 'layerCount':
            case 'baseLayers':
            case 'topLayers':
            case 'tileSize':
            case 'gap':
            case 'perimeterMargin':
            case 'maxWidth':
            case 'maxHeight':
            case 'bedWidth':
            case 'bedHeight':
            case 'sortMethod':
                // Any setting change triggers live preview if filaments selected (EXACT behavior from monolith)
                if (this.sharedState.selectedFilaments && this.sharedState.selectedFilaments.length >= 2) {
                    this.sourceActions.generateLivePreview(allValues, this.toolBase);
                }
                break;
            case 'canvasView':
            case 'gapFillOptions':
            case 'gapFilament':
            case 'baseFilament':
            case 'topFilament':
                // View mode changes just redraw (don't regenerate)
                this.toolBase.draw();
                break;
            
            // Tab change detection - clear docs so it reloads for new tab
            default:
                // If docs are showing and this might be a tab change, clear docs container
                if (this.sharedState.showDocs && this.docsContainer) {
                    // Clear container so it reloads for new tab
                    if (this.markdownComponent && this.markdownComponent.destroy) {
                        this.markdownComponent.destroy();
                    }
                    this.docsContainer.innerHTML = '';
                    this.docsContainer.remove();
                    this.docsContainer = null;
                    this.markdownComponent = null;
                    
                    // Trigger reload
                    this._toggleDocumentation();
                }
                break;
            case 'generateGrid': this.sourceActions.generateGrid(allValues, this.toolBase); break;
            case 'generateSplitGrids': this.sourceActions.generateSplitGrids(allValues, this.toolBase); break;
            case 'exportGridPNG': this.sourceActions.exportGridPNG(this.toolBase); break;
            case 'exportGridSTL': this.sourceActions.exportGridSTL(this.toolBase); break;
            case 'exportGridCSV': this.sourceActions.exportGridCSV(this.toolBase); break;
            case 'exportCompletePackage': this.sourceActions.exportCompletePackage(this.toolBase); break;
            
            // SCAN tab
            case 'importProjectScan': this.scanActions.importProject(value, this.toolBase); break;
            case 'importGridCSV': this.scanActions.importGridCSV(value, this.toolBase); break;
            case 'useLastGrid': this.scanActions.useLastGrid(this.toolBase); break;
            case 'viewReferenceGrid': this.scanActions.viewReferenceGrid(this.toolBase); break;
            case 'applySortToGrid': this.scanActions.applySortToGrid(allValues, this.toolBase); break;
            case 'scanImage': this.scanActions.loadScanImage(value, this.toolBase); break;
            case 'resetGrid': this.scanActions.resetGrid(this.toolBase); break;
            case 'analyzeScan': this.scanActions.analyzeScan(allValues, this.toolBase); break;
            case 'viewAnalysis': this.scanActions.viewAnalysis(this.toolBase); break;
            case 'exportPalette': this.scanActions.exportPalette(this.toolBase); break;
            case 'exportQuantConfig': this.scanActions.exportQuantConfig(this.toolBase); break;
            case 'exportComparisonCSV': this.scanActions.exportComparisonCSV(this.toolBase); break;
            
            // QUANTIZE tab
            case 'sourceImage': this.quantizeActions.loadSourceImage(value, this.toolBase); break;
            case 'quantize': this.quantizeActions.quantize(allValues, this.toolBase); break;
            
            // EXPORT tab
            case 'exportCompleteProject': this.exportActions.exportCompleteProject(this.toolBase); break;
            case 'exportSTL': this.exportActions.exportSTL(allValues, this.toolBase); break;
            case 'exportJSON': this.exportActions.exportJSON(this.toolBase); break;
        }
        
        // Redraw canvas
        this.toolBase.draw();
    }
    
    _handleDraw(ctx, canvas, values) {
        // Clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw based on available data (tabs don't affect canvas)
        if (this.sharedState.gridData) {
            this._drawGrid(ctx, canvas, values);
        } else {
            // Placeholder message
            ctx.fillStyle = '#00ff00';
            ctx.font = '16px "Atkinson Hyperlegible", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Select filaments to generate grid', canvas.width / 2, canvas.height / 2);
        }
    }
    
    // ========================================
    // DRAWING METHODS (Canvas rendering only - NO DOM)
    // ========================================
    
    _drawGrid(ctx, canvas, values) {
        const gridData = this.sharedState.gridData;
        if (!gridData) {
            this._drawPlaceholder(ctx, canvas, 'Click Generate Grid');
            return;
        }
        
        // EXACT copy from monolith - draw grid with all details
        const { sequences, colours, rows, cols, tileSize, gap, width, height, emptyCells, perimeterMargin = 0 } = gridData;
        
        // Get view mode and gap fill settings
        const viewMode = values.canvasView || 'Combined';
        const gapFillEnabled = values.gapFillOptions && values.gapFillOptions.includes('Fill Gaps');
        
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
        
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        
        // Draw perimeter margin as a border (if enabled)
        if (perimeterMargin > 0) {
            // If gap fill is enabled, fill perimeter with same filament
            if (gapFillEnabled) {
                const gapFilamentName = values.gapFilament || 'Jade White';
                const gapFilamentColor = FILAMENT_COLOURS.find(f => f.n === gapFilamentName);
                const gapHex = gapFilamentColor ? gapFilamentColor.h : '#FFFFFF';
                
                ctx.fillStyle = gapHex;
                // Fill perimeter areas
                ctx.fillRect(0, 0, width, perimeterMargin); // Top
                ctx.fillRect(0, height - perimeterMargin, width, perimeterMargin); // Bottom
                ctx.fillRect(0, perimeterMargin, perimeterMargin, height - (perimeterMargin * 2)); // Left
                ctx.fillRect(width - perimeterMargin, perimeterMargin, perimeterMargin, height - (perimeterMargin * 2)); // Right
            } else {
                // Just draw border outline
                ctx.strokeStyle = '#808080';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(0, 0, width, height);
                
                // Fill with dark grey
                ctx.fillStyle = '#202020';
                ctx.fillRect(0, 0, width, perimeterMargin); // Top
                ctx.fillRect(0, height - perimeterMargin, width, perimeterMargin); // Bottom
                ctx.fillRect(0, perimeterMargin, perimeterMargin, height - (perimeterMargin * 2)); // Left
                ctx.fillRect(width - perimeterMargin, perimeterMargin, perimeterMargin, height - (perimeterMargin * 2)); // Right
            }
        }
        
        // Translate to inner grid area (after perimeter margin)
        ctx.translate(perimeterMargin, perimeterMargin);
        
        // Calculate inner grid dimensions (without margin)
        const innerWidth = width - (perimeterMargin * 2);
        const innerHeight = height - (perimeterMargin * 2);
        
        // Draw gap fill background if enabled
        if (gap > 0 && gapFillEnabled) {
            const gapFilamentName = values.gapFilament || 'Jade White';
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
                    // Skip if gap fill is enabled (gap color shows through)
                    if (!gapFillEnabled) {
                        ctx.fillStyle = '#404040';
                        ctx.fillRect(x, y, tileSize, tileSize);
                        
                        // Draw X
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
                
                // Determine color based on view mode (EXACT monolith behavior)
                let hexColor;
                if (viewMode === 'Combined' || viewMode === 'combined') {
                    // Show simulated final color (all layers)
                    const color = simColour(sequence, colours);
                    hexColor = rgb2hex(color);
                } else if (viewMode.startsWith('Layer ')) {
                    // Show specific layer only
                    const layerMatch = viewMode.match(/(\d+)/);
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
                
                // Fill tile
                ctx.fillStyle = hexColor;
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
        
        ctx.restore();
        
        // Draw stats below
        ctx.save();
        ctx.font = '12px "Atkinson Hyperlegible", monospace';
        ctx.textAlign = 'center';
        
        const y = canvas.height - 15;
        const centerX = canvas.width / 2;
        
        // Color-code based on fit
        ctx.fillStyle = gridData.fitsConstraints === false ? '#ff0000' : '#00ff00';
        
        const stats = `Sequences: ${sequences.length} | Grid: ${rows}×${cols} | Size: ${width.toFixed(1)}×${height.toFixed(1)}mm`;
        ctx.fillText(stats, centerX, y);
        
        if (gridData.fitsConstraints === false) {
            ctx.fillStyle = '#ffff00';
            ctx.fillText('⚠ OVERSIZED - Reduce layers/colors/tilesize', centerX, y - 20);
        }
        
        ctx.restore();
        
        // Draw constraint bounding boxes if available
        if (this.sharedState.gridConstraints) {
            this._drawConstraintBounds(ctx, canvas, gridData, this.sharedState.gridConstraints);
        }
    }
    
    _drawConstraintBounds(ctx, canvas, gridData, constraints) {
        const { width: gridWidth, height: gridHeight } = gridData;
        const { bedWidth, bedHeight, scanWidth, scanHeight } = constraints;
        
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
        ctx.font = 'bold 10px "Atkinson Hyperlegible", monospace';
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
        
        ctx.restore();
    }
    
    _drawScan(ctx, canvas, values) {
        // Draw scan image
        if (this.sharedState.scanImageElement) {
            ctx.drawImage(this.sharedState.scanImageElement, 0, 0, canvas.width, canvas.height);
            
            // Draw grid overlay if available
            if (this.sharedState.referenceGridData && this.sharedState.gridCalculated) {
                import('./MFP-ScanRenderer.js').then(({ drawScanOverlay }) => {
                    drawScanOverlay(ctx, canvas, this.sharedState);
                });
            }
        } else {
            this._drawPlaceholder(ctx, canvas, 'Upload Scan Image');
        }
    }
    
    _drawQuantize(ctx, canvas, values) {
        // Draw quantized or source image
        if (this.sharedState.quantizedImageElement) {
            ctx.drawImage(this.sharedState.quantizedImageElement, 0, 0, canvas.width, canvas.height);
        } else if (this.sharedState.sourceImageElement) {
            ctx.drawImage(this.sharedState.sourceImageElement, 0, 0, canvas.width, canvas.height);
        } else {
            this._drawPlaceholder(ctx, canvas, 'Load Source Image (QUANTIZE tab)');
        }
    }
    
    _drawExport(ctx, canvas, values) {
        const mode = values.canvasMode || 'Grid';
        
        // Draw based on mode
        if (mode === 'Grid' && this.sharedState.gridData) {
            import('./MFP-GridRenderer.js').then(({ drawCalibrationGrid }) => {
                drawCalibrationGrid(ctx, canvas, this.sharedState.gridData, this.sharedState.sequenceMap, values);
            });
        } else if (mode === 'Scan' && this.sharedState.scanImageElement) {
            ctx.drawImage(this.sharedState.scanImageElement, 0, 0, canvas.width, canvas.height);
        } else {
            this._drawPlaceholder(ctx, canvas, `${mode} View`);
        }
    }
    
    _drawPlaceholder(ctx, canvas, message) {
        ctx.fillStyle = '#808080';
        ctx.font = '16px "Atkinson Hyperlegible", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    }
    
    destroy() {
        // Clean up markdown component
        if (this.markdownComponent && this.markdownComponent.destroy) {
            this.markdownComponent.destroy();
        }
        
        // Clean up docs container
        if (this.docsContainer && this.docsContainer.parentNode) {
            this.docsContainer.parentNode.removeChild(this.docsContainer);
        }
        
        // Clean up info button
        if (this.infoButton && this.infoButton.parentNode) {
            this.infoButton.parentNode.removeChild(this.infoButton);
        }
        
        // Clean up toolBase
        if (this.toolBase) {
            this.toolBase.destroy();
        }
    }
}

// Register globally
if (typeof window !== 'undefined') {
    window.MultifilamentPrintTool = MultifilamentPrintTool;
}

console.log('✅ MultifilamentPrintTool loaded (FULL VERSION with ALL controls)');
