/**
 * VersionDiffView - Field-level difference between two record snapshots.
 *
 * Renders one row per changed field: FIELD | BEFORE | AFTER.
 * Unchanged fields are omitted by the diff producer, not hidden here.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class VersionDiffView extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'version-diff-view' }, deps);

        this.entries = options.entries ?? [];
        this.fromLabel = options.fromLabel ?? 'BEFORE';
        this.toLabel = options.toLabel ?? 'AFTER';
        this.emptyLabel = options.emptyLabel ?? 'NO FIELD DIFFERENCES';

        this.headerElement = null;
        this.bodyElement = null;
    }

    render() {
        if (this.element) return this.element;

        this.element = this.createElement('div', 'admin-diff');

        this.headerElement = this.createElement('div', 'admin-diff-row admin-diff-head');
        this.appendElement(this.element, this.headerElement);

        this.bodyElement = this.createElement('div', 'admin-diff-body');
        this.appendElement(this.element, this.bodyElement);

        this._paint();
        return this.element;
    }

    _cell(parent, className, text) {
        const cell = this.createElement('span', className, text);
        cell.title = text;
        this.appendElement(parent, cell);
        return cell;
    }

    _paint() {
        if (!this.element) return;

        this.clearElement(this.headerElement);
        this._cell(this.headerElement, 'admin-diff-field', 'FIELD');
        this._cell(this.headerElement, 'admin-diff-value', this.fromLabel);
        this._cell(this.headerElement, 'admin-diff-value', this.toLabel);

        this.clearElement(this.bodyElement);
        if (!this.entries.length) {
            const empty = this.createElement('div', 'admin-diff-row admin-diff-empty', this.emptyLabel);
            this.appendElement(this.bodyElement, empty);
            return;
        }

        for (const entry of this.entries) {
            const row = this.createElement('div', 'admin-diff-row');
            row.dataset.status = entry.status;
            this._cell(row, 'admin-diff-field', entry.key.toUpperCase());
            this._cell(row, 'admin-diff-value', entry.before);
            this._cell(row, 'admin-diff-value', entry.after);
            this.appendElement(this.bodyElement, row);
        }
    }

    setEntries(entries, { fromLabel, toLabel } = {}) {
        this.entries = entries ?? [];
        if (fromLabel) this.fromLabel = fromLabel;
        if (toLabel) this.toLabel = toLabel;
        this._paint();
    }

    destroy() {
        this.headerElement = null;
        this.bodyElement = null;
        super.destroy();
    }
}
