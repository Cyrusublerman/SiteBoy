import { createEffectModule } from '../../core/EffectModule.js';
import { applyGradientMap } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/gradientmap.shader.js';

export const GradientMapNode = createEffectModule({
  type: 'gradientmap', name: 'GRADIENT MAP', category: 'COLOUR / TONE',
  params: {
    darkR:  { value: 0,   min: 0, max: 255, step: 1, label: 'DARK R',  tier: 3, driveable: true, unit: 'lvl' },
    darkG:  { value: 0,   min: 0, max: 255, step: 1, label: 'DARK G',  tier: 3, driveable: true, unit: 'lvl' },
    darkB:  { value: 30,  min: 0, max: 255, step: 1, label: 'DARK B',  tier: 3, driveable: true, unit: 'lvl' },
    lightR: { value: 255, min: 0, max: 255, step: 1, label: 'LIGHT R', tier: 4, driveable: true, unit: 'lvl' },
    lightG: { value: 200, min: 0, max: 255, step: 1, label: 'LIGHT G', tier: 4, driveable: true, unit: 'lvl' },
    lightB: { value: 150, min: 0, max: 255, step: 1, label: 'LIGHT B', tier: 4, driveable: true, unit: 'lvl' }
  },
  apply(src, dst, w, h, p, ctx, modulate) {
    const darkR  = modulate ? this.getModulated('darkR',  0, ctx) : p.darkR;
    const darkG  = modulate ? this.getModulated('darkG',  0, ctx) : p.darkG;
    const darkB  = modulate ? this.getModulated('darkB',  0, ctx) : p.darkB;
    const lightR = modulate ? this.getModulated('lightR', 0, ctx) : p.lightR;
    const lightG = modulate ? this.getModulated('lightG', 0, ctx) : p.lightG;
    const lightB = modulate ? this.getModulated('lightB', 0, ctx) : p.lightB;
    const gradient = [[darkR, darkG, darkB], [lightR, lightG, lightB]];
    dst.set(applyGradientMap(src, w, h, gradient));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
