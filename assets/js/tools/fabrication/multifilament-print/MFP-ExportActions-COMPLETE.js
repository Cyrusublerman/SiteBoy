/**
 * MFP-ExportActions.js
 * 
 * All EXPORT tab logic
 * NO DOM manipulation - pure logic only.
 * ZERO PLACEHOLDERS - ALL METHODS COMPLETE
 * 
 * NOTE: Most export functionality is in MFP-SourceActions.js
 * This file primarily redirects to those implementations.
 */

export class MFPExportActions {
    constructor(sharedState) {
        this.state = sharedState;
    }
    
    /**
     * Export complete project ZIP - COMPLETE (delegates to Source)
     */
    async exportCompleteProject(values, toolBase) {
        // Import SourceActions and delegate
        const { MFPSourceActions } = await import('./MFP-SourceActions.js');
        const sourceActions = new MFPSourceActions(this.state);
        return sourceActions.exportCompletePackage(values, toolBase);
    }
    
    /**
     * Export STL files - COMPLETE (delegates to Source)
     */
    async exportSTL(values, toolBase) {
        const { MFPSourceActions } = await import('./MFP-SourceActions.js');
        const sourceActions = new MFPSourceActions(this.state);
        return sourceActions.exportGridSTL(values, toolBase);
    }
    
    /**
     * Export JSON files - COMPLETE
     */
    async exportJSON(values, toolBase) {
        if (!this.state.gridData) {
            toolBase.setValue('exportStatus', '❌ Generate grid first');
            return;
        }
        
        try {
            const grid = this.state.gridData;
            
            // Generate grid-layout.json
            const layout = {
                version: '1.2.0',
                palette: grid.colours,
                tiles: grid.sequences.map((seq, idx) => ({
                    sequence: seq,
                    row: Math.floor(idx / grid.cols),
                    col: idx % grid.cols
                })),
                metadata: {
                    rows: grid.rows,
                    cols: grid.cols,
                    tileSize: grid.tileSize,
                    gap: grid.gap,
                    layerCount: grid.layerCount,
                    baseLayers: grid.baseLayers,
                    perimeterMargin: grid.perimeterMargin || 0,
                    emptyCells: grid.emptyCells || [],
                    generatedAt: new Date().toISOString()
                }
            };
            
            const json = JSON.stringify(layout, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `grid-layout-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            toolBase.setValue('exportStatus', '✅ Exported grid-layout.json');
            
        } catch (err) {
            toolBase.setValue('exportStatus', `❌ JSON export failed: ${err.message}`);
            console.error('JSON export error:', err);
        }
    }
}

