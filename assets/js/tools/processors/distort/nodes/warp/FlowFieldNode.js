import { createEffectModule } from '../../core/EffectModule.js';
import { capByFrame } from '../../core/frameCap.js';
import { PerlinNoise } from '../../core/PerlinNoise.js';
import { flowFieldWarp } from '../../../../../shared/algorithms/geometry/warp.js';
import { wgsl, glsl, gpuBindings as _gpuBindings } from '../../shaders/flowfield.shader.js';

export const FlowFieldNode = createEffectModule({
  type: 'flowfield', name: 'FLOW FIELD', category: 'WARP',
  params: {
    frame:       { value: 0,   min: 0,   max: 240, step: 1,    label: 'FRAME',       tier: 3, driveable: true, unit: 'frames' },
    noiseScale:  { value: 3,   min: 0.1, max: 20,  step: 0.1,  label: 'NOISE SCALE', tier: 3, driveable: true, unit: 'n' },
    strength:    { value: 40,  min: 0,   max: 200,  step: 1,    label: 'STRENGTH',    tier: 3, previewMax: 60, driveable: true, unit: 'px' },
    curl:        { value: 0,   min: -1,  max: 1,    step: 0.01, label: 'CURL',        tier: 3, driveable: true, unit: 'n' },
    octaves:     { value: 3,   min: 1,   max: 8,    step: 1,    label: 'OCTAVES',     tier: 4, previewMax: 4, driveable: true, unit: 'n' },
    lacunarity:  { value: 2,   min: 1,   max: 4,    step: 0.1,  label: 'LACUNARITY',  tier: 4, driveable: true, unit: 'n' },
    gain:        { value: 0.5, min: 0.1, max: 0.9,  step: 0.05, label: 'GAIN',        tier: 4, driveable: true, unit: '0–1' },
    advectSteps: { value: 1,   min: 1,   max: 10,   step: 1,    label: 'ADVECT',      tier: 4, previewMax: 3, driveable: true, unit: 'n' }
  },
  _noise: null,
  _noiseSeed: null,
  apply(src, dst, w, h, p, ctx, modulate) {
    const _m_frame = Math.round(modulate('frame', 0));
    const _m_noiseScale = modulate('noiseScale', 0);
    const _m_strength = Math.round(modulate('strength', 0));
    const _m_curl = modulate('curl', 0);
    const _m_octaves = Math.round(modulate('octaves', 0));
    const _m_lacunarity = modulate('lacunarity', 0);
    const _m_gain = modulate('gain', 0);
    const _m_advectSteps = Math.round(modulate('advectSteps', 0));
    const seed = ctx?.nodeSeed ?? 42;
    if (!this._noise || this._noiseSeed !== seed) {
      this._noise = new PerlinNoise(seed);
      this._noiseSeed = seed;
    }
    const interp = ctx?.quality === 'preview' ? 'nearest' : 'bilinear';
    const str = _m_strength * (ctx?.quality === 'preview' && ctx?.previewScale ? ctx.previewScale : 1);
    let adv = _m_advectSteps;
    adv = capByFrame(adv, _m_frame);
    dst.set(flowFieldWarp(src, w, h, _m_noiseScale, _m_octaves, _m_lacunarity, _m_gain, str, _m_curl, adv, this._noise, interp));
  },
  wgsl,
  glsl,
  gpuBindings: _gpuBindings,
});
