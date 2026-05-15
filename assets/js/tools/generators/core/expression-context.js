/**
 * Expression Context — sandboxed context for the expression driver.
 *
 * Single source of truth for:
 *   - the variables/helpers available in every expression driver body
 *   - the schema surfaced by the contextual cheat-sheet popover
 *
 * Usage (by driver-registry.js expression driver):
 *   const ctx = buildContext({ t, frame, fps, loop, speed, params, mods, canvas });
 *   const result = fn(ctx);   // fn = new Function('ctx', `with(ctx){ return ${src}; }`)
 *
 * Usage (by cheat-sheet popover):
 *   import { EXPRESSION_CONTEXT_SCHEMA } from './expression-context.js';
 */

import { DriverRegistry } from './driver-registry.js';

// ─── Pure math helpers ────────────────────────────────────────────────────────

const TAU = Math.PI * 2;
const PI  = Math.PI;
const E   = Math.E;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a, b, t)     { return a + (b - a) * t; }
function wrap(v, lo, hi)   { const r = hi - lo; return ((v - lo) % r + r) % r + lo; }
function map(v, a, b, c, d){ return c + (v - a) / (b - a) * (d - c); }
function smoothstep(lo, hi, v) {
    const t = clamp((v - lo) / (hi - lo), 0, 1);
    return t * t * (3 - 2 * t);
}
function sign(v)  { return v < 0 ? -1 : v > 0 ? 1 : 0; }
function fract(v) { return v - Math.floor(v); }
function mix(a, b, t) { return a * (1 - t) + b * t; }

// ─── Colour helpers ───────────────────────────────────────────────────────────

/**
 * @param {number} h - Hue 0–360
 * @param {number} s - Saturation 0–100
 * @param {number} l - Lightness 0–100
 * @returns {string} CSS hsl() string
 */
function hsl(h, s, l)      { return `hsl(${h},${s}%,${l}%)`; }

/**
 * @param {number} r - Red   0–255
 * @param {number} g - Green 0–255
 * @param {number} b - Blue  0–255
 * @returns {string} CSS rgb() string
 */
function rgb(r, g, b)      { return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`; }

/**
 * Linearly interpolate two hex colours.
 * @param {string} a - Hex colour e.g. '#ff0000'
 * @param {string} b - Hex colour
 * @param {number} t - 0–1
 * @returns {string} Interpolated hex
 */
function mixColour(a, b, t) {
    const h2n = h => parseInt(h.replace('#', ''), 16);
    const ar = h2n(a.slice(1, 3) || '00'), ag = h2n(a.slice(3, 5) || '00'), ab_ = h2n(a.slice(5, 7) || '00');
    const br = h2n(b.slice(1, 3) || '00'), bg = h2n(b.slice(3, 5) || '00'), bb = h2n(b.slice(5, 7) || '00');
    const rr = Math.round(lerp(ar, br, t)).toString(16).padStart(2, '0');
    const rg = Math.round(lerp(ag, bg, t)).toString(16).padStart(2, '0');
    const rb = Math.round(lerp(ab_, bb, t)).toString(16).padStart(2, '0');
    return `#${rr}${rg}${rb}`;
}

/**
 * Sample a gradient (array of {t, colour}) at position t.
 * @param {Array<{t:number, colour:string}>} stops
 * @param {number} t - 0–1
 * @returns {string} Hex colour
 */
function gradient(stops, t) {
    if (!stops || stops.length === 0) return '#000000';
    const sorted = [...stops].sort((a, b) => a.t - b.t);
    if (t <= sorted[0].t) return sorted[0].colour;
    if (t >= sorted[sorted.length - 1].t) return sorted[sorted.length - 1].colour;
    for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i], b = sorted[i + 1];
        if (t >= a.t && t <= b.t) {
            const u = (t - a.t) / (b.t - a.t);
            return mixColour(a.colour, b.colour, u);
        }
    }
    return '#000000';
}

// ─── Noise helper (simple value noise — no dependency) ───────────────────────

function _hash(n) {
    let x = Math.sin(n) * 43758.5453123;
    return x - Math.floor(x);
}

/**
 * 1-D smooth noise, returns 0–1.
 * @param {number} x
 */
function noise(x) {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f); // smoothstep
    return lerp(_hash(i), _hash(i + 1), u);
}

/**
 * Integer hash, deterministic seeded random 0–1.
 * @param {number} n
 */
function hash(n) { return _hash(n); }

// ─── Context factory ─────────────────────────────────────────────────────────

/**
 * Build the sandboxed object passed to expression driver function bodies.
 *
 * @param {Object} opts
 * @param {number} opts.t      - Normalised loop position [0, 1)
 * @param {number} opts.frame  - Absolute frame counter
 * @param {number} [opts.fps]  - Frames per second
 * @param {number} [opts.loop] - Loop length in frames
 * @param {number} [opts.speed]- Playback speed multiplier
 * @param {Object} [opts.params]   - Current param values snapshot
 * @param {Object} [opts.mods]     - Current modulator output snapshot
 * @param {Object} [opts.prev]     - Previous frame param values
 * @param {Object} [opts.canvas]   - { width, height }
 * @param {Object} [opts.audio]    - Audio analysis data (if available)
 * @param {Object} [opts.pointer]  - Pointer state { x, y, down }
 * @returns {Object}
 */
export function buildContext({ t = 0, frame = 0, fps = 60, loop = 360,
    speed = 1, params = {}, mods = {}, prev = {},
    canvas = { width: 800, height: 800 }, audio = null, pointer = null } = {}) {
    return {
        // Timing
        t, frame, fps, loop, speed,

        // Constants
        TAU, PI, E,

        // Data
        params, mods, prev, canvas, audio, pointer,

        // Math — shorthand for common functions
        sin:   Math.sin,
        cos:   Math.cos,
        tan:   Math.tan,
        abs:   Math.abs,
        floor: Math.floor,
        ceil:  Math.ceil,
        round: Math.round,
        sqrt:  Math.sqrt,
        pow:   Math.pow,
        min:   Math.min,
        max:   Math.max,
        log:   Math.log,
        exp:   Math.exp,

        // Helpers
        clamp, lerp, wrap, map, smoothstep, sign, fract, mix,

        // Noise
        noise, hash,

        // Colour
        hsl, rgb, mix: mixColour, gradient,
    };
}

// ─── Schema (for cheat-sheet popover) ────────────────────────────────────────

/**
 * Structured schema for the contextual cheat-sheet popover.
 * Each group: { label, items: [{ name, type, description }] }
 */
export const EXPRESSION_CONTEXT_SCHEMA = [
    {
        label: 'Timing',
        items: [
            { name: 't',     type: 'number', description: 'Normalised loop position [0, 1)' },
            { name: 'frame', type: 'number', description: 'Absolute frame counter (integer)' },
            { name: 'fps',   type: 'number', description: 'Frames per second' },
            { name: 'loop',  type: 'number', description: 'Loop length in frames' },
            { name: 'speed', type: 'number', description: 'Playback speed multiplier' },
        ],
    },
    {
        label: 'Constants',
        items: [
            { name: 'TAU', type: 'number', description: 'τ = 2π ≈ 6.2832' },
            { name: 'PI',  type: 'number', description: 'π ≈ 3.1416' },
            { name: 'E',   type: 'number', description: 'Euler\'s number ≈ 2.7183' },
        ],
    },
    {
        label: 'Data',
        items: [
            { name: 'params',  type: 'Object', description: 'Current param values (read-only snapshot)' },
            { name: 'mods',    type: 'Object', description: 'Post-combine values of other modulators this frame' },
            { name: 'prev',    type: 'Object', description: 'Previous frame param values (for feedback)' },
            { name: 'canvas',  type: 'Object', description: '{ width, height } of canvas in pixels' },
            { name: 'audio',   type: 'Object|null', description: 'Audio analysis data (if audio input active)' },
            { name: 'pointer', type: 'Object|null', description: '{ x, y, down } normalised pointer state' },
        ],
    },
    {
        label: 'Math',
        items: [
            { name: 'sin(x)',  type: 'fn→number', description: 'Sine (radians)' },
            { name: 'cos(x)',  type: 'fn→number', description: 'Cosine (radians)' },
            { name: 'tan(x)',  type: 'fn→number', description: 'Tangent (radians)' },
            { name: 'abs(x)',  type: 'fn→number', description: 'Absolute value' },
            { name: 'floor(x)', type: 'fn→number', description: 'Floor to integer' },
            { name: 'ceil(x)', type: 'fn→number', description: 'Ceil to integer' },
            { name: 'round(x)', type: 'fn→number', description: 'Round to nearest integer' },
            { name: 'sqrt(x)', type: 'fn→number', description: 'Square root' },
            { name: 'pow(b,e)', type: 'fn→number', description: 'b raised to e' },
            { name: 'min(a,b)', type: 'fn→number', description: 'Smaller of a, b' },
            { name: 'max(a,b)', type: 'fn→number', description: 'Larger of a, b' },
            { name: 'log(x)',  type: 'fn→number', description: 'Natural logarithm' },
            { name: 'exp(x)',  type: 'fn→number', description: 'e^x' },
        ],
    },
    {
        label: 'Helpers',
        items: [
            { name: 'clamp(v,lo,hi)',       type: 'fn→number', description: 'Constrain v to [lo, hi]' },
            { name: 'lerp(a,b,t)',          type: 'fn→number', description: 'Linear interpolate a→b by t' },
            { name: 'wrap(v,lo,hi)',        type: 'fn→number', description: 'Wrap v into [lo, hi)' },
            { name: 'map(v,a,b,c,d)',       type: 'fn→number', description: 'Remap v from [a,b] to [c,d]' },
            { name: 'smoothstep(lo,hi,v)',  type: 'fn→number', description: 'Smooth 0–1 transition' },
            { name: 'sign(v)',              type: 'fn→number', description: '-1, 0, or 1' },
            { name: 'fract(v)',             type: 'fn→number', description: 'Fractional part of v' },
            { name: 'mix(a,b,t)',           type: 'fn→number', description: 'Alias of lerp' },
        ],
    },
    {
        label: 'Noise',
        items: [
            { name: 'noise(x)', type: 'fn→number', description: 'Smooth value noise, returns 0–1' },
            { name: 'hash(n)',  type: 'fn→number', description: 'Deterministic pseudo-random 0–1 for integer n' },
        ],
    },
    {
        label: 'Colour',
        items: [
            { name: 'hsl(h,s,l)',          type: 'fn→string', description: 'CSS hsl() string — h:0-360, s:0-100, l:0-100' },
            { name: 'rgb(r,g,b)',          type: 'fn→string', description: 'CSS rgb() string — r,g,b: 0-255' },
            { name: 'mix(hexA,hexB,t)',    type: 'fn→string', description: 'Linearly interpolate two hex colours by t' },
            { name: 'gradient(stops,t)',   type: 'fn→string', description: 'Sample a [{t,colour}] stop array at t' },
        ],
    },
];
