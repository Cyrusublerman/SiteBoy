import { createEffectModule } from '../../core/EffectModule.js';
import { scanlines } from '../../../../../shared/algorithms/image/texture-overlays.js';

export const ScanlinesNode = createEffectModule({
  type: 'scanlines',
  name: 'SCANLINES',
  category: 'TEXTURE',
  params: {
    frame:     { label: 'FRAME',     min: 0, max: 240, step: 1,    value: 0,   tier: 3, driveable: true, unit: 'frames' },
    spacing:   { label: 'SPACING',   min: 1, max: 10, step: 1,    value: 2,   tier: 3, unit: 'px', driveable: true },
    thickness: { label: 'THICKNESS', min: 0, max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true, unit: '0–1' },
    scOpacity: { label: 'LINE OPACITY', min: 0, max: 1,  step: 0.01, value: 0.3, tier: 3, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    dst.set(scanlines(src, w, h, p.spacing, p.thickness, modulate('scOpacity', 0), p.frame));
  }
});
