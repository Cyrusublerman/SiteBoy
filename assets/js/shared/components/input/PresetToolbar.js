/**
 * PresetToolbar — preset dropdown with randomise and reset actions.
 *
 * Layout (one horizontal partition; gap: 0):
 *   ┌ PRESET ▼ (flex) │ RANDOMISE │ RESET ┐
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Dropdown } from './Dropdown.js';

export class PresetToolbar extends BaseComponent {
    /**
     * @param {Object} options
     * @param {string[]} [options.presetNames]
     * @param {string}   [options.presetValue]
     * @param {Function} [options.onPresetChange]
     * @param {Function} [options.onRandomise]
     * @param {Function} [options.onReset]
     * @param {boolean}  [options.topBorder]
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'preset-toolbar' }, deps);

        this.presetNames = options.presetNames ?? [];
        this.presetValue = options.presetValue ?? '';
        this.topBorder = options.topBorder ?? true;

        this.onPresetChange = options.onPresetChange ?? (() => {});
        this.onRandomise = options.onRandomise ?? (() => {});
        this.onReset = options.onReset ?? (() => {});

        this._dropdown = null;
        this._box = null;
    }

    _dropdownOptions() {
        return this.presetNames.map((name) => ({ value: name, label: name }));
    }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();

        this.element = this.createElement('div', 'preset-toolbar component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
        `;

        this._box = this.createElement('div', 'preset-toolbar__box');
        this._box.style.cssText = `
            display: flex;
            align-items: stretch;
            gap: 0;
            width: 100%;
            height: ${F * 2 + 2}px;
            box-sizing: border-box;
            border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'};
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            border-left: 1px solid var(--c-border);
        `;

        const dropCell = this.createElement('div', 'preset-toolbar__dropdown-cell');
        dropCell.style.cssText = `
            display: flex;
            flex: 1;
            min-width: 0;
            height: 100%;
        `;

        this._dropdown = new Dropdown({
            label: '',
            options: this._dropdownOptions(),
            value: this.presetValue,
            embedded: true,
            topBorder: false,
            onChange: (v) => {
                this.presetValue = v;
                this.onPresetChange(v);
            },
        }, this.deps);
        this.addChild(this._dropdown);
        const dropEl = this._dropdown.render();
        dropEl.style.flex = '1';
        dropEl.style.minWidth = '0';
        dropEl.style.height = '100%';
        if (this._dropdown._box) {
            this._dropdown._box.style.border = 'none';
        }
        dropCell.appendChild(dropEl);
        this._box.appendChild(dropCell);

        this._box.appendChild(this._makeActionBtn('RANDOMISE', () => this.onRandomise(), F));
        this._box.appendChild(this._makeActionBtn('RESET', () => this.onReset(), F));

        this.element.appendChild(this._box);

        return this.element;
    }

    _makeActionBtn(label, onClick, F) {
        const btn = this.createElement('button', 'preset-toolbar__btn');
        btn.type = 'button';
        btn.textContent = label;
        btn.style.cssText = `
            flex-shrink: 0;
            height: 100%;
            padding: 0 ${F}px;
            border: none;
            border-left: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            text-transform: uppercase;
            cursor: pointer;
            box-sizing: border-box;
            white-space: nowrap;
        `;
        btn.addEventListener('click', onClick);
        btn.addEventListener('mouseenter', () => this._setBtnInverted(btn, true));
        btn.addEventListener('mouseleave', () => this._setBtnInverted(btn, false));
        return btn;
    }

    _setBtnInverted(btn, on) {
        btn.style.background = on ? 'var(--c-text)' : 'var(--c-bg)';
        btn.style.color = on ? 'var(--c-bg)' : 'var(--c-text)';
    }

    setTopBorder(on) {
        this.topBorder = !!on;
        if (this._box) {
            this._box.style.borderTop = on ? '1px solid var(--c-border)' : 'none';
        }
    }

    setPresetNames(names) {
        this.presetNames = names ?? [];
        if (this._dropdown) {
            this._dropdown.setOptions(this._dropdownOptions());
        }
    }

    setPresetValue(value, triggerChange = true) {
        this.presetValue = value;
        if (this._dropdown) {
            this._dropdown.setValue(value, triggerChange);
        }
    }

    getPresetValue() {
        return this.presetValue;
    }

    destroy() {
        super.destroy();
    }
}
