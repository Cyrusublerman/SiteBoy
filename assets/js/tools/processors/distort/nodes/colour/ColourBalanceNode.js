import { createEffectModule } from '../../core/EffectModule.js';
import { colourBalance } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/colourbalance.shader.js';

export const ColourBalanceNode = createEffectModule({
  type: 'colourbalance', name: 'COLOUR BALANCE', category: 'COLOUR / TONE',
  params: {
    shadowR: { value: 0, min: -100, max: 100, step: 1, label: 'SHADOW R', tier: 3, driveable: true, unit: '%' },
    shadowG: { value: 0, min: -100, max: 100, step: 1, label: 'SHADOW G', tier: 3, driveable: true, unit: '%' },
    shadowB: { value: 0, min: -100, max: 100, step: 1, label: 'SHADOW B', tier: 3, driveable: true, unit: '%' },
    midR:    { value: 0, min: -100, max: 100, step: 1, label: 'MID R',    tier: 4, driveable: true, unit: '%' },
    midG:    { value: 0, min: -100, max: 100, step: 1, label: 'MID G',    tier: 4, driveable: true, unit: '%' },
    midB:    { value: 0, min: -100, max: 100, step: 1, label: 'MID B',    tier: 4, driveable: true, unit: '%' },
    highR:   { value: 0, min: -100, max: 100, step: 1, label: 'HIGH R',   tier: 5, driveable: true, unit: '%' },
    highG:   { value: 0, min: -100, max: 100, step: 1, label: 'HIGH G',   tier: 5, driveable: true, unit: '%' },
    highB:   { value: 0, min: -100, max: 100, step: 1, label: 'HIGH B',   tier: 5, driveable: true, unit: '%' }
  },
  apply(src, dst, w, h, p, c
    const _m_shadowR = Math.round(modulate('shadowR', 0));
    const _m_shadowG = Math.round(modulate('shadowG', 0));
    const _m_shadowB = Math.round(modulate('shadowB', 0));
    const _m_midR = Math.round(modulate('midR', 0));
    const _m_midG = Math.round(modulate('midG', 0));
    const _m_midB = Math.round(modulate('midB', 0));
    const _m_highR = Math.round(modulate('highR', 0));
    const _m_highG = Math.round(modulate('highG', 0));
    const _m_highB = Math.round(modulate('highB', 0));
    dst.set(colourBalance(src, w, h, p));
  , w, h, p));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
