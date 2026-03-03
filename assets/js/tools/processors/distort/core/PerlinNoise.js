/**
 * DISTORT — seeded 2D Perlin noise with fractional Brownian motion.
 * Used directly by FlowFieldNode. For shared Perlin/Simplex/fBm functions
 * see assets/js/shared/algorithms/noise/noise-functions.js.
 */
import { SeededRNG } from './SeededRNG.js';

export class PerlinNoise {
  constructor(seed) {
    this.perm = new Uint8Array(512);
    const r = new SeededRNG(seed);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = r.nextInt(0, i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  _f(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

  _g(h, x, y) {
    const hh = h & 3;
    const u = hh < 2 ? x : y;
    const v = hh < 2 ? y : x;
    return ((hh & 1) ? -u : u) + ((hh & 2) ? -v : v);
  }

  /**
   * 2D Perlin noise, returns value in approximately [-1, 1].
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  noise2D(x, y) {
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = this._f(xf), v = this._f(yf);
    const p = this.perm;
    return (1 - v) * (
      (1 - u) * this._g(p[p[xi] + yi], xf, yf) +
      u * this._g(p[p[xi + 1] + yi], xf - 1, yf)
    ) + v * (
      (1 - u) * this._g(p[p[xi] + yi + 1], xf, yf - 1) +
      u * this._g(p[p[xi + 1] + yi + 1], xf - 1, yf - 1)
    );
  }

  /**
   * Fractional Brownian Motion — summed octaves.
   * @param {number} x
   * @param {number} y
   * @param {number} [octaves=4]
   * @param {number} [lacunarity=2]
   * @param {number} [gain=0.5]
   * @returns {number}
   */
  fbm(x, y, octaves = 4, lacunarity = 2, gain = 0.5) {
    let v = 0, a = 1, f = 1, m = 0;
    for (let i = 0; i < octaves; i++) {
      v += this.noise2D(x * f, y * f) * a;
      m += a;
      a *= gain;
      f *= lacunarity;
    }
    return v / m;
  }
}
