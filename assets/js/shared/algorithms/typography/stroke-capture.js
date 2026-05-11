/**
 * Stroke Capture — normalisation and metric computation for captured glyphs.
 *
 * Pure functions; no DOM, no globals, no side effects.
 *
 * Coordinate conventions (per spec §3 invariants):
 *   - x ∈ [0, advanceWidth]  where advanceWidth is the reference font's total
 *     advance for the prompt string.
 *   - y = 0 at the **baseline**; positive values go upward.
 *   - Descender band: y ∈ [descender, 0]   (descender is negative)
 *   - x-height band : y ∈ [0, xHeight]
 *   - Ascender band : y ∈ [xHeight, ascender]
 *
 * @source blog/docs/temp/cursive-glyph-builder.md §3 Invariants
 * @module shared/algorithms/typography/stroke-capture
 */

import { chaikinSmooth } from '../geometry/curve-geometry.js';

// ─── Types (JSDoc only — no runtime overhead) ────────────────────────────────

/**
 * @typedef {{ x:number, y:number, t:number }} RawPoint  device-space pointer sample
 * @typedef {{ x:number, y:number }}            NormPoint  glyph-space point
 * @typedef {{ x:number, y:number }}            Point
 */

// ─── Smoothing ────────────────────────────────────────────────────────────────

/**
 * Apply Chaikin corner-cutting to a raw stroke polyline.
 *
 * Input points are plain {x,y,t} objects; the result drops the `t` field.
 * The curve is treated as open (not closed) because pen strokes always
 * have distinct start and end points.
 *
 * @source blog/docs/temp/cursive-glyph-builder.md §7 Capture Pipeline
 * @wikipedia https://en.wikipedia.org/wiki/Chaikin%27s_algorithm
 * @formula Q_{i} = 0.75·P_{i} + 0.25·P_{i+1},  R_{i} = 0.25·P_{i} + 0.75·P_{i+1}
 *
 * @param {RawPoint[]} rawPoints
 * @param {number}     [iterations=2]
 * @returns {NormPoint[]}
 */
export function smoothStroke(rawPoints, iterations = 2) {
    if (!rawPoints || rawPoints.length < 2) return (rawPoints || []).map(p => ({ x: p.x, y: p.y }));
    const pts = rawPoints.map(p => ({ x: p.x, y: p.y }));
    return chaikinSmooth(pts, iterations, false); // open curve
}

// ─── Normalisation ───────────────────────────────────────────────────────────

/**
 * Geometry description of the canvas region that corresponds to one prompt.
 *
 * @typedef {{
 *   canvasOriginX : number,   // canvas-pixel x of the left boundary for this prompt
 *   canvasBaselineY: number,  // canvas-pixel y of the baseline
 *   canvasAdvanceWidth: number, // canvas-pixel width of the full advance
 *   fontMetrics: {
 *     unitsPerEm: number, ascender: number, xHeight: number,
 *     capHeight: number, baseline: number, descender: number
 *   }
 * }} PromptGeometry
 */

/**
 * Transform one stroke's smoothed points from canvas-pixel space into
 * normalised glyph-space.
 *
 * @source blog/docs/temp/cursive-glyph-builder.md §7 Capture Pipeline
 * @formula
 *   x' = (x_canvas - canvasOriginX) / canvasAdvanceWidth * fontAdvanceWidth
 *   y' = (canvasBaselineY - y_canvas) / canvasAdvanceWidth * fontAdvanceWidth
 *   (uniform scale: 1px canvas → (fontAdvanceWidth / canvasAdvanceWidth) font units)
 *
 * @param {NormPoint[]}     smoothed        output of smoothStroke
 * @param {PromptGeometry}  promptGeometry
 * @param {number}          fontAdvanceWidth  advance width in font units from metrics
 * @returns {NormPoint[]}   coordinates in font units, baseline at y=0
 */
export function normaliseToGlyphSpace(smoothed, promptGeometry, fontAdvanceWidth) {
    const { canvasOriginX, canvasBaselineY, canvasAdvanceWidth } = promptGeometry;
    const scale = fontAdvanceWidth / canvasAdvanceWidth;
    return smoothed.map(p => ({
        x: (p.x - canvasOriginX) * scale,
        y: (canvasBaselineY - p.y) * scale, // flip y
    }));
}

/**
 * Normalise all strokes in a DrawingRecord into glyph-space.
 * Mutates and returns the input strokes array.
 *
 * @param {object[]}       strokes
 * @param {PromptGeometry} promptGeometry
 * @param {number}         fontAdvanceWidth
 * @returns {object[]}
 */
export function normaliseStrokes(strokes, promptGeometry, fontAdvanceWidth) {
    return strokes.map(stroke => ({
        ...stroke,
        smoothed: normaliseToGlyphSpace(stroke.smoothed, promptGeometry, fontAdvanceWidth),
        beziers: stroke.beziers.map(seg => ({
            a0: normPt(seg.a0, promptGeometry, fontAdvanceWidth),
            h1: normPt(seg.h1, promptGeometry, fontAdvanceWidth),
            h2: normPt(seg.h2, promptGeometry, fontAdvanceWidth),
            a1: normPt(seg.a1, promptGeometry, fontAdvanceWidth),
        })),
    }));
}

function normPt(pt, pg, aw) {
    const scale = aw / pg.canvasAdvanceWidth;
    return {
        x: (pt.x - pg.canvasOriginX) * scale,
        y: (pg.canvasBaselineY - pt.y) * scale,
    };
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

/**
 * Compute bounding box over all normalised points in all strokes.
 *
 * @param {object[]} strokes  already normalised
 * @returns {{ minX:number, minY:number, maxX:number, maxY:number, width:number, height:number }}
 */
export function computeBbox(strokes) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const stroke of strokes) {
        for (const seg of (stroke.beziers || [])) {
            for (const pt of [seg.a0, seg.h1, seg.h2, seg.a1]) {
                if (pt.x < minX) minX = pt.x;
                if (pt.y < minY) minY = pt.y;
                if (pt.x > maxX) maxX = pt.x;
                if (pt.y > maxY) maxY = pt.y;
            }
        }
    }
    if (!isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * Compute drawing-level metrics.
 *
 * @param {object[]} normalisedStrokes
 * @param {number}   fontAdvanceWidth  in font units
 * @returns {{ bbox: object, advanceWidth: number, overflow: { left:boolean, right:boolean, above:boolean, below:boolean } }}
 */
export function computeDrawingMetrics(normalisedStrokes, fontAdvanceWidth) {
    const bbox = computeBbox(normalisedStrokes);
    return {
        bbox,
        advanceWidth: fontAdvanceWidth,
        overflow: {
            left:  bbox.minX < 0,
            right: bbox.maxX > fontAdvanceWidth,
            above: bbox.maxY > 0, // positive y means above baseline
            below: bbox.minY < 0, // negative y means below baseline (fine for descenders)
        },
    };
}
