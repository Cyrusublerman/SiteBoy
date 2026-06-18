import { createEffectModule } from '../../core/EffectModule.js';
import { posterize } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/posterize.shader.js';

export const PosterizeNode = createEffectModule({
  type: 'posterize', name: 'POSTERIZE', category: 'COLOUR / TONE',
  isLUT: true,
  params: {
    levels: { value: 4, min: 2, max: 32, step: 1, label: 'LEVELS', tier: 3, driveable: true, unit: 'n' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_levels = Math.round(modulate('levels', 0));
    dst.set(posterize(src, w, h, _m_levels));
  },
  wgsl,
  glsl,
  gpuBindings: {
    ..._gpuBindings,
    uniformMap: p => ({ uLevels: p.levels }),
  },
});
