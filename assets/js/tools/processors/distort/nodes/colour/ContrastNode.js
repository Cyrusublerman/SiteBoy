import { createEffectModule } from '../../core/EffectModule.js';
import { liftGammaGain, applyVibrance } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/contrast.shader.js';

export const ContrastNode = createEffectModule({
  type: 'contrast', name: 'LIFT/GAM/GAIN', category: 'COLOUR / TONE',
  params: {
    lift:     { value: 0,   min: -0.5, max: 0.5, step: 0.01, label: 'LIFT',     tier: 3, driveable: true, unit: 'n' },
    gamma:    { value: 1,   min: 0.2,  max: 3,   step: 0.01, label: 'GAMMA',    tier: 3, driveable: true, unit: 'n' },
    gain:     { value: 1,   min: 0,    max: 3,   step: 0.01, label: 'GAIN',     tier: 3, driveable: true, unit: 'n' },
    contrast: { value: 0,   min: -1,   max: 1,   step: 0.01, label: 'CONTRAST', tier: 4, driveable: true, unit: 'n' },
    pivot:    { value: 0.5, min: 0,    max: 1,   step: 0.01, label: 'PIVOT',    tier: 4, driveable: true, unit: 'n' },
    vibrance: { value: 0,   min: -1,   max: 1,   step: 0.01, label: 'VIBRANCE', tier: 4, driveable: true, unit: 'n' }
  },
  apply(src, dst, w, h, p, c
    const _m_lift = modulate('lift', 0);
    const _m_gamma = modulate('gamma', 0);
    const _m_gain = modulate('gain', 0);
    const _m_contrast = modulate('contrast', 0);
    const _m_pivot = modulate('pivot', 0);
    const _m_vibrance = modulate('vibrance', 0);
    const toned = liftGammaGain(src, w, h, _m_lift, _m_gamma, _m_gain, _m_contrast, _m_pivot);
    dst.set(_m_vibrance !== 0 ? applyVibrance(toned, w, h, _m_vibrance) : toned);
  e) : toned);
  },
  wgsl,
  glsl,
  gpuBindings: {
    ..._gpuBindings,
    uniformMap: p => ({
      uLift: p.lift, uGamma: p.gamma, uGain: p.gain,
      uContrast: p.contrast, uPivot: p.pivot, uVibrance: p.vibrance,
    }),
  },
});
