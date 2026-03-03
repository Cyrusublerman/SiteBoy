import { createEffectModule } from '../../core/EffectModule.js';
import { morphologyRGBA } from '../../../../../shared/algorithms/image/morphology.js';

export const DilateErodeNode = createEffectModule({
  type: 'dilateerode',
  name: 'DILATE/ERODE',
  category: 'MORPHOLOGY',
  params: {
    mode:   { label: 'MODE',   type: 'select', options: ['DILATE', 'ERODE'], value: 'DILATE', tier: 3 },
    radius: { label: 'RADIUS', min: 1, max: 10, step: 1, value: 1, tier: 3, previewMax: 5, unit: 'px', driveable: true },
    shape:  { label: 'SHAPE',  type: 'select', options: ['SQUARE', 'CIRCLE'], value: 'SQUARE', tier: 4 }
  },
  apply(src, dst, w, h, p) {
    dst.set(morphologyRGBA(src, w, h, p.mode.toLowerCase(), p.radius));
  }
});
