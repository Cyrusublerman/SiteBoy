/**
 * PaletteRow — one colourway layer row (horizontal Composite cell stack).
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class PaletteRow extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'palette-row' }, deps);

        this.layer = options.layer ?? { id: '', label: '', colour: '#000000', kind: 'stroke' };
        this.onChange = options.onChange ?? (() => {});
        this.onModulate = options.onModulate ?? (() => {});
        this.hasModulator = options.hasModulator ?? false;
        this.modEnabled = options.modEnabled ?? false;
        this.topBorder = options.topBorder ?? true;
        this.embedded = options.embedded ?? true;

        this._els = {};
    }

    _rowBorderCss() {
        if (this.embedded) {
            return `border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'}; border-left: none; border-right: none; border-bottom: none;`;
        }
        return `
            border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'};
            border-right: 1px solid var(--c-border);
            border-bottom: 1px solid var(--c-border);
            border-left: 1px solid var(--c-border);
        `;
    }

    _cellCss(index, F, extra = '') {
        return `
            display: flex;
            align-items: center;
            box-sizing: border-box;
            height: 100%;
            border-top: none;
            border-bottom: none;
            border-right: none;
            border-left: ${index > 0 ? '1px solid var(--c-border)' : 'none'};
            ${extra}
        `;
    }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();
        const layer = this.layer;
        const borderExtra = this.embedded ? 0 : 2;

        this.element = this.createElement('div', 'palette-row component');
        this.element.style.cssText = `
            display: flex;
            align-items: stretch;
            gap: 0;
            width: 100%;
            height: ${F * 2 + borderExtra}px;
            box-sizing: border-box;
            ${this._rowBorderCss()}
        `;

        const lblCell = this.createElement('div', 'palette-row__label-cell');
        lblCell.style.cssText = this._cellCss(0, F, `flex: 1; min-width: 0; padding: 0 ${F}px;`);
        const lbl = this.createElement('span', 'palette-row__label');
        lbl.textContent = String(layer.label ?? '').toUpperCase();
        lbl.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F * 0.75}px;
            color: var(--c-text);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        lblCell.appendChild(lbl);
        this.element.appendChild(lblCell);

        const swatchCell = this.createElement('div', 'palette-row__swatch-cell');
        swatchCell.style.cssText = this._cellCss(1, F, `flex: 0 0 ${F * 2}px; justify-content: center; position: relative; padding: ${Math.round(F * 0.35)}px;`);
        const swatchPreview = this.createElement('div', 'palette-row__swatch-preview');
        swatchPreview.style.cssText = `
            width: 100%;
            height: 100%;
            background: ${layer.colour};
            box-sizing: border-box;
        `;
        const swatch = this.createElement('input', 'palette-row__swatch');
        swatch.type = 'color';
        swatch.value = layer.colour;
        swatch.style.cssText = `
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            padding: 0;
            margin: 0;
            border: none;
            background: transparent;
            cursor: pointer;
            opacity: 0;
            box-sizing: border-box;
        `;
        swatch.addEventListener('input', (e) => {
            layer.colour = e.target.value;
            swatchPreview.style.background = e.target.value;
            hexInput.value = e.target.value;
            this._emitColour();
        });
        this._els.swatch = swatch;
        this._els.swatchPreview = swatchPreview;
        swatchCell.appendChild(swatchPreview);
        swatchCell.appendChild(swatch);
        this.element.appendChild(swatchCell);

        const hexCell = this.createElement('div', 'palette-row__hex-cell');
        hexCell.style.cssText = this._cellCss(2, F, `flex: 0 0 ${Math.round(F * 5.5)}px; min-width: 0; padding: 0 ${F}px;`);
        const hexInput = this.createElement('input', 'palette-row__hex');
        hexInput.type = 'text';
        hexInput.value = layer.colour;
        hexInput.maxLength = 7;
        hexInput.style.cssText = `
            width: 100%;
            height: 100%;
            padding: 0;
            border: none;
            background: transparent;
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            box-sizing: border-box;
        `;
        hexInput.addEventListener('change', (e) => {
            const val = e.target.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                layer.colour = val;
                swatch.value = val;
                swatchPreview.style.background = val;
                this._emitColour();
            }
        });
        this._els.hexInput = hexInput;
        hexCell.appendChild(hexInput);
        this.element.appendChild(hexCell);

        const isStroke = layer.kind === 'stroke' || layer.kind === undefined;
        const waCell = this.createElement('div', 'palette-row__width-cell');
        waCell.style.cssText = this._cellCss(3, F, `flex: 0 0 ${F * 3}px; padding: 0 ${F}px;`);
        const widthAlpha = this.createElement('input', 'palette-row__width-alpha');
        widthAlpha.type = 'number';
        if (isStroke) {
            widthAlpha.min = '0.5';
            widthAlpha.max = '20';
            widthAlpha.step = '0.5';
            widthAlpha.value = String(layer.lineWidth ?? 1);
        } else {
            widthAlpha.min = '0';
            widthAlpha.max = '1';
            widthAlpha.step = '0.05';
            widthAlpha.value = String(layer.alpha ?? 1);
        }
        widthAlpha.style.cssText = `
            width: 100%;
            height: 100%;
            padding: 0;
            border: none;
            background: transparent;
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            text-align: right;
            box-sizing: border-box;
        `;
        widthAlpha.addEventListener('change', (e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) {
                if (isStroke) layer.lineWidth = v;
                else layer.alpha = v;
                this.onChange(layer.id, isStroke
                    ? { colour: layer.colour, lineWidth: v }
                    : { colour: layer.colour, alpha: v });
            }
        });
        this._els.widthAlpha = widthAlpha;
        waCell.appendChild(widthAlpha);
        this.element.appendChild(waCell);

        const modCell = this.createElement('div', 'palette-row__mod-cell');
        modCell.style.cssText = this._cellCss(4, F, `flex: 0 0 ${F * 2}px; justify-content: center;`);
        const modBtn = this.createElement('button', 'palette-row__mod-btn');
        modBtn.type = 'button';
        modBtn.textContent = this.hasModulator ? '∿' : '+';
        modBtn.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: ${this.modEnabled ? 'var(--c-text)' : 'var(--c-bg)'};
            color: ${this.modEnabled ? 'var(--c-bg)' : 'var(--c-text)'};
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            cursor: pointer;
            box-sizing: border-box;
            padding: 0;
        `;
        modBtn.addEventListener('click', () => this.onModulate(layer.id));
        modBtn.addEventListener('mouseenter', () => {
            modBtn.style.background = 'var(--c-text)';
            modBtn.style.color = 'var(--c-bg)';
        });
        modBtn.addEventListener('mouseleave', () => {
            modBtn.style.background = this.modEnabled ? 'var(--c-text)' : 'var(--c-bg)';
            modBtn.style.color = this.modEnabled ? 'var(--c-bg)' : 'var(--c-text)';
        });
        this._els.modBtn = modBtn;
        modCell.appendChild(modBtn);
        this.element.appendChild(modCell);

        return this.element;
    }

    setTopBorder(on) {
        this.topBorder = !!on;
        if (!this.element) return;
        const edge = on ? '1px solid var(--c-border)' : 'none';
        this.element.style.borderTop = edge;
    }

    _emitColour() {
        this.onChange(this.layer.id, { colour: this.layer.colour });
    }

    setModState(hasModulator, enabled) {
        this.hasModulator = hasModulator;
        this.modEnabled = enabled;
        if (!this._els.modBtn) return;
        this._els.modBtn.textContent = hasModulator ? '∿' : '+';
        this._els.modBtn.style.background = enabled ? 'var(--c-text)' : 'var(--c-bg)';
        this._els.modBtn.style.color = enabled ? 'var(--c-bg)' : 'var(--c-text)';
    }

    destroy() {
        super.destroy();
    }
}
