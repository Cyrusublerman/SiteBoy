import { createEffectModule } from '../../core/EffectModule.js';
import { sdfShapeRGBA } from '../../../../../shared/algorithms/geometry/sdf-operations.js';

export const SDFShapeNode = createEffectModule({
  type: 'sdfshape',
  name: 'SDF SHAPE',
  category: 'GEOMETRIC',
  params: {
    shape:   { label: 'SHAPE',    type: 'select', options: ['CIRCLE', 'BOX', 'RING'], value: 'CIRCLE', tier: 3 },
    centreX: { label: 'CENTRE X', min: 0,    max: 1,   step: 0.01,  value: 0.5,  tier: 3, driveable: true, unit: '0–1' },
    centreY: { label: 'CENTRE Y', min: 0,    max: 1,   step: 0.01,  value: 0.5,  tier: 3, driveable: true, unit: '0–1' },
    size:    { label: 'SIZE',     min: 0.01, max: 1,   step: 0.01,  value: 0.3,  tier: 3, driveable: true, unit: '0–1' },
    softness:{ label: 'SOFTNESS', min: 0,    max: 0.2, step: 0.005, value: 0.02, tier: 4, driveable: true, unit: '0–1' },
    invert:  { label: 'INVERT',   type: 'toggle', value: false, tier: 4 },
    fillR:   { label: 'FILL R',   min: 0, max: 255, step: 1, value: 0,   tier: 4, driveable: true, unit: 'lvl' },
    fillG:   { label: 'FILL G',   min: 0, max: 255, step: 1, value: 0,   tier: 4, driveable: true, unit: 'lvl' },
    fillB:   { label: 'FILL B',   min: 0, max: 255, step: 1, value: 0,   tier: 5, driveable: true, unit: 'lvl' }
  },
  apply(src, dst, w, h, p) {
    dst.set(sdfShapeRGBA(src, w, h, p.shape.toLowerCase(), p.centreX, p.centreY, p.size, p.softness, p.invert, p.fillR, p.fillG, p.fillB));
  }
});
