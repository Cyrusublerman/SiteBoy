/**
 * Harmonics — Musical intervals as Lissajous and polar parametric curves.
 * 13 just-intonation intervals cycled over 4 view modes in an 8-pass sequence.
 */

import '../../../../shared/algorithms/core/math-utils.js';

const intervals = [
    [1, 1],    [16, 15], [9, 8],  [6, 5],  [5, 4],  [4, 3],  [45, 32],
    [3, 2],    [8, 5],   [5, 3],  [9, 5],  [15, 8], [2, 1]
];

const views = ['lateralClosed', 'counterCurrent', 'lateralOpen', 'concurrent'];

function timeWarp(x) {
    const numIntervals = intervals.length - 1;
    const scaledProgress = x * numIntervals;
    const currentInterval = Math.floor(scaledProgress);
    const localProgress = scaledProgress - currentInterval;
    const smoothstep = (t) => t * t * (3 - 2 * t);
    const eased = smoothstep(smoothstep(localProgress));
    return (currentInterval + eased) / numIntervals;
}

function getCoordinates(t, ratio, view, scale, baseRadius) {
    const a = ratio[0];
    const b = ratio[1];
    if (!isFinite(a) || !isFinite(b) || !isFinite(t)) return { x: 0, y: 0 };
    switch (view) {
        case 'lateralOpen':
            return { x: scale * Math.sin(a * t), y: scale * Math.sin(b * t) };
        case 'lateralClosed':
            return { x: scale * Math.cos(a * t), y: scale * Math.sin(b * t) };
        case 'concurrent': {
            const r = baseRadius * (1 + 0.6 * Math.sin(b * t));
            const θ = a * t;
            return { x: r * Math.cos(θ), y: r * Math.sin(θ) };
        }
        case 'counterCurrent': {
            const r = baseRadius * (1 + 0.6 * Math.sin(b * t));
            const θ = (a - b) * t;
            return { x: r * Math.cos(θ), y: r * Math.sin(θ) };
        }
        default:
            return { x: 0, y: 0 };
    }
}

export const SCRIPT_CONFIG = {
    id: 'harmonics',
    title: 'Musical Harmonics',
    category: 'parametric',
    description: 'Visualisation of 13 just-intonation musical intervals as Lissajous and polar parametric curves, cycling continuously through interval ratios and 4 view modes over a configurable period.',
    version: '2.0.0',

    canvas: {
        width: 800,
        height: 800,
        context: '2d'
    },

    animation: {
        type: 'loop',
        loopDuration: 720,
        loopFrames: 43200,   // passDuration(90) × 8 passes × 60 fps; updated per frame in draw
        defaultFps: 60,
        defaultSpeed: 1,
        canPrerender: true,
        animatableParams: [],
        sequencer: true,
        animationExport: true
    },

    export: {
        png: true,
        svg: false,
        gif: true,
        webm: true,
        sequence: true
    },

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Harmonics visualises the 13 just-intonation musical intervals (unison through octave) as parametric curves — specifically as Lissajous and polar variants — cycling continuously through interval ratios and view modes over a configurable period. The generator draws a scatter plot of particles tracing the current interval curve. Each frame, a translucent black overlay creates a motion-blur accumulation effect; the motionBlur parameter controls the alpha of this overlay and thereby the decay rate of trails. The 13 intervals in ascending order are: unison (1:1), minor second (16:15), major second (9:8), minor third (6:5), major third (5:4), perfect fourth (4:3), tritone (45:32), perfect fifth (3:2), minor sixth (8:5), major sixth (5:3), minor seventh (9:5), major seventh (15:8), and octave (2:1). The full animation cycle is passDuration times 8 seconds (default 720 seconds, 12 minutes). The cycle is divided into 8 passes. Alternating passes ascend (unison to octave) and descend (octave to unison) through the interval ratios. Each consecutive pair of passes covers one of the four view modes. View cross-fading occurs during descending passes only, linearly interpolating particle positions between the current and next view geometry.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Four parametric coordinate functions are implemented in getCoordinates: lateralClosed (Lissajous cos/sin) x = scale * cos(a * t), y = scale * sin(b * t); lateralOpen (Lissajous sin/sin) x = scale * sin(a * t), y = scale * sin(b * t); concurrent (polar, same direction) r = baseRadius * (1 + 0.6 * sin(b * t)), theta = a * t; counterCurrent (polar, differential) r = baseRadius * (1 + 0.6 * sin(b * t)), theta = (a - b) * t. Scale constants: scale = min(W, H) * 0.35, baseRadius = scale * 0.7. timeWarp implements double-smoothstep per interval segment: scaledProgress = x * 12, currentInterval = floor(scaledProgress), localProgress = scaledProgress - currentInterval, eased = smoothstep(smoothstep(localProgress)), returns (currentInterval + eased) / 12, where smoothstep(t) = t^2 * (3 - 2t). Animation state is derived entirely from the frame counter in draw: elapsed = frame / fps, cycleTime = elapsed mod totalCycleDuration, passIndex = floor(cycleTime / passDuration), timeInPass = cycleTime mod passDuration, isAscending = passIndex mod 2 == 0. Interval interpolation: ratioProgress = warpedProgress * 12 for ascending or 12 * (1 - warpedProgress) for descending; ratioIndex = floor(ratioProgress); a and b are linearly interpolated between adjacent interval ratio pairs at fractional ratioT. View interpolation during descending passes: x_final = cx + current.x * (1 - viewProgress) + next.x * viewProgress (viewProgress = warpedProgress on descending, 0 on ascending). Cycles per pass: cycles = max(2, ceil(max(a, b)) * 2), ensuring all curve petals complete within [0, 2pi * cycles]. Render pipeline per frame: (1) compute elapsed, cycleTime, passIndex from frame counter; (2) determine isAscending, current and next view indices; (3) apply timeWarp; (4) compute interpolated frequency ratio [a, b]; (5) partial canvas clear via globalAlpha + fillRect; (6) batch all particle arcs into a single path, or use fillRect for pointSize <= 1; (7) single fill call.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Display group. motionBlur [slider, 0.01 to 0.2, step 0.01, default 0.05]: alpha of the black overlay applied each frame; lower values leave longer trails (slower decay), higher values clear the canvas more quickly. points [slider, 100 to 3000, step 100, default 800]: number of particles distributed evenly over the parameter curve; higher values produce a denser, more continuous curve appearance. pointSize [slider, 0.5 to 4, step 0.5, default 1]: radius of each particle in canvas pixels; values of 1 or below use fillRect for performance. Timing group. passDuration [slider, 30 to 180, step 10, default 90]: duration in seconds of each individual pass through the 13-interval sequence; total cycle duration is passDuration * 8 seconds (default 720 s). Changing passDuration scales the entire animation duration proportionally and updates loopFrames. Parameter interactions: motionBlur and points interact visually — high points with low motionBlur produces a dense persistent curve; low points with high motionBlur produces an animated scatter with rapid decay.'
        },
        {
            heading: 'PRESETS',
            body: 'Default: 800 points, pointSize 1, motionBlur 0.05, passDuration 90 s. Full 720-second cycle. Balanced entry point showing all 13 intervals and 4 views at moderate density. Fast Cycle: 600 points, motionBlur 0.08, passDuration 30 s. Completes a full cycle in 240 seconds with more visible blur decay; suitable for quick previewing. Dense: 2000 points, pointSize 0.5, motionBlur 0.03, passDuration 90 s. High particle density with slow trail decay, producing near-continuous curve appearance over a 720-second cycle. Minimal: 400 points, pointSize 2, motionBlur 0.02, passDuration 120 s. Sparse large points with very slow trail decay over a 960-second cycle; emphasises individual point motion.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Complexity class: O(points) per frame — points arc or fillRect draw calls plus 2 * points getCoordinates invocations (approximately 4 trigonometric operations each). At default (800 points): approximately 1600 trig calls plus 800 draw operations, estimated 2 to 5 ms per frame. At maximum (3000 points, pointSize 4): approximately 6000 trig calls plus 3000 arc calls, estimated 8 to 15 ms per frame, borderline at 60 fps. Mitigation 1: all particle arcs are batched into a single canvas path per frame (beginPath once, all ctx.arc calls, fill once), yielding an estimated 3 to 5 times speedup over individual path flushes. Mitigation 2: for pointSize at or below 1, ctx.fillRect is used instead of ctx.arc, which is faster for sub-pixel points. Time warp and interval interpolation are O(1) per frame. Partial canvas clear is one fillRect call per frame (constant cost). Memory: getCoordinates allocates one {x, y} object per call — 2 per point loop iteration, approximately 6000 GC objects per frame at maximum points (360000 per second at 60 fps). No other significant per-frame allocations.'
        },
        {
            heading: 'ANIMATION',
            body: 'Animation type: loop. loopFrames: passDuration * 8 * fps (dynamically updated each draw call; default 43200 at passDuration 90, fps 60). defaultFps: 60. defaultSpeed: 1. canPrerender: true. The animation is fully deterministic: elapsed = frame / fps. No wall-clock time (Date.now()), no random state. Given the same frame index and parameters, draw always produces identical output. This makes GIF and WebM pre-rendering reliable. animatableParams is empty: the internal 8-pass cycle drives all visual change through the frame counter; there are no external phase or offset parameters to interpolate between saved states. Ascending passes (even passIndex) move from unison to octave via timeWarp and hold the current view; descending passes (odd passIndex) return from octave to unison while cross-fading to the next view geometry.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Ratio label not rendered: the animation displays no on-canvas label for the current interval name or frequency ratio. The legacy implementation displayed the current ratio via a host status mechanism not available in the gen.js format. Speed control and play/pause controls are not implemented; playback rate is determined by passDuration and the host frame counter only. loopFrames accuracy: loopFrames is updated dynamically from passDuration on each draw call; hosts that read loopFrames before the first draw will see the default value (43200, corresponding to passDuration 90). Export of GIF or WebM at non-default passDuration will capture the correct loop only if the host queries loopFrames after at least one draw call.'
        },
        {
            heading: 'REFERENCES',
            body: 'Adapted from the harmonics variant of the Lissajous reference implementation. Version 2.0.0. Mathematical basis: just-intonation frequency ratios from standard Western music theory. Double-smoothstep time warp is an original animation device producing natural pauses at pure harmonic ratios.'
        }
    ],

    presets: [
        {
            name: 'Default',
            values: {
                motionBlur: 0.05,
                passDuration: 90,
                points: 800,
                pointSize: 1
            }
        },
        {
            name: 'Fast Cycle',
            values: {
                motionBlur: 0.08,
                passDuration: 30,
                points: 600,
                pointSize: 1
            }
        },
        {
            name: 'Dense',
            values: {
                motionBlur: 0.03,
                passDuration: 90,
                points: 2000,
                pointSize: 0.5
            }
        },
        {
            name: 'Minimal',
            values: {
                motionBlur: 0.02,
                passDuration: 120,
                points: 400,
                pointSize: 2
            }
        }
    ],

    equations: [
        { caption: 'Lateral closed', latex: 'x = s\\cos(at),\\quad y = s\\sin(bt)' },
        { caption: 'Lateral open', latex: 'x = s\\sin(at),\\quad y = s\\sin(bt)' },
        { caption: 'Concurrent polar', latex: 'r = R(1 + 0.6\\sin(bt)),\\quad \\theta = at' },
        { caption: 'Counter-current polar', latex: 'r = R(1 + 0.6\\sin(bt)),\\quad \\theta = (a-b)t' },
    ],

    parameters: [
        {
            group: 'Display',
            params: [
                {
                    key: 'motionBlur',
                    type: 'slider',
                    label: 'Motion Blur',
                    min: 0.01,
                    max: 0.2,
                    step: 0.01,
                    default: 0.05,
                    precision: 2
                },
                {
                    key: 'points',
                    type: 'slider',
                    label: 'Points',
                    min: 100,
                    max: 3000,
                    step: 100,
                    default: 800
                },
                {
                    key: 'pointSize',
                    type: 'slider',
                    label: 'Point Size',
                    min: 0.5,
                    max: 4,
                    step: 0.5,
                    default: 1,
                    precision: 1
                }
            ]
        },
        {
            group: 'Timing',
            params: [
                {
                    key: 'passDuration',
                    type: 'slider',
                    label: 'Pass Duration',
                    min: 30,
                    max: 180,
                    step: 10,
                    default: 90
                }
            ]
        },
        {
            group: 'Canvas',
            params: [
                {
                    key: 'canvasWidth',
                    type: 'slider',
                    label: 'Canvas Width',
                    min: 400,
                    max: 2000,
                    step: 100,
                    default: 800
                },
                {
                    key: 'canvasHeight',
                    type: 'slider',
                    label: 'Canvas Height',
                    min: 400,
                    max: 2000,
                    step: 100,
                    default: 800
                }
            ]
        }
    ],

    draw(ctx, canvas, params, frame) {
        const fps = params.fps || 60;
        const passDuration = params.passDuration || 90;
        const totalCycleDuration = passDuration * 8;

        // Keep loopFrames synchronised with the current passDuration
        SCRIPT_CONFIG.animation.loopFrames = Math.round(passDuration * 8 * fps);

        const elapsed = frame / fps;
        const cycleTime = elapsed % totalCycleDuration;
        const passIndex = Math.floor(cycleTime / passDuration);
        const timeInPass = cycleTime % passDuration;

        const isAscending = passIndex % 2 === 0;
        const viewSegment = Math.floor(passIndex / 2);
        const currentViewIndex = viewSegment % views.length;
        const nextViewIndex = (viewSegment + 1) % views.length;

        const linearProgress = timeInPass / passDuration;
        const warpedProgress = timeWarp(linearProgress);

        const ratioProgress = isAscending
            ? warpedProgress * (intervals.length - 1)
            : (intervals.length - 1) * (1 - warpedProgress);

        const viewProgress = isAscending ? 0 : warpedProgress;

        const ratioIndex = Math.floor(ratioProgress);
        const ratioT = ratioProgress - ratioIndex;
        const safeRatioIndex = Math.min(Math.max(ratioIndex, 0), intervals.length - 1);
        const safeNextIndex = Math.min(Math.max(ratioIndex + 1, 0), intervals.length - 1);

        const currentRatio = [
            intervals[safeRatioIndex][0] + (intervals[safeNextIndex][0] - intervals[safeRatioIndex][0]) * ratioT,
            intervals[safeRatioIndex][1] + (intervals[safeNextIndex][1] - intervals[safeRatioIndex][1]) * ratioT
        ];

        // Partial canvas clear — motion blur trail
        const motionBlur = params.motionBlur || 0.05;
        ctx.globalAlpha = motionBlur;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        const w = canvas.width;
        const h = canvas.height;
        const drawW = params.canvasWidth || w;
        const drawH = params.canvasHeight || h;
        const offsetX = (w - drawW) / 2;
        const offsetY = (h - drawH) / 2;
        const cx = offsetX + drawW / 2;
        const cy = offsetY + drawH / 2;
        const scale = Math.min(drawW, drawH) * 0.35;
        const baseRadius = scale * 0.7;
        const points = params.points || 800;
        const pointSize = params.pointSize || 1;
        const cycles = Math.max(2, Math.ceil(Math.max(currentRatio[0], currentRatio[1])) * 2);
        const currentView = views[currentViewIndex];
        const nextView = views[nextViewIndex];

        ctx.fillStyle = '#c0c0c0';

        if (pointSize <= 1) {
            // fillRect is faster than arc for sub-pixel points
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2 * cycles;
                const cur = getCoordinates(angle, currentRatio, currentView, scale, baseRadius);
                const curX = cur.x;
                const curY = cur.y;
                const nxt = getCoordinates(angle, currentRatio, nextView, scale, baseRadius);
                const x = cx + curX * (1 - viewProgress) + nxt.x * viewProgress;
                const y = cy + curY * (1 - viewProgress) + nxt.y * viewProgress;
                ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
            }
        } else {
            // Batch all arcs into a single path — avoids per-particle path flush
            ctx.beginPath();
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2 * cycles;
                const cur = getCoordinates(angle, currentRatio, currentView, scale, baseRadius);
                const curX = cur.x;
                const curY = cur.y;
                const nxt = getCoordinates(angle, currentRatio, nextView, scale, baseRadius);
                const x = cx + curX * (1 - viewProgress) + nxt.x * viewProgress;
                const y = cy + curY * (1 - viewProgress) + nxt.y * viewProgress;
                ctx.moveTo(x + pointSize, y);
                ctx.arc(x, y, pointSize, 0, Math.PI * 2);
            }
            ctx.fill();
        }
    }
};
