import { createEffectModule } from '../../core/EffectModule.js';
import { colourBalance } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const ColourBalanceNode = createEffectModule({
  type: 'colourbalance', name: 'COLOUR BALANCE', category: 'COLOUR / TONE',
  params: {
    shadowR: { value: 0, min: -100, max: 100, step: 1, label: 'SHADOW R', tier: 3 },
    shadowG: { value: 0, min: -100, max: 100, step: 1, label: 'SHADOW G', tier: 3 },
    shadowB: { value: 0, min: -100, max: 100, step: 1, label: 'SHADOW B', tier: 3 },
    midR:    { value: 0, min: -100, max: 100, step: 1, label: 'MID R',    tier: 4 },
    midG:    { value: 0, min: -100, max: 100, step: 1, label: 'MID G',    tier: 4 },
    midB:    { value: 0, min: -100, max: 100, step: 1, label: 'MID B',    tier: 4 },
    highR:   { value: 0, min: -100, max: 100, step: 1, label: 'HIGH R',   tier: 5 },
    highG:   { value: 0, min: -100, max: 100, step: 1, label: 'HIGH G',   tier: 5 },
    highB:   { value: 0, min: -100, max: 100, step: 1, label: 'HIGH B',   tier: 5 }
  },
  apply(src, dst, w, h, p) {
    dst.set(colourBalance(src, w, h, p));
  }
});
