import { createEffectModule } from '../../core/EffectModule.js';
import { morphologyOpenCloseRGBA } from '../../../../../shared/algorithms/image/morphology.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/openclose.shader.js';

export const OpenCloseNode = createEffectModule({
  type: 'openclose',
  name: 'OPEN/CLOSE',
  category: 'MORPHOLOGY',
  params: {
    mode:       { label: 'MODE',       type: 'select', options: ['OPEN', 'CLOSE'], value: 'OPEN',   tier: 3 },
    shape:      { label: 'SHAPE',      type: 'select', options: ['SQUARE', 'CIRCLE', 'DIAMOND', 'CROSS'], value: 'SQUARE', tier: 3 },
    radius:     { label: 'RADIUS',     min: 1, max: 10, step: 1, value: 1, tier: 3, previewMax: 5, unit: 'px' },
    iterations: { label: 'ITERATIONS', min: 1, max: 10, step: 1, value: 1, tier: 3, previewMax: 3, unit: '×', driveable: true }
  },
  apply(src, dst, w, h, p, _ctx, _modulate) {
    const _m_radius = Math.round(modulate('radius', 0));
    const _m_iterations = Math.round(modulate('iterations', 0));
    const iters = Math.round(_m_iterations);
    let buf = src;
    for (let i = 0; i < iters; i++) buf = morphologyOpenCloseRGBA(buf, w, h, p.mode.toLowerCase(), _m_radius);
    dst.set(buf);
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
