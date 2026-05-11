/**
 * Driver Registry — built-in modulation drivers for the generator system.
 *
 * Each driver produces a numeric signal per frame fed into the modulation pipeline:
 *   driver.sample(state, t, frame, ctx) -> number
 *
 * where:
 *   state  — mutable per-modulator state object (initialised by driver.init())
 *   t      — normalised time within the current loop [0, 1)
 *   frame  — absolute frame counter
 *   ctx    — expression context (see expression-context.js)
 *
 * Registry API mirrors script-registry.js:
 *   register(driver)      — register a custom driver at runtime
 *   get(type)             — retrieve a driver descriptor (throws if unknown)
 *   list()                — array of all registered driver descriptors
 *   has(type)             — boolean existence check
 */

const TAU = Math.PI * 2;

// ─── Built-in drivers ─────────────────────────────────────────────────────────

/**
 * LFO — oscillates between -1 and +1 at a given rate.
 * Config: { waveform: 'sine'|'square'|'triangle'|'sawtooth', rate: number (Hz or cycles/loop) }
 */
const DRIVER_LFO = {
    id:    'lfo',
    label: 'LFO',
    parameters: [
        { key: 'waveform', type: 'dropdown', label: 'Waveform', default: 'sine',
          options: ['sine', 'square', 'triangle', 'sawtooth'] },
        { key: 'rate',     type: 'slider',   label: 'Rate',     default: 1, min: 0.01, max: 20, step: 0.01 },
        { key: 'phase',    type: 'slider',   label: 'Phase',    default: 0, min: 0, max: 1, step: 0.01 },
    ],
    defaults: { waveform: 'sine', rate: 1, phase: 0 },
    init(config) {
        return { waveform: config.waveform ?? 'sine', rate: config.rate ?? 1, phase: config.phase ?? 0 };
    },
    sample(state, t, _frame, _ctx) {
        const phase = (t * state.rate + state.phase) % 1;
        switch (state.waveform) {
            case 'square':   return phase < 0.5 ? 1 : -1;
            case 'triangle': return 1 - 4 * Math.abs(phase - 0.5);
            case 'sawtooth': return phase * 2 - 1;
            default:         return Math.sin(phase * TAU); // sine
        }
    },
};

/**
 * Linear — ramps at a constant rate (constant drift or rotation).
 * Config: { rate: number (units per frame) }
 * Returns the accumulated offset (not bounded).
 */
const DRIVER_LINEAR = {
    id:    'linear',
    label: 'Linear',
    parameters: [
        { key: 'rate', type: 'slider', label: 'Rate (per frame)', default: 0.01,
          min: -1, max: 1, step: 0.0001 },
    ],
    defaults: { rate: 0.01 },
    init(config) {
        return { rate: config.rate ?? 0.01, accumulator: 0 };
    },
    sample(state, _t, _frame, _ctx) {
        state.accumulator += state.rate;
        return state.accumulator;
    },
};

/**
 * Expression — user-typed function body evaluated in a sandboxed context.
 * Config: { expression: string } — body of a function that returns a number.
 * See expression-context.js for available variables.
 */
const DRIVER_EXPRESSION = {
    id:    'expression',
    label: 'Expression',
    parameters: [
        { key: 'expression', type: 'code', label: 'Expression', default: 'sin(t * TAU)' },
    ],
    defaults: { expression: 'sin(t * TAU)' },
    init(config) {
        const src = config.expression ?? 'sin(t * TAU)';
        let fn;
        try {
            // eslint-disable-next-line no-new-func
            fn = new Function('ctx', `with(ctx){ return (${src}); }`);
        } catch (e) {
            console.error('[driver-registry] Expression compile error:', e.message);
            fn = () => 0;
        }
        return { fn, src };
    },
    sample(state, t, frame, ctx) {
        try {
            return state.fn({ ...ctx, t, frame }) ?? 0;
        } catch (e) {
            return 0;
        }
    },
};

/**
 * Param-ref — maps the current value of another param to a 0–1 signal.
 * Config: { sourceKey: string, min: number, max: number }
 */
const DRIVER_PARAM_REF = {
    id:    'param-ref',
    label: 'Param Ref',
    parameters: [
        { key: 'sourceKey', type: 'text',   label: 'Source param', default: '' },
        { key: 'min',       type: 'slider', label: 'Min',          default: 0, min: -1e6, max: 1e6 },
        { key: 'max',       type: 'slider', label: 'Max',          default: 1, min: -1e6, max: 1e6 },
    ],
    defaults: { sourceKey: '', min: 0, max: 1 },
    init(config) {
        return { sourceKey: config.sourceKey ?? '', min: config.min ?? 0, max: config.max ?? 1 };
    },
    sample(state, _t, _frame, ctx) {
        const raw = ctx.params?.[state.sourceKey] ?? 0;
        const range = state.max - state.min;
        return range !== 0 ? (raw - state.min) / range * 2 - 1 : 0;
    },
};

/**
 * Curve — keyframe spline over a single loop [0, 1] → value.
 * Config: { stops: Array<{ t: number, v: number }> } — sorted by t.
 * Returns the linearly interpolated value between surrounding stops.
 */
const DRIVER_CURVE = {
    id:    'curve',
    label: 'Curve',
    parameters: [
        { key: 'stops', type: 'curve-editor', label: 'Curve', default: [{ t: 0, v: -1 }, { t: 1, v: 1 }] },
    ],
    defaults: { stops: [{ t: 0, v: -1 }, { t: 1, v: 1 }] },
    init(config) {
        const stops = (config.stops ?? [{ t: 0, v: -1 }, { t: 1, v: 1 }])
            .slice()
            .sort((a, b) => a.t - b.t);
        return { stops };
    },
    sample(state, t, _frame, _ctx) {
        const { stops } = state;
        if (stops.length === 0) return 0;
        if (t <= stops[0].t) return stops[0].v;
        if (t >= stops[stops.length - 1].t) return stops[stops.length - 1].v;
        for (let i = 0; i < stops.length - 1; i++) {
            const a = stops[i], b = stops[i + 1];
            if (t >= a.t && t <= b.t) {
                const u = (t - a.t) / (b.t - a.t);
                return a.v + u * (b.v - a.v);
            }
        }
        return 0;
    },
};

/**
 * Link — sidechains another modulator's output (post-combine) as input.
 * Config: { sourceTargetKey: string, scale: number }
 */
const DRIVER_LINK = {
    id:    'link',
    label: 'Link',
    parameters: [
        { key: 'sourceTargetKey', type: 'text',   label: 'Source modulator target', default: '' },
        { key: 'scale',           type: 'slider', label: 'Scale', default: 1, min: -10, max: 10, step: 0.01 },
    ],
    defaults: { sourceTargetKey: '', scale: 1 },
    init(config) {
        return { sourceTargetKey: config.sourceTargetKey ?? '', scale: config.scale ?? 1 };
    },
    sample(state, _t, _frame, ctx) {
        const val = ctx.mods?.[state.sourceTargetKey] ?? 0;
        return val * state.scale;
    },
};

/**
 * Noise — smooth Perlin-like noise field sampled along a time axis.
 * Config: { speed: number, seed: number }
 * Returns a value in [-1, 1].
 */
const DRIVER_NOISE = {
    id:    'noise',
    label: 'Noise',
    parameters: [
        { key: 'speed', type: 'slider', label: 'Speed', default: 0.5,  min: 0.001, max: 10, step: 0.001 },
        { key: 'seed',  type: 'slider', label: 'Seed',  default: 0,    min: 0, max: 1000, step: 1 },
    ],
    defaults: { speed: 0.5, seed: 0 },
    init(config) {
        return { speed: config.speed ?? 0.5, seed: config.seed ?? 0, cursor: config.seed ?? 0 };
    },
    sample(state, _t, _frame, ctx) {
        state.cursor += state.speed * 0.01;
        return ctx.noise ? ctx.noise(state.cursor) * 2 - 1 : Math.sin(state.cursor * TAU) * 0.5;
    },
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const _registry = new Map();

function _register(driver) {
    if (!driver.id || typeof driver.id !== 'string') throw new Error('Driver must have string id');
    if (typeof driver.sample !== 'function')         throw new Error(`Driver "${driver.id}" missing sample()`);
    if (typeof driver.init   !== 'function')         throw new Error(`Driver "${driver.id}" missing init()`);
    _registry.set(driver.id, driver);
}

[DRIVER_LFO, DRIVER_LINEAR, DRIVER_EXPRESSION, DRIVER_PARAM_REF,
 DRIVER_CURVE, DRIVER_LINK, DRIVER_NOISE].forEach(_register);

export const DriverRegistry = {
    /**
     * Register a custom driver at runtime.
     * @param {Object} driver
     */
    register(driver) { _register(driver); },

    /**
     * Retrieve a driver by type string.
     * @param {string} type
     * @returns {Object} Driver descriptor
     * @throws {Error} If unknown type
     */
    get(type) {
        const d = _registry.get(type);
        if (!d) throw new Error(`[driver-registry] Unknown driver type: "${type}"`);
        return d;
    },

    /**
     * @param {string} type
     * @returns {boolean}
     */
    has(type) { return _registry.has(type); },

    /**
     * @returns {Object[]} All registered driver descriptors
     */
    list() { return [..._registry.values()]; },
};
