import { createEffectModule } from '../../core/EffectModule.js';
import { affineTransform } from '../../../../../shared/algorithms/image/spatial-filters.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/affine.shader.js';

export const AffineTransformNode = createEffectModule({
  type: 'affine', name: 'AFFINE XFORM', category: 'TRANSFORM',
  params: {
    translateX: { value: 0,   min: -1,   max: 1,   step: 0.01, label: 'TRANSLATE X', tier: 3, driveable: true, unit: '−1–1' },
    translateY: { value: 0,   min: -1,   max: 1,   step: 0.01, label: 'TRANSLATE Y', tier: 3, driveable: true, unit: '−1–1' },
    rotate:     { value: 0,   min: -180, max: 180, step: 0.5,  label: 'ROTATE',      tier: 3, unit: 'deg', driveable: true },
    scaleX:     { value: 1,   min: 0.1,  max: 5,   step: 0.01, label: 'SCALE X',     tier: 4, driveable: true, unit: '×' },
    scaleY:     { value: 1,   min: 0.1,  max: 5,   step: 0.01, label: 'SCALE Y',     tier: 4, driveable: true, unit: '×' },
    centreX:    { value: 0.5, min: 0,    max: 1,   step: 0.01, label: 'CENTRE X',    tier: 5, unit: '0–1' },
    centreY:    { value: 0.5, min: 0,    max: 1,   step: 0.01, label: 'CENTRE Y',    tier: 5, unit: '0–1' }
  },
  apply(src, dst, w, h, p, ctx) {
    const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
    dst.set(affineTransform(src, w, h, p.translateX, p.translateY, p.rotate, p.scaleX, p.scaleY, p.centreX, p.centreY, interp));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
