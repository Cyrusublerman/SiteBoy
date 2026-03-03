/**
 * DISTORT — EffectNode base class.
 * All 71 node types extend this class and override apply(src, dst, w, h, ctx).
 * Provides: parameter management, per-node mask (4 sources), parameter modulation,
 * dirty-node cache invalidation, JSON serialisation, and destroy().
 */
export class EffectNode {
  static _id = 0;

  constructor(type, name, paramDefs) {
    this.id = EffectNode._id++;
    this.type = type;
    this.name = name;
    this.enabled   = true;
    this.solo      = false;
    this.opacity   = 1;
    this.blendMode = 'normal';
    this.expanded  = true;
    this.params = {};
    this.paramDefs = paramDefs;
    for (const [k, v] of Object.entries(paramDefs)) {
      this.params[k] = v.value;
    }

    this._cache = null;
    this._cacheValid = false;
    this.isLUT = false;

    this.mask = {
      enabled: false,
      source: 'none',       // 'none' | 'upload' | 'luminance' | 'gradient'
      invert: false,
      feather: 0,
      data: null,            // Uint8Array(w*h) — single channel, 0..255
      _sourcePixels: null,
      _sourceW: 0,
      _sourceH: 0
    };

    this.modulation = {};
  }

  /** Override in subclasses. dst.set(src) = pass-through. */
  apply(src, dst, w, h, ctx) { dst.set(src); }

  /** Hook for LUT-composable nodes (deprecated; Pipeline is strictly sequential). */
  buildLUT(lutR, lutG, lutB) {}

  /** Return GLSL fragment shader source or null. */
  glsl() { return null; }

  /**
   * Get modulated parameter value at a pixel index.
   * Falls back to base param value if no modulation is active.
   */
  getModulated(key, pixelIdx, ctx) {
    const base = this.params[key];
    const mod = this.modulation[key];
    if (!mod || !mod.mapId || mod.amount === 0 || !ctx?.modMaps) return base;
    const map = ctx.modMaps[mod.mapId];
    if (!map) return base;
    const mv = map[pixelIdx] / 255;
    return base * (1 - mod.amount + mv * mod.amount);
  }

  /**
   * Invalidate this node's cache and all downstream caches in stack.
   * @param {EffectNode[]|null} stack
   */
  invalidate(stack) {
    this._cacheValid = false;
    this._cache = null;
    if (stack) {
      const idx = stack.indexOf(this);
      if (idx >= 0) {
        for (let i = idx + 1; i < stack.length; i++) {
          stack[i]._cacheValid = false;
          stack[i]._cache = null;
        }
      }
    }
  }

  /**
   * Build this node's mask at pipeline resolution.
   * Called by Pipeline before applying the node when mask.enabled is true.
   * Supports: luminance (from input pixels), gradient (radial), upload (resize).
   */
  buildMask(srcPixels, w, h) {
    if (!this.mask.enabled || this.mask.source === 'none') { this.mask.data = null; return; }
    const n = w * h;
    let data = new Uint8Array(n);

    if (this.mask.source === 'luminance') {
      for (let i = 0; i < n; i++) {
        const j = i * 4;
        data[i] = Math.round(srcPixels[j] * 0.299 + srcPixels[j + 1] * 0.587 + srcPixels[j + 2] * 0.114);
      }
    } else if (this.mask.source === 'gradient') {
      const cx = w / 2, cy = h / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        data[y * w + x] = Math.round((1 - Math.min(1, d / maxR)) * 255);
      }
    } else if (this.mask.source === 'upload' && this.mask._sourcePixels) {
      this._resizeMask(data, w, h);
    }

    if (this.mask.invert) for (let i = 0; i < n; i++) data[i] = 255 - data[i];
    if (this.mask.feather > 0) data = this._featherMask(data, w, h, this.mask.feather);
    this.mask.data = data;
  }

  _resizeMask(dst, tw, th) {
    const sp = this.mask._sourcePixels;
    const sw = this.mask._sourceW, sh = this.mask._sourceH;
    const sx = sw / tw, sy = sh / th;
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
      const ox = Math.min(sw - 1, Math.round(x * sx));
      const oy = Math.min(sh - 1, Math.round(y * sy));
      const si = (oy * sw + ox) * 4;
      dst[y * tw + x] = Math.round(sp[si] * 0.299 + sp[si + 1] * 0.587 + sp[si + 2] * 0.114);
    }
  }

  _featherMask(data, w, h, radius) {
    const r = Math.ceil(radius);
    const k = new Float32Array(r * 2 + 1);
    let sum = 0;
    for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-(i * i) / (2 * radius * radius)); sum += k[i + r]; }
    for (let i = 0; i < k.length; i++) k[i] /= sum;
    const tmp = new Float32Array(w * h);
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = 0;
      for (let j = -r; j <= r; j++) { const cx = Math.max(0, Math.min(w - 1, x + j)); v += data[y * w + cx] * k[j + r]; }
      tmp[y * w + x] = v;
    }
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
      let v = 0;
      for (let j = -r; j <= r; j++) { const cy = Math.max(0, Math.min(h - 1, y + j)); v += tmp[cy * w + x] * k[j + r]; }
      out[y * w + x] = Math.round(Math.max(0, Math.min(255, v)));
    }
    return out;
  }

  toJSON() {
    return {
      type:       this.type,
      enabled:    this.enabled,
      opacity:    this.opacity,
      blendMode:  this.blendMode,
      params:     { ...this.params },
      mask:       { enabled: this.mask.enabled, source: this.mask.source, invert: this.mask.invert, feather: this.mask.feather },
      modulation: { ...this.modulation }
    };
  }

  fromJSON(data) {
    this.enabled   = data.enabled   ?? true;
    this.opacity   = data.opacity   ?? 1;
    this.blendMode = data.blendMode ?? 'normal';
    for (const k in data.params) if (k in this.params) this.params[k] = data.params[k];
    if (data.mask) {
      this.mask.enabled = data.mask.enabled ?? false;
      this.mask.source  = data.mask.source  ?? 'none';
      this.mask.invert  = data.mask.invert  ?? false;
      this.mask.feather = data.mask.feather ?? 0;
    }
    if (data.modulation) this.modulation = { ...data.modulation };
  }

  destroy() {
    this._cache = null;
    this.mask.data = null;
    this.mask._sourcePixels = null;
  }
}
