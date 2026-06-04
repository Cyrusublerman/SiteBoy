/**
 * Anchor noise — displace glyph stroke anchors via fBm / Perlin sampling.
 *
 * Pure functions; no DOM. Uses shared noise library (same inputs as other tools).
 *
 * @source blog/docs/pages/tools/utilities/cursive-glyph-builder.md
 * @module shared/algorithms/typography/anchor-noise
 */

import { fbm2D, perlin2D, simplex2D } from '../noise/noise-functions.js';
import { extractAnchors } from './bezier-fit.js';

/** @typedef {'fbm'|'perlin'} AnchorNoiseFn */

/**
 * @typedef {{
 *   amplitudePx?: number,
 *   noiseScale?: number,
 *   octaves?: number,
 *   lacunarity?: number,
 *   persistence?: number,
 *   seed?: number,
 *   noiseFn?: AnchorNoiseFn,
 * }} AnchorNoiseOptions
 */

export const DEFAULT_ANCHOR_NOISE = Object.freeze({
    amplitudePx:  0,
    noiseScale:   0.012,
    octaves:      4,
    lacunarity:   2,
    persistence:  0.5,
    seed:         1,
    noiseFn:      'fbm',
});

/**
 * @param {object} [raw]
 * @returns {Required<AnchorNoiseOptions>}
 */
export function normaliseAnchorNoiseOptions(raw = {}) {
    const fn = String(raw.noiseFn ?? DEFAULT_ANCHOR_NOISE.noiseFn);
    return {
        amplitudePx: Math.max(0, Number(raw.amplitudePx) || 0),
        noiseScale: Math.max(1e-5, Number(raw.noiseScale) || DEFAULT_ANCHOR_NOISE.noiseScale),
        octaves: Math.min(8, Math.max(1, Math.floor(Number(raw.octaves) || DEFAULT_ANCHOR_NOISE.octaves))),
        lacunarity: Math.max(1, Number(raw.lacunarity) || DEFAULT_ANCHOR_NOISE.lacunarity),
        persistence: Math.min(1, Math.max(0.01, Number(raw.persistence) || DEFAULT_ANCHOR_NOISE.persistence)),
        seed: (Number(raw.seed) || DEFAULT_ANCHOR_NOISE.seed) >>> 0,
        noiseFn: fn === 'perlin' ? 'perlin' : 'fbm',
    };
}

/**
 * @param {number} x
 * @param {number} y
 * @param {Required<AnchorNoiseOptions>} opts
 * @returns {number}
 */
export function sampleAnchorNoise2D(x, y, opts) {
    if (opts.noiseFn === 'perlin') {
        return perlin2D(x, y, opts.seed);
    }
    return fbm2D(x, y, {
        octaves:     opts.octaves,
        lacunarity:  opts.lacunarity,
        persistence: opts.persistence,
        noiseFn:     simplex2D,
    });
}

/**
 * @param {{ x:number, y:number, role?:string, segmentIndex?:number }} anchor
 * @param {Required<AnchorNoiseOptions>} opts
 * @param {{ originX?:number, originY?:number, segmentIndex?:number, strokeIndex?:number }} ctx
 * @returns {{ x:number, y:number }}
 */
export function anchorNoiseDisplacement(anchor, opts, ctx = {}) {
    const scale = opts.noiseScale;
    const seg = Number(ctx.segmentIndex) || 0;
    const stroke = Number(ctx.strokeIndex) || 0;
    const ox = (Number(ctx.originX) || 0) * scale * 0.2;
    const oy = (Number(ctx.originY) || 0) * scale * 0.2;
    const seedOff = opts.seed * 0.0137;

    const sx = anchor.x * scale + ox + seedOff + seg * 0.31 + stroke * 0.07;
    const sy = anchor.y * scale + oy + seedOff * 1.7 + seg * 0.23;

    const nx = sampleAnchorNoise2D(sx, sy, opts);
    const ny = sampleAnchorNoise2D(sx + 17.3, sy + 41.9, opts);

    return {
        x: nx * opts.amplitudePx,
        y: ny * opts.amplitudePx,
    };
}

/** @param {{ x:number, y:number }} p @param {{ x:number, y:number }} d */
function addPt(p, d) {
    return { x: p.x + d.x, y: p.y + d.y };
}

/**
 * Warp canvas-space beziers by moving anchors; handles follow their endpoint.
 *
 * @param {object[]} beziers
 * @param {string} strokeId
 * @param {AnchorNoiseOptions} options
 * @param {{ originX?:number, originY?:number, segmentIndex?:number, strokeIndex?:number }} [ctx]
 * @returns {object[]}
 */
export function perturbStrokeBeziersWithAnchorNoise(beziers, strokeId, options, ctx = {}) {
    const opts = normaliseAnchorNoiseOptions(options);
    if (opts.amplitudePx <= 0 || !beziers?.length) return beziers;

    const anchors = extractAnchors(beziers, strokeId || 'stroke');
    const n = beziers.length;
    /** @type {Array<{ x:number, y:number }|undefined>} */
    const dStart = Array(n);
    /** @type {Array<{ x:number, y:number }|undefined>} */
    const dEnd = Array(n);
    const zero = { x: 0, y: 0 };

    for (const anchor of anchors) {
        const delta = anchorNoiseDisplacement(anchor, opts, ctx);
        if (anchor.role === 'entry') {
            dStart[0] = addPt(dStart[0] || zero, delta);
        } else if (anchor.role === 'exit') {
            dEnd[n - 1] = addPt(dEnd[n - 1] || zero, delta);
        } else if (anchor.role === 'tangent') {
            const si = anchor.segmentIndex;
            dStart[si] = addPt(dStart[si] || zero, delta);
            if (si > 0) dEnd[si - 1] = addPt(dEnd[si - 1] || zero, delta);
        }
    }

    return beziers.map((seg, i) => {
        const ds = dStart[i] || zero;
        const de = dEnd[i] || zero;
        return {
            a0: addPt(seg.a0, ds),
            h1: addPt(seg.h1, ds),
            h2: addPt(seg.h2, de),
            a1: addPt(seg.a1, de),
        };
    });
}

/**
 * @param {object[]} strokes canvas-space strokes with beziers[]
 * @param {AnchorNoiseOptions} options
 * @param {{ originX?:number, originY?:number, segmentIndex?:number }} [ctx]
 * @returns {object[]}
 */
export function perturbCanvasStrokesWithAnchorNoise(strokes, options, ctx = {}) {
    const opts = normaliseAnchorNoiseOptions(options);
    if (opts.amplitudePx <= 0) return strokes;

    return (strokes || []).map((stroke, strokeIndex) => {
        const beziers = stroke?.beziers;
        if (!beziers?.length) return stroke;
        const warped = perturbStrokeBeziersWithAnchorNoise(
            beziers,
            stroke.id || `stroke_${strokeIndex}`,
            opts,
            { ...ctx, strokeIndex },
        );
        return { ...stroke, beziers: warped };
    });
}
