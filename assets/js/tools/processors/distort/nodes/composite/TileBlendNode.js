import { createEffectModule } from '../../core/EffectModule.js';
import { tileBlend } from '../../../../../shared/algorithms/image/compositing.js';

export const TileBlendNode = createEffectModule({
  type: 'tileblend',
  name: 'TILE BLEND',
  category: 'COMPOSITE',
  params: {
    blendMode: { label: 'BLEND',    type: 'select', options: ['CROSSFADE', 'MULTIPLY', 'DIFFERENCE'], value: 'MULTIPLY', tier: 3 },
    mix:       { label: 'MIX',      min: 0, max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true },
    offsetX:   { label: 'OFFSET X', min: 0, max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true },
    offsetY:   { label: 'OFFSET Y', min: 0, max: 1,  step: 0.01, value: 0.5, tier: 4, driveable: true },
    mirrorX:   { label: 'MIRROR X', type: 'toggle', value: false, tier: 4 },
    mirrorY:   { label: 'MIRROR Y', type: 'toggle', value: false, tier: 4 },
    exposure:  { label: 'EXPOSURE', min: -2, max: 2, step: 0.1,  value: 0,   tier: 5, unit: 'EV', driveable: true },
    gamma:     { label: 'GAMMA',    min: 0.2, max: 3, step: 0.05, value: 1,  tier: 5, driveable: true }
  },
  apply(src, dst, w, h, p) {
    dst.set(tileBlend(src, w, h, { blendMode: p.blendMode.toLowerCase(), mix: p.mix, offsetX: p.offsetX, offsetY: p.offsetY, mirrorX: p.mirrorX, mirrorY: p.mirrorY, exposure: p.exposure, gamma: p.gamma }));
  }
});
