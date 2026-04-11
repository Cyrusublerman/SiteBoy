import { createEffectModule } from '../../core/EffectModule.js';
import { unsharpMask } from '../../../../../shared/algorithms/image/spatial-filters.js';

export const UnsharpMaskNode = createEffectModule({
  type: 'unsharpmask', name: 'UNSHARP MASK', category: 'SHARPEN',
  params: {
    amount:    { value: 1, min: 0,   max: 5,   step: 0.1, label: 'AMOUNT',    tier: 3, driveable: true, unit: 'n' },
    radius:    { value: 2, min: 0.1, max: 20,  step: 0.1, label: 'RADIUS',    tier: 3, previewMax: 5, driveable: true, unit: 'px' },
    threshold: { value: 0, min: 0,   max: 255, step: 1,   label: 'THRESHOLD', tier: 4, driveable: true, unit: 'lvl' }
  },
  apply(src, dst, w, h, p) {
    dst.set(unsharpMask(src, w, h, p.amount, p.radius, p.threshold));
  }
});
