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
    stack.push(node);
  }
  return stack;
}

function _applyMsg(msg) {
  state.sourceW      = msg.sourceW;
  state.sourceH      = msg.sourceH;
  state.quality      = msg.quality;
  state.previewScale = msg.previewScale;
  state.globalSeed   = msg.globalSeed;
  state.soloNodeId   = msg.soloNodeId ?? null;
  state.frame        = msg.frame ?? 0;
  state.frameCount   = msg.frameCount ?? 1;
  state.needsRender  = true;
  state.rendering    = false;
}

self.onmessage = function (e) {
  const msg = e.data;

  if (msg.type === 'render') {
    state.sourcePixels = new Uint8ClampedArray(msg.sourcePixels);
    _applyMsg(msg);
    state.stack = _buildStack(msg.stack);
    // Invalidate all caches for fresh state
    for (const n of state.stack) { n._cacheValid = false; }

    const result = pipeline.render();
    if (result) {
      const buf = result.pixels;
      self.postMessage({
        type: 'result',
        renderId: msg.renderId,
        pixels: buf.buffer,
        width: result.width,
        height: result.height,
        renderTime: state.lastRenderTime
      }, [buf.buffer]);
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
      state.frame        = fi;
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
