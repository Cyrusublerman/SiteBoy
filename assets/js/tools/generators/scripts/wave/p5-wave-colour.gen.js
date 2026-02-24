/**
 * Wave Colour - p5.js Generator
 *
 * An advanced wave interference system using complex number arithmetic.
 * Four sources orbit the canvas perimeter; their wave interactions are
 * processed via operator blending (add, multiply, power, rotate, mobius,
 * fold, spiral, beat). Colour is mapped from the complex state's phase
 * and magnitude via HSL, with surface normals for shading.
 *
 * Based on Wave_interference_colour sketch.
 *
 * @version 1.0.0
 */

// ============================================
// COMPLEX NUMBER
// ============================================
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

const _FAMILIES = {
    smooth: ['add', 'rotate', 'spiral'], harsh: ['multiply', 'power', 'fold'], warp: ['mobius', 'beat']
};
const _ALL_OPS = ['add', 'multiply', 'power', 'rotate', 'mobius', 'fold', 'spiral', 'beat'];

function _pickNextOp(current) {
    const fam = Object.entries(_FAMILIES).find(([, ops]) => ops.includes(current))?.[0] || 'smooth';
    const stay = Math.random() < 0.7;
    let cands = stay ? _FAMILIES[fam].filter(o => o !== current) : _ALL_OPS.filter(o => !_FAMILIES[fam]?.includes(o));
    if (cands.length === 0) cands = _ALL_OPS.filter(o => o !== current);
    return cands[Math.floor(Math.random() * cands.length)];
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

export const SCRIPT_CONFIG = {
    id: 'p5-wave-colour',
    title: 'Wave Colour',
    category: 'wave',
    description: 'Complex-number wave interference with evolving operators. Phase-based HSL colour mapping with normal-map shading.',
    version: '1.0.0',

    canvas: { width: 1080, height: 1080, context: 'p5' },

    parameters: [
        {
            group: 'Wave',
            params: [
                { key: 'amplitude',  type: 'slider', label: 'Amplitude',  min: 0.1, max: 10,   step: 0.1,  default: 1.0 },
                { key: 'frequency',  type: 'slider', label: 'Frequency',  min: 0.05, max: 0.5, step: 0.01, default: 0.251 },
                { key: 'speed',      type: 'slider', label: 'Speed',      min: 0.005, max: 0.1, step: 0.005, default: 0.02 },
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
        {
            group: 'Operators',
            params: [
                { key: 'opSpeed1', type: 'slider', label: 'Op Speed 1', min: 0.0005, max: 0.005, step: 0.0005, default: 0.002 },
                { key: 'opSpeed2', type: 'slider', label: 'Op Speed 2', min: 0.0005, max: 0.005, step: 0.0005, default: 0.0015 },
                { key: 'opSpeed3', type: 'slider', label: 'Op Speed 3', min: 0.0005, max: 0.005, step: 0.0005, default: 0.0025 },
                { key: 'opSpeed4', type: 'slider', label: 'Op Speed 4', min: 0.0005, max: 0.005, step: 0.0005, default: 0.001 }
            ]
        },
        {
            group: 'Render',
            params: [
                { key: 'resolution',  type: 'slider', label: 'Resolution', min: 1, max: 6, step: 1, default: 2 },
                { key: 'cycleFrames', type: 'slider', label: 'Cycle Frames', min: 360, max: 7200, step: 360, default: 3600 }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            amplitude: 1.0, frequency: 0.251, speed: 0.02, decay: 0.002,
            s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
            opSpeed1: 0.002, opSpeed2: 0.0015, opSpeed3: 0.0025, opSpeed4: 0.001,
            resolution: 2, cycleFrames: 3600
        },
        {
            name: 'Fast Morph',
            amplitude: 1.5, frequency: 0.3, speed: 0.03, decay: 0.003,
            s1Loops: 8, s2Loops: 5, s3Loops: 12, s4Loops: 2,
            opSpeed1: 0.004, opSpeed2: 0.003, opSpeed3: 0.005, opSpeed4: 0.002,
            resolution: 2, cycleFrames: 2400
        },
        {
            name: 'Low Res',
            amplitude: 1.0, frequency: 0.251, speed: 0.02, decay: 0.002,
            s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
            opSpeed1: 0.002, opSpeed2: 0.0015, opSpeed3: 0.0025, opSpeed4: 0.001,
            resolution: 4, cycleFrames: 3600
        }
    ],

    animation: { type: 'loop', loopFrames: 3600, defaultFps: 60 },

    // State - operator blend states
    _opStates: null,
    _lastOpSpeeds: null,

    _TRIANGLE: [{ x: 540, y: 54 }, { x: 1026, y: 1026 }, { x: 54, y: 1026 }],

    _perimToXY(pos, W, H) {
        const p = 2 * (W + H);
        pos = ((pos % p) + p) % p;
        if (pos < W)          return { x: pos, y: 0 };
        if (pos < W + H)      return { x: W, y: pos - W };
        if (pos < 2 * W + H)  return { x: 2 * W + H - pos, y: H };
        return { x: 0, y: p - pos };
    },

    _srcPos(loops, cw, offset, time, cycleFrames, W, H) {
        const perim = 2 * (W + H);
        const progress = (time % cycleFrames) / cycleFrames;
        const pos = offset + progress * loops * perim * (cw ? 1 : -1);
        return this._perimToXY(pos, W, H);
    },

    _refVec(time, cycleFrames, W, H) {
        const t = ((time % cycleFrames) / cycleFrames) * 10;
        const ep = (t % 1) * 3, ei = Math.floor(ep) % 3, et = ep - ei;
        const v0 = this._TRIANGLE[ei], v1 = this._TRIANGLE[(ei + 1) % 3];
        const sx = v0.x + (v1.x - v0.x) * et, sy = v0.y + (v1.y - v0.y) * et;
        const theta = (sx / W) * Math.PI * 2, phi = (sy / H) * Math.PI;
        return new _Vector3(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi));
    },

    _wave(px, py, src, time, amp, freq, spd, decay) {
        const dx = px - src.x, dy = py - src.y, d = Math.sqrt(dx * dx + dy * dy);
        const phase = freq * d - spd * time, a = amp / (1 + d * decay);
        return new _Complex(a * Math.cos(phase), a * Math.sin(phase));
    },

    _process(px, py, sources, time, params) {
        const { amplitude: amp, frequency: freq, speed: spd, decay } = params;
        let state = new _Complex(1, 0);
        for (let i = 0; i < sources.length; i++) {
            const wave = this._wave(px, py, sources[i], time, amp, freq, spd, decay);
            const opS  = this._opStates[i];
            const t    = _smootherstep(opS.t);
            const rA   = _WaveOps.get(opS.current)(state, wave);
            const rB   = _WaveOps.get(opS.next)(state, wave);
            state = _lerpPolar(rA, rB, t);
        }
        return state;
    },

    _heightAt(px, py, sources, time, params) {
        return this._process(px, py, sources, time, params).magnitude;
    },

    _normalAt(px, py, sources, time, params, delta = 1) {
        const hL = this._heightAt(px - delta, py, sources, time, params);
        const hR = this._heightAt(px + delta, py, sources, time, params);
        const hD = this._heightAt(px, py - delta, sources, time, params);
        const hU = this._heightAt(px, py + delta, sources, time, params);
        const n = new _Vector3(-(hR - hL) / 2, -(hU - hD) / 2, 1).normalize();
        return new _Vector3(2 * n.z * n.x, 2 * n.z * n.y, 2 * n.z * n.z - 1);
    },

    _toColor(state, normal, ref) {
        const hue = ((state.phase - Math.atan2(ref.y, ref.x)) / (2 * Math.PI) + 1) % 1;
        const lightness  = 0.1 + 0.7 * (1 - Math.exp(-state.magnitude * 0.8));
        const saturation = Math.min(1, 0.6 + 0.4 * Math.abs(ref.z) * (0.5 + 0.5 * normal.dot(ref)));
        return _hslToRgb(hue * 360, saturation, lightness);
    },

    _initOpStates(params) {
        const { opSpeed1, opSpeed2, opSpeed3, opSpeed4 } = params;
        const speeds = [opSpeed1, opSpeed2, opSpeed3, opSpeed4];
        const initOps = ['add', 'multiply', 'power', 'rotate'];
        this._opStates = initOps.map((op, i) => ({ current: op, next: _pickNextOp(op), t: 0, speed: speeds[i] }));
        this._lastOpSpeeds = [...speeds];
    },

    _opNeedsReset(params) {
        if (!this._opStates) return true;
        const { opSpeed1, opSpeed2, opSpeed3, opSpeed4 } = params;
        return [opSpeed1, opSpeed2, opSpeed3, opSpeed4].some((s, i) => s !== this._lastOpSpeeds[i]);
    },

    p5Setup(p, params) {
        p.pixelDensity(1);
        p.noLoop();
        this._initOpStates(params);
    },

    p5Draw(p, params, frame) {
        if (this._opNeedsReset(params)) this._initOpStates(params);

        const { s1Loops, s2Loops, s3Loops, s4Loops, resolution, cycleFrames } = params;
        const W = p.width, H = p.height;
        const time = frame;
        const perim = 2 * (W + H);

        // Update operator blend states
        for (const os of this._opStates) {
            os.t += os.speed;
            if (os.t >= 1) { os.current = os.next; os.next = _pickNextOp(os.current); os.t = 0; }
        }

        const srcConfigs = [
            { loops: s1Loops, cw: true,  offset: 0 },
            { loops: s2Loops, cw: true,  offset: perim / 2 },
            { loops: s3Loops, cw: false, offset: perim / 4 },
            { loops: s4Loops, cw: false, offset: (3 * perim) / 4 }
        ];
        const sources = srcConfigs.map(sc => this._srcPos(sc.loops, sc.cw, sc.offset, time, cycleFrames, W, H));
        const ref = this._refVec(time, cycleFrames, W, H);

        p.loadPixels();
        const res = resolution;

        for (let y = 0; y < H; y += res) {
            for (let x = 0; x < W; x += res) {
                const state  = this._process(x, y, sources, time, params);
                const normal = this._normalAt(x, y, sources, time, params);
                const col    = this._toColor(state, normal, ref);

                for (let dy = 0; dy < res && y + dy < H; dy++) {
                    for (let dx = 0; dx < res && x + dx < W; dx++) {
                        const idx = 4 * ((y + dy) * W + (x + dx));
                        p.pixels[idx]     = col.r;
                        p.pixels[idx + 1] = col.g;
                        p.pixels[idx + 2] = col.b;
                        p.pixels[idx + 3] = 255;
                    }
                }
            }
        }
        p.updatePixels();
    }
};
