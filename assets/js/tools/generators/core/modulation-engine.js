/**
 * Modulation Engine — pure driver→shape→range→combine pipeline.
 *
 * Replaces the per-modulator LFO logic in generative-tool-host.js
 * (updatePhaseAnimations). Called once per frame.
 *
 * Entry point:
 *   evaluateModulators(modulators, params, frame, ctx)
 *
 * Each modulator runs four stages:
 *   1. driver.sample()   → raw signal (number, unbounded)
 *   2. shape stage       → easing / quantise / smooth / invert
 *   3. range stage       → clamp to [min, max], apply depth and bias
 *   4. combine stage     → merge with current params[targetKey]
 *
 * No side effects outside the provided params object.
 */

import { DriverRegistry } from './driver-registry.js';

// ─── Easing helpers ───────────────────────────────────────────────────────────

function _ease(v, mode) {
    const t = Math.max(0, Math.min(1, (v + 1) / 2)); // normalise -1..1 → 0..1
    let out;
    switch (mode) {
        case 'ease-in':     out = t * t; break;
        case 'ease-out':    out = t * (2 - t); break;
        case 'ease-in-out': out = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; break;
        default:            out = t; // linear
    }
    return out * 2 - 1; // back to -1..1
}

// ─── Per-modulator state store ────────────────────────────────────────────────

// mutable, keyed by modulator identity (index or targetKey+index)
const _stateStore = new WeakMap();

function _getState(modulator, modulators) {
    if (!_stateStore.has(modulators)) _stateStore.set(modulators, new Map());
    const map = _stateStore.get(modulators);
    if (!map.has(modulator)) {
        const driver = DriverRegistry.get(modulator.driver.type);
        map.set(modulator, {
            driverState: driver.init(modulator.driver.config ?? {}),
            smooth:      modulator.shape?.smooth ?? 0,
            smoothVal:   null,
        });
    }
    return map.get(modulator);
}

// ─── Pipeline stages ─────────────────────────────────────────────────────────

function _applyShape(raw, shape) {
    if (!shape) return raw;
    let v = raw;
    if (shape.easing && shape.easing !== 'linear') v = _ease(v, shape.easing);
    if (shape.invert) v = -v;
    return v;
}

function _applySmooth(v, state) {
    const rate = state.smooth;
    if (!rate) { state.smoothVal = v; return v; }
    if (state.smoothVal === null) state.smoothVal = v;
    state.smoothVal += (v - state.smoothVal) * Math.min(1, rate);
    return state.smoothVal;
}

function _applyQuantise(v, step) {
    if (!step) return v;
    return Math.round(v / step) * step;
}

function _applyRange(v, range, baseValue) {
    if (!range) return v;
    const depth   = range.depth   ?? 1;
    const bias    = range.bias    ?? 0;
    const bipolar = range.bipolar ?? true;
    const swing = v * depth;
    let result;
    if (bipolar) {
        result = baseValue + swing + bias;
    } else {
        result = baseValue + (swing * 0.5 + 0.5) * depth + bias;
    }
    if (range.min != null) result = Math.max(range.min, result);
    if (range.max != null) result = Math.min(range.max, result);
    return result;
}

function _applyCombine(current, modulated, mode) {
    switch (mode) {
        case 'multiply': return current * modulated;
        case 'replace':  return modulated;
        case 'drift':    return current + modulated; // alias of add but signals intent
        case 'max':      return Math.max(current, modulated);
        case 'min':      return Math.min(current, modulated);
        default:         return current + modulated; // add
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Evaluate all active modulators for one frame, writing results into params.
 *
 * @param {import('./script-types.js').ModulatorDescriptor[]} modulators
 * @param {Object} params  - Script param object (mutated in-place)
 * @param {number} frame   - Absolute frame counter
 * @param {Object} ctx     - Expression context (from expression-context.js buildContext())
 *                           Must include: t, fps, loop, speed, params, mods
 * @returns {Object} params (same reference)
 */
export function evaluateModulators(modulators, params, frame, ctx) {
    if (!modulators || modulators.length === 0) return params;

    // mods accumulator — downstream modulators can read previous writes
    const mods = ctx.mods ?? {};

    for (const mod of modulators) {
        if (!mod.enabled) continue;
        if (!DriverRegistry.has(mod.driver?.type)) {
            console.warn(`[modulation-engine] Unknown driver: "${mod.driver?.type}" on "${mod.targetKey}"`);
            continue;
        }

        const state = _getState(mod, modulators);

        // 1. Driver
        const driver = DriverRegistry.get(mod.driver.type);
        let raw = driver.sample(state.driverState, ctx.t ?? 0, frame, { ...ctx, mods });

        // 2. Shape
        raw = _applyShape(raw, mod.shape);
        raw = _applySmooth(raw, state);
        if (mod.shape?.quantise) raw = _applyQuantise(raw, mod.shape.quantise);

        // 3. Range
        const baseValue = params[mod.targetKey] ?? 0;
        const ranged = _applyRange(raw, mod.range, baseValue);

        // 4. Combine
        const current = params[mod.targetKey] ?? 0;
        params[mod.targetKey] = _applyCombine(current, ranged, mod.combine ?? 'add');

        // expose post-combine value for downstream link drivers
        mods[mod.targetKey] = params[mod.targetKey];
    }

    return params;
}

/**
 * Reset all driver states for a given modulators array (e.g. on script reload).
 * @param {Array} modulators
 */
export function resetModulators(modulators) {
    if (_stateStore.has(modulators)) {
        _stateStore.delete(modulators);
    }
}
