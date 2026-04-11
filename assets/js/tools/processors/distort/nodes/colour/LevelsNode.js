import { createEffectModule } from '../../core/EffectModule.js';
import { applyLevels } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const LevelsNode = createEffectModule({
  type: 'levels', name: 'LEVELS', category: 'COLOUR / TONE',
  isLUT: true,
  params: {
    blackPoint: { value: 0,   min: 0,   max: 255, step: 1,    label: 'BLACK IN',  tier: 3, driveable: true, unit: 'lvl' },
    whitePoint: { value: 255, min: 0,   max: 255, step: 1,    label: 'WHITE IN',  tier: 3, driveable: true, unit: 'lvl' },
    midGamma:   { value: 1,   min: 0.1, max: 3,   step: 0.01, label: 'GAMMA',     tier: 4, driveable: true, unit: 'n' },
    outBlack:   { value: 0,   min: 0,   max: 255, step: 1,    label: 'BLACK OUT', tier: 4, driveable: true, unit: 'lvl' },
    outWhite:   { value: 255, min: 0,   max: 255, step: 1,    label: 'WHITE OUT', tier: 4, driveable: true, unit: 'lvl' }
  },
  apply(src, dst, w, h, p) {
    dst.set(applyLevels(src, w, h, p.blackPoint, p.whitePoint, p.midGamma, p.outBlack, p.outWhite));
  }
});
