import { BaseComponent } from '../../../../shared/foundation.js';
import { DriverPicker } from './DriverPicker.js';

const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'add', 'difference', 'darken', 'lighten'];
const MASK_MODES = ['none', 'upload', 'luminance', 'gradient'];

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

    this._body = null;
    this._headerEl = null;
    this._nameEl = null;
    this._enableBtn = null;
    this._soloBtn = null;
    this._openDriverKey = null;
    this._driverPickers = {};
    this._maskExpanded = false;
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
      border-bottom: ${this._expanded ? '1px solid var(--c-border)' : 'none'};
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
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.85}px;
      text-transform: uppercase;
    `;

    this._soloBtn = this._buildHeaderCell('S', 'var(--c-border)');
    this._soloBtn.addEventListener('click', event => {
      event.stopPropagation();
      this._onSolo?.({ nodeIdx: this._nodeIdx });
    });

    const removeBtn = this._buildHeaderCell('×', 'var(--c-border)');
    removeBtn.addEventListener('click', event => {
      event.stopPropagation();
      this._onRemove?.({ nodeIdx: this._nodeIdx });
    });

    header.append(drag, this._enableBtn, this._nameEl, this._soloBtn, removeBtn);

    header.addEventListener('click', () => this._onSelect?.({ nodeIdx: this._nodeIdx }));
    header.addEventListener('dragover', event => {
      event.preventDefault();
      header.style.borderTop = '2px solid var(--c-text)';
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
      font-family: 'Space Mono', monospace;
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
    if (this._headerEl) {
      this._headerEl.style.borderBottom = this._expanded ? '1px solid var(--c-border)' : 'none';
    }
    if (this._body) {
      this._body.style.display = this._expanded ? 'flex' : 'none';
    }
  }

  _rebuildBody() {
    if (!this._body) return;
    while (this._body.firstChild) this._body.removeChild(this._body.firstChild);
    this._closeDriverPicker();

    this._buildRangeRow({
      key: '__opacity__',
      label: 'OPACITY',
      value: this._node.opacity ?? 1,
      min: 0,
      max: 1,
      step: 0.01,
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
      const tier = def.tier ?? 3;
      if (!byTier[tier]) byTier[tier] = [];
      byTier[tier].push([key, def]);
    }

    for (const tier of [3, 4, 5]) {
      if (!byTier[tier]?.length) continue;
      this._appendDivider();
      for (const [key, def] of byTier[tier]) {
        this._buildParamRow(key, def);
      }
    }

    this._appendDivider();
    this._buildMaskBlock();
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
      driveable: !!def.driveable,
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
      padding: 0 ${F}px;
      border-top: 1px solid var(--c-border);
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
    const valueEl = this.createElement('span', 'distort-param-value', this._formatValue(config.value, precision));
    valueEl.style.cssText = `
      width: ${F * 4}px;
      text-align: right;
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      color: var(--c-text);
      flex-shrink: 0;
    `;

    slider.addEventListener('input', () => {
      valueEl.textContent = this._formatValue(Number(slider.value), precision);
    });
    slider.addEventListener('change', () => {
      config.onChange(Number(slider.value));
    });

    row.append(label, slider, valueEl);

    if (config.driveable) {
      const driverBtn = this.createElement('button', 'distort-driver-button', '+D');
      driverBtn.type = 'button';
      driverBtn.style.cssText = `
        width: ${F * 2}px;
        height: ${F * 2}px;
        border: 1px solid var(--c-border);
        background: var(--c-bg);
        color: var(--c-text);
        font-family: 'Space Mono', monospace;
        font-size: ${F * 0.7}px;
        box-sizing: border-box;
        cursor: pointer;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 120ms ease;
      `;
      const syncDriverState = () => {
        const driver = this._node.modulation?.[config.key];
        const active = !!driver && driver.mode && driver.mode !== 'none';
        slider.disabled = active;
        slider.style.opacity = active ? '0.35' : '1';
        driverBtn.style.opacity = active || row.matches(':hover') ? '1' : '0';
        driverBtn.style.background = active ? 'var(--c-accent)' : 'var(--c-bg)';
        driverBtn.style.color = active ? 'var(--c-bg)' : 'var(--c-text)';
      };
      row.addEventListener('mouseenter', syncDriverState);
      row.addEventListener('mouseleave', syncDriverState);
      driverBtn.addEventListener('click', event => {
        event.stopPropagation();
        this._toggleDriverPicker(config.key, config.label, wrap, driverBtn, slider, syncDriverState);
      });
      row.appendChild(driverBtn);
      syncDriverState();
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
      padding: 0 ${F}px;
      border-top: 1px solid var(--c-border);
      box-sizing: border-box;
    `;

    const label = this._rowLabel(config.label);
    const select = this.createElement('select', 'distort-select-input');
    select.style.cssText = `
      flex: 1;
      height: ${F * 2}px;
      border: 1px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      box-sizing: border-box;
    `;
    for (const optionValue of config.options) {
      const option = this.createElement('option');
      option.value = optionValue;
      option.textContent = String(optionValue).toUpperCase();
      if (String(optionValue) === String(config.value)) option.selected = true;
      select.appendChild(option);
    }
    select.addEventListener('change', () => config.onChange(select.value));
    row.append(label, select);
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
      border: 1px solid var(--c-border);
      background: ${config.value ? 'var(--c-text)' : 'var(--c-bg)'};
      color: ${config.value ? 'var(--c-bg)' : 'var(--c-text)'};
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
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
      this._node.mask = { enabled: false, source: 'none', invert: false, feather: 0, data: null };
    }

    const header = this.createElement('button', 'distort-mask-header');
    header.type = 'button';
    header.textContent = `${this._maskExpanded ? '▾' : '▸'} MASK`;
    header.style.cssText = `
      width: 100%;
      height: ${F * 2}px;
      padding: 0 ${F}px;
      border: none;
      border-top: 1px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-border);
      text-align: left;
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
    `;
    header.addEventListener('click', () => {
      this._maskExpanded = !this._maskExpanded;
      this._rebuildBody();
    });
    this._body.appendChild(header);

    if (!this._maskExpanded) return;

    this._buildSelectRow({
      label: 'SOURCE',
      value: this._node.mask.source ?? 'none',
      options: MASK_MODES,
      onChange: value => {
        this._node.mask.source = value;
        this._node.mask.enabled = value !== 'none';
        if (value !== 'upload') {
          this._node.mask._sourcePixels = null;
          this._node.mask._sourceW = 0;
          this._node.mask._sourceH = 0;
        }
        this._emit();
        this._rebuildBody();
      }
    });

    if (this._node.mask.source === 'upload') {
      this._buildFileRow('UPLOAD', this._node.mask._fileName || 'NO MASK', file => this._loadMaskFile(file));
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
        onChange: value => {
          this._node.mask.feather = value;
          this._emit();
        }
      });
    }
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
      border: 1px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
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
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      color: var(--c-text);
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
        slider.disabled = driver.mode !== 'none';
        syncDriverState();
        this._emit();
      }
    }, this.deps);
    wrap.appendChild(picker.render());
    this._driverPickers[key] = picker;
    syncDriverState();
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
    const divider = this.createElement('div');
    divider.style.cssText = 'height: 1px; background: var(--c-border);';
    this._body.appendChild(divider);
  }

  _rowLabel(text) {
    const { F } = this.getF();
    const label = this.createElement('span', 'distort-row-label', text);
    label.style.cssText = `
      width: ${F * 7}px;
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      color: var(--c-text);
      text-transform: uppercase;
      flex-shrink: 0;
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

  destroy() {
    this._closeDriverPicker();
    Object.values(this._driverPickers).forEach(picker => picker.destroy?.());
    this._driverPickers = {};
    super.destroy();
  }
}
