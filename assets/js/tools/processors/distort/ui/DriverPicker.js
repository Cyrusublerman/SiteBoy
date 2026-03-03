import { BaseComponent } from '../../../../shared/foundation.js';

/**
 * DriverPicker — per-parameter modulation driver editor.
 *
 * Modes:
 *   'none'       — no driver, slider is authoritative
 *   'expression' — math expression string; ExpressionEval evaluates at runtime
 *   'image'      — grayscale image map uploaded by user
 *
 * Emits onDriverChange({ paramKey, mode, expr, imageAsset }) on any change.
 */
export class DriverPicker extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'driver-picker', ...options }, deps);
    this._paramKey      = options.paramKey      ?? '';
    this._label         = options.label         ?? options.paramKey ?? '';
    this._driver        = options.driver        ?? { mode: 'none', expr: '', imageAsset: null };
    this._onDriverChange = options.onDriverChange ?? null;
    this._modeSelect    = null;
    this._exprInput     = null;
    this._imgInput      = null;
    this._previewEl     = null;
  }

  render() {
    super.render();
    this.element.style.cssText = [
      'background:var(--vga-black,#111)',
      'border:1px solid var(--vga-grey,#555)',
      'padding:6px 8px', 'display:flex', 'flex-direction:column', 'gap:4px'
    ].join(';');

    this._buildTitle();
    this._buildModeRow();
    this._buildExprRow();
    this._buildImgRow();
    this._buildPreviewRow();
    this._refreshVisibility();

    return this;
  }

  _buildTitle() {
    const t = this.createElement('span', 'driver-title', `DRIVER — ${this._label.toUpperCase()}`);
    t.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);letter-spacing:1px';
    this.element.appendChild(t);
  }

  _buildModeRow() {
    const row = this.createElement('div', 'driver-mode-row');
    row.style.cssText = 'display:flex;align-items:center;gap:6px';

    const label = this.createElement('span', '', 'MODE');
    label.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);width:44px';

    this._modeSelect = this.createElement('select');
    for (const m of ['none', 'expression', 'image']) {
      const opt = this.createElement('option', '', m.toUpperCase());
      opt.value = m;
      if (this._driver.mode === m) opt.selected = true;
      this._modeSelect.appendChild(opt);
    }
    this._modeSelect.style.cssText = [
      'flex:1', 'background:var(--vga-darkgrey,#222)', 'color:var(--vga-white,#eee)',
      'border:1px solid var(--vga-grey,#555)',
      'font-family:Space Mono,monospace', 'font-size:9px', 'padding:1px 3px'
    ].join(';');
    this._modeSelect.addEventListener('change', () => {
      this._driver.mode = this._modeSelect.value;
      this._refreshVisibility();
      this._emit();
    });

    row.append(label, this._modeSelect);
    this.element.appendChild(row);
  }

  _buildExprRow() {
    const row = this.createElement('div', 'driver-expr-row');
    row.style.cssText = 'display:flex;align-items:center;gap:6px';

    const label = this.createElement('span', '', 'EXPR');
    label.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);width:44px';

    this._exprInput = this.createElement('input');
    this._exprInput.type = 'text';
    this._exprInput.placeholder = 'e.g. sin(t)*0.5+0.5';
    this._exprInput.value = this._driver.expr ?? '';
    this._exprInput.style.cssText = [
      'flex:1', 'background:var(--vga-darkgrey,#222)', 'color:var(--vga-white,#eee)',
      'border:1px solid var(--vga-grey,#555)',
      'font-family:Space Mono,monospace', 'font-size:9px', 'padding:1px 4px'
    ].join(';');
    this._exprInput.addEventListener('input', () => {
      this._driver.expr = this._exprInput.value;
      this._updatePreview();
      this._emit();
    });

    const hint = this.createElement('span', 'expr-hint', '?');
    hint.title = [
      'Variables: t (0-1 normalised frame), frame, frameCount,',
      'x, y (pixel, 0-1), lum, r, g, b, a',
      'Functions: sin cos tan abs floor ceil fract clamp lerp',
      'map smoothstep tri saw pulse noise(x,y)'
    ].join('\n');
    hint.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);cursor:help';

    row.append(label, this._exprInput, hint);
    this._exprRow = row;
    this.element.appendChild(row);
  }

  _buildImgRow() {
    const row = this.createElement('div', 'driver-img-row');
    row.style.cssText = 'display:flex;align-items:center;gap:6px';

    const label = this.createElement('span', '', 'IMAGE');
    label.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);width:44px';

    const fileInput = this.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', () => this._handleImageFile(fileInput.files[0]));

    const btn = this.createElement('button', 'driver-img-btn', 'LOAD IMAGE');
    btn.style.cssText = [
      'background:var(--vga-darkgrey,#222)', 'color:var(--vga-white,#eee)',
      'border:1px solid var(--vga-grey,#555)', 'font-family:Space Mono,monospace',
      'font-size:9px', 'padding:2px 6px', 'cursor:pointer'
    ].join(';');
    btn.addEventListener('click', () => fileInput.click());

    this._imgNameEl = this.createElement('span', 'driver-img-name', '—');
    this._imgNameEl.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1';

    row.append(label, btn, fileInput, this._imgNameEl);
    this._imgRow = row;
    this.element.appendChild(row);
  }

  _buildPreviewRow() {
    const row = this.createElement('div', 'driver-preview-row');
    row.style.cssText = 'display:flex;align-items:center;gap:6px';

    const label = this.createElement('span', '', 'VALUE');
    label.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);width:44px';

    this._previewEl = this.createElement('span', 'driver-preview', '—');
    this._previewEl.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-white,#eee)';

    row.append(label, this._previewEl);
    this._previewRow = row;
    this.element.appendChild(row);
  }

  _refreshVisibility() {
    const mode = this._driver.mode;
    this._exprRow.style.display = mode === 'expression' ? 'flex' : 'none';
    this._imgRow.style.display  = mode === 'image'      ? 'flex' : 'none';
    this._previewRow.style.display = mode === 'none'    ? 'none' : 'flex';
    if (mode === 'expression') this._updatePreview();
  }

  _updatePreview() {
    if (this._driver.mode !== 'expression' || !this._previewEl) return;
    try {
      // Lightweight safe eval for t=0 preview
      const expr = this._driver.expr;
      if (!expr) { this._previewEl.textContent = '—'; return; }
      const fn = new Function('t', 'frame', 'frameCount', 'sin', 'cos', 'abs', 'fract', 'clamp',
        `"use strict"; return (${expr});`);
      const v = fn(0, 0, 24, Math.sin, Math.cos, Math.abs, x => x - Math.floor(x),
        (x, lo, hi) => Math.max(lo, Math.min(hi, x)));
      this._previewEl.textContent = isNaN(v) ? 'NaN' : v.toFixed(4);
      this._exprInput.style.borderColor = 'var(--vga-grey,#555)';
    } catch {
      this._previewEl.textContent = 'ERR';
      this._exprInput.style.borderColor = 'var(--vga-red,#c00)';
    }
  }

  _handleImageFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const cvs = new OffscreenCanvas(img.width, img.height);
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      this._driver.imageAsset = { pixels: data.data, width: img.width, height: img.height, name: file.name };
      if (this._imgNameEl) this._imgNameEl.textContent = file.name;
      this._emit();
    };
    img.src = url;
  }

  _emit() {
    this._onDriverChange?.({
      paramKey: this._paramKey,
      mode: this._driver.mode,
      expr: this._driver.expr ?? '',
      imageAsset: this._driver.imageAsset ?? null
    });
  }

  /** Update driver from external state (e.g. on undo/redo). */
  setDriver(driver) {
    this._driver = { ...driver };
    if (this._modeSelect) this._modeSelect.value = driver.mode ?? 'none';
    if (this._exprInput)  this._exprInput.value  = driver.expr  ?? '';
    if (this._imgNameEl)  this._imgNameEl.textContent = driver.imageAsset?.name ?? '—';
    this._refreshVisibility();
  }

  destroy() {
    super.destroy();
  }
}
