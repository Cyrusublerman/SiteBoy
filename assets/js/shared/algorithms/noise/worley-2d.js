/**
 * @fileoverview 2D Worley noise: F1 and F2 distances in a 3-by-3 cell neighbourhood.
 */

function featureInCell(cx, cy, seed) {
    let n = (cx * 374761393 + cy * 668265263 + (seed | 0) * 2246822519) >>> 0;
    const n2 = (n ^ (n >>> 13)) >>> 0;
    const fx = ((n & 0xfffffff) / 0x10000000) % 1;
    const fy = ((n2 & 0xfffffff) / 0x10000000) % 1;
    return { px: cx + fx, py: cy + fy };
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} seed
 * @param {'euclidean'|'manhattan'|'chebyshev'} [metric='euclidean']
 * @returns {{ f1: number, f2: number }}
 */
export function worleyNoise2D(x, y, seed, metric = 'euclidean') {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    let f1 = Infinity;
    let f2 = Infinity;

    const dist = (dx, dy) => {
        if (metric === 'manhattan') return Math.abs(dx) + Math.abs(dy);
        if (metric === 'chebyshev') return Math.max(Math.abs(dx), Math.abs(dy));
        return Math.hypot(dx, dy);
    };

    for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
            const cx = ix + i;
            const cy = iy + j;
            const fp = featureInCell(cx, cy, seed | 0);
            const d = dist(x - fp.px, y - fp.py);
            if (d < f1) {
                f2 = f1;
                f1 = d;
            } else if (d < f2) {
                f2 = d;
            }
        }
    }

    if (!Number.isFinite(f2)) f2 = f1;
    return { f1, f2 };
}
