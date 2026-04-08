import { createEffectModule } from '../../core/EffectModule.js';
import { boxBlurSeparable } from '../../../../../shared/algorithms/image/blur-filters.js';

export const BoxBlurNode = createEffectModule({
  type: 'boxblur', name: 'BOX BLUR', category: 'BLUR',
  params: {
    radius: { value: 3, min: 1, max: 50, step: 1, label: 'RADIUS', tier: 3, previewMax: 10, driveable: true, unit: 'px' },
    passes: { value: 1, min: 1, max: 5,  step: 1, label: 'PASSES', tier: 4, previewMax: 2, driveable: true, unit: 'n' }
  },
  apply(src, dst, w, h, p) {
    dst.set(boxBlurSeparable(src, w, h, p.radius, p.passes));
  }
});
