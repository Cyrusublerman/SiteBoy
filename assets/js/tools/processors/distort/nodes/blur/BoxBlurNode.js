import { createEffectModule } from '../../core/EffectModule.js';
import { boxBlurSeparable } from '../../../../../shared/algorithms/image/blur-filters.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/boxblur.shader.js';

export const BoxBlurNode = createEffectModule({
  type: 'boxblur', name: 'BOX BLUR', category: 'BLUR',
  forceWorkerPreview: true,
  params: {
    radius: { value: 3, min: 1, max: 50, step: 1, label: 'RADIUS', tier: 3, previewMax: 10, driveable: true, unit: 'px' },
    passes: { value: 1, min: 1, max: 5,  step: 1, label: 'PASSES', tier: 4, previewMax: 2, driveable: true, unit: '×' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_radius = Math.round(modulate('radius', 0));
    const _m_passes = Math.round(modulate('passes', 0));
    dst.set(boxBlurSeparable(src, w, h, _m_radius, _m_passes));
  },
  wgsl,
  glsl,
  // Each logical pass = 2 GPU dispatches (horizontal + vertical).
  // The `passes` param drives how many times GPURenderPath repeats the pair.
  gpuBindings: {
    ..._gpuBindings,
    // Override passes count dynamically from the node's resolved params
    uniformMap: p => ({ uRadius: Math.round(p.radius) }),
    // GPURenderPath reads bindings.passes; we provide a function here so
    // GPURenderPath can call it with resolved params to get the actual count.
    passesFromParams: p => Math.round(p.passes) * 2,
  },
});
