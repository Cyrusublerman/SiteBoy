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

const N_CACHE_MAX = 12;

// ── Blend-mode compositor ─────────────────────────────────────────────────────

function _blend(base, layer, mode, opacity, maskVal) {
  const op  = opacity * maskVal;
  const inv = 1 - op;

  function ch(b, l, m) {
    const bv = b / 255, lv = l / 255;
    let out;
    switch (m) {
      case 'screen':     out = 1 - (1 - bv) * (1 - lv); break;
      case 'multiply':   out = bv * lv; break;
      case 'overlay':    out = bv < 0.5 ? 2 * bv * lv : 1 - 2 * (1 - bv) * (1 - lv); break;
      case 'add':        out = Math.min(1, bv + lv); break;
      case 'difference': out = Math.abs(bv - lv); break;
      case 'softlight':  out = bv < 0.5 ? bv - (1 - 2 * lv) * bv * (1 - bv) : bv + (2 * lv - 1) * ((bv > 0.25 ? Math.sqrt(bv) : ((16 * bv - 12) * bv + 4) * bv) - bv); break;
      case 'hardlight':  out = lv < 0.5 ? 2 * bv * lv : 1 - 2 * (1 - bv) * (1 - lv); break;
      case 'colordodge': out = lv === 1 ? 1 : Math.min(1, bv / (1 - lv)); break;
      case 'colorburn':  out = lv === 0 ? 0 : Math.max(0, 1 - (1 - bv) / lv); break;
      default:           out = lv; // 'normal'
    }
    return Math.round(b * inv + out * 255 * op);
  }

  return ch(base, layer, mode);
}

export class Pipeline {
  constructor(state) {
    this.s = state;
    this._nodeTimings = new Map(); // nodeId → ms
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

    for (let ni = startIdx; ni < active.length; ni++) {
      const node    = active[ni];
      const hasMask = node.mask?.enabled && node.mask.source !== 'none';
      const hasMod  = Object.keys(node.modulation ?? {}).length > 0;
      const mode    = node.blendMode ?? 'normal';

      const ctx = {
        width: w, height: h,
        quality: s.quality,
        globalSeed: s.globalSeed,
        nodeSeed: hashSeed(s.globalSeed, ni, node.id),
        previewScale: sc,
        nodeIndex: ni,
        modMaps: hasMod ? modMaps : null,
        pixelVars,
        frame, frameCount, time
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
          bufB[i]     = _blend(bufA[i],     tmp[i],     mode, node.opacity, maskVal);
          bufB[i + 1] = _blend(bufA[i + 1], tmp[i + 1], mode, node.opacity, maskVal);
          bufB[i + 2] = _blend(bufA[i + 2], tmp[i + 2], mode, node.opacity, maskVal);
          bufB[i + 3] = bufA[i + 3];
        }
        pool.release(tmp);
      } else {
        this._runNode(node, bufA, bufB, w, h, ctx, hasMask);
      }

      node._lastMs = performance.now() - tNode;
      this._nodeTimings.set(node.id, node._lastMs);
      restoreParams?.();

      if (!node._cache || node._cache.length !== bufSize) node._cache = new Uint8ClampedArray(bufSize);
      node._cache.set(bufB);
      node._cacheValid = true;

      s.renderProgress = (ni + 1) / active.length;
      [bufA, bufB] = [bufB, bufA];
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
      for (const [k, v] of Object.entries(prev)) node.params[k] = v;
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
