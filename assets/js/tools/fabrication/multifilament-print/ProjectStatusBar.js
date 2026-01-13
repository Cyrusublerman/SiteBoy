/**
 * ProjectStatusBar - Persistent status display for MFP tool
 * 
 * Shows grid and scan info across all tabs.
 * Extends BaseComponent following site standards.
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../../shared/foundation.js';

export class ProjectStatusBar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'project-status-bar' }, deps);
        
        // Data
        this.gridInfo = options.gridInfo ?? null; // {colors, layers, rows, cols, tiles, sortMethod}
        this.scanInfo = options.scanInfo ?? null; // {analyzed, avgDeviation}
        
        // Callbacks
        this.onClear = options.onClear ?? (() => {});
        
        // Child elements (tracked for cleanup)
        this.gridLabel = null;
        this.scanLabel = null;
        this.clearBtn = null;
    }
    
    render() {
        if (this.element) return this.element;
        
        const { F, F2 } = this.getF();
        
        this.element = this.createElement('div', 'project-status-bar component');
        this.element.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: ${F2}px;
            padding: ${F}px ${F2}px;
            background: var(--c-bg-secondary);
            border: 1px solid var(--vga-cyan);
            border-radius: 0;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F * 0.86}px;
            position: sticky;
            top: 0;
            z-index: 100;
        `;
        
        // Left section - Grid info
        this.gridLabel = this.createElement('div', 'grid-info');
        this.gridLabel.style.cssText = `
            color: var(--vga-green);
            flex: 1;
        `;
        this._updateGridLabel();
        this.element.appendChild(this.gridLabel);
        
        // Middle section - Scan info
        this.scanLabel = this.createElement('div', 'scan-info');
        this.scanLabel.style.cssText = `
            color: var(--vga-yellow);
            flex: 1;
        `;
        this._updateScanLabel();
        this.element.appendChild(this.scanLabel);
        
        // Right section - Clear button
        this.clearBtn = this.createElement('button', 'clear-btn');
        this.clearBtn.textContent = 'Clear Project';
        this.clearBtn.style.cssText = `
            background: var(--c-bg);
            color: var(--vga-red);
            border: 1px solid var(--vga-red);
            padding: ${F * 0.43}px ${F}px;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F * 0.79}px;
            cursor: pointer;
            text-transform: uppercase;
        `;
        
        this.clearBtn.addEventListener('click', () => {
            this.onClear();
        });
        
        this.clearBtn.addEventListener('mouseenter', () => {
            this.clearBtn.style.background = 'var(--vga-red)';
            this.clearBtn.style.color = 'var(--c-bg)';
        });
        
        this.clearBtn.addEventListener('mouseleave', () => {
            this.clearBtn.style.background = 'var(--c-bg)';
            this.clearBtn.style.color = 'var(--vga-red)';
        });
        
        this.element.appendChild(this.clearBtn);
        
        return this.element;
    }
    
    _updateGridLabel() {
        if (!this.gridLabel) return;
        
        if (this.gridInfo) {
            const { colors, layers, rows, cols, tiles, sortMethod } = this.gridInfo;
            const colorNames = this.gridInfo.colorNames ? ` (${this.gridInfo.colorNames.join(', ')})` : '';
            this.gridLabel.innerHTML = `
                <strong>Grid:</strong> ${colors}c${layers}L | ${rows}×${cols} (${tiles} tiles) | Sort: ${sortMethod}${colorNames}
            `;
        } else {
            this.gridLabel.innerHTML = '<span style="color: var(--c-text-dim);">No grid loaded</span>';
        }
    }
    
    _updateScanLabel() {
        if (!this.scanLabel) return;
        
        if (this.scanInfo && this.scanInfo.analyzed) {
            const { tiles, avgDeviation } = this.scanInfo;
            this.scanLabel.innerHTML = `
                <strong>Scan:</strong> ${tiles} tiles analyzed | Avg Δ: ${avgDeviation}
            `;
        } else if (this.gridInfo) {
            this.scanLabel.innerHTML = '<span style="color: var(--c-text-dim);">No scan analysis (optional)</span>';
        } else {
            this.scanLabel.innerHTML = '';
        }
    }
    
    // PUBLIC API
    
    setGridInfo(info) {
        this.gridInfo = info;
        this._updateGridLabel();
        this._updateScanLabel();
    }
    
    setScanInfo(info) {
        this.scanInfo = info;
        this._updateScanLabel();
    }
    
    clear() {
        this.gridInfo = null;
        this.scanInfo = null;
        this._updateGridLabel();
        this._updateScanLabel();
    }
    
    destroy() {
        if (this.clearBtn) {
            this.clearBtn.removeEventListener('click', this.onClear);
            this.clearBtn.removeEventListener('mouseenter', null);
            this.clearBtn.removeEventListener('mouseleave', null);
        }
        
        super.destroy();
    }
}

