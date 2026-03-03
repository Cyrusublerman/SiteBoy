/**
 * @fileoverview Advanced blur filters — bilateral, motion blur, radial blur (zoom/spin).
 *
 * @source DISTORT image pipeline reference (src/nodes/blur/)
 * @wikipedia https://en.wikipedia.org/wiki/Bilateral_filter
 *   https://en.wikipedia.org/wiki/Motion_blur
 * @formula
 *   bilateral: w(p,q) = exp(-|p-q|^2 / 2*spatialSigma^2 - |I(p)-I(q)|^2 / 2*rangeSigma^2)
 *   motion blur: out(x,y) = (1/S) * sum_{t=-S/2}^{S/2} I(x + cos(a)*t, y + sin(a)*t)
 *   zoom radial: sample at (cx + (x-cx)*scale, cy + (y-cy)*scale) for scale in [1-d, 1+d]
 *   spin radial: sample at rotation by angle in [-d, +d] around (cx, cy)
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

function sampleNearest(src, w, h, fx, fy, dst, i) {
  const sx = Math.max(0, Math.min(w - 1, Math.round(fx)));
  const sy = Math.max(0, Math.min(h - 1, Math.round(fy)));
  const j = (sy * w + sx) * 4;
  dst[i] = src[j]; dst[i + 1] = src[j + 1]; dst[i + 2] = src[j + 2]; dst[i + 3] = src[j + 3];
}

// ── Box Blur ─────────────────────────────────────────────────────────────────

function _clampCoord(v, max) { return v < 0 ? 0 : v >= max ? max - 1 : v; }

function _boxH(src, dst, w, h, r) {
  const dia = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    let sr = 0, sg = 0, sb = 0, sa = 0;
    for (let x = -r; x <= r; x++) {
      const c = _clampCoord(x, w), i = (y * w + c) * 4;
      sr += src[i]; sg += src[i + 1]; sb += src[i + 2]; sa += src[i + 3];
    }
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      dst[i] = sr / dia; dst[i + 1] = sg / dia; dst[i + 2] = sb / dia; dst[i + 3] = sa / dia;
      const a = _clampCoord(x + r + 1, w), rm = _clampCoord(x - r, w);
      const ai = (y * w + a) * 4, ri = (y * w + rm) * 4;
      sr += src[ai] - src[ri]; sg += src[ai + 1] - src[ri + 1];
      sb += src[ai + 2] - src[ri + 2]; sa += src[ai + 3] - src[ri + 3];
    }
  }
}

function _boxV(src, dst, w, h, r) {
  const dia = 2 * r + 1;
  for (let x = 0; x < w; x++) {
    let sr = 0, sg = 0, sb = 0, sa = 0;
    for (let y = -r; y <= r; y++) {
      const c = _clampCoord(y, h), i = (c * w + x) * 4;
      sr += src[i]; sg += src[i + 1]; sb += src[i + 2]; sa += src[i + 3];
    }
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      dst[i] = sr / dia; dst[i + 1] = sg / dia; dst[i + 2] = sb / dia; dst[i + 3] = sa / dia;
      const a = _clampCoord(y + r + 1, h), rm = _clampCoord(y - r, h);
      const ai = (a * w + x) * 4, ri = (rm * w + x) * 4;
      sr += src[ai] - src[ri]; sg += src[ai + 1] - src[ri + 1];
      sb += src[ai + 2] - src[ri + 2]; sa += src[ai + 3] - src[ri + 3];
    }
  }
}

/**
 * Separable box blur (sliding-window O(1)/pixel).
 * Multiple passes converge towards Gaussian.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=3]
 * @param {number} [passes=1]
 * @returns {Uint8ClampedArray}
 */
export function boxBlurSeparable(src, w, h, radius = 3, passes = 1) {
  let cur = new Uint8ClampedArray(src), tmp = new Uint8ClampedArray(src.length);
  for (let p = 0; p < passes; p++) {
    _boxH(cur, tmp, w, h, radius); _boxV(tmp, cur, w, h, radius);
  }
  return cur;
}

// ── Gaussian Blur ─────────────────────────────────────────────────────────────

function _gaussKernel(sigma, r) {
  const k = new Float32Array(r * 2 + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); sum += k[i + r]; }
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  return k;
}

function _gaussH(src, dst, w, h, k, r) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let cr = 0, cg = 0, cb = 0, ca = 0;
      for (let j = -r; j <= r; j++) {
        const cx = _clampCoord(x + j, w), i = (y * w + cx) * 4, wt = k[j + r];
        cr += src[i] * wt; cg += src[i + 1] * wt; cb += src[i + 2] * wt; ca += src[i + 3] * wt;
      }
      const o = (y * w + x) * 4;
      dst[o] = cr; dst[o + 1] = cg; dst[o + 2] = cb; dst[o + 3] = ca;
    }
  }
}

function _gaussV(src, dst, w, h, k, r) {
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let cr = 0, cg = 0, cb = 0, ca = 0;
      for (let j = -r; j <= r; j++) {
        const cy = _clampCoord(y + j, h), i = (cy * w + x) * 4, wt = k[j + r];
        cr += src[i] * wt; cg += src[i + 1] * wt; cb += src[i + 2] * wt; ca += src[i + 3] * wt;
      }
      const o = (y * w + x) * 4;
      dst[o] = cr; dst[o + 1] = cg; dst[o + 2] = cb; dst[o + 3] = ca;
    }
  }
}

/**
 * Separable Gaussian blur.
 * @formula k[i] = exp(-i² / 2σ²), normalised; applied in two 1-D passes
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [sigma=2]
 * @param {number} [passes=1]
 * @returns {Uint8ClampedArray}
 */
export function gaussianBlurSeparable(src, w, h, sigma = 2, passes = 1) {
  const r = Math.ceil(sigma * 3), k = _gaussKernel(sigma, r);
  let cur = new Uint8ClampedArray(src), tmp = new Uint8ClampedArray(src.length);
  for (let p = 0; p < passes; p++) {
    _gaussH(cur, tmp, w, h, k, r); _gaussV(tmp, cur, w, h, k, r);
  }
  return cur;
}

// ── Median Filter ─────────────────────────────────────────────────────────────

/**
 * Per-channel median filter using a square neighbourhood.
 * O(radius² * w * h) — slow for large radii; use previewMax on radius param.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=1]
 * @returns {Uint8ClampedArray}
 */
export function medianFilter(src, w, h, radius = 1) {
  const size = (2 * radius + 1) * (2 * radius + 1), mid = size >> 1;
  const buf = new Uint8Array(size);
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const oi = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let k = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          const sy = Math.max(0, Math.min(h - 1, y + dy));
          for (let dx = -radius; dx <= radius; dx++) {
            buf[k++] = src[(sy * w + Math.max(0, Math.min(w - 1, x + dx))) * 4 + c];
          }
        }
        buf.subarray(0, k).sort();
        dst[oi + c] = buf[mid];
      }
      dst[oi + 3] = src[oi + 3];
    }
  }
  return dst;
}

// ── Bilateral Filter ─────────────────────────────────────────────────────────

/**
 * Bilateral filter — edge-preserving smoothing that weights neighbours by both
 * spatial distance and colour similarity.
 * @param {Uint8ClampedArray} src - RGBA input
 * @param {number} w
 * @param {number} h
 * @param {number} [spatialSigma=5] - Spatial Gaussian sigma (pixels)
 * @param {number} [rangeSigma=30] - Range (colour) Gaussian sigma (0-255 units)
 * @returns {Uint8ClampedArray} New buffer
 */
export function bilateralFilter(src, w, h, spatialSigma = 5, rangeSigma = 30) {
  const rad = Math.ceil(spatialSigma * 2);
  const sSq2 = 2 * spatialSigma * spatialSigma;
  const rSq2 = 2 * rangeSigma * rangeSigma;
  const dst = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ci = (y * w + x) * 4;
      let wr = 0, wg = 0, wb = 0, wSum = 0;
      const cr = src[ci], cg = src[ci + 1], cb = src[ci + 2];

      for (let dy = -rad; dy <= rad; dy++) {
        const ny = Math.max(0, Math.min(h - 1, y + dy));
        for (let dx = -rad; dx <= rad; dx++) {
          const nx = Math.max(0, Math.min(w - 1, x + dx));
          const ni = (ny * w + nx) * 4;
          const nr = src[ni], ng = src[ni + 1], nb = src[ni + 2];
          const sd = dx * dx + dy * dy;
          const rd = (nr - cr) * (nr - cr) + (ng - cg) * (ng - cg) + (nb - cb) * (nb - cb);
          const weight = Math.exp(-sd / sSq2 - rd / rSq2);
          wr += nr * weight; wg += ng * weight; wb += nb * weight;
          wSum += weight;
        }
      }

      const inv = 1 / (wSum || 1);
      dst[ci]     = Math.round(wr * inv);
      dst[ci + 1] = Math.round(wg * inv);
      dst[ci + 2] = Math.round(wb * inv);
      dst[ci + 3] = src[ci + 3];
    }
  }
  return dst;
}

// ── Motion Blur ──────────────────────────────────────────────────────────────

/**
 * Linear motion blur — accumulate samples along a directional vector.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [angle=0] - Direction in degrees
 * @param {number} [distance=10] - Blur length in pixels
 * @param {number} [samples=0] - Sample count (0 = auto from distance)
 * @returns {Uint8ClampedArray} New buffer
 */
export function motionBlur(src, w, h, angle = 0, distance = 10, samples = 0) {
  const rad = angle * Math.PI / 180;
  const dx = Math.cos(rad), dy = Math.sin(rad);
  const n = samples || Math.max(3, distance);
  const invN = 1 / n;
  const dst = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let ar = 0, ag = 0, ab = 0, aa = 0;
      for (let si = 0; si < n; si++) {
        const t = (si / (n - 1) - 0.5) * distance;
        const sx = Math.max(0, Math.min(w - 1, Math.round(x + dx * t)));
        const sy = Math.max(0, Math.min(h - 1, Math.round(y + dy * t)));
        const j = (sy * w + sx) * 4;
        ar += src[j]; ag += src[j + 1]; ab += src[j + 2]; aa += src[j + 3];
      }
      const i = (y * w + x) * 4;
      dst[i] = ar * invN; dst[i + 1] = ag * invN; dst[i + 2] = ab * invN; dst[i + 3] = aa * invN;
    }
  }
  return dst;
}

// ── Radial Blur ──────────────────────────────────────────────────────────────

/**
 * Radial blur — zoom or spin variant.
 * Zoom: samples along a radial axis from centre outward.
 * Spin: samples along a rotational arc around centre.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {'zoom'|'spin'} [type='zoom']
 * @param {number} [centreX=0.5] - Normalised centre X
 * @param {number} [centreY=0.5] - Normalised centre Y
 * @param {number} [amount=10] - Blur strength (pixels for zoom, angle * 0.001 rad for spin)
 * @param {number} [samples=12]
 * @returns {Uint8ClampedArray} New buffer
 */
export function radialBlur(src, w, h, type = 'zoom', centreX = 0.5, centreY = 0.5, amount = 10, samples = 12) {
  const cx = centreX * w, cy = centreY * h;
  const invS = 1 / samples;
  const dst = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let ar = 0, ag = 0, ab = 0, aa = 0;
      for (let si = 0; si < samples; si++) {
        const t = (si / (samples - 1) - 0.5) * 2;
        let fx, fy;
        if (type === 'zoom') {
          const scale = 1 + t * amount * 0.002;
          fx = cx + (x - cx) * scale;
          fy = cy + (y - cy) * scale;
        } else {
          const ang = t * amount * 0.002;
          const pdx = x - cx, pdy = y - cy;
          const cosA = Math.cos(ang), sinA = Math.sin(ang);
          fx = cx + pdx * cosA - pdy * sinA;
          fy = cy + pdx * sinA + pdy * cosA;
        }
        const sx = Math.max(0, Math.min(w - 1, Math.round(fx)));
        const sy = Math.max(0, Math.min(h - 1, Math.round(fy)));
        const j = (sy * w + sx) * 4;
        ar += src[j]; ag += src[j + 1]; ab += src[j + 2]; aa += src[j + 3];
      }
      const i = (y * w + x) * 4;
      dst[i] = ar * invS; dst[i + 1] = ag * invS; dst[i + 2] = ab * invS; dst[i + 3] = aa * invS;
    }
  }
  return dst;
}
