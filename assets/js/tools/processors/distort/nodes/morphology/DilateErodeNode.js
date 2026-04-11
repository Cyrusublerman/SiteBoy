import { createEffectModule } from '../../core/EffectModule.js';
import { morphologyRGBA } from '../../../../../shared/algorithms/image/morphology.js';

export const DilateErodeNode = createEffectModule({
  type: 'dilateerode',
  name: 'DILATE/ERODE',
  category: 'MORPHOLOGY',
  params: {
    mode:       { label: 'MODE',       type: 'select', options: ['DILATE', 'ERODE'], value: 'DILATE', tier: 3 },
    domain:     { label: 'INPUT DOMAIN', type: 'select', options: ['LUMINANCE', 'RGB LINKED', 'RGB INDEPENDENT', 'ALPHA', 'MASK', 'EDGE MAP', 'THRESHOLDED BINARY'], value: 'LUMINANCE', tier: 3 },
    outputType: { label: 'OUTPUT TYPE', type: 'select', options: ['IMAGE', 'MASK', 'FIELD', 'HYBRID'], value: 'IMAGE', tier: 3 },
    iterations: { label: 'ITERATIONS', min: 1, max: 10, step: 1, value: 1, tier: 3, previewMax: 3, unit: 'steps', driveable: true },
    radius:     { label: 'RADIUS',     min: 1, max: 10, step: 1, value: 1, tier: 3, previewMax: 5, unit: 'px', driveable: true },
    isotropic:  { label: 'ISOTROPIC', type: 'toggle', value: true, tier: 4 },
    radiusX:    { label: 'RADIUS X',  min: 1, max: 10, step: 1, value: 1, tier: 4, previewMax: 5, unit: 'px', driveable: true },
    radiusY:    { label: 'RADIUS Y',  min: 1, max: 10, step: 1, value: 1, tier: 4, previewMax: 5, unit: 'px', driveable: true },
    shape:      { label: 'SHAPE',     type: 'select', options: ['SQUARE', 'CIRCLE'], value: 'SQUARE', tier: 4 }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    let result = src;
    for (let i = 0; i < p.iterations; i++) {
      result = morphologyRGBA(result, w, h, p.mode.toLowerCase(), p.radius, p.shape.toLowerCase());
    }
    dst.set(result);
  }
});
