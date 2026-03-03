import { BaseComponent } from '../../../../shared/foundation.js';

/**
 * DistortToolbar — global toolbar for the DISTORT tool.
 *
 * Slots:
 *   - Source: file picker + drop zone, emits onSource(ImageAsset)
 *   - Undo / Redo: delegates to History via onUndo / onRedo callbacks
 *   - Display: zoom mode buttons (FIT | FILL | 1:1), emits onZoom(mode)
 *   - Quality: toggle group (PREVIEW | DRAFT | FINAL), emits onQuality(tier)
 *   - Export: PNG export button, emits onExport()
 */
export class DistortToolbar extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'distort-toolbar', ...options }, deps);
    this._onSource  = options.onSource  ?? null;
    this._onUndo    = options.onUndo    ?? null;
    this._onRedo    = options.onRedo    ?? null;
    this._onZoom    = options.onZoom    ?? null;
    this._onQuality = options.onQuality ?? null;
    this._onExport  = options.onExport  ?? null;
    this._quality   = options.quality   ?? 'preview';
    this._zoom      = options.zoom      ?? 'fit';
    this._fileInput = null;
    this._undoBtn   = null;
    this._redoBtn   = null;
    this._zoomBtns  = {};
    this._qualBtns  = {};
  }

  render() {
    super.render();
    this.element.style.cssText = [
      'display:flex', 'align-items:center', 'gap:8px',
      'padding:4px 10px', 'flex-wrap:wrap',
      'background:var(--vga-darkgrey,#222)',
      'border-bottom:1px solid var(--vga-grey,#555)',
      'flex-shrink:0'
    ].join(';');

    this._buildSourceGroup();
    this._buildDivider();
    this._buildHistoryGroup();
    this._buildDivider();
    this._buildZoomGroup();
    this._buildDivider();
    this._buildQualityGroup();
    this._buildDivider();
    this._buildExportGroup();

    return this;
  }

  // ── Source ──────────────────────────────────────────────────────────────────

  _buildSourceGroup() {
    this._fileInput = this.createElement('input');
    this._fileInput.type = 'file';
    this._fileInput.accept = 'image/*';
    this._fileInput.style.display = 'none';
    this._fileInput.addEventListener('change', () => this._handleFile(this._fileInput.files[0]));
    this.element.appendChild(this._fileInput);

    const btn = this._btn('SOURCE', () => this._fileInput.click());
    btn.title = 'Load source image';

    const dropTarget = this.createElement('span', 'toolbar-drop-hint', 'DROP');
    dropTarget.title = 'Drop image onto canvas';
    dropTarget.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);cursor:default;letter-spacing:1px';

    this.element.append(btn, dropTarget);

    // Global drag-and-drop for source load
    this.element.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    this.element.addEventListener('drop', e => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f && f.type.startsWith('image/')) this._handleFile(f);
    });
  }

  _handleFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const cvs = new OffscreenCanvas(img.width, img.height);
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      this._onSource?.({ pixels: data.data, width: img.width, height: img.height, name: file.name });
    };
    img.src = url;
  }

  // ── History ─────────────────────────────────────────────────────────────────

  _buildHistoryGroup() {
    this._undoBtn = this._btn('UNDO', () => this._onUndo?.());
    this._redoBtn = this._btn('REDO', () => this._onRedo?.());
    this.element.append(this._undoBtn, this._redoBtn);
  }

  setHistoryState(canUndo, canRedo) {
    if (this._undoBtn) this._undoBtn.disabled = !canUndo;
    if (this._redoBtn) this._redoBtn.disabled = !canRedo;
    const dim = 'color:var(--vga-grey,#555)';
    const full = 'color:var(--vga-white,#eee)';
    if (this._undoBtn) this._undoBtn.style.color = canUndo ? 'var(--vga-white,#eee)' : 'var(--vga-grey,#555)';
    if (this._redoBtn) this._redoBtn.style.color = canRedo ? 'var(--vga-white,#eee)' : 'var(--vga-grey,#555)';
  }

  // ── Zoom ────────────────────────────────────────────────────────────────────

  _buildZoomGroup() {
    const label = this.createElement('span', '', 'VIEW');
    label.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);letter-spacing:1px';
    this.element.appendChild(label);

    for (const mode of ['fit', 'fill', '1:1']) {
      const btn = this._btn(mode.toUpperCase(), () => this._setZoom(mode));
      this._zoomBtns[mode] = btn;
      this.element.appendChild(btn);
    }
    this._updateZoomBtns();
  }

  _setZoom(mode) {
    this._zoom = mode;
    this._updateZoomBtns();
    this._onZoom?.(mode);
  }

  _updateZoomBtns() {
    for (const [m, b] of Object.entries(this._zoomBtns)) {
      b.style.borderColor = m === this._zoom ? 'var(--vga-white,#eee)' : 'var(--vga-grey,#555)';
    }
  }

  // ── Quality ─────────────────────────────────────────────────────────────────

  _buildQualityGroup() {
    const label = this.createElement('span', '', 'QUAL');
    label.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;color:var(--vga-grey,#888);letter-spacing:1px';
    this.element.appendChild(label);

    for (const tier of ['preview', 'draft', 'final']) {
      const btn = this._btn(tier.toUpperCase(), () => this._setQuality(tier));
      this._qualBtns[tier] = btn;
      this.element.appendChild(btn);
    }
    this._updateQualBtns();
  }

  _setQuality(tier) {
    this._quality = tier;
    this._updateQualBtns();
    this._onQuality?.(tier);
  }

  _updateQualBtns() {
    for (const [t, b] of Object.entries(this._qualBtns)) {
      b.style.borderColor = t === this._quality ? 'var(--vga-white,#eee)' : 'var(--vga-grey,#555)';
    }
  }

  // ── Export ───────────────────────────────────────────────────────────────────

  _buildExportGroup() {
    const btn = this._btn('EXPORT PNG', () => this._onExport?.());
    btn.title = 'Save current result as PNG';
    this.element.appendChild(btn);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _btn(text, cb) {
    const b = this.createElement('button', 'toolbar-btn', text);
    b.style.cssText = [
      'background:var(--vga-darkgrey,#222)', 'color:var(--vga-white,#eee)',
      'border:1px solid var(--vga-grey,#555)', 'font-family:Space Mono,monospace',
      'font-size:9px', 'padding:2px 7px', 'cursor:pointer',
      'letter-spacing:0.5px', 'flex-shrink:0'
    ].join(';');
    b.addEventListener('click', cb);
    return b;
  }

  _buildDivider() {
    const d = this.createElement('span', 'toolbar-divider');
    d.style.cssText = 'width:1px;height:16px;background:var(--vga-grey,#555);flex-shrink:0';
    this.element.appendChild(d);
  }

  destroy() {
    super.destroy();
  }
}
