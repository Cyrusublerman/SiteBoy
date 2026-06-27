/**
 * Order and Disorder - p5.js Generator
 *
 * A grid of points influenced by a rotating bean-shaped field. Points move
 * chaotically in the disorder zone and snap to their grid positions in the
 * order zone. Perlin noise drives individual jiggle during transition.
 *
 * Based on order_and_disorder sketch.
 *
 * @version 1.1.0
 */

import '../../../../shared/algorithms/core/math-utils.js';

export const SCRIPT_CONFIG = {
    id: 'order-disorder',
    title: 'Order and Disorder',
    category: 'pattern',
    description: 'A rotating influence field pulls a grid of points between ordered and chaotic states, driven by Perlin noise.',
    version: '1.1.0',

    canvas: {
        width: 1080, height: 1080, context: 'p5',
        // ORD-04: colourway — background and point colours
        colourway: [
            { id: 'background', label: 'Background', colour: '#ffffff', kind: 'fill'   },
            { id: 'ordered',    label: 'Ordered',    colour: '#000000', kind: 'stroke', lineWidth: 1 },
            { id: 'disordered', label: 'Disordered', colour: '#000000', kind: 'stroke', lineWidth: 1 }
        ]
    },

    // Tier 1 (RAF coalesce) is always active. Tier 2/3 not applicable:
    // point count is grid-spacing-based and does not scale with canvas resolution;
    // p.noise() and p.vertex() require the P5 instance so Worker offload is infeasible.
    compute: { cost: 'particle' },

    equations: [
        { caption: 'Source angle', latex: '\\theta_s = 2\\pi\\,(f \\bmod L)/L' },
        { caption: 'Influence field', latex: '\\alpha = f(\\|\\mathbf{p}-\\mathbf{s}\\|_\\mathrm{polar},\\,\\Delta\\theta)' },
    ],

    parameters: [
        {
            group: 'Grid',
            params: [
                { key: 'gridSpacing',  type: 'slider', label: 'Grid Spacing',  min: 2,  max: 30,  step: 1,    default: 6 },
                { key: 'gridMargin',   type: 'slider', label: 'Grid Margin',   min: 0,  max: 80,  step: 2,    default: 10 },
                { key: 'pointSize',    type: 'slider', label: 'Point Size',    min: 1,  max: 8,   step: 0.5,  default: 2 }
            ]
        },
        {
            group: 'Noise',
            params: [
                // ORD-02: canonical noise type selector (X-010 NoiseTypeSelect)
                { key: 'noiseType',         type: 'noiseTypeSelect', label: 'Noise Type',         default: 'perlin' },
                { key: 'noiseMaxOffset',    type: 'slider', label: 'Noise Offset',        min: 0,     max: 60,   step: 1,     default: 20 },
                { key: 'noiseSpatialScale', type: 'slider', label: 'Noise Spatial Scale', min: 0.005, max: 0.15, step: 0.005, default: 0.03 },
                { key: 'noiseTimeScale',    type: 'slider', label: 'Noise Time Scale',    min: 0.001, max: 0.05, step: 0.001, default: 0.016 },
                { key: 'jiggleAmount',      type: 'slider', label: 'Jiggle Amount',       min: 0,     max: 10,   step: 0.5,   default: 2 },
                { key: 'jiggleSpeed',       type: 'slider', label: 'Jiggle Speed',        min: 0.01,  max: 0.5,  step: 0.01,  default: 0.15 }
            ]
        },
        {
            group: 'Influence',
            params: [
                { key: 'sourceRadius',    type: 'slider', label: 'Source Radius',      min: 50,  max: 500, step: 10,   default: 270 },
                { key: 'innerConstraint', type: 'slider', label: 'Inner Constraint',   min: 50,  max: 400, step: 10,   default: 195 },
                { key: 'outerConstraint', type: 'slider', label: 'Outer Constraint',   min: 50,  max: 400, step: 10,   default: 165 },
                { key: 'cwConstraint',    type: 'slider', label: 'CW Constraint (°)',  min: 10,  max: 120, step: 5,    default: 40 },
                { key: 'ccwConstraint',   type: 'slider', label: 'CCW Constraint (°)', min: 10,  max: 120, step: 5,    default: 70 },
                { key: 'blendFactor',     type: 'slider', label: 'Blend Factor',       min: 0,   max: 1,   step: 0.05, default: 0.8 },
                { key: 'innerRatio',      type: 'slider', label: 'Inner Ratio',        min: 0,   max: 1,   step: 0.05, default: 0.4 }
            ]
        },
        {
            group: 'Animation',
            params: [
                { key: 'loopFrames', type: 'slider', label: 'Loop Frames', min: 60, max: 720, step: 60, default: 360 }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            values: {
                gridSpacing: 6, gridMargin: 10, pointSize: 2,
                noiseMaxOffset: 20, noiseSpatialScale: 0.03, noiseTimeScale: 0.016,
                jiggleAmount: 2, jiggleSpeed: 0.15,
                sourceRadius: 270, innerConstraint: 195, outerConstraint: 165,
                cwConstraint: 40, ccwConstraint: 70, blendFactor: 0.8, innerRatio: 0.4,
                loopFrames: 360
            }
        },
        {
            name: 'Dense',
            values: {
                gridSpacing: 3, gridMargin: 5, pointSize: 1,
                noiseMaxOffset: 15, noiseSpatialScale: 0.04, noiseTimeScale: 0.02,
                jiggleAmount: 3, jiggleSpeed: 0.2,
                sourceRadius: 300, innerConstraint: 200, outerConstraint: 150,
                cwConstraint: 50, ccwConstraint: 80, blendFactor: 0.7, innerRatio: 0.35,
                loopFrames: 360
            }
        },
        {
            name: 'Wide Chaos',
            values: {
                gridSpacing: 8, gridMargin: 10, pointSize: 3,
                noiseMaxOffset: 40, noiseSpatialScale: 0.025, noiseTimeScale: 0.01,
                jiggleAmount: 5, jiggleSpeed: 0.1,
                sourceRadius: 350, innerConstraint: 250, outerConstraint: 200,
                cwConstraint: 60, ccwConstraint: 90, blendFactor: 0.85, innerRatio: 0.5,
                loopFrames: 720
            }
        }
    ],

    // Noise time advances monotonically (t = frame × noiseTimeScale); the disorder
    // field never returns to its initial state. GIF/WebM capture would show a visible
    // discontinuity at any wrap point and are therefore disabled.
    export: { png: true, gif: false, webm: false },

    // ORD-03: Capped at 30 FPS — p5 main-thread Perlin loop is O(N); 60fps exceeds budget at default params.
    animation: { type: 'infinite', defaultFps: 30, animatableParams: ['noiseMaxOffset', 'noiseSpatialScale', 'noiseTimeScale', 'jiggleAmount', 'pointSize'], sequencer: true },

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Order and Disorder renders a rectangular grid of points on a 1080×1080 canvas. A rotating asymmetric bean-shaped influence zone sweeps continuously around the canvas centre. Points inside the zone are pulled toward their home grid positions (ordered state). Points outside the zone drift under Perlin noise displacement (disordered state). Points at the zone boundary receive additional jiggle noise proportional to their proximity to the transition edge. The influence zone completes one orbit in loopFrames frames. Noise time advances monotonically and does not cycle, so the disordered field evolves continuously without repeating.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Grid: points at integer multiples of gridSpacing, inset by gridMargin from each canvas edge. Each point stores its home position (gridX, gridY) and three unique Perlin seed offsets (noiseOffsetX, noiseOffsetY, jiggleOffset). Influence field: sourceTheta = 2π × (frame % loopFrames) / loopFrames. Per-point alpha: dx = px − W/2, dy = py − H/2; currentR = ‖(dx,dy)‖; rawDiffR = currentR − sourceRadius; normR = rawDiffR≥0 ? rawDiffR/outerConstraint : |rawDiffR|/innerConstraint. rawDiffTheta = normalise(atan2(dy,dx) − sourceTheta) ∈ (−π,π]; effectiveR = (1−blendFactor)×sourceRadius + blendFactor×currentR; arcCW = sourceRadius×cwConstraint×π/180; arcCCW = sourceRadius×ccwConstraint×π/180; currentArc = |rawDiffTheta|×effectiveR; normTheta = currentArc/arcCW (CW) or /arcCCW (CCW); curve = 1 (CW) or 0.7 (CCW); curvedR = clamp(normR,0,1)^1; curvedTheta = clamp(normTheta,0,1)^curve; d = ‖(curvedR,curvedTheta)‖; alpha = 1 if d≤innerRatio, else clamp(1−(d−innerRatio)/(1−innerRatio),0,1). Displacement: t = frame×noiseTimeScale; noiseX/Y = (p.noise(spatialCoord+offset, t)−0.5)×2; noisyPos = gridPos + noise×noiseMaxOffset; basePos = lerp(noisyPos, gridPos, alpha). Jiggle: jt = frame×jiggleSpeed; transitionAmt = 1−|alpha−0.5|×2; jx/jy = (p.noise(jiggleOffset±500, jt)−0.5)×2×jiggleAmount×transitionAmt. Draw: p.beginShape(POINTS); p.vertex(baseX+jx, baseY+jy) per point; p.endShape().'
        },
        {
            heading: 'PARAMETERS',
            body: 'Grid — gridSpacing: slider 2–30 step 1 default 6; pixel gap between adjacent grid points, controls density. Rebuilds point array on change. gridMargin: slider 0–80 step 2 default 10; inset in pixels from each canvas edge. Rebuilds point array on change. pointSize: slider 1–8 step 0.5 default 2; strokeWeight for each rendered point. Noise — noiseMaxOffset: slider 0–60 step 1 default 20; maximum pixel displacement applied in the disorder zone. noiseSpatialScale: slider 0.005–0.15 step 0.005 default 0.03; spatial frequency of the Perlin field; lower = smoother broad flows, higher = fine granular displacement. noiseTimeScale: slider 0.001–0.05 step 0.001 default 0.016; rate of noise time advance per frame; controls how fast the disorder field evolves. jiggleAmount: slider 0–10 step 0.5 default 2; maximum jiggle displacement applied at the zone boundary (alpha ≈ 0.5). jiggleSpeed: slider 0.01–0.5 step 0.01 default 0.15; rate of jiggle noise time advance per frame. Influence — sourceRadius: slider 50–500 step 10 default 270; orbital radius of the influence source from the canvas centre. innerConstraint: slider 50–400 step 10 default 195; radial falloff distance (pixels) for points closer to centre than sourceRadius. outerConstraint: slider 50–400 step 10 default 165; radial falloff distance for points further from centre than sourceRadius. cwConstraint: slider 10–120 step 5 default 40; angular arc limit in degrees on the clockwise side; smaller = narrower CW edge. ccwConstraint: slider 10–120 step 5 default 70; angular arc limit in degrees on the counter-clockwise side; larger than CW produces the bean asymmetry. blendFactor: slider 0–1 step 0.05 default 0.8; 0 measures angular arc at sourceRadius; 1 measures at the actual point radius; controls how the bean shape changes at different radii. innerRatio: slider 0–1 step 0.05 default 0.4; fraction of combined distance d below which alpha is forced to 1 (solid ordered core). Animation — loopFrames: slider 60–720 step 60 default 360; number of frames per influence-zone orbit; controls rotation speed, not a true noise loop boundary.'
        },
        {
            heading: 'PRESETS',
            body: 'Classic — gridSpacing 6, gridMargin 10, pointSize 2, loopFrames 360, noiseMaxOffset 20, sourceRadius 270. Balanced default: moderate grid density with a clear ordered island surrounded by a disordered field; gentle boundary jiggle. Dense — gridSpacing 3, gridMargin 5, pointSize 1, loopFrames 360, noiseSpatialScale 0.04, noiseTimeScale 0.02. Fine-grain grid (~177² ≈ 31K points at gridSpacing 6 vs ~353² ≈ 125K at gridSpacing 3 with gridMargin 5); faster, finer noise evolution; narrower inner zone (innerRatio 0.35). Significantly higher per-frame compute cost than Classic. Wide Chaos — gridSpacing 8, gridMargin 10, pointSize 3, loopFrames 720, noiseMaxOffset 40, jiggleAmount 5, sourceRadius 350, cwConstraint 60, ccwConstraint 90. Wider disorder zone and larger influence orbit; slow noise time (0.01); long rotation period (720 frames = 12 s at 60 FPS); coarse grid with large visible displacement.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Point count N = ceil((canvasWidth − 2×gridMargin) / gridSpacing)². At gridSpacing 30 (lowest density): ~37² ≈ 1,369 points. At default gridSpacing 6: ~177² ≈ 31,329 points. At gridSpacing 2, gridMargin 0 (maximum density): ~540² ≈ 291,600 points. Per-frame cost: one pass over all N points. Per point: _getAlpha (1 sqrt, 1 atan2, ~15 arithmetic ops), 3 Perlin noise lookups (3D each, ~30–50 ops apiece), 1 vertex call. Dominant bottleneck: ~94,000 Perlin noise evaluations/frame at default settings; ~875,000 at maximum density — well above the 16ms budget. Avoid gridSpacing 2 during 60 FPS animation. Point rendering uses p.beginShape(POINTS)/p.endShape() to batch all vertex calls into one canvas path operation instead of N individual p.point calls, reducing canvas API overhead. Grid rebuild on gridSpacing or gridMargin change allocates N objects; moderate GC pressure at high N. Worker offload is not feasible: p.noise() and p.vertex() require the P5 instance. Tier 2 adaptive resolution does not reduce point count (grid is spacing-based, not pixel-based) and is therefore not applied.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: infinite — the animation runs continuously without a defined terminal frame. The influence zone rotation is controlled by loopFrames: sourceTheta = 2π × (frame % loopFrames) / loopFrames, completing one orbit every loopFrames frames and producing a visually periodic rotation. Noise time t = frame × noiseTimeScale advances monotonically without modulo; the noise displacement field evolves continuously and never reproduces its earlier state. Animation is therefore non-loopable: there is no frame offset at which the canvas returns to its initial appearance. Default FPS: 60. Export: PNG only. GIF and WebM are disabled — a clean loop capture requires the noise field to return to its initial state, which would require a 4D noise-loop technique (embedding time as an angular parameter in a higher-dimensional Perlin space).'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Noise is non-loopable: t = frame × noiseTimeScale and jt = frame × jiggleSpeed both advance without modulo. A GIF export would show a visible discontinuity at any wrap boundary and is disabled. The influence zone rotation IS periodic (period = loopFrames frames), but the noise displacement state differs at every frame, making seamless loop export infeasible without a fundamentally different noise model. At minimum gridSpacing (2) and gridMargin (0), N ≈ 291,600 points; per-frame time will significantly exceed 16ms on most hardware. The radialCurve exponent for the CW boundary is hardcoded to 1 (linear falloff); the CCW boundary uses 0.7 (softer). Exposing radialCurve as a user slider would give symmetric control over both boundary sharpnesses. loopFrames in the Animation group controls the rotation period, not a true animation loop; this naming is retained for consistency with the influence field description but does not imply a loop boundary for export.'
        },
        {
            heading: 'REFERENCES',
            body: 'Origin: port of order_and_disorder sketch. No legacy specification; Phase 3 source-only analysis. Alpha field: combined radial and angular normalised distance in a 2D constraint space (curvedR, curvedTheta); analogous to a polar SDF with asymmetric angular falloff and an ellipsoidal core threshold. Perlin noise: p5.js built-in p.noise(), 3D gradient noise. Lerp-toward-grid displacement: standard particle anchor technique weighted by the alpha field.'
        }
    ],

    // State (standard pattern per p5-generator-standards.md §7)
    _points: null,
    _lastParams: null,

    _needsRebuild(params) {
        if (!this._lastParams) return true;
        return (
            this._lastParams.gridSpacing !== params.gridSpacing ||
            this._lastParams.gridMargin  !== params.gridMargin
        );
    },

    // ORD-02: value noise fallback for non-Perlin noise types.
    // Uses a Wang-hash lattice to approximate gradient noise without p5 dependency.
    _valueNoise3(x, y, t) {
        const ix = Math.floor(x), iy = Math.floor(y), it = Math.floor(t * 8);
        const fx = x - ix, fy = y - iy, ft = (t * 8) - it;
        const h = (ix, iy, iz) => {
            let s = (ix * 374761393 ^ iy * 1103515245 ^ iz * 2891336453) >>> 0;
            s = (s ^ (s >>> 13)) * 1274126177 >>> 0;
            return ((s ^ (s >>> 16)) & 0xffff) / 65535;
        };
        const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy), ut = ft * ft * (3 - 2 * ft);
        const lerp = (a, b, u) => a + (b - a) * u;
        const a = lerp(lerp(h(ix,iy,it), h(ix+1,iy,it), ux), lerp(h(ix,iy+1,it), h(ix+1,iy+1,it), ux), uy);
        const b = lerp(lerp(h(ix,iy,it+1), h(ix+1,iy,it+1), ux), lerp(h(ix,iy+1,it+1), h(ix+1,iy+1,it+1), ux), uy);
        return lerp(a, b, ut);
    },

    // Dispatch noise evaluation based on noiseType param.
    _evalNoise(p, x, y, t, noiseType) {
        if (!noiseType || noiseType === 'perlin') return p.noise(x, y, t);
        if (noiseType === 'value') return this._valueNoise3(x, y, t);
        if (noiseType === 'fbm') {
            let v = 0, a = 0.5, s = 1;
            for (let o = 0; o < 4; o++) { v += a * p.noise(x * s, y * s, t); a *= 0.5; s *= 2; }
            return v;
        }
        // Fallback: white-gaussian approximation via value noise
        return this._valueNoise3(x + 0.5, y + 0.7, t * 1.3);
    },

    _buildPoints(params, w, h) {
        const { gridSpacing, gridMargin } = params;
        const pts = [];
        let index = 0;
        for (let y = gridMargin; y <= h - gridMargin; y += gridSpacing) {
            for (let x = gridMargin; x <= w - gridMargin; x += gridSpacing) {
                pts.push({
                    gridX: x, gridY: y, index: index++,
                    noiseOffsetX: index * 0.1,
                    noiseOffsetY: index * 0.1 + 1000,
                    jiggleOffset: index * 0.1 + 2000
                });
            }
        }
        return pts;
    },

    _normalizeAngle(theta) {
        while (theta >  Math.PI) theta -= Math.PI * 2;
        while (theta < -Math.PI) theta += Math.PI * 2;
        return theta;
    },

    _getAlpha(px, py, cx, cy, sourceTheta, params) {
        const { sourceRadius, innerConstraint, outerConstraint,
                cwConstraint, ccwConstraint, blendFactor, innerRatio } = params;

        const dx = px - cx, dy = py - cy;
        const currentR = Math.sqrt(dx * dx + dy * dy);
        const currentTheta = Math.atan2(dy, dx);

        const rawDiffR = currentR - sourceRadius;
        const normR = rawDiffR >= 0
            ? rawDiffR / outerConstraint
            : Math.abs(rawDiffR) / innerConstraint;

        const rawDiffTheta = this._normalizeAngle(currentTheta - sourceTheta);

        const effectiveR = (1 - blendFactor) * sourceRadius + blendFactor * currentR;
        const targetArcCW  = sourceRadius * (cwConstraint  * Math.PI / 180);
        const targetArcCCW = sourceRadius * (ccwConstraint * Math.PI / 180);
        const currentArcLen = Math.abs(rawDiffTheta) * effectiveR;
        const normTheta = rawDiffTheta >= 0
            ? currentArcLen / targetArcCW
            : currentArcLen / targetArcCCW;

        const curve = rawDiffTheta >= 0 ? 1 : 0.7;
        const curvedR     = Math.pow(Math.min(1, Math.max(0, normR)),     1);
        const curvedTheta = Math.pow(Math.min(1, Math.max(0, normTheta)), curve);

        const d = Math.sqrt(curvedR * curvedR + curvedTheta * curvedTheta);
        if (d <= innerRatio) return 1.0;
        const falloff = (d - innerRatio) / (1 - innerRatio);
        return Math.min(1, Math.max(0, 1 - falloff));
    },

    p5Setup(p, params) {
        p.noLoop();
        p.noSmooth();
        this._points = this._buildPoints(params, p.width, p.height);
        this._lastParams = { ...params };
    },

    p5Draw(p, params, frame) {
        if (this._needsRebuild(params)) {
            this._points = this._buildPoints(params, p.width, p.height);
            this._lastParams = { ...params };
        }

        // ORD-04: resolve colours from colourway
        const cw          = params.colourway || [];
        const bgEntry     = cw.find(c => c.id === 'background');
        const ordEntry    = cw.find(c => c.id === 'ordered');
        const disEntry    = cw.find(c => c.id === 'disordered');
        const bgColour    = bgEntry  ? bgEntry.colour  : '#ffffff';
        const ordColour   = ordEntry ? ordEntry.colour : '#000000';
        const disColour   = disEntry ? disEntry.colour : '#000000';

        p.background(bgColour);
        p.strokeWeight(params.pointSize);

        const cx = p.width  / 2;
        const cy = p.height / 2;

        const { loopFrames, noiseMaxOffset, noiseSpatialScale,
                noiseTimeScale, jiggleAmount, jiggleSpeed, noiseType } = params;

        const sourceTheta = (Math.PI * 2 * (frame % loopFrames)) / loopFrames;
        const t  = frame * noiseTimeScale;
        const jt = frame * jiggleSpeed;

        // ORD-04: draw in two passes if ordered/disordered colours differ
        const sameColour = ordColour === disColour;
        if (sameColour) {
            p.stroke(ordColour);
            p.beginShape(p.POINTS);
            for (const pt of this._points) {
                const alpha = this._getAlpha(pt.gridX, pt.gridY, cx, cy, sourceTheta, params);
                const sx = pt.gridX * noiseSpatialScale;
                const sy = pt.gridY * noiseSpatialScale;
                const noiseX = (this._evalNoise(p, sx + pt.noiseOffsetX, sy, t, noiseType) - 0.5) * 2;
                const noiseY = (this._evalNoise(p, sx, sy + pt.noiseOffsetY, t, noiseType) - 0.5) * 2;
                const noisyX = pt.gridX + noiseX * noiseMaxOffset;
                const noisyY = pt.gridY + noiseY * noiseMaxOffset;
                const baseX = noisyX + (pt.gridX - noisyX) * alpha;
                const baseY = noisyY + (pt.gridY - noisyY) * alpha;
                const transitionAmt = 1 - Math.abs(alpha - 0.5) * 2;
                const jx = (this._evalNoise(p, pt.jiggleOffset,       0, jt, noiseType) - 0.5) * 2 * jiggleAmount * transitionAmt;
                const jy = (this._evalNoise(p, pt.jiggleOffset + 500, 0, jt, noiseType) - 0.5) * 2 * jiggleAmount * transitionAmt;
                p.vertex(baseX + jx, baseY + jy);
            }
            p.endShape();
        } else {
            // Two passes: ordered and disordered points in different colours
            const ordPoints = [], disPoints = [];
            for (const pt of this._points) {
                const alpha = this._getAlpha(pt.gridX, pt.gridY, cx, cy, sourceTheta, params);
                const sx = pt.gridX * noiseSpatialScale;
                const sy = pt.gridY * noiseSpatialScale;
                const noiseX = (this._evalNoise(p, sx + pt.noiseOffsetX, sy, t, noiseType) - 0.5) * 2;
                const noiseY = (this._evalNoise(p, sx, sy + pt.noiseOffsetY, t, noiseType) - 0.5) * 2;
                const noisyX = pt.gridX + noiseX * noiseMaxOffset;
                const noisyY = pt.gridY + noiseY * noiseMaxOffset;
                const baseX = noisyX + (pt.gridX - noisyX) * alpha;
                const baseY = noisyY + (pt.gridY - noisyY) * alpha;
                const transitionAmt = 1 - Math.abs(alpha - 0.5) * 2;
                const jx = (this._evalNoise(p, pt.jiggleOffset,       0, jt, noiseType) - 0.5) * 2 * jiggleAmount * transitionAmt;
                const jy = (this._evalNoise(p, pt.jiggleOffset + 500, 0, jt, noiseType) - 0.5) * 2 * jiggleAmount * transitionAmt;
                const pos = [baseX + jx, baseY + jy];
                (alpha > 0.5 ? ordPoints : disPoints).push(pos);
            }
            p.stroke(ordColour);
            p.beginShape(p.POINTS);
            for (const [px, py] of ordPoints) p.vertex(px, py);
            p.endShape();
            p.stroke(disColour);
            p.beginShape(p.POINTS);
            for (const [px, py] of disPoints) p.vertex(px, py);
            p.endShape();
        }
    }
};
