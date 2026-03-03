import { createEffectModule } from '../../core/EffectModule.js';
import { laplacianEdge } from '../../../../../shared/algorithms/edge-detection/edge-operators.js';

export const LaplacianNode = createEffectModule({
  type: 'laplacian', name: 'LAPLACIAN', category: 'EDGE',
  params: {
    mode:      { value: '4-conn', type: 'select', options: ['4-conn', '8-conn'], label: 'MODE',      tier: 3 },
    normalize: { value: 1, min: 0, max: 1, step: 1, label: 'NORMALIZE', type: 'toggle', tier: 4 }
  },
  apply(src, dst, w, h, p) {
    dst.set(laplacianEdge(src, w, h, p.mode, !!p.normalize));
  }
});
