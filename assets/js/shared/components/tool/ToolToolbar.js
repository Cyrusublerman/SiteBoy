/**
 * ToolToolbar — horizontal toolbar for utilities (VIEW / IMPORT / EXPORT / INFO…).
 *
 * Left: title span. Right: grid of cells each opening an anchored dropdown panel.
 *
 * @extends BaseComponent
 */
import { BaseComponent } from '../../foundation.js';

export class ToolToolbar extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'tool-toolbar' }, deps);

        /** @type {string} */
        this.title = options.title ?? '';

        /** @type {{ id: string, label: string, span?: number, buildPanel?: (host: { close(): void, F:number }, F: number)=>HTMLElement|null }[]} */
        this.cells = Array.isArray(options.cells) ? options.cells : [];

        this.F = deps.MF?.F || 14;

        this._actionArea = null;
        /** @type {ResizeObserver|null} */
        this._ro = null;
        /** @type {string|null} */
        this._activeId = null;

        this._cellStates = [];

        this._onDocDown = this._onDocDown.bind(this);
    }

    render() {
        if (this.element) return this.element;

        const F = this.F;

        this.element = this.createElement('div', 'tool-toolbar');
        /** Per border-system §10 (+ §4): toolbar row owns outer bottom stroke; cells omit bottom — avoid double separator under subheader. */
        this.element.style.cssText = `
            display: flex;
            width: 100%;
            height: ${F * 2}px;
            background: var(--c-bg);
            flex-shrink: 0;
            box-sizing: border-box;
            overflow: visible;
            position: relative;
            border-bottom: 1px solid var(--c-border);
        `;

        const titleTxt = String(this.title ?? '').trim();
        if (titleTxt.length > 0) {
            const leftCell = this.createElement('div', 'tool-toolbar-title-cell');
            leftCell.style.cssText = `
                display: flex;
                align-items: center;
                width: var(--subheader-title-width, ${F * 30}px);
                flex-shrink: 0;
                height: 100%;
                box-sizing: border-box;
                padding: 0 ${F}px;
            `;
            const titleSpan = this.createElement('span', 'tool-toolbar-title');
            titleSpan.textContent = titleTxt;
            titleSpan.style.cssText = `
                font-family: 'Atkinson Hyperlegible', sans-serif;
                font-size: ${F}px;
                text-transform: uppercase;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: var(--c-text);
            `;
            leftCell.appendChild(titleSpan);
            this.element.appendChild(leftCell);
        }

        const totalCols = this.cells.reduce((sum, cell) => sum + (cell.span ?? 1), 0) || 1;

        this._actionArea = this.createElement('div', 'tool-toolbar-actions');
        this._actionArea.style.cssText = `
            display: grid;
            flex: 1;
            height: 100%;
            min-width: 0;
            grid-template-rows: 100%;
            grid-template-columns: repeat(${totalCols}, minmax(0, 1fr));
        `;
        this.element.appendChild(this._actionArea);

        this.cells.forEach((cell, cellIdx) => {
            const span = Math.max(1, cell.span ?? 1);

            const btn = this.createElement('button', 'tool-toolbar-btn');
            btn.type = 'button';
            btn.textContent = cell.label;
            btn.dataset.cellId = cell.id;
            const isFirstBtn = cellIdx === 0;
            btn.style.cssText = `
                height: ${F * 2}px;
                padding: 0 ${F}px;
                border: none;
                min-width: 0;
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', sans-serif;
                font-size: ${F * 0.75}px;
                text-transform: uppercase;
                cursor: pointer;
                white-space: nowrap;
                box-sizing: border-box;
                width: 100%;
                grid-column: span ${span};
                border-left: ${isFirstBtn ? 'none' : '1px solid var(--c-border)'};
            `;

            const panel = this.createElement('div', `tool-toolbar-panel tool-toolbar-panel-${cell.id}`);
            panel.style.cssText = `
                display: none;
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--c-bg);
                border-left: 1px solid var(--c-border);
                border-right: 1px solid var(--c-border);
                border-bottom: 1px solid var(--c-border);
                z-index: 200;
                box-sizing: border-box;
                max-height: calc(100vh - ${F * 4}px);
                overflow-y: auto;
                overflow-x: hidden;
            `;
            panel.addEventListener('mousedown', (ev) => ev.stopPropagation());

            const collapse = () => this._collapseAllPanels();
            /** @type {{ close(): void, F: number }} */
            const host = { close: collapse, F };

            btn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                this._toggle(cell.id);
            });

            this._cellStates.push({
                id: cell.id,
                btn,
                panel,
                build: cell.buildPanel,
                panelBuilt: false,
                host,
            });

            this._actionArea.appendChild(btn);
            this.element.appendChild(panel);
        });

        document.addEventListener('mousedown', this._onDocDown);

        this._ro = new ResizeObserver(() => this._applyAbbreviatedLabels());
        this._ro.observe(this._actionArea);
        queueMicrotask(() => this._applyAbbreviatedLabels());

        return this.element;
    }

    _toggle(id) {
        const st = this._cellStates.find((s) => s.id === id);
        if (!st) return;

        if (this._activeId === id) {
            this._collapseAllPanels();
            return;
        }

        this._collapseAllPanels();
        this._activeId = id;

        if (!st.panelBuilt && typeof st.build === 'function') {
            const inner = st.build(st.host, this.F);
            if (inner) st.panel.appendChild(inner);
            st.panelBuilt = true;
        }

        st.panel.style.display = 'block';
        st.btn.style.background = 'var(--c-text)';
        st.btn.style.color = 'var(--c-bg)';
    }

    _collapseAllPanels() {
        this._activeId = null;
        this._cellStates.forEach((st) => {
            st.panel.style.display = 'none';
            st.btn.style.background = 'var(--c-bg)';
            st.btn.style.color = 'var(--c-text)';
        });
    }

    _onDocDown(ev) {
        if (!this.element) return;
        if (this.element.contains(ev.target)) return;
        this._collapseAllPanels();
    }

    _applyAbbreviatedLabels() {
        if (!this._actionArea) return;
        const w = this._actionArea.getBoundingClientRect().width;
        const F = this.F;
        const abbreviated = w < Math.max(this.cells.length, 1) * F * 4;
        this.cells.forEach((cell, i) => {
            const entry = this._cellStates[i];
            if (!entry?.btn) return;
            const lbl = cell.label || '';
            entry.btn.textContent = abbreviated && lbl.length > 1 ? lbl.slice(0, 1) : lbl;
        });
    }

    destroy() {
        document.removeEventListener('mousedown', this._onDocDown);
        if (this._ro) {
            try { this._ro.disconnect(); } catch (_) {}
            this._ro = null;
        }
        super.destroy();
    }
}
