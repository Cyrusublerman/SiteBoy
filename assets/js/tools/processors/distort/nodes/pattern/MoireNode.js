import { createEffectModule } from '../../core/EffectModule.js';
import { gratingBandField2D, combineMoire, thresholdGrating } from '../../../../../shared/algorithms/patterns/pattern-generators.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/moire.shader.js';

const DEG = Math.PI / 180;

function _evalGrating(x, y, type, wavelength, angle, phase, contrast, dutyCycle, softness) {
  const cx = 0, cy = 0;
  const params = { wavelength, angle: angle * DEG, phase, cx, cy };
  const { phi } = gratingBandField2D(x, y, type === 'LINEAR' ? 'linear' : type === 'RADIAL' ? 'radial' : type === 'ANGULAR' ? 'angular' : 'linear', params);
  const raw = 0.5 * (1 + Math.cos(phi));
  const u = dutyCycle <= 0 ? 0 : dutyCycle >= 1 ? 1 : thresholdGrating(raw, 1 - dutyCycle, softness > 0, Math.max(0.001, softness));
  return Math.max(0, Math.min(1, 0.5 + contrast * (u - 0.5)));
}

export const MoireNode = createEffectModule({
  type: 'moire',
  name: 'MOIRE',
  category: 'PATTERN',
  params: {
    // ── Wave system 1 ─────────────────────────────────────────────────────
    type1:       { label: 'TYPE 1',      type: 'select', options: ['LINEAR', 'RADIAL', 'ANGULAR'], value: 'LINEAR', tier: 3 },
    wavelength1: { label: 'WAVE 1',      min: 2, max: 200, step: 1,   value: 15,  tier: 3, previewMax: 50, unit: 'px',  driveable: true },
    angle1:      { label: 'ANGLE 1',     min: 0, max: 180, step: 0.5, value: 0,   tier: 3, unit: 'deg', driveable: true },
    phase1:      { label: 'PHASE 1',     min: 0, max: 1,   step: 0.01,value: 0,   tier: 4, unit: '0–1', driveable: true },
    contrast1:   { label: 'CONTRAST 1',  min: 0, max: 1,   step: 0.01,value: 1,   tier: 4, unit: '0–1', driveable: true },
    dutyCycle1:  { label: 'DUTY CYCLE 1',min: 0, max: 1,   step: 0.01,value: 0.5, tier: 4, unit: '0–1', driveable: true },
    softness1:   { label: 'SOFTNESS 1',  min: 0, max: 1,   step: 0.01,value: 0,   tier: 4, unit: '0–1', driveable: true },
    // ── Wave system 2 ─────────────────────────────────────────────────────
    type2:       { label: 'TYPE 2',      type: 'select', options: ['LINEAR', 'RADIAL', 'ANGULAR'], value: 'LINEAR', tier: 3 },
    wavelength2: { label: 'WAVE 2',      min: 2, max: 200, step: 1,   value: 16,  tier: 3, previewMax: 50, unit: 'px',  driveable: true },
    angle2:      { label: 'ANGLE 2',     min: 0, max: 180, step: 0.5, value: 5,   tier: 3, unit: 'deg', driveable: true },
    phase2:      { label: 'PHASE 2',     min: 0, max: 1,   step: 0.01,value: 0,   tier: 4, unit: '0–1', driveable: true },
    contrast2:   { label: 'CONTRAST 2',  min: 0, max: 1,   step: 0.01,value: 1,   tier: 4, unit: '0–1', driveable: true },
    dutyCycle2:  { label: 'DUTY CYCLE 2',min: 0, max: 1,   step: 0.01,value: 0.5, tier: 4, unit: '0–1', driveable: true },
    softness2:   { label: 'SOFTNESS 2',  min: 0, max: 1,   step: 0.01,value: 0,   tier: 4, unit: '0–1', driveable: true },
    // ── Combination ───────────────────────────────────────────────────────
    combineMode:   { label: 'COMBINE', type: 'select', options: ['PRODUCT', 'SUM', 'XOR', 'MIN', 'MAX'], value: 'PRODUCT', tier: 3 },
    // ── Rendering ─────────────────────────────────────────────────────────
    threshold:     { label: 'THRESHOLD', min: 0, max: 1, step: 0.01, value: 0, tier: 4, unit: '0–1' },
    antiAlias:     { label: 'ANTI-ALIAS', type: 'toggle', value: false, tier: 4 },
    invertPattern: { label: 'INVERT',    type: 'toggle', value: false, tier: 4 },
    patternOpacity:{ label: 'OPACITY',   min: 0, max: 1, step: 0.01, value: 1,   tier: 4, unit: '0–1', driveable: true },
    internalBlend: { label: 'BLEND',     type: 'select', options: ['MULTIPLY', 'SCREEN', 'REPLACE', 'OVERLAY'], value: 'MULTIPLY', tier: 4 },
  },

  apply(src, dst, w, h, p, ctx, modulate) {
    const combineKey = p.combineMode.toLowerCase();
    const blendKey   = p.internalBlend.toLowerCase();
    const doThresh   = p.threshold > 0;
    const aaWidth    = p.antiAlias ? 0.08 : 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const pi = y * w + x;

        const wl1  = modulate('wavelength1', pi);
        const a1   = modulate('angle1',      pi);
        const ph1  = modulate('phase1',      pi);
        const ct1  = modulate('contrast1',   pi);
        const dc1  = modulate('dutyCycle1',  pi);
        const sf1  = modulate('softness1',   pi);

        const wl2  = modulate('wavelength2', pi);
        const a2   = modulate('angle2',      pi);
        const ph2  = modulate('phase2',      pi);
        const ct2  = modulate('contrast2',   pi);
        const dc2  = modulate('dutyCycle2',  pi);
        const sf2  = modulate('softness2',   pi);

        const op   = modulate('patternOpacity', pi);

        const i1 = _evalGrating(x, y, p.type1, wl1, a1, ph1, ct1, dc1, sf1);
        const i2 = _evalGrating(x, y, p.type2, wl2, a2, ph2, ct2, dc2, sf2);

        let v = combineMoire(i1, i2, combineKey);

        if (doThresh) {
          v = aaWidth > 0
            ? thresholdGrating(v, p.threshold, true, aaWidth)
            : thresholdGrating(v, p.threshold, false, 0);
        }

        if (p.invertPattern) v = 1 - v;

        for (let c = 0; c < 3; c++) {
          const sv = src[i + c] / 255;
          let out;
          if (blendKey === 'multiply')      out = sv * v;
          else if (blendKey === 'screen')   out = 1 - (1 - sv) * (1 - v);
          else if (blendKey === 'overlay')  out = sv < 0.5 ? 2 * sv * v : 1 - 2 * (1 - sv) * (1 - v);
          else                              out = v; // replace
          const blended = Math.max(0, Math.min(1, out));
          dst[i + c] = Math.round(src[i + c] * (1 - op) + blended * 255 * op);
        }
        dst[i + 3] = src[i + 3];
      }
    }
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
