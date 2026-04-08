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
 *
 * @property {function} [buildGeometry]
 *   (w, h, p, ctx, srcPixels) => Array<line[]>
 *   - Optional polylines for SVG export; srcPixels = pipeline source RGBA at (w,h).
 *
 * @property {boolean} [forceWorkerPreview=false]
 *   - When true, preview renders use WorkerBridge instead of main-thread Pipeline.
 *
 * @property {Array<{type: string, options?: object, paramKeys?: Object.<string, string>}>} [extendedControls=[]]
 *   - Extra ComponentLibrary controls; `type` is kebab-case. `paramKeys` maps control state keys to `params` keys.
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
  _normalizeParamDefs(config.params);

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

    /** @returns {Array<Array<[number, number]>>} */
    buildGeometry(w, h, ctx, srcPixels) {
      if (!config.buildGeometry) return [];
      const p = this._resolveParams(ctx);
      return config.buildGeometry(w, h, p, ctx, srcPixels) || [];
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
        if (key === '__opacity__') continue;
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
        if (key === '__opacity__') {
          const mod = this.modulation[key];
          if (!mod) return this.opacity;
          const modeO = mod.mode || mod.type || 'none';
          if (modeO === 'none') return this.opacity;
          if (modeO === 'image' && (!mod.mapId || !ctx?.modMaps)) return this.opacity;
          return this.getModulated(key, pixelIdx, ctx);
        }
        const mod = this.modulation[key];
        if (!mod) return resolvedParams[key];
        const mode = mod.mode || mod.type || 'none';
        if (mode === 'none') return resolvedParams[key];
        if (mode === 'image' && (!mod.mapId || !ctx?.modMaps)) return resolvedParams[key];
        return this.getModulated(key, pixelIdx, ctx);
      };
    }
  }

  Module.hasVectorExport = typeof config.buildGeometry === 'function';
  Module.forceWorkerPreview = config.forceWorkerPreview === true;
  Module.extendedControls = config.extendedControls ?? [];

  return Module;
}

// ── G2 / G16 — default driveable + unit for every range param (modular-synth: every knob is a modulation target) ──

function _inferUnit(key, def) {
  const k = key.toLowerCase();
  const label = (def.label || '').toUpperCase();
  if (k === 'centrex' || k === 'centrey' || k.includes('centre')) return '0–1';
  if (k === 'passes' || k === 'samples' || k === 'octaves') return 'n';
  if (k.includes('sigma') || label.includes('SIGMA')) return 'σ';
  if (k.includes('angle') || label.includes('ANGLE')) return 'deg';
  if ((k.includes('phase') || label.includes('PHASE')) && def.max <= 7 && def.min >= 0) return 'rad';
  if (k.includes('frame') || label.includes('FRAME')) return 'frames';
  if (label.includes('THRESH') || k.includes('threshold')) return def.max <= 1 ? '0–1' : 'lvl';
  if (def.max === 255 && def.min === 0 && Number(def.step) >= 1) return 'lvl';
  if (def.max <= 1 && def.min >= 0 && def.step <= 0.05) return '0–1';
  if (label.includes('WEIGHT') || k.endsWith('r') || k.endsWith('g') || k.endsWith('b')) return '0–1';
  if (k.includes('freq') || label.includes('FREQ')) return 'Hz';
  if (k.includes('speed') || label.includes('SPEED')) return '0–1';
  if (def.max >= 50 && def.max <= 10000) return 'px';
  return '0–1';
}

function _normalizeParamDefs(params) {
  for (const [key, def] of Object.entries(params)) {
    const t = def.type ?? 'range';
    if (t === 'internal') continue;
    if (t !== 'range') continue;
    if (def.driveable === undefined) def.driveable = true;
    if (!def.unit || def.unit === '') def.unit = _inferUnit(key, def);
  }
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
    if (t === 'internal') continue;
    if (t === 'range' && (def.min === undefined || def.max === undefined || def.step === undefined)) {
      throw new Error(`[EffectModule] ${cfg.type}.params.${key}: range params require min, max, step`);
    }
    if (t === 'select' && (!Array.isArray(def.options) || def.options.length === 0)) {
      throw new Error(`[EffectModule] ${cfg.type}.params.${key}: select params require options array`);
    }
  }
}
