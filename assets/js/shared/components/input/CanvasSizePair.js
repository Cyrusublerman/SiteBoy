/**
 * CanvasSizePair — width × height numeric fields in one partition.
 *
 * Layout (optional title div + one horizontal partition; gap: 0):
 *   ┌ TITLE ─────────────┐
 *   ├ W field │ H field ┤
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { NumericInput } from './NumericInput.js';

export class CanvasSizePair extends BaseComponent {
    /**
     * @param {Object} options
     * @param {string}   [options.title]
     * @param {string}   [options.widthLabel]
     * @param {string}   [options.heightLabel]
     * @param {number}   [options.width]
     * @param {number}   [options.height]
     * @param {number}   [options.min]
     * @param {number}   [options.max]
     * @param {number}   [options.step]
     * @param {number}   [options.precision]
     * @param {Function} [options.onWidthChange]
     * @param {Function} [options.onHeightChange]
     * @param {boolean}  [options.topBorder]
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'canvas-size-pair' }, deps);

        this.title = options.title ?? '';
        this.widthLabel = options.widthLabel ?? 'W';
        this.heightLabel = options.heightLabel ?? 'H';
        this.width = options.width ?? 512;
        this.height = options.height ?? 512;
        this.min = options.min ?? 1;
        this.max = options.max ?? 8192;
        this.step = options.step ?? 1;
        this.precision = options.precision ?? 0;
        this.topBorder = options.topBorder ?? true;

        this.onWidthChange = options.onWidthChange ?? (() => {});
        this.onHeightChange = options.onHeightChange ?? (() => {});

        this._titleDiv = null;
        this._box = null;
        this._widthInput = null;
        this._heightInput = null;
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'canvas-size-pair component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
        `;

        if (this.title) {
            this._titleDiv = this.createElement('div', 'canvas-size-pair__label-row');
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
            const labelEl = this.createElement('span', 'canvas-size-pair__label');
            labelEl.textContent = this.title.toUpperCase();
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

        this._box = this.createElement('div', 'canvas-size-pair__box');
        const boxTop = this.title ? true : this.topBorder;
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

        this._box.appendChild(this._buildNumericCell(
            this.widthLabel, this.width, false, F, F2,
            (v) => { this.width = v; this.onWidthChange(v); },
            (input) => { this._widthInput = input; },
        ));

        this._box.appendChild(this._buildNumericCell(
            this.heightLabel, this.height, true, F, F2,
            (v) => { this.height = v; this.onHeightChange(v); },
            (input) => { this._heightInput = input; },
        ));

        this.element.appendChild(this._box);

        return this.element;
    }

    _buildNumericCell(labelText, value, withDivider, F, F2, onChange, assignRef) {
        const cell = this.createElement('div', 'canvas-size-pair__cell');
        cell.style.cssText = `
            display: flex;
            flex: 1;
            min-width: 0;
            height: 100%;
            align-items: stretch;
            border-left: ${withDivider ? '1px solid var(--c-border)' : 'none'};
            box-sizing: border-box;
        `;

        const lbl = this.createElement('div', 'canvas-size-pair__field-label');
        lbl.style.cssText = `
            display: flex;
            align-items: center;
            flex-shrink: 0;
            height: 100%;
            padding: 0 ${F2}px;
            box-sizing: border-box;
        `;
        const span = this.createElement('span');
        span.textContent = String(labelText).toUpperCase();
        span.style.cssText = `
            font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            color: var(--c-text);
            white-space: nowrap;
        `;
        lbl.appendChild(span);
        cell.appendChild(lbl);

        const input = new NumericInput({
            label: '',
            min: this.min,
            max: this.max,
            step: this.step,
            value,
            precision: this.precision,
            display: 'field',
            showSteppers: true,
            embedded: true,
            fieldFlex: true,
            onChange,
        }, this.deps);
        this.addChild(input);
        assignRef(input);
        const el = input.render();
        el.style.flex = '1';
        el.style.minWidth = '0';
        el.style.height = '100%';
        cell.appendChild(el);

        return cell;
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

    setWidth(val, triggerChange = true) {
        this.width = val;
        if (this._widthInput) this._widthInput.setValue(val, triggerChange);
    }

    setHeight(val, triggerChange = true) {
        this.height = val;
        if (this._heightInput) this._heightInput.setValue(val, triggerChange);
    }

    getWidth() { return this.width; }
    getHeight() { return this.height; }

    destroy() {
        super.destroy();
    }
}
