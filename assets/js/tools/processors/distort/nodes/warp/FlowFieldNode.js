import { createEffectModule } from '../../core/EffectModule.js';
import { PerlinNoise } from '../../core/PerlinNoise.js';
import { flowFieldWarp } from '../../../../../shared/algorithms/geometry/warp.js';

export const FlowFieldNode = createEffectModule({
  type: 'flowfield', name: 'FLOW FIELD', category: 'WARP',
  params: {
    noiseScale:  { value: 3,   min: 0.1, max: 20,  step: 0.1,  label: 'NOISE SCALE', tier: 3, driveable: true },
    strength:    { value: 40,  min: 0,   max: 200,  step: 1,    label: 'STRENGTH',    tier: 3, previewMax: 60, driveable: true },
    curl:        { value: 0,   min: -1,  max: 1,    step: 0.01, label: 'CURL',        tier: 3, driveable: true },
    octaves:     { value: 3,   min: 1,   max: 8,    step: 1,    label: 'OCTAVES',     tier: 4 },
    lacunarity:  { value: 2,   min: 1,   max: 4,    step: 0.1,  label: 'LACUNARITY',  tier: 4 },
    gain:        { value: 0.5, min: 0.1, max: 0.9,  step: 0.05, label: 'GAIN',        tier: 4 },
    advectSteps: { value: 1,   min: 1,   max: 10,   step: 1,    label: 'ADVECT',      tier: 4, previewMax: 3 }
  },
  apply(src, dst, w, h, p, ctx) {
    const noise = new PerlinNoise(ctx?.nodeSeed ?? 42);
    const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
    const str = p.strength * (ctx?.quality === 'preview' && ctx?.previewScale ? ctx.previewScale : 1);
    dst.set(flowFieldWarp(src, w, h, p.noiseScale, p.octaves, p.lacunarity, p.gain, str, p.curl, p.advectSteps, noise, interp));
  }
});
