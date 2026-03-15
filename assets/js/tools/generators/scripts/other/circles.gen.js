/**
 * Circles — Nested orbital circles generator
 *
 * circleCount circles with linearly decreasing radii form a chain. All orbits
 * share a single angular rate, so the chain rotates as one rigid arm — not
 * epicyclic rolling motion. Three rendering modes: Lines, B/W, Gradient.
 *
 * @script circles
 * @category other
 * @version 1.0.0
 */

import { TWO_PI } from '../../shared/evaluation.js';

export const SCRIPT_CONFIG = (() => {
    // --- Closure state (replaces module-level mutable vars) ---
    let _circles = [];
    let _largestRadius = 0;
    let _radiusDecrement = 0;
    let _prevW = 0;
    let _prevH = 0;

    function initCircles(width, height, count) {
        const canvasSize = Math.min(width, height);
        _largestRadius = (canvasSize / 2) * 0.9;
        _radiusDecrement = _largestRadius / count;
        _circles = [];
        for (let i = 0; i < count; i++) {
            _circles.push({
                radius: _largestRadius - i * _radiusDecrement,
                parent: i === 0 ? null : i - 1
            });
        }
        _prevW = width;
        _prevH = height;
    }

    function draw(ctx, canvas, params, frame) {
        const W = canvas.width;
        const H = canvas.height;
        const centerX = W / 2;
        const centerY = H / 2;

        if (_circles.length !== params.circleCount || _prevW !== W || _prevH !== H) {
            initCircles(W, H, params.circleCount);
        }

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);

        const cycleFrames = params.cycleFrames;
        const orbitAngle = (frame / cycleFrames) * TWO_PI;
        const cosA = Math.cos(orbitAngle);
        const sinA = Math.sin(orbitAngle);

        const transforms = new Array(_circles.length);
        transforms[0] = { x: centerX, y: centerY, rotation: 0 };
        for (let i = 1; i < _circles.length; i++) {
            const parentT = transforms[i - 1];
            const orbitRadius = _circles[i - 1].radius - _circles[i].radius;
            transforms[i] = {
                x: parentT.x + orbitRadius * cosA,
                y: parentT.y + orbitRadius * sinA,
                rotation: orbitAngle
            };
        }

        const mode = (params.displayMode || 'lines').toLowerCase();

        if (mode === 'lines') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < _circles.length; i++) {
                const r = _circles[i].radius;
                const { x, y } = transforms[i];
                ctx.moveTo(x, y);
                ctx.lineTo(x + r * cosA, y + r * sinA);
                ctx.moveTo(x + r, y);
                ctx.arc(x, y, r, 0, TWO_PI);
            }
            ctx.stroke();
        } else if (mode === 'b/w') {
            for (let i = _circles.length - 1; i >= 0; i--) {
                ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
                ctx.beginPath();
                ctx.arc(transforms[i].x, transforms[i].y, _circles[i].radius, 0, TWO_PI);
                ctx.fill();
            }
        } else if (mode === 'gradient') {
            for (let i = _circles.length - 1; i >= 0; i--) {
                const alpha = 1 - (i / _circles.length) * 0.7;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(transforms[i].x, transforms[i].y, _circles[i].radius, 0, TWO_PI);
                ctx.fill();
            }
        }
    }

    return {
        id: 'circles',
        title: 'Nested Circles',
        category: 'other',
        description: 'Nested circles chain animating as a single rotating arm. Three rendering modes: outline (Lines), alternating fill (B/W), and alpha-depth fill (Gradient).',
        version: '1.0.0',

        infoSections: [
            {
                heading: 'DESCRIPTION',
                body: 'Circles renders circleCount nested circles where each inner circle orbits inside its parent at a uniform angular rate. The outermost circle is stationary at the canvas centre; each successive inner circle orbits at the same orbitAngle, forming a chain that rotates as a single rigid arm — not epicyclic rolling motion. Three rendering modes: Lines draws each circle as a white arc outline with a radial spoke from centre to edge; B/W fills circles outermost to innermost with alternating black and white; Gradient fills outermost to innermost with white at decreasing alpha (1 − (i/count) × 0.7), producing a translucent depth effect. The generator uses a fixed 800×800 canvas with a 2d context. Outer radius is derived from canvas size as min(W,H)/2 × 0.9 and is not user-configurable.'
            },
            {
                heading: 'ALGORITHM',
                body: 'Two functions: initCircles(width, height, count) and draw(ctx, canvas, params, frame). initCircles: largestRadius = min(W,H)/2×0.9; radiusDecrement = largestRadius/count; circle_i = { radius: largestRadius − i×radiusDecrement, parent: i−1 } for i = 0..count−1 (circle_0.parent = null). Rebuild triggers when circleCount changes or canvas dimensions change. draw: computes orbitAngle = (frame/cycleFrames)×2π; cosA = cos(orbitAngle) and sinA = sin(orbitAngle) computed once per frame and shared across all circles. Transform chain: transforms[0] = (cx, cy, 0); for i > 0: orbitRadius_i = circle_{i-1}.radius − circle_i.radius; transforms[i] = { x: transforms[i-1].x + orbitRadius_i×cosA, y: transforms[i-1].y + orbitRadius_i×sinA, rotation: orbitAngle }. This telescopes to x_i = cx + (radius_0 − radius_i)×cosA. Lines mode: single batched path — per circle: moveTo(x,y), lineTo(x+r×cosA, y+r×sinA) for spoke; moveTo(x+r,y), arc(x,y,r,0,2π) for outline; single ctx.stroke() for all circles. B/W mode: back-to-front fill; fillStyle = (i%2===0) ? white : black. Gradient mode: back-to-front; alpha = 1−(i/count)×0.7; rgba fill.'
            },
            {
                heading: 'PARAMETERS',
                body: 'Display group — displayMode: radio, options Lines|B/W|Gradient, default Lines; selects the rendering style applied each frame. Animation group — circleCount: slider, range 10–200, step 1, default 100; number of circles in the orbital chain; changing this value triggers a full rebuild of the circles array. cycleFrames: slider, range 600–7200, step 60, default 3600; frames per full revolution (3600 frames = 60 seconds at 60 FPS = one revolution per minute); controls orbit speed without changing geometry.'
            },
            {
                heading: 'PRESETS',
                body: 'No presets defined. Default state: 100 circles, 3600-frame cycle, Lines mode produces a white nested-arc arm rotating once per minute against a black background.'
            },
            {
                heading: 'PERFORMANCE',
                body: 'Complexity: O(circleCount) — linear. Dominant operation: circleCount arc draw calls per frame. At default (100 circles, Lines mode): <1 ms. At maximum (200 circles, Lines mode): ~400 canvas operations, estimated 1–3 ms. Well within 16.7 ms frame budget at all parameter values. Compute tier: lightweight — no adaptive resolution or worker offload required. Optimisations applied: cosA/sinA computed once per frame and shared across all circles (eliminates per-circle cos/sin calls); Lines mode batches all subpaths into a single ctx.beginPath() … ctx.stroke() sequence, eliminating per-circle ctx.save()/ctx.restore() overhead. Rebuild cost: O(circleCount) JS object allocation; triggered only on circleCount or canvas size change.'
            },
            {
                heading: 'ANIMATION',
                body: 'Type: loop. loopFrames: 3600, matching the cycleFrames default; one full revolution per minute at 60 FPS. loopFrames is a static config field — if cycleFrames is changed by the user, the export period (loopFrames) does not update automatically. Fully deterministic: same frame index and same params always produce identical output. No Math.random, no accumulated state, no Date.now dependency. Export-compatible for PNG, GIF (3600-frame loop at 60 FPS), WebM, and frame sequence. Sequencer disabled: no animatable phase parameters exist; animation is purely frame-driven.'
            },
            {
                heading: 'KNOWN LIMITATIONS',
                body: 'Play/pause control not implemented at the script level; control is host-provided only. Outer radius not user-configurable; always derived from canvas size as min(W,H)/2×0.9. Line width hardcoded to 1; no slider available. Stroke and fill colours hardcoded (white on black); no colour customisation. If cycleFrames is changed from its default (3600), exported GIF and sequence will span loopFrames (3600) frames rather than the actual cycle period. Orbit model uses uniform angular rate for all circles, producing rigid-arm rotation rather than epicyclic (rolling) motion; inner circles do not complete additional revolutions relative to outer circles.'
            },
            {
                heading: 'REFERENCES',
                body: 'Live script: assets/js/tools/generators/scripts/other/circles.gen.js v1.0.0. Archive: reference/generators/circles/source/circles.gen.js. Registry: assets/js/tools/generators/core/script-registry.js. Host: assets/js/tools/generators/core/generative-tool-host.js. Shared import: TWO_PI from assets/js/tools/generators/shared/evaluation.js. Algorithm: hierarchical circular orbital chain with uniform angular rate. No named published algorithm; standard parameterised circular orbit geometry.'
            }
        ],

        compute: { cost: 'lightweight' },

        canvas: {
            width: 800,
            height: 800,
            context: '2d',
            background: '#000000'
        },

        parameters: [
            {
                group: 'Display',
                params: [
                    {
                        key: 'displayMode',
                        type: 'radio',
                        label: 'Mode',
                        options: ['Lines', 'B/W', 'Gradient'],
                        default: 'Lines'
                    }
                ]
            },
            {
                group: 'Animation',
                params: [
                    {
                        key: 'circleCount',
                        type: 'slider',
                        label: 'Circle Count',
                        min: 10,
                        max: 200,
                        step: 1,
                        default: 100
                    },
                    {
                        key: 'cycleFrames',
                        type: 'slider',
                        label: 'Cycle Speed',
                        min: 600,
                        max: 7200,
                        step: 60,
                        default: 3600
                    }
                ]
            }
        ],

        animation: {
            type: 'loop',
            loopFrames: 3600,
            defaultFps: 60,
            animatableParams: [],
            sequencer: false,
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
