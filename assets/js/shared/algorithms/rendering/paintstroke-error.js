/**
 * @fileoverview Greedy error-guided stroke polylines (gradient-aligned tangent trace).
 *
 * @source blog/docs/pages/tools/processors/distort/plan2403/algorithms/paintstroke-error-guided.md
 */

import { gradientMagnitude2D as scalarGradMag2D } from '../features/feature-extraction.js';

/**
 * @param {Float32Array} errorMap
 * @param {number} w
 * @param {number} h
 * @param {null|{gx: Float32Array, gy: Float32Array}} gradientMap
 * @param {null|Float32Array} edgeMap
 * @param {object} [opts={}]
 * @param {number} [opts.brushRadius=2]
 * @param {number} [opts.minLength=4]
 * @param {number} [opts.maxLength=48]
 * @param {number} [opts.passCount=8]
 * @param {number} [opts.curvature=0.15]
 * @param {number} [opts.seed=0]
 * @returns {Array<Array<[number, number]>>}
 */
export function paintStrokeErrorGuided(errorMap, w, h, gradientMap, edgeMap, opts = {}) {
    const brushRadius = opts.brushRadius ?? 2;
    const minLength = opts.minLength ?? 4;
    const maxLength = opts.maxLength ?? 48;
    const passCount = opts.passCount ?? 8;
    const curvature = opts.curvature ?? 0.15;
    const seed = opts.seed | 0;

    const n = w * h;
    const work = new Float32Array(errorMap);
    let gx;
    let gy;
    if (gradientMap && gradientMap.gx && gradientMap.gy) {
        gx = gradientMap.gx;
        gy = gradientMap.gy;
    } else {
        const g = scalarGradMag2D(work, w, h);
        gx = g.gx;
        gy = g.gy;
    }

    const rng = (() => {
        let s = (seed + 1) >>> 0;
        return () => {
            s = (s * 1664525 + 1013904223) >>> 0;
            return (s & 0xfffffff) / 0x10000000;
        };
    })();

    const strokes = [];
    const r2 = brushRadius * brushRadius;

    const subtractBrush = (cx, cy) => {
        const x0 = Math.max(0, Math.floor(cx - brushRadius - 1));
        const x1 = Math.min(w - 1, Math.ceil(cx + brushRadius + 1));
        const y0 = Math.max(0, Math.floor(cy - brushRadius - 1));
        const y1 = Math.min(h - 1, Math.ceil(cy + brushRadius + 1));
        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                const dx = x - cx;
                const dy = y - cy;
                if (dx * dx + dy * dy > r2) continue;
                const i = y * w + x;
                const foot = Math.min(work[i], 0.35 * brushRadius);
                work[i] = Math.max(0, work[i] - foot);
            }
        }
    };

    for (let p = 0; p < passCount; p++) {
        let best = -1;
        let bi = -1;
        for (let i = 0; i < n; i++) {
            if (work[i] > best) {
                best = work[i];
                bi = i;
            }
        }
        if (best < 1e-6) break;

        const sx = bi % w;
        const sy = (bi / w) | 0;
        const poly = /** @type {Array<[number, number]>} */ ([[sx, sy]]);
        let x = sx;
        let y = sy;
        let ang = 0;

        const xi = Math.max(1, Math.min(w - 2, sx | 0));
        const yi = Math.max(1, Math.min(h - 2, sy | 0));
        const ii = yi * w + xi;
        let tx = -gy[ii];
        let ty = gx[ii];
        const m = Math.hypot(tx, ty) || 1;
        tx /= m;
        ty /= m;
        ang = Math.atan2(ty, tx);

        for (let s = 0; s < maxLength - 1; s++) {
            const jitter = (rng() - 0.5) * 2 * curvature * Math.PI;
            ang += jitter;
            const step = 0.85;
            x += Math.cos(ang) * step;
            y += Math.sin(ang) * step;
            if (x < 1 || x >= w - 1 || y < 1 || y >= h - 1) break;
            poly.push([x, y]);
            const ix = x | 0;
            const iy = y | 0;
            const idx = iy * w + ix;
            let tnx = -gy[idx];
            let tny = gx[idx];
            const em = edgeMap ? edgeMap[idx] : 1;
            const mm = Math.hypot(tnx, tny) || 1;
            tnx = (tnx / mm) * em + Math.cos(ang) * (1 - em);
            tny = (tny / mm) * em + Math.sin(ang) * (1 - em);
            const nm = Math.hypot(tnx, tny) || 1;
            const tang = Math.atan2(tny / nm, tnx / nm);
            ang = ang * (1 - 0.35) + tang * 0.35;
            subtractBrush(x, y);
        }

        for (let k = 0; k < poly.length; k++) {
            subtractBrush(poly[k][0], poly[k][1]);
        }

        if (poly.length >= minLength) strokes.push(poly);
    }

    return strokes;
}
