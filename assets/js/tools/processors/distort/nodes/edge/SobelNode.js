import { createEffectModule } from '../../core/EffectModule.js';
import { sobelEdge } from '../../../../../shared/algorithms/edge-detection/edge-operators.js';

export const SobelNode = createEffectModule({
  type: 'sobel', name: 'SOBEL EDGE', category: 'EDGE',
  params: {
    threshold: { value: 0, min: 0,   max: 255, step: 1, label: 'THRESHOLD', tier: 3, driveable: true },
    normalize: { value: 1, min: 0,   max: 1,   step: 1, label: 'NORMALIZE', type: 'toggle', tier: 4 }
  },
  apply(src, dst, w, h, p) {
    dst.set(sobelEdge(src, w, h, p.threshold, !!p.normalize));
  }
});
