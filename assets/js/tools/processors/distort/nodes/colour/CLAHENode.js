import { createEffectModule } from '../../core/EffectModule.js';
import { clahe } from '../../../../../shared/algorithms/image/colour-adjustments.js';

export const CLAHENode = createEffectModule({
  type: 'clahe', name: 'CLAHE', category: 'COLOUR / TONE',
  params: {
    tileSize:  { value: 32, min: 8, max: 64, step: 8,   label: 'TILE SIZE',  tier: 3, previewMax: 32, driveable: true, unit: 'px' },
    clipLimit: { value: 3,  min: 1, max: 10, step: 0.5, label: 'CLIP LIMIT', tier: 3, driveable: true, unit: 'n' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_tileSize = modulate('tileSize', 0);
    const _m_clipLimit = modulate('clipLimit', 0);
    dst.set(clahe(src, w, h, _m_tileSize, _m_clipLimit));
  },
});
