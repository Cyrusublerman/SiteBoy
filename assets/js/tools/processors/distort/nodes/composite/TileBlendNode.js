import { createEffectModule } from '../../core/EffectModule.js';
import { tileBlend } from '../../../../../shared/algorithms/image/compositing.js';

/** combineMode: tile-pair compositing mode (not the stack blendMode). */
export const TileBlendNode = createEffectModule({
  type: 'tileblend',
  name: 'TILE BLEND',
  category: 'COMPOSITE',
  params: {
    frame:       { label: 'FRAME',    min: 0, max: 240, step: 1,   value: 0,   tier: 3, driveable: true, unit: 'frames' },
    combineMode: { label: 'COMBINE',  type: 'select', options: ['CROSSFADE', 'MULTIPLY', 'DIFFERENCE'], value: 'MULTIPLY', tier: 3 },
    mix:         { label: 'MIX',      min: 0, max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true, unit: '0–1', when: { combineMode: 'CROSSFADE' } },
    offsetX:     { label: 'OFFSET X', min: 0, max: 1,  step: 0.01, value: 0.5, tier: 3, driveable: true, unit: '0–1' },
    offsetY:     { label: 'OFFSET Y', min: 0, max: 1,  step: 0.01, value: 0.5, tier: 4, driveable: true, unit: '0–1' },
    mirrorX:     { label: 'MIRROR X', type: 'toggle', value: false, tier: 4 },
    mirrorY:     { label: 'MIRROR Y', type: 'toggle', value: false, tier: 4 },
    exposure:    { label: 'EXPOSURE', min: -2, max: 2, step: 0.1,  value: 0,   tier: 5, unit: 'EV', driveable: true },
    gamma:       { label: 'GAMMA',    min: 0.2, max: 3, step: 0.05, value: 1,  tier: 5, driveable: true, unit: 'γ' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const frame    = modulate ? modulate('frame',    0) : p.frame;
    const mix      = modulate ? modulate('mix',      0) : p.mix;
    const offsetX  = modulate ? modulate('offsetX',  0) : p.offsetX;
    const offsetY  = modulate ? modulate('offsetY',  0) : p.offsetY;
    const exposure = modulate ? modulate('exposure', 0) : p.exposure;
    const gamma    = modulate ? modulate('gamma',    0) : p.gamma;
    const ph = frame * 0.002;
    dst.set(tileBlend(src, w, h, {
      blendMode: p.combineMode.toLowerCase(),
      mix,
      offsetX: offsetX + ph,
      offsetY: offsetY + ph,
      mirrorX: p.mirrorX,
      mirrorY: p.mirrorY,
      exposure,
      gamma
    }));
  }
});
