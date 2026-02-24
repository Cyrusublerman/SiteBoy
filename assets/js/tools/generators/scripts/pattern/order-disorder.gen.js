/**
 * Order and Disorder - p5.js Generator
 *
 * A grid of points influenced by a rotating bean-shaped field. Points move
 * chaotically in the disorder zone and snap to their grid positions in the
 * order zone. Perlin noise drives individual jiggle during transition.
 *
 * Based on order_and_disorder sketch.
 *
 * @version 1.0.0
 */

export const SCRIPT_CONFIG = {
    id: 'order-disorder',
    title: 'Order and Disorder',
    category: 'pattern',
    description: 'A rotating influence field pulls a grid of points between ordered and chaotic states, driven by Perlin noise.',
    version: '1.0.0',

    canvas: { width: 1080, height: 1080, context: 'p5' },

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
                { key: 'noiseMaxOffset',    type: 'slider', label: 'Noise Offset',        min: 0,    max: 60,   step: 1,     default: 20 },
                { key: 'noiseSpatialScale', type: 'slider', label: 'Noise Spatial Scale', min: 0.005, max: 0.15, step: 0.005, default: 0.03 },
                { key: 'noiseTimeScale',    type: 'slider', label: 'Noise Time Scale',    min: 0.001, max: 0.05, step: 0.001, default: 0.016 },
                { key: 'jiggleAmount',      type: 'slider', label: 'Jiggle Amount',       min: 0,    max: 10,   step: 0.5,   default: 2 },
                { key: 'jiggleSpeed',       type: 'slider', label: 'Jiggle Speed',        min: 0.01, max: 0.5,  step: 0.01,  default: 0.15 }
            ]
        },
        {
            group: 'Influence',
            params: [
                { key: 'sourceRadius',     type: 'slider', label: 'Source Radius',      min: 50,  max: 500, step: 10,   default: 270 },
                { key: 'innerConstraint',  type: 'slider', label: 'Inner Constraint',   min: 50,  max: 400, step: 10,   default: 195 },
                { key: 'outerConstraint',  type: 'slider', label: 'Outer Constraint',   min: 50,  max: 400, step: 10,   default: 165 },
                { key: 'cwConstraint',     type: 'slider', label: 'CW Constraint (°)',  min: 10,  max: 120, step: 5,    default: 40 },
                { key: 'ccwConstraint',    type: 'slider', label: 'CCW Constraint (°)', min: 10,  max: 120, step: 5,    default: 70 },
                { key: 'blendFactor',      type: 'slider', label: 'Blend Factor',       min: 0,   max: 1,   step: 0.05, default: 0.8 },
                { key: 'innerRatio',       type: 'slider', label: 'Inner Ratio',        min: 0,   max: 1,   step: 0.05, default: 0.4 }
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
            gridSpacing: 6, gridMargin: 10, pointSize: 2,
            noiseMaxOffset: 20, noiseSpatialScale: 0.03, noiseTimeScale: 0.016,
            jiggleAmount: 2, jiggleSpeed: 0.15,
            sourceRadius: 270, innerConstraint: 195, outerConstraint: 165,
            cwConstraint: 40, ccwConstraint: 70, blendFactor: 0.8, innerRatio: 0.4,
            loopFrames: 360
        },
        {
            name: 'Dense',
            gridSpacing: 3, gridMargin: 5, pointSize: 1,
            noiseMaxOffset: 15, noiseSpatialScale: 0.04, noiseTimeScale: 0.02,
            jiggleAmount: 3, jiggleSpeed: 0.2,
            sourceRadius: 300, innerConstraint: 200, outerConstraint: 150,
            cwConstraint: 50, ccwConstraint: 80, blendFactor: 0.7, innerRatio: 0.35,
            loopFrames: 360
        },
        {
            name: 'Wide Chaos',
            gridSpacing: 8, gridMargin: 10, pointSize: 3,
            noiseMaxOffset: 40, noiseSpatialScale: 0.025, noiseTimeScale: 0.01,
            jiggleAmount: 5, jiggleSpeed: 0.1,
            sourceRadius: 350, innerConstraint: 250, outerConstraint: 200,
            cwConstraint: 60, ccwConstraint: 90, blendFactor: 0.85, innerRatio: 0.5,
            loopFrames: 720
        }
    ],

    animation: { type: 'loop', loopFrames: 360, defaultFps: 60 },

    // State
    _points: null,
    _lastParams: null,

    _needsRebuild(params) {
        if (!this._lastParams) return true;
        return (
            this._lastParams.gridSpacing !== params.gridSpacing ||
            this._lastParams.gridMargin  !== params.gridMargin
        );
    },

    _buildPoints(params) {
        const { gridSpacing, gridMargin } = params;
        const W = 1080, H = 1080;
        const pts = [];
        let index = 0;
        for (let y = gridMargin; y <= H - gridMargin; y += gridSpacing) {
            for (let x = gridMargin; x <= W - gridMargin; x += gridSpacing) {
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

    _getAlpha(px, py, sourceTheta, params) {
        const { sourceRadius, innerConstraint, outerConstraint,
                cwConstraint, ccwConstraint, blendFactor, innerRatio } = params;

        const dx = px - 540, dy = py - 540;
        const currentR = Math.sqrt(dx * dx + dy * dy);
        const currentTheta = Math.atan2(dy, dx);

        const rawDiffR = currentR - sourceRadius;
        const normR = rawDiffR >= 0
            ? rawDiffR / outerConstraint
            : Math.abs(rawDiffR) / innerConstraint;

        let rawDiffTheta = this._normalizeAngle(currentTheta - sourceTheta);

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
        const t = (d - innerRatio) / (1 - innerRatio);
        return Math.min(1, Math.max(0, 1 - t));
    },

    p5Setup(p, params) {
        p.noLoop();
        p.noSmooth();
        this._points = this._buildPoints(params);
        this._lastParams = { ...params };
    },

    p5Draw(p, params, frame) {
        if (this._needsRebuild(params)) {
            this._points = this._buildPoints(params);
            this._lastParams = { ...params };
        }

        p.background(255);
        p.stroke(0);
        p.strokeWeight(params.pointSize);

        const { loopFrames, noiseMaxOffset, noiseSpatialScale,
                noiseTimeScale, jiggleAmount, jiggleSpeed } = params;

        const sourceTheta = (Math.PI * 2 * (frame % loopFrames)) / loopFrames;
        const t = frame * noiseTimeScale;

        for (const pt of this._points) {
            const alpha = this._getAlpha(pt.gridX, pt.gridY, sourceTheta, params);

            // Noisy displaced position
            const sx = pt.gridX * noiseSpatialScale;
            const sy = pt.gridY * noiseSpatialScale;
            const noiseX = (p.noise(sx + pt.noiseOffsetX, sy, t) - 0.5) * 2;
            const noiseY = (p.noise(sx, sy + pt.noiseOffsetY, t) - 0.5) * 2;
            const noisyX = pt.gridX + noiseX * noiseMaxOffset;
            const noisyY = pt.gridY + noiseY * noiseMaxOffset;

            // Interpolated base position
            const baseX = noisyX + (pt.gridX - noisyX) * alpha;
            const baseY = noisyY + (pt.gridY - noisyY) * alpha;

            // Jiggle during transition
            const jt = frame * jiggleSpeed;
            const transitionAmt = 1 - Math.abs(alpha - 0.5) * 2;
            const jx = (p.noise(pt.jiggleOffset,       jt) - 0.5) * 2 * jiggleAmount * transitionAmt;
            const jy = (p.noise(pt.jiggleOffset + 500, jt) - 0.5) * 2 * jiggleAmount * transitionAmt;

            p.point(baseX + jx, baseY + jy);
        }
    }
};
