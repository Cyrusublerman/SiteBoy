import { createEffectModule } from '../../core/EffectModule.js';
import { iterativeRewarpRGBA } from '../../../../../shared/algorithms/physics/accumulation.js';
import { SeededRNG, hashSeed } from '../../core/SeededRNG.js';

export const IterativeRewarpNode = createEffectModule({
  type: 'iterrewarp',
  name: 'ITER REWARP',
  category: 'ACCUMULATION',
  params: {
    samples:     { label: 'SAMPLES',   min: 2,   max: 20,   step: 1,   value: 5,   tier: 3, previewMax: 8 },
    jitterX:     { label: 'JITTER X',  min: 0,   max: 100,  step: 1,   value: 10,  tier: 3, unit: 'px', driveable: true },
    jitterY:     { label: 'JITTER Y',  min: 0,   max: 100,  step: 1,   value: 10,  tier: 3, unit: 'px', driveable: true },
    opacityMode: { label: 'BLEND',     type: 'select', options: ['EQUAL', 'DECAY'], value: 'DECAY', tier: 4 },
    decay:       { label: 'DECAY',     min: 0.1, max: 0.99, step: 0.01, value: 0.7, tier: 4, driveable: true },
    rotJitter:   { label: 'ROT JITTER', min: 0,  max: 10,   step: 0.1, value: 0,   tier: 5, unit: 'deg', driveable: true },
    scaleJitter: { label: 'SC JITTER', min: 0,   max: 0.5,  step: 0.01, value: 0,  tier: 5, driveable: true }
  },
  apply(src, dst, w, h, p, ctx) {
    const n = ctx?.quality === 'preview' ? Math.min(p.samples, 8) : p.samples;
    const seed = ctx?.nodeSeed ?? 42;
    const rng = new SeededRNG(typeof hashSeed === 'function' ? hashSeed(seed, 0, 999) : seed);
    dst.set(iterativeRewarpRGBA(src, w, h, n, p.jitterX, p.jitterY, p.opacityMode.toLowerCase(), p.decay, p.rotJitter, p.scaleJitter, rng));
  }
});
