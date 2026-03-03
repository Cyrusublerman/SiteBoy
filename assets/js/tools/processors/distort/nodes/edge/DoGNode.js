import { createEffectModule } from '../../core/EffectModule.js';
import { differenceOfGaussiansRGBA } from '../../../../../shared/algorithms/edge-detection/edge-operators.js';

export const DoGNode = createEffectModule({
  type: 'dog', name: 'DIFF OF GAUSS', category: 'EDGE',
  params: {
    sigma1:    { value: 1,   min: 0.1, max: 10, step: 0.1, label: 'SIGMA 1',   tier: 3, previewMax: 3, driveable: true },
    sigma2:    { value: 1.6, min: 0.2, max: 15, step: 0.1, label: 'SIGMA 2',   tier: 3, previewMax: 5, driveable: true },
    threshold: { value: 5,   min: 0,   max: 50, step: 1,   label: 'THRESHOLD', tier: 4, driveable: true }
  },
  apply(src, dst, w, h, p) {
    dst.set(differenceOfGaussiansRGBA(src, w, h, p.sigma1, p.sigma2, p.threshold));
  }
});
