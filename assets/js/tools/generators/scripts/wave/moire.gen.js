/**
 * Moiré Pattern Script - Interference pattern generator
 * 
 * Generates moiré patterns using radial, angular, and multi-centre gratings.
 * 
 * @script moire
 * @category wave
 * @version 2.0.0
 */

import '../../../../shared/algorithms/core/math-utils.js';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const TWO_PI = Math.PI * 2;

// ═══════════════════════════════════════════════════════════════════
// PATTERN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function radialGrating(x, y, cx, cy, wavelength, phase) {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    return 0.5 + 0.5 * Math.sin(TWO_PI * (r / wavelength + phase));
}

function angularGrating(x, y, cx, cy, freq, offset) {
    const dx = x - cx;
    const dy = y - cy;
    const angle = Math.atan2(dy, dx);
    return 0.5 + 0.5 * Math.sin(freq * angle + offset);
}

function combineMoire(a, b, mode) {
    switch (mode) {
        case 'sum': return (a + b) / 2;
        case 'product': return a * b;
        case 'min': return Math.min(a, b);
        case 'max': return Math.max(a, b);
        default: return (a + b) / 2;
    }
}

function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

// ═══════════════════════════════════════════════════════════════════
// GRATING COMPUTATION
// ═══════════════════════════════════════════════════════════════════

// MOI-04: axA/ayA and axB/ayB are polar-resolved centres for gratings A and B.
function computeGratings(x, y, wavelength, angularFreq, phase,
                        axA, ayA, axB, ayB, weightA, weightB, count, mode) {
    const values = [];

    // Centre A
    let gA = radialGrating(x, y, axA, ayA, wavelength, phase - 0.25) * weightA;
    if (angularFreq > 0) {
        gA *= angularGrating(x, y, axA, ayA, angularFreq, -Math.PI / 2);
    }
    values.push(gA);

    // Centre B (active when count >= 2 and B is offset from A)
    if (count >= 2 && (Math.abs(axB - axA) > 0.001 || Math.abs(ayB - ayA) > 0.001)) {
        let gB = radialGrating(x, y, axB, ayB, wavelength, phase - 0.25) * weightB;
        if (angularFreq > 0) {
            gB *= angularGrating(x, y, axB, ayB, angularFreq, -Math.PI / 2);
        }
        values.push(gB);
    }

    // Additional gratings with coordinate rotation (centres 2–3)
    for (let i = 2; i < count; i++) {
        const angle = (i - 1) * Math.PI / count;
        const cosA = Math.cos(angle), sinA = Math.sin(angle);
        const xR = x * cosA + y * sinA;
        const yR = -x * sinA + y * cosA;
        values.push(radialGrating(xR, yR, 0, 0, wavelength, phase - 0.25 + i * 0.1));
    }

    let intensity = values[0];
    for (let i = 1; i < values.length; i++) {
        intensity = combineMoire(intensity, values[i], mode.toLowerCase());
    }
    return intensity;
}

// ═══════════════════════════════════════════════════════════════════
// MASK COMPUTATION
// ═══════════════════════════════════════════════════════════════════

function computeMask(x, y, type, size, softness) {
    if (type === 'none') return 1;
    
    let d;
    switch (type) {
        case 'circle':
            d = Math.sqrt(x * x + y * y);
            break;
        case 'triangle': {
            d = Math.max(Math.abs(x) * 0.866 + y * 0.5, -y);
            break;
        }
        case 'square':
            d = Math.max(Math.abs(x), Math.abs(y));
            break;
        default:
            return 1;
    }
    
    const edge = size;
    if (softness > 0) {
        return smoothstep(edge + softness, edge - softness, d);
    }
    return d < edge ? 1 : 0;
}

// ═══════════════════════════════════════════════════════════════════
// COLOR UTILITIES
// ═══════════════════════════════════════════════════════════════════

function parseColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

// ═══════════════════════════════════════════════════════════════════
// DRAW FUNCTION
// ═══════════════════════════════════════════════════════════════════

function draw(ctx, canvas, params, frame, colourway) {
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    // MOI-02: read colours from colourway (X-007), fall back to legacy params
    const cw  = colourway || [];
    const fg  = parseColor(cw.find(c => c.id === 'foreground')?.colour || params.fgColor || '#ffffff');
    const bg  = parseColor(cw.find(c => c.id === 'background')?.colour || params.bgColor || '#000000');
    const invert = params.invert === 'on';

    const speed = params.phaseSpeed || 0.1;
    const animationTime = (frame / 60) * speed;

    const wavelength  = params.wavelength  || 0.02;
    const angularFreq = params.angularFreq || 0;
    const phase       = (params.phaseOffset || 0) + animationTime;
    const gratingCount = params.gratingCount || 2;
    const combineMode = params.combineMode || 'sum';
    const threshold   = params.threshold   || 0.5;
    const weightA     = params.weightA     || 1;
    const weightB     = params.weightB     || 1;

    // MOI-04: polar grating centres
    const gAPolarR = params.gratingAPolarR || 0;
    const gATheta  = (params.gratingAPolarTheta || 0) * Math.PI / 180;
    const axA = gAPolarR * Math.cos(gATheta);
    const ayA = gAPolarR * Math.sin(gATheta);

    // Centre B — prefer new polar params; fall back to legacy centreOffset
    const gBPolarR = params.gratingBPolarR != null ? params.gratingBPolarR : (params.centreOffset || 0);
    const gBTheta  = (params.gratingBPolarTheta || 0) * Math.PI / 180;
    const centreOscVal = (params.centreOsc || 0) * Math.sin(animationTime * 2);
    const bR = gBPolarR + centreOscVal;
    const axB = bR * Math.cos(gBTheta);
    const ayB = bR * Math.sin(gBTheta);

    const maskType    = (params.maskType    || 'none').toLowerCase();
    const maskSize    = params.maskSize     || 1;
    const maskSoftness = params.maskSoftness || 0;

    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            const x = (px / w) * 2 - 1;
            const y = (py / h) * 2 - 1;

            let intensity = computeGratings(
                x, y, wavelength, angularFreq, phase,
                axA, ayA, axB, ayB, weightA, weightB, gratingCount, combineMode
            );

            const mask = computeMask(x, y, maskType, maskSize, maskSoftness);
            intensity *= mask;

            let on = intensity > threshold;
            if (invert) on = !on;

            const color = on ? fg : bg;
            const i = (py * w + px) * 4;
            data[i] = color.r; data[i + 1] = color.g;
            data[i + 2] = color.b; data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

// ═══════════════════════════════════════════════════════════════════
// SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const SCRIPT_CONFIG = {
    id: 'moire',
    title: 'Moiré Generator',
    category: 'wave',
    description: 'Generates moiré patterns using radial, angular, and multi-centre gratings. Supports multiple combination modes and mask shapes.',
    version: '2.0.0',

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Moiré generates binary interference patterns on a 420×420 canvas by composing multiple radial gratings and optionally combining them with angular gratings. Each grating produces a sinusoidal field in normalised [-1, 1] canvas coordinates. Fields from multiple grating centres are combined using one of four modes (sum, product, min, max) and threshold-clipped to binary output using configurable foreground and background colours. The radial grating function is: 0.5 + 0.5 · sin(2π · (r/λ + φ)) where r is the distance from centre (cx, cy). When angularFreq > 0, the radial grating is multiplied by an angular grating: 0.5 + 0.5 · sin(ω · atan2(y−cy, x−cx) + δ), superimposing a sectoral (spoke-like) modulation on the concentric rings. Up to 4 grating centres are supported. Centre A is always at the canvas origin. Centre B activates when gratingCount ≥ 2 and centreOffset > 0. Additional centres (indices 2–3) are placed by rotating the coordinate system. Animation is driven by frame: animationTime = (frame/60) · phaseSpeed. An optional mask (circle, square, triangle) restricts the pattern to a geometric region. Output is always binary two-colour — threshold controls the field value above which a pixel is assigned fgColor. The invert toggle swaps the fg/bg assignment.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Coordinate system: pixels normalised to [-1, 1] via x = (px/W)×2−1, y = (py/H)×2−1. Canvas is 420×420; pixel spacing is 2/420 ≈ 0.00476 per pixel. Radial grating: radialGrating(x,y,cx,cy,λ,φ) = 0.5+0.5·sin(2π·(r/λ+φ)), r=√((x−cx)²+(y−cy)²). Angular grating: angularGrating(x,y,cx,cy,ω,δ) = 0.5+0.5·sin(ω·atan2(y−cy,x−cx)+δ); δ is hardcoded to −π/2. Multi-centre field: centre A at (0,0) weighted by weightA; centre B at (centreOffset_eff, 0) weighted by weightB when gratingCount≥2 and centreOffset>0; centres 2–3 apply coordinate rotation at angle (i−1)·π/count before evaluating radialGrating at origin (unweighted). Centre B oscillation: centreOffset_eff = centreOffset + sin(animationTime×2)×centreOsc. Sequential pairwise combination: intensity_0 = gA; intensity_i = combineMoire(intensity_{i−1}, g_i, mode). Modes: sum=(a+b)/2, product=a×b, min=min(a,b), max=max(a,b). Mask distances: circle=√(x²+y²), square=max(|x|,|y|), triangle=max(|x|·0.866+y·0.5,−y). Soft mask: smoothstep(edge+softness, edge−softness, d) with smoothstep(e0,e1,x)=t²(3−2t), t=clamp((x−e0)/(e1−e0),0,1). Hard mask: d<maskSize?1:0. Output: on = intensity×mask > threshold; if invert then on=!on; color = on ? fg : bg. Functions: radialGrating, angularGrating, combineMoire, smoothstep, computeGratings, computeMask, parseColor, draw.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Gratings — gratingCount: slider 1–4, step 1, default 2; number of active grating centres. wavelength: slider 0.005–0.1, step 0.001, default 0.02; spatial wavelength of rings in normalised units. angularFreq: slider 0–24, step 1, default 0; spoke modulation frequency; 0 disables angular grating. phaseOffset: slider 0–1, step 0.01, default 0; static phase shift applied to all gratings. Combination — combineMode: radio sum|product|min|max, default sum; how grating fields are merged sequentially. threshold: slider 0–1, step 0.01, default 0.5; field value above which a pixel is assigned fgColor. Multi-Centre — centreOffset: slider 0–1, step 0.01, default 0; horizontal displacement of centre B in normalised coords. weightA: slider 0–1, step 0.01, default 1; amplitude weight for centre A. weightB: slider 0–1, step 0.01, default 1; amplitude weight for centre B. Motion — phaseSpeed: slider 0–1, step 0.01, default 0.1; phase advance rate per second at 60 FPS base. centreOsc: slider 0–1, step 0.01, default 0; amplitude of centre B position oscillation during animation. Mask — maskType: radio none|circle|triangle|square, default none; geometric region restricting the pattern. maskSize: slider 0–1, step 0.01, default 1; radius or half-extent of the mask in normalised coords. maskSoftness: slider 0–0.2, step 0.01, default 0; gradient width of the mask edge. Colors — fgColor: color, default #ffffff; foreground pixel colour assigned above threshold. bgColor: color, default #000000; background pixel colour assigned below threshold. invert: radio off|on, default off; swaps fg/bg assignment.'
        },
        {
            heading: 'PRESETS',
            body: 'Classic — gratingCount 2, centreOffset 0.3, combineMode sum, threshold 0.5, no mask. Standard two-centre radial moiré producing concentric interference rings. Angular — gratingCount 2, angularFreq 12, combineMode product, threshold 0.4, maskType circle, maskSize 0.9. Spoke-modulated pattern clipped to a circular region; produces fan-like sectors. Hypnotic — gratingCount 3, centreOsc 0.2, combineMode min, threshold 0.3, phaseSpeed 0.2. Three-centre minimum-combined field with oscillating centre B; produces shifting morphing lobes.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Complexity: O(W×H×gratingCount). At 420×420 with gratingCount 2: ~350,000 trig calls per frame. At gratingCount 4 with angularFreq>0: ~1.6M trig calls per frame (4 sqrt + 4 atan2 + 8 sin per pixel). Frame budget at 30 FPS: 33ms. No critical performance risk at default settings on modern hardware. During slider interaction, interactionScale 0.5 renders at 210×210 (25% pixel count) for real-time feedback. ImageData allocation: ~705KB per frame; single allocation with no intermediate intensity buffer.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: infinite — runs continuously with no terminal frame. Frame-driven: animationTime = (frame/60)×phaseSpeed. Phase advances phaseSpeed units per second at 60 FPS base. Animation advances all grating phases simultaneously and drives centre B oscillation via centreOsc. Default 30 FPS. Fully deterministic — same frame and same parameters always produce identical output. Export-compatible for PNG, GIF, and WebM.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Triangle mask uses an approximate equilateral triangle field (max(|x|·0.866+y·0.5,−y)) rather than a true signed-distance function; boundary softness may differ from circle and square masks at equivalent maskSize values. Angular modulation amplitude is fixed at 1; there is no slider to reduce the strength of spoke modulation relative to the radial rings. Mask rotation is not implemented; all mask shapes are axis-aligned. The polygon mask (configurable-side regular polygon) from the original specification is replaced by a fixed square (Chebyshev distance). WebGL fragment shader rendering path is not implemented; only CPU ImageData is available, limiting performance at resolutions above 420×420.'
        },
        {
            heading: 'REFERENCES',
            body: 'Algorithm: standard moiré / interference pattern technique using superposition of circular sinusoidal gratings. No named published algorithm beyond textbook wave interference.'
        }
    ],

    // ComputeScheduler — Tiers 1+2+3 (per-pixel imageData draw mode).
    // Tier 2: 50% linear scale during interaction (−75% pixels).
    // Tier 3: worker offload so UI thread is never blocked. PERF-003.
    compute: {
        cost: 'per-pixel',
        interactionScale: 0.5,
        idleDelay: 200,
        worker: true,
    },

    /**
     * Tier-3 worker function — self-contained; no module-scope references.
     * Receives an empty ImageData (buffer transferred). Returns filled ImageData.
     * Colors read from params._fgColor / params._bgColor injected by draw() fallback.
     */
    computePixels(imageData, params, frame) {
        const W = imageData.width;
        const H = imageData.height;
        const data = imageData.data;

        // ── Inline constants ──────────────────────────────────────────────────
        const TWO_PI = Math.PI * 2;

        // ── Inline helpers ────────────────────────────────────────────────────
        function radialGrating(x, y, cx, cy, wavelength, phase) {
            const dx = x - cx;
            const dy = y - cy;
            const r  = Math.sqrt(dx * dx + dy * dy);
            return 0.5 + 0.5 * Math.sin(TWO_PI * (r / wavelength + phase));
        }

        function angularGrating(x, y, cx, cy, freq, offset) {
            const dx    = x - cx;
            const dy    = y - cy;
            const angle = Math.atan2(dy, dx);
            return 0.5 + 0.5 * Math.sin(freq * angle + offset);
        }

        function combineMoire(a, b, mode) {
            switch (mode) {
                case 'sum':     return (a + b) / 2;
                case 'product': return a * b;
                case 'min':     return Math.min(a, b);
                case 'max':     return Math.max(a, b);
                default:        return (a + b) / 2;
            }
        }

        function smoothstep(edge0, edge1, x) {
            const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
            return t * t * (3 - 2 * t);
        }

        function computeGratings(x, y, wavelength, angularFreq, phase,
                                 axA, ayA, axB, ayB, weightA, weightB, count, mode) {
            const values = [];
            let gA = radialGrating(x, y, axA, ayA, wavelength, phase - 0.25) * weightA;
            if (angularFreq > 0) {
                gA *= angularGrating(x, y, axA, ayA, angularFreq, -Math.PI / 2);
            }
            values.push(gA);
            if (count >= 2 && (Math.abs(axB - axA) > 0.001 || Math.abs(ayB - ayA) > 0.001)) {
                let gB = radialGrating(x, y, axB, ayB, wavelength, phase - 0.25) * weightB;
                if (angularFreq > 0) {
                    gB *= angularGrating(x, y, axB, ayB, angularFreq, -Math.PI / 2);
                }
                values.push(gB);
            }
            for (let i = 2; i < count; i++) {
                const angle = (i - 1) * Math.PI / count;
                const cosA  = Math.cos(angle);
                const sinA  = Math.sin(angle);
                const xR    = x * cosA + y * sinA;
                const yR    = -x * sinA + y * cosA;
                values.push(radialGrating(xR, yR, 0, 0, wavelength, phase - 0.25 + i * 0.1));
            }
            let intensity = values[0];
            for (let i = 1; i < values.length; i++) {
                intensity = combineMoire(intensity, values[i], mode.toLowerCase());
            }
            return intensity;
        }

        function computeMask(x, y, type, size, softness) {
            if (type === 'none') return 1;
            let d;
            switch (type) {
                case 'circle':   d = Math.sqrt(x * x + y * y); break;
                case 'triangle': d = Math.max(Math.abs(x) * 0.866 + y * 0.5, -y); break;
                case 'square':   d = Math.max(Math.abs(x), Math.abs(y)); break;
                default:         return 1;
            }
            if (softness > 0) return smoothstep(size + softness, size - softness, d);
            return d < size ? 1 : 0;
        }

        function parseHex(hex) {
            if (!hex || hex.length < 7) return { r: 128, g: 128, b: 128 };
            const v = parseInt(hex.slice(1), 16);
            return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
        }

        // ── Resolve colors (injected by draw() fallback; defaults to B&W) ─────
        const fg     = parseHex(params._fgColor || '#ffffff');
        const bg     = parseHex(params._bgColor || '#000000');
        const invert = params.invert === 'on';

        // ── Unpack params ─────────────────────────────────────────────────────
        const speed        = params.phaseSpeed    || 0.1;
        const animTime     = (frame / 60) * speed;
        const wavelength   = params.wavelength    || 0.02;
        const angularFreq  = params.angularFreq   || 0;
        const phase        = (params.phaseOffset  || 0) + animTime;
        const gratingCount = params.gratingCount  || 2;
        const combineMode  = params.combineMode   || 'sum';
        const threshold    = params.threshold     || 0.5;
        const weightA      = params.weightA       || 1;
        const weightB      = params.weightB       || 1;

        const gAPolarR = params.gratingAPolarR     || 0;
        const gATheta  = (params.gratingAPolarTheta || 0) * Math.PI / 180;
        const axA      = gAPolarR * Math.cos(gATheta);
        const ayA      = gAPolarR * Math.sin(gATheta);

        const gBPolarR     = params.gratingBPolarR != null ? params.gratingBPolarR : (params.centreOffset || 0);
        const gBTheta      = (params.gratingBPolarTheta || 0) * Math.PI / 180;
        const centreOscVal = (params.centreOsc || 0) * Math.sin(animTime * 2);
        const bR           = gBPolarR + centreOscVal;
        const axB          = bR * Math.cos(gBTheta);
        const ayB          = bR * Math.sin(gBTheta);

        const maskType     = (params.maskType    || 'none').toLowerCase();
        const maskSize     = params.maskSize     || 1;
        const maskSoftness = params.maskSoftness || 0;

        // ── Pixel loop ────────────────────────────────────────────────────────
        for (let py = 0; py < H; py++) {
            for (let px = 0; px < W; px++) {
                const x = (px / W) * 2 - 1;
                const y = (py / H) * 2 - 1;

                let intensity = computeGratings(
                    x, y, wavelength, angularFreq, phase,
                    axA, ayA, axB, ayB, weightA, weightB, gratingCount, combineMode
                );
                intensity *= computeMask(x, y, maskType, maskSize, maskSoftness);

                let on = intensity > threshold;
                if (invert) on = !on;

                const color = on ? fg : bg;
                const i = (py * W + px) * 4;
                data[i]     = color.r;
                data[i + 1] = color.g;
                data[i + 2] = color.b;
                data[i + 3] = 255;
            }
        }

        return imageData;
    },

    canvas: {
        width: 420,
        height: 420,
        context: '2d',
        background: '#000000',
        // MOI-02: X-007 colourway
        colourway: [
            { id: 'background',  label: 'Background',  colour: '#000000', kind: 'fill' },
            { id: 'foreground',  label: 'Foreground',  colour: '#ffffff', kind: 'fill' }
        ]
    },
    
    animation: {
        type: 'infinite',
        defaultFps: 30,
        canPrerender: true,
        animatableParams: ['phaseOffset', 'threshold', 'centreOffset', 'wavelength'],
        sequencer: true,
    },
    
    export: {
        png: true,
        gif: true,
        webm: true,
        sequence: true
    },
    
    presets: [
        {
            name: 'Classic',
            values: {
                gratingCount: 2, wavelength: 0.02, angularFreq: 0, phaseOffset: 0,
                combineMode: 'sum', threshold: 0.5,
                gratingAPolarR: 0, gratingAPolarTheta: 0,
                gratingBPolarR: 0.3, gratingBPolarTheta: 0,
                weightA: 1, weightB: 1, phaseSpeed: 0.1, centreOsc: 0,
                maskType: 'none', maskSize: 1, maskSoftness: 0, invert: 'off'
            }
        },
        {
            name: 'Angular',
            values: {
                gratingCount: 2, wavelength: 0.03, angularFreq: 12, phaseOffset: 0,
                combineMode: 'product', threshold: 0.4,
                gratingAPolarR: 0, gratingAPolarTheta: 0,
                gratingBPolarR: 0.2, gratingBPolarTheta: 0,
                weightA: 1, weightB: 1, phaseSpeed: 0.05, centreOsc: 0,
                maskType: 'circle', maskSize: 0.9, maskSoftness: 0, invert: 'off'
            }
        },
        {
            name: 'Hypnotic',
            values: {
                gratingCount: 3, wavelength: 0.015, angularFreq: 0, phaseOffset: 0,
                combineMode: 'min', threshold: 0.3,
                gratingAPolarR: 0, gratingAPolarTheta: 0,
                gratingBPolarR: 0.4, gratingBPolarTheta: 0,
                weightA: 1, weightB: 0.8, phaseSpeed: 0.2, centreOsc: 0.2,
                maskType: 'none', maskSize: 1, maskSoftness: 0, invert: 'off'
            }
        },
        {
            name: 'Offset Duo',
            values: {
                gratingCount: 2, wavelength: 0.025, angularFreq: 0, phaseOffset: 0,
                combineMode: 'sum', threshold: 0.5,
                gratingAPolarR: 0.2, gratingAPolarTheta: 45,
                gratingBPolarR: 0.2, gratingBPolarTheta: 225,
                weightA: 1, weightB: 1, phaseSpeed: 0.1, centreOsc: 0,
                maskType: 'none', maskSize: 1, maskSoftness: 0, invert: 'off'
            }
        }
    ],
    
    parameters: [
        {
            group: 'Gratings',
            params: [
                {
                    key: 'gratingCount',
                    type: 'slider',
                    label: 'Count',
                    min: 1,
                    max: 4,
                    step: 1,
                    default: 2
                },
                {
                    key: 'wavelength',
                    type: 'slider',
                    label: 'Wavelength',
                    min: 0.005,
                    max: 0.1,
                    step: 0.001,
                    default: 0.02,
                    precision: 3
                },
                {
                    key: 'angularFreq',
                    type: 'slider',
                    label: 'Angular Freq',
                    min: 0,
                    max: 24,
                    step: 1,
                    default: 0
                },
                {
                    key: 'phaseOffset',
                    type: 'slider',
                    label: 'Phase',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 0,
                    precision: 2
                }
            ]
        },
        {
            group: 'Combination',
            params: [
                {
                    key: 'combineMode',
                    type: 'radio',
                    label: 'Mode',
                    options: ['sum', 'product', 'min', 'max'],
                    default: 'sum'
                },
                {
                    key: 'threshold',
                    type: 'slider',
                    label: 'Threshold',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 0.5,
                    precision: 2
                }
            ]
        },
        {
            group: 'Multi-Centre',
            params: [
                {
                    key: 'centreOffset',
                    type: 'slider',
                    label: 'Offset',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 0,
                    precision: 2
                },
                {
                    key: 'weightA',
                    type: 'slider',
                    label: 'Weight A',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 1,
                    precision: 2
                },
                {
                    key: 'weightB',
                    type: 'slider',
                    label: 'Weight B',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 1,
                    precision: 2
                }
            ]
        },
        {
            group: 'Motion',
            params: [
                {
                    key: 'phaseSpeed',
                    type: 'slider',
                    label: 'Phase Speed',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 0.1,
                    precision: 2
                },
                {
                    key: 'centreOsc',
                    type: 'slider',
                    label: 'Centre Osc',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 0,
                    precision: 2
                }
            ]
        },
        {
            group: 'Mask',
            params: [
                {
                    key: 'maskType',
                    type: 'radio',
                    label: 'Type',
                    options: ['none', 'circle', 'triangle', 'square'],
                    default: 'none'
                },
                {
                    key: 'maskSize',
                    type: 'slider',
                    label: 'Size',
                    min: 0,
                    max: 1,
                    step: 0.01,
                    default: 1,
                    precision: 2
                },
                {
                    key: 'maskSoftness',
                    type: 'slider',
                    label: 'Softness',
                    min: 0,
                    max: 0.2,
                    step: 0.01,
                    default: 0,
                    precision: 2
                }
            ]
        },
        {
            group: 'Grating Positions',
            defaultCollapsed: true,
            params: [
                // MOI-04: polar positions for gratings A and B
                { key: 'gratingAPolarR',     type: 'slider', label: 'Grating A Radius',     min: 0, max: 1, step: 0.01, default: 0,   precision: 2 },
                { key: 'gratingAPolarTheta', type: 'slider', label: 'Grating A Angle (°)',   min: 0, max: 360, step: 1, default: 0 },
                { key: 'gratingBPolarR',     type: 'slider', label: 'Grating B Radius',     min: 0, max: 1, step: 0.01, default: 0.3, precision: 2 },
                { key: 'gratingBPolarTheta', type: 'slider', label: 'Grating B Angle (°)',   min: 0, max: 360, step: 1, default: 0 }
            ]
        },
        {
            group: 'Display',
            params: [
                {
                    key: 'invert',
                    type: 'radio',
                    label: 'Invert',
                    options: ['off', 'on'],
                    default: 'off'
                }
            ]
        }
    ],

    draw(ctx, canvas, params, frame) {
        // Sync colourway into params so subsequent worker dispatches get current colors.
        const cw = this.canvas.colourway ?? [];
        params._fgColor = cw.find(c => c.id === 'foreground')?.colour ?? '#ffffff';
        params._bgColor = cw.find(c => c.id === 'background')?.colour ?? '#000000';
        return draw(ctx, canvas, params, frame, cw);
    }
};
