/**
 * Wave Interference — Unified Generator
 *
 * Merges three former scripts under a single renderer axis:
 *   equations   — spatial wave equation visualiser   (former wave-interference)
 *   normal-map  — orbiting sources, surface-normal colour (former p5-wave-interference)
 *   complex-ops — complex-number wave operators, phase HSL  (former p5-wave-colour)
 *
 * @script wave-interference
 * @category wave
 * @version 3.0.0
 */

import '../../../../shared/algorithms/core/math-utils.js';

// ═══════════════════════════════════════════════════════════════════
// COMPLEX-OPS MODE — arithmetic primitives
// ═══════════════════════════════════════════════════════════════════

class _Complex {
    constructor(re = 0, im = 0) { this.re = re; this.im = im; }
    static fromPolar(mag, phase) { return new _Complex(mag * Math.cos(phase), mag * Math.sin(phase)); }
    get magnitude() { return Math.sqrt(this.re * this.re + this.im * this.im); }
    get phase()     { return Math.atan2(this.im, this.re); }
    add(o)      { return new _Complex(this.re + o.re, this.im + o.im); }
    multiply(o) { return new _Complex(this.re * o.re - this.im * o.im, this.re * o.im + this.im * o.re); }
}

class _Vector3 {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
    normalize() { const m = this.magnitude || 1; return new _Vector3(this.x / m, this.y / m, this.z / m); }
    dot(o) { return this.x * o.x + this.y * o.y + this.z * o.z; }
}

class _WaveOps {
    static add(s, w)      { return s.add(w); }
    static multiply(s, w) { return s.multiply(w); }
    static power(s, w) {
        const mag = s.magnitude + 0.001;
        return _Complex.fromPolar(Math.pow(mag, 1 + 0.5 * w.re), s.phase);
    }
    static rotate(s, w) {
        const a = w.re * Math.PI, cos = Math.cos(a), sin = Math.sin(a);
        return new _Complex(s.re * cos - s.im * sin, s.re * sin + s.im * cos);
    }
    static mobius(s, w) {
        const a = new _Complex(1, w.im * 0.5), b = new _Complex(w.re * 0.3, 0);
        const c = new _Complex(0.1 * w.im, 0), d = new _Complex(1, 0);
        const num = a.multiply(s).add(b), den = c.multiply(s).add(d);
        const dm2 = den.re * den.re + den.im * den.im + 0.001;
        return new _Complex((num.re * den.re + num.im * den.im) / dm2, (num.im * den.re - num.re * den.im) / dm2);
    }
    static fold(s, w) {
        const thr = 0.5 + 0.4 * Math.abs(w.re);
        let re = s.re, im = s.im;
        for (let i = 0; i < 4; i++) {
            if (Math.abs(re) > thr) re = re > 0 ? 2 * thr - re : -2 * thr - re;
            if (Math.abs(im) > thr) im = im > 0 ? 2 * thr - im : -2 * thr - im;
        }
        return new _Complex(re, im);
    }
    static spiral(s, w) { const m = s.magnitude + 0.001; return _Complex.fromPolar(m, s.phase + Math.log(m) * w.re * 2); }
    static beat(s, w)   { return s.multiply(_Complex.fromPolar(1, w.re * w.re * 10)); }
    static get(name) {
        return { add: _WaveOps.add, multiply: _WaveOps.multiply, power: _WaveOps.power, rotate: _WaveOps.rotate,
                 mobius: _WaveOps.mobius, fold: _WaveOps.fold, spiral: _WaveOps.spiral, beat: _WaveOps.beat }[name] || _WaveOps.add;
    }
}

const _FAMILIES  = { smooth: ['add', 'rotate', 'spiral'], harsh: ['multiply', 'power', 'fold'], warp: ['mobius', 'beat'] };
const _ALL_OPS   = ['add', 'multiply', 'power', 'rotate', 'mobius', 'fold', 'spiral', 'beat'];

function _seededRand(seed) {
    seed = ((seed >>> 16) ^ seed) * 0x45d9f3b | 0;
    seed = ((seed >>> 16) ^ seed) * 0x45d9f3b | 0;
    return ((seed >>> 16) ^ seed >>> 0) / 4294967296;
}
function _pickNextOp(current, seed) {
    const fam = Object.entries(_FAMILIES).find(([, ops]) => ops.includes(current))?.[0] || 'smooth';
    const stay = _seededRand(seed) < 0.7;
    let cands = stay ? _FAMILIES[fam].filter(o => o !== current) : _ALL_OPS.filter(o => !_FAMILIES[fam]?.includes(o));
    if (!cands.length) cands = _ALL_OPS.filter(o => o !== current);
    return cands[Math.floor(_seededRand(seed + 7919) * cands.length)];
}
function _lerpPolar(a, b, t) {
    const ma = a.magnitude || 0.001, mb = b.magnitude || 0.001;
    let pd = b.phase - a.phase;
    if (pd >  Math.PI) pd -= 2 * Math.PI;
    if (pd < -Math.PI) pd += 2 * Math.PI;
    return _Complex.fromPolar(Math.exp(Math.log(ma) + (Math.log(mb) - Math.log(ma)) * t), a.phase + pd * t);
}
function _smootherstep(t) { return t * t * t * (t * (6 * t - 15) + 10); }

function _hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, pv = 2 * l - q;
    const h2r = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };
    return { r: Math.round(h2r(pv, q, h + 1/3) * 255), g: Math.round(h2r(pv, q, h) * 255), b: Math.round(h2r(pv, q, h - 1/3) * 255) };
}

// ═══════════════════════════════════════════════════════════════════
// EQUATIONS MODE — wave math
// ═══════════════════════════════════════════════════════════════════

const TWO_PI = Math.PI * 2;

function _safePow(base, exp) {
    if (Math.abs(base) < 1e-9 && exp < 0) return 0;
    return Math.sign(base) * Math.pow(Math.abs(base), exp);
}
function _waveFunc(t, useCos) { return useCos ? Math.cos(t) : Math.sin(t); }

function _computeR(r, p) {
    const r1 = r - (p.Or1 || 0);
    let v = (p.Ar1 || 0) * _safePow(r1, p.pr1 || 1) * _waveFunc(TWO_PI * (p.fr1 || 0) * r + (p.phiR1 || 0), p.waveR1 === 'cos');
    const r2 = r - (p.Or2 || 0);
    v += (p.Ar2 || 0) * _safePow(r2, p.pr2 || 1) * _waveFunc(TWO_PI * (p.fr2 || 0) * r + (p.phiR2 || 0), p.waveR2 === 'cos');
    if (Math.abs(p.Mr || 0) > 0.001) {
        const m1 = _waveFunc(TWO_PI * (p.frm1 || 0) * r + (p.phiRm1 || 0), false);
        const m2 = _waveFunc(TWO_PI * (p.frm2 || 0) * r + (p.phiRm2 || 0), false);
        v *= (1 + (p.Mr || 0) * (_safePow(m1, p.prm1 || 1) + _safePow(m2, p.prm2 || 1)));
    }
    return v;
}
function _computeX(x, p) {
    const x1 = x - (p.Ox1 || 0);
    let v = (p.Ax1 || 0) * _safePow(x1, p.px1 || 1) * _waveFunc(TWO_PI * (p.fx1 || 0) * x + (p.phiX1 || 0), p.waveX1 === 'cos');
    const x2 = x - (p.Ox2 || 0);
    v += (p.Ax2 || 0) * _safePow(x2, p.px2 || 1) * _waveFunc(TWO_PI * (p.fx2 || 0) * x + (p.phiX2 || 0), p.waveX2 === 'cos');
    if (Math.abs(p.Mx || 0) > 0.001) {
        const m1 = _waveFunc(TWO_PI * (p.fxm1 || 0) * x + (p.phiXm1 || 0), false);
        const m2 = _waveFunc(TWO_PI * (p.fxm2 || 0) * x + (p.phiXm2 || 0), false);
        v *= (1 + (p.Mx || 0) * (_safePow(m1, p.pxm1 || 1) + _safePow(m2, p.pxm2 || 1)));
    }
    return v;
}
function _computeY(y, p) {
    const y1 = y - (p.Oy1 || 0);
    let v = (p.Ay1 || 0) * _safePow(y1, p.py1 || 1) * _waveFunc(TWO_PI * (p.fy1 || 0) * y + (p.phiY1 || 0), p.waveY1 === 'cos');
    const y2 = y - (p.Oy2 || 0);
    v += (p.Ay2 || 0) * _safePow(y2, p.py2 || 1) * _waveFunc(TWO_PI * (p.fy2 || 0) * y + (p.phiY2 || 0), p.waveY2 === 'cos');
    if (Math.abs(p.My || 0) > 0.001) {
        const m1 = _waveFunc(TWO_PI * (p.fym1 || 0) * y + (p.phiYm1 || 0), false);
        const m2 = _waveFunc(TWO_PI * (p.fym2 || 0) * y + (p.phiYm2 || 0), false);
        v *= (1 + (p.My || 0) * (_safePow(m1, p.pym1 || 1) + _safePow(m2, p.pym2 || 1)));
    }
    return v;
}

// ═══════════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════════

const _EQ = {
    renderer: 'equations', colourMode: 'greyscale', resolution: 2,
    amplitude: 4, frequency: 0.251, speed: 0.02, decay: 0.002,
    s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
    opSpeed1: 0.002, opSpeed2: 0.0015, opSpeed3: 0.0025, opSpeed4: 0.001,
    cycleFrames: 3600,
    Ar1: 1, fr1: 20, pr1: 1, phiR1: 0, Or1: 0, waveR1: 'sin',
    Ar2: 0, fr2: 0,  pr2: 1, phiR2: 0, Or2: 0, waveR2: 'sin',
    Mr: 0, frm1: 0, frm2: 0, prm1: 1, prm2: 1, phiRm1: 0, phiRm2: 0,
    Ax1: 0, fx1: 0, px1: 1, phiX1: 0, Ox1: 0, waveX1: 'sin',
    Ax2: 0, fx2: 0, px2: 1, phiX2: 0, Ox2: 0, waveX2: 'sin',
    Mx: 0, fxm1: 0, fxm2: 0, pxm1: 1, pxm2: 1, phiXm1: 0, phiXm2: 0,
    Ay1: 0, fy1: 0, py1: 1, phiY1: 0, Oy1: 0, waveY1: 'sin',
    Ay2: 0, fy2: 0, py2: 1, phiY2: 0, Oy2: 0, waveY2: 'sin',
    My: 0, fym1: 0, fym2: 0, pym1: 1, pym2: 1, phiYm1: 0, phiYm2: 0,
    scale: 300, rotation: 0, blendMode: 'sum'
};

const _NM = {
    renderer: 'normal-map', colourMode: 'greyscale', resolution: 2,
    amplitude: 4, frequency: 0.251, speed: 0.02, decay: 0.002,
    s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
    opSpeed1: 0.002, opSpeed2: 0.0015, opSpeed3: 0.0025, opSpeed4: 0.001,
    cycleFrames: 3600,
    Ar1: 1, fr1: 20, pr1: 1, phiR1: 0, Or1: 0, waveR1: 'sin',
    Ar2: 0, fr2: 0, pr2: 1, phiR2: 0, Or2: 0, waveR2: 'sin',
    Mr: 0, frm1: 0, frm2: 0, prm1: 1, prm2: 1, phiRm1: 0, phiRm2: 0,
    Ax1: 0, fx1: 0, px1: 1, phiX1: 0, Ox1: 0, waveX1: 'sin',
    Ax2: 0, fx2: 0, px2: 1, phiX2: 0, Ox2: 0, waveX2: 'sin',
    Mx: 0, fxm1: 0, fxm2: 0, pxm1: 1, pxm2: 1, phiXm1: 0, phiXm2: 0,
    Ay1: 0, fy1: 0, py1: 1, phiY1: 0, Oy1: 0, waveY1: 'sin',
    Ay2: 0, fy2: 0, py2: 1, phiY2: 0, Oy2: 0, waveY2: 'sin',
    My: 0, fym1: 0, fym2: 0, pym1: 1, pym2: 1, phiYm1: 0, phiYm2: 0,
    scale: 300, rotation: 0, blendMode: 'sum'
};

const _CO = {
    renderer: 'complex-ops', colourMode: 'greyscale', resolution: 2,
    amplitude: 1.0, frequency: 0.251, speed: 0.02, decay: 0.002,
    s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
    opSpeed1: 0.002, opSpeed2: 0.0015, opSpeed3: 0.0025, opSpeed4: 0.001,
    cycleFrames: 3600,
    Ar1: 1, fr1: 20, pr1: 1, phiR1: 0, Or1: 0, waveR1: 'sin',
    Ar2: 0, fr2: 0, pr2: 1, phiR2: 0, Or2: 0, waveR2: 'sin',
    Mr: 0, frm1: 0, frm2: 0, prm1: 1, prm2: 1, phiRm1: 0, phiRm2: 0,
    Ax1: 0, fx1: 0, px1: 1, phiX1: 0, Ox1: 0, waveX1: 'sin',
    Ax2: 0, fx2: 0, px2: 1, phiX2: 0, Ox2: 0, waveX2: 'sin',
    Mx: 0, fxm1: 0, fxm2: 0, pxm1: 1, pxm2: 1, phiXm1: 0, phiXm2: 0,
    Ay1: 0, fy1: 0, py1: 1, phiY1: 0, Oy1: 0, waveY1: 'sin',
    Ay2: 0, fy2: 0, py2: 1, phiY2: 0, Oy2: 0, waveY2: 'sin',
    My: 0, fym1: 0, fym2: 0, pym1: 1, pym2: 1, phiYm1: 0, phiYm2: 0,
    scale: 300, rotation: 0, blendMode: 'sum'
};

const LANDMARKS = [
    // ── equations presets ──
    { name: '20 Rings',                values: { ..._EQ } },
    { name: '1 Ring',                  values: { ..._EQ, fr1: 1 } },
    { name: '3 Rings',                 values: { ..._EQ, fr1: 3 } },
    { name: '5 Rings',                 values: { ..._EQ, fr1: 5 } },
    { name: '10 Rings',                values: { ..._EQ, fr1: 10 } },
    { name: 'Inverted 5 Rings',        values: { ..._EQ, Ar1: -1, fr1: 5 } },
    { name: 'Offset Rings',            values: { ..._EQ, fr1: 5, Or1: 0.3 } },
    { name: 'Horizontal Lines',        values: { ..._EQ, Ar1: 0, Ay1: 1, fy1: 5 } },
    { name: 'Vertical Lines',          values: { ..._EQ, Ar1: 0, Ax1: 1, fx1: 5 } },
    { name: 'Grid 5\u00d75',           values: { ..._EQ, Ar1: 0, Ax1: 1, fx1: 5, Ay1: 1, fy1: 5 } },
    { name: 'Moir\u00e9 Cross',        values: { ..._EQ, Ar1: 0, Ax1: 1, fx1: 5, Ay1: 1, fy1: 5.5 } },
    { name: 'Rings + Grid',            values: { ..._EQ, fr1: 5, Ax1: 0.3, fx1: 8, Ay1: 0.3, fy1: 8 } },
    { name: 'Complex Interference',    values: { ..._EQ, fr1: 3, Ar2: 0.5, fr2: 7, Ax1: 0.3, fx1: 10 } },
    // ── normal-map presets ──
    { name: 'Normal Map — Classic',    values: { ..._NM } },
    { name: 'Normal Map — High Freq',  values: { ..._NM, amplitude: 3, frequency: 0.4, speed: 0.03, s1Loops: 8, s2Loops: 5, s3Loops: 13, s4Loops: 2 } },
    { name: 'Normal Map — Low Detail', values: { ..._NM, amplitude: 6, frequency: 0.15, speed: 0.015, resolution: 4 } },
    // ── complex-ops presets ──
    { name: 'Complex Ops — Classic',   values: { ..._CO } },
    { name: 'Complex Ops — Fast Morph', values: { ..._CO, amplitude: 1.5, frequency: 0.3, speed: 0.03, decay: 0.003, s1Loops: 8, s2Loops: 5, s3Loops: 12, s4Loops: 2, opSpeed1: 0.004, opSpeed2: 0.003, opSpeed3: 0.005, opSpeed4: 0.002, cycleFrames: 2400 } },
    { name: 'Complex Ops — Low Res',   values: { ..._CO, resolution: 4 } }
];

// ═══════════════════════════════════════════════════════════════════
// SCRIPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const SCRIPT_CONFIG = {
    id: 'wave-interference',
    title: 'Wave Interference',
    category: 'wave',
    description: 'Unified wave interference generator. Three renderer modes: equations (spatial R/X/Y wave equation, greyscale), normal-map (orbiting sources, surface-normal colour), complex-ops (complex-number operator chains, phase-HSL colour).',
    version: '3.0.0',

    compute: { cost: 'per-pixel', interactionScale: 0.5, idleDelay: 200 },

    canvas: { width: 1080, height: 1080, context: 'p5' },

    animation: {
        type: 'loop',
        loopFrames: 3600,
        defaultFps: 60,
        animatableParams: ['amplitude', 'speed', 'frequency', 'decay', 'phiR1', 'phiR2', 'phiX1', 'phiX2', 'phiY1', 'phiY2'],
        sequencer: true
    },

    export: { png: true, gif: true, webm: false },

    // WIN-05: declare emitter handles so HOST overlay can render draggable handles
    // bound to s1X/s1Y … s4X/s4Y when sourceMode === 'manual'.
    overlay: {
        emitterHandles: {
            enabled: true,
            activateWhen: { param: 'sourceMode', value: 'manual' },
            handles: [
                { id: 's1', xParam: 's1X', yParam: 's1Y', label: '1' },
                { id: 's2', xParam: 's2X', yParam: 's2Y', label: '2' },
                { id: 's3', xParam: 's3X', yParam: 's3Y', label: '3' },
                { id: 's4', xParam: 's4X', yParam: 's4Y', label: '4' }
            ],
            sourceCountParam: 'sourceCount'
        }
    },

    presets: LANDMARKS,

    infoSections: [
        {
            heading: 'RENDERERS',
            body: 'equations: spatial wave equation I = R(r) + X(x) + Y(y). Intensity is normalised to greyscale or hue-mapped. normal-map: four wave sources orbit the canvas perimeter; their superimposed surface normals drive RGB via angular differences to a rotating reference vector. complex-ops: four sources emit complex waves that are composed through evolving operator chains (add, multiply, power, rotate, Möbius, fold, spiral, beat), mapped to HSL via phase and magnitude.'
        },
        {
            heading: 'EQUATIONS MODE',
            body: 'coord = (px - cx) / scale; r = sqrt(x² + y²); global rotation applied via 2×2 rotation matrix. Each component (R, X, Y) sums two wave terms A·safePow(coord - O, p)·wave(2π·f·coord + φ), optionally multiplied by an additive modulation layer. safePow(base, exp) = sign(base)·|base|^exp with zero-guard. Output is min-max normalised to [0, 255] per frame.'
        },
        {
            heading: 'NORMAL-MAP MODE',
            body: 'Sources orbit the canvas perimeter (2×(W+H) pixels). h(px,py,src,t) = amplitude·(sin(freq·dist − speed·t) + 1)/2. 4-point finite-difference surface normals computed per pixel. Angular differences between pair normals and reference vector drive R/G/B channels. Reference vector traces a triangle path 10 times per cycle.'
        },
        {
            heading: 'COMPLEX-OPS MODE',
            body: 'Each source emits w = Complex(a·cos(freq·d − speed·t), a·sin(…)), where a = amplitude/(1 + d·decay). Four operators blend via smootherstep lerpPolar between current and next operator. Operators transition deterministically (Wang-hash PRNG, 70% same-family bias). Colour: hue from complex phase minus reference phase; lightness 0.1 + 0.7·(1 − e^(−|state|·0.8)); saturation from normal·reference dot product.'
        }
    ],

    parameters: [
        {
            group: 'Renderer',
            params: [
                { key: 'renderer',        type: 'select', label: 'Mode',
                  options: [{ value: 'normal-map', label: 'Normal Map' }, { value: 'complex-ops', label: 'Complex Ops' }, { value: 'equations', label: 'Equations' }],
                  default: 'normal-map' },
                // WIN-04: interferenceMode controls composition of multiple source-pair fields
                { key: 'interferenceMode', type: 'select', label: 'Interference Mode',
                  options: [
                    { value: 'pair-normal', label: 'Pair Normal (default)' },
                    { value: 'all-normal',  label: 'All Sources Normal' },
                    { value: 'sum-grey',    label: 'Sum Greyscale' }
                  ], default: 'pair-normal' },
                { key: 'colourMode', type: 'select', label: 'Colour Mode',
                  options: [{ value: 'greyscale', label: 'Greyscale' }, { value: 'hue', label: 'Hue Map' }],
                  default: 'greyscale' },
                { key: 'resolution', type: 'slider', label: 'Resolution', min: 1, max: 6, step: 1, default: 2 }
            ]
        },
        // WIN-05: emitter source control (orbit vs manual)
        {
            group: 'Sources — Position',
            defaultCollapsed: true,
            params: [
                { key: 'sourceMode',  type: 'select', label: 'Source Mode',
                  options: [{ value: 'orbit', label: 'Orbit (perimeter)' }, { value: 'manual', label: 'Manual X/Y' }],
                  default: 'orbit' },
                { key: 'sourceCount', type: 'slider', label: 'Active Sources', min: 1, max: 4, step: 1, default: 4 },
                // Manual source positions (normalised [0,1] canvas space)
                { key: 's1X', type: 'slider', label: 'Source 1 X', min: 0, max: 1, step: 0.01, default: 0.25, precision: 2 },
                { key: 's1Y', type: 'slider', label: 'Source 1 Y', min: 0, max: 1, step: 0.01, default: 0.25, precision: 2 },
                { key: 's2X', type: 'slider', label: 'Source 2 X', min: 0, max: 1, step: 0.01, default: 0.75, precision: 2 },
                { key: 's2Y', type: 'slider', label: 'Source 2 Y', min: 0, max: 1, step: 0.01, default: 0.25, precision: 2 },
                { key: 's3X', type: 'slider', label: 'Source 3 X', min: 0, max: 1, step: 0.01, default: 0.75, precision: 2 },
                { key: 's3Y', type: 'slider', label: 'Source 3 Y', min: 0, max: 1, step: 0.01, default: 0.75, precision: 2 },
                { key: 's4X', type: 'slider', label: 'Source 4 X', min: 0, max: 1, step: 0.01, default: 0.25, precision: 2 },
                { key: 's4Y', type: 'slider', label: 'Source 4 Y', min: 0, max: 1, step: 0.01, default: 0.75, precision: 2 }
            ]
        },
        // ── Shared: orbiting-source modes ──
        {
            group: 'Wave',
            params: [
                { key: 'amplitude',  type: 'slider', label: 'Amplitude',  min: 0.1,   max: 12,   step: 0.1,   default: 4 },
                { key: 'frequency',  type: 'slider', label: 'Frequency',  min: 0.05,  max: 0.5,  step: 0.01,  default: 0.251 },
                { key: 'speed',      type: 'slider', label: 'Speed',      min: 0.001, max: 0.1,  step: 0.001, default: 0.02 },
                { key: 'decay',      type: 'slider', label: 'Decay',      min: 0.0005, max: 0.01, step: 0.0005, default: 0.002 }
            ]
        },
        {
            group: 'Sources',
            params: [
                { key: 's1Loops', type: 'slider', label: 'Source 1 Loops', min: 1, max: 30, step: 1, default: 10 },
                { key: 's2Loops', type: 'slider', label: 'Source 2 Loops', min: 1, max: 30, step: 1, default: 7 },
                { key: 's3Loops', type: 'slider', label: 'Source 3 Loops', min: 1, max: 30, step: 1, default: 18 },
                { key: 's4Loops', type: 'slider', label: 'Source 4 Loops', min: 1, max: 30, step: 1, default: 3 }
            ]
        },
        // ── Complex-ops mode ──
        {
            group: 'Operators',
            defaultCollapsed: true,
            params: [
                { key: 'opSpeed1', type: 'slider', label: 'Op Speed 1', min: 0.0005, max: 0.005, step: 0.0005, default: 0.002 },
                { key: 'opSpeed2', type: 'slider', label: 'Op Speed 2', min: 0.0005, max: 0.005, step: 0.0005, default: 0.0015 },
                { key: 'opSpeed3', type: 'slider', label: 'Op Speed 3', min: 0.0005, max: 0.005, step: 0.0005, default: 0.0025 },
                { key: 'opSpeed4', type: 'slider', label: 'Op Speed 4', min: 0.0005, max: 0.005, step: 0.0005, default: 0.001 }
            ]
        },
        {
            group: 'Cycle',
            params: [
                { key: 'cycleFrames', type: 'slider', label: 'Cycle Frames', min: 360, max: 7200, step: 360, default: 3600, recomputeOnChange: true }
            ]
        },
        // ── Equations mode ──
        {
            group: 'Eq — R(r) Term 1',
            defaultCollapsed: true,
            params: [
                { key: 'Ar1',    type: 'slider', label: 'Amplitude',      min: -2, max: 2, step: 0.1, default: 1,     precision: 1 },
                { key: 'fr1',    type: 'slider', label: 'Frequency',      min: 0,  max: 50, step: 0.5, default: 20,   precision: 1 },
                { key: 'pr1',    type: 'slider', label: 'Power',          min: -7, max: 7,  step: 0.1, default: 1,    precision: 1 },
                { key: 'phiR1',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Or1',    type: 'slider', label: 'Offset',         min: -2, max: 2,  step: 0.1, default: 0,    precision: 1 },
                { key: 'waveR1', type: 'radio',  label: 'Wave',           options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'Eq — R(r) Term 2',
            defaultCollapsed: true,
            params: [
                { key: 'Ar2',    type: 'slider', label: 'Amplitude',      min: -2, max: 2, step: 0.1, default: 0,    precision: 1 },
                { key: 'fr2',    type: 'slider', label: 'Frequency',      min: 0,  max: 50, step: 0.5, default: 0,   precision: 1 },
                { key: 'pr2',    type: 'slider', label: 'Power',          min: -7, max: 7,  step: 0.1, default: 1,   precision: 1 },
                { key: 'phiR2',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Or2',    type: 'slider', label: 'Offset',         min: -2, max: 2,  step: 0.1, default: 0,   precision: 1 },
                { key: 'waveR2', type: 'radio',  label: 'Wave',           options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'Eq — R(r) Mod',
            defaultCollapsed: true,
            params: [
                { key: 'Mr',     type: 'slider', label: 'Mod Mix',    min: -1, max: 1, step: 0.01, default: 0, precision: 2 },
                { key: 'frm1',   type: 'slider', label: 'Freq Mod 1', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'frm2',   type: 'slider', label: 'Freq Mod 2', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'prm1',   type: 'slider', label: 'Power Mod 1', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'prm2',   type: 'slider', label: 'Power Mod 2', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phiRm1', type: 'slider', label: 'Phase Mod 1', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'phiRm2', type: 'slider', label: 'Phase Mod 2', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 }
            ]
        },
        {
            group: 'Eq — X(x) Term 1',
            defaultCollapsed: true,
            params: [
                { key: 'Ax1',    type: 'slider', label: 'Amplitude',      min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'fx1',    type: 'slider', label: 'Frequency',      min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'px1',    type: 'slider', label: 'Power',          min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phiX1',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Ox1',    type: 'slider', label: 'Offset',         min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'waveX1', type: 'radio',  label: 'Wave',           options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'Eq — X(x) Term 2',
            defaultCollapsed: true,
            params: [
                { key: 'Ax2',    type: 'slider', label: 'Amplitude',      min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'fx2',    type: 'slider', label: 'Frequency',      min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'px2',    type: 'slider', label: 'Power',          min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phiX2',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Ox2',    type: 'slider', label: 'Offset',         min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'waveX2', type: 'radio',  label: 'Wave',           options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'Eq — X(x) Mod',
            defaultCollapsed: true,
            params: [
                { key: 'Mx',     type: 'slider', label: 'Mod Mix',    min: -1, max: 1, step: 0.01, default: 0, precision: 2 },
                { key: 'fxm1',   type: 'slider', label: 'Freq Mod 1', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'fxm2',   type: 'slider', label: 'Freq Mod 2', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'pxm1',   type: 'slider', label: 'Power Mod 1', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'pxm2',   type: 'slider', label: 'Power Mod 2', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phiXm1', type: 'slider', label: 'Phase Mod 1', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'phiXm2', type: 'slider', label: 'Phase Mod 2', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 }
            ]
        },
        {
            group: 'Eq — Y(y) Term 1',
            defaultCollapsed: true,
            params: [
                { key: 'Ay1',    type: 'slider', label: 'Amplitude',      min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'fy1',    type: 'slider', label: 'Frequency',      min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'py1',    type: 'slider', label: 'Power',          min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phiY1',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Oy1',    type: 'slider', label: 'Offset',         min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'waveY1', type: 'radio',  label: 'Wave',           options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'Eq — Y(y) Term 2',
            defaultCollapsed: true,
            params: [
                { key: 'Ay2',    type: 'slider', label: 'Amplitude',      min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'fy2',    type: 'slider', label: 'Frequency',      min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'py2',    type: 'slider', label: 'Power',          min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phiY2',  type: 'slider', label: 'Phase (\u03c6)', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'Oy2',    type: 'slider', label: 'Offset',         min: -2, max: 2, step: 0.1, default: 0, precision: 1 },
                { key: 'waveY2', type: 'radio',  label: 'Wave',           options: ['sin', 'cos'], default: 'sin' }
            ]
        },
        {
            group: 'Eq — Y(y) Mod',
            defaultCollapsed: true,
            params: [
                { key: 'My',     type: 'slider', label: 'Mod Mix',    min: -1, max: 1, step: 0.01, default: 0, precision: 2 },
                { key: 'fym1',   type: 'slider', label: 'Freq Mod 1', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'fym2',   type: 'slider', label: 'Freq Mod 2', min: 0, max: 50, step: 0.5, default: 0, precision: 1 },
                { key: 'pym1',   type: 'slider', label: 'Power Mod 1', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'pym2',   type: 'slider', label: 'Power Mod 2', min: -7, max: 7, step: 0.1, default: 1, precision: 1 },
                { key: 'phiYm1', type: 'slider', label: 'Phase Mod 1', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 },
                { key: 'phiYm2', type: 'slider', label: 'Phase Mod 2', min: -6.28, max: 6.28, step: 0.01, default: 0, precision: 2 }
            ]
        },
        {
            group: 'Eq — View',
            defaultCollapsed: true,
            params: [
                { key: 'scale',     type: 'slider', label: 'Scale',    min: 50, max: 500, step: 10, default: 300 },
                { key: 'rotation',  type: 'slider', label: 'Rotation', min: 0,  max: 360, step: 1,  default: 0 },
                { key: 'blendMode', type: 'radio',  label: 'Blend',    options: ['sum', 'multiply'], default: 'sum' }
            ]
        }
    ],

    // ─── Shared perimeter helpers ───────────────────────────────────
    _triangle(W, H) {
        return [
            { x: W / 2, y: H * 0.05 },
            { x: W * 0.95, y: H * 0.95 },
            { x: W * 0.05, y: H * 0.95 },
        ];
    },

    _perimToXY(pos, W, H) {
        const perim = 2 * (W + H);
        pos = ((pos % perim) + perim) % perim;
        if (pos < W)          return { x: pos, y: 0 };
        if (pos < W + H)      return { x: W, y: pos - W };
        if (pos < 2 * W + H)  return { x: 2 * W + H - pos, y: H };
        return { x: 0, y: perim - pos };
    },

    _srcPos(loops, cw, offset, time, cycleFrames, W, H) {
        const perim = 2 * (W + H);
        const pos = offset + ((time % cycleFrames) / cycleFrames) * loops * perim * (cw ? 1 : -1);
        return this._perimToXY(pos, W, H);
    },

    _refVec(time, cycleFrames, W, H) {
        const triangle = this._triangle(W, H);
        const t = ((time % cycleFrames) / cycleFrames) * 10;
        const ep = (t % 1) * 3, ei = Math.floor(ep) % 3, et = ep - ei;
        const v0 = triangle[ei], v1 = triangle[(ei + 1) % 3];
        const sx = v0.x + (v1.x - v0.x) * et, sy = v0.y + (v1.y - v0.y) * et;
        const theta = (sx / W) * Math.PI * 2, phi = (sy / H) * Math.PI;
        return new _Vector3(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi));
    },

    // ─── Normal-map mode helpers ────────────────────────────────────
    _waveHeight(px, py, src, time, amp, freq, spd) {
        const dx = px - src.x, dy = py - src.y;
        return amp * (Math.sin(freq * Math.sqrt(dx * dx + dy * dy) - spd * time) + 1) / 2;
    },

    _sumHeight(px, py, sources, time, amp, freq, spd) {
        return sources.reduce((t, s) => t + this._waveHeight(px, py, s, time, amp, freq, spd), 0);
    },

    _calcNormal(px, py, sources, time, amp, freq, spd) {
        const delta = 1;
        const hL = this._sumHeight(px - delta, py, sources, time, amp, freq, spd);
        const hR = this._sumHeight(px + delta, py, sources, time, amp, freq, spd);
        const hD = this._sumHeight(px, py - delta, sources, time, amp, freq, spd);
        const hU = this._sumHeight(px, py + delta, sources, time, amp, freq, spd);
        const nx = -(hR - hL) / 2, ny = -(hU - hD) / 2, nz = 1;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        return { x: nx / len, y: ny / len, z: nz / len };
    },

    _wrapAngle(a) {
        while (a >  Math.PI) a -= 2 * Math.PI;
        while (a < -Math.PI) a += 2 * Math.PI;
        return a;
    },

    _mapToColor(val, min, max) {
        return Math.round(Math.max(0, Math.min(255, (val - min) / (max - min) * 255)));
    },

    _deltaToRGB(nA, nB, refAtanYX, refAtanZX, refAtanYZ) {
        const aXY = this._wrapAngle(Math.atan2(nA.y, nA.x) - refAtanYX);
        const aXZ = this._wrapAngle(Math.atan2(nA.z, nA.x) - refAtanZX);
        const aZY = this._wrapAngle(Math.atan2(nA.y, nA.z) - refAtanYZ);
        const bXY = this._wrapAngle(Math.atan2(nB.y, nB.x) - refAtanYX);
        const bXZ = this._wrapAngle(Math.atan2(nB.z, nB.x) - refAtanZX);
        const bZY = this._wrapAngle(Math.atan2(nB.y, nB.z) - refAtanYZ);
        const TPI = 2 * Math.PI;
        return {
            r: this._mapToColor(aXY + bXY, -TPI, TPI),
            g: this._mapToColor(aXZ + bXZ, -TPI, TPI),
            b: this._mapToColor(aZY + bZY, -TPI, TPI)
        };
    },

    _hueShift(rgb, deg) {
        const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                default: h = ((r - g) / d + 4) / 6; break;
            }
        }
        h = ((h * 360 + deg) % 360 + 360) % 360 / 360;
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1; if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        let rr, gg, bb;
        if (s === 0) { rr = gg = bb = l; } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const pv = 2 * l - q;
            rr = hue2rgb(pv, q, h + 1/3);
            gg = hue2rgb(pv, q, h);
            bb = hue2rgb(pv, q, h - 1/3);
        }
        return { r: Math.round(rr * 255), g: Math.round(gg * 255), b: Math.round(bb * 255) };
    },

    // ─── Complex-ops mode helpers ───────────────────────────────────
    _cxWave(px, py, src, time, amp, freq, spd, decay) {
        const dx = px - src.x, dy = py - src.y, d = Math.sqrt(dx * dx + dy * dy);
        const phase = freq * d - spd * time, a = amp / (1 + d * decay);
        return new _Complex(a * Math.cos(phase), a * Math.sin(phase));
    },

    _cxProcess(px, py, sources, time, params) {
        const { amplitude: amp, frequency: freq, speed: spd, decay } = params;
        let state = new _Complex(1, 0);
        for (let i = 0; i < sources.length; i++) {
            const wave = this._cxWave(px, py, sources[i], time, amp, freq, spd, decay);
            const opS  = this._opStates[i];
            const t    = _smootherstep(opS.t);
            const rA   = _WaveOps.get(opS.current)(state, wave);
            const rB   = _WaveOps.get(opS.next)(state, wave);
            state = _lerpPolar(rA, rB, t);
        }
        return state;
    },

    _cxHeightAt(px, py, sources, time, params) {
        return this._cxProcess(px, py, sources, time, params).magnitude;
    },

    _cxNormalAt(px, py, sources, time, params, centreHeight) {
        const hC = centreHeight !== undefined ? centreHeight : this._cxHeightAt(px, py, sources, time, params);
        const hR = this._cxHeightAt(px + 1, py,     sources, time, params);
        const hU = this._cxHeightAt(px,     py + 1, sources, time, params);
        const n = new _Vector3(-(hR - hC), -(hU - hC), 1).normalize();
        return new _Vector3(2 * n.z * n.x, 2 * n.z * n.y, 2 * n.z * n.z - 1);
    },

    _cxToColor(state, normal, ref) {
        const hue = ((state.phase - Math.atan2(ref.y, ref.x)) / (2 * Math.PI) + 1) % 1;
        const lightness  = 0.1 + 0.7 * (1 - Math.exp(-state.magnitude * 0.8));
        const saturation = Math.min(1, 0.6 + 0.4 * Math.abs(ref.z) * (0.5 + 0.5 * normal.dot(ref)));
        return _hslToRgb(hue * 360, saturation, lightness);
    },

    _initOpStates(params) {
        const speeds    = [params.opSpeed1, params.opSpeed2, params.opSpeed3, params.opSpeed4];
        const initOps   = ['add', 'multiply', 'power', 'rotate'];
        this._opStates  = initOps.map((op, i) => ({
            current: op, next: _pickNextOp(op, i * 100000), t: 0, speed: speeds[i], idx: i, transitionCount: 1
        }));
        this._lastOpSpeeds = [...speeds];
    },

    _opNeedsReset(params) {
        if (!this._opStates) return true;
        return [params.opSpeed1, params.opSpeed2, params.opSpeed3, params.opSpeed4]
            .some((s, i) => s !== this._lastOpSpeeds[i]);
    },

    // ─── p5 lifecycle ───────────────────────────────────────────────
    p5Setup(p, params) {
        p.pixelDensity(1);
        p.noLoop();
        this.animation.loopFrames = params.cycleFrames || 3600;
        if (params.renderer === 'complex-ops') {
            this._initOpStates(params);
        }
    },

    p5Draw(p, params, frame) {
        const { renderer } = params;
        if (renderer === 'complex-ops') {
            this._drawComplexOps(p, params, frame);
        } else if (renderer === 'normal-map') {
            this._drawNormalMap(p, params, frame);
        } else {
            this._drawEquations(p, params, frame);
        }
    },

    // Resolve source positions: orbit (perimeter) or manual (normalised x/y).
    _resolveSources(params, frame, W, H) {
        const cycleFrames = this.animation.loopFrames;
        const count = Math.max(1, Math.min(4, (params.sourceCount || 4) | 0));
        if (params.sourceMode === 'manual') {
            const raw = [
                { x: params.s1X ?? 0.25, y: params.s1Y ?? 0.25 },
                { x: params.s2X ?? 0.75, y: params.s2Y ?? 0.25 },
                { x: params.s3X ?? 0.75, y: params.s3Y ?? 0.75 },
                { x: params.s4X ?? 0.25, y: params.s4Y ?? 0.75 }
            ];
            return raw.slice(0, count).map(s => ({ x: s.x * W, y: s.y * H }));
        }
        const { s1Loops, s2Loops, s3Loops, s4Loops } = params;
        const perim = 2 * (W + H);
        const all = [
            this._srcPos(s1Loops, true,  0,             frame, cycleFrames, W, H),
            this._srcPos(s2Loops, true,  perim / 2,     frame, cycleFrames, W, H),
            this._srcPos(s3Loops, false, perim / 4,     frame, cycleFrames, W, H),
            this._srcPos(s4Loops, false, 3 * perim / 4, frame, cycleFrames, W, H)
        ];
        return all.slice(0, count);
    },

    // ─── Renderer: normal-map ───────────────────────────────────────
    _drawNormalMap(p, params, frame) {
        const { amplitude, frequency, speed, resolution, interferenceMode } = params;
        const cycleFrames = this.animation.loopFrames;
        const W = p.width, H = p.height;
        const time = frame;
        const sources = this._resolveSources(params, frame, W, H);
        const pairA = sources.slice(0, Math.min(2, sources.length));
        const pairB = sources.length > 2 ? sources.slice(2) : pairA;
        const ref = this._refVec(time, cycleFrames, W, H);
        const refAtanYX = Math.atan2(ref.y, ref.x);
        const refAtanZX = Math.atan2(ref.z, ref.x);
        const refAtanYZ = Math.atan2(ref.y, ref.z);
        const reso = resolution | 0;
        p.loadPixels();
        for (let y = 0; y < H; y += reso) {
            for (let x = 0; x < W; x += reso) {
                let col;
                if (interferenceMode === 'sum-grey') {
                    // WIN-04: sum-grey mode: total height → greyscale
                    const zTotal = this._sumHeight(x, y, sources, time, amplitude, frequency, speed);
                    const grey   = Math.round(Math.max(0, Math.min(255, (zTotal / (sources.length * amplitude)) * 255)));
                    col = { r: grey, g: grey, b: grey };
                } else {
                    const srcA = interferenceMode === 'all-normal' ? sources : pairA;
                    const srcB = interferenceMode === 'all-normal' ? sources : pairB;
                    const nA = this._calcNormal(x, y, srcA, time, amplitude, frequency, speed);
                    const nB = this._calcNormal(x, y, srcB, time, amplitude, frequency, speed);
                    col = this._deltaToRGB(nA, nB, refAtanYX, refAtanZX, refAtanYZ);
                    const zTotal = this._sumHeight(x, y, sources, time, amplitude, frequency, speed);
                    col = this._hueShift(col, (zTotal / 16) * 360);
                }
                for (let dy = 0; dy < reso && y + dy < H; dy++) {
                    for (let dx = 0; dx < reso && x + dx < W; dx++) {
                        const idx = 4 * ((y + dy) * W + (x + dx));
                        p.pixels[idx] = col.r; p.pixels[idx + 1] = col.g;
                        p.pixels[idx + 2] = col.b; p.pixels[idx + 3] = 255;
                    }
                }
            }
        }
        p.updatePixels();
    },

    // ─── Renderer: complex-ops ──────────────────────────────────────
    _drawComplexOps(p, params, frame) {
        if (this._opNeedsReset(params)) this._initOpStates(params);
        const { resolution } = params;
        const W = p.width, H = p.height;
        const time = frame;
        for (const os of this._opStates) {
            os.t += os.speed;
            if (os.t >= 1) {
                os.current = os.next;
                os.next = _pickNextOp(os.current, os.idx * 100000 + os.transitionCount);
                os.transitionCount++;
                os.t = 0;
            }
        }
        // WIN-05: resolve source positions using shared helper
        const sources = this._resolveSources(params, frame, W, H);
        const ref = this._refVec(time, cycleFrames, W, H);
        const res = resolution | 0;
        p.loadPixels();
        for (let y = 0; y < H; y += res) {
            for (let x = 0; x < W; x += res) {
                const state  = this._cxProcess(x, y, sources, time, params);
                const normal = this._cxNormalAt(x, y, sources, time, params, state.magnitude);
                const col    = this._cxToColor(state, normal, ref);
                for (let dy = 0; dy < res && y + dy < H; dy++) {
                    for (let dx = 0; dx < res && x + dx < W; dx++) {
                        const idx = 4 * ((y + dy) * W + (x + dx));
                        p.pixels[idx] = col.r; p.pixels[idx + 1] = col.g;
                        p.pixels[idx + 2] = col.b; p.pixels[idx + 3] = 255;
                    }
                }
            }
        }
        p.updatePixels();
    },

    // ─── Renderer: equations ───────────────────────────────────────
    _drawEquations(p, params, frame) {
        const W = p.width, H = p.height;
        const cx = W / 2, cy = H / 2;
        const scale    = params.scale || 300;
        const rotation = (params.rotation || 0) * Math.PI / 180;
        const blend    = params.blendMode || 'sum';
        const hueMapped = params.colourMode === 'hue';
        const cosR = Math.cos(rotation), sinR = Math.sin(rotation);
        const reso  = (params.resolution | 0) || 1;

        const intensities = new Float32Array(W * H);
        let minI = Infinity, maxI = -Infinity;
        let idx = 0;
        for (let py = 0; py < H; py++) {
            for (let px = 0; px < W; px++) {
                let x = (px - cx) / scale, y = (py - cy) / scale;
                const xr = x * cosR - y * sinR, yr = x * sinR + y * cosR;
                x = xr; y = yr;
                const r = Math.sqrt(x * x + y * y);
                let intensity;
                if (blend === 'multiply') {
                    intensity = (1 + _computeR(r, params)) * (1 + _computeX(x, params)) * (1 + _computeY(y, params));
                } else {
                    intensity = _computeR(r, params) + _computeX(x, params) + _computeY(y, params);
                }
                intensities[idx] = intensity;
                if (intensity < minI) minI = intensity;
                if (intensity > maxI) maxI = intensity;
                idx++;
            }
        }

        const range = maxI - minI || 1;
        p.loadPixels();
        for (let i = 0; i < intensities.length; i++) {
            const t = (intensities[i] - minI) / range;
            const base = i * 4;
            if (hueMapped) {
                const col = _hslToRgb(t * 360, 1, 0.5);
                p.pixels[base] = col.r; p.pixels[base + 1] = col.g;
                p.pixels[base + 2] = col.b;
            } else {
                const grey = Math.floor(t * 255);
                p.pixels[base] = grey; p.pixels[base + 1] = grey; p.pixels[base + 2] = grey;
            }
            p.pixels[base + 3] = 255;
        }
        // Block-fill for resolution > 1 (already computed at pixel level; reso param controls block size in source loop — kept simple here)
        p.updatePixels();
    }
};
