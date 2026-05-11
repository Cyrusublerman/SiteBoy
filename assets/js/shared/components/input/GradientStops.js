/**
 * GradientStops — stops editor for the gradient shape stage on colour modulators.
 *
 * Renders a list of { t: 0–1, colour: hex } stops with add/remove controls
 * and a visual gradient preview bar.
 *
 * Emits: onChange(stops) whenever any stop changes.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class GradientStops extends BaseComponent {
    /**
     * @param {Object} options
     * @param {Array}    options.stops    - Initial array of { t: number, colour: string }
     * @param {Function} options.onChange - (stops) => void
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'gradient-stops' }, deps);

        this.stops = (options.stops ?? [
            { t: 0, colour: '#000000' },
            { t: 1, colour: '#ffffff' },
        ]).map(s => ({ ...s }));
        this.onChange = options.onChange ?? (() => {});
    }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();

        this.element = this.createElement('div', 'gradient-stops component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: ${F * 0.5}px;
            padding: ${F * 0.5}px 0;
        `;

        this._previewBar = this.createElement('div', 'gradient-stops__preview');
        this._previewBar.style.cssText = `
            width: 100%;
            height: ${F}px;
            border: 1px solid var(--c-border);
        `;

        this._stopsList = this.createElement('div', 'gradient-stops__list');
        this._stopsList.style.cssText = `display:flex;flex-direction:column;gap:${F * 0.25}px;`;

        const addBtn = this.createElement('button', 'gradient-stops__add');
        addBtn.type = 'button';
        addBtn.textContent = '+ Stop';
        addBtn.style.cssText = `
            height:${F * 2}px;
            border:1px solid var(--c-border);
            background:var(--c-bg);
            color:var(--c-text);
            font-family:'Atkinson Hyperlegible',monospace;
            font-size:${F}px;
            cursor:pointer;
        `;
        addBtn.addEventListener('click', () => {
            this.stops.push({ t: 0.5, colour: '#808080' });
            this._rebuildList(F);
            this._updatePreview();
            this.onChange([...this.stops]);
        });

        this.element.appendChild(this._previewBar);
        this.element.appendChild(this._stopsList);
        this.element.appendChild(addBtn);

        this._rebuildList(F);
        this._updatePreview();

        return this.element;
    }

    _rebuildList(F) {
        this._stopsList.innerHTML = '';

        this.stops.sort((a, b) => a.t - b.t);

        this.stops.forEach((stop, i) => {
            const row = this.createElement('div', 'gradient-stops__stop-row');
            row.style.cssText = `
                display:grid;
                grid-template-columns:${F * 4}px ${F * 2}px ${F * 6}px auto;
                align-items:center;
                gap:${F * 0.5}px;
                height:${F * 2}px;
            `;

            // t slider
            const tInput = this.createElement('input');
            tInput.type  = 'range';
            tInput.min   = '0';
            tInput.max   = '1';
            tInput.step  = '0.01';
            tInput.value = String(stop.t);
            tInput.style.width = '100%';
            tInput.style.cursor = 'pointer';
            tInput.addEventListener('input', (e) => {
                stop.t = parseFloat(e.target.value);
                this._updatePreview();
                this.onChange([...this.stops]);
            });

            // swatch
            const swatch = this.createElement('input');
            swatch.type  = 'color';
            swatch.value = stop.colour;
            swatch.style.cssText = `width:${F * 1.5}px;height:${F * 1.5}px;cursor:pointer;padding:0;border:1px solid var(--c-border);`;
            swatch.addEventListener('input', (e) => {
                stop.colour = e.target.value;
                hexInput.value = e.target.value;
                this._updatePreview();
                this.onChange([...this.stops]);
            });

            // hex input
            const hexInput = this.createElement('input');
            hexInput.type  = 'text';
            hexInput.value = stop.colour;
            hexInput.maxLength = 7;
            hexInput.style.cssText = `
                width:100%;height:${F * 1.5}px;padding:0 ${F * 0.5}px;
                border:1px solid var(--c-border);
                background:var(--c-bg);color:var(--c-text);
                font-family:'Atkinson Hyperlegible Mono',monospace;font-size:${F}px;
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

            // remove btn
            const removeBtn = this.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '×';
            removeBtn.style.cssText = `
                height:${F * 1.5}px;width:${F * 1.5}px;
                border:1px solid var(--c-border);
                background:var(--c-bg);color:var(--c-text);
                font-size:${F}px;cursor:pointer;
            `;
            removeBtn.addEventListener('click', () => {
                if (this.stops.length <= 2) return; // keep at least 2 stops
                this.stops.splice(i, 1);
                this._rebuildList(F);
                this._updatePreview();
                this.onChange([...this.stops]);
            });

            row.appendChild(tInput);
            row.appendChild(swatch);
            row.appendChild(hexInput);
            row.appendChild(removeBtn);
            this._stopsList.appendChild(row);
        });
    }

    _updatePreview() {
        if (!this._previewBar) return;
        const sorted = [...this.stops].sort((a, b) => a.t - b.t);
        const stops = sorted.map(s => `${s.colour} ${(s.t * 100).toFixed(0)}%`).join(', ');
        this._previewBar.style.background = `linear-gradient(to right, ${stops})`;
    }

    /** Replace stops programmatically. */
    setStops(stops) {
        this.stops = stops.map(s => ({ ...s }));
        if (this.element) {
            const { F } = this.getF();
            this._rebuildList(F);
            this._updatePreview();
        }
    }

    destroy() {
        super.destroy();
    }
}
