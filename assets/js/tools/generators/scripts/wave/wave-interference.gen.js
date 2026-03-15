/**
 * Wave Interference Script - Spatial Wave Equation Visualizer
 *
 * Full equation: I = R(r) + X(x) + Y(y)
 * Each component has two terms plus modulation.
 *
 * @script wave-interference
 * @category wave
 * @version 2.1.0
 */

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const TWO_PI = Math.PI * 2;

// Buffer pool: one Float32Array + ImageData per canvas size.
// Avoids 2 × 1 MB allocations per frame at 60 FPS.
const _bufferPool = {};

// ═══════════════════════════════════════════════════════════════════
// FULL DEFAULTS (used to expand partial presets into complete maps)
// ═══════════════════════════════════════════════════════════════════

const _DEFAULTS = {
    Ar1: 1,  fr1: 20, pr1: 1, phiR1: 0, Or1: 0, waveR1: 'sin',
    Ar2: 0,  fr2: 0,  pr2: 1, phiR2: 0, Or2: 0, waveR2: 'sin',
    Mr:  0,  frm1: 0, frm2: 0, prm1: 1, prm2: 1, phiRm1: 0, phiRm2: 0,
    Ax1: 0,  fx1: 0,  px1: 1, phiX1: 0, Ox1: 0, waveX1: 'sin',
    Ax2: 0,  fx2: 0,  px2: 1, phiX2: 0, Ox2: 0, waveX2: 'sin',
    Mx:  0,  fxm1: 0, fxm2: 0, pxm1: 1, pxm2: 1, phiXm1: 0, phiXm2: 0,
    Ay1: 0,  fy1: 0,  py1: 1, phiY1: 0, Oy1: 0, waveY1: 'sin',
    Ay2: 0,  fy2: 0,  py2: 1, phiY2: 0, Oy2: 0, waveY2: 'sin',
    My:  0,  fym1: 0, fym2: 0, pym1: 1, pym2: 1, phiYm1: 0, phiYm2: 0,
    scale: 300, rotation: 0, blendMode: 'sum'
};

// ═══════════════════════════════════════════════════════════════════
// PRESETS (Landmarks) — full parameter maps, no default-merging required
// ═══════════════════════════════════════════════════════════════════

const LANDMARKS = [
    { name: '20 Rings (Default)',    values: { ..._DEFAULTS } },
    { name: '1 Ring',               values: { ..._DEFAULTS, fr1: 1 } },
    { name: '3 Rings',              values: { ..._DEFAULTS, fr1: 3 } },
    { name: '5 Rings',              values: { ..._DEFAULTS, fr1: 5 } },
    { name: '10 Rings',             values: { ..._DEFAULTS, fr1: 10 } },
    { name: 'Inverted 5 Rings',     values: { ..._DEFAULTS, Ar1: -1, fr1: 5 } },
    { name: 'Offset Rings',         values: { ..._DEFAULTS, fr1: 5, Or1: 0.3 } },
    { name: 'Horizontal Lines',     values: { ..._DEFAULTS, Ar1: 0, Ay1: 1, fy1: 5 } },
    { name: 'Vertical Lines',       values: { ..._DEFAULTS, Ar1: 0, Ax1: 1, fx1: 5 } },
    { name: 'Grid 5\u00d75',        values: { ..._DEFAULTS, Ar1: 0, Ax1: 1, fx1: 5, Ay1: 1, fy1: 5 } },
    { name: 'Moir\u00e9 Cross',     values: { ..._DEFAULTS, Ar1: 0, Ax1: 1, fx1: 5, Ay1: 1, fy1: 5.5 } },
    { name: 'Rings + Grid',         values: { ..._DEFAULTS, fr1: 5, Ax1: 0.3, fx1: 8, Ay1: 0.3, fy1: 8 } },
    { name: 'Complex Interference', values: { ..._DEFAULTS, fr1: 3, Ar2: 0.5, fr2: 7, Ax1: 0.3, fx1: 10 } }
];

// ═══════════════════════════════════════════════════════════════════
// WAVE COMPUTATION
// ═══════════════════════════════════════════════════════════════════

function safePow(base, exp) {
    if (Math.abs(base) < 1e-9 && exp < 0) return 0;
    return Math.sign(base) * Math.pow(Math.abs(base), exp);
}

function waveFunc(t, useCos) {
    return useCos ? Math.cos(t) : Math.sin(t);
}

function computeR(r, p) {
    const r1 = r - (p.Or1 || 0);
    const term1 = (p.Ar1 || 0) * safePow(r1, p.pr1 || 1) * waveFunc(TWO_PI * (p.fr1 || 0) * r + (p.phiR1 || 0), p.waveR1 === 'cos');

    const r2 = r - (p.Or2 || 0);
    const term2 = (p.Ar2 || 0) * safePow(r2, p.pr2 || 1) * waveFunc(TWO_PI * (p.fr2 || 0) * r + (p.phiR2 || 0), p.waveR2 === 'cos');

    let result = term1 + term2;

    if (Math.abs(p.Mr || 0) > 0.001) {
        const mod1 = waveFunc(TWO_PI * (p.frm1 || 0) * r + (p.phiRm1 || 0), false);
        const mod2 = waveFunc(TWO_PI * (p.frm2 || 0) * r + (p.phiRm2 || 0), false);
        result *= (1 + (p.Mr || 0) * (safePow(mod1, p.prm1 || 1) + safePow(mod2, p.prm2 || 1)));
    }

    return result;
}

function computeX(x, p) {
    const x1 = x - (p.Ox1 || 0);
    const term1 = (p.Ax1 || 0) * safePow(x1, p.px1 || 1) * waveFunc(TWO_PI * (p.fx1 || 0) * x + (p.phiX1 || 0), p.waveX1 === 'cos');

    const x2 = x - (p.Ox2 || 0);
    const term2 = (p.Ax2 || 0) * safePow(x2, p.px2 || 1) * waveFunc(TWO_PI * (p.fx2 || 0) * x + (p.phiX2 || 0), p.waveX2 === 'cos');

    let result = term1 + term2;

    if (Math.abs(p.Mx || 0) > 0.001) {
        const mod1 = waveFunc(TWO_PI * (p.fxm1 || 0) * x + (p.phiXm1 || 0), false);
        const mod2 = waveFunc(TWO_PI * (p.fxm2 || 0) * x + (p.phiXm2 || 0), false);
        result *= (1 + (p.Mx || 0) * (safePow(mod1, p.pxm1 || 1) + safePow(mod2, p.pxm2 || 1)));
    }

    return result;
}

function computeY(y, p) {
    const y1 = y - (p.Oy1 || 0);
    const term1 = (p.Ay1 || 0) * safePow(y1, p.py1 || 1) * waveFunc(TWO_PI * (p.fy1 || 0) * y + (p.phiY1 || 0), p.waveY1 === 'cos');

    const y2 = y - (p.Oy2 || 0);
    const term2 = (p.Ay2 || 0) * safePow(y2, p.py2 || 1) * waveFunc(TWO_PI * (p.fy2 || 0) * y + (p.phiY2 || 0), p.waveY2 === 'cos');

    let result = term1 + term2;

    if (Math.abs(p.My || 0) > 0.001) {
        const mod1 = waveFunc(TWO_PI * (p.fym1 || 0) * y + (p.phiYm1 || 0), false);
        const mod2 = waveFunc(TWO_PI * (p.fym2 || 0) * y + (p.phiYm2 || 0), false);
        result *= (1 + (p.My || 0) * (safePow(mod1, p.pym1 || 1) + safePow(mod2, p.pym2 || 1)));
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════
// DRAW FUNCTION
// ═══════════════════════════════════════════════════════════════════

function draw(ctx, canvas, params, frame) {
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const scale = params.scale || 300;
    const rotation = (params.rotation || 0) * Math.PI / 180;
    const blendMode = params.blendMode || 'sum';

    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    // Pooled buffers: avoid 2 MB of allocations per frame at 60 FPS.
    const key = `${W}x${H}`;
    if (!_bufferPool[key]) {
        _bufferPool[key] = {
            intensities: new Float32Array(W * H),
            imageData: ctx.createImageData(W, H)
        };
    }
    const { intensities, imageData } = _bufferPool[key];
    const data = imageData.data;

    let minI = Infinity, maxI = -Infinity;

    // First pass: compute intensities and find range
    let idx = 0;
    for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
            let x = (px - cx) / scale;
            let y = (py - cy) / scale;

            const xr = x * cosR - y * sinR;
            const yr = x * sinR + y * cosR;
            x = xr;
            y = yr;

            const r = Math.sqrt(x * x + y * y);

            const R = computeR(r, params);
            const X = computeX(x, params);
            const Y = computeY(y, params);

            let intensity;
            if (blendMode === 'multiply') {
                intensity = (1 + R) * (1 + X) * (1 + Y);
            } else {
                intensity = R + X + Y;
            }

            intensities[idx] = intensity;
            if (intensity < minI) minI = intensity;
            if (intensity > maxI) maxI = intensity;
            idx++;
        }
    }

    // Second pass: normalise and write pixels
    const range = maxI - minI || 1;
    for (let i = 0; i < intensities.length; i++) {
        const grey = Math.floor(((intensities[i] - minI) / range) * 255);
        const p = i * 4;
        data[p] = grey; data[p + 1] = grey; data[p + 2] = grey; data[p + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
}

// ═══════════════════════════════════════════════════════════════════
// SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const SCRIPT_CONFIG = {
    id: 'wave-interference',
    title: 'Wave Interference',
    category: 'wave',
    description: 'Spatial wave equation visualizer. Full equation: I = R(r) + X(x) + Y(y). Each component supports two terms and modulation for complex interference patterns.',
    version: '2.1.0',

    // ComputeScheduler hints (see blog/docs/guides/standards/compute-scheduler.md)
    // Tier 2: renders at 50% linear resolution (~25% pixel count) during slider drag.
    // Tier 3: worker flag routes pixel computation off-main-thread via computePixels.
    compute: {
        cost: 'per-pixel',
        interactionScale: 0.5,
        idleDelay: 200,
        worker: true,
    },

    canvas: {
        width: 512,
        height: 512,
        context: '2d',
        background: '#000000'
    },

    animation: {
        type: 'parametric',
        animatableParams: ['phiR1', 'phiR2', 'phiX1', 'phiX2', 'phiY1', 'phiY2'],
        defaultFps: 60,
        canPrerender: true,
        sequencer: true
    },

    export: {
        png: true,
        gif: true,
        webm: true,
        sequence: true
    },

    presets: LANDMARKS,

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Wave Interference models a spatial intensity field on a 512x512 canvas by composing three independent wave-function components: a radial component R(r) evaluated on distance from the canvas centre, a horizontal component X(x) evaluated on normalised horizontal position, and a vertical component Y(y) evaluated on normalised vertical position. The intensity at any pixel is the sum or product of R, X, and Y according to the selected blend mode. In sum mode: I = R(r) + X(x) + Y(y). In multiply mode: I = (1 + R(r)) x (1 + X(x)) x (1 + Y(y)). The output intensity field is normalised per-frame via min-max normalisation and mapped to greyscale. Visually, the output is a greyscale interference map on a black canvas. R-only configurations produce concentric rings or offset/distorted rings. X-only or Y-only configurations produce horizontal or vertical stripes. Combinations produce Moire-like grid patterns, cross-hatching, and complex non-repeating interference fields. Sum creates additive superposition; multiply creates structured voids where any component is near zero.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Coordinate system: canvas pixel (px, py) is normalised to centred, scale-invariant space as x = (px - cx) / scale, y = (py - cy) / scale, r = sqrt(x^2 + y^2). A global rotation theta = rotation x pi / 180 is applied: x\' = x cos(theta) - y sin(theta), y\' = x sin(theta) + y cos(theta). Rotation affects X and Y stripe orientation; R(r) is rotation-invariant since r is unchanged by rotation. Wave term structure: each component (R, X, Y) has two terms of the form A_k x safePow(coord_k - O_k, p_k) x wave(2pi x f_k x coord + phi_k), where A_k is amplitude (signed), O_k is spatial offset (shifts envelope centre), p_k is power exponent (sharpens or inverts peaks), f_k is frequency, phi_k is phase, and wave is sin or cos. safePow(base, exp) = sign(base) x |base|^exp if |base| >= 1e-9 or exp >= 0, else 0. Positive p sharpens peaks; negative p produces inverted elongated profiles. Modulation: each component applies an additive modulation layer: result *= (1 + M x (safePow(sin(2pi x fm1 x coord + phim1), pm1) + safePow(sin(2pi x fm2 x coord + phim2), pm2))). Modulation is skipped when |M| <= 0.001. Normalisation: two-pass over W x H pixels. Pass 1 tracks min_I and max_I. Pass 2 computes grey = floor((I - min_I) / (max_I - min_I) x 255). If max_I - min_I < epsilon, range defaults to 1 (uniform field renders mid-grey). Functions: safePow(base, exp) signed exponentiation with zero guard; waveFunc(t, useCos) dispatches to sin or cos; computeR(r, params) evaluates R(r) with 2 terms and modulation; computeX(x, params) evaluates X(x) with 2 terms and modulation; computeY(y, params) evaluates Y(y) with 2 terms and modulation; draw(ctx, canvas, params, frame) main render with pooled buffers; computePixels(imageData, params, frame) self-contained worker-safe duplicate of draw logic.'
        },
        {
            heading: 'PARAMETERS',
            body: 'R(r) Term 1: Ar1 amplitude -2 to 2 step 0.1 default 1; fr1 frequency 0 to 50 step 0.5 default 20; pr1 power -7 to 7 step 0.1 default 1; phiR1 phase -6.28 to 6.28 step 0.01 default 0; Or1 offset -2 to 2 step 0.1 default 0; waveR1 radio sin/cos default sin. R(r) Term 2 (collapsed): Ar2 amplitude default 0; fr2 frequency default 0; pr2 power default 1; phiR2 phase default 0; Or2 offset default 0; waveR2 radio sin/cos default sin. R(r) Modulation (collapsed): Mr mod mix -1 to 1 step 0.01 default 0; frm1 freq mod 1 0 to 50 default 0; frm2 freq mod 2 0 to 50 default 0; prm1 power mod 1 -7 to 7 default 1; prm2 power mod 2 -7 to 7 default 1; phiRm1 phase mod 1 -6.28 to 6.28 default 0; phiRm2 phase mod 2 -6.28 to 6.28 default 0. X(x) Term 1 (collapsed): Ax1 amplitude default 0; fx1 frequency default 0; px1 power default 1; phiX1 phase default 0; Ox1 offset default 0; waveX1 radio sin/cos default sin. X(x) Term 2 (collapsed): Ax2 amplitude default 0; fx2 frequency default 0; px2 power default 1; phiX2 phase default 0; Ox2 offset default 0; waveX2 radio sin/cos default sin. X(x) Modulation (collapsed): Mx mod mix default 0; fxm1 freq mod 1 default 0; fxm2 freq mod 2 default 0; pxm1 power mod 1 default 1; pxm2 power mod 2 default 1; phiXm1 phase mod 1 default 0; phiXm2 phase mod 2 default 0. Y(y) Term 1 (collapsed): Ay1 amplitude default 0; fy1 frequency default 0; py1 power default 1; phiY1 phase default 0; Oy1 offset default 0; waveY1 radio sin/cos default sin. Y(y) Term 2 (collapsed): Ay2 amplitude default 0; fy2 frequency default 0; py2 power default 1; phiY2 phase default 0; Oy2 offset default 0; waveY2 radio sin/cos default sin. Y(y) Modulation (collapsed): My mod mix default 0; fym1 freq mod 1 default 0; fym2 freq mod 2 default 0; pym1 power mod 1 default 1; pym2 power mod 2 default 1; phiYm1 phase mod 1 default 0; phiYm2 phase mod 2 default 0. View: scale 50 to 500 step 10 default 300; rotation 0 to 360 step 1 default 0; blendMode radio sum/multiply default sum. Interactions: frequency and phase are the primary interactive parameters. Power below 1 stretches and blurs wave profiles; power above 1 sharpens them. Negative power produces singularities near the offset centre. Scale controls the normalised coordinate range; low scale (50) zooms in so only low frequencies are visible. Offset shifts the spatial envelope of the term away from the component axis origin.'
        },
        {
            heading: 'PRESETS',
            body: '20 Rings (Default): Ar1=1, fr1=20, pr1=1. Produces 20 concentric rings from the centre. 1 Ring: fr1=1, single ring at the normalised unit radius. 3 Rings: fr1=3. 5 Rings: fr1=5. 10 Rings: fr1=10. Inverted 5 Rings: Ar1=-1, fr1=5. Rings are phase-inverted; bright and dark bands swap. Offset Rings: fr1=5, Or1=0.3. Ring centre is displaced 0.3 normalised units from the canvas centre, producing asymmetric ring spacing. Horizontal Lines: Ay1=1, fy1=5. R component suppressed (Ar1=0); produces 5 horizontal stripes across the Y axis. Vertical Lines: Ax1=1, fx1=5. R component suppressed; produces 5 vertical stripes across the X axis. Grid 5x5: Ax1=1, fx1=5, Ay1=1, fy1=5. R suppressed; X and Y components at matching frequency produce a grid. Moire Cross: Ax1=1, fx1=5, Ay1=1, fy1=5.5. Slight detuning between X and Y frequencies produces a slow-beating Moire cross pattern. Rings + Grid: R component at fr1=5 plus weak X at fx1=8 and weak Y at fy1=8. Ring and grid patterns superimpose. Complex Interference: R with 2 active terms (fr1=3, fr2=7) plus weak X at fx1=10. Multi-frequency radial and horizontal interference.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Total complexity is O(W x H) per frame, linear in pixel count. At 512x512 = 262,144 pixels with approximately 20 float operations per pixel (3 components each with 2 wave terms plus conditional modulation, plus sqrt for r), estimated raw computation is 5 to 8 million float operations per frame. Main-thread rendering runs at approximately 8 to 15 ms at 60 FPS with all modulation active and complex parameter combinations. Frame budget at 60 FPS is 16.7 ms; main-thread performance is borderline under maximum load. Two mitigations are active: Tier 2 adaptive resolution renders at 50% linear scale (25% pixel count, approximately 2 ms) during slider interaction; Tier 3 worker offload routes the computePixels function off-main-thread via ComputeScheduler. Per-frame allocations without pooling: one Float32Array(W x H) at 1 MB and one ImageData at 1 MB = 120 MB/s allocation pressure at 60 FPS. Buffer pooling reuses both allocations across frames, eliminating GC pressure on the main thread. The Worker path transfers the ImageData buffer (zero-copy) so GC is not an issue there. Extreme parameters: fr=50 produces approximately 100 zero-crossings with unchanged computation cost; pr=-7 with Or=0 produces singularities at the component axis; scale=50 with high frequency produces visual aliasing.'
        },
        {
            heading: 'ANIMATION',
            body: 'Animation type is parametric. The host sweeps the six phase parameters phiR1, phiR2, phiX1, phiX2, phiY1, phiY2 between frames. Advancing a phase parameter shifts the corresponding spatial interference pattern along its axis. The generator is fully deterministic: given the same parameters and the same frame, the output is identical every time. There is no Math.random, no accumulated state, and no Date.now dependency. Each frame is computed independently. Default frame rate is 60 FPS. canPrerender is true: the host may pre-compute frames for GIF or WebM export. Sequencer support is enabled (sequencer: true): the host may save checkpoint parameter states and interpolate between them. Interpolating between presets with different radial frequencies produces smooth ring-count morphs; interpolating phase parameters produces smooth spatial rotation or drift of the interference field.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Output mode: the live implementation produces continuous greyscale output via min-max normalisation. The legacy specification described binary black/white thresholding (value > 0 maps to white). This is an intentional design divergence; greyscale provides more visual information. No threshold toggle is currently implemented. Rendering path: only the CPU ImageData path is implemented. The legacy specification described a WebGL fragment shader as the primary rendering path. Worker offload via computePixels provides a functionally equivalent alternative for off-main-thread execution. Modulation formula: the live modulation formula uses a sum of two sin waves: M x (safePow(sin(fm1 x coord), pm1) + safePow(sin(fm2 x coord), pm2)). The legacy specification described a product of sin and cos: M x safePow(sin(fm1 x coord), pm1) x safePow(cos(fm2 x coord), pm2). The live formula produces additive two-term modulation rather than multiplicative cross-modulation. Animation: per-parameter animation speed and direction controls specified in the legacy spec are not implemented. The host controls all phase advancement uniformly via animatableParams.'
        },
        {
            heading: 'REFERENCES',
            body: 'Live source: assets/js/tools/generators/scripts/wave/wave-interference.gen.js. Archive: reference/generators/wave-interference/source/wave-interference.gen.js. Registry: assets/js/tools/generators/core/script-registry.js. Host: assets/js/tools/generators/core/generative-tool-host.js. Algorithm origin: the component structure (superposition of separable and radial wave functions with power distortion) is a bespoke multi-axis generalisation of the standard Lissajous/interference pattern approach, not a named published algorithm. The safePow function matches the implementation in lissajous.gen.js. Version 2.0.0: functional rewrite from legacy vanilla JS class to gen.js module format. Version 2.1.0: camelCase parameter keys; 28 missing UI parameters added; presets expanded to full maps; buffer pooling; infoSections.'
        }
    ],

    parameters: [
        // R(r) — Radial component
        {
            group: 'R(r) Term 1',
            params: [
                { key: 'Ar1',    type: 'slider', label: 'Amplitude',  min: -2,    max: 2,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'fr1',    type: 'slider', label: 'Frequency',  min: 0,     max: 50,   step: 0.5,  default: 20,    precision: 1 },
                { key: 'pr1',    type: 'slider', label: 'Power',      min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'phiR1',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Or1',    type: 'slider', label: 'Offset',     min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'waveR1', type: 'radio',  label: 'Wave',       options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'R(r) Term 2',
            defaultCollapsed: true,
            params: [
                { key: 'Ar2',    type: 'slider', label: 'Amplitude',  min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'fr2',    type: 'slider', label: 'Frequency',  min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'pr2',    type: 'slider', label: 'Power',      min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'phiR2',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Or2',    type: 'slider', label: 'Offset',     min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'waveR2', type: 'radio',  label: 'Wave',       options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'R(r) Modulation',
            defaultCollapsed: true,
            params: [
                { key: 'Mr',     type: 'slider', label: 'Mod Mix',    min: -1,    max: 1,    step: 0.01, default: 0,     precision: 2 },
                { key: 'frm1',   type: 'slider', label: 'Freq Mod 1', min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'frm2',   type: 'slider', label: 'Freq Mod 2', min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'prm1',   type: 'slider', label: 'Power Mod 1',min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'prm2',   type: 'slider', label: 'Power Mod 2',min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'phiRm1', type: 'slider', label: 'Phase Mod 1',min: -6.28, max: 6.28, step: 0.01, default: 0,    precision: 2 },
                { key: 'phiRm2', type: 'slider', label: 'Phase Mod 2',min: -6.28, max: 6.28, step: 0.01, default: 0,    precision: 2 }
            ]
        },
        // X(x) — Horizontal component
        {
            group: 'X(x) Term 1',
            defaultCollapsed: true,
            params: [
                { key: 'Ax1',    type: 'slider', label: 'Amplitude',  min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'fx1',    type: 'slider', label: 'Frequency',  min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'px1',    type: 'slider', label: 'Power',      min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'phiX1',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Ox1',    type: 'slider', label: 'Offset',     min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'waveX1', type: 'radio',  label: 'Wave',       options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'X(x) Term 2',
            defaultCollapsed: true,
            params: [
                { key: 'Ax2',    type: 'slider', label: 'Amplitude',  min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'fx2',    type: 'slider', label: 'Frequency',  min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'px2',    type: 'slider', label: 'Power',      min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'phiX2',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Ox2',    type: 'slider', label: 'Offset',     min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'waveX2', type: 'radio',  label: 'Wave',       options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'X(x) Modulation',
            defaultCollapsed: true,
            params: [
                { key: 'Mx',     type: 'slider', label: 'Mod Mix',    min: -1,    max: 1,    step: 0.01, default: 0,     precision: 2 },
                { key: 'fxm1',   type: 'slider', label: 'Freq Mod 1', min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'fxm2',   type: 'slider', label: 'Freq Mod 2', min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'pxm1',   type: 'slider', label: 'Power Mod 1',min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'pxm2',   type: 'slider', label: 'Power Mod 2',min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'phiXm1', type: 'slider', label: 'Phase Mod 1',min: -6.28, max: 6.28, step: 0.01, default: 0,    precision: 2 },
                { key: 'phiXm2', type: 'slider', label: 'Phase Mod 2',min: -6.28, max: 6.28, step: 0.01, default: 0,    precision: 2 }
            ]
        },
        // Y(y) — Vertical component
        {
            group: 'Y(y) Term 1',
            defaultCollapsed: true,
            params: [
                { key: 'Ay1',    type: 'slider', label: 'Amplitude',  min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'fy1',    type: 'slider', label: 'Frequency',  min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'py1',    type: 'slider', label: 'Power',      min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'phiY1',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Oy1',    type: 'slider', label: 'Offset',     min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'waveY1', type: 'radio',  label: 'Wave',       options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'Y(y) Term 2',
            defaultCollapsed: true,
            params: [
                { key: 'Ay2',    type: 'slider', label: 'Amplitude',  min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'fy2',    type: 'slider', label: 'Frequency',  min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'py2',    type: 'slider', label: 'Power',      min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'phiY2',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Oy2',    type: 'slider', label: 'Offset',     min: -2,    max: 2,    step: 0.1,  default: 0,     precision: 1 },
                { key: 'waveY2', type: 'radio',  label: 'Wave',       options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'Y(y) Modulation',
            defaultCollapsed: true,
            params: [
                { key: 'My',     type: 'slider', label: 'Mod Mix',    min: -1,    max: 1,    step: 0.01, default: 0,     precision: 2 },
                { key: 'fym1',   type: 'slider', label: 'Freq Mod 1', min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'fym2',   type: 'slider', label: 'Freq Mod 2', min: 0,     max: 50,   step: 0.5,  default: 0,     precision: 1 },
                { key: 'pym1',   type: 'slider', label: 'Power Mod 1',min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'pym2',   type: 'slider', label: 'Power Mod 2',min: -7,    max: 7,    step: 0.1,  default: 1,     precision: 1 },
                { key: 'phiYm1', type: 'slider', label: 'Phase Mod 1',min: -6.28, max: 6.28, step: 0.01, default: 0,    precision: 2 },
                { key: 'phiYm2', type: 'slider', label: 'Phase Mod 2',min: -6.28, max: 6.28, step: 0.01, default: 0,    precision: 2 }
            ]
        },
        // Global
        {
            group: 'View',
            params: [
                { key: 'scale',     type: 'slider', label: 'Scale',    min: 50,  max: 500, step: 10, default: 300 },
                { key: 'rotation',  type: 'slider', label: 'Rotation', min: 0,   max: 360, step: 1,  default: 0 },
                { key: 'blendMode', type: 'radio',  label: 'Blend',    options: ['sum', 'multiply'], default: 'sum' }
            ]
        }
    ],

    draw,

    /**
     * Tier 3 worker function — pure, transferable-safe.
     * Receives an empty ImageData whose buffer has been transferred to the worker.
     * All helper functions are defined inline; no closure over module scope.
     * Returns the same ImageData after filling pixel data.
     */
    computePixels(imageData, params, frame) {
        const W = imageData.width;
        const H = imageData.height;
        const data = imageData.data;

        const cx = W / 2;
        const cy = H / 2;
        const scale = params.scale || 300;
        const rotation = (params.rotation || 0) * Math.PI / 180;
        const blendMode = params.blendMode || 'sum';
        const TWO_PI = Math.PI * 2;

        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);

        const intensities = new Float32Array(W * H);
        let minI = Infinity, maxI = -Infinity;

        function _safePow(base, exp) {
            if (Math.abs(base) < 1e-9 && exp < 0) return 0;
            return Math.sign(base) * Math.pow(Math.abs(base), exp);
        }

        function _wave(t, useCos) {
            return useCos ? Math.cos(t) : Math.sin(t);
        }

        function _R(r, p) {
            const r1 = r - (p.Or1 || 0);
            let v = (p.Ar1 || 0) * _safePow(r1, p.pr1 || 1) * _wave(TWO_PI * (p.fr1 || 0) * r + (p.phiR1 || 0), p.waveR1 === 'cos');
            const r2 = r - (p.Or2 || 0);
            v += (p.Ar2 || 0) * _safePow(r2, p.pr2 || 1) * _wave(TWO_PI * (p.fr2 || 0) * r + (p.phiR2 || 0), p.waveR2 === 'cos');
            if (Math.abs(p.Mr || 0) > 0.001) {
                const m1 = _wave(TWO_PI * (p.frm1 || 0) * r + (p.phiRm1 || 0), false);
                const m2 = _wave(TWO_PI * (p.frm2 || 0) * r + (p.phiRm2 || 0), false);
                v *= (1 + (p.Mr || 0) * (_safePow(m1, p.prm1 || 1) + _safePow(m2, p.prm2 || 1)));
            }
            return v;
        }

        function _X(x, p) {
            const x1 = x - (p.Ox1 || 0);
            let v = (p.Ax1 || 0) * _safePow(x1, p.px1 || 1) * _wave(TWO_PI * (p.fx1 || 0) * x + (p.phiX1 || 0), p.waveX1 === 'cos');
            const x2 = x - (p.Ox2 || 0);
            v += (p.Ax2 || 0) * _safePow(x2, p.px2 || 1) * _wave(TWO_PI * (p.fx2 || 0) * x + (p.phiX2 || 0), p.waveX2 === 'cos');
            if (Math.abs(p.Mx || 0) > 0.001) {
                const m1 = _wave(TWO_PI * (p.fxm1 || 0) * x + (p.phiXm1 || 0), false);
                const m2 = _wave(TWO_PI * (p.fxm2 || 0) * x + (p.phiXm2 || 0), false);
                v *= (1 + (p.Mx || 0) * (_safePow(m1, p.pxm1 || 1) + _safePow(m2, p.pxm2 || 1)));
            }
            return v;
        }

        function _Y(y, p) {
            const y1 = y - (p.Oy1 || 0);
            let v = (p.Ay1 || 0) * _safePow(y1, p.py1 || 1) * _wave(TWO_PI * (p.fy1 || 0) * y + (p.phiY1 || 0), p.waveY1 === 'cos');
            const y2 = y - (p.Oy2 || 0);
            v += (p.Ay2 || 0) * _safePow(y2, p.py2 || 1) * _wave(TWO_PI * (p.fy2 || 0) * y + (p.phiY2 || 0), p.waveY2 === 'cos');
            if (Math.abs(p.My || 0) > 0.001) {
                const m1 = _wave(TWO_PI * (p.fym1 || 0) * y + (p.phiYm1 || 0), false);
                const m2 = _wave(TWO_PI * (p.fym2 || 0) * y + (p.phiYm2 || 0), false);
                v *= (1 + (p.My || 0) * (_safePow(m1, p.pym1 || 1) + _safePow(m2, p.pym2 || 1)));
            }
            return v;
        }

        let idx = 0;
        for (let py = 0; py < H; py++) {
            for (let px = 0; px < W; px++) {
                let x = (px - cx) / scale;
                let y = (py - cy) / scale;
                const xr = x * cosR - y * sinR;
                const yr = x * sinR + y * cosR;
                x = xr; y = yr;
                const r = Math.sqrt(x * x + y * y);
                let intensity;
                if (blendMode === 'multiply') {
                    intensity = (1 + _R(r, params)) * (1 + _X(x, params)) * (1 + _Y(y, params));
                } else {
                    intensity = _R(r, params) + _X(x, params) + _Y(y, params);
                }
                intensities[idx] = intensity;
                if (intensity < minI) minI = intensity;
                if (intensity > maxI) maxI = intensity;
                idx++;
            }
        }

        const range = maxI - minI || 1;
        for (let i = 0; i < intensities.length; i++) {
            const grey = Math.floor(((intensities[i] - minI) / range) * 255);
            const p = i * 4;
            data[p] = grey; data[p + 1] = grey; data[p + 2] = grey; data[p + 3] = 255;
        }

        return imageData;
    }
};
