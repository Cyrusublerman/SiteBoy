/**
 * PostEffectRow — per-effect enable toggles and strength control.
 *
 * Layout (optional title div + one horizontal partition; gap: 0):
 *   ┌ EFFECT LABEL ────────┐
 *   ├ ON │ OFF │ ───o─── │ field ┤
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { ToggleGroup } from './ToggleGroup.js';
import { NumericInput } from './NumericInput.js';

export class PostEffectRow extends BaseComponent {
    /**
     * @param {Object} options
     * @param {string}   [options.label]
     * @param {string}   [options.effectType]
     * @param {boolean}  [options.enabled]
     * @param {number}   [options.strength]
     * @param {number}   [options.min]
     * @param {number}   [options.max]
     * @param {number}   [options.step]
     * @param {number}   [options.precision]
     * @param {string}   [options.display] - 'both' | 'field' | 'slider'
     * @param {Function} [options.onToggleChange]
     * @param {Function} [options.onStrengthChange]
     * @param {boolean}  [options.topBorder]
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'post-effect-row' }, deps);

        this.label = options.label ?? '';
        this.effectType = options.effectType ?? '';
        this.enabled = options.enabled ?? false;
        this.strength = options.strength ?? 0;
        this.min = options.min ?? 0;
        this.max = options.max ?? 1;
        this.step = options.step ?? 0.01;
        this.precision = options.precision ?? 2;
        this.display = options.display ?? 'both';
        this.showStrength = options.strength !== undefined && options.strength !== null;
        this.topBorder = options.topBorder ?? true;

        this.onToggleChange = options.onToggleChange ?? (() => {});
        this.onStrengthChange = options.onStrengthChange ?? (() => {});

        this._titleDiv = null;
        this._box = null;
        this._toggleGroup = null;
        this._strengthInput = null;
    }

    _toggleSelectedValues() {
        return this.enabled ? ['on'] : ['off'];
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'post-effect-row component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
        `;

        if (this.label) {
            this._titleDiv = this.createElement('div', 'post-effect-row__label-row');
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
            const labelEl = this.createElement('span', 'post-effect-row__label');
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

        this._box = this.createElement('div', 'post-effect-row__box');
        const boxTop = this.label ? true : this.topBorder;
        this._box.style.cssText = `
            display: flex;
            align-items: stretch;
            gap: 0;
            width: 100%;
            height: ${F * 2 + 2}px;
            box-sizing: border-box;
            border-top: ${boxTop ? '1px solid var(--c-border)' : 'none'};
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            border-left: 1px solid var(--c-border);
        `;

        const toggleCell = this.createElement('div', 'post-effect-row__toggle-cell');
        toggleCell.style.cssText = `
            display: flex;
            flex-shrink: 0;
            height: 100%;
        `;

        this._toggleGroup = new ToggleGroup({
            layout: 'row',
            exclusive: false,
            items: [
                { value: 'on', label: 'ON' },
                { value: 'off', label: 'OFF' },
            ],
            selectedValues: this._toggleSelectedValues(),
            embedded: true,
            topBorder: false,
            onChange: (values) => this._onToggleValues(values),
        }, this.deps);
        this.addChild(this._toggleGroup);
        const toggleEl = this._toggleGroup.render();
        toggleEl.style.height = '100%';
        if (this._toggleGroup._itemsContainer) {
            this._toggleGroup._itemsContainer.style.border = 'none';
        }
        toggleCell.appendChild(toggleEl);
        this._box.appendChild(toggleCell);

        if (this.showStrength) {
            const strengthCell = this.createElement('div', 'post-effect-row__strength-cell');
            strengthCell.style.cssText = `
                display: flex;
                flex: 1;
                min-width: 0;
                height: 100%;
                border-left: 1px solid var(--c-border);
                box-sizing: border-box;
            `;

            this._strengthInput = new NumericInput({
                label: '',
                min: this.min,
                max: this.max,
                step: this.step,
                value: this.strength,
                precision: this.precision,
                display: this.display,
                embedded: true,
                onChange: (v) => {
                    this.strength = v;
                    this.onStrengthChange(v, this.effectType);
                },
            }, this.deps);
            this.addChild(this._strengthInput);
            const strengthEl = this._strengthInput.render();
            strengthEl.style.flex = '1';
            strengthEl.style.minWidth = '0';
            strengthEl.style.height = '100%';
            strengthCell.appendChild(strengthEl);
            this._box.appendChild(strengthCell);
        }

        this.element.appendChild(this._box);

        return this.element;
    }

    _onToggleValues(values) {
        const hadOn = values.includes('on');
        const hadOff = values.includes('off');

        if (hadOn && hadOff) {
            this.enabled = !this.enabled;
        } else {
            this.enabled = hadOn;
        }

        if (this._toggleGroup) {
            this._toggleGroup.setValue(this.enabled ? ['on'] : ['off']);
        }
        this.onToggleChange(this.enabled, this.effectType);
    }

    setTopBorder(on) {
        this.topBorder = !!on;
        const edge = on ? '1px solid var(--c-border)' : 'none';
        if (this._titleDiv) {
            this._titleDiv.style.borderTop = edge;
        } else if (this._box) {
            this._box.style.borderTop = edge;
        }
    }

    setEnabled(on, triggerChange = true) {
        this.enabled = !!on;
        if (this._toggleGroup) {
            this._toggleGroup.setValue(this._toggleSelectedValues());
        }
        if (triggerChange) {
            this.onToggleChange(this.enabled, this.effectType);
        }
    }

    setStrength(val, triggerChange = true) {
        this.strength = val;
        if (this._strengthInput) {
            this._strengthInput.setValue(val, triggerChange);
        }
    }

    getEnabled() { return this.enabled; }
    getStrength() { return this.strength; }

    destroy() {
        super.destroy();
    }
}
