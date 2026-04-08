import { createEffectModule } from '../../core/EffectModule.js';
import { contourRGBA } from '../../../../../shared/algorithms/image/compositing.js';

export const ContourNode = createEffectModule({
  type: 'contour',
  name: 'CONTOUR',
  category: 'GEOMETRIC',
  params: {
    levels:      { label: 'LEVELS',     min: 2, max: 32,  step: 1,    value: 8,   tier: 3, driveable: true, unit: 'n' },
    strokeW:     { label: 'STROKE W',   min: 0.5, max: 4, step: 0.5,  value: 1,   tier: 3, unit: 'px', driveable: true },
    strokeLevel: { label: 'STROKE LVL', min: 0, max: 255, step: 1,   value: 0,   tier: 4, driveable: true, unit: 'lvl' },
    blendAmt:    { label: 'BLEND',      min: 0, max: 1,   step: 0.01, value: 0.7, tier: 3, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p) {
    dst.set(contourRGBA(src, w, h, p.levels, p.strokeW, p.strokeLevel, p.blendAmt));
  }
});
