import { createEffectModule } from '../../core/EffectModule.js';
import { perlinOverlayRGBA } from '../../../../../shared/algorithms/noise/noise-functions.js';
import { PerlinNoise } from '../../core/PerlinNoise.js';

/** blendMode: noise layer compositing (not the stack blendMode). */
export const PerlinOverlayNode = createEffectModule({
  type: 'perlinoverlay',
  name: 'NOISE FIELD',
  category: 'NOISE',
  params: {
    scale:     { label: 'SCALE',    min: 0.1, max: 20, step: 0.1, value: 3,   tier: 3, previewMax: 10, driveable: true, unit: 'n' },
    octaves:   { label: 'OCTAVES', min: 1,   max: 8,  step: 1,   value: 4,   tier: 3, previewMax: 4,  driveable: true, unit: 'n' },
    strength:  { label: 'STRENGTH', min: 0,  max: 1,  step: 0.01, value: 0.3, tier: 3, driveable: true, unit: '0–1' },
    blendMode: { label: 'BLEND',    type: 'select', options: ['ADD', 'MULTIPLY', 'SCREEN', 'OVERLAY'], value: 'ADD', tier: 4 }
  },
  _noiseCache: null,
  _noiseSeed: null,
  apply(src, dst, w, h, p, ctx, modulate) {
    const seed = ctx?.nodeSeed ?? 42;
    if (!this._noiseCache || this._noiseSeed !== seed) {
      this._noiseCache = new PerlinNoise(seed);
      this._noiseSeed  = seed;
    }
    const scale    = modulate ? modulate('scale',    0) : p.scale;
    const octaves  = modulate ? modulate('octaves',  0) : p.octaves;
    const strength = modulate ? modulate('strength', 0) : p.strength;
    dst.set(perlinOverlayRGBA(src, w, h, scale, octaves, strength, p.blendMode.toLowerCase(), this._noiseCache));
  }
});
