import { createEffectModule } from '../../core/EffectModule.js';
import { stipple } from '../../../../../shared/algorithms/image/compositing.js';

export const StippleNode = createEffectModule({
  type: 'stipple',
  name: 'STIPPLE',
  category: 'COMPOSITE',
  params: {
    minDist:   { label: 'MIN DIST',  min: 2, max: 20, step: 1,   value: 4,    tier: 3, previewMax: 8, unit: 'px', driveable: true },
    dotRadius: { label: 'DOT RAD',   min: 0.5, max: 5, step: 0.5, value: 1.5, tier: 3, unit: 'px', driveable: true },
    bgLevel:   { label: 'BG LEVEL',  min: 0, max: 255, step: 1,  value: 255,  tier: 4 },
    dotLevel:  { label: 'DOT LEVEL', min: 0, max: 255, step: 1,  value: 0,    tier: 4, driveable: true }
  },
  apply(src, dst, w, h, p, ctx) {
    const maxPoints = ctx?.quality === 'preview' ? 3000 : 15000;
    dst.set(stipple(src, w, h, { minDist: p.minDist, dotRadius: p.dotRadius, bgLevel: p.bgLevel, dotLevel: p.dotLevel, maxPoints, seed: ctx?.nodeSeed ?? 42 }));
  }
});
