/**
 * MFP-Source.js - SOURCE tab module
 * 
 * Handles calibration grid generation:
 * - Filament selection (2-10 colors)
 * - Grid parameter configuration
 * - Sequence generation and sorting
 * - Grid preview and export (PNG, CSV, STL, ZIP)
 * - Project import/export
 * 
 * Uses ComponentLibrary - NO direct DOM manipulation!
 */

import { FilamentPicker } from '../../../shared/components/input/FilamentPicker.js';
import { NumericInput } from '../../../shared/component-library.js';
import { Dropdown } from '../../../shared/components/input/Dropdown.js';
import { FileInput } from '../../../shared/components/input/FileInput.js';
import { ToggleGroup } from '../../../shared/components/input/ToggleGroup.js';
import { StatusDisplay } from '../../../shared/component-library.js';
import { Button } from '../../../shared/component-library.js';

import { FILAMENT_COLOURS, DEFAULTS } from './MFP-Constants.js';
import { drawCalibrationGrid, drawGridStats, drawConstraintBounds, drawPlaceholder } from './MFP-GridRenderer.js';
import { generateGridFilename, buildSequenceMap } from './MFP-Utils.js';

// Import algorithms
import {
    generateSequences,
    calculateSequenceCount,
    sortSequences,
    getSortMethods
} from '../../../shared/algorithms/combinatorics/sequences.js';
import {
    simColour,
    rgb2hex,
    generateGPL
} from '../../../shared/algorithms/color/color-utils.js';
import {
    calculateGridLayout
} from '../../../shared/algorithms/layout/grid-layout.js';
import {
    exportGridCSV,
    downloadCSV
} from '../../../shared/algorithms/data/csv-export.js';

export class MFPSourceTab {
    constructor(sharedState) {
        this.state = sharedState;
        
        // UI components (tracked for cleanup)
        this.components = [];
        
        // Status displays
        this.gridStatus = null;
        this.sequenceStatus = null;
        this.exportStatus = null;
    }
    
    /**
     * Build sidebar using ComponentLibrary
     * Called by ToolBase when rendering sidebar
     */
    getSidebar(toolBase) {
        this.components = []; // Clear old components
        
        const importedState = this.state.importedState || {};
        
        // FILAMENT SELECTION
        const filamentPicker = new FilamentPicker({
            palette: FILAMENT_COLOURS,
            min: 2,
            max: 10,
            selectedIndices: this.state.selectedFilaments,
            label: 'Select Filaments (2-10)',
            placeholder: 'Choose colors...',
            onChange: (indices, colors) => this._handleFilamentChange(indices, colors, toolBase)
        });
        this.components.push(filamentPicker);
        
        // Grid status
        this.sequenceStatus = new StatusDisplay({
            status: 'idle',
            message: 'Select filaments to see sequence count'
        });
        this.components.push(this.sequenceStatus);
        
        // GRID PARAMETERS
        const bedWidthInput = new NumericInput({
            label: 'Bed Width (mm)',
            value: importedState.bedWidth || DEFAULTS.bedWidth,
            min: 100,
            max: 500,
            step: 1,
            onChange: (value) => toolBase.updateValue('bedWidth', value)
        });
        this.components.push(bedWidthInput);
        
        const bedHeightInput = new NumericInput({
            label: 'Bed Height (mm)',
            value: importedState.bedHeight || DEFAULTS.bedHeight,
            min: 100,
            max: 500,
            step: 1,
            onChange: (value) => toolBase.updateValue('bedHeight', value)
        });
        this.components.push(bedHeightInput);
        
        const scanWidthInput = new NumericInput({
            label: 'Scan Width (mm)',
            value: importedState.scanWidth || DEFAULTS.scanWidth,
            min: 100,
            max: 500,
            step: 1,
            onChange: (value) => toolBase.updateValue('scanWidth', value)
        });
        this.components.push(scanWidthInput);
        
        const scanHeightInput = new NumericInput({
            label: 'Scan Height (mm)',
            value: importedState.scanHeight || DEFAULTS.scanHeight,
            min: 100,
            max: 500,
            step: 1,
            onChange: (value) => toolBase.updateValue('scanHeight', value)
        });
        this.components.push(scanHeightInput);
        
        const tileSizeInput = new NumericInput({
            label: 'Tile Size (mm)',
            value: importedState.tileSize || DEFAULTS.tileSize,
            min: 3,
            max: 30,
            step: 0.5,
            onChange: (value) => toolBase.updateValue('tileSize', value)
        });
        this.components.push(tileSizeInput);
        
        const gapInput = new NumericInput({
            label: 'Gap (mm)',
            value: importedState.gap || DEFAULTS.gap,
            min: 0,
            max: 5,
            step: 0.1,
            onChange: (value) => toolBase.updateValue('gap', value)
        });
        this.components.push(gapInput);
        
        const perimeterMarginInput = new NumericInput({
            label: 'Perimeter Margin (mm)',
            value: importedState.perimeterMargin || DEFAULTS.perimeterMargin,
            min: 0,
            max: 10,
            step: 0.5,
            onChange: (value) => toolBase.updateValue('perimeterMargin', value)
        });
        this.components.push(perimeterMarginInput);
        
        const layerCountInput = new NumericInput({
            label: 'Layer Count',
            value: importedState.layerCount || DEFAULTS.layerCount,
            min: 2,
            max: 20,
            step: 1,
            onChange: (value) => {
                toolBase.updateValue('layerCount', value);
                this._updateSequenceCount(toolBase);
            }
        });
        this.components.push(layerCountInput);
        
        const baseLayersInput = new NumericInput({
            label: 'Base Layers',
            value: importedState.baseLayers || DEFAULTS.baseLayers,
            min: 0,
            max: 10,
            step: 1,
            onChange: (value) => toolBase.updateValue('baseLayers', value)
        });
        this.components.push(baseLayersInput);
        
        const topLayersInput = new NumericInput({
            label: 'Top Layers',
            value: importedState.topLayers || DEFAULTS.topLayers,
            min: 0,
            max: 10,
            step: 1,
            onChange: (value) => toolBase.updateValue('topLayers', value)
        });
        this.components.push(topLayersInput);
        
        // SORT METHOD
        const sortDropdown = new Dropdown({
            label: 'Sort Method',
            options: getSortMethods(),
            selected: importedState.sortMethod || DEFAULTS.sortMethod,
            onChange: (value) => toolBase.updateValue('sortMethod', value)
        });
        this.components.push(sortDropdown);
        
        // SHOW CONSTRAINTS
        const showConstraintsToggle = new ToggleGroup({
            options: [{ label: 'Show Bed/Scan Constraints', value: 'constraints' }],
            selected: [],
            multiSelect: false,
            onChange: (selected) => {
                toolBase.updateValue('showConstraints', selected.includes('constraints'));
                toolBase.draw();
            }
        });
        this.components.push(showConstraintsToggle);
        
        // GENERATE BUTTON
        const generateBtn = new Button({
            label: 'Generate Calibration Grid',
            variant: 'primary',
            onClick: () => this._generateGrid(toolBase)
        });
        this.components.push(generateBtn);
        
        this.gridStatus = new StatusDisplay({
            status: 'idle',
            message: ''
        });
        this.components.push(this.gridStatus);
        
        // EXPORT SECTION
        const exportPNGBtn = new Button({
            label: 'Export Grid PNG',
            onClick: () => this._exportGridPNG(toolBase)
        });
        this.components.push(exportPNGBtn);
        
        const exportCSVBtn = new Button({
            label: 'Export Grid CSV',
            onClick: () => this._exportGridCSV(toolBase)
        });
        this.components.push(exportCSVBtn);
        
        const exportCompleteBtn = new Button({
            label: 'Export Complete Package',
            variant: 'primary',
            onClick: () => this._exportCompletePackage(toolBase)
        });
        this.components.push(exportCompleteBtn);
        
        this.exportStatus = new StatusDisplay({
            status: 'idle',
            message: ''
        });
        this.components.push(this.exportStatus);
        
        // IMPORT SECTION
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
        
        return this.components;
    }
    
    /**
     * Handle filament selection change
     */
    _handleFilamentChange(indices, colors, toolBase) {
        this.state.selectedFilaments = indices;
        this._updateSequenceCount(toolBase);
    }
    
    /**
     * Update sequence count display
     */
    _updateSequenceCount(toolBase) {
        const values = toolBase.values;
        const filamentCount = this.state.selectedFilaments.length;
        const layerCount = values.layerCount || DEFAULTS.layerCount;
        
        if (filamentCount < 2) {
            this.sequenceStatus.setStatus('idle', 'Select at least 2 filaments');
            return;
        }
        
        const count = calculateSequenceCount(filamentCount, layerCount);
        const message = `${count.toLocaleString()} sequences for ${filamentCount} colors × ${layerCount} layers`;
        
        if (count > 10000) {
            this.sequenceStatus.setStatus('warning', `⚠️ ${message} (may be slow)`);
        } else {
            this.sequenceStatus.setStatus('info', message);
        }
    }
    
    /**
     * Generate calibration grid
     */
    async _generateGrid(toolBase) {
        const values = toolBase.values;
        
        // Validate
        if (this.state.selectedFilaments.length < 2) {
            this.gridStatus.setStatus('error', '❌ Select at least 2 filaments');
            return;
        }
        
        try {
            this.gridStatus.setStatus('info', '⏳ Generating sequences...');
            
            // Get selected colors
            const colours = this.state.selectedFilaments.map(idx => FILAMENT_COLOURS[idx]);
            
            // Generate sequences
            const sequences = generateSequences(colours.length, values.layerCount || DEFAULTS.layerCount);
            
            // Sort sequences
            const sorted = sortSequences(
                sequences,
                colours,
                values.sortMethod || DEFAULTS.sortMethod,
                simColour
            );
            
            this.gridStatus.setStatus('info', '⏳ Calculating grid layout...');
            
            // Calculate grid layout
            const gridLayout = calculateGridLayout({
                sequences: sorted,
                maxWidth: values.bedWidth || DEFAULTS.bedWidth,
                maxHeight: values.bedHeight || DEFAULTS.bedHeight,
                tileSize: values.tileSize || DEFAULTS.tileSize,
                gap: values.gap || DEFAULTS.gap,
                perimeterMargin: values.perimeterMargin || DEFAULTS.perimeterMargin
            });
            
            // Store grid data
            this.state.gridData = {
                sequences: sorted,
                colours,
                rows: gridLayout.rows,
                cols: gridLayout.cols,
                tileSize: values.tileSize || DEFAULTS.tileSize,
                gap: values.gap || DEFAULTS.gap,
                perimeterMargin: values.perimeterMargin || DEFAULTS.perimeterMargin,
                width: gridLayout.width,
                height: gridLayout.height,
                layerCount: values.layerCount || DEFAULTS.layerCount,
                baseLayers: values.baseLayers || DEFAULTS.baseLayers,
                topLayers: values.topLayers || DEFAULTS.topLayers,
                sortMethod: values.sortMethod || DEFAULTS.sortMethod,
                fitsConstraints: gridLayout.width <= (values.bedWidth || DEFAULTS.bedWidth) &&
                                gridLayout.height <= (values.bedHeight || DEFAULTS.bedHeight),
                timestamp: Date.now()
            };
            
            // Build sequence map for color simulation
            this.state.sequenceMap = buildSequenceMap(sorted, colours, simColour);
            
            // Set as reference for scan analysis
            this.state.referenceGridData = this.state.gridData;
            
            // Store in localStorage
            localStorage.setItem('multifilament_last_grid', JSON.stringify(this.state.gridData));
            
            // Draw
            toolBase.draw();
            
            const msg = `✅ Grid: ${colours.length}c${this.state.gridData.layerCount}L | ${gridLayout.rows}×${gridLayout.cols} (${sorted.length} tiles)`;
            this.gridStatus.setStatus('success', msg);
            
        } catch (err) {
            console.error('Grid generation error:', err);
            this.gridStatus.setStatus('error', `❌ Generation failed: ${err.message}`);
        }
    }
    
    /**
     * Export grid as PNG
     */
    async _exportGridPNG(toolBase) {
        if (!this.state.gridData) {
            this.exportStatus.setStatus('error', '❌ Generate grid first');
            return;
        }
        
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1200;
            canvas.height = 1200;
            const ctx = canvas.getContext('2d');
            
            drawCalibrationGrid(ctx, canvas, this.state.gridData, simColour, rgb2hex, 'combined');
            
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = generateGridFilename(this.state.gridData, 'cal', 'png');
            a.click();
            URL.revokeObjectURL(url);
            
            this.exportStatus.setStatus('success', '✅ PNG exported');
        } catch (err) {
            console.error('PNG export error:', err);
            this.exportStatus.setStatus('error', `❌ Export failed: ${err.message}`);
        }
    }
    
    /**
     * Export grid as CSV
     */
    _exportGridCSV(toolBase) {
        if (!this.state.gridData) {
            this.exportStatus.setStatus('error', '❌ Generate grid first');
            return;
        }
        
        try {
            const csv = exportGridCSV(this.state.gridData);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = generateGridFilename(this.state.gridData, 'cal', 'csv');
            a.click();
            URL.revokeObjectURL(url);
            
            this.exportStatus.setStatus('success', '✅ CSV exported');
        } catch (err) {
            console.error('CSV export error:', err);
            this.exportStatus.setStatus('error', `❌ Export failed: ${err.message}`);
        }
    }
    
    /**
     * Export complete package (delegates to MFP-ProjectIO)
     */
    async _exportCompletePackage(toolBase) {
        if (!this.state.gridData) {
            this.exportStatus.setStatus('error', '❌ Generate grid first');
            return;
        }
        
        this.exportStatus.setStatus('info', '⏳ Exporting complete package...');
        
        // TODO: Import and call MFP-ProjectIO.exportProject()
        // For now, placeholder
        this.exportStatus.setStatus('warning', '⚠️ Complete package export: TODO (Phase 4)');
    }
    
    /**
     * Import project ZIP (delegates to MFP-ProjectIO)
     */
    async _importProject(file, toolBase) {
        this.gridStatus.setStatus('info', '⏳ Importing project...');
        
        // TODO: Import and call MFP-ProjectIO.importProject()
        // For now, placeholder
        this.gridStatus.setStatus('warning', '⚠️ Project import: TODO (Phase 4)');
    }
    
    /**
     * Import grid CSV (delegates to MFP-ProjectIO)
     */
    async _importCSV(file, toolBase) {
        this.gridStatus.setStatus('info', '⏳ Importing CSV...');
        
        // TODO: Import and call MFP-ProjectIO.importCSV()
        // For now, placeholder
        this.gridStatus.setStatus('warning', '⚠️ CSV import: TODO (Phase 4)');
    }
    
    /**
     * Handle value updates from ToolBase
     */
    onUpdate(key, value, allValues, toolBase) {
        // Redraw if needed
        if (['showConstraints', 'perimeterMargin'].includes(key)) {
            toolBase.draw();
        }
    }
    
    /**
     * Draw canvas
     */
    onDraw(ctx, canvas, values) {
        if (this.state.gridData) {
            drawCalibrationGrid(ctx, canvas, this.state.gridData, simColour, rgb2hex, 'combined');
            drawGridStats(ctx, canvas, this.state.gridData);
            
            if (values.showConstraints) {
                const constraints = {
                    bedWidth: values.bedWidth || DEFAULTS.bedWidth,
                    bedHeight: values.bedHeight || DEFAULTS.bedHeight,
                    scanWidth: values.scanWidth || DEFAULTS.scanWidth,
                    scanHeight: values.scanHeight || DEFAULTS.scanHeight
                };
                drawConstraintBounds(ctx, canvas, this.state.gridData, constraints);
            }
        } else {
            drawPlaceholder(ctx, canvas, 'Select filaments and click Generate Grid');
        }
    }
    
    /**
     * Tab activation (called when switching to this tab)
     */
    onActivate(toolBase) {
        this._updateSequenceCount(toolBase);
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
    }
}

