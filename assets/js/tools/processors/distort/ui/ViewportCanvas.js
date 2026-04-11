import { BaseComponent } from '../../../../shared/foundation.js';
import { AnimationLoop } from '../../../../core/animation-foundation.js';
import { drawVariationGrid } from './VariationGrid.js';

/**
 * ViewportCanvas — renders DISTORT pipeline output with zoom/pan.
 *
 * Display modes: 'normal' | 'original' | 'split' | 'diff' | 'overlay'
 * Zoom modes:    'fit' | 'fill' | '1:1' | 'custom'
 * Pan:           pointer drag within viewport.
 * Variation grid: 2×2 or 3×3 grid of variation thumbnails.
 * Loading dim:   overlay when render is in progress.
 */
export class ViewportCanvas extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'viewport-canvas', ...options }, deps);
    this._result        = null;
    this._source        = null;   // original pixels for split/diff/overlay modes
    this._variations    = null;   // Array<{pixels,width,height}> for variation grid
    this._hasSource     = false;
    this._displayMode   = options.displayMode ?? 'normal';
    this._zoom          = options.zoom        ?? 'fit';
    this._zoomLevel     = options.zoomLevel   ?? 1;
    this._panX          = 0;
    this._panY          = 0;
    this._dragging      = false;
    this._dragStart     = null;
    this._loading       = false;
    this._splitX        = 0.5;   // normalised split position for 'split' mode
    this._canvas        = null;
    this._ctx           = null;
    this._drawQueued    = false;
    this._drawLoop      = null;   // one-shot AnimationLoop for debounced redraw
    this._oc            = null;   // OffscreenCanvas for processed result
    this._ocCtx         = null;
    this._ocW           = 0; this._ocH = 0;
    this._ocSrc         = null;   // OffscreenCanvas for source pixels
    this._ocSrcCtx      = null;
    this._ocSrcW        = 0; this._ocSrcH = 0;
    this._imgData       = null;
    this._imgDataSrc    = null;
    this._onResultClick = options.onResultClick ?? null;
    this._pickCallback  = null;
    this._onUpload      = options.onUpload ?? null;
    this._emptyOverlay  = null;
    this._boundPointerDown  = this._onPointerDown.bind(this);
    this._boundPointerMove  = this._onPointerMove.bind(this);
    this._boundPointerUp    = this._onPointerUp.bind(this);
    this._boundWheel        = this._onWheel.bind(this);
    this._boundResize       = this._scheduleRedraw.bind(this);
    this._boundDragOver     = this._onDragOver.bind(this);
    this._boundDrop         = this._onDrop.bind(this);
  }

  render() {
    super.render();
    this.element.style.cssText = [
      'position:relative', 'width:100%', 'height:100%',
      'background:var(--c-bg)',
      'overflow:hidden', 'cursor:grab'
    ].join(';');

    this._canvas = this.createElement('canvas', 'distort-viewport');
    this._canvas.style.cssText = 'display:block;width:100%;height:100%';
    this._ctx = this._canvas.getContext('2d');
    this.element.appendChild(this._canvas);

    // Loading overlay — transparent so the previous result stays visible underneath
    this._loadingOverlay = this.createElement('div', 'viewport-loading');
    this._loadingOverlay.style.cssText = [
      'position:absolute', 'bottom:0', 'left:0', 'right:0',
      'background:transparent',
      'display:none',
      'align-items:flex-end', 'justify-content:flex-start',
      `font-family:\'Atkinson Hyperlegible\',monospace`, `font-size:${this.getF().F}px`,
      'color:var(--c-text)', `letter-spacing:${Math.max(1, Math.round(this.getF().F / 7))}px`,
      `padding:${this.getF().F / 2}px`,
      'pointer-events:none'
    ].join(';');
    this._loadingOverlay.textContent = 'RENDERING...';
    this.element.appendChild(this._loadingOverlay);

    // Empty state overlay — uninitiated state with upload affordance
    this._fileInput = this.createElement('input', 'viewport-file-input');
    this._fileInput.type = 'file';
    this._fileInput.accept = 'image/*';
    this._fileInput.style.display = 'none';
    this._fileInput.addEventListener('change', () => {
      const file = this._fileInput.files?.[0];
      if (file) this._dispatchUpload(file);
    });
    this.element.appendChild(this._fileInput);

    const { F } = this.getF();
    this._emptyOverlay = this.createElement('div', 'viewport-empty');
    this._emptyOverlay.style.cssText = [
      'position:absolute', 'inset:0',
      'display:flex', 'align-items:center', 'justify-content:center',
      'cursor:pointer',
      'pointer-events:auto',
    ].join(';');

    const uploadLabel = this.createElement('div', 'viewport-empty-label');
    uploadLabel.textContent = 'UPLOAD IMAGE';
    uploadLabel.style.cssText = [
      `font-family:Space Mono,monospace`,
      `font-size:${F}px`,
      'color:var(--c-text)',
      `letter-spacing:${Math.max(1, Math.round(F / 7))}px`,
      `border:1px solid var(--c-border)`,
      `width:${F * 12}px`,
      `height:${F * 12}px`,
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'box-sizing:border-box',
      'pointer-events:none',
    ].join(';');

    this._emptyOverlay.appendChild(uploadLabel);
    this._emptyOverlay.addEventListener('click', () => this._fileInput?.click());
    this.element.appendChild(this._emptyOverlay);

    this._canvas.addEventListener('pointerdown', this._boundPointerDown);
    this._canvas.addEventListener('pointermove', this._boundPointerMove);
    this._canvas.addEventListener('pointerup',   this._boundPointerUp);
    this._canvas.addEventListener('pointerleave', this._boundPointerUp);
    this._canvas.addEventListener('wheel', this._boundWheel, { passive: false });
    this.element.addEventListener('dragover', this._boundDragOver);
    this.element.addEventListener('drop', this._boundDrop);
    window.addEventListener('resize', this._boundResize);

    this._updateEmptyState();
    this._scheduleRedraw();
    return this.element;
  }

  // ── Public setters ────────────────────────────────────────────────────────

  setResult(result) {
    this._result = result;
    this._scheduleRedraw();
  }

  setSource(source) {
    this._source = source;
    this._scheduleRedraw();
  }

  setHasSource(has) {
    this._hasSource = !!has;
    this._updateEmptyState();
  }

  setVariations(variations) {
    this._variations = Array.isArray(variations) && variations.length ? variations : null;
    this._scheduleRedraw();
  }

  setDisplayMode(mode) {
    this._displayMode = mode;
    this._scheduleRedraw();
  }

  setZoom(mode) {
    this._zoom = mode;
    if (mode !== 'custom') this._panX = this._panY = 0;
    this._scheduleRedraw();
  }

  setZoomLevel(level) {
    this._zoom = 'custom';
    this._zoomLevel = Math.max(0.05, Math.min(8, level));
    this._scheduleRedraw();
  }

  setLoading(loading) {
    this._loading = loading;
    if (this._loadingOverlay) {
      this._loadingOverlay.style.display = loading ? 'flex' : 'none';
    }
  }

  resetPan() { this._panX = 0; this._panY = 0; this._scheduleRedraw(); }

  /**
   * One-shot: next pointerdown on the result image calls `callback(nx, ny)` with
   * normalised coordinates in [0,1] relative to the rendered image, then exits pick mode.
   */
  enterPickMode(callback) {
    this._pickCallback = typeof callback === 'function' ? callback : null;
    if (this._canvas) {
      this._canvas.style.cursor = this._pickCallback ? 'crosshair' : 'grab';
    }
  }

  // ── Draw pipeline ─────────────────────────────────────────────────────────

  _scheduleRedraw() {
    if (this._drawQueued) return;
    this._drawQueued = true;
    if (!this._drawLoop) {
      this._drawLoop = new AnimationLoop({
        onFrame: () => {
          this._drawQueued = false;
          this._drawLoop.stop();
          this._draw();
        }
      });
    }
    this._drawLoop.start();
  }

  _draw() {
    if (!this._canvas || !this._ctx) return;
    const cw = this._canvas.offsetWidth, ch = this._canvas.offsetHeight;
    if (this._canvas.width !== cw || this._canvas.height !== ch) {
      this._canvas.width = cw; this._canvas.height = ch;
    }
    const ctx = this._ctx;
    ctx.fillStyle = this._cssVar('--vga-black', '#000000');
    ctx.fillRect(0, 0, cw, ch);

    if (this._variations?.length) {
      this._drawVariations(ctx, cw, ch);
      return;
    }

    if (!this._result) return;

    if (this._displayMode === 'original' && this._source) {
      this._drawSingle(ctx, cw, ch, this._source, this._ocSrc, '_ocSrc');
      return;
    }

    this._ensureOffscreen(this._result.pixels, this._result.width, this._result.height);

    if (this._displayMode === 'split' && this._source) {
      this._drawSplit(ctx, cw, ch);
    } else if (this._displayMode === 'diff' && this._source) {
      this._drawDiff(ctx, cw, ch);
    } else if (this._displayMode === 'overlay' && this._source) {
      this._drawOverlay(ctx, cw, ch);
    } else {
      const { dw, dh, ox, oy } = this._layout(cw, ch, this._result.width, this._result.height);
      ctx.imageSmoothingEnabled = this._zoomLevel < 2;
      ctx.drawImage(this._oc, ox, oy, dw, dh);
    }
  }

  _drawSingle(ctx, cw, ch, source, oc, ocKey) {
    this._ensureOffscreenFor(ocKey, source.pixels, source.width, source.height);
    const useOc = ocKey === '_ocSrc' ? this._ocSrc : this._oc;
    const { dw, dh, ox, oy } = this._layout(cw, ch, source.width, source.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(useOc, ox, oy, dw, dh);
  }

  _drawSplit(ctx, cw, ch) {
    const { dw, dh, ox, oy } = this._layout(cw, ch, this._result.width, this._result.height);
    this._ensureOffscreenFor('_ocSrc', this._source.pixels, this._source.width, this._source.height);
    const sx = ox + dw * this._splitX;

    ctx.save();
    ctx.beginPath(); ctx.rect(ox, oy, sx - ox, dh); ctx.clip();
    ctx.drawImage(this._ocSrc, ox, oy, dw, dh);
    ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.rect(sx, oy, ox + dw - sx, dh); ctx.clip();
    ctx.imageSmoothingEnabled = this._zoomLevel < 2;
    ctx.drawImage(this._oc, ox, oy, dw, dh);
    ctx.restore();

    // Divider line
    ctx.strokeStyle = this._cssVar('--vga-silver', '#c0c0c0');
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx, oy); ctx.lineTo(sx, oy + dh); ctx.stroke();

  }

  _drawDiff(ctx, cw, ch) {
    if (!this._source) return;
    const rw = this._result.width, rh = this._result.height;
    const sw = this._source.width, sh = this._source.height;
    if (rw !== sw || rh !== sh) {
      this._drawSingle(ctx, cw, ch, this._result, this._oc, '_oc');
      return;
    }

    const diff = new Uint8ClampedArray(rw * rh * 4);
    const r = this._result.pixels, s = this._source.pixels;
    for (let i = 0; i < diff.length; i += 4) {
      diff[i]   = Math.abs(r[i]   - s[i]);
      diff[i+1] = Math.abs(r[i+1] - s[i+1]);
      diff[i+2] = Math.abs(r[i+2] - s[i+2]);
      diff[i+3] = 255;
    }
    this._ensureOffscreenFor('_ocDiff', diff, rw, rh);
    const { dw, dh, ox, oy } = this._layout(cw, ch, rw, rh);
    ctx.drawImage(this._ocDiff, ox, oy, dw, dh);
  }

  _drawOverlay(ctx, cw, ch) {
    const { dw, dh, ox, oy } = this._layout(cw, ch, this._result.width, this._result.height);
    this._ensureOffscreenFor('_ocSrc', this._source.pixels, this._source.width, this._source.height);
    ctx.imageSmoothingEnabled = this._zoomLevel < 2;
    ctx.drawImage(this._ocSrc, ox, oy, dw, dh);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(this._oc, ox, oy, dw, dh);
    ctx.globalAlpha = 1;
  }

  _drawVariations(ctx, cw, ch) {
    drawVariationGrid(ctx, cw, ch, this._variations, this.getF().F, {
      bg:        this._cssVar('--vga-black',  '#000000'),
      border:    this._cssVar('--vga-gray',   '#808080'),
      labelBg:   this._cssVar('--vga-black',  '#000000'),
      labelText: this._cssVar('--vga-silver', '#c0c0c0'),
    });
  }

  // ── OffscreenCanvas management ────────────────────────────────────────────

  _ensureOffscreen(pixels, w, h) {
    if (!this._oc || this._ocW !== w || this._ocH !== h) {
      this._oc    = new OffscreenCanvas(w, h);
      this._ocCtx = this._oc.getContext('2d');
      this._ocW   = w; this._ocH = h;
      this._imgData = this._ocCtx.createImageData(w, h);
    }
    this._imgData.data.set(pixels);
    this._ocCtx.putImageData(this._imgData, 0, 0);
  }

  _ensureOffscreenFor(key, pixels, w, h) {
    const wKey = `${key}W`, hKey = `${key}H`, idKey = `${key}ImgData`, ctxKey = `${key}Ctx`;
    if (!this[key] || this[wKey] !== w || this[hKey] !== h) {
      this[key]   = new OffscreenCanvas(w, h);
      this[ctxKey] = this[key].getContext('2d');
      this[wKey]   = w; this[hKey] = h;
      this[idKey]  = this[ctxKey].createImageData(w, h);
    }
    this[idKey].data.set(pixels);
    this[ctxKey].putImageData(this[idKey], 0, 0);
  }

  // ── Layout ────────────────────────────────────────────────────────────────

  _layout(cw, ch, rw, rh) {
    let dw, dh;
    if (this._zoom === 'fit') {
      const sc = Math.min(cw / rw, ch / rh, 1);
      dw = rw * sc; dh = rh * sc;
    } else if (this._zoom === 'fill') {
      const sc = Math.max(cw / rw, ch / rh);
      dw = rw * sc; dh = rh * sc;
    } else if (this._zoom === '1:1') {
      dw = rw; dh = rh;
    } else {
      dw = rw * this._zoomLevel; dh = rh * this._zoomLevel;
    }
    return { dw, dh, ox: (cw - dw) / 2 + this._panX, oy: (ch - dh) / 2 + this._panY };
  }

  // ── Interaction ───────────────────────────────────────────────────────────

  _onPointerDown(e) {
    if (this._pickCallback && this._result && !this._variations?.length) {
      const rect = this._canvas.getBoundingClientRect();
      const scaleX = this._canvas.width / Math.max(1, rect.width);
      const scaleY = this._canvas.height / Math.max(1, rect.height);
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const cw = this._canvas.width;
      const ch = this._canvas.height;
      const rw = this._result.width;
      const rh = this._result.height;
      const { dw, dh, ox, oy } = this._layout(cw, ch, rw, rh);
      const nx = dw > 0 ? (px - ox) / dw : 0;
      const ny = dh > 0 ? (py - oy) / dh : 0;
      const fnx = Math.max(0, Math.min(1, nx));
      const fny = Math.max(0, Math.min(1, ny));
      const cb = this._pickCallback;
      this._pickCallback = null;
      this._canvas.style.cursor = 'grab';
      cb(fnx, fny);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (this._displayMode === 'split') {
      const rect  = this._canvas.getBoundingClientRect();
      const relX  = (e.clientX - rect.left) / rect.width;
      const cw    = this._canvas.width, ch = this._canvas.height;
      const rw    = this._result?.width ?? cw, rh = this._result?.height ?? ch;
      const { dw, ox } = this._layout(cw, ch, rw, rh);
      const norm  = (e.clientX - rect.left - ox / (cw / rect.width)) / (dw / (cw / rect.width));
      if (Math.abs(norm - this._splitX) < 0.04) {
        this._splittingDrag = true;
        this._canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
    this._splittingDrag = false;
    this._dragging  = true;
    this._dragStart = { x: e.clientX - this._panX, y: e.clientY - this._panY };
    this._canvas.style.cursor = 'grabbing';
    this._canvas.setPointerCapture(e.pointerId);
  }

  _onPointerMove(e) {
    if (this._splittingDrag) {
      const rect = this._canvas.getBoundingClientRect();
      this._splitX = Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width));
      this._scheduleRedraw();
      return;
    }
    if (!this._dragging) return;
    this._panX = e.clientX - this._dragStart.x;
    this._panY = e.clientY - this._dragStart.y;
    this._scheduleRedraw();
  }

  _onPointerUp() {
    this._dragging = false;
    this._splittingDrag = false;
    this._canvas.style.cursor = 'grab';
  }

  _onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    this._zoom = 'custom';
    this._zoomLevel = Math.max(0.05, Math.min(8, (this._zoomLevel || 1) * factor));
    this._scheduleRedraw();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Read a CSS custom property value from the document root for use in Canvas 2D.
   * Canvas 2D fillStyle/strokeStyle cannot accept var(--x) directly.
   * Falls back to `fallback` if the property is not set.
   */
  _cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  _updateEmptyState() {
    if (!this._emptyOverlay) return;
    this._emptyOverlay.style.display = this._hasSource ? 'none' : 'flex';
  }

  _dispatchUpload(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      this._onUpload?.({
        pixels: data.data,
        width: img.width,
        height: img.height,
        name: file.name
      });
    };
    img.src = url;
  }

  _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  _onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type?.startsWith('image/')) this._dispatchUpload(file);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  destroy() {
    this._pickCallback = null;
    this._drawLoop?.destroy();
    this._drawLoop = null;
    if (this._canvas) {
      this._canvas.removeEventListener('pointerdown', this._boundPointerDown);
      this._canvas.removeEventListener('pointermove', this._boundPointerMove);
      this._canvas.removeEventListener('pointerup',   this._boundPointerUp);
      this._canvas.removeEventListener('pointerleave', this._boundPointerUp);
      this._canvas.removeEventListener('wheel', this._boundWheel);
    }
    if (this.element) {
      this.element.removeEventListener('dragover', this._boundDragOver);
      this.element.removeEventListener('drop', this._boundDrop);
    }
    window.removeEventListener('resize', this._boundResize);
    super.destroy();
  }
}
