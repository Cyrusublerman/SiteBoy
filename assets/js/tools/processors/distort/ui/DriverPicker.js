import { BaseComponent } from '../../../../shared/foundation.js';
import { Dropdown } from '../../../../shared/components/input/Dropdown.js';
import { Slider } from '../../../../shared/components/input/Slider.js';
import { ExpressionEval } from '../core/ExpressionEval.js';

const MODES = ['none', 'expr', 'image', 'source'];
const MODE_LABELS = { none: 'NONE', expr: 'EXPRESSION', image: 'IMAGE MAP', source: 'SOURCE LUM' };

// Variables and functions available in expressions — shown in cheat sheet
const EXPR_VARS = [
  ['FRAME SCOPE', 'seed  frame  frameCount  time'],
  ['PIXEL SCOPE', 'x  y  nx  ny  lum  r  g  b  a'],
  ['MATH', 'sin cos tan abs floor ceil round min max pow sqrt log exp'],
  ['UTILS', 'fract(v)  clamp(v,lo,hi)  lerp(a,b,t)  map(v,i0,i1,o0,o1)'],
  ['WAVES', 'tri(t)  saw(t)  pulse(t,w)  smoothstep(e0,e1,x)'],
  ['NOISE', 'noise(x,y,seed)'],
  ['CONST', 'PI  E  TAU'],
];

export class DriverPicker extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'driver-picker', ...options }, deps);
    this._paramKey = options.paramKey ?? '';
    this._label = options.label ?? options.paramKey ?? '';
    this._driver = {
      mode: 'none',
      expr: '',
      mapId: null,
      amount: 1,
      invert: false,
      imageAsset: null,
      ...(options.driver ?? {})
    };
    this._onDriverChange = options.onDriverChange ?? null;
    this._onClose = options.onClose ?? null;
    this._previewDebounce = null;
    this._previewEl = null;
    this._cheatOpen = false;
    this._modeDropdown = null;
  }

  render() {
    super.render();
    const { F } = this.getF();

    // Driver picker sits below the param row — shares its border-top (no double border)
    this.element.style.cssText = `
      display: flex;
      flex-direction: column;
      background: var(--c-bg);
      border-top: 1px solid var(--c-border);
      box-sizing: border-box;
    `;

    this._buildModeRow(F);
    this._renderModeRows();
    return this.element;
  }

  _buildModeRow(F) {
    const row = this._row(F, true);

    row.appendChild(this._labelEl(F, 'DRIVER'));

    // Dropdown replaces raw <select>
    this._modeDropdown = new Dropdown({
      options: MODES.map(m => ({ value: m, label: MODE_LABELS[m] ?? m.toUpperCase() })),
      value: this._driver.mode ?? 'none',
      onChange: value => {
        this._driver.mode = value;
        if (value !== 'image') {
          this._driver.imageAsset = null;
          this._driver.mapId = null;
        }
        this._renderModeRows();
        this._emit();
      },
    }, this.deps);
    const dropEl = this._modeDropdown.render();
    dropEl.style.flex = '1';
    // Inline: no top/bottom border — row border-top is the separator
    if (this._modeDropdown.triggerEl) {
      this._modeDropdown.triggerEl.style.borderTop = 'none';
      this._modeDropdown.triggerEl.style.borderBottom = 'none';
    }
    row.appendChild(dropEl);

    // Close button — last cell in horizontal stack, owns border-left per §4
    const close = this.createElement('button', 'distort-driver-close', '×');
    close.type = 'button';
    close.style.cssText = `
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
      cursor: pointer;
      box-sizing: border-box;
      flex-shrink: 0;
      align-self: stretch;
    `;
    close.addEventListener('mouseenter', () => {
      close.style.background = 'var(--c-text)';
      close.style.color = 'var(--c-bg)';
    });
    close.addEventListener('mouseleave', () => {
      close.style.background = 'var(--c-bg)';
      close.style.color = 'var(--c-text)';
    });
    close.addEventListener('click', () => {
      // Closing = disable driver; set mode to none and emit before closing
      if (this._driver.mode !== 'none') {
        this._driver.mode = 'none';
        this._emit();
      }
      this._onClose?.();
    });

    row.appendChild(close);
    this.element.appendChild(row);
  }

  _renderModeRows() {
    // Remove everything after the first row (mode row)
    while (this.element.children.length > 1) {
      this.element.removeChild(this.element.lastChild);
    }
    if (this._modeDropdown) {
      this._modeDropdown.setValue(this._driver.mode ?? 'none');
    }

    const { F } = this.getF();
    const mode = this._driver.mode ?? 'none';
    if (mode === 'expr') {
      this._buildExprRows(F);
    } else if (mode === 'image') {
      this._buildImageRows(F);
    } else if (mode === 'source') {
      this._buildSourceRows(F);
    }
  }

  _buildExprRows(F) {
    const exprRow = this._row(F);
    exprRow.appendChild(this._labelEl(F, 'EXPR'));

    const input = this.createElement('input', 'distort-driver-expr');
    input.type = 'text';
    input.value = this._driver.expr ?? '';
    input.placeholder = '= sin(time * TAU)';
    input.style.cssText = `
      flex: 1;
      height: ${F * 2}px;
      border-top: none;
      border-bottom: none;
      border-left: 1px solid var(--c-border);
      border-right: 1px solid var(--c-border);
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      padding: 0 ${F / 2}px;
      box-sizing: border-box;
    `;
    input.addEventListener('input', () => {
      this._driver.expr = input.value;
      if (this._previewDebounce) clearTimeout(this._previewDebounce);
      this._previewDebounce = setTimeout(() => {
        this._updatePreview();
        this._emit();
      }, 300);
    });
    exprRow.appendChild(input);

    // Cheat sheet toggle button — right of input, owns border-left
    const refBtn = this.createElement('button', 'distort-driver-ref', this._cheatOpen ? '−' : '?');
    refBtn.type = 'button';
    refBtn.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${F * 2}px;
      border-top: none;
      border-bottom: none;
      border-left: 1px solid var(--c-border);
      border-right: none;
      background: var(--c-bg);
      color: var(--c-border);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      cursor: pointer;
      box-sizing: border-box;
      flex-shrink: 0;
      align-self: stretch;
    `;
    refBtn.addEventListener('click', () => {
      this._cheatOpen = !this._cheatOpen;
      refBtn.textContent = this._cheatOpen ? '−' : '?';
      this._renderModeRows();
    });
    exprRow.appendChild(refBtn);
    this.element.appendChild(exprRow);

    // Live preview row
    const previewRow = this._row(F);
    previewRow.appendChild(this._labelEl(F, 'LIVE'));
    this._previewEl = this.createElement('span', 'distort-driver-preview', '—');
    this._previewEl.style.cssText = `
      flex: 1;
      color: var(--c-border);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    `;
    previewRow.appendChild(this._previewEl);
    this.element.appendChild(previewRow);
    this._updatePreview();

    if (this._cheatOpen) {
      this._buildCheatSheet(F);
    }
  }

  _buildCheatSheet(F) {
    for (const [group, vars] of EXPR_VARS) {
      const row = this._row(F);
      const groupLabel = this._labelEl(F, group);
      groupLabel.style.color = 'var(--c-border)';
      row.appendChild(groupLabel);
      const valEl = this.createElement('span', 'distort-driver-cheat', vars);
      valEl.style.cssText = `
        flex: 1;
        color: var(--c-text);
        font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
        font-size: ${F * 0.75}px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      `;
      row.appendChild(valEl);
      this.element.appendChild(row);
    }
  }

  _buildSourceRows(F) {
    // Source luminance driver — no file needed, uses loaded source image
    const infoRow = this._row(F);
    infoRow.appendChild(this._labelEl(F, 'SOURCE'));
    const info = this.createElement('span', 'distort-driver-source-info', 'USES SOURCE IMAGE LUMINANCE');
    info.style.cssText = `
      flex: 1;
      color: var(--c-border);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    `;
    infoRow.appendChild(info);
    this.element.appendChild(infoRow);

    this._buildAmountInvertRows(F);
  }

  _buildImageRows(F) {
    const fileRow = this._row(F);
    fileRow.appendChild(this._labelEl(F, 'MAP'));

    const fileButton = this.createElement('button', 'distort-driver-file-button', 'CHOOSE …');
    fileButton.type = 'button';
    fileButton.style.cssText = `
      height: ${F * 2}px;
      padding: 0 ${F}px;
      border: none;
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
      white-space: nowrap;
    `;
    fileButton.addEventListener('mouseenter', () => { fileButton.style.background = 'var(--c-text)'; fileButton.style.color = 'var(--c-bg)'; });
    fileButton.addEventListener('mouseleave', () => { fileButton.style.background = 'var(--c-bg)'; fileButton.style.color = 'var(--c-text)'; });

    const fileName = this.createElement('span', 'distort-driver-file-name', this._driver.imageAsset?.name?.toUpperCase?.() || 'NONE');
    fileName.style.cssText = `
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
    input.addEventListener('change', () => this._handleImageFile(input.files?.[0] ?? null));
    fileButton.addEventListener('click', () => input.click());

    fileRow.append(fileButton, fileName, input);
    this.element.appendChild(fileRow);

    this._buildAmountInvertRows(F);
  }

  _buildAmountInvertRows(F) {
    // AMOUNT slider row — same layout as NodePanel param rows
    const amountRow = this._row(F);
    amountRow.appendChild(this._labelEl(F, 'AMOUNT'));
    const amountValue = this.createElement('span', 'distort-driver-amount-value', Number(this._driver.amount ?? 1).toFixed(2));
    amountValue.style.cssText = `
      width: ${this.getF().F * 4}px;
      text-align: right;
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      color: var(--c-text);
      flex-shrink: 0;
    `;
    this._amountSlider = new Slider({
      min: 0,
      max: 1,
      step: 0.01,
      value: this._driver.amount ?? 1,
      borders: { top: false, right: false, bottom: false, left: false },
      onInput: (v) => { amountValue.textContent = Number(v).toFixed(2); },
      onChange: (v) => { this._driver.amount = v; this._emit(); },
    }, this.deps);
    this.componentInstances.push(this._amountSlider);
    const amount = this._amountSlider.render();
    amount.style.cssText = `
      flex: 1;
      margin: 0;
      min-width: 0;
    `;
    amountRow.append(amount, amountValue);
    this.element.appendChild(amountRow);

    // INVERT toggle row — inline button, no extra border on button (row border-top is separator)
    const invertRow = this._row(F);
    invertRow.appendChild(this._labelEl(F, 'INVERT'));
    const invertButton = this.createElement('button', 'distort-driver-invert', this._driver.invert ? 'ON' : 'OFF');
    invertButton.type = 'button';
    invertButton.style.cssText = `
      height: ${F * 2}px;
      padding: 0 ${F}px;
      border-top: none;
      border-bottom: none;
      border-left: 1px solid var(--c-border);
      border-right: 1px solid var(--c-border);
      background: ${this._driver.invert ? 'var(--c-text)' : 'var(--c-bg)'};
      color: ${this._driver.invert ? 'var(--c-bg)' : 'var(--c-text)'};
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      cursor: pointer;
      box-sizing: border-box;
      flex-shrink: 0;
    `;
    invertButton.addEventListener('click', () => {
      this._driver.invert = !this._driver.invert;
      invertButton.textContent = this._driver.invert ? 'ON' : 'OFF';
      invertButton.style.background = this._driver.invert ? 'var(--c-text)' : 'var(--c-bg)';
      invertButton.style.color = this._driver.invert ? 'var(--c-bg)' : 'var(--c-text)';
      this._emit();
    });
    invertRow.appendChild(invertButton);
    this.element.appendChild(invertRow);
  }

  _updatePreview() {
    if (!this._previewEl) return;
    if (!this._driver.expr?.trim()) {
      this._previewEl.textContent = '—';
      return;
    }
    try {
      const body = this._driver.expr.startsWith('=') ? this._driver.expr.slice(1) : this._driver.expr;
      const value = ExpressionEval.evaluate(body, { frame: 0, frameCount: 24, time: 0, seed: 0 });
      this._previewEl.textContent = Number.isFinite(value) ? value.toFixed(4) : 'NaN';
      this._previewEl.style.color = 'var(--c-text)';
    } catch (error) {
      this._previewEl.textContent = `ERR: ${error?.message ?? 'INVALID'}`;
      this._previewEl.style.color = 'var(--c-border)';
    }
  }

  _handleImageFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      this._driver.imageAsset = { pixels: data.data, width: img.width, height: img.height, name: file.name };
      this._driver.mapId = `${this._paramKey}-${Date.now()}`;
      this._emit();
      this._renderModeRows();
    };
    img.src = url;
  }

  // isFirst=true → no border-top (DriverPicker element's own border-top is the separator)
  _row(F, isFirst = false) {
    const row = this.createElement('div', 'distort-driver-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      min-height: ${F * 2}px;
      padding: 0 ${F}px;
      border-top: ${isFirst ? 'none' : '1px solid var(--c-border)'};
      box-sizing: border-box;
    `;
    return row;
  }

  _labelEl(F, text) {
    const label = this.createElement('span', 'distort-driver-label', text);
    label.style.cssText = `
      width: ${F * 7}px;
      color: var(--c-border);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      flex-shrink: 0;
      overflow: hidden;
      white-space: nowrap;
    `;
    return label;
  }

  _emit() {
    this._onDriverChange?.({
      mode: this._driver.mode ?? 'none',
      expr: this._driver.expr ?? '',
      mapId: this._driver.mapId ?? null,
      amount: this._driver.amount ?? 1,
      invert: !!this._driver.invert,
      imageAsset: this._driver.imageAsset ?? null,
    });
  }

  destroy() {
    if (this._previewDebounce) clearTimeout(this._previewDebounce);
    this._previewDebounce = null;
    this._modeDropdown?.destroy?.();
    this._modeDropdown = null;
    super.destroy();
  }
}
