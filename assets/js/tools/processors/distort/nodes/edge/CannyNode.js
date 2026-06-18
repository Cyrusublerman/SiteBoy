import { createEffectModule } from '../../core/EffectModule.js';
import { cannyEdge } from '../../../../../shared/algorithms/edge-detection/edge-operators.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/canny.shader.js';

export const CannyNode = createEffectModule({
  type: 'canny', name: 'CANNY EDGE', category: 'EDGE',
  forceWorkerPreview: true,
  params: {
    sigma:         { value: 1.4, min: 0.5, max: 5,    step: 0.1,  label: 'SIGMA',       tier: 3, previewMax: 2, driveable: true, unit: 'σ' },
    lowThreshold:  { value: 0.1, min: 0.01, max: 0.5, step: 0.01, label: 'LOW THRESH',  tier: 3, unit: '0–1' },
    highThreshold: { value: 0.3, min: 0.05, max: 1,   step: 0.01, label: 'HIGH THRESH', tier: 3, unit: '0–1' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_sigma = modulate('sigma', 0);
    const _m_lowThreshold = modulate('lowThreshold', 0);
    const _m_highThreshold = modulate('highThreshold', 0);
    dst.set(cannyEdge(src, w, h, _m_sigma, _m_lowThreshold, _m_highThreshold));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
