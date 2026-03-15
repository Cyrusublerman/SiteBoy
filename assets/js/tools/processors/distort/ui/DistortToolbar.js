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

export class DistortToolbar extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'distort-toolbar', ...options }, deps);
    this._onSource = options.onSource ?? null;
    this._onUndo = options.onUndo ?? null;
    this._onRedo = options.onRedo ?? null;
    this._onZoom = options.onZoom ?? null;
    this._onQuality = options.onQuality ?? null;
    this._onExport = options.onExport ?? null;

    this._zoom = options.zoom ?? 'fit';
    this._quality = options.quality === 'final' ? 'full' : (options.quality ?? 'preview');
    this._sourceName = 'ADD SOURCE +';
    this._canUndo = false;
    this._canRedo = false;
    this._stackIsAllVector = false;
    this._exportOpen = false;
    this._compactMode = false;

    this._fileInput = null;
    this._sourceCell = null;
    this._sourceText = null;
    this._undoBtn = null;
    this._redoBtn = null;
    this._qualityBtn = null;
    this._exportBtn = null;
    this._exportMenu = null;
    this._zoomButtons = {};
    this._zoomCyclicBtn = null;
    this._zoomCellsEl = [];

    this._boundOutsideClick = this._handleOutsideClick.bind(this);
    this._boundResize = this._onResize.bind(this);
    this._resizeObserver = null;
  }

  render() {
    super.render();
    const { F } = this.getF();
    const h = F * 2;

    this.element.style.cssText = `
      display: flex;
      width: 100%;
      height: ${h}px;
      background: var(--c-bg);
      border-bottom: 1px solid var(--c-border);
      box-sizing: border-box;
      flex-shrink: 0;
      position: relative;
      z-index: 2;
    `;

    this._fileInput = this.createElement('input', 'distort-toolbar-file');
    this._fileInput.type = 'file';
    this._fileInput.accept = 'image/*';
    this._fileInput.style.display = 'none';
    this._fileInput.addEventListener('change', () => this._handleFile(this._fileInput.files?.[0] ?? null));
    this.element.appendChild(this._fileInput);

    this._buildSourceCell();
    this._undoBtn = this._buildFixedCell('UNDO', F * 6, () => {
      if (this._canUndo) this._onUndo?.();
    });
    this._redoBtn = this._buildFixedCell('REDO', F * 6, () => {
      if (this._canRedo) this._onRedo?.();
    });
    this._buildZoomCells();
    this._qualityBtn = this._buildFixedCell(this._quality === 'full' ? 'FULL' : 'DRAFT', F * 6, () => {
      this._quality = this._quality === 'full' ? 'preview' : 'full';
      this._qualityBtn.textContent = this._quality === 'full' ? 'FULL' : 'DRAFT';
      this._applyQualityState();
      this._onQuality?.(this._quality);
    });
    this._buildExportCell();

    this._applyZoomState();
    this._applyQualityState();
    this.setHistoryState(false, false);

    document.addEventListener('click', this._boundOutsideClick);

    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this._onResize());
      this._resizeObserver.observe(this.element);
    }

    return this.element;
  }

  _onResize() {
    const width = this.element?.offsetWidth ?? 0;
    const compact = width < 500;
    if (compact === this._compactMode) return;
    this._compactMode = compact;
    this._applyCompactMode();
  }

  _applyCompactMode() {
    const { F } = this.getF();
    const compact = this._compactMode;

    // Hide UNDO/REDO cells in compact mode to free space
    if (this._undoBtn?.parentElement) this._undoBtn.parentElement.style.display = compact ? 'none' : '';
    if (this._redoBtn?.parentElement) this._redoBtn.parentElement.style.display = compact ? 'none' : '';

    // Reduce source cell min-width in compact mode
    if (this._sourceCell) this._sourceCell.style.minWidth = compact ? '0' : `${F * 30}px`;

    // Show/hide individual zoom cells vs cyclic button
    for (const el of this._zoomCellsEl) {
      el.style.display = compact ? 'none' : '';
    }

    if (!this._zoomCyclicBtn) {
      const cell = this._createCell(`${F * 6}px`);
      this._zoomCyclicBtn = this._createCellButton(this._zoom.toUpperCase());
      this._zoomCyclicBtn.style.minWidth = `${F * 4}px`;
      const zoomOrder = ['fit', 'fill', '1:1'];
      this._zoomCyclicBtn.addEventListener('click', () => {
        const idx = zoomOrder.indexOf(this._zoom);
        const next = zoomOrder[(idx + 1) % zoomOrder.length];
        this._setZoom(next);
        this._zoomCyclicBtn.textContent = next === '1:1' ? 'ACTUAL' : next.toUpperCase();
      });
      cell.appendChild(this._zoomCyclicBtn);
      // Insert before quality button cell
      if (this._qualityBtn?.parentElement?.parentElement) {
        this.element.insertBefore(cell, this._qualityBtn.parentElement);
      } else {
        this.element.appendChild(cell);
      }
      this._zoomCyclicCell = cell;
    }

    if (this._zoomCyclicCell) {
      this._zoomCyclicCell.style.display = compact ? '' : 'none';
    }
  }

  _buildSourceCell() {
    const { F } = this.getF();
    this._sourceCell = this._createFlexCell();
    this._sourceCell.style.minWidth = `${F * 30}px`;
    const cell = this._sourceCell;
    const button = this._createCellButton('SOURCE:');
    button.style.justifyContent = 'space-between';
    button.addEventListener('click', () => this._fileInput?.click());

    this._sourceText = this.createElement('span', 'distort-toolbar-source');
    this._sourceText.textContent = this._sourceName;
    this._sourceText.style.cssText = `
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: ${F}px;
    `;

    button.appendChild(this._sourceText);
    cell.appendChild(button);
    this.element.appendChild(cell);
  }

  _buildFixedCell(label, widthPx, onClick) {
    const cell = this._createCell(`${widthPx}px`);
    const button = this._createCellButton(label);
    button.addEventListener('click', onClick);
    cell.appendChild(button);
    this.element.appendChild(cell);
    return button;
  }

  _buildZoomCells() {
    const { F } = this.getF();
    const fitCell  = this._createCell(`${F * 6}px`);
    const fillCell = this._createCell(`${F * 6}px`);
    const actCell  = this._createCell(`${F * 6}px`);

    this._zoomButtons.fit    = this._attachActionButton(fitCell,  'FIT',    () => this._setZoom('fit'));
    this._zoomButtons.fill   = this._attachActionButton(fillCell, 'FILL',   () => this._setZoom('fill'));
    this._zoomButtons['1:1'] = this._attachActionButton(actCell,  'ACTUAL', () => this._setZoom('1:1'));

    this._zoomCellsEl = [fitCell, fillCell, actCell];
    for (const cell of this._zoomCellsEl) this.element.appendChild(cell);
  }

  _attachActionButton(cell, label, onClick) {
    const button = this._createCellButton(label);
    button.addEventListener('click', onClick);
    cell.appendChild(button);
    return button;
  }

  _buildExportCell() {
    const { F } = this.getF();
    const cell = this._createCell(`${F * 6}px`, true);
    cell.style.position = 'relative';

    this._exportBtn = this._createCellButton('EXPORT ▾');
    this._exportBtn.addEventListener('click', e => {
      e.stopPropagation();
      this._exportOpen ? this._closeExport() : this._openExport();
    });
    cell.appendChild(this._exportBtn);

    this._exportMenu = this.createElement('div', 'distort-toolbar-export-menu');
    this._exportMenu.style.cssText = `
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      min-width: 100%;
      background: var(--c-bg);
      border: 1px solid var(--c-border);
      border-top: none;
      box-sizing: border-box;
      z-index: 20;
    `;
    cell.appendChild(this._exportMenu);
    this.element.appendChild(cell);

    this._renderExportMenu();
  }

  _renderExportMenu() {
    if (!this._exportMenu) return;
    while (this._exportMenu.firstChild) {
      this._exportMenu.removeChild(this._exportMenu.firstChild);
    }

    const { F } = this.getF();
    for (const itemDef of EXPORT_ITEMS) {
      if (itemDef.show && !itemDef.show(this)) continue;
      if (itemDef.separator) {
        const separator = this.createElement('div', 'distort-toolbar-export-separator');
        separator.style.cssText = 'height: 1px; background: var(--c-border);';
        this._exportMenu.appendChild(separator);
        continue;
      }

      const item = this.createElement('button', 'distort-toolbar-export-item');
      item.type = 'button';
      item.textContent = itemDef.label;
      item.style.cssText = `
        width: 100%;
        height: ${F * 2}px;
        padding: 0 ${F}px;
        border: none;
        border-top: 1px solid transparent;
        background: var(--c-bg);
        color: var(--c-text);
        font-family: 'Space Mono', monospace;
        font-size: ${F * 0.75}px;
        text-align: left;
        text-transform: uppercase;
        cursor: pointer;
        box-sizing: border-box;
      `;
      item.addEventListener('mouseenter', () => {
        item.style.background = 'var(--c-text)';
        item.style.color = 'var(--c-bg)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'var(--c-bg)';
        item.style.color = 'var(--c-text)';
      });
      item.addEventListener('click', e => {
        e.stopPropagation();
        this._closeExport();
        this._onExport?.(itemDef.key);
      });
      this._exportMenu.appendChild(item);
    }
  }

  _createCell(width, isLast = false) {
    const cell = this.createElement('div', 'distort-toolbar-cell');
    cell.style.cssText = `
      width: ${width};
      height: 100%;
      border-right: ${isLast ? 'none' : '1px solid var(--c-border)'};
      box-sizing: border-box;
      flex-shrink: 0;
      position: relative;
    `;
    return cell;
  }

  _createFlexCell() {
    const cell = this.createElement('div', 'distort-toolbar-cell');
    cell.style.cssText = `
      flex: 1;
      min-width: 0;
      height: 100%;
      border-right: 1px solid var(--c-border);
      box-sizing: border-box;
      position: relative;
    `;
    return cell;
  }

  _createCellButton(text) {
    const { F, F2 } = this.getF();
    const button = this.createElement('button', 'distort-toolbar-button');
    button.type = 'button';
    button.textContent = text;
    button.style.cssText = `
      width: 100%;
      height: 100%;
      padding: 0 ${F}px;
      border: none;
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Space Mono', monospace;
      font-size: ${F * 0.75}px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: ${F2}px;
      box-sizing: border-box;
      cursor: pointer;
    `;
    button.addEventListener('mouseenter', () => {
      if (button.disabled) return;
      if (button.dataset.active === 'true') return;
      button.style.background = 'var(--c-text)';
      button.style.color = 'var(--c-bg)';
    });
    button.addEventListener('mouseleave', () => {
      if (button.disabled) return;
      this._applyButtonState(button, button.dataset.active === 'true');
    });
    return button;
  }

  _applyButtonState(button, active) {
    button.dataset.active = active ? 'true' : 'false';
    button.style.background = active ? 'var(--c-text)' : 'var(--c-bg)';
    button.style.color = active ? 'var(--c-bg)' : 'var(--c-text)';
  }

  _applyDisabledState(button, disabled) {
    button.disabled = disabled;
    button.style.cursor = disabled ? 'default' : 'pointer';
    button.style.background = 'var(--c-bg)';
    button.style.color = disabled ? 'var(--c-border)' : 'var(--c-text)';
  }

  _setZoom(mode) {
    this._zoom = mode;
    this._applyZoomState();
    this._onZoom?.(mode);
  }

  _applyZoomState() {
    for (const [mode, button] of Object.entries(this._zoomButtons)) {
      this._applyButtonState(button, mode === this._zoom);
    }
  }

  _applyQualityState() {
    if (!this._qualityBtn) return;
    this._applyButtonState(this._qualityBtn, this._quality === 'full');
  }

  _openExport() {
    this._exportOpen = true;
    this._applyButtonState(this._exportBtn, true);
    if (this._exportMenu) this._exportMenu.style.display = 'block';
  }

  _closeExport() {
    this._exportOpen = false;
    if (this._exportMenu) this._exportMenu.style.display = 'none';
    if (this._exportBtn) this._applyButtonState(this._exportBtn, false);
  }

  _handleOutsideClick(event) {
    if (!this._exportOpen) return;
    if (this.element?.contains(event.target)) return;
    this._closeExport();
  }

  _handleFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      this.setSourceInfo(file.name, img.width, img.height);
      this._onSource?.({
        pixels: data.data,
        width: img.width,
        height: img.height,
        name: file.name
      });
    };
    img.src = url;
  }

  setHistoryState(canUndo, canRedo) {
    this._canUndo = !!canUndo;
    this._canRedo = !!canRedo;
    if (this._undoBtn) this._applyDisabledState(this._undoBtn, !this._canUndo);
    if (this._redoBtn) this._applyDisabledState(this._redoBtn, !this._canRedo);
  }

  setSourceInfo(name, w, h) {
    if (!name) {
      this._sourceName = 'ADD SOURCE +';
    } else {
      const label = String(name).toUpperCase();
      this._sourceName = (w && h) ? `${label}  ${w}×${h}` : label;
    }
    if (this._sourceText) this._sourceText.textContent = this._sourceName;
  }

  setVectorState(stackIsAllVector) {
    this._stackIsAllVector = !!stackIsAllVector;
    this._renderExportMenu();
  }

  destroy() {
    document.removeEventListener('click', this._boundOutsideClick);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._closeExport();
    super.destroy();
  }
}
