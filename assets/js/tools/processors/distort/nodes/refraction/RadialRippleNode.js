import { createEffectModule } from '../../core/EffectModule.js';
import { radialRipple } from '../../../../../shared/algorithms/geometry/warp.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/ripple.shader.js';

export const RadialRippleNode = createEffectModule({
  type: 'ripple', name: 'RADIAL RIPPLE', category: 'REFRACTION',
  params: {
    centreX:   { value: 0.5, min: 0,   max: 1,  step: 0.01, label: 'CENTRE X',  tier: 3, driveable: true, unit: '0–1' },
    centreY:   { value: 0.5, min: 0,   max: 1,  step: 0.01, label: 'CENTRE Y',  tier: 3, driveable: true, unit: '0–1' },
    amplitude: { value: 15,  min: 0,   max: 100, step: 0.5, label: 'AMPLITUDE', tier: 3, driveable: true, unit: 'px' },
    frequency: { value: 10,  min: 0.5, max: 50, step: 0.5,  label: 'FREQUENCY', tier: 3, driveable: true, unit: 'Hz' },
    phase:     { value: 0,   min: 0,   max: 6.28, step: 0.01, label: 'PHASE',   tier: 4, driveable: true, unit: 'rad' },
    falloff:   { value: 1,   min: 0,   max: 5,  step: 0.1,  label: 'FALLOFF',   tier: 4, unit: 'n' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_centreX = modulate('centreX', 0);
    const _m_centreY = modulate('centreY', 0);
    const _m_amplitude = modulate('amplitude', 0);
    const _m_frequency = modulate('frequency', 0);
    const _m_phase = modulate('phase', 0);
    const _m_falloff = modulate('falloff', 0);
    const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
    dst.set(radialRipple(src, w, h, _m_centreX, _m_centreY, _m_amplitude, _m_frequency, _m_phase, _m_falloff, interp));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
