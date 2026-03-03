import { createEffectModule } from '../../core/EffectModule.js';
import { reactionDiffusionRGBA } from '../../../../../shared/algorithms/physics/reaction-diffusion.js';

export const ReactionDiffusionNode = createEffectModule({
  type: 'reactiondiffusion',
  name: 'REACT-DIFFUSE',
  category: 'PHYSICS',
  params: {
    preset:   { label: 'PRESET',    type: 'select', options: ['MITOSIS', 'CORAL', 'SPOTS', 'MAZE', 'WORMS', 'SOLITONS', 'PULSATING', 'CHAOS'], value: 'CORAL', tier: 3 },
    steps:    { label: 'STEPS',     min: 10, max: 5000, step: 10, value: 500, tier: 3, previewMax: 100 },
    seedSize: { label: 'SEED SIZE', min: 5,  max: 100,  step: 1,  value: 20,  tier: 4, unit: 'px' }
  },
  apply(src, dst, w, h, p, ctx) {
    const steps = ctx?.quality === 'preview' ? Math.min(p.steps, 100) : p.steps;
    dst.set(reactionDiffusionRGBA(src, w, h, p.preset.toLowerCase(), steps, p.seedSize));
  }
});
