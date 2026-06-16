/**
 * ModulatorPanel — expanded driver/shape/range/combine/sync panel.
 *
 * Renders driver-specific parameter fields by reading the driver's
 * parameters[] schema from driver-registry.js.
 *
 * Emits: onChange(targetKey, modulator) whenever any field changes.
 *
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';
import { Slider } from './Slider.js';
import { DriverRegistry } from '../../../tools/generators/core/driver-registry.js';

const COMBINE_MODES = ['add', 'multiply', 'replace', 'drift', 'max', 'min'];
const EASING_MODES  = ['linear', 'ease-in', 'ease-out', 'ease-in-out'];

export class ModulatorPanel extends BaseComponent {
    /**
     * @param {Object} options
     * @param {string}   options.targetKey  - Param key this panel targets
     * @param {Object}   options.modulator  - ModulatorDescriptor (will be cloned)
     * @param {Function} options.onChange   - (targetKey, modulator) => void
     * @param {boolean}  [options.topBorder]
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
        this.topBorder = options.topBorder ?? true;

        this._driverFields = [];
        this._sliderComps = [];
    }

    _clone(obj) { return JSON.parse(JSON.stringify(obj)); }

    render() {
        if (this.element) return this.element;

        const { F } = this.getF();

        this.element = this.createElement('div', 'modulator-panel component');
        this.element.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0;
            width: 100%;
            border: 1px solid var(--c-border);
            border-top: ${this.topBorder ? '1px solid var(--c-border)' : 'none'};
            box-sizing: border-box;
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
        this._appendLabelCell(row, 'Enable', F, `${F * 5}px`);
        const check = this.createElement('input');
        check.type = 'checkbox';
        check.checked = this.mod.enabled;
        check.style.cursor = 'pointer';
        check.addEventListener('change', (e) => {
            this.mod.enabled = e.target.checked;
            this._emit();
        });
        this._appendCell(row, check, F, `flex:0 0 ${F * 2}px; justify-content:center;`);
        this.element.appendChild(row);
    }

    _buildDriverSection(F) {
        const section = this._section('Driver', F);

        const driverRow = this._row(F);
        this._appendLabelCell(driverRow, 'Type', F, `${F * 5}px`);
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
        this._appendCell(driverRow, driverSel, F, 'flex:1;min-width:0;padding:0;');
        section.appendChild(driverRow);

        this._driverFieldsContainer = this.createElement('div', 'modulator-panel__driver-fields');
        this._driverFieldsContainer.style.cssText = 'display:flex;flex-direction:column;gap:0;';
        section.appendChild(this._driverFieldsContainer);

        this._rebuildDriverFields(F);
        this.element.appendChild(section);
    }

    _rebuildDriverFields(F) {
        if (!this._driverFieldsContainer) return;
        this._destroySliders();
        this._driverFieldsContainer.innerHTML = '';
        this._driverFields = [];

        const type = this.mod.driver?.type ?? 'lfo';
        if (!DriverRegistry.has(type)) return;
        const driver = DriverRegistry.get(type);

        for (const param of (driver.parameters ?? [])) {
            if (param.type === 'code' || param.type === 'curve-editor') continue;

            const row = this._row(F);
            row.style.borderTop = '1px solid var(--c-border)';
            this._appendLabelCell(row, param.label, F, `${F * 5}px`);

            const currentVal = this.mod.driver.config?.[param.key] ?? param.default;
            let ctrl;

            if (param.type === 'slider') {
                ctrl = this._makeSliderEl(
                    currentVal,
                    param.min ?? 0, param.max ?? 1, param.step ?? 0.01,
                    (v) => {
                        this.mod.driver.config = this.mod.driver.config ?? {};
                        this.mod.driver.config[param.key] = v;
                        this._emit();
                    }
                );
                this._appendCell(row, ctrl, F, 'flex:1;min-width:0;padding:0;');
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
                this._appendCell(row, ctrl, F, 'flex:1;min-width:0;padding:0;');
            } else {
                ctrl = this._textInput(String(currentVal), F, (v) => {
                    this.mod.driver.config = this.mod.driver.config ?? {};
                    this.mod.driver.config[param.key] = v;
                    this._emit();
                });
                this._appendCell(row, ctrl, F, 'flex:1;min-width:0;padding:0;');
            }

            this._driverFieldsContainer.appendChild(row);
            this._driverFields.push({ param, ctrl });
        }
    }

    _buildShapeSection(F) {
        const section = this._section('Shape', F);

        const row1 = this._row(F);
        this._appendLabelCell(row1, 'Easing', F, `${F * 5}px`);
        const easingSel = this._select(
            EASING_MODES.map(m => ({ value: m, label: m })),
            this.mod.shape?.easing ?? 'linear',
            F
        );
        easingSel.addEventListener('change', (e) => {
            this.mod.shape = this.mod.shape ?? {};
            this.mod.shape.easing = e.target.value;
            this._emit();
        });
        this._appendCell(row1, easingSel, F, 'flex:1;min-width:0;padding:0;');

        this._appendLabelCell(row1, 'Invert', F, `${F * 5}px`);
        const invertCheck = this.createElement('input');
        invertCheck.type = 'checkbox';
        invertCheck.checked = this.mod.shape?.invert ?? false;
        invertCheck.style.cursor = 'pointer';
        invertCheck.addEventListener('change', (e) => {
            this.mod.shape = this.mod.shape ?? {};
            this.mod.shape.invert = e.target.checked;
            this._emit();
        });
        this._appendCell(row1, invertCheck, F, `flex:0 0 ${F * 2}px; justify-content:center;`);

        section.appendChild(row1);
        this.element.appendChild(section);
    }

    _buildRangeSection(F) {
        const section = this._section('Range', F);

        const depthRow = this._row(F);
        this._appendLabelCell(depthRow, 'Depth', F, `${F * 5}px`);
        this._appendCell(depthRow, this._makeSliderEl(
            this.mod.range?.depth ?? 1, 0, 2, 0.01,
            (v) => {
                this.mod.range = this.mod.range ?? {};
                this.mod.range.depth = v;
                this._emit();
            }
        ), F, 'flex:1;min-width:0;padding:0;');
        section.appendChild(depthRow);

        const biasRow = this._row(F);
        biasRow.style.borderTop = '1px solid var(--c-border)';
        this._appendLabelCell(biasRow, 'Bias', F, `${F * 5}px`);
        this._appendCell(biasRow, this._makeSliderEl(
            this.mod.range?.bias ?? 0, -1, 1, 0.01,
            (v) => {
                this.mod.range = this.mod.range ?? {};
                this.mod.range.bias = v;
                this._emit();
            }
        ), F, 'flex:1;min-width:0;padding:0;');
        section.appendChild(biasRow);

        const bipolarRow = this._row(F);
        bipolarRow.style.borderTop = '1px solid var(--c-border)';
        this._appendLabelCell(bipolarRow, 'Bipolar', F, `${F * 5}px`);
        const bipolarCheck = this.createElement('input');
        bipolarCheck.type = 'checkbox';
        bipolarCheck.checked = this.mod.range?.bipolar ?? true;
        bipolarCheck.style.cursor = 'pointer';
        bipolarCheck.addEventListener('change', (e) => {
            this.mod.range = this.mod.range ?? {};
            this.mod.range.bipolar = e.target.checked;
            this._emit();
        });
        this._appendCell(bipolarRow, bipolarCheck, F, `flex:0 0 ${F * 2}px; justify-content:center;`);
        section.appendChild(bipolarRow);

        this.element.appendChild(section);
    }

    _buildCombineSection(F) {
        const section = this._section('Combine', F);
        const row = this._row(F);
        this._appendLabelCell(row, 'Mode', F, `${F * 5}px`);
        const sel = this._select(
            COMBINE_MODES.map(m => ({ value: m, label: m })),
            this.mod.combine ?? 'add',
            F
        );
        sel.addEventListener('change', (e) => {
            this.mod.combine = e.target.value;
            this._emit();
        });
        this._appendCell(row, sel, F, 'flex:1;min-width:0;padding:0;');
        section.appendChild(row);
        this.element.appendChild(section);
    }

    // ── DOM helpers ───────────────────────────────────────────────────────────

    _section(title, F) {
        const el = this.createElement('div', 'modulator-panel__section');
        el.style.cssText = 'display:flex;flex-direction:column;gap:0;border-top:1px solid var(--c-border);';
        const hdr = this.createElement('div', 'modulator-panel__section-header');
        hdr.textContent = title.toUpperCase();
        hdr.style.cssText = `
            padding: 0 ${F}px;
            height: ${F * 1.5}px;
            display: flex;
            align-items: center;
            gap: 0;
            font-family: 'Atkinson Hyperlegible', monospace;
            font-size: ${F * 0.75}px;
            color: var(--c-text);
            background: var(--c-border);
            text-transform: uppercase;
            box-sizing: border-box;
        `;
        el.appendChild(hdr);
        return el;
    }

    _row(F) {
        const row = this.createElement('div', 'modulator-panel__row');
        row.style.cssText = `
            display: flex;
            align-items: stretch;
            gap: 0;
            height: ${F * 2}px;
            box-sizing: border-box;
        `;
        row._cellIndex = 0;
        return row;
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

    _appendLabelCell(row, text, F, width) {
        const cell = this.createElement('div');
        cell.style.cssText = this._cellCss(row._cellIndex, F, `flex: 0 0 ${width}; padding: 0 ${F}px;`);
        const lbl = this.createElement('span');
        lbl.textContent = String(text).toUpperCase();
        lbl.style.cssText = `
            font-family:'Atkinson Hyperlegible',monospace;
            font-size:${F * 0.75}px;
            color:var(--c-text);
            text-transform:uppercase;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
        `;
        cell.appendChild(lbl);
        row.appendChild(cell);
        row._cellIndex += 1;
    }

    _appendCell(row, content, F, extra) {
        const cell = this.createElement('div');
        cell.style.cssText = this._cellCss(row._cellIndex, F, extra);
        if (content instanceof HTMLElement) cell.appendChild(content);
        row.appendChild(cell);
        row._cellIndex += 1;
        return cell;
    }

    _select(options, value, F) {
        const sel = this.createElement('select', 'modulator-panel__select');
        sel.style.cssText = `
            width:100%; height:100%; padding:0 ${F * 0.5}px;
            border:none;
            background:var(--c-bg); color:var(--c-text);
            font-family:'Atkinson Hyperlegible',monospace;
            font-size:${F * 0.75}px; cursor:pointer;
            box-sizing:border-box;
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

    _makeSliderEl(value, min, max, step, onChange) {
        const slider = new Slider({
            min, max, step, value,
            trackHF: 2,
            borders: { top: false, right: false, bottom: false, left: true },
            onInput:  onChange,
            onChange,
        }, this.deps);
        this.addChild(slider);
        this._sliderComps.push(slider);
        const el = slider.render();
        el.style.flex = '1';
        el.style.minWidth = '0';
        el.style.height = '100%';
        el.style.width = '100%';
        return el;
    }

    _destroySliders() {
        for (const s of this._sliderComps) {
            if (s) this.removeChild(s);
        }
        this._sliderComps = [];
    }

    _textInput(value, F, onChange) {
        const input = this.createElement('input', 'modulator-panel__text-input');
        input.type = 'text';
        input.value = value;
        input.style.cssText = `
            width:100%; height:100%; padding:0 ${F * 0.5}px;
            border:none;
            background:var(--c-bg); color:var(--c-text);
            font-family:'Atkinson Hyperlegible Mono',monospace;
            font-size:${F * 0.75}px;
            box-sizing:border-box;
        `;
        input.addEventListener('change', (e) => onChange(e.target.value));
        return input;
    }

    _emit() {
        this.onChange(this.targetKey, this._clone(this.mod));
    }

    setModulator(modulator) {
        this.mod = this._clone(modulator);
        if (this.element) {
            this._destroySliders();
            this.element.remove();
            this.element = null;
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
        this._destroySliders();
        super.destroy();
    }
}
