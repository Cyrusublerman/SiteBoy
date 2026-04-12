import { createEffectModule } from '../../core/EffectModule.js';
import { applyTemperatureTint } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/temptint.shader.js';

export const TemperatureTintNode = createEffectModule({
  type: 'temptint', name: 'TEMP / TINT', category: 'COLOUR / TONE',
  isLUT: true,
  params: {
    temperature: { value: 0, min: -100, max: 100, step: 1, label: 'TEMPERATURE', tier: 3, driveable: true, unit: '%' },
    tint:        { value: 0, min: -100, max: 100, step: 1, label: 'TINT',        tier: 3, driveable: true, unit: '%' }
  },
  apply(src, dst, w, h, p) {
    dst.set(applyTemperatureTint(src, w, h, p.temperature, p.tint));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
