import { BaseComponent } from '../../../../shared/foundation.js';
import { ExpressionEval } from '../core/ExpressionEval.js';

const MODES = ['none', 'expr', 'image'];

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
  }

  render() {
    super.render();
    const { F } = this.getF();

    this.element.style.cssText = `
      display: flex;
      flex-direction: column;
      background: var(--c-bg);
      border-top: 1px solid var(--c-border);
    `;

    this._buildModeRow(F);
    this._renderModeRows();
    return this.element;
  }

  _buildModeRow(F) {
    const row = this._row(F, true);
    row.appendChild(this._labelEl(F, 'DRIVER'));

    const modeSelect = this.createElement('select', 'distort-driver-mode');
    modeSelect.style.cssText = this._fieldStyle(F);
    MODES.forEach(mode => {
      const option = this.createElement('option');
      option.value = mode;
      option.textContent = mode.toUpperCase();
      if (mode === (this._driver.mode ?? 'none')) option.selected = true;
      modeSelect.appendChild(option);
    });
    modeSelect.addEventListener('change', () => {
      this._driver.mode = modeSelect.value;
      if (this._driver.mode !== 'image') {
        this._driver.imageAsset = null;
        this._driver.mapId = null;
      }
      this._renderModeRows();
      this._emit();
    });

    const close = this.createElement('button', 'distort-driver-close', '×');
    close.type = 'button';
    close.style.cssText = `
      width: ${F * 2}px;
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
    close.addEventListener('click', () => this._onClose?.());

    row.append(modeSelect, close);
    this.element.appendChild(row);
  }

  _renderModeRows() {
    while (this.element.children.length > 1) {
      this.element.removeChild(this.element.lastChild);
    }

    const { F } = this.getF();
    const mode = this._driver.mode ?? 'none';
    if (mode === 'expr') {
      this._buildExprRows(F);
    } else if (mode === 'image') {
      this._buildImageRows(F);
    }
  }

  _buildExprRows(F) {
    const exprRow = this._row(F);
    exprRow.appendChild(this._labelEl(F, 'EXPR'));

    const input = this.createElement('input', 'distort-driver-expr');
    input.type = 'text';
    input.value = this._driver.expr ?? '';
    input.placeholder = '= sin(t)';
    input.style.cssText = this._fieldStyle(F);
    input.addEventListener('input', () => {
      this._driver.expr = input.value;
      if (this._previewDebounce) clearTimeout(this._previewDebounce);
      this._previewDebounce = setTimeout(() => {
        this._updatePreview();
        this._emit();
      }, 300);
    });
    exprRow.appendChild(input);
    this.element.appendChild(exprRow);

    const previewRow = this._row(F);
    previewRow.appendChild(this._labelEl(F, 'LIVE'));
    this._previewEl = this.createElement('span', 'distort-driver-preview', '—');
    this._previewEl.style.cssText = `
      flex: 1;
      color: var(--c-border);
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
    `;
    previewRow.appendChild(this._previewEl);
    this.element.appendChild(previewRow);
    this._updatePreview();
  }

  _buildImageRows(F) {
    const fileRow = this._row(F);
    fileRow.appendChild(this._labelEl(F, 'MAP'));

    const fileButton = this.createElement('button', 'distort-driver-file-button', 'CHOOSE');
    fileButton.type = 'button';
    fileButton.style.cssText = `
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

    const fileName = this.createElement('span', 'distort-driver-file-name', this._driver.imageAsset?.name?.toUpperCase?.() || 'NONE');
    fileName.style.cssText = `
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
    input.addEventListener('change', () => this._handleImageFile(input.files?.[0] ?? null));
    fileButton.addEventListener('click', () => input.click());

    fileRow.append(fileButton, fileName, input);
    this.element.appendChild(fileRow);

    const amountRow = this._row(F);
    amountRow.appendChild(this._labelEl(F, 'AMOUNT'));
    const amount = this.createElement('input', 'distort-driver-amount');
    amount.type = 'range';
    amount.min = '0';
    amount.max = '1';
    amount.step = '0.01';
    amount.value = String(this._driver.amount ?? 1);
    amount.style.cssText = `
      flex: 1;
      accent-color: var(--c-text);
      margin: 0;
    `;
    const amountValue = this.createElement('span', 'distort-driver-amount-value', Number(this._driver.amount ?? 1).toFixed(2));
    amountValue.style.cssText = `
      width: ${F * 4}px;
      text-align: right;
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      color: var(--c-text);
      flex-shrink: 0;
    `;
    amount.addEventListener('input', () => {
      amountValue.textContent = Number(amount.value).toFixed(2);
    });
    amount.addEventListener('change', () => {
      this._driver.amount = Number(amount.value);
      this._emit();
    });
    amountRow.append(amount, amountValue);
    this.element.appendChild(amountRow);

    const invertRow = this._row(F);
    invertRow.appendChild(this._labelEl(F, 'INVERT'));
    const invertButton = this.createElement('button', 'distort-driver-invert', this._driver.invert ? 'ON' : 'OFF');
    invertButton.type = 'button';
    invertButton.style.cssText = `
      width: ${F * 4}px;
      height: ${F * 2}px;
      border: 1px solid var(--c-border);
      background: ${this._driver.invert ? 'var(--c-text)' : 'var(--c-bg)'};
      color: ${this._driver.invert ? 'var(--c-bg)' : 'var(--c-text)'};
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      cursor: pointer;
      box-sizing: border-box;
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
      this._previewEl.textContent = `SYNTAX ERROR: ${error?.message ?? 'INVALID EXPRESSION'}`;
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
      this._driver.imageAsset = {
        pixels: data.data,
        width: img.width,
        height: img.height,
        name: file.name
      };
      this._driver.mapId = `${this._paramKey}-${Date.now()}`;
      this._emit();
      this._renderModeRows();
    };
    img.src = url;
  }

  _row(F, isFirst = false) {
    const row = this.createElement('div', 'distort-driver-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      gap: ${F / 2}px;
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
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      flex-shrink: 0;
    `;
    return label;
  }

  _fieldStyle(F) {
    return `
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
    super.destroy();
  }
}
