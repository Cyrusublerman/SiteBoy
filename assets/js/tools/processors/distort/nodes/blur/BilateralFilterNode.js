import { createEffectModule } from '../../core/EffectModule.js';
import { bilateralFilter } from '../../../../../shared/algorithms/image/blur-filters.js';

export const BilateralFilterNode = createEffectModule({
  type: 'bilateral', name: 'BILATERAL', category: 'BLUR',
  forceWorkerPreview: true,
  params: {
    spatialSigma: { value: 5,  min: 1, max: 10,  step: 0.5, label: 'SPATIAL σ', tier: 3, previewMax: 5, unit: 'σ' },
    rangeSigma:   { value: 30, min: 5, max: 100, step: 1,   label: 'RANGE σ',   tier: 3, driveable: true, unit: 'σ' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const rangeSigma = modulate ? modulate('rangeSigma', 0, ctx) : p.rangeSigma;
    dst.set(bilateralFilter(src, w, h, p.spatialSigma, rangeSigma));
  }
});
