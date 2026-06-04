/**
 * GradientStops — stops editor for the gradient shape stage on colour modulators.
 *
 * Renders a list of { t: 0–1, colour: hex } stops with add/remove controls
 * and a canvas-drawn gradient preview strip.
 *
 * Emits: onChange(stops) whenever any stop changes.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Slider } from './Slider.js';

function _hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
    ];
}

function _rgbToHex(r, g, b) {
    const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${c(r)}${c(g)}${c(b)}`;
}

function _sampleColour(stops, t) {
    const sorted = [...stops].sort((a, b) => a.t - b.t);
    if (sorted.length === 0) return '#000000';
    if (t <= sorted[0].t) return sorted[0].colour;
    if (t >= sorted[sorted.length - 1].t) return sorted[sorted.length - 1].colour;
    for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (t >= a.t && t <= b.t) {
            const span = b.t - a.t || 1;
            const u = (t - a.t) / span;
            const [r0, g0, b0] = _hexToRgb(a.colour);
            const [r1, g1, b1] = _hexToRgb(b.colour);
            return _rgbToHex(
                r0 + (r1 - r0) * u,
                g0 + (g1 - g0) * u,
                b0 + (b1 - b0) * u
            );
        }
    }
    return sorted[sorted.length - 1].colour;
}

export class GradientStops extends BaseComponent {
    /**
     * @param {Object} options
     * @param {Array}    options.stops    - Initial array of { t: number, colour: string }
     * @param {Function} options.onChange - (stops) => void
     * @param {boolean}  [options.topBorder]
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'gradient-stops' }, deps);

        this.stops = (options.stops ?? [
            { t: 0, colour: '#000000' },
            { t: 1, colour: '#ffffff' },
        ]).map(s => ({ ...s }));
        this.onChange = options.onChange ?? (() => {});
        this.topBorder = options.topBorder ?? true;

        this._tSliders = [];
    }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();

        this.element = this.createElement('div', 'gradient-stops component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
            border: 1px solid var(--c-border);
            border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'};
            box-sizing: border-box;
        `;

        const previewWrap = this.createElement('div', 'gradient-stops__preview-wrap');
        previewWrap.style.cssText = `
            width: 100%;
            height: ${F}px;
            border-bottom: 1px solid var(--c-border);
            box-sizing: border-box;
        `;

        this._previewCanvas = this.createElement('canvas', 'gradient-stops__preview');
        this._previewCanvas.style.cssText = 'display:block;width:100%;height:100%;';
        previewWrap.appendChild(this._previewCanvas);

        this._stopsList = this.createElement('div', 'gradient-stops__list');
        this._stopsList.style.cssText = 'display:flex;flex-direction:column;gap:0;';

        const addBtn = this.createElement('button', 'gradient-stops__add');
        addBtn.type = 'button';
        addBtn.textContent = '+ STOP';
        addBtn.style.cssText = `
            height:${F * 2}px;
            border:none;
            border-top:1px solid var(--c-border);
            background:var(--c-bg);
            color:var(--c-text);
            font-family:'Atkinson Hyperlegible',monospace;
            font-size:${F * 0.75}px;
            text-transform:uppercase;
            cursor:pointer;
            box-sizing:border-box;
        `;
        addBtn.addEventListener('click', () => {
            this.stops.push({ t: 0.5, colour: '#808080' });
            this._rebuildList(F);
            this._updatePreview();
            this.onChange([...this.stops]);
        });

        this.element.appendChild(previewWrap);
        this.element.appendChild(this._stopsList);
        this.element.appendChild(addBtn);

        this._rebuildList(F);
        this._updatePreview();

        return this.element;
    }

    _destroyTSliders() {
        for (const s of this._tSliders) {
            if (s) this.removeChild(s);
        }
        this._tSliders = [];
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

    _rebuildList(F) {
        this._destroyTSliders();
        this._stopsList.innerHTML = '';

        this.stops.sort((a, b) => a.t - b.t);

        this.stops.forEach((stop, i) => {
            const row = this.createElement('div', 'gradient-stops__stop-row');
            row.style.cssText = `
                display:flex;
                align-items:stretch;
                gap:0;
                height:${F * 2}px;
                box-sizing:border-box;
                ${i > 0 ? 'border-top:1px solid var(--c-border);' : ''}
            `;

            let cellIdx = 0;

            const sliderCell = this.createElement('div');
            sliderCell.style.cssText = this._cellCss(cellIdx, F, 'flex:1;min-width:0;padding:0;');
            cellIdx += 1;

            const slider = new Slider({
                min: 0, max: 1, step: 0.01, value: stop.t,
                trackHF: 2,
                borders: { top: false, right: false, bottom: false, left: false },
                onInput: (v) => {
                    stop.t = v;
                    this._updatePreview();
                    this.onChange([...this.stops]);
                },
                onChange: (v) => {
                    stop.t = v;
                    this._updatePreview();
                    this.onChange([...this.stops]);
                },
            }, this.deps);
            this.addChild(slider);
            this._tSliders.push(slider);
            const slEl = slider.render();
            slEl.style.flex = '1';
            slEl.style.minWidth = '0';
            slEl.style.height = '100%';
            slEl.style.width = '100%';
            sliderCell.appendChild(slEl);
            row.appendChild(sliderCell);

            const swatchCell = this.createElement('div');
            swatchCell.style.cssText = this._cellCss(cellIdx, F, `flex:0 0 ${F * 2}px; justify-content:center;`);
            cellIdx += 1;
            const swatch = this.createElement('input');
            swatch.type = 'color';
            swatch.value = stop.colour;
            swatch.style.cssText = `
                width:${F * 1.5}px;height:${F * 1.5}px;
                cursor:pointer;padding:0;border:1px solid var(--c-border);
                box-sizing:border-box;
            `;
            swatch.addEventListener('input', (e) => {
                stop.colour = e.target.value;
                hexInput.value = e.target.value;
                this._updatePreview();
                this.onChange([...this.stops]);
            });
            swatchCell.appendChild(swatch);
            row.appendChild(swatchCell);

            const hexCell = this.createElement('div');
            hexCell.style.cssText = this._cellCss(cellIdx, F, `flex:0 0 ${F * 6}px; padding:0 ${F}px;`);
            cellIdx += 1;
            const hexInput = this.createElement('input');
            hexInput.type = 'text';
            hexInput.value = stop.colour;
            hexInput.maxLength = 7;
            hexInput.style.cssText = `
                width:100%;height:100%;
                border:none;
                background:var(--c-bg);color:var(--c-text);
                font-family:'Atkinson Hyperlegible Mono',monospace;
                font-size:${F * 0.75}px;
                box-sizing:border-box;
            `;
            hexInput.addEventListener('change', (e) => {
                const val = e.target.value.trim();
                if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                    stop.colour = val;
                    swatch.value = val;
                    this._updatePreview();
                    this.onChange([...this.stops]);
                }
            });
            hexCell.appendChild(hexInput);
            row.appendChild(hexCell);

            const removeCell = this.createElement('div');
            removeCell.style.cssText = this._cellCss(cellIdx, F, `flex:0 0 ${F * 2}px; justify-content:center;`);
            const removeBtn = this.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '×';
            removeBtn.style.cssText = `
                height:${F * 1.5}px;width:${F * 1.5}px;
                border:1px solid var(--c-border);
                background:var(--c-bg);color:var(--c-text);
                font-size:${F}px;cursor:pointer;
                box-sizing:border-box;
            `;
            removeBtn.addEventListener('click', () => {
                if (this.stops.length <= 2) return;
                this.stops.splice(i, 1);
                this._rebuildList(F);
                this._updatePreview();
                this.onChange([...this.stops]);
            });
            removeCell.appendChild(removeBtn);
            row.appendChild(removeCell);

            this._stopsList.appendChild(row);
        });
    }

    _updatePreview() {
        if (!this._previewCanvas) return;
        const { F } = this.getF();
        const wrap = this._previewCanvas.parentElement;
        const w = Math.max(1, Math.floor(wrap?.clientWidth || 200));
        const h = F;
        this._previewCanvas.width = w;
        this._previewCanvas.height = h;

        const ctx = this._previewCanvas.getContext('2d');
        if (!ctx) return;

        for (let x = 0; x < w; x++) {
            const t = w > 1 ? x / (w - 1) : 0;
            ctx.fillStyle = _sampleColour(this.stops, t);
            ctx.fillRect(x, 0, 1, h);
        }
    }

    setStops(stops) {
        this.stops = stops.map(s => ({ ...s }));
        if (this.element) {
            const { F } = this.getF();
            this._rebuildList(F);
            this._updatePreview();
        }
    }

    setTopBorder(on) {
        this.topBorder = !!on;
        if (this.element) {
            this.element.style.borderTop = this.topBorder
                ? '1px solid var(--c-border)'
                : 'none';
        }
    }

    destroy() {
        this._destroyTSliders();
        super.destroy();
    }
}
