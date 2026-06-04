/**
 * LineListInput — newline-delimited text as an editable list of line cells.
 *
 * Layout (optional title div + one partition; gap: 0):
 *   ┌ LABEL ─────────────────┐
 *   ├ line 0 text      │ ✕ ┤
 *   ├ line 1 text      │ ✕ ┤
 *   ├ + ADD LINE          ┤
 *   └─────────────────────┘
 *
 * Emits onChange(value) where value is the lines joined by '\n'.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class LineListInput extends BaseComponent {
    /**
     * @param {Object} options
     * @param {string}   [options.label]
     * @param {string}   [options.value]       - newline-delimited string
     * @param {string[]} [options.lines]       - alternative to value
     * @param {number}   [options.maxLines]
     * @param {number}   [options.minLines]
     * @param {string}   [options.placeholder]
     * @param {Function} [options.onChange]
     * @param {boolean}  [options.topBorder]
     * @param {boolean}  [options.embedded]
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'line-list' }, deps);

        this.label = options.label ?? '';
        this.maxLines = options.maxLines ?? 8;
        this.minLines = options.minLines ?? 1;
        this.placeholder = options.placeholder ?? '';
        this.topBorder = options.topBorder ?? true;
        this.embedded = options.embedded ?? false;

        this.onChange = options.onChange ?? (() => {});

        this.lines = this._initLines(options);

        this._titleDiv = null;
        this._box = null;
        this._rowsWrap = null;
        this._addBtn = null;
    }

    _initLines(options) {
        let lines;
        if (Array.isArray(options.lines)) {
            lines = options.lines.slice();
        } else {
            lines = String(options.value ?? '').split('\n');
        }
        if (lines.length === 0) lines = [''];
        return lines.slice(0, this.maxLines);
    }

    _boxBorderCss() {
        if (this.embedded) {
            return `border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'}; border-right: none; border-bottom: none; border-left: 1px solid var(--c-border);`;
        }
        const top = this.label ? true : this.topBorder;
        return `
            border-top: ${top ? '1px solid var(--c-border)' : 'none'};
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            border-left: 1px solid var(--c-border);
        `;
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'line-list component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
        `;

        if (this.label) {
            this._titleDiv = this.createElement('div', 'line-list__label-row');
            this._titleDiv.style.cssText = `
                display: flex;
                align-items: center;
                height: ${F * 1.5}px;
                padding: 0 ${F2}px;
                border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'};
                border-left: 1px solid var(--c-border);
                border-right: 1px solid var(--c-border);
                box-sizing: border-box;
            `;
            const labelEl = this.createElement('span', 'line-list__label');
            labelEl.textContent = this.label.toUpperCase();
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F * 0.75}px;
                color: var(--c-text);
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            this._titleDiv.appendChild(labelEl);
            this.element.appendChild(this._titleDiv);
        }

        this._box = this.createElement('div', 'line-list__box');
        this._box.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
            box-sizing: border-box;
            ${this._boxBorderCss()}
        `;

        this._rowsWrap = this.createElement('div', 'line-list__rows');
        this._rowsWrap.style.cssText = `display: flex; flex-direction: column; gap: 0; width: 100%;`;
        this._box.appendChild(this._rowsWrap);

        this._addBtn = this._buildAddRow(F);
        this._box.appendChild(this._addBtn);

        this._renderRows(F, F2);
        this.element.appendChild(this._box);

        return this.element;
    }

    _renderRows(F, F2) {
        while (this._rowsWrap.firstChild) this._rowsWrap.removeChild(this._rowsWrap.firstChild);

        this.lines.forEach((line, index) => {
            const row = this.createElement('div', 'line-list__row');
            row.style.cssText = `
                display: flex;
                align-items: stretch;
                gap: 0;
                width: 100%;
                height: ${F * 2}px;
                box-sizing: border-box;
                border-top: ${index > 0 ? '1px solid var(--c-border)' : 'none'};
            `;

            const input = this.createElement('input', 'line-list__field');
            input.type = 'text';
            input.value = line;
            input.placeholder = this.placeholder;
            input.style.cssText = `
                flex: 1;
                min-width: 0;
                height: 100%;
                padding: 0 ${F}px;
                border: none;
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${Math.round(F * 0.875)}px;
                box-sizing: border-box;
            `;
            input.addEventListener('input', (e) => {
                this.lines[index] = e.target.value;
                this._emit();
            });
            row.appendChild(input);

            const canRemove = this.lines.length > this.minLines;
            const removeBtn = this.createElement('button', 'line-list__remove');
            removeBtn.type = 'button';
            removeBtn.textContent = '✕';
            removeBtn.disabled = !canRemove;
            removeBtn.style.cssText = `
                flex-shrink: 0;
                width: ${F * 2}px;
                height: 100%;
                border: none;
                border-left: 1px solid var(--c-border);
                background: var(--c-bg);
                color: ${canRemove ? 'var(--c-text)' : 'var(--c-border)'};
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F * 0.75}px;
                cursor: ${canRemove ? 'pointer' : 'not-allowed'};
                box-sizing: border-box;
                padding: 0;
            `;
            if (canRemove) {
                removeBtn.addEventListener('click', () => this._removeLine(index));
                removeBtn.addEventListener('mouseenter', () => this._invert(removeBtn, true));
                removeBtn.addEventListener('mouseleave', () => this._invert(removeBtn, false));
            }
            row.appendChild(removeBtn);

            this._rowsWrap.appendChild(row);
        });

        this._syncAddState();
    }

    _buildAddRow(F) {
        const btn = this.createElement('button', 'line-list__add');
        btn.type = 'button';
        btn.textContent = '+ ADD LINE';
        btn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            height: ${F * 2}px;
            padding: 0 ${F}px;
            border: none;
            border-top: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            text-transform: uppercase;
            cursor: pointer;
            box-sizing: border-box;
        `;
        btn.addEventListener('click', () => this._addLine());
        btn.addEventListener('mouseenter', () => { if (!btn.disabled) this._invert(btn, true); });
        btn.addEventListener('mouseleave', () => { if (!btn.disabled) this._invert(btn, false); });
        return btn;
    }

    _syncAddState() {
        if (!this._addBtn) return;
        const atMax = this.lines.length >= this.maxLines;
        this._addBtn.disabled = atMax;
        this._addBtn.style.display = atMax ? 'none' : 'flex';
    }

    _invert(el, on) {
        el.style.background = on ? 'var(--c-text)' : 'var(--c-bg)';
        el.style.color = on ? 'var(--c-bg)' : 'var(--c-text)';
    }

    _addLine() {
        if (this.lines.length >= this.maxLines) return;
        this.lines.push('');
        const { F, F2 } = this.getF();
        this._renderRows(F, F2);
        this._emit();
    }

    _removeLine(index) {
        if (this.lines.length <= this.minLines) return;
        this.lines.splice(index, 1);
        const { F, F2 } = this.getF();
        this._renderRows(F, F2);
        this._emit();
    }

    _emit() {
        this.onChange(this.lines.join('\n'));
    }

    setTopBorder(on) {
        this.topBorder = !!on;
        if (this.embedded) return;
        const edge = on ? '1px solid var(--c-border)' : 'none';
        if (this._titleDiv) {
            this._titleDiv.style.borderTop = edge;
        } else if (this._box) {
            this._box.style.borderTop = edge;
        }
    }

    getValue() {
        return this.lines.join('\n');
    }

    setValue(value, triggerChange = true) {
        this.lines = String(value ?? '').split('\n').slice(0, this.maxLines);
        if (this.lines.length === 0) this.lines = [''];
        if (this._rowsWrap) {
            const { F, F2 } = this.getF();
            this._renderRows(F, F2);
        }
        if (triggerChange) this._emit();
    }

    destroy() {
        super.destroy();
    }
}
