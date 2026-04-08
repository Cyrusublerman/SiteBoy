import { createEffectModule } from '../../core/EffectModule.js';
import { delaunayMeshRGBA } from '../../../../../shared/algorithms/image/compositing.js';
import { SeededRNG } from '../../core/SeededRNG.js';

export const DelaunayMeshNode = createEffectModule({
  type: 'delaunaymesh',
  name: 'DELAUNAY MESH',
  category: 'COMPOSITE',
  forceWorkerPreview: true,
  params: {
    pointCount: { label: 'POINTS',   min: 10, max: 2000, step: 10,   value: 200, tier: 3, previewMax: 100, driveable: true, unit: 'n' },
    wireWeight: { label: 'WIRE W',   min: 0,  max: 3,    step: 0.25, value: 0.5, tier: 3, unit: 'px', driveable: true },
    wireLevel:  { label: 'WIRE LVL', min: 0,  max: 255,  step: 1,    value: 40,  tier: 4, driveable: true, unit: 'lvl' },
    colorMode:  { label: 'MODE',     type: 'select', options: ['FLAT', 'WIRE'], value: 'FLAT', tier: 3 }
  },
  apply(src, dst, w, h, p, ctx) {
    const count = ctx?.quality === 'preview' ? Math.min(p.pointCount, 100) : p.pointCount;
    const rng = new SeededRNG(ctx?.nodeSeed ?? 42);
    dst.set(delaunayMeshRGBA(src, w, h, count, p.wireWeight, p.wireLevel, p.colorMode.toLowerCase(), rng));
  }
});
