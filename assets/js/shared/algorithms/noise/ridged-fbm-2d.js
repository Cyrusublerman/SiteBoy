/**
 * @fileoverview Ridged multifractal noise (ridged fBm) built from abs(noise) ridges.
 *
 * @source blog/docs/pages/tools/processors/distort/plan2403/algorithms/ridged-fbm-2d.md
 * @formula R = sum_i g^i (1 - |n(f^i x, f^i y)|)
 */

import { perlin2D } from './noise-functions.js';

/**
 * @param {number} x
 * @param {number} y
 * @param {number} seed
 * @param {number} [octaves=4]
 * @param {number} [gain=0.5]
 * @param {number} [lacunarity=2]
 * @param {null|function(number,number): number} [noiseFn=null]
 * @returns {number}
 */
export function ridgedFbm2D(x, y, seed, octaves = 4, gain = 0.5, lacunarity = 2, noiseFn = null) {
    const s = seed | 0;
    const base = noiseFn
        ? (nx, ny) => noiseFn(nx, ny)
        : (nx, ny) => perlin2D(nx, ny, s);

    let sum = 0;
    let amp = 1;
    let freq = 1;
    let norm = 0;
    const nOct = Math.max(1, Math.min(32, octaves | 0));
    for (let i = 0; i < nOct; i++) {
        const v = base(x * freq, y * freq);
        sum += amp * (1 - Math.abs(v));
        norm += amp;
        amp *= gain;
        freq *= lacunarity;
    }
    return norm > 0 ? sum / norm : sum;
}
