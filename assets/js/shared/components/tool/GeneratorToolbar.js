import { BaseComponent, BaseNavigationDropdown } from '../../foundation.js';

/**
 * GeneratorToolbar - Horizontal toolbar for the unified generators page
 *
 * Layout: [DROPDOWN (30F)] [EXPORT (2/6)] [INFO (1/6)] [FIT (1/6)] [FILL (1/6)] [ACTUAL (1/6)]
 * Responsive: when FIT/FILL/ACTUAL cells are each < 4F wide, they collapse into a single
 * cycling VIEW button (cycles: fit → fill → actual → fit …).
 *
 * INFO button opens a floating overlay panel containing generator info content.
 */
export class GeneratorToolbar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'generator-toolbar' }, deps);

        this.generators      = options.generators || [];
        this.activeGenerator = options.activeGenerator || null;
        this.displayMode     = options.displayMode || 'fit';

        this.onGeneratorChange    = options.onGeneratorChange    || (() => {});
        this.onDisplayModeChange  = options.onDisplayModeChange  || (() => {});
        this.onExport             = options.onExport             || (() => {});
        this.onExportCancel       = options.onExportCancel       || (() => {});
        this.onInfo               = options.onInfo               || (() => {});

        // Export recording (progress) state — see design-law §6.3, §14.4
        this._exportRecording = false;
        this._exportBtnLabel  = null;
        this._exportBtnGlyph  = null;
        this._expProgFill     = null;
        this._expProgValue    = null;
        this._expProgWrap     = null;

        this.dropdownMenu       = null;
        this.dropdownOpen       = false;
        this.exportPanel             = null;
        this.exportBtn               = null;
        this.exportExpanded          = false;
        this._exportPanelRerendering = false;
        this.infoPanel          = null;
        this.infoExpanded       = false;
        this.infoBtn            = null;
        this._infoContent       = null; // set via setInfoContent()

        // Display-mode state
        this.displayModeButtons = []; // [fitBtn, fillBtn, actualBtn] — null when collapsed
        this._viewBtn           = null; // single cycling button when collapsed
        this._collapsed         = false;

        this._ro = null; // ResizeObserver
    }

    /** Canonical toolbar geometry — LayoutCalculator recalculates when F changes */
    _toolbarDims() {
        const pack = this.calculateDimensions('generator-toolbar');
        return { F: pack.F, d: pack.dimensions || {} };
    }

    render() {
        if (this.element) return this.element;

        const { F, d } = this._toolbarDims();

        // Toolbar container
        this.element = this.createElement('div', 'generator-toolbar');
        this.element.style.cssText = `
            display: flex;
            width: 100%;
            height: ${d.rowHeight}px;
            background: var(--c-bg);
            flex-shrink: 0;
            box-sizing: border-box;
            overflow: visible;
            position: relative;
        `;

        // === LEFT: GENERATOR DROPDOWN (30F — matches ToolBase sidebar width) ===
        const dropdownCell = this.createElement('div', 'generator-toolbar-dropdown');
        dropdownCell.style.cssText = `
            display: flex;
            align-items: center;
            width: var(--subheader-title-width, ${d.sidebarTitleColFallback}px);
            flex-shrink: 0;
            height: 100%;
            position: relative;
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            box-sizing: border-box;
        `;
        this._buildGeneratorDropdown(dropdownCell, F, d);
        this.element.appendChild(dropdownCell);

        // === RIGHT: grid container — 6 equal columns, export spans 2 ===
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

        // Observe width changes to toggle collapse
        this._ro = new ResizeObserver(() => this._checkCollapse());
        this._ro.observe(this._actionArea);

        return this.element;
    }

    // ─── ACTION CELLS ──────────────────────────────────────────────────────────

    /**
     * Build or rebuild all action cells inside _actionArea.
     * Call again after collapse state changes.
     */
    _buildActionCells(F, d) {
        this._actionArea.innerHTML = '';
        this.displayModeButtons = [];
        this._viewBtn = null;

        // Grid columns: collapsed = 3 cols (INFO, VIEW, EXPORT×2 → but span 2 needs 4 total)
        // Expanded = 6 cols (INFO, FIT, FILL, ACTUAL each 1col, EXPORT 2col)
        // Collapsed = 4 cols (INFO 1col, VIEW 1col, EXPORT 2col)
        this._actionArea.style.gridTemplateColumns = this._collapsed
            ? 'repeat(4, 1fr)'
            : 'repeat(6, 1fr)';

        // INFO button — 1 column
        this.infoBtn = this._createTabButton('INFO', false, F, d);
        this._applyActionCellBorders(this.infoBtn);
        this.infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleInfoPanel();
        });
        this._actionArea.appendChild(this.infoBtn);

        if (this._collapsed) {
            // Single VIEW cycling button — 1 column
            this._viewBtn = this._createTabButton(this.displayMode.toUpperCase(), true, F, d);
            this._applyActionCellBorders(this._viewBtn);
            this._viewBtn.addEventListener('click', () => this._cycleDisplayMode());
            this._actionArea.appendChild(this._viewBtn);
        } else {
            // FIT / FILL / ACTUAL — 1 column each
            const modes = ['fit', 'fill', 'actual'];
            modes.forEach(mode => {
                const btn = this._createTabButton(mode.toUpperCase(), this.displayMode === mode, F, d);
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

        // EXPORT — spans 2 columns, rightmost
        this._buildExportButton(this._actionArea, F, d);

        // Build info overlay panel (appended to toolbar element for z-index)
        this._buildInfoPanel(F, d);
    }

    /**
     * Cycle through display modes when in collapsed VIEW button mode.
     */
    _cycleDisplayMode() {
        const order = ['fit', 'fill', 'actual'];
        const idx = order.indexOf(this.displayMode);
        const next = order[(idx + 1) % order.length];
        this._setActiveDisplayMode(next);
        this.onDisplayModeChange(next);
    }

    /**
     * Collapse check: if each display-mode slot would be < 4F wide, collapse.
     * The action area total width is measured; 3 display-mode cells + 1 INFO + 2 export = 6 parts.
     * Each 1-part cell = actionWidth / 6. Threshold: 4F.
     */
    _checkCollapse() {
        if (!this._actionArea) return;
        const { F, d } = this._toolbarDims();
        const totalWidth = this._actionArea.getBoundingClientRect().width;
        // 6 columns when expanded: each column = totalWidth/6. Collapse when < collapseColumnMinWidth.
        const onePart = totalWidth / 6;
        const shouldCollapse = onePart < d.collapseColumnMinWidth;

        if (shouldCollapse !== this._collapsed) {
            this._collapsed = shouldCollapse;
            this._buildActionCells(F, d);
        }
    }

    // ─── GENERATOR DROPDOWN ────────────────────────────────────────────────────

    _buildGeneratorDropdown(container, F, d) {
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
            font-size: ${d.fontSizePrimary}px;
            text-transform: uppercase;
            cursor: pointer;
        `;

        const label = this.createElement('span');
        label.textContent = this._getActiveGeneratorTitle();
        label.style.flex = '1';
        label.style.overflow = 'hidden';
        label.style.textOverflow = 'ellipsis';
        label.style.whiteSpace = 'nowrap';
        this.generatorLabel = label;

        const glyph = this.createElement('span');
        glyph.textContent = '▾';
        glyph.style.flexShrink = '0';
        this.menuSymbol = glyph;

        triggerArea.appendChild(label);
        triggerArea.appendChild(glyph);
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
            border-left: 1px solid var(--c-border);
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            z-index: 200;
            max-height: ${d.dropdownMaxHeight}px;
            overflow-y: auto;
        `;
        this.dropdownMenu = dropdownMenu;

        this._populateDropdown(dropdownMenu, F, d);
        container.appendChild(dropdownMenu);

        triggerArea.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleDropdown();
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                this._closeDropdown();
            }
        });
    }

    _populateDropdown(menu, F, d) {
        const grouped = this._groupByCategory();

        for (const [category, generators] of Object.entries(grouped)) {
            const header = this.createElement('div', 'generator-category-header');
            header.textContent = category.toUpperCase();
            header.style.cssText = `
                padding: 0 ${F}px;
                height: ${d.rowHeight}px;
                display: flex;
                align-items: center;
                background: var(--c-border);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', sans-serif;
                font-size: ${d.fontSizePrimary}px;
                text-transform: uppercase;
            `;
            menu.appendChild(header);

            generators.forEach(gen => {
                const item = this.createElement('div', 'generator-item');
                item.textContent = gen.title;
                const isActive = gen.id === this.activeGenerator;
                item.style.cssText = `
                    padding: 0 ${F}px;
                    height: ${d.rowHeight}px;
                    display: flex;
                    align-items: center;
                    background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                    color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                    font-family: 'Atkinson Hyperlegible', sans-serif;
                    font-size: ${d.fontSizePrimary}px;
                    cursor: pointer;
                    border-top: 1px solid var(--c-border);
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
        } else {
            this._closeDropdown();
        }
    }

    _closeDropdown() {
        this.dropdownOpen = false;
        if (this.dropdownMenu) this.dropdownMenu.style.display = 'none';
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

    // ─── EXPORT BUTTON & PANEL ─────────────────────────────────────────────────

    /**
     * Build the export button cell + anchored dropdown panel.
     * The button spans 2 grid columns (grid-column: span 2).
     * Panel: anchored expansion (design-law §16.1), right: 0, overflow-y: auto.
     */
    _buildExportButton(actionArea, F, d) {
        // Remove previous panel from toolbar root before rebuilding (collapse/expand cycle)
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
            border-bottom: 1px solid var(--c-border);
        `;

        const labelSpan = this.createElement('span');
        labelSpan.textContent = 'EXPORT';
        labelSpan.style.flex = '1';
        labelSpan.style.textAlign = 'left';
        labelSpan.style.overflow = 'hidden';
        labelSpan.style.textOverflow = 'ellipsis';
        labelSpan.style.whiteSpace = 'nowrap';

        const glyphSpan = this.createElement('span');
        glyphSpan.textContent = '▾';
        glyphSpan.style.flexShrink = '0';

        exportBtn.appendChild(labelSpan);
        exportBtn.appendChild(glyphSpan);
        this.exportBtn = exportBtn;
        this._exportBtnLabel = labelSpan;
        this._exportBtnGlyph = glyphSpan;

        // Export panel state — persists across re-renders
        this._exportState = {
            mode:         'image',   // 'image' | 'animation'
            imageFormat:  'png',     // 'png' | 'jpeg' | 'webp' | 'avif'
            animFormat:   'zip',     // 'zip' | 'gif' | 'webm' | 'mp4'
            zipImageType: 'png',     // 'png' | 'jpeg' | 'webp'  (zip only)
            fps:          60,
            frames:       300,
            duration:     5,
            bitrate:      8000000,
        };
        // Loop / timeline info supplied by host via setExportConfig()
        this._exportLoopFrames = 0;
        this._hasTimeline = false;
        this._expectsSequencer = false;
        this._timelineFrames = 0;
        this._timelineSeconds = 0;

        const exportPanel = this.createElement('div', 'export-panel');
        exportPanel.style.cssText = `
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
        this.exportPanel = exportPanel;

        // Prevent any click/mousedown inside the panel from reaching the document
        // close handler — covers native <select> dismiss events too.
        exportPanel.addEventListener('mousedown', (e) => e.stopPropagation());
        exportPanel.addEventListener('click',     (e) => e.stopPropagation());

        this._renderExportPanel();

        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleExportPanel();
        });

        document.addEventListener('click', (e) => {
            if (this._exportPanelRerendering) return;
            if (!exportBtn.contains(e.target) && !this.exportPanel?.contains(e.target)) {
                this._closeExportPanel();
            }
        });

        // Panel is appended to the toolbar root element rather than inside exportBtn,
        // so right:0 anchors to the full-width toolbar edge (never overflows viewport).
        // top: 100% is relative to this.element which is position: relative.
        this.element.appendChild(exportPanel);
        actionArea.appendChild(exportBtn);
    }

    /**
     * Fully re-render the export panel contents from _exportState.
     * Sets _exportPanelRerendering to prevent the document click handler from
     * treating a detached target (after innerHTML wipe) as an outside click.
     */
    _renderExportPanel() {
        this._exportPanelRerendering = true;
        setTimeout(() => { this._exportPanelRerendering = false; }, 0);

        const { F, d } = this._toolbarDims();

        const panel = this.exportPanel;
        panel.innerHTML = '';
        const s = this._exportState;

        // ── Mode toggle row: IMAGE | ANIMATION ──────────────────────────────
        // No border-bottom on buttons — the first content row owns the shared
        // boundary via border-top (border-system §3, §6).
        const modeRow = this.createElement('div', 'export-mode-row');
        modeRow.style.cssText = `
            display: flex;
            height: ${d.rowHeight}px;
            box-sizing: border-box;
        `;
        ['image', 'animation'].forEach((mode, i) => {
            const btn = this.createElement('button', 'export-mode-btn');
            btn.type = 'button';
            const active = s.mode === mode;
            btn.style.cssText = `
                flex: 1;
                height: ${d.rowHeight}px;
                padding: 0 ${F}px;
                border: none;
                border-left: ${i === 0 ? 'none' : '1px solid var(--c-border)'};
                background: ${active ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${active ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${d.fontSizeSecondary}px;
                text-transform: uppercase;
                cursor: pointer;
                white-space: nowrap;
                box-sizing: border-box;
            `;
            btn.textContent = mode.toUpperCase();
            btn.addEventListener('click', () => {
                if (s.mode === mode) return;
                s.mode = mode;
                this._renderExportPanel();
            });
            modeRow.appendChild(btn);
        });
        panel.appendChild(modeRow);

        if (s.mode === 'image') {
            this._renderExportImageSection(panel, F, d);
        } else {
            this._renderExportAnimSection(panel, F, d);
        }
    }

    /**
     * IMAGE section: vertical stack of format buttons.
     * Each button spans full width. First row provides the boundary with the
     * mode row via border-top. No border-bottom on the last item — the panel
     * container provides the terminal border (border-system §5 scrollable rule).
     */
    _renderExportImageSection(panel, F, d) {
        const formats = ['png', 'jpeg', 'webp', 'avif'];
        formats.forEach((fmt, i) => {
            const btn = this.createElement('button', 'export-image-btn');
            btn.type = 'button';
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
            btn.textContent = fmt.toUpperCase();
            btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--c-text)'; btn.style.color = 'var(--c-bg)'; });
            btn.addEventListener('mouseleave', () => { btn.style.background = 'var(--c-bg)';   btn.style.color = 'var(--c-text)'; });
            btn.addEventListener('click', () => {
                this.onExport(fmt);
                this._closeExportPanel();
            });
            panel.appendChild(btn);
        });
    }

    /**
     * ANIMATION section: strict 50/50 two-column rows.
     * Row structure: no padding on row; left cell = 50% with padding 0 F;
     * right cell = 50% with border-left, input fills 100% of cell width.
     * Terminal border comes from the panel container — no border-bottom on last row.
     */
    _renderExportAnimSection(panel, F, d) {
        const s = this._exportState;

        // FORMAT
        this._exportRow(panel, F, d, 'FORMAT', (cell) => {
            const sel = this._exportSelect(F, d, [
                { value: 'zip',  label: 'ZIP FRAMES' },
                { value: 'gif',  label: 'GIF' },
                { value: 'webm', label: 'WEBM' },
                { value: 'mp4',  label: 'MP4' },
            ], s.animFormat);
            sel.addEventListener('change', () => { s.animFormat = sel.value; this._renderExportPanel(); });
            cell.appendChild(sel);
        });

        // IMAGE TYPE (zip only)
        if (s.animFormat === 'zip') {
            this._exportRow(panel, F, d, 'IMAGE TYPE', (cell) => {
                const sel = this._exportSelect(F, d, [
                    { value: 'png',  label: 'PNG' },
                    { value: 'jpeg', label: 'JPEG' },
                    { value: 'webp', label: 'WEBP' },
                ], s.zipImageType);
                sel.addEventListener('change', () => { s.zipImageType = sel.value; });
                cell.appendChild(sel);
            });
        }

        // TIMELINE / LOOP INFO — read-only; label includes unit context
        const readOnlySpanStyle = `
            display: flex;
            align-items: center;
            width: 100%;
            height: ${d.rowHeight}px;
            padding: 0 ${Math.round(F / 2)}px;
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${d.fontSizeSecondary}px;
            text-transform: uppercase;
            color: var(--c-text);
            white-space: nowrap;
            box-sizing: border-box;
        `;

        if (this._hasTimeline && this._timelineFrames > 0) {
            const secs = this._timelineSeconds > 0
                ? this._timelineSeconds.toFixed(2)
                : (this._timelineFrames / s.fps).toFixed(2);
            this._exportRow(panel, F, d, 'TIMELINE LENGTH', (cell) => {
                const span = this.createElement('span');
                span.style.cssText = readOnlySpanStyle;
                span.textContent = `${this._timelineFrames}F / ${secs}S`;
                cell.appendChild(span);
            });
        } else if (this._exportLoopFrames > 0) {
            const loopSecs = (this._exportLoopFrames / s.fps).toFixed(2);
            this._exportRow(panel, F, d, 'LOOP LENGTH', (cell) => {
                const span = this.createElement('span');
                span.style.cssText = readOnlySpanStyle;
                span.textContent = `${this._exportLoopFrames}F / ${loopSecs}S`;
                cell.appendChild(span);
            });
        } else if (this._expectsSequencer && !this._hasTimeline) {
            const hintRow = this.createElement('div', 'export-timeline-hint');
            hintRow.style.cssText = `
                display: flex;
                align-items: center;
                height: ${d.rowHeight}px;
                padding: 0 ${F}px;
                border-top: 1px solid var(--c-border);
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${d.fontSizeSecondary}px;
                text-transform: uppercase;
                color: var(--c-text);
                box-sizing: border-box;
            `;
            hintRow.textContent = 'SAVE ≥2 STATES TO EXPORT TIMELINE';
            panel.appendChild(hintRow);
        }

        // FPS — re-renders on change to update length readouts
        this._exportRow(panel, F, d, 'FPS', (cell) => {
            const inp = this._exportNumInput(F, d, s.fps, 1, 120, 1);
            inp.addEventListener('change', () => {
                s.fps = Math.max(1, Math.min(120, parseInt(inp.value) || s.fps));
                if (this._hasTimeline && this._timelineSeconds > 0) {
                    s.frames = Math.max(1, Math.round(this._timelineSeconds * s.fps));
                    s.duration = parseFloat((s.frames / s.fps).toFixed(2));
                } else {
                    s.duration = parseFloat((s.frames / s.fps).toFixed(2));
                }
                this._renderExportPanel();
            });
            cell.appendChild(inp);
        });

        // FRAMES — patches DURATION in-place
        this._exportRow(panel, F, d, 'FRAMES', (cell) => {
            const inp = this._exportNumInput(F, d, s.frames, 1, 36000, 1);
            inp.id = 'export-panel-frames';
            inp.addEventListener('change', () => {
                s.frames = Math.max(1, parseInt(inp.value) || s.frames);
                s.duration = parseFloat((s.frames / s.fps).toFixed(2));
                this._patchExportDuration();
            });
            cell.appendChild(inp);
        });

        // DURATION (S) — unit in label; patches FRAMES in-place
        this._exportRow(panel, F, d, 'DURATION (S)', (cell) => {
            const inp = this._exportNumInput(F, d, s.duration, 0.1, 600, 0.1);
            inp.id = 'export-panel-duration';
            inp.addEventListener('change', () => {
                s.duration = Math.max(0.1, parseFloat(inp.value) || s.duration);
                s.frames = Math.max(1, Math.round(s.duration * s.fps));
                this._patchExportFrames();
            });
            cell.appendChild(inp);
        });

        // BITRATE (webm / mp4 only)
        if (s.animFormat === 'webm' || s.animFormat === 'mp4') {
            this._exportRow(panel, F, d, 'BITRATE', (cell) => {
                const sel = this._exportSelect(F, d, [
                    { value: 2000000,  label: '2 MBPS' },
                    { value: 5000000,  label: '5 MBPS' },
                    { value: 8000000,  label: '8 MBPS' },
                    { value: 15000000, label: '15 MBPS' },
                ], s.bitrate);
                sel.addEventListener('change', () => { s.bitrate = parseInt(sel.value); });
                cell.appendChild(sel);
            });
        }

        // While a recording is in progress, the action row is replaced by a
        // determinate progress partition + CANCEL (design-law §14.4: deterministic
        // text, no spinner; §6.3: inversion / explicit value change).
        if (this._exportRecording) {
            this._renderExportProgress(panel, F, d);
            return;
        }

        // EXPORT ANIMATION — action row, last in stack.
        // border-top shared with row above. No border-bottom — panel container owns terminal border.
        const actionBtn = this.createElement('button', 'export-anim-go-btn');
        actionBtn.type = 'button';
        actionBtn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
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
        `;
        actionBtn.textContent = 'EXPORT ANIMATION';
        actionBtn.addEventListener('mouseenter', () => { actionBtn.style.background = 'var(--c-text)'; actionBtn.style.color = 'var(--c-bg)'; });
        actionBtn.addEventListener('mouseleave', () => { actionBtn.style.background = 'var(--c-bg)';   actionBtn.style.color = 'var(--c-text)'; });
        actionBtn.addEventListener('click', () => this.onExport('animation', { ...s }));
        panel.appendChild(actionBtn);
    }

    /**
     * Render the in-panel recording feedback: a determinate progress partition
     * (track + fill + value) above a CANCEL action row. Stores live refs for
     * cheap per-frame updates without re-rendering the whole panel.
     */
    _renderExportProgress(panel, F, d) {
        // Progress row — label cell shows the phase, value cell shows a fill track
        const row = this.createElement('div', 'export-panel-row');
        row.style.cssText = `
            display: flex;
            height: ${d.rowHeight}px;
            border-top: 1px solid var(--c-border);
            box-sizing: border-box;
            overflow: hidden;
        `;

        const labelCell = this.createElement('div', 'export-progress-label');
        labelCell.style.cssText = `
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            padding: 0 ${F}px;
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
        `;
        this._expProgValue = this.createElement('span');
        this._expProgValue.textContent = 'RENDERING…';
        this._expProgValue.style.cssText = `
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${d.fontSizeSecondary}px;
            text-transform: uppercase;
            color: var(--c-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        labelCell.appendChild(this._expProgValue);
        row.appendChild(labelCell);

        const trackCell = this.createElement('div', 'export-progress-track');
        trackCell.style.cssText = `
            position: relative;
            flex: 1;
            min-width: 0;
            border-left: 1px solid var(--c-border);
            height: 100%;
            background: var(--c-bg);
            box-sizing: border-box;
            overflow: hidden;
        `;
        this._expProgFill = this.createElement('div');
        this._expProgFill.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 0%;
            height: 100%;
            background: var(--c-text);
            transition: width 0.1s linear;
        `;
        trackCell.appendChild(this._expProgFill);
        row.appendChild(trackCell);
        panel.appendChild(row);

        // CANCEL — action row, terminal
        const cancelBtn = this.createElement('button', 'export-cancel-btn');
        cancelBtn.type = 'button';
        cancelBtn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
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
        `;
        const cancelLabel = this.createElement('span');
        cancelLabel.textContent = 'CANCEL';
        const cancelGlyph = this.createElement('span');
        cancelGlyph.textContent = '×';
        cancelGlyph.style.flexShrink = '0';
        cancelBtn.appendChild(cancelLabel);
        cancelBtn.appendChild(cancelGlyph);
        cancelBtn.addEventListener('mouseenter', () => { cancelBtn.style.background = 'var(--c-text)'; cancelBtn.style.color = 'var(--c-bg)'; });
        cancelBtn.addEventListener('mouseleave', () => { cancelBtn.style.background = 'var(--c-bg)';   cancelBtn.style.color = 'var(--c-text)'; });
        cancelBtn.addEventListener('click', () => this.onExportCancel());
        panel.appendChild(cancelBtn);
    }

    /**
     * Strict 50/50 two-column row.
     * Left cell: 50% wide, padding 0 F, contains label.
     * Right cell: 50% wide, border-left, no padding — input fills it.
     * Row: border-top only (vertical stack rule, border-system §3).
     *
     * @param {HTMLElement} panel
     * @param {number} F
     * @param {string} label
     * @param {function(cell: HTMLElement, halfW: number): void} buildCell
     */
    _exportRow(panel, F, d, label, buildCell) {
        const row = this.createElement('div', 'export-panel-row');
        row.style.cssText = `
            display: flex;
            height: ${d.rowHeight}px;
            border-top: 1px solid var(--c-border);
            box-sizing: border-box;
            overflow: hidden;
        `;

        const labelCell = this.createElement('div', 'export-panel-label');
        labelCell.style.cssText = `
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            padding: 0 ${F}px;
            height: 100%;
            overflow: hidden;
            box-sizing: border-box;
        `;
        const labelEl = this.createElement('span');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${d.fontSizeSecondary}px;
            text-transform: uppercase;
            color: var(--c-text);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        `;
        labelCell.appendChild(labelEl);
        row.appendChild(labelCell);

        const inputCell = this.createElement('div', 'export-panel-input-cell');
        inputCell.style.cssText = `
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
            border-left: 1px solid var(--c-border);
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
        `;
        buildCell(inputCell);
        row.appendChild(inputCell);
        panel.appendChild(row);
    }

    /**
     * Select that fills its container cell (width: 100%).
     * No private four-sided border — right cell already has border-left from its container.
     */
    _exportSelect(F, d, options, currentValue) {
        const sel = this.createElement('select', 'export-panel-select');
        sel.style.cssText = `
            width: 100%;
            height: 100%;
            padding: 0 ${Math.round(F / 2)}px;
            border: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${d.fontSizeSecondary}px;
            text-transform: uppercase;
            box-sizing: border-box;
            cursor: pointer;
        `;
        options.forEach(({ value, label }) => {
            const opt = this.createElement('option');
            opt.value = value;
            opt.textContent = label;
            if (String(value) === String(currentValue)) opt.selected = true;
            sel.appendChild(opt);
        });
        return sel;
    }

    /**
     * Numeric input that fills its container cell (width: 100%).
     * No private border — container cell provides border-left.
     */
    _exportNumInput(F, d, value, min, max, step) {
        const inp = this.createElement('input', 'export-panel-number');
        inp.type  = 'number';
        inp.min   = min;
        inp.max   = max;
        inp.step  = step;
        inp.value = value;
        inp.style.cssText = `
            width: 100%;
            height: 100%;
            padding: 0 ${Math.round(F / 2)}px;
            border: none;
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${d.fontSizeSecondary}px;
            text-align: right;
            box-sizing: border-box;
        `;
        return inp;
    }

    _patchExportDuration() {
        const el = this.exportPanel?.querySelector('#export-panel-duration');
        if (el) el.value = this._exportState.duration;
    }

    _patchExportFrames() {
        const el = this.exportPanel?.querySelector('#export-panel-frames');
        if (el) el.value = this._exportState.frames;
    }

    _toggleExportPanel() {
        this.exportExpanded = !this.exportExpanded;
        if (this.exportExpanded) {
            this.exportPanel.style.display = 'block';
        } else {
            this.exportPanel.style.display = 'none';
        }
        this._applyExportBtnVisual();
    }

    _closeExportPanel() {
        // Keep the panel open while a recording is in progress so the user
        // retains access to live progress and CANCEL.
        if (this._exportRecording) return;
        this.exportExpanded = false;
        if (this.exportPanel) this.exportPanel.style.display = 'none';
        this._applyExportBtnVisual();
    }

    /**
     * Apply the export button's background/colour from state precedence:
     * recording > expanded > default. Inversion is the sanctioned active
     * signal (design-law §6.3).
     */
    _applyExportBtnVisual() {
        if (!this.exportBtn) return;
        const inverted = this._exportRecording || this.exportExpanded;
        this.exportBtn.style.background = inverted ? 'var(--c-text)' : 'var(--c-bg)';
        this.exportBtn.style.color      = inverted ? 'var(--c-bg)'   : 'var(--c-text)';
    }

    // ─── INFO PANEL ────────────────────────────────────────────────────────────

    /**
     * Build the info overlay panel. Appended to element (toolbar root) so it can
     * overlap the canvas area. Position is anchored to the INFO button's right edge.
     */
    _buildInfoPanel(F, d) {
        // Remove previous panel if rebuilding
        if (this.infoPanel && this.infoPanel.parentNode) {
            this.infoPanel.parentNode.removeChild(this.infoPanel);
        }

        const panel = this.createElement('div', 'generator-info-panel');
        panel.style.cssText = `
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
        this.infoPanel = panel;

        // Content mount — filled by setInfoContent()
        this._infoPanelContent = this.createElement('div', 'info-panel-content');
        panel.appendChild(this._infoPanelContent);

        if (this._infoContent) {
            this._renderInfoContent(F, d);
        }

        this.element.appendChild(panel);

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.infoPanel && !this.infoPanel.contains(e.target) && e.target !== this.infoBtn) {
                this._closeInfoPanel();
            }
        });
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

    /**
     * Supply info content from host after script load.
     * @param {Array<{heading: string, body: string}>|null} sections
     */
    setInfoContent(sections) {
        this._infoContent = sections;
        if (this._infoPanelContent) {
            const { F, d } = this._toolbarDims();
            this._renderInfoContent(F, d);
        }
    }

    _renderInfoContent(F, d) {
        this._infoPanelContent.innerHTML = '';

        if (!this._infoContent || this._infoContent.length === 0) {
            const empty = this.createElement('div');
            empty.textContent = 'NO INFO AVAILABLE';
            empty.style.cssText = `
                padding: ${F}px;
                font-family: 'Atkinson Hyperlegible', sans-serif;
                font-size: ${d.fontSizeSecondary}px;
                text-transform: uppercase;
                color: var(--c-text);
            `;
            this._infoPanelContent.appendChild(empty);
            return;
        }

        this._infoContent.forEach((section, i) => {
            const isFirst = i === 0;
            const isLast  = i === this._infoContent.length - 1;

            const block = this.createElement('div', 'info-block');
            block.style.cssText = `
                border-top: ${isFirst ? 'none' : '1px solid var(--c-border)'};
                ${isLast ? 'border-bottom: 1px solid var(--c-border);' : ''}
            `;

            const heading = this.createElement('div', 'info-block-heading');
            heading.textContent = section.heading.toUpperCase();
            heading.style.cssText = `
                padding: 0 ${F}px;
                height: ${d.rowHeight}px;
                display: flex;
                align-items: center;
                font-family: 'Atkinson Hyperlegible', sans-serif;
                font-size: ${d.fontSizeSecondary}px;
                text-transform: uppercase;
                color: var(--c-text);
                border-bottom: 1px solid var(--c-border);
            `;
            block.appendChild(heading);

            const body = this.createElement('div', 'info-block-body');
            body.style.cssText = `
                padding: ${F}px;
                font-family: 'Atkinson Hyperlegible', sans-serif;
                font-size: ${d.fontSizeSecondary}px;
                color: var(--c-text);
                line-height: 1.5;
                white-space: pre-wrap;
                word-break: break-word;
            `;
            body.textContent = section.body;
            block.appendChild(body);

            this._infoPanelContent.appendChild(block);
        });
    }

    // ─── DISPLAY MODE ──────────────────────────────────────────────────────────

    _setActiveDisplayMode(mode) {
        this.displayMode = mode;

        // Update expanded buttons
        this.displayModeButtons.forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.style.background = isActive ? 'var(--c-text)' : 'var(--c-bg)';
            btn.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
        });

        // Update collapsed view button
        if (this._viewBtn) {
            this._viewBtn.textContent = mode.toUpperCase();
        }
    }

    // ─── HELPERS ───────────────────────────────────────────────────────────────

    /**
     * Apply borders to a non-terminal toolbar action cell (header/subheader convention:
     * border-right on each cell except the row's last; no border-left).
     * @param {HTMLElement} el
     */
    _applyActionCellBorders(el) {
        el.style.borderLeft   = 'none';
        el.style.borderRight  = '1px solid var(--c-border)';
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

    // ─── PUBLIC API ────────────────────────────────────────────────────────────

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

    /**
     * Supply animation metadata from the host so the export panel can show
     * loop/timeline length and seed sensible defaults.
     * @param {{
     *   loopFrames?: number,
     *   defaultFps?: number,
     *   hasTimeline?: boolean,
     *   expectsSequencer?: boolean,
     *   timelineFrames?: number,
     *   timelineSeconds?: number,
     * }} config
     */
    setExportConfig(config = {}) {
        this._exportLoopFrames = config.loopFrames ?? 0;
        this._hasTimeline = config.hasTimeline ?? false;
        this._expectsSequencer = config.expectsSequencer ?? false;
        this._timelineFrames = config.timelineFrames ?? 0;
        this._timelineSeconds = config.timelineSeconds ?? 0;

        if (config.defaultFps && this._exportState) {
            const fps = config.defaultFps;
            this._exportState.fps = fps;
            if (this._hasTimeline && this._timelineFrames > 0) {
                this._exportState.frames = this._timelineFrames;
                this._exportState.duration = this._timelineSeconds > 0
                    ? parseFloat(this._timelineSeconds.toFixed(2))
                    : parseFloat((this._timelineFrames / fps).toFixed(2));
            } else {
                this._exportState.frames = config.loopFrames > 0 ? config.loopFrames : Math.round(fps * 5);
                this._exportState.duration = parseFloat((this._exportState.frames / fps).toFixed(2));
            }
        }
        // Re-render panel if it already exists and is in animation mode
        if (this.exportPanel && this._exportState?.mode === 'animation') {
            this._renderExportPanel();
        }
    }

    // ─── EXPORT PROGRESS (RECORDING) API ───────────────────────────────────────

    /**
     * Enter recording state. Inverts the EXPORT cell, opens/keeps the panel open
     * (ensuring animation mode), and swaps the action row for the progress + cancel
     * partition.
     */
    beginExportProgress() {
        this._exportRecording = true;
        if (this._exportState) this._exportState.mode = 'animation';
        // Ensure panel is visible so progress + cancel are reachable
        this.exportExpanded = true;
        if (this.exportPanel) this.exportPanel.style.display = 'block';
        if (this._exportBtnLabel) this._exportBtnLabel.textContent = 'RENDERING…';
        if (this._exportBtnGlyph) this._exportBtnGlyph.textContent = '';
        this._applyExportBtnVisual();
        this._renderExportPanel();
    }

    /**
     * Update live progress.
     * @param {number} current  frames done
     * @param {number} total    total frames
     * @param {number} percent  0–100
     * @param {string} [phase]  phase microcopy (e.g. 'RENDERING', 'ENCODING', 'ZIPPING')
     */
    updateExportProgress(current, total, percent, phase) {
        const pct = Math.max(0, Math.min(100, percent ?? 0));
        const phaseLabel = (phase || 'RENDERING').toUpperCase();
        if (this._exportBtnLabel) {
            this._exportBtnLabel.textContent = total > 0
                ? `${phaseLabel} ${current}/${total}`
                : `${phaseLabel}…`;
        }
        if (this._expProgFill)  this._expProgFill.style.width = `${pct}%`;
        if (this._expProgValue) {
            this._expProgValue.textContent = total > 0
                ? `${phaseLabel} ${current}/${total}`
                : `${phaseLabel}…`;
        }
    }

    /**
     * Set a phase that has no frame-granular progress (e.g. ZIP assembly).
     * Holds the fill at 100% and shows the phase text.
     */
    setExportPhase(phase) {
        const phaseLabel = (phase || '').toUpperCase();
        if (this._exportBtnLabel) this._exportBtnLabel.textContent = `${phaseLabel}…`;
        if (this._expProgValue)   this._expProgValue.textContent   = `${phaseLabel}…`;
        if (this._expProgFill)    this._expProgFill.style.width    = '100%';
    }

    /**
     * Leave recording state and restore the normal export panel + button.
     * @param {boolean} [ok=true] whether the export completed successfully
     */
    endExportProgress(ok = true) {
        this._exportRecording = false;
        this._expProgFill  = null;
        this._expProgValue = null;
        if (this._exportBtnLabel) this._exportBtnLabel.textContent = 'EXPORT';
        if (this._exportBtnGlyph) this._exportBtnGlyph.textContent = '▾';
        this._applyExportBtnVisual();
        // Rebuild the panel back to its configuration form
        if (this.exportPanel) this._renderExportPanel();
    }

    destroy() {
        if (this._ro) {
            this._ro.disconnect();
            this._ro = null;
        }
        this._closeDropdown();
        this._closeExportPanel();
        this._closeInfoPanel();
        super.destroy();
    }
}
