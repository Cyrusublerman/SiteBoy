/**
 * PaletteRow — 5-column compact row for one colourway layer in the OUTPUT tab.
 *
 * Columns:  [ label (3F) | swatch (2F) | hex input (6F) | width-or-alpha (3F) | mod chip (2F) ]
 *
 * Emits:
 *   onChange(layerId, { colour, alpha, lineWidth })
 *   onModulate(layerId)   — request to open a modulator panel for this layer
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class PaletteRow extends BaseComponent {
    /**
     * @param {Object} options
     * @param {Object}   options.layer      - ColourwayLayer descriptor
     * @param {Function} options.onChange   - (layerId, patch) => void
     * @param {Function} options.onModulate - (layerId) => void
     * @param {boolean}  [options.hasModulator] - Whether a modulator exists
     * @param {boolean}  [options.modEnabled]   - Whether the modulator is active
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'palette-row' }, deps);

        this.layer       = options.layer       ?? { id: '', label: '', colour: '#000000', kind: 'stroke' };
        this.onChange    = options.onChange    ?? (() => {});
        this.onModulate  = options.onModulate  ?? (() => {});
        this.hasModulator = options.hasModulator ?? false;
        this.modEnabled   = options.modEnabled   ?? false;

        this._els = {};
    }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();
        const layer = this.layer;

        this.element = this.createElement('div', 'palette-row component');
        this.element.style.cssText = `
            display: grid;
            grid-template-columns: ${F * 3}px ${F * 2}px ${F * 6}px ${F * 3}px ${F * 2}px;
            align-items: center;
            height: ${F * 2}px;
            border-bottom: 1px solid var(--c-border);
        `;

        // Col 1: Label
        const lbl = this.createElement('span', 'palette-row__label');
        lbl.textContent = layer.label;
        lbl.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            text-transform: uppercase;
            padding-left: ${F * 0.5}px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        this.element.appendChild(lbl);

        // Col 2: Swatch (colour picker input disguised as swatch)
        const swatch = this.createElement('input', 'palette-row__swatch');
        swatch.type = 'color';
        swatch.value = layer.colour;
        swatch.style.cssText = `
            width: ${F * 1.5}px;
            height: ${F * 1.5}px;
            border: 1px solid var(--c-border);
            cursor: pointer;
            padding: 0;
            background: none;
        `;
        swatch.addEventListener('input', (e) => {
            layer.colour = e.target.value;
            hexInput.value = e.target.value;
            this._emitColour();
        });
        this._els.swatch = swatch;
        this.element.appendChild(swatch);

        // Col 3: Hex input
        const hexInput = this.createElement('input', 'palette-row__hex');
        hexInput.type = 'text';
        hexInput.value = layer.colour;
        hexInput.maxLength = 7;
        hexInput.style.cssText = `
            width: 100%;
            height: ${F * 1.5}px;
            padding: 0 ${F * 0.5}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            box-sizing: border-box;
        `;
        hexInput.addEventListener('change', (e) => {
            const val = e.target.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                layer.colour = val;
                swatch.value = val;
                this._emitColour();
            }
        });
        this._els.hexInput = hexInput;
        this.element.appendChild(hexInput);

        // Col 4: Width (stroke) or Alpha (fill)
        const isStroke = layer.kind === 'stroke' || layer.kind === undefined;
        const widthAlpha = this.createElement('input', 'palette-row__width-alpha');
        widthAlpha.type = 'number';
        if (isStroke) {
            widthAlpha.min   = '0.5';
            widthAlpha.max   = '20';
            widthAlpha.step  = '0.5';
            widthAlpha.value = String(layer.lineWidth ?? 1);
            widthAlpha.title = 'Line width (px)';
        } else {
            widthAlpha.min   = '0';
            widthAlpha.max   = '1';
            widthAlpha.step  = '0.05';
            widthAlpha.value = String(layer.alpha ?? 1);
            widthAlpha.title = 'Opacity (0–1)';
        }
        widthAlpha.style.cssText = `
            width: 100%;
            height: ${F * 1.5}px;
            padding: 0 ${F * 0.25}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            box-sizing: border-box;
        `;
        widthAlpha.addEventListener('change', (e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) {
                if (isStroke) { layer.lineWidth = v; }
                else          { layer.alpha = v; }
                this.onChange(layer.id, isStroke
                    ? { colour: layer.colour, lineWidth: v }
                    : { colour: layer.colour, alpha: v });
            }
        });
        this._els.widthAlpha = widthAlpha;
        this.element.appendChild(widthAlpha);

        // Col 5: Mod chip
        const modBtn = this.createElement('button', 'palette-row__mod-btn');
        modBtn.type = 'button';
        modBtn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${F * 1.5}px;
            height: ${F * 1.5}px;
            border: 1px solid ${this.modEnabled ? 'var(--c-accent)' : 'var(--c-border)'};
            background: var(--c-bg);
            color: ${this.modEnabled ? 'var(--c-accent)' : 'var(--c-border)'};
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F * 0.75}px;
            cursor: pointer;
        `;
        modBtn.textContent = this.hasModulator ? '∿' : '+';
        modBtn.title = 'Modulate this layer';
        modBtn.addEventListener('click', () => this.onModulate(layer.id));
        this._els.modBtn = modBtn;
        this.element.appendChild(modBtn);

        return this.element;
    }

    _emitColour() {
        this.onChange(this.layer.id, { colour: this.layer.colour });
    }

    /** Update visual mod chip state. */
    setModState(hasModulator, enabled) {
        this.hasModulator = hasModulator;
        this.modEnabled   = enabled;
        if (!this._els.modBtn) return;
        const { F } = this.getF();
        this._els.modBtn.textContent = hasModulator ? '∿' : '+';
        this._els.modBtn.style.color  = enabled ? 'var(--c-accent)' : 'var(--c-border)';
        this._els.modBtn.style.border = `1px solid ${enabled ? 'var(--c-accent)' : 'var(--c-border)'}`;
    }

    destroy() {
        super.destroy();
    }
}
