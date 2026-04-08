/**
 * @fileoverview Deterministic 2D white Gaussian noise (Box-Muller).
 *
 * @source blog/docs/pages/tools/processors/distort/plan2403/algorithms/white-gaussian-2d.md
 */

/**
 * @param {number} x
 * @param {number} y
 * @param {number} seed
 * @param {number} [sigma=1]
 * @returns {number}
 */
export function whiteGaussianNoise2D(x, y, seed, sigma = 1) {
    let a = (Math.floor(x) * 73856093)
        ^ (Math.floor(y) * 19349663)
        ^ ((seed | 0) * 83492791);
    a = (a ^ (a >>> 13)) >>> 0;
    a = (a * 1103515245 + 12345) >>> 0;
    const u1 = ((a & 0xffffff) + 1) / 0x1000000;
    const b = (a * 1664525 + 1013904223) >>> 0;
    const u2 = (b & 0xffffff) / 0x1000000;
    const r = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-12)));
    const z = r * Math.cos(2 * Math.PI * u2);
    return z * sigma;
}
