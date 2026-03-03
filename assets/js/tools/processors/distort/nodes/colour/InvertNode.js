import { createEffectModule } from '../../core/EffectModule.js';
import { invertColours } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const InvertNode = createEffectModule({
  type: 'invert', name: 'INVERT', category: 'COLOUR / TONE',
  isLUT: true,
  params: {},
  apply(src, dst, w, h) {
    dst.set(invertColours(src, w, h));
  }
});
