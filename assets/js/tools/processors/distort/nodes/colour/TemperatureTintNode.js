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
  apply(src, dst, w, h, p, c
    const _m_temperature = Math.round(modulate('temperature', 0));
    const _m_tint = Math.round(modulate('tint', 0));
    dst.set(applyTemperatureTint(src, w, h, _m_temperature, _m_tint));
  e, p.tint));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
