import { createEffectModule } from '../../core/EffectModule.js';
import { capByFrame } from '../../core/frameCap.js';
import { cellularAutomataRGBA } from '../../../../../shared/algorithms/physics/reaction-diffusion.js';

export const CellularAutomataNode = createEffectModule({
  type: 'cellularautomata',
  name: 'CELL AUTOMATA',
  category: 'PHYSICS',
  forceWorkerPreview: true,
  params: {
    frame:     { label: 'FRAME',      min: 0, max: 240, step: 1, value: 0, tier: 3, driveable: true, unit: 'frames' },
    rule:      { label: 'RULE',       type: 'select', options: ['LIFE', 'HIGHLIFE', 'SEEDS', 'DAYNIGHT', 'MAZE', 'ANNEAL'], value: 'LIFE', tier: 3 },
    steps:     { label: 'STEPS',      min: 1,   max: 500, step: 1,   value: 50,  tier: 3, previewMax: 20, driveable: true, unit: 'n' },
    threshold: { label: 'INIT THRESH', min: 0,  max: 255, step: 1,   value: 128, tier: 4, driveable: true, unit: 'lvl' },
    blendAmt:  { label: 'BLEND',      min: 0,   max: 1,   step: 0.01, value: 0.5, tier: 3, driveable: true, unit: '0–1' }
  },
  apply(src, dst, w, h, p, ctx) {
    let steps = ctx?.quality === 'preview' ? Math.min(p.steps, 20) : p.steps;
    steps = capByFrame(steps, p.frame);
    const ruleKey = p.rule === 'DAYNIGHT' ? 'dayNight' : p.rule === 'HIGHLIFE' ? 'highLife' : p.rule.toLowerCase();
    dst.set(cellularAutomataRGBA(src, w, h, ruleKey, steps, p.threshold, p.blendAmt));
  }
});
