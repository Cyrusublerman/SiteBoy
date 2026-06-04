/**
 * ColorInput — colour picker + hex field (Composite partition).
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class ColorInput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'color-input' }, deps);

        this.value = options.value ?? '#000000';
        this.label = options.label ?? '';
        this.showHex = options.showHex ?? true;
        this.swatches = options.swatches ?? null;
        this.topBorder = options.topBorder ?? true;
        this.embedded = options.embedded ?? false;

        this.onChange = options.onChange ?? (() => {});

        this.colorEl = null;
        this.hexEl = null;
        this._titleDiv = null;
        this._box = null;
    }

    _containerBorderCss() {
        if (this.embedded) {
            return `
                border-top: none;
                border-right: none;
                border-bottom: none;
                border-left: 1px solid var(--c-border);
            `;
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

        this.element = this.createElement('div', 'color-input component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
        `;

        if (this.label) {
            this._titleDiv = this.createElement('div', 'color-input__label-row');
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
            const labelEl = this.createElement('span', 'color-input__label');
            labelEl.textContent = this.label.toUpperCase();
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F * 0.75}px;
                color: var(--c-text);
                text-transform: uppercase;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            `;
            this._titleDiv.appendChild(labelEl);
            this.element.appendChild(this._titleDiv);
        }

        this._box = this.createElement('div', 'color-input__box');
        this._box.style.cssText = `
            display: flex;
            align-items: stretch;
            gap: 0;
            width: 100%;
            height: ${F * 2 + 2}px;
            box-sizing: border-box;
            ${this._containerBorderCss()}
        `;

        const pickerCell = this.createElement('div', 'color-input__picker-cell');
        pickerCell.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${F * 2}px;
            height: 100%;
            flex-shrink: 0;
            box-sizing: border-box;
        `;

        this.colorEl = this.createElement('input', 'color-input-picker');
        this.colorEl.type = 'color';
        this.colorEl.value = this.value;
        this.colorEl.style.cssText = `
            width: ${F * 2}px;
            height: ${F * 2}px;
            padding: 0;
            border: none;
            background: var(--c-bg);
            cursor: pointer;
            box-sizing: border-box;
        `;
        this.colorEl.addEventListener('input', (e) => {
            this._applyValue(e.target.value, true);
        });
        pickerCell.appendChild(this.colorEl);
        this._box.appendChild(pickerCell);

        if (this.showHex) {
            this.hexEl = this.createElement('input', 'color-input-hex');
            this.hexEl.type = 'text';
            this.hexEl.value = this.value;
            this.hexEl.maxLength = 7;
            this.hexEl.style.cssText = `
                flex: 1;
                min-width: 0;
                height: 100%;
                padding: 0 ${F}px;
                border-top: none;
                border-right: none;
                border-bottom: none;
                border-left: 1px solid var(--c-border);
                background: var(--c-bg);
                color: var(--c-text);
                font-family: 'Atkinson Hyperlegible Mono', monospace;
                font-size: ${F * 0.75}px;
                text-transform: uppercase;
                box-sizing: border-box;
            `;
            this.hexEl.addEventListener('change', (e) => {
                let hex = e.target.value.trim();
                if (!hex.startsWith('#')) hex = '#' + hex;
                if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                    this._applyValue(hex, true);
                } else {
                    e.target.value = this.value;
                }
            });
            this._box.appendChild(this.hexEl);
        }

        this.element.appendChild(this._box);

        if (this.swatches && this.swatches.length > 0) {
            const swatchBox = this.createElement('div', 'color-input-swatches');
            swatchBox.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: 0;
                width: 100%;
                border-left: 1px solid var(--c-border);
                border-right: 1px solid var(--c-border);
                border-bottom: 1px solid var(--c-border);
                box-sizing: border-box;
            `;
            this.swatches.forEach((color, i) => {
                const swatch = this.createElement('button', 'color-input-swatch');
                swatch.type = 'button';
                swatch.style.cssText = `
                    width: ${F * 2}px;
                    height: ${F * 2}px;
                    padding: 0;
                    border: none;
                    border-left: ${i > 0 ? '1px solid var(--c-border)' : 'none'};
                    border-top: 1px solid var(--c-border);
                    background: var(--c-bg);
                    cursor: pointer;
                    box-sizing: border-box;
                    position: relative;
                `;
                const fill = this.createElement('span');
                fill.style.cssText = `
                    display: block;
                    width: ${F}px;
                    height: ${F}px;
                    margin: ${F * 0.5}px;
                    background: ${color};
                    border: 1px solid var(--c-border);
                    box-sizing: border-box;
                `;
                swatch.appendChild(fill);
                swatch.addEventListener('click', () => this._applyValue(color, true));
                swatch.addEventListener('mouseenter', () => {
                    swatch.style.background = 'var(--c-text)';
                });
                swatch.addEventListener('mouseleave', () => {
                    swatch.style.background = 'var(--c-bg)';
                });
                swatchBox.appendChild(swatch);
            });
            this.element.appendChild(swatchBox);
        }

        return this.element;
    }

    _applyValue(color, triggerChange) {
        this.value = color;
        if (this.colorEl) this.colorEl.value = color;
        if (this.hexEl) this.hexEl.value = color;
        if (triggerChange) this.onChange(color);
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
        return this.value;
    }

    setValue(color, triggerChange = true) {
        this._applyValue(color, triggerChange);
    }

    destroy() {
        super.destroy();
    }
}
