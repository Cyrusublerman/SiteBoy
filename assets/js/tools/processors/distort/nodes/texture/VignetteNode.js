import { createEffectModule } from '../../core/EffectModule.js';
import { vignette } from '../../../../../shared/algorithms/image/texture-overlays.js';

export const VignetteNode = createEffectModule({
  type: 'vignette',
  name: 'VIGNETTE',
  category: 'TEXTURE',
  params: {
    amount:    { label: 'AMOUNT',    min: 0,    max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true },
    softness:  { label: 'SOFTNESS',  min: 0.01, max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true },
    roundness: { label: 'ROUNDNESS', min: 0,    max: 1,  step: 0.01, value: 1,   tier: 4 }
  },
  apply(src, dst, w, h, p) {
    dst.set(vignette(src, w, h, p.amount, p.softness, p.roundness));
  }
});
