import { createEffectModule } from '../../core/EffectModule.js';
import { polarCoords } from '../../../../../shared/algorithms/geometry/distortion.js';

export const PolarCoordsNode = createEffectModule({
  type: 'polarcoords', name: 'POLAR COORDS', category: 'DISTORTION',
  params: {
    mode:    { value: 'rectToPolar', type: 'select', options: ['rectToPolar', 'polarToRect'], label: 'MODE',     tier: 3 },
    centreX: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'CENTRE X', tier: 4 },
    centreY: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'CENTRE Y', tier: 4 }
  },
  apply(src, dst, w, h, p) {
    dst.set(polarCoords(src, w, h, p.mode, p.centreX, p.centreY));
  }
});
