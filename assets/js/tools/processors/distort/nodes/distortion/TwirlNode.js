import { createEffectModule } from '../../core/EffectModule.js';
import { twirl } from '../../../../../shared/algorithms/geometry/distortion.js';

export const TwirlNode = createEffectModule({
  type: 'twirl', name: 'TWIRL', category: 'DISTORTION',
  params: {
    angle:   { value: 180, min: -720, max: 720, step: 1,    label: 'ANGLE',    tier: 3, unit: 'deg', driveable: true },
    radius:  { value: 0.5, min: 0.01, max: 1,   step: 0.01, label: 'RADIUS',   tier: 3, driveable: true, unit: '0–1' },
    centreX: { value: 0.5, min: 0,    max: 1,   step: 0.01, label: 'CENTRE X', tier: 4, driveable: true, unit: '0–1' },
    centreY: { value: 0.5, min: 0,    max: 1,   step: 0.01, label: 'CENTRE Y', tier: 4, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p, ctx) {
    const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
    dst.set(twirl(src, w, h, p.angle, p.centreX, p.centreY, p.radius, interp));
  }
});
