/**
 * @fileoverview Separable 1-D Gaussian kernel for convolution (normalised).
 *
 * @source blog/docs/pages/tools/processors/distort/plan2403/algorithms/separable-gaussian-kernel-1d.md
 */

/**
 * @param {number} sigma - Standard deviation in samples (must be > 0)
 * @param {number} [radius] - Half-width; default ceil(3*sigma)
 * @returns {{ kernel: Float32Array, radius: number }}
 */
export function separableGaussianKernel1D(sigma, radius) {
    const sig = Math.max(1e-6, sigma);
    const r = radius != null ? radius | 0 : Math.ceil(sig * 3);
    const k = new Float32Array(r * 2 + 1);
    let sum = 0;
    const s2 = 2 * sig * sig;
    for (let i = -r; i <= r; i++) {
        const v = Math.exp(-(i * i) / s2);
        k[i + r] = v;
        sum += v;
    }
    const inv = 1 / sum;
    for (let i = 0; i < k.length; i++) k[i] *= inv;
    return { kernel: k, radius: r };
}
