import { createEffectModule } from '../../core/EffectModule.js';
import { PerlinNoise } from '../../core/PerlinNoise.js';
import { SeededRNG } from '../../core/SeededRNG.js';
import { bandShift } from '../../../../../shared/algorithms/geometry/warp.js';

export const BandShiftNode = createEffectModule({
  type: 'bandshift', name: 'BAND SHIFT', category: 'WARP',
  params: {
    axis:       { value: 'horizontal', type: 'select', options: ['horizontal', 'vertical'], label: 'AXIS',       tier: 3 },
    intensity:  { value: 30,  min: 0,   max: 200, step: 1,    label: 'INTENSITY',  tier: 3, driveable: true },
    bandSize:   { value: 20,  min: 2,   max: 200, step: 1,    label: 'BAND SIZE',  tier: 3, driveable: true },
    offsetType: { value: 'noise', type: 'select', options: ['noise', 'sine', 'stepped'], label: 'OFFSET TYPE', tier: 4 },
    phase:      { value: 0,   min: 0,   max: 6.28, step: 0.01, label: 'PHASE',     tier: 4, driveable: true },
    freq:       { value: 1,   min: 0.1, max: 10,  step: 0.1,  label: 'FREQ',       tier: 4 },
    noiseScale: { value: 2,   min: 0.1, max: 10,  step: 0.1,  label: 'NOISE SC',   tier: 5 }
  },
  apply(src, dst, w, h, p, ctx) {
    const seed = ctx?.nodeSeed ?? 42;
    const noise = new PerlinNoise(seed);
    const rng = new SeededRNG(seed);
    const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
    dst.set(bandShift(src, w, h, p.axis, p.bandSize, p.intensity, p.offsetType, p.phase, p.freq, p.noiseScale, noise, rng, interp));
  }
});
