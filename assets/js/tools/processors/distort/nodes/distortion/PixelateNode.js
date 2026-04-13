import { createEffectModule } from '../../core/EffectModule.js';
import { pixelate } from '../../../../../shared/algorithms/geometry/distortion.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/pixelate.shader.js';

export const PixelateNode = createEffectModule({
  type: 'pixelate', name: 'PIXELATE', category: 'DISTORTION',
  params: {
    blockSize: { value: 8, min: 2, max: 100, step: 1, label: 'BLOCK SIZE', tier: 3, previewMax: 20, driveable: true, unit: 'px' }
  },
  apply(src, dst, w, h, p) {
    dst.set(pixelate(src, w, h, p.blockSize));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
