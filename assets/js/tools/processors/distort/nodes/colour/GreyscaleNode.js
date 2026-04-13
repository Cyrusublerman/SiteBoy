import { createEffectModule } from '../../core/EffectModule.js';
import { greyscale } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/greyscale.shader.js';

export const GreyscaleNode = createEffectModule({
  type: 'greyscale', name: 'GREYSCALE', category: 'COLOUR / TONE',
  params: {
    wr: { value: 0.299, min: 0, max: 1, step: 0.01, label: 'R WEIGHT', tier: 3, driveable: true, unit: '0–1' },
    wg: { value: 0.587, min: 0, max: 1, step: 0.01, label: 'G WEIGHT', tier: 3, driveable: true, unit: '0–1' },
    wb: { value: 0.114, min: 0, max: 1, step: 0.01, label: 'B WEIGHT', tier: 4, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p) {
    dst.set(greyscale(src, w, h, p.wr, p.wg, p.wb));
  },
  wgsl,
  glsl,
  gpuBindings: {
    ..._gpuBindings,
    uniformMap: p => ({ uWr: p.wr, uWg: p.wg, uWb: p.wb }),
  },
});
