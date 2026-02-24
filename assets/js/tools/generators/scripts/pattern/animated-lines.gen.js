/**
 * Animated Lines - p5.js Generator
 *
 * Horizontal lines morph through arcs into nested polygon rings, then
 * back to lines. Rotation accumulates across each morph step, scaling
 * total rotation to exactly 180°. Each loop the rotation flips half a turn.
 *
 * Note: lines.js and line_2_shape.js are identical sketches; this is
 * the single migrated version.
 *
 * Based on lines / line_2_shape sketches.
 *
 * @version 1.0.0
 */

export const SCRIPT_CONFIG = {
    id: 'animated-lines',
    title: 'Animated Lines',
    category: 'pattern',
    description: 'Horizontal lines morph through arcs into nested polygon rings, rotating through every regular polygon from triangle to circle.',
    version: '1.0.0',

    canvas: { width: 600, height: 500, context: 'p5' },

    parameters: [
        {
            group: 'Shape',
            params: [
                { key: 'lineCount',   type: 'slider', label: 'Line Count',    min: 3,  max: 20,  step: 1,  default: 9 },
                { key: 'outerRadius', type: 'slider', label: 'Outer Radius',  min: 50, max: 250, step: 5,  default: 140 },
                { key: 'polySpacing', type: 'slider', label: 'Poly Spacing',  min: 5,  max: 40,  step: 1,  default: 18 },
                { key: 'resolution',  type: 'slider', label: 'Resolution',    min: 50, max: 400, step: 50, default: 200 },
                { key: 'maxSides',    type: 'slider', label: 'Max Sides',     min: 10, max: 60,  step: 5,  default: 50 }
            ]
        },
        {
            group: 'Timing (ms)',
            params: [
                { key: 'holdLines',   type: 'slider', label: 'Hold Lines (ms)',   min: 200, max: 5000, step: 100, default: 2000 },
                { key: 'morphTime',   type: 'slider', label: 'Morph Time (ms)',   min: 100, max: 2000, step: 100, default: 2000 },
                { key: 'holdPoly',    type: 'slider', label: 'Hold Poly (ms)',    min: 50,  max: 1000, step: 50,  default: 300 },
                { key: 'fps',         type: 'slider', label: 'Simulated FPS',     min: 30,  max: 120,  step: 30,  default: 60 }
            ]
        },
        {
            group: 'Style',
            params: [
                { key: 'strokeWeight', type: 'slider', label: 'Stroke Weight', min: 0.5, max: 5, step: 0.5, default: 1.5 }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            lineCount: 9, outerRadius: 140, polySpacing: 18, resolution: 200,
            maxSides: 50, holdLines: 2000, morphTime: 2000, holdPoly: 300,
            fps: 60, strokeWeight: 1.5
        },
        {
            name: 'Fast',
            lineCount: 9, outerRadius: 140, polySpacing: 18, resolution: 200,
            maxSides: 20, holdLines: 500, morphTime: 500, holdPoly: 100,
            fps: 60, strokeWeight: 1.5
        },
        {
            name: 'Sparse',
            lineCount: 5, outerRadius: 180, polySpacing: 30, resolution: 100,
            maxSides: 30, holdLines: 3000, morphTime: 3000, holdPoly: 500,
            fps: 60, strokeWeight: 2
        }
    ],

    animation: { type: 'infinite', defaultFps: 60 },

    // Cache
    _timeline: null,
    _totalDuration: null,
    _timelineKey: null,

    _buildTimeline(params) {
        const key = `${params.maxSides}|${params.holdLines}|${params.morphTime}|${params.holdPoly}`;
        if (this._timelineKey === key) return;
        this._timelineKey = key;

        const { maxSides, holdLines, morphTime, holdPoly } = params;

        // Internal angle of n-gon
        const internalAngle = n => (n - 2) * Math.PI / n;

        let totalAngles = 0;
        for (let n = 4; n <= maxSides; n++) totalAngles += internalAngle(n);
        const scaleFactor = Math.PI / totalAngles;

        const tl = [];
        tl.push({ type: 'hold',  sides: Infinity, curve: 0, rotation: 0, duration: holdLines });
        tl.push({ type: 'morph', fromSides: Infinity, toSides: 3, fromCurve: 0, toCurve: 1, rotation: 0, duration: morphTime });
        tl.push({ type: 'hold',  sides: 3, curve: 1, rotation: 0, duration: holdPoly });

        let cumRot = 0;
        for (let n = 3; n < maxSides; n++) {
            const targetAngle = internalAngle(n + 1) * scaleFactor;
            const nextRot = cumRot + targetAngle;
            tl.push({ type: 'morph', fromSides: n, toSides: n + 1, fromCurve: 1, toCurve: 1, fromRotation: cumRot, toRotation: nextRot, duration: holdPoly });
            cumRot = nextRot;
            tl.push({ type: 'hold', sides: n + 1, curve: 1, rotation: cumRot, duration: holdPoly });
        }

        tl.push({ type: 'hold',  sides: maxSides, curve: 1, rotation: cumRot, duration: holdPoly * 3 });
        tl.push({ type: 'morph', fromSides: maxSides, toSides: Infinity, fromCurve: 1, toCurve: 0, rotation: cumRot, duration: morphTime });

        this._timeline = tl;
        this._totalDuration = tl.reduce((s, seg) => s + seg.duration, 0);
    },

    _getState(timeMs) {
        const loopIndex = Math.floor(timeMs / this._totalDuration);
        const loopTime  = timeMs % this._totalDuration;
        const baseRot   = loopIndex * Math.PI;
        let elapsed = 0;
        for (const seg of this._timeline) {
            if (loopTime < elapsed + seg.duration) {
                const localT = (loopTime - elapsed) / seg.duration;
                const eased  = 0.5 - 0.5 * Math.cos(localT * Math.PI);
                if (seg.type === 'hold') {
                    return { sides: seg.sides, curve: seg.curve, rotation: baseRot + seg.rotation };
                }
                let rot = seg.rotation !== undefined ? seg.rotation : 0;
                if (seg.fromRotation !== undefined) rot = seg.fromRotation + (seg.toRotation - seg.fromRotation) * eased;
                return {
                    fromSides: seg.fromSides,
                    toSides: seg.toSides,
                    curve: seg.fromCurve + (seg.toCurve - seg.fromCurve) * eased,
                    sidesT: eased,
                    rotation: baseRot + rot
                };
            }
            elapsed += seg.duration;
        }
        return { sides: Infinity, curve: 0, rotation: 0 };
    },

    _buildLines(p, count, outerRadius, resolution) {
        const shapes = [];
        const lineWidth = 2 * outerRadius;
        const totalH = 2 * outerRadius;
        const spacing = totalH / (count - 1);
        const halfW = lineWidth / 2, halfH = totalH / 2;
        for (let i = 0; i < count; i++) {
            const lineY = -halfH + i * spacing;
            const pts = [];
            for (let j = 0; j < resolution; j++) {
                const s = j / resolution;
                pts.push({ x: -halfW + s * lineWidth, y: lineY });
            }
            shapes.push(pts);
        }
        return shapes;
    },

    _buildArcs(p, count, outerRadius, resolution, arcAmount) {
        const shapes = [];
        const lineWidth = 2 * outerRadius;
        const totalH = 2 * outerRadius;
        const spacing = totalH / (count - 1);
        const halfW = lineWidth / 2, halfH = totalH / 2;
        for (let i = 0; i < count; i++) {
            const lineY = -halfH + i * spacing;
            const pts = [];
            for (let j = 0; j < resolution; j++) {
                const s = j / resolution;
                const lineX = -halfW + s * lineWidth;
                const sagAmt = Math.sin(s * Math.PI);
                const sag = halfW * 0.6 * arcAmount * sagAmt;
                const lift = (1 - sagAmt) * halfW * 0.3 * arcAmount;
                pts.push({ x: lineX, y: lineY + sag - lift });
            }
            shapes.push(pts);
        }
        return shapes;
    },

    _buildPolygons(p, n, count, polySpacing, outerRadius, resolution, maxSides) {
        const shapes = [];
        const side = 2 * outerRadius;
        const targetArea = side * side;
        const adjR = n >= maxSides
            ? Math.sqrt(targetArea / Math.PI)
            : Math.sqrt(2 * targetArea / (n * Math.sin(Math.PI * 2 / n)));
        const innerR = adjR - (count - 1) * polySpacing;
        const vOffset = (n === 4) ? -Math.PI / 2 - Math.PI / 4 : -Math.PI / 2;

        // Centroid Y offset
        let minY = Infinity, maxY = -Infinity;
        if (n < maxSides) {
            for (let i = 0; i < n; i++) {
                const a = vOffset - i * (Math.PI * 2 / n);
                const y = adjR * Math.sin(a);
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        } else { minY = maxY = 0; }
        const centY = n >= maxSides ? 0 : -((minY + maxY) / 2);

        for (let i = 0; i < count; i++) {
            const radius = Math.max(innerR + i * polySpacing, polySpacing * 0.3);
            const pts = [];
            for (let j = 0; j < resolution; j++) {
                const s = j / resolution;
                const angle = -Math.PI / 2 - s * Math.PI * 2;
                if (n >= maxSides) {
                    pts.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) + centY });
                } else {
                    const sectorA = Math.PI * 2 / n;
                    const normA = ((vOffset - angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
                    const sector = Math.floor(normA / sectorA);
                    const localT = (normA - sector * sectorA) / sectorA;
                    const a1 = vOffset - sector * sectorA;
                    const a2 = vOffset - (sector + 1) * sectorA;
                    pts.push({
                        x: radius * Math.cos(a1) + (radius * Math.cos(a2) - radius * Math.cos(a1)) * localT,
                        y: radius * Math.sin(a1) + (radius * Math.sin(a2) - radius * Math.sin(a1)) * localT + centY
                    });
                }
            }
            shapes.push(pts);
        }
        return shapes;
    },

    _buildShapes(p, curve, sides, params) {
        const { lineCount: count, outerRadius, polySpacing, resolution, maxSides } = params;
        const arcBlend  = Math.sin(curve * Math.PI);
        const polyBlend = curve;
        const lines = this._buildLines(p, count, outerRadius, resolution);
        const arcs  = this._buildArcs(p, count, outerRadius, resolution, arcBlend);
        const polys = this._buildPolygons(p, sides, count, polySpacing, outerRadius, resolution, maxSides);
        if (curve < 0.001) return lines;
        if (curve > 0.999) return polys;
        return lines.map((line, i) => line.map((lp, j) => {
            const ap = arcs[i][j], pp = polys[i][j];
            const lax = lp.x + (ap.x - lp.x) * arcBlend;
            const lay = lp.y + (ap.y - lp.y) * arcBlend;
            return { x: lax + (pp.x - lax) * polyBlend, y: lay + (pp.y - lay) * polyBlend };
        }));
    },

    _lerpShapes(a, b, t) {
        return a.map((shapeA, i) => shapeA.map((p, j) => ({
            x: p.x + (b[i][j].x - p.x) * t,
            y: p.y + (b[i][j].y - p.y) * t
        })));
    },

    _centroid(shapes) {
        let sx = 0, sy = 0, n = 0;
        for (const s of shapes) for (const pt of s) { sx += pt.x; sy += pt.y; n++; }
        return { x: sx / n, y: sy / n };
    },

    p5Setup(p, params) {
        p.noLoop();
        p.noFill();
    },

    p5Draw(p, params, frame) {
        this._buildTimeline(params);

        const timeMs = frame * (1000 / params.fps);
        const state = this._getState(timeMs);

        let shapes;
        if (state.sidesT !== undefined) {
            const from = this._buildShapes(p, state.curve, state.fromSides, params);
            const to   = this._buildShapes(p, state.curve, state.toSides,   params);
            shapes = this._lerpShapes(from, to, state.sidesT);
        } else {
            shapes = this._buildShapes(p, state.curve, state.sides, params);
        }

        // Centre shapes
        const c = this._centroid(shapes);
        const centred = shapes.map(s => s.map(pt => ({ x: pt.x - c.x, y: pt.y - c.y })));

        p.background(20);
        p.stroke(255);
        p.strokeWeight(params.strokeWeight);

        p.push();
        p.translate(p.width / 2, p.height / 2);
        p.rotate(state.rotation || 0);
        for (const pts of centred) {
            p.beginShape();
            for (const pt of pts) p.vertex(pt.x, pt.y);
            if (state.curve > 0.99) p.endShape(p.CLOSE);
            else p.endShape();
        }
        p.pop();
    }
};
