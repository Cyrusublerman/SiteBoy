import { ToolBase } from '../../../tools/core/tool-base.js';
import { AppState } from './core/AppState.js';
import { Pipeline } from './core/Pipeline.js';
import { WorkerBridge } from './core/WorkerBridge.js';
import { History } from './core/History.js';
import { Recipe } from './core/Recipe.js';
import { REGISTRY } from './nodes/registry.js';
import { DistortToolbar } from '../../../shared/components/tool/distort/DistortToolbar.js';
import { EffectStack } from '../../../shared/components/tool/distort/EffectStack.js';
import { ViewportCanvas } from '../../../shared/components/tool/distort/ViewportCanvas.js';
import { TransportStrip } from '../../../shared/components/tool/distort/TransportStrip.js';
import { BaseComponent } from '../../../shared/foundation.js';

const BLOCK_TITLE_MAP = {
  SOURCE: 'Source',
  STACK: 'Stack',
  OUTPUT: 'Output',
  SEED: 'Seed',
  ANIMATION: 'Animation',
};

export const TOOL_CONFIG = {
  id: 'distort',
  name: 'DISTORT',
  description: 'Image Processing Pipeline — sequential pixel effect stacks',
  url: '/tools/processors/distort',
  category: 'processors',
  version: '3.0.0'
};

export class DistortTool extends BaseComponent {
  constructor(container, deps = {}) {
    super({ componentType: 'distort-tool' }, deps);
    this._container = container;
    this.componentInstances = [];

    this._state = new AppState();
    this._pipeline = new Pipeline(this._state);
    this._history = new History(40);
    this._bridge = null;

    this._toolbar = null;
    this._toolBase = null;
    this._stack = null;
    this._viewport = null;
    this._transport = null;
    this._sourceReadout = null;
    this._sourceName = '';
    this._tmpAnchors = new Set();
  }

  render() {
    if (this.element) return this;

    this.element = this.createElement('div', 'distort-root');
    this.element.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: var(--c-bg);
      color: var(--c-text);
      font-family: 'Space Mono', monospace;
      overflow: hidden;
    `;

    this._toolbar = new DistortToolbar({
      quality: this._state.quality,
      zoom: 'fit',
      onSource: asset => this._loadSource(asset),
      onUndo: () => this._undo(),
      onRedo: () => this._redo(),
      onZoom: mode => this._viewport?.setZoom(mode),
      onQuality: tier => {
        this._state.setQuality(tier === 'full' ? 'final' : 'preview');
        this._scheduleRender();
      },
      onExport: key => this._handleExport(key),
    }, this.deps);
    this._toolbar.render();
    this.element.appendChild(this._toolbar.element);
    this.componentInstances.push(this._toolbar);

    this._toolBase = this._buildToolBase();
    this.element.appendChild(this._toolBase.element);
    this.componentInstances.push(this._toolBase);

    this._container.innerHTML = '';
    this._container.appendChild(this.element);

    this._bridge = new WorkerBridge(this._state, result => this._onRenderResult(result));
    this._bridge.setFallback(this._pipeline);
    this._state.setBridge(this._bridge);

    this._syncUiFromState();
    this._toolbar.setHistoryState(this._history.canUndo, this._history.canRedo);
    this._snapshot();
    return this;
  }

  _buildToolBase() {
    const toolBase = new ToolBase({
      title: 'DISTORT',
      canvas: { mode: 'none' },
      sidebar: [
        ['PIPELINE', [
          ['SOURCE', []],
          ['STACK', []],
        ]],
        ['CANVAS', [
          ['OUTPUT', [
            ['slider', 'WIDTH', 256, 4096, 1, { key: 'outputWidth', value: this._state.outputWidth, withNumber: true }],
            ['slider', 'HEIGHT', 256, 4096, 1, { key: 'outputHeight', value: this._state.outputHeight, withNumber: true }],
          ]],
          ['SEED', [
            ['slider', 'GLOBAL SEED', 0, 99999, 1, { key: 'globalSeed', value: this._state.globalSeed, withNumber: true }],
            ['button', 'RANDOMISE SEED', { key: 'randomSeed', onClick: () => this._randomiseSeed() }],
          ]],
          ['ANIMATION', [
            ['slider', 'FRAME COUNT', 1, 240, 1, { key: 'frameCount', value: this._state.frameCount, withNumber: true }],
            ['slider', 'FPS', 1, 120, 1, { key: 'fps', value: this._state.fps, withNumber: true }],
          ]],
        ]],
      ],
      onInit: function () {
        return undefined;
      },
      onUpdate: (key, value) => this._onToolBaseUpdate(key, value),
    }, this.deps);

    toolBase.render();
    toolBase.element.style.flex = '1';
    toolBase.element.style.minHeight = '0';
    this._onToolBaseInit(toolBase);
    return toolBase;
  }

  _onToolBaseInit(tb) {
    this._applyBlockTitles(tb);

    const sourceBlock = this._findBlock(tb, 'SOURCE');
    const stackBlock = this._findBlock(tb, 'STACK');

    if (sourceBlock) {
      const { F } = this.getF();
      this._sourceReadout = this.createElement('div', 'distort-source-readout');
      this._sourceReadout.style.cssText = `
        min-height: ${F * 2}px;
        padding: 0 ${F}px;
        border: 1px solid var(--c-border);
        display: flex;
        align-items: center;
        color: var(--c-text);
        font-family: 'Space Mono', monospace;
        font-size: ${F * 0.75}px;
        box-sizing: border-box;
      `;
      sourceBlock.appendChild(this._sourceReadout);
    }

    this._stack = new EffectStack({
      nodes: this._state.stack ?? [],
      onChange: event => this._handleStackChange(event)
    }, this.deps);
    this._stack.render();
    this._stack.element.style.flex = '1';

    if (stackBlock) {
      stackBlock.style.display = 'flex';
      stackBlock.style.flexDirection = 'column';
      stackBlock.style.flex = '1';
      stackBlock.style.minHeight = '0';
      stackBlock.style.overflow = 'hidden';
      stackBlock.appendChild(this._stack.element);
    }
    this.componentInstances.push(this._stack);

    const canvasArea = tb.canvasArea;
    canvasArea.style.display = 'flex';
    canvasArea.style.flexDirection = 'column';
    canvasArea.style.minHeight = '0';

    this._viewport = new ViewportCanvas({ zoom: 'fit' }, this.deps);
    this._viewport.render();
    this._viewport.element.style.flex = '1';
    this._viewport.element.style.minHeight = '0';
    canvasArea.appendChild(this._viewport.element);
    this.componentInstances.push(this._viewport);

    this._transport = new TransportStrip({
      frameCount: this._state.frameCount,
      fps: this._state.fps,
      onFrame: frame => {
        this._viewport?.setVariations(null);
        this._state.seekFrame(frame);
        this._scheduleRender();
      }
    }, this.deps);
    this._transport.render();
    canvasArea.appendChild(this._transport.element);
    this.componentInstances.push(this._transport);

    this._syncUiFromState();
    this._refreshVectorState();
    this._updateTransportVisibility();
  }

  _applyBlockTitles(tb) {
    for (const block of (tb.blocks ?? [])) {
      const titleEl = block.querySelector('[class*="tool-block-header"] span');
      const raw = titleEl?.textContent?.trim().toUpperCase();
      if (titleEl && raw && BLOCK_TITLE_MAP[raw]) {
        titleEl.textContent = BLOCK_TITLE_MAP[raw];
        titleEl.style.textTransform = 'none';
      }
    }
  }

  _handleStackChange(event = {}) {
    this._viewport?.setVariations(null);
    this._state.setStack(this._stack?.getNodes?.() ?? []);
    this._state.soloNodeId = event.soloNodeId ?? null;
    this._syncModulationMaps();
    this._refreshVectorState();
    this._toolbar?.setHistoryState(this._history.canUndo, this._history.canRedo);

    if (event.type && event.type !== 'ui') {
      this._snapshot();
      this._toolbar?.setHistoryState(this._history.canUndo, this._history.canRedo);
      this._scheduleRender();
    }
  }

  _onToolBaseUpdate(key, value) {
    this._viewport?.setVariations(null);
    switch (key) {
      case 'outputWidth':
        this._state.outputWidth = value;
        this._scheduleRender();
        break;
      case 'outputHeight':
        this._state.outputHeight = value;
        this._scheduleRender();
        break;
      case 'globalSeed':
        this._state.globalSeed = value;
        this._scheduleRender();
        break;
      case 'frameCount':
        this._state.frameCount = Math.max(1, value);
        this._state.currentFrame = Math.min(this._state.currentFrame, this._state.frameCount - 1);
        this._transport?.setFrameCount(this._state.frameCount);
        this._updateTransportVisibility();
        this._scheduleRender();
        break;
      case 'fps':
        this._state.fps = Math.max(1, value);
        this._transport?.setFps(this._state.fps);
        break;
      default:
        break;
    }
  }

  _findBlock(tb, title) {
    for (const block of (tb.blocks ?? [])) {
      const header = block.querySelector('[class*="tool-block-header"] span');
      if (header?.textContent?.trim().toUpperCase() === title.toUpperCase()) {
        return block.querySelector('.tool-block-content') ?? block;
      }
    }
    return null;
  }

  _setSourceReadout() {
    if (!this._sourceReadout) return;
    if (!this._state.sourceW || !this._sourceName) {
      this._sourceReadout.textContent = 'NO SOURCE';
      return;
    }
    this._sourceReadout.textContent = `${this._state.sourceW} × ${this._state.sourceH}  ${this._sourceName}`;
  }

  _syncUiFromState() {
    this._toolbar?.setSourceInfo(this._sourceName || '');
    this._toolBase?.setValue('outputWidth', this._state.outputWidth);
    this._toolBase?.setValue('outputHeight', this._state.outputHeight);
    this._toolBase?.setValue('globalSeed', this._state.globalSeed);
    this._toolBase?.setValue('frameCount', this._state.frameCount);
    this._toolBase?.setValue('fps', this._state.fps);
    this._stack?.setSoloNodeId?.(this._state.soloNodeId ?? null);
    this._setSourceReadout();
    this._transport?.setFrameCount(this._state.frameCount);
    this._transport?.setFrameIndex(this._state.currentFrame ?? 0);
    this._transport?.setFps(this._state.fps);
    this._updateTransportVisibility();
  }

  _updateTransportVisibility() {
    if (!this._transport?.element) return;
    this._transport.element.style.display = this._state.frameCount > 1 ? 'flex' : 'none';
  }

  _loadSource(asset) {
    this._sourceName = asset.name ?? '';
    this._state.setSource(asset.pixels, asset.width, asset.height);
    this._viewport?.setSource({ pixels: asset.pixels, width: asset.width, height: asset.height });
    this._viewport?.setVariations(null);
    this._syncUiFromState();
    this._snapshot();
    this._scheduleRender();
  }

  _randomiseSeed() {
    this._state.globalSeed = Math.floor(Math.random() * 99999);
    this._toolBase?.setValue('globalSeed', this._state.globalSeed);
    this._viewport?.setVariations(null);
    this._scheduleRender();
  }

  _scheduleRender() {
    if (!this._state.sourcePixels) return;
    this._syncModulationMaps();
    this._viewport?.setLoading(true);
    this._state.scheduleRender(80);
  }

  _onRenderResult(result) {
    if (!result) return;
    this._viewport?.setResult(result);
    this._viewport?.setLoading(false);
  }

  _snapshot() {
    this._history.push(this._state, REGISTRY);
    this._toolbar?.setHistoryState(this._history.canUndo, this._history.canRedo);
  }

  _undo() {
    if (!this._history.canUndo) return;
    this._history.undo(this._state, REGISTRY);
    this._stack?.setNodes(this._state.stack ?? []);
    this._syncUiFromState();
    this._refreshVectorState();
    this._toolbar?.setHistoryState(this._history.canUndo, this._history.canRedo);
    this._scheduleRender();
  }

  _redo() {
    if (!this._history.canRedo) return;
    this._history.redo(this._state, REGISTRY);
    this._stack?.setNodes(this._state.stack ?? []);
    this._syncUiFromState();
    this._refreshVectorState();
    this._toolbar?.setHistoryState(this._history.canUndo, this._history.canRedo);
    this._scheduleRender();
  }

  _handleExport(key) {
    switch (key) {
      case 'exportPng': return this._exportPNG();
      case 'exportSvg': return this._exportSVG();
      case 'saveRecipe': return this._exportRecipe();
      case 'loadRecipe': return this._importRecipe();
      case 'variations2': return this._showVariations(2);
      case 'variations3': return this._showVariations(3);
      case 'variations4': return this._showVariations(4);
      case 'renderSequence': return this._renderSequence();
      default: return undefined;
    }
  }

  _exportPNG() {
    const result = this._viewport?._result;
    if (!result) return;
    const offscreen = new OffscreenCanvas(result.width, result.height);
    const ctx = offscreen.getContext('2d');
    const imageData = ctx.createImageData(result.width, result.height);
    imageData.data.set(result.pixels);
    ctx.putImageData(imageData, 0, 0);
    offscreen.convertToBlob({ type: 'image/png' }).then(blob => {
      this._downloadBlob(blob, `distort-${Date.now()}.png`);
    });
  }

  _exportSVG() {
    const stack = this._state.stack ?? [];
    if (!stack.length || !stack.every(node => typeof node.buildGeometry === 'function')) return;

    const w = this._state.sourceW || this._state.outputWidth || 1024;
    const h = this._state.sourceH || this._state.outputHeight || 1024;
    const ctx = {
      width: w,
      height: h,
      frame: this._state.frame ?? 0,
      frameCount: this._state.frameCount ?? 1,
      time: this._state.time ?? 0,
      quality: this._state.quality,
      globalSeed: this._state.globalSeed
    };

    const paths = [];
    for (const node of stack) {
      const lines = node.buildGeometry(w, h, ctx) || [];
      for (const line of lines) {
        if (!line?.length) continue;
        const d = line.map((point, idx) => `${idx ? 'L' : 'M'} ${Math.round(point[0])} ${Math.round(point[1])}`).join(' ');
        paths.push(`<path d="${d}" fill="none" stroke="#ffffff" stroke-width="1"/>`);
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect x="0" y="0" width="${w}" height="${h}" fill="#000000"/>
${paths.join('\n')}
</svg>`;
    this._downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `distort-${Date.now()}.svg`);
  }

  _exportRecipe() {
    const json = Recipe.exp(this._state, REGISTRY);
    this._downloadBlob(new Blob([json], { type: 'application/json' }), `distort-recipe-${Date.now()}.json`);
  }

  _importRecipe() {
    const input = this.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    this.element.appendChild(input);
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      input.remove();
      const reader = new FileReader();
      reader.onload = event => {
        try {
          Recipe.imp(this._state, event.target.result, REGISTRY);
          this._stack?.setNodes(this._state.stack ?? []);
          this._syncUiFromState();
          this._refreshVectorState();
          this._snapshot();
          this._scheduleRender();
        } catch (error) {
          console.error('[DISTORT] Recipe import failed:', error);
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  _showVariations(gridSize = 3) {
    if (!this._viewport || !this._state.stack?.length || !this._state.sourcePixels) return;
    const prevSeed = this._state.globalSeed;
    const count = Math.max(1, gridSize * gridSize);
    const variations = [];

    for (let i = 0; i < count; i++) {
      this._state.globalSeed = (prevSeed + i * 37) % 99999;
      this._state.invalidateAllCaches();
      const result = this._pipeline.render();
      if (!result) continue;
      variations.push({
        pixels: new Uint8ClampedArray(result.pixels),
        width: result.width,
        height: result.height,
        seed: this._state.globalSeed
      });
      this._pipeline.releaseResult(result);
    }

    this._state.globalSeed = prevSeed;
    this._state.invalidateAllCaches();
    this._viewport.setVariations(variations);
    this._scheduleRender();
  }

  async _renderSequence() {
    const total = Math.max(1, this._state.frameCount ?? 1);
    const prevFrame = this._state.currentFrame ?? 0;
    const blobs = [];

    for (let i = 0; i < total; i++) {
      this._state.currentFrame = i;
      this._state.invalidateAllCaches();
      const result = this._pipeline.render();
      if (!result) continue;
      const blob = await this._pixelsToPngBlob(result.pixels, result.width, result.height);
      this._pipeline.releaseResult(result);
      if (blob) blobs.push({ name: `frame-${String(i).padStart(4, '0')}.png`, blob });
    }

    this._state.currentFrame = prevFrame;
    this._state.invalidateAllCaches();
    this._scheduleRender();

    if (!blobs.length) return;
    if (window.JSZip) {
      const zip = new window.JSZip();
      blobs.forEach(file => zip.file(file.name, file.blob));
      const out = await zip.generateAsync({ type: 'blob' });
      this._downloadBlob(out, `distort-sequence-${Date.now()}.zip`);
      return;
    }
    this._downloadBlob(blobs[0].blob, blobs[0].name);
  }

  async _pixelsToPngBlob(pixels, w, h) {
    const offscreen = new OffscreenCanvas(w, h);
    const ctx = offscreen.getContext('2d');
    const imageData = ctx.createImageData(w, h);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    return offscreen.convertToBlob({ type: 'image/png' });
  }

  _downloadBlob(blob, filename) {
    const link = this.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    this.element.appendChild(link);
    this._tmpAnchors.add(link);
    link.click();
    setTimeout(() => {
      if (this._tmpAnchors.has(link)) {
        this._tmpAnchors.delete(link);
        link.parentNode?.removeChild(link);
      }
      URL.revokeObjectURL(link.href);
    }, 300);
  }

  _refreshVectorState() {
    const stack = this._state.stack ?? [];
    const allVector = !!stack.length && stack.every(node => typeof node.buildGeometry === 'function');
    this._toolbar?.setVectorState(allVector);
  }

  _syncModulationMaps() {
    this._state.modulationMaps = {};
    for (const node of (this._state.stack ?? [])) {
      const mods = node.modulation ?? {};
      for (const [key, cfg] of Object.entries(mods)) {
        if (!cfg || cfg.mode !== 'image' || !cfg.imageAsset) continue;
        const mapId = cfg.mapId || `${node.id}-${key}`;
        cfg.mapId = mapId;
        this._state.addModulationMap(mapId, cfg.imageAsset.pixels, cfg.imageAsset.width, cfg.imageAsset.height);
      }
    }
  }

  destroy() {
    this._bridge?.destroy?.();
    for (const link of this._tmpAnchors) link.parentNode?.removeChild?.(link);
    this._tmpAnchors.clear();
    for (const instance of this.componentInstances) instance?.destroy?.();
    this.componentInstances = [];
    super.destroy();
  }
}

export default DistortTool;
