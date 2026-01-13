/**
 * MFP-Export.js - EXPORT tab module
 * 
 * Handles project export:
 * - Export grid as PNG/CSV/STL
 * - Export complete project ZIP (includes scan analysis)
 * - Export status tracking
 * 
 * Uses ComponentLibrary - NO direct DOM manipulation!
 */

import { Button } from '../../../shared/component-library.js';
import { StatusDisplay } from '../../../shared/component-library.js';
import { ProjectStatusBar } from './ProjectStatusBar.js';

export class MFPExportTab {
    constructor(sharedState) {
        this.state = sharedState;
        this.components = [];
        this.exportStatus = null;
        this.projectStatus = null;
    }
    
    /**
     * Build sidebar using ComponentLibrary
     */
    getSidebar(toolBase) {
        this.components = [];
        
        // PROJECT STATUS
        this.projectStatus = new ProjectStatusBar();
        this.components.push(this.projectStatus);
        
        // Update project status with current data
        if (this.state.referenceGridData) {
            this.projectStatus.setGridInfo(
                this.state.referenceGridData.colours.length,
                this.state.referenceGridData.layerCount,
                this.state.referenceGridData.rows,
                this.state.referenceGridData.cols
            );
        }
        if (this.state.scanAnalysis) {
            this.projectStatus.setScanInfo(this.state.scanAnalysis.length);
        }
        
        // EXPORT GRID ONLY
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
        
        const exportSTLBtn = new Button({
            label: 'Export Grid STL',
            onClick: () => this._exportGridSTL(toolBase)
        });
        this.components.push(exportSTLBtn);
        
        // EXPORT COMPLETE PROJECT
        const exportProjectBtn = new Button({
            label: 'Export Complete Project ZIP',
            variant: 'primary',
            onClick: () => this._exportCompleteProject(toolBase)
        });
        this.components.push(exportProjectBtn);
        
        this.exportStatus = new StatusDisplay({
            status: 'idle',
            message: ''
        });
        this.components.push(this.exportStatus);
        
        return this.components;
    }
    
    /**
     * Export grid as PNG
     */
    _exportGridPNG(toolBase) {
        if (!this.state.referenceGridData) {
            this.exportStatus.setStatus('error', '❌ Generate grid first');
            return;
        }
        
        try {
            // TODO: Render grid to temp canvas and download
            this.exportStatus.setStatus('info', 'Export PNG: TODO');
            
        } catch (err) {
            console.error('PNG export error:', err);
            this.exportStatus.setStatus('error', `❌ Export failed: ${err.message}`);
        }
    }
    
    /**
     * Export grid as CSV
     */
    _exportGridCSV(toolBase) {
        if (!this.state.referenceGridData) {
            this.exportStatus.setStatus('error', '❌ Generate grid first');
            return;
        }
        
        try {
            // TODO: Generate CSV and download
            this.exportStatus.setStatus('info', 'Export CSV: TODO');
            
        } catch (err) {
            console.error('CSV export error:', err);
            this.exportStatus.setStatus('error', `❌ Export failed: ${err.message}`);
        }
    }
    
    /**
     * Export grid as STL
     */
    _exportGridSTL(toolBase) {
        if (!this.state.referenceGridData) {
            this.exportStatus.setStatus('error', '❌ Generate grid first');
            return;
        }
        
        try {
            // TODO: Generate STL and download
            this.exportStatus.setStatus('info', 'Export STL: TODO');
            
        } catch (err) {
            console.error('STL export error:', err);
            this.exportStatus.setStatus('error', `❌ Export failed: ${err.message}`);
        }
    }
    
    /**
     * Export complete project as ZIP
     */
    async _exportCompleteProject(toolBase) {
        if (!this.state.referenceGridData) {
            this.exportStatus.setStatus('error', '❌ Generate grid first');
            return;
        }
        
        try {
            this.exportStatus.setStatus('info', '⏳ Building project ZIP...');
            
            // TODO: Use MFP-ProjectIO to build ZIP
            // - Include grid files (PNG, CSV, STL, JSON)
            // - Include scan analysis if available
            // - Include quantization config if available
            
            this.exportStatus.setStatus('success', '✅ Project exported (placeholder)');
            
        } catch (err) {
            console.error('Project export error:', err);
            this.exportStatus.setStatus('error', `❌ Export failed: ${err.message}`);
        }
    }
    
    /**
     * Handle value updates
     */
    onUpdate(key, value, allValues, toolBase) {
        // No canvas for this tab
    }
    
    /**
     * Draw canvas
     */
    onDraw(ctx, canvas, values) {
        // Show export preview or message
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff00';
        ctx.font = '16px "Atkinson Hyperlegible", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.state.referenceGridData) {
            ctx.fillText('Ready to Export', canvas.width / 2, canvas.height / 2 - 12);
            ctx.fillText(`${this.state.referenceGridData.sequences.length} tiles`, canvas.width / 2, canvas.height / 2 + 12);
        } else {
            ctx.fillText('Generate grid in SOURCE tab', canvas.width / 2, canvas.height / 2);
        }
    }
    
    /**
     * Tab activation
     */
    onActivate(toolBase) {
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

