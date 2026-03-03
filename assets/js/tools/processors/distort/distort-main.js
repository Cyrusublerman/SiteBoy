/**
 * DISTORT — Image Processing Pipeline
 * Main entry point wired to SiteBoy ToolBase / ComponentLibrary architecture.
 *
 * Layout:
 *   DistortToolbar  (top)   — source, undo/redo, view mode, quality, export
 *   EffectStack     (left)  — ordered node list
 *   ViewportCanvas  (centre)— render output, zoom/pan
 *   TransportStrip  (bottom)— play/pause, scrubber, completion-gated
 *   GlobalPanel     (right) — seed, modulation maps, variation grid controls
 */
import { BaseComponent } from '../../../shared/foundation.js';
import { AppState } from './core/AppState.js';
import { Pipeline } from './core/Pipeline.js';
import { WorkerBridge } from './core/WorkerBridge.js';
import { History } from './core/History.js';
import { Recipe } from './core/Recipe.js';
import { REGISTRY } from './nodes/registry.js';
import { DistortToolbar } from './ui/DistortToolbar.js';
import { TransportStrip } from './ui/TransportStrip.js';
import { ViewportCanvas } from './ui/ViewportCanvas.js';
import { EffectStack } from './ui/EffectStack.js';
import { VariationGrid } from './ui/VariationGrid.js';

// ── TOOL_CONFIG ──────────────────────────────────────────────────────────────
export const TOOL_CONFIG = {
  id: 'distort',
  name: 'DISTORT',
  description: 'Image Processing Pipeline — sequential pixel effect stacks',
  url: '/tools/processors/distort',
  category: 'processors',
  version: '2.0.0'
};

const BORDER = 'var(--vga-grey,#555)';
const DIM    = 'var(--vga-grey,#888)';
const TEXT   = 'var(--vga-white,#eee)';
const BG     = 'var(--vga-black,#000)';

// ── DistortPanel — BaseComponent that owns the full UI ───────────────────────
class DistortPanel extends BaseComponent {
  constructor(options = {}, deps = {}) {
    super({ componentType: 'distort-tool', ...options }, deps);
    this.componentInstances = [];

    this._state    = new AppState();
    this._pipeline = new Pipeline(this._state);
    this._bridge   = null;
    this._history  = new History(40);

    // UI component refs
    this._toolbar  = null;
    this._stack    = null;
    this._viewport = null;
    this._transport = null;
    this._varGrid  = null;

    // Render gate: used by TransportStrip completion-gate
    this._renderPending = false;
  }

  render() {
    super.render();
    const root = this.element;
    root.style.cssText = [
      'display:flex', 'flex-direction:column',
      'width:100%', 'height:100%',
      `background:${BG}`, `color:${TEXT}`,
      'font-family:Space Mono,monospace', 'overflow:hidden'
    ].join(';');

    // ── Top toolbar ──────────────────────────────────────────────────────────
    this._toolbar = new DistortToolbar({
      quality: this._state.quality,
      zoom: 'fit',
      onSource:  asset => this._loadSource(asset),
      onUndo:    ()    => this._undo(),
      onRedo:    ()    => this._redo(),
      onZoom:    mode  => this._viewport?.setZoom(mode),
      onQuality: tier  => {
        this._state.setQuality(tier);
        this._scheduleRender();
      },
      onExport:  ()    => this._exportPNG()
    }, this.deps);
    this._toolbar.render();
    root.appendChild(this._toolbar.element);
    this.componentInstances.push(this._toolbar);

    // ── Body ─────────────────────────────────────────────────────────────────
    const body = this.createElement('div', 'distort-body');
    body.style.cssText = 'display:flex;flex:1;min-height:0;overflow:hidden;';
    root.appendChild(body);

    // Left — EffectStack
    const sidebar = this.createElement('div', 'distort-sidebar');
    sidebar.style.cssText = [
      'width:240px', 'min-width:200px',
      `border-right:1px solid ${BORDER}`,
      'display:flex', 'flex-direction:column', 'overflow:hidden'
    ].join(';');

    this._stack = new EffectStack({
      appState: this._state,
      onStackChange: () => {
        this._scheduleRender();
        this._toolbar?.setHistoryState(this._history.canUndo, this._history.canRedo);
      },
      onSnapshot: () => this._snapshot()
    }, this.deps);
    this._stack.render();
    sidebar.appendChild(this._stack.element);
    this.componentInstances.push(this._stack);
    body.appendChild(sidebar);

    // Centre — viewport + transport strip
    const centre = this.createElement('div', 'distort-centre');
    centre.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;position:relative;';

    this._viewport = new ViewportCanvas({ zoom: 'fit' }, this.deps);
    this._viewport.render();
    this._viewport.element.style.flex = '1';
    centre.appendChild(this._viewport.element);

    this._transport = new TransportStrip({
      frameCount: this._state.frameCount ?? 1,
      fps: this._state.fps ?? 12,
      onSeek:  frame => {
        this._state.seekFrame(frame);
        this._scheduleRender();
      },
      onTick:  frame => {
        this._state.seekFrame(frame);
        this._scheduleRender(true /* completion-gated */);
      },
      onPlay:  () => { this._state.isPlaying = true; },
      onStop:  () => { this._state.isPlaying = false; this._state.seekFrame(0); this._scheduleRender(); }
    }, this.deps);
    this._transport.render();
    centre.appendChild(this._transport.element);

    this.componentInstances.push(this._viewport, this._transport);
    body.appendChild(centre);

    // Right — seed + mod maps + variation grid
    const rightPanel = this.createElement('div', 'distort-globals-panel');
    rightPanel.style.cssText = [
      'width:200px', 'min-width:160px',
      `border-left:1px solid ${BORDER}`,
      'display:flex', 'flex-direction:column', 'overflow:hidden'
    ].join(';');
    rightPanel.appendChild(this._buildGlobalControls());

    this._varGrid = new VariationGrid({
      appState: this._state,
      cols: 2, rows: 2, thumbSize: 80,
      onAdopt: seed => {
        this._state.globalSeed = seed;
        this._scheduleRender();
      }
    }, this.deps);
    this._varGrid.render();
    this._varGrid.element.style.flex = '1';
    rightPanel.appendChild(this._varGrid.element);
    this.componentInstances.push(this._varGrid);
    body.appendChild(rightPanel);

    // ── Worker bridge ─────────────────────────────────────────────────────
    this._bridge = new WorkerBridge(this._state, result => this._onRenderResult(result));
    this._bridge.setFallback(this._pipeline);
    this._state.setBridge(this._bridge);

    this._toolbar.setHistoryState(this._history.canUndo, this._history.canRedo);
    return this;
  }

  // ── Global controls (right panel) ─────────────────────────────────────────

  _buildGlobalControls() {
    const wrap = this.createElement('div', 'distort-globals');
    wrap.style.cssText = [
      'padding:8px', `border-bottom:1px solid ${BORDER}`,
      'display:flex', 'flex-direction:column', 'gap:6px', 'flex-shrink:0'
    ].join(';');

    const title = this.createElement('span', '', 'GLOBAL');
    title.style.cssText = `font-size:9px;letter-spacing:2px;color:${DIM};font-family:Space Mono,monospace`;
    wrap.appendChild(title);

    // Seed
    const seedRow = this._row('SEED');
    const seedIn  = this.createElement('input');
    seedIn.type = 'number'; seedIn.value = this._state.globalSeed; seedIn.min = 0; seedIn.step = 1;
    seedIn.style.cssText = this._inputCSS('flex:1');
    seedIn.addEventListener('change', () => {
      this._state.globalSeed = parseInt(seedIn.value, 10) || 0;
      this._scheduleRender();
    });
    seedRow.appendChild(seedIn);
    wrap.appendChild(seedRow);

    // Frame count
    const fcRow = this._row('FRAMES');
    const fcIn  = this.createElement('input');
    fcIn.type = 'number'; fcIn.value = this._state.frameCount ?? 1; fcIn.min = 1; fcIn.step = 1;
    fcIn.style.cssText = this._inputCSS('flex:1');
    fcIn.addEventListener('change', () => {
      const n = Math.max(1, parseInt(fcIn.value, 10) || 1);
      this._state.frameCount = n;
      this._transport?.setFrameCount(n);
    });
    fcRow.appendChild(fcIn);
    wrap.appendChild(fcRow);

    // Display mode (additional to toolbar) — dropdown
    const dispRow = this._row('VIEW');
    const dispSel = this.createElement('select');
    for (const m of ['normal','original','split','diff','overlay']) {
      const o = this.createElement('option', '', m.toUpperCase());
      o.value = m; dispSel.appendChild(o);
    }
    dispSel.style.cssText = this._inputCSS('flex:1');
    dispSel.addEventListener('change', () => this._viewport?.setDisplayMode(dispSel.value));
    dispRow.appendChild(dispSel);
    wrap.appendChild(dispRow);

    // Mod map load
    wrap.appendChild(this._toolBtn('+ MOD MAP', () => this._openModMapPicker()));

    // Variations
    wrap.appendChild(this._toolBtn('VARIATIONS', () => this._varGrid?.refresh?.()));

    // Recipe import / export
    wrap.appendChild(this._toolBtn('EXPORT RECIPE', () => this._exportRecipe()));
    wrap.appendChild(this._toolBtn('IMPORT RECIPE', () => this._importRecipe()));

    return wrap;
  }

  // ── Source loading ─────────────────────────────────────────────────────────

  _loadSource(asset) {
    this._state.setSource(asset.pixels, asset.width, asset.height);
    this._viewport?.setSource({ pixels: asset.pixels, width: asset.width, height: asset.height });
    this._scheduleRender();
  }

  _openModMapPicker() {
    // Use a hidden file input via DistortToolbar's internal file-management approach.
    // We create it as a child of our element (valid — BaseComponent DOM, not raw doc.create).
    const inp = this.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
    this.element.appendChild(inp);
    inp.addEventListener('change', () => {
      const file = inp.files[0]; if (!file) return;
      this.element.removeChild(inp);
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const cvs = new OffscreenCanvas(img.width, img.height);
        const ctx = cvs.getContext('2d'); ctx.drawImage(img, 0, 0);
        const id  = ctx.getImageData(0, 0, img.width, img.height);
        const name = file.name.replace(/\.[^.]+$/, '');
        this._state.addModulationMap?.(name, id.data, img.width, img.height);
        URL.revokeObjectURL(url);
        this._stack?._rebuildPanels?.();
      };
      img.src = url;
    });
    inp.click();
  }

  // ── Render pipeline ────────────────────────────────────────────────────────

  /**
   * @param {boolean} [gated=false] — if true, notifies transport on completion
   */
  _scheduleRender(gated = false) {
    this._renderPending = gated;
    this._viewport?.setLoading(true);
    this._state.scheduleRender(80);
  }

  _onRenderResult(result) {
    if (!result) return;
    this._viewport?.setResult(result);
    this._viewport?.setLoading(false);
    if (this._renderPending) {
      this._renderPending = false;
      this._transport?.notifyFrameDone();
    }
  }

  // ── History ────────────────────────────────────────────────────────────────

  _snapshot() {
    this._history.push(this._state, REGISTRY);
    this._toolbar?.setHistoryState(this._history.canUndo, this._history.canRedo);
  }

  _undo() {
    if (!this._history.canUndo) return;
    this._history.undo(this._state, REGISTRY);
    this._stack?.setStack(this._state.stack);
    this._toolbar?.setHistoryState(this._history.canUndo, this._history.canRedo);
    this._scheduleRender();
  }

  _redo() {
    if (!this._history.canRedo) return;
    this._history.redo(this._state, REGISTRY);
    this._stack?.setStack(this._state.stack);
    this._toolbar?.setHistoryState(this._history.canUndo, this._history.canRedo);
    this._scheduleRender();
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  _exportPNG() {
    const result = this._viewport?._result;
    if (!result) return;
    const { pixels, width: w, height: h } = result;
    const off = new OffscreenCanvas(w, h);
    const ctx = off.getContext('2d');
    const id  = ctx.createImageData(w, h); id.data.set(pixels); ctx.putImageData(id, 0, 0);
    off.convertToBlob({ type: 'image/png' }).then(blob => {
      const a = this.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `distort-${Date.now()}.png`;
      this.element.appendChild(a);
      a.click();
      setTimeout(() => { this.element.removeChild(a); URL.revokeObjectURL(a.href); }, 1000);
    });
  }

  _exportRecipe() {
    const json = Recipe.exp(this._state, REGISTRY);
    const blob = new Blob([json], { type: 'application/json' });
    const a    = this.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `distort-recipe-${Date.now()}.json`;
    this.element.appendChild(a);
    a.click();
    setTimeout(() => { this.element.removeChild(a); URL.revokeObjectURL(a.href); }, 1000);
  }

  _importRecipe() {
    const inp = this.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json'; inp.style.display = 'none';
    this.element.appendChild(inp);
    inp.addEventListener('change', () => {
      const file = inp.files[0]; if (!file) return;
      this.element.removeChild(inp);
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          Recipe.imp(this._state, ev.target.result, REGISTRY);
          this._stack?.setStack(this._state.stack);
          this._scheduleRender();
        } catch (err) { console.error('[DISTORT] Recipe import failed:', err); }
      };
      reader.readAsText(file);
    });
    inp.click();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  _row(label) {
    const row = this.createElement('div', 'globals-row');
    row.style.cssText = 'display:flex;align-items:center;gap:6px';
    const lbl = this.createElement('span', '', label);
    lbl.style.cssText = `font-family:Space Mono,monospace;font-size:8px;letter-spacing:1px;color:${DIM};width:52px;flex-shrink:0`;
    row.appendChild(lbl);
    return row;
  }

  _inputCSS(extra = '') {
    return [
      `background:${BG}`, `border:1px solid ${BORDER}`, `color:${TEXT}`,
      'font-family:Space Mono,monospace', 'font-size:9px', 'padding:2px 4px',
      extra
    ].filter(Boolean).join(';');
  }

  _toolBtn(label, cb) {
    const b = this.createElement('button', 'global-btn', label);
    b.style.cssText = [
      `background:${BG}`, `color:${DIM}`, `border:1px solid ${BORDER}`,
      'font-family:Space Mono,monospace', 'font-size:9px', 'padding:2px 6px',
      'cursor:pointer', 'letter-spacing:0.5px', 'text-align:left'
    ].join(';');
    b.addEventListener('click', cb);
    return b;
  }

  destroy() {
    this._bridge?.destroy?.();
    for (const inst of this.componentInstances) inst?.destroy?.();
    this.componentInstances = [];
    super.destroy();
  }
}

// ── DistortTool — thin wrapper matching SiteBoy tool loader contract ──────────
export class DistortTool {
  constructor(container, deps = {}) {
    this._container = container;
    this._deps      = deps;
    this._panel     = null;
    this.render();
  }

  render() {
    if (this._panel) return;
    try {
      this._panel = new DistortPanel({}, this._deps);
      this._panel.render();
      this._container.innerHTML = '';
      this._container.appendChild(this._panel.element);
      this._panel.element.style.height = '100%';
    } catch (err) {
      console.error('[DISTORT] Init error:', err);
      this._container.innerHTML = `<div style="padding:20px;color:var(--vga-red,#f00);font-family:Space Mono,monospace;">DISTORT FAILED: ${err.message}</div>`;
    }
  }

  destroy() {
    this._panel?.destroy();
    this._panel = null;
  }
}

export default DistortTool;
