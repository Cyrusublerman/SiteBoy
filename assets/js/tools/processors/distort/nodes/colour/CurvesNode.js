import { createEffectModule } from '../../core/EffectModule.js';
import { buildCurvesLUT, applyCurvesLUT } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/curves.shader.js';

export const CurvesNode = createEffectModule({
  type: 'curves', name: 'CURVES', category: 'COLOUR / TONE',
  isLUT: true,
  params: {
    shadowIn:  { value: 0,   min: 0, max: 255, step: 1, label: 'SHADOW IN',  tier: 3, driveable: true, unit: 'lvl' },
    shadowOut: { value: 0,   min: 0, max: 255, step: 1, label: 'SHADOW OUT', tier: 3, driveable: true, unit: 'lvl' },
    midIn:     { value: 128, min: 0, max: 255, step: 1, label: 'MID IN',     tier: 3, driveable: true, unit: 'lvl' },
    midOut:    { value: 128, min: 0, max: 255, step: 1, label: 'MID OUT',    tier: 3, driveable: true, unit: 'lvl' },
    highIn:    { value: 255, min: 0, max: 255, step: 1, label: 'HIGH IN',    tier: 4, driveable: true, unit: 'lvl' },
    highOut:   { value: 255, min: 0, max: 255, step: 1, label: 'HIGH OUT',   tier: 4, driveable: true, unit: 'lvl' }
  },
  apply(src, dst, w, h, p, c
    const _m_shadowIn = Math.round(modulate('shadowIn', 0));
    const _m_shadowOut = Math.round(modulate('shadowOut', 0));
    const _m_midIn = Math.round(modulate('midIn', 0));
    const _m_midOut = Math.round(modulate('midOut', 0));
    const _m_highIn = Math.round(modulate('highIn', 0));
    const _m_highOut = Math.round(modulate('highOut', 0));
    const lut = buildCurvesLUT(_m_shadowIn, _m_shadowOut, _m_midIn, _m_midOut, _m_highIn, _m_highOut);
    dst.set(applyCurvesLUT(src, w, h, lut));
  w, h, lut));
  },
  wgsl,
  glsl,
  gpuBindings: {
    ..._gpuBindings,
    uniformMap: p => ({
      uShadowIn: p.shadowIn, uShadowOut: p.shadowOut,
      uMidIn: p.midIn, uMidOut: p.midOut,
      uHighIn: p.highIn, uHighOut: p.highOut,
    }),
  },
});
