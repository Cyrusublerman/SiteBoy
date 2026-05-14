import { BaseComponent } from '../../foundation.js';
import { MarkdownBody } from '../../content.js';

/**
 * GlyphBuilderToolbar — generator-page chrome for the cursive glyph builder.
 *
 * Layout mirrors GeneratorToolbar: left session column (reference font dropdown),
 * right grid: INFO | FIT | FILL | ACTUAL | EXPORT▾.
 *
 * @extends BaseComponent
 */
export class GlyphBuilderToolbar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'glyph-builder-toolbar' }, deps);

        this.fontDropdown = options.fontDropdown;
        if (!this.fontDropdown || typeof this.fontDropdown.render !== 'function') {
            throw new Error('GlyphBuilderToolbar requires options.fontDropdown (Dropdown instance)');
        }

        this.displayMode    = options.displayMode || 'fit';
        this.infoFetchPath  = options.infoFetchPath || '';

        this.onDisplayModeChange = options.onDisplayModeChange || (() => {});
        this.onExportPng         = options.onExportPng         || (() => {});
        this.onExportZip         = options.onExportZip         || (() => {});
        this.onImportZipPick     = options.onImportZipPick     || (() => {});
        this.onImportFontPick    = options.onImportFontPick    || (() => {});

        this.displayModeButtons = [];
        this._viewBtn           = null;
        this._collapsed         = false;
        this._ro                = null;

        this.exportPanel        = null;
        this.exportBtn          = null;
        this.exportExpanded     = false;
        this._exportPanelRerendering = false;

        this.infoPanel          = null;
        this.infoExpanded       = false;
        this.infoBtn            = null;
        this._infoBodyComponent = null;

        this._zipInput          = null;
        this._fontInput         = null;

        this._fileInputsMounted = false;

        this._onDocClickBound = this._onDocClick.bind(this);
        this._docGlyphBound   = false;
    }

    _onDocClick(e) {
        if (this._exportPanelRerendering) return;
        if (
            this.exportBtn
            && !this.exportBtn.contains(/** @type {Node} */(e.target))
            && !this.exportPanel?.contains(/** @type {Node} */(e.target))
        ) {
            this._closeExportPanel();
        }
        if (
            this.infoPanel
            && !this.infoPanel.contains(/** @type {Node} */(e.target))
            && e.target !== this.infoBtn
        ) {
            this._closeInfoPanel();
        }
    }

    _toolbarDims() {
        const pack = this.calculateDimensions('generator-toolbar');
        return { F: pack.F, d: pack.dimensions || {} };
    }

    render() {
        if (this.element) return this.element;

        const { F, d } = this._toolbarDims();

        this.element = this.createElement('div', 'generator-toolbar glyph-builder-toolbar');
        this.element.style.cssText = `
            display: flex;
            width: 100%;
            height: ${d.rowHeight}px;
            background: var(--c-bg);
            flex-shrink: 0;
            box-sizing: border-box;
            overflow: visible;
            position: relative;
            border-left: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
        `;

        const leftCell = this.createElement('div', 'generator-toolbar-dropdown');
        leftCell.style.cssText = `
            display: flex;
            align-items: stretch;
            width: var(--subheader-title-width, ${d.sidebarTitleColFallback}px);
            flex-shrink: 0;
            height: 100%;
            position: relative;
            border-right: 1px solid var(--c-border);
            box-sizing: border-box;
        `;
        const ddEl = this.fontDropdown.render();
        if (ddEl) {
            ddEl.style.flex = '1';
            ddEl.style.minWidth = '0';
            leftCell.appendChild(ddEl);
        }
        this.element.appendChild(leftCell);

        this._actionArea = this.createElement('div', 'generator-toolbar-actions');
        this._actionArea.style.cssText = `
            display: grid;
            flex: 1;
            height: 100%;
            min-width: 0;
            grid-template-rows: 100%;
        `;
        this.element.appendChild(this._actionArea);

        this._buildActionCells(F, d);

        this._ro = new ResizeObserver(() => this._checkCollapse());
        this._ro.observe(this._actionArea);

        if (!this._docGlyphBound) {
            document.addEventListener('click', this._onDocClickBound);
            this._docGlyphBound = true;
        }

        this._ensureHiddenFileInputs();

        return this.element;
    }

    _ensureHiddenFileInputs() {
        if (this._fileInputsMounted) return;
        this._zipInput = this.createElement('input');
        this._zipInput.type = 'file';
        this._zipInput.accept = '.zip';
        this._zipInput.style.display = 'none';
        this._zipInput.addEventListener('change', () => {
            const f = this._zipInput.files?.[0];
            this._zipInput.value = '';
            if (f instanceof File) this.onImportZipPick(f);
        });

        this._fontInput = this.createElement('input');
        this._fontInput.type = 'file';
        this._fontInput.accept = '.ttf,.otf,.woff,.woff2';
        this._fontInput.style.display = 'none';
        this._fontInput.addEventListener('change', () => {
            const f = this._fontInput.files?.[0];
            this._fontInput.value = '';
            if (f instanceof File) this.onImportFontPick(f);
        });

        this.element.appendChild(this._zipInput);
        this.element.appendChild(this._fontInput);
        this._fileInputsMounted = true;
    }

    _buildActionCells(F, d) {
        this._actionArea.innerHTML = '';
        this.displayModeButtons = [];
        this._viewBtn = null;

        this._actionArea.style.gridTemplateColumns = this._collapsed
            ? 'repeat(4, 1fr)'
            : 'repeat(6, 1fr)';

        this.infoBtn = this._createTabButton('INFO', false, F, d);
        this._applyActionCellBorders(this.infoBtn);
        this.infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleInfoPanel();
        });
        this._actionArea.appendChild(this.infoBtn);

        if (this._collapsed) {
            this._viewBtn = this._createTabButton(this.displayMode.toUpperCase(), true, F, d);
            this._applyActionCellBorders(this._viewBtn);
            this._viewBtn.addEventListener('click', () => this._cycleDisplayMode());
            this._actionArea.appendChild(this._viewBtn);
        } else {
            ['fit', 'fill', 'actual'].forEach((mode) => {
                const btn = this._createTabButton(
                    mode.toUpperCase(),
                    this.displayMode === mode,
                    F,
                    d,
                );
                btn.dataset.mode = mode;
                this._applyActionCellBorders(btn);
                btn.addEventListener('click', () => {
                    this._setActiveDisplayMode(mode);
                    this.onDisplayModeChange(mode);
                });
                this.displayModeButtons.push(btn);
                this._actionArea.appendChild(btn);
            });
        }

        this._buildExportPanelChrome(F, d);
        this._buildInfoPanel(F, d);
    }

    _checkCollapse() {
        if (!this._actionArea) return;
        const { F, d } = this._toolbarDims();
        const totalWidth = this._actionArea.getBoundingClientRect().width;
        const onePart    = totalWidth / 6;
        const shouldCollapse = onePart < d.collapseColumnMinWidth;

        if (shouldCollapse !== this._collapsed) {
            this._collapsed = shouldCollapse;
            this._buildActionCells(F, d);
        }
    }

    _cycleDisplayMode() {
        const order = ['fit', 'fill', 'actual'];
        const idx   = order.indexOf(this.displayMode);
        const next  = order[(idx + 1) % order.length];
        this._setActiveDisplayMode(next);
        this.onDisplayModeChange(next);
    }

    _setActiveDisplayMode(mode) {
        this.displayMode = mode;
        this.displayModeButtons.forEach((btn) => {
            const m = btn.dataset.mode;
            const on = m === mode;
            btn.style.background = on ? 'var(--c-text)' : 'var(--c-bg)';
            btn.style.color      = on ? 'var(--c-bg)' : 'var(--c-text)';
        });
        if (this._viewBtn) {
            this._viewBtn.textContent = mode.toUpperCase();
        }
    }

    setDisplayMode(mode) {
        this._setActiveDisplayMode(mode);
    }

    _buildExportPanelChrome(F, d) {
        if (this.exportPanel && this.exportPanel.parentNode) {
            this.exportPanel.parentNode.removeChild(this.exportPanel);
        }
        this.exportPanel = null;

        const exportBtn = this.createElement('button', 'generator-toolbar-btn generator-toolbar-export-btn');
        exportBtn.type = 'button';
        exportBtn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 100%;
            padding: 0 ${F}px;
            border: none;
            min-width: 0;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${d.fontSizeSecondary}px;
            text-transform: uppercase;
            cursor: pointer;
            white-space: nowrap;
            box-sizing: border-box;
            position: relative;
            grid-column: span 2;
            border-left: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
        `;

        const labelSpan = this.createElement('span');
        labelSpan.textContent = 'EXPORT';
        labelSpan.style.flex = '1';
        labelSpan.style.textAlign = 'left';

        const glyphSpan = this.createElement('span');
        glyphSpan.textContent = '▾';
        glyphSpan.style.flexShrink = '0';

        exportBtn.appendChild(labelSpan);
        exportBtn.appendChild(glyphSpan);
        this.exportBtn = exportBtn;

        this.exportPanel = this.createElement('div', 'export-panel glyph-builder-export-panel');
        this.exportPanel.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            width: ${d.exportPanelWidth}px;
            background: var(--c-bg);
            border-left: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            z-index: 200;
            box-sizing: border-box;
            overflow-y: auto;
            overflow-x: hidden;
            max-height: calc(100vh - ${d.overlayMaxHeightDeduction}px);
        `;
        this.exportPanel.addEventListener('mousedown', (e) => e.stopPropagation());
        this.exportPanel.addEventListener('click',     (e) => e.stopPropagation());

        this._renderGlyphExportPanel(F, d);

        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleExportPanel();
        });

        this.element.appendChild(this.exportPanel);
        this._actionArea.appendChild(exportBtn);
    }

    _renderGlyphExportPanel(F, d) {
        this._exportPanelRerendering = true;
        setTimeout(() => { this._exportPanelRerendering = false; }, 0);

        const panel = this.exportPanel;
        panel.innerHTML = '';

        const mkRowBtn = (label, fn) => {
            const btn = this.createElement('button', 'export-glyph-row-btn');
            btn.type = 'button';
            btn.textContent = label;
            btn.style.cssText = `
                display: flex;
                align-items: center;
                width: 100%;
                height: ${d.rowHeight}px;
                padding: 0 ${F}px;
                border: none;
                border-top: 1px solid var(--c-border);
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${d.fontSizeSecondary}px;
                text-transform: uppercase;
                cursor: pointer;
                white-space: nowrap;
                box-sizing: border-box;
                text-align: left;
            `;
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'var(--c-text)';
                btn.style.color = 'var(--c-bg)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'var(--c-bg)';
                btn.style.color = 'var(--c-text)';
            });
            btn.addEventListener('click', fn);
            panel.appendChild(btn);
        };

        mkRowBtn('IMPORT ZIP', () => {
            this._closeExportPanel();
            this._zipInput.click();
        });
        mkRowBtn('LOAD FONT FILE', () => {
            this._closeExportPanel();
            this._fontInput.click();
        });
        mkRowBtn('EXPORT PNG', () => {
            this.onExportPng();
            this._closeExportPanel();
        });
        mkRowBtn('EXPORT LIBRARY ZIP', () => {
            this.onExportZip();
            this._closeExportPanel();
        });
    }

    _toggleExportPanel() {
        this.exportExpanded = !this.exportExpanded;
        if (this.exportExpanded) {
            const { F, d } = this._toolbarDims();
            this._renderGlyphExportPanel(F, d);
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

    _buildInfoPanel(F, d) {
        if (this.infoPanel && this.infoPanel.parentNode) {
            this.infoPanel.parentNode.removeChild(this.infoPanel);
        }

        this.infoPanel = this.createElement('div', 'generator-info-panel');
        this.infoPanel.style.cssText = `
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            width: ${d.infoPanelWidth}px;
            max-height: calc(100vh - ${d.overlayMaxHeightDeduction}px);
            overflow-y: auto;
            background: var(--c-bg);
            border-left: 1px solid var(--c-border);
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            z-index: 300;
            box-sizing: border-box;
        `;

        const mount = this.createElement('div');
        this.infoPanel.appendChild(mount);

        if (this.infoFetchPath) {
            this._infoBodyComponent = new MarkdownBody({
                fetchPath: this.infoFetchPath,
            }, this.deps);
            mount.appendChild(this._infoBodyComponent.render());
        } else {
            const empty = this.createElement('div');
            empty.textContent = 'NO INFO CONFIGURED';
            empty.style.cssText = `
                padding: ${F}px;
                font-family: 'Atkinson Hyperlegible', sans-serif;
                font-size: ${d.fontSizeSecondary}px;
                text-transform: uppercase;
            `;
            mount.appendChild(empty);
        }

        this.element.appendChild(this.infoPanel);
    }

    _toggleInfoPanel() {
        this.infoExpanded = !this.infoExpanded;
        if (this.infoExpanded) {
            this.infoPanel.style.display = 'block';
            this.infoBtn.style.background = 'var(--c-text)';
            this.infoBtn.style.color = 'var(--c-bg)';
        } else {
            this._closeInfoPanel();
        }
    }

    _closeInfoPanel() {
        this.infoExpanded = false;
        if (this.infoPanel) this.infoPanel.style.display = 'none';
        if (this.infoBtn) {
            this.infoBtn.style.background = 'var(--c-bg)';
            this.infoBtn.style.color = 'var(--c-text)';
        }
    }

    _applyActionCellBorders(el) {
        el.style.borderLeft   = '1px solid var(--c-border)';
        el.style.borderBottom = '1px solid var(--c-border)';
        el.style.boxSizing    = 'border-box';
        el.style.width        = '100%';
        el.style.height       = '100%';
    }

    _createTabButton(text, isActive, F, d) {
        const btn = this.createElement('button', 'generator-toolbar-btn');
        btn.type = 'button';
        btn.textContent = text;
        btn.style.cssText = `
            height: ${d.rowHeight}px;
            padding: 0 ${F}px;
            border: none;
            min-width: 0;
            background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
            color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
            font-family: 'Atkinson Hyperlegible', sans-serif;
            font-size: ${d.fontSizeSecondary}px;
            text-transform: uppercase;
            cursor: pointer;
            white-space: nowrap;
            box-sizing: border-box;
        `;
        return btn;
    }

    destroy() {
        if (this._ro) {
            this._ro.disconnect();
            this._ro = null;
        }
        this._closeExportPanel();
        this._closeInfoPanel();
        if (this._docGlyphBound) {
            document.removeEventListener('click', this._onDocClickBound);
            this._docGlyphBound = false;
        }
        if (this._infoBodyComponent?.destroy) {
            try { this._infoBodyComponent.destroy(); } catch (_) {}
        }
        this._infoBodyComponent = null;
        super.destroy();
    }
}
