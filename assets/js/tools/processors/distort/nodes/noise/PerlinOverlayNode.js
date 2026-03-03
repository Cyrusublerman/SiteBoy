import { createEffectModule } from '../../core/EffectModule.js';
import { perlinOverlayRGBA } from '../../../../../shared/algorithms/noise/noise-functions.js';
import { PerlinNoise } from '../../core/PerlinNoise.js';

export const PerlinOverlayNode = createEffectModule({
  type: 'perlinoverlay',
  name: 'NOISE OVERLAY',
  category: 'NOISE',
  params: {
    scale:     { label: 'SCALE',    min: 0.1, max: 20, step: 0.1, value: 3,   tier: 3, previewMax: 10, driveable: true },
    octaves:   { label: 'OCTAVES', min: 1,   max: 8,  step: 1,   value: 4,   tier: 3, previewMax: 4 },
    strength:  { label: 'STRENGTH', min: 0,  max: 1,  step: 0.01, value: 0.3, tier: 3, driveable: true },
    blendMode: { label: 'BLEND',    type: 'select', options: ['ADD', 'MULTIPLY', 'SCREEN', 'OVERLAY'], value: 'ADD', tier: 4 }
  },
  apply(src, dst, w, h, p, ctx) {
    const noise = new PerlinNoise(ctx?.nodeSeed ?? 42);
    dst.set(perlinOverlayRGBA(src, w, h, p.scale, p.octaves, p.strength, p.blendMode.toLowerCase(), noise));
  }
});
