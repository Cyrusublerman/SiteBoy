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
 * @source blog/docs/pages/tools/utilities/cursive-glyph-builder.md — glyph-space invariants
 * @wikipedia https://en.wikipedia.org/wiki/Font_metrics
 * @formula y′ = baselineY − y_canvas scaled by fontAdvanceWidth / canvasAdvanceWidth
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
 * @source blog/docs/pages/tools/utilities/cursive-glyph-builder.md §7 Capture Pipeline
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

// ─── Capture viewport (shared coordinate frame) ─────────────────────────────

/**
 * Ascender/descender band in canvas pixels at a trace size.
 *
 * @param {{ unitsPerEm?:number, ascender?:number, descender?:number }} metrics
 * @param {number} fontSize
 */
export function metricBandPx(metrics, fontSize) {
    const upm  = metrics?.unitsPerEm || 1000;
    const asc  = Number.isFinite(metrics?.ascender) ? metrics.ascender : upm * 0.8;
    const desc = Number.isFinite(metrics?.descender) ? metrics.descender : -upm * 0.2;
    const ppu  = fontSize / upm;
    const ascPx = asc * ppu;
    const descPx = desc * ppu;
    return {
        upm,
        ascPx,
        descPx,
        captureHeight: ascPx - descPx,
        ppu,
    };
}

/** @param {CaptureGeometry|null|undefined} g */
export function isValidCaptureGeometry(g) {
    return Boolean(g && g.canvasAdvanceWidth > 0 && g.captureHeight > 0);
}

/**
 * Build capture geometry from a live canvas row (capture save / replay).
 *
 * @param {{
 *   originX     : number,
 *   baselineY   : number,
 *   advanceWidth: number,
 *   fontSize    : number,
 * }} row
 * @param {{ unitsPerEm?:number, ascender?:number, descender?:number }} metrics
 * @returns {CaptureGeometry}
 */
export function captureGeometryFromCanvasRow(row, metrics, fontSize) {
    const band = metricBandPx(metrics, fontSize);
    const baselineY = row.baselineY;
    const advanceWidth = Math.max(1, row.advanceWidth);
    return {
        canvasOriginX:      row.originX,
        canvasBaselineY:    baselineY,
        canvasAdvanceWidth: advanceWidth,
        captureTopY:        baselineY - band.ascPx,
        captureHeight:      band.captureHeight,
        ascPx:              band.ascPx,
        descPx:             band.descPx,
        fontAdvanceWidth:   band.upm,
        traceFontSize:      fontSize,
    };
}

/**
 * Local capture viewport: band top-left at (0,0), baseline at ascPx.
 * Used for atlas cells and geometry backfill when canvas row coords are absent.
 *
 * @param {{ advanceWidthPx:number, fontSize:number }} box
 * @param {{ unitsPerEm?:number, ascender?:number, descender?:number }} metrics
 * @returns {CaptureGeometry}
 */
export function captureGeometryLocal(box, metrics) {
    const band = metricBandPx(metrics, box.fontSize);
    return {
        canvasOriginX:      0,
        canvasBaselineY:    band.ascPx,
        canvasAdvanceWidth: Math.max(1, box.advanceWidthPx),
        captureTopY:        0,
        captureHeight:      band.captureHeight,
        ascPx:              band.ascPx,
        descPx:             band.descPx,
        fontAdvanceWidth:   band.upm,
        traceFontSize:      box.fontSize,
    };
}

/**
 * Prompt geometry used at save/normalise time — identical to stored capture box.
 *
 * @param {CaptureGeometry} captureGeom
 * @returns {PromptGeometry}
 */
export function promptGeometryFromCapture(captureGeom) {
    return {
        canvasOriginX:      captureGeom.canvasOriginX,
        canvasBaselineY:    captureGeom.canvasBaselineY,
        canvasAdvanceWidth: captureGeom.canvasAdvanceWidth,
    };
}

/**
 * Text-line placement (preview compose, capture row ghost/active ink).
 *
 * @param {number} originX
 * @param {number} baselineY
 * @param {number} advanceWidthPx
 * @returns {PromptGeometry}
 */
export function linePromptGeometry(originX, baselineY, advanceWidthPx) {
    return {
        canvasOriginX:      originX,
        canvasBaselineY:    baselineY,
        canvasAdvanceWidth: Math.max(1, advanceWidthPx),
    };
}

/**
 * Isolated viewport placement (atlas cell): capture band scaled to viewport width.
 *
 * @param {CaptureGeometry} captureGeom
 * @param {number} viewportWidthPx
 * @returns {PromptGeometry}
 */
export function viewportPromptGeometry(captureGeom, viewportWidthPx) {
    const w = Math.max(1, viewportWidthPx);
    const s = w / Math.max(1, captureGeom.canvasAdvanceWidth);
    return {
        canvasOriginX:      0,
        canvasBaselineY:    captureGeom.ascPx * s,
        canvasAdvanceWidth: w,
    };
}

/**
 * Pixel cell size for one capture viewport at a uniform display scale.
 * Height is derived from width so scale matches vertically (avoids clipping).
 *
 * @param {CaptureGeometry} captureGeom
 * @param {number}          displayScale
 * @returns {{ w:number, h:number, s:number }}
 */
export function captureCellDimensions(captureGeom, displayScale) {
    const capW = Math.max(1, captureGeom.canvasAdvanceWidth);
    const capH = Math.max(1, captureGeom.captureHeight);
    const w    = Math.max(1, Math.floor(capW * displayScale));
    const s    = w / capW;
    const h    = Math.max(1, Math.floor(capH * s));
    return { w, h, s };
}

// ─── Normalisation ───────────────────────────────────────────────────────────

/**
 * Canvas placement for one prompt — maps glyph-space ↔ pixels.
 *
 * @typedef {{
 *   canvasOriginX      : number,
 *   canvasBaselineY    : number,
 *   canvasAdvanceWidth : number,
 * }} PromptGeometry
 */

/**
 * Persisted capture viewport (ascender→descender band × advance width).
 * Single source for save, capture replay, preview compose, and atlas cells.
 *
 * @typedef {{
 *   canvasOriginX      : number,
 *   canvasBaselineY    : number,
 *   canvasAdvanceWidth : number,
 *   captureTopY        : number,
 *   captureHeight      : number,
 *   ascPx              : number,
 *   descPx             : number,
 *   fontAdvanceWidth   : number,
 *   traceFontSize?     : number,
 * }} CaptureGeometry
 */

/**
 * Transform one stroke's smoothed points from canvas-pixel space into
 * normalised glyph-space.
 *
 * @source blog/docs/pages/tools/utilities/cursive-glyph-builder.md §7 Capture Pipeline
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

/**
 * Map one glyph-space point back to canvas pixels (inverse of {@link normPt}).
 *
 * @param {{ x:number, y:number }} pt
 * @param {PromptGeometry}         promptGeometry
 * @param {number}                 fontAdvanceWidth
 * @returns {{ x:number, y:number }}
 */
export function denormaliseToCanvasSpace(pt, promptGeometry, fontAdvanceWidth) {
    const scale = promptGeometry.canvasAdvanceWidth / fontAdvanceWidth;
    return {
        x: pt.x * scale + promptGeometry.canvasOriginX,
        y: promptGeometry.canvasBaselineY - pt.y * scale,
    };
}

/**
 * Reproject normalised stroke beziers into canvas space for on-canvas display.
 *
 * @param {object[]}       strokes  glyph-space strokes from library storage
 * @param {PromptGeometry} promptGeometry
 * @param {number}         fontAdvanceWidth
 * @returns {object[]}
 */
export function denormaliseStrokes(strokes, promptGeometry, fontAdvanceWidth) {
    const mapPt = (pt) => denormaliseToCanvasSpace(pt, promptGeometry, fontAdvanceWidth);
    return (strokes || []).map((stroke) => ({
        ...stroke,
        beziers: (stroke.beziers || []).map((seg) => ({
            a0: mapPt(seg.a0),
            h1: mapPt(seg.h1),
            h2: mapPt(seg.h2),
            a1: mapPt(seg.a1),
        })),
    }));
}

/** @alias denormaliseStrokes */
export function projectStrokes(strokes, promptGeometry, fontAdvanceWidth) {
    return denormaliseStrokes(strokes, promptGeometry, fontAdvanceWidth);
}

/**
 * Axis-aligned bounds of canvas-space stroke beziers.
 *
 * @param {object[]} strokes
 * @param {number}   [lineWidth=0]  include half stroke width as padding
 * @returns {{ minX:number, minY:number, maxX:number, maxY:number, width:number, height:number }|null}
 */
export function canvasStrokeBounds(strokes, lineWidth = 0) {
    const pad = Math.max(0, lineWidth) * 0.5;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const stroke of strokes || []) {
        for (const seg of stroke.beziers || []) {
            for (const pt of [seg.a0, seg.h1, seg.h2, seg.a1]) {
                if (!pt) continue;
                if (pt.x < minX) minX = pt.x;
                if (pt.y < minY) minY = pt.y;
                if (pt.x > maxX) maxX = pt.x;
                if (pt.y > maxY) maxY = pt.y;
            }
        }
    }

    if (!isFinite(minX)) return null;

    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;
    return {
        minX, minY, maxX, maxY,
        width:  maxX - minX,
        height: maxY - minY,
    };
}

/**
 * Uniform scale + translation to centre ink bounds inside a viewport.
 *
 * @param {{ minX:number, minY:number, maxX:number, maxY:number, width:number, height:number }} bounds
 * @param {number} viewportW
 * @param {number} viewportH
 * @param {number} [fill=0.88]  fraction of viewport to occupy
 * @returns {{ scale:number, tx:number, ty:number }}
 */
export function fitTransformForBounds(bounds, viewportW, viewportH, fill = 0.88) {
    const bw = Math.max(1e-6, bounds.width);
    const bh = Math.max(1e-6, bounds.height);
    const scale = Math.min(viewportW * fill / bw, viewportH * fill / bh);
    const tx = (viewportW - bounds.width * scale) * 0.5 - bounds.minX * scale;
    const ty = (viewportH - bounds.height * scale) * 0.5 - bounds.minY * scale;
    return { scale, tx, ty };
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
