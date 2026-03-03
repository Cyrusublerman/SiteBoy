import { createEffectModule } from '../../core/EffectModule.js';
import { morphologyOpenCloseRGBA } from '../../../../../shared/algorithms/image/morphology.js';

export const OpenCloseNode = createEffectModule({
  type: 'openclose',
  name: 'OPEN/CLOSE',
  category: 'MORPHOLOGY',
  params: {
    mode:   { label: 'MODE',   type: 'select', options: ['OPEN', 'CLOSE'], value: 'OPEN', tier: 3 },
    radius: { label: 'RADIUS', min: 1, max: 10, step: 1, value: 1, tier: 3, previewMax: 5, unit: 'px', driveable: true }
  },
  apply(src, dst, w, h, p) {
    dst.set(morphologyOpenCloseRGBA(src, w, h, p.mode.toLowerCase(), p.radius));
  }
});
