import { BaseComponent } from '../../../../shared/foundation.js';

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
    this._rafId         = null;
    this._oc            = null;   // OffscreenCanvas for processed result
    this._ocCtx         = null;
    this._ocW           = 0; this._ocH = 0;
    this._ocSrc         = null;   // OffscreenCanvas for source pixels
    this._ocSrcCtx      = null;
    this._ocSrcW        = 0; this._ocSrcH = 0;
    this._imgData       = null;
    this._imgDataSrc    = null;
    this._onResultClick = options.onResultClick ?? null;
    this._boundPointerDown  = this._onPointerDown.bind(this);
    this._boundPointerMove  = this._onPointerMove.bind(this);
    this._boundPointerUp    = this._onPointerUp.bind(this);
    this._boundWheel        = this._onWheel.bind(this);
    this._boundResize       = this._scheduleRedraw.bind(this);
  }

  render() {
    super.render();
    this.element.style.cssText = [
      'position:relative', 'width:100%', 'height:100%',
      'background:var(--vga-black,#1a1a1a)',
      'overflow:hidden', 'cursor:grab'
    ].join(';');

    this._canvas = this.createElement('canvas', 'distort-viewport');
    this._canvas.style.cssText = 'display:block;width:100%;height:100%';
    this._ctx = this._canvas.getContext('2d');
    this.element.appendChild(this._canvas);

    // Loading overlay
    this._loadingOverlay = this.createElement('div', 'viewport-loading');
    this._loadingOverlay.style.cssText = [
      'position:absolute', 'inset:0',
      'background:rgba(0,0,0,0.45)',
      'display:none',
      'align-items:center', 'justify-content:center',
      'font-family:Space Mono,monospace', 'font-size:11px',
      'color:var(--vga-white,#eee)', 'letter-spacing:2px',
      'pointer-events:none'
    ].join(';');
    this._loadingOverlay.textContent = 'RENDERING...';
    this.element.appendChild(this._loadingOverlay);

    this._canvas.addEventListener('pointerdown', this._boundPointerDown);
    this._canvas.addEventListener('pointermove', this._boundPointerMove);
    this._canvas.addEventListener('pointerup',   this._boundPointerUp);
    this._canvas.addEventListener('pointerleave', this._boundPointerUp);
    this._canvas.addEventListener('wheel', this._boundWheel, { passive: false });
    window.addEventListener('resize', this._boundResize);

    this._scheduleRedraw();
    return this;
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

  setVariations(variations) {
    this._variations = variations;
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

  // ── Draw pipeline ─────────────────────────────────────────────────────────

  _scheduleRedraw() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => { this._rafId = null; this._draw(); });
  }

  _draw() {
    if (!this._canvas || !this._ctx) return;
    const cw = this._canvas.offsetWidth, ch = this._canvas.offsetHeight;
    if (this._canvas.width !== cw || this._canvas.height !== ch) {
      this._canvas.width = cw; this._canvas.height = ch;
    }
    const ctx = this._ctx;
    ctx.fillStyle = '#1a1a1a';
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
      this._drawBorder(ctx, ox, oy, dw, dh);
    }
  }

  _drawSingle(ctx, cw, ch, source, oc, ocKey) {
    this._ensureOffscreenFor(ocKey, source.pixels, source.width, source.height);
    const useOc = ocKey === '_ocSrc' ? this._ocSrc : this._oc;
    const { dw, dh, ox, oy } = this._layout(cw, ch, source.width, source.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(useOc, ox, oy, dw, dh);
    this._drawBorder(ctx, ox, oy, dw, dh);
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
    ctx.strokeStyle = 'var(--vga-white,#eee)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx, oy); ctx.lineTo(sx, oy + dh); ctx.stroke();

    this._drawBorder(ctx, ox, oy, dw, dh);
  }

  _drawDiff(ctx, cw, ch) {
    if (!this._source) return;
    const rw = this._result.width, rh = this._result.height;
    const sw = this._source.width, sh = this._source.height;
    if (rw !== sw || rh !== sh) { this._drawNormal(ctx, cw, ch); return; }

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
    this._drawBorder(ctx, ox, oy, dw, dh);
  }

  _drawOverlay(ctx, cw, ch) {
    const { dw, dh, ox, oy } = this._layout(cw, ch, this._result.width, this._result.height);
    this._ensureOffscreenFor('_ocSrc', this._source.pixels, this._source.width, this._source.height);
    ctx.imageSmoothingEnabled = this._zoomLevel < 2;
    ctx.drawImage(this._ocSrc, ox, oy, dw, dh);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(this._oc, ox, oy, dw, dh);
    ctx.globalAlpha = 1;
    this._drawBorder(ctx, ox, oy, dw, dh);
  }

  _drawVariations(ctx, cw, ch) {
    const cols   = this._variations.length <= 4 ? 2 : 3;
    const rows   = Math.ceil(this._variations.length / cols);
    const cellW  = Math.floor(cw / cols);
    const cellH  = Math.floor(ch / rows);
    this._variations.forEach((v, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = col * cellW, y = row * cellH;
      // Scale result to cell
      const tmpOc = new OffscreenCanvas(v.width, v.height);
      const tmpCtx = tmpOc.getContext('2d');
      const imgd = tmpCtx.createImageData(v.width, v.height);
      imgd.data.set(v.pixels);
      tmpCtx.putImageData(imgd, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(tmpOc, x + 1, y + 1, cellW - 2, cellH - 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
    });
  }

  _drawBorder(ctx, ox, oy, dw, dh) {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox + 0.5, oy + 0.5, dw - 1, dh - 1);
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

  // ── Cleanup ───────────────────────────────────────────────────────────────

  destroy() {
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    if (this._canvas) {
      this._canvas.removeEventListener('pointerdown', this._boundPointerDown);
      this._canvas.removeEventListener('pointermove', this._boundPointerMove);
      this._canvas.removeEventListener('pointerup',   this._boundPointerUp);
      this._canvas.removeEventListener('pointerleave', this._boundPointerUp);
      this._canvas.removeEventListener('wheel', this._boundWheel);
    }
    window.removeEventListener('resize', this._boundResize);
    super.destroy();
  }
}
