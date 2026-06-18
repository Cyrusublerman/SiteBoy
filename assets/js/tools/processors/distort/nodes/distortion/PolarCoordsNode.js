import { createEffectModule } from '../../core/EffectModule.js';
import { polarCoords } from '../../../../../shared/algorithms/geometry/distortion.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/polarcoords.shader.js';

export const PolarCoordsNode = createEffectModule({
  type: 'polarcoords', name: 'POLAR COORDS', category: 'DISTORTION',
  params: {
    mode:    { value: 'rectToPolar', type: 'select', options: ['rectToPolar', 'polarToRect'], label: 'MODE',     tier: 3 },
    centreX: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'CENTRE X', tier: 4, driveable: true, unit: '0–1' },
    centreY: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'CENTRE Y', tier: 4, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_centreX = modulate('centreX', 0);
    const _m_centreY = modulate('centreY', 0);
    dst.set(polarCoords(src, w, h, p.mode, _m_centreX, _m_centreY));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
