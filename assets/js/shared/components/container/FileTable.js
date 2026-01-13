/**
 * FileTable - Tabular view for file intake metadata editing.
 *
 * Columns configurable; default matches gallery uploader intake.
 * Supports row-level edits and selection toggles.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

const DEFAULT_COLUMNS = [
    { key: 'select', label: 'Select', type: 'checkbox' },
    { key: 'preview', label: 'Preview', type: 'preview' },
    { key: 'autoId', label: 'AutoID', type: 'text' },
    { key: 'alt', label: 'Alt', type: 'text' },
    { key: 'tags', label: 'Tags', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'group', label: 'Group', type: 'text' },
    { key: 'date', label: 'Date', type: 'text', placeholder: 'YYYY-MM-DD' },
    { key: 'include', label: 'Include', type: 'checkbox' }
];

export class FileTable extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'file-table' }, deps);

        this.columns = options.columns ?? DEFAULT_COLUMNS;
        this.rows = options.rows ?? []; // [{id, name, size, previewUrl, ...fields}]
        this.onChange = options.onChange ?? (() => {});

        this.tableEl = null;
        this.tbodyEl = null;
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'file-table component');
        this.element.style.cssText = `
            width: 100%;
            overflow: auto;
            border: 1px solid var(--c-border);
        `;

        this.tableEl = this.createElement('table', 'file-table-grid');
        this.tableEl.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
        `;

        const thead = this.createElement('thead', 'file-table-head');
        const headRow = this.createElement('tr');
        this.columns.forEach(col => {
            const th = this.createElement('th');
            th.textContent = col.label;
            th.style.cssText = `
                text-align: left;
                padding: ${F2}px ${F}px;
                border-bottom: 1px solid var(--c-border);
                background: var(--c-bg);
                position: sticky;
                top: 0;
                z-index: 1;
            `;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);

        this.tbodyEl = this.createElement('tbody', 'file-table-body');

        this.tableEl.appendChild(thead);
        this.tableEl.appendChild(this.tbodyEl);
        this.element.appendChild(this.tableEl);

        this._renderRows();
        return this.element;
    }

    _renderRows() {
        if (!this.tbodyEl) return;
        const { F, F2 } = this.getF();
        this.tbodyEl.innerHTML = '';
        this.rows.forEach((row) => {
            const tr = this.createElement('tr');
            tr.dataset.rowId = row.id ?? row.name ?? '';
            this.columns.forEach(col => {
                const td = this.createElement('td');
                td.style.cssText = `
                    padding: ${F2}px ${F}px;
                    border-bottom: 1px solid var(--c-border);
                    vertical-align: middle;
                `;
                const cell = this._renderCell(col, row, F);
                td.appendChild(cell);
                tr.appendChild(td);
            });
            this.tbodyEl.appendChild(tr);
        });
    }

    _renderCell(col, row, F) {
        const val = row[col.key];
        switch (col.type) {
            case 'checkbox': {
                const input = this.createElement('input');
                input.type = 'checkbox';
                input.checked = Boolean(val);
                input.style.cssText = `
                    width: ${F}px;
                    height: ${F}px;
                    cursor: pointer;
                `;
                input.addEventListener('change', () => {
                    this._updateRow(row, col.key, input.checked);
                });
                return input;
            }
            case 'preview': {
                const wrap = this.createElement('div');
                wrap.style.cssText = `
                    width: ${F * 3}px;
                    height: ${F * 3}px;
                    border: 1px solid var(--c-border);
                    background: var(--c-bg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                `;
                if (row.previewUrl) {
                    const img = this.createElement('img');
                    img.src = row.previewUrl;
                    img.alt = row.name ?? '';
                    img.style.cssText = `
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    `;
                    wrap.appendChild(img);
                } else {
                    const text = this.createElement('span');
                    text.textContent = row.name ?? '';
                    text.style.cssText = `
                        font-size: ${F * 0.85}px;
                        color: var(--c-text);
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                        width: 100%;
                        text-align: center;
                    `;
                    wrap.appendChild(text);
                }
                return wrap;
            }
            case 'text':
            default: {
                const input = this.createElement('input');
                input.type = 'text';
                input.value = val ?? '';
                input.placeholder = col.placeholder ?? '';
                input.style.cssText = `
                    width: 100%;
                    height: ${F * 2}px;
                    padding: 0 ${F * 0.5}px;
                    border: 1px solid var(--c-border);
                    background: var(--c-bg);
                    color: var(--c-text);
                    font-family: 'Atkinson Hyperlegible', monospace;
                    font-size: ${F}px;
                    box-sizing: border-box;
                `;
                input.addEventListener('change', () => {
                    this._updateRow(row, col.key, input.value);
                });
                return input;
            }
        }
    }

    _updateRow(row, key, value) {
        const rowId = row.id ?? row.name ?? '';
        this.rows = this.rows.map(r => {
            if ((r.id ?? r.name) === rowId) {
                return { ...r, [key]: value };
            }
            return r;
        });
        this.onChange(rowId, key, value, this.rows);
    }

    setRows(rows) {
        this.rows = Array.isArray(rows) ? rows : [];
        this._renderRows();
    }

    getRows() {
        return this.rows;
    }

    destroy() {
        super.destroy();
        this.tableEl = null;
        this.tbodyEl = null;
    }
}
