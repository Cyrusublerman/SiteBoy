import { createEffectModule } from '../../core/EffectModule.js';
import { channelMix } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const ChannelMixerNode = createEffectModule({
  type: 'channelmixer', name: 'CHANNEL MIXER', category: 'COLOUR / TONE',
  params: {
    rr: { value: 1, min: -2, max: 2, step: 0.01, label: 'R→R', tier: 3 },
    rg: { value: 0, min: -2, max: 2, step: 0.01, label: 'G→R', tier: 3 },
    rb: { value: 0, min: -2, max: 2, step: 0.01, label: 'B→R', tier: 3 },
    gr: { value: 0, min: -2, max: 2, step: 0.01, label: 'R→G', tier: 4 },
    gg: { value: 1, min: -2, max: 2, step: 0.01, label: 'G→G', tier: 4 },
    gb: { value: 0, min: -2, max: 2, step: 0.01, label: 'B→G', tier: 4 },
    br: { value: 0, min: -2, max: 2, step: 0.01, label: 'R→B', tier: 5 },
    bg: { value: 0, min: -2, max: 2, step: 0.01, label: 'G→B', tier: 5 },
    bb: { value: 1, min: -2, max: 2, step: 0.01, label: 'B→B', tier: 5 }
  },
  apply(src, dst, w, h, p) {
    dst.set(channelMix(src, w, h, p));
  }
});
