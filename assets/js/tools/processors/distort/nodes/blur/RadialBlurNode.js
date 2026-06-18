import { createEffectModule } from '../../core/EffectModule.js';
import { radialBlur } from '../../../../../shared/algorithms/image/blur-filters.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/radialblur.shader.js';

export const RadialBlurNode = createEffectModule({
  type: 'radialblur', name: 'RADIAL BLUR', category: 'BLUR',
  params: {
    type:    { value: 'zoom', type: 'select', options: ['zoom', 'spin'], label: 'TYPE',     tier: 3 },
    centreX: { value: 0.5, min: 0, max: 1,  step: 0.01, label: 'CENTRE X', tier: 3, driveable: true, unit: '0–1' },
    centreY: { value: 0.5, min: 0, max: 1,  step: 0.01, label: 'CENTRE Y', tier: 3, driveable: true, unit: '0–1' },
    amount:  { value: 10,  min: 1, max: 50, step: 1,    label: 'AMOUNT',   tier: 3, previewMax: 15, driveable: true, unit: 'n' },
    samples: { value: 12,  min: 4, max: 32, step: 1,    label: 'SAMPLES',  tier: 4, previewMax: 6, driveable: true, unit: 'n' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_samples = Math.round(modulate('samples', 0));
    const cx = modulate('centreX', 0);
    const cy = modulate('centreY', 0);
    const am = modulate('amount', 0);
    dst.set(radialBlur(src, w, h, p.type, cx, cy, am, _m_samples));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
