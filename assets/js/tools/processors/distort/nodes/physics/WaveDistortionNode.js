import { createEffectModule } from '../../core/EffectModule.js';
import { waveDistortionRGBA } from '../../../../../shared/algorithms/physics/wave-solver.js';

export const WaveDistortionNode = createEffectModule({
  type: 'wavedistortion',
  name: 'WAVE DISTORT',
  category: 'PHYSICS',
  params: {
    speed:    { label: 'SPEED',    min: 0.01, max: 2,   step: 0.01, value: 0.5,   tier: 3, driveable: true },
    damping:  { label: 'DAMPING', min: 0.9,  max: 1,   step: 0.001, value: 0.995, tier: 4 },
    steps:    { label: 'STEPS',   min: 10,   max: 500,  step: 10,   value: 100,   tier: 4, previewMax: 30 },
    strength: { label: 'STRENGTH', min: 0,   max: 50,  step: 1,    value: 10,    tier: 3, unit: 'px', driveable: true },
    initType: { label: 'INIT',    type: 'select', options: ['GAUSSIAN', 'RIPPLE'], value: 'GAUSSIAN', tier: 4 },
    radius:   { label: 'RADIUS',  min: 0.01, max: 0.5, step: 0.01, value: 0.1,   tier: 4, driveable: true }
  },
  apply(src, dst, w, h, p, ctx) {
    const steps = ctx?.quality === 'preview' ? Math.min(p.steps, 30) : p.steps;
    dst.set(waveDistortionRGBA(src, w, h, p.speed, p.damping, steps, p.strength, p.initType.toLowerCase(), p.radius));
  }
});
