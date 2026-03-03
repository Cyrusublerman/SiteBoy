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
            showDocs: false,  // Documentation viewer toggle
            exportSTLData: null  // { stls, layerMaps, filamentNames, palette, config }
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
                fillContainer: true,  // Dynamic sizing to fill available space
                displayMode: 'fit',   // Fit content within container
                enableZoom: true,     // Mouse wheel zoom for calibration
                enablePan: true,      // Drag to pan for calibration
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
        
        // Add canvas toolbar (view dropdown + save/load) to canvas area
        this._addCanvasToolbar();
    }
    
    _addInfoButton() {
        // Get canvas container
        const canvasArea = this.container.querySelector('.tool-canvas-area');
        if (!canvasArea) {
            console.warn('Canvas area not found, cannot add info button');
            return;
        }
        
        // Ensure canvas area is position: relative
        const currentPosition = window.getComputedStyle(canvasArea).position;
        if (currentPosition === 'static') {
            canvasArea.style.position = 'relative';
        }
        
        // Create info button - 2F square, flush top-right, ALWAYS visible
        const infoButton = document.createElement('button');
        infoButton.className = 'info-button';
        infoButton.textContent = 'i';
        infoButton.title = 'Toggle Documentation';
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
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 200;
            margin: 0;
            padding: 0;
        `;
        
        // Hover + active state management
        const updateButtonStyle = () => {
            if (this.sharedState.showDocs) {
            infoButton.style.background = 'var(--c-text)';
            infoButton.style.color = 'var(--c-bg)';
            } else {
            infoButton.style.background = 'var(--c-bg)';
            infoButton.style.color = 'var(--c-text)';
            }
        };
        
        infoButton.addEventListener('mouseenter', () => {
            infoButton.style.background = 'var(--c-text)';
            infoButton.style.color = 'var(--c-bg)';
        });
        infoButton.addEventListener('mouseleave', updateButtonStyle);
        
        // Click handler - toggle docs
        infoButton.addEventListener('click', () => {
            this.sharedState.showDocs = !this.sharedState.showDocs;
            this._updateDocumentation();
            updateButtonStyle();
        });
        
        canvasArea.appendChild(infoButton);
        this.infoButton = infoButton;
        
        // Watch for tab changes via sidebar tabs
        this._setupTabChangeListener();
    }
    
    _addCanvasToolbar() {
        const canvasArea = this.container.querySelector('.tool-canvas-area');
        if (!canvasArea) return;

        const F = this.toolBase?.F || 14;

        const bar = document.createElement('div');
        bar.className = 'mfp-canvas-toolbar';
        bar.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: ${F * 2}px;
            height: ${F * 2}px;
            display: flex;
            flex-direction: row;
            align-items: stretch;
            z-index: 190;
            box-sizing: border-box;
            pointer-events: none;
        `;

        const mkBtn = (text, isLast) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = text;
            btn.style.cssText = `
                width: 25%;
                height: ${F * 2}px;
                padding: 0 ${F}px;
                border: none;
                border-bottom: 1px solid var(--c-border);
                ${isLast ? '' : 'border-right: 1px solid var(--c-border);'}
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                text-transform: uppercase;
                cursor: pointer;
                white-space: nowrap;
                box-sizing: border-box;
                pointer-events: auto;
            `;
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'var(--c-text)';
                btn.style.color = 'var(--c-bg)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'var(--c-bg)';
                btn.style.color = 'var(--c-text)';
            });
            return btn;
        };

        // View dropdown — custom trigger + menu to match tab styling
        const viewCell = document.createElement('div');
        viewCell.style.cssText = `
            width: 50%;
            position: relative;
            display: flex;
            align-items: stretch;
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            box-sizing: border-box;
            pointer-events: auto;
        `;

        const viewTrigger = document.createElement('button');
        viewTrigger.type = 'button';
        viewTrigger.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: ${F * 2}px;
            padding: 0 ${F}px;
            border: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            text-transform: uppercase;
            cursor: pointer;
        `;

        const viewLabel = document.createElement('span');
        viewLabel.textContent = 'AUTO';
        const viewArrow = document.createElement('span');
        viewArrow.textContent = '+';
        viewArrow.style.marginLeft = `${F / 2}px`;

        viewTrigger.appendChild(viewLabel);
        viewTrigger.appendChild(viewArrow);
        viewCell.appendChild(viewTrigger);

        const viewMenu = document.createElement('div');
        viewMenu.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            left: 0; right: 0;
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            border-top: none;
            z-index: 200;
        `;
        viewCell.appendChild(viewMenu);

        let menuOpen = false;
        const openMenu = () => {
            viewMenu.style.display = 'block';
            viewArrow.textContent = '-';
            menuOpen = true;
        };
        const closeMenu = () => {
            viewMenu.style.display = 'none';
            viewArrow.textContent = '+';
            menuOpen = false;
        };
        viewTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menuOpen ? closeMenu() : openMenu();
        });
        document.addEventListener('click', (e) => {
            if (!viewCell.contains(e.target)) closeMenu();
        });

        this._canvasToolbarViewLabel = viewLabel;
        this._canvasToolbarViewMenu = viewMenu;
        this._canvasToolbarCloseMenu = closeMenu;

        // Load button
        const loadBtn = mkBtn('LOAD', false);
        loadBtn.addEventListener('click', () => {
            this._triggerFileUpload('.json,.zip', async (file) => {
                if (file.name.endsWith('.zip')) {
                    await this.sourceActions.importProject(file, this.toolBase);
                } else {
                    await this.quantizeActions.loadPaletteFromJSON(file, this.toolBase);
                }
                this._refreshTabStatus(this._getCurrentTab());
                this.toolBase.draw();
            });
        });

        // Save button
        const saveBtn = mkBtn('SAVE', true);
        saveBtn.addEventListener('click', () => {
            const allValues = this.toolBase.getValues();
            this.exportActions.exportCompleteProject(allValues, this.toolBase);
        });

        bar.appendChild(viewCell);
        bar.appendChild(loadBtn);
        bar.appendChild(saveBtn);
        canvasArea.appendChild(bar);

        this._canvasToolbar = bar;
        this.sharedState.canvasToolbarView = 'auto';

        // Populate initial view options for default tab
        this._updateToolbarViewOptions();
    }

    _updateToolbarViewOptions() {
        const menu = this._canvasToolbarViewMenu;
        const label = this._canvasToolbarViewLabel;
        if (!menu || !label) return;

        const F = this.toolBase?.F || 14;
        const tab = this._getCurrentTab();

        menu.innerHTML = '';

        const viewsForTab = {
            'SOURCE':   [['auto', 'AUTO'], ['grid', 'GRID']],
            'SCAN':     [['auto', 'AUTO'], ['scan', 'SCAN IMAGE'], ['overlay', 'SCAN + GRID']],
            'QUANTIZE': [['auto', 'AUTO'], ['source', 'SOURCE IMAGE'], ['adjusted', 'ADJUSTED IMAGE'], ['quantised', 'QUANTISED IMAGE'],
                         ['analysis', 'ANALYSIS COMPOSITE'],
                         ['artCombined', 'ARTWORK COMBINED'], ['artAll', 'ARTWORK ALL LAYERS'],
                         ['artL0', 'ARTWORK LAYER 0'], ['artL1', 'ARTWORK LAYER 1'], ['artL2', 'ARTWORK LAYER 2'], ['artL3', 'ARTWORK LAYER 3']],
            'OUTPUTS':  [['auto', 'AUTO'], ['quantised', 'QUANTISED IMAGE'],
                         ['gridCombined', 'GRID COMBINED'], ['gridL0', 'GRID LAYER 0'], ['gridL1', 'GRID LAYER 1'], ['gridL2', 'GRID LAYER 2'], ['gridL3', 'GRID LAYER 3'],
                         ['artCombined', 'ARTWORK COMBINED'], ['artAll', 'ARTWORK ALL LAYERS'],
                         ['artL0', 'ARTWORK LAYER 0'], ['artL1', 'ARTWORK LAYER 1'], ['artL2', 'ARTWORK LAYER 2'], ['artL3', 'ARTWORK LAYER 3']],
        };

        const views = viewsForTab[tab] || [['auto', 'AUTO']];
        const current = this.sharedState.canvasToolbarView || 'auto';
        const validIds = views.map(v => v[0]);
        if (!validIds.includes(current)) {
            this.sharedState.canvasToolbarView = 'auto';
        }
        label.textContent = (views.find(v => v[0] === (this.sharedState.canvasToolbarView || 'auto')) || views[0])[1];

        views.forEach(([id, text]) => {
            const item = document.createElement('div');
            const isActive = id === (this.sharedState.canvasToolbarView || 'auto');
            item.textContent = text;
            item.style.cssText = `
                padding: ${F / 2}px ${F}px;
                background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                cursor: pointer;
                border-bottom: 1px solid var(--c-border);
                text-transform: uppercase;
            `;
            item.addEventListener('mouseenter', () => {
                if (id !== (this.sharedState.canvasToolbarView || 'auto')) {
                    item.style.background = 'var(--vga-gray, #555)';
                }
            });
            item.addEventListener('mouseleave', () => {
                const active = id === (this.sharedState.canvasToolbarView || 'auto');
                item.style.background = active ? 'var(--c-text)' : 'var(--c-bg)';
                item.style.color = active ? 'var(--c-bg)' : 'var(--c-text)';
            });
            item.addEventListener('click', () => {
                this.sharedState.canvasToolbarView = id;
                this._updateToolbarViewOptions();
                this._canvasToolbarCloseMenu();
                this.toolBase.draw();
            });
            menu.appendChild(item);
        });
    }

    _setupTabChangeListener() {
        // Find sidebar tab buttons and listen for clicks
        const tabBar = this.container.querySelector('.tool-tab-bar');
        if (tabBar) {
            // Get all tab buttons
            const tabButtons = tabBar.querySelectorAll('button');
            tabButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.currentTabName = btn.textContent.trim();
                    
                    // Reset toolbar view to auto and rebuild options for new tab
                    this.sharedState.canvasToolbarView = 'auto';
                    this._updateToolbarViewOptions();
                    
                    // Update status labels based on current state
                    this._refreshTabStatus(this.currentTabName);
                    
                    // Redraw canvas for new tab
                    this.toolBase.draw();
                    
                    // If docs are open, refresh with new tab's content
                    if (this.sharedState.showDocs) {
                        // Small delay to ensure panel visibility has updated
                        setTimeout(() => this._updateDocumentation(), 10);
                    }
                });
            });
        }
        // Default to first tab
        this.currentTabName = 'SOURCE';
    }
    
    /**
     * Refresh status labels based on current state when switching tabs
     */
    _refreshTabStatus(tabName) {
        if (tabName === 'OUTPUTS') {
            // Calibration grid status
            const grid = this.sharedState.gridData;
            if (grid) {
                this.toolBase.setValue('outputsGridStatus',
                    `✅ ${grid.sequences?.length || 0} sequences | ${grid.rows}×${grid.cols} | ${grid.tileSize}mm tiles`);
            } else {
                this.toolBase.setValue('outputsGridStatus', '-- not generated (SOURCE tab)');
            }

            // Scan analysis status
            const scan = this.sharedState.scanAnalysis;
            const qConfig = this.sharedState.quantizationConfig;
            if (scan) {
                const filCount = qConfig?.filaments?.length || qConfig?.colorMap?.length || 0;
                this.toolBase.setValue('outputsScanStatus',
                    `✅ ${scan.length} tiles analysed | ${filCount} colours`);
            } else {
                this.toolBase.setValue('outputsScanStatus', '-- no analysis (SCAN tab)');
            }

            // Quantised image status
            const qsm = this.sharedState.quantizedSequenceMap;
            if (qsm) {
                this.toolBase.setValue('outputsQuantStatus',
                    `✅ ${qsm.width}×${qsm.height}px | ${qsm.palette?.length || 0} colours`);
            } else {
                this.toolBase.setValue('outputsQuantStatus', '-- not quantised (QUANTIZE tab)');
            }

            // Artwork STL status
            const stlData = this.sharedState.exportSTLData;
            if (stlData) {
                const fileCount = Object.keys(stlData.stls || {}).length;
                const { layerMaps, config } = stlData;
                this.toolBase.setValue('outputsArtworkStatus',
                    `✅ ${fileCount} STL file${fileCount !== 1 ? 's' : ''} | ${layerMaps.length} layer${layerMaps.length !== 1 ? 's' : ''} | ${config.printWidth}mm wide`);
            } else if (qsm) {
                this.toolBase.setValue('outputsArtworkStatus', '⚡ Ready — click Generate Artwork STLs');
            } else {
                this.toolBase.setValue('outputsArtworkStatus', '-- quantise image first');
            }
        } else if (tabName === 'QUANTIZE') {
            if (this.sharedState.quantizationConfig) {
                const colorCount = this.sharedState.quantizationConfig.colorMap?.length || 0;
                const type = this.sharedState.quantizationConfig.type || 'loaded';
                this.toolBase.setValue('paletteStatus', `✅ Palette ready: ${colorCount} colours (${type})`);
            } else if (this.sharedState.gridData) {
                this.sourceActions._generatePredictedQuantizationConfig(this.sharedState.gridData);
                const colorCount = this.sharedState.quantizationConfig?.colorMap?.length || 0;
                this.toolBase.setValue('paletteStatus', `✅ Palette ready: ${colorCount} colours (predicted)`);
            } else {
                this.toolBase.setValue('paletteStatus', '⚠️ No palette loaded. Generate or import a grid first.');
            }
            this._updatePaletteDisplay();
        } else if (tabName === 'SCAN') {
            if (this.sharedState.scanAnalysis) {
                this.toolBase.setValue('scanStatus', `✅ Analysis complete: ${this.sharedState.scanAnalysis.length} tiles`);
            } else if (this.sharedState.scanImageElement) {
                this.toolBase.setValue('scanStatus', 'ℹ️ Scan loaded. Align grid and click "Analyze Scan".');
            }
        }
    }

    /**
     * Inject/update palette swatch grid in QUANTIZE sidebar.
     * Compact swatch grid; click a swatch to show its details below.
     */
    _updatePaletteDisplay() {
        const config = this.sharedState.quantizationConfig;

        const paletteComp = this.toolBase.getComponent('paletteStatus');
        if (!paletteComp || !paletteComp.element) return;

        const parent = paletteComp.element.parentElement;
        if (!parent) return;

        let displayEl = parent.querySelector('.mfp-palette-display');
        if (!displayEl) {
            displayEl = document.createElement('div');
            displayEl.className = 'mfp-palette-display';
            paletteComp.element.insertAdjacentElement('afterend', displayEl);
        }

        if (!config || !config.colorMap || config.colorMap.length === 0) {
            displayEl.style.display = 'none';
            return;
        }

        const F = this.toolBase.F || 14;
        const sz = F * 2; // swatch size
        const gap = Math.round(F * 0.25);

        displayEl.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${gap}px;
        `;
        displayEl.innerHTML = '';

        // Swatch grid
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: ${gap}px;
        `;

        // Detail row (shown on click)
        const detail = document.createElement('div');
        detail.style.cssText = `
            display: none;
            align-items: center;
            gap: ${Math.round(F * 0.5)}px;
            padding: ${gap}px 0;
            border-top: 1px solid var(--c-border);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${Math.round(F * 0.857)}px;
            color: var(--c-text);
        `;

        let activeEl = null;

        config.colorMap.forEach((entry, i) => {
            const hex = entry.hex || (entry.rgb ? `#${entry.rgb.r.toString(16).padStart(2,'0')}${entry.rgb.g.toString(16).padStart(2,'0')}${entry.rgb.b.toString(16).padStart(2,'0')}` : '#888');
            const swatch = document.createElement('div');
            swatch.title = entry.sequence ? entry.sequence.join('') : (entry.name || String(i));
            swatch.style.cssText = `
                width: ${sz}px;
                height: ${sz}px;
                background: ${hex};
                border: 1px solid var(--c-border);
                cursor: pointer;
                flex-shrink: 0;
                box-sizing: border-box;
            `;

            swatch.addEventListener('click', () => {
                // Deselect previous
                if (activeEl && activeEl !== swatch) {
                    activeEl.style.outline = 'none';
                }
                if (activeEl === swatch) {
                    // Toggle off
                    swatch.style.outline = 'none';
                    detail.style.display = 'none';
                    activeEl = null;
                    return;
                }
                activeEl = swatch;
                swatch.style.outline = `2px solid var(--c-text)`;
                swatch.style.outlineOffset = '1px';

                // Populate detail
                const seq  = entry.sequence ? entry.sequence.join('') : (entry.name || '—');
                const rgb  = entry.rgb ? `rgb(${entry.rgb.r}, ${entry.rgb.g}, ${entry.rgb.b})` : '—';
                const devStr = entry.deviation != null ? `  Δ${entry.deviation.toFixed(1)}` : '';

                detail.innerHTML = '';

                const pip = document.createElement('div');
                pip.style.cssText = `width:${F}px;height:${F}px;background:${hex};border:1px solid var(--c-border);flex-shrink:0;`;
                detail.appendChild(pip);

                const txt = document.createElement('span');
                txt.style.cssText = 'white-space:pre;';
                txt.textContent = `${seq}  ${rgb}${devStr}`;
                detail.appendChild(txt);

                detail.style.display = 'flex';
            });

            grid.appendChild(swatch);
        });

        displayEl.appendChild(grid);
        displayEl.appendChild(detail);
    }
    
    _getCurrentTab() {
        // Return the stored tab name (set by click listener)
        return this.currentTabName || 'SOURCE';
    }
    
    _updateDocumentation() {
        const canvasArea = this.container.querySelector('.tool-canvas-area');
        if (!canvasArea) return;
        
            const canvas = canvasArea.querySelector('canvas');
        
        if (this.sharedState.showDocs) {
            // Hide canvas
            if (canvas) canvas.style.display = 'none';
            
            // Remove old docs container if exists
            if (this.docsContainer) {
                this.docsContainer.remove();
            }
            
            // Create new docs container
                this.docsContainer = document.createElement('div');
                this.docsContainer.className = 'tool-docs-viewer';
                this.docsContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                    overflow-y: auto;
                    padding: calc(var(--f) * 2);
                padding-top: calc(var(--f) * 3);
                    background: var(--c-bg);
                    color: var(--c-text);
                z-index: 50;
            `;
            
            // Get current tab and render appropriate docs
            const currentTab = this._getCurrentTab();
            const docContent = this._getTabDocumentation(currentTab);
            this.docsContainer.innerHTML = this._markdownToHtml(docContent);
            
            canvasArea.appendChild(this.docsContainer);
        } else {
            // Show canvas
            if (canvas) canvas.style.display = 'block';
            
            // Hide docs
            if (this.docsContainer) {
                this.docsContainer.remove();
                this.docsContainer = null;
            }
        }
    }
    
    _getTabDocumentation(tabName) {
        const docs = {
            'SOURCE': `# SOURCE TAB — Grid Generation

## Purpose
Generate a calibration grid containing every valid filament layer combination. This grid is printed, scanned, and analysed to create a colour lookup table mapping RGB values to filament stacks.

---

## Sequence Generation Algorithm

### Valid Sequence Definition
A sequence is an array of length M (layer count) where:
- Values are 1-indexed filament references (1 = first filament, 2 = second, etc.)
- Value 0 = empty (no filament on this layer)
- At least one non-zero value exists
- No gaps: once a 0 appears, only 0s can follow

\`\`\`
Valid:   [1, 2, 0, 0]  — Red layer 0, Blue layer 1, empty layers 2-3
Valid:   [1, 1, 1, 1]  — Red on all layers
Invalid: [1, 0, 2, 0]  — Gap: Blue appears after empty
Invalid: [0, 0, 0, 0]  — All empty
\`\`\`

### Generation Process
File: \`algorithms/combinatorics/sequences.js\`

\`\`\`
function generateSequences(N, M):
    for height = 1 to M:
        stacks = generateStacksOfHeight(height)  // N^height combinations
        for each stack:
            pad to length M with zeros
            add to sequences
    return sequences
\`\`\`

### Sequence Count Formula
\`\`\`
Total = N × (N^M - 1) / (N - 1)

Example: 4 colours, 4 layers
= 4 × (4^4 - 1) / (4 - 1)
= 4 × 255 / 3
= 340 sequences
\`\`\`

---

## Colour Simulation (simColour)

Predicts the perceived colour of a filament stack by averaging RGB values.

File: \`algorithms/color/color-utils.js\`

\`\`\`
function simColour(sequence, colours):
    r = g = b = count = 0
    for each filamentIndex in sequence:
        if filamentIndex > 0:
            rgb = hex2rgb(colours[filamentIndex - 1].h)
            r += rgb.r
            g += rgb.g
            b += rgb.b
            count++
    if count == 0: return white
    return {r: r/count, g: g/count, b: b/count}
\`\`\`

This is a simple average — real print colours differ due to layer interaction, which is why we need calibration.

---

## Sequence Map (Critical Data Structure)

Maps RGB colours to their generating sequences for the quantization step.

\`\`\`
function buildSequenceMap(sequences, colours, cols):
    map = new Map()
    for each (sequence, index) in sequences:
        colour = simColour(sequence, colours)
        key = rgb_to_key(colour)  // "r,g,b" string
        map.set(key, {
            sequence: sequence,
            grid_position: {row, col, index}
        })
    return map
\`\`\`

---

## Grid Layout Calculation

File: \`algorithms/layout/grid-layout.js\`

Inputs: sequence count, bed dimensions, scan dimensions, tile size, gap

\`\`\`
cols = floor(scanWidth / (tileSize + gap))
rows = ceil(sequenceCount / cols)

gridWidth  = cols × tileSize + (cols - 1) × gap
gridHeight = rows × tileSize + (rows - 1) × gap
\`\`\`

Constraints enforced:
- gridWidth ≤ scanWidth ≤ bedWidth
- gridHeight ≤ scanHeight ≤ bedHeight

---

## Sorting Methods

Re-order sequences for easier visual comparison:

- **Layer Count** — Fewer layers first
- **Luminance** — L = 0.299R + 0.587G + 0.114B
- **Hue** — H from HSL conversion
- **Saturation** — S from HSL
- **Base Filament** — Group by first layer

---

## Key State Variables

\`\`\`
sharedState.selectedFilaments   // Array of filament indices
sharedState.gridData            // Generated grid metadata
sharedState.sequences           // Array of sequence arrays
sharedState.sequenceMap         // Map: rgb_key → sequence data
\`\`\`

---

## Files Modified
- \`MFP-SourceActions.js\` — generateGrid(), importProject()
- \`algorithms/combinatorics/sequences.js\` — generateSequences(), buildSequenceMap()
- \`algorithms/color/color-utils.js\` — simColour()
`,
            'SCAN': `# SCAN TAB — Colour Extraction

## Purpose
Extract the actual RGB colour of each printed tile by aligning a photograph/scan with the reference grid, accounting for perspective distortion.

---

## Perspective-Correct Grid Mapping

### Problem
Photographed grids are never perfectly aligned. The image has:
- Rotation
- Perspective distortion (trapezoid shape)
- Non-uniform scaling

### Solution: Bilinear Interpolation
User positions 4 corner handles (TL, TR, BR, BL). Any point on the grid can be found by interpolating between corners.

File: \`MFP-ScanActions.js\` — analyzeScan()

\`\`\`
function gridToPixel(u, v):
    // u, v ∈ [0, 1] — normalised grid coordinates
    topX    = lerp(TL.x, TR.x, u)
    topY    = lerp(TL.y, TR.y, u)
    bottomX = lerp(BL.x, BR.x, u)
    bottomY = lerp(BL.y, BR.y, u)
    return {
        x: lerp(topX, bottomX, v),
        y: lerp(topY, bottomY, v)
    }

function lerp(a, b, t):
    return a + (b - a) * t
\`\`\`

### Mathematical Form
\`\`\`
P(u,v) = (1-v)·[(1-u)·TL + u·TR] + v·[(1-u)·BL + u·BR]
\`\`\`

---

## Tile Boundary Calculation

For tile at (row, col) in a rows × cols grid:

\`\`\`
u0 = col / cols         // Left edge
u1 = (col + 1) / cols   // Right edge
v0 = row / rows         // Top edge
v1 = (row + 1) / rows   // Bottom edge
\`\`\`

---

## Deadzone (Safe Sampling Region)

Edges are excluded to avoid:
- Gap/filler bleeding
- Printing artifacts
- Alignment errors

\`\`\`
du = (u1 - u0) × deadzoneFraction
dv = (v1 - v0) × deadzoneFraction

safeU0 = u0 + du    safeU1 = u1 - du
safeV0 = v0 + dv    safeV1 = v1 - dv
\`\`\`

For 20% deadzone: sample area = 60% × 60% = 36% of tile

---

## Point-in-Quadrilateral Test

The safe zone is a quadrilateral (not axis-aligned rectangle). Test if pixel (px, py) is inside using cross-product sign consistency.

File: \`MFP-ScanActions.js\` — _pointInQuad()

\`\`\`
function sign(p1, p2, p3):
    return (p1.x - p3.x) × (p2.y - p3.y) - (p2.x - p3.x) × (p1.y - p3.y)

function pointInQuad(px, py, TL, TR, BR, BL):
    d1 = sign(point, TL, TR)
    d2 = sign(point, TR, BR)
    d3 = sign(point, BR, BL)
    d4 = sign(point, BL, TL)
    
    hasNeg = any(d < 0)
    hasPos = any(d > 0)
    
    return NOT (hasNeg AND hasPos)  // Inside if all same sign
\`\`\`

---

## Pixel Sampling Loop

\`\`\`
// Bounding box for efficiency
minX = floor(min(safeTL.x, safeTR.x, safeBL.x, safeBR.x))
maxX = ceil(max(...))
// Similar for Y

pixels = []
for py = minY to maxY:
    for px = minX to maxX:
        if pointInQuad(px, py, safeTL, safeTR, safeBR, safeBL):
            if inBounds(px, py):
                pixels.push(getPixel(px, py))
\`\`\`

---

## Statistical Analysis Per Tile

\`\`\`
// Mean (average colour)
avgR = Σ(pixels.r) / N
avgG = Σ(pixels.g) / N
avgB = Σ(pixels.b) / N

// Variance
varR = Σ(r - avgR)² / N

// Standard Deviation
stdR = √varR

// Combined Colour Deviation
colorDeviation = √(varR + varG + varB)
\`\`\`

High colorDeviation indicates inconsistent printing (banding, under-extrusion).

---

## Output Data Structure

\`\`\`
{
    index: 42,
    row: 4,
    col: 2,
    sequence: [1, 2, 1, 3],
    sequenceStr: "1213",
    filamentStack: [{layer: 0, name: "Red"}, ...],
    rgb: {r: 142, g: 87, b: 103},
    hex: "#8e5767",
    std: {r: 12.3, g: 8.7, b: 9.2},
    colorDeviation: 17.6,
    pixelsSampled: 847
}
\`\`\`

---

## Key State Variables

\`\`\`
sharedState.scanImageElement    // HTMLImageElement of uploaded scan
sharedState.gridCornersPixel    // [{x,y}, ...] — 4 corner positions
sharedState.scanAnalysis        // Array of analysis results per tile
sharedState.referenceGridData   // Grid structure from SOURCE tab
\`\`\`

---

## Controls

- **Drag corners** — Position each corner handle
- **Flip H** — Mirror horizontally
- **Flip V** — Mirror vertically
- **Rotate 90°** — Rotate clockwise
- **Reset** — Return to default positions

## Keyboard Shortcuts
- **Arrow keys** — Pan view
- **+/-** — Zoom in/out
- **0 or Home** — Reset view

---

## View Analysis

After running "Analyze Scan", click "View Analysis Data" to see:
- Interactive grid of all analysed tile colours
- Sorting options: Grid Order, Sequence, Brightness, Hue, Deviation
- Cell size adjustment
- Hover for detailed tile info: sequence, RGB, deviation, pixel count
- Click tile for layer breakdown

The view displays in the canvas area (not a popup) and can be closed with the ✕ button.

---

## Project Export

All scan data is saved in the project ZIP:
- \`scans/scan.png\` — The uploaded scan image
- \`scans/grid-alignment.json\` — Grid corner positions for re-import
- \`scans/analysis.json\` — Full analysis data per tile
- \`scans/quantization-config.json\` — Palette mapping for quantization

---

## Files Modified
- \`MFP-ScanActions.js\` — loadScanImage(), analyzeScan(), viewAnalysis(), _pointInQuad()
- \`MFP-Main.js\` — _drawGridOverlay(), _setupScanCanvasInteraction()
`,
            'QUANTIZE': `# QUANTIZE TAB — Image Conversion

## Purpose
Convert any source image to use only the colours available from the calibration grid, enabling it to be printed with the multifilament system.

---

## Colour Matching Algorithm

For each source pixel, find the nearest calibration colour.

File: \`MFP-QuantizeActions.js\` — quantize()

\`\`\`
for each pixel in sourceImage:
    minDist = infinity
    nearestColor = null
    
    for each color in calibrationPalette:
        dist = distance(pixel, color)
        if dist < minDist:
            minDist = dist
            nearestColor = color
    
    outputPixel = nearestColor
\`\`\`

---

## Distance Metrics

### Euclidean RGB
\`\`\`
d = √((r₁-r₂)² + (g₁-g₂)² + (b₁-b₂)²)
\`\`\`

Simple but doesn't match human perception.

### Weighted RGB (Redmean approximation)
\`\`\`
rmean = (r₁ + r₂) / 2
dr = r₁ - r₂
dg = g₁ - g₂
db = b₁ - b₂

d = √((2 + rmean/256)×dr² + 4×dg² + (2 + (255-rmean)/256)×db²)
\`\`\`

Better perceptual accuracy without colour space conversion.

### CIE LAB ΔE (if implemented)
\`\`\`
1. Convert RGB → XYZ → LAB
2. d = √((L₁-L₂)² + (a₁-a₂)² + (b₁-b₂)²)
\`\`\`

Perceptually uniform — 1 unit = 1 JND (just noticeable difference).

---

## Dithering Algorithms

Distribute quantization error to neighbouring pixels.

### None
Direct mapping — each pixel independently converted. Creates posterised/banded appearance.

### Floyd-Steinberg
Classic error diffusion (1976). Error distributed:
\`\`\`
        current    7/16 →
    3/16 ↙  5/16 ↓  1/16 ↘
\`\`\`

### Atkinson
Preserves detail, iconic Mac aesthetic. Only 6/8 of error diffused:
\`\`\`
        current    1/8 →  1/8 →
    1/8 ↙  1/8 ↓  1/8 ↘
           1/8 ↓↓
\`\`\`

### Ordered (Bayer)
Deterministic threshold matrix. No error propagation — good for animation.

---

## Quantization Config Structure

\`\`\`
{
    colorMap: [
        {
            rgb: {r, g, b},
            hex: "#rrggbb",
            sequence: [1, 2, 0, 0],
            sequenceStr: "1200"
        },
        ...
    ],
    filaments: [{name, hex}, ...],
    layerCount: 4,
    tileCount: 340
}
\`\`\`

---

## Expansion to 3D Layers

After quantization, each pixel maps to a sequence. The image expands to M layer images:

\`\`\`
for each pixel at (x, y):
    sequence = quantizationConfig.colorMap[pixelColor].sequence
    for layer = 0 to M-1:
        filamentIndex = sequence[layer]
        layerImages[layer][x, y] = filamentIndex
\`\`\`

---

## Key State Variables

\`\`\`
sharedState.sourceImageElement    // Original image to quantize
sharedState.quantizedImageElement // Result preview
sharedState.quantizationConfig    // Palette from scan analysis
\`\`\`

---

## Files Modified
- \`MFP-QuantizeActions.js\` — loadSourceImage(), quantize()
`,
            'OUTPUTS': `# OUTPUTS TAB — Unified Output Dashboard

## Purpose
View and download every artifact produced by the tool. Status indicators show what is available. Canvas view selector previews any output. Artwork STL generation (quantised image → 3D print files) lives here exclusively.

---

## Output Sections

### CANVAS VIEW
Dropdown selects which output to preview on the canvas:
- **Quantised Image** — dithered pixel art from QUANTIZE tab
- **Grid Combined / Grid Layer N** — calibration grid from SOURCE tab
- **Scan Overlay** — scan photo with perspective-correct grid overlay from SCAN tab
- **Artwork Combined / Artwork Layer N** — generated STL geometry as 2D layer view

### CALIBRATION GRID
Requires: \`gridData\` (generate grid in SOURCE tab)

- **Grid PNG** — high-res 300 DPI raster image of the calibration grid
- **Grid STLs** — one STL file per filament, grid mode (explicit tile/gap spacing)
- **Grid CSV** — index, row, col, sequence, RGB, hex per tile
- **Grid JSON** — complete grid layout with all settings (\`grid-layout.json\` format)

### SCAN ANALYSIS
Requires: \`scanAnalysis\` (run Analyze Scan in SCAN tab)

- **Palette (GPL)** — GIMP/Inkscape palette of scanned tile colours
- **Quant Config (JSON)** — colour map for quantization: RGB → filament sequence
- **Comparison CSV** — expected vs measured colour per tile with Delta E

### QUANTISED IMAGE
Requires: \`quantizedImageElement\` (run Quantize Image in QUANTIZE tab)

- **Quantised PNG** — the dithered output image at tile resolution

### ARTWORK STLs
Requires: \`quantizedSequenceMap\` + \`quantizationConfig\`

Contour-based pipeline: pixel map → binary field → marching squares (sub-pixel contours) → Douglas-Peucker simplification → Chaikin smoothing → ear-clip triangulation + side walls → STL. Boundary smoothing happens here in geometry space, not in the pixel domain.

\`\`\`
quantizedSequenceMap
  map[pixelIdx] = paletteIdx
  palette[i].sequence = [1, 0, 3, 2]  // 1-indexed filament per layer
    ↓
layerMaps[layer][filament] = Set("x,y")
    ↓
contourSTL(pixelSet, w, h, z0, z1, pixelSize, { chaikinIterations, simplifyTolerance })
    ↓
{ "artwork_Red_PLA.stl": "solid ...", ... }
\`\`\`

**Key difference from grid STLs:** image mode uses \`pixelSize = printWidth / imageWidth\` — no gaps, no tile spacing. Adjacent same-filament pixels are merged into rectangles by the vectoriser before generating box geometry.

Layer view on canvas: **Combined** merges all layers (topmost filament per pixel wins); **Layer N** shows a single layer coloured by filament.

### COMPLETE PROJECT
Requires: \`gridData\`

Exports everything into one ZIP: grid layout JSON, STL files, layer PNGs, scan image and alignment, analysis data, quantization config, GPL palette, comparison CSV, quantized image, source image.

---

## Key State Variables

\`\`\`
sharedState.gridData              // Calibration grid
sharedState.scanAnalysis          // Per-tile measured colours
sharedState.quantizationConfig    // Palette: colour → sequence
sharedState.quantizedSequenceMap  // { width, height, map: Uint16Array, palette }
sharedState.exportSTLData         // { stls, layerMaps, filamentNames, config }
\`\`\`

---

## Files
- \`MFP-ExportActions.js\` — generateArtworkSTL(), downloadAllSTLs(), exportJSON(), exportCompleteProject()
- \`MFP-SourceActions.js\` — exportGridPNG(), exportGridSTL(), exportGridCSV(), exportCompletePackage()
- \`MFP-ScanActions.js\` — exportPalette(), exportQuantizationConfig(), exportComparisonCSV()
- \`MFP-QuantizeActions.js\` — exportQuantizedImage()
- \`algorithms/geometry/stl-generation.js\` — exportArtworkSTLs()
`
        };
        
        return docs[tabName] || docs['SOURCE'];
    }
    
    _markdownToHtml(markdown) {
        // Monochrome markdown to HTML conversion
        let html = markdown
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => 
                `<pre class="doc-code"><code>${code.trim()}</code></pre>`)
            .replace(/`([^`]+)`/g, '<code class="doc-inline">$1</code>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/^---$/gm, '<hr>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
            .replace(/^(?!<[huplo]|<\/|<hr)(.+)$/gm, '<p>$1</p>');
        
        return `
            <style>
                .tool-docs-viewer h1 { 
                    font-size: calc(var(--f) * 1.4);
                    font-weight: 700;
                    border-bottom: 1px solid var(--c-border); 
                    padding-bottom: calc(var(--f) * 0.5); 
                    margin-bottom: calc(var(--f) * 1.5);
                    color: var(--c-text);
                }
                .tool-docs-viewer h2 { 
                    font-size: calc(var(--f) * 1.1);
                    font-weight: 700;
                    margin-top: calc(var(--f) * 1.5); 
                    margin-bottom: calc(var(--f) * 0.5);
                    color: var(--c-text);
                    border-bottom: 1px solid var(--c-border-subtle, var(--c-border));
                    padding-bottom: calc(var(--f) * 0.25);
                }
                .tool-docs-viewer h3 { 
                    font-size: calc(var(--f));
                    font-weight: 700;
                    margin-top: calc(var(--f) * 1); 
                    margin-bottom: calc(var(--f) * 0.4);
                    color: var(--c-text-muted, var(--c-text));
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .tool-docs-viewer p { 
                    margin-bottom: calc(var(--f) * 0.6); 
                    line-height: 1.6;
                    color: var(--c-text-muted, var(--c-text));
                }
                .tool-docs-viewer code.doc-inline { 
                    background: var(--c-bg-elevated, var(--vga-gray)); 
                    color: var(--c-text); 
                    padding: 1px 4px; 
                    font-family: 'Space Mono', monospace;
                    font-size: calc(var(--f) * 0.85);
                }
                .tool-docs-viewer pre.doc-code { 
                    background: var(--c-bg-elevated, var(--vga-gray)); 
                    border: 1px solid var(--c-border); 
                    padding: calc(var(--f) * 0.75); 
                    margin: calc(var(--f) * 0.75) 0; 
                    overflow-x: auto; 
                    font-family: 'Space Mono', monospace; 
                    font-size: calc(var(--f) * 0.8);
                    line-height: 1.4;
                    color: var(--c-text);
                }
                .tool-docs-viewer pre.doc-code code { 
                    background: none; 
                    padding: 0; 
                    color: inherit;
                }
                .tool-docs-viewer ul { 
                    margin: calc(var(--f) * 0.4) 0 calc(var(--f) * 0.6) calc(var(--f) * 1.25); 
                    list-style-type: disc;
                    color: var(--c-text-muted, var(--c-text));
                }
                .tool-docs-viewer li { 
                    margin: calc(var(--f) * 0.2) 0;
                    line-height: 1.5;
                }
                .tool-docs-viewer hr { 
                    border: none; 
                    border-top: 1px solid var(--c-border); 
                    margin: calc(var(--f) * 1.25) 0; 
                }
                .tool-docs-viewer strong { 
                    color: var(--c-text);
                    font-weight: 700;
                }
            </style>
            ${html}
        `;
    }
    
    _getSelectedFilamentNames() {
        if (!this.sharedState.selectedFilaments || this.sharedState.selectedFilaments.length === 0) {
            return ['Select filaments first'];
        }
        return this.sharedState.selectedFilaments.map(idx => FILAMENT_COLOURS[idx].n);
    }
    
    _updateFilamentDropdowns() {
        // Get new options based on selected filaments
        const newOptions = this._getSelectedFilamentNames();
        console.log('🔄 Updating filament dropdowns with options:', newOptions);
        
        // Update each filament dropdown
        const dropdownKeys = ['baseFilament', 'topFilament', 'gapFilament'];
        for (const key of dropdownKeys) {
            const dropdown = this.toolBase.components.get(key);
            if (dropdown && typeof dropdown.setOptions === 'function') {
                dropdown.setOptions(newOptions);
                console.log(`✅ Updated ${key} dropdown`);
            } else {
                console.log(`⚠️ Dropdown ${key} not found or missing setOptions`);
            }
        }
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
                    ['toggle', 'Fill Gaps & Perimeter', ['Fill Gaps'], {key: 'gapFillOptions', selectedValues: state.gapFillOptions || []}],
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
                        selectedValues: ['STL Combined', 'STL Per Layer', 'Sorted Variants', 'Layer Visuals']
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
                    ['button', 'Reset View', null, {key: 'resetView'}],
                    ['label', '1:1 pixels. Scroll=zoom, Drag=pan. Arrow keys + ±', {variant: 'caption'}],
                ]],
                ['GRID OVERLAY', [
                    ['label', 'Grid auto-sized on image upload', {key: 'gridInfo', variant: 'caption'}],
                    ['number', 'Fine Adjust X (px)', -50, 50, 1, {key: 'gridOffsetX', value: 0, withNumber: true}],
                    ['number', 'Fine Adjust Y (px)', -50, 50, 1, {key: 'gridOffsetY', value: 0, withNumber: true}],
                    ['number', 'Rotation (°)', -5, 5, 0.1, {key: 'gridRotation', value: 0, withNumber: true}],
                    ['button', 'Flip H', null, {key: 'flipH'}],
                    ['button', 'Flip V', null, {key: 'flipV'}],
                    ['button', 'Rotate 90°', null, {key: 'rotate90'}],
                    ['toggle', 'Options', ['Show Sample Zones', 'Show Expected Colors', 'Show Analysed Colors'], {
                        key: 'gridOptions',
                        selectedValues: ['Show Sample Zones']
                    }],
                    ['number', 'Expected Color Opacity (%)', 0, 100, 5, {key: 'expectedOpacity', value: 50, withNumber: true}],
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
                ['SAVE PROJECT', [
                    ['button', 'Export Project ZIP', null, {key: 'exportCompleteProject', variant: 'primary'}],
                    ['label', 'Saves all settings + scan alignment + analysis', {variant: 'caption'}],
                ]],
            ]],
            
            // QUANTIZE TAB - COMPLETE WITH ALL CONTROLS
            ['QUANTIZE', [
                ['PALETTE STATUS', [
                    ['label', '⚠️ No palette loaded. Generate or import a grid first.', {key: 'paletteStatus', variant: 'caption'}],
                ]],
                ['PALETTE', [
                    ['file', 'Upload Palette JSON', {key: 'uploadPalette', accept: '.json,application/json'}],
                    ['button', 'Import Project ZIP', null, {key: 'importProjectQuantize'}],
                    ['label', 'Import palette from calibration-palette.json or project ZIP', {variant: 'caption'}],
                ]],
                ['IMAGE', [
                    ['file', 'Source Image', {key: 'sourceImage', accept: 'image/*'}],
                ]],
                ['IMAGE ADJUSTMENTS', [
                    ['adjustment-bundle', 'professional', null, {
                        key: 'imageAdjust'
                    }],
                ]],
                ['PROCESSING', [
                    ['number', 'Print Width (mm)', 50, 300, 1, {key: 'printWidth', value: 170, withNumber: true}],
                    ['dropdown', 'Dither Algorithm', ['None', 'Floyd-Steinberg', 'Bayer 4×4', 'Blue Noise'], {key: 'ditherAlgorithm', value: 'Floyd-Steinberg'}],
                    ['number', 'Min Detail (mm)', 0, 2, 0.1, {key: 'minDetail', value: 0.8, withNumber: true}],
                ]],
                ['COLOUR SPACE', [
                    ['label', 'Distance metric for palette matching. CIELAB is perceptually uniform. RGB is direct. HSL separates hue/saturation/lightness. Weights scale each axis independently.', {variant: 'caption'}],
                    ['dropdown', 'Space', ['CIELAB', 'RGB', 'HSL'], {key: 'colourSpace', value: 'CIELAB'}],
                    ['number', 'Weight 1 (L / R / H)', 0, 5, 0.1, {key: 'csWeight1', value: 1, withNumber: true}],
                    ['number', 'Weight 2 (a* / G / S)', 0, 5, 0.1, {key: 'csWeight2', value: 1, withNumber: true}],
                    ['number', 'Weight 3 (b* / B / L)', 0, 5, 0.1, {key: 'csWeight3', value: 1, withNumber: true}],
                ]],
                ['OPTIMISATION', [
                    ['label', 'Within variance, prefer entries by print form over pure colour closeness. Deep runs multi-pass region consensus.', {variant: 'caption'}],
                    ['dropdown', 'Analysis Mode', ['Fast', 'Deep'], {key: 'analysisMode', value: 'Fast'}],
                    ['number', 'Colour Variance (ΔE)', 0, 30, 1, {key: 'colourVariance', value: 0, withNumber: true}],
                    ['dropdown', 'Layer Preference', ['None', 'More Layers', 'Fewer Layers'], {key: 'layerPreference', value: 'None'}],
                    ['number', 'Grouping Weight', 0, 1, 0.05, {key: 'groupingWeight', value: 0.3, withNumber: true}],
                ]],
                ['SIMPLIFICATION', [
                    ['label', 'Topological cleanup. Min Cluster merges small regions. Palette Merge collapses near-identical sequences.', {variant: 'caption'}],
                    ['number', 'Min Cluster (px)', 0, 200, 1, {key: 'minimumClusterPx', value: 0, withNumber: true}],
                    ['number', 'Palette Merge (ΔE)', 0, 15, 0.5, {key: 'paletteMergeThreshold', value: 0, withNumber: true}],
                ]],
                ['ACTIONS', [
                    ['button', 'Quantize Image', null, {key: 'quantize', variant: 'primary'}],
                    ['label', '', {key: 'quantizeStatus', variant: 'caption'}],
                ]],
                ['STL GENERATION', [
                    ['label', 'Contour-based: marching squares extract sub-pixel boundaries, Douglas-Peucker simplifies, Chaikin smooths. Operates on geometry, not pixels.', {variant: 'caption'}],
                    ['number', 'Smooth Iterations', 0, 6, 1, {key: 'stlSmoothIterations', value: 2, withNumber: true}],
                    ['number', 'Simplify Tolerance (px)', 0, 2, 0.05, {key: 'stlSimplifyTolerance', value: 0.3, withNumber: true}],
                    ['number', 'Min Contour Area (px²)', 0, 20, 1, {key: 'stlMinContourArea', value: 2, withNumber: true}],
                    ['button', 'Generate Artwork STLs', null, {key: 'generateArtworkSTL', variant: 'primary'}],
                    ['label', '', {key: 'exportArtworkStatus', variant: 'caption'}],
                    ['button', 'Export Analysis Image', null, {key: 'exportAnalysisImage'}],
                ]],
                ['SAVE PROJECT', [
                    ['button', 'Export Project ZIP', null, {key: 'exportCompleteProject', variant: 'primary'}],
                    ['label', 'Saves all settings + quantized image', {variant: 'caption'}],
                ]],
            ]],
            
            // OUTPUTS TAB — unified view and download dashboard
            ['OUTPUTS', [
                ['CALIBRATION GRID', [
                    ['label', '', {key: 'outputsGridStatus', variant: 'caption'}],
                    ['button', 'Download Grid PNG', null, {key: 'outputGridPNG'}],
                    ['button', 'Download Grid STLs', null, {key: 'outputGridSTL'}],
                    ['button', 'Download Grid CSV', null, {key: 'outputGridCSV'}],
                    ['button', 'Download Grid JSON', null, {key: 'outputGridJSON'}],
                    ['label', '', {key: 'outputsGridActionStatus', variant: 'caption'}],
                ]],
                ['SCAN ANALYSIS', [
                    ['label', '', {key: 'outputsScanStatus', variant: 'caption'}],
                    ['button', 'Download Palette (GPL)', null, {key: 'outputPaletteGPL'}],
                    ['button', 'Download Quant Config (JSON)', null, {key: 'outputQuantConfig'}],
                    ['button', 'Download Comparison CSV', null, {key: 'outputComparisonCSV'}],
                    ['label', '', {key: 'outputsScanActionStatus', variant: 'caption'}],
                ]],
                ['QUANTISED IMAGE', [
                    ['label', '', {key: 'outputsQuantStatus', variant: 'caption'}],
                    ['button', 'Download Quantised PNG', null, {key: 'outputQuantPNG'}],
                    ['label', '', {key: 'outputsQuantActionStatus', variant: 'caption'}],
                ]],
                ['ARTWORK STLs', [
                    ['label', '', {key: 'outputsArtworkStatus', variant: 'caption'}],
                    ['number', 'Print Width (mm)', 50, 300, 1, {key: 'stlPrintWidth', value: state.printWidth || 170, withNumber: true}],
                    ['number', 'Layer Height (mm)', 0.04, 0.4, 0.01, {key: 'stlLayerHeight', value: state.layerHeight || DEFAULTS.layerHeight, withNumber: true}],
                    ['button', 'Generate Artwork STLs', null, {key: 'generateArtworkSTL', variant: 'primary'}],
                    ['button', 'Download All STLs (ZIP)', null, {key: 'downloadSTLZip'}],
                    ['button', 'Download Individual STLs', null, {key: 'downloadSTLIndividual'}],
                    ['label', '', {key: 'exportArtworkStatus', variant: 'caption'}],
                ]],
                ['COMPLETE PROJECT', [
                    ['button', 'Export Complete Project ZIP', null, {key: 'exportCompleteProject', variant: 'primary'}],
                    ['label', '', {key: 'exportProjectStatus', variant: 'caption'}],
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
        
        // Wire adjustment bundle for QUANTIZE tab
        const adjustBundle = this.toolBase.components.get('imageAdjust');
        if (adjustBundle) {
            adjustBundle.onTransform = (adjustedImageData) => {
                // Store adjusted image for quantization
                this.sharedState.sourceImageData = adjustedImageData;
                this.toolBase.draw();
                console.log('✅ Image adjustments applied');
            };
            console.log('✅ AdjustmentBundle wired');
        }
        
        // Setup scan canvas interaction for corner dragging
        this._setupScanCanvasInteraction();
    }
    
    /**
     * Setup interactive corner dragging for grid overlay alignment
     * Corners are stored in IMAGE-RELATIVE coordinates (0-1) so they stay aligned
     * when display mode changes
     */
    _setupScanCanvasInteraction() {
        const canvasComponent = this.toolBase.canvasComponent;
        if (!canvasComponent || !canvasComponent.canvasEl) return;
        
        const canvas = canvasComponent.canvasEl;
        
        // Drag state
        this.scanDragState = {
            isDragging: false,
            dragType: null, // 'corner' or 'body'
            dragCornerIndex: -1,
            startX: 0,
            startY: 0,
            startCorners: null
        };
        
        // Delegate to Canvas component's authoritative coordinate converter
        const getCanvasCoords = (e) => canvasComponent.screenToCanvas(e.clientX, e.clientY);
        
        // Get pixel corners directly (canvas = image at 1:1)
        const getCorners = () => {
            return this.sharedState.gridCornersPixel;
        };
        
        const isPointInQuad = (x, y, corners) => {
            if (!corners || corners.length !== 4) return false;
            const sign = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
            const d1 = sign({x, y}, corners[0], corners[1]);
            const d2 = sign({x, y}, corners[1], corners[2]);
            const d3 = sign({x, y}, corners[2], corners[3]);
            const d4 = sign({x, y}, corners[3], corners[0]);
            const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0) || (d4 < 0);
            const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0) || (d4 > 0);
            return !(hasNeg && hasPos);
        };
        
        const findCornerUnderMouse = (mouseX, mouseY, corners) => {
            if (!corners) return -1;
            
            // Keep the screen-space hit target constant regardless of zoom level
            const HANDLE_RADIUS = 15 / (canvasComponent.transform?.scale || 1);
            for (let i = 0; i < corners.length; i++) {
                const corner = corners[i];
                if (!corner) continue;
                const dx = mouseX - corner.x;
                const dy = mouseY - corner.y;
                if (Math.sqrt(dx * dx + dy * dy) <= HANDLE_RADIUS) {
                    return i;
                }
            }
            return -1;
        };
        
        // Pointer down — intercept grid/corner drag before Canvas pan/zoom
        const onPointerDown = (e) => {
            if (e.button === 2) return; // Ignore right-click
            const corners = getCorners();
            const { x, y } = getCanvasCoords(e);

            if (!this.sharedState.scanImageElement || !corners) return;

            const cornerIndex = findCornerUnderMouse(x, y, corners);

            if (cornerIndex !== -1) {
                this.scanDragState.isDragging = true;
                this.scanDragState.dragType = 'corner';
                this.scanDragState.dragCornerIndex = cornerIndex;
                this.scanDragState.startX = x;
                this.scanDragState.startY = y;
                this.scanDragState.startCorners = corners.map(c => ({...c}));
                canvas.style.cursor = 'grabbing';
                canvas.setPointerCapture(e.pointerId);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            if (isPointInQuad(x, y, corners)) {
                this.scanDragState.isDragging = true;
                this.scanDragState.dragType = 'body';
                this.scanDragState.startX = x;
                this.scanDragState.startY = y;
                this.scanDragState.startCorners = corners.map(c => ({...c}));
                canvas.style.cursor = 'grabbing';
                canvas.setPointerCapture(e.pointerId);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }
            // Not on grid — let Canvas pan/zoom handle it
        };

        // Pointer move
        const onPointerMove = (e) => {
            const corners = getCorners();
            const { x, y } = getCanvasCoords(e);

            if (this.scanDragState.isDragging) {
                const dx = x - this.scanDragState.startX;
                const dy = y - this.scanDragState.startY;

                if (this.scanDragState.dragType === 'corner') {
                    const idx = this.scanDragState.dragCornerIndex;
                    this.sharedState.gridCornersPixel[idx] = {
                        x: this.scanDragState.startCorners[idx].x + dx,
                        y: this.scanDragState.startCorners[idx].y + dy
                    };
                } else if (this.scanDragState.dragType === 'body') {
                    this.sharedState.gridCornersPixel = this.scanDragState.startCorners.map(c => ({
                        x: c.x + dx,
                        y: c.y + dy
                    }));
                }

                this.toolBase.draw();
                e.preventDefault();
                e.stopPropagation();
            } else if (corners) {
                const cornerIndex = findCornerUnderMouse(x, y, corners);
                if (cornerIndex !== -1) {
                    canvas.style.cursor = 'crosshair';
                } else if (isPointInQuad(x, y, corners)) {
                    canvas.style.cursor = 'move';
                } else {
                    canvas.style.cursor = canvasComponent.enablePan ? 'grab' : 'default';
                }
            }
        };

        // Pointer up
        const onPointerUp = (e) => {
            if (this.scanDragState.isDragging) {
                this.scanDragState.wasDragging = true;
                this.scanDragState.isDragging = false;
                this.scanDragState.dragType = null;
                this.scanDragState.dragCornerIndex = -1;
                canvas.style.cursor = 'default';
                e.stopPropagation();
            }
        };
        
        // Double-click reset removed - use Reset button instead
        
        // Click on tile to show details (only if not dragging)
        const onClick = (e) => {
            // Skip if we just finished dragging
            if (this.scanDragState.wasDragging) {
                this.scanDragState.wasDragging = false;
                return;
            }
            
            const corners = getCorners();
            if (!corners) return;
            
            const { x, y } = getCanvasCoords(e);
            
            // Check if inside grid but not on a corner
            const cornerIndex = findCornerUnderMouse(x, y, corners);
            if (cornerIndex !== -1) return; // On corner, let drag handle it
            
            if (isPointInQuad(x, y, corners)) {
                // Find which tile was clicked using bilinear interpolation
                const gridData = this.sharedState.gridData || this.sharedState.referenceGridData;
                if (!gridData) return;
                
                const { rows, cols } = gridData;
                const [tl, tr, br, bl] = corners;
                
                // Convert click to normalized grid coordinates
                const tile = this._findTileAtPoint(x, y, corners, rows, cols);
                if (tile) {
                    this._showTileDetails(tile.row, tile.col, gridData);
                }
            }
        };
        
        // Capture-phase pointer listeners intercept before Canvas.js pan/zoom handlers
        canvas.addEventListener('pointerdown', onPointerDown, true);
        canvas.addEventListener('pointermove', onPointerMove, true);
        canvas.addEventListener('pointerup',   onPointerUp,   true);
        canvas.addEventListener('pointercancel', onPointerUp, true);
        canvas.addEventListener('click', onClick, true);
    }
    
    _handleUpdate(key, value, allValues) {
        console.log('🔄 MFP _handleUpdate called:', { key, value, allValues });
        window.debugLog('TOOLS', `MFP: Update ${key}`);
        
        // Handle all buttons and inputs from ALL tabs
        switch(key) {
            // SOURCE tab
            case 'importProject': 
                this.sourceActions.importProject(value, this.toolBase).then(() => {
                    // After import, sync sharedState and update dropdowns
                    if (this.sharedState.selectedFilaments && this.sharedState.selectedFilaments.length > 0) {
                        this._updateFilamentDropdowns();
                        this.sourceActions.updateSequenceCount(this.toolBase);
                    }
                });
                break;
            case 'filamentPicker_indices':  // ToolBase sends '_indices' suffix!
                console.log('🎨 filamentPicker_indices changed:', value);
                this.sharedState.selectedFilaments = value || [];
                console.log('🎨 Updated sharedState.selectedFilaments:', this.sharedState.selectedFilaments);
                this.sourceActions.updateSequenceCount(this.toolBase);
                
                // Update filament dropdown options dynamically
                this._updateFilamentDropdowns();
                
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
            case 'exportGridPNG': this.sourceActions.exportGridPNG(allValues, this.toolBase); break;
            case 'exportGridSTL': this.sourceActions.exportGridSTL(allValues, this.toolBase); break;
            case 'exportGridCSV': this.sourceActions.exportGridCSV(allValues, this.toolBase); break;
            case 'exportCompletePackage': this.sourceActions.exportCompletePackage(allValues, this.toolBase); break;
            
            // SCAN tab
            case 'importProjectScan': this.scanActions.importProject(value, this.toolBase); break;
            case 'importGridCSV': this.scanActions.importGridCSV(value, this.toolBase); break;
            case 'useLastGrid': this.scanActions.useLastGrid(this.toolBase); break;
            case 'viewReferenceGrid': this.scanActions.viewReferenceGrid(this.toolBase); break;
            case 'applySortToGrid': this.scanActions.applySortToGrid(allValues, this.toolBase); break;
            case 'scanImage': this.scanActions.loadScanImage(value, this.toolBase); break;
            case 'resetGrid': 
                // Reset grid corners to initial position
                if (this.sharedState.scanImageElement) {
                    const img = this.sharedState.scanImageElement;
                    const gridData = this.sharedState.gridData || this.sharedState.referenceGridData;
                    if (gridData) {
                        this.scanActions._initializeGridCornersPixel(img.width, img.height, gridData);
                    }
                }
                this.scanActions.resetGrid(this.toolBase); 
                break;
            
            case 'flipH':
                this._flipGridHorizontal();
                break;
            case 'flipV':
                this._flipGridVertical();
                break;
            case 'rotate90':
                this._rotateGrid90();
                break;
            
            case 'resetView':
                // Reset canvas zoom/pan to default
                if (this.toolBase.canvasComponent) {
                    this.toolBase.canvasComponent.resetViewport(true);
                    console.log('🔄 View reset to default');
                }
                break;
            
            // Grid overlay adjustment controls
            case 'gridOffsetX':
            case 'gridOffsetY':
            case 'gridRotation':
            case 'gridOptions':
            case 'expectedOpacity':
            case 'deadzonePercent':
                // Update grid overlay options state from UI values
                const gridOpts = allValues.gridOptions || [];
                this.sharedState.gridOverlayOptions = {
                    showSampleZones: gridOpts.includes('Show Sample Zones'),
                    showExpected: gridOpts.includes('Show Expected Colors'),
                    showAnalysed: gridOpts.includes('Show Analysed Colors')
                };
                this.sharedState.gridAlignment = {
                    offsetX: allValues.gridOffsetX || 0,
                    offsetY: allValues.gridOffsetY || 0,
                    rotation: allValues.gridRotation || 0,
                    ...this.sharedState.gridOverlayOptions
                };
                break;
            
            case 'analyzeScan': 
                console.log('🔘 Analyze Scan button clicked');
                this.scanActions.analyzeScan(allValues, this.toolBase).then(() => {
                    if (this.sharedState.scanAnalysis && this.sharedState.scanAnalysis.length > 0) {
                        // Enable "Show Analysed Colors" overlay
                        const currentOptions = allValues.gridOptions || [];
                        if (!currentOptions.includes('Show Analysed Colors')) {
                            const newOptions = [...currentOptions, 'Show Analysed Colors'];
                            this.toolBase.setValue('gridOptions', newOptions);
                            this.sharedState.gridOverlayOptions = {
                                showSampleZones: newOptions.includes('Show Sample Zones'),
                                showExpected: newOptions.includes('Show Expected Colors'),
                                showAnalysed: true
                            };
                        }
                        // Invert button: signal analysis is done
                        const analyseBtn = this.toolBase.getComponent('analyzeScan');
                        if (analyseBtn && analyseBtn.element) {
                            analyseBtn.element.textContent = 'Analysed';
                            analyseBtn.element.style.background = 'var(--c-text)';
                            analyseBtn.element.style.color = 'var(--c-bg)';
                        }
                        // Propagate palette to QUANTIZE tab
                        this._refreshTabStatus('QUANTIZE');
                        // Refresh palette display if already on QUANTIZE tab
                        this._updatePaletteDisplay();
                    }
                    this.toolBase.draw();
                });
                break;
            case 'viewAnalysis': this.scanActions.viewAnalysis(this.toolBase); break;
            case 'exportPalette': this.scanActions.exportPalette(this.toolBase); break;
            case 'exportQuantConfig': this.scanActions.exportQuantizationConfig(this.toolBase); break;
            case 'exportComparisonCSV': this.scanActions.exportComparisonCSV(this.toolBase); break;
            
            // QUANTIZE tab
            case 'uploadPalette':
                this.quantizeActions.loadPaletteFromJSON(value, this.toolBase).then(() => {
                    this._refreshTabStatus('QUANTIZE');
                });
                break;
            case 'importProjectQuantize': 
                this._triggerFileUpload('.json,.zip', async (file) => {
                    if (file.name.endsWith('.zip')) {
                        await this.sourceActions.importProject(file, this.toolBase);
                    } else {
                        await this.quantizeActions.loadPaletteFromJSON(file, this.toolBase);
                    }
                    // Refresh QUANTIZE tab status after import
                    this._refreshTabStatus('QUANTIZE');
                    this.toolBase.draw();
                });
                break;
            case 'sourceImage': this.quantizeActions.loadSourceImage(value, this.toolBase); break;
            case 'quantize': this.quantizeActions.quantize(allValues, this.toolBase); break;
            
            // OUTPUTS tab — canvas view
            case 'outputsCanvasView':
                // dropdown change — redraw handled by toolBase.draw() at end of switch
                break;

            // OUTPUTS tab — calibration grid exports
            case 'outputGridPNG':
                this.sourceActions.exportGridPNG(allValues, this.toolBase);
                break;
            case 'outputGridSTL':
                this.sourceActions.exportGridSTL(allValues, this.toolBase);
                break;
            case 'outputGridCSV':
                this.sourceActions.exportGridCSV(allValues, this.toolBase);
                break;
            case 'outputGridJSON':
                this.exportActions.exportJSON(allValues, this.toolBase);
                break;

            // OUTPUTS tab — scan analysis exports
            case 'outputPaletteGPL':
                this.scanActions.exportPalette(this.toolBase);
                break;
            case 'outputQuantConfig':
                this.scanActions.exportQuantizationConfig(this.toolBase);
                break;
            case 'outputComparisonCSV':
                this.scanActions.exportComparisonCSV(this.toolBase);
                break;

            // OUTPUTS tab — quantised image export
            case 'outputQuantPNG':
                this.quantizeActions.exportQuantizedImage(this.toolBase);
                break;

            case 'exportAnalysisImage':
                this.quantizeActions.exportAnalysisImage(allValues, this.toolBase);
                break;

            // OUTPUTS tab — artwork STL generation and download
            case 'generateArtworkSTL':
                this.exportActions.generateArtworkSTL(allValues, this.toolBase);
                break;
            case 'downloadSTLZip':
                this.exportActions.downloadAllSTLs(this.toolBase);
                break;
            case 'downloadSTLIndividual':
                this.exportActions.downloadIndividualSTLs(this.toolBase);
                break;

            // OUTPUTS tab — complete project
            case 'exportCompleteProject':
                this.exportActions.exportCompleteProject(allValues, this.toolBase);
                break;
        }
    }
    
    _handleDraw(ctx, canvas, values) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const currentTab = this._getCurrentTab();
        const view = this.sharedState.canvasToolbarView || 'auto';

        switch (currentTab) {
            case 'SOURCE':
                this._drawSourceTab(ctx, canvas, values, view);
                return;
            case 'SCAN':
                this._drawScanTab(ctx, canvas, values, view);
                return;
            case 'QUANTIZE':
                this._drawQuantize(ctx, canvas, values);
                return;
            case 'OUTPUTS':
                this._drawOutputsTab(ctx, canvas, values, view);
                return;
            default:
                this._drawPlaceholder(ctx, canvas, 'Unknown tab');
                return;
        }
    }

    _drawSourceTab(ctx, canvas, values, view) {
        if (view === 'auto' || view === 'grid') {
            if (this.sharedState.gridData) {
                this._drawGrid(ctx, canvas, values);
            } else {
                this._drawPlaceholder(ctx, canvas, 'Select filaments to generate grid');
            }
        }
    }

    _drawScanTab(ctx, canvas, values, view) {
        if (view === 'scan') {
            if (this.sharedState.scanImageElement) {
                this._drawScanImage(ctx, canvas, this.sharedState.scanImageElement, values);
            } else {
                this._drawPlaceholder(ctx, canvas, 'Upload Scan Image');
            }
            return;
        }
        // auto / overlay
        if (this.sharedState.scanImageElement) {
            this._drawScanImage(ctx, canvas, this.sharedState.scanImageElement, values);
            if (this.sharedState.gridData || this.sharedState.referenceGridData) {
                this._drawGridOverlay(ctx, canvas, values);
            }
        } else {
            this._drawPlaceholder(ctx, canvas, 'Upload Scan Image');
        }
    }

    _drawOutputsTab(ctx, canvas, values, view) {
        if (view === 'quantised') {
            if (this.sharedState.quantizedImageElement) {
                this._drawQuantize(ctx, canvas, values);
            } else {
                this._drawPlaceholder(ctx, canvas, 'No quantised image — run QUANTIZE first');
            }
            return;
        }
        if (view.startsWith('grid')) {
            if (this.sharedState.gridData) {
                const map = { gridCombined: 'Combined', gridL0: 'Layer 0', gridL1: 'Layer 1', gridL2: 'Layer 2', gridL3: 'Layer 3' };
                const saved = values.canvasView;
                values.canvasView = map[view] || 'Combined';
                this._drawGrid(ctx, canvas, values);
                values.canvasView = saved;
            } else {
                this._drawPlaceholder(ctx, canvas, 'No grid — generate in SOURCE tab');
            }
            return;
        }
        if (view.startsWith('art')) {
            if (this.sharedState.exportSTLData) {
                const map = { artCombined: 'Combined', artAll: 'All Layers', artL0: 'Layer 0', artL1: 'Layer 1', artL2: 'Layer 2', artL3: 'Layer 3' };
                const saved = values.exportLayerView;
                values.exportLayerView = map[view] || 'Combined';
                this._drawExportLayers(ctx, canvas, values);
                values.exportLayerView = saved;
            } else {
                this._drawPlaceholder(ctx, canvas, 'No artwork STLs — generate them below');
            }
            return;
        }
        // auto — best available
        if (this.sharedState.exportSTLData) {
            this._drawExportLayers(ctx, canvas, values);
        } else if (this.sharedState.quantizedImageElement) {
            this._drawQuantize(ctx, canvas, values);
        } else if (this.sharedState.gridData) {
            this._drawGrid(ctx, canvas, values);
        } else {
            this._drawPlaceholder(ctx, canvas, 'Complete earlier tabs to see outputs here');
        }
    }
    
    _drawScanImage(ctx, canvas, img, values) {
        // CRITICAL: Always draw at 1:1 for accurate colour sampling
        // Canvas has already been resized to match image dimensions
        ctx.drawImage(img, 0, 0);
        
        // Image bounds = canvas bounds (1:1 mapping)
        this.sharedState.scanImageBounds = { x: 0, y: 0, width: img.width, height: img.height };
    }
    
    _drawGridOverlay(ctx, canvas, values) {
        const gridData = this.sharedState.gridData || this.sharedState.referenceGridData;
        if (!gridData) return;
        
        const { rows, cols, sequences, colours } = gridData;
        
        // Get corners in pixel coordinates (set when scan loads)
        const corners = this.sharedState.gridCornersPixel;
        if (!corners || corners.length !== 4) return;
        
        // Get options from UI OR sharedState (for when just updated)
        const options = values.gridOptions || [];
        const overlayOpts = this.sharedState.gridOverlayOptions || {};
        const showZones = overlayOpts.showSampleZones ?? options.includes('Show Sample Zones');
        const showExpected = overlayOpts.showExpected ?? options.includes('Show Expected Colors');
        const showAnalysed = overlayOpts.showAnalysed ?? options.includes('Show Analysed Colors');
        const deadzonePercent = (values.deadzonePercent || 10) / 100;
        
        // Get analysis data if available
        const analysisData = this.sharedState.scanAnalysis;
        
        // Debug log for analysis visibility
        if (analysisData && showAnalysed) {
            console.log(`🎨 Drawing ${analysisData.length} analysed tiles`);
        }
        
        // Helper: linear interpolation
        const lerp = (a, b, t) => a + (b - a) * t;
        const lerp2D = (p0, p1, t) => ({ x: lerp(p0.x, p1.x, t), y: lerp(p0.y, p1.y, t) });
        
        // Helper: get point in grid using bilinear interpolation
        const getGridPoint = (col, row) => {
            const tCol = col / cols;
            const tRow = row / rows;
            const top = lerp2D(corners[0], corners[1], tCol);
            const bottom = lerp2D(corners[3], corners[2], tCol);
            return lerp2D(top, bottom, tRow);
        };
        
        ctx.save();
        
        // Draw ALL grid lines in one pass - 1px black as per spec
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
        
        // Draw sample zones, expected colors, and analysed colors if enabled
        const expectedOpacity = (values.expectedOpacity ?? 50) / 100;
        
        // Use the same simColour function as SOURCE tab for consistency
        
        if (showZones || showExpected || showAnalysed) {
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const idx = row * cols + col;
                    
                    const tl = getGridPoint(col, row);
                    const tr = getGridPoint(col + 1, row);
                    const bl = getGridPoint(col, row + 1);
                    const br = getGridPoint(col + 1, row + 1);
                    
                    // Calculate safe zone inset
                    const safeTL = lerp2D(tl, br, deadzonePercent);
                    const safeTR = lerp2D(tr, bl, deadzonePercent);
                    const safeBR = lerp2D(br, tl, deadzonePercent);
                    const safeBL = lerp2D(bl, tr, deadzonePercent);
                    
                    // Show ANALYSED colors (from actual scan) - fill the sample area
                    if (showAnalysed && analysisData) {
                        const tileAnalysis = analysisData.find(d => d.index === idx);
                        if (tileAnalysis) {
                            const { r, g, b } = tileAnalysis.rgb;
                            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${expectedOpacity})`;
                            
                            // Fill the safe zone (sample area) with analysed color
                            ctx.beginPath();
                            ctx.moveTo(safeTL.x, safeTL.y);
                            ctx.lineTo(safeTR.x, safeTR.y);
                            ctx.lineTo(safeBR.x, safeBR.y);
                            ctx.lineTo(safeBL.x, safeBL.y);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }
                    
                    // Show EXPECTED colors (predicted from filament stack) - fill the deadzone
                    if (showExpected && sequences && sequences[idx] && colours) {
                        const expected = simColour(sequences[idx], colours);
                        if (expected && (expected.r !== 255 || expected.g !== 255 || expected.b !== 255)) {
                            // Fill DEADZONE (border) with expected color
                            // Draw outer quad, then cut out inner safe zone
                            ctx.fillStyle = `rgba(${expected.r}, ${expected.g}, ${expected.b}, ${expectedOpacity})`;
                            
                            ctx.beginPath();
                            // Outer path (clockwise)
                            ctx.moveTo(tl.x, tl.y);
                            ctx.lineTo(tr.x, tr.y);
                            ctx.lineTo(br.x, br.y);
                            ctx.lineTo(bl.x, bl.y);
                            ctx.closePath();
                            // Inner path (counter-clockwise to cut out)
                            ctx.moveTo(safeTL.x, safeTL.y);
                            ctx.lineTo(safeBL.x, safeBL.y);
                            ctx.lineTo(safeBR.x, safeBR.y);
                            ctx.lineTo(safeTR.x, safeTR.y);
                            ctx.closePath();
                            
                            ctx.fill('evenodd');
                        }
                    }
                    
                    if (showZones) {
                        // Draw safe zone outline
                        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(safeTL.x, safeTL.y);
                        ctx.lineTo(safeTR.x, safeTR.y);
                        ctx.lineTo(safeBR.x, safeBR.y);
                        ctx.lineTo(safeBL.x, safeBL.y);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
            }
        }
        
        // Draw corner handles - small visual markers (2px) but larger hit area
        // Visual: small colored squares, distinct colors per corner
        const HANDLE_SIZE = 2; // 2px visual size as per spec
        const HANDLE_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00']; // TL, TR, BR, BL
        
        corners.forEach((corner, i) => {
            // Outer ring (white for visibility on any background)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(corner.x - HANDLE_SIZE - 1, corner.y - HANDLE_SIZE - 1, 
                        (HANDLE_SIZE + 1) * 2, (HANDLE_SIZE + 1) * 2);
            
            // Inner colored square
            ctx.fillStyle = HANDLE_COLORS[i];
            ctx.fillRect(corner.x - HANDLE_SIZE, corner.y - HANDLE_SIZE, 
                        HANDLE_SIZE * 2, HANDLE_SIZE * 2);
            
            // Black outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(corner.x - HANDLE_SIZE, corner.y - HANDLE_SIZE, 
                          HANDLE_SIZE * 2, HANDLE_SIZE * 2);
        });
        
        ctx.restore();
        
        // Draw minimal info (top-left, unobtrusive)
        ctx.fillStyle = '#000000';
        ctx.font = '10px "Atkinson Hyperlegible", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${rows}×${cols} grid`, 5, 12);
    }
    
    // ========================================
    // GRID TRANSFORMATION METHODS
    // ========================================
    
    /**
     * Flip grid horizontally (mirror left-right)
     * Swaps x-coordinates of corners around center
     */
    _flipGridHorizontal() {
        const corners = this.sharedState.gridCornersPixel;
        if (!corners || corners.length !== 4) return;
        
        // Find center of grid
        const centerX = corners.reduce((sum, c) => sum + c.x, 0) / 4;
        
        // Mirror each corner around center
        this.sharedState.gridCornersPixel = corners.map(c => ({
            x: centerX + (centerX - c.x),
            y: c.y
        }));
        
        console.log('🔄 Grid flipped horizontally');
    }
    
    /**
     * Flip grid vertically (mirror top-bottom)
     * Swaps y-coordinates of corners around center
     */
    _flipGridVertical() {
        const corners = this.sharedState.gridCornersPixel;
        if (!corners || corners.length !== 4) return;
        
        // Find center of grid
        const centerY = corners.reduce((sum, c) => sum + c.y, 0) / 4;
        
        // Mirror each corner around center
        this.sharedState.gridCornersPixel = corners.map(c => ({
            x: c.x,
            y: centerY + (centerY - c.y)
        }));
        
        console.log('🔄 Grid flipped vertically');
    }
    
    /**
     * Rotate grid 90° clockwise around center
     */
    _rotateGrid90() {
        const corners = this.sharedState.gridCornersPixel;
        if (!corners || corners.length !== 4) return;
        
        // Find center of grid
        const centerX = corners.reduce((sum, c) => sum + c.x, 0) / 4;
        const centerY = corners.reduce((sum, c) => sum + c.y, 0) / 4;
        
        // Rotate each corner 90° clockwise around center
        this.sharedState.gridCornersPixel = corners.map(c => {
            const dx = c.x - centerX;
            const dy = c.y - centerY;
            return {
                x: centerX + dy,  // 90° CW: new x = old y
                y: centerY - dx   // 90° CW: new y = -old x
            };
        });
        
        console.log('🔄 Grid rotated 90° clockwise');
    }
    
    /**
     * @deprecated Use _flipGridHorizontal instead
     */
    _flipGridCorners() {
        this._flipGridHorizontal();
    }
    
    /**
     * Find which tile is at a given point using perspective-correct math
     * Returns { row, col } or null if not in grid
     */
    _findTileAtPoint(x, y, corners, rows, cols) {
        const [tl, tr, br, bl] = corners;
        
        // Inverse bilinear interpolation to get normalized u,v from x,y
        // This is approximate but good enough for click detection
        
        // Compute vectors
        const topVec = { x: tr.x - tl.x, y: tr.y - tl.y };
        const bottomVec = { x: br.x - bl.x, y: br.y - bl.y };
        const leftVec = { x: bl.x - tl.x, y: bl.y - tl.y };
        const rightVec = { x: br.x - tr.x, y: br.y - tr.y };
        
        // Use iterative refinement to find u,v
        let u = 0.5, v = 0.5;
        for (let iter = 0; iter < 10; iter++) {
            // Current point at u,v
            const topPoint = { x: tl.x + topVec.x * u, y: tl.y + topVec.y * u };
            const bottomPoint = { x: bl.x + bottomVec.x * u, y: bl.y + bottomVec.y * u };
            const currentPoint = {
                x: topPoint.x + (bottomPoint.x - topPoint.x) * v,
                y: topPoint.y + (bottomPoint.y - topPoint.y) * v
            };
            
            // Error
            const ex = x - currentPoint.x;
            const ey = y - currentPoint.y;
            
            // Approximate derivatives (simplified)
            const duX = (topVec.x * (1 - v) + bottomVec.x * v);
            const duY = (topVec.y * (1 - v) + bottomVec.y * v);
            const dvX = (bottomPoint.x - topPoint.x);
            const dvY = (bottomPoint.y - topPoint.y);
            
            // Update u,v
            const det = duX * dvY - duY * dvX;
            if (Math.abs(det) < 0.001) break;
            
            u += (ex * dvY - ey * dvX) / det;
            v += (duX * ey - duY * ex) / det;
        }
        
        // Clamp and convert to row/col
        if (u < 0 || u > 1 || v < 0 || v > 1) return null;
        
        const col = Math.floor(u * cols);
        const row = Math.floor(v * rows);
        
        // Safety bounds check
        if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
        
        return { row, col };
    }
    
    /**
     * Show tile details in a popup or status
     */
    _showTileDetails(row, col, gridData) {
        const idx = row * gridData.cols + col;
        const sequence = gridData.sequences?.[idx];
        
        if (!sequence) {
            this.toolBase.setValue('scanStatus', `Tile (${row}, ${col}) - No sequence data`);
            return;
        }
        
        // Format layer info
        const layers = sequence.map((filIdx, layer) => {
            if (filIdx === 0) return `Layer ${layer}: Empty`;
            const fil = gridData.colours?.[filIdx - 1];
            return `Layer ${layer}: ${fil?.n || `Filament ${filIdx}`}`;
        }).join('\\n');
        
        // Check for analysis data
        const analysis = this.sharedState.scanAnalysis?.find(d => d.index === idx);
        
        let message = `Tile (${row}, ${col}) - Sequence: ${sequence.join('')}`;
        
        if (analysis) {
            const { r, g, b } = analysis.rgb;
            message += ` | Scanned: RGB(${r}, ${g}, ${b}) = ${analysis.hex}`;
            message += ` | Deviation: ${analysis.colorDeviation.toFixed(2)}`;
        }
        
        this.toolBase.setValue('scanStatus', message);
        console.log(`📊 Tile Details [${row}, ${col}]:`);
        console.log(`  Sequence: ${sequence.join('')}`);
        sequence.forEach((filIdx, layer) => {
            const fil = gridData.colours?.[filIdx - 1];
            console.log(`  Layer ${layer}: ${filIdx === 0 ? 'Empty' : (fil?.n || `Fil ${filIdx}`)}`);
        });
        if (analysis) {
            console.log(`  Scanned RGB: ${analysis.hex} (${analysis.rgb.r}, ${analysis.rgb.g}, ${analysis.rgb.b})`);
            console.log(`  Pixels sampled: ${analysis.pixelsSampled}`);
            console.log(`  Color deviation: ${analysis.colorDeviation.toFixed(2)}`);
        }
    }
    
    // ========================================
    // UTILITY METHODS
    // ========================================
    
    /**
     * Programmatically trigger a file upload dialog
     * @param {string} accept - File types to accept (e.g. '.json,.zip')
     * @param {function} callback - Callback receiving the selected file
     */
    _triggerFileUpload(accept, callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) callback(file);
        };
        input.click();
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
        const view = this.sharedState.canvasToolbarView || 'auto';

        if (view === 'source') {
            if (this.sharedState.sourceImageElement) {
                this._drawImageFit(ctx, canvas, this.sharedState.sourceImageElement);
            } else {
                this._drawPlaceholder(ctx, canvas, 'Load Source Image');
            }
            return;
        }

        if (view === 'adjusted') {
            if (this.sharedState.sourceImageData) {
                this._drawImageDataFit(ctx, canvas, this.sharedState.sourceImageData);
            } else if (this.sharedState.sourceImageElement) {
                this._drawImageFit(ctx, canvas, this.sharedState.sourceImageElement);
            } else {
                this._drawPlaceholder(ctx, canvas, 'Load Source Image');
            }
            return;
        }

        if (view === 'quantised') {
            if (this.sharedState.quantizedImageElement) {
                this._drawImageFit(ctx, canvas, this.sharedState.quantizedImageElement, true);
            } else {
                this._drawPlaceholder(ctx, canvas, 'Run Quantize first');
            }
            return;
        }

        if (view === 'analysis') {
            this._drawAnalysisComposite(ctx, canvas, values);
            return;
        }

        if (view.startsWith('art')) {
            if (this.sharedState.exportSTLData) {
                const map = { artCombined: 'Combined', artAll: 'All Layers', artL0: 'Layer 0', artL1: 'Layer 1', artL2: 'Layer 2', artL3: 'Layer 3' };
                const saved = values.exportLayerView;
                values.exportLayerView = map[view] || 'Combined';
                this._drawExportLayers(ctx, canvas, values);
                values.exportLayerView = saved;
            } else {
                this._drawPlaceholder(ctx, canvas, 'Generate Artwork STLs first');
            }
            return;
        }

        // 'auto' — cascade: quantised > adjusted > source > placeholder
        if (this.sharedState.quantizedImageElement) {
            this._drawImageFit(ctx, canvas, this.sharedState.quantizedImageElement, true);
        } else if (this.sharedState.sourceImageData) {
            this._drawImageDataFit(ctx, canvas, this.sharedState.sourceImageData);
        } else if (this.sharedState.sourceImageElement) {
            this._drawImageFit(ctx, canvas, this.sharedState.sourceImageElement);
        } else {
            this._drawPlaceholder(ctx, canvas, 'Load Source Image');
        }
    }

    _drawImageFit(ctx, canvas, img, nearestNeighbour = false) {
        const w0 = img.naturalWidth || img.width;
        const h0 = img.naturalHeight || img.height;
        const scale = Math.min(canvas.width / w0, canvas.height / h0);
        const w = w0 * scale;
        const h = h0 * scale;
        const x = Math.round((canvas.width  - w) / 2);
        const y = Math.round((canvas.height - h) / 2);
        ctx.imageSmoothingEnabled = !nearestNeighbour;
        ctx.drawImage(img, x, y, Math.round(w), Math.round(h));
    }

    _drawImageDataFit(ctx, canvas, imgData) {
        if (!this._imgDataCache
            || this._imgDataCache.data !== imgData.data
            || this._imgDataCache.w !== imgData.width
            || this._imgDataCache.h !== imgData.height) {
            const tmp = document.createElement('canvas');
            tmp.width = imgData.width;
            tmp.height = imgData.height;
            tmp.getContext('2d').putImageData(imgData, 0, 0);
            this._imgDataCache = { canvas: tmp, data: imgData.data, w: imgData.width, h: imgData.height };
        }
        const scale = Math.min(canvas.width / imgData.width, canvas.height / imgData.height);
        const w = imgData.width * scale;
        const h = imgData.height * scale;
        const x = Math.round((canvas.width - w) / 2);
        const y = Math.round((canvas.height - h) / 2);
        ctx.drawImage(this._imgDataCache.canvas, x, y, Math.round(w), Math.round(h));
    }
    
    _drawAnalysisComposite(ctx, canvas, values) {
        const qsm = this.sharedState.quantizedSequenceMap;
        if (!qsm) {
            this._drawPlaceholder(ctx, canvas, 'Run Quantize first');
            return;
        }

        // Cache: only regenerate when quantise data changes
        if (!this._analysisCache || this._analysisCache.qsm !== qsm) {
            const { layerData, maxLayers, filamentCount, filamentColours } =
                this.quantizeActions._computeLayerMapsInt(qsm);
            const analysis = this.quantizeActions._analyseLayerQuality(layerData, maxLayers, qsm.width, qsm.height);

            const compositeCanvas = this.quantizeActions._renderAnalysisCanvas({
                qsm, layerData, maxLayers, filamentCount, filamentColours, analysis, values,
                sourceImg:    this.sharedState.sourceImageElement,
                quantisedImg: this.sharedState.quantizedImageElement,
                filaments:    this.sharedState.quantizationConfig?.filaments || [],
            });
            this._analysisCache = { qsm, canvas: compositeCanvas };
        }

        const src = this._analysisCache.canvas;
        const scale = Math.min(canvas.width / src.width, canvas.height / src.height);
        const w = src.width * scale;
        const h = src.height * scale;
        const x = Math.round((canvas.width - w) / 2);
        const y = Math.round((canvas.height - h) / 2);
        ctx.drawImage(src, x, y, Math.round(w), Math.round(h));
    }

    /**
     * Layer-by-layer 2D canvas view for generated artwork STLs.
     * viewMode "Combined" merges all layers (last non-empty filament wins per pixel).
     * viewMode "Layer N" shows a single layer coloured by filament.
     */
    /**
     * Rasterise a single layer's pixel Sets into a cached offscreen canvas.
     * Returns the cached canvas, keyed on the data identity + layer index.
     */
    _getLayerCanvas(data, layerIdx) {
        if (!this._layerCanvasCache) this._layerCanvasCache = {};
        const key = `${layerIdx}`;
        if (this._layerCanvasCache[key] && this._layerCanvasSrc === data) {
            return this._layerCanvasCache[key];
        }

        const { layerMaps, filamentNames, config } = data;
        const { imageWidth, imageHeight } = config;
        const filCount = filamentNames.length;
        const lm = layerMaps[layerIdx];
        if (!lm) return null;

        const filRGB = this._getFilamentRGB(data);
        const cv  = document.createElement('canvas');
        cv.width  = imageWidth;
        cv.height = imageHeight;
        const tctx = cv.getContext('2d');
        const imd  = tctx.createImageData(imageWidth, imageHeight);

        for (let p = 0; p < imageWidth * imageHeight; p++) {
            const i4 = p * 4;
            imd.data[i4] = 14; imd.data[i4+1] = 14; imd.data[i4+2] = 14; imd.data[i4+3] = 255;
        }
        for (let fi = 0; fi < filCount; fi++) {
            if (!lm[fi] || lm[fi].size === 0) continue;
            const c = filRGB[fi];
            for (const coord of lm[fi]) {
                const [x, y] = coord.split(',').map(Number);
                const i4 = (y * imageWidth + x) * 4;
                imd.data[i4] = c.r; imd.data[i4+1] = c.g; imd.data[i4+2] = c.b; imd.data[i4+3] = 255;
            }
        }
        tctx.putImageData(imd, 0, 0);

        this._layerCanvasSrc = data;
        this._layerCanvasCache[key] = cv;
        return cv;
    }

    /**
     * Parse filament hex colours to RGB, cached per exportSTLData identity.
     */
    _getFilamentRGB(data) {
        if (this._filRGBSrc === data) return this._filRGB;
        const { filamentNames, palette } = data;
        const filaments = this.sharedState.quantizationConfig?.filaments || [];
        const filColours = Array.from({ length: filamentNames.length }, (_, fi) => {
            const fil = filaments[fi];
            if (fil?.hex || fil?.h) return fil.hex || fil.h;
            const match = palette.find(e => e.sequence?.some(v => v > 0 && v - 1 === fi));
            return match?.hex || '#808080';
        });
        this._filRGB = filColours.map(hex => {
            const h = hex.replace('#', '');
            return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
        });
        this._filRGBSrc = data;
        return this._filRGB;
    }

    _drawExportLayers(ctx, canvas, values) {
        const data = this.sharedState.exportSTLData;
        if (!data) return;

        const { layerMaps, filamentNames, config } = data;
        const { imageWidth, imageHeight, printWidth } = config;
        const viewMode   = values.exportLayerView || 'Combined';
        const layerCount = layerMaps.length;
        const padding    = 20;
        const statsBarH  = 20;

        const drawStats = (label) => {
            ctx.save();
            ctx.fillStyle = '#00ff00';
            ctx.font = '11px "Space Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(
                `${layerCount} layers | ${Object.keys(data.stls).length} STLs | ${imageWidth}×${imageHeight}px → ${printWidth}mm${label ? ' | ' + label : ''}`,
                canvas.width / 2, canvas.height - 6
            );
            ctx.restore();
        };

        const drawCachedFit = (src, label) => {
            const scaleX = (canvas.width  - padding * 2) / src.width;
            const scaleY = (canvas.height - padding * 2 - statsBarH) / src.height;
            const scale  = Math.min(scaleX, scaleY);
            const dw = Math.round(src.width  * scale);
            const dh = Math.round(src.height * scale);
            const ox = Math.round((canvas.width  - dw) / 2);
            const oy = Math.round((canvas.height - statsBarH - dh) / 2);
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(src, ox, oy, dw, dh);
            ctx.restore();
            drawStats(label);
        };

        if (viewMode === 'Combined') {
            const qImg = this.sharedState.quantizedImageElement;
            if (qImg) {
                drawCachedFit(qImg, 'Combined');
            } else {
                this._drawPlaceholder(ctx, canvas, 'Quantised image not available — regenerate STLs');
            }

        } else if (viewMode === 'All Layers') {
            if (!this._allLayersCache || this._allLayersSrc !== data) {
                this._allLayersSrc = data;
                const filRGB = this._getFilamentRGB(data);
                const filCount = filamentNames.length;

                const cols   = Math.ceil(Math.sqrt(layerCount));
                const rows   = Math.ceil(layerCount / cols);
                const gap    = 4;
                const labelH = 14;
                const cellW  = imageWidth + gap;
                const cellH  = imageHeight + labelH + gap;
                const compW  = cols * cellW + gap;
                const compH  = rows * cellH + gap;

                const comp = document.createElement('canvas');
                comp.width  = compW;
                comp.height = compH;
                const cctx  = comp.getContext('2d');
                cctx.imageSmoothingEnabled = false;
                cctx.fillStyle = '#0e0e0e';
                cctx.fillRect(0, 0, compW, compH);

                for (let li = 0; li < layerCount; li++) {
                    const layerCv = this._getLayerCanvas(data, li);
                    if (!layerCv) continue;
                    const col = li % cols;
                    const row = Math.floor(li / cols);
                    const cx  = gap + col * cellW;
                    const cy  = gap + row * cellH + labelH;
                    cctx.drawImage(layerCv, cx, cy);

                    cctx.fillStyle = '#00ff00';
                    cctx.font = '10px "Space Mono", monospace';
                    cctx.textAlign = 'center';
                    cctx.fillText(`L${li}`, cx + imageWidth / 2, cy - 3);
                }
                this._allLayersCache = comp;
            }

            drawCachedFit(this._allLayersCache, 'All Layers');

        } else {
            const layerMatch = viewMode.match(/(\d+)/);
            const layerIdx   = layerMatch ? parseInt(layerMatch[1]) : 0;
            const layerCv    = this._getLayerCanvas(data, layerIdx);

            if (!layerCv) {
                this._drawPlaceholder(ctx, canvas, `Layer ${layerIdx} does not exist (${layerCount} available)`);
                drawStats('');
                return;
            }

            drawCachedFit(layerCv, `Layer ${layerIdx}: ${filamentNames.filter((_, fi) => layerMaps[layerIdx][fi]?.size > 0).join(', ')}`);
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
