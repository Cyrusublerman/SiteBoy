import { createEffectModule } from '../../core/EffectModule.js';
import { invertColoursSelective } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const InvertNode = createEffectModule({
  type: 'invert', name: 'INVERT', category: 'COLOUR / TONE',
  isLUT: false,
  params: {
    mode: { type: 'select', label: 'MODE', options: ['all', 'luminosity', 'hue'], value: 'all' }
  },
  apply(src, dst, w, h, p) {
    dst.set(invertColoursSelective(src, w, h, p.mode));
  }
});
