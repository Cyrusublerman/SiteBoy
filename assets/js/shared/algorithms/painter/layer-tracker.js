/**
 * @fileoverview Snapshot layer compositor — push named RGBA buffers and flatten via alpha-over.
 * Distinct from generative-painter coverage grid (per-pixel stroke counters only).
 *
 * @source DISTORT image pipeline reference (src/modules/painter/layer-tracker.js)
 * @wikipedia https://en.wikipedia.org/wiki/Alpha_compositing
 * @formula over: out.rgb = base.rgb * (1 - a) + layer.rgb * a; out.a = max(base.a, layer.a)
 */

/**
 * Accumulates named RGBA pixel layers and provides alpha-over flattening.
 */
export class LayerTracker {
  constructor() {
    this.layers = [];
  }

  /**
   * Push a new pixel layer.
   * @param {string} name - Identifier
   * @param {Uint8ClampedArray} pixels - RGBA buffer (cloned on entry)
   * @param {object} [meta={}]
   */
  push(name, pixels, meta = {}) {
    const clone = new Uint8ClampedArray(pixels);
    const nonZero = this._countCoverage(clone);
    this.layers.push({ name, pixels: clone, nonZero, meta });
  }

  _countCoverage(pixels) {
    let n = 0;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) n++;
    return n;
  }

  /**
   * Return coverage and layer-count statistics.
   * @returns {{ count: number, totalPixels: number, totalCoverage: number }}
   */
  stats() {
    const count = this.layers.length;
    const totalPixels = this.layers.reduce((s, l) => s + l.pixels.length / 4, 0);
    const totalCoverage = this.layers.reduce((s, l) => s + l.nonZero, 0);
    return { count, totalPixels, totalCoverage };
  }

  /**
   * Flatten all layers into a single RGBA buffer.
   * @param {'over'|'replace'} [mode='over']
   * @returns {Uint8ClampedArray|null} Null if no layers
   */
  flatten(mode = 'over') {
    if (!this.layers.length) return null;
    if (mode === 'replace') return new Uint8ClampedArray(this.layers[this.layers.length - 1].pixels);

    const out = new Uint8ClampedArray(this.layers[0].pixels.length);
    for (const layer of this.layers) {
      for (let i = 0; i < out.length; i += 4) {
        const a = layer.pixels[i + 3] / 255;
        const inv = 1 - a;
        out[i]     = out[i]     * inv + layer.pixels[i]     * a;
        out[i + 1] = out[i + 1] * inv + layer.pixels[i + 1] * a;
        out[i + 2] = out[i + 2] * inv + layer.pixels[i + 2] * a;
        out[i + 3] = Math.max(out[i + 3], layer.pixels[i + 3]);
      }
    }
    return out;
  }
}
