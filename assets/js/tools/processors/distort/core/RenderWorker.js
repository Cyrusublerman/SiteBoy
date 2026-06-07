/**
 * DISTORT — Web Worker thread for off-main-thread Pipeline execution.
 *
 * Supported message types:
 *   'render'   — single-frame render; echoes renderId in response
 *   'sequence' — render all provided frames, post progress + final result
 *
 * renderId is echoed back so WorkerBridge can discard stale responses.
 */
import { AppState } from './AppState.js';
import { Pipeline } from './Pipeline.js';
import { REGISTRY } from '../nodes/registry.js';

const state    = new AppState();
const pipeline = new Pipeline(state);
const allEntries = Object.values(REGISTRY).flat();

// Signal the bridge that the worker module is fully loaded and ready to receive messages.
// Without this, dispatches during the module-load window are silently dropped.
self.postMessage({ type: 'ready' });

function _buildStack(msgStack) {
  const stack = [];
  for (const nd of msgStack) {
    const entry = allEntries.find(e => e.type === nd.type);
    if (!entry) continue;
    const node = entry.factory();
    node.enabled   = nd.enabled;
    node.opacity   = nd.opacity;
    node.blendMode = nd.blendMode ?? 'normal';
    for (const k in nd.params) if (k in node.params) node.params[k] = nd.params[k];
    if (nd.mask) {
      node.mask.enabled = !!nd.mask.enabled;
      node.mask.source = nd.mask.source ?? 'none';
      node.mask.invert = !!nd.mask.invert;
      node.mask.feather = nd.mask.feather ?? 0;
      if (nd.mask._sourcePixels) {
        node.mask._sourcePixels = new Uint8ClampedArray(nd.mask._sourcePixels);
        node.mask._sourceW = nd.mask._sourceW ?? 0;
        node.mask._sourceH = nd.mask._sourceH ?? 0;
      }
      if (nd.mask._drawPixels) {
        node.mask._drawPixels = new Uint8Array(nd.mask._drawPixels);
        node.mask._drawW = nd.mask._drawW ?? 0;
        node.mask._drawH = nd.mask._drawH ?? 0;
      }
    }
    if (nd.modulation) {
      node.modulation = { ...nd.modulation };
    }
    stack.push(node);
  }
  return stack;
}

function _applyMsg(msg) {
  state.sourceW      = msg.sourceW;
  state.sourceH      = msg.sourceH;
  state.quality      = msg.quality;
  state.previewScale = msg.previewScale;
  // If the sent pixels are already downsampled, set scale to 1 so Pipeline skips downsample
  state._preScaled   = !!msg.preScaled;
  state.globalSeed   = msg.globalSeed;
  state.soloNodeId   = msg.soloNodeId ?? null;
  state.currentFrame = msg.frame ?? 0;
  state.frameCount   = msg.frameCount ?? 1;
  state.needsRender  = true;
  state.rendering    = false;
}

self.onmessage = function (e) {
  const msg = e.data;

  if (msg.type === 'render') {
    try {
      state.sourcePixels = new Uint8ClampedArray(msg.sourcePixels);
      _applyMsg(msg);
      state.modulationMaps = {};
      for (const [name, m] of Object.entries(msg.modulationMaps ?? {})) {
        state.modulationMaps[name] = {
          sourcePixels: new Uint8ClampedArray(m.pixels),
          sourceW: m.sourceW,
          sourceH: m.sourceH,
          name,
        };
      }
      state.stack = _buildStack(msg.stack);
      for (const n of state.stack) { n._cacheValid = false; }

      const result = pipeline.render();
      if (result) {
        const buf = result.pixels.buffer;
        self.postMessage({
          type: 'result',
          renderId: msg.renderId,
          pixels: buf,
          width: result.width,
          height: result.height,
          renderTime: state.lastRenderTime
        }, [buf]);
      }
    } catch (err) {
      // Report error back so WorkerBridge can fall back to sync pipeline instead of timing out
      self.postMessage({ type: 'error', renderId: msg.renderId, message: String(err) });
    }
    return;
  }

  if (msg.type === 'sequence') {
    // msg.frames: Array<ArrayBuffer> — one per frame
    // msg.stack, quality, etc. same as render
    const frames = msg.frames.map(b => new Uint8ClampedArray(b));
    _applyMsg(msg);
    state.stack = _buildStack(msg.stack);
    state.frameCount = frames.length;

    const results = [];
    for (let fi = 0; fi < frames.length; fi++) {
      state.sourcePixels = frames[fi];
      state.currentFrame = fi;
      for (const n of state.stack) { n._cacheValid = false; }
      state.needsRender = true;
      state.rendering   = false;
      const r = pipeline.render();
      if (r) {
        results.push(r.pixels.buffer);
        // Progress notification
        self.postMessage({ type: 'sequenceProgress', frame: fi, total: frames.length });
      }
    }

    const transfers = results;
    self.postMessage({
      type: 'sequenceDone',
      renderId: msg.renderId,
      frames: results,
      width: Math.max(1, Math.round(state.sourceW * state.previewScale)),
      height: Math.max(1, Math.round(state.sourceH * state.previewScale))
    }, transfers);
    return;
  }
};
