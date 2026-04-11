/**
 * @fileoverview Scalar-field gradients and gradient magnitude (2-D).
 *
 * @source blog/docs/pages/tools/processors/distort/plan2403/algorithms/gradient-magnitude-2d.md
 */

/**
 * Central-difference gradient magnitude on a scalar field (interior pixels).
 *
 * @param {Float32Array} scalarField
 * @param {number} w
 * @param {number} h
 * @returns {{ gx: Float32Array, gy: Float32Array, magnitude: Float32Array }}
 */
export function gradientMagnitude2D(scalarField, w, h) {
    const n = w * h;
    const gx = new Float32Array(n);
    const gy = new Float32Array(n);
    const magnitude = new Float32Array(n);
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            gx[i] = 0.5 * (scalarField[i + 1] - scalarField[i - 1]);
            gy[i] = 0.5 * (scalarField[i + w] - scalarField[i - w]);
            magnitude[i] = Math.hypot(gx[i], gy[i]);
        }
    }
    return { gx, gy, magnitude };
}

/**
 * Unit normal and edge tangent (tangent perpendicular to gradient) at one sample.
 *
 * @param {number} gx
 * @param {number} gy
 * @returns {{ nx: number, ny: number, tx: number, ty: number }}
 */
export function edgeTangentDistance2D(gx, gy) {
    const m = Math.hypot(gx, gy) || 1;
    const nx = gx / m;
    const ny = gy / m;
    return { nx, ny, tx: -ny, ty: nx };
}
