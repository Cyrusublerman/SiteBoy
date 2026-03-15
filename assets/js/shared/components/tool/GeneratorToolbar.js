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
        
        // === LEFT: GENERATOR DROPDOWN (flex: 1 — absorbs remaining space) ===
        const dropdownCell = this.createElement('div', 'generator-toolbar-dropdown');
        dropdownCell.style.cssText = `
            display: flex;
            align-items: center;
            flex: 1;
            height: 100%;
            position: relative;
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            box-sizing: border-box;
        `;
        this._buildGeneratorDropdown(dropdownCell, F);
        this.element.appendChild(dropdownCell);
        
        // === RIGHT: 4 ACTION CELLS (each 6F wide — design-law §17.1) ===
        // FIT button
        const fitBtn = this._createTabButton('FIT', this.displayMode === 'fit', F);
        fitBtn.style.width = `${F * 6}px`;
        fitBtn.style.flexShrink = '0';
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
        
        // FILL button
        const fillBtn = this._createTabButton('FILL', this.displayMode === 'fill', F);
        fillBtn.style.width = `${F * 6}px`;
        fillBtn.style.flexShrink = '0';
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
        
        // ACTUAL button
        const actualBtn = this._createTabButton('ACTUAL', this.displayMode === 'actual', F);
        actualBtn.style.width = `${F * 6}px`;
        actualBtn.style.flexShrink = '0';
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
        
        // EXPORT button (6F wide) with dropdown panel
        const exportCell = this.createElement('div', 'generator-toolbar-export');
        exportCell.style.cssText = `
            display: flex;
            width: ${F * 6}px;
            flex-shrink: 0;
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
            font-size: ${F * 0.75}px;
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
            font-size: ${F * 0.75}px;
            text-transform: uppercase;
            cursor: pointer;
        `;
        
        const label = this.createElement('span');
        label.textContent = this._getActiveGeneratorTitle();
        this.generatorLabel = label;
        
        const menuSymbol = this.createElement('span');
        menuSymbol.textContent = '▸';
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
                font-size: ${F * 0.75}px;
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
                    font-size: ${F * 0.75}px;
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
            this.menuSymbol.textContent = '▾';
        } else {
            this._closeDropdown();
        }
    }
    
    _closeDropdown() {
        this.dropdownOpen = false;
        if (this.dropdownMenu) this.dropdownMenu.style.display = 'none';
        if (this.menuSymbol) this.menuSymbol.textContent = '▸';
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
        const exportBtn = this._createTabButton('EXPORT ▾', false, F);
        exportBtn.style.width = '100%';
        exportBtn.style.flex = '1';
        this.exportBtn = exportBtn;
        
        // Export dropdown panel — min-width matches cell (100%)
        const exportPanel = this.createElement('div', 'export-panel');
        exportPanel.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            min-width: 100%;
            background: var(--c-bg);
            border-left: 1px solid var(--c-border);
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            z-index: 200;
            box-sizing: border-box;
        `;
        
        // Static PNG export button (always present)
        const pngBtn = this._createTabButton('SAVE PNG', false, F);
        pngBtn.style.width = '100%';
        pngBtn.style.borderBottom = `1px solid var(--c-border)`;
        pngBtn.addEventListener('click', () => {
            this.onExport('png');
            this._closeExportPanel();
        });
        exportPanel.appendChild(pngBtn);

        // Mount point for AnimationExport UI (injected by host when script is animated)
        this._animExportMount = this.createElement('div', 'export-anim-mount');
        exportPanel.appendChild(this._animExportMount);
        
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

    /**
     * Returns the mount point div inside the export dropdown where
     * AnimationExport UI should be injected by the host.
     * @returns {HTMLElement}
     */
    getAnimExportMount() {
        return this._animExportMount ?? null;
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
