/**
 * DISTORT — central application state.
 * Owns: source image, effect stack, quality/seed settings, modulation maps,
 * multi-frame animation, render progress, zoom/pan.
 */

/** Default preview scales per quality tier. */
export const QUALITY_DEFAULTS = {
  preview: { previewScale: 0.35 },
  draft:   { previewScale: 0.65 },
  final:   { previewScale: 1 }
};

export class AppState {
  constructor() {
    this.sourceImage  = null;
    this.sourcePixels = null;
    this.sourceW      = 0;
    this.sourceH      = 0;
    this.outputWidth  = 1024;
    this.outputHeight = 1024;
    this.previewScale = QUALITY_DEFAULTS.preview.previewScale;
    this.quality      = 'preview';
    this.globalSeed   = 42;
    this.stack        = [];
    this.soloNodeId   = null;
    this.selectedNodeIdx = -1;
    this.zoom         = 'fit';
    this.zoomLevel    = 1;
    this.panX         = 0;
    this.panY         = 0;
    this.lastRenderTime  = 0;
    this.needsRender  = true;
    this.rendering    = false;
    this.modulationMaps = {};

    // Animation
    this.frames       = [];
    this.frameCount   = 1;
    this.currentFrame = 0;
    this.fps          = 24;
    this.isPlaying    = false;
    this.renderProgress = 0;

    // Internal bridge reference
    this._bridge = null;
  }

  /** Wire in WorkerBridge so scheduleRender() can delegate. */
  setBridge(bridge) { this._bridge = bridge; }

  /**
   * Request a render after an optional debounce delay.
   * If bridge is unavailable, marks needsRender directly.
   * @param {number} [delayMs=80]
   */
  scheduleRender(delayMs = 80) {
    this.needsRender = true;
    if (this._bridge) {
      this._bridge.scheduleRender(delayMs);
    }
  }

  /**
   * Switch quality tier and update previewScale to the tier's default.
   * @param {'preview'|'draft'|'final'} tier
   */
  setQuality(tier) {
    const def = QUALITY_DEFAULTS[tier];
    if (!def) return;
    this.quality = tier;
    this.previewScale = def.previewScale;
    this.invalidateAllCaches();
  }

  /** Normalised frame time in [0, 1) for expression drivers. */
  get frame() { return this.currentFrame; }
  get time()  { return this.frameCount > 1 ? this.currentFrame / this.frameCount : 0; }

  setSource(pixels, w, h) {
    this.sourcePixels = pixels;
    this.sourceW = w;
    this.sourceH = h;
    this.outputWidth = w;
    this.outputHeight = h;
    this.frames = [pixels];
    this.frameCount = 1;
    this.currentFrame = 0;
  }

  setStack(stack) {
    this.stack = Array.isArray(stack) ? stack : [];
    this.invalidateAllCaches();
    this.needsRender = true;
  }

  setFrames(framesArray, w, h) {
    this.frames = framesArray;
    this.frameCount = framesArray.length;
    this.currentFrame = 0;
    this.sourceW = w;
    this.sourceH = h;
    this.sourcePixels = framesArray[0];
  }

  seekFrame(idx) {
    this.currentFrame = Math.max(0, Math.min(this.frameCount - 1, idx));
    if (this.frames[this.currentFrame]) {
      this.sourcePixels = this.frames[this.currentFrame];
      this.invalidateAllCaches();
      this.needsRender = true;
    }
  }

  addModulationMap(name, pixels, w, h) {
    this.modulationMaps[name] = { sourcePixels: pixels, sourceW: w, sourceH: h, name };
  }

  removeModulationMap(name) { delete this.modulationMaps[name]; }
  getModMapNames() { return Object.keys(this.modulationMaps); }

  /** Invalidate all node caches (e.g. after quality change or source swap). */
  invalidateAllCaches() {
    for (const n of this.stack) { n._cacheValid = false; }
  }

  /** Invalidate caches from node index `fromIdx` onwards. */
  invalidateCachesFrom(fromIdx) {
    for (let i = fromIdx; i < this.stack.length; i++) { this.stack[i]._cacheValid = false; }
  }
}
