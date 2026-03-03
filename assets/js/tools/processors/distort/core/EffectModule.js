/**
 * DISTORT — EffectModule factory.
 *
 * Creates EffectNode subclasses from a declarative config object.
 * Module files import this + their algorithm(s), then call createEffectModule({...}).
 * They do NOT extend EffectNode directly, implement UI logic, or contain algorithm code.
 *
 * @example
 *   import { createEffectModule } from '../../core/EffectModule.js';
 *   import { gaussianBlurSeparable } from '../../../../../shared/algorithms/blur/gaussian.js';
 *
 *   export const GaussianBlurNode = createEffectModule({
 *     type: 'gaussblur', name: 'GAUSS BLUR', category: 'BLUR',
 *     params: {
 *       sigma:  { label: 'SIGMA',  min: 0.1, max: 30, step: 0.1, value: 2,  tier: 3, previewMax: 5 },
 *       passes: { label: 'PASSES', min: 1,   max: 3,  step: 1,   value: 1,  tier: 3, previewMax: 1 }
 *     },
 *     apply(src, dst, w, h, p) {
 *       gaussianBlurSeparable(src, dst, w, h, p.sigma, p.passes);
 *     }
 *   });
 */

import { EffectNode } from '../nodes/EffectNode.js';

/**
 * @typedef {Object} ParamDef
 * @property {number|string|boolean} value    - Default value. Must satisfy min ≤ value ≤ max for range params.
 * @property {string}                label    - UPPERCASE display label, max 16 chars.
 * @property {'range'|'select'|'toggle'} [type='range'] - Control type. Default: 'range'.
 * @property {number}                [min]    - Required for range params.
 * @property {number}                [max]    - Required for range params.
 * @property {number}                [step]   - Required for range params.
 * @property {string[]}              [options] - Required for select params. UPPERCASE strings.
 * @property {2|3|4|5}              tier     - UI tier. 3=primary, 4=secondary, 5=advanced. Never 2 (reserved for universal).
 * @property {number}               [previewMax] - In preview mode, param is capped to this value.
 * @property {number}               [previewMin] - In preview mode, param is floored to this value.
 * @property {boolean}              [driveable]  - Whether [+D] driver button is shown. Auto: true for range, false for select/toggle.
 * @property {string}               [unit]       - Unit suffix shown in UI: 'px', 'deg', '%', etc.
 */

/**
 * @typedef {Object} ModuleConfig
 * @property {string}   type        - Unique type key. Lowercase, no spaces or hyphens.
 * @property {string}   name        - Display name. UPPERCASE, max 20 chars.
 * @property {string}   category    - Registry category string. Must match a REGISTRY key.
 * @property {Object.<string, ParamDef>} params - Parameter definitions. Each key maps to one control.
 * @property {boolean}  [isLUT=false]    - True if node can participate in LUT chain optimisation.
 * @property {boolean}  [isVector=false] - True if node produces a LineSet (use applyVector, not apply).
 *
 * @property {function} [apply]
 *   (src: Uint8ClampedArray, dst: Uint8ClampedArray, w: number, h: number,
 *    p: Object, ctx: RenderContext,
 *    modulate: function(key: string, pixelIdx: number): number) => void
 *   - Required for pixel nodes. Receives pre-resolved (preview-capped) params in `p`.
 *   - `modulate(key, i)` returns the per-pixel modulated value; use inside pixel loops only.
 *   - Write result to `dst` directly; do not allocate new buffers.
 *
 * @property {function} [applyVector]
 *   (src: Uint8ClampedArray, w: number, h: number,
 *    p: Object, ctx: RenderContext) => LineSet
 *   - Required for vector nodes instead of apply.
 *
 * @property {function} [destroy]
 *   () => void
 *   - Optional cleanup called in addition to EffectNode.destroy().
 */

/**
 * Factory that produces an EffectNode subclass from a ModuleConfig.
 *
 * The returned class:
 *   - Extends EffectNode (inherits mask, modulation, cache, toJSON, fromJSON, destroy)
 *   - Resolves params (preview caps, modulation) before passing to config.apply
 *   - Exposes `modulate(key, pixelIdx, ctx)` for per-pixel variation inside apply
 *   - Sets blendMode to 'normal' by default (accessible to NodePanel / Pipeline)
 *   - Reads static config properties (type, name, category) for introspection
 *
 * @param {ModuleConfig} config
 * @returns {typeof EffectNode}
 */
export function createEffectModule(config) {
  _validateConfig(config);

  class Module extends EffectNode {
    static type     = config.type;
    static label    = config.name;
    static category = config.category;

    constructor() {
      super(config.type, config.name, config.params);
      this.category  = config.category;
      this.isLUT     = config.isLUT     ?? false;
      this.isVector  = config.isVector  ?? false;
      this.blendMode = 'normal';
    }

    apply(src, dst, w, h, ctx) {
      if (!config.apply) { dst.set(src); return; }
      const p        = this._resolveParams(ctx);
      const modulate = this._makeModulate(p, ctx);
      config.apply(src, dst, w, h, p, ctx, modulate);
    }

    applyVector(src, w, h, ctx) {
      if (!config.applyVector) return null;
      const p = this._resolveParams(ctx);
      return config.applyVector(src, w, h, p, ctx);
    }

    destroy() {
      config.destroy?.call(this);
      super.destroy();
    }

    // ── Internal helpers ─────────────────────────────────────────────────────

    /**
     * Build resolved param object.
     * For each param: apply preview caps from paramDef metadata.
     * Does NOT apply per-pixel modulation (that is modulate()'s job).
     */
    _resolveParams(ctx) {
      const resolved = {};
      const isPreview = ctx?.quality === 'preview';
      for (const [key, def] of Object.entries(this.paramDefs)) {
        let val = this.params[key];
        if (isPreview) {
          if (def.previewMax !== undefined) val = Math.min(val, def.previewMax);
          if (def.previewMin !== undefined) val = Math.max(val, def.previewMin);
        }
        resolved[key] = val;
      }
      return resolved;
    }

    /**
     * Returns a modulate function bound to this render context.
     * When called inside a pixel loop, returns per-pixel driver value if active,
     * otherwise returns the resolved (preview-capped) base value.
     * This is always safe to call — it short-circuits when no driver is active.
     */
    _makeModulate(resolvedParams, ctx) {
      return (key, pixelIdx) => {
        const mod = this.modulation[key];
        if (!mod?.mapId || !ctx?.modMaps) return resolvedParams[key];
        return this.getModulated(key, pixelIdx, ctx);
      };
    }
  }

  return Module;
}

// ── Config validation ─────────────────────────────────────────────────────────

function _validateConfig(cfg) {
  if (!cfg.type   || typeof cfg.type   !== 'string') throw new Error('[EffectModule] config.type is required and must be a string');
  if (!cfg.name   || typeof cfg.name   !== 'string') throw new Error('[EffectModule] config.name is required and must be a string');
  if (!cfg.category)                                  throw new Error('[EffectModule] config.category is required');
  if (!cfg.params || typeof cfg.params !== 'object') throw new Error('[EffectModule] config.params is required');
  if (cfg.isVector && !cfg.applyVector)              throw new Error(`[EffectModule] ${cfg.type}: isVector=true requires applyVector()`);
  if (!cfg.isVector && !cfg.apply && !cfg.applyVector) {
    console.warn(`[EffectModule] ${cfg.type}: no apply() or applyVector() — node will pass through`);
  }
  for (const [key, def] of Object.entries(cfg.params)) {
    if (!def.label) throw new Error(`[EffectModule] ${cfg.type}.params.${key}: label is required`);
    if (def.tier === 2) throw new Error(`[EffectModule] ${cfg.type}.params.${key}: tier 2 is reserved for universal controls (opacity, blendMode)`);
    const t = def.type ?? 'range';
    if (t === 'range' && (def.min === undefined || def.max === undefined || def.step === undefined)) {
      throw new Error(`[EffectModule] ${cfg.type}.params.${key}: range params require min, max, step`);
    }
    if (t === 'select' && (!Array.isArray(def.options) || def.options.length === 0)) {
      throw new Error(`[EffectModule] ${cfg.type}.params.${key}: select params require options array`);
    }
  }
}
