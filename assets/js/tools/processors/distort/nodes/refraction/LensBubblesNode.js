import { createEffectModule } from '../../core/EffectModule.js';
import { SeededRNG } from '../../core/SeededRNG.js';
import { lensBubbles } from '../../../../../shared/algorithms/geometry/warp.js';

export const LensBubblesNode = createEffectModule({
  type: 'lensbubbles', name: 'LENS BUBBLES', category: 'REFRACTION',
  params: {
    count:         { value: 5,    min: 1,    max: 30,  step: 1,    label: 'COUNT',      tier: 3 },
    magnification: { value: 1.5,  min: 0.2,  max: 5,   step: 0.1,  label: 'MAGNIFY',    tier: 3, driveable: true },
    minRadius:     { value: 0.03, min: 0.01, max: 0.3, step: 0.01, label: 'MIN RAD',    tier: 4 },
    maxRadius:     { value: 0.12, min: 0.02, max: 0.5, step: 0.01, label: 'MAX RAD',    tier: 4 },
    edgeSoft:      { value: 0.2,  min: 0,    max: 1,   step: 0.01, label: 'EDGE SOFT',  tier: 4 }
  },
  apply(src, dst, w, h, p, ctx) {
    const rng = new SeededRNG(ctx?.nodeSeed ?? 42);
    const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
    dst.set(lensBubbles(src, w, h, p.count, p.minRadius, p.maxRadius, p.magnification, p.edgeSoft, rng, interp));
  }
});
