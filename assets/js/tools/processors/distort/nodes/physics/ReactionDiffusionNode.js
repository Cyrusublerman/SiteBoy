import { createEffectModule } from '../../core/EffectModule.js';
import { capByFrame } from '../../core/frameCap.js';
import { reactionDiffusionRGBA } from '../../../../../shared/algorithms/physics/reaction-diffusion.js';

export const ReactionDiffusionNode = createEffectModule({
  type: 'reactiondiffusion',
  name: 'REACT-DIFFUSE',
  category: 'PHYSICS',
  forceWorkerPreview: true,
  params: {
    frame:    { label: 'FRAME',     min: 0, max: 240, step: 1, value: 0, tier: 3, driveable: true, unit: 'frames' },
    preset:   { label: 'PRESET',    type: 'select', options: ['MITOSIS', 'CORAL', 'SPOTS', 'MAZE', 'WORMS', 'SOLITONS', 'PULSATING', 'CHAOS'], value: 'CORAL', tier: 3 },
    steps:    { label: 'STEPS',     min: 10, max: 5000, step: 10, value: 500, tier: 3, previewMax: 100, driveable: true, unit: 'n' },
    seedSize: { label: 'SEED SIZE', min: 5,  max: 100,  step: 1,  value: 20,  tier: 4, unit: 'px', driveable: true }
  },
  apply(src, dst, w, h, p, ctx) {
    let steps = ctx?.quality === 'preview' ? Math.min(p.steps, 100) : p.steps;
    steps = capByFrame(steps, p.frame);
    dst.set(reactionDiffusionRGBA(src, w, h, p.preset.toLowerCase(), steps, p.seedSize));
  }
});
