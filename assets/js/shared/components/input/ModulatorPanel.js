/**
 * ModulatorPanel — expanded driver/shape/range/combine/sync panel.
 *
 * Renders driver-specific parameter fields by reading the driver's
 * parameters[] schema from driver-registry.js. Replaces AnimateParamControl.
 *
 * Emits: onChange(targetKey, modulator) whenever any field changes.
 *
 * Layout (collapsed by default, expanded by ModulatorChip click):
 *   ┌──────────────────────────────────────────────┐
 *   │ [Enable ☐]  DRIVER [dropdown]                │
 *   │  <driver-specific fields>                    │
 *   │ ─── SHAPE ───                                │
 *   │  Easing [dropdown]  Invert [☐]               │
 *   │ ─── RANGE ───                                │
 *   │  Depth [slider]  Bias [slider]               │
 *   │  Min [input]  Max [input]  Bipolar [☐]       │
 *   │ ─── COMBINE ───                              │
 *   │  Mode [dropdown]                             │
 *   └──────────────────────────────────────────────┘
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { DriverRegistry } from '../../../tools/generators/core/driver-registry.js';

const COMBINE_MODES = ['add', 'multiply', 'replace', 'drift', 'max', 'min'];
const EASING_MODES  = ['linear', 'ease-in', 'ease-out', 'ease-in-out'];

export class ModulatorPanel extends BaseComponent {
    /**
     * @param {Object} options
     * @param {string}   options.targetKey  - Param key this panel targets
     * @param {Object}   options.modulator  - ModulatorDescriptor (will be cloned)
     * @param {Function} options.onChange   - (targetKey, modulator) => void
     */
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'modulator-panel' }, deps);

        this.targetKey = options.targetKey ?? '';
        this.mod = this._clone(options.modulator ?? {
            targetKey: this.targetKey,
            enabled:   false,
            driver:    { type: 'lfo', config: { waveform: 'sine', rate: 1, phase: 0 } },
            shape:     { easing: 'linear', invert: false },
            range:     { depth: 1, bias: 0, bipolar: true },
            combine:   'add',
            sync:      { clock: 'free', rateMul: 1 },
        });
        this.onChange = options.onChange ?? (() => {});

        this._driverFields = [];
    }

    _clone(obj) { return JSON.parse(JSON.stringify(obj)); }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();

        this.element = this.createElement('div', 'modulator-panel component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            width: 100%;
            border: 1px solid var(--c-border);
            background: var(--c-bg);
        `;

        this._buildHeader(F);
        this._buildDriverSection(F);
        this._buildShapeSection(F);
        this._buildRangeSection(F);
        this._buildCombineSection(F);

        return this.element;
    }

    // ── Sections ──────────────────────────────────────────────────────────────

    _buildHeader(F) {
        const row = this._row(F);
        row.style.borderBottom = '1px solid var(--c-border)';
        row.style.padding = `0 ${F}px`;
        row.style.height = `${F * 2}px`;

        const enableLbl = this._label('Enable', F);
        const enableCheck = this.createElement('input');
        enableCheck.type = 'checkbox';
        enableCheck.checked = this.mod.enabled;
        enableCheck.style.cursor = 'pointer';
        enableCheck.style.marginLeft = `${F * 0.5}px`;
        enableCheck.addEventListener('change', (e) => {
            this.mod.enabled = e.target.checked;
            this._emit();
        });

        row.appendChild(enableLbl);
        row.appendChild(enableCheck);
        this.element.appendChild(row);
    }

    _buildDriverSection(F) {
        const section = this._section('Driver', F);

        // Driver type dropdown
        const driverRow = this._row(F);
        const driverLbl = this._label('Type', F);
        const driverSel = this._select(
            DriverRegistry.list().map(d => ({ value: d.id, label: d.label })),
            this.mod.driver?.type ?? 'lfo',
            F
        );
        driverSel.addEventListener('change', (e) => {
            const type = e.target.value;
            const driver = DriverRegistry.get(type);
            this.mod.driver = { type, config: { ...driver.defaults } };
            this._rebuildDriverFields(F);
            this._emit();
        });
        driverRow.appendChild(driverLbl);
        driverRow.appendChild(driverSel);
        section.appendChild(driverRow);

        // Driver-specific fields container
        this._driverFieldsContainer = this.createElement('div', 'modulator-panel__driver-fields');
        section.appendChild(this._driverFieldsContainer);

        this._rebuildDriverFields(F);
        this.element.appendChild(section);
    }

    _rebuildDriverFields(F) {
        if (!this._driverFieldsContainer) return;
        this._driverFieldsContainer.innerHTML = '';
        this._driverFields = [];

        const type = this.mod.driver?.type ?? 'lfo';
        if (!DriverRegistry.has(type)) return;
        const driver = DriverRegistry.get(type);

        for (const param of (driver.parameters ?? [])) {
            if (param.type === 'code' || param.type === 'curve-editor') continue; // handled specially later
            const row = this._row(F);
            row.appendChild(this._label(param.label, F));

            let ctrl;
            const currentVal = this.mod.driver.config?.[param.key] ?? param.default;

            if (param.type === 'slider') {
                ctrl = this._slider(
                    currentVal,
                    param.min ?? 0, param.max ?? 1, param.step ?? 0.01,
                    F,
                    (v) => {
                        this.mod.driver.config = this.mod.driver.config ?? {};
                        this.mod.driver.config[param.key] = v;
                        this._emit();
                    }
                );
            } else if (param.type === 'dropdown') {
                ctrl = this._select(
                    (param.options ?? []).map(o => ({ value: o, label: o })),
                    currentVal,
                    F
                );
                ctrl.addEventListener('change', (e) => {
                    this.mod.driver.config = this.mod.driver.config ?? {};
                    this.mod.driver.config[param.key] = e.target.value;
                    this._emit();
                });
            } else {
                ctrl = this._textInput(String(currentVal), F, (v) => {
                    this.mod.driver.config = this.mod.driver.config ?? {};
                    this.mod.driver.config[param.key] = v;
                    this._emit();
                });
            }

            row.appendChild(ctrl);
            this._driverFieldsContainer.appendChild(row);
            this._driverFields.push({ param, ctrl });
        }
    }

    _buildShapeSection(F) {
        const section = this._section('Shape', F);

        const row1 = this._row(F);
        row1.appendChild(this._label('Easing', F));
        const easingSel = this._select(EASING_MODES.map(m => ({ value: m, label: m })),
            this.mod.shape?.easing ?? 'linear', F);
        easingSel.addEventListener('change', (e) => {
            this.mod.shape = this.mod.shape ?? {};
            this.mod.shape.easing = e.target.value;
            this._emit();
        });
        row1.appendChild(easingSel);

        const invertLbl = this._label('Invert', F);
        invertLbl.style.marginLeft = `${F}px`;
        const invertCheck = this.createElement('input');
        invertCheck.type = 'checkbox';
        invertCheck.checked = this.mod.shape?.invert ?? false;
        invertCheck.style.cursor = 'pointer';
        invertCheck.style.marginLeft = `${F * 0.5}px`;
        invertCheck.addEventListener('change', (e) => {
            this.mod.shape = this.mod.shape ?? {};
            this.mod.shape.invert = e.target.checked;
            this._emit();
        });
        row1.appendChild(invertLbl);
        row1.appendChild(invertCheck);

        section.appendChild(row1);
        this.element.appendChild(section);
    }

    _buildRangeSection(F) {
        const section = this._section('Range', F);

        const depthRow = this._row(F);
        depthRow.appendChild(this._label('Depth', F));
        depthRow.appendChild(this._slider(this.mod.range?.depth ?? 1, 0, 2, 0.01, F, (v) => {
            this.mod.range = this.mod.range ?? {};
            this.mod.range.depth = v;
            this._emit();
        }));
        section.appendChild(depthRow);

        const biasRow = this._row(F);
        biasRow.appendChild(this._label('Bias', F));
        biasRow.appendChild(this._slider(this.mod.range?.bias ?? 0, -1, 1, 0.01, F, (v) => {
            this.mod.range = this.mod.range ?? {};
            this.mod.range.bias = v;
            this._emit();
        }));
        section.appendChild(biasRow);

        const bipolarRow = this._row(F);
        bipolarRow.appendChild(this._label('Bipolar', F));
        const bipolarCheck = this.createElement('input');
        bipolarCheck.type = 'checkbox';
        bipolarCheck.checked = this.mod.range?.bipolar ?? true;
        bipolarCheck.style.cursor = 'pointer';
        bipolarCheck.style.marginLeft = `${F * 0.5}px`;
        bipolarCheck.addEventListener('change', (e) => {
            this.mod.range = this.mod.range ?? {};
            this.mod.range.bipolar = e.target.checked;
            this._emit();
        });
        bipolarRow.appendChild(bipolarCheck);
        section.appendChild(bipolarRow);

        this.element.appendChild(section);
    }

    _buildCombineSection(F) {
        const section = this._section('Combine', F);
        const row = this._row(F);
        row.appendChild(this._label('Mode', F));
        const sel = this._select(COMBINE_MODES.map(m => ({ value: m, label: m })),
            this.mod.combine ?? 'add', F);
        sel.addEventListener('change', (e) => {
            this.mod.combine = e.target.value;
            this._emit();
        });
        row.appendChild(sel);
        section.appendChild(row);
        this.element.appendChild(section);
    }

    // ── DOM helpers ───────────────────────────────────────────────────────────

    _section(title, F) {
        const el = this.createElement('div', 'modulator-panel__section');
        el.style.cssText = `display:flex;flex-direction:column;border-top:1px solid var(--c-border);`;
        const hdr = this.createElement('div', 'modulator-panel__section-header');
        hdr.textContent = title.toUpperCase();
        hdr.style.cssText = `
            padding: 0 ${F}px;
            height: ${F * 1.5}px;
            display: flex; align-items: center;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F * 0.75}px;
            color: var(--c-text);
            background: var(--c-border);
            text-transform: uppercase;
        `;
        el.appendChild(hdr);
        return el;
    }

    _row(F) {
        const row = this.createElement('div', 'modulator-panel__row');
        row.style.cssText = `
            display:flex; align-items:center; gap:${F * 0.5}px;
            padding: ${F * 0.25}px ${F}px;
            min-height: ${F * 2}px;
        `;
        return row;
    }

    _label(text, F) {
        const lbl = this.createElement('span');
        lbl.textContent = text;
        lbl.style.cssText = `
            font-family:'Atkinson Hyperlegible',monospace;
            font-size:${F}px;
            color:var(--c-text);
            width:${F * 5}px;
            flex-shrink:0;
            text-transform:uppercase;
        `;
        return lbl;
    }

    _select(options, value, F) {
        const sel = this.createElement('select', 'modulator-panel__select');
        sel.style.cssText = `
            flex:1; height:${F * 2}px; padding:0 ${F * 0.5}px;
            border:1px solid var(--c-border);
            background:var(--c-bg); color:var(--c-text);
            font-family:'Atkinson Hyperlegible',monospace;
            font-size:${F}px; cursor:pointer;
        `;
        for (const opt of options) {
            const el = this.createElement('option');
            el.value = opt.value;
            el.textContent = opt.label;
            if (opt.value === value) el.selected = true;
            sel.appendChild(el);
        }
        return sel;
    }

    _slider(value, min, max, step, F, onChange) {
        const wrap = this.createElement('div');
        wrap.style.cssText = `display:flex;align-items:center;gap:${F * 0.5}px;flex:1;`;

        const input = this.createElement('input');
        input.type  = 'range';
        input.min   = String(min);
        input.max   = String(max);
        input.step  = String(step);
        input.value = String(value);
        input.style.cssText = `flex:1; cursor:pointer;`;

        const num = this.createElement('span');
        const prec = step < 0.01 ? 3 : step < 0.1 ? 2 : 1;
        num.textContent = Number(value).toFixed(prec);
        num.style.cssText = `
            font-family:'Atkinson Hyperlegible Mono',monospace;
            font-size:${F}px; color:var(--c-text);
            width:${F * 3}px; text-align:right;
        `;

        input.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            num.textContent = v.toFixed(prec);
            onChange(v);
        });

        wrap.appendChild(input);
        wrap.appendChild(num);
        return wrap;
    }

    _textInput(value, F, onChange) {
        const input = this.createElement('input', 'modulator-panel__text-input');
        input.type = 'text';
        input.value = value;
        input.style.cssText = `
            flex:1; height:${F * 2}px; padding:0 ${F * 0.5}px;
            border:1px solid var(--c-border);
            background:var(--c-bg); color:var(--c-text);
            font-family:'Atkinson Hyperlegible Mono',monospace;
            font-size:${F}px;
        `;
        input.addEventListener('change', (e) => onChange(e.target.value));
        return input;
    }

    _emit() {
        this.onChange(this.targetKey, this._clone(this.mod));
    }

    /** Programmatically update the displayed modulator (e.g. after preset load). */
    setModulator(modulator) {
        this.mod = this._clone(modulator);
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }

    destroy() {
        super.destroy();
    }
}
