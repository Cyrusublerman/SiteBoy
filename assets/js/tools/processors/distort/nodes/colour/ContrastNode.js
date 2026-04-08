import { createEffectModule } from '../../core/EffectModule.js';
import { liftGammaGain } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const ContrastNode = createEffectModule({
  type: 'contrast', name: 'LIFT/GAM/GAIN', category: 'COLOUR / TONE',
  params: {
    lift:     { value: 0,   min: -0.5, max: 0.5, step: 0.01, label: 'LIFT',     tier: 3, driveable: true, unit: 'n' },
    gamma:    { value: 1,   min: 0.2,  max: 3,   step: 0.01, label: 'GAMMA',    tier: 3, driveable: true, unit: 'n' },
    gain:     { value: 1,   min: 0,    max: 3,   step: 0.01, label: 'GAIN',     tier: 3, driveable: true, unit: 'n' },
    contrast: { value: 0,   min: -1,   max: 1,   step: 0.01, label: 'CONTRAST', tier: 4, driveable: true, unit: 'n' },
    pivot:    { value: 0.5, min: 0,    max: 1,   step: 0.01, label: 'PIVOT',    tier: 4, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p) {
    dst.set(liftGammaGain(src, w, h, p.lift, p.gamma, p.gain, p.contrast, p.pivot));
  }
});
