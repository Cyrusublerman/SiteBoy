/**
 * Lissajous Curves Script - Parametric harmonic curves
 * 
 * Complex reference script demonstrating advanced parameter configuration.
 * Independent X and Y parametric equations with modulation support.
 * 
 * @script lissajous
 * @category parametric
 * @version 1.0.0
 */

import { safePow, TWO_PI } from '../../shared/evaluation.js';

// Signed power: preserves sign, applies exponent to magnitude
function signedPow(v, p) {
    if (Math.abs(p - 1) < 1e-9) return v;
    return Math.sign(v) * safePow(Math.abs(v), p);
}

// Shorthand for preset defaults (fills in all params not explicitly set)
function preset(name, overrides) {
    return {
        Ax1: 1,  wx1: 1,  px1: 1, phi_x1: 0,
        Ax2: 0,  wx2: 1,  px2: 1, phi_x2: 0,
        Mx: 0,   wxm1: 1, pxm1: 1, phi_xm1: 0, wxm2: 1, pxm2: 1, phi_xm2: 0,
        Ay1: 1,  wy1: 1,  py1: 1, phi_y1: 0,
        Ay2: 0,  wy2: 1,  py2: 1, phi_y2: 0,
        My: 0,   wym1: 1, pym1: 1, phi_ym1: 0, wym2: 1, pym2: 1, phi_ym2: 0,
        scale: 120, rotation: 0, points: 20000,
        name,
        ...overrides
    };
}

/**
 * Full preset set matching the original Lissajous-2 reference tool.
 *
 * Formula: X = cos-based, Y = sin-based.
 * Circle: x=cos(t), y=sin(t) — no phase offset needed.
 * Rosette (1:3): x=cos(t)−cos(3t), y=sin(t)−sin(3t).
 * High-frequency presets use points: 40000 for density.
 */
const LANDMARKS = [
    // --- Simple forms ---
    preset("Circle",                        {}),
    preset("Rosette (1:3)",                 { Ax2: -1, wx2: 3,   Ay2: -1, wy2: 3 }),
    preset("Rosette (1:5)",                 { Ax2: -1, wx2: 5,   Ay2: -1, wy2: 5 }),
    preset("Dense Rosette (1:10)",          { Ax2: -1, wx2: 10,  Ay2: -1, wy2: 10 }),
    preset("Offset Loop (1:2:3)",           { Ax2: -1, wx2: 2,   Ay2: -1, wy2: 3 }),
    preset("Involute Rosette (1:3)",        { Ax2:  1, wx2: 3,   Ay2: -1, wy2: 3 }),
    preset("Involute Rosette (1:5)",        { Ax2:  1, wx2: 5,   Ay2: -1, wy2: 5 }),
    // --- Asymmetric flows ---
    preset("Asymmetric Flow (3:5)",         { wx1: 3, Ax2: -1, wx2: 5,            Ay2: -1, wy2: 5 }),
    preset("Asymmetric Flow (3:5:6)",       { wx1: 3, Ax2: -1, wx2: 5,            Ay2: -1, wy2: 6 }),
    preset("Asymmetric Flow (1:5:7)",       {         Ax2: -1, wx2: 5,            Ay2: -1, wy2: 7 }),
    preset("Asymmetric Weave (200hz)",      {         Ax2: -1, wx2: 100,          Ay2: -1, wy2: 200, points: 40000 }),
    // --- Spiro / cubic ---
    preset("Spiroform (3:5)",               { wx1: 3, Ax2: -1, wx2: 5, wy1: 3, Ay2: -1, wy2: 5 }),
    preset("Cubic Star (1:2)",              { Ax2: -1, wx2: 2,  px2: 3,  Ay2: -1, wy2: 2,   py2: 3 }),
    preset("Cubic Spiro (1:7)",             { Ax2: -1, wx2: 7,  px2: 3,  Ay2: -1, wy2: 7,   py2: 3 }),
    preset("Cubic Weave (100hz)",           { px1: 3, Ax2: -1, wx2: 100, px2: 3, py1: 3, Ay2: -1, wy2: 100, py2: 3, points: 40000 }),
    preset("Cubic Filament (180hz)",        { Ax2: -1, wx2: 180, px2: 3,  Ay2: -1, wy2: 180, py2: 3, points: 40000 }),
    preset("Cubic Static (550hz)",          { Ax2: -1, wx2: 550, px2: 3,  Ay2: -1, wy2: 550, py2: 3, points: 40000 }),
    // --- Quintic ---
    preset("Quintic Filament (250hz)",      { Ax2: -1, wx2: 250, px2: 5,  Ay2: -1, wy2: 250, py2: 3, points: 40000 }),
    preset("Quintic Static (500hz)",        { Ax2: -1, wx2: 500, px2: 5,  Ay2: -1, wy2: 500, py2: 3, points: 40000 }),
    // --- Modulated / woven ---
    preset("Woven Web (80hz)",              { Mx: -1, wxm1: 1, wxm2: 80,  Ay2: -1, wy2: 80 }),
    preset("Woven Bloom (120hz)",           { Ax1: 2, Mx: -1, wxm1: 1, wxm2: 120, My: -1, wym1: 2, wym2: 120 }),
    preset("Woven Bloom (120hz) alt",       { Ax1: 2, Mx: -1, wxm1: 1, wxm2: 120, My: -1, wym1: 2, wym2: 120, Ay1: 1.2 }),
    preset("Modulated Ring (60hz)",         { wx1: 60, wy1: 60, Mx: -1, wxm1: 60, wxm2: 1, Ay2: -1, wy2: 1 }),
    preset("Fine Web (80hz)",               { Ax1: 0.1, Mx: -1, wxm1: 1, wxm2: 80, Ay2: -1, wy2: 80 }),
    preset("Warped Field (100hz)",          { Mx: -1, wxm1: 100, wxm2: 2, Ay2: -1, wy2: 100 }),
    // --- Complex interference ---
    preset("Interference Pattern (200hz)",  { Ax1: 1.7, Mx: -1, wxm1: 2,  wxm2: 200, Ay1: 1.2, My: -1, wym1: 2,  wym2: 200 }),
    preset("Interference Pattern (260hz)",  { Ax1: 1.7, Mx: -1, wxm1: 260, wxm2: 1,  Ay1: 1.2, My: -1, wym1: 260, wym2: 2 }),
    preset("Complex Interference (300hz)",  { Ax1: 1.7, wx1: 2, Mx: -1, wxm1: 75, wxm2: 75, Ay1: 1.2, wy1: 2, My: -1, wym1: 2, wym2: 300 }),
];

/**
 * Evaluate parametric equation at parameter t.
 *
 * X = Ax1·cos^px1(wx1·t + φx1) + Ax2·cos^px2(wx2·t + φx2)
 *   + Mx · cos^pxm1(wxm1·t + φxm1) · sin^pxm2(wxm2·t + φxm2)
 *
 * Y = Ay1·sin^py1(wy1·t + φy1) + Ay2·sin^py2(wy2·t + φy2)
 *   + My · sin^pym1(wym1·t + φym1) · cos^pym2(wym2·t + φym2)
 *
 * X uses cosine, Y uses sine — orthogonal by default.
 * Power (p≠1) distorts the waveform: p<1 rounds, p>1 sharpens.
 * Modulation term (Mx/My) adds a product of two harmonics.
 */
function evaluate(t, p) {
    // X: cosine-based
    const x1  = p.Ax1 * signedPow(Math.cos(p.wx1  * t + p.phi_x1),  p.px1);
    const x2  = p.Ax2 * signedPow(Math.cos(p.wx2  * t + p.phi_x2),  p.px2);
    const xm  = p.Mx  * signedPow(Math.cos(p.wxm1 * t + p.phi_xm1), p.pxm1)
                      * signedPow(Math.sin(p.wxm2 * t + p.phi_xm2), p.pxm2);
    const x = x1 + x2 + xm;

    // Y: sine-based (naturally 90° ahead of cosine)
    const y1  = p.Ay1 * signedPow(Math.sin(p.wy1  * t + p.phi_y1),  p.py1);
    const y2  = p.Ay2 * signedPow(Math.sin(p.wy2  * t + p.phi_y2),  p.py2);
    const ym  = p.My  * signedPow(Math.sin(p.wym1 * t + p.phi_ym1), p.pym1)
                      * signedPow(Math.cos(p.wym2 * t + p.phi_ym2), p.pym2);
    const y = y1 + y2 + ym;

    // Global scale and rotation (rotation stored in degrees)
    const rot = (p.rotation || 0) * Math.PI / 180;
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);
    const xs = x * p.scale;
    const ys = y * p.scale;
    return {
        x: xs * cosR - ys * sinR,
        y: xs * sinR + ys * cosR
    };
}

/**
 * Draw function
 */
function draw(ctx, canvas, params, frame) {
    const W = canvas.width;
    const H = canvas.height;
    const centerX = W / 2;
    const centerY = H / 2;
    
    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    
    // Draw curve
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    const points = params.points;
    let firstPoint = true;
    
    for (let i = 0; i < points; i++) {
        const t = (i / points) * TWO_PI;
        const pt = evaluate(t, params);
        
        const px = centerX + pt.x;
        const py = centerY + pt.y;
        
        if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
        } else {
            ctx.lineTo(px, py);
        }
    }
    
    ctx.stroke();
}

/**
 * Script configuration
 */
export const SCRIPT_CONFIG = {
    id: 'lissajous',
    title: 'Lissajous Curves',
    category: 'parametric',
    description: 'Parametric harmonic curves with independent X and Y equations, each supporting two terms and modulation.',
    version: '1.0.0',
    
    canvas: {
        width: 800,
        height: 800,
        context: '2d',
        background: '#000000'
    },
    
    parameters: [
        {
            group: 'X-Axis Term 1',
            params: [
                { key: 'Ax1', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 1, precision: 1 },
                { key: 'wx1', type: 'slider', label: 'Frequency', min: -300, max: 300, step: 1, default: 1 },
                { key: 'px1', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_x1', type: 'slider', label: 'Phase (φ)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ]
        },
        {
            group: 'X-Axis Term 2',
            params: [
                { key: 'Ax2', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'wx2', type: 'slider', label: 'Frequency', min: -300, max: 300, step: 1, default: 1 },
                { key: 'px2', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_x2', type: 'slider', label: 'Phase (φ)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'X-Axis Modulation',
            params: [
                { key: 'Mx', type: 'slider', label: 'Modulation Amount', min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'wxm1', type: 'slider', label: 'Freq cos (m1)', min: 0, max: 600, step: 1, default: 1 },
                { key: 'pxm1', type: 'slider', label: 'Power cos (m1)', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_xm1', type: 'slider', label: 'Phase cos (m1)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'wxm2', type: 'slider', label: 'Freq sin (m2)', min: 0, max: 600, step: 1, default: 1 },
                { key: 'pxm2', type: 'slider', label: 'Power sin (m2)', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_xm2', type: 'slider', label: 'Phase sin (m2)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'Y-Axis Term 1',
            params: [
                { key: 'Ay1', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 1, precision: 1 },
                { key: 'wy1', type: 'slider', label: 'Frequency', min: -300, max: 300, step: 1, default: 1 },
                { key: 'py1', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_y1', type: 'slider', label: 'Phase (φ)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ]
        },
        {
            group: 'Y-Axis Term 2',
            params: [
                { key: 'Ay2', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'wy2', type: 'slider', label: 'Frequency', min: -300, max: 300, step: 1, default: 1 },
                { key: 'py2', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_y2', type: 'slider', label: 'Phase (φ)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'Y-Axis Modulation',
            params: [
                { key: 'My', type: 'slider', label: 'Modulation Amount', min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'wym1', type: 'slider', label: 'Freq sin (m1)', min: 0, max: 600, step: 1, default: 1 },
                { key: 'pym1', type: 'slider', label: 'Power sin (m1)', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_ym1', type: 'slider', label: 'Phase sin (m1)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'wym2', type: 'slider', label: 'Freq cos (m2)', min: 0, max: 600, step: 1, default: 1 },
                { key: 'pym2', type: 'slider', label: 'Power cos (m2)', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_ym2', type: 'slider', label: 'Phase cos (m2)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'Global',
            params: [
                { key: 'scale', type: 'slider', label: 'Scale', min: 20, max: 300, step: 5, default: 120 },
                { key: 'rotation', type: 'slider', label: 'Rotation (°)', min: 0, max: 360, step: 1, default: 0 },
                { key: 'points', type: 'slider', label: 'Points', min: 1000, max: 80000, step: 1000, default: 20000 },
            ]
        }
    ],
    
    presets: LANDMARKS,
    
    animation: {
        type: 'parametric',
        defaultSpeed: 1,
        defaultFps: 60,

        // Each entry: { key, label, mode, rate, min?, max? }
        //
        // mode: 'phase'     — linearly drifts and wraps within the param's range.
        //                     Rate 1 = one full wrap per second at global speed 1.
        //                     Best for φ params (continuously rotating phase).
        //
        // mode: 'oscillate' — sinusoidally bounces between min and max.
        //                     Rate 1 = one full swing every ~4 s at global speed 1.
        //                     Best for amplitudes, frequencies, modulation.
        //
        // rate:  per-param speed multiplier on top of the global Speed slider.
        //        Use smaller values (0.1–0.5) for slow, majestic sweeps;
        //        larger values (2–5) for fast shimmering effects.
        animatableParams: [
            // --- Phases (drift mode — continuous rotation) ---
            { key: 'phi_x1', label: 'φx1', mode: 'phase',     rate: 1.0  },
            { key: 'phi_y1', label: 'φy1', mode: 'phase',     rate: 1.0  },
            { key: 'phi_x2', label: 'φx2', mode: 'phase',     rate: 1.0  },
            { key: 'phi_y2', label: 'φy2', mode: 'phase',     rate: 1.0  },

            // --- Amplitudes (oscillate — breathe in and out) ---
            { key: 'Ax1', label: 'Ax1', mode: 'oscillate', rate: 0.3, min: 0, max: 2  },
            { key: 'Ay1', label: 'Ay1', mode: 'oscillate', rate: 0.3, min: 0, max: 2  },
            { key: 'Ax2', label: 'Ax2', mode: 'oscillate', rate: 0.25, min: -1, max: 1 },
            { key: 'Ay2', label: 'Ay2', mode: 'oscillate', rate: 0.25, min: -1, max: 1 },

            // --- Modulation (oscillate — sweeping interference) ---
            { key: 'Mx',  label: 'Mx',  mode: 'oscillate', rate: 0.2, min: -1, max: 1 },
            { key: 'My',  label: 'My',  mode: 'oscillate', rate: 0.2, min: -1, max: 1 },

            // --- Scale (oscillate — gentle zoom pulse) ---
            { key: 'scale', label: 'scale', mode: 'oscillate', rate: 0.15, min: 60, max: 200 },
        ]
    },
    
    export: {
        png: true,
        svg: false,
        gif: true,
        webm: true,
        sequence: true
    },
    
    draw: draw
};

console.log('✅ Lissajous script loaded');

