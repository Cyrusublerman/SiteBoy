/**
 * Wave Colour - p5.js Generator
 *
 * Complex-number wave interference system. Four sources orbit the canvas
 * perimeter; their interactions are composed via evolving complex operators.
 * Colour is mapped from phase and magnitude via HSL with normal-map shading.
 *
 * @version 1.1.0
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

// Wang-hash PRNG — deterministic, seed-based
function _seededRand(seed) {
    seed = ((seed >>> 16) ^ seed) * 0x45d9f3b | 0;
    seed = ((seed >>> 16) ^ seed) * 0x45d9f3b | 0;
    seed = (seed >>> 16) ^ seed;
    return (seed >>> 0) / 4294967296;
}

// Deterministic operator picker: seed = operatorIndex * 100000 + transitionCount
function _pickNextOp(current, seed) {
    const fam = Object.entries(_FAMILIES).find(([, ops]) => ops.includes(current))?.[0] || 'smooth';
    const stay = _seededRand(seed) < 0.7;
    let cands = stay ? _FAMILIES[fam].filter(o => o !== current) : _ALL_OPS.filter(o => !_FAMILIES[fam]?.includes(o));
    if (cands.length === 0) cands = _ALL_OPS.filter(o => o !== current);
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

export const SCRIPT_CONFIG = {
    id: 'p5-wave-colour',
    title: 'Wave Colour',
    category: 'wave',
    description: 'Complex-number wave interference with evolving operators. Phase-based HSL colour mapping with normal-map shading.',
    version: '1.1.0',

    infoSections: [
        {
            heading: 'DESCRIPTION',
            body: 'Wave Colour is a P5.js pixel-buffer animation that computes complex-number wave interference at each canvas pixel and maps the result to colour via phase, magnitude, and surface normals. Four wave sources orbit the 1080×1080 canvas perimeter. Their interactions are composed via sequentially-applied operators that evolve through a library of eight complex transformations — add, multiply, power, rotate, Möbius, fold, spiral, and beat — producing continuously morphing interference patterns.'
        },
        {
            heading: 'ALGORITHM',
            body: 'Source positions: each source orbits the canvas perimeter (total length 4320 px). Sources 1 and 2 travel clockwise; 3 and 4 counter-clockwise. _srcPos computes position as: progress = (frame % cycleFrames) / cycleFrames; pos = offset + progress × loops × perimeter × direction; _perimToXY maps pos to canvas coordinates along the four edges.\n\nPer pixel, _wave computes: d = distance(pixel, source); phase = freq × d − speed × frame; a = amplitude / (1 + d × decay); w = _Complex(a × cos(phase), a × sin(phase)).\n\nFour waves are composed by _process: state starts at (1, 0); for each of four sources, the current and next operators are applied to state and wave; results are blended by _lerpPolar(rA, rB, smootherstep(t)) where t advances by opSpeed per frame. _lerpPolar uses logarithmic magnitude lerp and shortest-path angle lerp.\n\nOperator library: add (s + w); multiply (complex product); power (|s|^(1 + 0.5 × w_re) × exp(i × phase(s))); rotate (s × exp(i × w_re × π)); mobius ((a×s + b) / (c×s + d)); fold (4-fold domain repeat, threshold 0.5 + 0.4 × |w_re|); spiral (|s| × exp(i × (phase(s) + ln|s| × w_re × 2))); beat (s × exp(i × w_re² × 10)). Families: smooth = [add, rotate, spiral]; harsh = [multiply, power, fold]; warp = [mobius, beat].\n\nOperator transitions: when t reaches 1, the next operator is selected by a seeded PRNG (Wang hash) keyed on operator index and transition count. 70% probability of remaining in the same family. This is fully deterministic given the same parameter sequence.\n\nReference vector _refVec traces the triangle {(540, 54), (1026, 1026), (54, 1026)} on the canvas, completing 10 traversals per cycle. Canvas coordinates map to a unit sphere: theta = (sx/W) × 2π, phi = (sy/H) × π.\n\nSurface normals: _normalAt uses a 3-point forward-difference gradient. The centre height is supplied from the already-computed colour _process result; two neighbours are sampled at (x+1, y) and (x, y+1). The gradient yields a normal vector n which is transformed via the Blinn-Phong half-vector formula: output = (2n_z × n_x, 2n_z × n_y, 2n_z² − 1).\n\nColour: _toColor maps the final complex state to HSL: hue = ((state.phase − atan2(ref.y, ref.x)) / 2π + 1) % 1; lightness = 0.1 + 0.7 × (1 − exp(−|state| × 0.8)); saturation = min(1, 0.6 + 0.4 × |ref.z| × (0.5 + 0.5 × normal · ref)). _hslToRgb converts to RGB for the pixel buffer.'
        },
        {
            heading: 'PARAMETERS',
            body: 'Wave group — Amplitude (0.1–10, step 0.1, default 1.0): overall wave amplitude scalar. Frequency (0.05–0.5, step 0.01, default 0.251): spatial frequency in cycles per pixel. Speed (0.005–0.1, step 0.005, default 0.02): temporal phase advance per frame. Decay (0.0005–0.01, step 0.0005, default 0.002): distance amplitude falloff.\n\nSources group — Source 1–4 Loops (1–30, step 1, defaults 10 / 7 / 18 / 3): orbits per cycle. Sources 1 and 2 travel clockwise; 3 and 4 counter-clockwise. Starting offsets are 0, ½, ¼, and ¾ of the perimeter.\n\nOperators group — Op Speed 1–4 (0.0005–0.005, step 0.0005, defaults 0.002 / 0.0015 / 0.0025 / 0.001): operator blend rate per source. Changing any op speed resets all four operator states, causing a visual discontinuity.\n\nRender group — Resolution (1–6, step 1, default 2): pixel block size; 1 = full quality, 6 ≈ 6× faster. Cycle Frames (360–7200, step 360, default 3600): cycle period in frames; changing this value restarts operator state.'
        },
        {
            heading: 'PRESETS',
            body: 'Classic: default values (resolution 2, cycle 3600, source loops 10 / 7 / 18 / 3). Full-quality reference render at 60 fps target.\n\nFast Morph: amplitude 1.5, frequency 0.3, speed 0.03, decay 0.003, source loops 8 / 5 / 12 / 2, op speeds 0.004 / 0.003 / 0.005 / 0.002, cycle 2400. Higher op speeds produce faster visual evolution.\n\nLow Res: same wave parameters as Classic with resolution 4, giving approximately 2.25× fewer samples per frame at reduced pixel density.'
        },
        {
            heading: 'PERFORMANCE',
            body: 'Per pixel at resolution 1: approximately 270 arithmetic operations and 12+ transcendental function calls (sin, cos, sqrt, exp, atan2). At the default resolution 2: approximately 79 million ops per frame across 291,600 samples. Expected main-thread frame rate: 5–15 fps on modern desktop hardware; 60 fps requires GPU or WASM.\n\nNormal estimation uses a 3-point forward-difference scheme — one centre height (cached from the colour computation) and two neighbours. Total _process calls per pixel: 3 (down from 5 in the naive 4-point scheme), a 40% reduction.\n\nResolution 4: ~20M ops per frame, approximately 4× faster than default. Resolution 6: ~8.7M ops per frame, approximately 9× faster.\n\nTier 2 adaptive resolution is active: during slider interaction the canvas renders at 50% linear scale (25% pixel count), restoring full resolution 200 ms after the last input.'
        },
        {
            heading: 'ANIMATION',
            body: 'Type: loop. Default frame rate: 60 fps. Loop period: determined by the Cycle Frames parameter (default 3600 frames = 60 s at 60 fps).\n\nSource positions and wave phases are fully deterministic — the same frame with the same parameters always produces the same wave values. Operator evolution is deterministic: transitions use a Wang-hash PRNG seeded by operator index and transition count, producing reproducible operator sequences from a given initial state.\n\nAnimatable parameters (support meaningful interpolation during playback): Amplitude, Frequency, Speed, Decay, Source 1–4 Loops. Op Speed parameters and Resolution are excluded; the former triggers an operator state reset and the latter causes a quality discontinuity.'
        },
        {
            heading: 'KNOWN LIMITATIONS',
            body: 'Changing any Op Speed parameter resets all four operator states simultaneously, causing a visible discontinuity. No per-operator smooth speed update is implemented.\n\nThe Cycle Frames parameter defines the visual cycle period and also sets the GIF export loop length. Changing Cycle Frames mid-session requires a restart to synchronise the export loop length.\n\nAt resolution 1, main-thread rendering is not interactive (estimated 5–15 fps). Use resolution 4 or higher for real-time parameter exploration; use resolution 1–2 for export.\n\nSurface normals use a forward-difference gradient (asymmetric stencil), which may introduce a slight directional bias in specular highlights relative to a symmetric central-difference scheme.'
        },
        {
            heading: 'REFERENCES',
            body: 'Origin: port of Wave_interference_colour sketch. Complex wave superposition: standard monochromatic wave model with complex amplitude representation. Möbius transformation: fractional linear map (az + b) / (cz + d). Smootherstep: Ken Perlin 5th-order polynomial 6t⁵ − 15t⁴ + 10t³. HSL-to-RGB: IEC 61966-2-1 algorithm. Blinn-Phong half-vector: 2(n · h)n − h shading model. Wang hash PRNG: deterministic integer hash for seeded randomness.'
        }
    ],

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
                { key: 'resolution',  type: 'slider', label: 'Resolution',   min: 1, max: 6,    step: 1,   default: 2 },
                { key: 'cycleFrames', type: 'slider', label: 'Cycle Frames', min: 360, max: 7200, step: 360, default: 3600, recomputeOnChange: true }
            ]
        }
    ],

    presets: [
        {
            name: 'Classic',
            values: {
                amplitude: 1.0, frequency: 0.251, speed: 0.02, decay: 0.002,
                s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
                opSpeed1: 0.002, opSpeed2: 0.0015, opSpeed3: 0.0025, opSpeed4: 0.001,
                resolution: 2, cycleFrames: 3600
            }
        },
        {
            name: 'Fast Morph',
            values: {
                amplitude: 1.5, frequency: 0.3, speed: 0.03, decay: 0.003,
                s1Loops: 8, s2Loops: 5, s3Loops: 12, s4Loops: 2,
                opSpeed1: 0.004, opSpeed2: 0.003, opSpeed3: 0.005, opSpeed4: 0.002,
                resolution: 2, cycleFrames: 2400
            }
        },
        {
            name: 'Low Res',
            values: {
                amplitude: 1.0, frequency: 0.251, speed: 0.02, decay: 0.002,
                s1Loops: 10, s2Loops: 7, s3Loops: 18, s4Loops: 3,
                opSpeed1: 0.002, opSpeed2: 0.0015, opSpeed3: 0.0025, opSpeed4: 0.001,
                resolution: 4, cycleFrames: 3600
            }
        }
    ],

    // loopFrames is synchronised to cycleFrames in p5Setup (recomputeOnChange on cycleFrames)
    animation: {
        type: 'loop',
        loopFrames: 3600,
        defaultFps: 60,
        animatableParams: ['amplitude', 'frequency', 'speed', 'decay', 's1Loops', 's2Loops', 's3Loops', 's4Loops'],
        sequencer: true,
    },

    export: { png: true, gif: true, webm: false },

    compute: { cost: 'per-pixel', interactionScale: 0.5, idleDelay: 200 },

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

    // 3-point forward-difference normal. centreHeight is the magnitude already computed
    // for the colour sample, eliminating one _process call per pixel (40% reduction vs 4-point).
    _normalAt(px, py, sources, time, params, centreHeight) {
        const hC = centreHeight !== undefined ? centreHeight : this._heightAt(px, py, sources, time, params);
        const hR = this._heightAt(px + 1, py,     sources, time, params);
        const hU = this._heightAt(px,     py + 1, sources, time, params);
        const n = new _Vector3(-(hR - hC), -(hU - hC), 1).normalize();
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
        this._opStates = initOps.map((op, i) => ({
            current: op,
            next: _pickNextOp(op, i * 100000),
            t: 0,
            speed: speeds[i],
            idx: i,
            transitionCount: 1
        }));
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
        this.animation.loopFrames = params.cycleFrames;
        this._initOpStates(params);
    },

    p5Draw(p, params, frame) {
        if (this._opNeedsReset(params)) this._initOpStates(params);

        const { s1Loops, s2Loops, s3Loops, s4Loops, resolution, cycleFrames } = params;
        const W = p.width, H = p.height;
        const time = frame;
        const perim = 2 * (W + H);

        for (const os of this._opStates) {
            os.t += os.speed;
            if (os.t >= 1) {
                os.current = os.next;
                os.next = _pickNextOp(os.current, os.idx * 100000 + os.transitionCount);
                os.transitionCount++;
                os.t = 0;
            }
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
                const normal = this._normalAt(x, y, sources, time, params, state.magnitude);
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
