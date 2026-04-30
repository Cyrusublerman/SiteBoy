/**
 * AnimateParamControl — per-parameter animation modulator control.
 *
 * Renders a collapsible row for one animatable param with:
 *   enable (toggle), waveform (select), strength (slider 0–1),
 *   rate (slider 0.1–10), phase (slider 0–2π).
 *
 * State object shape (matches GenerativeToolHost.phaseAnimationState[key]):
 *   { enabled, waveform, strength, rate, phase, mode, min, max, baseValue, label }
 *
 * onChange(key, state) is called whenever any field changes.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export const WAVEFORMS = [
    { id: 'sine',     label: 'Sine' },
    { id: 'triangle', label: 'Triangle' },
    { id: 'saw',      label: 'Sawtooth' },
    { id: 'square',   label: 'Square' },
    { id: 'noise',    label: 'Noise' },
];

const TWO_PI = Math.PI * 2;

export class AnimateParamControl extends BaseComponent {
    /**
     * @param {Object} options
     * @param {string}   options.paramKey   - Parameter key this control binds to
     * @param {string}   options.label      - Display label
     * @param {Object}   options.state      - Initial phaseAnimationState entry
     * @param {Function} options.onChange   - (paramKey, newState) => void
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'animate-param-control' }, deps);

        this.paramKey = options.paramKey ?? '';
        this.label    = options.label    ?? options.paramKey ?? '';
        this.state    = { ...{
            enabled: false,
            waveform: 'sine',
            strength: 1,
            rate: 1,
            phase: 0,
        }, ...(options.state || {}) };
        this.onChange = options.onChange ?? (() => {});

        this._expanded = false;
        this._els = {};
    }

    render() {
        if (this.element) return this.element;

        const { F, F2 } = this.getF();
        const borderStyle = `1px solid var(--c-border)`;

        this.element = this.createElement('div', 'animate-param-control component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            border: ${borderStyle};
            margin-bottom: ${F2}px;
        `;

        // ── Header row (enable toggle + label + expand chevron) ──────────
        const header = this.createElement('div', 'animate-param-control__header');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: ${F2}px;
            padding: ${F2}px ${F}px;
            cursor: pointer;
            user-select: none;
            background: var(--c-bg);
            border-bottom: ${borderStyle};
        `;

        // Enable checkbox
        this._els.enableCheck = this.createElement('input');
        this._els.enableCheck.type = 'checkbox';
        this._els.enableCheck.checked = this.state.enabled;
        this._els.enableCheck.style.cursor = 'pointer';
        this._els.enableCheck.addEventListener('change', (e) => {
            e.stopPropagation();
            this.state.enabled = e.target.checked;
            this._emit();
        });

        const labelEl = this.createElement('span', 'animate-param-control__label');
        labelEl.textContent = this.label;
        labelEl.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            flex: 1;
        `;

        this._els.chevron = this.createElement('span', 'animate-param-control__chevron');
        this._els.chevron.textContent = '+';
        this._els.chevron.style.cssText = `
            font-family: monospace;
            font-size: ${F}px;
            color: var(--c-text);
            width: ${F}px;
            text-align: center;
        `;

        header.appendChild(this._els.enableCheck);
        header.appendChild(labelEl);
        header.appendChild(this._els.chevron);

        header.addEventListener('click', (e) => {
            if (e.target === this._els.enableCheck) return;
            this._toggleExpand();
        });

        this.element.appendChild(header);

        // ── Detail panel (hidden until expanded) ─────────────────────────
        this._els.detail = this.createElement('div', 'animate-param-control__detail');
        this._els.detail.style.cssText = `
            display: none;
            flex-direction: column;
            gap: ${F2}px;
            padding: ${F}px;
            background: var(--c-bg);
        `;

        this._els.detail.appendChild(this._makeRow('Waveform', this._makeWaveformSelect(F, F2)));
        this._els.detail.appendChild(this._makeRow('Strength', this._makeSlider('strength', 0, 1, 0.01, F, F2)));
        this._els.detail.appendChild(this._makeRow('Rate',     this._makeSlider('rate', 0.1, 10, 0.1, F, F2)));
        this._els.detail.appendChild(this._makeRow('Phase',    this._makeSlider('phase', 0, TWO_PI, 0.01, F, F2)));

        this.element.appendChild(this._els.detail);

        return this.element;
    }

    _makeRow(labelText, controlEl) {
        const { F, F2 } = this.getF();
        const row = this.createElement('div', 'animate-param-control__row');
        row.style.cssText = `
            display: flex;
            align-items: center;
            gap: ${F}px;
        `;
        const lbl = this.createElement('span');
        lbl.textContent = labelText;
        lbl.style.cssText = `
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            width: ${F * 5}px;
            flex-shrink: 0;
        `;
        row.appendChild(lbl);
        row.appendChild(controlEl);
        return row;
    }

    _makeWaveformSelect(F, F2) {
        const sel = this.createElement('select', 'animate-param-control__waveform');
        sel.style.cssText = `
            flex: 1;
            height: ${F * 2}px;
            padding: 0 ${F2}px;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
            color: var(--c-text);
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F}px;
            cursor: pointer;
        `;
        for (const w of WAVEFORMS) {
            const opt = this.createElement('option');
            opt.value = w.id;
            opt.textContent = w.label;
            if (w.id === this.state.waveform) opt.selected = true;
            sel.appendChild(opt);
        }
        sel.addEventListener('change', (e) => {
            this.state.waveform = e.target.value;
            this._emit();
        });
        this._els.waveformSelect = sel;
        return sel;
    }

    _makeSlider(stateKey, min, max, step, F, F2) {
        const wrap = this.createElement('div');
        wrap.style.cssText = `display: flex; align-items: center; gap: ${F2}px; flex: 1;`;

        const input = this.createElement('input');
        input.type = 'range';
        input.min  = String(min);
        input.max  = String(max);
        input.step = String(step);
        input.value = String(this.state[stateKey] ?? min);
        input.style.cssText = `flex: 1; cursor: pointer;`;

        const num = this.createElement('span');
        num.textContent = Number(input.value).toFixed(step < 0.1 ? 2 : 1);
        num.style.cssText = `
            font-family: 'Atkinson Hyperlegible Mono', monospace;
            font-size: ${F}px;
            color: var(--c-text);
            width: ${F * 3}px;
            text-align: right;
        `;

        input.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            this.state[stateKey] = v;
            num.textContent = v.toFixed(step < 0.1 ? 2 : 1);
            this._emit();
        });

        wrap.appendChild(input);
        wrap.appendChild(num);
        this._els[stateKey + 'Slider'] = input;
        return wrap;
    }

    _toggleExpand() {
        this._expanded = !this._expanded;
        this._els.detail.style.display = this._expanded ? 'flex' : 'none';
        this._els.chevron.textContent  = this._expanded ? '−' : '+';
    }

    _emit() {
        this.onChange(this.paramKey, { ...this.state });
    }

    /** Programmatically set state from host (e.g. after preset load). */
    setState(newState) {
        Object.assign(this.state, newState);
        if (this._els.enableCheck)    this._els.enableCheck.checked = this.state.enabled;
        if (this._els.waveformSelect) this._els.waveformSelect.value = this.state.waveform;
        if (this._els.strengthSlider) this._els.strengthSlider.value = String(this.state.strength);
        if (this._els.rateSlider)     this._els.rateSlider.value     = String(this.state.rate);
        if (this._els.phaseSlider)    this._els.phaseSlider.value    = String(this.state.phase);
    }

    destroy() {
        super.destroy();
    }
}
