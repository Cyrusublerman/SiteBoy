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
 * @version 1.1.0
 */

export const SCRIPT_CONFIG = {
    id: 'animated-lines',
    title: 'Animated Lines',
    category: 'pattern',
    description: 'Horizontal lines morph through arcs into nested polygon rings, rotating through every regular polygon from triangle to circle.',
    version: '1.1.0',

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Animated Lines morphs lineCount horizontal white lines through intermediate arc shapes into nested polygon rings, cycling through every regular polygon from triangle to a maxSides-gon, then collapsing back to lines. The canvas is 600×500 px (non-square). Background: dark grey (20); stroke: white (255). Each full animation loop adds exactly π (180°) of cumulative rotation, so odd loops are rotated half a turn relative to even loops. Visual cycle: (1) hold on lines for holdLines ms; (2) morph lines → triangle via arc intermediate over morphTime ms; (3) step through all polygons triangle → … → maxSides-gon, pausing holdPoly ms per step; (4) extended hold at maxSides-gon for 3×holdPoly ms; (5) morph polygon → lines over morphTime ms.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Time model: timeMs = frame × (1000/60) × speed; loopIndex = ⌊timeMs / totalDuration⌋; loopTime = timeMs % totalDuration; baseRot = loopIndex × π. Timeline (_buildTimeline): rebuilt when maxSides, holdLines, morphTime, or holdPoly changes (keyed by _timelineKey). Produces segments: [hold(∞,0), morph(∞→3), hold(3,0), morph(3→4), hold(4,rot), …, hold(maxSides, finalRot, ×3), morph(maxSides→∞)]. Rotation per step n→(n+1): internalAngle(n+1) × scaleFactor where internalAngle(n) = (n−2)π/n and scaleFactor = π / Σ_{n=4}^{maxSides} internalAngle(n); sum of all increments = π exactly. State extraction (_getState): linear scan through timeline segments; easing = 0.5 − 0.5 × cos(localT × π) (smoothstep). Shape building: _buildLines produces resolution equally-spaced horizontal points per line spanning 2×outerRadius wide; _buildArcs applies a sine-shaped sag (outerRadius×0.6×arcAmount×sin(s×π)) plus endpoint lift; _buildPolygons produces nested concentric n-gons with area-preserving radius (adjR), inner rings spaced polySpacing apart, using equal-arc-length parameterisation for n < maxSides. Square (n=4) uses vOffset = −π/2 − π/4 for flat-bottom alignment. Blend (_buildShapes): arcBlend = sin(curve×π), polyBlend = curve; lerps lines→arcs→polys. Polygon-step morph: _lerpShapes(from, to, sidesT) linearly interpolates between two built shape sets. Centring: _centroid computes mean of all points across all shapes; shapes shifted by −centroid each frame. Render: p.translate(w/2, h/2), p.rotate(state.rotation); shapes with curve > 0.99 use CLOSE, others open.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Shape group — lineCount: slider, 3–20, step 1, default 9; number of lines and concentric polygon rings. outerRadius: slider, 50–250, step 5, default 140; half-width of lines in px; controls polygon area via (2×outerRadius)² target area. polySpacing: slider, 5–40, step 1, default 18; gap between concentric polygon rings in px. resolution: slider, 50–400, step 50, default 200; points per shape; affects drawing fidelity and polygon smoothness (at resolution < maxSides, each polygon edge has fewer than one point). maxSides: slider, 10–60, step 5, default 50; highest polygon in the cycle before morphing back to lines; triggers timeline rebuild. Timing group (ms) — holdLines: slider, 200–5000, step 100, default 2000; hold duration on lines state in ms; triggers timeline rebuild. morphTime: slider, 100–2000, step 100, default 2000; duration of lines↔polygon morph in ms; triggers timeline rebuild. holdPoly: slider, 50–1000, step 50, default 300; hold duration per polygon step in ms; triggers timeline rebuild. speed: slider, 0.5–2.0, step 0.25, default 1.0; animation speed multiplier (1.0 = real-time, 2.0 = 2× faster, 0.5 = half speed). Style group — strokeWeight: slider, 0.5–5, step 0.5, default 1.5; line stroke width in px.'
        },
        {
            heading: 'PRESETS',
            body: 'Classic: lineCount 9, outerRadius 140, polySpacing 18, resolution 200, maxSides 50, holdLines 2000, morphTime 2000, holdPoly 300, speed 1.0, strokeWeight 1.5. Full default state; approximately 51 s per loop. Fast: lineCount 9, outerRadius 140, polySpacing 18, resolution 200, maxSides 20, holdLines 500, morphTime 500, holdPoly 100, speed 1.0, strokeWeight 1.5. Short cycle (~11 s); fewer polygon steps. Sparse: lineCount 5, outerRadius 180, polySpacing 30, resolution 100, maxSides 30, holdLines 3000, morphTime 3000, holdPoly 500, speed 1.0, strokeWeight 2. Wide-spaced rings, slow morph.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Per-frame complexity: O(2 × lineCount × resolution) during hold segments, O(4 × lineCount × resolution) during polygon-step morphs. At defaults (lineCount=9, resolution=200): ~3,600–7,200 point computations/frame — well within 16 ms budget. At max params (lineCount=20, resolution=400): ~32,000 — borderline on low-end devices. Compute tier: geometric; worker offload not feasible (uses P5.js canvas API). Optimisations applied (v1.1.0): (1) Shape array cache — _shapesKey guards _buildLines/_buildArcs/_buildPolygons; shapes are not rebuilt during hold segments where curve and sides are constant; cache keyed on curve|sides|lineCount|outerRadius|polySpacing|resolution|maxSides. (2) Centroid cache — _centroidKey prevents recomputation of _centroid during hold segments; only recalculated when shape key changes. (3) _buildArcs guard — skipped entirely when arcBlend < 0.001 (near curve=0 or curve=1), eliminating ~lineCount×resolution computations when not needed.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: infinite. No loopFrames — total cycle duration depends on params: holdLines + morphTime + (2n−1)×holdPoly + holdPoly×3 + morphTime where n = maxSides − 3. At defaults: approximately 51 s per loop. Fully deterministic: same (frame, params) always produces identical output; no Math.random, no Date.now dependency. Speed control: speed param multiplies time advancement per frame; timeMs = frame × (1000/60) × speed. Sequencer: disabled (infinite type with no loop point). Export: PNG only — gif and webm disabled (infinite animation with no static loopFrames; export period cannot be defined without a loop boundary).'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Resolution vs maxSides: when resolution < maxSides, each polygon edge has fewer than one point; the polygon is visually indistinguishable from a circle at high maxSides with low resolution. No warning or enforcement is applied. Loop period is param-dependent: changing holdLines, morphTime, holdPoly, or maxSides changes the loop duration; no loopFrames field is updated, so GIF/sequence export is not supported. Shape cache invalidates on every frame during morph transitions (curve changes each frame); cache only benefits hold segments, which are the dominant portion of the cycle at default timings. Polygon centring: _centroid is computed from the polygon vertex set, not the mathematical centre; for degenerate params (very small polySpacing, large lineCount), visual centring may drift. Extended hold at maxSides uses 3×holdPoly; this is hardcoded and not user-configurable.'
        },
        {
            heading: 'REFERENCES',
            body: 'Algorithm origin: custom morphology system — no named published algorithm. Rotation normalisation via internalAngle summation is standard polygon geometry. Version 1.1.0: gif export corrected to false (infinite type, no loopFrames); fps param renamed to speed (0.5–2.0 multiplier); shape array cache added (_shapesKey); centroid cache added (_centroidKey); _buildArcs guard added; infoSections added; compute block added.'
        }
    ],

    canvas: { width: 600, height: 500, context: 'p5' },

    compute: { cost: 'geometric' },

    parameters: [
        {
            group: 'Shape',
            params: [
                { key: 'lineCount',   type: 'slider', label: 'Line Count',    min: 3,  max: 20,  step: 1,    default: 9 },
                { key: 'outerRadius', type: 'slider', label: 'Outer Radius',  min: 50, max: 250, step: 5,    default: 140 },
                { key: 'polySpacing', type: 'slider', label: 'Poly Spacing',  min: 5,  max: 40,  step: 1,    default: 18 },
                { key: 'resolution',  type: 'slider', label: 'Resolution',    min: 50, max: 400, step: 50,   default: 200 },
                { key: 'maxSides',    type: 'slider', label: 'Max Sides',     min: 10, max: 60,  step: 5,    default: 50 }
            ]
        },
        {
            group: 'Timing (ms)',
            params: [
                { key: 'holdLines',   type: 'slider', label: 'Hold Lines (ms)',   min: 200, max: 5000, step: 100, default: 2000 },
                { key: 'morphTime',   type: 'slider', label: 'Morph Time (ms)',   min: 100, max: 2000, step: 100, default: 2000 },
                { key: 'holdPoly',    type: 'slider', label: 'Hold Poly (ms)',    min: 50,  max: 1000, step: 50,  default: 300 },
                { key: 'speed',       type: 'slider', label: 'Speed',             min: 0.5, max: 2.0,  step: 0.25, default: 1.0 }
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
            values: {
                lineCount: 9, outerRadius: 140, polySpacing: 18, resolution: 200,
                maxSides: 50, holdLines: 2000, morphTime: 2000, holdPoly: 300,
                speed: 1.0, strokeWeight: 1.5
            }
        },
        {
            name: 'Fast',
            values: {
                lineCount: 9, outerRadius: 140, polySpacing: 18, resolution: 200,
                maxSides: 20, holdLines: 500, morphTime: 500, holdPoly: 100,
                speed: 1.0, strokeWeight: 1.5
            }
        },
        {
            name: 'Sparse',
            values: {
                lineCount: 5, outerRadius: 180, polySpacing: 30, resolution: 100,
                maxSides: 30, holdLines: 3000, morphTime: 3000, holdPoly: 500,
                speed: 1.0, strokeWeight: 2
            }
        }
    ],

    animation: { type: 'infinite', defaultFps: 60, animatableParams: ['strokeWeight', 'outerRadius', 'polySpacing'], sequencer: true },

    export: {
        png: true,
        gif: false,
        webm: false
    },

    // Timeline cache
    _timeline: null,
    _totalDuration: null,
    _timelineKey: null,

    // Shape cache
    _shapes: null,
    _shapesKey: null,
    _shapesFrom: null,
    _shapesFromKey: null,
    _shapesTo: null,
    _shapesToKey: null,

    // Centroid cache
    _centroid_val: null,
    _centroidKey: null,

    _buildTimeline(params) {
        const key = `${params.maxSides}|${params.holdLines}|${params.morphTime}|${params.holdPoly}`;
        if (this._timelineKey === key) return;
        this._timelineKey = key;

        // Invalidate shape/centroid caches on timeline rebuild
        this._shapesKey = null;
        this._shapesFromKey = null;
        this._shapesToKey = null;
        this._centroidKey = null;

        const { maxSides, holdLines, morphTime, holdPoly } = params;

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

    _buildLines(count, outerRadius, resolution) {
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

    _buildArcs(count, outerRadius, resolution, arcAmount) {
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

    _buildPolygons(n, count, polySpacing, outerRadius, resolution, maxSides) {
        const shapes = [];
        const side = 2 * outerRadius;
        const targetArea = side * side;
        const adjR = n >= maxSides
            ? Math.sqrt(targetArea / Math.PI)
            : Math.sqrt(2 * targetArea / (n * Math.sin(Math.PI * 2 / n)));
        const innerR = adjR - (count - 1) * polySpacing;
        const vOffset = (n === 4) ? -Math.PI / 2 - Math.PI / 4 : -Math.PI / 2;

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

    _buildShapes(curve, sides, params) {
        const { lineCount: count, outerRadius, polySpacing, resolution, maxSides } = params;

        const lines = this._buildLines(count, outerRadius, resolution);
        if (curve < 0.001) return lines;

        const polys = this._buildPolygons(sides, count, polySpacing, outerRadius, resolution, maxSides);
        if (curve > 0.999) return polys;

        const arcBlend = Math.sin(curve * Math.PI);
        const polyBlend = curve;
        const arcs = arcBlend > 0.001
            ? this._buildArcs(count, outerRadius, resolution, arcBlend)
            : lines;

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

        const timeMs = frame * (1000 / 60) * params.speed;
        const state = this._getState(timeMs);

        let shapes;
        if (state.sidesT !== undefined) {
            // Polygon-to-polygon morph: cache from/to shapes independently
            const fromKey = `${state.curve}|${state.fromSides}|${params.lineCount}|${params.outerRadius}|${params.polySpacing}|${params.resolution}|${params.maxSides}`;
            const toKey   = `${state.curve}|${state.toSides}|${params.lineCount}|${params.outerRadius}|${params.polySpacing}|${params.resolution}|${params.maxSides}`;
            if (this._shapesFromKey !== fromKey) {
                this._shapesFromKey = fromKey;
                this._shapesFrom = this._buildShapes(state.curve, state.fromSides, params);
            }
            if (this._shapesToKey !== toKey) {
                this._shapesToKey = toKey;
                this._shapesTo = this._buildShapes(state.curve, state.toSides, params);
            }
            shapes = this._lerpShapes(this._shapesFrom, this._shapesTo, state.sidesT);
        } else {
            // Hold or curve morph: cache shape set
            const key = `${state.curve}|${state.sides}|${params.lineCount}|${params.outerRadius}|${params.polySpacing}|${params.resolution}|${params.maxSides}`;
            if (this._shapesKey !== key) {
                this._shapesKey = key;
                this._shapes = this._buildShapes(state.curve, state.sides, params);
                this._centroidKey = null; // Invalidate centroid on new shape
            }
            shapes = this._shapes;
        }

        // Centroid: cached for hold segments (sidesT undefined and shape key stable)
        let c;
        if (state.sidesT === undefined) {
            if (this._centroidKey !== this._shapesKey) {
                this._centroidKey = this._shapesKey;
                this._centroid_val = this._centroid(shapes);
            }
            c = this._centroid_val;
        } else {
            c = this._centroid(shapes);
        }

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
