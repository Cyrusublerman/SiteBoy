import { createEffectModule } from '../../core/EffectModule.js';
import { otsuThreshold } from '../../../../../shared/algorithms/segmentation/thresholding.js';

export const OtsuThresholdNode = createEffectModule({
  type: 'otsuthreshold',
  name: 'OTSU THRESH',
  category: 'SEGMENTATION',
  params: {
    mode:   { label: 'MODE',   type: 'select', options: ['BINARY', 'MASK'], value: 'BINARY', tier: 3 },
    invert: { label: 'INVERT', type: 'toggle', value: false, tier: 3 }
  },
  apply(src, dst, w, h, p) {
    const n = w * h;
    const luma = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const j = i * 4;
      luma[i] = Math.round(src[j] * 0.299 + src[j + 1] * 0.587 + src[j + 2] * 0.114);
    }
    const { threshold: t } = otsuThreshold(luma);
    const isMask = p.mode === 'MASK';
    for (let i = 0; i < n; i++) {
      const j = i * 4;
      let bit = luma[i] > t ? 1 : 0;
      if (p.invert) bit = 1 - bit;
      if (isMask) {
        dst[j] = src[j] * bit; dst[j + 1] = src[j + 1] * bit; dst[j + 2] = src[j + 2] * bit;
      } else {
        const v = bit * 255; dst[j] = v; dst[j + 1] = v; dst[j + 2] = v;
      }
      dst[j + 3] = src[j + 3];
    }
  }
});
