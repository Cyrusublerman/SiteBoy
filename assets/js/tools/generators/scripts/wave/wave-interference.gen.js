/**
 * Wave Interference Script - Spatial Wave Equation Visualizer
 * 
 * Full equation: I = R(r) + X(x) + Y(y)
 * Each component has two terms plus modulation.
 * 
 * @script wave-interference
 * @category wave
 * @version 2.0.0
 */

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const TWO_PI = Math.PI * 2;

// ═══════════════════════════════════════════════════════════════════
// PRESETS (Landmarks)
// ═══════════════════════════════════════════════════════════════════

const LANDMARKS = [
    { name: '20 Rings (Default)', Ar1: 1, fr1: 20, pr1: 1 },
    { name: '1 Ring', Ar1: 1, fr1: 1, pr1: 1 },
    { name: '3 Rings', Ar1: 1, fr1: 3, pr1: 1 },
    { name: '5 Rings', Ar1: 1, fr1: 5, pr1: 1 },
    { name: '10 Rings', Ar1: 1, fr1: 10, pr1: 1 },
    { name: 'Inverted 5 Rings', Ar1: -1, fr1: 5, pr1: 1 },
    { name: 'Offset Rings', Ar1: 1, fr1: 5, pr1: 1, Or1: 0.3 },
    { name: 'Horizontal Lines', Ay1: 1, fy1: 5, py1: 1 },
    { name: 'Vertical Lines', Ax1: 1, fx1: 5, px1: 1 },
    { name: 'Grid 5×5', Ax1: 1, fx1: 5, px1: 1, Ay1: 1, fy1: 5, py1: 1 },
    { name: 'Moiré Cross', Ax1: 1, fx1: 5, px1: 1, Ay1: 1, fy1: 5.5, py1: 1 },
    { name: 'Rings + Grid', Ar1: 1, fr1: 5, pr1: 1, Ax1: 0.3, fx1: 8, px1: 1, Ay1: 0.3, fy1: 8, py1: 1 },
    { name: 'Complex Interference', Ar1: 1, fr1: 3, pr1: 1, Ar2: 0.5, fr2: 7, pr2: 1, Ax1: 0.3, fx1: 10, px1: 1 }
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
    // R Term 1: Ar1 * (r - Or1)^pr1 * wave(fr1 * r + phi_r1)
    const r1 = r - (p.Or1 || 0);
    const term1 = (p.Ar1 || 0) * safePow(r1, p.pr1 || 1) * waveFunc(TWO_PI * (p.fr1 || 0) * r + (p.phi_r1 || 0), p.wave_r1 === 'cos');
    
    // R Term 2: Ar2 * (r - Or2)^pr2 * wave(fr2 * r + phi_r2)
    const r2 = r - (p.Or2 || 0);
    const term2 = (p.Ar2 || 0) * safePow(r2, p.pr2 || 1) * waveFunc(TWO_PI * (p.fr2 || 0) * r + (p.phi_r2 || 0), p.wave_r2 === 'cos');
    
    let result = term1 + term2;
    
    // R Modulation
    if (Math.abs(p.Mr || 0) > 0.001) {
        const mod1 = waveFunc(TWO_PI * (p.frm1 || 0) * r + (p.phi_rm1 || 0), false);
        const mod2 = waveFunc(TWO_PI * (p.frm2 || 0) * r + (p.phi_rm2 || 0), false);
        result *= (1 + (p.Mr || 0) * (safePow(mod1, p.prm1 || 1) + safePow(mod2, p.prm2 || 1)));
    }
    
    return result;
}

function computeX(x, p) {
    // X Term 1
    const x1 = x - (p.Ox1 || 0);
    const term1 = (p.Ax1 || 0) * safePow(x1, p.px1 || 1) * waveFunc(TWO_PI * (p.fx1 || 0) * x + (p.phi_x1 || 0), p.wave_x1 === 'cos');
    
    // X Term 2
    const x2 = x - (p.Ox2 || 0);
    const term2 = (p.Ax2 || 0) * safePow(x2, p.px2 || 1) * waveFunc(TWO_PI * (p.fx2 || 0) * x + (p.phi_x2 || 0), p.wave_x2 === 'cos');
    
    let result = term1 + term2;
    
    // X Modulation
    if (Math.abs(p.Mx || 0) > 0.001) {
        const mod1 = waveFunc(TWO_PI * (p.fxm1 || 0) * x + (p.phi_xm1 || 0), false);
        const mod2 = waveFunc(TWO_PI * (p.fxm2 || 0) * x + (p.phi_xm2 || 0), false);
        result *= (1 + (p.Mx || 0) * (safePow(mod1, p.pxm1 || 1) + safePow(mod2, p.pxm2 || 1)));
    }
    
    return result;
}

function computeY(y, p) {
    // Y Term 1
    const y1 = y - (p.Oy1 || 0);
    const term1 = (p.Ay1 || 0) * safePow(y1, p.py1 || 1) * waveFunc(TWO_PI * (p.fy1 || 0) * y + (p.phi_y1 || 0), p.wave_y1 === 'cos');
    
    // Y Term 2
    const y2 = y - (p.Oy2 || 0);
    const term2 = (p.Ay2 || 0) * safePow(y2, p.py2 || 1) * waveFunc(TWO_PI * (p.fy2 || 0) * y + (p.phi_y2 || 0), p.wave_y2 === 'cos');
    
    let result = term1 + term2;
    
    // Y Modulation
    if (Math.abs(p.My || 0) > 0.001) {
        const mod1 = waveFunc(TWO_PI * (p.fym1 || 0) * y + (p.phi_ym1 || 0), false);
        const mod2 = waveFunc(TWO_PI * (p.fym2 || 0) * y + (p.phi_ym2 || 0), false);
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
    
    const imageData = ctx.createImageData(W, H);
    const data = imageData.data;
    
    let minI = Infinity, maxI = -Infinity;
    const intensities = new Float32Array(W * H);
    
    // First pass: compute intensities and find range
    let idx = 0;
    for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
            // Normalized coordinates
            let x = (px - cx) / scale;
            let y = (py - cy) / scale;
            
            // Apply rotation
            const xr = x * cosR - y * sinR;
            const yr = x * sinR + y * cosR;
            x = xr;
            y = yr;
            
            // Compute r
            const r = Math.sqrt(x * x + y * y);
            
            // Compute components
            const R = computeR(r, params);
            const X = computeX(x, params);
            const Y = computeY(y, params);
            
            // Combine
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
    
    // Second pass: normalize and write pixels
    const range = maxI - minI || 1;
    for (let i = 0; i < intensities.length; i++) {
        const normalized = (intensities[i] - minI) / range;
        const grey = Math.floor(normalized * 255);
        
        const pixelIdx = i * 4;
        data[pixelIdx] = grey;
        data[pixelIdx + 1] = grey;
        data[pixelIdx + 2] = grey;
        data[pixelIdx + 3] = 255;
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
    version: '2.0.0',

    // ComputeScheduler hints (see blog/docs/guides/standards/compute-scheduler.md)
    // Tier 2: renders at 50% resolution (~25% pixel count) while dragging sliders.
    // Tier 3: worker flag enables off-main-thread pixel computation via computePixels.
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
        animatableParams: ['phi_r1', 'phi_r2', 'phi_x1', 'phi_x2', 'phi_y1', 'phi_y2'],
        defaultFps: 60,
        canPrerender: true
    },
    
    export: {
        png: true,
        svg: true,
        gif: true,
        webm: true,
        sequence: true
    },
    
    presets: LANDMARKS,
    
    parameters: [
        // R(r) - Radial
        {
            group: 'R(r) Term 1',
            params: [
                { key: 'Ar1', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 1, precision: 1 },
                { key: 'fr1', type: 'slider', label: 'Frequency', min: 0, max: 50, step: 0.5, default: 20, precision: 1 },
                { key: 'pr1', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_r1', type: 'slider', label: 'Phase (φ)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Or1', type: 'slider', label: 'Offset', min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'wave_r1', type: 'radio', label: 'Wave', options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'R(r) Term 2',
            params: [
                { key: 'Ar2', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'fr2', type: 'slider', label: 'Frequency', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'pr2', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_r2', type: 'slider', label: 'Phase (φ)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 }
            ],
            defaultCollapsed: true
        },
        {
            group: 'R(r) Modulation',
            params: [
                { key: 'Mr', type: 'slider', label: 'Mod Mix', min: -1, max: 1, step: 0.01, default: 0, precision: 2 },
                { key: 'frm1', type: 'slider', label: 'Freq Mod 1', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'frm2', type: 'slider', label: 'Freq Mod 2', min: 0, max: 50, step: 0.5, default: 0, precision: 1 }
            ],
            defaultCollapsed: true
        },
        // X(x) - Horizontal
        {
            group: 'X(x) Term 1',
            params: [
                { key: 'Ax1', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'fx1', type: 'slider', label: 'Frequency', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'px1', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_x1', type: 'slider', label: 'Phase (φ)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 }
            ],
            defaultCollapsed: true
        },
        {
            group: 'X(x) Term 2',
            params: [
                { key: 'Ax2', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'fx2', type: 'slider', label: 'Frequency', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'px2', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_x2', type: 'slider', label: 'Phase (φ)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 }
            ],
            defaultCollapsed: true
        },
        // Y(y) - Vertical
        {
            group: 'Y(y) Term 1',
            params: [
                { key: 'Ay1', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'fy1', type: 'slider', label: 'Frequency', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'py1', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_y1', type: 'slider', label: 'Phase (φ)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 }
            ],
            defaultCollapsed: true
        },
        {
            group: 'Y(y) Term 2',
            params: [
                { key: 'Ay2', type: 'slider', label: 'Amplitude', min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'fy2', type: 'slider', label: 'Frequency', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'py2', type: 'slider', label: 'Power', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phi_y2', type: 'slider', label: 'Phase (φ)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 }
            ],
            defaultCollapsed: true
        },
        // Global
        {
            group: 'View',
            params: [
                { key: 'scale', type: 'slider', label: 'Scale', min: 50, max: 500, step: 10, default: 300 },
                { key: 'rotation', type: 'slider', label: 'Rotation', min: 0, max: 360, step: 1, default: 0 },
                { key: 'blendMode', type: 'radio', label: 'Blend', options: ['sum', 'multiply'], default: 'sum' }
            ]
        },
        {
            group: 'Canvas',
            params: [
                { key: 'canvasWidth', type: 'slider', label: 'Width', min: 256, max: 1024, step: 64, default: 512 },
                { key: 'canvasHeight', type: 'slider', label: 'Height', min: 256, max: 1024, step: 64, default: 512 }
            ]
        }
    ],
    
    draw,

    /**
     * Tier 3 worker function — pure, transferable-safe.
     * Receives an empty ImageData whose buffer has been transferred to the
     * worker.  Must return the same ImageData (or a new one of identical size)
     * after filling the pixel data.
     *
     * All helper functions used here (safePow, waveFunc, computeR/X/Y) are
     * defined in the module scope and are serialised along with this function
     * string by ComputeScheduler.
     *
     * IMPORTANT: No DOM, no canvas context, no closures over module state.
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
            let v = (p.Ar1 || 0) * _safePow(r1, p.pr1 || 1) * _wave(TWO_PI * (p.fr1 || 0) * r + (p.phi_r1 || 0), p.wave_r1 === 'cos');
            const r2 = r - (p.Or2 || 0);
            v += (p.Ar2 || 0) * _safePow(r2, p.pr2 || 1) * _wave(TWO_PI * (p.fr2 || 0) * r + (p.phi_r2 || 0), p.wave_r2 === 'cos');
            if (Math.abs(p.Mr || 0) > 0.001) {
                const m1 = _wave(TWO_PI * (p.frm1 || 0) * r + (p.phi_rm1 || 0), false);
                const m2 = _wave(TWO_PI * (p.frm2 || 0) * r + (p.phi_rm2 || 0), false);
                v *= (1 + (p.Mr || 0) * (_safePow(m1, p.prm1 || 1) + _safePow(m2, p.prm2 || 1)));
            }
            return v;
        }

        function _X(x, p) {
            const x1 = x - (p.Ox1 || 0);
            let v = (p.Ax1 || 0) * _safePow(x1, p.px1 || 1) * _wave(TWO_PI * (p.fx1 || 0) * x + (p.phi_x1 || 0), p.wave_x1 === 'cos');
            const x2 = x - (p.Ox2 || 0);
            v += (p.Ax2 || 0) * _safePow(x2, p.px2 || 1) * _wave(TWO_PI * (p.fx2 || 0) * x + (p.phi_x2 || 0), p.wave_x2 === 'cos');
            if (Math.abs(p.Mx || 0) > 0.001) {
                const m1 = _wave(TWO_PI * (p.fxm1 || 0) * x + (p.phi_xm1 || 0), false);
                const m2 = _wave(TWO_PI * (p.fxm2 || 0) * x + (p.phi_xm2 || 0), false);
                v *= (1 + (p.Mx || 0) * (_safePow(m1, p.pxm1 || 1) + _safePow(m2, p.pxm2 || 1)));
            }
            return v;
        }

        function _Y(y, p) {
            const y1 = y - (p.Oy1 || 0);
            let v = (p.Ay1 || 0) * _safePow(y1, p.py1 || 1) * _wave(TWO_PI * (p.fy1 || 0) * y + (p.phi_y1 || 0), p.wave_y1 === 'cos');
            const y2 = y - (p.Oy2 || 0);
            v += (p.Ay2 || 0) * _safePow(y2, p.py2 || 1) * _wave(TWO_PI * (p.fy2 || 0) * y + (p.phi_y2 || 0), p.wave_y2 === 'cos');
            if (Math.abs(p.My || 0) > 0.001) {
                const m1 = _wave(TWO_PI * (p.fym1 || 0) * y + (p.phi_ym1 || 0), false);
                const m2 = _wave(TWO_PI * (p.fym2 || 0) * y + (p.phi_ym2 || 0), false);
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

console.log('✅ Wave Interference script loaded');
