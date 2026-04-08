import { createEffectModule } from '../../core/EffectModule.js';
import { ditherBayer, ditherFloydSteinberg } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const DitherNode = createEffectModule({
  type: 'dither', name: 'DITHER', category: 'COLOUR / TONE',
  params: {
    method:   { value: 'floyd-steinberg', type: 'select', options: ['floyd-steinberg', 'bayer', 'none'], label: 'METHOD',   tier: 3 },
    levels:   { value: 2, min: 2, max: 16, step: 1,    label: 'LEVELS',   tier: 3, driveable: true, unit: 'n', when: { param: 'method', notEquals: 'none' } },
    strength: { value: 1, min: 0, max: 2,  step: 0.05, label: 'STRENGTH', tier: 4, driveable: true, unit: 'n', when: { param: 'method', notEquals: 'none' } }
  },
  apply(src, dst, w, h, p) {
    if (p.method === 'none') { dst.set(src); return; }
    if (p.method === 'bayer') {
      dst.set(ditherBayer(src, w, h, p.levels, p.strength));
    } else {
      dst.set(ditherFloydSteinberg(src, w, h, p.levels, p.strength));
    }
  }
});
