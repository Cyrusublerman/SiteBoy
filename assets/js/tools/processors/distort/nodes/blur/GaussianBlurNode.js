import { createEffectModule } from '../../core/EffectModule.js';
import { gaussianBlurSeparable } from '../../../../../shared/algorithms/image/blur-filters.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/gaussblur.shader.js';

export const GaussianBlurNode = createEffectModule({
  type: 'gaussblur', name: 'GAUSS BLUR', category: 'BLUR',
  params: {
    sigma:  { value: 2, min: 0.1, max: 30, step: 0.1, label: 'SIGMA',  tier: 3, previewMax: 5, driveable: true, unit: 'σ' },
    passes: { value: 1, min: 1,   max: 3,  step: 1,   label: 'PASSES', tier: 4, previewMax: 1, driveable: true, unit: 'n' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    dst.set(gaussianBlurSeparable(src, w, h, p.sigma, p.passes));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
