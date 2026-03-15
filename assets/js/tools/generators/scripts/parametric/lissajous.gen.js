/**
 * Lissajous Curves - Generalised parametric Lissajous figures.
 *
 * Bivariate sums of phase-shifted, amplitude-scaled, power-distorted
 * cosine/sine terms with multiplicative modulation, per axis.
 *
 * @script lissajous
 * @category parametric
 * @version 1.1.0
 */

import { safePow, TWO_PI } from '../../shared/evaluation.js';

function signedPow(v, p) {
    if (Math.abs(p - 1) < 1e-9) return v;
    return Math.sign(v) * safePow(Math.abs(v), p);
}

function preset(name, overrides) {
    return {
        name,
        values: {
            Ax1: 1,  wx1: 1,  px1: 1, phiX1: 0,
            Ax2: 0,  wx2: 1,  px2: 1, phiX2: 0,
            Mx: 0,   wxm1: 1, pxm1: 1, phiXm1: 0, wxm2: 1, pxm2: 1, phiXm2: 0,
            Ay1: 1,  wy1: 1,  py1: 1, phiY1: 0,
            Ay2: 0,  wy2: 1,  py2: 1, phiY2: 0,
            My: 0,   wym1: 1, pym1: 1, phiYm1: 0, wym2: 1, pym2: 1, phiYm2: 0,
            scale: 120, rotation: 0, points: 20000,
            ...overrides
        }
    };
}

const LANDMARKS = [
    preset('Circle',                        {}),
    preset('Rosette (1:3)',                 { Ax2: -1, wx2: 3,   Ay2: -1, wy2: 3 }),
    preset('Rosette (1:5)',                 { Ax2: -1, wx2: 5,   Ay2: -1, wy2: 5 }),
    preset('Dense Rosette (1:10)',          { Ax2: -1, wx2: 10,  Ay2: -1, wy2: 10 }),
    preset('Offset Loop (1:2:3)',           { Ax2: -1, wx2: 2,   Ay2: -1, wy2: 3 }),
    preset('Involute Rosette (1:3)',        { Ax2:  1, wx2: 3,   Ay2: -1, wy2: 3 }),
    preset('Involute Rosette (1:5)',        { Ax2:  1, wx2: 5,   Ay2: -1, wy2: 5 }),
    preset('Asymmetric Flow (3:5)',         { wx1: 3, Ax2: -1, wx2: 5,            Ay2: -1, wy2: 5 }),
    preset('Asymmetric Flow (3:5:6)',       { wx1: 3, Ax2: -1, wx2: 5,            Ay2: -1, wy2: 6 }),
    preset('Asymmetric Flow (1:5:7)',       {         Ax2: -1, wx2: 5,            Ay2: -1, wy2: 7 }),
    preset('Asymmetric Weave (200hz)',      {         Ax2: -1, wx2: 100,          Ay2: -1, wy2: 200, points: 40000 }),
    preset('Spiroform (3:5)',               { wx1: 3, Ax2: -1, wx2: 5, wy1: 3, Ay2: -1, wy2: 5 }),
    preset('Cubic Star (1:2)',              { Ax2: -1, wx2: 2,  px2: 3,  Ay2: -1, wy2: 2,   py2: 3 }),
    preset('Cubic Spiro (1:7)',             { Ax2: -1, wx2: 7,  px2: 3,  Ay2: -1, wy2: 7,   py2: 3 }),
    preset('Cubic Weave (100hz)',           { px1: 3, Ax2: -1, wx2: 100, px2: 3, py1: 3, Ay2: -1, wy2: 100, py2: 3, points: 40000 }),
    preset('Cubic Filament (180hz)',        { Ax2: -1, wx2: 180, px2: 3,  Ay2: -1, wy2: 180, py2: 3, points: 40000 }),
    preset('Cubic Static (550hz)',          { Ax2: -1, wx2: 550, px2: 3,  Ay2: -1, wy2: 550, py2: 3, points: 40000 }),
    preset('Quintic Filament (250hz)',      { Ax2: -1, wx2: 250, px2: 5,  Ay2: -1, wy2: 250, py2: 3, points: 40000 }),
    preset('Quintic Static (500hz)',        { Ax2: -1, wx2: 500, px2: 5,  Ay2: -1, wy2: 500, py2: 3, points: 40000 }),
    preset('Woven Web (80hz)',              { Mx: -1, wxm1: 1, wxm2: 80,  Ay2: -1, wy2: 80 }),
    preset('Woven Bloom (120hz)',           { Ax1: 2, Mx: -1, wxm1: 1, wxm2: 120, My: -1, wym1: 2, wym2: 120 }),
    preset('Woven Bloom (120hz) alt',       { Ax1: 2, Mx: -1, wxm1: 1, wxm2: 120, My: -1, wym1: 2, wym2: 120, Ay1: 1.2 }),
    preset('Modulated Ring (60hz)',         { wx1: 60, wy1: 60, Mx: -1, wxm1: 60, wxm2: 1, Ay2: -1, wy2: 1 }),
    preset('Fine Web (80hz)',               { Ax1: 0.1, Mx: -1, wxm1: 1, wxm2: 80, Ay2: -1, wy2: 80 }),
    preset('Warped Field (100hz)',          { Mx: -1, wxm1: 100, wxm2: 2, Ay2: -1, wy2: 100 }),
    preset('Interference Pattern (200hz)',  { Ax1: 1.7, Mx: -1, wxm1: 2,   wxm2: 200, Ay1: 1.2, My: -1, wym1: 2,   wym2: 200 }),
    preset('Interference Pattern (260hz)',  { Ax1: 1.7, Mx: -1, wxm1: 260, wxm2: 1,   Ay1: 1.2, My: -1, wym1: 260, wym2: 2   }),
    preset('Complex Interference (300hz)',  { Ax1: 1.7, wx1: 2, Mx: -1, wxm1: 75, wxm2: 75, Ay1: 1.2, wy1: 2, My: -1, wym1: 2, wym2: 300 }),
];

export const SCRIPT_CONFIG = {
    id: 'lissajous',
    title: 'Lissajous Curves',
    category: 'parametric',
    version: '1.1.0',

    canvas: {
        width: 800,
        height: 800,
        context: '2d',
        background: '#000000'
    },

    compute: {
        cost: 'geometric'
    },

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Lissajous Curves renders a generalised family of parametric plane curves whose X and Y coordinates are each defined as a sum of up to two trigonometric terms plus a multiplicative modulation term. The mathematical basis is the generalised Lissajous figure: a curve traced by two independent periodic signals driving orthogonal axes, extended with amplitude, frequency, phase, signed power exponent, and cross-term modulation. X uses cosine as its base function; Y uses sine, preserving orthogonality by default. The signedPow function computes sign(v) * |v|^p: p < 1 rounds waveform peaks toward a square profile; p > 1 sharpens peaks toward a spike; negative p inverts magnitude. The modulation term for each axis is a product of two independently parameterised harmonic functions, introducing amplitude-modulated interference patterns not achievable with simple sums. Visually, the output is a white stroke path on a black 800x800 canvas. Classic Lissajous figures appear at integer frequency ratios with both terms active; rosette forms arise from subtraction (Ax2=-1, integer wx2:wy2 ratio); high-frequency presets (100-550hz) produce dense filament-like or mesh-like structures; power exponents produce cusp distortions and star-shaped variants. Algorithm origin: classical Lissajous figures (Jules Antoine Lissajous, 1857); the signedPow extension and multi-term per-axis sum are bespoke generalisations. Scope boundary: renders the complete static curve for one full period [0, 2pi] per frame. Animation works by modifying parameters between frames, not by advancing the parameter t. No trail, motion blur, or colour variation along the path.'
        },
        {
            heading: 'ALGORITHM',
            body: 'signedPow(v, p): returns sign(v) * |v|^p. Special-cases |p-1| < 1e-9 to return v directly, avoiding safePow for the identity case. Uses imported safePow(|v|, p) which returns 0 when |v|=0 and p<0, preventing division singularities. preset(name, overrides): builds a complete preset by merging all 30 parameter defaults with the given overrides; called at module load to build the LANDMARKS array; pure function, O(1). draw(ctx, canvas, params, frame): main render hook. Clears canvas with black fillRect. Precomputes rot = rotation * pi/180, cosR = cos(rot), sinR = sin(rot) once per frame. Samples the parametric curve at params.points points over [0, 2pi]. For each sample i, t = (i / points) * 2pi. X-axis evaluation: x1 = Ax1 * signedPow(cos(wx1*t + phiX1), px1); x2 = Ax2 * signedPow(cos(wx2*t + phiX2), px2); xm = Mx * signedPow(cos(wxm1*t + phiXm1), pxm1) * signedPow(sin(wxm2*t + phiXm2), pxm2); x = x1 + x2 + xm. Y-axis evaluation (sine-based): y1 = Ay1 * signedPow(sin(wy1*t + phiY1), py1); y2 = Ay2 * signedPow(sin(wy2*t + phiY2), py2); ym = My * signedPow(sin(wym1*t + phiYm1), pym1) * signedPow(cos(wym2*t + phiYm2), pym2); y = y1 + y2 + ym. Scale and rotation: xs = x * scale, ys = y * scale; rx = xs*cosR - ys*sinR; ry = xs*sinR + ys*cosR. Canvas position: px = centerX + rx, py = centerY + ry. Points where |rx| > 2W or |ry| > 2H are treated as a path break (ctx.moveTo restart) rather than a line segment, preventing extreme artifact lines from negative-power singularities. Builds a single stroke path (beginPath, moveTo/lineTo) and calls ctx.stroke once. Closure condition: a Lissajous curve closes when the ratio wx1:wy1 is rational; with integer frequencies and [0, 2pi], all integer-frequency components complete integer cycle counts.'
        },
        {
            heading: 'PARAMETERS',
            body: 'X-Axis Term 1. Ax1 [Amplitude, -2 to 2, step 0.1, default 1]: scale factor for the first X cosine term; 0 = inactive; negative = inverted. wx1 [Frequency, -300 to 300, step 1, default 1]: angular frequency of cos(wx1*t + phiX1); negative reverses traversal direction. px1 [Power, -7 to 7, step 0.1, default 1]: signedPow exponent; 1 = standard cosine; >1 sharpens; <1 rounds; <0 inverts magnitude. phiX1 [Phase, -6.28 to 6.28, step 0.01, default 0]: phase offset; animatable. X-Axis Term 2 (collapsed by default, inactive at Ax2=0). Ax2 [Amplitude, default 0; set -1 for rosette/subtraction forms]. wx2 [Frequency, integer ratios with wx1 produce closed figures]. px2 [Power, default 1; px2=3 gives cubic star cusps]. phiX2 [Phase, animatable]. X-Axis Modulation (collapsed by default, inactive at Mx=0). Mx [Modulation Amount, -2 to 2, default 0: disables modulation entirely at 0]. wxm1 [Freq cos m1, 0 to 600, default 1]. pxm1 [Power cos m1]. phiXm1 [Phase cos m1]. wxm2 [Freq sin m2, 0 to 600, default 1]. pxm2 [Power sin m2]. phiXm2 [Phase sin m2]. Y-Axis Term 1. Ay1 [Amplitude, default 1]. wy1 [Frequency, default 1; ratio wy1:wx1 determines the fundamental Lissajous figure shape]. py1 [Power]. phiY1 [Phase, animatable]. Y-Axis Term 2 (collapsed). Ay2 [Amplitude, default 0]. wy2 [Frequency]. py2 [Power]. phiY2 [Phase, animatable]. Y-Axis Modulation (collapsed). My [Modulation Amount, default 0]. wym1 [Freq sin m1, 0 to 600]. pym1 [Power sin m1]. phiYm1 [Phase sin m1]. wym2 [Freq cos m2, 0 to 600]. pym2 [Power cos m2]. phiYm2 [Phase cos m2]. Global. scale [20 to 300, step 5, default 120]: pixel scale; at 120 a unit-amplitude curve spans +/-120px from centre; animatable. rotation [0 to 360, step 1, default 0]: clockwise rigid-body rotation in degrees; distinct from phase (which rotates in parameter space). points [1000 to 80000, step 1000, default 20000]: parametric samples per frame; high-frequency presets (wx2 > 100) require 40000+ to avoid sampling gaps.'
        },
        {
            heading: 'PRESETS',
            body: '28 presets total. Circle: unit circle at 1:1. Rosette (1:3): three-petalled via cos(t)-cos(3t)/sin(t)-sin(3t). Rosette (1:5): five-petalled. Dense Rosette (1:10): ten-petalled. Offset Loop (1:2:3): asymmetric two-frequency loop. Involute Rosette (1:3): mixed-sign cos(t)+cos(3t)/sin(t)-sin(3t). Involute Rosette (1:5): mixed-sign five-frequency involute. Asymmetric Flow (3:5): complex orbital at non-integer ratio. Asymmetric Flow (3:5:6): three-frequency asymmetric interference. Asymmetric Flow (1:5:7): incommensurate open flow. Asymmetric Weave (200hz): dense high-frequency mesh, 40000 points. Spiroform (3:5): spirographic compound form. Cubic Star (1:2): cubic power at 1:2, star cusps. Cubic Spiro (1:7): seven-pointed cubic spiro. Cubic Weave (100hz): dense cubic mesh, 40000 points. Cubic Filament (180hz): fine filament network, 40000 points. Cubic Static (550hz): near-static dense cubic interference, 40000 points. Quintic Filament (250hz): mixed quintic/cubic filament, 40000 points. Quintic Static (500hz): dense quintic/cubic mesh, 40000 points. Woven Web (80hz): modulation-driven web; X via cross-term, Y via term 2. Woven Bloom (120hz): dual-axis modulation bloom. Woven Bloom (120hz) alt: Ay1=1.2 amplitude asymmetry variant. Modulated Ring (60hz): high-frequency carrier with low-frequency modulation. Fine Web (80hz): low-amplitude carrier, modulation-dominant. Warped Field (100hz): warped grid from high-frequency cos modulation. Interference Pattern (200hz): dual-axis 200hz interference. Interference Pattern (260hz): reversed modulation factor order at 260hz. Complex Interference (300hz): three-frequency interference across all axes. Defaults for all unstated keys: Ax1=1, wx1=1, px1=1, phiX1=0, Ax2=0, Mx=0, My=0, scale=120, rotation=0, points=20000. High-frequency presets override points to 40000.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Complexity: O(points) per frame. Per-point cost: approximately 10 trigonometric evaluations plus up to 8 safePow calls (when all exponents differ from 1) plus arithmetic. At default points=20000: estimated 3-8ms on mid-range hardware. At points=40000 (high-frequency presets): 6-16ms — borderline at 60fps on lower-end hardware. At points=80000: likely to exceed the 16.7ms 60fps budget on most hardware. Mitigation 1 (applied): rotation cos/sin precomputed once per frame in draw(), eliminating 2*points redundant trig evaluations per frame — estimated 0.5-2ms saving at 40000-80000 points. Mitigation 2 (applied): evaluate() body inlined into draw loop, eliminating per-point function call overhead and {x,y} object allocation. Mitigation 3 (applied): points with |rx| > 2W or |ry| > 2H trigger a path break (first=true, continue) rather than ctx.lineTo, reducing accumulated path cost for out-of-range points from negative-power parameter combinations. Remaining candidates not applied: WebAssembly or Worker offload for the evaluate loop; typed array coordinate accumulation to reduce lineTo call overhead. The generator uses cost: geometric in the compute block; Tier 1 RAF coalescing is active automatically; Tier 2 adaptive resolution does not apply to canvas path generators.'
        },
        {
            heading: 'ANIMATION',
            body: 'Animation type: parametric. defaultFps: 60. defaultSpeed: 1. 11 animatable parameters. The host parametric system modifies parameters between frames; no loopFrames is defined. Phase parameters (phiX1, phiY1, phiX2, phiY2) use mode: phase — linear drift with wrapping within the parameter range; rate 1 = one full wrap per second at global speed 1; best for continuously rotating phase animation. Amplitude parameters (Ax1, Ay1 rate 0.3 min 0 max 2; Ax2, Ay2 rate 0.25 min -1 max 1) and modulation (Mx, My rate 0.2 min -1 max 1) use mode: oscillate — sinusoidal bounce between min and max; rate 1 = one full swing per approximately 4 seconds; best for breathing or sweeping effects. Scale (rate 0.15, min 60, max 200) oscillates for a gentle zoom pulse. The per-param rate multiplier applies on top of the global Speed slider; smaller values (0.1-0.5) produce slow majestic sweeps, larger values (2-5) produce fast shimmering. The generator is fully deterministic (no random state); given identical params and frame index, draw produces identical output. GIF and WebM export are enabled. Each frame is computed entirely from the current params with no carry-over state.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'No undo history: parameter changes cannot be reverted; the legacy 50-state history stack is not implemented. No analysis functions: the UI provides no closed-curve indicator (rational wx1:wy1 ratio check) and no coupling indicator (shared X/Y frequency detector). No motion blur or trail: each frame clears the canvas completely; the legacy motionBlur slider is not present. No live equation display: the current parametric equation is not rendered on canvas. Negative power exponents (px1, px2, etc. < 0) produce extreme coordinate values where the base trig function nears zero; these trigger a path break at |rx| > 2W or |ry| > 2H, preventing artifact lines, but visible gaps appear in the curve at those parameter values. Reducing points below the preset-specified 40000 on high-frequency presets (wx2 > 100) causes sampling aliasing — visibly sparse or gapped curve segments because the Nyquist rate is not met for the high-frequency component.'
        },
        {
            heading: 'REFERENCES',
            body: 'Algorithm: Lissajous figures — Jules Antoine Lissajous, 1857. The signedPow extension and multi-term per-axis sum are bespoke generalisations not attributed to a named algorithm. Live source: assets/js/tools/generators/scripts/parametric/lissajous.gen.js. Archive: reference/generators/lissajous/source/lissajous.gen.js. Registry: assets/js/tools/generators/core/script-registry.js. Host: assets/js/tools/generators/core/generative-tool-host.js. Legacy docs: reference/generators/lissajous/legacy-docs/lissajous.md (mixed bundle), reference/generators/lissajous/legacy-docs/lissajous-audit.md (audit only). Version 1.1.0: phi_* parameter keys renamed to camelCase (phiX1, phiX2, phiXm1, phiXm2, phiY1, phiY2, phiYm1, phiYm2); rotation trig precomputed once per frame; evaluate body inlined into draw loop; off-screen path-break mitigation applied; infoSections added; compute block added; draw moved to inline method on SCRIPT_CONFIG.'
        }
    ],

    parameters: [
        {
            group: 'X-Axis Term 1',
            params: [
                { key: 'Ax1',   type: 'slider', label: 'Amplitude',  min: -2,   max: 2,   step: 0.1,  default: 1,  precision: 1 },
                { key: 'wx1',   type: 'slider', label: 'Frequency',  min: -300, max: 300, step: 1,    default: 1 },
                { key: 'px1',   type: 'slider', label: 'Power',      min: -7,   max: 7,   step: 0.1,  default: 1,  precision: 1 },
                { key: 'phiX1', type: 'slider', label: 'Phase (φ)',  min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ]
        },
        {
            group: 'X-Axis Term 2',
            params: [
                { key: 'Ax2',   type: 'slider', label: 'Amplitude',  min: -2,   max: 2,   step: 0.1,  default: 0,  precision: 1 },
                { key: 'wx2',   type: 'slider', label: 'Frequency',  min: -300, max: 300, step: 1,    default: 1 },
                { key: 'px2',   type: 'slider', label: 'Power',      min: -7,   max: 7,   step: 0.1,  default: 1,  precision: 1 },
                { key: 'phiX2', type: 'slider', label: 'Phase (φ)',  min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'X-Axis Modulation',
            params: [
                { key: 'Mx',     type: 'slider', label: 'Modulation Amount', min: -2,    max: 2,   step: 0.1,  default: 0,  precision: 1 },
                { key: 'wxm1',   type: 'slider', label: 'Freq cos (m1)',     min: 0,     max: 600, step: 1,    default: 1 },
                { key: 'pxm1',   type: 'slider', label: 'Power cos (m1)',    min: -7,    max: 7,   step: 0.1,  default: 1,  precision: 1 },
                { key: 'phiXm1', type: 'slider', label: 'Phase cos (m1)',    min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'wxm2',   type: 'slider', label: 'Freq sin (m2)',     min: 0,     max: 600, step: 1,    default: 1 },
                { key: 'pxm2',   type: 'slider', label: 'Power sin (m2)',    min: -7,    max: 7,   step: 0.1,  default: 1,  precision: 1 },
                { key: 'phiXm2', type: 'slider', label: 'Phase sin (m2)',    min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'Y-Axis Term 1',
            params: [
                { key: 'Ay1',   type: 'slider', label: 'Amplitude',  min: -2,   max: 2,   step: 0.1,  default: 1,  precision: 1 },
                { key: 'wy1',   type: 'slider', label: 'Frequency',  min: -300, max: 300, step: 1,    default: 1 },
                { key: 'py1',   type: 'slider', label: 'Power',      min: -7,   max: 7,   step: 0.1,  default: 1,  precision: 1 },
                { key: 'phiY1', type: 'slider', label: 'Phase (φ)',  min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ]
        },
        {
            group: 'Y-Axis Term 2',
            params: [
                { key: 'Ay2',   type: 'slider', label: 'Amplitude',  min: -2,   max: 2,   step: 0.1,  default: 0,  precision: 1 },
                { key: 'wy2',   type: 'slider', label: 'Frequency',  min: -300, max: 300, step: 1,    default: 1 },
                { key: 'py2',   type: 'slider', label: 'Power',      min: -7,   max: 7,   step: 0.1,  default: 1,  precision: 1 },
                { key: 'phiY2', type: 'slider', label: 'Phase (φ)',  min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'Y-Axis Modulation',
            params: [
                { key: 'My',     type: 'slider', label: 'Modulation Amount', min: -2,    max: 2,   step: 0.1,  default: 0,  precision: 1 },
                { key: 'wym1',   type: 'slider', label: 'Freq sin (m1)',     min: 0,     max: 600, step: 1,    default: 1 },
                { key: 'pym1',   type: 'slider', label: 'Power sin (m1)',    min: -7,    max: 7,   step: 0.1,  default: 1,  precision: 1 },
                { key: 'phiYm1', type: 'slider', label: 'Phase sin (m1)',    min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'wym2',   type: 'slider', label: 'Freq cos (m2)',     min: 0,     max: 600, step: 1,    default: 1 },
                { key: 'pym2',   type: 'slider', label: 'Power cos (m2)',    min: -7,    max: 7,   step: 0.1,  default: 1,  precision: 1 },
                { key: 'phiYm2', type: 'slider', label: 'Phase cos (m2)',    min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'Global',
            params: [
                { key: 'scale',    type: 'slider', label: 'Scale',        min: 20, max: 300, step: 5,    default: 120 },
                { key: 'rotation', type: 'slider', label: 'Rotation (°)', min: 0,  max: 360, step: 1,    default: 0 },
                { key: 'points',   type: 'slider', label: 'Points',       min: 1000, max: 80000, step: 1000, default: 20000 },
            ]
        }
    ],

    presets: LANDMARKS,

    animation: {
        type: 'parametric',
        defaultSpeed: 1,
        defaultFps: 60,
        animatableParams: [
            { key: 'phiX1',  label: 'phiX1',  mode: 'phase',     rate: 1.0 },
            { key: 'phiY1',  label: 'phiY1',  mode: 'phase',     rate: 1.0 },
            { key: 'phiX2',  label: 'phiX2',  mode: 'phase',     rate: 1.0 },
            { key: 'phiY2',  label: 'phiY2',  mode: 'phase',     rate: 1.0 },
            { key: 'Ax1',    label: 'Ax1',    mode: 'oscillate', rate: 0.3,  min: 0,  max: 2  },
            { key: 'Ay1',    label: 'Ay1',    mode: 'oscillate', rate: 0.3,  min: 0,  max: 2  },
            { key: 'Ax2',    label: 'Ax2',    mode: 'oscillate', rate: 0.25, min: -1, max: 1  },
            { key: 'Ay2',    label: 'Ay2',    mode: 'oscillate', rate: 0.25, min: -1, max: 1  },
            { key: 'Mx',     label: 'Mx',     mode: 'oscillate', rate: 0.2,  min: -1, max: 1  },
            { key: 'My',     label: 'My',     mode: 'oscillate', rate: 0.2,  min: -1, max: 1  },
            { key: 'scale',  label: 'scale',  mode: 'oscillate', rate: 0.15, min: 60, max: 200 },
        ]
    },

    export: {
        png: true,
        svg: false,
        gif: true,
        webm: true,
        sequence: true
    },

    draw(ctx, canvas, params) {
        const W = canvas.width;
        const H = canvas.height;
        const centerX = W / 2;
        const centerY = H / 2;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, W, H);

        const rot  = (params.rotation || 0) * Math.PI / 180;
        const cosR = Math.cos(rot);
        const sinR = Math.sin(rot);

        const sc     = params.scale;
        const boundX = W * 2;
        const boundY = H * 2;
        const pts    = params.points;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();

        let first = true;

        for (let i = 0; i < pts; i++) {
            const t = (i / pts) * TWO_PI;

            const x1 = params.Ax1 * signedPow(Math.cos(params.wx1  * t + params.phiX1),  params.px1);
            const x2 = params.Ax2 * signedPow(Math.cos(params.wx2  * t + params.phiX2),  params.px2);
            const xm = params.Mx  * signedPow(Math.cos(params.wxm1 * t + params.phiXm1), params.pxm1)
                                  * signedPow(Math.sin(params.wxm2 * t + params.phiXm2), params.pxm2);

            const y1 = params.Ay1 * signedPow(Math.sin(params.wy1  * t + params.phiY1),  params.py1);
            const y2 = params.Ay2 * signedPow(Math.sin(params.wy2  * t + params.phiY2),  params.py2);
            const ym = params.My  * signedPow(Math.sin(params.wym1 * t + params.phiYm1), params.pym1)
                                  * signedPow(Math.cos(params.wym2 * t + params.phiYm2), params.pym2);

            const xs = (x1 + x2 + xm) * sc;
            const ys = (y1 + y2 + ym) * sc;

            const rx = xs * cosR - ys * sinR;
            const ry = xs * sinR + ys * cosR;

            if (Math.abs(rx) > boundX || Math.abs(ry) > boundY) {
                first = true;
                continue;
            }

            if (first) {
                ctx.moveTo(centerX + rx, centerY + ry);
                first = false;
            } else {
                ctx.lineTo(centerX + rx, centerY + ry);
            }
        }

        ctx.stroke();
    }
};
