import { createEffectModule } from '../../core/EffectModule.js';
import { scanlines } from '../../../../../shared/algorithms/image/texture-overlays.js';

export const ScanlinesNode = createEffectModule({
  type: 'scanlines',
  name: 'SCANLINES',
  category: 'TEXTURE',
  params: {
    spacing:   { label: 'SPACING',   min: 1, max: 10, step: 1,    value: 2,   tier: 3, unit: 'px' },
    thickness: { label: 'THICKNESS', min: 0, max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true },
    scOpacity: { label: 'OPACITY',   min: 0, max: 1,  step: 0.01, value: 0.3, tier: 3, driveable: true }
  },
  apply(src, dst, w, h, p) {
    dst.set(scanlines(src, w, h, p.spacing, p.thickness, p.scOpacity));
  }
});
