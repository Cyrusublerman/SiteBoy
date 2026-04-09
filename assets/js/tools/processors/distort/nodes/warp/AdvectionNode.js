import { createEffectModule } from '../../core/EffectModule.js';
import { capByFrame } from '../../core/frameCap.js';
import { PerlinNoise } from '../../core/PerlinNoise.js';
import { advectionWarp } from '../../../../../shared/algorithms/geometry/warp.js';

export const AdvectionNode = createEffectModule({
  type: 'advection', name: 'ADVECTION', category: 'WARP',
  params: {
    frame:        { value: 0, min: 0, max: 240, step: 1, label: 'FRAME', tier: 3, driveable: true, unit: 'frames' },
    velocityType: { value: 'noise', type: 'select', options: ['noise', 'radial', 'vortex'], label: 'VELOCITY', tier: 3 },
    steps:        { value: 5,  min: 1,   max: 30, step: 1,   label: 'STEPS',      tier: 3, previewMax: 3, driveable: true, unit: 'steps' },
    speed:        { value: 2,  min: 0.1, max: 20, step: 0.1, label: 'SPEED',      tier: 3, driveable: true, unit: 'px/step' },
    noiseScale:   { value: 3,  min: 0.1, max: 20, step: 0.1, label: 'NOISE SC',   tier: 4, driveable: true, unit: '×', when: { param: 'velocityType', equals: 'noise' } }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const seed = ctx?.nodeSeed ?? 42;
    if (!this._noise || this._noiseSeed !== seed) {
      this._noise = new PerlinNoise(seed);
      this._noiseSeed = seed;
    }
    const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
    let st = p.steps;
    st = capByFrame(st, p.frame);
    dst.set(advectionWarp(src, w, h, p.velocityType, st, p.speed, p.noiseScale, this._noise, interp));
  }
});
