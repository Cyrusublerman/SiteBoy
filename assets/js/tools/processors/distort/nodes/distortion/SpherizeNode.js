import { createEffectModule } from '../../core/EffectModule.js';
import { spherize } from '../../../../../shared/algorithms/geometry/distortion.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/spherize.shader.js';

export const SpherizeNode = createEffectModule({
  type: 'spherize', name: 'SPHERIZE', category: 'DISTORTION',
  params: {
    amount:  { value: 0.5, min: -1,   max: 1,   step: 0.01, label: 'AMOUNT',   tier: 3, driveable: true, unit: '-1–1' },
    radius:  { value: 0.5, min: 0.01, max: 1,   step: 0.01, label: 'RADIUS',   tier: 3, driveable: true, unit: '0–1' },
    centreX: { value: 0.5, min: 0,    max: 1,   step: 0.01, label: 'CENTRE X', tier: 4, driveable: true, unit: '0–1' },
    centreY: { value: 0.5, min: 0,    max: 1,   step: 0.01, label: 'CENTRE Y', tier: 4, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_amount = modulate('amount', 0);
    const _m_radius = modulate('radius', 0);
    const _m_centreX = modulate('centreX', 0);
    const _m_centreY = modulate('centreY', 0);
    const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
    dst.set(spherize(src, w, h, _m_amount, _m_centreX, _m_centreY, _m_radius, interp));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
