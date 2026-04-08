/**
 * @fileoverview fBm turbulence — sum of absolute band-limited noise octaves, series-normalised.
 *
 * @source blog/docs/pages/tools/processors/distort/plan2403/algorithms/turbulence-2d.md
 * @formula T = \frac{\sum_i g^i |n_i|}{\sum_i g^i}
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
 * @returns {number} Normalised scalar ≥ 0 (≈ [0, 1] when |n|≤1)
 */
export function turbulenceField2D(x, y, seed, octaves = 4, gain = 0.5, lacunarity = 2, noiseFn = null) {
    const s = seed | 0;
    const base = noiseFn
        ? (nx, ny) => noiseFn(nx, ny)
        : (nx, ny) => perlin2D(nx, ny, s);

    let sum = 0;
    let amp = 1;
    let freq = 1;
    let denom = 0;
    const nOct = Math.max(1, Math.min(32, octaves | 0));
    for (let i = 0; i < nOct; i++) {
        sum += amp * Math.abs(base(x * freq, y * freq));
        denom += amp;
        amp *= gain;
        freq *= lacunarity;
    }
    return denom > 0 ? sum / denom : 0;
}
