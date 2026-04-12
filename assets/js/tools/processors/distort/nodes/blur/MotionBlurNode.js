import { createEffectModule } from '../../core/EffectModule.js';
import { motionBlur } from '../../../../../shared/algorithms/image/blur-filters.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/motionblur.shader.js';

export const MotionBlurNode = createEffectModule({
  type: 'motionblur', name: 'MOTION BLUR', category: 'BLUR',
  params: {
    angle:    { value: 0,  min: 0, max: 360, step: 1, label: 'ANGLE',    tier: 3, unit: 'deg', driveable: true },
    distance: { value: 10, min: 1, max: 100, step: 1, label: 'DISTANCE', tier: 3, previewMax: 20, driveable: true, unit: 'px' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    dst.set(motionBlur(src, w, h, p.angle, p.distance));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
