import { createEffectModule } from '../../core/EffectModule.js';
import { capByFrame } from '../../core/frameCap.js';
import { waveDistortionRGBA } from '../../../../../shared/algorithms/physics/wave-solver.js';

export const WaveDistortionNode = createEffectModule({
  type: 'wavedistortion',
  name: 'WAVE DISTORT',
  category: 'PHYSICS',
  forceWorkerPreview: true,
  params: {
    frame:    { label: 'FRAME',    min: 0, max: 240, step: 1,    value: 0,     tier: 3, unit: 'frames', driveable: true },
    speed:    { label: 'SPEED',    min: 0.01, max: 2,   step: 0.01, value: 0.5,   tier: 3, driveable: true, unit: 'n' },
    damping:  { label: 'DAMPING', min: 0.9,  max: 1,   step: 0.001, value: 0.995, tier: 4, driveable: true, unit: '0–1' },
    steps:    { label: 'STEPS',   min: 10,   max: 500,  step: 10,   value: 100,   tier: 4, previewMax: 30, driveable: true, unit: 'n' },
    strength: { label: 'STRENGTH', min: 0,   max: 50,  step: 1,    value: 10,    tier: 3, unit: 'px', driveable: true },
    initType: { label: 'INIT',    type: 'select', options: ['GAUSSIAN', 'RIPPLE'], value: 'GAUSSIAN', tier: 4 },
    radius:   { label: 'RADIUS',  min: 0.01, max: 0.5, step: 0.01, value: 0.1,   tier: 4, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p, ctx) {
    let steps = ctx?.quality === 'preview' ? Math.min(p.steps, 30) : p.steps;
    steps = capByFrame(steps, p.frame);
    dst.set(waveDistortionRGBA(src, w, h, p.speed, p.damping, steps, p.strength, p.initType.toLowerCase(), p.radius));
  }
});
