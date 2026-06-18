import { createEffectModule } from '../../core/EffectModule.js';
import { thinFilmInterferenceRGBA } from '../../../../../shared/algorithms/optics/interference.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/interference.shader.js';

export const InterferenceNode = createEffectModule({
  type: 'interference',
  name: 'INTERFERENCE',
  category: 'OPTICS',
  params: {
    frame:         { label: 'FRAME',       min: 0, max: 240, step: 1,    value: 0,   tier: 3, driveable: true, unit: 'frames' },
    filmThickness: { label: 'THICKNESS',   min: 100, max: 800, step: 10,   value: 300, tier: 3, unit: 'nm', driveable: true },
    viewAngle:     { label: 'VIEW ANGLE',  min: 0,   max: 60,  step: 1,    value: 0,   tier: 4, unit: 'deg', driveable: true },
    couplingStrength: { label: 'COUPLING STRENGTH', min: 0, max: 2, step: 0.05, value: 1, tier: 3, driveable: true },
    thicknessOffset:  { label: 'THICKNESS OFFSET',  min: -400, max: 400, step: 5, value: 0, tier: 3, unit: 'nm', driveable: true },
    blendAmt:      { label: 'BLEND',       min: 0,   max: 1,   step: 0.01, value: 0.5, tier: 3, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_frame = Math.round(modulate('frame', 0));
    const _m_filmThickness = modulate('filmThickness', 0);
    const _m_viewAngle = Math.round(modulate('viewAngle', 0));
    const _m_couplingStrength = modulate('couplingStrength', 0);
    const _m_thicknessOffset = modulate('thicknessOffset', 0);
    const _m_blendAmt = modulate('blendAmt', 0);
    const thick = _m_filmThickness + _m_frame * 2 + (_m_thicknessOffset ?? 0);
    dst.set(thinFilmInterferenceRGBA(src, w, h, thick, _m_viewAngle, _m_couplingStrength, _m_blendAmt));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
