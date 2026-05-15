/**
 * Circles — Nested orbital circles generator
 *
 * Two animation models: flat (rigid-arm, original) and nested (epicyclic/spirograph).
 * Three rendering modes: Lines, B/W, Gradient.
 *
 * @script circles
 * @category other
 * @version 2.0.0
 */

import { TWO_PI } from '../../shared/evaluation.js';
import '../../../../shared/algorithms/core/math-utils.js';

export const SCRIPT_CONFIG = (() => {
    let _circles = [];
    let _largestRadius = 0;
    let _prevW = 0;
    let _prevH = 0;

    function initCircles(width, height, count) {
        const canvasSize = Math.min(width, height);
        _largestRadius = (canvasSize / 2) * 0.9;
        const radiusDecrement = _largestRadius / count;
        _circles = Array.from({ length: count }, (_, i) => ({
            radius: _largestRadius - i * radiusDecrement,
            parent: i === 0 ? null : i - 1
        }));
        _prevW = width;
        _prevH = height;
    }

    /**
     * Compute world-space centre for each circle.
     * Flat: all layers share one angle (rigid arm).
     * Nested: each layer accumulates its own angular rate (epicyclic).
     * rotationsPerCycle[i] — added in Phase D CIR-05; defaults to (i+1).
     */
    function computePositions(centerX, centerY, params, frame) {
        const t = frame / params.cycleFrames;
        const nested = (params.animationModel || 'Nested') === 'Nested';
        const rPC = params.rotationsPerCycle || [];

        if (!nested) {
            const angle = t * TWO_PI;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const positions = [{ x: centerX, y: centerY }];
            for (let i = 1; i < _circles.length; i++) {
                const p = positions[i - 1];
                const orbitR = _circles[i - 1].radius - _circles[i].radius;
                positions.push({ x: p.x + orbitR * cosA, y: p.y + orbitR * sinA });
            }
            return positions;
        }

        // Epicyclic: cumulative angle per layer
        const positions = [];
        let cx = centerX;
        let cy = centerY;
        let cumAngle = 0;
        for (let i = 0; i < _circles.length; i++) {
            const speed = rPC[i] != null ? rPC[i] : (i + 1);
            cumAngle += t * TWO_PI * speed;
            const orbitR = i === 0 ? 0 : _circles[i - 1].radius - _circles[i].radius;
            const x = cx + orbitR * Math.cos(cumAngle);
            const y = cy + orbitR * Math.sin(cumAngle);
            positions.push({ x, y });
            cx = x;
            cy = y;
        }
        return positions;
    }

    // CIR-02: resolve colour for a layer index
    function resolveLayerColour(params, i, n, mode) {
        const cw = params.colourway || [];
        const colourMode = params.colourMode || 'uniform';
        if (colourMode === 'per-layer') {
            const layerEntry = cw.find(c => c.id === `layer${i % 5}`);
            return layerEntry ? layerEntry.colour : '#ffffff';
        } else if (colourMode === 'gradient-depth') {
            const v = Math.round(255 * (1 - (i / n) * 0.8));
            return `rgb(${v},${v},${v})`;
        }
        // uniform — use layer0 colour or fallback
        const uniformEntry = cw.find(c => c.id === 'layer0');
        return uniformEntry ? uniformEntry.colour : '#ffffff';
    }

    // CIR-05: build rotationsPerCycle array from individual rpc0..rpc7 params
    function buildRPC(params, n) {
        return Array.from({ length: n }, (_, i) => {
            const v = params[`rpc${i}`];
            return v != null ? v : (i + 1);
        });
    }

    // CIR-08: render one frame of circles at the given frame number
    function renderFrame(ctx, W, H, params, f, alpha) {
        const positions  = computePositions(W / 2, H / 2, params, f);
        const mode       = (params.displayMode || 'Lines').toLowerCase();
        const outputMode = params.outputMode ?? 'display';
        const n          = _circles.length;

        // CIR-07: depth and normal output modes
        if (outputMode === 'depth') {
            // Greyscale per layer-index — outermost bright, innermost dark
            for (let i = n - 1; i >= 0; i--) {
                const v = Math.round(255 * (1 - i / n));
                ctx.fillStyle = `rgb(${v},${v},${v})`;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(positions[i].x, positions[i].y, _circles[i].radius, 0, TWO_PI);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            return;
        }
        if (outputMode === 'normal') {
            // Packed RGB from radius gradient: R = layer normalised, G = radius/maxRadius, B = 0.5
            for (let i = n - 1; i >= 0; i--) {
                const layerN  = (i / Math.max(n - 1, 1));
                const radiusN = _circles[i].radius / _circles[0].radius;
                const r = Math.round(layerN  * 255);
                const g = Math.round(radiusN * 255);
                const b = 128;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(positions[i].x, positions[i].y, _circles[i].radius, 0, TWO_PI);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            return;
        }

        if (mode === 'lines') {
            ctx.lineWidth = 1;
            for (let i = 0; i < n; i++) {
                ctx.strokeStyle = resolveLayerColour(params, i, n, mode);
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(positions[i].x, positions[i].y, _circles[i].radius, 0, TWO_PI);
                ctx.stroke();
            }
        } else if (mode === 'b/w') {
            for (let i = n - 1; i >= 0; i--) {
                const base  = resolveLayerColour(params, i, n, mode);
                ctx.fillStyle = i % 2 === 0 ? base : (params.colourway?.[0]?.colour ?? '#000000');
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(positions[i].x, positions[i].y, _circles[i].radius, 0, TWO_PI);
                ctx.fill();
            }
        } else if (mode === 'gradient') {
            for (let i = n - 1; i >= 0; i--) {
                ctx.fillStyle = resolveLayerColour(params, i, n, mode);
                ctx.globalAlpha = alpha * (1 - (i / n) * 0.7);
                ctx.beginPath();
                ctx.arc(positions[i].x, positions[i].y, _circles[i].radius, 0, TWO_PI);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    function draw(ctx, canvas, params, frame) {
        const W = canvas.width;
        const H = canvas.height;

        // CIR-05: rebuild rPC array from individual params
        params.rotationsPerCycle = buildRPC(params, params.circleCount || 100);

        if (_circles.length !== params.circleCount || _prevW !== W || _prevH !== H) {
            initCircles(W, H, params.circleCount);
        }

        const bgColour = params.colourway?.find?.(c => c.id === 'background')?.colour ?? '#000000';
        ctx.fillStyle = bgColour;
        ctx.fillRect(0, 0, W, H);

        // CIR-08: trail — render ghost frames behind the current one
        const trailLength = params.trailLength | 0;
        const trailDecay  = params.trailDecay  ?? 0.15;
        if (trailLength > 0) {
            for (let t = trailLength; t >= 1; t--) {
                const ghostFrame = Math.max(0, frame - t);
                const ghostAlpha = Math.pow(1 - trailDecay, t);
                renderFrame(ctx, W, H, params, ghostFrame, ghostAlpha);
            }
        }

        // Current frame at full opacity
        renderFrame(ctx, W, H, params, frame, 1);
    }

    return {
        id: 'circles',
        title: 'Nested Circles',
        category: 'other',
        description: 'Nested circles with two animation models (flat rigid-arm / nested epicyclic) and three rendering modes.',
        version: '2.0.0',

        infoSections: [
            {
                heading: 'DESCRIPTION',
                body: 'Circles renders circleCount nested circles in one of two models. Flat: all circles share one angular rate, forming a rigid arm rotating around the canvas centre. Nested (epicyclic): each inner circle accumulates its own angular rate — layer i rotates at (i+1)× the base cycle by default, producing spirograph-style hypotrochoid motion. Lines mode draws only arc outlines (no spokes). B/W fills circles alternating black/white outermost to innermost. Gradient fills with white at decreasing alpha.'
            },
            {
                heading: 'ALGORITHM',
                body: 'initCircles: largestRadius = min(W,H)/2 × 0.9; radiusDecrement = largestRadius/count. computePositions — Flat: angle = (frame/cycleFrames)×2π; x_i = x_{i-1} + (r_{i-1}−r_i)×cosA. Nested: cumAngle_i = Σ_{j≤i}(t×2π×rPC[j]); x_i = x_{i-1} + (r_{i-1}−r_i)×cos(cumAngle_i). Lines: single batched ctx.beginPath path of arc subpaths only — no spoke segments. B/W and Gradient: back-to-front arc fills.'
            },
            {
                heading: 'PARAMETERS',
                body: 'Display — animationModel: radio Flat|Nested default Nested; displayMode: radio Lines|B/W|Gradient default Lines. Animation — circleCount: slider 10–200 step 1 default 100; cycleFrames: slider 600–7200 step 60 default 3600.'
            },
            {
                heading: 'PERFORMANCE',
                body: 'O(circleCount) per frame. Lines mode batches all arcs into a single path. Nested computePositions adds O(n) trigonometry vs flat O(1). At n=200 negligible (<2 ms).'
            },
            {
                heading: 'ANIMATION',
                body: 'Loop, loopFrames=3600. Fully deterministic. animatableParams empty — Phase D CIR-06 adds per-layer modulators.'
            }
        ],

        compute: { cost: 'lightweight' },

        canvas: {
            width: 800,
            height: 800,
            context: '2d',
            background: '#000000',
            // CIR-02: colourway — background + per-layer stroke/fill control
            colourway: [
                { id: 'background', label: 'Background',  colour: '#000000', kind: 'fill'   },
                { id: 'layer0',     label: 'Layer 1',     colour: '#ffffff', kind: 'stroke', lineWidth: 1 },
                { id: 'layer1',     label: 'Layer 2',     colour: '#cccccc', kind: 'stroke', lineWidth: 1 },
                { id: 'layer2',     label: 'Layer 3',     colour: '#999999', kind: 'stroke', lineWidth: 1 },
                { id: 'layer3',     label: 'Layer 4',     colour: '#666666', kind: 'stroke', lineWidth: 1 },
                { id: 'layer4',     label: 'Layer 5',     colour: '#444444', kind: 'stroke', lineWidth: 1 }
            ]
        },

        parameters: [
            {
                group: 'Display',
                params: [
                    { key: 'animationModel', type: 'radio',  label: 'Model',
                      options: ['Flat', 'Nested'], default: 'Nested' },
                    { key: 'displayMode',    type: 'radio',  label: 'Mode',
                      options: ['Lines', 'B/W', 'Gradient'], default: 'Lines' },
                    // CIR-02: per-circle colour mode
                    { key: 'colourMode',     type: 'select', label: 'Colour Mode',
                      options: [
                        { value: 'uniform',  label: 'Uniform' },
                        { value: 'per-layer', label: 'Per Layer (colourway)' },
                        { value: 'gradient-depth', label: 'Gradient by Depth' }
                      ], default: 'uniform' },
                    // CIR-07: output mode
                    { key: 'outputMode', type: 'toggle', label: 'Output Mode',
                      options: ['display', 'depth', 'normal'], default: 'display' }
                ]
            },
            {
                group: 'Animation',
                params: [
                    { key: 'circleCount',  type: 'slider', label: 'Circle Count',
                      min: 10, max: 200, step: 1, default: 100 },
                    { key: 'cycleFrames',  type: 'slider', label: 'Cycle Speed',
                      min: 600, max: 7200, step: 60, default: 3600 }
                ]
            },
            // CIR-05: per-layer rotationsPerCycle (up to 8 layers exposed)
            {
                group: 'Layer Speeds',
                defaultCollapsed: true,
                params: Array.from({ length: 8 }, (_, i) => ({
                    key:     `rpc${i}`,
                    type:    'slider',
                    label:   `Layer ${i + 1} Rotations/Cycle`,
                    min:     -20,
                    max:     20,
                    step:    0.5,
                    default: i + 1,
                    precision: 1
                }))
            },
            // CIR-08: trail + time modulation
            {
                group: 'Trail',
                defaultCollapsed: true,
                params: [
                    { key: 'trailLength',  type: 'slider', label: 'Trail Length',
                      min: 0, max: 60, step: 1, default: 0 },
                    { key: 'trailDecay',   type: 'slider', label: 'Trail Decay',
                      min: 0.01, max: 1, step: 0.01, default: 0.15, precision: 2 }
                ]
            }
        ],

        animation: {
            type: 'loop',
            loopFrames: 3600,
            defaultFps: 60,
            // CIR-06: per-layer speed modulator hooks via animatableParams
            animatableParams: ['rpc0', 'rpc1', 'rpc2', 'rpc3', 'rpc4', 'rpc5', 'rpc6', 'rpc7'],
            sequencer: true,
            animationExport: true
        },

        export: {
            png: true,
            gif: true,
            webm: true,
            sequence: true
        },

        draw
    };
})();
