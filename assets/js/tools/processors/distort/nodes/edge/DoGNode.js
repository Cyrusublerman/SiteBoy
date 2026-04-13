import { createEffectModule } from '../../core/EffectModule.js';
import { differenceOfGaussiansRGBA } from '../../../../../shared/algorithms/edge-detection/edge-operators.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/dog.shader.js';

export const DoGNode = createEffectModule({
  type: 'dog', name: 'DIFF OF GAUSS', category: 'EDGE',
  params: {
    sigma1:    { value: 1,   min: 0.1, max: 10, step: 0.1, label: 'SIGMA 1',   tier: 3, previewMax: 3, driveable: true, unit: 'σ' },
    sigma2:    { value: 1.6, min: 0.2, max: 15, step: 0.1, label: 'SIGMA 2',   tier: 3, previewMax: 5, driveable: true, unit: 'σ' },
    threshold: { value: 5,   min: 0,   max: 50, step: 1,   label: 'THRESHOLD', tier: 4, driveable: true, unit: 'lvl' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const s1 = Math.min(p.sigma1, p.sigma2 - 0.1);
    const s2 = p.sigma2;
    const threshold = modulate ? modulate('threshold', 0, ctx) : p.threshold;
    dst.set(differenceOfGaussiansRGBA(src, w, h, s1, s2, threshold));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
