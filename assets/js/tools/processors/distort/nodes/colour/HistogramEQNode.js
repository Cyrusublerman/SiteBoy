import { createEffectModule } from '../../core/EffectModule.js';
import { histogramEqualise } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const HistogramEQNode = createEffectModule({
  type: 'histogrameq', name: 'HISTOGRAM EQ', category: 'COLOUR / TONE',
  params: {
    strength: { value: 1, min: 0, max: 1, step: 0.01, label: 'STRENGTH', tier: 3, driveable: true }
  },
  apply(src, dst, w, h, p) {
    dst.set(histogramEqualise(src, w, h, p.strength));
  }
});
