/**
 * @fileoverview Colour adjustment algorithms — histogram EQ, CLAHE, channel mixer,
 *   vibrance, temperature/tint, colour balance (shadow/mid/highlight).
 *
 * All functions operate on RGBA Uint8ClampedArray buffers and return a new buffer.
 *
 * @source DISTORT image pipeline reference (src/nodes/colour/)
 * @wikipedia https://en.wikipedia.org/wiki/Histogram_equalization
 *   https://en.wikipedia.org/wiki/Adaptive_histogram_equalization
 *   https://en.wikipedia.org/wiki/Color_balance
 * @formula
 *   HE LUT: lut[v] = round((cdf[v] - cdfMin) / (N - cdfMin) * 255)
 *   CLAHE: clip histogram per tile, redistribute excess, bilinear interpolate tiles
 *   channel mix: out.R = rr*R + rg*G + rb*B (3x3 matrix)
 *   vibrance: amt = vib * (1 - sat)^2; out.c = c + (c - avg) * amt
 *   temp: lutR[i] += temp * 0.5; lutB[i] -= temp * 0.5
 *   balance: out.c = c + (swt*shadow + mwt*mid + hwt*hi) * 0.5
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

function clamp255(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

function lumaAt(pixels, i) {
  return pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
}

// ── Histogram Equalisation ───────────────────────────────────────────────────

/**
 * Apply global histogram equalisation to an RGBA buffer.
 * Builds a CDF from luminance, creates per-channel LUTs, blends with strength.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [strength=1] - Blend factor [0, 1]
 * @returns {Uint8ClampedArray} New buffer
 */
export function histogramEqualise(src, w, h, strength = 1) {
  const n = w * h;
  const hist = new Uint32Array(256);
  for (let i = 0; i < n * 4; i += 4) hist[Math.round(lumaAt(src, i))]++;

  const cdf = new Float32Array(256);
  cdf[0] = hist[0];
  for (let i = 1; i < 256; i++) cdf[i] = cdf[i - 1] + hist[i];
  const cdfMin = cdf.find(v => v > 0) || 0;
  const denom = n - cdfMin || 1;
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) lut[i] = Math.round((cdf[i] - cdfMin) / denom * 255);

  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0; i < n * 4; i += 4) {
    for (let c = 0; c < 3; c++) dst[i + c] = Math.round(src[i + c] * (1 - strength) + lut[src[i + c]] * strength);
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── CLAHE ────────────────────────────────────────────────────────────────────

/**
 * Contrast-Limited Adaptive Histogram Equalisation.
 * Divides the image into tiles, clips each tile's histogram at clipLimit,
 * builds per-tile LUTs, and bilinearly interpolates between adjacent tiles.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [tileSize=32]
 * @param {number} [clipLimit=3] - Relative clip limit (multiplied by tilePixels/256)
 * @returns {Uint8ClampedArray} New buffer
 */
export function clahe(src, w, h, tileSize = 32, clipLimit = 3) {
  const tw = Math.ceil(w / tileSize), th = Math.ceil(h / tileSize);
  const clipCount = Math.round(clipLimit * tileSize * tileSize / 256);

  const luts = new Array(tw * th);
  for (let ty = 0; ty < th; ty++) {
    for (let tx = 0; tx < tw; tx++) {
      const hist = new Uint32Array(256);
      const x0 = tx * tileSize, y0 = ty * tileSize;
      const x1 = Math.min(x0 + tileSize, w), y1 = Math.min(y0 + tileSize, h);
      let count = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        hist[Math.round(lumaAt(src, (y * w + x) * 4))]++; count++;
      }
      let excess = 0;
      for (let i = 0; i < 256; i++) {
        if (hist[i] > clipCount) { excess += hist[i] - clipCount; hist[i] = clipCount; }
      }
      const inc = Math.floor(excess / 256);
      for (let i = 0; i < 256; i++) hist[i] += inc;
      const lut = new Uint8Array(256);
      let cdf = 0;
      const cdfD = count || 1;
      for (let i = 0; i < 256; i++) { cdf += hist[i]; lut[i] = Math.round((cdf / cdfD) * 255); }
      luts[ty * tw + tx] = lut;
    }
  }

  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const ftx = (x - tileSize / 2) / tileSize;
    const fty = (y - tileSize / 2) / tileSize;
    const tx0 = Math.max(0, Math.min(tw - 1, Math.floor(ftx)));
    const ty0 = Math.max(0, Math.min(th - 1, Math.floor(fty)));
    const tx1 = Math.min(tw - 1, tx0 + 1);
    const ty1 = Math.min(th - 1, ty0 + 1);
    const ffx = Math.max(0, Math.min(1, ftx - tx0));
    const ffy = Math.max(0, Math.min(1, fty - ty0));
    const ifx = 1 - ffx, ify = 1 - ffy;
    for (let c = 0; c < 3; c++) {
      const v = src[i + c];
      const v00 = luts[ty0 * tw + tx0][v], v10 = luts[ty0 * tw + tx1][v];
      const v01 = luts[ty1 * tw + tx0][v], v11 = luts[ty1 * tw + tx1][v];
      dst[i + c] = Math.round((v00 * ifx + v10 * ffx) * ify + (v01 * ifx + v11 * ffx) * ffy);
    }
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Channel Mixer ────────────────────────────────────────────────────────────

/**
 * Apply a 3×3 channel mixing matrix to an RGBA buffer.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {object} m - Matrix coefficients: rr, rg, rb, gr, gg, gb, br, bg, bb
 * @returns {Uint8ClampedArray} New buffer
 */
export function channelMix(src, w, h, m) {
  const { rr = 1, rg = 0, rb = 0, gr = 0, gg = 1, gb = 0, br = 0, bg = 0, bb = 1 } = m;
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    const r = src[i], g = src[i + 1], b = src[i + 2];
    dst[i]     = clamp255(Math.round(r * rr + g * rg + b * rb));
    dst[i + 1] = clamp255(Math.round(r * gr + g * gg + b * gb));
    dst[i + 2] = clamp255(Math.round(r * br + g * bg + b * bb));
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Vibrance ─────────────────────────────────────────────────────────────────

/**
 * Vibrance — boosts saturation selectively; less-saturated pixels receive more boost.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} vibrance - Effect strength in [-1, 1]
 * @returns {Uint8ClampedArray} New buffer
 */
export function applyVibrance(src, w, h, vibrance) {
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    const r = src[i] / 255, g = src[i + 1] / 255, b = src[i + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx - mn;
    const amt = vibrance * (1 - sat) * (1 - sat);
    const avg = (r + g + b) / 3;
    dst[i]     = clamp255(Math.round((r + (r - avg) * amt) * 255));
    dst[i + 1] = clamp255(Math.round((g + (g - avg) * amt) * 255));
    dst[i + 2] = clamp255(Math.round((b + (b - avg) * amt) * 255));
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Temperature / Tint ───────────────────────────────────────────────────────

/**
 * Apply a white-balance temperature and tint shift via per-channel LUTs.
 * Temperature (+) = warm (red+, blue-); Temperature (-) = cool.
 * Tint (+) = magenta (green-); Tint (-) = green (green+).
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} temperature - In [-100, 100]
 * @param {number} tint - In [-100, 100]
 * @returns {Uint8ClampedArray} New buffer
 */
export function applyTemperatureTint(src, w, h, temperature, tint) {
  const lutR = new Uint8Array(256), lutG = new Uint8Array(256), lutB = new Uint8Array(256);
  const s = 0.5;
  for (let i = 0; i < 256; i++) {
    lutR[i] = clamp255(Math.round(i + temperature * s));
    lutG[i] = clamp255(Math.round(i - tint * s));
    lutB[i] = clamp255(Math.round(i - temperature * s));
  }
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    dst[i] = lutR[src[i]]; dst[i + 1] = lutG[src[i + 1]]; dst[i + 2] = lutB[src[i + 2]]; dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Colour Balance ───────────────────────────────────────────────────────────

/**
 * Apply shadow/midtone/highlight colour balance shifts.
 * Each tone range is weighted by proximity to shadow(0), midtone(0.5), or highlight(1) luminance.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {object} shifts - { shadowR, shadowG, shadowB, midR, midG, midB, highR, highG, highB }
 *   All in [-100, 100]
 * @returns {Uint8ClampedArray} New buffer
 */
export function colourBalance(src, w, h, shifts) {
  const { shadowR = 0, shadowG = 0, shadowB = 0, midR = 0, midG = 0, midB = 0, highR = 0, highG = 0, highB = 0 } = shifts;
  const sc = 0.5;
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    const r = src[i], g = src[i + 1], b = src[i + 2];
    const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const sw = Math.max(0, 1 - lum * 2);
    const mw = 1 - Math.abs(lum - 0.5) * 2;
    const hw = Math.max(0, (lum - 0.5) * 2);
    dst[i]     = clamp255(r + (shadowR * sw + midR * mw + highR * hw) * sc);
    dst[i + 1] = clamp255(g + (shadowG * sw + midG * mw + highG * hw) * sc);
    dst[i + 2] = clamp255(b + (shadowB * sw + midB * mw + highB * hw) * sc);
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Greyscale ─────────────────────────────────────────────────────────────────

/**
 * Convert to greyscale using a weighted luminance sum.
 * Defaults to BT.601 luma coefficients.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [wr=0.299] - Red weight
 * @param {number} [wg=0.587] - Green weight
 * @param {number} [wb=0.114] - Blue weight
 * @returns {Uint8ClampedArray}
 */
export function greyscale(src, w, h, wr = 0.299, wg = 0.587, wb = 0.114) {
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    const l = src[i] * wr + src[i + 1] * wg + src[i + 2] * wb;
    dst[i] = dst[i + 1] = dst[i + 2] = l;
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Invert ────────────────────────────────────────────────────────────────────

/**
 * Invert all colour channels. Alpha is preserved.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @returns {Uint8ClampedArray}
 */
export function invertColours(src, w, h) {
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    dst[i] = 255 - src[i]; dst[i + 1] = 255 - src[i + 1];
    dst[i + 2] = 255 - src[i + 2]; dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Lift / Gamma / Gain ───────────────────────────────────────────────────────

/**
 * Lift/Gamma/Gain colour grade with optional pivot contrast.
 * @formula x = (v/255 * gain + lift) ^ (1/gamma); x = pivot + (x - pivot) * (1 + contrast)
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [lift=0]      - Black level offset [-0.5, 0.5]
 * @param {number} [gamma=1]     - Midtone exponent [0.2, 3]; applied as 1/gamma
 * @param {number} [gain=1]      - White scale [0, 3]
 * @param {number} [contrast=0]  - Linear contrast around pivot [-1, 1]
 * @param {number} [pivot=0.5]   - Contrast pivot [0, 1]
 * @returns {Uint8ClampedArray}
 */
export function liftGammaGain(src, w, h, lift = 0, gamma = 1, gain = 1, contrast = 0, pivot = 0.5) {
  const invG = 1 / Math.max(gamma, 0.001);
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let x = (i / 255) * gain + lift;
    x = Math.pow(Math.max(0, x), invG);
    if (contrast) x = pivot + (x - pivot) * (1 + contrast);
    lut[i] = clamp255(Math.round(x * 255));
  }
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    dst[i] = lut[src[i]]; dst[i + 1] = lut[src[i + 1]]; dst[i + 2] = lut[src[i + 2]]; dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Levels ────────────────────────────────────────────────────────────────────

/**
 * Remap input [blackPoint, whitePoint] to output [outBlack, outWhite] with midtone gamma.
 * @formula lut[i] = outBlack + ((clamp((i - blackIn) / range, 0, 1)) ^ (1/gamma)) * outRange
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [blackPoint=0]  - Input shadow clamp [0, 255]
 * @param {number} [whitePoint=255] - Input highlight clamp [0, 255]
 * @param {number} [midGamma=1]    - Midtone gamma [0.1, 3]
 * @param {number} [outBlack=0]    - Output shadow [0, 255]
 * @param {number} [outWhite=255]  - Output highlight [0, 255]
 * @returns {Uint8ClampedArray}
 */
export function applyLevels(src, w, h, blackPoint = 0, whitePoint = 255, midGamma = 1, outBlack = 0, outWhite = 255) {
  const rng = Math.max(whitePoint - blackPoint, 1);
  const oR = outWhite - outBlack;
  const inv = 1 / Math.max(midGamma, 0.001);
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = clamp255(Math.round(outBlack + Math.pow(Math.max(0, Math.min(1, (i - blackPoint) / rng)), inv) * oR));
  }
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    dst[i] = lut[src[i]]; dst[i + 1] = lut[src[i + 1]]; dst[i + 2] = lut[src[i + 2]]; dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Curves ────────────────────────────────────────────────────────────────────

/**
 * Build a 256-entry LUT from 3 smoothstep control points.
 * Points are sorted by x before interpolation.
 * @formula t = (i - x0) / (x1 - x0); st = t²(3 - 2t); y = y0 + (y1 - y0) * st
 * @param {number} shadowIn   @param {number} shadowOut
 * @param {number} midIn      @param {number} midOut
 * @param {number} highIn     @param {number} highOut
 * @returns {Uint8Array} 256-entry LUT
 */
export function buildCurvesLUT(shadowIn, shadowOut, midIn, midOut, highIn, highOut) {
  const pts = [{ x: shadowIn, y: shadowOut }, { x: midIn, y: midOut }, { x: highIn, y: highOut }]
    .sort((a, b) => a.x - b.x);
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let y;
    if (i <= pts[0].x) { y = pts[0].y; }
    else if (i >= pts[pts.length - 1].x) { y = pts[pts.length - 1].y; }
    else {
      let seg = 0;
      for (let s = 0; s < pts.length - 1; s++) {
        if (i >= pts[s].x && i <= pts[s + 1].x) { seg = s; break; }
      }
      const t = (i - pts[seg].x) / Math.max(1, pts[seg + 1].x - pts[seg].x);
      const st = t * t * (3 - 2 * t);
      y = pts[seg].y + (pts[seg + 1].y - pts[seg].y) * st;
    }
    lut[i] = clamp255(Math.round(y));
  }
  return lut;
}

/**
 * Apply a prebuilt 256-entry LUT to all colour channels.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {Uint8Array} lut
 * @returns {Uint8ClampedArray}
 */
export function applyCurvesLUT(src, w, h, lut) {
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    dst[i] = lut[src[i]]; dst[i + 1] = lut[src[i + 1]]; dst[i + 2] = lut[src[i + 2]]; dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── HSL Adjust ────────────────────────────────────────────────────────────────

/**
 * Adjust hue, saturation, and lightness via RGB↔HSL round-trip.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [hue=0]        - Shift in degrees [-180, 180]
 * @param {number} [saturation=1] - Saturation multiplier [0, 3]
 * @param {number} [lightness=0]  - Additive lightness offset [-1, 1]
 * @returns {Uint8ClampedArray}
 */
export function hslAdjust(src, w, h, hue = 0, saturation = 1, lightness = 0) {
  const hShift = hue / 360;
  function h2r(p, q, t) {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 0.5) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    let r = src[i] / 255, g = src[i + 1] / 255, b = src[i + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let hv, sv, l = (mx + mn) / 2;
    if (mx === mn) { hv = sv = 0; }
    else {
      const d = mx - mn;
      sv = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) hv = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (mx === g) hv = ((b - r) / d + 2) / 6;
      else hv = ((r - g) / d + 4) / 6;
    }
    hv = (hv + hShift + 1) % 1;
    sv = Math.max(0, Math.min(1, sv * saturation));
    l  = Math.max(0, Math.min(1, l + lightness));
    if (sv === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + sv) : l + sv - l * sv;
      const p = 2 * l - q;
      r = h2r(p, q, hv + 1 / 3);
      g = h2r(p, q, hv);
      b = h2r(p, q, hv - 1 / 3);
    }
    dst[i] = Math.round(r * 255); dst[i + 1] = Math.round(g * 255);
    dst[i + 2] = Math.round(b * 255); dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Posterize ─────────────────────────────────────────────────────────────────

/**
 * Quantise each channel to N uniform levels.
 * @formula level = floor((v/255) * n) / (n-1) * 255
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [levels=4]
 * @returns {Uint8ClampedArray}
 */
export function posterize(src, w, h, levels = 4) {
  const n = Math.max(2, levels);
  const step = 1 / n;
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const level = Math.min(Math.floor((i / 255) / step), n - 1);
    lut[i] = Math.round((level / (n - 1)) * 255);
  }
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, total = w * h * 4; i < total; i += 4) {
    dst[i] = lut[src[i]]; dst[i + 1] = lut[src[i + 1]]; dst[i + 2] = lut[src[i + 2]]; dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Dither ────────────────────────────────────────────────────────────────────

const _BAYER8 = new Uint8Array([
   0, 48, 12, 60,  3, 51, 15, 63,
  32, 16, 44, 28, 35, 19, 47, 31,
   8, 56,  4, 52, 11, 59,  7, 55,
  40, 24, 36, 20, 43, 27, 39, 23,
   2, 50, 14, 62,  1, 49, 13, 61,
  34, 18, 46, 30, 33, 17, 45, 29,
  10, 58,  6, 54,  9, 57,  5, 53,
  42, 26, 38, 22, 41, 25, 37, 21
]);

/**
 * Ordered (Bayer 8×8) dither.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [levels=2]    - Output quantisation levels [2, 16]
 * @param {number} [strength=1]  - Threshold scale [0, 2]
 * @returns {Uint8ClampedArray}
 */
export function ditherBayer(src, w, h, levels = 2, strength = 1) {
  const step = 255 / (levels - 1);
  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const threshold = (_BAYER8[(y & 7) * 8 + (x & 7)] / 64 - 0.5) * step * strength;
      for (let c = 0; c < 3; c++) dst[i + c] = clamp255(Math.round((src[i + c] + threshold) / step) * step);
      dst[i + 3] = src[i + 3];
    }
  }
  return dst;
}

/**
 * Floyd-Steinberg error diffusion dither.
 * Diffuses quantisation error to right (7/16), lower-left (3/16), lower (5/16), lower-right (1/16).
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [levels=2]
 * @param {number} [strength=1]
 * @returns {Uint8ClampedArray}
 */
export function ditherFloydSteinberg(src, w, h, levels = 2, strength = 1) {
  const step = 255 / (levels - 1);
  const buf = new Float32Array(w * h * 3);
  for (let i = 0, j = 0; i < w * h * 4; i += 4, j += 3) {
    buf[j] = src[i]; buf[j + 1] = src[i + 1]; buf[j + 2] = src[i + 2];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const j = (y * w + x) * 3;
      for (let c = 0; c < 3; c++) {
        const old = buf[j + c];
        const nv = Math.round(old / step) * step;
        buf[j + c] = nv;
        const err = (old - nv) * strength;
        if (x + 1 < w) buf[j + 3 + c] += err * 7 / 16;
        if (y + 1 < h) {
          if (x > 0) buf[((y + 1) * w + x - 1) * 3 + c] += err * 3 / 16;
          buf[((y + 1) * w + x) * 3 + c] += err * 5 / 16;
          if (x + 1 < w) buf[((y + 1) * w + x + 1) * 3 + c] += err * 1 / 16;
        }
      }
    }
  }
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, j = 0; i < w * h * 4; i += 4, j += 3) {
    dst[i] = clamp255(buf[j]); dst[i + 1] = clamp255(buf[j + 1]); dst[i + 2] = clamp255(buf[j + 2]); dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Quantise to Palette ───────────────────────────────────────────────────────

/**
 * Map each pixel to the nearest colour in an RGB palette (squared Euclidean distance).
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {Array<[number, number, number]>} palette - Array of [r, g, b] tuples (8-bit)
 * @returns {Uint8ClampedArray}
 */
export function quantiseToPalette(src, w, h, palette) {
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    const r = src[i], g = src[i + 1], b = src[i + 2];
    let bestDist = Infinity, bestIdx = 0;
    for (let j = 0; j < palette.length; j++) {
      const d = (r - palette[j][0]) ** 2 + (g - palette[j][1]) ** 2 + (b - palette[j][2]) ** 2;
      if (d < bestDist) { bestDist = d; bestIdx = j; }
    }
    dst[i] = palette[bestIdx][0]; dst[i + 1] = palette[bestIdx][1];
    dst[i + 2] = palette[bestIdx][2]; dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Gradient Map ─────────────────────────────────────────────────────────────

/**
 * Map each pixel's luminance to a colour from a gradient (array of hex strings or [r,g,b] tuples).
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {Array<string|[number,number,number]>} gradient - At least 2 entries
 * @returns {Uint8ClampedArray} New buffer
 */
export function applyGradientMap(src, w, h, gradient) {
  const stops = gradient.map(c => {
    if (typeof c === 'string') {
      const hex = c.replace('#', '');
      return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
    }
    return c;
  });
  const last = stops.length - 1;
  const lut = new Uint8Array(256 * 3);
  for (let v = 0; v < 256; v++) {
    const t = v / 255 * last;
    const lo = Math.floor(t), hi = Math.min(last, lo + 1);
    const f = t - lo;
    const a = stops[lo], b = stops[hi];
    lut[v * 3]     = Math.round(a[0] + (b[0] - a[0]) * f);
    lut[v * 3 + 1] = Math.round(a[1] + (b[1] - a[1]) * f);
    lut[v * 3 + 2] = Math.round(a[2] + (b[2] - a[2]) * f);
  }
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    const lum = Math.round(lumaAt(src, i));
    dst[i] = lut[lum * 3]; dst[i + 1] = lut[lum * 3 + 1]; dst[i + 2] = lut[lum * 3 + 2];
    dst[i + 3] = src[i + 3];
  }
  return dst;
}
