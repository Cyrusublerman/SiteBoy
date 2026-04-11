import { createEffectModule } from '../../core/EffectModule.js';
import { laplacianEdge } from '../../../../../shared/algorithms/edge-detection/edge-operators.js';

export const LaplacianNode = createEffectModule({
  type: 'laplacian', name: 'LAPLACIAN', category: 'EDGE',
  params: {
    mode:       { value: '4-conn', type: 'select', options: ['4-conn', '8-conn'], label: 'MODE',        tier: 3 },
    preBlur:    { value: 0,   min: 0,   max: 10,  step: 0.1,  label: 'PRE BLUR',    tier: 3, driveable: true, unit: 'px' },
    outputMode: { value: 'absolute', type: 'select', options: ['signed', 'absolute', 'positive-only', 'negative-only', 'zero-crossing'], label: 'OUTPUT MODE', tier: 3 },
    gain:       { value: 1.0, min: 0.1, max: 10,  step: 0.1,  label: 'GAIN',        tier: 4, driveable: true, unit: '×' },
    threshold:  { value: 0,   min: 0,   max: 1,   step: 0.01, label: 'THRESHOLD',   tier: 4, driveable: true, unit: '0–1' },
    normalize:  { value: 1, min: 0, max: 1, step: 1, label: 'NORMALISE', type: 'toggle', tier: 5 }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    dst.set(laplacianEdge(src, w, h, p.mode, !!p.normalize));
  }
});
