/**
 * Moiré Pattern Script - Interference pattern generator
 * 
 * Generates moiré patterns using radial, angular, and multi-centre gratings.
 * 
 * @script moire
 * @category wave
 * @version 2.0.0
 */

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

function computeGratings(x, y, wavelength, angularFreq, phase, 
                        centreOffset, weightA, weightB, count, mode) {
    const values = [];
    
    // Centre A (origin)
    let gA = radialGrating(x, y, 0, 0, wavelength, phase - 0.25) * weightA;
    if (angularFreq > 0) {
        gA *= angularGrating(x, y, 0, 0, angularFreq, -Math.PI / 2);
    }
    values.push(gA);
    
    // Centre B (offset)
    if (count >= 2 && centreOffset > 0) {
        let gB = radialGrating(x, y, centreOffset, 0, wavelength, phase - 0.25) * weightB;
        if (angularFreq > 0) {
            gB *= angularGrating(x, y, centreOffset, 0, angularFreq, -Math.PI / 2);
        }
        values.push(gB);
    }
    
    // Additional gratings with rotation
    for (let i = 2; i < count; i++) {
        const angle = (i - 1) * Math.PI / count;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const xR = x * cosA + y * sinA;
        const yR = -x * sinA + y * cosA;
        values.push(radialGrating(xR, yR, 0, 0, wavelength, phase - 0.25 + i * 0.1));
    }
    
    // Combine
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
        case 'triangle':
            const ax = Math.abs(x);
            d = Math.max(ax * 0.866 + y * 0.5, -y) - 0.5;
            d = (d + 0.5) / 1;
            break;
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

function draw(ctx, canvas, params, frame) {
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    
    // Parse colors
    const fg = parseColor(params.fgColor || '#ffffff');
    const bg = parseColor(params.bgColor || '#000000');
    const invert = params.invert || false;
    
    // Animation time
    const speed = params.phaseSpeed || 0.1;
    const animationTime = (frame / 60) * speed;
    
    // Grating parameters
    const wavelength = params.wavelength || 0.02;
    const angularFreq = params.angularFreq || 0;
    const phase = (params.phaseOffset || 0) + animationTime;
    const gratingCount = params.gratingCount || 2;
    const combineMode = params.combineMode || 'sum';
    const threshold = params.threshold || 0.5;
    
    // Multi-centre
    const centreOsc = params.centreOsc || 0;
    const centreOffset = (params.centreOffset || 0) + Math.sin(animationTime * 2) * centreOsc;
    const weightA = params.weightA || 1;
    const weightB = params.weightB || 1;
    
    // Mask
    const maskType = (params.maskType || 'none').toLowerCase();
    const maskSize = params.maskSize || 1;
    const maskSoftness = params.maskSoftness || 0;
    
    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            // Normalize to [-1, 1]
            const x = (px / w) * 2 - 1;
            const y = (py / h) * 2 - 1;
            
            // Compute gratings
            let intensity = computeGratings(
                x, y, wavelength, angularFreq, phase,
                centreOffset, weightA, weightB, gratingCount, combineMode
            );
            
            // Apply mask
            const mask = computeMask(x, y, maskType, maskSize, maskSoftness);
            intensity *= mask;
            
            // Threshold
            let on = intensity > threshold;
            if (invert) on = !on;
            
            const color = on ? fg : bg;
            const i = (py * w + px) * 4;
            data[i] = color.r;
            data[i + 1] = color.g;
            data[i + 2] = color.b;
            data[i + 3] = 255;
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

    // ComputeScheduler hints — Tier 2 only (per-pixel imageData draw mode).
    // Reduces pixel count by 75% during slider interaction.
    compute: {
        cost: 'per-pixel',
        interactionScale: 0.5,
        idleDelay: 200,
    },

    canvas: {
        width: 420,
        height: 420,
        context: '2d',
        background: '#000000'
    },
    
    animation: {
        type: 'infinite',
        defaultFps: 30,
        canPrerender: true
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
                gratingCount: 2,
                wavelength: 0.02,
                angularFreq: 0,
                phaseOffset: 0,
                combineMode: 'sum',
                threshold: 0.5,
                centreOffset: 0.3,
                weightA: 1,
                weightB: 1,
                phaseSpeed: 0.1,
                maskType: 'none',
                fgColor: '#ffffff',
                bgColor: '#000000',
                invert: false
            }
        },
        {
            name: 'Angular',
            values: {
                gratingCount: 2,
                wavelength: 0.03,
                angularFreq: 12,
                phaseOffset: 0,
                combineMode: 'product',
                threshold: 0.4,
                centreOffset: 0.2,
                weightA: 1,
                weightB: 1,
                phaseSpeed: 0.05,
                maskType: 'circle',
                maskSize: 0.9,
                fgColor: '#ffffff',
                bgColor: '#000000',
                invert: false
            }
        },
        {
            name: 'Hypnotic',
            values: {
                gratingCount: 3,
                wavelength: 0.015,
                angularFreq: 0,
                phaseOffset: 0,
                combineMode: 'min',
                threshold: 0.3,
                centreOffset: 0.4,
                centreOsc: 0.2,
                weightA: 1,
                weightB: 0.8,
                phaseSpeed: 0.2,
                maskType: 'none',
                fgColor: '#ffffff',
                bgColor: '#000000',
                invert: false
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
                    type: 'dropdown',
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
                    type: 'dropdown',
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
            group: 'Colors',
            params: [
                {
                    key: 'fgColor',
                    type: 'color',
                    label: 'Foreground',
                    default: '#ffffff'
                },
                {
                    key: 'bgColor',
                    type: 'color',
                    label: 'Background',
                    default: '#000000'
                },
                {
                    key: 'invert',
                    type: 'toggle',
                    label: 'Invert',
                    default: false
                }
            ]
        },
        {
            group: 'Canvas',
            params: [
                {
                    key: 'canvasWidth',
                    type: 'slider',
                    label: 'Width',
                    min: 256,
                    max: 1024,
                    step: 64,
                    default: 420
                },
                {
                    key: 'canvasHeight',
                    type: 'slider',
                    label: 'Height',
                    min: 256,
                    max: 1024,
                    step: 64,
                    default: 420
                }
            ]
        }
    ],
    
    draw: draw
};

console.log('✅ Moiré Generator script loaded');
