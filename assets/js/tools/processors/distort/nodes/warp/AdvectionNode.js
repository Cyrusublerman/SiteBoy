import { createEffectModule } from '../../core/EffectModule.js';
import { PerlinNoise } from '../../core/PerlinNoise.js';
import { advectionWarp } from '../../../../../shared/algorithms/geometry/warp.js';

export const AdvectionNode = createEffectModule({
  type: 'advection', name: 'ADVECTION', category: 'WARP',
  params: {
    velocityType: { value: 'noise', type: 'select', options: ['noise', 'radial', 'vortex'], label: 'VELOCITY', tier: 3 },
    steps:        { value: 5,  min: 1,   max: 30, step: 1,   label: 'STEPS',      tier: 3, previewMax: 3 },
    speed:        { value: 2,  min: 0.1, max: 20, step: 0.1, label: 'SPEED',      tier: 3, driveable: true },
    noiseScale:   { value: 3,  min: 0.1, max: 20, step: 0.1, label: 'NOISE SC',   tier: 4 }
  },
  apply(src, dst, w, h, p, ctx) {
    const noise = new PerlinNoise(ctx?.nodeSeed ?? 42);
    const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
    dst.set(advectionWarp(src, w, h, p.velocityType, p.steps, p.speed, p.noiseScale, noise, interp));
  }
});
