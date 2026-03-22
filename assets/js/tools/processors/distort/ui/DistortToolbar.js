import { BaseComponent } from '../../../../shared/foundation.js';

const EXPORT_ITEMS = [
  { label: 'EXPORT PNG', key: 'exportPng' },
  { label: 'EXPORT SVG', key: 'exportSvg', show: toolbar => toolbar._stackIsAllVector },
  { separator: true },
  { label: 'SAVE RECIPE', key: 'saveRecipe' },
  { label: 'LOAD RECIPE', key: 'loadRecipe' },
  { separator: true },
  { label: 'VARIATIONS 2×2', key: 'variations2' },
  { label: 'VARIATIONS 3×3', key: 'variations3' },
  { label: 'VARIATIONS 4×4', key: 'variations4' },
  { separator: true },
  { label: 'RENDER SEQUENCE', key: 'renderSequence' },
];

/**
 * Layout (landscape):
 *   [SOURCE — 30F fixed] [UNDO — 1u] [REDO — 1u] [FIT — 1u] [FILL — 1u] [ACTUAL — 1u] [DRAFT — 1u] [EXPORT — 2u]
 *   Units fill the remaining canvas area (total width − 30F), split via flex proportions.
 *   EXPORT is 2u so it has double the width of the other action cells.
 *
 * Compact mode (canvas area too narrow):
 *   FIT + FILL + ACTUAL (3u) → single cyclic ZOOM button (1u).
 *   UNDO + REDO hidden.
 *   Threshold: canvas-area width (total − 30F) < 4F per unit → 8u × 4F = 32F → compact when < 32F.
 *   Exit hysteresis: > 36F.
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

    this._zoom        = options.zoom ?? 'fit';
    this._quality     = options.quality === 'final' ? 'full' : (options.quality ?? 'preview');
    this._sourceName  = 'ADD SOURCE +';
    this._canUndo     = false;
    this._canRedo     = false;
    this._stackIsAllVector = false;
    this._exportOpen  = false;
    this._compactMode = false;

    this._fileInput    = null;
    this._sourceCell   = null;
    this._sourceText   = null;
    this._actionArea   = null;   // flex container for all action cells
    this._undoCell     = null;
    this._redoCell     = null;
    this._zoomCells    = [];     // [fitCell, fillCell, actCell]
    this._zoomButtons  = {};
    this._zoomCyclicCell = null;
    this._zoomCyclicBtn  = null;
    this._draftCell    = null;
    this._qualityBtn   = null;
    this._exportCell   = null;
    this._exportBtn    = null;
    this._exportMenu   = null;

    this._boundOutsideClick = this._handleOutsideClick.bind(this);
    this._resizeObserver    = null;
  }

  render() {
    if (this.element) return this.element;
    super.render();
    const { F } = this.getF();

    this.element.style.cssText = `
      display: flex;
      width: 100%;
      height: ${F * 2}px;
      background: var(--c-bg);
      border-bottom: 1px solid var(--c-border);
      box-sizing: border-box;
      flex-shrink: 0;
      position: relative;
      z-index: 2;
    `;

    // Hidden file input
    this._fileInput = this.createElement('input', 'distort-toolbar-file');
    this._fileInput.type = 'file';
    this._fileInput.accept = 'image/*';
    this._fileInput.style.display = 'none';
    this._fileInput.addEventListener('change', () => this._handleFile(this._fileInput.files?.[0] ?? null));
    this.element.appendChild(this._fileInput);

    // ── SOURCE cell — fixed 30F, aligns with sidebar ──────────────────────────
    this._sourceCell = this._makeCell('source');
    this._sourceCell.style.cssText += `
      width: ${F * 30}px;
      flex-shrink: 0;
      border-right: 1px solid var(--c-border);
    `;
    const sourceBtn = this._makeBtn('SOURCE:', { justify: 'flex-start' });
    sourceBtn.addEventListener('click', () => this._fileInput?.click());
    this._sourceText = this.createElement('span', 'distort-toolbar-source-text');
    this._sourceText.textContent = this._sourceName;
    this._sourceText.style.cssText = `
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: ${F}px;
    `;
    sourceBtn.appendChild(this._sourceText);
    this._sourceCell.appendChild(sourceBtn);
    this.element.appendChild(this._sourceCell);

    // ── Action area — fills remaining width, flex layout ──────────────────────
    this._actionArea = this.createElement('div', 'distort-toolbar-actions');
    this._actionArea.style.cssText = `
      display: flex;
      flex: 1;
      min-width: 0;
      height: 100%;
      box-sizing: border-box;
    `;
    this.element.appendChild(this._actionArea);

    // UNDO (1u)
    this._undoCell = this._makeActionCell(1, false);
    const undoBtn = this._makeBtn('UNDO');
    undoBtn.addEventListener('click', () => { if (this._canUndo) this._onUndo?.(); });
    this._undoCell.appendChild(undoBtn);
    this._undoBtn = undoBtn;
    this._actionArea.appendChild(this._undoCell);

    // REDO (1u)
    this._redoCell = this._makeActionCell(1, false);
    const redoBtn = this._makeBtn('REDO');
    redoBtn.addEventListener('click', () => { if (this._canRedo) this._onRedo?.(); });
    this._redoCell.appendChild(redoBtn);
    this._redoBtn = redoBtn;
    this._actionArea.appendChild(this._redoCell);

    // FIT / FILL / ACTUAL (1u each)
    this._zoomCells = [];
    const zoomDefs = [
      { key: 'fit',  label: 'FIT'    },
      { key: 'fill', label: 'FILL'   },
      { key: '1:1',  label: 'ACTUAL' },
    ];
    for (const def of zoomDefs) {
      const cell = this._makeActionCell(1, false);
      const btn  = this._makeBtn(def.label);
      btn.addEventListener('click', () => this._setZoom(def.key));
      cell.appendChild(btn);
      this._zoomButtons[def.key] = btn;
      this._zoomCells.push(cell);
      this._actionArea.appendChild(cell);
    }

    // Cyclic ZOOM cell (1u) — hidden until compact
    this._zoomCyclicCell = this._makeActionCell(1, false);
    this._zoomCyclicCell.style.display = 'none';
    this._zoomCyclicBtn = this._makeBtn(this._zoom === '1:1' ? 'ACTUAL' : this._zoom.toUpperCase());
    const zoomOrder = ['fit', 'fill', '1:1'];
    this._zoomCyclicBtn.addEventListener('click', () => {
      const next = zoomOrder[(zoomOrder.indexOf(this._zoom) + 1) % zoomOrder.length];
      this._setZoom(next);
    });
    this._zoomCyclicCell.appendChild(this._zoomCyclicBtn);
    this._actionArea.appendChild(this._zoomCyclicCell);

    // DRAFT (1u)
    this._draftCell = this._makeActionCell(1, false);
    this._qualityBtn = this._makeBtn(this._quality === 'full' ? 'FULL' : 'DRAFT');
    this._qualityBtn.addEventListener('click', () => {
      this._quality = this._quality === 'full' ? 'preview' : 'full';
      this._qualityBtn.textContent = this._quality === 'full' ? 'FULL' : 'DRAFT';
      this._applyQualityState();
      this._onQuality?.(this._quality);
    });
    this._draftCell.appendChild(this._qualityBtn);
    this._actionArea.appendChild(this._draftCell);

    // EXPORT (2u, last — no right border)
    this._exportCell = this._makeActionCell(2, true);
    this._exportBtn  = this._makeBtn('EXPORT ▾', { justify: 'space-between' });
    this._exportBtn.addEventListener('click', e => {
      e.stopPropagation();
      this._exportOpen ? this._closeExport() : this._openExport();
    });
    this._exportCell.appendChild(this._exportBtn);
    this._actionArea.appendChild(this._exportCell);

    // Export menu
    this._exportMenu = this.createElement('div', 'distort-toolbar-export-menu');
    this._exportMenu.style.cssText = `
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      width: ${F * 16}px;
      background: var(--c-bg);
      border-top: 1px solid var(--c-border);
      border-left: 1px solid var(--c-border);
      border-bottom: 1px solid var(--c-border);
      box-sizing: border-box;
      z-index: 200;
      overflow-y: auto;
      max-height: calc(100vh - ${F * 4}px);
    `;
    this._exportMenu.addEventListener('mousedown', e => e.stopPropagation());
    this._exportMenu.addEventListener('click',     e => e.stopPropagation());
    this.element.appendChild(this._exportMenu);
    this._renderExportMenu();

    // Initial state
    this._applyZoomState();
    this._applyQualityState();
    this.setHistoryState(false, false);

    document.addEventListener('click', this._boundOutsideClick);

    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this._onResize());
      // Defer initial observation by one frame — at observation time the element
      // may not yet have its laid-out width (zero), which would incorrectly
      // trigger compact mode and hide UNDO/REDO permanently.
      requestAnimationFrame(() => {
        if (this._actionArea) this._resizeObserver.observe(this._actionArea);
      });
    }

    return this.element;
  }

  // ── Layout helpers ─────────────────────────────────────────────────────────

  _makeCell(cls) {
    const cell = this.createElement('div', `distort-toolbar-cell distort-toolbar-cell--${cls}`);
    cell.style.cssText = `
      height: 100%;
      box-sizing: border-box;
      position: relative;
      display: flex;
      align-items: stretch;
    `;
    return cell;
  }

  /**
   * @param {number} units  flex-grow units (EXPORT = 2, others = 1)
   * @param {boolean} isLast  if true, no right border (EXPORT is last)
   */
  _makeActionCell(units, isLast) {
    const cell = this._makeCell('action');
    cell.style.flex = `${units} ${units} 0`;
    cell.style.minWidth = '0';
    if (!isLast) cell.style.borderRight = '1px solid var(--c-border)';
    return cell;
  }

  _makeBtn(text, { justify = 'center' } = {}) {
    const { F } = this.getF();
    const btn = this.createElement('button', 'distort-toolbar-btn');
    btn.type = 'button';
    btn.textContent = text;
    btn.style.cssText = `
      width: 100%;
      height: 100%;
      padding: 0 ${F}px;
      border: none;
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: ${justify};
      box-sizing: border-box;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    btn.addEventListener('mouseenter', () => {
      if (btn.disabled || btn.dataset.active === 'true') return;
      btn.style.background = 'var(--c-text)';
      btn.style.color = 'var(--c-bg)';
    });
    btn.addEventListener('mouseleave', () => {
      if (btn.disabled) return;
      this._applyBtnState(btn, btn.dataset.active === 'true');
    });
    return btn;
  }

  // ── Compact mode ───────────────────────────────────────────────────────────

  _onResize() {
    const { F } = this.getF();
    if (!this._actionArea) return;
    const actionWidth = this._actionArea.offsetWidth;

    // Unit width = actionWidth divided by total flex units.
    // Full mode:    UNDO(1) + REDO(1) + FIT(1) + FILL(1) + ACTUAL(1) + DRAFT(1) + EXPORT(2) = 8u
    // Compact mode: ZOOM(1) + DRAFT(1) + EXPORT(2) = 4u
    //
    // Minimum readable button width: 2F padding + label. Shortest label "FIT" ≈ 2F → min = 4F.
    const MIN_UNIT = F * 4;

    // Full mode:    8u (UNDO×1 + REDO×1 + FIT×1 + FILL×1 + ACTUAL×1 + DRAFT×1 + EXPORT×2)
    // Compact mode: 5u (UNDO×0.5 + REDO×0.5 + ZOOM×1 + DRAFT×1 + EXPORT×2)
    // Enter compact when full-mode unit < MIN_UNIT → actionWidth < 8 × MIN_UNIT.
    // Exit compact when compact-mode unit >= MIN_UNIT → actionWidth >= 5 × MIN_UNIT,
    // plus 1u hysteresis to prevent boundary flicker.
    const ENTER_THRESHOLD = 8 * MIN_UNIT;
    const EXIT_THRESHOLD  = 5 * MIN_UNIT + MIN_UNIT; // 6 × MIN_UNIT

    const shouldBeCompact = this._compactMode
      ? actionWidth < EXIT_THRESHOLD
      : actionWidth < ENTER_THRESHOLD;

    if (shouldBeCompact === this._compactMode) return;
    this._compactMode = shouldBeCompact;
    this._applyCompactMode();
  }

  _applyCompactMode() {
    const compact = this._compactMode;

    // UNDO / REDO: shrink to 0.5u icon-only in compact, full 1u label in full mode
    if (this._undoCell) {
      this._undoCell.style.flex = compact ? '0.5 0.5 0' : '1 1 0';
      this._undoBtn.textContent = compact ? '←' : 'UNDO';
    }
    if (this._redoCell) {
      this._redoCell.style.flex = compact ? '0.5 0.5 0' : '1 1 0';
      this._redoBtn.textContent = compact ? '→' : 'REDO';
    }

    // FIT / FILL / ACTUAL cells vs cyclic cell
    for (const cell of this._zoomCells) {
      cell.style.display = compact ? 'none' : '';
    }
    if (this._zoomCyclicCell) {
      this._zoomCyclicCell.style.display = compact ? '' : 'none';
    }
  }

  // ── State helpers ──────────────────────────────────────────────────────────

  _applyBtnState(btn, active) {
    btn.dataset.active = active ? 'true' : 'false';
    btn.style.background = active ? 'var(--c-text)' : 'var(--c-bg)';
    btn.style.color      = active ? 'var(--c-bg)'   : 'var(--c-text)';
  }

  _applyDisabledState(btn, disabled) {
    btn.disabled        = disabled;
    btn.style.cursor    = disabled ? 'default' : 'pointer';
    btn.style.background = 'var(--c-bg)';
    btn.style.color     = disabled ? 'var(--c-border)' : 'var(--c-text)';
  }

  _setZoom(mode) {
    this._zoom = mode;
    this._applyZoomState();
    this._onZoom?.(mode);
  }

  _applyZoomState() {
    for (const [mode, btn] of Object.entries(this._zoomButtons)) {
      this._applyBtnState(btn, mode === this._zoom);
    }
    if (this._zoomCyclicBtn) {
      this._zoomCyclicBtn.textContent = this._zoom === '1:1' ? 'ACTUAL' : this._zoom.toUpperCase();
      this._applyBtnState(this._zoomCyclicBtn, false);
    }
  }

  _applyQualityState() {
    if (!this._qualityBtn) return;
    this._applyBtnState(this._qualityBtn, this._quality === 'full');
  }

  // ── Export panel ───────────────────────────────────────────────────────────

  _renderExportMenu() {
    if (!this._exportMenu) return;
    while (this._exportMenu.firstChild) this._exportMenu.removeChild(this._exportMenu.firstChild);
    const { F } = this.getF();
    let count = 0, pendingSep = false;

    for (const def of EXPORT_ITEMS) {
      if (def.show && !def.show(this)) continue;
      if (def.separator) { pendingSep = true; continue; }

      const item = this.createElement('button', 'distort-export-item');
      item.type = 'button';
      item.textContent = def.label;
      item.style.cssText = `
        display: flex;
        align-items: center;
        width: 100%;
        height: ${F * 2}px;
        padding: 0 ${F}px;
        border: none;
        border-top: ${(count > 0 || pendingSep) ? '1px solid var(--c-border)' : 'none'};
        background: var(--c-bg);
        color: var(--c-text);
        font-family: 'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace;
        font-size: ${F * 0.75}px;
        text-align: left;
        text-transform: uppercase;
        cursor: pointer;
        box-sizing: border-box;
        white-space: nowrap;
      `;
      item.addEventListener('mouseenter', () => { item.style.background = 'var(--c-text)'; item.style.color = 'var(--c-bg)'; });
      item.addEventListener('mouseleave', () => { item.style.background = 'var(--c-bg)';   item.style.color = 'var(--c-text)'; });
      item.addEventListener('click', () => { this._closeExport(); this._onExport?.(def.key); });
      this._exportMenu.appendChild(item);
      count++;
      pendingSep = false;
    }
  }

  _openExport() {
    this._exportOpen = true;
    this._applyBtnState(this._exportBtn, true);
    if (this._exportMenu) this._exportMenu.style.display = 'block';
  }

  _closeExport() {
    this._exportOpen = false;
    if (this._exportMenu) this._exportMenu.style.display = 'none';
    if (this._exportBtn) this._applyBtnState(this._exportBtn, false);
  }

  _handleOutsideClick(e) {
    if (!this._exportOpen) return;
    if (this.element?.contains(e.target)) return;
    this._closeExport();
  }

  // ── File handling ──────────────────────────────────────────────────────────

  _handleFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx    = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      this.setSourceInfo(file.name, img.width, img.height);
      this._onSource?.({ pixels: data.data, width: img.width, height: img.height, name: file.name });
    };
    img.src = url;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  setHistoryState(canUndo, canRedo) {
    this._canUndo = !!canUndo;
    this._canRedo = !!canRedo;
    if (this._undoBtn) this._applyDisabledState(this._undoBtn, !this._canUndo);
    if (this._redoBtn) this._applyDisabledState(this._redoBtn, !this._canRedo);
  }

  setSourceInfo(name, w, h) {
    this._sourceName = name
      ? ((w && h) ? `${String(name).toUpperCase()}  ${w}×${h}` : String(name).toUpperCase())
      : 'ADD SOURCE +';
    if (this._sourceText) this._sourceText.textContent = this._sourceName;
  }

  setVectorState(stackIsAllVector) {
    this._stackIsAllVector = !!stackIsAllVector;
    this._renderExportMenu();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  destroy() {
    document.removeEventListener('click', this._boundOutsideClick);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._closeExport();
    super.destroy();
  }
}
