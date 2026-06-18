import { createEffectModule } from '../../core/EffectModule.js';
import { applyLevels } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/levels.shader.js';

export const LevelsNode = createEffectModule({
  type: 'levels', name: 'LEVELS', category: 'COLOUR / TONE',
  isLUT: true,
  params: {
    blackPoint: { value: 0,   min: 0,   max: 255, step: 1,    label: 'BLACK IN',  tier: 3, driveable: true, unit: 'lvl' },
    whitePoint: { value: 255, min: 0,   max: 255, step: 1,    label: 'WHITE IN',  tier: 3, driveable: true, unit: 'lvl' },
    midGamma:   { value: 1,   min: 0.1, max: 3,   step: 0.01, label: 'GAMMA',     tier: 4, driveable: true, unit: 'n' },
    outBlack:   { value: 0,   min: 0,   max: 255, step: 1,    label: 'BLACK OUT', tier: 4, driveable: true, unit: 'lvl' },
    outWhite:   { value: 255, min: 0,   max: 255, step: 1,    label: 'WHITE OUT', tier: 4, driveable: true, unit: 'lvl' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_blackPoint = Math.round(modulate('blackPoint', 0));
    const _m_whitePoint = Math.round(modulate('whitePoint', 0));
    const _m_midGamma = modulate('midGamma', 0);
    const _m_outBlack = Math.round(modulate('outBlack', 0));
    const _m_outWhite = Math.round(modulate('outWhite', 0));
    dst.set(applyLevels(src, w, h, _m_blackPoint, _m_whitePoint, _m_midGamma, _m_outBlack, _m_outWhite));
  },
  wgsl,
  glsl,
  gpuBindings: {
    ..._gpuBindings,
    uniformMap: p => ({
      uBlackPoint: p.blackPoint, uWhitePoint: p.whitePoint, uMidGamma: p.midGamma,
      uOutBlack: p.outBlack, uOutWhite: p.outWhite,
    }),
  },
});
