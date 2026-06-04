import { BaseComponent } from '../../foundation.js';
import { MarkdownBody } from '../../content.js';

/**
 * GlyphBuilderToolbar — generator-page chrome for the cursive glyph builder.
 *
 * Layout: INFO | SCALE▾ (FIT/FILL/ACTUAL) | PREVIEW | GLYPHS | EXPORT▾.
 * (Reference font lives in the SESSION sidebar tab.)
 *
 * @extends BaseComponent
 */
export class GlyphBuilderToolbar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'glyph-builder-toolbar' }, deps);

        this.displayMode    = options.displayMode || 'fit';
        this.infoFetchPath  = options.infoFetchPath || '';

        this.onDisplayModeChange = options.onDisplayModeChange || (() => {});
        this.onPreviewClick      = options.onPreviewClick      || (() => {});
        this.onGlyphsClick       = options.onGlyphsClick       || (() => {});

        this.canvasView = options.canvasView || 'capture';

        this.onExportPng         = options.onExportPng         || (() => {});
        this.onExportSvg         = options.onExportSvg         || (() => {});
        this.onExportZip         = options.onExportZip         || (() => {});
        this.onImportZipPick     = options.onImportZipPick     || (() => {});
        this.onImportFontPick    = options.onImportFontPick    || (() => {});

        this._scaleBtn          = null;
        this._previewBtn        = null;
        this._glyphsBtn         = null;
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

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'generator-toolbar glyph-builder-toolbar');

        this._actionArea = this.createElement('div', 'glyph-builder-toolbar-actions');
        this.element.appendChild(this._actionArea);

        this._buildActionCells();

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
        this._zipInput = this.createElement('input', 'glyph-builder-hidden-input');
        this._zipInput.type = 'file';
        this._zipInput.accept = '.zip';
        this._zipInput.addEventListener('change', () => {
            const f = this._zipInput.files?.[0];
            this._zipInput.value = '';
            if (f instanceof File) this.onImportZipPick(f);
        });

        this._fontInput = this.createElement('input', 'glyph-builder-hidden-input');
        this._fontInput.type = 'file';
        this._fontInput.accept = '.ttf,.otf,.woff,.woff2';
        this._fontInput.addEventListener('change', () => {
            const f = this._fontInput.files?.[0];
            this._fontInput.value = '';
            if (f instanceof File) this.onImportFontPick(f);
        });

        this.element.appendChild(this._zipInput);
        this.element.appendChild(this._fontInput);
        this._fileInputsMounted = true;
    }

    _buildActionCells() {
        this._actionArea.innerHTML = '';
        this._scaleBtn = null;
        this._previewBtn = null;
        this._glyphsBtn = null;

        this.infoBtn = this._createTabButton('INFO', false);
        this._applyActionCellBorders(this.infoBtn, { omitLeft: true });
        this.infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleInfoPanel();
        });
        this._actionArea.appendChild(this.infoBtn);

        this._scaleBtn = this._createTabButton(this._scaleLabel(), false);
        this._applyActionCellBorders(this._scaleBtn);
        this._scaleBtn.addEventListener('click', () => this._cycleDisplayMode());
        this._actionArea.appendChild(this._scaleBtn);

        this._previewBtn = this._createTabButton('PREVIEW', this.canvasView === 'preview');
        this._applyActionCellBorders(this._previewBtn);
        this._previewBtn.addEventListener('click', () => {
            this.onPreviewClick();
        });
        this._actionArea.appendChild(this._previewBtn);

        this._glyphsBtn = this._createTabButton('GLYPHS', this.canvasView === 'atlas');
        this._applyActionCellBorders(this._glyphsBtn);
        this._glyphsBtn.addEventListener('click', () => {
            this.onGlyphsClick();
        });
        this._actionArea.appendChild(this._glyphsBtn);

        this._buildExportPanelChrome();
        this._buildInfoPanel();
    }

    _scaleLabel() {
        return this.displayMode.toUpperCase();
    }

    _checkCollapse() {
        /* Six fixed columns; labels shorten via CSS ellipsis on narrow cells. */
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
        if (this._scaleBtn) {
            this._scaleBtn.textContent = this._scaleLabel();
            const onScale = this.canvasView === 'capture';
            this._scaleBtn.classList.toggle('glyph-builder-toolbar-btn--active', onScale);
        }
    }

    setDisplayMode(mode) {
        this._setActiveDisplayMode(mode);
    }

    /**
     * @param {'capture'|'preview'|'atlas'} view
     */
    setCanvasView(view) {
        this.canvasView = view;
        if (this._previewBtn) {
            this._previewBtn.classList.toggle(
                'glyph-builder-toolbar-btn--active',
                view === 'preview',
            );
        }
        if (this._glyphsBtn) {
            this._glyphsBtn.classList.toggle(
                'glyph-builder-toolbar-btn--active',
                view === 'atlas',
            );
        }
        this._setActiveDisplayMode(this.displayMode);
    }

    _buildExportPanelChrome() {
        if (this.exportPanel && this.exportPanel.parentNode) {
            this.exportPanel.parentNode.removeChild(this.exportPanel);
        }
        this.exportPanel = null;

        const exportBtn = this.createElement(
            'button',
            'glyph-builder-toolbar-export-btn',
        );
        exportBtn.type = 'button';

        const labelSpan = this.createElement('span', 'glyph-builder-export-label');
        labelSpan.textContent = 'EXPORT';

        const glyphSpan = this.createElement('span', 'glyph-builder-export-glyph');
        glyphSpan.textContent = '▾';

        exportBtn.appendChild(labelSpan);
        exportBtn.appendChild(glyphSpan);
        this.exportBtn = exportBtn;

        this.exportPanel = this.createElement('div', 'glyph-builder-export-panel');
        this.exportPanel.addEventListener('mousedown', (e) => e.stopPropagation());
        this.exportPanel.addEventListener('click',     (e) => e.stopPropagation());

        this._renderGlyphExportPanel();

        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleExportPanel();
        });

        this.element.appendChild(this.exportPanel);
        this._actionArea.appendChild(exportBtn);
    }

    _renderGlyphExportPanel() {
        this._exportPanelRerendering = true;
        setTimeout(() => { this._exportPanelRerendering = false; }, 0);

        const panel = this.exportPanel;
        panel.innerHTML = '';

        const rows = [
            ['IMPORT ZIP', () => {
                this._closeExportPanel();
                this._zipInput.click();
            }],
            ['LOAD FONT FILE', () => {
                this._closeExportPanel();
                this._fontInput.click();
            }],
            ['EXPORT PNG', () => {
                this.onExportPng();
                this._closeExportPanel();
            }],
            ['EXPORT SVG', () => {
                this.onExportSvg();
                this._closeExportPanel();
            }],
            ['EXPORT LIBRARY ZIP', () => {
                this.onExportZip();
                this._closeExportPanel();
            }],
        ];

        rows.forEach(([label, fn]) => {
            const btn = this.createElement('button', 'glyph-builder-export-row-btn');
            btn.type = 'button';
            btn.textContent = label;
            btn.addEventListener('click', fn);
            panel.appendChild(btn);
        });
    }

    _toggleExportPanel() {
        this.exportExpanded = !this.exportExpanded;
        if (this.exportExpanded) {
            this._renderGlyphExportPanel();
            this.exportPanel.classList.add('glyph-builder-export-panel--open');
            this.exportBtn.classList.add('glyph-builder-toolbar-export-btn--active');
        } else {
            this._closeExportPanel();
        }
    }

    _closeExportPanel() {
        this.exportExpanded = false;
        this.exportPanel?.classList.remove('glyph-builder-export-panel--open');
        this.exportBtn?.classList.remove('glyph-builder-toolbar-export-btn--active');
    }

    _buildInfoPanel() {
        if (this.infoPanel && this.infoPanel.parentNode) {
            this.infoPanel.parentNode.removeChild(this.infoPanel);
        }

        this.infoPanel = this.createElement('div', 'glyph-builder-info-panel');

        const mount = this.createElement('div');
        this.infoPanel.appendChild(mount);

        if (this.infoFetchPath) {
            this._infoBodyComponent = new MarkdownBody({
                fetchPath: this.infoFetchPath,
            }, this.deps);
            mount.appendChild(this._infoBodyComponent.render());
        } else {
            const empty = this.createElement('div', 'glyph-builder-info-empty');
            empty.textContent = 'NO INFO CONFIGURED';
            mount.appendChild(empty);
        }

        this.element.appendChild(this.infoPanel);
    }

    _toggleInfoPanel() {
        this.infoExpanded = !this.infoExpanded;
        if (this.infoExpanded) {
            this.infoPanel.classList.add('glyph-builder-info-panel--open');
            this.infoBtn.classList.add('glyph-builder-toolbar-btn--active');
        } else {
            this._closeInfoPanel();
        }
    }

    _closeInfoPanel() {
        this.infoExpanded = false;
        this.infoPanel?.classList.remove('glyph-builder-info-panel--open');
        this.infoBtn?.classList.remove('glyph-builder-toolbar-btn--active');
    }

    _applyActionCellBorders(el, opts = {}) {
        el.classList.add(
            opts.omitLeft
                ? 'glyph-builder-toolbar-btn--bordered-first'
                : 'glyph-builder-toolbar-btn--bordered',
        );
    }

    _createTabButton(text, isActive) {
        const btn = this.createElement('button', 'glyph-builder-toolbar-btn');
        btn.type = 'button';
        btn.textContent = text;
        if (isActive) {
            btn.classList.add('glyph-builder-toolbar-btn--active');
        }
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
