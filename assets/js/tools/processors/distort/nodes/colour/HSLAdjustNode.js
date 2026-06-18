import { createEffectModule } from '../../core/EffectModule.js';
import { hslAdjust } from '../../../../../shared/algorithms/image/colour-adjustments.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/hsladjust.shader.js';

export const HSLAdjustNode = createEffectModule({
  type: 'hsladjust', name: 'HSL ADJUST', category: 'COLOUR / TONE',
  params: {
    hue:        { value: 0,   min: -180, max: 180, step: 1,    label: 'HUE',        tier: 3, driveable: true, unit: 'deg' },
    saturation: { value: 1,   min: 0,    max: 3,   step: 0.01, label: 'SATURATION', tier: 3, driveable: true, unit: 'n' },
    lightness:  { value: 0,   min: -1,   max: 1,   step: 0.01, label: 'LIGHTNESS',  tier: 4, driveable: true, unit: 'n' }
  },
  apply(src, dst, w, h, p, c
    const _m_hue = Math.round(modulate('hue', 0));
    const _m_saturation = modulate('saturation', 0);
    const _m_lightness = modulate('lightness', 0);
    dst.set(hslAdjust(src, w, h, _m_hue, _m_saturation, _m_lightness));
  lightness));
  },
  wgsl,
  glsl,
  gpuBindings: {
    ..._gpuBindings,
    uniformMap: p => ({ uHue: p.hue, uSaturation: p.saturation, uLightness: p.lightness }),
  },
});
