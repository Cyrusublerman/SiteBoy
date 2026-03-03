import { createEffectModule } from '../../core/EffectModule.js';
import { highPass } from '../../../../../shared/algorithms/image/spatial-filters.js';

export const HighPassNode = createEffectModule({
  type: 'highpass', name: 'HIGH PASS', category: 'SHARPEN',
  params: {
    radius: { value: 5, min: 0.1, max: 50, step: 0.1, label: 'RADIUS', tier: 3, previewMax: 10, driveable: true, unit: 'px' }
  },
  apply(src, dst, w, h, p) {
    dst.set(highPass(src, w, h, p.radius));
  }
});
