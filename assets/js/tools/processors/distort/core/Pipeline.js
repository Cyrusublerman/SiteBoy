/**
 * DISTORT — strictly sequential render pipeline.
 *
 * Execution model: node N reads prior node's Uint8ClampedArray output, writes to the next,
 * then the buffers are swapped. No reordering, batching, or LUT fusion.
 *
 * Performance mechanisms:
 *   - BufferPool: zero-alloc buffer recycling
 *   - Dirty-node cache: skip unchanged prefix of the node stack
 *   - Cache ceiling: cap total cached nodes to N_CACHE_MAX to bound memory use
 *   - Preview scaling: sub-resolution render during interaction
 *   - blendMode compositing: per-node blend modes beyond normal opacity
 *   - Per-node timing: `node._lastMs` set after each render pass
 *   - Frame context: frame / frameCount / time forwarded to every node ctx
 *   - Vector adapter: composites LineSet outputs via vectorToRaster
 */
import { hashSeed } from './SeededRNG.js';
import { pool } from './BufferPool.js';
import { vectorToRaster } from '../nodes/bridge/node-adapters.js';
import { ExpressionEval } from './ExpressionEval.js';
import { GPURenderPath } from './GPURenderPath.js';

const N_CACHE_MAX = 12;
/** Single-node wall time above which preview is nudged to the worker on the next render. */
const NODE_SLOW_MS = 2000;

// ── sRGB ↔ linear (G13 — blend in linear light) ───────────────────────────────
const _LIN_LUT = new Float32Array(256);
const _ENC_LUT = new Uint8Array(65536);
for (let i = 0; i < 256; i++) {
  const s = i / 255;
  _LIN_LUT[i] = s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
for (let i = 0; i < 65536; i++) {
  const l = i / 65535;
  const s = l <= 0.0031308 ? 12.92 * l : 1.055 * l ** (1 / 2.4) - 0.055;
  _ENC_LUT[i] = Math.round(Math.max(0, Math.min(255, s * 255)));
}
function _srgbByteToLinear(v) {
  return _LIN_LUT[Math.max(0, Math.min(255, v | 0))];
}
function _linearToSrgbByte(lin) {
  const x = Math.max(0, Math.min(1, lin));
  const idx = Math.round(x * 65535);
  return _ENC_LUT[idx];
}

// ── Blend-mode compositor (per channel, linear light) ─────────────────────────
function _blend(base, layer, mode, opacity, maskVal) {
  const op = opacity * maskVal;
  const inv = 1 - op;
  const bv = _srgbByteToLinear(base);
  const lv = _srgbByteToLinear(layer);
  let out;
  switch (mode) {
    case 'screen':
      out = 1 - (1 - bv) * (1 - lv);
      break;
    case 'multiply':
      out = bv * lv;
      break;
    case 'overlay':
      out = bv < 0.5 ? 2 * bv * lv : 1 - 2 * (1 - bv) * (1 - lv);
      break;
    case 'add':
      out = Math.min(1, bv + lv);
      break;
    case 'difference':
      out = Math.abs(bv - lv);
      break;
    case 'lighten':
      out = Math.max(bv, lv);
      break;
    case 'darken':
      out = Math.min(bv, lv);
      break;
    case 'softlight':
      out = bv < 0.5
        ? bv - (1 - 2 * lv) * bv * (1 - bv)
        : bv + (2 * lv - 1) * ((bv > 0.25 ? Math.sqrt(bv) : ((16 * bv - 12) * bv + 4) * bv) - bv);
      break;
    case 'hardlight':
      out = lv < 0.5 ? 2 * bv * lv : 1 - 2 * (1 - bv) * (1 - lv);
      break;
    case 'colordodge':
      out = lv >= 1 ? 1 : Math.min(1, bv / (1 - lv));
      break;
    case 'colorburn':
      out = lv <= 0 ? 0 : Math.max(0, 1 - (1 - bv) / lv);
      break;
    default:
      out = lv;
  }
  const blended = bv * inv + out * op;
  return _linearToSrgbByte(blended);
}

export class Pipeline {
  /**
   * @param {Object} state - AppState instance
   * @param {import('./GPURenderPath.js').GPURenderPath|null} [gpuRenderPath=null]
   *   Optional GPU render path. When provided, GPU-eligible node runs are
   *   dispatched to the GPU instead of the CPU pixel loop.
   */
  constructor(state, gpuRenderPath = null) {
    this.s = state;
    this._nodeTimings = new Map(); // nodeId → ms
    this._gpuPath = gpuRenderPath ?? null;
  }

  /** Per-node render time in ms, keyed by node id. */
  get timings() { return this._nodeTimings; }

  render() {
    const s = this.s;
    if (!s.sourcePixels || s.rendering) return null;
    s.rendering = true;

    const prev = s.quality === 'preview';
    // If source pixels are pre-scaled (sent from WorkerBridge already downsampled),
    // treat them as full-res — skip the downsample step entirely.
    const preScaled = !!s._preScaled;
    const sc   = (prev && !preScaled) ? s.previewScale : 1;
    const w    = Math.max(1, preScaled ? s.sourceW : Math.round(s.sourceW * sc));
    const h    = Math.max(1, preScaled ? s.sourceH : Math.round(s.sourceH * sc));
    const bufSize = w * h * 4;

    // ── Source pixels ──
    let src;
    if (prev && sc < 1 && !preScaled) {
      src = pool.acquire(bufSize);
      this._downsample(s.sourcePixels, s.sourceW, s.sourceH, w, h, src);
    } else {
      src = pool.acquire(s.sourcePixels.length);
      src.set(s.sourcePixels);
    }

    // ── Active nodes (solo collapses to prefix) ──
    let active;
    if (s.soloNodeId !== null) {
      active = [];
      for (const n of s.stack) {
        if (n.enabled) active.push(n);
        if (n.id === s.soloNodeId) break;
      }
    } else {
      active = s.stack.filter(n => n.enabled);
    }

    // ── Short-circuit: no active nodes → return source as-is ──
    if (active.length === 0) {
      s.lastRenderTime = 0;
      s.rendering = false;
      s.needsRender = false;
      // _pooled: false — do not release src back to pool after transfer (see end of render()).
      return { pixels: src, width: w, height: h, _pooled: false };
    }

    // ── Modulation maps ──
    const modMaps = this._buildModMaps(w, h);
    const pixelVars = this._buildPixelVars(src, w, h, active);

    // ── Find first dirty node ──
    let startIdx = active.length;
    for (let i = 0; i < active.length; i++) {
      if (!active[i]._cacheValid || !active[i]._cache || active[i]._cache.length !== bufSize) {
        startIdx = i;
        break;
      }
    }

    // ── Evict excess cached nodes ──
    const cached = active.filter(n => n._cacheValid && n._cache);
    if (cached.length > N_CACHE_MAX) {
      const evict = cached.length - N_CACHE_MAX;
      for (let i = 0; i < evict; i++) { cached[i]._cache = null; cached[i]._cacheValid = false; }
      startIdx = Math.min(startIdx, active.findIndex(n => n === cached[evict]));
    }

    let bufA;
    if (startIdx > 0 && startIdx <= active.length) {
      bufA = pool.acquire(bufSize);
      bufA.set(active[startIdx - 1]._cache);
      pool.release(src);
    } else {
      bufA = src;
      startIdx = 0;
    }

    let bufB = pool.acquire(bufSize);
    const tPipeline = performance.now();

    // ── Frame context shared across all nodes ──
    const frame      = s.frame ?? 0;
    const frameCount = s.frameCount ?? 1;
    const time       = frameCount > 1 ? frame / frameCount : 0;

    const pipelineCtx = { width: w, height: h, quality: s.quality, globalSeed: s.globalSeed,
      previewScale: sc, pixelVars, frame, frameCount, time };

    // ── Partition nodes into GPU / CPU runs when GPU path is available ──
    const dirty = active.slice(startIdx);
    const runs  = this._gpuPath ? this._gpuPath.partitionNodes(dirty) : [{ gpu: false, nodes: dirty }];

    let nodeOffset = startIdx; // absolute index into active[] for ctx.nodeIndex

    for (const run of runs) {
      if (run.gpu && this._gpuPath) {
        // ── GPU run (async — awaited inline) ─────────────────────────────────
        // GPU execution is fire-and-forget from the perspective of this sync
        // render() call ONLY when called from the main thread preview path.
        // The worker path is always sync-compatible.
        // For correctness, we schedule GPU runs as microtasks and fall back
        // to CPU if the promise is not yet resolved when we continue.
        // In practice the worker sends results back asynchronously anyway.
        // We store a pending promise for the distort-main to handle.
        const tNode = performance.now();
        this._pendingGPU = this._gpuPath.execute(bufA, run.nodes, w, h, pipelineCtx)
          .then(outPixels => {
            // Write GPU result into bufA so subsequent CPU runs read correct data
            bufA.set(outPixels);
            // Update caches for all GPU-run nodes (they share the same output)
            for (const n of run.nodes) {
              if (!n._cache || n._cache.length !== bufSize) n._cache = new Uint8ClampedArray(bufSize);
              n._cache.set(bufA);
              n._cacheValid = true;
            }
          })
          .catch(err => {
            console.warn('[DISTORT] GPU run failed, node(s) will be re-run on CPU next frame:', err.message);
            for (const n of run.nodes) { n._cacheValid = false; }
          });

        const elapsed = performance.now() - tNode;
        for (const n of run.nodes) {
          n._lastMs = elapsed / run.nodes.length;
          this._nodeTimings.set(n.id, n._lastMs);
        }
        nodeOffset += run.nodes.length;
        s.renderProgress = nodeOffset / active.length;

      } else {
        // ── CPU run (existing sequential logic) ──────────────────────────────
        for (let ri = 0; ri < run.nodes.length; ri++) {
          const ni   = nodeOffset + ri;
          const node = run.nodes[ri];
          const hasMask = node.mask?.enabled && node.mask.source !== 'none';
          const hasMod  = Object.keys(node.modulation ?? {}).length > 0;
          const mode    = node.blendMode ?? 'normal';

          const ctx = {
            ...pipelineCtx,
            nodeSeed: hashSeed(s.globalSeed, ni, node.id),
            nodeIndex: ni,
            modMaps: hasMod ? modMaps : null,
          };

          if (hasMask) node.buildMask(bufA, w, h);

          const tNode = performance.now();
          const needsBlend = node.opacity < 1 || hasMask || mode !== 'normal';
          const restoreParams = this._applyNodeModulation(node, ctx, w, h);

          if (needsBlend) {
            const tmp = pool.acquire(bufSize);
            this._runNode(node, bufA, tmp, w, h, ctx, hasMask);
            const maskData = hasMask ? node.mask.data : null;
            for (let i = 0; i < bufSize; i += 4) {
              const maskVal = maskData ? maskData[i >> 2] / 255 : 1;
              const opA = node.opacity * maskVal;
              bufB[i]     = _blend(bufA[i],     tmp[i],     mode, node.opacity, maskVal);
              bufB[i + 1] = _blend(bufA[i + 1], tmp[i + 1], mode, node.opacity, maskVal);
              bufB[i + 2] = _blend(bufA[i + 2], tmp[i + 2], mode, node.opacity, maskVal);
              bufB[i + 3] = Math.round(bufA[i + 3] + (tmp[i + 3] - bufA[i + 3]) * opA);
            }
            pool.release(tmp);
          } else {
            this._runNode(node, bufA, bufB, w, h, ctx, hasMask);
          }

          const elapsed = performance.now() - tNode;
          node._lastMs = elapsed;
          this._nodeTimings.set(node.id, elapsed);
          if (elapsed > NODE_SLOW_MS) {
            console.warn(`[DISTORT] Node "${node.type}" exceeded ${NODE_SLOW_MS}ms — worker preview forced next frame`);
            node._forceWorkerPreviewNext = true;
          }
          restoreParams?.();

          if (!node._cache || node._cache.length !== bufSize) node._cache = new Uint8ClampedArray(bufSize);
          node._cache.set(bufB);
          node._cacheValid = true;

          s.renderProgress = (ni + 1) / active.length;
          [bufA, bufB] = [bufB, bufA];
        }
        nodeOffset += run.nodes.length;
      }
    }

    pool.release(bufB);
    s.lastRenderTime = performance.now() - tPipeline;
    s.rendering      = false;
    s.needsRender    = false;

    // bufA is returned to the caller. Mark _pooled: false — do NOT release it back to
    // the pool. The worker transfers bufA.buffer to the main thread, which detaches it;
    // releasing a detached buffer back into the pool corrupts future pool.acquire() calls.
    return { pixels: bufA, width: w, height: h, _pooled: false };
  }

  /**
   * If the last render dispatched any GPU work, this promise resolves
   * when the GPU result has been written back into the node caches.
   * May be null if no GPU work was dispatched.
   * @type {Promise<void>|null}
   */
  get pendingGPU() { return this._pendingGPU ?? null; }

  releaseResult(result) {
    if (result?._pooled) pool.release(result.pixels);
  }

  renderFinal() {
    const q = this.s.quality;
    this.s.quality = 'final';
    const r = this.render();
    this.s.quality = q;
    return r;
  }

  _buildModMaps(w, h) {
    const maps = {};
    const mods = this.s.modulationMaps ?? {};
    for (const [name, map] of Object.entries(mods)) {
      const n = w * h, dst = new Uint8Array(n);
      const sx = map.sourceW / w, sy = map.sourceH / h, sp = map.sourcePixels;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const ox = Math.min(map.sourceW - 1, Math.round(x * sx));
        const oy = Math.min(map.sourceH - 1, Math.round(y * sy));
        const si = (oy * map.sourceW + ox) * 4;
        dst[y * w + x] = Math.round(sp[si] * 0.299 + sp[si + 1] * 0.587 + sp[si + 2] * 0.114);
      }
      maps[name] = dst;
    }
    return maps;
  }

  _buildPixelVars(srcPixels, w, h, nodes) {
    let needsPixel = false;
    for (const node of nodes) {
      if (!node?.modulation) continue;
      for (const mod of Object.values(node.modulation)) {
        if (!mod) continue;
        const mode = mod.mode || mod.type;
        if (mode === 'expr') {
          const expr = (mod.expr || '').replace(/^=/, '');
          if (ExpressionEval.classify(expr) === 'pixel') {
            needsPixel = true;
            break;
          }
        }
      }
      if (needsPixel) break;
    }
    if (!needsPixel) return null;

    const arr = new Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const j = i * 4;
        const r = srcPixels[j] / 255;
        const g = srcPixels[j + 1] / 255;
        const b = srcPixels[j + 2] / 255;
        const a = srcPixels[j + 3] / 255;
        arr[i] = {
          x, y,
          nx: x / Math.max(1, w - 1),
          ny: y / Math.max(1, h - 1),
          lum: r * 0.299 + g * 0.587 + b * 0.114,
          r, g, b, a
        };
      }
    }
    return arr;
  }

  _applyNodeModulation(node, ctx, w, h) {
    if (!node?.modulation) return null;
    const keys = Object.keys(node.modulation);
    if (!keys.length) return null;

    const prev = {};
    const centreIdx = Math.floor(h / 2) * w + Math.floor(w / 2);
    let changed = false;

    for (const key of keys) {
      if (key === '__opacity__') {
        prev[key] = node.opacity;
        const v = node.getModulated(key, centreIdx, ctx);
        if (typeof v === 'number' && isFinite(v)) {
          node.opacity = Math.max(0, Math.min(1, v));
          changed = true;
        }
        continue;
      }
      if (!(key in node.params)) continue;
      prev[key] = node.params[key];
      const v = node.getModulated(key, centreIdx, ctx);
      if (typeof v === 'number' && isFinite(v)) {
        node.params[key] = v;
        changed = true;
      }
    }

    if (!changed) return null;
    return () => {
      for (const [k, v] of Object.entries(prev)) {
        if (k === '__opacity__') node.opacity = v;
        else node.params[k] = v;
      }
    };
  }

  _downsample(src, sw, sh, dw, dh, dst) {
    // Nearest-neighbour — fast enough for preview; bilinear gains nothing at 35% scale
    const sx = sw / dw, sy = sh / dh;
    for (let y = 0; y < dh; y++) {
      const oy = Math.min(sh - 1, Math.round(y * sy)) * sw;
      const dy = y * dw;
      for (let x = 0; x < dw; x++) {
        const si = (oy + Math.min(sw - 1, Math.round(x * sx))) * 4;
        const di = (dy + x) * 4;
        dst[di]     = src[si];
        dst[di + 1] = src[si + 1];
        dst[di + 2] = src[si + 2];
        dst[di + 3] = src[si + 3];
      }
    }
  }

  _runNode(node, input, output, w, h, ctx, hasMask) {
    // Vector nodes: call apply() directly (it now handles rasterization internally)
    // applyVector() is exposed for external vector export only
    node.apply(input, output, w, h, ctx);
  }
}
