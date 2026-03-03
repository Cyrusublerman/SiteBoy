import { BaseComponent } from '../../../../shared/foundation.js';
import { Pipeline } from '../core/Pipeline.js';
import { AppState } from '../core/AppState.js';

/**
 * VariationGrid — renders N×N seed-offset thumbnails.
 * Click adopts the chosen seed into appState.globalSeed.
 * onAdopt(seed) callback fired on selection.
 */
export class VariationGrid extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'variation-grid', ...options }, deps);
    this._appState = options.appState ?? null;
    this._cols = options.cols ?? 3;
    this._rows = options.rows ?? 3;
    this._thumbSize = options.thumbSize ?? 80;
    this._seeds = options.seeds ?? null;
    this._onAdopt = options.onAdopt ?? null;
    this._rendering = false;
    this._cells = [];
    this._rafId = null;
  }

  render() {
    super.render();
    this.element.style.cssText = 'display:flex;flex-direction:column;gap:4px;padding:4px;';

    const title = this.createElement('div', '', 'VARIATIONS');
    title.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;letter-spacing:1px;color:var(--vga-grey,#888);';
    this.element.appendChild(title);

    const grid = this.createElement('div', 'variation-grid-cells');
    grid.style.cssText = `display:grid;grid-template-columns:repeat(${this._cols},${this._thumbSize}px);gap:2px;`;
    this._gridEl = grid;
    this.element.appendChild(grid);

    const refreshBtn = this.createElement('button', '', 'REFRESH');
    refreshBtn.style.cssText = 'font-family:Space Mono,monospace;font-size:9px;background:transparent;color:var(--vga-grey,#888);border:1px solid var(--vga-grey,#555);padding:2px 6px;cursor:pointer;margin-top:4px;';
    refreshBtn.addEventListener('click', () => this.refresh());
    this.element.appendChild(refreshBtn);

    this._buildCells();
    return this;
  }

  _buildCells() {
    this._cells = [];
    if (this._gridEl) this._gridEl.innerHTML = '';
    const total = this._cols * this._rows;
    for (let i = 0; i < total; i++) {
      const cell = this.createElement('div', 'var-cell');
      cell.style.cssText = `width:${this._thumbSize}px;height:${this._thumbSize}px;border:1px solid var(--vga-grey,#555);cursor:pointer;overflow:hidden;position:relative;`;
      const canvas = this.createElement('canvas');
      canvas.width = this._thumbSize; canvas.height = this._thumbSize;
      canvas.style.cssText = 'width:100%;height:100%;display:block;image-rendering:pixelated';
      cell.appendChild(canvas);

      const seedLabel = this.createElement('div', '');
      seedLabel.style.cssText = 'position:absolute;bottom:0;left:0;right:0;font-family:Space Mono,monospace;font-size:8px;background:rgba(0,0,0,0.6);color:var(--vga-white,#eee);text-align:center;padding:1px;';
      cell.appendChild(seedLabel);

      cell.addEventListener('click', () => {
        const seed = parseInt(seedLabel.textContent, 10);
        if (!isNaN(seed)) {
          if (this._appState) this._appState.globalSeed = seed;
          this._onAdopt?.(seed);
        }
      });

      cell.addEventListener('mouseover', () => { cell.style.borderColor = 'var(--vga-white,#eee)'; });
      cell.addEventListener('mouseout', () => { cell.style.borderColor = 'var(--vga-grey,#555)'; });

      this._gridEl.appendChild(cell);
      this._cells.push({ cell, canvas, seedLabel });
    }
  }

  refresh() {
    if (!this._appState || !this._appState.sourcePixels) return;
    const baseSeed = this._appState.globalSeed;
    const total = this._cols * this._rows;
    const seeds = this._seeds ?? Array.from({ length: total }, (_, i) => (baseSeed + i * 37) & 0x7fffffff);
    this._renderAll(seeds);
  }

  _renderAll(seeds) {
    if (this._rendering) return;
    this._rendering = true;
    let idx = 0;
    const s = this._appState;

    const renderNext = () => {
      if (idx >= seeds.length || idx >= this._cells.length) { this._rendering = false; return; }
      const seed = seeds[idx];
      const cell = this._cells[idx];
      idx++;

      const fakeState = new AppState();
      Object.assign(fakeState, {
        sourcePixels: s.sourcePixels,
        sourceW: s.sourceW,
        sourceH: s.sourceH,
        previewScale: 0.25,
        quality: 'preview',
        globalSeed: seed,
        stack: s.stack.map(n => n),
        modulationMaps: s.modulationMaps,
        soloNodeId: s.soloNodeId,
        rendering: false,
        needsRender: true,
        frames: s.frames,
        frameCount: s.frameCount,
        currentFrame: s.currentFrame
      });

      const pipe = new Pipeline(fakeState);
      const result = pipe.render();
      if (result) {
        const { pixels, width: rw, height: rh } = result;
        const ctx = cell.canvas.getContext('2d');
        const imgData = ctx.createImageData(rw, rh);
        imgData.data.set(pixels);
        ctx.putImageData(imgData, 0, 0);
        ctx.drawImage(cell.canvas, 0, 0, rw, rh, 0, 0, this._thumbSize, this._thumbSize);
      }
      cell.seedLabel.textContent = seed.toString();

      this._rafId = requestAnimationFrame(renderNext);
    };
    renderNext();
  }

  destroy() {
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    super.destroy();
  }
}
