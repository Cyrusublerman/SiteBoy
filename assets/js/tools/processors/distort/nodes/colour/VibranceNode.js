import { createEffectModule } from '../../core/EffectModule.js';
import { applyVibrance } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const VibranceNode = createEffectModule({
  type: 'vibrance', name: 'VIBRANCE', category: 'COLOUR / TONE',
  params: {
    vibrance: { value: 0, min: -1, max: 1, step: 0.01, label: 'VIBRANCE', tier: 3, driveable: true, unit: 'n' }
  },
  apply(src, dst, w, h, p) {
    dst.set(applyVibrance(src, w, h, p.vibrance));
  }
});
