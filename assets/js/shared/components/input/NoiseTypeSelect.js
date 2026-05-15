/**
 * NoiseTypeSelect — site-wide canonical noise-type selector.
 *
 * Wraps Select with a fixed ordered list of all noise algorithms available in
 * assets/js/shared/algorithms/noise/. Any generator that exposes a noise-type
 * param MUST use this component so the list stays in sync.
 *
 * Canonical noise IDs and labels (order = conceptual complexity):
 *   white-gaussian, value, blue-noise, simplex, perlin, fbm,
 *   ridged-fbm, turbulence, worley, domain-warp
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export const NOISE_TYPES = [
    { id: 'white-gaussian', label: 'White / Gaussian' },
    { id: 'value',          label: 'Value' },
    { id: 'blue-noise',     label: 'Blue Noise' },
    { id: 'simplex',        label: 'Simplex' },
    { id: 'perlin',         label: 'Perlin' },
    { id: 'fbm',            label: 'fBm (Fractal)' },
    { id: 'ridged-fbm',     label: 'Ridged fBm' },
    { id: 'turbulence',     label: 'Turbulence' },
    { id: 'worley',         label: 'Worley / Cellular' },
    { id: 'domain-warp',    label: 'Domain Warp' },
];

const LABELS   = NOISE_TYPES.map(n => n.label);
const IDS      = NOISE_TYPES.map(n => n.id);

export class NoiseTypeSelect extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'noise-type-select' }, deps);

        this.label    = options.label    ?? 'Noise Type';
        this.value    = options.value    ?? 'simplex';
        this.onChange = options.onChange ?? (() => {});

        this._selectEl = null;
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();

        this.element = this.createElement('div', 'noise-type-select component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: ${F2}px;
            width: 100%;
        `;

        if (this.label) {
            const labelEl = this.createElement('label', 'noise-type-select__label');
            labelEl.textContent = this.label;
            labelEl.style.cssText = `
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                color: var(--c-text);
            `;
            this.element.appendChild(labelEl);
        }

        this._selectEl = this.createElement('select', 'noise-type-select__select');
        this._selectEl.style.cssText = `
            width: 100%;
            height: ${F * 2}px;
            padding: 0 ${F2}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            box-sizing: border-box;
            cursor: pointer;
        `;

        for (let i = 0; i < NOISE_TYPES.length; i++) {
            const opt = this.createElement('option');
            opt.value = IDS[i];
            opt.textContent = LABELS[i];
            if (IDS[i] === this.value) opt.selected = true;
            this._selectEl.appendChild(opt);
        }

        this._selectEl.addEventListener('change', (e) => {
            this.value = e.target.value;
            this.onChange(this.value);
        });

        this.element.appendChild(this._selectEl);
        return this.element;
    }

    getValue() { return this.value; }

    setValue(id) {
        this.value = id;
        if (this._selectEl) this._selectEl.value = id;
    }

    destroy() {
        super.destroy();
    }
}
