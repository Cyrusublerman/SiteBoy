import { createEffectModule } from '../../core/EffectModule.js';
import { voronoiRGBA } from '../../../../../shared/algorithms/image/compositing.js';
import { SeededRNG } from '../../core/SeededRNG.js';

export const VoronoiNode = createEffectModule({
  type: 'voronoi',
  name: 'VORONOI',
  category: 'GEOMETRIC',
  params: {
    pointCount: { label: 'POINTS',  min: 4, max: 512, step: 1,    value: 64,  tier: 3, previewMax: 64 },
    colorMode:  { label: 'MODE',    type: 'select', options: ['DISTANCE', 'CELL', 'EDGE'], value: 'CELL', tier: 3 },
    blendAmt:   { label: 'BLEND',   min: 0, max: 1,   step: 0.01, value: 0.5, tier: 3, driveable: true }
  },
  apply(src, dst, w, h, p, ctx) {
    const rng = new SeededRNG(ctx?.nodeSeed ?? 42);
    dst.set(voronoiRGBA(src, w, h, p.pointCount, p.colorMode.toLowerCase(), p.blendAmt, rng));
  }
});
