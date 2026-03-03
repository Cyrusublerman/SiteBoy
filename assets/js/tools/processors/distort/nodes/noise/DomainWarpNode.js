import { createEffectModule } from '../../core/EffectModule.js';
import { domainWarpRGBA } from '../../../../../shared/algorithms/noise/noise-functions.js';
import { PerlinNoise } from '../../core/PerlinNoise.js';

export const DomainWarpNode = createEffectModule({
  type: 'domainwarp',
  name: 'DOMAIN WARP',
  category: 'NOISE',
  params: {
    strength: { label: 'STRENGTH', min: 0,   max: 200, step: 1,   value: 30,  tier: 3, previewMax: 50, unit: 'px', driveable: true },
    scale:    { label: 'SCALE',    min: 0.1, max: 20,  step: 0.1, value: 3,   tier: 3, previewMax: 8, driveable: true },
    octaves:  { label: 'OCTAVES', min: 1,   max: 8,   step: 1,   value: 4,   tier: 4, previewMax: 4 },
    layers:   { label: 'LAYERS',  min: 1,   max: 3,   step: 1,   value: 1,   tier: 5 }
  },
  apply(src, dst, w, h, p, ctx) {
    const noise = new PerlinNoise(ctx?.nodeSeed ?? 42);
    dst.set(domainWarpRGBA(src, w, h, p.strength, p.scale, p.octaves, p.layers, noise));
  }
});
