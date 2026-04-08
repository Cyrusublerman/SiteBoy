import { createEffectModule } from '../../core/EffectModule.js';
import { buildCurvesLUT, applyCurvesLUT } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const CurvesNode = createEffectModule({
  type: 'curves', name: 'CURVES', category: 'COLOUR / TONE',
  isLUT: true,
  params: {
    shadowIn:  { value: 0,   min: 0, max: 255, step: 1, label: 'SHADOW IN',  tier: 3, driveable: true, unit: 'lvl' },
    shadowOut: { value: 0,   min: 0, max: 255, step: 1, label: 'SHADOW OUT', tier: 3, driveable: true, unit: 'lvl' },
    midIn:     { value: 128, min: 0, max: 255, step: 1, label: 'MID IN',     tier: 3, driveable: true, unit: 'lvl' },
    midOut:    { value: 128, min: 0, max: 255, step: 1, label: 'MID OUT',    tier: 3, driveable: true, unit: 'lvl' },
    highIn:    { value: 255, min: 0, max: 255, step: 1, label: 'HIGH IN',    tier: 4, driveable: true, unit: 'lvl' },
    highOut:   { value: 255, min: 0, max: 255, step: 1, label: 'HIGH OUT',   tier: 4, driveable: true, unit: 'lvl' }
  },
  apply(src, dst, w, h, p) {
    const lut = buildCurvesLUT(p.shadowIn, p.shadowOut, p.midIn, p.midOut, p.highIn, p.highOut);
    dst.set(applyCurvesLUT(src, w, h, lut));
  }
});
