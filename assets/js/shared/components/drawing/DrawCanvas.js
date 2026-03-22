/**
 * DrawCanvas — reusable greyscale drawing canvas component.
 *
 * Owns a <canvas> at source image resolution. All drawing is event-driven
 * (no RAF). Preview for shape tools uses a second overlay canvas.
 * Undo/redo via full ImageData snapshots (max 20).
 *
 * Public API:
 *   setTool(name)          'pen'|'erase'|'fill'|'lasso'|'line'|'rect'|'circle'
 *   setPaintMode(mode)     'add'|'erase'  — drives lasso fill direction
 *   setBrushSize(n)        1–100
 *   setBrushShape(s)       'round'|'square'
 *   setFillThreshold(n)    0–128
 *   getPixels(w, h)        → Uint8Array greyscale, nearest-neighbour to w×h
 *   setPixels(data, w, h)  load existing greyscale Uint8Array
 *   undo()
 *   redo()
 *   clear()
 *   destroy()
 */
import { BaseComponent } from '../../foundation.js';

const TOOLS = ['pen', 'erase', 'fill', 'lasso', 'line', 'rect', 'circle'];
const MAX_HISTORY = 20;

function _svgCursor(radius, dashed) {
  const d = Math.max(4, radius * 2 + 2);
  const cx = d / 2, cy = d / 2, r = Math.max(2, radius);
  const stroke = dashed
    ? `stroke-dasharray="${Math.max(2, r * 0.8)} ${Math.max(1, r * 0.4)}"`
    : '';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${d}' height='${d}'><circle cx='${cx}' cy='${cy}' r='${r}' fill='none' stroke='white' stroke-width='1.5' ${stroke}/><circle cx='${cx}' cy='${cy}' r='${r}' fill='none' stroke='black' stroke-width='0.5' stroke-dasharray='2 2'/></svg>`;
  const encoded = encodeURIComponent(svg);
  return `url("data:image/svg+xml,${encoded}") ${cx} ${cy}, crosshair`;
}

export class DrawCanvas extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'draw-canvas', ...options }, deps);
    this._w = options.width || 512;
    this._h = options.height || 512;
    this._onStrokeEnd = options.onStrokeEnd || null;

    this._tool = 'pen';
    this._paintMode = 'add';
    this._brushSize = 10;
    this._brushShape = 'round';
    this._fillThreshold = 32;

    this._history = [];
    this._future = [];

    this.canvas = null;
    this._preview = null;
    this.ctx = null;
    this._pctx = null;

    this._drawing = false;
    this._lastX = 0;
    this._lastY = 0;
    this._shapeStart = null;
    this._lassoPoints = [];

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp   = this._onPointerUp.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
  }

  render() {
    if (this.element) return this.element;

    this.element = this.createElement('div', 'draw-canvas-wrap');
    this.element.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      cursor: crosshair;
    `;

    this.canvas = this.createElement('canvas', 'draw-canvas-main');
    this.canvas.width  = this._w;
    this.canvas.height = this._h;
    this.canvas.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: block;
      opacity: 0.55;
    `;
    this.ctx = this.canvas.getContext('2d');
    // Start transparent — no fill so source image shows through

    this._preview = this.createElement('canvas', 'draw-canvas-preview');
    this._preview.width  = this._w;
    this._preview.height = this._h;
    this._preview.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      display: block;
      pointer-events: none;
    `;
    this._pctx = this._preview.getContext('2d');

    this.element.appendChild(this.canvas);
    this.element.appendChild(this._preview);

    this.canvas.addEventListener('pointerdown',  this._onPointerDown);
    this.canvas.addEventListener('pointermove',  this._onPointerMove);
    this.canvas.addEventListener('pointerup',    this._onPointerUp);
    this.canvas.addEventListener('pointerleave', this._onPointerLeave);
    this.canvas.addEventListener('contextmenu',  e => e.preventDefault());

    // Cursor scale requires layout — apply after first paint via rAF
    requestAnimationFrame(() => this._applyCursor());
    return this.element;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  setTool(name) {
    if (!TOOLS.includes(name)) return;
    this._tool = name;
    this._cancelShape();
    this._applyCursor();
  }

  setPaintMode(mode) {
    this._paintMode = mode === 'erase' ? 'erase' : 'add';
  }

  setBrushSize(n) {
    this._brushSize = Math.max(1, Math.min(100, n | 0));
    this._applyCursor();
  }

  setBrushShape(s) {
    this._brushShape = s === 'square' ? 'square' : 'round';
  }

  setFillThreshold(n) {
    this._fillThreshold = Math.max(0, Math.min(128, n | 0));
  }

  getPixels(tw, th) {
    const sw = this._w, sh = this._h;
    const src = this.ctx.getImageData(0, 0, sw, sh).data;
    const dst = new Uint8Array(tw * th);
    const scaleX = sw / tw, scaleY = sh / th;
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        const ox = Math.min(sw - 1, Math.round(x * scaleX));
        const oy = Math.min(sh - 1, Math.round(y * scaleY));
        // Mask stored in alpha channel (drawn=255, erased=0)
        dst[y * tw + x] = src[(oy * sw + ox) * 4 + 3];
      }
    }
    return dst;
  }

  setPixels(data, sw, sh) {
    if (!this.ctx || !data) return;
    const ctx = this.ctx;
    const scaleX = sw / this._w, scaleY = sh / this._h;
    const imgData = ctx.createImageData(this._w, this._h);
    const d = imgData.data;
    for (let y = 0; y < this._h; y++) {
      for (let x = 0; x < this._w; x++) {
        const ox = Math.min(sw - 1, Math.round(x * scaleX));
        const oy = Math.min(sh - 1, Math.round(y * scaleY));
        const v  = data[oy * sw + ox];
        const i  = (y * this._w + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = 255;
        d[i + 3] = v;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  undo() {
    if (!this._history.length || !this.ctx) return;
    const current = this.ctx.getImageData(0, 0, this._w, this._h);
    this._future.push(current);
    const snap = this._history.pop();
    this.ctx.putImageData(snap, 0, 0);
    this._onStrokeEnd?.();
  }

  redo() {
    if (!this._future.length || !this.ctx) return;
    const current = this.ctx.getImageData(0, 0, this._w, this._h);
    this._history.push(current);
    const snap = this._future.pop();
    this.ctx.putImageData(snap, 0, 0);
    this._onStrokeEnd?.();
  }

  clear() {
    if (!this.ctx) return;
    this._pushHistory();
    this.ctx.clearRect(0, 0, this._w, this._h);
    this._onStrokeEnd?.();
  }

  // ── Internal — history ────────────────────────────────────────────────────

  _pushHistory() {
    if (!this.ctx) return;
    const snap = this.ctx.getImageData(0, 0, this._w, this._h);
    this._history.push(snap);
    if (this._history.length > MAX_HISTORY) this._history.shift();
    this._future = [];
  }

  // ── Internal — cursor ─────────────────────────────────────────────────────

  _displayRadius() {
    // Convert brush radius from canvas-space to screen-space pixels
    if (!this.canvas || !this.canvas.getBoundingClientRect) return this._brushSize / 2;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? rect.width / this._w : 1;
    return Math.max(1, (this._brushSize / 2) * scaleX);
  }

  _applyCursor() {
    if (!this.canvas) return;
    if (this._tool === 'pen')   { this.canvas.style.cursor = _svgCursor(this._displayRadius(), false); return; }
    if (this._tool === 'erase') { this.canvas.style.cursor = _svgCursor(this._displayRadius(), true);  return; }
    if (this._tool === 'fill')  { this.canvas.style.cursor = 'copy'; return; }
    this.canvas.style.cursor = 'crosshair';
  }

  // ── Internal — coordinate mapping ────────────────────────────────────────

  _canvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return [
      (e.clientX - rect.left) / rect.width  * this._w,
      (e.clientY - rect.top)  / rect.height * this._h,
    ];
  }

  // ── Internal — pointer events ─────────────────────────────────────────────

  _onPointerDown(e) {
    if (e.button !== 0) return;
    this.canvas.setPointerCapture(e.pointerId);
    const [x, y] = this._canvasCoords(e);

    if (this._tool === 'fill') {
      this._pushHistory();
      this._floodFill(x | 0, y | 0);
      this._onStrokeEnd?.();
      return;
    }

    if (this._tool === 'lasso') {
      this._lassoPoints = [[x, y]];
      this._drawing = true;
      return;
    }

    if (['line', 'rect', 'circle'].includes(this._tool)) {
      this._shapeStart = [x, y];
      this._drawing = true;
      return;
    }

    // pen / erase
    this._pushHistory();
    this._drawing = true;
    this._lastX = x;
    this._lastY = y;
    this._drawDot(x, y);
  }

  _onPointerMove(e) {
    // Keep cursor scale in sync with display size
    if (this._tool === 'pen' || this._tool === 'erase') this._applyCursor();
    if (!this._drawing) return;
    const [x, y] = this._canvasCoords(e);

    if (this._tool === 'lasso') {
      this._lassoPoints.push([x, y]);
      this._drawLassoPreview();
      return;
    }

    if (['line', 'rect', 'circle'].includes(this._tool)) {
      this._drawShapePreview(x, y);
      return;
    }

    if (this._tool === 'pen' || this._tool === 'erase') {
      this._drawLine(this._lastX, this._lastY, x, y);
      this._lastX = x;
      this._lastY = y;
    }
  }

  _onPointerUp(e) {
    if (!this._drawing) return;
    const [x, y] = this._canvasCoords(e);
    this._drawing = false;
    this._pctx?.clearRect(0, 0, this._w, this._h);

    if (this._tool === 'lasso') {
      if (this._lassoPoints.length > 2) {
        this._pushHistory();
        this._commitLasso();
      }
      this._lassoPoints = [];
      this._onStrokeEnd?.();
      return;
    }

    if (['line', 'rect', 'circle'].includes(this._tool)) {
      this._pushHistory();
      this._commitShape(x, y);
      this._shapeStart = null;
      this._onStrokeEnd?.();
      return;
    }

    // pen / erase — history already pushed on pointerdown
    this._onStrokeEnd?.();
  }

  _onPointerLeave() {
    if (this._drawing && (this._tool === 'pen' || this._tool === 'erase')) {
      this._drawing = false;
      this._onStrokeEnd?.();
    }
  }

  // ── Internal — drawing primitives ─────────────────────────────────────────

  _isErase() {
    return this._tool === 'erase' || this._paintMode === 'erase';
  }

  _applyEraseOp(ctx) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle   = 'rgba(0,0,0,1)';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  }

  _applyDrawOp(ctx) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle   = '#fff';
    ctx.strokeStyle = '#fff';
  }

  _drawDot(x, y) {
    const ctx = this.ctx;
    const r = this._brushSize / 2;
    if (this._isErase()) { this._applyEraseOp(ctx); } else { this._applyDrawOp(ctx); }
    if (this._brushShape === 'square') {
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  _drawLine(x0, y0, x1, y1) {
    const ctx = this.ctx;
    const r = this._brushSize / 2;
    if (this._isErase()) { this._applyEraseOp(ctx); } else { this._applyDrawOp(ctx); }
    ctx.lineWidth = this._brushSize;
    ctx.lineCap = this._brushShape === 'square' ? 'square' : 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    if (this._brushShape === 'round') {
      ctx.beginPath();
      ctx.arc(x0, y0, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  _drawShapePreview(x, y) {
    if (!this._shapeStart || !this._pctx) return;
    const [sx, sy] = this._shapeStart;
    const pctx = this._pctx;
    pctx.clearRect(0, 0, this._w, this._h);
    pctx.strokeStyle = 'rgba(255,255,255,0.8)';
    pctx.lineWidth = Math.max(1, this._brushSize);
    pctx.setLineDash([4, 4]);
    pctx.beginPath();
    if (this._tool === 'line') {
      pctx.moveTo(sx, sy);
      pctx.lineTo(x, y);
    } else if (this._tool === 'rect') {
      pctx.rect(sx, sy, x - sx, y - sy);
    } else if (this._tool === 'circle') {
      const rx = Math.abs(x - sx) / 2, ry = Math.abs(y - sy) / 2;
      const cx = (sx + x) / 2, cy = (sy + y) / 2;
      pctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    }
    pctx.stroke();
    pctx.setLineDash([]);
  }

  _commitShape(x, y) {
    if (!this._shapeStart) return;
    const [sx, sy] = this._shapeStart;
    const ctx = this.ctx;
    if (this._isErase()) { this._applyEraseOp(ctx); } else { this._applyDrawOp(ctx); }
    ctx.lineWidth = Math.max(1, this._brushSize);
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (this._tool === 'line') {
      ctx.moveTo(sx, sy);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (this._tool === 'rect') {
      ctx.strokeRect(sx, sy, x - sx, y - sy);
    } else if (this._tool === 'circle') {
      const rx = Math.abs(x - sx) / 2, ry = Math.abs(y - sy) / 2;
      const cx = (sx + x) / 2, cy = (sy + y) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  _drawLassoPreview() {
    if (!this._pctx || this._lassoPoints.length < 2) return;
    const pctx = this._pctx;
    pctx.clearRect(0, 0, this._w, this._h);
    pctx.strokeStyle = 'rgba(255,255,255,0.8)';
    pctx.lineWidth = 1;
    pctx.setLineDash([4, 4]);
    pctx.beginPath();
    pctx.moveTo(this._lassoPoints[0][0], this._lassoPoints[0][1]);
    for (let i = 1; i < this._lassoPoints.length; i++) {
      pctx.lineTo(this._lassoPoints[i][0], this._lassoPoints[i][1]);
    }
    pctx.closePath();
    pctx.stroke();
    pctx.setLineDash([]);
  }

  _commitLasso() {
    const pts = this._lassoPoints;
    if (pts.length < 3) return;

    // Rasterise the lasso polygon using scanline fill
    const w = this._w, h = this._h;
    const imgData = this.ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const erase = this._isErase();
    const fillVal = erase ? 0 : 255;
    const fillAlpha = erase ? 0 : 255;

    const minY = Math.max(0, Math.floor(Math.min(...pts.map(p => p[1]))));
    const maxY = Math.min(h - 1, Math.ceil(Math.max(...pts.map(p => p[1]))));

    for (let y = minY; y <= maxY; y++) {
      const intersections = [];
      const n = pts.length;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[j];
        if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
          intersections.push(x0 + (y - y0) / (y1 - y0) * (x1 - x0));
        }
      }
      intersections.sort((a, b) => a - b);
      for (let k = 0; k < intersections.length - 1; k += 2) {
        const xStart = Math.max(0, Math.ceil(intersections[k]));
        const xEnd   = Math.min(w - 1, Math.floor(intersections[k + 1]));
        for (let x = xStart; x <= xEnd; x++) {
          const i = (y * w + x) * 4;
          data[i] = data[i + 1] = data[i + 2] = fillVal;
          data[i + 3] = fillAlpha;
        }
      }
    }
    this.ctx.putImageData(imgData, 0, 0);
  }

  _cancelShape() {
    this._drawing = false;
    this._shapeStart = null;
    this._lassoPoints = [];
    this._pctx?.clearRect(0, 0, this._w, this._h);
  }

  // ── Internal — flood fill ─────────────────────────────────────────────────

  _floodFill(startX, startY) {
    const w = this._w, h = this._h;
    const ctx = this.ctx;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const seedIdx = (startY * w + startX) * 4;
    const seedAlpha = data[seedIdx + 3];
    const erase = this._isErase();
    const fillVal = erase ? 0 : 255;
    const fillAlpha = erase ? 0 : 255;
    const thr = this._fillThreshold;

    // Use alpha channel to determine if pixel is already painted
    if (erase && seedAlpha <= thr) return;
    if (!erase && seedAlpha >= 255 - thr) return;

    const visited = new Uint8Array(w * h);
    const stack = [startX + startY * w];
    visited[startX + startY * w] = 1;

    while (stack.length) {
      const idx = stack.pop();
      const x = idx % w, y = (idx / w) | 0;
      const pi = idx * 4;
      data[pi] = data[pi + 1] = data[pi + 2] = fillVal;
      data[pi + 3] = fillAlpha;

      const neighbours = [
        x > 0     && idx - 1,
        x < w - 1 && idx + 1,
        y > 0     && idx - w,
        y < h - 1 && idx + w,
      ];
      for (const ni of neighbours) {
        if (ni === false || visited[ni]) continue;
        const npi = ni * 4;
        if (Math.abs(data[npi + 3] - seedAlpha) <= thr) {
          visited[ni] = 1;
          stack.push(ni);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown',  this._onPointerDown);
      this.canvas.removeEventListener('pointermove',  this._onPointerMove);
      this.canvas.removeEventListener('pointerup',    this._onPointerUp);
      this.canvas.removeEventListener('pointerleave', this._onPointerLeave);
    }
    this._history = [];
    this._future  = [];
    this.ctx    = null;
    this._pctx  = null;
    this.canvas = null;
    this._preview = null;
    super.destroy();
  }
}
