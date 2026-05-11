/**
 * Bezier Fit — fit a cubic Bezier path to a smoothed polyline and extract
 * connection anchors.
 *
 * Pure functions; no DOM, no globals, no side effects.
 *
 * Algorithm summary
 * -----------------
 * 1. Identify anchor positions at curvature extrema along the polyline (plus
 *    first and last points).
 * 2. Between each consecutive anchor pair, fit one cubic Bezier segment using
 *    the 1/3–2/3 heuristic: the two handles are placed at t=1/3 and t=2/3
 *    along the chord, offset along the local tangent direction.
 * 3. Anchors are then labelled: first anchor → 'entry', last → 'exit',
 *    intermediate anchors → 'tangent'.
 *
 * @source blog/docs/temp/cursive-glyph-builder.md §5.2 bezier-fit.js
 * @wikipedia https://en.wikipedia.org/wiki/Bezier_curve#Cubic_B%C3%A9zier_curves
 * @formula
 *   h1 = P0 + (1/3)·(P3 − P0)  (approximation for smooth open stroke)
 *   h2 = P3 − (1/3)·(P3 − P0)
 *
 * @module shared/algorithms/typography/bezier-fit
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * @typedef {{ x:number, y:number }} Point
 * @typedef {{ a0:Point, h1:Point, h2:Point, a1:Point }} BezierSegment
 * @typedef {{ id:string, role:'entry'|'exit'|'tangent', strokeId:string,
 *             segmentIndex:number, t:number, x:number, y:number,
 *             angle:number, isEndpoint:boolean }} Anchor
 */

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function _dist(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function _tangentAngle(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
}

/**
 * Curvature at index i (discrete, via cross-product of consecutive chords).
 * Returns signed curvature in arbitrary units.
 */
function _curvature(pts, i) {
    if (i <= 0 || i >= pts.length - 1) return 0;
    const prev = pts[i - 1], cur = pts[i], next = pts[i + 1];
    const ax = cur.x - prev.x, ay = cur.y - prev.y;
    const bx = next.x - cur.x, by = next.y - cur.y;
    const cross = ax * by - ay * bx;
    const denom = (_dist(prev, cur) * _dist(cur, next)) || 1;
    return cross / denom;
}

// ─── Anchor detection ─────────────────────────────────────────────────────────

/**
 * Identify indices in a polyline that correspond to curvature extrema.
 * Uses a simple local maximum/minimum search over |curvature|.
 *
 * @param {Point[]} pts
 * @param {number}  [minSep=4]  minimum index separation between extrema
 * @returns {number[]}  sorted indices including 0 and pts.length-1
 */
function _extremaIndices(pts, minSep = 4) {
    const n = pts.length;
    const curv = pts.map((_, i) => Math.abs(_curvature(pts, i)));
    const extrema = new Set([0, n - 1]);

    let lastAdded = 0;
    for (let i = 1; i < n - 1; i++) {
        if (i - lastAdded < minSep) continue;
        if (curv[i] > curv[i - 1] && curv[i] > curv[i + 1] && curv[i] > 0.01) {
            extrema.add(i);
            lastAdded = i;
        }
    }
    return Array.from(extrema).sort((a, b) => a - b);
}

// ─── Segment fitting ─────────────────────────────────────────────────────────

/**
 * Fit a single cubic Bezier segment between two points using tangent
 * vectors at start and end.
 *
 * Handle length is α × chord_length.
 *
 * @source https://pomax.github.io/bezierinfo/#fitting
 * @formula h1 = a0 + α·chord·tangent_at_a0;  h2 = a1 − α·chord·tangent_at_a1
 *
 * @param {Point}  a0
 * @param {Point}  a1
 * @param {Point}  tanA0   unit tangent direction at a0 (outgoing)
 * @param {Point}  tanA1   unit tangent direction at a1 (incoming)
 * @param {number} [alpha=0.333]
 * @returns {BezierSegment}
 */
function _fitSegment(a0, a1, tanA0, tanA1, alpha = 0.333) {
    const chord = _dist(a0, a1);
    const h1len = alpha * chord;
    const h2len = alpha * chord;
    return {
        a0,
        h1: { x: a0.x + tanA0.x * h1len, y: a0.y + tanA0.y * h1len },
        h2: { x: a1.x - tanA1.x * h2len, y: a1.y - tanA1.y * h2len },
        a1,
    };
}

/**
 * Estimate the outgoing unit tangent at pts[i].
 * Uses the vector to the next point (or previous for the last point).
 */
function _tangentAt(pts, i) {
    let dx, dy;
    if (i < pts.length - 1) {
        dx = pts[i + 1].x - pts[i].x;
        dy = pts[i + 1].y - pts[i].y;
    } else {
        dx = pts[i].x - pts[i - 1].x;
        dy = pts[i].y - pts[i - 1].y;
    }
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dx / len, y: dy / len };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fit cubic Bezier segments to a smoothed polyline.
 *
 * @param {Point[]} points  smoothed polyline (output of stroke-capture.smoothStroke)
 * @returns {BezierSegment[]}
 */
export function fitCubicsToPolyline(points) {
    if (!points || points.length < 2) return [];

    const anchorIdxs = _extremaIndices(points);
    const segments   = [];

    for (let k = 0; k < anchorIdxs.length - 1; k++) {
        const i0 = anchorIdxs[k];
        const i1 = anchorIdxs[k + 1];
        const a0    = points[i0];
        const a1    = points[i1];
        const tan0  = _tangentAt(points, i0);
        const tan1  = _tangentAt(points, i1);
        segments.push(_fitSegment(a0, a1, tan0, tan1));
    }

    return segments;
}

/**
 * Extract entry, exit, and mid-stroke tangent anchors from a set of
 * Bezier segments for one stroke.
 *
 * @param {BezierSegment[]} segments
 * @param {string}          strokeId
 * @returns {Anchor[]}
 */
export function extractAnchors(segments, strokeId) {
    if (!segments || segments.length === 0) return [];

    const anchors = [];
    let anchorSeq = 0;

    const makeId = () => `anchor_${strokeId}_${String(anchorSeq++).padStart(3, '0')}`;

    // Entry anchor: start of first segment
    const first = segments[0];
    anchors.push({
        id:           makeId(),
        role:         'entry',
        strokeId,
        segmentIndex: 0,
        t:            0,
        x:            first.a0.x,
        y:            first.a0.y,
        angle:        _tangentAngle(first.a0, first.h1),
        isEndpoint:   true,
    });

    // Mid-stroke tangent anchors: at each internal a0 (connection between segments)
    for (let i = 1; i < segments.length; i++) {
        const seg = segments[i];
        anchors.push({
            id:           makeId(),
            role:         'tangent',
            strokeId,
            segmentIndex: i,
            t:            0,
            x:            seg.a0.x,
            y:            seg.a0.y,
            angle:        _tangentAngle(segments[i - 1].h2, seg.a0),
            isEndpoint:   false,
        });
    }

    // Exit anchor: end of last segment
    const last = segments[segments.length - 1];
    anchors.push({
        id:           makeId(),
        role:         'exit',
        strokeId,
        segmentIndex: segments.length - 1,
        t:            1,
        x:            last.a1.x,
        y:            last.a1.y,
        angle:        _tangentAngle(last.h2, last.a1),
        isEndpoint:   true,
    });

    return anchors;
}
