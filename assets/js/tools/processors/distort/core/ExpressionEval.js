/**
 * DISTORT — expression evaluator for parameter drivers.
 *
 * Expression syntax:  starts with '='
 * Available scopes:
 *   constant  — pure literal value; no variable dependencies
 *   frame     — reads: seed, frame, frameCount, time
 *   pixel     — also reads: x, y, nx, ny, lum, r, g, b, a
 *
 * Available functions:
 *   sin cos tan abs floor ceil round min max pow sqrt log exp
 *   fract(v)              → v - floor(v)
 *   clamp(v, lo, hi)      → clamped value
 *   lerp(a, b, t)         → linear interpolation
 *   map(v,in0,in1,out0,out1) → remap v from [in0,in1] → [out0,out1]
 *   smoothstep(e0, e1, x) → cubic Hermite smooth step
 *   tri(t)                → triangle wave: |2*(frac(t)-0.5)| in [0,1]
 *   saw(t)                → sawtooth: frac(t) in [0,1)
 *   pulse(t, w)           → 1 if frac(t) < w, else 0
 *   noise(x, y, seed)     → value noise in [0,1]
 *   PI, E, TAU
 */

const _PIXEL_VARS = new Set(['x', 'y', 'nx', 'ny', 'lum', 'r', 'g', 'b', 'a']);
const _FRAME_VARS = new Set(['seed', 'frame', 'frameCount', 'time']);

// Value noise (deterministic, no imports)
function _noise2D(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  function h(px, py) {
    let v = ((seed ^ (px * 374761393)) ^ (py * 668265263)) >>> 0;
    v ^= v >>> 13; v = Math.imul(v, 1540483477) >>> 0; v ^= v >>> 15;
    return (v >>> 0) / 0xffffffff;
  }
  return (h(ix, iy) * (1 - ux) + h(ix + 1, iy) * ux) * (1 - uy) +
         (h(ix, iy + 1) * (1 - ux) + h(ix + 1, iy + 1) * ux) * uy;
}

const _FUNCS = {
  fract: v => v - Math.floor(v),
  clamp: (v, lo, hi) => v < lo ? lo : v > hi ? hi : v,
  lerp: (a, b, t) => a + (b - a) * t,
  map: (v, in0, in1, out0, out1) => out0 + (out1 - out0) * (v - in0) / (in1 - in0 || 1),
  smoothstep: (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0 || 1))); return t * t * (3 - 2 * t); },
  tri: t => Math.abs(2 * (t - Math.floor(t)) - 1),
  saw: t => t - Math.floor(t),
  pulse: (t, w) => ((t - Math.floor(t)) < w ? 1 : 0),
  noise: (x, y, seed = 42) => _noise2D(x, y, seed)
};

// Argument names for the compiled function (global scope)
const _GLOBAL_ARGS = [
  'seed', 'frame', 'frameCount', 'time',
  'PI', 'E', 'TAU',
  'sin', 'cos', 'tan', 'abs', 'floor', 'ceil', 'round', 'min', 'max', 'pow', 'sqrt', 'log', 'exp',
  'fract', 'clamp', 'lerp', 'map', 'smoothstep', 'tri', 'saw', 'pulse', 'noise'
];

// Pixel-scope args extend global
const _PIXEL_ARGS = ['x', 'y', 'nx', 'ny', 'lum', 'r', 'g', 'b', 'a', ..._GLOBAL_ARGS];

export class ExpressionEval {
  /** Return true if string is a driver expression (starts with '='). */
  static isExpression(str) {
    return typeof str === 'string' && str.startsWith('=');
  }

  /**
   * Classify expression scope (without leading '=').
   * @param {string} expr
   * @returns {'constant'|'frame'|'pixel'}
   */
  static classify(expr) {
    if (typeof expr !== 'string') return 'constant';
    for (const v of _PIXEL_VARS) if (new RegExp(`\\b${v}\\b`).test(expr)) return 'pixel';
    for (const v of _FRAME_VARS) if (new RegExp(`\\b${v}\\b`).test(expr)) return 'frame';
    return 'constant';
  }

  /**
   * Evaluate expression at frame scope (no per-pixel vars).
   * @param {string} expr - expression without leading '='
   * @param {{ seed?: number, frame?: number, frameCount?: number, time?: number }} vars
   * @returns {number|null}
   */
  static evaluate(expr, vars = {}) {
    return ExpressionEval._run(expr, _GLOBAL_ARGS, [
      vars.seed ?? 0, vars.frame ?? 0, vars.frameCount ?? 1, vars.time ?? 0,
      Math.PI, Math.E, Math.PI * 2,
      Math.sin, Math.cos, Math.tan, Math.abs, Math.floor, Math.ceil, Math.round, Math.min, Math.max, Math.pow, Math.sqrt, Math.log, Math.exp,
      _FUNCS.fract, _FUNCS.clamp, _FUNCS.lerp, _FUNCS.map, _FUNCS.smoothstep, _FUNCS.tri, _FUNCS.saw, _FUNCS.pulse, _FUNCS.noise
    ]);
  }

  /**
   * Evaluate expression at pixel scope.
   * @param {string} expr - expression without leading '='
   * @param {{ x, y, nx, ny, lum, r, g, b, a, seed, frame, frameCount, time }} vars
   * @returns {number|null}
   */
  static evaluatePixel(expr, vars = {}) {
    return ExpressionEval._run(expr, _PIXEL_ARGS, [
      vars.x ?? 0, vars.y ?? 0, vars.nx ?? 0, vars.ny ?? 0,
      vars.lum ?? 0, vars.r ?? 0, vars.g ?? 0, vars.b ?? 0, vars.a ?? 1,
      vars.seed ?? 0, vars.frame ?? 0, vars.frameCount ?? 1, vars.time ?? 0,
      Math.PI, Math.E, Math.PI * 2,
      Math.sin, Math.cos, Math.tan, Math.abs, Math.floor, Math.ceil, Math.round, Math.min, Math.max, Math.pow, Math.sqrt, Math.log, Math.exp,
      _FUNCS.fract, _FUNCS.clamp, _FUNCS.lerp, _FUNCS.map, _FUNCS.smoothstep, _FUNCS.tri, _FUNCS.saw, _FUNCS.pulse, _FUNCS.noise
    ]);
  }

  /**
   * Compile and cache a pixel-scope expression.
   * Returns a function (vars) → number|null for tight per-pixel loops.
   * @param {string} expr
   * @returns {(vars: object) => number|null}
   */
  static compilePixel(expr) {
    let fn;
    try {
      fn = new Function(..._PIXEL_ARGS, `"use strict"; return (${expr});`);
    } catch {
      return () => null;
    }
    return (vars) => {
      try {
        const v = fn(
          vars.x ?? 0, vars.y ?? 0, vars.nx ?? 0, vars.ny ?? 0,
          vars.lum ?? 0, vars.r ?? 0, vars.g ?? 0, vars.b ?? 0, vars.a ?? 1,
          vars.seed ?? 0, vars.frame ?? 0, vars.frameCount ?? 1, vars.time ?? 0,
          Math.PI, Math.E, Math.PI * 2,
          Math.sin, Math.cos, Math.tan, Math.abs, Math.floor, Math.ceil, Math.round, Math.min, Math.max, Math.pow, Math.sqrt, Math.log, Math.exp,
          _FUNCS.fract, _FUNCS.clamp, _FUNCS.lerp, _FUNCS.map, _FUNCS.smoothstep, _FUNCS.tri, _FUNCS.saw, _FUNCS.pulse, _FUNCS.noise
        );
        return typeof v === 'number' && isFinite(v) ? v : null;
      } catch { return null; }
    };
  }

  // Internal: run a compiled function with given arg list
  static _run(expr, argNames, argVals) {
    try {
      const fn = new Function(...argNames, `"use strict"; return (${expr});`);
      const result = fn(...argVals);
      return typeof result === 'number' && isFinite(result) ? result : null;
    } catch { return null; }
  }
}
