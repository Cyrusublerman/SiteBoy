import { createEffectModule } from '../../core/EffectModule.js';
import { gratingRGBA } from '../../../../../shared/algorithms/patterns/pattern-generators.js';

export const GratingNode = createEffectModule({
  type: 'grating',
  name: 'GRATING',
  category: 'PATTERN',
  params: {
    gratingType: { label: 'TYPE',       type: 'select', options: ['LINEAR', 'RADIAL', 'ANGULAR', 'SPIRAL'], value: 'LINEAR', tier: 3 },
    wavelength:  { label: 'WAVELENGTH', min: 2, max: 200, step: 1,   value: 20,  tier: 3, previewMax: 80, unit: 'px', driveable: true },
    phase:       { label: 'PHASE',      min: 0, max: 1,   step: 0.01, value: 0,   tier: 3, driveable: true, unit: '0–1' },
    angle:       { label: 'ANGLE',      min: 0, max: 360, step: 1,   value: 0,   tier: 4, unit: 'deg', driveable: true, when: { param: 'gratingType', equals: 'LINEAR' } },
    spiralRate:  { label: 'SPIRAL RATE', min: 0.1, max: 10, step: 0.1, value: 1,  tier: 5, driveable: true, unit: 'n', when: { param: 'gratingType', equals: 'SPIRAL' } },
    internalBlend: { label: 'BLEND',      type: 'select', options: ['MULTIPLY', 'SCREEN', 'REPLACE'], value: 'MULTIPLY', tier: 4 }
  },
  apply(src, dst, w, h, p) {
    dst.set(gratingRGBA(src, w, h, p.gratingType.toLowerCase(), p.wavelength, p.phase, p.angle, p.spiralRate, p.internalBlend.toLowerCase()));
  }
});
