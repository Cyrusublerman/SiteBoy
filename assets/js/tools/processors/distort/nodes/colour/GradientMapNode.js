import { createEffectModule } from '../../core/EffectModule.js';
import { applyGradientMap } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const GradientMapNode = createEffectModule({
  type: 'gradientmap', name: 'GRADIENT MAP', category: 'COLOUR / TONE',
  params: {
    darkR:  { value: 0,   min: 0, max: 255, step: 1, label: 'DARK R',  tier: 3 },
    darkG:  { value: 0,   min: 0, max: 255, step: 1, label: 'DARK G',  tier: 3 },
    darkB:  { value: 30,  min: 0, max: 255, step: 1, label: 'DARK B',  tier: 3 },
    lightR: { value: 255, min: 0, max: 255, step: 1, label: 'LIGHT R', tier: 4 },
    lightG: { value: 200, min: 0, max: 255, step: 1, label: 'LIGHT G', tier: 4 },
    lightB: { value: 150, min: 0, max: 255, step: 1, label: 'LIGHT B', tier: 4 }
  },
  apply(src, dst, w, h, p) {
    const gradient = [[p.darkR, p.darkG, p.darkB], [p.lightR, p.lightG, p.lightB]];
    dst.set(applyGradientMap(src, w, h, gradient));
  }
});
