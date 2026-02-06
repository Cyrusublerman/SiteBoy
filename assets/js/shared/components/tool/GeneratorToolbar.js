import { BaseComponent, BaseNavigationDropdown } from '../../foundation.js';

/**
 * GeneratorToolbar - Horizontal toolbar for the unified generators page
 * 
 * Layout: [DROPDOWN (50%)] [FIT|FILL|ACTUAL|EXPORT (12.5% each)]
 * 
 * Matches ToolBase tab styling exactly.
 */
export class GeneratorToolbar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'generator-toolbar' }, deps);
        
        this.generators = options.generators || [];
        this.activeGenerator = options.activeGenerator || null;
        this.displayMode = options.displayMode || 'fit';
        
        this.onGeneratorChange = options.onGeneratorChange || (() => {});
        this.onDisplayModeChange = options.onDisplayModeChange || (() => {});
        this.onExport = options.onExport || (() => {});
        
        this.navigationDropdown = null;
        this.displayModeButtons = [];
        this.exportPanel = null;
        this.exportBtn = null;
        this.exportExpanded = false;
        this.dropdownMenu = null;
        this.dropdownOpen = false;
        
        this.F = deps.MF?.F || 14;
    }

    render() {
        if (this.element) return this.element;
        
        const F = this.F;
        
        // Main toolbar container (children have individual bottom borders)
        this.element = this.createElement('div', 'generator-toolbar');
        this.element.style.cssText = `
            display: flex;
            width: 100%;
            height: ${F * 2}px;
            background: var(--c-bg);
            flex-shrink: 0;
        `;
        
        // === LEFT HALF: GENERATOR DROPDOWN (4/8 = 50%) ===
        const dropdownCell = this.createElement('div', 'generator-toolbar-dropdown');
        dropdownCell.style.cssText = `
            display: flex;
            align-items: center;
            width: 50%;
            height: 100%;
            position: relative;
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            box-sizing: border-box;
        `;
        this._buildGeneratorDropdown(dropdownCell, F);
        this.element.appendChild(dropdownCell);
        
        // === RIGHT HALF: 4 BUTTONS (each 1/8 = 12.5%) ===
        // FIT button (1/8)
        const fitBtn = this._createTabButton('FIT', this.displayMode === 'fit', F);
        fitBtn.style.width = '12.5%';
        fitBtn.style.borderRight = '1px solid var(--c-border)';
        fitBtn.style.borderBottom = '1px solid var(--c-border)';
        fitBtn.style.boxSizing = 'border-box';
        fitBtn.dataset.mode = 'fit';
        fitBtn.addEventListener('click', () => {
            this._setActiveDisplayMode('fit');
            this.onDisplayModeChange('fit');
        });
        this.displayModeButtons.push(fitBtn);
        this.element.appendChild(fitBtn);
        
        // FILL button (1/8)
        const fillBtn = this._createTabButton('FILL', this.displayMode === 'fill', F);
        fillBtn.style.width = '12.5%';
        fillBtn.style.borderRight = '1px solid var(--c-border)';
        fillBtn.style.borderBottom = '1px solid var(--c-border)';
        fillBtn.style.boxSizing = 'border-box';
        fillBtn.dataset.mode = 'fill';
        fillBtn.addEventListener('click', () => {
            this._setActiveDisplayMode('fill');
            this.onDisplayModeChange('fill');
        });
        this.displayModeButtons.push(fillBtn);
        this.element.appendChild(fillBtn);
        
        // ACTUAL button (1/8)
        const actualBtn = this._createTabButton('ACTUAL', this.displayMode === 'actual', F);
        actualBtn.style.width = '12.5%';
        actualBtn.style.borderRight = '1px solid var(--c-border)';
        actualBtn.style.borderBottom = '1px solid var(--c-border)';
        actualBtn.style.boxSizing = 'border-box';
        actualBtn.dataset.mode = 'actual';
        actualBtn.addEventListener('click', () => {
            this._setActiveDisplayMode('actual');
            this.onDisplayModeChange('actual');
        });
        this.displayModeButtons.push(actualBtn);
        this.element.appendChild(actualBtn);
        
        // EXPORT button (1/8) with dropdown panel
        const exportCell = this.createElement('div', 'generator-toolbar-export');
        exportCell.style.cssText = `
            display: flex;
            width: 12.5%;
            height: 100%;
            position: relative;
            border-bottom: 1px solid var(--c-border);
            box-sizing: border-box;
        `;
        this._buildExportButton(exportCell, F);
        this.element.appendChild(exportCell);
        
        return this.element;
    }
    
    /**
     * Create a tab-styled button matching ToolBase exactly
     */
    _createTabButton(text, isActive, F) {
        const btn = this.createElement('button', 'tool-tab');
        btn.type = 'button';
        btn.textContent = text;
        btn.style.cssText = `
            height: ${F * 2}px;
            padding: 0 ${F}px;
            border: none;
            background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
            color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
            font-family: 'Atkinson Hyperlegible', sans-serif;
            font-size: ${F}px;
            text-transform: uppercase;
            cursor: pointer;
        `;
        return btn;
    }
    
    /**
     * Build generator dropdown - simple custom implementation
     */
    _buildGeneratorDropdown(container, F) {
        // Trigger button
        const triggerArea = this.createElement('button', 'generator-dropdown-trigger');
        triggerArea.type = 'button';
        triggerArea.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 100%;
            padding: 0 ${F}px;
            border: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', sans-serif;
            font-size: ${F}px;
            text-transform: uppercase;
            cursor: pointer;
        `;
        
        const label = this.createElement('span');
        label.textContent = this._getActiveGeneratorTitle();
        this.generatorLabel = label;
        
        const menuSymbol = this.createElement('span');
        menuSymbol.textContent = '+';
        menuSymbol.style.marginLeft = `${F / 2}px`;
        this.menuSymbol = menuSymbol;
        
        triggerArea.appendChild(label);
        triggerArea.appendChild(menuSymbol);
        container.appendChild(triggerArea);
        
        // Dropdown menu
        const dropdownMenu = this.createElement('div', 'generator-dropdown-menu');
        dropdownMenu.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            border-top: none;
            z-index: 200;
            max-height: 400px;
            overflow-y: auto;
        `;
        this.dropdownMenu = dropdownMenu;
        
        // Populate dropdown with generators grouped by category
        this._populateDropdown(dropdownMenu, F);
        
        container.appendChild(dropdownMenu);
        
        // Toggle on click
        triggerArea.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleDropdown();
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                this._closeDropdown();
            }
        });
    }
    
    _populateDropdown(menu, F) {
        const grouped = this._groupByCategory();
        
        for (const [category, generators] of Object.entries(grouped)) {
            // Category header
            const header = this.createElement('div', 'generator-category-header');
            header.textContent = category.toUpperCase();
            header.style.cssText = `
                padding: ${F / 2}px ${F}px;
                background: var(--c-border);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', sans-serif;
                font-size: ${F * 0.85}px;
                text-transform: uppercase;
            `;
            menu.appendChild(header);
            
            // Generator items
            generators.forEach(gen => {
                const item = this.createElement('div', 'generator-item');
                item.textContent = gen.title;
                const isActive = gen.id === this.activeGenerator;
                item.style.cssText = `
                    padding: ${F / 2}px ${F}px;
                    background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                    color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                    font-family: 'Atkinson Hyperlegible', sans-serif;
                    font-size: ${F}px;
                    cursor: pointer;
                    border-bottom: 1px solid var(--c-border);
                `;
                
                item.addEventListener('click', () => {
                    this.setActiveGenerator(gen.id);
                    this.onGeneratorChange(gen.id);
                    this._closeDropdown();
                });
                
                item.addEventListener('mouseenter', () => {
                    if (gen.id !== this.activeGenerator) {
                        item.style.background = 'var(--c-border)';
                    }
                });
                item.addEventListener('mouseleave', () => {
                    item.style.background = gen.id === this.activeGenerator ? 'var(--c-text)' : 'var(--c-bg)';
                    item.style.color = gen.id === this.activeGenerator ? 'var(--c-bg)' : 'var(--c-text)';
                });
                
                menu.appendChild(item);
            });
        }
    }
    
    _toggleDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
        if (this.dropdownOpen) {
            this.dropdownMenu.style.display = 'block';
            this.menuSymbol.textContent = '-';
        } else {
            this._closeDropdown();
        }
    }
    
    _closeDropdown() {
        this.dropdownOpen = false;
        if (this.dropdownMenu) this.dropdownMenu.style.display = 'none';
        if (this.menuSymbol) this.menuSymbol.textContent = '+';
    }
    
    _groupByCategory() {
        const grouped = {};
        this.generators.forEach(gen => {
            const cat = gen.category || 'other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(gen);
        });
        return grouped;
    }
    
    _getActiveGeneratorTitle() {
        const gen = this.generators.find(g => g.id === this.activeGenerator);
        return gen ? gen.title : 'SELECT GENERATOR';
    }
    
    _buildExportButton(container, F) {
        const exportBtn = this._createTabButton('EXPORT', false, F);
        exportBtn.style.width = '100%';
        exportBtn.style.flex = '1';
        this.exportBtn = exportBtn;
        
        // Export dropdown panel
        const exportPanel = this.createElement('div', 'export-panel');
        exportPanel.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background: var(--c-bg);
            border: 1px solid var(--c-border);
            border-top: none;
            padding: ${F}px;
            z-index: 200;
            min-width: 180px;
        `;
        
        // Frame input row
        const frameRow = this.createElement('div');
        frameRow.style.cssText = `
            display: flex;
            align-items: center;
            gap: ${F / 2}px;
            margin-bottom: ${F / 2}px;
        `;
        
        const frameLabel = this.createElement('span');
        frameLabel.textContent = 'Frames:';
        frameLabel.style.cssText = `
            font-family: 'Atkinson Hyperlegible', sans-serif;
            font-size: ${F}px;
            color: var(--c-text);
        `;
        
        const frameInput = this.createElement('input');
        frameInput.type = 'number';
        frameInput.min = '1';
        frameInput.max = '9999';
        frameInput.value = '60';
        frameInput.style.cssText = `
            width: 60px;
            height: ${F * 1.5}px;
            padding: 0 ${F / 2}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', sans-serif;
            font-size: ${F}px;
        `;
        this.frameInput = frameInput;
        
        frameRow.appendChild(frameLabel);
        frameRow.appendChild(frameInput);
        exportPanel.appendChild(frameRow);
        
        // Execute button
        const executeBtn = this._createTabButton('EXPORT FRAMES', false, F);
        executeBtn.style.width = '100%';
        executeBtn.style.border = '1px solid var(--c-border)';
        executeBtn.addEventListener('click', () => {
            const frameCount = parseInt(this.frameInput.value, 10) || 60;
            this.onExport(frameCount);
            this._closeExportPanel();
        });
        exportPanel.appendChild(executeBtn);
        
        this.exportPanel = exportPanel;
        
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleExportPanel();
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                this._closeExportPanel();
            }
        });
        
        container.appendChild(exportBtn);
        container.appendChild(exportPanel);
    }
    
    _setActiveDisplayMode(mode) {
        this.displayMode = mode;
        this.displayModeButtons.forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.style.background = isActive ? 'var(--c-text)' : 'var(--c-bg)';
            btn.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
        });
    }
    
    _toggleExportPanel() {
        this.exportExpanded = !this.exportExpanded;
        if (this.exportExpanded) {
            this.exportPanel.style.display = 'block';
            this.exportBtn.style.background = 'var(--c-text)';
            this.exportBtn.style.color = 'var(--c-bg)';
        } else {
            this._closeExportPanel();
        }
    }
    
    _closeExportPanel() {
        this.exportExpanded = false;
        if (this.exportPanel) this.exportPanel.style.display = 'none';
        if (this.exportBtn) {
            this.exportBtn.style.background = 'var(--c-bg)';
            this.exportBtn.style.color = 'var(--c-text)';
        }
    }
    
    // === PUBLIC API ===
    
    setActiveGenerator(generatorId) {
        this.activeGenerator = generatorId;
        if (this.generatorLabel) {
            this.generatorLabel.textContent = this._getActiveGeneratorTitle();
        }
        this._closeDropdown();
    }
    
    setDisplayMode(mode) {
        this._setActiveDisplayMode(mode);
    }
    
    setGenerators(generators) {
        this.generators = generators;
        if (this.generatorLabel) {
            this.generatorLabel.textContent = this._getActiveGeneratorTitle();
        }
    }
    
    destroy() {
        this._closeDropdown();
        this._closeExportPanel();
        super.destroy();
    }
}
