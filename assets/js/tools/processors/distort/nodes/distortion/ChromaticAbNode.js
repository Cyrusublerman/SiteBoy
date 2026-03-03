import { createEffectModule } from '../../core/EffectModule.js';
import { chromaticAberration } from '../../../../../shared/algorithms/geometry/distortion.js';

export const ChromaticAbNode = createEffectModule({
  type: 'chromaticab', name: 'CHROMATIC AB', category: 'DISTORTION',
  params: {
    redShift:  { value: 2,   min: -20, max: 20, step: 0.5,  label: 'RED SHIFT',  tier: 3, driveable: true },
    blueShift: { value: -2,  min: -20, max: 20, step: 0.5,  label: 'BLUE SHIFT', tier: 3, driveable: true },
    centreX:   { value: 0.5, min: 0,   max: 1,  step: 0.01, label: 'CENTRE X',   tier: 4 },
    centreY:   { value: 0.5, min: 0,   max: 1,  step: 0.01, label: 'CENTRE Y',   tier: 4 }
  },
  apply(src, dst, w, h, p) {
    dst.set(chromaticAberration(src, w, h, p.redShift, p.blueShift, p.centreX, p.centreY));
  }
});
