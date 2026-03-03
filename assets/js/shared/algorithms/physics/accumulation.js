/**
 * @fileoverview Accumulation / iterative re-sampling algorithms
 * Pure stateless functions operating on Uint8ClampedArray pixel buffers.
 * @module physics/accumulation
 */

/**
 * Iteratively sample the source image with random jitter/rotation/scale per pass
 * and accumulate (weighted average) into output.
 *
 * @param {Uint8ClampedArray} src
 * @param {number} w
 * @param {number} h
 * @param {number} samples      - Number of accumulation passes [2, 20]
 * @param {number} jitterX      - Max horizontal offset per pass in pixels [0, 100]
 * @param {number} jitterY      - Max vertical offset per pass in pixels [0, 100]
 * @param {'equal'|'decay'} opacityMode - Weight distribution mode
 * @param {number} decay        - Weight decay factor (opacityMode='decay') [0.1, 0.99]
 * @param {number} rotJitter    - Max rotation jitter per pass in degrees [0, 10]
 * @param {number} scaleJitter  - Max scale jitter per pass (fraction) [0, 0.5]
 * @param {object} rng          - SeededRNG instance with .next() → [0,1)
 * @returns {Uint8ClampedArray}
 */
export function iterativeRewarpRGBA(src, w, h, samples, jitterX, jitterY, opacityMode, decay, rotJitter, scaleJitter, rng) {
  const aR = new Float32Array(w * h), aG = new Float32Array(w * h);
  const aB = new Float32Array(w * h), aA = new Float32Array(w * h);
  const aW = new Float32Array(w * h);
  const cx = w * 0.5, cy = h * 0.5;

  for (let si = 0; si < samples; si++) {
    const ox   = (rng.next() - 0.5) * 2 * jitterX;
    const oy   = (rng.next() - 0.5) * 2 * jitterY;
    const rot  = (rng.next() - 0.5) * 2 * rotJitter * Math.PI / 180;
    const sc   = 1 + (rng.next() - 0.5) * 2 * scaleJitter;
    const wt   = opacityMode === 'decay' ? Math.pow(decay, si) : 1;
    const cosR = Math.cos(rot) * sc, sinR = Math.sin(rot) * sc;

    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const px = x - cx, py = y - cy, idx = y * w + x;
      const srcX = px * cosR - py * sinR + cx + ox;
      const srcY = px * sinR + py * cosR + cy + oy;
      const sx0 = Math.floor(srcX), sy0 = Math.floor(srcY);
      const fdx = srcX - sx0, fdy = srcY - sy0;
      const scx0 = sx0 < 0 ? 0 : sx0 >= w ? w - 1 : sx0;
      const scx1 = sx0 + 1 >= w ? w - 1 : sx0 + 1 < 0 ? 0 : sx0 + 1;
      const scy0 = sy0 < 0 ? 0 : sy0 >= h ? h - 1 : sy0;
      const scy1 = sy0 + 1 >= h ? h - 1 : sy0 + 1 < 0 ? 0 : sy0 + 1;
      const i00 = (scy0 * w + scx0) * 4, i10 = (scy0 * w + scx1) * 4;
      const i01 = (scy1 * w + scx0) * 4, i11 = (scy1 * w + scx1) * 4;
      const w00 = (1 - fdx) * (1 - fdy), w10 = fdx * (1 - fdy);
      const w01 = (1 - fdx) * fdy,       w11 = fdx * fdy;
      aR[idx] += (src[i00] * w00 + src[i10] * w10 + src[i01] * w01 + src[i11] * w11) * wt;
      aG[idx] += (src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11) * wt;
      aB[idx] += (src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11) * wt;
      aA[idx] += (src[i00 + 3] * w00 + src[i10 + 3] * w10 + src[i01 + 3] * w01 + src[i11 + 3] * w11) * wt;
      aW[idx] += wt;
    }
  }

  const dst = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const idx = y * w + x, j = idx * 4, wt = aW[idx] || 1;
    dst[j]     = aR[idx] / wt;
    dst[j + 1] = aG[idx] / wt;
    dst[j + 2] = aB[idx] / wt;
    dst[j + 3] = aA[idx] / wt;
  }
  return dst;
}
