import { createEffectModule } from '../../core/EffectModule.js';
import { gratingBandField2D, thresholdGrating } from '../../../../../shared/algorithms/patterns/pattern-generators.js';

const DEG = Math.PI / 180;

function _evalGrating(x, y, type, wavelength, angle, phase, spiralRate, cx, cy, contrast, dutyCycle, softness) {
  const mode = type === 'LINEAR' ? 'linear' : type === 'RADIAL' ? 'radial' : type === 'ANGULAR' ? 'angular' : 'spiral';
  const params = { wavelength, angle: angle * DEG, phase, cx, cy, spiralRate };
  const { phi } = gratingBandField2D(x, y, mode, params);
  const raw = 0.5 * (1 + Math.cos(phi));
  const u = dutyCycle <= 0 ? 0 : dutyCycle >= 1 ? 1 : thresholdGrating(raw, 1 - dutyCycle, softness > 0, Math.max(0.001, softness));
  return Math.max(0, Math.min(1, 0.5 + contrast * (u - 0.5)));
}

export const GratingNode = createEffectModule({
  type: 'grating',
  name: 'GRATING',
  category: 'PATTERN',
  params: {
    // ── Pattern Generation ────────────────────────────────────────────────────
    gratingType:    { label: 'TYPE',        type: 'select', options: ['LINEAR', 'RADIAL', 'ANGULAR', 'SPIRAL'], value: 'LINEAR', tier: 3 },
    wavelength:     { label: 'WAVELENGTH',  min: 2, max: 200, step: 1,    value: 20,  tier: 3, previewMax: 80, unit: 'px',  driveable: true },
    phase:          { label: 'PHASE',       min: 0, max: 1,   step: 0.01, value: 0,   tier: 3, unit: '0–1', driveable: true },
    angle:          { label: 'ANGLE',       min: 0, max: 360, step: 1,    value: 0,   tier: 4, unit: 'deg', driveable: true,
                      when: { param: 'gratingType', oneOf: ['LINEAR', 'SPIRAL'] } },
    centreX:        { label: 'CENTRE X',    min: 0, max: 1,   step: 0.01, value: 0.5, tier: 4, unit: '0–1', driveable: true,
                      when: { param: 'gratingType', oneOf: ['RADIAL', 'ANGULAR', 'SPIRAL'] } },
    centreY:        { label: 'CENTRE Y',    min: 0, max: 1,   step: 0.01, value: 0.5, tier: 4, unit: '0–1', driveable: true,
                      when: { param: 'gratingType', oneOf: ['RADIAL', 'ANGULAR', 'SPIRAL'] } },
    spiralRate:     { label: 'SPIRAL RATE', min: 0.1, max: 10, step: 0.1, value: 1,  tier: 5, unit: 'n',   driveable: true,
                      when: { param: 'gratingType', equals: 'SPIRAL' } },
    contrast:       { label: 'CONTRAST',    min: 0, max: 1,   step: 0.01, value: 1,   tier: 3, unit: '0–1', driveable: true },
    dutyCycle:      { label: 'DUTY CYCLE',  min: 0, max: 1,   step: 0.01, value: 0.5, tier: 4, unit: '0–1', driveable: true },
    softness:       { label: 'SOFTNESS',    min: 0, max: 1,   step: 0.01, value: 0,   tier: 4, unit: '0–1', driveable: true },
    // ── Rendering ─────────────────────────────────────────────────────────────
    invertPattern:  { label: 'INVERT',      type: 'toggle', value: false, tier: 4 },
    antiAlias:      { label: 'ANTI-ALIAS',  type: 'toggle', value: true,  tier: 5 },
    patternOpacity: { label: 'OPACITY',     min: 0, max: 1,  step: 0.01, value: 1,   tier: 4, unit: '0–1', driveable: true },
    internalBlend:  { label: 'BLEND',       type: 'select', options: ['MULTIPLY', 'SCREEN', 'REPLACE', 'OVERLAY'], value: 'MULTIPLY', tier: 4 },
  },

  apply(src, dst, w, h, p, ctx, modulate) {
    const blendKey = p.internalBlend.toLowerCase();
    const type     = p.gratingType;
    const isRadial = type === 'RADIAL' || type === 'ANGULAR' || type === 'SPIRAL';

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i  = (y * w + x) * 4;
        const pi = y * w + x;

        const wl  = modulate('wavelength',  pi);
        const ph  = modulate('phase',       pi);
        const ang = modulate('angle',       pi);
        const sr  = modulate('spiralRate',  pi);
        const cx  = isRadial ? modulate('centreX', pi) * w : w * 0.5;
        const cy  = isRadial ? modulate('centreY', pi) * h : h * 0.5;
        const ct  = modulate('contrast',   pi);
        const dc  = modulate('dutyCycle',  pi);
        const sf  = modulate('softness',   pi);
        const op  = modulate('patternOpacity', pi);

        let v = _evalGrating(x, y, type, wl, ang, ph, sr, cx, cy, ct, dc, sf);

        if (p.invertPattern) v = 1 - v;

        for (let c = 0; c < 3; c++) {
          const sv = src[i + c] / 255;
          let out;
          if (blendKey === 'multiply')     out = sv * v;
          else if (blendKey === 'screen')  out = 1 - (1 - sv) * (1 - v);
          else if (blendKey === 'overlay') out = sv < 0.5 ? 2 * sv * v : 1 - 2 * (1 - sv) * (1 - v);
          else                             out = v; // replace
          const blended = Math.max(0, Math.min(1, out));
          dst[i + c] = Math.round(src[i + c] * (1 - op) + blended * 255 * op);
        }
        dst[i + 3] = src[i + 3];
      }
    }
  }
});
