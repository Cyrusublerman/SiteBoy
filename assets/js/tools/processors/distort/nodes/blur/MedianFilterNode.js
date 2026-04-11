import { createEffectModule } from '../../core/EffectModule.js';
import { medianFilter } from '../../../../../shared/algorithms/image/blur-filters.js';

export const MedianFilterNode = createEffectModule({
  type: 'median', name: 'MEDIAN FILTER', category: 'BLUR',
  forceWorkerPreview: true,
  params: {
    radius: { value: 1, min: 1, max: 5, step: 1, label: 'RADIUS', tier: 3, previewMax: 2, driveable: true, unit: 'px' }
  },
  apply(src, dst, w, h, p) {
    dst.set(medianFilter(src, w, h, p.radius));
  }
});
