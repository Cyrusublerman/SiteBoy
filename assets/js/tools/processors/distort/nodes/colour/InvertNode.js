import { createEffectModule } from '../../core/EffectModule.js';
import { invertColoursSelective } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/invert.shader.js';

const MODE_INDEX = { all: 0, luminosity: 1, hue: 2 };

export const InvertNode = createEffectModule({
  type: 'invert', name: 'INVERT', category: 'COLOUR / TONE',
  isLUT: false,
  params: {
    mode: { type: 'select', label: 'MODE', options: ['all', 'luminosity', 'hue'], value: 'all' }
  },
  apply(src, dst, w, h, p) {
    dst.set(invertColoursSelective(src, w, h, p.mode));
  },
  // GPU shaders — convert string mode to integer index for the shader uniform
  wgsl,
  glsl,
  gpuBindings: {
    ..._gpuBindings,
    // Map the 'mode' select param to the integer index expected by uMode
    uniformMap: p => ({ uMode: MODE_INDEX[p.mode] ?? 0 }),
  },
});
