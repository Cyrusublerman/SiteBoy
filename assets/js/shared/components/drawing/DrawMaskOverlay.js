/**
 * DrawMaskOverlay — bounded overlay for mask painting.
 *
 * Mounts as position:absolute; inset:0 on options.mountEl (the canvas area).
 * Contains a guide-compliant toolbar (§4/§10) and a DrawCanvas.
 *
 * Constructor options:
 *   mountEl   HTMLElement   the canvas area to overlay
 *   sourceW   number        source image width
 *   sourceH   number        source image height
 *   onDone    fn(pixels, w, h)
 *   onCancel  fn()
 */
import { BaseComponent } from '../../foundation.js';
import { DrawCanvas } from './DrawCanvas.js';
import { Slider } from '../input/Slider.js';

const TOOL_DEFS = [
  { id: 'pen',    label: 'PEN' },
  { id: 'erase',  label: 'ERASE' },
  { id: 'fill',   label: 'FILL' },
  { id: 'lasso',  label: 'LASSO' },
  { id: 'line',   label: 'LINE' },
  { id: 'rect',   label: 'RECT' },
  { id: 'circle', label: 'CIRCLE' },
];

// Tools that have ADJ panel content
const TOOL_HAS_ADJ = ['pen', 'erase', 'fill', 'line', 'rect', 'circle', 'lasso'];

export class DrawMaskOverlay extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'draw-mask-overlay', ...options }, deps);
    this._mountEl   = options.mountEl   ?? null;
    this._sourceW   = options.sourceW   ?? 512;
    this._sourceH   = options.sourceH   ?? 512;
    this._onDone    = options.onDone    ?? null;
    this._onCancel  = options.onCancel  ?? null;

    this._activeTool = 'pen';
    this._paintMode  = 'add';
    this._brushSize  = 10;
    this._brushShape = 'round';
    this._fillThreshold = 32;
    this._strokeSize = 4;

    this._drawCanvas = null;
    this._toolButtons = {};
    this._paintModeBtn = null;
    this._adjPanel = null;
    this._toolbarRow = null;

    this._onKeyDown     = this._onKeyDown.bind(this);
    this._onOutsideClick = this._onOutsideClick.bind(this);
  }

  render() {
    if (this.element) return this.element;
    const { F } = this.getF();

    // Ensure the mount point is a positioned ancestor
    if (this._mountEl) {
      this._mountEl.style.position = 'relative';
    }

    this.element = this.createElement('div', 'draw-mask-overlay');
    this.element.style.cssText = `
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      flex-direction: column;
      background: transparent;
      border: 1px solid var(--c-border);
      box-sizing: border-box;
    `;

    this.element.appendChild(this._buildHeader(F));
    this._toolbarRow = this._buildToolbar(F);
    this.element.appendChild(this._toolbarRow);

    this._drawCanvas = new DrawCanvas({
      width:  this._sourceW,
      height: this._sourceH,
      onStrokeEnd: () => {},
    }, this.deps);
    const canvasEl = this._drawCanvas.render();
    canvasEl.style.flex = '1';
    canvasEl.style.minHeight = '0';
    this.element.appendChild(canvasEl);

    if (this._mountEl) {
      this._mountEl.appendChild(this.element);
    }

    document.addEventListener('keydown', this._onKeyDown);

    this._activateTool('pen');
    return this.element;
  }

  // ── Header ────────────────────────────────────────────────────────────────

  _buildHeader(F) {
    const row = this.createElement('div', 'draw-overlay-header');
    row.style.cssText = `
      display: flex;
      align-items: stretch;
      height: ${F * 2}px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--c-border);
      background: var(--c-bg);
      box-sizing: border-box;
    `;

    const label = this.createElement('div', 'draw-overlay-title');
    label.textContent = 'DRAW MASK';
    label.style.cssText = `
      flex: 1;
      display: flex;
      align-items: center;
      padding: 0 ${F}px;
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      color: var(--c-text);
      box-sizing: border-box;
    `;

    const doneBtn = this._mkBtn('DONE ×', F, true);
    doneBtn.addEventListener('click', () => this._handleDone());
    doneBtn.addEventListener('mouseenter', () => { doneBtn.style.background = 'var(--c-text)'; doneBtn.style.color = 'var(--c-bg)'; });
    doneBtn.addEventListener('mouseleave', () => { doneBtn.style.background = 'var(--c-bg)'; doneBtn.style.color = 'var(--c-text)'; });

    row.append(label, doneBtn);
    return row;
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────

  _buildToolbar(F) {
    const row = this.createElement('div', 'draw-overlay-toolbar');
    row.style.cssText = `
      display: flex;
      align-items: stretch;
      height: ${F * 2}px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--c-border);
      background: var(--c-bg);
      position: relative;
      overflow: visible;
      box-sizing: border-box;
    `;

    let isFirst = true;

    // Tool buttons
    for (const def of TOOL_DEFS) {
      const btn = this._mkBtn(def.label, F, !isFirst);
      this._toolButtons[def.id] = btn;
      btn.addEventListener('click', () => this._activateTool(def.id));
      row.appendChild(btn);
      isFirst = false;
    }

    // Divider (implicit via border-left on next element)
    // PAINT MODE toggle — ADD / ERASE
    this._paintModeBtn = this._mkBtn('ADD', F, true);
    this._paintModeBtn.addEventListener('click', () => this._togglePaintMode());
    row.appendChild(this._paintModeBtn);

    // Action buttons
    const clearBtn = this._mkBtn('CLEAR ×', F, true);
    clearBtn.addEventListener('click', () => { this._drawCanvas?.clear(); });
    clearBtn.addEventListener('mouseenter', () => { clearBtn.style.background = 'var(--c-text)'; clearBtn.style.color = 'var(--c-bg)'; });
    clearBtn.addEventListener('mouseleave', () => { clearBtn.style.background = 'var(--c-bg)'; clearBtn.style.color = 'var(--c-text)'; });

    const undoBtn = this._mkBtn('UNDO', F, true);
    undoBtn.addEventListener('click', () => { this._drawCanvas?.undo(); });
    undoBtn.addEventListener('mouseenter', () => { undoBtn.style.background = 'var(--c-text)'; undoBtn.style.color = 'var(--c-bg)'; });
    undoBtn.addEventListener('mouseleave', () => { undoBtn.style.background = 'var(--c-bg)'; undoBtn.style.color = 'var(--c-text)'; });

    const redoBtn = this._mkBtn('REDO', F, true);
    redoBtn.addEventListener('click', () => { this._drawCanvas?.redo(); });
    redoBtn.addEventListener('mouseenter', () => { redoBtn.style.background = 'var(--c-text)'; redoBtn.style.color = 'var(--c-bg)'; });
    redoBtn.addEventListener('mouseleave', () => { redoBtn.style.background = 'var(--c-bg)'; redoBtn.style.color = 'var(--c-text)'; });

    row.append(clearBtn, undoBtn, redoBtn);
    return row;
  }

  _mkBtn(label, F, hasBorderLeft) {
    const btn = this.createElement('button', 'draw-overlay-btn');
    btn.type = 'button';
    btn.textContent = label;
    btn.style.cssText = `
      height: 100%;
      padding: 0 ${F}px;
      border: none;
      border-left: ${hasBorderLeft ? '1px solid var(--c-border)' : 'none'};
      border-top: none;
      border-bottom: none;
      border-right: none;
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-sizing: border-box;
      flex-shrink: 0;
    `;
    return btn;
  }

  // ── Tool activation ───────────────────────────────────────────────────────

  _activateTool(id) {
    this._activeTool = id;

    // Update button states
    for (const [key, btn] of Object.entries(this._toolButtons)) {
      const active = key === id;
      btn.style.background = active ? 'var(--c-text)' : 'var(--c-bg)';
      btn.style.color      = active ? 'var(--c-bg)'   : 'var(--c-text)';
    }

    this._drawCanvas?.setTool(id);
    this._closeAdj();
    if (TOOL_HAS_ADJ.includes(id)) {
      this._openAdj(id);
    }
  }

  _togglePaintMode() {
    this._paintMode = this._paintMode === 'add' ? 'erase' : 'add';
    const active = this._paintMode === 'erase';
    this._paintModeBtn.textContent = active ? 'ERASE' : 'ADD';
    this._paintModeBtn.style.background = active ? 'var(--c-text)' : 'var(--c-bg)';
    this._paintModeBtn.style.color      = active ? 'var(--c-bg)'   : 'var(--c-text)';
    this._drawCanvas?.setPaintMode(this._paintMode);
  }

  // ── ADJ panel ─────────────────────────────────────────────────────────────

  _openAdj(toolId) {
    if (!this._toolbarRow) return;
    const { F } = this.getF();

    const toolBtn = this._toolButtons[toolId];
    if (!toolBtn) return;

    const adjEl = this.createElement('div', 'draw-adj-panel');
    const btnRect   = toolBtn.getBoundingClientRect();
    const rowRect   = this._toolbarRow.getBoundingClientRect();
    const leftOffset = btnRect.left - rowRect.left;

    adjEl.style.cssText = `
      position: absolute;
      top: 100%;
      left: ${leftOffset}px;
      min-width: ${F * 14}px;
      border: 1px solid var(--c-border);
      border-top: none;
      background: var(--c-bg);
      z-index: 200;
      box-sizing: border-box;
    `;

    if (toolId === 'pen' || toolId === 'erase') {
      adjEl.appendChild(this._adjRangeRow(F, 'SIZE', this._brushSize, 1, 100, 1, true, val => {
        this._brushSize = val;
        this._drawCanvas?.setBrushSize(val);
      }));
      adjEl.appendChild(this._adjToggleRow(F, 'SHAPE', this._brushShape === 'round', 'ROUND', 'SQUARE', val => {
        this._brushShape = val ? 'round' : 'square';
        this._drawCanvas?.setBrushShape(this._brushShape);
      }));
    } else if (toolId === 'fill') {
      adjEl.appendChild(this._adjRangeRow(F, 'THRESHOLD', this._fillThreshold, 0, 128, 1, true, val => {
        this._fillThreshold = val;
        this._drawCanvas?.setFillThreshold(val);
      }));
    } else {
      // line / rect / circle / lasso — stroke size
      adjEl.appendChild(this._adjRangeRow(F, 'STROKE', this._strokeSize, 1, 100, 1, true, val => {
        this._strokeSize = val;
        this._drawCanvas?.setBrushSize(val);
      }));
    }

    this._toolbarRow.appendChild(adjEl);
    this._adjPanel = adjEl;

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('mousedown', this._onOutsideClick);
    }, 0);
  }

  _closeAdj() {
    document.removeEventListener('mousedown', this._onOutsideClick);
    if (this._adjPanel && this._adjPanel.parentNode) {
      this._adjPanel.parentNode.removeChild(this._adjPanel);
    }
    this._adjPanel = null;
  }

  _onOutsideClick(e) {
    if (this._adjPanel && !this._adjPanel.contains(e.target)) {
      this._closeAdj();
    }
  }

  // ── ADJ row builders ──────────────────────────────────────────────────────

  _adjRangeRow(F, label, value, min, max, step, noBorderTop, onChange) {
    const row = this.createElement('div', 'draw-adj-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      height: ${F * 2}px;
      padding: 0 ${F}px;
      border-top: ${noBorderTop ? 'none' : '1px solid var(--c-border)'};
      gap: ${F / 2}px;
      box-sizing: border-box;
    `;

    const lbl = this.createElement('span', 'draw-adj-label');
    lbl.textContent = label;
    lbl.style.cssText = `
      width: ${F * 6}px;
      flex-shrink: 0;
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      color: var(--c-text);
      overflow: hidden;
      white-space: nowrap;
    `;

    const readout = this.createElement('span', 'draw-adj-readout');
    readout.textContent = String(value);
    readout.style.cssText = `
      width: ${F * 3}px;
      flex-shrink: 0;
      text-align: right;
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      color: var(--c-text);
    `;

    const sliderComp = new Slider({
      min, max, step, value,
      borders: { top: false, right: false, bottom: false, left: false },
      onInput: (v) => {
        readout.textContent = String(v);
        onChange(v);
      },
    }, this.deps);
    this.componentInstances.push(sliderComp);
    const slider = sliderComp.render();
    slider.style.cssText = `flex: 1; min-width: 0;`;

    row.append(lbl, slider, readout);
    return row;
  }

  _adjToggleRow(F, label, initialState, labelA, labelB, onChange) {
    const row = this.createElement('div', 'draw-adj-toggle-row');
    row.style.cssText = `
      display: flex;
      align-items: center;
      height: ${F * 2}px;
      padding: 0 ${F}px;
      border-top: 1px solid var(--c-border);
      gap: ${F / 2}px;
      box-sizing: border-box;
    `;

    const lbl = this.createElement('span', 'draw-adj-label');
    lbl.textContent = label;
    lbl.style.cssText = `
      flex: 1;
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      color: var(--c-text);
    `;

    let state = initialState;
    const btn = this.createElement('button', 'draw-adj-toggle-btn');
    btn.type = 'button';
    btn.textContent = state ? labelA : labelB;

    const applyState = () => {
      btn.style.cssText = `
        padding: 0 ${F}px;
        height: ${F * 2}px;
        border: none;
        border-left: 1px solid var(--c-border);
        border-right: 1px solid var(--c-border);
        border-top: none;
        border-bottom: none;
        background: var(--c-text);
        color: var(--c-bg);
        font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
        font-size: ${F * 0.75}px;
        text-transform: uppercase;
        cursor: pointer;
        white-space: nowrap;
        box-sizing: border-box;
      `;
    };
    applyState();

    btn.addEventListener('click', () => {
      state = !state;
      btn.textContent = state ? labelA : labelB;
      applyState();
      onChange(state);
    });

    row.append(lbl, btn);
    return row;
  }

  // ── DONE / ESC ────────────────────────────────────────────────────────────

  _handleDone() {
    const pixels = this._drawCanvas?.getPixels(this._sourceW, this._sourceH);
    this._onDone?.(pixels, this._sourceW, this._sourceH);
    this.destroy();
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') {
      this._onCancel?.();
      this.destroy();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) { this._drawCanvas?.redo(); }
      else            { this._drawCanvas?.undo(); }
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('mousedown', this._onOutsideClick);
    this._closeAdj();
    this._drawCanvas?.destroy();
    this._drawCanvas = null;
    super.destroy();
  }
}
