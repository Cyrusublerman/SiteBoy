/**
 * @fileoverview Spatial frequency filters — unsharp mask, high pass.
 *
 * Both use a separable Gaussian blur internally.
 *
 * @source DISTORT image pipeline reference (src/nodes/sharpen/)
 * @wikipedia https://en.wikipedia.org/wiki/Unsharp_masking
 *   https://en.wikipedia.org/wiki/High-pass_filter
 * @formula
 *   Gaussian kernel: k[i] = exp(-i^2 / 2*sigma^2), normalised
 *   unsharp: out = src + amount * (src - blur) if |src - blur| > threshold
 *   highpass: out = src - blur + 128  (128 = neutral grey mid-point)
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a 1-D normalised Gaussian kernel of half-radius rad.
 * @param {number} rad
 * @param {number} sigma
 * @returns {Float32Array} Length = 2*rad+1
 */
function gaussianKernel1D(rad, sigma) {
  const k = new Float32Array(rad * 2 + 1);
  let sum = 0;
  for (let i = -rad; i <= rad; i++) { k[i + rad] = Math.exp(-(i * i) / (2 * sigma * sigma)); sum += k[i + rad]; }
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  return k;
}

/**
 * Separable Gaussian blur on RGBA.
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} sigma
 * @returns {Uint8ClampedArray} Blurred buffer
 */
function gaussianBlurRGBA(src, w, h, sigma) {
  const rad = Math.ceil(sigma * 3);
  const k = gaussianKernel1D(rad, sigma);
  const tmp = new Uint8ClampedArray(src.length);
  const blur = new Uint8ClampedArray(src.length);

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let cr = 0, cg = 0, cb = 0;
    for (let j = -rad; j <= rad; j++) {
      const cx = Math.max(0, Math.min(w - 1, x + j));
      const si = (y * w + cx) * 4; const wt = k[j + rad];
      cr += src[si] * wt; cg += src[si + 1] * wt; cb += src[si + 2] * wt;
    }
    const oi = (y * w + x) * 4;
    tmp[oi] = cr; tmp[oi + 1] = cg; tmp[oi + 2] = cb; tmp[oi + 3] = src[oi + 3];
  }
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
    let cr = 0, cg = 0, cb = 0;
    for (let j = -rad; j <= rad; j++) {
      const cy = Math.max(0, Math.min(h - 1, y + j));
      const si = (cy * w + x) * 4; const wt = k[j + rad];
      cr += tmp[si] * wt; cg += tmp[si + 1] * wt; cb += tmp[si + 2] * wt;
    }
    const oi = (y * w + x) * 4;
    blur[oi] = cr; blur[oi + 1] = cg; blur[oi + 2] = cb; blur[oi + 3] = tmp[oi + 3];
  }
  return blur;
}

// ── Unsharp Mask ─────────────────────────────────────────────────────────────

/**
 * Unsharp mask — amplify high-frequency detail.
 * out(c) = src(c) + amount * (src(c) - blur(c)) if |diff| > threshold
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [amount=1] - Sharpening strength
 * @param {number} [radius=2] - Gaussian blur sigma in pixels
 * @param {number} [threshold=0] - Minimum edge diff to apply sharpening (0-255)
 * @returns {Uint8ClampedArray} New buffer
 */
export function unsharpMask(src, w, h, amount = 1, radius = 2, threshold = 0) {
  const blur = gaussianBlurRGBA(src, w, h, Math.max(0.1, radius));
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    for (let c = 0; c < 3; c++) {
      const diff = src[i + c] - blur[i + c];
      dst[i + c] = Math.abs(diff) > threshold
        ? Math.max(0, Math.min(255, Math.round(src[i + c] + amount * diff)))
        : src[i + c];
    }
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── High Pass ────────────────────────────────────────────────────────────────

/**
 * High pass filter — retains only detail above the blur radius.
 * Output is centred at mid-grey (128). Useful for sharpening via soft-light blend.
 * out(c) = clamp(src(c) - blur(c) + 128, 0, 255)
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [radius=5] - Gaussian blur sigma; larger = more detail retained
 * @returns {Uint8ClampedArray} New buffer (grey-centred high frequencies)
 */
export function highPass(src, w, h, radius = 5) {
  const blur = gaussianBlurRGBA(src, w, h, Math.max(0.1, radius));
  const dst = new Uint8ClampedArray(src.length);
  for (let i = 0, n = w * h * 4; i < n; i += 4) {
    dst[i]     = Math.max(0, Math.min(255, src[i]     - blur[i]     + 128));
    dst[i + 1] = Math.max(0, Math.min(255, src[i + 1] - blur[i + 1] + 128));
    dst[i + 2] = Math.max(0, Math.min(255, src[i + 2] - blur[i + 2] + 128));
    dst[i + 3] = src[i + 3];
  }
  return dst;
}

// ── Affine Transform ──────────────────────────────────────────────────────────

function _bilinearDst(src, w, h, fx, fy, dst, i) {
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const dx = fx - x0, dy = fy - y0;
  const cx0 = x0 < 0 ? 0 : x0 >= w ? w - 1 : x0;
  const cx1 = x0 + 1 >= w ? w - 1 : x0 + 1 < 0 ? 0 : x0 + 1;
  const cy0 = y0 < 0 ? 0 : y0 >= h ? h - 1 : y0;
  const cy1 = y0 + 1 >= h ? h - 1 : y0 + 1 < 0 ? 0 : y0 + 1;
  const i00 = (cy0 * w + cx0) * 4, i10 = (cy0 * w + cx1) * 4;
  const i01 = (cy1 * w + cx0) * 4, i11 = (cy1 * w + cx1) * 4;
  const idx = 1 - dx, idy = 1 - dy;
  const w00 = idx * idy, w10 = dx * idy, w01 = idx * dy, w11 = dx * dy;
  dst[i]     = src[i00] * w00 + src[i10] * w10 + src[i01] * w01 + src[i11] * w11;
  dst[i + 1] = src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11;
  dst[i + 2] = src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11;
  dst[i + 3] = src[i00 + 3] * w00 + src[i10 + 3] * w10 + src[i01 + 3] * w01 + src[i11 + 3] * w11;
}

function _nearestDst(src, w, h, fx, fy, dst, i) {
  const x = Math.round(fx), y = Math.round(fy);
  const cx = x < 0 ? 0 : x >= w ? w - 1 : x;
  const cy = y < 0 ? 0 : y >= h ? h - 1 : y;
  const si = (cy * w + cx) * 4;
  dst[i] = src[si]; dst[i + 1] = src[si + 1]; dst[i + 2] = src[si + 2]; dst[i + 3] = src[si + 3];
}

/**
 * Affine (2-D) pixel transform: translate, rotate, non-uniform scale, with configurable pivot.
 * Uses inverse-mapping (source-to-destination) so no gaps appear.
 * @formula
 *   p' = (p - pivot - translate) → unscale → unrotate → pivot
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} [translateX=0]  - Fractional [−1, 1] — positive = right
 * @param {number} [translateY=0]  - Fractional [−1, 1] — positive = down
 * @param {number} [rotate=0]      - Degrees [−180, 180]
 * @param {number} [scaleX=1]
 * @param {number} [scaleY=1]
 * @param {number} [centreX=0.5]   - Normalised pivot X [0, 1]
 * @param {number} [centreY=0.5]   - Normalised pivot Y [0, 1]
 * @param {'bilinear'|'nearest'} [interpolation='bilinear']
 * @returns {Uint8ClampedArray}
 */
export function affineTransform(src, w, h,
  translateX = 0, translateY = 0, rotate = 0,
  scaleX = 1, scaleY = 1,
  centreX = 0.5, centreY = 0.5,
  interpolation = 'bilinear'
) {
  const cx = centreX * w, cy = centreY * h;
  const rad = -rotate * Math.PI / 180;
  const cosR = Math.cos(rad), sinR = Math.sin(rad);
  const isx = 1 / Math.max(scaleX, 0.001), isy = 1 / Math.max(scaleY, 0.001);
  const tx = translateX * w, ty = translateY * h;
  const dst = new Uint8ClampedArray(src.length);
  const useBilinear = interpolation !== 'nearest';

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x - cx - tx, py = y - cy - ty;
      const fx = (px * cosR - py * sinR) * isx + cx;
      const fy = (px * sinR + py * cosR) * isy + cy;
      const i = (y * w + x) * 4;
      if (useBilinear) _bilinearDst(src, w, h, fx, fy, dst, i);
      else _nearestDst(src, w, h, fx, fy, dst, i);
    }
  }
  return dst;
}
