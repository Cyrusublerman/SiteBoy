import { createEffectModule } from '../../core/EffectModule.js';
import { histogramEqualise } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/histogrameq.shader.js';

export const HistogramEQNode = createEffectModule({
  type: 'histogrameq', name: 'HISTOGRAM EQ', category: 'COLOUR / TONE',
  params: {
    strength: { value: 1, min: 0, max: 1, step: 0.01, label: 'STRENGTH', tier: 3, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p, c
    const _m_strength = modulate('strength', 0);
    dst.set(histogramEqualise(src, w, h, _m_strength));
  .strength));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
