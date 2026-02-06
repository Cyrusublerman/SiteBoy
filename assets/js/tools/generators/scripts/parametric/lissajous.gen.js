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

import { safePow, TWO_PI, wrap } from '../../shared/evaluation.js';

/**
 * Landmark presets (extracted from original tool)
 */
const LANDMARKS = [
    { name: "Circle (1:1)", Ax1: 1, wx1: 1, px1: 1, phi_x1: 0, Ax2: 0, wx2: 1, px2: 1, phi_x2: 0, Mx: 0, wxm1: 0, pxm1: 1, phi_xm1: 0, wxm2: 0, pxm2: 1, phi_xm2: 0, Ay1: 1, wy1: 1, py1: 1, phi_y1: 1.57, Ay2: 0, wy2: 1, py2: 1, phi_y2: 0, My: 0, wym1: 0, pym1: 1, phi_ym1: 0, wym2: 0, pym2: 1, phi_ym2: 0, scale: 120, rotation: 0, points: 20000 },
    { name: "Rosette (1:3)", Ax1: 1, wx1: 1, px1: 1, phi_x1: 0, Ax2: -1, wx2: 3, px2: 1, phi_x2: 0, Mx: 0, wxm1: 0, pxm1: 1, phi_xm1: 0, wxm2: 0, pxm2: 1, phi_xm2: 0, Ay1: 1, wy1: 1, py1: 1, phi_y1: 0, Ay2: -1, wy2: 3, py2: 1, phi_y2: 0, My: 0, wym1: 0, pym1: 1, phi_ym1: 0, wym2: 0, pym2: 1, phi_ym2: 0, scale: 120, rotation: 0, points: 20000 },
    { name: "Rosette (1:5)", Ax1: 1, wx1: 1, px1: 1, phi_x1: 0, Ax2: -1, wx2: 5, px2: 1, phi_x2: 0, Mx: 0, wxm1: 0, pxm1: 1, phi_xm1: 0, wxm2: 0, pxm2: 1, phi_xm2: 0, Ay1: 1, wy1: 1, py1: 1, phi_y1: 0, Ay2: -1, wy2: 5, py2: 1, phi_y2: 0, My: 0, wym1: 0, pym1: 1, phi_ym1: 0, wym2: 0, pym2: 1, phi_ym2: 0, scale: 120, rotation: 0, points: 20000 },
    { name: "Dense Rosette (1:10)", Ax1: 1, wx1: 1, px1: 1, phi_x1: 0, Ax2: -1, wx2: 10, px2: 1, phi_x2: 0, Mx: 0, wxm1: 0, pxm1: 1, phi_xm1: 0, wxm2: 0, pxm2: 1, phi_xm2: 0, Ay1: 1, wy1: 1, py1: 1, phi_y1: 0, Ay2: -1, wy2: 10, py2: 1, phi_y2: 0, My: 0, wym1: 0, pym1: 1, phi_ym1: 0, wym2: 0, pym2: 1, phi_ym2: 0, scale: 120, rotation: 0, points: 20000 },
    { name: "Asymmetric Flow (3:5)", Ax1: 1, wx1: 3, px1: 1, phi_x1: 0, Ax2: -1, wx2: 5, px2: 1, phi_x2: 0, Mx: 0, wxm1: 0, pxm1: 1, phi_xm1: 0, wxm2: 0, pxm2: 1, phi_xm2: 0, Ay1: 1, wy1: 1, py1: 1, phi_y1: 0, Ay2: -1, wy2: 5, py2: 1, phi_y2: 0, My: 0, wym1: 0, pym1: 1, phi_ym1: 0, wym2: 0, pym2: 1, phi_ym2: 0, scale: 120, rotation: 0, points: 20000 },
    { name: "Cubic Star (1:2)", Ax1: 1, wx1: 1, px1: 1, phi_x1: 0, Ax2: -1, wx2: 2, px2: 3, phi_x2: 0, Mx: 0, wxm1: 0, pxm1: 1, phi_xm1: 0, wxm2: 0, pxm2: 1, phi_xm2: 0, Ay1: 1, wy1: 1, py1: 1, phi_y1: 0, Ay2: -1, wy2: 2, py2: 3, phi_y2: 0, My: 0, wym1: 0, pym1: 1, phi_ym1: 0, wym2: 0, pym2: 1, phi_ym2: 0, scale: 120, rotation: 0, points: 20000 },
    { name: "Woven Bloom (120hz)", Ax1: 2, wx1: 1, px1: 1, phi_x1: 0, Ax2: 0, wx2: 1, px2: 1, phi_x2: 0, Mx: -1, wxm1: 1, pxm1: 1, phi_xm1: 0, wxm2: 120, pxm2: 1, phi_xm2: 0, Ay1: 1, wy1: 1, py1: 1, phi_y1: 0, Ay2: 0, wy2: 1, py2: 1, phi_y2: 0, My: -1, wym1: 2, pym1: 1, phi_ym1: 0, wym2: 120, pym2: 1, phi_ym2: 0, scale: 120, rotation: 0, points: 20000 },
];

/**
 * Evaluate parametric equation at parameter t
 */
function evaluate(t, p) {
    // X equation: X = Ax1·(wx1·t)^px1·cos(wx1·t + φx1) + Ax2·(wx2·t)^px2·cos(wx2·t + φx2)
    const t_x1 = wrap(p.wx1 * t + p.phi_x1, -Math.PI, Math.PI);
    const term_x1 = p.Ax1 * safePow(Math.abs(t_x1), p.px1) * Math.cos(t_x1);
    
    const t_x2 = wrap(p.wx2 * t + p.phi_x2, -Math.PI, Math.PI);
    const term_x2 = p.Ax2 * safePow(Math.abs(t_x2), p.px2) * Math.cos(t_x2);
    
    let x = term_x1 + term_x2;
    
    // X modulation (if Mx != 0)
    if (Math.abs(p.Mx) > 0.001) {
        const t_xm1 = wrap(p.wxm1 * t + p.phi_xm1, -Math.PI, Math.PI);
        const mod_x1 = safePow(Math.abs(t_xm1), p.pxm1) * Math.cos(t_xm1);
        
        const t_xm2 = wrap(p.wxm2 * t + p.phi_xm2, -Math.PI, Math.PI);
        const mod_x2 = safePow(Math.abs(t_xm2), p.pxm2) * Math.cos(t_xm2);
        
        x *= (1 + p.Mx * (mod_x1 + mod_x2));
    }
    
    // Y equation (same structure as X)
    const t_y1 = wrap(p.wy1 * t + p.phi_y1, -Math.PI, Math.PI);
    const term_y1 = p.Ay1 * safePow(Math.abs(t_y1), p.py1) * Math.cos(t_y1);
    
    const t_y2 = wrap(p.wy2 * t + p.phi_y2, -Math.PI, Math.PI);
    const term_y2 = p.Ay2 * safePow(Math.abs(t_y2), p.py2) * Math.cos(t_y2);
    
    let y = term_y1 + term_y2;
    
    // Y modulation (if My != 0)
    if (Math.abs(p.My) > 0.001) {
        const t_ym1 = wrap(p.wym1 * t + p.phi_ym1, -Math.PI, Math.PI);
        const mod_y1 = safePow(Math.abs(t_ym1), p.pym1) * Math.cos(t_ym1);
        
        const t_ym2 = wrap(p.wym2 * t + p.phi_ym2, -Math.PI, Math.PI);
        const mod_y2 = safePow(Math.abs(t_ym2), p.pym2) * Math.cos(t_ym2);
        
        y *= (1 + p.My * (mod_y1 + mod_y2));
    }
    
    // Apply global scale and rotation
    const cosR = Math.cos(p.rotation);
    const sinR = Math.sin(p.rotation);
    const xScaled = x * p.scale;
    const yScaled = y * p.scale;
    
    return {
        x: xScaled * cosR - yScaled * sinR,
        y: xScaled * sinR + yScaled * cosR
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
                { key: 'Ax1', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.01, default: 1, precision: 2 },
                { key: 'wx1', type: 'slider', label: 'Frequency', min: -300, max: 300, step: 1, default: 1 },
                { key: 'px1', type: 'slider', label: 'Power', min: 0.1, max: 5, step: 0.01, default: 1, precision: 2 },
                { key: 'phi_x1', type: 'slider', label: 'Phase (φ)', min: -Math.PI, max: Math.PI, step: 0.01, default: 0, precision: 2 },
            ]
        },
        {
            group: 'X-Axis Term 2',
            params: [
                { key: 'Ax2', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.01, default: 0, precision: 2 },
                { key: 'wx2', type: 'slider', label: 'Frequency', min: -300, max: 300, step: 1, default: 1 },
                { key: 'px2', type: 'slider', label: 'Power', min: 0.1, max: 5, step: 0.01, default: 1, precision: 2 },
                { key: 'phi_x2', type: 'slider', label: 'Phase (φ)', min: -Math.PI, max: Math.PI, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'X-Axis Modulation',
            params: [
                { key: 'Mx', type: 'slider', label: 'Modulation Mix', min: -1, max: 1, step: 0.01, default: 0, precision: 2 },
                { key: 'wxm1', type: 'slider', label: 'Freq Mod 1', min: 0, max: 300, step: 1, default: 0 },
                { key: 'pxm1', type: 'slider', label: 'Power Mod 1', min: 0.1, max: 5, step: 0.01, default: 1, precision: 2 },
                { key: 'phi_xm1', type: 'slider', label: 'Phase Mod 1', min: -Math.PI, max: Math.PI, step: 0.01, default: 0, precision: 2 },
                { key: 'wxm2', type: 'slider', label: 'Freq Mod 2', min: 0, max: 300, step: 1, default: 0 },
                { key: 'pxm2', type: 'slider', label: 'Power Mod 2', min: 0.1, max: 5, step: 0.01, default: 1, precision: 2 },
                { key: 'phi_xm2', type: 'slider', label: 'Phase Mod 2', min: -Math.PI, max: Math.PI, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'Y-Axis Term 1',
            params: [
                { key: 'Ay1', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.01, default: 1, precision: 2 },
                { key: 'wy1', type: 'slider', label: 'Frequency', min: -300, max: 300, step: 1, default: 1 },
                { key: 'py1', type: 'slider', label: 'Power', min: 0.1, max: 5, step: 0.01, default: 1, precision: 2 },
                { key: 'phi_y1', type: 'slider', label: 'Phase (φ)', min: -Math.PI, max: Math.PI, step: 0.01, default: 1.57, precision: 2 },
            ]
        },
        {
            group: 'Y-Axis Term 2',
            params: [
                { key: 'Ay2', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.01, default: 0, precision: 2 },
                { key: 'wy2', type: 'slider', label: 'Frequency', min: -300, max: 300, step: 1, default: 1 },
                { key: 'py2', type: 'slider', label: 'Power', min: 0.1, max: 5, step: 0.01, default: 1, precision: 2 },
                { key: 'phi_y2', type: 'slider', label: 'Phase (φ)', min: -Math.PI, max: Math.PI, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'Y-Axis Modulation',
            params: [
                { key: 'My', type: 'slider', label: 'Modulation Mix', min: -1, max: 1, step: 0.01, default: 0, precision: 2 },
                { key: 'wym1', type: 'slider', label: 'Freq Mod 1', min: 0, max: 300, step: 1, default: 0 },
                { key: 'pym1', type: 'slider', label: 'Power Mod 1', min: 0.1, max: 5, step: 0.01, default: 1, precision: 2 },
                { key: 'phi_ym1', type: 'slider', label: 'Phase Mod 1', min: -Math.PI, max: Math.PI, step: 0.01, default: 0, precision: 2 },
                { key: 'wym2', type: 'slider', label: 'Freq Mod 2', min: 0, max: 300, step: 1, default: 0 },
                { key: 'pym2', type: 'slider', label: 'Power Mod 2', min: 0.1, max: 5, step: 0.01, default: 1, precision: 2 },
                { key: 'phi_ym2', type: 'slider', label: 'Phase Mod 2', min: -Math.PI, max: Math.PI, step: 0.01, default: 0, precision: 2 },
            ],
            defaultCollapsed: true
        },
        {
            group: 'Global',
            params: [
                { key: 'scale', type: 'slider', label: 'Scale', min: 1, max: 500, step: 1, default: 120 },
                { key: 'rotation', type: 'slider', label: 'Rotation', min: -Math.PI, max: Math.PI, step: 0.01, default: 0, precision: 2 },
                { key: 'points', type: 'slider', label: 'Points', min: 100, max: 50000, step: 100, default: 20000 },
            ]
        }
    ],
    
    presets: LANDMARKS,
    
    animation: {
        type: 'parametric',
        animatableParams: ['phi_x1', 'phi_x2', 'phi_y1', 'phi_y2'],
        defaultSpeed: 1,
        defaultFps: 60
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

