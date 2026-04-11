import { createEffectModule } from '../../core/EffectModule.js';
import { cannyEdge } from '../../../../../shared/algorithms/edge-detection/edge-operators.js';

export const CannyNode = createEffectModule({
  type: 'canny', name: 'CANNY EDGE', category: 'EDGE',
  forceWorkerPreview: true,
  params: {
    sigma:         { value: 1.4, min: 0.5, max: 5,    step: 0.1,  label: 'SIGMA',       tier: 3, previewMax: 2, driveable: true, unit: 'σ' },
    lowThreshold:  { value: 0.1, min: 0.01, max: 0.5, step: 0.01, label: 'LOW THRESH',  tier: 3, unit: '0–1' },
    highThreshold: { value: 0.3, min: 0.05, max: 1,   step: 0.01, label: 'HIGH THRESH', tier: 3, unit: '0–1' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    dst.set(cannyEdge(src, w, h, p.sigma, p.lowThreshold, p.highThreshold));
  }
});
