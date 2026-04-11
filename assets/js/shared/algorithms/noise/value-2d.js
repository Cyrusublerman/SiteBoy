/**
 * @fileoverview 2D value noise: bilinear interpolation of hashed lattice corners.
 *
 * @source blog/docs/pages/tools/processors/distort/plan2403/algorithms/value-noise-2d.md
 */

import { smootherstep } from './noise-functions.js';

function cornerHash01(ix, iy, seed) {
    let n = (ix * 374761393 + iy * 668265263 + (seed | 0) * 2246822519) >>> 0;
    n = (n ^ (n >>> 13)) >>> 0;
    n = (n * 1274126177) >>> 0;
    return (n & 0xfffffff) / 0xfffffff;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} seed
 * @returns {number}
 */
export function valueNoise2D(x, y, seed) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const xf = x - x0;
    const yf = y - y0;
    const s = seed | 0;
    const h00 = cornerHash01(x0, y0, s);
    const h10 = cornerHash01(x0 + 1, y0, s);
    const h01 = cornerHash01(x0, y0 + 1, s);
    const h11 = cornerHash01(x0 + 1, y0 + 1, s);
    const u = smootherstep(0, 1, xf);
    const v = smootherstep(0, 1, yf);
    const xL0 = h00 + u * (h10 - h00);
    const xL1 = h01 + u * (h11 - h01);
    return xL0 + v * (xL1 - xL0);
}
