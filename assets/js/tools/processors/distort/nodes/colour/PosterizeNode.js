import { createEffectModule } from '../../core/EffectModule.js';
import { posterize } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const PosterizeNode = createEffectModule({
  type: 'posterize', name: 'POSTERIZE', category: 'COLOUR / TONE',
  isLUT: true,
  params: {
    levels: { value: 4, min: 2, max: 32, step: 1, label: 'LEVELS', tier: 3, driveable: true, unit: 'n' }
  },
  apply(src, dst, w, h, p) {
    dst.set(posterize(src, w, h, p.levels));
  }
});
