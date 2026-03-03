import { createEffectModule } from '../../core/EffectModule.js';
import { moireRGBA } from '../../../../../shared/algorithms/patterns/pattern-generators.js';

export const MoireNode = createEffectModule({
  type: 'moire',
  name: 'MOIRE',
  category: 'PATTERN',
  params: {
    wavelength1: { label: 'WAVE 1',   min: 2, max: 100, step: 1, value: 15, tier: 3, previewMax: 50, unit: 'px', driveable: true },
    angle1:      { label: 'ANGLE 1',  min: 0, max: 180, step: 1, value: 0,  tier: 3, unit: 'deg', driveable: true },
    wavelength2: { label: 'WAVE 2',   min: 2, max: 100, step: 1, value: 16, tier: 3, previewMax: 50, unit: 'px', driveable: true },
    angle2:      { label: 'ANGLE 2',  min: 0, max: 180, step: 1, value: 5,  tier: 3, unit: 'deg', driveable: true },
    combineMode: { label: 'COMBINE',  type: 'select', options: ['PRODUCT', 'SUM', 'XOR', 'MIN', 'MAX'], value: 'PRODUCT', tier: 4 },
    blendMode:   { label: 'BLEND',    type: 'select', options: ['MULTIPLY', 'SCREEN', 'REPLACE'], value: 'MULTIPLY', tier: 4 }
  },
  apply(src, dst, w, h, p) {
    dst.set(moireRGBA(src, w, h, p.wavelength1, p.angle1, p.wavelength2, p.angle2, p.combineMode.toLowerCase(), p.blendMode.toLowerCase()));
  }
});
