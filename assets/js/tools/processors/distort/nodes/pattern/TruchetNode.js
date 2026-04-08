import { createEffectModule } from '../../core/EffectModule.js';
import { truchetRGBA } from '../../../../../shared/algorithms/patterns/pattern-generators.js';

/** internalBlend: tile overlay compositing (not the stack blendMode). */
export const TruchetNode = createEffectModule({
  type: 'truchet',
  name: 'TRUCHET',
  category: 'PATTERN',
  params: {
    tileSize:    { label: 'TILE SIZE',    min: 5, max: 100, step: 1,   value: 20,         tier: 3, previewMax: 40, unit: 'px', driveable: true },
    strokeWidth: { label: 'STROKE W',     min: 0.5, max: 15, step: 0.5, value: 3,          tier: 3, previewMax: 8,  unit: 'px', driveable: true },
    internalBlend: { label: 'BLEND',        type: 'select', options: ['MULTIPLY', 'SCREEN', 'OVERLAY'], value: 'MULTIPLY', tier: 4 }
  },
  apply(src, dst, w, h, p, ctx) {
    const seed = ctx?.nodeSeed ?? 0;
    dst.set(truchetRGBA(src, w, h, p.tileSize, p.strokeWidth, p.internalBlend.toLowerCase(), seed));
  }
});
