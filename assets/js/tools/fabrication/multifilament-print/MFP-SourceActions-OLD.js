/**
 * MFP-SourceActions.js
 * 
 * All SOURCE tab logic - grid generation, export, etc.
 * NO DOM manipulation - pure logic only.
 */

import { FILAMENT_COLOURS, DEFAULTS } from './MFP-Constants.js';

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
            toolBase.updateValue('projectStatus', '⏳ Loading project...');
            
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
                            index: idx,
                            isEmpty: false
                        })),
                        gridSize: {
                            rows: config.rows,
                            cols: config.cols
                        },
                        dimensions: {
                            width: config.width,
                            height: config.height,
                            tileSize: config.tileSize
                        },
                        tileSize: config.tileSize,
                        gap: config.gap !== undefined ? config.gap : 1,
                        layerCount: config.layerCount,
                        baseLayers: config.baseLayers || 3,
                        topLayers: config.topLayers || 0,
                        sortMethod: config.sortMethod || 'Layer Count'
                    };
                    console.log('✅ Loaded grid-config.json (converted to layout format)');
                }
            }
            
            if (!layout) {
                throw new Error('No grid data found in ZIP (missing grid-layout.json or grid-config.json)');
            }
            
            // Ensure palette exists (handle old format)
            if (!layout.palette && layout.colours) {
                layout.palette = layout.colours.map(c => ({
                    name: c.n || c.name,
                    hex: c.h || c.hex
                }));
            }
            
            // Reconstruct gridData
            const colours = layout.palette.map(p => ({
                h: p.hex || p.h,
                n: p.name || p.n
            }));
            
            this.state.gridData = {
                sequences: layout.tiles.map(t => t.sequence),
                colours,
                rows: layout.gridSize.rows,
                cols: layout.gridSize.cols,
                tileSize: layout.tileSize || layout.dimensions?.tileSize || 10,
                gapSize: layout.gap !== undefined ? layout.gap : 1,
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
            
            this.state.sequences = this.state.gridData.sequences;
            
            // Update selected filaments
            this.state.selectedFilaments = colours.map(c => 
                FILAMENT_COLOURS.findIndex(fc => fc.n === c.n)
            ).filter(i => i !== -1);
            
            // Store in localStorage
            localStorage.setItem('multifilament_last_grid', JSON.stringify(this.state.gridData));
            
            // Update UI
            const fileCount = Object.keys(zipData.files).length;
            const statusMsg = `✅ Project loaded: ${colours.length}c${layout.layerCount}L ${layout.gridSize.rows}×${layout.gridSize.cols} grid (${fileCount} files)`;
            
            toolBase.updateValue('projectStatus', statusMsg);
            toolBase.updateValue('gridStatus', `✅ Grid loaded from project (Sort: ${this.state.gridData.sortMethod})`);
            
            // Update filament picker
            const filamentPicker = toolBase.components.get('filamentPicker');
            if (filamentPicker && filamentPicker.setSelectedIndices) {
                filamentPicker.setSelectedIndices(this.state.selectedFilaments);
            }
            
            this.updateSequenceCount(toolBase);
            toolBase.draw();
            
            console.log('✅ Project import complete!');
            
        } catch (err) {
            console.error('Import error:', err);
            toolBase.updateValue('projectStatus', `❌ Import failed: ${err.message}`);
        }
    }
    
    /**
     * Generate grid with selected filaments and settings
     */
    generateGrid(values, toolBase) {
        const selectedFilaments = this.state.selectedFilaments || [];
        
        if (selectedFilaments.length < 2) {
            toolBase.updateValue('gridStatus', '❌ Select at least 2 filaments');
            return;
        }
        
        try {
            toolBase.updateValue('gridStatus', '⏳ Generating grid...');
            
            // TODO: Implement full grid generation algorithm
            // - Generate all unique sequences
            // - Calculate grid dimensions
            // - Apply sorting
            // - Store in this.state.gridData
            
            // Placeholder: Simple test grid
            const cols = Math.floor(values.bedWidth / (values.tileSize + values.gap));
            const rows = Math.floor(values.bedHeight / (values.tileSize + values.gap));
            const totalTiles = cols * rows;
            
            const sequences = [];
            for (let i = 0; i < totalTiles; i++) {
                const seq = [];
                for (let l = 0; l < values.layerCount; l++) {
                    seq.push((i + l) % selectedFilaments.length);
                }
                sequences.push(seq);
            }
            
            this.state.gridData = {
                cols,
                rows,
                tileSize: values.tileSize,
                gapSize: values.gap,
                layerCount: values.layerCount,
                colours: selectedFilaments.map(idx => FILAMENT_COLOURS[idx]),
                sequences,
                width: cols * (values.tileSize + values.gap) - values.gap,
                height: rows * (values.tileSize + values.gap) - values.gap,
                sortMethod: values.sortMethod || 'Layer Count'
            };
            
            this.state.sequences = sequences;
            
            // Save to localStorage
            localStorage.setItem('multifilament_last_grid', JSON.stringify(this.state.gridData));
            
            toolBase.updateValue('gridStatus', `✅ Generated ${sequences.length} tiles (${cols}×${rows})`);
            toolBase.updateValue('sequenceCount', `${sequences.length} unique sequences`);
            
            toolBase.draw();
            
        } catch (err) {
            console.error('Grid generation error:', err);
            toolBase.updateValue('gridStatus', `❌ Error: ${err.message}`);
        }
    }
    
    /**
     * Generate split grids
     */
    generateSplitGrids(values, toolBase) {
        toolBase.updateValue('gridStatus', '⏳ Split grids: TODO - implement from monolith');
    }
    
    /**
     * Export grid as PNG
     */
    exportGridPNG(toolBase) {
        if (!this.state.gridData) {
            toolBase.updateValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        toolBase.updateValue('exportStatus', '⏳ Export PNG: TODO - implement rendering & download');
    }
    
    /**
     * Export grid as STL files
     */
    exportGridSTL(toolBase) {
        if (!this.state.gridData) {
            toolBase.updateValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        toolBase.updateValue('exportStatus', '⏳ Export STL: TODO - implement 3D generation');
    }
    
    /**
     * Export grid as CSV
     */
    exportGridCSV(toolBase) {
        if (!this.state.gridData) {
            toolBase.updateValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        toolBase.updateValue('exportStatus', '⏳ Export CSV: TODO - implement CSV generation');
    }
    
    /**
     * Export complete package (ZIP with everything)
     */
    exportCompletePackage(toolBase) {
        if (!this.state.gridData) {
            toolBase.updateValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        toolBase.updateValue('exportStatus', '⏳ Export package: TODO - implement ZIP packaging');
    }
    
    /**
     * Update sequence count display
     */
    updateSequenceCount(toolBase) {
        const count = this.state.selectedFilaments?.length || 0;
        const msg = count < 2 
            ? `⚠️ Select at least 2 filaments (${count} selected)` 
            : `${count} filaments selected. Click Generate Grid.`;
        
        toolBase.updateValue('gridStatus', msg);
        
        if (this.state.sequences) {
            toolBase.updateValue('sequenceCount', `${this.state.sequences.length} sequences generated`);
        }
    }
}

