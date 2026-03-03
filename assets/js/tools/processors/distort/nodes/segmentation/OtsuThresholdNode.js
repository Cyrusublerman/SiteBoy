import { createEffectModule } from '../../core/EffectModule.js';
import { otsuThresholdRGBA } from '../../../../../shared/algorithms/segmentation/thresholding.js';

export const OtsuThresholdNode = createEffectModule({
  type: 'otsuthreshold',
  name: 'OTSU THRESH',
  category: 'SEGMENTATION',
  params: {
    mode:   { label: 'MODE',   type: 'select', options: ['BINARY', 'MASK'], value: 'BINARY', tier: 3 },
    invert: { label: 'INVERT', type: 'toggle', value: false, tier: 3 }
  },
  apply(src, dst, w, h, p) {
    dst.set(otsuThresholdRGBA(src, w, h, p.mode.toLowerCase(), p.invert));
  }
});
