/**
 * @fileoverview Texture overlay algorithms — film grain, vignette, scanlines.
 *
 * @source DISTORT image pipeline reference (src/nodes/texture/)
 * @wikipedia https://en.wikipedia.org/wiki/Film_grain
 *   https://en.wikipedia.org/wiki/Vignetting
 *   https://en.wikipedia.org/wiki/Cathode-ray_tube#Interlaced_and_progressive_scan
 * @formula
 *   grain: noise(gi) in [-1,1]; lumWeight = 1 - lumResp * |lum - 0.5| * 2
 *     out.c = src.c + noise * lumWeight * scale * 255
 *   vignette: dist = sqrt((dx/rx)^2 + (dy/ry)^2); v = smooth step near edge
 *     factor = 1 - amount * (1 - v^2)
 *   scanlines: linePhase = y % spacing / spacing; factor = (phase < thickness) ? 1-opacity : 1
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

/** LCG pseudo-random, seed-initialised. Returns values in [0, 1). */
function lcgRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
}

// ── Film Grain ───────────────────────────────────────────────────────────────

/**
 * Add film grain noise to an RGBA buffer.
 * Grain is stronger in midtones and weaker in shadows/highlights when lumResp > 0.
 * Chromatic mode uses independent R/G/B noise channels; monochromatic uses a shared channel.
 *
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [amount=25] - Noise amount in [0, 100]
 * @param {number} [size=1] - Grain block size in pixels (≥1)
 * @param {number} [lumResp=0.5] - Luminance response: 0=flat, 1=strong midtone bias
 * @param {boolean} [chromatic=false] - Separate R/G/B noise channels
 * @param {number} [seed=42]
 * @returns {Uint8ClampedArray} New buffer
 */
export function filmGrain(src, w, h, amount = 25, size = 1, lumResp = 0.5, chromatic = false, seed = 42) {
  const rng = lcgRng(seed);
  const scale = amount / 100;
  const gw = Math.ceil(w / size), gh = Math.ceil(h / size);
  const noiseR = new Float32Array(gw * gh);
  const noiseG = chromatic ? new Float32Array(gw * gh) : noiseR;
  const noiseB = chromatic ? new Float32Array(gw * gh) : noiseR;
  for (let i = 0; i < gw * gh; i++) {
    noiseR[i] = (rng() - 0.5) * 2;
    if (chromatic) { noiseG[i] = (rng() - 0.5) * 2; noiseB[i] = (rng() - 0.5) * 2; }
  }

  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const gi = Math.floor(y / size) * gw + Math.floor(x / size);
    const lum = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) / 255;
    const lumWeight = 1 - lumResp * Math.abs(lum - 0.5) * 2;
    const str = scale * lumWeight * 255;
    dst[i]     = Math.max(0, Math.min(255, src[i]     + noiseR[gi] * str));
    dst[i + 1] = Math.max(0, Math.min(255, src[i + 1] + noiseG[gi] * str));
    dst[i + 2] = Math.max(0, Math.min(255, src[i + 2] + noiseB[gi] * str));
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Vignette ─────────────────────────────────────────────────────────────────

/**
 * Apply a radial vignette (darkening toward corners).
 * Roundness 1 = perfect circle; 0 = follows image aspect ratio.
 *
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [amount=0.5] - Darkening strength [0, 1]
 * @param {number} [softness=0.5] - Falloff width (edge transition) [0.01, 1]
 * @param {number} [roundness=1] - 1 = circular, 0 = aspect-ratio ellipse
 * @returns {Uint8ClampedArray} New buffer
 */
export function vignette(src, w, h, amount = 0.5, softness = 0.5, roundness = 1) {
  const cx = w / 2, cy = h / 2;
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (x - cx) / cx, dy = (y - cy) / cy;
    const maxWH = Math.max(w, h);
    const rx = roundness + (1 - roundness) * (w / maxWH);
    const ry = roundness + (1 - roundness) * (h / maxWH);
    const dist = Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
    const edge = 1 - softness;
    const v = dist < edge ? 1 : Math.max(0, 1 - (dist - edge) / Math.max(0.001, softness));
    const factor = 1 - amount * (1 - v * v);
    const i = (y * w + x) * 4;
    dst[i]     = src[i]     * factor;
    dst[i + 1] = src[i + 1] * factor;
    dst[i + 2] = src[i + 2] * factor;
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Scanlines ────────────────────────────────────────────────────────────────

/**
 * Apply horizontal CRT scanline darkening.
 * Every `spacing` rows, a band of `thickness` fraction is darkened by `opacity`.
 *
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [spacing=2] - Vertical spacing between scanline bands
 * @param {number} [thickness=0.5] - Fraction of spacing that is darkened [0, 1]
 * @param {number} [opacity=0.3] - Darkening strength [0, 1]
 * @returns {Uint8ClampedArray} New buffer
 */
export function scanlines(src, w, h, spacing = 2, thickness = 0.5, opacity = 0.3) {
  const keep = 1 - opacity;
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    const factor = ((y % spacing) / spacing) < thickness ? keep : 1;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      dst[i]     = src[i]     * factor;
      dst[i + 1] = src[i + 1] * factor;
      dst[i + 2] = src[i + 2] * factor;
      dst[i + 3] = src[i + 3];
    }
  }
  return dst;
}
