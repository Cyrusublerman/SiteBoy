import { createEffectModule } from '../../core/EffectModule.js';
import { thinFilmInterferenceRGBA } from '../../../../../shared/algorithms/optics/interference.js';

export const InterferenceNode = createEffectModule({
  type: 'interference',
  name: 'INTERFERENCE',
  category: 'OPTICS',
  params: {
    filmThickness: { label: 'THICKNESS',   min: 100, max: 800, step: 10,   value: 300, tier: 3, unit: 'nm', driveable: true },
    viewAngle:     { label: 'VIEW ANGLE',  min: 0,   max: 60,  step: 1,    value: 0,   tier: 4, unit: 'deg', driveable: true },
    iridescence:   { label: 'IRIDESCENCE', min: 0,   max: 2,   step: 0.05, value: 1,   tier: 3, driveable: true },
    blendAmt:      { label: 'BLEND',       min: 0,   max: 1,   step: 0.01, value: 0.5, tier: 3, driveable: true }
  },
  apply(src, dst, w, h, p) {
    dst.set(thinFilmInterferenceRGBA(src, w, h, p.filmThickness, p.viewAngle, p.iridescence, p.blendAmt));
  }
});
