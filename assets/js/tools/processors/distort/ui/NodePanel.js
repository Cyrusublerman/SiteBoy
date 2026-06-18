import { BaseComponent } from '../../../../shared/foundation.js';
import { DriverPicker } from './DriverPicker.js';
import { Dropdown } from '../../../../shared/components/input/Dropdown.js';
import { DrawMaskOverlay } from '../../../../shared/components/drawing/DrawMaskOverlay.js';

const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'add', 'difference', 'darken', 'lighten', 'softlight', 'hardlight', 'colordodge', 'colorburn'];
const MASK_MODES = ['none', 'upload', 'luminance', 'gradient', 'draw'];

export class NodePanel extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'node-panel', ...options }, deps);
    this._node = options.node;
    this._nodeIdx = options.nodeIdx ?? 0;
    this._onChange = options.onChange ?? null;
    this._onRemove = options.onRemove ?? null;
    this._onSelect = options.onSelect ?? null;
    this._onSolo = options.onSolo ?? null;
    this._expanded = options.expanded ?? false;
    this._isSolo = options.isSolo ?? false;

    this._canvasAreaEl = options.canvasAreaEl ?? null;
    this._getSourceDims = options.getSourceDims ?? null;
    this._getSourcePixels = options.getSourcePixels ?? null;
    this._getRenderContext = options.getRenderContext ?? null;
    this._onRequestPick = options.onRequestPick ?? null;

    this._body = null;
    this._headerEl = null;
    this._nameEl = null;
    this._enableBtn = null;
    this._soloBtn = null;
    this._openDriverKey = null;
    this._driverPickers = {};
    this._dropdowns = [];
    this._maskExpanded = false;
    this._drawOverlay = null;
    this._extendedControlInstances = [];
  }

  /** G14: when: single clause | array of clauses (AND); each { param, equals|in|notEquals } */
  _paramDefVisible(def) {
    const w = def?.when;
    if (!w) return true;
    const clauses = Array.isArray(w) ? w : [w];
    return clauses.every(c => this._paramClauseVisible(c));
  }

  _paramClauseVisible(clause) {
    if (!clause?.param) return true;
    const pv = this._node.params[clause.param];
    if (Object.prototype.hasOwnProperty.call(clause, 'equals')) return pv === clause.equals;
    if (Object.prototype.hasOwnProperty.call(clause, 'notEquals')) return pv !== clause.notEquals;
    if (Array.isArray(clause.in)) return clause.in.includes(pv);
    return true;
  }

  _paramWhenDependsOn(when, depKey) {
    if (!when) return false;
    const clauses = Array.isArray(when) ? when : [when];
    return clauses.some(c => c?.param === depKey);
  }

  _paramDefsDependOn(depKey) {
    const defs = this._node.getParamDefs ? this._node.getParamDefs() : {};
    return Object.values(defs).some(d => this._paramWhenDependsOn(d?.when, depKey));
  }

  render() {
    super.render();
    this.element.style.cssText = `
      border-bottom: 1px solid var(--c-border);
      user-select: none;
    `;

    this.element.appendChild(this._buildHeader());
    this._body = this.createElement('div', 'distort-node-body');
    this._body.style.cssText = `
      display: ${this._expanded ? 'flex' : 'none'};
      flex-direction: column;
      border-top: 1px solid var(--c-border);
      background: var(--c-bg);
    `;
    this.element.appendChild(this._body);
    this._rebuildBody();
    this._syncHeaderState();
    return this.element;
  }

  _buildHeader() {
    const { F } = this.getF();
    const header = this.createElement('div', 'distort-node-header');
    header.style.cssText = `
      display: flex;
      align-items: center;
      height: ${F * 2}px;
      background: var(--c-bg);
      cursor: pointer;
      box-sizing: border-box;
    `;
    this._headerEl = header;

    const drag = this._buildHeaderCell('⠿', 'var(--c-border)');
    drag.style.cursor = 'grab';
    drag.draggable = true;
    drag.addEventListener('dragstart', event => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(this._nodeIdx));
    });

    this._enableBtn = this._buildHeaderCell('', 'var(--c-text)');
    this._enableBtn.addEventListener('click', event => {
      event.stopPropagation();
      this._node.enabled = this._node.enabled === false;
      this._syncHeaderState();
      this._emit();
    });

    this._nameEl = this.createElement('span', 'distort-node-name', (this._node.displayName || this._node.type || '').toUpperCase());
    this._nameEl.style.cssText = `
      flex: 1;
      padding: 0 ${F / 2}px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
    `;

    this._soloBtn = this._buildHeaderCell('S', 'var(--c-border)');
    this._soloBtn.addEventListener('click', event => {
      event.stopPropagation();
      this._onSolo?.({ nodeIdx: this._nodeIdx });
    });

    const removeBtn = this._buildHeaderCell('×', 'var(--c-border)');
    removeBtn.style.borderRight = 'none';  // last cell — shares container right edge per §4
    removeBtn.addEventListener('click', event => {
      event.stopPropagation();
      this._onRemove?.({ nodeIdx: this._nodeIdx });
    });

    header.append(drag, this._enableBtn, this._nameEl, this._soloBtn, removeBtn);

    header.addEventListener('click', () => this._onSelect?.({ nodeIdx: this._nodeIdx }));
    header.addEventListener('dragover', event => {
      event.preventDefault();
      const F = this.getF().F;
      header.style.borderTop = `${Math.max(1, Math.round(F / 7))}px solid var(--c-text)`;
    });
    header.addEventListener('dragleave', () => {
      header.style.borderTop = '';
    });
    header.addEventListener('drop', event => {
      event.preventDefault();
      header.style.borderTop = '';
      const fromIdx = Number.parseInt(event.dataTransfer.getData('text/plain'), 10);
      if (!Number.isNaN(fromIdx) && fromIdx !== this._nodeIdx) {
        this._onChange?.({ nodeIdx: this._nodeIdx, dragFrom: fromIdx, dragTo: this._nodeIdx });
      }
    });

    return header;
  }

  _buildHeaderCell(text, color) {
    const { F } = this.getF();
    const cell = this.createElement('button', 'distort-node-header-cell', text);
    cell.type = 'button';
    cell.style.cssText = `
      width: ${F * 2}px;
      height: ${F * 2}px;
      border: none;
      border-right: 1px solid var(--c-border);
      background: var(--c-bg);
      color: ${color};
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      box-sizing: border-box;
      flex-shrink: 0;
      cursor: pointer;
    `;
    return cell;
  }

  _syncHeaderState() {
    const enabled = this._node.enabled !== false;
    if (this._enableBtn) this._enableBtn.textContent = enabled ? '✓' : '○';
    if (this._nameEl) this._nameEl.style.color = enabled ? 'var(--c-text)' : 'var(--c-border)';
    if (this._nameEl) this._nameEl.style.opacity = enabled ? '1' : '0.55';
    if (this._soloBtn) {
      this._soloBtn.style.background = this._isSolo ? 'var(--c-text)' : 'var(--c-bg)';
      this._soloBtn.style.color = this._isSolo ? 'var(--c-bg)' : 'var(--c-border)';
    }
    if (this._body) {
      this._body.style.display = this._expanded ? 'flex' : 'none';
    }
  }

  _rebuildBody() {
    if (!this._body) return;
    this._extendedControlInstances.forEach(inst => inst.destroy?.());
    this._extendedControlInstances = [];
    while (this._body.firstChild) this._body.removeChild(this._body.firstChild);
    this._closeDriverPicker();
    this._dropdowns.forEach(dd => dd.destroy?.());
    this._dropdowns = [];

    this._buildMaskBlock();

    this._buildRangeRow({
      key: '__opacity__',
      label: 'OPACITY',
      value: this._node.opacity ?? 1,
      min: 0,
      max: 1,
      step: 0.01,
      unit: '0–1',
      defaultValue: 1,
      driveable: true,
      onChange: value => {
        this._node.opacity = value;
        this._emit();
      }
    });

    this._buildSelectRow({
      label: 'BLEND MODE',
      value: this._node.blendMode ?? 'normal',
      options: BLEND_MODES,
      onChange: value => {
        this._node.blendMode = value;
        this._emit();
      }
    });

    const paramDefs = this._node.getParamDefs ? this._node.getParamDefs() : {};
    const byTier = {};
    for (const [key, def] of Object.entries(paramDefs)) {
      if (def.type === 'internal') continue;
      if (key === '__opacity__') continue;
      const tier = def.tier ?? 3;
      if (!byTier[tier]) byTier[tier] = [];
      byTier[tier].push([key, def]);
    }

    for (const tier of [3, 4, 5]) {
      if (!byTier[tier]?.length) continue;
      this._appendDivider();
      for (const [key, def] of byTier[tier]) {
        if (!this._paramDefVisible(def)) continue;
        this._buildParamRow(key, def);
      }
    }

    const extCtrls = this._node.constructor?.extendedControls ?? [];
    for (const ctrl of extCtrls) {
      this._buildExtendedControl(ctrl);
    }

    const defs = this._node.getParamDefs ? this._node.getParamDefs() : {};
    if (this._node.constructor?.hasVectorExport) {
      this._buildVectorExportRow();
    }
    if (defs.centreX && defs.centreY && this._onRequestPick && this._paramDefVisible(defs.centreX) && this._paramDefVisible(defs.centreY)) {
      this._buildPickCentreRow();
    }
  }

  _applyExtendedPatch(patch, paramKeys) {
    if (patch == null || !paramKeys) return;
    if (typeof patch === 'string' || typeof patch === 'number' || typeof patch === 'boolean') {
      if (paramKeys.value) this._node.params[paramKeys.value] = patch;
      else if (paramKeys.mode) this._node.params[paramKeys.mode] = patch;
      else {
        const entries = Object.entries(paramKeys);
        if (entries.length === 1) this._node.params[entries[0][1]] = patch;
      }
      this._emit();
      return;
    }
    if (typeof patch === 'object') {
      for (const [sk, pk] of Object.entries(paramKeys)) {
        if (Object.prototype.hasOwnProperty.call(patch, sk)) {
          this._node.params[pk] = patch[sk];
        }
      }
    }
    this._emit();
  }

  _paramDefsDependOnAnyExtended(paramKeys) {
    const keys = new Set(Object.values(paramKeys));
    for (const k of keys) {
      if (this._paramDefsDependOn(k)) return true;
    }
    return false;
  }

  _buildExtendedControl(ctrl) {
    const CL = this.deps.ComponentLibrary;
    if (!ctrl?.type || !CL?.create) return;
    if (ctrl.when && !this._paramDefVisible({ when: ctrl.when })) return;
    const paramKeys = ctrl.paramKeys ?? {};
    const mergedOpts = { ...(ctrl.options ?? {}) };
    for (const [stateKey, paramKey] of Object.entries(paramKeys)) {
      const v = this._node.params[paramKey];
      if (v !== undefined && v !== null) mergedOpts[stateKey] = v;
    }
    const inst = CL.create(ctrl.type, {
      ...mergedOpts,
      onChange: patch => {
        this._applyExtendedPatch(patch, paramKeys);
        if (this._paramDefsDependOnAnyExtended(paramKeys)) this._rebuildBody();
      }
    }, this.deps);
    const el = inst.render();
    el.style.borderTop = '1px solid var(--c-border)';
    el.style.boxSizing = 'border-box';
    this._body.appendChild(el);
    this._extendedControlInstances.push(inst);
  }

  _buildParamRow(key, def) {
    if (def.type === 'select') {
      this._buildSelectRow({
        label: (def.label || key).toUpperCase(),
        value: String(this._node.params[key]),
        options: (def.options || []).map(option => String(option)),
        onChange: value => {
          this._node.params[key] = value;
          this._emit();
          if (this._paramDefsDependOn(key)) this._rebuildBody();
        }
      });
      return;
    }

    if (def.type === 'toggle') {
      this._buildToggleRow({
        label: (def.label || key).toUpperCase(),
        value: !!this._node.params[key],
        onChange: value => {
          this._node.params[key] = value;
          this._emit();
        }
      });
      return;
    }

    this._buildRangeRow({
      key,
      label: (def.label || key).toUpperCase(),
      value: this._node.params[key],
      min: def.min ?? 0,
      max: def.max ?? 1,
      step: def.step ?? 0.01,
      unit: def.unit ?? '',
      defaultValue: def.value,
      driveable: def.driveable !== false,
      onChange: value => {
        this._node.params[key] = value;
        this._emit();
      }
    });
  }

  _buildRangeRow(config) {
    const { F } = this.getF();
    const wrap = this.createElement('div', 'distort-param-wrap');
    wrap.style.cssText = 'display:flex; flex-direction:column;';

    const row = this.createElement('div', 'distort-param-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      gap: ${F / 2}px;
      min-height: ${F * 2}px;
      padding-top: 0;
      padding-bottom: 0;
      padding-left: ${F}px;
      padding-right: ${config.driveable ? '0' : F + 'px'};
      border-top: ${config.noBorderTop ? 'none' : '1px solid var(--c-border)'};
      box-sizing: border-box;
    `;

    const label = this._rowLabel(config.label);
    const slider = this.createElement('input', 'distort-param-slider');
    slider.type = 'range';
    slider.min = String(config.min);
    slider.max = String(config.max);
    slider.step = String(config.step);
    slider.value = String(config.value ?? config.min);
    slider.style.cssText = `
      flex: 1;
      margin: 0;
      accent-color: var(--c-text);
      cursor: pointer;
      opacity: 1;
    `;

    const precision = this._precisionFor(config.step);
    const unitSuffix = config.unit ? String(config.unit) : '';
    const valueEl = this.createElement('input', 'distort-param-value');
    valueEl.type = 'text';
    valueEl.inputMode = 'decimal';
    valueEl.autocomplete = 'off';
    valueEl.spellcheck = false;
    const defNum = config.defaultValue !== undefined ? Number(config.defaultValue) : Number(config.min ?? 0);
    const writeReadout = num => {
      const core = this._formatValue(num, precision);
      valueEl.value = unitSuffix ? `${core} ${unitSuffix}` : core;
    };
    writeReadout(Number(config.value ?? config.min));
    const parseReadout = () => {
      const raw = (valueEl.value || '').trim().split(/\s+/)[0] ?? '';
      let n = Number.parseFloat(raw);
      if (!Number.isFinite(n)) n = Number(slider.value);
      const lo = Number(config.min);
      const hi = Number(config.max);
      n = Math.max(lo, Math.min(hi, n));
      return n;
    };
    const applyNumeric = (commit = false) => {
      const n = parseReadout();
      slider.value = String(n);
      writeReadout(n);
      if (commit) config.onChange(n);
    };
    valueEl.style.cssText = `
      width: ${F * 5.5}px;
      min-width: 0;
      text-align: right;
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      color: var(--c-text);
      flex-shrink: 0;
      border: none;
      border-left: 1px solid var(--c-border);
      border-right: none;
      background: var(--c-bg);
      padding: 0 ${F / 4}px;
      box-sizing: border-box;
      height: ${F * 2}px;
    `;
    valueEl.title = unitSuffix ? `UNIT: ${unitSuffix}` : '';
    slider.addEventListener('input', () => writeReadout(Number(slider.value)));
    slider.addEventListener('change', () => config.onChange(Number(slider.value)));
    valueEl.addEventListener('focus', () => {
      valueEl.value = String(parseReadout());
      valueEl.select?.();
    });
    valueEl.addEventListener('blur', () => applyNumeric(true));
    valueEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); valueEl.blur(); }
    });
    valueEl.addEventListener('dblclick', e => {
      e.preventDefault();
      if (!Number.isFinite(defNum)) return;
      slider.value = String(defNum);
      writeReadout(defNum);
      config.onChange(defNum);
    });

    row.append(label, slider, valueEl);

    // Always reserve F*2 on the right so all sliders are the same width
    if (config.driveable) {
      const driverBtn = this.createElement('button', 'distort-driver-button', '+D');
      driverBtn.type = 'button';
      driverBtn.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${F * 2}px;
        border-top: none;
        border-bottom: none;
        border-left: 1px solid var(--c-border);
        border-right: none;
        background: var(--c-bg);
        color: var(--c-text);
        font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
        font-size: ${F * 0.75}px;
        text-transform: uppercase;
        box-sizing: border-box;
        cursor: pointer;
        flex-shrink: 0;
        align-self: stretch;
      `;
      const syncDriverState = () => {
        const driver = this._node.modulation?.[config.key];
        const active = !!driver && driver.mode && driver.mode !== 'none';
        slider.disabled = active;
        valueEl.disabled = active;
        slider.style.opacity = active ? '0.35' : '1';
        valueEl.style.opacity = active ? '0.35' : '1';
        driverBtn.style.background = active ? 'var(--c-accent)' : 'var(--c-bg)';
        driverBtn.style.color = active ? 'var(--c-bg)' : 'var(--c-text)';
      };
      driverBtn.addEventListener('mouseenter', () => {
        const driver = this._node.modulation?.[config.key];
        const active = !!driver && driver.mode && driver.mode !== 'none';
        if (!active) { driverBtn.style.background = 'var(--c-text)'; driverBtn.style.color = 'var(--c-bg)'; }
      });
      driverBtn.addEventListener('mouseleave', syncDriverState);
      driverBtn.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();
        this._toggleDriverPicker(config.key, config.label, wrap, driverBtn, slider, syncDriverState);
      });
      row.appendChild(driverBtn);
      syncDriverState();
    } else {
      // Blank spacer matches F*2 +D slot — keeps non-driveable slider widths equal
      const spacer = this.createElement('div', 'distort-driver-spacer');
      spacer.style.cssText = `width: ${F * 2}px; flex-shrink: 0;`;
      row.appendChild(spacer);
    }

    wrap.appendChild(row);
    this._body.appendChild(wrap);
  }

  _buildSelectRow(config) {
    const { F } = this.getF();
    const row = this.createElement('div', 'distort-select-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      gap: ${F / 2}px;
      min-height: ${F * 2}px;
      padding-top: 0;
      padding-bottom: 0;
      padding-left: ${F}px;
      padding-right: 0;
      border-top: ${config.noBorderTop ? 'none' : '1px solid var(--c-border)'};
      box-sizing: border-box;
    `;

    const label = this._rowLabel(config.label);
    const dropdown = new Dropdown({
      options: config.options.map(v => ({ value: String(v), label: String(v).toUpperCase() })),
      value: String(config.value),
      onChange: value => config.onChange(value),
    }, this.deps);
    const dropdownEl = dropdown.render();
    dropdownEl.style.flex = '1';
    // Inline trigger: no top/bottom border (row border-top is the separator);
    // left/right borders retained to show the control boundary.
    if (dropdown.triggerEl) {
      dropdown.triggerEl.style.borderTop = 'none';
      dropdown.triggerEl.style.borderBottom = 'none';
    }
    // Spacer = F*4 value readout + F*2 driver button slot — matches range row right section exactly
    const spacer = this.createElement('div', 'distort-select-spacer');
    spacer.style.cssText = `width: ${F * 6}px; flex-shrink: 0;`;
    this._dropdowns.push(dropdown);
    row.append(label, dropdownEl, spacer);
    this._body.appendChild(row);
  }

  _buildToggleRow(config) {
    const { F } = this.getF();
    const row = this.createElement('div', 'distort-toggle-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      gap: ${F / 2}px;
      min-height: ${F * 2}px;
      padding: 0 ${F}px;
      border-top: 1px solid var(--c-border);
      box-sizing: border-box;
    `;

    const label = this._rowLabel(config.label);
    const button = this.createElement('button', 'distort-toggle-button', config.value ? 'ON' : 'OFF');
    button.type = 'button';
    button.style.cssText = `
      width: ${F * 4}px;
      height: ${F * 2}px;
      border-top: none;
      border-bottom: none;
      border-left: 1px solid var(--c-border);
      border-right: 1px solid var(--c-border);
      background: ${config.value ? 'var(--c-text)' : 'var(--c-bg)'};
      color: ${config.value ? 'var(--c-bg)' : 'var(--c-text)'};
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
    `;
    button.addEventListener('click', () => {
      const next = button.textContent !== 'ON';
      button.textContent = next ? 'ON' : 'OFF';
      button.style.background = next ? 'var(--c-text)' : 'var(--c-bg)';
      button.style.color = next ? 'var(--c-bg)' : 'var(--c-text)';
      config.onChange(next);
    });
    row.append(label, button);
    this._body.appendChild(row);
  }

  _buildMaskBlock() {
    const { F } = this.getF();
    if (!this._node.mask) {
      this._node.mask = { enabled: false, source: 'none', invert: false, feather: 0, data: null, _drawPixels: null, _drawW: 0, _drawH: 0 };
    }
    // Ensure draw fields exist on older mask objects
    if (!('_drawPixels' in this._node.mask)) {
      this._node.mask._drawPixels = null;
      this._node.mask._drawW = 0;
      this._node.mask._drawH = 0;
    }

    const header = this.createElement('button', 'distort-mask-header');
    header.type = 'button';
    header.textContent = `${this._maskExpanded ? '▾' : '▸'} MASK`;
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      height: ${F * 2}px;
      padding: 0 ${F}px;
      border: none;
      background: var(--c-bg);
      color: var(--c-border);
      text-align: left;
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
    `;
    if (this._maskExpanded) {
      header.style.borderBottom = '1px solid var(--c-border)';
    }
    header.addEventListener('click', () => {
      this._maskExpanded = !this._maskExpanded;
      this._rebuildBody();
    });
    this._body.appendChild(header);

    if (!this._maskExpanded) return;

    this._buildSelectRow({
      label: 'SOURCE',
      noBorderTop: true,
      value: this._node.mask.source ?? 'none',
      options: MASK_MODES,
      onChange: value => {
        const prev = this._node.mask.source;
        this._node.mask.source = value;
        this._node.mask.enabled = value !== 'none';
        if (value !== 'upload') {
          this._node.mask._sourcePixels = null;
          this._node.mask._sourceW = 0;
          this._node.mask._sourceH = 0;
        }
        if (prev === 'draw' && value !== 'draw') {
          this._node.mask._drawPixels = null;
          this._node.mask._drawW = 0;
          this._node.mask._drawH = 0;
        }
        this._emit();
        this._rebuildBody();
      }
    });

    if (this._node.mask.source === 'upload') {
      this._buildFileRow('UPLOAD', this._node.mask._fileName || 'NO MASK', file => this._loadMaskFile(file));
    }

    if (this._node.mask.source === 'draw') {
      this._buildDrawMaskRow();
    }

    if ((this._node.mask.source ?? 'none') !== 'none') {
      this._buildToggleRow({
        label: 'INVERT',
        value: !!this._node.mask.invert,
        onChange: value => {
          this._node.mask.invert = value;
          this._emit();
        }
      });

      this._buildRangeRow({
        key: '__mask_feather__',
        label: 'FEATHER',
        value: this._node.mask.feather ?? 0,
        min: 0,
        max: 20,
        step: 1,
        unit: 'px',
        defaultValue: 0,
        driveable: false,
        onChange: value => {
          this._node.mask.feather = value;
          this._emit();
        }
      });
    }
  }

  _buildDrawMaskRow() {
    const { F } = this.getF();
    const row = this.createElement('div', 'distort-draw-mask-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      height: ${F * 2}px;
      padding: 0 ${F}px;
      border-top: 1px solid var(--c-border);
      box-sizing: border-box;
    `;

    const dims = this._getSourceDims?.() ?? { w: 0, h: 0 };
    const hasSource = !!(dims.w && dims.h);
    const hasDrawn  = !!this._node.mask._drawPixels;

    const btn = this.createElement('button', 'distort-draw-mask-btn');
    btn.type = 'button';
    btn.textContent = hasDrawn ? 'EDIT MASK …' : 'EDIT MASK +';
    btn.disabled = !hasSource;
    btn.style.cssText = `
      flex: 1;
      height: ${F * 2}px;
      border: none;
      background: var(--c-bg);
      color: ${hasSource ? 'var(--c-text)' : 'var(--c-border)'};
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      text-align: left;
      cursor: ${hasSource ? 'pointer' : 'default'};
      padding: 0;
      box-sizing: border-box;
    `;

    if (hasSource) {
      btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--c-text)'; btn.style.color = 'var(--c-bg)'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = 'var(--c-bg)'; btn.style.color = 'var(--c-text)'; });
      btn.addEventListener('click', () => this._openDrawOverlay());
    }

    row.appendChild(btn);
    this._body.appendChild(row);
  }

  _openDrawOverlay() {
    if (!this._canvasAreaEl) return;
    this._drawOverlay?.destroy();

    const dims = this._getSourceDims?.() ?? { w: 0, h: 0 };
    const sw = dims.w || this._node.mask._drawW || 512;
    const sh = dims.h || this._node.mask._drawH || 512;

    this._drawOverlay = new DrawMaskOverlay({
      mountEl: this._canvasAreaEl,
      sourceW: sw,
      sourceH: sh,
      onDone: (pixels, w, h) => {
        this._node.mask._drawPixels = pixels;
        this._node.mask._drawW = w;
        this._node.mask._drawH = h;
        this._drawOverlay = null;
        this._emit();
        this._rebuildBody();
      },
      onCancel: () => {
        this._drawOverlay = null;
      }
    }, this.deps);

    this._drawOverlay.render();
  }

  _buildFileRow(labelText, fileName, onSelectFile) {
    const { F } = this.getF();
    const row = this.createElement('div', 'distort-file-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      gap: ${F / 2}px;
      min-height: ${F * 2}px;
      padding: 0 ${F}px;
      border-top: 1px solid var(--c-border);
      box-sizing: border-box;
    `;

    const label = this._rowLabel(labelText);
    const button = this.createElement('button', 'distort-file-button', 'CHOOSE');
    button.type = 'button';
    button.style.cssText = `
      width: ${F * 4}px;
      height: ${F * 2}px;
      border-top: none;
      border-bottom: none;
      border-left: 1px solid var(--c-border);
      border-right: 1px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
      flex-shrink: 0;
    `;

    const name = this.createElement('span', 'distort-file-name', fileName.toUpperCase());
    name.style.cssText = `
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      color: var(--c-border);
      padding: 0 ${F / 2}px;
    `;

    const input = this.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.addEventListener('change', () => onSelectFile(input.files?.[0] ?? null));
    button.addEventListener('click', () => input.click());

    row.append(label, button, name, input);
    this._body.appendChild(row);
  }

  _toggleDriverPicker(key, label, wrap, button, slider, syncDriverState) {
    if (this._openDriverKey && this._openDriverKey !== key) {
      this._closeDriverPicker();
    }
    if (this._openDriverKey === key) {
      this._closeDriverPicker();
      syncDriverState();
      return;
    }

    if (!this._node.modulation) this._node.modulation = {};
    this._openDriverKey = key;
    const picker = new DriverPicker({
      paramKey: key,
      label,
      driver: this._node.modulation[key] ?? { mode: 'none', expr: '' },
      onClose: () => {
        this._closeDriverPicker();
        syncDriverState();
      },
      onDriverChange: driver => {
        if (driver.mode === 'none') {
          delete this._node.modulation[key];
        } else {
          this._node.modulation[key] = driver;
        }
        syncDriverState();
        this._emit();
      }
    }, this.deps);
    wrap.appendChild(picker.render());
    this._driverPickers[key] = picker;
    syncDriverState();
    window.debugLog?.('TOOLS', 'DriverPicker opened for', key);
    setTimeout(() => {
      try { picker.element?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }); } catch (_) { /* ignore */ }
    }, 0);
  }

  _closeDriverPicker() {
    const key = this._openDriverKey;
    if (!key) return;
    const picker = this._driverPickers[key];
    picker?.element?.remove?.();
    picker?.destroy?.();
    delete this._driverPickers[key];
    this._openDriverKey = null;
  }

  _loadMaskFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      this._node.mask._sourcePixels = data.data;
      this._node.mask._sourceW = img.width;
      this._node.mask._sourceH = img.height;
      this._node.mask._fileName = file.name;
      this._node.mask.enabled = true;
      this._node.mask.source = 'upload';
      this._emit();
      this._rebuildBody();
    };
    img.src = url;
  }

  _appendDivider() {
    // No-op: rows already have border-top; a separate divider div would double the border.
  }

  _buildVectorExportRow() {
    const { F } = this.getF();
    const row = this.createElement('div', 'distort-vector-export-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      min-height: ${F * 2}px;
      padding: 0 ${F}px;
      border-top: 1px solid var(--c-border);
      box-sizing: border-box;
    `;
    const label = this._rowLabel('VECTOR');
    const btn = this.createElement('button', 'distort-export-svg', 'EXPORT SVG');
    btn.type = 'button';
    btn.style.cssText = `
      flex: 1;
      height: ${F * 2}px;
      border: none;
      border-left: 1px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
    `;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const pack = this._getSourcePixels?.();
      if (!pack?.pixels?.length || !pack.width || !pack.height) return;
      const w = pack.width | 0;
      const h = pack.height | 0;
      const rc = this._getRenderContext?.() ?? {};
      const fc = rc.frameCount ?? 1;
      const fr = rc.frame ?? 0;
      const ctx = {
        width: w,
        height: h,
        frame: fr,
        frameCount: fc,
        time: fc > 1 ? fr / fc : 0,
        quality: 'final',
        globalSeed: rc.globalSeed ?? 0
      };
      const lines = this._node.buildGeometry(w, h, ctx, pack.pixels) || [];
      const paths = [];
      for (const line of lines) {
        if (!line?.length) continue;
        const d = line.map((pt, idx) => `${idx ? 'L' : 'M'} ${Math.round(pt[0])} ${Math.round(pt[1])}`).join(' ');
        paths.push(`<path d="${d}" fill="none" stroke="#ffffff" stroke-width="1"/>`);
      }
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect x="0" y="0" width="${w}" height="${h}" fill="#000000"/>
${paths.join('\n')}
</svg>`;
      this._downloadSvgBlob(svg, `distort-${this._node.type}-${Date.now()}.svg`);
    });
    row.append(label, btn);
    this._body.appendChild(row);
  }

  _buildPickCentreRow() {
    const { F } = this.getF();
    const row = this.createElement('div', 'distort-pick-centre-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      min-height: ${F * 2}px;
      padding: 0 ${F}px;
      border-top: 1px solid var(--c-border);
      box-sizing: border-box;
    `;
    const label = this._rowLabel('CENTRE');
    const btn = this.createElement('button', 'distort-pick-centre', 'PICK CENTRE');
    btn.type = 'button';
    btn.style.cssText = `
      flex: 1;
      height: ${F * 2}px;
      border: none;
      border-left: 1px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
    `;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      this._onRequestPick?.('centreX', 'centreY', (nx, ny) => {
        this._node.params.centreX = nx;
        this._node.params.centreY = ny;
        this._emit();
        this._rebuildBody();
      });
    });
    row.append(label, btn);
    this._body.appendChild(row);
  }

  _downloadSvgBlob(svg, filename) {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = this.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    this.element.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.parentNode?.removeChild(link);
    }, 300);
  }

  _rowLabel(text) {
    const { F } = this.getF();
    const label = this.createElement('span', 'distort-row-label', text);
    label.style.cssText = `
      width: ${F * 7}px;
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      color: var(--c-text);
      text-transform: uppercase;
      flex-shrink: 0;
      overflow: hidden;
      white-space: nowrap;
    `;
    return label;
  }

  _precisionFor(step) {
    const text = String(step ?? 1);
    const idx = text.indexOf('.');
    return idx === -1 ? 0 : text.length - idx - 1;
  }

  _formatValue(value, precision) {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? numeric.toFixed(precision) : String(value ?? 0);
  }

  setSolo(isSolo) {
    this._isSolo = isSolo;
    this._syncHeaderState();
  }

  _emit() {
    this._onChange?.({ nodeIdx: this._nodeIdx });
  }

  onSourceChanged() {
    if (this._expanded) this._rebuildBody();
  }

  destroy() {
    this._closeDriverPicker();
    Object.values(this._driverPickers).forEach(picker => picker.destroy?.());
    this._driverPickers = {};
    this._dropdowns.forEach(dd => dd.destroy?.());
    this._dropdowns = [];
    this._extendedControlInstances.forEach(inst => inst.destroy?.());
    this._extendedControlInstances = [];
    this._drawOverlay?.destroy();
    this._drawOverlay = null;
    super.destroy();
  }
}
