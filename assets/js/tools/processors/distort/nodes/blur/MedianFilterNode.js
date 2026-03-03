import { createEffectModule } from '../../core/EffectModule.js';
import { medianFilter } from '../../../../../shared/algorithms/image/blur-filters.js';

export const MedianFilterNode = createEffectModule({
  type: 'median', name: 'MEDIAN FILTER', category: 'BLUR',
  params: {
    radius: { value: 1, min: 1, max: 5, step: 1, label: 'RADIUS', tier: 3, previewMax: 2 }
  },
  apply(src, dst, w, h, p) {
    dst.set(medianFilter(src, w, h, p.radius));
  }
});
