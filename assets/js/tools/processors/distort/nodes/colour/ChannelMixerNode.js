import { createEffectModule } from '../../core/EffectModule.js';
import { channelMix } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/channelmixer.shader.js';

export const ChannelMixerNode = createEffectModule({
  type: 'channelmixer', name: 'CHANNEL MIXER', category: 'COLOUR / TONE',
  params: {
    rr: { value: 1, min: -2, max: 2, step: 0.01, label: 'R→R', tier: 3, driveable: true, unit: 'n' },
    rg: { value: 0, min: -2, max: 2, step: 0.01, label: 'G→R', tier: 3, driveable: true, unit: 'n' },
    rb: { value: 0, min: -2, max: 2, step: 0.01, label: 'B→R', tier: 3, driveable: true, unit: 'n' },
    gr: { value: 0, min: -2, max: 2, step: 0.01, label: 'R→G', tier: 4, driveable: true, unit: 'n' },
    gg: { value: 1, min: -2, max: 2, step: 0.01, label: 'G→G', tier: 4, driveable: true, unit: 'n' },
    gb: { value: 0, min: -2, max: 2, step: 0.01, label: 'B→G', tier: 4, driveable: true, unit: 'n' },
    br: { value: 0, min: -2, max: 2, step: 0.01, label: 'R→B', tier: 5, driveable: true, unit: 'n' },
    bg: { value: 0, min: -2, max: 2, step: 0.01, label: 'G→B', tier: 5, driveable: true, unit: 'n' },
    bb: { value: 1, min: -2, max: 2, step: 0.01, label: 'B→B', tier: 5, driveable: true, unit: 'n' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_rr = modulate('rr', 0);
    const _m_rg = modulate('rg', 0);
    const _m_rb = modulate('rb', 0);
    const _m_gr = modulate('gr', 0);
    const _m_gg = modulate('gg', 0);
    const _m_gb = modulate('gb', 0);
    const _m_br = modulate('br', 0);
    const _m_bg = modulate('bg', 0);
    const _m_bb = modulate('bb', 0);
    dst.set(channelMix(src, w, h, p));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
