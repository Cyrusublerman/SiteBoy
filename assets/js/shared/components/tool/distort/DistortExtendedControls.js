/**
 * Distort plan2403 — shared controls for NodePanel composition (BaseComponent).
 * ComponentLibrary.create('<kebab>', opts, deps).
 */
import { BaseComponent } from '../../../foundation.js';
import { Dropdown } from '../../input/Dropdown.js';
import { ColorInput } from '../../input/ColorInput.js';
class DistortCtrlBase extends BaseComponent {
  _lbl(F, text) {
    const s = this.createElement('span', 'distort-ctrl-lbl', text);
    s.style.cssText = `font-family:'Atkinson Hyperlegible','Atkinson Hyperlegible Mono',monospace;font-size:${F * 0.75}px;color:var(--c-text);text-transform:uppercase;flex-shrink:0;`;
    return s;
  }

  _vstack(F) {
    const el = this.createElement('div', 'distort-ctrl-stack');
    el.style.cssText = `display:flex;flex-direction:column;gap:${F / 2}px;width:100%;box-sizing:border-box;`;
    return el;
  }
}

export class ColourRampControl extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'colour-ramp-control', ...options }, deps);
    this._labels = options.labels ?? {};
    this._state = {
      minColour: options.minColour ?? '#000000',
      maxColour: options.maxColour ?? '#ffffff',
      rampSource: options.rampSource ?? 'NORMALISED_MAGNITUDE',
      rampSpace: options.rampSpace ?? 'RGB',
      clamp: options.clamp !== false,
      rampSourceOptions: options.rampSourceOptions ?? [],
    };
    this._onChange = options.onChange ?? (() => {});
    this._instances = [];
  }

  setState(patch) {
    Object.assign(this._state, patch);
    this._emit();
  }

  getState() { return { ...this._state }; }

  _emit() {
    this._onChange({ ...this._state });
  }

  render() {
    super.render();
    const { F } = this.getF();
    this.element.style.cssText = `display:flex;flex-direction:column;gap:${F / 2}px;width:100%;`;

    const minC = new ColorInput({ label: this._labels.min ?? 'MIN COLOUR', value: this._state.minColour, onChange: v => { this._state.minColour = v; this._emit(); } }, this.deps);
    const maxC = new ColorInput({ label: this._labels.max ?? 'MAX COLOUR', value: this._state.maxColour, onChange: v => { this._state.maxColour = v; this._emit(); } }, this.deps);
    this._instances.push(minC, maxC);
    this.element.appendChild(minC.render());
    this.element.appendChild(maxC.render());

    const srcOpts = (this._state.rampSourceOptions.length ? this._state.rampSourceOptions : [{ value: 'NORMALISED_MAGNITUDE', label: 'NORMALISED MAGNITUDE' }]).map(o =>
      (typeof o === 'object' ? o : { value: o, label: String(o) }));
    const ddSrc = new Dropdown({ options: srcOpts, value: this._state.rampSource, onChange: v => { this._state.rampSource = v; this._emit(); } }, this.deps);
    const row1 = this.createElement('div', 'colour-ramp-src-row');
    row1.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;min-height:${F * 2}px;`;
    row1.appendChild(this._lbl(F, 'RAMP SOURCE'));
    const d1 = ddSrc.render();
    d1.style.flex = '1';
    row1.appendChild(d1);
    this._instances.push(ddSrc);
    this.element.appendChild(row1);

    const ddSp = new Dropdown({ options: [{ value: 'RGB', label: 'RGB' }, { value: 'HSV', label: 'HSV' }], value: this._state.rampSpace, onChange: v => { this._state.rampSpace = v; this._emit(); } }, this.deps);
    const row2 = this.createElement('div', 'colour-ramp-space-row');
    row2.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;min-height:${F * 2}px;`;
    row2.appendChild(this._lbl(F, 'RAMP SPACE'));
    const d2 = ddSp.render();
    d2.style.flex = '1';
    row2.appendChild(d2);
    this._instances.push(ddSp);
    this.element.appendChild(row2);

    const clampRow = this.createElement('div');
    clampRow.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;`;
    clampRow.appendChild(this._lbl(F, 'CLAMP'));
    const clampBtn = this.createElement('button', 'colour-ramp-clamp', this._state.clamp ? 'ON' : 'OFF');
    clampBtn.type = 'button';
    clampBtn.style.cssText = `min-width:${F * 4}px;min-height:${F * 2}px;border:1px solid var(--c-border);background:${this._state.clamp ? 'var(--c-text)' : 'var(--c-bg)'};color:${this._state.clamp ? 'var(--c-bg)' : 'var(--c-text)'};font-family:'Atkinson Hyperlegible',monospace;font-size:${F * 0.75}px;cursor:pointer;text-transform:uppercase;`;
    clampBtn.addEventListener('click', () => {
      this._state.clamp = !this._state.clamp;
      clampBtn.textContent = this._state.clamp ? 'ON' : 'OFF';
      clampBtn.style.background = this._state.clamp ? 'var(--c-text)' : 'var(--c-bg)';
      clampBtn.style.color = this._state.clamp ? 'var(--c-bg)' : 'var(--c-text)';
      this._emit();
    });
    clampRow.appendChild(clampBtn);
    this.element.appendChild(clampRow);

    return this.element;
  }

  destroy() {
    this._instances.forEach(i => i.destroy?.());
    this._instances = [];
    super.destroy();
  }
}

export class CentrePointPicker extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'centre-point-picker', ...options }, deps);
    this._centreX = options.centreX ?? 0.5;
    this._centreY = options.centreY ?? 0.5;
    this._onPickRequest = options.onPickRequest ?? null;
    this._onChange = options.onChange ?? null;
    this._readout = null;
  }

  setCentre(x, y) {
    this._centreX = x;
    this._centreY = y;
    this._onChange?.({ centreX: x, centreY: y });
    this.updateReadout();
  }

  render() {
    super.render();
    const { F } = this.getF();
    this.element.style.cssText = `display:flex;flex-direction:column;gap:${F / 2}px;`;
    this._readout = this._lbl(F, `${Number(this._centreX).toFixed(3)} · ${Number(this._centreY).toFixed(3)}`);
    const btn = this.createElement('button', 'centre-pick-btn', 'PICK CENTRE');
    btn.type = 'button';
    btn.style.cssText = `border:1px solid var(--c-border);background:var(--c-bg);color:var(--c-text);font-family:'Atkinson Hyperlegible',monospace;font-size:${F * 0.75}px;text-transform:uppercase;cursor:pointer;min-height:${F * 2}px;`;
    btn.addEventListener('click', () => this._onPickRequest?.());
    this.element.append(this._readout, btn);
    return this.element;
  }

  updateReadout() {
    const F = this.getF().F;
    if (this._readout) {
      this._readout.textContent = `${Number(this._centreX).toFixed(3)} · ${Number(this._centreY).toFixed(3)}`;
      this._readout.style.fontSize = `${F * 0.75}px`;
    }
  }
}

export class FrameSlider extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'frame-slider', ...options }, deps);
    this._frame = options.frame ?? 0;
    this._frameCount = Math.max(1, options.frameCount ?? 1);
    this._onChange = options.onChange ?? null;
    this._sliderEl = null;
    this._fieldEl = null;
  }

  setFrameCount(n) {
    this._frameCount = Math.max(1, n);
    this._frame = Math.min(this._frame, this._frameCount - 1);
    if (this._sliderEl) {
      this._sliderEl.max = String(this._frameCount - 1);
      this._sliderEl.value = String(this._frame);
    }
    if (this._fieldEl) this._fieldEl.value = String(this._frame);
  }

  getValue() { return this._frame; }

  _applyFrame(raw, emit) {
    const maxF = this._frameCount - 1;
    let n = Math.round(Number(raw));
    if (!Number.isFinite(n)) n = this._frame;
    n = Math.max(0, Math.min(maxF, n));
    this._frame = n;
    if (this._sliderEl) this._sliderEl.value = String(n);
    if (this._fieldEl) this._fieldEl.value = String(n);
    if (emit) this._onChange?.(n);
  }

  render() {
    super.render();
    const { F, F2 } = this.getF();
    this.element.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;min-height:${F * 2}px;`;
    const lab = this._lbl(F, 'FRAME');
    const slider = this.createElement('input', 'frame-slider-range');
    this._sliderEl = slider;
    slider.type = 'range';
    slider.min = '0';
    slider.max = String(this._frameCount - 1);
    slider.step = '1';
    slider.value = String(this._frame);
    slider.style.cssText = `flex:1;accent-color:var(--c-text);`;
    const field = this.createElement('input', 'frame-slider-readout');
    this._fieldEl = field;
    field.type = 'text';
    field.inputMode = 'numeric';
    field.value = String(this._frame);
    field.style.cssText = `
      width:${F * 4}px;
      text-align:right;
      font-family:'Atkinson Hyperlegible','Atkinson Hyperlegible Mono',monospace;
      font-size:${F * 0.75}px;
      color:var(--c-text);
      border:1px solid var(--c-border);
      background:var(--c-bg);
      padding:0 ${F2}px;
      min-height:${F * 2}px;
      box-sizing:border-box;
    `;
    slider.addEventListener('input', () => {
      field.value = slider.value;
    });
    slider.addEventListener('change', () => {
      this._applyFrame(slider.value, true);
    });
    const commitField = () => this._applyFrame(field.value, true);
    field.addEventListener('change', () => {
      commitField();
    });
    field.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitField();
        field.blur();
      }
    });
    field.addEventListener('dblclick', () => {
      this._applyFrame(0, true);
    });
    this.element.append(lab, slider, field);
    return this.element;
  }
}

export class SVGExportButton extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'svg-export-button', ...options }, deps);
    this._onExport = options.onExport ?? null;
  }

  render() {
    super.render();
    const { F } = this.getF();
    const btn = this.createElement('button', 'svg-export-btn', 'EXPORT SVG');
    btn.type = 'button';
    btn.style.cssText = `width:100%;min-height:${F * 2}px;border:1px solid var(--c-border);background:var(--c-bg);color:var(--c-text);font-family:'Atkinson Hyperlegible',monospace;font-size:${F * 0.75}px;text-transform:uppercase;cursor:pointer;`;
    btn.addEventListener('click', () => this._onExport?.());
    this.element.appendChild(btn);
    return this.element;
  }
}

export class NoiseSourceControl extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'noise-source-control', ...options }, deps);
    this._noiseType = options.noiseType ?? 'perlin';
    this._seed = options.seed ?? 0;
    this._scale = options.scale ?? 1;
    this._octaves = options.octaves ?? 4;
    this._noiseTypes = options.noiseTypes ?? ['perlin', 'simplex', 'value', 'worley'];
    this._onChange = options.onChange ?? null;
    this._dd = null;
  }

  getState() {
    return { noiseType: this._noiseType, seed: this._seed, scale: this._scale, octaves: this._octaves };
  }

  _emitAll() {
    this._onChange?.(this.getState());
  }

  _numRow(F, label, val, min, max, step, cb) {
    const row = this.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;`;
    row.appendChild(this._lbl(F, label));
    const s = this.createElement('input');
    s.type = 'range';
    s.min = String(min); s.max = String(max); s.step = String(step); s.value = String(val);
    s.style.flex = '1';
    s.style.accentColor = 'var(--c-text)';
    s.addEventListener('change', () => cb(Number(s.value)));
    row.appendChild(s);
    return row;
  }

  render() {
    super.render();
    const { F } = this.getF();
    const outer = this._vstack(F);
    this.element.appendChild(outer);
    const types = this._noiseTypes.map(t => ({ value: t, label: t.toUpperCase() }));
    this._dd = new Dropdown({ options: types, value: this._noiseType, onChange: v => { this._noiseType = v; this._emitAll(); } }, this.deps);
    const r0 = this.createElement('div');
    r0.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;`;
    r0.appendChild(this._lbl(F, 'NOISE'));
    const el0 = this._dd.render();
    el0.style.flex = '1';
    r0.appendChild(el0);
    outer.appendChild(r0);
    outer.appendChild(this._numRow(F, 'SEED', this._seed, 0, 99999, 1, v => { this._seed = v; this._emitAll(); }));
    outer.appendChild(this._numRow(F, 'SCALE', this._scale, 0.1, 20, 0.1, v => { this._scale = v; this._emitAll(); }));
    outer.appendChild(this._numRow(F, 'OCTAVES', this._octaves, 1, 8, 1, v => { this._octaves = v; this._emitAll(); }));
    return this.element;
  }

  destroy() {
    this._dd?.destroy?.();
    this._dd = null;
    super.destroy();
  }
}

export class InputDomainSelector extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'input-domain-selector', ...options }, deps);
    this._value = options.value ?? 'RGB';
    this._options = options.options ?? [{ value: 'RGB', label: 'RGB' }, { value: 'LUM', label: 'LUM' }];
    this._onChange = options.onChange ?? null;
    this._dd = null;
  }

  render() {
    super.render();
    const { F } = this.getF();
    this._dd = new Dropdown({ options: this._options, value: this._value, onChange: v => { this._value = v; this._onChange?.(v); } }, this.deps);
    const row = this.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;min-height:${F * 2}px;`;
    row.appendChild(this._lbl(F, 'INPUT DOMAIN'));
    const d = this._dd.render();
    d.style.flex = '1';
    row.appendChild(d);
    this.element.appendChild(row);
    return this.element;
  }

  destroy() {
    this._dd?.destroy?.();
    super.destroy();
  }
}

export class OutputModeSelector extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'output-mode-selector', ...options }, deps);
    this._value = options.value ?? 'IMAGE';
    this._options = options.options ?? ['IMAGE', 'MASK', 'FIELD', 'HYBRID'].map(v => ({ value: v, label: v }));
    this._onChange = options.onChange ?? null;
    this._dd = null;
  }

  render() {
    super.render();
    const { F } = this.getF();
    this._dd = new Dropdown({ options: this._options, value: this._value, onChange: v => { this._value = v; this._onChange?.(v); } }, this.deps);
    const row = this.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;min-height:${F * 2}px;`;
    row.appendChild(this._lbl(F, 'OUTPUT'));
    const d = this._dd.render();
    d.style.flex = '1';
    row.appendChild(d);
    this.element.appendChild(row);
    return this.element;
  }

  destroy() {
    this._dd?.destroy?.();
    super.destroy();
  }
}

export class MaskControls extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'mask-controls', ...options }, deps);
    this._strength = options.strength ?? 1;
    this._onChange = options.onChange ?? null;
  }

  render() {
    super.render();
    const { F } = this.getF();
    const row = this.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;`;
    row.appendChild(this._lbl(F, 'MASK MIX'));
    const s = this.createElement('input');
    s.type = 'range';
    s.min = '0'; s.max = '1'; s.step = '0.01'; s.value = String(this._strength);
    s.style.flex = '1';
    s.style.accentColor = 'var(--c-text)';
    s.addEventListener('change', () => { this._strength = Number(s.value); this._onChange?.({ strength: this._strength }); });
    row.appendChild(s);
    this.element.appendChild(row);
    return this.element;
  }
}

export class DriverMappingPanel extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'driver-mapping-panel', ...options }, deps);
    this._mode = options.mode ?? 'fixed';
    this._onChange = options.onChange ?? null;
    this._dd = null;
  }

  render() {
    super.render();
    const { F } = this.getF();
    this._dd = new Dropdown({
      options: [{ value: 'fixed', label: 'FIXED' }, { value: 'image', label: 'IMAGE' }, { value: 'field', label: 'FIELD' }],
      value: this._mode,
      onChange: v => { this._mode = v; this._onChange?.({ mode: v }); },
    }, this.deps);
    const row = this.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;min-height:${F * 2}px;`;
    row.appendChild(this._lbl(F, 'MAP SOURCE'));
    const d = this._dd.render();
    d.style.flex = '1';
    row.appendChild(d);
    this.element.appendChild(row);
    return this.element;
  }

  destroy() {
    this._dd?.destroy?.();
    super.destroy();
  }
}

export class TemporalModeControl extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'temporal-mode-control', ...options }, deps);
    this._mode = options.mode ?? 'STATIC';
    this._onChange = options.onChange ?? null;
    this._dd = null;
  }

  render() {
    super.render();
    const { F } = this.getF();
    this._dd = new Dropdown({
      options: [{ value: 'STATIC', label: 'STATIC' }, { value: 'DRIFT', label: 'DRIFT' }, { value: 'BAKED', label: 'BAKED' }],
      value: this._mode,
      onChange: v => { this._mode = v; this._onChange?.(v); },
    }, this.deps);
    const row = this.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;min-height:${F * 2}px;`;
    row.appendChild(this._lbl(F, 'TIME MODE'));
    const d = this._dd.render();
    d.style.flex = '1';
    row.appendChild(d);
    this.element.appendChild(row);
    return this.element;
  }

  destroy() {
    this._dd?.destroy?.();
    super.destroy();
  }
}

export class DiagnosticPreviewToggle extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'diagnostic-preview-toggle', ...options }, deps);
    this._showResidual = !!options.showResidual;
    this._showField = !!options.showField;
    this._onChange = options.onChange ?? null;
  }

  _toggleRow(F, label, init, onToggle) {
    const row = this.createElement('div');
    row.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;`;
    row.appendChild(this._lbl(F, label));
    const btn = this.createElement('button', '', init ? 'ON' : 'OFF');
    btn.type = 'button';
    let on = init;
    const paint = () => {
      btn.textContent = on ? 'ON' : 'OFF';
      btn.style.background = on ? 'var(--c-text)' : 'var(--c-bg)';
      btn.style.color = on ? 'var(--c-bg)' : 'var(--c-text)';
    };
    btn.style.cssText = `min-width:${F * 4}px;min-height:${F * 2}px;border:1px solid var(--c-border);background:var(--c-bg);color:var(--c-text);font-size:${F * 0.75}px;cursor:pointer;text-transform:uppercase;`;
    paint();
    btn.addEventListener('click', () => { on = !on; paint(); onToggle(on); });
    row.appendChild(btn);
    return row;
  }

  render() {
    super.render();
    const { F } = this.getF();
    this.element.appendChild(this._toggleRow(F, 'RESIDUAL', this._showResidual, v => {
      this._showResidual = v;
      this._onChange?.({ showResidual: this._showResidual, showField: this._showField });
    }));
    this.element.appendChild(this._toggleRow(F, 'FIELD', this._showField, v => {
      this._showField = v;
      this._onChange?.({ showResidual: this._showResidual, showField: this._showField });
    }));
    return this.element;
  }
}

export class LuminanceCurveEditor extends DistortCtrlBase {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'luminance-curve-editor', ...options }, deps);
    this._shadow = options.shadow ?? 0;
    this._midtone = options.midtone ?? 0.5;
    this._highlight = options.highlight ?? 1;
    this._onChange = options.onChange ?? null;
  }

  render() {
    super.render();
    const { F } = this.getF();
    const outer = this._vstack(F);
    this.element.appendChild(outer);
    const mk = (lab, v, cb) => {
      const row = this.createElement('div');
      row.style.cssText = `display:flex;align-items:center;gap:${F / 2}px;`;
      row.appendChild(this._lbl(F, lab));
      const s = this.createElement('input');
      s.type = 'range'; s.min = '0'; s.max = '1'; s.step = '0.01'; s.value = String(v);
      s.style.flex = '1'; s.style.accentColor = 'var(--c-text)';
      s.addEventListener('change', () => cb(Number(s.value)));
      row.appendChild(s);
      return row;
    };
    outer.appendChild(mk('SHADOW', this._shadow, x => { this._shadow = x; this._bump(); }));
    outer.appendChild(mk('MID', this._midtone, x => { this._midtone = x; this._bump(); }));
    outer.appendChild(mk('HIGH', this._highlight, x => { this._highlight = x; this._bump(); }));
    return this.element;
  }

  _bump() {
    this._onChange?.({ shadow: this._shadow, midtone: this._midtone, highlight: this._highlight });
  }
}
